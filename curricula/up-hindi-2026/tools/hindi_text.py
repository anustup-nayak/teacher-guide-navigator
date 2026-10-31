"""Decode the legacy Hindi fonts used in the UP Hindi 2026-27 Teacher Guides and Workbooks.

All four families (Kruti Dev 010, BHARTIYA-HINDI, A-SuperHindi, Walkman-Chanakya) are
Kruti-compatible, so text goes through the shared Kruti mapping in scripts/decode_legacy.py.
Each family draws a few glyphs differently; FAMILY_FIXES rewrites those to Kruti codes first.
Every rule below was inferred from repeated words in these PDFs and checked against the page
images (31 October 2026); see docs/tasks/up-hindi-ingestion.md. Source text is never
paraphrased: only glyph codes change.
"""
import pathlib
import re

_REPO = pathlib.Path(__file__).resolve().parents[3]
_ns = {}
exec((_REPO / 'scripts/decode_legacy.py').read_text().split('def convert_span')[0], _ns)
kruti = _ns['legacy']

LEGACY = re.compile(r'Kruti|BHARTIYA|SuperHindi|Chanakya|AAText', re.I)
PERCENT = ''  # placeholder: Kruti maps '%' to visarga, so a real percent sign is carried through


def family(font):
    for name in ('SuperHindi', 'BHARTIYA', 'Chanakya', 'Kruti'):
        if name.lower() in font.lower():
            return name
    return None


# Glyph code → Kruti code, applied before the Kruti mapping.
COMMON = [('\xa0', ' '), ('Ú', 'Ø'), ('¢', '¡'), ('Û', 'Ù'), ('Ç', 'Å'), ('ý', '#'),
          ('õ', 'à'), ('É', 'à'), ('ä', 'Dr'), ('±', 'Za'), ('»', PERCENT)]
# क is drawn as व-shape + a hook glyph (SuperHindi/BHARTIYA: G, Chanakya: Q) with vowel signs
# or a reph between them, e.g. osG = के, oqGN = कुछ, osQ = के, ikoZG = पार्क. SuperHindi/BHARTIYA
# also draw फ as प-shape + G (iwGy = फूल).
HOOK = {'SuperHindi': 'G', 'BHARTIYA': 'G', 'Chanakya': 'Q'}
BETWEEN = '([sSqwa`¡Z]{0,3})'


def dedupe(text):
    """Bold is printed by drawing a run twice ("oh.kkoh.kk"); keep one copy."""
    n = len(text)
    return text[:n // 2] if n % 2 == 0 and n > 3 and text[:n // 2] == text[n // 2:] else text


def decode(text, font):
    fam = family(font)
    if fam is None:
        return text.replace('\xa0', ' ')
    if fam == 'Chanakya':
        text = text.replace('\x01', ' ')
    for old, new in COMMON:
        text = text.replace(old, new)
    hook = HOOK.get(fam)
    if hook:
        text = re.sub('o' + BETWEEN + hook, r'd\1', text)
    if hook == 'G':
        text = re.sub('i' + BETWEEN + 'G', r'Q\1', text)
    out = kruti(text)
    # ¤ / £ = short-i plus reph around the following consonant cluster (संद¤शका → संदर्शिका).
    out = re.sub('[¤£]([क-ह]़?(?:्[क-ह]़?)*)', r'र्\1ि', out)
    out = re.sub('([ंँ])\\1+', r'\1', out)
    return out.replace(PERCENT, '%')
