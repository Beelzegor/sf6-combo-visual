(function (root) {
  const CLASSIC_BTNS = ['LP', 'MP', 'HP', 'LK', 'MK', 'HK'];
  const MODERN_BTNS = ['L', 'M', 'H', 'SP', 'AUTO'];
  const BIT = { LP: 1, MP: 2, HP: 4, LK: 8, MK: 16, HK: 32 };
  const MBIT = { L: 1, M: 2, H: 4, SP: 8, AUTO: 16, DI: 32, DP: 64, TH: 128 };
  const MIRROR = { 1: 3, 2: 2, 3: 1, 4: 6, 5: 5, 6: 4, 7: 9, 8: 8, 9: 7 };
  const UP = new Set([7, 8, 9]);
  const CROUCH = new Set([1, 2, 3]);
  const STR = { L: 'ligero', M: 'medio', H: 'fuerte' };

  const MOTIONS = {
    '236': { seqs: [[2, 3, 6], { s: [2, 6], gap: 2 }], win: 20 },
    '214': { seqs: [[2, 1, 4], { s: [2, 4], gap: 2 }], win: 20 },
    '623': { seqs: [[6, 2, 3], [3, 2, 3], [6, 2, 3, 6]], win: 22 },
    '22': { seqs: [[2, 5, 2], [2, 1, 2], [2, 3, 2]], win: 18 },
    '236236': { seqs: [[2, 3, 6, 2, 3, 6], { s: [2, 6, 2, 6], gap: 4 }, { s: [2, 3, 6, 2, 6], gap: 4 }, { s: [2, 6, 2, 3, 6], gap: 4 }, { s: [2, 3, 5, 2, 3, 6], gap: 6 }], win: 60, gap: 12, hold: 18 },
    '214214': { seqs: [[2, 1, 4, 2, 1, 4], { s: [2, 4, 2, 4], gap: 4 }, { s: [2, 1, 4, 2, 4], gap: 4 }, { s: [2, 4, 2, 1, 4], gap: 4 }, { s: [2, 1, 5, 2, 1, 4], gap: 6 }], win: 60, gap: 12, hold: 18 },
    '[4]6': { charge: [1, 4, 7], len: 40, seqs: [[[6, 3, 9]]], win: 12 },
    '[2]8': { charge: [1, 2, 3], len: 40, seqs: [[[7, 8, 9]]], win: 12 },
    '[4]646': { charge: [1, 4, 7], len: 40, seqs: [[[6, 3, 9], [4, 1, 7], [6, 3, 9]]], win: 36 },
    '63214': { seqs: [[6, 3, 2, 1, 4], [6, 2, 1, 4], [6, 3, 2, 4], { s: [6, 2, 4], gap: 4 }], win: 30 },
    '214236': { seqs: [[2, 1, 4, 2, 3, 6], { s: [2, 4, 2, 6], gap: 4 }, { s: [2, 1, 4, 2, 6], gap: 4 }, { s: [2, 4, 2, 3, 6], gap: 4 }], win: 60, gap: 12, hold: 18 },
    '4268': { circle: 1, win: 40 },
    '42684268': { circle: 2, win: 80 }
  };
  const CIRCLE_GROUPS = { 1: 'DL', 2: 'D', 3: 'DR', 4: 'L', 6: 'R', 7: 'UL', 8: 'U', 9: 'UR' };
  const LAST_TOL = 6;
  const STEP_GAP = 8;
  const MAX_HOLD = 10;
  const CLUSTER = 2;
  const PLINK = 3;
  const JUMP_PRE_DEF = 4;
  const JUMP_LEN_DEF = 38;
  const BUFFER = 4;
  const HITSTOP = { L: 9, M: 11, H: 13 };
  const LINK_SLACK = 2;

  const chars = {};
  function registerCharacter(c) { chars[c.id] = c; }

  const has = (step, d) => Array.isArray(step) ? step.includes(d) : step === d;

  function sameSet(a, b) { return a.length === b.length && a.every(x => b.includes(x)); }
  function sortBtns(btns, order) { return [...btns].sort((a, b) => order.indexOf(a) - order.indexOf(b)); }
  function buttonsFit(sp, btns) {
    if (sp.exact) return sameSet(sp.exact, btns);
    if (!btns.every(b => b[1] === sp.type)) return false;
    return btns.length >= (sp.min || 1) && btns.length <= (sp.max || 1);
  }
  function strengthName(sp, btns) {
    if (!sp.strength || btns.length !== 1) return sp.name;
    return sp.name + ' (' + STR[btns[0][0]] + ')';
  }
  function normalName(prefix, d, b) {
    const modern = b.length === 1;
    const fem = !modern && b[1] === 'K';
    const lvl = b[0];
    const strength = (fem ? { L: 'ligera', M: 'media', H: 'fuerte' } : { L: 'ligero', M: 'medio', H: 'fuerte' })[lvl];
    const kind = modern ? 'Ataque' : fem ? 'Patada' : 'Puño';
    if (prefix === 'j.') return kind + ' ' + strength + ' en salto';
    if (CROUCH.has(d)) return kind + ' ' + strength + (fem ? ' agachada' : ' agachado');
    return kind + ' ' + strength + ' de pie';
  }

  function relativeDirs(frames, side, flips) {
    const fl = [...(flips || [])].sort((a, b) => a - b);
    const out = new Array(frames.length);
    let p2 = side === 'P2', k = 0;
    for (let f = 0; f < frames.length; f++) {
      while (k < fl.length && fl[k] <= f) { p2 = !p2; k++; }
      out[f] = p2 ? MIRROR[frames[f][0]] : frames[f][0];
    }
    return out;
  }
  function toRuns(dirs) {
    const runs = [];
    for (let f = 0; f < dirs.length; f++) {
      const l = runs[runs.length - 1];
      if (l && l.d === dirs[f]) l.end = f; else runs.push({ d: dirs[f], start: f, end: f });
    }
    return runs;
  }
  function matchSeq(runs, seq, press, win, minEnd, gap, hold) {
    gap = gap === undefined ? STEP_GAP : gap;
    hold = hold || MAX_HOLD;
    let i = runs.length - 1;
    while (i >= 0 && runs[i].start > press) i--;
    let k = seq.length - 1, found = -1;
    for (let j = i; j >= 0 && runs[j].end >= press - LAST_TOL; j--) if (has(seq[k], runs[j].d)) { found = j; break; }
    if (found < 0) return null;
    let j = found - 1, first = found;
    k--;
    for (; k >= 0; k--) {
      while (j >= 0 && !has(seq[k], runs[j].d)) { if (runs[j].end < press - win) return null; j--; }
      if (j < 0 || runs[j].end < press - win) return null;
      if (runs[first].start - runs[j].end - 1 > gap) return null;
      if (first !== found && runs[first].end - runs[first].start + 1 > hold) return null;
      first = j; j--;
    }
    if (runs[first].end <= minEnd) return null;
    return { start: runs[first].start, idx: first };
  }
  function chargeOk(runs, idx, spec) {
    let k = idx - 1, total = 0;
    while (k >= 0 && runs[k].end >= runs[idx].start - 12 && !spec.charge.includes(runs[k].d)) {
      if (runs[k].end - runs[k].start + 1 > 10) return false;
      k--;
    }
    while (k >= 0 && spec.charge.includes(runs[k].d)) { total += runs[k].end - runs[k].start + 1; k--; }
    return total >= spec.len;
  }
  function matchCircle(runs, press, spec, minEnd) {
    let i = runs.length - 1;
    while (i >= 0 && runs[i].start > press) i--;
    const order = [];
    let first = -1, dirs = new Set();
    for (let j = i; j >= 0; j--) {
      const r = runs[j];
      if (r.end < press - spec.win || r.end <= minEnd) break;
      if (r.d === 5) { if (j !== i && r.end - r.start + 1 > 6) break; continue; }
      if (order.length === 0 && r.end < press - LAST_TOL * 2) return null;
      for (const g of CIRCLE_GROUPS[r.d]) if (order[order.length - 1] !== g) order.push(g);
      dirs.add(r.d); first = j;
    }
    if (first < 0 || dirs.size < 4) return null;
    const need = spec.circle === 2 ? 7 : 4;
    if (new Set(order).size < 4 || order.length < need) return null;
    return { start: runs[first].start, idx: first };
  }
  function matchMotion(runs, m, press, minEnd) {
    const spec = MOTIONS[m];
    if (!spec) return null;
    if (spec.circle) return matchCircle(runs, press, spec, minEnd);
    for (const sq of spec.seqs) {
      const seq = Array.isArray(sq) ? sq : sq.s;
      const r = matchSeq(runs, seq, press, spec.win, minEnd, Array.isArray(sq) ? spec.gap : sq.gap, spec.hold);
      if (r && (!spec.charge || chargeOk(runs, r.idx, spec))) return r;
    }
    return null;
  }
  function computeAir(dirs, jump) {
    const JUMP_PRE = jump ? jump[0] : JUMP_PRE_DEF, JUMP_LEN = jump ? jump[1] : JUMP_LEN_DEF;
    const air = new Array(dirs.length).fill(0);
    let f = 0;
    while (f < dirs.length) {
      if (UP.has(dirs[f]) && f + 1 < dirs.length && UP.has(dirs[f + 1])) {
        const kind = dirs[Math.min(f + 3, dirs.length - 1)] === 9 ? 2 : 1;
        const a = f + JUMP_PRE, b = Math.min(dirs.length, a + JUMP_LEN);
        for (let g = a; g < b; g++) air[g] = kind;
        f = b; continue;
      }
      f++;
    }
    return air;
  }
  function findDashes(runs, air) {
    const out = [];
    for (let i = 0; i + 2 < runs.length; i++) {
      const a = runs[i], b = runs[i + 1], c = runs[i + 2], prev = runs[i - 1];
      for (const d of [6, 4]) {
        if (a.d !== d || c.d !== d || b.d !== 5) continue;
        if (prev && prev.d === d) continue;
        if (b.end - b.start + 1 > 8) continue;
        if (air[c.start]) continue;
        out.push({ f: c.start, d });
      }
    }
    return out;
  }
  function findPresses(frames, names, bits) {
    const presses = [];
    let prev = 0;
    for (let f = 0; f < frames.length; f++) {
      const m = frames[f][1];
      const rising = m & ~prev;
      if (rising) for (const b of names) if (rising & bits[b]) presses.push({ f, b });
      prev = m;
    }
    return presses;
  }
  function clusterPresses(presses, discarded) {
    const clusters = [], lastPress = {};
    for (const p of presses) {
      if (lastPress[p.b] !== undefined && p.f - lastPress[p.b] <= PLINK) {
        discarded.push({ f: p.f, what: p.b, reason: 'Pulsación repetida (plinking)' });
        lastPress[p.b] = p.f; continue;
      }
      lastPress[p.b] = p.f;
      const c = clusters[clusters.length - 1];
      if (c && p.f - c.f <= CLUSTER && !c.btns.includes(p.b)) { c.btns.push(p.b); c.fEnd = p.f; c.order.push(p); }
      else clusters.push({ f: p.f, fEnd: p.f, btns: [p.b], order: [p] });
    }
    return clusters;
  }
  function dirGroup(d) {
    if (CROUCH.has(d)) return 'D';
    if (d === 4 || d === 7) return 'B';
    if (d === 6 || d === 9) return 'F';
    return 'N';
  }

  function parse(rec, opts) {
    const o = Object.assign({ side: 'P1', flips: [], char: 'juri', scheme: rec.scheme || 'classic', merge: true }, opts || {});
    if (o.timing === undefined) o.timing = o.scheme === 'classic';
    const ch = typeof o.char === 'string' ? chars[o.char] : o.char;
    const cd = ch.classic;
    const modern = o.scheme === 'modern';
    const frames = rec.frames;
    const dirs = relativeDirs(frames, o.side, o.flips);
    const runs = toRuns(dirs);
    const air = computeAir(dirs, ch.jump);
    const JUMP_PRE = ch.jump ? ch.jump[0] : JUMP_PRE_DEF;
    const discarded = [];
    const names = modern ? ['L', 'M', 'H', 'SP', 'AUTO', 'DI', 'DP', 'TH'] : CLASSIC_BTNS;
    const clusters = clusterPresses(findPresses(frames, names, modern ? MBIT : BIT), discarded);
    const dashes = findDashes(runs, air);
    const items = [...clusters.map(c => ({ t: 'press', f: c.f, c })), ...dashes.map(d => ({ t: 'dash', f: d.f, d }))].sort((a, b) => a.f - b.f);
    const events = [];
    let lastSpecialPress = -1, cur = null, airUsedUntil = -1, install = null, airGrace = null;
    const airAt = f => air[f] || (airGrace && f >= airGrace.from && f < airGrace.until ? airGrace.kind : 0);
    const inInstall = f => install && f >= install.from && f < install.until;
    const last = () => events[events.length - 1];
    const spByName = n => cd.specials.find(s => s.name === n);

    function fdOf(ev) {
      const fd = cd.fd || {};
      let r;
      if (ev.tcKey) r = fd[ev.tcKey];
      else if (ev.kind === 'throw') r = [5, 3, 30, ''];
      else if (['normal', 'unique', 'tc'].includes(ev.kind)) r = fd[ev.nota] || fd[ev.base];
      else if (ev.nota === 'DR' || ev.nota === 'PDR' || ev.nota === 'PARRY~66') r = [9, 22, 32, 'n'];
      else if (ev.nota === '66') r = [1, 1, 19, ''];
      else if (ev.nota === '44') r = [1, 1, 23, ''];
      else if (ev.name === 'Drive Parry') r = [1, 30, 20, 'D'];
      else if (ev.name === 'Drive Impact') r = [26, 2, 61, ''];
      else r = fd[ev.name] || fd[ev.base];
      if (!r) return null;
      const btn = (ev.nota.match(/[LMH][PK]?/) || [''])[0];
      const hs = ['normal', 'unique', 'tc'].includes(ev.kind) ? (HITSTOP[btn[0]] || 12) : ['special', 'followup'].includes(ev.kind) ? 12 : 0;
      return { s: r[0], a: r[1], t: r[2], c: r[3], hs: hs * (r[4] || 1) };
    }
    function landing(f) { let g = f; while (g < air.length && air[g]) g++; return g; }
    function allowedCancel(prev, ev) {
      const c = prev.fd.c || '';
      if (c.includes('n') && ['normal', 'unique', 'tc'].includes(ev.kind)) return true;
      if (ev.name === 'Drive Parry' && ['normal', 'unique', 'tc'].includes(prev.ev.kind) && (c.includes('s') || (inInstall(ev.f) && install.rule === 'chain'))) return true;
      if (inInstall(ev.f) && install.rule === 'chain' && ['normal', 'unique', 'tc'].includes(prev.ev.kind)) {
        if (ev.nota === prev.ev.nota) return false;
        if (['normal', 'unique', 'tc', 'special', 'super', 'followup'].includes(ev.kind) || ev.nota === 'DR') return true;
      }
      if (ev.kind === 'tc' && ev.tcStep > 0) return c.includes('t');
      if (ev.kind === 'followup') return true;
      if (ev.kind === 'normal' && /^[25](LP|LK)$/.test(ev.nota)) return c.includes('c');
      if (ev.kind === 'special') return c.includes('s');
      if (ev.kind === 'super') return c.includes('S') || c.includes('s') || prev.ev.kind === 'special';
      if (ev.nota === 'DR') return c.includes('s') && ['normal', 'unique', 'tc'].includes(prev.ev.kind);
      return false;
    }
    function gate(ev) {
      const fd = fdOf(ev);
      const airChain = inInstall(ev.f) && install.rule === 'chain' && cur && cur.ev.nota.startsWith('j.') && cur.ev.nota !== ev.nota;
      if (!o.timing || !fd) {
        if (ev.kind === 'normal' && ev.nota.startsWith('j.') && ev.f < airUsedUntil && !airChain) return { ok: false, reason: 'Solo sale un golpe por salto' };
        return { ok: true, at: ev.f, via: cur && cur.ev && ev.f - cur.at < 30 && ['special', 'super', 'followup'].includes(ev.kind) ? 'cancel' : (ev.kind === 'tc' && ev.tcStep > 0) || ev.nota === 'DR' ? 'cancel' : 'free', fd };
      }
      if (ev.kind === 'normal' && ev.nota.startsWith('j.') && ev.f < airUsedUntil && !airChain) return { ok: false, reason: 'Solo sale un golpe por salto' };
      if (!cur || !cur.fd) return { ok: true, at: ev.f, via: 'free', fd };
      const from = cur.at + cur.fd.s - BUFFER;
      const to = cur.at + cur.fd.s + cur.fd.a + cur.fd.hs + 10;
      const canCancel = ev.f >= from && ev.f <= to && allowedCancel(cur, ev);
      if (canCancel && (cur.fd.c || '').includes('n')) return { ok: true, at: Math.max(ev.f, cur.at + cur.fd.s), via: 'cancel', fd };
      const free = cur.at + cur.fd.t + cur.fd.hs;
      const evBtn = (ev.nota.match(/(LP|MP|HP|LK|MK|HK|L|M|H)$/) || [])[1];
      const slack = (ev.nota === cur.ev.nota || (['special', 'super'].includes(cur.ev.kind) && evBtn && cur.ev.nota.includes(evBtn))) ? 0 : LINK_SLACK;
      if (ev.f >= free - BUFFER - slack && ev.nota !== 'DR') return { ok: true, at: Math.max(ev.f, free - BUFFER - slack), via: 'free', fd };
      if (canCancel) return { ok: true, at: Math.max(ev.f, cur.at + cur.fd.s), via: 'cancel', fd };
      return { ok: false, reason: 'Pulsado durante la animación de ' + (cur.ev.name || cur.ev.nota) };
    }
    function push(ev) { ev.id = 'e' + events.length + '_' + ev.f; events.push(ev); return ev; }
    function accept(ev, g) {
      ev.at = g.at; ev.via = g.via;
      if (g.fd) ev.freeAt = ev.at + g.fd.t + g.fd.hs;
      if (ev.tcPrev) { const p = ev.tcPrev; p.kind = 'tc'; p.tcName = ev.tcName; p.tcStep = 0; p.tcKey = 'TC:' + ev.tcName + ':0'; p.name = ev.tcName + ' (1)'; delete ev.tcPrev; }
      push(ev);
      const fd = g.fd || null;
      if (install && ev.at >= install.from && ev.at < install.until && fd) install.until += fd.hs;
      if (['normal', 'tc'].includes(ev.kind) && ev.nota.startsWith('j.')) {
        const land = landing(ev.f);
        if (fd && fd.hs && air[ev.f]) {
          if (!airGrace || airGrace.from !== land) airGrace = { from: land, until: land, kind: air[ev.f] };
          airGrace.until += fd.hs;
        }
        airUsedUntil = land;
        cur = { ev, at: ev.at, fd: { s: fd ? fd.s : 6, a: fd ? fd.a : 5, t: land + 3 - ev.at, c: fd ? fd.c : '', hs: 0 } };
      } else cur = { ev, at: ev.at, fd };
      const spData = ev.base && spByName(ev.base);
      if (spData && spData.install) install = { from: ev.at, until: ev.at + spData.install.frames + (spData.install.freeze || 0), rule: spData.install.rule, name: spData.name };
      if (ev.kind === 'special' || ev.kind === 'super') {
        lastSpecialPress = ev.f;
        if (ev.air) for (let k = ev.f; k < air.length && air[k]; k++) air[k] = 0;
        else for (let k = ev.f; k < air.length && (air[k] || k < ev.f + JUMP_PRE + 1); k++) air[k] = 0;
      }
    }
    function handle(ev) {
      if (!ev) return;
      const g = gate(ev);
      if (!g.ok) {
        discarded.push({ f: ev.f, what: ev.nota, reason: g.reason });
        if (cur && cur.ev && /animación/.test(g.reason)) { cur.ev.mash = cur.ev.mash || {}; cur.ev.mash[ev.nota] = (cur.ev.mash[ev.nota] || 0) + 1; }
        return;
      }
      accept(ev, g);
    }
    function specialEvent(sp, btns, press, mm, label) {
      return {
        f: press, kind: sp.kind, base: sp.name, air: !!sp.air,
        name: (sp.tag ? sp.tag + ' ' : '') + strengthName(sp, btns),
        nota: label, motionStart: mm ? mm.start : press
      };
    }
    function trySpecials(btns, press) {
      for (const sp of cd.specials) {
        if (!buttonsFit(sp, btns)) continue;
        let inAir = (sp.air ? airAt(press) : air[press]) > 0;
        if (inAir && !sp.air && MOTIONS[sp.m] && MOTIONS[sp.m].circle) {
          let t = press; while (t > 0 && air[t - 1]) t--;
          const mmc = matchMotion(runs, sp.m, press, lastSpecialPress);
          if (mmc && t - JUMP_PRE - 2 >= mmc.start) inAir = false;
        }
        if (!!sp.air !== inAir) continue;
        if (sp.fwd && airAt(press) !== 2) continue;
        const low = sp.air && !air[press];
        if (sp.after) { const p = last(); if (!p || p.base !== sp.after || press - p.f > (sp.win || 40)) continue; }
        if (sp.m === '') {
          if (!sp.after) continue;
          return specialEvent(sp, btns, press, null, (sp.d ? String(sp.d) : '') + sortBtns(btns, CLASSIC_BTNS).join('+'));
        }
        const mm = matchMotion(runs, sp.m, press, lastSpecialPress);
        if (!mm) continue;
        const sb = sortBtns(btns, CLASSIC_BTNS);
        const ev = specialEvent(sp, sb, press, mm, (sp.air ? 'j.' : '') + sp.m + sb.join('+'));
        if (low) ev.low = true;
        return ev;
      }
      return null;
    }
    function tcMatch(b, d, f) {
      const prevEv = last();
      if (!prevEv || !cd.tc) return null;
      const chain = prevEv.tcChain || [prevEv.nota];
      const order = [...cd.tc].sort((x, y) => {
        const dx = x.seq[chain.length] && x.seq[chain.length].d ? x.seq[chain.length].d.length : 9;
        const dy = y.seq[chain.length] && y.seq[chain.length].d ? y.seq[chain.length].d.length : 9;
        return dx - dy;
      });
      for (const tc of order) {
        let step = -1;
        if (prevEv.tcName && tc.seq.length > chain.length && chain.every((n, i) => tc.seq[i].n === n)) step = chain.length - 1;
        else if (!prevEv.tcName && prevEv.nota === tc.seq[0].n) step = 0;
        if (step < 0 || step + 1 >= tc.seq.length) continue;
        const nx = tc.seq[step + 1];
        if (nx.b !== b) continue;
        if (!!nx.air !== air[f] > 0) continue;
        if (!nx.air && nx.d && !nx.d.includes(d)) continue;
        const ev = { f, kind: 'tc', tcName: tc.name, tcStep: step + 1, tcKey: 'TC:' + tc.name + ':' + (step + 1), name: tc.name + ' (' + (step + 2) + ')', nota: nx.n, tcChain: chain.concat(nx.n) };
        if (step === 0 && !prevEv.tcName) ev.tcPrev = prevEv;
        return ev;
      }
      return null;
    }
    function followup(b, d, f) {
      const prevEv = last();
      if (!prevEv) return null;
      for (const fu of cd.followups || []) {
        if (!(prevEv.base || prevEv.name || '').startsWith(fu.after)) continue;
        if (f - prevEv.f > (fu.win || 45)) continue;
        if (fu.btn && fu.btn !== b) continue;
        if (fu.type && b[1] !== fu.type) continue;
        if (fu.d && fu.d !== d) continue;
        if (fu.air && prevEv.low) continue;
        return { f, kind: 'followup', base: fu.name, name: fu.name, nota: (fu.d ? String(fu.d) : '') + b };
      }
      return null;
    }
    function single(b, f) {
      const sp = trySpecials([b], f);
      if (sp) return sp;
      const d = dirs[f];
      const fu = followup(b, d, f);
      if (fu) return fu;
      const tc = tcMatch(b, d, f);
      if (air[f] > 0) return tc || { f, kind: 'normal', name: normalName('j.', d, b), nota: 'j.' + b };
      if (tc) return tc;
      for (const cn of cd.command || []) if (cn.d === d && cn.b === b) return { f, kind: 'unique', name: cn.name, nota: d + b };
      return { f, kind: 'normal', name: normalName('', d, b), nota: (CROUCH.has(d) ? 2 : 5) + b };
    }
    function drivePair(sb, f) {
      if (!air[f] && sameSet(sb, ['HP', 'HK'])) return { f, kind: 'drive', name: 'Drive Impact', nota: 'HP+HK' };
      if (!air[f] && sameSet(sb, ['MP', 'MK'])) return { f, kind: 'drive', name: 'Drive Parry', nota: 'MP+MK' };
      if (sameSet(sb, ['LP', 'LK'])) {
        const back = dirs[f] === 4 || dirs[f] === 1;
        return { f, kind: 'throw', name: air[f] ? 'Agarre aéreo' : back ? 'Agarre hacia atrás' : 'Agarre', nota: (air[f] ? 'j.' : back ? '4' : '') + 'LP+LK' };
      }
      const d = dirs[f];
      for (const p of cd.pairs || []) {
        if (!p.type || sb.length !== (p.n || 2) || !sb.every(x => x[1] === p.type)) continue;
        if (!!p.air !== !!air[f]) continue;
        if (p.d && !p.d.includes(d)) continue;
        const nota = p.nota || ((air[f] ? 'j.' : '') + (p.d && d !== 5 ? d : '') + p.type.repeat(p.n || 2));
        return { f, kind: p.kind || 'special', base: p.name, name: p.name, nota };
      }
      return null;
    }

    function modernPress(c) {
      const btns = c.btns, f = c.f, d = dirs[c.fEnd];
      const g = dirGroup(d);
      const md = ch.modern || {};
      const inAir = air[f] > 0;
      if (btns.includes('DI')) return { f, kind: 'drive', name: 'Drive Impact', nota: 'DI' };
      if (btns.includes('DP')) return { f, kind: 'drive', name: 'Drive Parry', nota: 'PARRY' };
      if (btns.includes('TH')) return { f, kind: 'throw', name: 'Agarre', nota: (d === 4 || d === 1 ? '4' : '') + 'TH' };
      const atk = btns.filter(b => ['L', 'M', 'H'].includes(b));
      if (btns.includes('SP')) {
        const dg = g === 'N' ? '5' : g === 'F' ? '6' : g === 'B' ? '4' : '2';
        if (btns.includes('H') && !btns.includes('AUTO')) {
          const lvl = g === 'B' ? 2 : g === 'D' ? 3 : 1;
          const sa = cd.specials.find(s => s.kind === 'super' && s.tag === 'SA' + lvl);
          return { f, kind: 'super', base: sa ? sa.name : 'SA' + lvl, name: sa ? 'SA' + lvl + ' ' + sa.name : 'Super Art ' + lvl, nota: (dg === '5' ? '' : dg) + 'SP+H' };
        }
        const nm = inAir ? md.air : (md.sp || {})[g] || (md.sp || {}).N;
        const od = btns.includes('AUTO');
        return { f, kind: nm ? 'special' : 'special', base: nm, air: inAir, name: nm ? nm + (od ? ' OD' : '') + ' (asistido)' : 'Especial asistido', nota: (inAir ? 'j.' : '') + (dg === '5' ? '' : dg) + (od ? 'AUTO+SP' : 'SP') };
      }
      if (atk.length >= 1) {
        const b = atk[atk.length - 1];
        for (const sp of cd.specials) {
          if (!!sp.air !== inAir || sp.m === '' || sp.after) continue;
          if (sp.exact && sp.exact.length > 1) continue;
          if ((sp.min || 1) > 1) continue;
          const mm = matchMotion(runs, sp.m, c.fEnd, lastSpecialPress);
          if (!mm) continue;
          if (sp.exact && sp.exact[0][0] !== b) continue;
          return { f, kind: sp.kind, base: sp.name, air: inAir, name: (sp.tag ? sp.tag + ' ' : '') + sp.name + (sp.strength ? ' (' + STR[b] + ')' : ''), nota: (inAir ? 'j.' : '') + sp.m + b, motionStart: mm.start };
        }
        if (btns.includes('AUTO')) return { f, kind: 'normal', name: 'Combo asistido (' + b + ')', nota: 'AUTO+' + b };
        if (inAir) return { f, kind: 'normal', name: normalName('j.', d, b), nota: 'j.' + b };
        return { f, kind: 'normal', name: normalName('', d, b), nota: (CROUCH.has(d) ? 2 : 5) + b };
      }
      return null;
    }

    for (const it of items) {
      if (it.t === 'dash') {
        const pe = last();
        if (it.d.d === 6 && pe && pe.name === 'Drive Parry' && it.f - pe.f <= 40) {
          if (pe.via === 'cancel') { pe.name = 'Drive Rush (cancel)'; pe.nota = 'DR'; }
          else { pe.name = 'Drive Rush (desde Parry)'; pe.nota = modern ? 'PARRY~66' : 'PDR'; }
          pe.kind = 'drive';
          cur = { ev: pe, at: it.f, fd: { s: 9, a: 22, t: 32, c: 'n', hs: 0 } };
          continue;
        }
        if (cur && cur.ev && (cur.ev.nota === 'DR' || cur.ev.nota === 'PDR') && it.f < cur.at + 32) { discarded.push({ f: it.f, what: '66', reason: 'Parte del Drive Rush' }); continue; }
        if (it.d.d === 6 && pe && ['normal', 'unique', 'tc'].includes(pe.kind) && !pe.nota.startsWith('j.')) {
          const dr = { f: it.f, kind: 'drive', name: 'Drive Rush (cancel)', nota: 'DR' };
          const g = gate(dr);
          if (g.ok && (g.via === 'cancel' || (!o.timing && it.f - pe.f <= 30))) { accept(dr, Object.assign(g, { via: 'cancel' })); continue; }
        }
        const dash = { f: it.f, kind: 'move', name: it.d.d === 6 ? 'Dash adelante' : 'Dash atrás', nota: it.d.d === 6 ? '66' : '44' };
        const g = gate(dash);
        if (g.ok) accept(dash, g); else discarded.push({ f: it.f, what: dash.nota, reason: g.reason });
        continue;
      }
      const c = it.c;
      if (modern) { handle(modernPress(c)); continue; }
      const btns = c.btns;
      if (btns.length >= 2) {
        const sp = trySpecials(btns, c.fEnd);
        if (sp) { handle(sp); continue; }
        const pr = drivePair(sortBtns(btns, CLASSIC_BTNS), c.f);
        if (pr) { handle(pr); continue; }
        for (const p of c.order) handle(single(p.b, p.f));
        continue;
      }
      handle(single(btns[0], c.f));
    }

    let out = events;
    if (o.merge) {
      out = [];
      let dropped = false;
      for (const ev of events) {
        const p = out[out.length - 1];
        const light = /(LP|LK|L)$/.test(ev.nota) && !/AUTO/.test(ev.nota);
        if (dropped && ev.via === 'cancel') ev.via = 'free';
        const mashed = p && p.mash ? (p.mash[ev.nota] || 0) : 0;
        if (p && p.nota === ev.nota && ev.via === 'free' && mashed >= (light ? 2 : 1) && ['normal', 'unique', 'special', 'super'].includes(ev.kind)) {
          discarded.push({ f: ev.f, what: ev.nota, reason: 'Repetición por machaqueo (unida al paso anterior)' });
          continue;
        }
        const evBtn = (ev.nota.match(/(LP|MP|HP|LK|MK|HK)$/) || [])[1];
        const sameButton = evBtn && (p ? p.nota.replace(/^j\./, '').split(/[^A-Z]+/).join('+').includes(evBtn) : false);
        if (p && p.nota !== ev.nota && ['special', 'super'].includes(p.kind) && sameButton && ev.via === 'free' && mashed >= 2 && p.freeAt && ev.f <= p.freeAt + 6 && ['normal', 'unique'].includes(ev.kind)) {
          discarded.push({ f: ev.f, what: ev.nota, reason: 'Machaqueo del mismo botón que cayó justo al terminar ' + (p.name || p.nota) });
          dropped = true;
          continue;
        }
        dropped = false;
        out.push(ev);
      }
    }
    out.forEach((ev, i) => {
      ev.gap = i ? ev.f - out[i - 1].f : 0;
      ev.conn = i ? (ev.via === 'cancel' ? '>' : ',') : '';
    });
    discarded.sort((a, b) => a.f - b.f);
    return { steps: out, discarded, dirs, air, install };
  }

  const BTN_TOKENS = 'LP|MP|HP|LK|MK|HK|PPP|KKK|PP|KK|SP|AUTO|PARRY|TH|DI|P|K|L|M|H';
  const NOTA_RE = new RegExp('^((?:\\[[1-9]\\])?[1-9]*)((?:' + BTN_TOKENS + ')(?:\\+(?:' + BTN_TOKENS + '))*)?$');

  function partsOf(nota) {
    if (nota === 'DR') return [{ t: 'dir', v: 6 }, { t: 'dir', v: 6 }];
    if (nota === 'PDR') return [{ t: 'btn', v: 'MP' }, { t: 'plus' }, { t: 'btn', v: 'MK' }, { t: 'sep' }, { t: 'dir', v: 6 }, { t: 'dir', v: 6 }];
    let s = String(nota).replace(/\s+/g, '');
    const parts = [];
    if (s.startsWith('j.')) { parts.push({ t: 'air' }); s = s.slice(2); }
    s.split('~').forEach((seg, si) => {
      if (si) parts.push({ t: 'sep' });
      const m = seg.match(NOTA_RE);
      if (!m) { parts.push({ t: 'txt', v: seg }); return; }
      let ds = m[1] || '';
      const ch = ds.match(/^\[([1-9])\]/);
      if (ch) { parts.push({ t: 'charge', v: +ch[1] }); ds = ds.slice(3); }
      if (ds && ds !== '5') for (const c of ds) parts.push({ t: 'dir', v: +c });
      if (m[2]) {
        const bs = m[2].split('+').flatMap(x => /^(PP|KK|PPP|KKK)$/.test(x) ? x.split('') : [x]);
        bs.forEach((b, i) => { if (i) parts.push({ t: 'plus' }); parts.push({ t: 'btn', v: b }); });
      }
    });
    return parts;
  }

  function classify(nota, charId, scheme) {
    const ch = chars[charId] || chars.juri;
    const cd = ch.classic;
    const n = String(nota).replace(/\s+/g, '');
    const fixed = { DR: ['drive', 'Drive Rush (cancel)'], PDR: ['drive', 'Drive Rush (desde Parry)'], 'PARRY~66': ['drive', 'Drive Rush (desde Parry)'], DI: ['drive', 'Drive Impact'], 'HP+HK': ['drive', 'Drive Impact'], 'MP+MK': ['drive', 'Drive Parry'], PARRY: ['drive', 'Drive Parry'], '66': ['move', 'Dash adelante'], '44': ['move', 'Dash atrás'], TH: ['throw', 'Agarre'], '4TH': ['throw', 'Agarre hacia atrás'] };
    if (fixed[n]) return { kind: fixed[n][0], name: fixed[n][1] };
    if (/^(j\.|4)?LP\+LK$/.test(n)) return { kind: 'throw', name: 'Agarre' };
    let s = n;
    const isAir = s.startsWith('j.');
    if (isAir) s = s.slice(2);
    const m = s.match(NOTA_RE);
    if (!m) return { kind: 'normal', name: '' };
    const ds = m[1] || '';
    const bs = (m[2] || '').split('+').filter(Boolean);
    if (bs.includes('SP')) {
      const dg = { '': 'N', 5: 'N', 6: 'F', 4: 'B', 2: 'D' }[ds] || 'N';
      if (bs.includes('H')) {
        const lvl = dg === 'B' ? 2 : dg === 'D' ? 3 : 1;
        const sa = cd.specials.find(x => x.kind === 'super' && x.tag === 'SA' + lvl);
        return { kind: 'super', name: sa ? 'SA' + lvl + ' ' + sa.name : 'Super Art ' + lvl };
      }
      const nm = isAir ? (ch.modern || {}).air : ((ch.modern || {}).sp || {})[dg];
      return { kind: 'special', name: nm ? nm + (bs.includes('AUTO') ? ' OD' : '') + ' (asistido)' : 'Especial asistido' };
    }
    if (bs.includes('AUTO')) return { kind: 'normal', name: 'Combo asistido (' + bs.filter(b => b !== 'AUTO').join('') + ')' };
    const flat = bs.flatMap(x => /^(PP|KK|PPP|KKK)$/.test(x) ? x.split('') : [x]).map(x => x.length === 2 ? x[1] : x);
    if (flat.length >= 2 && flat.every(x => x === flat[0] && (x === 'P' || x === 'K')) && ds.length <= 1) {
      const d = ds ? +ds : 5;
      const p = (cd.pairs || []).find(q => q.type === flat[0] && (q.n || 2) === flat.length && !!q.air === isAir && (!q.d || q.d.includes(d)));
      if (p) return { kind: p.kind || 'special', name: p.name };
    }
    const plain = ds.replace(/^\[[1-9]\]/, m => '[' + m[1] + ']');
    if (ds.length >= 2 || ds.startsWith('[')) {
      const cls = bs.flatMap(x => x === 'PP' ? ['LP', 'MP'] : x === 'KK' ? ['LK', 'MK'] : [x]);
      for (const sp of cd.specials) {
        if (sp.m !== plain || !!sp.air !== isAir) continue;
        const generic = cls.length && cls.every(b => ['P', 'K', 'L', 'M', 'H'].includes(b));
        if (generic) {
          if (cls.every(b => b.length === 1 && ['L', 'M', 'H'].includes(b))) {
            if (sp.exact && sp.exact.length === 1 && sp.exact[0][0] !== cls[0]) continue;
            return { kind: sp.kind, name: (sp.tag ? sp.tag + ' ' : '') + sp.name };
          }
          if (cls.every(b => b === sp.type) && !sp.exact && cls.length >= (sp.min || 1) && cls.length <= (sp.max || 1)) return { kind: sp.kind, name: (sp.tag ? sp.tag + ' ' : '') + sp.name };
          continue;
        }
        if (buttonsFit(sp, sortBtns(cls, CLASSIC_BTNS))) return { kind: sp.kind, name: (sp.tag ? sp.tag + ' ' : '') + strengthName(sp, sortBtns(cls, CLASSIC_BTNS)) };
      }
      return { kind: 'special', name: '' };
    }
    if (bs.length === 1) {
      const b = bs[0];
      const d = ds ? +ds[ds.length - 1] : 5;
      if (!isAir) {
        for (const tc of cd.tc || []) for (let i = 1; i < tc.seq.length; i++) if (tc.seq[i].n === n && !/^5/.test(n)) return { kind: 'tc', name: tc.name };
        for (const cn of cd.command || []) if (cn.d === d && cn.b === b) return { kind: 'unique', name: cn.name };
      }
      if (['LP', 'MP', 'HP', 'LK', 'MK', 'HK', 'L', 'M', 'H'].includes(b)) return { kind: 'normal', name: normalName(isAir ? 'j.' : '', d, b) };
    }
    return { kind: 'normal', name: '' };
  }

  function normalizeNota(tok) {
    let t = tok.trim();
    t = t.replace(/^(cr\.|c\.)/i, '2').replace(/^(st\.|s\.)/i, '5').replace(/^(jump\s*|j)\.?(?=[a-z\d\[])/i, 'j.');
    t = t.replace(/\b(lp|mp|hp|lk|mk|hk|pp|kk|sp|auto|parry|p|k|l|m|h)\b/gi, x => x.toUpperCase());
    t = t.replace(/(\d|\])(lp|mp|hp|lk|mk|hk|pp|kk|sp|auto|p|k|l|m|h)(?=$|\+)/i, (a, d, b) => d + b.toUpperCase());
    t = t.replace(/^(dr|pdr|di|th)$/i, x => x.toUpperCase());
    return t;
  }
  function parseText(text, charId, scheme) {
    const out = [];
    const src = text.replace(/\bxx\b/gi, '>');
    const re = /\s*(>|,)?\s*([^>,]+)/g;
    let m, first = true;
    while ((m = re.exec(src))) {
      const tok = m[2].trim();
      if (!tok) continue;
      const nota = normalizeNota(tok);
      const c = classify(nota, charId, scheme);
      out.push({ id: 'm' + out.length + '_' + Date.now(), f: 0, kind: c.kind, name: c.name, nota, conn: first ? '' : (m[1] || ',') });
      first = false;
    }
    return out;
  }
  function stepsToText(steps) { return steps.map((s, i) => (i ? (s.conn === '>' ? ' > ' : ', ') : '') + s.nota).join(''); }
  function parseDSL(dsl, scheme) {
    const frames = [];
    const bits = scheme === 'modern' ? MBIT : BIT;
    for (const tok of dsl.trim().split(/\s+/)) {
      const m = tok.match(/^(\d)((?:\+[A-Z]{1,4})*)x(\d+)$/);
      if (!m) throw new Error('Token inválido: ' + tok);
      let mask = 0;
      for (const b of m[2].split('+').filter(Boolean)) mask |= bits[b];
      for (let i = 0; i < +m[3]; i++) frames.push([+m[1], mask]);
    }
    return { version: 2, fps: 60, scheme: scheme || 'classic', frames };
  }
  function trialProgress(got, want, junk) {
    junk = junk === undefined ? 2 : junk;
    let best = 0, bestEnd = -1;
    for (let i = 0; i < got.length; i++) {
      if (got[i] !== want[0]) continue;
      let j = i, k = 0, skips = 0, end = i;
      while (j < got.length && k < want.length) {
        if (got[j] === want[k]) { k++; end = j; skips = 0; }
        else if (++skips > junk) break;
        j++;
      }
      if (got.length - 1 - end > junk) continue;
      if (end > bestEnd || (end === bestEnd && k > best)) { best = k; bestEnd = end; }
    }
    return best;
  }
  function normNota(n) { return String(n).replace(/^5(?=[A-Z])/, '').replace(/\s+/g, ''); }

  root.SF6 = { MOTIONS, trialProgress, CLASSIC_BTNS, MODERN_BTNS, BIT, MBIT, MIRROR, chars, registerCharacter, parse, partsOf, classify, parseText, stepsToText, parseDSL, relativeDirs, normalizeNota, normNota, dirGroup };
})(typeof window !== 'undefined' ? window : globalThis);
if (typeof module !== 'undefined') module.exports = globalThis.SF6;
