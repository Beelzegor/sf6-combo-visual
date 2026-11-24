SF6.registerCharacter({
  id: "jamie",
  name: "Jamie",
  color: "#3fc1b0",
  sources: ["https://github.com/D4RKONION/FAT"],
  generated: true,
  jump: [4, 38],
  classic: {
    command: [
      {"d": 6, "b": "MK", "name": "Falling Star Kick"},
      {"d": 4, "b": "HP", "name": "Hermit's Elbow"},
      {"d": 6, "b": "HK", "name": "Senei Kick"}
    ],
    tc: [
      {"name": "Phantom Sway", "seq": [{"n": "2HK"}, {"b": "HK", "d": [4, 5, 6], "n": "5HK"}]}
    ],
    specials: [
      {"name": "Breakin'", "m": "236236", "tag": "SA1", "type": "K", "min": 1, "max": 2, "kind": "super"},
      {"name": "The Devil's Song", "m": "214214", "tag": "SA2", "type": "P", "min": 1, "max": 2, "kind": "super"},
      {"name": "Getsuga Saiho", "m": "236236", "tag": "SA3", "type": "P", "min": 1, "max": 2, "kind": "super"},
      {"name": "Arrow Kick OD", "m": "623", "type": "K", "min": 2, "max": 2, "kind": "special"},
      {"name": "Arrow Kick", "m": "623", "type": "K", "strength": true, "kind": "special"},
      {"name": "Freeflow Strikes OD", "m": "236", "type": "P", "min": 2, "max": 2, "kind": "special"},
      {"name": "Swagger Step OD", "m": "214", "type": "P", "min": 2, "max": 2, "kind": "special"},
      {"name": "Freeflow Strikes", "m": "236", "type": "P", "strength": true, "kind": "special"},
      {"name": "Swagger Step", "m": "214", "type": "P", "strength": true, "kind": "special"},
      {"name": "The Devil Inside", "m": "22", "type": "P", "min": 1, "max": 1, "kind": "special"}
    ],
    followups: [
      {"after": "Freeflow Strikes", "type": "P", "d": 6, "name": "Freeflow Strikes 2", "win": 45},
      {"after": "Freeflow Strikes", "type": "K", "d": 6, "name": "Freeflow Kicks 2", "win": 45}
    ],
    pairs: [],
    fd: {
      "5LP": [5, 2, 13, "sS"],
      "5MP": [8, 4, 25, ""],
      "5HP": [5, 10, 34, "sS", 3],
      "5LK": [5, 2, 17, "csS"],
      "5MK": [9, 3, 28, "sS"],
      "5HK": [15, 3, 38, "sS"],
      "2LP": [4, 2, 14, "csS"],
      "2MP": [6, 3, 21, "sS"],
      "2HP": [8, 5, 35, "sS"],
      "2LK": [5, 2, 17, "c"],
      "2MK": [7, 3, 27, "sS"],
      "2HK": [9, 7, 43, "t", 2],
      "j.LP": [5, 9, 0, ""],
      "j.MP": [7, 4, 0, "s"],
      "j.HP": [10, 6, 0, ""],
      "j.LK": [6, 6, 0, ""],
      "j.MK": [7, 6, 0, ""],
      "j.HK": [8, 12, 0, "", 2],
      "6MK": [22, 3, 44, ""],
      "4HP": [18, 4, 41, "S"],
      "6HK": [16, 3, 38, "S"],
      "The Devil Inside": [48, 3, 50, ""],
      "Freeflow Strikes (ligero)": [13, 2, 38, "S"],
      "Freeflow Strikes (medio)": [16, 2, 41, "S"],
      "Freeflow Strikes (fuerte)": [19, 2, 44, "S"],
      "Freeflow Strikes OD": [13, 2, 38, "S"],
      "Swagger Step (ligero)": [17, 9, 42, "S"],
      "Swagger Step (medio)": [20, 9, 45, "S"],
      "Swagger Step (fuerte)": [25, 9, 49, "S"],
      "Swagger Step OD": [20, 9, 43, "S"],
      "Arrow Kick (ligero)": [5, 10, 66, "", 2],
      "Arrow Kick (medio)": [8, 9, 67, "", 2],
      "Arrow Kick (fuerte)": [10, 9, 69, "", 3],
      "Arrow Kick OD": [6, 9, 65, "", 3],
      "Breakin'": [8, 127, 208, "", 5],
      "The Devil's Song": [1, 3, 6, ""],
      "Getsuga Saiho": [10, 19, 70, "", 2],
      "Freeflow Strikes 2": [13, 2, 42, ""],
      "Freeflow Kicks 2": [14, 2, 47, ""],
      "TC:Phantom Sway:0": [9, 7, 43, "t", 2],
      "TC:Phantom Sway:1": [12, 3, 57, ""]
    }
  },
  modern: {"verified": false, "sp": {"N": "Freeflow Strikes", "F": "Arrow Kick"}}
});
