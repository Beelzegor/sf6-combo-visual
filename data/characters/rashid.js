SF6.registerCharacter({
  id: "rashid",
  name: "Rashid",
  color: "#2fb3a0",
  sources: ["https://github.com/D4RKONION/FAT"],
  generated: true,
  jump: [4, 38],
  classic: {
    command: [
      {"d": 6, "b": "MP", "name": "Flapping Spin"},
      {"d": 6, "b": "HP", "name": "Beak Assault"},
      {"d": 6, "b": "HK", "name": "Crescent Kick"}
    ],
    tc: [
      {"name": "Rising Kick", "seq": [{"n": "5MP"}, {"b": "HK", "d": [4, 5, 6], "n": "5HK"}]}
    ],
    specials: [
      {"name": "Super Rashid Kick", "m": "236236", "tag": "SA1", "type": "K", "min": 1, "max": 2, "kind": "super"},
      {"name": "Ysaar", "m": "214214", "tag": "SA2", "type": "K", "min": 1, "max": 2, "kind": "super"},
      {"name": "Altair", "m": "236236", "tag": "SA3", "type": "P", "min": 1, "max": 2, "kind": "super"},
      {"name": "Arabian Skyhigh OD", "m": "214", "type": "K", "min": 2, "max": 2, "air": true, "kind": "special"},
      {"name": "Arabian Skyhigh", "m": "214", "type": "K", "strength": true, "air": true, "kind": "special"},
      {"name": "Spinning Mixer OD", "m": "236", "type": "P", "min": 2, "max": 2, "kind": "special"},
      {"name": "Eagle Spike OD", "m": "214", "type": "K", "min": 2, "max": 2, "kind": "special"},
      {"name": "Whirlwind Shot OD", "m": "236", "type": "K", "min": 2, "max": 2, "kind": "special"},
      {"name": "Arabian Cyclone OD", "m": "214", "type": "P", "min": 2, "max": 2, "kind": "special"},
      {"name": "Spinning Mixer", "m": "236", "type": "P", "strength": true, "kind": "special"},
      {"name": "Eagle Spike", "m": "214", "type": "K", "strength": true, "kind": "special"},
      {"name": "Whirlwind Shot", "m": "236", "type": "K", "min": 1, "max": 1, "kind": "special"},
      {"name": "Arabian Cyclone", "m": "214", "type": "P", "strength": true, "kind": "special"}
    ],
    followups: [
      {"after": "Arabian Cyclone", "type": "K", "d": 4, "name": "Wing Stroke", "win": 52},
      {"after": "Arabian Cyclone", "type": "K", "d": 6, "name": "Rolling Assault", "win": 52}
    ],
    pairs: [
      {"type": "K", "n": 2, "name": "Side Flip", "kind": "special", "d": [6]}
    ],
    fd: {
      "5LP": [4, 2, 14, "csS"],
      "5MP": [6, 3, 22, "sSt"],
      "5HP": [9, 3, 32, "sS"],
      "5LK": [4, 3, 16, "sS"],
      "5MK": [8, 3, 27, ""],
      "5HK": [13, 8, 38, ""],
      "2LP": [5, 3, 14, "csS"],
      "2MP": [6, 4, 22, "sS"],
      "2HP": [12, 3, 35, "S"],
      "2LK": [5, 3, 15, "c"],
      "2MK": [7, 3, 27, "sS"],
      "2HK": [9, 3, 35, ""],
      "j.LP": [4, 5, 0, ""],
      "j.MP": [9, 5, 0, "s"],
      "j.HP": [8, 9, 0, "", 2],
      "j.LK": [5, 5, 0, ""],
      "j.MK": [7, 6, 0, ""],
      "j.HK": [10, 5, 0, ""],
      "6MP": [32, 18, 43, "sS", 2],
      "6HP": [22, 3, 45, ""],
      "6HK": [16, 4, 39, ""],
      "Spinning Mixer (ligero)": [8, 16, 42, "S", 3],
      "Spinning Mixer (medio)": [8, 19, 74, "S", 5],
      "Spinning Mixer (fuerte)": [6, 34, 77, "", 5],
      "Spinning Mixer OD": [6, 43, 110, "", 5],
      "Eagle Spike (ligero)": [15, 13, 58, "S"],
      "Eagle Spike (medio)": [21, 13, 59, ""],
      "Eagle Spike (fuerte)": [26, 13, 65, ""],
      "Eagle Spike OD": [21, 13, 59, ""],
      "Whirlwind Shot": [17, 3, 52, "S"],
      "Whirlwind Shot OD": [17, 3, 52, "S", 2],
      "Arabian Cyclone (ligero)": [15, 19, 47, "S"],
      "Arabian Cyclone (medio)": [20, 19, 50, "S"],
      "Arabian Cyclone (fuerte)": [27, 19, 69, "S"],
      "Arabian Cyclone OD": [20, 33, 49, "S"],
      "Arabian Skyhigh (ligero)": [13, 9, 24, ""],
      "Arabian Skyhigh (medio)": [18, 9, 29, ""],
      "Arabian Skyhigh (fuerte)": [21, 9, 32, ""],
      "Arabian Skyhigh OD": [13, 9, 24, ""],
      "Super Rashid Kick": [9, 7, 91, ""],
      "Ysaar": [11, 349, 33, "", 5],
      "Altair": [11, 18, 110, ""],
      "Wing Stroke": [32, 3, 67, ""],
      "TC:Rising Kick:0": [6, 3, 22, "sSt"],
      "TC:Rising Kick:1": [13, 4, 52, "sS"]
    }
  },
  modern: {"verified": false, "sp": {"F": "Spinning Mixer", "D": "Eagle Spike", "N": "Whirlwind Shot", "B": "Arabian Cyclone"}, "air": "Arabian Skyhigh"}
});
