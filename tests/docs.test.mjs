import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SKIP = new Set(['.git', 'node_modules', 'extracted', 'content']);
function markdown(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => {
    if (SKIP.has(e.name)) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? markdown(p) : e.name.endsWith('.md') ? [p] : [];
  });
}

test('every relative link in the documentation and skill resolves', () => {
  const broken = [];
  for (const file of markdown(ROOT)) {
    const text = fs.readFileSync(file, 'utf8');
    for (const [, href] of text.matchAll(/\]\(([^)\s#]+)(?:#[^)]*)?\)/g)) {
      if (/^[a-z]+:/i.test(href)) continue;
      if (!fs.existsSync(path.resolve(path.dirname(file), decodeURIComponent(href)))) broken.push(`${path.relative(ROOT, file)} → ${href}`);
    }
  }
  assert.deepEqual(broken, []);
});

test('no file-sync copies ("name 2.ext") are committed or lying in the tree', () => {
  const copies = [];
  const walk = dir => { for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    if (/ \d+(\.[^.]+)?$/.test(e.name)) copies.push(path.relative(ROOT, path.join(dir, e.name)));
    if (e.isDirectory()) walk(path.join(dir, e.name));
  } };
  walk(ROOT);
  assert.deepEqual(copies, [], 'move sync copies out of the repository (see docs/DEVELOPMENT.md#checks)');
});
