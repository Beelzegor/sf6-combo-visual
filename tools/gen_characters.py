import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'data' / 'characters'
KEEP = {'juri', 'ken', 'guile'}
SOURCE = 'https://github.com/D4RKONION/FAT'

ROSTER = {
    'A.K.I.': ('aki', 'A.K.I.', '#9b4dca'),
    'Akuma': ('akuma', 'Akuma', '#b3122e'),
    'Alex': ('alex', 'Alex', '#3f7fbf'),
    'Arjun': ('arjun', 'Arjun', '#d98c1f'),
    'Blanka': ('blanka', 'Blanka', '#5fbf3f'),
    'C.Viper': ('cviper', 'C. Viper', '#d4304a'),
    'Cammy': ('cammy', 'Cammy', '#2f9e5a'),
    'Chun-Li': ('chunli', 'Chun-Li', '#2f6fe0'),
    'Dee Jay': ('deejay', 'Dee Jay', '#e0b62f'),
    'Dhalsim': ('dhalsim', 'Dhalsim', '#e07a2f'),
    'E.Honda': ('ehonda', 'E. Honda', '#3a5fd0'),
    'Ed': ('ed', 'Ed', '#6a7fa8'),
    'Elena': ('elena', 'Elena', '#e3d8a0'),
    'Ingrid': ('ingrid', 'Ingrid', '#f2a3c7'),
    'Jamie': ('jamie', 'Jamie', '#3fc1b0'),
    'JP': ('jp', 'JP', '#7a4fb3'),
    'Kimberly': ('kimberly', 'Kimberly', '#ff7a3a'),
    'Lily': ('lily', 'Lily', '#4fb0e0'),
    'Luke': ('luke', 'Luke', '#5a8f3a'),
    'M.Bison': ('mbison', 'M. Bison', '#a0203a'),
    'Mai': ('mai', 'Mai', '#e02f4a'),
    'Manon': ('manon', 'Manon', '#e3b4d0'),
    'Marisa': ('marisa', 'Marisa', '#c9a23a'),
    'Rashid': ('rashid', 'Rashid', '#2fb3a0'),
    'Ryu': ('ryu', 'Ryu', '#f0f0f0'),
    'Sagat': ('sagat', 'Sagat', '#a05a2f'),
    'Terry': ('terry', 'Terry', '#e03a2f'),
    'Yasmine': ('yasmine', 'Yasmine', '#3fa0e0'),
    'Zangief': ('zangief', 'Zangief', '#c0302f'),
    'Juri': ('juri', 'Juri', '#c13cff'),
    'Ken': ('ken', 'Ken', '#ff4b3a'),
    'Guile': ('guile', 'Guile', '#3f9b4a'),
}

BTN = ['LP', 'MP', 'HP', 'LK', 'MK', 'HK']
BTN_RE = r'(?:LP|MP|HP|LK|MK|HK|PPP|KKK|PP|KK|P|K)'
SUPPORTED = {'236', '214', '623', '22', '236236', '214214', '[4]6', '[2]8', '[4]646', '63214', '4268', '42684268', '214236'}
RANK = {'42684268': 0, '4268': 1, '214236': 2, '236236': 2, '214214': 2, '[4]646': 2, '63214': 3, '623': 4, '[4]6': 5, '[2]8': 5, '236': 6, '214': 6, '22': 7}
VARIANT_TAGS = {'bad', 'good', 'great', 'hold', 'lvl 2', 'lvl 3', 'ca', 'bomb', 'counter', 'enhanced', 'hold lvl 2', 'hold lvl 3'}
DIR_SPREAD = {'1': [1], '2': [1, 2, 3], '3': [3], '4': [4], '6': [6], '7': [7], '8': [8], '9': [9]}
STAGE_RE = re.compile(r'\s*(?:\(?\d+(?:st|nd|rd|th)?\)?|\d+(?:st|nd|rd|th)|1st|2nd|3rd|4th|Finisher)$')
PREFIX_RE = re.compile(r'^(?:LP|MP|HP|LK|MK|HK|OD|L|M|H)\s+')


def ints(v):
    return [int(x) for x in re.findall(r'\d+', str(v))] if v is not None else []


