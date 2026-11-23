const DEMOS = [
  { char: 'juri', scheme: 'classic', side: 'P1', name: '2LK, 2LP > 214LK (diagonal suelta y botón machacado)', expect: ['2LK', '2LP', '214LK'], dsl: '5x10 2x2 2+LKx4 2x8 1x1 2x3 2+LPx3 2x2 1x2 4x1 4+LKx4 5x3 5+LKx2 5x9 5+LKx2 5x20' },
  { char: 'juri', scheme: 'classic', side: 'P1', name: 'Target combo Death Crest: MP > 4HP > HP', expect: ['5MP', '4HP', '5HP'], dsl: '5x8 5+MPx3 5x6 4x2 4+HPx3 4x5 5x3 5+HPx4 5x20' },
  { char: 'juri', scheme: 'classic', side: 'P1', name: 'Parry Drive Rush, HP, 2MP > 236MK', expect: ['PDR', '5HP', '2MP', '236MK'], dsl: '5x6 5+MPx1 5+MP+MKx3 5x2 6x3 5x2 6x8 5x2 5+HPx3 5x40 2x3 2+MPx3 2x4 3x2 6x2 6+MKx4 5x20' },
  { char: 'juri', scheme: 'classic', side: 'P1', name: 'j.HK, HP > 214HK, SA1', expect: ['j.HK', '5HP', '214HK', '236236LK'], dsl: '5x5 9x13 5x20 5+HKx3 5x14 5x6 5+HPx3 5x4 2x3 1x2 4x2 4+HKx4 5x30 2x2 3x2 6x2 2x2 3x1 6x3 6+LKx3 5x20' },
  { char: 'juri', scheme: 'classic', side: 'P2', name: 'Lado P2: 2MK > 623HP', expect: ['2MK', '623HP'], dsl: '5x6 1x2 1+MKx3 1x4 2x1 4x2 2x1 1x3 1+HPx3 5x20' },
  { char: 'juri', scheme: 'classic', side: 'P1', name: 'Machaqueo: 2MP > DR, MP > 4HP > HP', expect: ['2MP', 'DR', '5MP', '4HP', '5HP'], dsl: '5x6 2+MPx3 2x2 2+MPx2 2x2 2+MPx2 5x1 6x2 5x2 6x10 5x3 5+MPx3 5x2 5+MPx2 5x2 5+MPx2 4x2 4+HPx3 4x2 4+HPx2 5x6 5+HPx3 5x3 5+HPx2 5x30 5+MPx2 5x40' },
  { char: 'juri', scheme: 'classic', side: 'P1', name: 'Agachado, bloquear atrás y HK (no es Fuhajin)', expect: ['2MP', '4HK'], dsl: '5x6 2+MPx3 2x12 1x14 4x3 4+HKx3 5x30' },
  { char: 'ken', scheme: 'classic', side: 'P1', name: 'Ken: MP > HP > SA3', expect: ['5MP', '5HP', '236236LP'], dsl: '5x6 5+MPx3 5x8 5+HPx3 5x10 2x2 3x2 6x1 2x2 3x1 6x2 6+LPx3 5x40' },
  { char: 'ken', scheme: 'classic', side: 'P1', name: 'Ken: Jinrai Kick > Kazekama', expect: ['236HK', '6MK'], dsl: '5x6 2x3 3x2 6x2 6+HKx3 6x24 6+MKx3 5x40' },
  { char: 'guile', scheme: 'classic', side: 'P1', name: 'Guile: Sonic Boom con carga', expect: ['[4]6HP'], dsl: '5x4 4x50 6x2 6+HPx3 5x30' },
  { char: 'guile', scheme: 'classic', side: 'P1', name: 'Guile: 2MP > 2MP (target combo)', expect: ['2MP', '2MP'], dsl: '5x6 2+MPx3 2x8 2+MPx3 2x40' },
  { char: 'juri', scheme: 'modern', side: 'P1', name: 'Moderno: 2M, SP, SA2', expect: ['2M', 'SP', '4SP+H'], dsl: '5x6 2+Mx3 2x6 5x2 5+SPx3 5x30 4+SP+Hx3 5x20' }
];
