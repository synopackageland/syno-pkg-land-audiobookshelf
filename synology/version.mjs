#!/usr/bin/env node
// Stable tag -> DSM version. Keep all wrapper-owned changes under synology/.
import {readFileSync, writeFileSync} from 'node:fs';
const [tag, build, mode] = process.argv.slice(2);
const match = /^v?((?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*))$/.exec(tag ?? '');
const file = new URL('./dsm-package.yaml', import.meta.url);
const source = readFileSync(file, 'utf8');
const current = /^build: (\d+)\s*$/m.exec(source);
const previous = /^version: (\d+\.\d+\.\d+)\s*$/m.exec(source);
if (!match || !/^[1-9][0-9]{0,3}$/.test(build ?? '') || !current || !previous)
  throw new Error('Use a stable [v]X.Y.Z tag and a packaging build from 1 to 9999.');
const a = match[1].split('.').map(Number), b = previous[1].split('.').map(Number);
let comparison = 0;
for (let i = 0; i < 3 && !comparison; i++) comparison = Math.sign(a[i] - b[i]);
if (comparison < 0 || (comparison === 0 ? Number(build) <= Number(current[1]) : Number(build) !== 1))
  throw new Error('Increment builds within one release; reset to 1 for a newer upstream release.');
if (mode !== '--validate') writeFileSync(file, source.replace(/^version: .+$/m, `version: ${match[1]}`).replace(/^build: \d+[ \t]*$/m, `build: ${Number(build)}`));
