const SLOTS = [
  ['UP', 'Arriba', 'dir', 'b'], ['DOWN', 'Abajo', 'dir', 'b'], ['LEFT', 'Izquierda', 'dir', 'b'], ['RIGHT', 'Derecha', 'dir', 'b'],
  ['LP', 'LP', '', 'c'], ['MP', 'MP', '', 'c'], ['HP', 'HP', '', 'c'], ['LK', 'LK', '', 'c'], ['MK', 'MK', '', 'c'], ['HK', 'HK', '', 'c'],
  ['DP', 'Drive Parry (MP+MK)', '', 'c'], ['DI', 'Drive Impact (HP+HK)', '', 'c'], ['THROW', 'Agarre (LP+LK)', '', 'c'],
  ['PP', 'Puños OD (LP+MP)', '', 'c'], ['KK', 'Patadas OD (LK+MK)', '', 'c'],
  ['L', 'L (ligero)', '', 'm'], ['M', 'M (medio)', '', 'm'], ['H', 'H (fuerte)', '', 'm'], ['SP', 'SP (especial)', '', 'm'], ['AUTO', 'Auto (asistido)', '', 'm'],
  ['MDI', 'Drive Impact', '', 'm'], ['MDP', 'Drive Parry', '', 'm'], ['MTH', 'Agarre', '', 'm'],
  ['REC', 'Grabar / detener', '', 'b']
];
const SLOT_MASK = { LP: 1, MP: 2, HP: 4, LK: 8, MK: 16, HK: 32, DP: 2 | 16, DI: 4 | 32, THROW: 1 | 8, PP: 1 | 2, KK: 8 | 16 };
const MSLOT_MASK = { L: 1, M: 2, H: 4, SP: 8, AUTO: 16, MDI: 32, MDP: 64, MTH: 128 };
const slotGroup = s => (SLOTS.find(x => x[0] === s) || [])[3];
const sameGroup = (a, b) => { const ga = slotGroup(a), gb = slotGroup(b); return ga === gb || ga === 'b' || gb === 'b'; };
const DEFAULT_PROFILE = () => ({
  name: 'Por defecto (Xbox)',
  pad: { UP: null, DOWN: null, LEFT: null, RIGHT: null, LP: 'b2', MP: 'b3', HP: 'b5', LK: 'b0', MK: 'b1', HK: 'b7', DP: null, DI: null, THROW: null, PP: null, KK: null, L: 'b2', M: 'b0', H: 'b1', SP: 'b3', AUTO: 'b7', MDI: 'b4', MDP: 'b5', MTH: 'b6', REC: 'b8' },
  keys: { UP: 'KeyW', DOWN: 'KeyS', LEFT: 'KeyA', RIGHT: 'KeyD', LP: 'KeyU', MP: 'KeyI', HP: 'KeyO', LK: 'KeyJ', MK: 'KeyK', HK: 'KeyL', DP: null, DI: null, THROW: null, PP: null, KK: null, L: 'KeyU', M: 'KeyI', H: 'KeyO', SP: 'KeyJ', AUTO: 'KeyK', MDI: 'KeyP', MDP: 'KeyL', MTH: 'KeyY', REC: 'Enter' }
});
const prof = {
  list: store.get('profiles', null) || [DEFAULT_PROFILE()],
  active: store.get('profileActive', 0)
};
if (!prof.list[prof.active]) prof.active = 0;
prof.list.forEach(p => { const d = DEFAULT_PROFILE(); for (const k of Object.keys(d.pad)) if (!(k in p.pad)) p.pad[k] = d.pad[k]; for (const k of Object.keys(d.keys)) if (!(k in p.keys)) p.keys[k] = d.keys[k]; });
const P = () => prof.list[prof.active];
function saveProfiles() { store.set('profiles', prof.list); store.set('profileActive', prof.active); }

const gp = { assign: null, prevBtns: [], recording: false, frames: [], t0: 0, pad: null, base: null };
const keys = new Set();
const typing = () => ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
function keySlot(code) { const k = P().keys; return Object.keys(k).find(s => k[s] === code && sameGroup(s, app.scheme === 'modern' ? 'L' : 'LP')); }

window.addEventListener('keydown', e => {
  if (gp.assign && gp.assign.dev === 'key') {
    e.preventDefault();
    if (e.code !== 'Escape') {
      const k = P().keys;
      for (const s of Object.keys(k)) if (k[s] === e.code && sameGroup(s, gp.assign.slot)) k[s] = null;
      k[gp.assign.slot] = e.code;
      saveProfiles();
    }
    gp.assign = null; buildMap(); return;
  }
  if (typing()) return;
  const slot = keySlot(e.code);
  if (!slot) return;
  e.preventDefault();
  if (slot === 'REC') { if (!e.repeat) toggleRec(); return; }
  keys.add(e.code);
});
window.addEventListener('keyup', e => keys.delete(e.code));
window.addEventListener('blur', () => keys.clear());

