"""Structural audit of parsed guides: python3 audit_guides.py guides.json"""
import json, sys, collections
g = json.load(open(sys.argv[1]))
for doc, days in g.items():
    issues, ex = collections.Counter(), {}
    for d in days:
        k = (d['week'], d['day'])
        def flag(n, info=''):
            issues[n] += 1
            ex.setdefault(n, (k, info))
        if [p['period'] for p in d['periods']] != [1, 2, 3]: flag('periods != 1,2,3', [p['period'] for p in d['periods']])
        for p in d['periods']:
            if not p['steps']: flag('period without steps', p['period'])
            if not p['objective']: flag('no objective', p['period'])
            if not p['materials']: flag('no materials', p['period'])
            for s in p['steps']:
                if not s['actions'] and not s['questions']: flag('empty step', s['num'])
                if not s['minutes']: flag('step without minutes', s['num'])
                if not s['num'].startswith(str(p['period']) + '.'): flag('step/period mismatch', s['num'])
                for t in s['actions'] + s['questions'] + [s['title'], p['objective'], p['materials'], p['prep']]:
                    if any(c in t for c in 'ळ¤£fZ'): flag('suspicious char', t[:50])
    print(f"{doc}: {len(days)} days, {sum(len(p['steps']) for d in days for p in d['periods'])} steps")
    for n, c in issues.most_common(): print(f'   {n}: {c}  e.g. {ex[n]}')