def lead(v):
    if v is None:
        return None
    s = str(v).split('(')[0]
    n = [int(x) for x in re.findall(r'\d+', s)]
    return sum(n) if n else None


def span(v):
    n = ints(v)
    return sum(n) if n else None


def hits(v):
    if v is None:
        return 1
    s = str(v).split('/')[0]
    count = 0
    for part in s.split('*'):
        part = part.split('(')[0]
        m = re.match(r'\s*\d+\s*x\s*(\d+)', part)
        if m:
            count += int(m.group(1))
        elif re.search(r'\d', part):
            count += 1
    return max(1, min(count, 5))


def codes(xx, extra=''):
    xx = xx if isinstance(xx, list) else []
    out = ''
    if 'ch' in xx:
        out += 'c'
    if 'sp' in xx:
        out += 's'
    if any(str(x).startswith('su') for x in xx):
        out += 'S'
    if 'tc' in xx or 't' in extra:
        out += 't'
    return out


def frame(m, air=False, extra=''):
    s = lead(m.get('startup'))
    if s is None:
        return None
    a = span(m.get('active')) or 3
    t = 0 if air else lead(m.get('total'))
    if not air and t is None:
        r = span(m.get('recovery'))
        t = s + a + (r if r is not None else 20) - 1
    row = [s, a, t, codes(m.get('xx'), extra)]
    h = hits(m.get('hitstop'))
    if h > 1:
        row.append(h)
    return row


def strip_tags(cmd):
    tags = [t.strip().lower() for t in re.findall(r'\(([^)]*)\)', cmd)]
    return re.sub(r'\s*\([^)]*\)', '', cmd).strip(), tags


def parse_input(text):
    text = text.split(' / ')[0].strip()
    pieces = [p.strip() for p in text.split(' or ')]
    parsed = []
    for p in pieces:
        m = re.fullmatch(r'(\d*)((?:' + BTN_RE + r')+(?:/(?:' + BTN_RE + r')+)*)?', p.replace(' ', ''))
        if not m:
            return None
        parsed.append((m.group(1), m.group(2) or ''))
    digits = [d for d, _ in parsed if d]
    btns = []
    for _, b in parsed:
        for alt in b.split('/'):
            if alt and alt not in btns:
                btns.append(alt)
    if not btns:
        return None
    if len(digits) <= 1:
        return {'motion': digits[0] if digits else '', 'dirs': None, 'btns': btns}
    if all(len(d) == 1 for d in digits):
        return {'motion': None, 'dirs': digits, 'btns': btns}
    return {'motion': digits[0], 'dirs': None, 'btns': btns}


def split_btns(b):
    return re.findall(r'LP|MP|HP|LK|MK|HK', b)


def motion_of(raw, m):
    cd = m.get('chargeDirection')
    if raw == '46' or (raw == '6' and cd == 'B'):
        return '[4]6'
    if raw == '28' or (raw == '8' and cd == 'D'):
        return '[2]8'
    if raw == '4646':
        return '[4]646'
    if raw == '624':
        return '63214'
    return raw


def base_name(name):
    n = re.sub(r'\s*\([^)]*\)', '', name).strip()
    n = n.split(' > ')[-1].strip()
    return PREFIX_RE.sub('', n).strip()


def js(v):
    return json.dumps(v, ensure_ascii=False)