function padLabel(v) {
  if (!v) return '<span class="muted">sin asignar</span>';
  if (v[0] === 'b') return 'botón ' + v.slice(1);
  const m = v.match(/^a(\d+)([+-])$/);
  return m ? 'eje ' + m[1] + ' ' + m[2] : v;
}
function keyLabel(v) {
  if (!v) return '<span class="muted">sin asignar</span>';
  return v.replace(/^Key/, '').replace(/^Digit/, '').replace(/^Arrow/, 'Flecha ').replace('Numpad', 'Num ');
}

function buildMap() {
  const p = P();
  $('profSel').innerHTML = prof.list.map((x, i) => `<option value="${i}" ${i === prof.active ? 'selected' : ''}>${esc(x.name)}</option>`).join('');
  const waiting = (s, dev) => gp.assign && gp.assign.slot === s && gp.assign.dev === dev;
  const grp = app.scheme === 'modern' ? 'm' : 'c';
  $('map').innerHTML = '<span class="k muted">Acción</span><span class="k muted">Control</span><span class="k muted">Teclado</span><span></span>' + SLOTS.filter(x => x[3] === 'b' || x[3] === grp).map(([s, label, kind]) => `
    <span class="k">${label}${kind === 'dir' ? ' <span class="muted">(opcional)</span>' : ''}</span>
    <button class="slotbtn ${waiting(s, 'pad') ? 'wait' : ''}" data-s="${s}" data-d="pad">${waiting(s, 'pad') ? 'pulsa en el control...' : padLabel(p.pad[s])}</button>
    <button class="slotbtn ${waiting(s, 'key') ? 'wait' : ''}" data-s="${s}" data-d="key">${waiting(s, 'key') ? 'pulsa una tecla...' : keyLabel(p.keys[s])}</button>
    <button class="btn sm" data-clear="${s}" title="Quitar asignaciones">✕</button>`).join('');
  $('map').querySelectorAll('.slotbtn').forEach(b => b.onclick = () => {
    gp.assign = { slot: b.dataset.s, dev: b.dataset.d };
    gp.base = gp.pad ? gp.pad.axes.slice() : null;
    b.blur(); buildMap();
  });
  $('map').querySelectorAll('[data-clear]').forEach(b => b.onclick = () => { p.pad[b.dataset.clear] = null; p.keys[b.dataset.clear] = null; saveProfiles(); buildMap(); });
}

$('profSel').onchange = e => { prof.active = +e.target.value; gp.assign = null; saveProfiles(); buildMap(); toast('Perfil activo: ' + P().name); };
$('profNew').onclick = () => { const p = DEFAULT_PROFILE(); p.name = 'Perfil ' + (prof.list.length + 1); prof.list.push(p); prof.active = prof.list.length - 1; saveProfiles(); buildMap(); renameProfile(); };
$('profDup').onclick = () => { const p = JSON.parse(JSON.stringify(P())); p.name += ' (copia)'; prof.list.push(p); prof.active = prof.list.length - 1; saveProfiles(); buildMap(); };
$('profRen').onclick = () => renameProfile();
$('profDel').onclick = () => {
  if (prof.list.length === 1) { toast('Tiene que quedar al menos un perfil'); return; }
  modal(`<h3 style="margin-top:0">¿Eliminar el perfil "${esc(P().name)}"?</h3><button class="btn" id="delYes" style="border-color:#a03040">Eliminar</button>`);
  $('delYes').onclick = () => { prof.list.splice(prof.active, 1); prof.active = 0; saveProfiles(); buildMap(); $('modal').classList.remove('on'); };
};
$('profExp').onclick = () => copy('SF6CTRL:' + encode(P()));
$('profImp').onclick = () => {
  modal('<h3 style="margin-top:0">Importar perfil de control</h3><textarea id="profIn" style="width:600px;max-width:85vw;height:100px" placeholder="SF6CTRL:..."></textarea><div class="row" style="margin-top:8px"><button class="btn pri" id="profGo">Importar</button></div>');
  $('profGo').onclick = () => {
    try {
      const p = decode($('profIn').value.replace(/^SF6CTRL:/, ''));
      if (!p.pad || !p.keys) throw 0;
      const d = DEFAULT_PROFILE();
      p.pad = Object.assign(Object.fromEntries(Object.keys(d.pad).map(k => [k, null])), p.pad);
      p.keys = Object.assign(Object.fromEntries(Object.keys(d.keys).map(k => [k, null])), p.keys);
      prof.list.push(p); prof.active = prof.list.length - 1; saveProfiles(); buildMap();
      $('modal').classList.remove('on'); toast('Perfil importado');
    } catch (e) { toast('Código de perfil no válido'); }
  };
};
function renameProfile() {
  modal(`<h3 style="margin-top:0">Nombre del perfil</h3><input type="text" id="profName" value="${esc(P().name)}" style="width:420px;max-width:80vw"><div class="row" style="margin-top:8px"><button class="btn pri" id="profNameOk">Guardar</button></div>`);
  const go = () => { const v = $('profName').value.trim(); if (v) { P().name = v; saveProfiles(); buildMap(); } $('modal').classList.remove('on'); };
  $('profNameOk').onclick = go;
  $('profName').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  $('profName').focus(); $('profName').select();
}

