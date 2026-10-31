#!/usr/bin/env python3
"""Read-only repository/pack checks; never extracts, publishes or clears storage."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

REQUIRED = ('AGENTS.md', 'README.md', 'package.json', 'dist/index.html',
            'dist/app.mjs', 'dist/sw.js', 'dist/curricula.mjs',
            'scripts/curriculum_workspace.py', 'scripts/publish_curriculum.mjs',
            'docs/QA_QC_RELEASE_CHECKLIST.md', 'docs/PRD.md', 'docs/ARCHITECTURE.md',
            'dist/domain/app-context.mjs', 'dist/services/resources.mjs',
            'dist/features/reader.mjs', 'dist/features/offline.mjs', 'dist/views/lesson-media.mjs', 'dist/domain/selection.mjs',
            'dist/views/curriculum-switcher.mjs', 'curricula/published-baseline.json',
            'scripts/verify_publications.mjs', 'docs/CURRICULUM_EXPANSION.md')
NORMALIZED = {'catalog.mjs', 'resources.json', 'worksheets.json', 'sources.json'}


def inspect(repo, pack_id=None, require_reviewed=False, require_sources=False):
    repo = repo.resolve()
    errors, warnings, facts = [], [], {}
    for name in REQUIRED:
        if not (repo / name).is_file():
            errors.append(f'Missing repository file: {name}')
    if (repo / 'dist').exists():
        if any(p.suffix.lower() == '.pdf' for p in (repo / 'dist').rglob('*')):
            errors.append('Raw PDF found in the published tree; inspect before packaging')
    facts['gitMetadataPresent'] = (repo / '.git').exists()
    if not facts['gitMetadataPresent']:
        warnings.append('No Git metadata: record archive identity; do not claim a commit/push')
    if pack_id:
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', pack_id):
            errors.append('Invalid pack ID')
            return {'ok': False, 'facts': facts, 'warnings': warnings, 'errors': errors}
        pack = repo / 'curricula' / pack_id
        config_path = pack / 'pack.json'
        try:
            config = json.loads(config_path.read_text(encoding='utf-8'))
            if not isinstance(config, dict):
                raise ValueError('config must be an object')
        except (OSError, ValueError) as exc:
            errors.append(f'Cannot read pack config: {type(exc).__name__}')
            config = {}
        expected = '.' if pack_id == 'up-math-2026' else f'packs/{pack_id}'
        if config.get('id') != pack_id or config.get('publicationDirectory') != expected:
            errors.append('Pack identity/publication directory mismatch')
        for stage in ('originals', 'extracted', 'reviewed'):
            if not (pack / stage).is_dir():
                errors.append(f'Missing pack stage: {stage}')
        files = config.get('reviewedFiles', [])
        if not isinstance(files, list) or any(not isinstance(f, str) for f in files):
            errors.append('reviewedFiles must be a list of filenames')
            files = []
        if len(files) != len(set(files)) or any(f not in NORMALIZED for f in files):
            errors.append('Review allowlist has duplicates or unsupported paths')
        for name in files:
            if name in NORMALIZED and not (pack / 'reviewed' / name).is_file():
                errors.append(f'Missing allowlisted reviewed file: {name}')
        if require_reviewed:
            if config.get('status') != 'reviewed-snapshot' or set(files) != NORMALIZED:
                errors.append('Release gate needs reviewed-snapshot and all four normalized files')
            for name in set(files) & NORMALIZED:
                source = pack / 'reviewed' / name
                published = repo / 'dist' / expected / name
                if not published.is_file() or not source.is_file() or source.read_bytes() != published.read_bytes():
                    errors.append(f'Reviewed/publication mismatch: {name}')
        try:
            manifest = json.loads((pack / 'originals' / 'manifest.json').read_text(encoding='utf-8'))
            documents = manifest['documents']
            if not isinstance(documents, list):
                raise ValueError('documents must be a list')
        except (OSError, ValueError, KeyError, TypeError):
            documents = []
            (errors if require_sources else warnings).append('Original document manifest missing/invalid')
        facts['sourceDocuments'] = len(documents)
        if not documents:
            (errors if require_sources else warnings).append('No originals registered; do not claim source ingestion complete')
        identities = set()
        for document in documents:
            if not isinstance(document, dict):
                errors.append('Invalid document record')
                continue
            doc_id = document.get('id')
            if not isinstance(doc_id, str) or doc_id in identities:
                errors.append('Missing/duplicate document identity')
            if isinstance(doc_id, str):
                identities.add(doc_id)
            filename = document.get('file')
            if not isinstance(filename, str) or Path(filename).name != filename or '/' in filename or '\\' in filename:
                errors.append('Original document path is not a plain filename')
                continue
            original = pack / 'originals' / filename
            if original.resolve().parent != (pack / 'originals').resolve():
                errors.append('Original document path escapes its stage')
                continue
            if not original.is_file():
                errors.append('Registered original file is unavailable')
                continue
            with original.open('rb') as stream:
                digest = hashlib.file_digest(stream, 'sha256').hexdigest()
            if digest != document.get('sha256'):
                errors.append('Original PDF checksum mismatch')
        facts['packStatus'] = config.get('status')
    elif require_reviewed or require_sources:
        errors.append('--require-reviewed/--require-sources need --pack')
    return {'ok': not errors, 'facts': facts, 'warnings': warnings, 'errors': errors}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[3])
    parser.add_argument('--pack')
    parser.add_argument('--require-reviewed', action='store_true')
    parser.add_argument('--require-sources', action='store_true')
    args = parser.parse_args()
    result = inspect(args.repo, args.pack, args.require_reviewed, args.require_sources)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result['ok'] else 1


if __name__ == '__main__':
    sys.exit(main())
