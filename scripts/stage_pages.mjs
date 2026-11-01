// Publish only the current website and the frozen v1 website, never repository sources.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export function stagePages(current, legacy, output) {
  const roots = [current, legacy, output].map(p => path.resolve(p));
  const contains = (a, b) => b === a || b.startsWith(a + path.sep);
  if (contains(roots[0], roots[2]) || contains(roots[1], roots[2]) ||
      contains(roots[2], roots[0]) || contains(roots[2], roots[1])) {
    throw Error('The artifact directory must be separate from both website sources');
  }
  for (const source of roots.slice(0, 2)) {
    for (const name of ['index.html', 'app.mjs', 'sw.js']) {
      if (!fs.statSync(path.join(source, name)).isFile()) throw Error(`Missing ${name}`);
    }
  }
  if (fs.existsSync(roots[2])) throw Error('Artifact directory must not already exist');
  if (fs.existsSync(path.join(roots[0], 'v1'))) throw Error('Current website already contains v1');
  fs.cpSync(roots[0], roots[2], {recursive: true});
  fs.cpSync(roots[1], path.join(roots[2], 'v1'), {recursive: true});
  console.log(`Staged current website and frozen /v1/ at ${roots[2]}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.length !== 5) throw Error('Usage: node scripts/stage_pages.mjs <current-dist> <v1-dist> <artifact>');
  stagePages(...process.argv.slice(2));
}
