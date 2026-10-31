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
        ('A-SuperHindi-1-Bold', 'fp= pkVZ ij le`) ppkZ', 'चित्र चार्ट पर समृद्ध चर्चा'),
        ('A-SuperHindi-1-Bold', 'dk;ZiqfLrdk ¼Hkkx&1½ ij dk;Z', 'कार्यपुस्तिका (भाग-1) पर कार्य'),
        ('KrutiDev010Bold', '12&15 feuV', '12-15 मिनट'),
        ('ArialMT', '•', '•'),
        ('A-SuperHindi-1-Normal', "ek=k ^ f *", 'मात्रा ‘ ि ’'),
    ]

    def test_known_words(self):
        for font, raw, expected in self.CASES:
            with self.subTest(raw=raw):
                self.assertEqual(hindi.decode(raw, font), expected)

    def test_scrambled_glyph_order_is_rebuilt_from_positions(self):
        # Glyphs as emitted on TG G2 p23 (week 1 day 5): marks after the next letter, stray spaces.
        tlS = [('t', 432.95, 7.65), ('l', 440.49, 7.05), ('S', 440.5, 0.08), (' ', 440.58, 6.82),
               ('&', 447.4, 3.99), ('s', 447.45, 0.04), (' ', 447.49, 3.9)]
        self.assertEqual(hindi.decode(hindi.ordered_text(tlS), 'A-SuperHindi-1-Normal').strip(), 'जैसे-')
        ukVs = [('u', 319.8, 5.91), ('k', 325.62, 2.58), ('V', 328.05, 5.9), ('s', 328.1, 0.04),
                (' ', 328.14, 5.72), ('c', 333.86, 5.34), ('d', 339.08, 7.64), ('q', 339.11, 0.06)]
        self.assertEqual(hindi.decode(hindi.ordered_text(ukVs), 'A-SuperHindi-1-Normal'), 'नोटबुक')
        fine = [('d', 319.1, 7.6), ('q', 326.7, 0.1), ('N', 326.7, 7.1)]
        self.assertEqual(hindi.ordered_text(fine), 'dqN', 'correctly ordered spans are unchanged')

    def test_bold_overprint_is_deduplicated(self):
        self.assertEqual(hindi.dedupe('oh.kkoh.kk'), 'oh.kk')
        self.assertEqual(hindi.dedupe('abab'), 'ab')
        self.assertEqual(hindi.dedupe('abc'), 'abc')


if __name__ == '__main__':
    unittest.main()