def build(char, data):
    moves = data['moves']['normal']
    fd = {}
    command = []
    normal_rows = {}
    jump_angled = set()
    tc_entries = []
    specials_raw = []
    followups_raw = []
    pairs = []
    sa_order = []

    for name, m in moves.items():
        cmd = m.get('numCmd') or ''
        mt = m.get('moveType')
        if mt == 'normal':
            if ' > ' in cmd:
                parts = [p.strip() for p in cmd.split(' > ')]
                parts = parts[:1] + [p[1:] if re.fullmatch(r'5(LP|MP|HP|LK|MK|HK)', p) else p for p in parts[1:]]
                ok = re.fullmatch(r'[1-9](LP|MP|HP|LK|MK|HK)', parts[0]) and all(re.fullmatch(r'[1-9]?(LP|MP|HP|LK|MK|HK)', p) for p in parts[1:])
                if ok:
                    tc_entries.append((tuple(parts), name, m))
                continue
            base, tags = strip_tags(cmd)
            if tags:
                continue
            mm = re.fullmatch(r'([1-9])(LP|MP|HP|LK|MK|HK)', base)
            angled = re.fullmatch(r'7 or 9(LP|MP|HP|LK|MK|HK)', base)
            if angled:
                key = 'j.' + angled.group(1)
                row = frame(m, air=True)
                if row:
                    fd[key] = row
                    jump_angled.add(key)
                continue
            if not mm:
                continue
            d, b = mm.group(1), mm.group(2)
            if d == '8':
                key = 'j.' + b
                if key not in jump_angled:
                    row = frame(m, air=True)
                    if row and key not in fd:
                        fd[key] = row
                continue
            if m.get('airmove'):
                continue
            row = frame(m)
            if not row:
                continue
            if d in ('2', '5'):
                fd.setdefault(d + b, row)
            elif d + b not in fd:
                fd[d + b] = row
                command.append({'d': int(d), 'b': b, 'name': STAGE_RE.sub('', name).strip() or name})
            normal_rows[d + b] = row
        elif mt in ('special', 'super', 'command-grab', 'movement-special'):
            base, tags = strip_tags(cmd)
            air = 'air' in tags or bool(m.get('airmove'))
            other = [t for t in tags if t != 'air']
            if any(t not in VARIANT_TAGS for t in other):
                continue
            variant = bool(other)
            if ' > ' in base and mt == 'super':
                base = base.split(' > ')[0].strip()
                name = re.sub(r'^(Lowkey|Marvelous|Headliner)\s+', '', name)
            elif ' > ' in base:
                followups_raw.append((base, name, m, variant, air))
                continue
            pi = parse_input(base)
            if not pi:
                continue
            if mt == 'super' and not variant and 'critical art' not in name.lower():
                sa_order.append(name)
            specials_raw.append((pi, name, m, air, variant, mt))

    groups = {}
    pair_list = []
    for pi, name, m, air, variant, mt in sorted(specials_raw, key=lambda r: r[4]):
        if pi['motion'] is None or (pi['motion'] in ('', '5') or len(pi['motion']) == 1) and all(len(b) >= 2 and set(b) <= {'P', 'K'} for b in pi['btns']):
            if pi['motion'] is not None and len(pi['motion']) == 1 and pi['motion'] not in ('5',) and pi['dirs'] is None:
                dirs = [pi['motion']]
            else:
                dirs = pi['dirs'] if pi['dirs'] else None
            for b in pi['btns']:
                if not (len(b) >= 2 and set(b) <= {'P', 'K'} and len(set(b)) == 1):
                    continue
                spread = None
                if dirs and not air:
                    spread = sorted({x for d in dirs if d != '5' for x in DIR_SPREAD.get(d, [int(d)])}) or None
                key = (b[0], len(b), tuple(spread or ()), air)
                if any(p['key'] == key for p in pair_list):
                    continue
                pname = re.sub(r'\s*\([^)]*\)', '', name).strip()
                if pname.startswith('OD '):
                    pname = pname[3:] + ' OD'
                entry = {'key': key, 'type': b[0], 'n': len(b), 'name': pname, 'kind': 'special'}
                if spread:
                    entry['d'] = spread
                if air:
                    entry['air'] = True
                pair_list.append(entry)
                row = frame(m)
                if row:
                    fd.setdefault(pname, row)
            continue
        motion = motion_of(pi['motion'], m)
        if motion not in SUPPORTED:
            continue
        kind = 'super' if mt == 'super' else 'special'
        od = name.startswith('OD ') or any(b in ('PP', 'KK') for b in pi['btns'])
        bname = base_name(name)
        gkey = (bname, motion, air, kind, od)
        g = groups.setdefault(gkey, {'btns': [], 'rows': {}, 'name': name, 'm': m, 'variant': variant, 'order': len(groups)})
        for b in pi['btns']:
            if b not in g['btns']:
                g['btns'].append(b)
            if b not in g['rows'] or (g['variant'] and not variant):
                row = frame(m)
                if row:
                    g['rows'][b] = row
                    g['m_' + b] = m

    sa_tag = {}
    for gk, g in groups.items():
        if gk[3] != 'super':
            continue
        ez = (g['m'].get('ezCmd') or '').split(' / ')[0]
        ez = re.sub(r'\s*\([^)]*\)', '', ez).strip()
        first = ez.split(' or ')[0].strip()
        tag = {'SP+H': 'SA1', 'f+SP+H': 'SA1', 'b+SP+H': 'SA2', 'd+SP+H': 'SA3'}.get(first)
        if tag:
            sa_tag[gk] = tag
    used = set(sa_tag.values())
    for gk, g in sorted(groups.items(), key=lambda kv: kv[1]['order']):
        if gk[3] == 'super' and gk not in sa_tag:
            for t in ('SA1', 'SA2', 'SA3'):
                if t not in used:
                    sa_tag[gk] = t
                    used.add(t)
                    break

    specials = []
    for gk, g in groups.items():
        bname, motion, air, kind, od = gk
        name = bname + (' OD' if od else '')
        btns = g['btns']
        entry = {'name': name, 'm': motion}
        if kind == 'super':
            if gk not in sa_tag:
                continue
            entry['tag'] = sa_tag[gk]
        singles = [b for b in btns if b in BTN]
        generic = [b for b in btns if b in ('P', 'K')]
        doubles = [b for b in btns if b in ('PP', 'KK')]
        multi = [b for b in btns if b not in BTN and b not in ('P', 'K', 'PP', 'KK', 'PPP', 'KKK')]
        if doubles:
            entry.update({'type': doubles[0][0], 'min': 2, 'max': 2})
        elif multi:
            entry['exact'] = split_btns(multi[0])
        elif generic:
            entry.update({'type': generic[0], 'min': 1, 'max': 2 if kind == 'super' else 1})
        elif len(singles) >= 2 and len({b[1] for b in singles}) == 1:
            entry.update({'type': singles[0][1], 'strength': True})
        elif len(singles) == 1:
            entry['exact'] = singles
        elif len(singles) >= 2:
            for b in singles:
                specials.append(dict({'name': name + ' (' + b + ')', 'm': motion, 'exact': [b], 'kind': kind}, **({'air': True} if air else {}), **({'tag': entry['tag']} if 'tag' in entry else {})))
                row = g['rows'].get(b)
                if row:
                    fd[name + ' (' + b + ')'] = row
            continue
        else:
            continue
        if air:
            entry['air'] = True
        entry['kind'] = kind
        specials.append(entry)
        if entry.get('strength'):
            for b in singles:
                row = g['rows'].get(b)
                if row:
                    fd[name + ' (' + {'L': 'ligero', 'M': 'medio', 'H': 'fuerte'}[b[0]] + ')'] = row
        else:
            row = next(iter(g['rows'].values()), None)
            if row:
                fd[name] = row

    def sort_key(e):
        return (e['kind'] != 'super', not e.get('air'), RANK.get(e['m'], 9), not ('min' in e and e['min'] >= 2), 'exact' not in e)
    specials.sort(key=sort_key)
    combos = [[b] for b in BTN] + [[a, b] for i, a in enumerate(BTN) for b in BTN[i + 1:]]
    def fits(e, bs):
        if 'exact' in e:
            return sorted(e['exact']) == sorted(bs)
        if not all(b[1] == e['type'] for b in bs):
            return False
        return e.get('min', 1) <= len(bs) <= e.get('max', 1)
    kept = []
    for e in specials:
        mine = [bs for bs in combos if fits(e, bs)]
        same = [k for k in kept if k['m'] == e['m'] and bool(k.get('air')) == bool(e.get('air'))]
        if mine and all(any(fits(k, bs) for k in same) for bs in mine):
            continue
        kept.append(e)
    specials = kept

    followups = []
    seen_fu = set()
    for base, name, m, variant, fair in sorted(followups_raw, key=lambda r: (r[3], r[1].startswith('OD '))):
        parts = [p.strip() for p in base.split(' > ')]
        if len(parts) != 2:
            continue
        first = parse_input(parts[0])
        if not first:
            continue
        parent = None
        if first['motion'] is not None and len(first['motion']) >= 2:
            mo = motion_of(first['motion'], m)
            b0 = first['btns'][0]
            for e in specials:
                if e['m'] != mo or e['kind'] != 'special' or bool(e.get('air')) != fair:
                    continue
                if b0 in ('PP', 'KK'):
                    if e.get('min') == 2 and e.get('type') == b0[0]:
                        parent = e['name']
                        break
                elif e.get('min', 1) == 1 and (e.get('type') == b0[-1] or (e.get('exact') and e['exact'][0] == b0) or (b0 in BTN and e.get('type') == b0[1])):
                    parent = e['name']
                    break
        else:
            for p in pair_list:
                if len(first['btns'][0]) == p['n'] and first['btns'][0][0] == p['type']:
                    parent = p['name']
                    break
        if not parent:
            continue
        sec = re.fullmatch(r'([1-9]?)(LP|MP|HP|LK|MK|HK|P|K)', parts[1].replace(' ', ''))
        if not sec:
            continue
        root_parent = parent[:-3] if parent.endswith(' OD') else parent
        fu = {'after': root_parent}
        if sec.group(2) in BTN:
            fu['btn'] = sec.group(2)
        else:
            fu['type'] = sec.group(2)
        if sec.group(1):
            fu['d'] = int(sec.group(1))
        key = (fu['after'], fu.get('btn'), fu.get('type'), fu.get('d'))
        if key in seen_fu:
            continue
        seen_fu.add(key)
        fname = base_name(name)
        fu['name'] = fname
        prow = fd.get(parent) or fd.get(parent + ' (fuerte)') or fd.get(parent + ' (medio)') or fd.get(parent + ' (ligero)') or [10]
        fu['win'] = max(45, prow[0] + 25)
        if fair:
            fu['air'] = True
        followups.append(fu)
        row = frame(m)
        if row:
            fd.setdefault(fname, row)

    chains = {}
    for parts, name, m in tc_entries:
        chains[parts] = (name, m)
    maximal = [c for c in chains if not any(o != c and o[:len(c)] == c for o in chains)]
    tcs = []
    names_used = set()
    for c in sorted(maximal, key=lambda c: (c[0], len(c))):
        name = STAGE_RE.sub('', chains[c][0]).strip() or 'Target combo'
        if name in names_used:
            name = name + ' (' + ' > '.join(c) + ')'
        names_used.add(name)
        is_air = c[0][0] == '8'
        first_n = ('j.' + c[0][1:]) if is_air else c[0]
        seq = [{'n': first_n}]
        for p in c[1:]:
            mm = re.fullmatch(r'([1-9]?)(LP|MP|HP|LK|MK|HK)', p)
            d, b = mm.group(1), mm.group(2)
            step = {'b': b}
            if is_air:
                step.update({'air': True, 'n': 'j.' + b})
            elif d:
                step['d'] = DIR_SPREAD['2'] if d == '2' else [int(d)]
                step['n'] = d + b
            else:
                step['d'] = [4, 5, 6]
                step['n'] = '5' + b
            seq.append(step)
        tcs.append({'name': name, 'seq': seq})
        base_row = list(fd.get(first_n) or normal_rows.get(c[0]) or [6, 3, 25, ''])
        if 't' not in base_row[3]:
            base_row[3] += 't'
        if first_n not in fd:
            fd[first_n] = list(base_row)
        if 't' not in fd[first_n][3]:
            fd[first_n] = fd[first_n][:3] + [fd[first_n][3] + 't'] + fd[first_n][4:]
        fd['TC:' + name + ':0'] = base_row
        for i in range(1, len(c)):
            src = chains.get(c[:i + 1])
            row = frame(src[1], air=is_air, extra='t' if i < len(c) - 1 else '') if src else None
            if row is None:
                row = list(fd.get(seq[i]['n']) or [10, 3, 0 if is_air else 35, ''])
            fd['TC:' + name + ':' + str(i)] = row

    sp_map = {}
    air_sp = None
    for gk, g in groups.items():
        bname, motion, air, kind, od = gk
        if kind != 'special' or od:
            continue
        target = next((e['name'] for e in specials if e['name'] == bname and e['kind'] == 'special'), None)
        if not target:
            continue
        for b in g['btns']:
            mm = g.get('m_' + b) or g['m']
            ez = (mm.get('ezCmd') or '').split(' / ')[0]
            ez = re.sub(r'\s*\([^)]*\)', '', ez).strip()
            for tok in [t.strip() for t in ez.split(' or ')]:
                grp = {'SP': 'N', 'f+SP': 'F', 'b+SP': 'B', 'd+SP': 'D'}.get(tok)
                if not grp:
                    continue
                if air:
                    air_sp = air_sp or target
                else:
                    sp_map.setdefault(grp, target)

    followups.sort(key=lambda f: ('d' not in f, 'btn' not in f))
    pairs = [{k: v for k, v in p.items() if k != 'key'} for p in pair_list]
    pairs.sort(key=lambda p: ('d' not in p, p.get('air', False)))
    modern = {'verified': False, 'sp': sp_map}
    jm = re.search(r'\((\d+)\+(\d+)\+\d+\)', str(data.get('stats', {}).get('fJump', '')))
    jump = [int(jm.group(1)), int(jm.group(2))] if jm else None
    if air_sp:
        modern['air'] = air_sp
    return command, tcs, specials, followups, pairs, fd, modern, jump


