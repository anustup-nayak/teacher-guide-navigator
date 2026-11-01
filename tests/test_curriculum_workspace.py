import importlib.util
import json
import subprocess
import sys
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('workspace', Path(__file__).parents[1] / 'scripts/curriculum_workspace.py')
workspace = importlib.util.module_from_spec(spec)
spec.loader.exec_module(workspace)


class WorkspaceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def test_init_is_idempotent_and_rejects_path_escape(self):
        pack = workspace.init(self.root, 'test-science-2027')
        config = pack / 'pack.json'
        content = config.read_bytes()
        workspace.init(self.root, 'test-science-2027')
        self.assertEqual(config.read_bytes(), content)
        self.assertTrue(all((pack / stage).is_dir() for stage in ['originals', 'extracted', 'reviewed']))
        with self.assertRaises(ValueError):
            workspace.init(self.root, '../escape')

    def test_pdf_import_and_extraction_keep_originals_and_review_separate(self):
        import fitz
        pdf = self.root / 'input.pdf'
        with fitz.open() as doc:
            page = doc.new_page()
            page.insert_text((72, 72), 'Test guide: compare two quantities.')
            doc.new_page()  # Image-only/empty page needs OCR rather than invented text.
            doc.save(pdf)
        before = pdf.read_bytes()
        original = workspace.import_pdf(self.root, 'test-math', pdf, 'guide', 8)
        workspace.import_pdf(self.root, 'test-math', pdf, 'guide', 8)
        pack = original.parent.parent
        manifest = json.loads((pack / 'originals/manifest.json').read_text())
        self.assertEqual(len(manifest['documents']), 1)
        result = workspace.extract(self.root, 'test-math')
        self.assertEqual(result[0]['pages'], 2)
        self.assertEqual(result[0]['pagesNeedingOCR'], 1)
        self.assertEqual(original.read_bytes(), before)
        self.assertEqual(pdf.read_bytes(), before)
        self.assertEqual(list((pack / 'reviewed').iterdir()), [])
        pages = json.loads(next((pack / 'extracted').glob('*/pages.json')).read_text())['pages']
        self.assertIn('compare two quantities', pages[0]['text'])
        self.assertTrue(all(p['reviewStatus'] == 'unreviewed' for p in pages))
        self.assertFalse(list((pack / 'originals').glob('*decoded*')))
        original.write_bytes(b'%PDF-corrupted')
        with self.assertRaisesRegex(ValueError, 'integrity'):
            workspace.extract(self.root, 'test-math')

    def test_balvatika_import_uses_level_zero_without_inventing_grade_one(self):
        import fitz
        pdf = self.root / 'balvatika.pdf'
        with fitz.open() as doc:
            page = doc.new_page()
            page.insert_text((72, 72), 'Balvatika source fixture')
            doc.save(pdf)
        original = workspace.import_pdf(self.root, 'up-hindi-balvatika-2026', pdf, 'guide', 0)
        self.assertIn('g0-', original.name)
        command = subprocess.run([sys.executable, str(Path(workspace.__file__)), '--root', str(self.root), 'import', 'up-hindi-balvatika-2026', str(pdf), '--kind', 'guide', '--grade', '0'], capture_output=True, text=True)
        self.assertEqual(command.returncode, 0, command.stderr)
        manifest = json.loads((original.parent / 'manifest.json').read_text())
        self.assertEqual(manifest['documents'][0]['grade'], 0)
        result = workspace.extract(self.root, 'up-hindi-balvatika-2026')
        self.assertEqual(result[0]['pages'], 1)

    def test_program_understanding_scaffold_is_explicitly_incomplete_and_never_reset(self):
        pack = workspace.init(self.root, 'sample-science-2027')
        cfg = json.loads((pack / 'pack.json').read_text())
        self.assertEqual(cfg['metadata']['understanding'], 'model/program-understanding.json')
        file = pack / cfg['metadata']['understanding']
        draft = json.loads(file.read_text())
        self.assertEqual(draft['status'], 'not-started')
        self.assertEqual(len(draft['dimensions']), 9)
        self.assertTrue(all(d['status'] == 'not-inspected' and not d['sourceRefs'] for d in draft['dimensions']))
        draft['status'] = 'in-progress'
        file.write_text(json.dumps(draft))
        before = file.read_bytes()
        workspace.init(self.root, 'sample-science-2027')
        self.assertEqual(file.read_bytes(), before)

    def test_invalid_pdf_is_rejected_without_creating_a_pack(self):
        source = self.root / 'fake.pdf'
        source.write_text('Not a PDF')
        with self.assertRaises(ValueError):
            workspace.import_pdf(self.root, 'bad-pack', source, 'guide', 1)
        self.assertFalse((self.root / 'bad-pack').exists())


if __name__ == '__main__':
    unittest.main()
