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


# Zero-width marks in visual-order Kruti text, in the order they are typed after a base glyph.
MARK_RANK = {'s': 0, 'S': 0, 'q': 0, 'w': 0, '`': 0, 'a': 1, '¡': 1, '¢': 1, 'Z': 2, '±': 2}


def ordered_text(chars):
    """Rebuild a span from (char, origin_x, width) glyphs.

    Some PDF lines emit zero-width vowel signs after the following letter, at that letter's
    origin, with stray space glyphs between them ("ckMs Z" for cksMZ = बोर्ड). For such spans,
    sort by origin with marks before a letter at the same origin, and derive spaces from real
    gaps between letters. Correctly ordered spans are returned unchanged."""
    text = ''.join(c for c, _, _ in chars)
    base = [(c, x, w) for c, x, w in chars if c != ' ']
    scrambled = any(w < 0.3 and i and x <= base[i - 1][1] + 0.5 and base[i - 1][2] >= 0.3
                    for i, (c, x, w) in enumerate(base))
    if not scrambled:
        return text
    lead = ' ' if text[:1] == ' ' else ''
    letters = sorted((x, x + w) for c, x, w in base if w >= 0.3)

    def key(g):
        c, x, w = g
        if w >= 0.3:
            return (x, 1, 0)
        # A mark is emitted at the origin of the letter that follows it in typing order;
        # at a word end it sits at the end of the previous letter.
        start = next((s for s, _ in letters if abs(s - x) <= 0.35), None)
        if start is None:
            start = max((e for s, e in letters if s < x - 0.35), default=x)
        return (start, 0, MARK_RANK.get(c, 0))
    glyphs = sorted(base, key=key)
    out, end = [], None
    for c, x, w in glyphs:
        if w >= 0.3:
            if end is not None and x - end > 2.5:
                out.append(' ')
            end = x + w
        out.append(c)
    return lead + ''.join(out) + (' ' if text.endswith(' ') else '')


def decode(text, font):
    fam = family(font)
    if fam is None:
        return text.replace('\xa0', ' ')
    if fam == 'Chanakya':
        text = text.replace('\x01', ' ')
    for old, new in COMMON:
        text = text.replace(old, new)
    # Real parentheses are ¼ ½ in these fonts; a raw ')' is the conjunct द्ध (le`) = समृद्ध).
    # The shared Kruti mapping keeps ')' for the Math guides, so convert it here.
    text = text.replace(')', 'द्ध')
    hook = HOOK.get(fam)
    if hook:
        text = re.sub('o' + BETWEEN + hook, r'd\1', text)
    if hook == 'G':
        text = re.sub('i' + BETWEEN + 'G', r'Q\1', text)
    out = kruti(text)
    # ¤ / £ = short-i plus reph around the following consonant cluster (संद¤शका → संदर्शिका).
    out = re.sub('[¤£]([क-ह]़?(?:्[क-ह]़?)*)', r'र्\1ि', out)
    out = re.sub('([ंँ])\\1+', r'\1', out)
    # A quoted or listed bare ि-sign ("मात्रा ‘ f ’") names the vowel sign itself.
    out = re.sub(r"(^|[\s‘’'(,])f(?=\s*(?:[’‘'),]|$))", r'\1ि', out)
    return out.replace(PERCENT, '%')
