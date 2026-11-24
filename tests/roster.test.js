const fs = require('fs');
const path = require('path');
require('../js/engine.js');
const SF6 = globalThis.SF6;
const dir = path.join(__dirname, '..', 'data', 'characters');
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js'))) require(path.join(dir, f));

const MOT = {
  '236': [2, 3, 6], '214': [2, 1, 4], '623': [6, 2, 3], '22': [2, 5, 2], '236236': [2, 3, 6, 2, 3, 6], '214214': [2, 1, 4, 2, 1, 4],
  '63214': [6, 3, 2, 1, 4], '214236': [2, 1, 4, 2, 3, 6], '4268': [4, 1, 2, 3, 6, 9, 8], '42684268': [4, 1, 2, 3, 6, 9, 8, 7, 4, 1, 2, 3, 6, 9, 8]
};
function motionDSL(m) {
  if (m === '[4]6') return ['4x45', '6x2'];
  if (m === '[2]8') return ['1x45', '8x1'];
  if (m === '[4]646') return ['4x45', '6x3', '4x3', '6x2'];
  return MOT[m].map(d => d + 'x2');
}
function lastDir(m) { const t = motionDSL(m); return t[t.length - 1].split('x')[0]; }
const STRN = { L: 'ligero', M: 'medio', H: 'fuerte' };
function btnsFor(sp, fd) {
  if (sp.exact) return [sp.exact];
  const t = sp.type;
  if ((sp.min || 1) >= 2) return [['L' + t, 'M' + t]];
  if (sp.strength) return ['L', 'M', 'H'].filter(l => !fd || fd[sp.name + ' (' + STRN[l] + ')']).map(l => [l + t]);
  return [['H' + t]];
}
function run(cid, dsl) { return SF6.parse(SF6.parseDSL(dsl), { char: cid }); }

let total = 0, ok = 0;
const fails = [];
function check(cid, label, dsl, pred) {
  total++;
  const r = run(cid, dsl);
  if (pred(r.steps)) { ok++; return; }
  fails.push(cid + ' · ' + label + ' → ' + (SF6.stepsToText(r.steps) || '(nada)') + '   [' + dsl + ']');
}

