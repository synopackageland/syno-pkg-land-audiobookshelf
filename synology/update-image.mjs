#!/usr/bin/env node
// Render only a source-verified immutable image lock; pin-image.py owns resolution.
import {readFileSync, writeFileSync} from 'node:fs';
const lock = JSON.parse(readFileSync(new URL('./image-lock.json', import.meta.url), 'utf8'));
const recipe = JSON.parse(readFileSync(new URL('./upstream-recipe.json', import.meta.url), 'utf8'));
const [tag] = process.argv.slice(2);
if (recipe.repository !== 'docker.io/advplyr/audiobookshelf' ||
    lock.repository !== recipe.repository.slice('docker.io/'.length) ||
    tag?.replace(/^v/, '') !== lock.tag || !lock.reference.startsWith(recipe.repository + ':' + lock.tag + '@sha256:'))
  throw new Error('Resolve and verify the selected official image first.');
writeFileSync(new URL('./compose.image.yaml', import.meta.url), JSON.stringify({services: {[recipe.service]: {image: lock.reference}}}, null, 2) + '\n');
