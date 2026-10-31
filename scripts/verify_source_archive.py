"""Verify original-document integrity independently of the published app."""
import argparse
from fnmatch import fnmatch
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GIT_LIMIT = 100 * 1024 * 1024
LFS_SPEC = b'version https://git-lfs.github.com/spec/v1'


def lfs_patterns(root):
    """Paths/patterns that .gitattributes stores with Git LFS."""
    attributes = root / '.gitattributes'
    if not attributes.is_file():
        return []
    return [line.split()[0] for line in attributes.read_text().splitlines()
            if line.strip() and not line.startswith('#') and 'filter=lfs' in line.split()[1:]]


def lfs_pointer(path):
    """Return the sha256 recorded by a Git LFS pointer file, or None for real content.

    A checkout without `git lfs pull` (as in CI) holds only the pointer; its oid is the
    SHA-256 of the original, so integrity is still checked without downloading it."""
    if path.stat().st_size > 1024:
        return None
    text = path.read_bytes()
    if not text.startswith(LFS_SPEC):
        return None
    fields = dict(line.split(' ', 1) for line in text.decode().splitlines() if ' ' in line)
    return fields.get('oid', '').removeprefix('sha256:')


def verify(root, require_complete=False):
    errors, missing, count, pointers = [], [], 0, 0
    patterns = lfs_patterns(root)
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
            tracked = any(fnmatch(path.relative_to(root).as_posix(), p) for p in patterns)
            pointer = lfs_pointer(path)
            if pointer is not None:
                digest = pointer
                pointers += 1
                if not tracked or digest != doc['sha256']:
                    errors.append(f'{manifest}: Git LFS pointer is untracked or does not match checksum {name}')
            else:
                with path.open('rb') as stream:
                    signature = stream.read(1024)
                    stream.seek(0)
                    digest = hashlib.file_digest(stream, 'sha256').hexdigest()
                if b'%PDF-' not in signature or digest != doc['sha256']:
                    errors.append(f'{manifest}: PDF signature/checksum failure {name}')
            expected = next((e for e in data.get('expectedDocuments', []) if (e['kind'], e['grade']) == key), {})
            if expected.get('sha256') and digest != expected['sha256']:
                errors.append(f'{manifest}: original does not match published source {name}')
            if path.stat().st_size > GIT_LIMIT and not tracked:
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
    return {'ok': not errors, 'verifiedDocuments': count, 'lfsPointersVerified': pointers, 'missing': missing, 'errors': errors}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--require-complete', action='store_true')
    args = parser.parse_args()
    result = verify(ROOT, args.require_complete)
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result['ok'] else 1)