def emit(cid, name, color, parts):
    command, tcs, specials, followups, pairs, fd, modern, jump = parts
    lines = ['SF6.registerCharacter({', '  id: ' + js(cid) + ',', '  name: ' + js(name) + ',', '  color: ' + js(color) + ',', '  sources: [' + js(SOURCE) + '],', '  generated: true,']
    if jump:
        lines.append('  jump: ' + js(jump) + ',')
    lines.append('  classic: {')
    def block(label, items, last=False):
        if not items:
            lines.append('    ' + label + ': []' + ('' if last else ','))
            return
        lines.append('    ' + label + ': [')
        for i, it in enumerate(items):
            lines.append('      ' + js(it) + (',' if i < len(items) - 1 else ''))
        lines.append('    ]' + ('' if last else ','))
    block('command', command)
    block('tc', tcs)
    block('specials', specials)
    block('followups', followups)
    block('pairs', pairs)
    lines.append('    fd: {')
    keys = list(fd.keys())
    for i, k in enumerate(keys):
        lines.append('      ' + js(k) + ': ' + js(fd[k]) + (',' if i < len(keys) - 1 else ''))
    lines.append('    }')
    lines.append('  },')
    lines.append('  modern: ' + js(modern))
    lines.append('});')
    return '\n'.join(lines) + '\n'


