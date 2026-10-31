"""Verify original-document integrity independently of the published app."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def verify(root, require_complete=False):
    errors, missing, count = [], [], 0
    for manifest in sorted((root / 'curricula').glob('*/originals/manifest.json')):
        data = json.loads(manifest.read_text())
        originals = manifest.parent
        registered = set()
        for doc in data['documents']:
            key = (doc['kind'], doc['grade'])
            if key in registered:
                errors.append(f'{manifest}: duplicate document kind/grade')
            registered.add(key)
            name = doc['file']
            path = originals / name
            if Path(name).name != name or path.is_symlink() or not path.is_file():
                errors.append(f'{manifest}: missing/unsafe original {name}')
                continue
            with path.open('rb') as stream:
                signature = stream.read(1024)
                stream.seek(0)
                digest = hashlib.file_digest(stream, 'sha256').hexdigest()
            if b'%PDF-' not in signature or digest != doc['sha256']:
                errors.append(f'{manifest}: PDF signature/checksum failure {name}')
            expected = next((e for e in data.get('expectedDocuments', []) if (e['kind'], e['grade']) == key), {})
            if expected.get('sha256') and digest != expected['sha256']:
                errors.append(f'{manifest}: original does not match published source {name}')
            if path.stat().st_size > 100 * 1024 * 1024:
                errors.append(f'{manifest}: original exceeds regular Git 100 MiB limit; use approved external archive/LFS before staging')
            count += 1
        for expected in data.get('expectedDocuments', []):
            if (expected['kind'], expected['grade']) not in registered:
                missing.append(f"{manifest.parent.parent.name}: {expected['kind']} grade {expected['grade']}")
        for path in originals.glob('*.pdf'):
            if path.name not in {d['file'] for d in data['documents']}:
                errors.append(f'Unregistered original: {path}')
    if require_complete and missing:
        errors.append('Required original archive incomplete')
    return {'ok': not errors, 'verifiedDocuments': count, 'missing': missing, 'errors': errors}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--require-complete', action='store_true')
    args = parser.parse_args()
    result = verify(ROOT, args.require_complete)
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result['ok'] else 1)