for (const ch of Object.values(SF6.chars)) {
  const cd = ch.classic;
  const jump = ch.jump || [4, 38];
  for (const sp of cd.specials) {
    if (!SF6.MOTIONS[sp.m]) { total++; fails.push(ch.id + ' · ' + sp.name + ' → motion desconocida ' + sp.m); continue; }
    for (const bs of btnsFor(sp, cd.fd)) {
      let mot = motionDSL(sp.m);
      if (sp.air && sp.m.startsWith('[')) mot = [mot[0], '7x6', mot[0].split('x')[0] + 'x6'].concat(mot.slice(1));
      const press = lastDir(sp.m) + '+' + bs.join('+') + 'x3';
      const pre = sp.air ? (sp.m.startsWith('[') ? ['5x10'] : ['5x10', '9x6', '5x' + (jump[0] + 5)]) : ['5x10'];
      const dsl = pre.concat(mot, [press, '5x' + (jump[1] + 40)]).join(' ');
      check(ch.id, sp.name + ' [' + bs.join('+') + ']', dsl, st => st.some(s => s.base === sp.name));
    }
  }
  for (const cn of cd.command || []) {
    check(ch.id, 'comando ' + cn.d + cn.b, '5x10 ' + cn.d + 'x3 ' + cn.d + '+' + cn.b + 'x3 5x60', st => st.length === 1 && st[0].nota === cn.d + cn.b);
  }
  for (const p of cd.pairs || []) {
    const d = p.d ? p.d[0] : 5;
    const bs = (p.type === 'P' ? ['LP', 'MP', 'HP'] : ['LK', 'MK', 'HK']).slice(0, p.n || 2);
    const pre = p.air ? '5x10 9x3 5x' + (jump[0] + 8) : '5x10 ' + d + 'x3';
    check(ch.id, 'par ' + p.name, pre + ' ' + (p.air ? 5 : d) + '+' + bs.join('+') + 'x3 5x80', st => st.some(s => s.base === p.name));
  }
  for (const tc of cd.tc || []) {
    const air = tc.seq.some(s => s.air);
    const toks = air ? ['5x10', '9x3', '5x' + (jump[0] + 2)] : ['5x10'];
    tc.seq.forEach((s, i) => {
      const key = 'TC:' + tc.name + ':' + i;
      const row = cd.fd[key] || cd.fd[s.n] || [6, 3, 20];
      const m = s.n.match(/^(j\.|[1-9])?(LP|MP|HP|LK|MK|HK)$/);
      const d = air ? 5 : (i === 0 ? (s.n[0] === '5' ? 5 : +s.n[0]) : (s.d ? s.d[s.d.length > 1 ? Math.floor(s.d.length / 2) : 0] : 5));
      toks.push(d + 'x2', d + '+' + m[2] + 'x2', d + 'x' + Math.max(2, row[0] + Math.min(row[1], 3) - 3));
    });
    toks.push('5x' + (jump[1] + 40));
    const want = tc.seq.map(s => s.n);
    check(ch.id, 'TC ' + tc.name, toks.join(' '), st => {
      const n = st.map(s => s.nota);
      for (let i = 0; i + want.length <= n.length; i++) if (want.every((w, k) => n[i + k] === w)) return true;
      return false;
    });
  }
  for (const fu of cd.followups || []) {
    const parent = cd.specials.find(s => s.name === fu.after) || cd.specials.find(s => s.name.startsWith(fu.after));
    const pair = (cd.pairs || []).find(p => p.name === fu.after);
    if (!parent && !pair) { total++; fails.push(ch.id + ' · follow-up ' + fu.name + ' sin padre ' + fu.after); continue; }
    let toks;
    let st0 = 10;
    if (parent) {
      const bs = btnsFor(parent)[0];
      toks = (parent.air ? ['5x10', '9x6', '5x' + (jump[0] + 5)] : ['5x10']).concat(motionDSL(parent.m), [lastDir(parent.m) + '+' + bs.join('+') + 'x2']);
      const row = cd.fd[parent.name] || cd.fd[parent.name + ' (fuerte)'] || cd.fd[parent.name + ' (ligero)'] || [12, 3, 40];
      st0 = row[0];
    } else {
      const bs = (pair.type === 'P' ? ['LP', 'MP', 'HP'] : ['LK', 'MK', 'HK']).slice(0, pair.n || 2);
      const d = pair.d ? pair.d[0] : 5;
      toks = ['5x10', d + 'x3', d + '+' + bs.join('+') + 'x2'];
    }
    const b = fu.btn || ((fu.type === 'P' ? 'H' : 'H') + fu.type);
    const d = fu.d || 5;
    toks.push('5x' + Math.max(3, st0), d + 'x2', d + '+' + b + 'x2', '5x80');
    check(ch.id, 'follow-up ' + fu.name, toks.join(' '), st => st.some(s => s.name === fu.name || s.base === fu.name));
  }
}
for (const ch of Object.values(SF6.chars)) {
  const cd = ch.classic;
  for (const t of ['SA1', 'SA2', 'SA3']) {
    total++;
    if (cd.specials.some(s => s.tag === t)) ok++; else fails.push(ch.id + ' · falta ' + t);
  }
  const md = ch.modern || {};
  for (const [g, nm] of Object.entries(md.sp || {})) {
    total++;
    if (cd.specials.some(s => s.name === nm)) ok++; else fails.push(ch.id + ' · moderno ' + g + ' apunta a ' + nm + ' que no existe');
  }
  for (const [lvl, nota] of [['SA1', 'SP+H'], ['SA2', '4SP+H'], ['SA3', '2SP+H']]) {
    total++;
    const r = SF6.parse(SF6.parseDSL('5x10 ' + (nota[0] === '4' ? '4' : nota[0] === '2' ? '2' : '5') + 'x3 ' + (nota[0] === '4' ? '4' : nota[0] === '2' ? '2' : '5') + '+SP+Hx3 5x60', 'modern'), { char: ch.id, scheme: 'modern' });
    if (r.steps.length === 1 && r.steps[0].name.startsWith(lvl)) ok++; else fails.push(ch.id + ' · moderno ' + nota + ' → ' + SF6.stepsToText(r.steps));
  }
  const sp = cd.specials.find(s => s.kind === 'special' && !s.air);
  if (sp) {
    total++;
    const nota = sp.m + (sp.exact ? sp.exact.join('+') : (sp.min || 1) >= 2 ? sp.type + sp.type : 'H' + sp.type);
    const c = SF6.classify(nota, ch.id, 'classic');
    if (c.kind === 'special' && c.name) ok++; else fails.push(ch.id + ' · texto ' + nota + ' → ' + JSON.stringify(c));
  }
}
for (const f of fails) console.log('FAIL ' + f);
console.log(ok + '/' + total + ' movimientos detectados en ' + Object.keys(SF6.chars).length + ' personajes');
process.exit(fails.length ? 1 : 0);