def update_html(ids):
    for page in ('index.html', 'overlay.html'):
        p = ROOT / page
        s = p.read_text(encoding='utf-8')
        tags = re.findall(r'[ \t]*<script src="data/characters/[^"]+"></script>\n', s)
        if not tags:
            continue
        indent = re.match(r'[ \t]*', tags[0]).group(0)
        block = ''.join(indent + '<script src="data/characters/' + i + '.js"></script>\n' for i in ids)
        first = s.index(tags[0])
        for t in tags:
            s = s.replace(t, '', 1)
        s = s[:first] + block + s[first:]
        p.write_text(s, encoding='utf-8')


def main():
    src = Path(sys.argv[1])
    data = json.loads(src.read_text(encoding='utf-8'))
    ids = []
    report = []
    for key in sorted(data, key=lambda k: ROSTER.get(k, (k.lower(),))[0]):
        if key not in ROSTER:
            report.append('sin mapear: ' + key)
            continue
        cid, name, color = ROSTER[key]
        ids.append(cid)
        if cid in KEEP:
            continue
        parts = build(key, data[key])
        (OUT / (cid + '.js')).write_text(emit(cid, name, color, parts), encoding='utf-8')
        report.append(cid + ': ' + str(len(parts[2])) + ' especiales, ' + str(len(parts[1])) + ' TC, ' + str(len(parts[0])) + ' comandos, ' + str(len(parts[3])) + ' follow-ups, ' + str(len(parts[4])) + ' pares, moderno ' + ','.join(sorted(parts[6]['sp'])))
    update_html(sorted(ids, key=lambda i: next(v[1] for v in ROSTER.values() if v[0] == i).lower()))
    print('\n'.join(report))


if __name__ == '__main__':
    main()
