import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {stagePages} from '../scripts/stage_pages.mjs';

test('Pages artifact preserves both website versions without publishing repository sources', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'pages-stage-'));
  try {
    for (const version of ['current', 'legacy']) {
      const source = path.join(base, version, 'dist');
      fs.mkdirSync(path.join(source, 'source'), {recursive: true});
      for (const name of ['index.html', 'app.mjs', 'sw.js', 'source/page.webp']) fs.writeFileSync(path.join(source, name), version + name);
      fs.writeFileSync(path.join(base, version, 'private.txt'), 'not website content');
    }
    const current = path.join(base, 'current/dist'), legacy = path.join(base, 'legacy/dist'), out = path.join(base, 'artifact');
    assert.throws(() => stagePages(current, legacy, path.join(current, 'artifact')), /separate/);
    stagePages(current, legacy, out);
    for (const name of ['index.html', 'app.mjs', 'sw.js', 'source/page.webp']) {
      assert.equal(fs.readFileSync(path.join(out, name), 'utf8'), 'current' + name);
      assert.equal(fs.readFileSync(path.join(out, 'v1', name), 'utf8'), 'legacy' + name);
      assert.equal(fs.readFileSync(path.join(current, name), 'utf8'), 'current' + name);
    }
    assert.equal(fs.existsSync(path.join(out, 'private.txt')), false);
    assert.equal(fs.existsSync(path.join(out, 'v1/private.txt')), false);
    assert.throws(() => stagePages(current, legacy, out), /already exist/);
  } finally { fs.rmSync(base, {recursive: true, force: true}); }
});
