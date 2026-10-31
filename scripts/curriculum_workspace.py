"""Local curriculum staging. Does not map lessons or publish unreviewed text."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil

PROJECT = Path(__file__).resolve().parents[1]


def pack_path(root, pack_id):
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', pack_id):
        raise ValueError('Pack id must be lowercase words/numbers separated by hyphens')
    return root / pack_id


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def init(root, pack_id):
    pack = pack_path(root, pack_id)
    for stage in ('originals', 'extracted', 'tools', 'model', 'compat', 'reviewed'):
        (pack / stage).mkdir(parents=True, exist_ok=True)
    config = pack / 'pack.json'
    if not config.exists():
        write_json(config, {'id': pack_id, 'publicationDirectory': f'packs/{pack_id}',
                            'reviewedFiles': [], 'status': 'awaiting-sources',
                            'metadata': {'program': 'model/program.json', 'structure': 'model/structure.json',
                                         'understanding': 'model/program-understanding.json', 'profile': 'model/PROGRAM_PROFILE.md'}})
    understanding = pack / 'model' / 'program-understanding.json'
    if not understanding.exists():
        schema = json.loads((PROJECT / 'schemas/content-model/program-understanding.schema.json').read_text())
        write_json(understanding, {'pack': pack_id, 'status': 'not-started', 'profile': 'PROGRAM_PROFILE.md',
            'dimensions': [{'id': name, 'status': 'not-inspected', 'summary': '', 'sourceRefs': [],
                            'provenance': {'assertion': 'editorial', 'review': 'unreviewed'}}
                           for name in schema['$defs']['dimensionId']['enum']],
            'questions': [], 'provenance': {'assertion': 'editorial', 'review': 'unreviewed'}})
    profile = pack / 'model' / 'PROGRAM_PROFILE.md'
    if not profile.exists():
        profile.write_text('# Program profile — awaiting source understanding\n\n'
                           'Status: NOT STARTED; no document understanding or review is claimed.\n'
                           'Use the program-understanding skill reference and profile template.\n', encoding='utf-8')
    manifest = pack / 'originals' / 'manifest.json'
    if not manifest.exists():
        write_json(manifest, {'documents': []})
    return pack


def digest(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def import_pdf(root, pack_id, source, kind, grade):
    source = Path(source).resolve()
    with source.open('rb') as stream:
        if b'%PDF-' not in stream.read(1024):
            raise ValueError('Source is not a PDF')
    pack = init(root, pack_id)
    manifest_path = pack / 'originals' / 'manifest.json'
    manifest = json.loads(manifest_path.read_text())
    sha = digest(source)
    doc_id = f'{kind}-g{grade}-{sha[:12]}'
    target = pack / 'originals' / f'{doc_id}.pdf'
    if target.exists() and digest(target) != sha:
        raise ValueError('Existing original differs; refusing to overwrite')
    if not target.exists():
        shutil.copyfile(source, target)
    record = {'id': doc_id, 'kind': kind, 'grade': grade, 'file': target.name,
              'sha256': sha, 'originalFilename': source.name}
    existing = next((d for d in manifest['documents'] if d['id'] == doc_id), None)
    if existing and existing != record:
        raise ValueError('Document manifest conflict; review it before changing identity')
    if not existing:
        manifest['documents'].append(record)
        write_json(manifest_path, manifest)
    return target


def extract(root, pack_id):
    import fitz  # Optional ingestion dependency; the app itself needs no Python packages.
    pack = pack_path(root, pack_id)
    manifest = json.loads((pack / 'originals' / 'manifest.json').read_text())
    if not manifest['documents']:
        raise ValueError('No original PDFs registered')
    results = []
    for item in manifest['documents']:
        source = pack / 'originals' / item['file']
        if source.parent.resolve() != (pack / 'originals').resolve() or digest(source) != item['sha256']:
            raise ValueError('Original PDF integrity check failed')
        output = pack / 'extracted' / item['id']
        output.mkdir(parents=True, exist_ok=True)
        pages = []
        with fitz.open(source) as document:
            if document.needs_pass:
                raise ValueError('Encrypted PDF needs a separately authorized decrypted copy')
            for page in document:
                text = page.get_text(sort=True)
                # Embedded text is a draft, even when it is nonempty. Legacy fonts,
                # reading order, maths and image-only content need source comparison.
                pages.append({'pdfPage': page.number + 1, 'width': page.rect.width,
                              'height': page.rect.height, 'text': text,
                              'needsOCR': not bool(text.strip()), 'reviewStatus': 'unreviewed'})
        write_json(output / 'pages.json', {'documentId': item['id'],
                   'sourceSha256': item['sha256'], 'method': 'embedded-text', 'pages': pages})
        results.append({'documentId': item['id'], 'pages': len(pages),
                        'pagesNeedingOCR': sum(p['needsOCR'] for p in pages)})
    write_json(pack / 'extracted' / 'summary.json', results)
    return results


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=PROJECT / 'curricula')
    sub = parser.add_subparsers(dest='command', required=True)
    for name in ('init', 'import', 'extract'):
        command = sub.add_parser(name)
        command.add_argument('pack_id')
        if name == 'import':
            command.add_argument('pdf', type=Path)
            command.add_argument('--kind', required=True, choices=('guide', 'workbook', 'textbook'))
            command.add_argument('--grade', required=True, type=int, help='0 for Balvatika; positive integers for numbered grades')
    args = parser.parse_args()
    if args.command == 'init':
        print(init(args.root, args.pack_id))
    elif args.command == 'import':
        if args.grade < 0:
            parser.error('Grade must be nonnegative; use 0 for Balvatika')
        print(import_pdf(args.root, args.pack_id, args.pdf, args.kind, args.grade))
    else:
        print(json.dumps(extract(args.root, args.pack_id), indent=2))


if __name__ == '__main__':
    main()
