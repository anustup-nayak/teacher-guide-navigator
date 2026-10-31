import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('skill_preflight', Path(__file__).with_name('preflight.py'))
preflight = importlib.util.module_from_spec(spec)
spec.loader.exec_module(preflight)


class PreflightTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for name in preflight.REQUIRED:
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text('baseline')
        self.pack = self.root / 'curricula' / 'sample-science-2027'
        for stage in ('originals', 'extracted', 'reviewed'):
            (self.pack / stage).mkdir(parents=True)
        original = self.pack / 'originals' / 'guide.pdf'
        original.write_bytes(b'%PDF-1.7\nfixture')
        self.manifest = {'documents': [{'id': 'guide-g8-fixture', 'file': 'guide.pdf',
            'sha256': hashlib.sha256(original.read_bytes()).hexdigest()}]}
        (self.pack / 'originals' / 'manifest.json').write_text(json.dumps(self.manifest))
        self.config = {'id': 'sample-science-2027', 'publicationDirectory': 'packs/sample-science-2027',
                       'status': 'awaiting-sources', 'reviewedFiles': []}
        self.save_config()

    def save_config(self):
        (self.pack / 'pack.json').write_text(json.dumps(self.config))

    def check(self, **kwargs):
        return preflight.inspect(self.root, 'sample-science-2027', **kwargs)

    def test_intact_original_and_staging_pass_without_writes(self):
        before = {p.relative_to(self.root): p.read_bytes() for p in self.root.rglob('*') if p.is_file()}
        self.assertTrue(self.check(require_sources=True)['ok'])
        after = {p.relative_to(self.root): p.read_bytes() for p in self.root.rglob('*') if p.is_file()}
        self.assertEqual(before, after)

    def test_changed_original_blocks_readiness(self):
        (self.pack / 'originals' / 'guide.pdf').write_bytes(b'changed')
        self.assertIn('Original PDF checksum mismatch', self.check()['errors'])

    def test_escaping_paths_and_wrong_publication_are_rejected(self):
        self.config['publicationDirectory'] = '../other'
        self.config['reviewedFiles'] = ['../../outside']
        self.save_config()
        self.manifest['documents'][0]['file'] = '../guide.pdf'
        (self.pack / 'originals' / 'manifest.json').write_text(json.dumps(self.manifest))
        result = self.check()
        self.assertFalse(result['ok'])
        self.assertGreaterEqual(len(result['errors']), 3)

    def test_review_gate_requires_equal_published_bytes(self):
        self.config.update(status='reviewed-snapshot', reviewedFiles=sorted(preflight.NORMALIZED))
        self.save_config()
        publication = self.root / 'dist' / 'packs' / self.config['id']
        publication.mkdir(parents=True)
        for name in preflight.NORMALIZED:
            (self.pack / 'reviewed' / name).write_text('reviewed')
            (publication / name).write_text('reviewed')
        self.assertTrue(self.check(require_reviewed=True, require_sources=True)['ok'])
        (publication / 'catalog.mjs').write_text('unreviewed drift')
        self.assertFalse(self.check(require_reviewed=True)['ok'])


if __name__ == '__main__':
    unittest.main()
