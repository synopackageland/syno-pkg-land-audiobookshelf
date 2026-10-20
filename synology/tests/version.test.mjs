import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, copyFileSync, writeFileSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

function run(version, build, tag, next, validate = false) {
  const dir = mkdtempSync(join(tmpdir(), 'audiobookshelf-version-'));
  try {
    copyFileSync(new URL('../version.mjs', import.meta.url), join(dir, 'version.mjs'));
    const before = `version: ${version}\nbuild: ${build}\n`;
    writeFileSync(join(dir, 'dsm-package.yaml'), before);
    const result = spawnSync(process.execPath, [join(dir, 'version.mjs'), tag, next,
      ...(validate ? ['--validate'] : [])], {encoding: 'utf8'});
    return {code: result.status, text: readFileSync(join(dir, 'dsm-package.yaml'), 'utf8'), before};
  } finally { rmSync(dir, {recursive: true, force: true}); }
}
test('same release increments the four-digit SPK build', () => {
  const result = run('2.37.1', 1, 'v2.37.1', '2');
  assert.equal(result.code, 0); assert.equal(result.text, 'version: 2.37.1\nbuild: 2\n');
});
test('a newer upstream release resets the build to one', () => {
  const result = run('2.37.1', 9, 'v2.38.0', '1');
  assert.equal(result.code, 0); assert.equal(result.text, 'version: 2.38.0\nbuild: 1\n');
});
test('version comparison is numeric', () => {
  assert.equal(run('2.9.0', 99, 'v2.10.0', '1').code, 0);
});
test('downgrades, repeated builds and skipped release reset fail without edits', () => {
  for (const [tag, build] of [['v2.36.0','10'], ['v2.37.1','1'], ['v2.38.0','2'], ['v2.38.0','10000']]) {
    const result = run('2.37.1', 1, tag, build);
    assert.notEqual(result.code, 0); assert.equal(result.text, result.before);
  }
});
test('validation does not change the manifest', () => {
  const result = run('2.37.1', 1, 'v2.37.1', '2', true);
  assert.equal(result.code, 0); assert.equal(result.text, result.before);
});
