import importlib.util
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('archive', Path(__file__).resolve().parents[1] / 'scripts/verify_source_archive.py')
archive = importlib.util.module_from_spec(spec)
spec.loader.exec_module(archive)


class ArchiveTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.folder = self.root / 'curricula/example/originals'
        self.folder.mkdir(parents=True)
        self.pdf = self.folder / 'guide.pdf'
        self.pdf.write_bytes(b'%PDF-1.4\nfixture')
        self.record = {'kind': 'guide', 'grade': 1, 'file': 'guide.pdf', 'sha256': hashlib.sha256(self.pdf.read_bytes()).hexdigest()}

    def manifest(self, docs):
        (self.folder / 'manifest.json').write_text(json.dumps({'documents': docs, 'expectedDocuments': [{'kind': 'guide', 'grade': 1, 'sha256': self.record['sha256']}]}))

    def test_valid_original_and_tampering(self):
        self.manifest([self.record])
        self.assertTrue(archive.verify(self.root, True)['ok'])
        self.pdf.write_bytes(b'%PDF-changed')
        self.assertFalse(archive.verify(self.root)['ok'])

    def test_missing_sources_distinct_from_app_readiness(self):
        self.pdf.unlink()
        self.manifest([])
        self.assertTrue(archive.verify(self.root)['ok'])
        self.assertFalse(archive.verify(self.root, True)['ok'])

    def test_unregistered_and_unsafe_files(self):
        self.manifest([])
        self.assertFalse(archive.verify(self.root)['ok'])
        self.record['file'] = '../guide.pdf'
        self.manifest([self.record])
        self.assertFalse(archive.verify(self.root)['ok'])
