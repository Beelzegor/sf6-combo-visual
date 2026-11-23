SF6.registerCharacter({
  id: 'ken',
  name: 'Ken',
  color: '#ff4b3a',
  sources: ['https://ultimateframedata.com/sf6/ken'],
  classic: {
    command: [],
    tc: [
      { name: 'Target combo MP > HP', seq: [{ n: '5MP' }, { b: 'HP', d: [4, 5, 6], n: '5HP' }] },
      { name: 'Target combo MK > MK > HK', seq: [{ n: '5MK' }, { b: 'MK', d: [4, 5, 6], n: '5MK' }, { b: 'HK', d: [4, 5, 6], n: '5HK' }] }
    ],
    specials: [
      { name: 'Dragonlash Flame', tag: 'SA1', m: '214214', type: 'K', min: 1, max: 2, kind: 'super' },
      { name: 'Shippu Jinrai-kyaku', tag: 'SA2', m: '236236', type: 'K', min: 1, max: 2, kind: 'super' },
      { name: 'Shinryu Reppa', tag: 'SA3', m: '236236', type: 'P', min: 1, max: 2, kind: 'super' },
      { name: 'Aerial Tatsumaki OD', m: '214', type: 'K', min: 2, max: 2, air: true, fwd: true, kind: 'special' },
      { name: 'Aerial Tatsumaki', m: '214', type: 'K', air: true, fwd: true, kind: 'special' },
      { name: 'Hadoken OD', m: '236', type: 'P', min: 2, max: 2, kind: 'special' },
      { name: 'Shoryuken OD', m: '623', type: 'P', min: 2, max: 2, kind: 'special' },
      { name: 'Tatsumaki Senpu-kyaku OD', m: '214', type: 'K', min: 2, max: 2, kind: 'special' },
      { name: 'Dragonlash Kick OD', m: '623', type: 'K', min: 2, max: 2, kind: 'special' },
      { name: 'Jinrai Kick OD', m: '236', type: 'K', min: 2, max: 2, kind: 'special' },
      { name: 'Hadoken', m: '236', type: 'P', kind: 'special', strength: true },
      { name: 'Shoryuken', m: '623', type: 'P', kind: 'special', strength: true },
      { name: 'Tatsumaki Senpu-kyaku', m: '214', type: 'K', kind: 'special', strength: true },
      { name: 'Dragonlash Kick', m: '623', type: 'K', kind: 'special', strength: true },
      { name: 'Jinrai Kick', m: '236', type: 'K', kind: 'special', strength: true }
    ],
    followups: [
      { after: 'Jinrai Kick', btn: 'LK', d: 6, name: 'Kazekama Shin Kick', win: 45 },
      { after: 'Jinrai Kick', btn: 'MK', d: 6, name: 'Gorai Axe Kick', win: 45 },
      { after: 'Jinrai Kick', btn: 'HK', d: 6, name: 'Senka Snap Kick', win: 45 }
    ],
    pairs: [{ type: 'K', name: 'Quick Dash', nota: 'KK', kind: 'special' }],
    fd: {
      '5LP': [4, 3, 13, 'csS'], '5MP': [5, 3, 22, 'sSt'], '5HP': [10, 3, 31, 'sS'],
      '5LK': [5, 3, 18, 'sS'], '5MK': [8, 3, 30, 't'], '5HK': [12, 3, 38, ''],
      '2LP': [4, 3, 14, 'csS'], '2MP': [6, 3, 22, 'sS'], '2HP': [8, 3, 35, 'sS'],
      '2LK': [5, 3, 17, 'c'], '2MK': [7, 3, 28, 'sS'], '2HK': [8, 3, 34, ''],
      'TC:Target combo MP > HP:0': [5, 3, 22, 'sSt'], 'TC:Target combo MP > HP:1': [11, 3, 40, 'sS'],
      'TC:Target combo MK > MK > HK:0': [8, 3, 30, 't'], 'TC:Target combo MK > MK > HK:1': [11, 3, 39, 't'], 'TC:Target combo MK > MK > HK:2': [13, 3, 43, ''],
      'Quick Dash': [11, 3, 45, ''],
      'Hadoken (ligero)': [16, 3, 49, ''], 'Hadoken (medio)': [14, 3, 49, ''], 'Hadoken (fuerte)': [12, 3, 49, ''], 'Hadoken OD': [12, 3, 40, ''],
      'Shoryuken (ligero)': [5, 3, 47, ''], 'Shoryuken (medio)': [6, 3, 55, ''], 'Shoryuken (fuerte)': [7, 3, 66, ''], 'Shoryuken OD': [6, 3, 67, ''],
      'Tatsumaki Senpu-kyaku (ligero)': [4, 3, 46, ''], 'Tatsumaki Senpu-kyaku (medio)': [14, 3, 61, ''], 'Tatsumaki Senpu-kyaku (fuerte)': [16, 3, 78, ''], 'Tatsumaki Senpu-kyaku OD': [9, 3, 90, ''],
      'Dragonlash Kick (ligero)': [18, 3, 44, ''], 'Dragonlash Kick (medio)': [23, 3, 52, ''], 'Dragonlash Kick (fuerte)': [28, 3, 53, ''], 'Dragonlash Kick OD': [9, 3, 47, ''],
      'Jinrai Kick (ligero)': [12, 3, 42, ''], 'Jinrai Kick (medio)': [16, 3, 42, ''], 'Jinrai Kick (fuerte)': [25, 3, 46, ''], 'Jinrai Kick OD': [13, 3, 40, ''],
      'Kazekama Shin Kick': [6, 3, 28, ''], 'Gorai Axe Kick': [18, 3, 40, ''], 'Senka Snap Kick': [10, 3, 37, ''],
      'Dragonlash Flame': [7, 3, 40, ''], 'Shippu Jinrai-kyaku': [6, 3, 32, ''], 'Shinryu Reppa': [7, 3, 90, '']
    }
  },
  modern: { verified: false, sp: { N: 'Hadoken', F: 'Shoryuken', D: 'Jinrai Kick', B: 'Tatsumaki Senpu-kyaku' }, air: 'Aerial Tatsumaki' }
});
