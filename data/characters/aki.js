SF6.registerCharacter({
  id: "aki",
  name: "A.K.I.",
  color: "#9b4dca",
  sources: ["https://github.com/D4RKONION/FAT"],
  generated: true,
  jump: [4, 40],
  classic: {
    command: [
      {"d": 3, "b": "MP", "name": "Pu Lao"},
      {"d": 6, "b": "HP", "name": "Chi Wen"},
      {"d": 6, "b": "HK", "name": "Qiu Niu"}
    ],
    tc: [
      {"name": "Qiong Qi", "seq": [{"n": "5HP"}, {"b": "HP", "d": [4, 5, 6], "n": "5HP"}]},
      {"name": "Hun Dun", "seq": [{"n": "5LP"}, {"b": "LP", "d": [4, 5, 6], "n": "5LP"}]}
    ],
    specials: [
      {"name": "Deadly Implication", "m": "236236", "tag": "SA1", "type": "K", "min": 1, "max": 2, "kind": "super"},
      {"name": "Tainted Talons", "m": "214214", "tag": "SA2", "type": "P", "min": 1, "max": 2, "kind": "super"},
      {"name": "Claws of Ya Zi", "m": "236236", "tag": "SA3", "type": "P", "min": 1, "max": 2, "kind": "super"},
      {"name": "Nightshade Pulse OD", "m": "214", "type": "P", "min": 2, "max": 2, "kind": "special"},
      {"name": "Serpent Lash OD", "m": "236", "type": "P", "min": 2, "max": 2, "kind": "special"},
      {"name": "Cruel Fate OD", "m": "214", "type": "K", "min": 2, "max": 2, "kind": "special"},
      {"name": "Snake Step OD", "m": "236", "type": "K", "min": 2, "max": 2, "kind": "special"},
      {"name": "Nightshade Pulse", "m": "214", "exact": ["LP"], "kind": "special"},
      {"name": "Orchid Spring", "m": "214", "exact": ["MP"], "kind": "special"},
      {"name": "Toxic Wreath", "m": "214", "exact": ["HP"], "kind": "special"},
      {"name": "Serpent Lash", "m": "236", "type": "P", "strength": true, "kind": "special"},
      {"name": "Cruel Fate", "m": "214", "type": "K", "strength": true, "kind": "special"},
      {"name": "Snake Step", "m": "236", "type": "K", "strength": true, "kind": "special"}
    ],
    followups: [
      {"after": "Sinister Slide", "type": "K", "d": 5, "name": "Heel Strike", "win": 45},
      {"after": "Sinister Slide", "type": "P", "d": 5, "name": "Venomous Fang", "win": 45},
      {"after": "Nightshade Pulse", "type": "P", "d": 6, "name": "Nightshade Chaser", "win": 45}
    ],
    pairs: [
      {"type": "P", "n": 2, "name": "Sinister Slide", "kind": "special", "d": [1, 2, 3]}
    ],
    fd: {
      "5LP": [5, 2, 13, "csSt"],
      "5MP": [6, 5, 24, "sS"],
      "5HP": [12, 3, 35, "t"],
      "5LK": [4, 3, 18, "sS"],
      "5MK": [8, 3, 25, ""],
      "5HK": [9, 4, 31, "sS"],
      "2LP": [4, 2, 14, "csS"],
      "2MP": [7, 3, 27, "sS"],
      "2HP": [10, 3, 40, ""],
      "2LK": [5, 3, 15, "c"],
      "2MK": [7, 3, 25, "S"],
      "2HK": [10, 6, 35, "S"],
      "j.LP": [5, 9, 0, ""],
      "j.MP": [7, 4, 0, ""],
      "j.HP": [11, 6, 0, ""],
      "j.LK": [5, 6, 0, ""],
      "j.MK": [7, 6, 0, ""],
      "j.HK": [8, 8, 0, ""],
      "3MP": [24, 3, 44, ""],
      "6HP": [16, 4, 38, "S"],
      "6HK": [14, 11, 40, "", 2],
      "Sinister Slide": [11, 3, 216, ""],
      "Nightshade Pulse": [17, 3, 52, "S"],
      "Nightshade Pulse OD": [16, 3, 44, "S", 2],
      "Orchid Spring": [26, 160, 46, ""],
      "Toxic Wreath": [13, 26, 51, "S", 2],
      "Serpent Lash (ligero)": [14, 3, 36, "S"],
      "Serpent Lash (medio)": [14, 9, 43, "S"],
      "Serpent Lash (fuerte)": [11, 6, 48, "S"],
      "Serpent Lash OD": [21, 5, 50, "S"],
      "Cruel Fate (ligero)": [24, 22, 63, "S", 4],
      "Cruel Fate (medio)": [28, 22, 67, "S", 4],
      "Cruel Fate (fuerte)": [33, 22, 72, "S", 4],
      "Cruel Fate OD": [28, 22, 67, "S", 4],
      "Deadly Implication": [10, 3, 80, ""],
      "Tainted Talons": [7, 93, 153, ""],
      "Claws of Ya Zi": [10, 3, 70, ""],
      "Heel Strike": [22, 15, 42, "S", 2],
      "Venomous Fang": [30, 15, 63, ""],
      "Nightshade Chaser": [13, 2, 48, "S"],
      "TC:Qiong Qi:0": [12, 3, 35, "t"],
      "TC:Qiong Qi:1": [14, 3, 40, ""],
      "TC:Hun Dun:0": [5, 2, 13, "csSt"],
      "TC:Hun Dun:1": [8, 2, 24, "sS"]
    }
  },
  modern: {"verified": false, "sp": {"B": "Nightshade Pulse", "F": "Serpent Lash", "D": "Cruel Fate"}}
});