function hatDir(v) {
  if (v === undefined || v < -1.05 || v > 1.05) return null;
  const table = [[-1, 8], [-0.714, 9], [-0.428, 6], [-0.142, 3], [0.142, 2], [0.428, 1], [0.714, 4], [1, 7]];
  for (const [t, d] of table) if (Math.abs(v - t) < 0.1) return d;
  return null;
}

function padActive(pad, btns, v) {
  if (!v || !pad) return false;
  if (v[0] === 'b') return !!btns[+v.slice(1)];
  const m = v.match(/^a(\d+)([+-])$/);
  if (!m) return false;
  const a = pad.axes[+m[1]] || 0;
  return m[2] === '+' ? a > 0.5 : a < -0.5;
}

function readState() {
  let x = 0, y = 0, mask = 0, mmask = 0;
  let pads = [];
  try { pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : []; }
  catch (e) {
    if (!gp.blocked) { gp.blocked = true; $('gpName').textContent = 'Esta vista bloquea el acceso al control. Abre el archivo HTML en tu navegador o usa el script de escritorio. El teclado sí funciona aquí.'; }
    pads = [];
  }
  const pad = pads[0] || null;
  const pid = pad ? pad.id : '';
  if (pid !== gp.pid && !gp.blocked) {
    gp.pid = pid;
    $('gpDot').classList.toggle('on', !!pad);
    $('gpName').textContent = pad ? pad.id.replace(/\(.*?Vendor.*?\)/, '').trim() : 'Sin control detectado: pulsa cualquier botón del control';
  }
  gp.pad = pad;
  const p = P();
  let btns = [];
  if (pad) {
    btns = pad.buttons.map(b => b.pressed || b.value > 0.5);
    if (gp.assign && gp.assign.dev === 'pad') {
      let found = null;
      const i = btns.findIndex((on, k) => on && !gp.prevBtns[k]);
      if (i >= 0) found = 'b' + i;
      else if (gp.base) pad.axes.forEach((a, k) => { if (!found && k !== 9 && Math.abs(a - (gp.base[k] || 0)) > 0.6 && Math.abs(a) > 0.6) found = 'a' + k + (a > 0 ? '+' : '-'); });
      if (found) {
        for (const s of Object.keys(p.pad)) if (p.pad[s] === found && sameGroup(s, gp.assign.slot)) p.pad[s] = null;
        p.pad[gp.assign.slot] = found; gp.assign = null; saveProfiles(); buildMap();
      }
      gp.prevBtns = btns;
      return { d: 5, m: 0, mm: 0 };
    }
    const cu = padActive(pad, btns, p.pad.UP), cd = padActive(pad, btns, p.pad.DOWN), cl = padActive(pad, btns, p.pad.LEFT), cr = padActive(pad, btns, p.pad.RIGHT);
    const used = new Set(Object.values(p.pad).filter(Boolean));
    const std = k => !used.has('b' + k) && btns[k];
    const up = cu || std(12), dn = cd || std(13), lf = cl || std(14), rt = cr || std(15);
    const ax = pad.axes[0] || 0, ay = pad.axes[1] || 0;
    const stickFree = !['a0+', 'a0-', 'a1+', 'a1-'].some(v => used.has(v));
    if (up || dn || lf || rt) { y = up ? 1 : (dn ? -1 : 0); x = lf === rt ? 0 : (rt ? 1 : -1); }
    else if (stickFree && Math.hypot(ax, ay) > 0.5) {
      const a = Math.atan2(-ay, ax), oct = Math.round(a / (Math.PI / 4));
      [x, y] = { 0: [1, 0], 1: [1, 1], 2: [0, 1], 3: [-1, 1], 4: [-1, 0], '-4': [-1, 0], '-3': [-1, -1], '-2': [0, -1], '-1': [1, -1] }[oct];
    } else {
      const h = hatDir(pad.axes[9]);
      if (h) { x = ((h - 1) % 3) - 1; y = Math.floor((h - 1) / 3) - 1; }
    }
    for (const s of Object.keys(SLOT_MASK)) if (padActive(pad, btns, p.pad[s])) mask |= SLOT_MASK[s];
    for (const s of Object.keys(MSLOT_MASK)) if (padActive(pad, btns, p.pad[s])) mmask |= MSLOT_MASK[s];
    if (padActive(pad, btns, p.pad.REC) && !padActive(pad, gp.prevBtns, p.pad.REC) && p.pad.REC[0] === 'b') toggleRec();
  }
  gp.prevBtns = btns;
  const kd = s => p.keys[s] && keys.has(p.keys[s]);
  const ku = kd('UP'), kdn = kd('DOWN'), kl = kd('LEFT'), kr = kd('RIGHT');
  if (ku || kdn || kl || kr) { y = ku ? 1 : (kdn ? -1 : y); x = kl === kr ? (kl ? 0 : x) : (kr ? 1 : -1); }
  for (const s of Object.keys(SLOT_MASK)) if (kd(s)) mask |= SLOT_MASK[s];
  for (const s of Object.keys(MSLOT_MASK)) if (kd(s)) mmask |= MSLOT_MASK[s];
  return { d: 5 + x + 3 * y, m: mask, mm: mmask };
}

