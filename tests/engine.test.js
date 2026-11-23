require('../js/engine.js');
const SF6 = globalThis.SF6;
for (const c of ['juri', 'ken', 'guile']) require('../data/characters/' + c + '.js');
const cases = [
  ['juri', 'classic', 'P1', '5x10 2x2 2+LKx4 2x8 1x1 2x3 2+LPx3 2x2 1x2 4x1 4+LKx4 5x3 5+LKx2 5x9 5+LKx2 5x20', ['2LK', '2LP', '214LK']],
  ['juri', 'classic', 'P1', '5x8 5+MPx3 5x6 4x2 4+HPx3 4x5 5x3 5+HPx4 5x20', ['5MP', '4HP', '5HP']],
  ['juri', 'classic', 'P1', '5x6 5+MPx1 5+MP+MKx3 5x2 6x3 5x2 6x8 5x2 5+HPx3 5x40 2x3 2+MPx3 2x4 3x2 6x2 6+MKx4 5x20', ['PDR', '5HP', '2MP', '236MK']],
  ['juri', 'classic', 'P1', '5x5 9x13 5x20 5+HKx3 5x14 5x6 5+HPx3 5x4 2x3 1x2 4x2 4+HKx4 5x30 2x2 3x2 6x2 2x2 3x1 6x3 6+LKx3 5x20', ['j.HK', '5HP', '214HK', '236236LK']],
  ['juri', 'classic', 'P2', '5x6 1x2 1+MKx3 1x4 2x1 4x2 2x1 1x3 1+HPx3 5x20', ['2MK', '623HP']],
  ['juri', 'classic', 'P1', '5x6 2+MPx3 2x2 2+MPx2 2x2 2+MPx2 5x1 6x2 5x2 6x10 5x3 5+MPx3 5x2 5+MPx2 5x2 5+MPx2 4x2 4+HPx3 4x2 4+HPx2 5x6 5+HPx3 5x3 5+HPx2 5x30 5+MPx2 5x40', ['2MP', 'DR', '5MP', '4HP', '5HP']],
  ['juri', 'classic', 'P1', '5x6 2+MPx3 2x40 2+MPx3 2x40 5x5', ['2MP', '2MP']],
  ['juri', 'classic', 'P1', '5x6 2+MPx3 2x30 1x25 4x6 4+HKx3 5x30', ['2MP', '4HK']],
  ['juri', 'classic', 'P1', '5x6 2+MPx3 2x12 1x14 4x3 4+HKx3 5x30', ['2MP', '4HK']],
  ['ken', 'classic', 'P1', '5x6 2+MKx3 2x3 3x2 6x2 6+MPx3 5x30', ['2MK', '236MP']],
  ['ken', 'classic', 'P1', '5x6 2x3 3x2 6x2 6+HKx3 6x24 6+MKx3 5x40', ['236HK', '6MK']],
  ['ken', 'classic', 'P1', '5x6 5+MPx3 5x8 5+HPx3 5x10 2x2 3x2 6x1 2x2 3x1 6x2 6+LPx3 5x40', ['5MP', '5HP', '236236LP']],
  ['guile', 'classic', 'P1', '5x4 4x50 6x2 6+HPx3 5x30', ['[4]6HP']],
  ['guile', 'classic', 'P1', '5x4 1x48 8x2 8+LKx3 5x60', ['[2]8LK']],
  ['guile', 'classic', 'P1', '5x4 4x20 6x2 6+HPx3 5x30', ['6HP']],
  ['guile', 'classic', 'P1', '5x6 2+MPx3 2x8 2+MPx3 2x40', ['2MP', '2MP']],
  ['guile', 'classic', 'P1', '5x4 1x45 6x2 4x2 6x2 6+LPx3 5x60', ['[4]646LP']],
  ['juri', 'modern', 'P1', '5x6 2+Mx3 2x6 5x2 5+SPx3 5x30 4+SP+Hx3 5x20', ['2M', 'SP', '4SP+H']],
  ['juri', 'modern', 'P1', '5x6 5+AUTO+Lx3 5x10 5+AUTO+Lx3 5x20 6+AUTO+SPx3 5x30', ['AUTO+L', 'AUTO+L', '6AUTO+SP']]
];
let ok = 0;
for (const [c, sch, side, dsl, exp] of cases) {
  const r = SF6.parse(SF6.parseDSL(dsl, sch), { char: c, scheme: sch, side });
  const got = r.steps.map(s => s.nota);
  const pass = JSON.stringify(got) === JSON.stringify(exp);
  if (pass) ok++;
  console.log((pass ? 'OK  ' : 'FAIL') + ' [' + c + '/' + sch + '] ' + SF6.stepsToText(r.steps) + '  |  ' + r.steps.map(s => s.name).join(' / ') + (pass ? '' : '   esperado: ' + exp.join(', ') + '   desc: ' + r.discarded.map(d => d.what + ' ' + d.reason).join('; ')));
}
console.log(ok + '/' + cases.length);
process.exit(ok === cases.length ? 0 : 1);
