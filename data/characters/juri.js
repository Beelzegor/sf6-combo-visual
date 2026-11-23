SF6.registerCharacter({
  id: 'juri',
  name: 'Juri',
  color: '#c13cff',
  sources: ['https://ultimateframedata.com/sf6/juri'],
  classic: {
    command: [
      { d: 6, b: 'MP', name: 'Kyosesho' },
      { d: 6, b: 'MK', name: 'Senkai Kick' },
      { d: 6, b: 'HP', name: 'Renko Kicks' },
      { d: 4, b: 'HK', name: 'Korenzan' }
    ],
    tc: [
      { name: 'Death Crest', seq: [{ n: '5MP' }, { b: 'HP', d: [4], n: '4HP' }, { b: 'HP', d: [4, 5, 6], n: '5HP' }] }
    ],
    specials: [
      { name: 'Sakkai Fuhazan', tag: 'SA1', m: '236236', type: 'K', min: 1, max: 2, kind: 'super' },
      { name: 'Kaisen Dankairaku', tag: 'SA3', m: '214214', type: 'K', min: 1, max: 2, kind: 'super' },
      { name: 'Feng Shui Engine', tag: 'SA2', m: '214214', type: 'P', min: 1, max: 2, kind: 'super' },
      { name: 'Shiku-sen OD', m: '214', type: 'K', min: 2, max: 2, air: true, fwd: true, kind: 'special' },
      { name: 'Shiku-sen', m: '214', type: 'K', min: 1, max: 1, air: true, fwd: true, kind: 'special' },
      { name: 'Saihasho OD', m: '236', exact: ['LK', 'MK'], kind: 'special' },
      { name: 'Ankensatsu OD', m: '236', exact: ['LK', 'HK'], kind: 'special' },
      { name: 'Go Ohsatsu OD', m: '236', exact: ['MK', 'HK'], kind: 'special' },
      { name: 'Fuhajin OD', m: '214', type: 'K', min: 2, max: 2, kind: 'special' },
      { name: 'Tensenrin OD', m: '623', type: 'P', min: 2, max: 2, kind: 'special' },
      { name: 'Saihasho', m: '236', exact: ['LK'], kind: 'special' },
      { name: 'Ankensatsu', m: '236', exact: ['MK'], kind: 'special' },
      { name: 'Go Ohsatsu', m: '236', exact: ['HK'], kind: 'special' },
      { name: 'Fuhajin', m: '214', type: 'K', kind: 'special', strength: true },
      { name: 'Tensenrin', m: '623', type: 'P', kind: 'special', strength: true }
    ],
    followups: [{ after: 'Shiku-sen', type: 'K', name: 'Shiren-sen', win: 45 }],
    fd: {
      '5LP': [4, 4, 14, 'csS'], '5MP': [6, 5, 21, 'sSt'], '5HP': [10, 3, 36, 'sS'],
      '5LK': [5, 3, 16, 'sS'], '5MK': [5, 6, 27, 'sS'], '5HK': [17, 4, 39, ''],
      '2LP': [4, 3, 14, 'csS'], '2MP': [6, 4, 23, 'sS'], '2HP': [8, 4, 34, 'sS'],
      '2LK': [5, 3, 15, 'c'], '2MK': [8, 3, 29, 'sS'], '2HK': [10, 3, 35, ''],
      '6MP': [8, 3, 27, 'sS'], '6MK': [21, 2, 43, ''], '6HP': [15, 11, 45, 'sS'], '4HK': [10, 12, 40, 'sS'],
      'j.MP': [7, 5, 0, 'sS'],
      'TC:Death Crest:0': [6, 5, 21, 'sSt'], 'TC:Death Crest:1': [12, 3, 33, 'St'], 'TC:Death Crest:2': [17, 3, 46, ''],
      'Fuhajin (ligero)': [10, 4, 34, ''], 'Fuhajin (medio)': [13, 4, 37, ''], 'Fuhajin (fuerte)': [25, 5, 48, ''], 'Fuhajin OD': [12, 6, 38, ''],
      'Saihasho': [16, 10, 45, 's'], 'Ankensatsu': [24, 4, 46, 's'], 'Go Ohsatsu': [18, 4, 48, 's'],
      'Saihasho OD': [11, 10, 38, 's'], 'Ankensatsu OD': [24, 4, 46, 's'], 'Go Ohsatsu OD': [18, 4, 97, 's'],
      'Tensenrin (ligero)': [11, 3, 39, ''], 'Tensenrin (medio)': [5, 8, 62, ''], 'Tensenrin (fuerte)': [5, 8, 62, ''], 'Tensenrin OD': [6, 4, 75, ''],
      'Shiku-sen': [18, 4, 36, ''], 'Shiku-sen OD': [16, 4, 34, ''], 'Shiren-sen': [8, 4, 30, ''],
      'Sakkai Fuhazan': [7, 5, 70, ''], 'Feng Shui Engine': [7, 2, 45, ''], 'Kaisen Dankairaku': [10, 4, 66, '']
    }
  },
  modern: { verified: false, sp: { N: 'Saihasho', D: 'Ankensatsu', B: 'Fuhajin', F: 'Tensenrin' }, air: 'Shiku-sen' }
});
