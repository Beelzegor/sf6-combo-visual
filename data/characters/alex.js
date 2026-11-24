SF6.registerCharacter({
  id: "alex",
  name: "Alex",
  color: "#3f7fbf",
  sources: ["https://github.com/D4RKONION/FAT"],
  generated: true,
  jump: [4, 38],
  classic: {
    command: [
      {"d": 6, "b": "MP", "name": "Chop"},
      {"d": 4, "b": "MK", "name": "Oblique Stomp"}
    ],
    tc: [
      {"name": "Twisted Drop", "seq": [{"n": "2LK"}, {"b": "HK", "d": [1, 2, 3], "n": "2HK"}]},
      {"name": "Palm Strikes", "seq": [{"n": "5MP"}, {"b": "HP", "d": [4, 5, 6], "n": "5HP"}]}
    ],
    specials: [
      {"name": "Raging Spear", "m": "236236", "tag": "SA1", "type": "K", "min": 1, "max": 2, "kind": "super"},
      {"name": "Sledgecross Hammer", "m": "214214", "tag": "SA2", "type": "P", "min": 1, "max": 2, "kind": "super"},
      {"name": "The Final Prison", "m": "236236", "tag": "SA3", "type": "P", "min": 1, "max": 2, "kind": "super"},
      {"name": "Power Bomb OD", "m": "63214", "type": "P", "min": 2, "max": 2, "kind": "special"},
      {"name": "Power Bomb", "m": "63214", "type": "P", "strength": true, "kind": "special"},
      {"name": "Aerial Knee Smash OD", "m": "623", "type": "K", "min": 2, "max": 2, "kind": "special"},
      {"name": "Aerial Knee Smash", "m": "623", "type": "K", "strength": true, "kind": "special"},
      {"name": "Flash Chop OD", "m": "236", "type": "P", "min": 2, "max": 2, "kind": "special"},
      {"name": "Flash Chop", "m": "236", "exact": ["HP"], "kind": "special"},
      {"name": "Flash Axe", "m": "236", "type": "P", "strength": true, "kind": "special"}
    ],
    followups: [],
    pairs: [
      {"type": "P", "n": 2, "name": "Prowler Stance", "kind": "special", "d": [1, 2, 3]}
    ],
    fd: {
      "5LP": [4, 2, 14, "csS"],
      "5MP": [7, 4, 24, "sSt"],
      "5HP": [12, 5, 35, "S"],
      "5LK": [6, 2, 20, "sS"],
      "5MK": [9, 3, 30, ""],
      "5HK": [16, 3, 41, ""],
      "2LP": [5, 3, 15, "csS"],
      "2MP": [8, 2, 25, "sS"],
      "2HP": [9, 6, 36, "sS"],
      "2LK": [5, 3, 18, "ct"],
      "2MK": [8, 3, 28, ""],
      "2HK": [10, 3, 38, ""],
      "j.LP": [5, 8, 0, ""],
      "j.MP": [7, 4, 0, ""],
      "j.HP": [9, 6, 0, ""],
      "j.LK": [6, 9, 0, ""],
      "j.MK": [8, 7, 0, ""],
      "j.HK": [10, 7, 0, ""],
      "6MP": [22, 2, 42, ""],
      "4MK": [7, 3, 24, ""],
      "Prowler Stance": [18, 3, 40, ""],
      "Flash Axe (ligero)": [13, 3, 36, "S"],
      "Flash Axe (medio)": [17, 4, 43, "S"],
      "Flash Chop": [26, 4, 48, "S"],
      "Flash Chop OD": [15, 4, 43, "S", 2],
      "Aerial Knee Smash (ligero)": [6, 8, 56, ""],
      "Aerial Knee Smash (medio)": [8, 9, 58, ""],
      "Aerial Knee Smash (fuerte)": [14, 8, 70, ""],
      "Aerial Knee Smash OD": [10, 8, 70, ""],
      "Power Bomb (ligero)": [9, 3, 61, ""],
      "Power Bomb (medio)": [7, 3, 61, ""],
      "Power Bomb (fuerte)": [5, 3, 61, ""],
      "Power Bomb OD": [5, 3, 61, ""],
      "Raging Spear": [9, 5, 68, ""],
      "Sledgecross Hammer": [13, 4, 66, ""],
      "The Final Prison": [12, 5, 69, ""],
      "TC:Twisted Drop:0": [5, 3, 18, "ct"],
      "TC:Twisted Drop:1": [15, 3, 47, "", 2],
      "TC:Palm Strikes:0": [7, 4, 24, "sSt"],
      "TC:Palm Strikes:1": [15, 3, 38, "", 2]
    }
  },
  modern: {"verified": false, "sp": {"N": "Flash Axe", "F": "Aerial Knee Smash", "D": "Aerial Knee Smash", "B": "Power Bomb"}}
});
