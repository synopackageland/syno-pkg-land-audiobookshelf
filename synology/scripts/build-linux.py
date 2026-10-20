#!/usr/bin/env python3
"""Build and inspect inside an operator-selected image; source overrides are opt-in."""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
prefix = os.environ.get('SPL_RESOURCE_PREFIX', 'audiobookshelf-build')
if not re.fullmatch(r'[a-z0-9-]+', prefix):
    raise SystemExit('Invalid resource prefix')
if os.environ.get('SYNOPKGLAND_TEMPLATES_DIR'):
    raise SystemExit('Template source overrides are unsupported')
overrides = {}
mounts = []
for key, destination in [('SYNOPKGLAND_SDK_DIR', '/sdk'), ('SPL_CLI_DIR', '/cli')]:
    if os.environ.get(key):
        source = Path(os.environ[key]).resolve(strict=True)
        revision = subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip()
        overrides[key] = revision
        mounts += ['-v', str(source) + ':' + destination, '-e', key + '=' + destination]
builder = os.environ['SPL_BUILDER_IMAGE']
evidence = ROOT / 'evidence'
evidence.mkdir(exist_ok=True)
command = '''npm ci --ignore-scripts --registry="${SPL_NPM_REGISTRY:-https://registry.npmjs.org}"
cli=/work/node_modules/.bin/synopkgland
if [ -n "${SPL_CLI_DIR:-}" ]; then
  (cd "$SPL_CLI_DIR" && npm ci --ignore-scripts --registry="${SPL_NPM_REGISTRY:-https://registry.npmjs.org}" && npm run build)
  cli="$SPL_CLI_DIR/dist/bin.js"
fi
npm test
python3 scripts/render-compose.py --check
node "$cli" check --json > evidence/check.json
node "$cli" build --arch x86_64 --json > evidence/build.json
node "$cli" inspect "dist/SynoPkgAudiobookshelf-$(node -e 'const fs=require("fs"); const s=fs.readFileSync("dsm-package.yaml","utf8"); process.stdout.write(/^version: (.+)$/m.exec(s)[1]+"-"+String(/^build: (\\d+)$/m.exec(s)[1]).padStart(4,"0"))')-x86_64.spk" --json > evidence/inspect.json
'''
args = ['docker', 'run', '--rm', '--user', os.environ.get('SPL_BUILD_USER', '0:0'), '--network', 'host', '--name', prefix + '-cli',
        '-v', str(ROOT) + ':/work', '-w', '/work',
        '-v', '/etc/ssl/certs/ca-certificates.crt:/tmp/host-ca.crt:ro',
        '-e', 'NODE_EXTRA_CA_CERTS=/tmp/host-ca.crt', '-e', 'SSL_CERT_FILE=/tmp/host-ca.crt',
        '-v', 'synopkgland-cache-npm:/cache/npm', '-e', 'npm_config_cache=/cache/npm',
        '-v', 'synopkgland-cache-gomod:/cache/gomod', '-e', 'GOMODCACHE=/cache/gomod',
        '-v', 'synopkgland-cache-gobuild:/var/cache/go-build']
for key in ['SPL_NPM_REGISTRY', 'SYNOPKGLAND_COMPOSE_REGISTRY_MIRRORS']:
    if os.environ.get(key):
        args += ['-e', key + '=' + os.environ[key]]
subprocess.run([*args, *mounts, builder, 'sh', '-ec', command], check=True)
checks = {name: json.loads((evidence / (name + '.json')).read_text())['ok'] for name in ['check', 'build', 'inspect']}
assert all(checks.values()), checks
proof = {'toolchain': json.loads((ROOT / 'toolchain.json').read_text()), 'checks': checks,
         'official_image': json.loads((ROOT / 'image-lock.json').read_text())['reference'],
         'artifacts': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((ROOT / 'dist').glob('*.spk'))},
         'source_overrides': overrides, 'publishable': not bool(overrides),
         'shared_folder_activation_supported': True, 'device_acceptance_complete': False}
(ROOT / 'build-proof.json').write_text(json.dumps(proof, indent=2) + '\n')
print(json.dumps(proof))
