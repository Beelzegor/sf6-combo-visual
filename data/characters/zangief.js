SF6.registerCharacter({
  id: "zangief",
  name: "Zangief",
  color: "#c0302f",
  sources: ["https://github.com/D4RKONION/FAT"],
  generated: true,
  jump: [5, 38],
  classic: {
    command: [
      {"d": 3, "b": "MP", "name": "Hellstab"},
      {"d": 6, "b": "MK", "name": "Knee Hammer"},
      {"d": 6, "b": "HP", "name": "Headbutt"},
      {"d": 6, "b": "HK", "name": "Cyclone Wheel Kick"},
      {"d": 3, "b": "HK", "name": "Smetana Dropkick"}
    ],
    tc: [
      {"name": "Machine Gun Chops", "seq": [{"n": "5MP"}, {"b": "MP", "d": [4, 5, 6], "n": "5MP"}, {"b": "MP", "d": [4, 5, 6], "n": "5MP"}]}
    ],
    specials: [
      {"name": "Bolshoi Storm Buster", "m": "42684268", "tag": "SA3", "type": "P", "min": 1, "max": 2, "kind": "super"},
      {"name": "Aerial Russian Slam", "m": "236236", "tag": "SA1", "type": "K", "min": 1, "max": 2, "kind": "super"},
      {"name": "Cyclone Lariat", "m": "236236", "tag": "SA2", "type": "P", "min": 1, "max": 2, "kind": "super"},
      {"name": "Borscht Dynamite OD", "m": "4268", "type": "K", "min": 2, "max": 2, "air": true, "kind": "special"},
      {"name": "Borscht Dynamite", "m": "4268", "type": "K", "min": 1, "max": 1, "air": true, "kind": "special"},
      {"name": "Screw Piledriver OD", "m": "4268", "type": "P", "min": 2, "max": 2, "kind": "special"},
      {"name": "Screw Piledriver", "m": "4268", "type": "P", "strength": true, "kind": "special"},
      {"name": "Tundra Storm", "m": "22", "exact": ["HK"], "kind": "special"}
    ],
    followups: [],
    pairs: [
      {"type": "P", "n": 2, "name": "Double Lariat", "kind": "special"},
      {"type": "P", "n": 3, "name": "Double Lariat OD", "kind": "special"}
    ],
    fd: {
      "5LP": [7, 3, 18, "csS"],
      "5MP": [9, 4, 29, "t"],
      "5HP": [16, 3, 40, ""],
      "5LK": [7, 2, 25, "sS"],
      "5MK": [10, 4, 32, ""],
      "5HK": [13, 4, 37, ""],
      "2LP": [6, 2, 15, "csS"],
      "2MP": [8, 3, 26, "sS"],
      "2HP": [11, 9, 54, ""],
      "2LK": [4, 3, 18, "c"],
      "2MK": [9, 3, 29, ""],
      "2HK": [12, 3, 41, ""],
      "j.LP": [5, 7, 0, ""],
      "j.MP": [8, 5, 0, ""],
      "j.HP": [9, 6, 0, ""],
      "j.LK": [5, 10, 0, ""],
      "j.MK": [8, 8, 0, ""],
      "j.HK": [10, 7, 0, ""],
      "3MP": [7, 3, 30, "sS"],
      "6MK": [14, 7, 33, ""],
      "6HP": [14, 5, 33, "sS"],
      "6HK": [22, 12, 53, ""],
      "3HK": [16, 4, 59, ""],
      "Double Lariat": [15, 31, 72, "S", 4],
      "Double Lariat OD": [12, 25, 62, "S", 5],
      "Screw Piledriver (ligero)": [5, 3, 61, ""],
      "Screw Piledriver (medio)": [5, 3, 61, ""],
      "Screw Piledriver (fuerte)": [5, 3, 61, ""],
      "Screw Piledriver OD": [5, 3, 61, ""],
      "Borscht Dynamite": [4, 3, 22, ""],
      "Borscht Dynamite OD": [4, 3, 22, ""],
      "Tundra Storm": [6, 50, 79, ""],
      "Aerial Russian Slam": [11, 7, 77, ""],
      "Cyclone Lariat": [18, 102, 171, "", 5],
      "Bolshoi Storm Buster": [6, 2, 123, ""],
      "TC:Machine Gun Chops:0": [9, 4, 29, "t"],
      "TC:Machine Gun Chops:1": [9, 4, 32, "t"],
      "TC:Machine Gun Chops:2": [15, 3, 49, ""]
    }
  },
  modern: {"verified": false, "sp": {"N": "Screw Piledriver", "F": "Screw Piledriver"}, "air": "Borscht Dynamite"}
});
