#!/usr/bin/env python3
"""Render an immutable startup adapter; the official image stays unchanged."""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
adapter = (ROOT / 'container/bootstrap.cjs').read_text()
command = "umask 077\ncat > /var/tmp/audiobookshelf/bootstrap.cjs <<'ABS_ADAPTER'\n" + adapter + "ABS_ADAPTER\nexec node /var/tmp/audiobookshelf/bootstrap.cjs\n"
rendered = json.dumps({'services': {'web': {
    'image': 'docker.io/advplyr/audiobookshelf:2.37.1',
    'entrypoint': ['/bin/sh', '-eu', '-c'], 'command': [command],
    'environment': {'HOST': '127.0.0.1', 'PORT': '13378',
                    'CONFIG_PATH': '/var/tmp/audiobookshelf/config',
                    'METADATA_PATH': '/var/tmp/audiobookshelf/metadata',
                    'ROUTER_BASE_PATH': '/audiobookshelf', 'TZ': 'UTC'},
    'read_only': True,
    'volumes': ['data:/var/tmp'], 'tmpfs': ['/tmp:mode=1777'],
    'restart': 'unless-stopped', 'stop_grace_period': '30s',
}}, 'volumes': {'data': {}}}, indent=2).replace('$', '$$') + '\n'
parser = argparse.ArgumentParser()
parser.add_argument('--check', action='store_true')
args = parser.parse_args()
target = ROOT / 'compose.yaml'
if args.check:
    if target.read_text() != rendered:
        raise SystemExit('compose.yaml is stale; run npm run render')
else:
    target.write_text(rendered)
