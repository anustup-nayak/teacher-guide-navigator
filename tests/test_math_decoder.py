import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('legacy_fonts', Path(__file__).resolve().parents[1] / 'scripts/ingestion/legacy_fonts.py')
fonts = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fonts)

class MathSymbolTests(unittest.TestCase):
    def test_source_aat_text_plus_glyph(self):
        for font in ['AAText-Normal', 'AAText-Bold']:
            self.assertEqual(fonts.convert_span({'font': font, 'text': '\uf032\uf036\uf020\uf024\uf020\uf031\uf033'}), '26 + 13')

    def test_other_fonts_keep_currency(self):
        self.assertEqual(fonts.convert_span({'font': 'Arial', 'text': '$26'}), '$26')
