#!/usr/bin/env python3
"""Real official-image probe. Run on a disposable Linux Docker test host only."""
import json
import http.client
import os
from pathlib import Path
import re
import secrets
import socket
import subprocess
import tempfile
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
prefix = os.environ.get('SPL_RESOURCE_PREFIX', 'audiobookshelf-proof')
if not re.fullmatch(r'[a-z0-9-]+', prefix):
    raise SystemExit('Invalid resource prefix')
binary = Path(os.environ['ABS_STORAGE_INIT']).resolve()
image = os.environ.get('ABS_TEST_IMAGE') or json.loads((ROOT / 'image-lock.json').read_text())['reference']
uid = 41237
for port in [13378, 13379]:
    with socket.socket() as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.bind(('127.0.0.1', port))
def docker(*args, check=True, **kw):
    return subprocess.run(['docker', *args], check=check, capture_output=True, text=True, **kw)
def status():
    with urllib.request.urlopen('http://127.0.0.1:13378/status', timeout=2) as response:
        return json.load(response)
def ready(name):
    for _ in range(180):
        try:
            return status()
        except (OSError, ValueError):
            state = json.loads(docker('inspect', name).stdout)[0]['State']
            if not state['Running']:
                raise AssertionError('Container exited before readiness')
            time.sleep(0.25)
    raise AssertionError('Serving port did not become ready')
volumes = [prefix + '-raw-data', prefix + '-adapter-data']
containers = [prefix + '-raw', prefix + '-adapter']
proof = {}
try:
    common = ['--user', f'{uid}:{uid}', '--read-only', '--cap-drop', 'ALL',
              '--security-opt', 'no-new-privileges:true', '--network', 'host',
              '--tmpfs', '/tmp:mode=1777', '-e', 'HOST=127.0.0.1', '-e', 'PORT=13378',
              '-e', 'ROUTER_BASE_PATH=/', '-e', 'CONFIG_PATH=/var/tmp/config',
              '-e', 'METADATA_PATH=/var/tmp/metadata']
    # Negative control: upstream's untouched native entrypoint needs first setup.
    docker('run', '-d', '--name', containers[0], *common, '-v', volumes[0] + ':/var/tmp', image)
    raw = ready(containers[0])
    assert raw['isInit'] is False and raw['authMethods'] == ['local'], 'Negative control unexpectedly configured'
    proof['negative_control'] = {'initialized': raw['isInit'], 'auth_methods': raw['authMethods']}
    docker('rm', '-f', containers[0])
    with tempfile.TemporaryDirectory(prefix=prefix + '-') as directory:
        secret_dir = Path(directory)
        secret_dir.chmod(0o755)  # Test operator setup, never an App ownership repair.
        mounts = []
        for name in ['runtime-bootstrap.secret', 'oidc-audiobookshelf.secret']:
            file = secret_dir / name
            file.write_text(secrets.token_hex(32)); file.chmod(0o600); os.chown(file, uid, uid)
            mounts += ['-v', str(file) + ':/synopkgland/secrets/' + name + ':ro']
        initialization = {'directories': [
            {'base': '/var/tmp', 'path': 'audiobookshelf'},
            {'base': '/var/tmp', 'path': 'audiobookshelf/config'},
            {'base': '/var/tmp', 'path': 'audiobookshelf/metadata'},
        ], 'runtime': {'environment': {'ABS_OIDC_SECRET': {'oidc_client': 'audiobookshelf'},
                                    'ABS_BOOTSTRAP_PASSWORD': {'secret': 'bootstrap'}}}}
        compose = json.loads((ROOT / 'compose.yaml').read_text())['services']['web']
        args = ['run', '-d', '--name', containers[1], *common,
                '-v', volumes[1] + ':/var/tmp', *mounts,
                '-v', str(binary) + ':/synopkgland/storage-init:ro',
                '-e', 'CONFIG_PATH=/var/tmp/audiobookshelf/config',
                '-e', 'METADATA_PATH=/var/tmp/audiobookshelf/metadata',
                '-e', 'ROUTER_BASE_PATH=' + compose['environment']['ROUTER_BASE_PATH'],
                '-e', 'SYNOPKGLAND_STARTUP_BUDGET_SECONDS=60',
                '--entrypoint', '/synopkgland/storage-init', image,
                '--initialization', json.dumps(initialization), '--', '/bin/sh', '-eu', '-c',
                compose['command'][0].replace('$$', '$')]
        docker(*args)
        for phase in ['fresh', 'restart']:
            if phase == 'restart':
                docker('restart', containers[1])
            result = ready(containers[1])
            assert result['isInit'] is True and result['authMethods'] == ['openid'], result
            assert result['authFormData']['authOpenIDAutoLaunch'] is True, result
            connection = http.client.HTTPConnection('127.0.0.1', 13378, timeout=3)
            app_base = compose['environment']['ROUTER_BASE_PATH']
            connection.request('GET', '/auth/openid?callback=' + app_base + '/login')
            authorization = connection.getresponse()
            assert authorization.status == 302, 'Native OIDC callback configuration was rejected'
            assert authorization.getheader('Location').startswith('http://127.0.0.1:13380/authorize?')
            authorization.read(); connection.close()
            connection = http.client.HTTPConnection('127.0.0.1', 13378, timeout=3)
            connection.request('GET', app_base + '/')
            html = connection.getresponse().read().decode()
            script = re.search(r'<script[^>]+src="([^"]+/_nuxt/[^"]+)"', html)
            assert script, 'Native frontend script was not found'
            connection.request('GET', script.group(1))
            javascript = connection.getresponse()
            assert javascript.status == 200 and 'javascript' in javascript.getheader('Content-Type', ''), 'Native frontend asset is unavailable'
            javascript.read(); connection.close()
            inspect = json.loads(docker('inspect', containers[1]).stdout)[0]
            assert inspect['Config']['User'] == f'{uid}:{uid}'
            assert inspect['HostConfig']['ReadonlyRootfs'] is True
            assert inspect['HostConfig']['CapDrop'] == ['ALL']
            proof[phase] = {'initialized': True, 'auth_methods': result['authMethods'],
                            'auto_launch': True, 'nonroot': True, 'read_only_rootfs': True}
        # A symlinked retained bootstrap credential must fail closed, including restart.
        docker('exec', containers[1], '/bin/sh', '-c',
               'rm /var/tmp/audiobookshelf/bootstrap-api-key; ln -s /etc/passwd /var/tmp/audiobookshelf/bootstrap-api-key')
        docker('restart', containers[1])
        time.sleep(2)
        current = json.loads(docker('inspect', containers[1]).stdout)[0]
        assert current['State']['Running'] is False and current['State']['ExitCode'] != 0
        with socket.socket() as sock:
            assert sock.connect_ex(('127.0.0.1', 13378)) != 0
        proof['unsafe_credential'] = {'refused_start': True, 'serving_port_closed': True}
    print(json.dumps(proof, indent=2))
except Exception:
    target = ROOT / 'evidence'
    target.mkdir(exist_ok=True)
    (target / 'runtime-failure.log').write_text(docker('logs', containers[1], check=False).stdout + docker('logs', containers[1], check=False).stderr)
    raise
finally:
    for name in containers:
        docker('rm', '-f', name, check=False)
    for name in volumes:
        docker('volume', 'rm', name, check=False)
