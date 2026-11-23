SF6.registerCharacter({
  id: 'guile',
  name: 'Guile',
  color: '#3f9b4a',
  sources: ['https://ultimateframedata.com/sf6/guile'],
  classic: {
    command: [
      { d: 4, b: 'LK', name: 'Atrás + LK' },
      { d: 6, b: 'MP', name: 'Adelante + MP' },
      { d: 6, b: 'MK', name: 'Adelante + MK' },
      { d: 4, b: 'MK', name: 'Atrás + MK' },
      { d: 6, b: 'HP', name: 'Adelante + HP' },
      { d: 4, b: 'HP', name: 'Atrás + HP' },
      { d: 6, b: 'HK', name: 'Adelante + HK' },
      { d: 3, b: 'HK', name: 'Guile High Kick' }
    ],
    tc: [
      { name: 'Target combo MP > 4HP', seq: [{ n: '5MP' }, { b: 'HP', d: [4], n: '4HP' }] },
      { name: 'Target combo 2MP > 2MP', seq: [{ n: '2MP' }, { b: 'MP', d: [1, 2, 3], n: '2MP' }] },
      { name: 'Target combo 2MK > 6MP', seq: [{ n: '2MK' }, { b: 'MP', d: [6], n: '6MP' }] },
      { name: 'Target combo 2HK > 3HK', seq: [{ n: '2HK' }, { b: 'HK', d: [3], n: '3HK' }] }
    ],
    specials: [
      { name: 'Sonic Hurricane', tag: 'SA1', m: '[4]646', type: 'P', min: 1, max: 2, kind: 'super' },
      { name: 'Crossfire Somersault', tag: 'SA3', m: '[4]646', type: 'K', min: 1, max: 2, kind: 'super' },
      { name: 'Solid Puncher', tag: 'SA2', m: '214214', type: 'P', min: 1, max: 2, kind: 'super' },
      { name: 'Sonic Boom OD', m: '[4]6', type: 'P', min: 2, max: 2, kind: 'special' },
      { name: 'Somersault Kick OD', m: '[2]8', type: 'K', min: 2, max: 2, kind: 'special' },
      { name: 'Sonic Blade OD', m: '214', type: 'P', min: 2, max: 2, kind: 'special' },
      { name: 'Sonic Boom', m: '[4]6', type: 'P', kind: 'special', strength: true },
      { name: 'Somersault Kick', m: '[2]8', type: 'K', kind: 'special', strength: true },
      { name: 'Sonic Blade', m: '214', type: 'P', kind: 'special', strength: true }
    ],
    followups: [{ after: 'Sonic Blade', type: 'P', d: 6, name: 'Sonic Cross', win: 50 }],
    fd: {
      '5LP': [5, 3, 14, 'csS'], '5MP': [7, 3, 24, 'sSt'], '5HP': [7, 3, 32, 'sS'],
      '5LK': [5, 3, 18, 'sS'], '5MK': [7, 5, 29, ''], '5HK': [13, 3, 36, 'S'],
      '2LP': [4, 3, 14, 'csS'], '2MP': [6, 3, 21, 'sSt'], '2HP': [9, 5, 33, ''],
      '2LK': [5, 2, 18, 'c'], '2MK': [8, 3, 28, 't'], '2HK': [9, 2, 50, 't'],
      '4LK': [8, 5, 27, ''], '6MP': [20, 3, 41, ''], '6MK': [11, 3, 34, ''], '4MK': [11, 3, 31, ''],
      '6HP': [16, 3, 38, ''], '4HP': [9, 3, 32, 'sS'], '6HK': [17, 3, 45, ''], '3HK': [10, 3, 35, 'sS'],
      'TC:Target combo MP > 4HP:0': [7, 3, 24, 'sSt'], 'TC:Target combo MP > 4HP:1': [16, 3, 44, 'sS'],
      'TC:Target combo 2MP > 2MP:0': [6, 3, 21, 'sSt'], 'TC:Target combo 2MP > 2MP:1': [12, 3, 30, 'sS'],
      'TC:Target combo 2MK > 6MP:0': [8, 3, 28, 't'], 'TC:Target combo 2MK > 6MP:1': [20, 3, 43, ''],
      'TC:Target combo 2HK > 3HK:0': [9, 2, 50, 't'], 'TC:Target combo 2HK > 3HK:1': [10, 3, 37, 'sS'],
      'Sonic Boom (ligero)': [10, 30, 40, ''], 'Sonic Boom (medio)': [10, 30, 40, ''], 'Sonic Boom (fuerte)': [10, 30, 40, ''], 'Sonic Boom OD': [10, 30, 38, ''],
      'Somersault Kick (ligero)': [5, 6, 51, ''], 'Somersault Kick (medio)': [6, 6, 53, ''], 'Somersault Kick (fuerte)': [7, 6, 55, ''], 'Somersault Kick OD': [6, 6, 55, ''],
      'Sonic Blade (ligero)': [16, 27, 42, ''], 'Sonic Blade (medio)': [21, 30, 50, ''], 'Sonic Blade (fuerte)': [31, 24, 54, ''], 'Sonic Blade OD': [15, 21, 39, ''],
      'Sonic Cross': [10, 3, 40, ''],
      'Sonic Hurricane': [8, 5, 81, ''], 'Solid Puncher': [6, 2, 40, ''], 'Crossfire Somersault': [9, 6, 70, '']
    }
  },
  modern: { verified: false, sp: { N: 'Sonic Boom', D: 'Somersault Kick', B: 'Sonic Blade' } }
});
