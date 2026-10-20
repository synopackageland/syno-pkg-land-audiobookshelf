#!/usr/bin/env python3
"""Coordinate the Linux build; credentials and device tests are never embedded."""
import os
from pathlib import Path
import re
import shlex
import subprocess

ROOT = Path(__file__).resolve().parents[2]
PKG = ROOT / 'synology'
host = os.environ['SPL_BUILD_SSH']
remote = os.environ.get('SPL_BUILD_DIR', '/tmp/audiobookshelf-build')
if not re.fullmatch(r'/tmp/[A-Za-z0-9_-]+', remote):
    raise SystemExit('SPL_BUILD_DIR must be isolated under /tmp')
def run(*args):
    subprocess.run(args, cwd=ROOT, check=True)
run('ssh', host, shlex.join(['mkdir', '-p', remote + '/synology']))
run('rsync', '-az', '--exclude=node_modules', '--exclude=.artifacts', '--exclude=.synopkgland',
    '--exclude=.e2e', '--exclude=dist', '--exclude=evidence', '--exclude=.cache', str(PKG) + '/', host + ':' + remote + '/synology/')
env = [k + '=' + os.environ[k] for k in ['SPL_BUILDER_IMAGE', 'SPL_RESOURCE_PREFIX', 'SPL_NPM_REGISTRY', 'SYNOPKGLAND_COMPOSE_REGISTRY_MIRRORS'] if k in os.environ]
for source, target in [('SPL_REMOTE_SDK_DIR', 'SYNOPKGLAND_SDK_DIR'), ('SPL_REMOTE_CLI_DIR', 'SPL_CLI_DIR')]:
    if os.environ.get(source):
        env.append(target + '=' + os.environ[source])
run('ssh', host, shlex.join(['env', *env, 'python3', remote + '/synology/scripts/build-linux.py']))
for name in ['package-lock.json', 'build-proof.json', 'dist', 'evidence']:
    run('rsync', '-az', host + ':' + remote + '/synology/' + name, str(PKG) + '/')
