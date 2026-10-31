import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('hindi_text', Path(__file__).resolve().parents[1] / 'curricula/up-hindi-2026/tools/hindi_text.py')
hindi = importlib.util.module_from_spec(spec)
spec.loader.exec_module(hindi)


class HindiDecoderTests(unittest.TestCase):
    """Words copied from the UP Hindi 2026-27 PDFs, checked against the page images."""
    CASES = [
        ('A-SuperHindi-1-Normal', 'cPpksa dks fp= pkVZ è;ku ls ns[kus osG fy, dgsaA', 'बच्चों को चित्र चार्ट ध्यान से देखने के लिए कहें।'),
        ('A-SuperHindi-1-Normal', 'oqGN', 'कुछ'),
        ('A-SuperHindi-1-Normal', 'osaGfær', 'केंद्रित'),
        ('BHARTIYA-HINDI_115', 'LowGy', 'स्कूल'),
        ('BHARTIYA-HINDI_115', "vk/kkjf'kyk fÚ;kUo;u f'k{kd lan¤'kdk", 'आधारशिला क्रियान्वयन शिक्षक संदर्शिका'),
        ('BHARTIYA-HINDI_115', 'crk,¢', 'बताएँ'),
        ('BHARTIYA-HINDI_115', 'mÛkj', 'उत्तर'),
        ('BHARTIYA-HINDI_115', 'y[kuÇ', 'लखनऊ'),
        ('A-SuperHindi-1-Normal', "'kqývkrh", 'शुरुआती'),
        ('A-SuperHindi-1-Normal', 'fpfõr', 'चिह्नित'),
        ('A-SuperHindi-1-Normal', 'mi;qä', 'उपयुक्त'),
        ('A-SuperHindi-1-Normal', 'dk;ks±', 'कार्यों'),
        ('Walkman-Chanakya905Bold', 'i£p;k¡', 'पर्चियाँ'),
        ('Walkman-Chanakya905Bold', 'osQ\x01lkFk', 'के साथ'),
        ('Walkman-Chanakya905Bold', 'yxHkx\x0150»', 'लगभग 50%'),
        ('A-SuperHindi-1-Normal', 'iwGy', 'फूल'),
        ('A-SuperHindi-1-Normal', 'lisGn', 'सफेद'),
        ('A-SuperHindi-1-Normal', 'ikoZG', 'पार्क'),
        ('KrutiDev010Bold', '12&15 feuV', '12-15 मिनट'),
        ('ArialMT', '•', '•'),
    ]

    def test_known_words(self):
        for font, raw, expected in self.CASES:
            with self.subTest(raw=raw):
                self.assertEqual(hindi.decode(raw, font), expected)

    def test_bold_overprint_is_deduplicated(self):
        self.assertEqual(hindi.dedupe('oh.kkoh.kk'), 'oh.kk')
        self.assertEqual(hindi.dedupe('abab'), 'ab')
        self.assertEqual(hindi.dedupe('abc'), 'abc')


if __name__ == '__main__':
    unittest.main()
