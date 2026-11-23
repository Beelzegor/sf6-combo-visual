const app = {
  side: 'P1', flips: [], rec: null, steps: [], discarded: [], sel: -1, undo: [], fmt: 'h', source: '',
  char: store.get('char', 'juri'), scheme: store.get('scheme', 'classic')
};
if (!SF6.chars[app.char]) app.char = 'juri';
const charName = () => SF6.chars[app.char].name;
const schemeLabel = () => app.scheme === 'modern' ? 'Moderno' : 'Clásico';
const tagText = () => (charName() + ' · ' + schemeLabel()).toUpperCase();
const cls = n => SF6.classify(n, app.char, app.scheme);

const bridgeRec = { on: false, frames: [], sc: 'classic', n0: 0 };
function recUI(on) {
  $('recBtn').className = on ? 'btn rec' : 'btn pri';
  $('recBtn').textContent = on ? '■ Detener' : '● Grabar';
}
const bridge = createBridge({
  status(state, text) {
    $('brDot').className = 'dot' + (state === 'on' ? ' on' : '');
    $('brStatus').textContent = text;
    $('brBtn').textContent = state === 'on' || state === 'connecting' ? 'Desconectar' : 'Conectar';
    if (state !== 'on') lastLive = '';
  },
  info(msg) {
    $('brInfo').textContent = [msg.control, msg.perfil ? 'perfil ' + msg.perfil : '', msg.sc ? (msg.sc === 'modern' ? 'moderno' : 'clásico') : ''].filter(Boolean).join(' · ');
    if (msg.sc && msg.sc !== app.scheme) setScheme(msg.sc);
  },
  f(msg) {
    showLive(msg.d, msg.m, 'capturador');
    if (!bridgeRec.on) return;
    const idx = Math.max(0, msg.n - bridgeRec.n0);
    while (bridgeRec.frames.length < idx) bridgeRec.frames.push(bridgeRec.frames[bridgeRec.frames.length - 1] || [msg.d, msg.m]);
    bridgeRec.frames[idx] = [msg.d, msg.m];
    $('timer').textContent = bridgeRec.frames.length + ' frames · ' + (bridgeRec.frames.length / 60).toFixed(1) + ' s';
  },
  rec(msg) {
    if (msg.on) { bridgeRec.on = true; bridgeRec.frames = []; bridgeRec.n0 = msg.n || 0; bridgeRec.sc = msg.sc || app.scheme; recUI(true); return; }
    bridgeRec.on = false; recUI(false);
    const fr = trim(bridgeRec.frames);
    if (fr.length < 2) { toast('No se detectaron inputs en la grabación'); return; }
    loadRec({ version: 2, fps: 60, scheme: bridgeRec.sc, char: app.char, side: msg.side || app.side, frames: fr }, 'Capturador');
    if (msg.file) toast('También se guardó en ' + msg.file);
  }
});
$('brBtn').onclick = () => { if (bridge.connected || bridge.wantOpen) { bridge.disconnect(); } else bridge.connect(+$('brPort').value || 8765); };

function snapshot() { app.undo.push(JSON.stringify(app.steps)); if (app.undo.length > 60) app.undo.shift(); $('undoBtn').disabled = false; }
function autoCost(st) {
  if (st.drive === undefined) {
    const n = st.nota || '', nm = st.name || '';
    st.drive = n === 'DR' ? 3 : (n === 'PDR' || n === 'PARRY~66') ? 1 : (n === 'HP+HK' || n === 'DI') ? 1 : (n === 'MP+MK' || n === 'PARRY') ? 0.5 : / OD( \(|$)/.test(nm) ? 2 : 0;
  }
  if (st.sa === undefined) { const m = (st.name || '').match(/^SA([123])/); st.sa = m ? +m[1] : 0; }
  return st;
}
function setSteps(steps, keepSel) { steps.forEach(autoCost); app.steps = steps; if (!keepSel) app.sel = -1; refresh(); }

function refresh() {
  const st = $('stage');
  if (!app.steps.length) st.innerHTML = '<div class="empty">Graba un combo, carga una grabación de prueba o añade movimientos desde la paleta.</div>';
  else {
    const w = Math.max(st.clientWidth - 26, 420);
    st.innerHTML = renderCombo(app.steps, { names: $('optNames').checked, conn: $('optConn').checked, width: Math.min(w, 1100), sel: app.sel, header: false, nota: false }).svg;
    st.querySelectorAll('.step').forEach(el => el.addEventListener('click', () => { app.sel = +el.dataset.i; refresh(); }));
  }
  if (document.activeElement !== $('notaTxt')) $('notaTxt').value = SF6.stepsToText(app.steps);
  renderEditor();
  updateShare();
  $('hdrSide').innerHTML = 'Lado: <b>' + app.side + (app.flips.length ? ' (+' + app.flips.length + ' cambio' + (app.flips.length > 1 ? 's' : '') + ')' : '') + '</b>';
}

function reparse() {
  if (!app.rec) return;
  const sch = app.rec.scheme || 'classic';
  const r = SF6.parse(app.rec, { char: app.char, scheme: sch, side: app.side, flips: app.flips, timing: $('optTiming').checked && sch === 'classic', merge: $('optMerge').checked });
  app.discarded = r.discarded;
  setSteps(r.steps);
  renderRaw(r);
}

function renderRaw(r) {
  const frames = app.rec ? app.rec.frames : [];
  $('rawCount').textContent = frames.length + ' frames';
  if (!frames.length) { $('raw').innerHTML = ''; $('disc').innerHTML = ''; return; }
  const dirs = SF6.relativeDirs(frames, app.side, app.flips);
  const rows = [];
  let prevMask = 0;
  for (let f = 0; f < frames.length; f++) {
    const d = dirs[f], m = frames[f][1];
    const last = rows[rows.length - 1];
    const press = (m & ~prevMask) !== 0;
    if (last && last.d === d && last.m === m) last.n++;
    else rows.push({ d, m, n: 1, f, press });
    prevMask = m;
  }
  let html = '';
  rows.slice(0, 600).forEach(r => {
    const chips = maskButtons(r.m, (app.rec && app.rec.scheme) || 'classic').map(b => smallIcon(b, 20)).join('');
    html += `<div class="r${r.press ? ' p' : ''}" title="frame ${r.f}"><span class="fc">${r.n}</span>${smallIcon(String(r.d), 22)}<span class="chips">${chips}</span></div>`;
  });
  if (rows.length > 600) html += '<div class="muted" style="padding:6px">... ' + (rows.length - 600) + ' filas más</div>';
  $('raw').innerHTML = html;
  $('disc').innerHTML = app.discarded.length
    ? '<b>Descartado por la limpieza (' + app.discarded.length + '):</b><ul>' + app.discarded.map(d => `<li>frame ${d.f}: ${d.what} (${esc(d.reason)})</li>`).join('') + '</ul>'
    : '';
}

function renderEditor() {
  const e = $('editor');
  const s = app.steps[app.sel];
  if (!s) { e.innerHTML = '<p class="muted">Haz clic en un paso del combo para editarlo.</p>'; return; }
  const fromRec = app.rec && s.f && !String(s.id).startsWith('m');
  e.innerHTML = `
    <div class="editor">
      <div><label class="f">Notación</label><input type="text" id="edNota" value="${esc(s.nota)}"></div>
      <div><label class="f">Conexión con el anterior</label>
        <select id="edConn" ${app.sel === 0 ? 'disabled' : ''}><option value=",">, link</option><option value=">">&gt; cancel</option></select></div>
      <div class="full"><label class="f">Nombre</label><input type="text" id="edName" value="${esc(s.name || '')}"></div>
      <div><label class="f">Barra de Drive</label><select id="edDrive">${[0, 0.5, 1, 2, 3].map(v => `<option value="${v}" ${s.drive == v ? 'selected' : ''}>${v || 'ninguna'}</option>`).join('')}</select></div>
      <div><label class="f">Barra de Super</label><select id="edSa">${[0, 1, 2, 3].map(v => `<option value="${v}" ${s.sa == v ? 'selected' : ''}>${v || 'ninguna'}</option>`).join('')}</select></div>
      <div class="full"><label class="f">Nota debajo del paso (opcional)</label><input type="text" id="edNote" placeholder="Ej.: solo con 1 Fuha stock, retrasa un poco" value="${esc(s.note || '')}"></div>
      <div class="full muted">${fromRec ? 'Frame ' + s.f + (s.gap ? ' · ' + s.gap + ' frames después del paso anterior' : '') : 'Añadido a mano'}</div>
      <div class="full row">
        <button class="btn sm" id="edLeft">◀ Mover</button>
        <button class="btn sm" id="edRight">Mover ▶</button>
        <button class="btn sm" id="edDup">Duplicar</button>
        <button class="btn sm" id="edDel" style="border-color:#5a2030">Eliminar</button>
        ${fromRec ? '<button class="btn sm" id="edFlip" title="Para cross-ups o combos que cambian de lado">Cambio de lado aquí</button>' : ''}
      </div>
    </div>`;
  $('edConn').value = s.conn === '>' ? '>' : ',';
  $('edNota').addEventListener('change', ev => {
    snapshot();
    s.nota = SF6.normalizeNota(ev.target.value);
    const c = cls(s.nota);
    s.kind = c.kind; if (c.name) s.name = c.name;
    delete s.drive; delete s.sa; autoCost(s);
    refresh();
  });
  $('edName').addEventListener('change', ev => { snapshot(); s.name = ev.target.value; refresh(); });
  $('edDrive').addEventListener('change', ev => { snapshot(); s.drive = +ev.target.value; refresh(); });
  $('edSa').addEventListener('change', ev => { snapshot(); s.sa = +ev.target.value; refresh(); });
  $('edNote').addEventListener('change', ev => { snapshot(); s.note = ev.target.value.trim(); refresh(); });
  $('edConn').addEventListener('change', ev => { snapshot(); s.conn = ev.target.value; refresh(); });
  $('edDel').onclick = () => { snapshot(); app.steps.splice(app.sel, 1); if (app.steps[0]) app.steps[0].conn = ''; app.sel = Math.min(app.sel, app.steps.length - 1); refresh(); };
  $('edDup').onclick = () => { snapshot(); const c = Object.assign({}, s, { id: 'm' + Date.now() }); app.steps.splice(app.sel + 1, 0, c); app.sel++; refresh(); };
  $('edLeft').onclick = () => move(-1);
  $('edRight').onclick = () => move(1);
  if (fromRec) $('edFlip').onclick = () => {
    const at = Math.max(0, (s.motionStart ?? s.f) - 2);
    if (app.flips.includes(at)) app.flips = app.flips.filter(x => x !== at); else app.flips.push(at);
    toast('Lado invertido desde el frame ' + at + '; se volvió a limpiar la grabación');
    reparse();
  };
}
function move(dir) {
  const i = app.sel, j = i + dir;
  if (j < 0 || j >= app.steps.length) return;
  snapshot();
  const a = app.steps;
  [a[i], a[j]] = [a[j], a[i]];
  a.forEach((s, k) => { if (k === 0) s.conn = ''; else if (!s.conn) s.conn = ','; });
  app.sel = j; refresh();
}

function addStep(nota) {
  snapshot();
  const c = cls(nota);
  const conn = app.steps.length ? (['special', 'super', 'followup'].includes(c.kind) || nota === 'DR' ? '>' : ',') : '';
  const step = autoCost({ id: 'm' + Date.now() + Math.random(), f: 0, nota, name: c.name, kind: c.kind, conn });
  if (app.sel >= 0 && app.sel < app.steps.length - 1) { app.steps.splice(app.sel + 1, 0, step); app.sel++; }
  else { app.steps.push(step); app.sel = app.steps.length - 1; }
  refresh();
}

function paletteGroups() {
  const cd = SF6.chars[app.char].classic;
  if (app.scheme === 'modern') {
    const md = SF6.chars[app.char].modern || {};
    const sp = md.sp || {};
    const g = [
      ['Normales', ['5L', '5M', '5H', '2L', '2M', '2H', 'j.L', 'j.M', 'j.H'], ''],
      ['Combos asistidos', ['AUTO+L', 'AUTO+M', 'AUTO+H'], ''],
      ['Especiales asistidos', ['SP', '6SP', '2SP', '4SP', 'j.SP'].filter(n => n === 'j.SP' ? md.air : sp[{ SP: 'N', '6SP': 'F', '2SP': 'D', '4SP': 'B' }[n]]), 'sp'],
      ['OD asistidos', ['AUTO+SP', '6AUTO+SP', '2AUTO+SP', '4AUTO+SP'].filter(n => sp[{ 'AUTO+SP': 'N', '6AUTO+SP': 'F', '2AUTO+SP': 'D', '4AUTO+SP': 'B' }[n]]), 'sp'],
      ['Super Arts', ['SP+H', '4SP+H', '2SP+H'], 'sa'],
      ['Drive y otros', ['DR', 'PARRY~66', 'DI', 'PARRY', 'TH', '66'], '']
    ];
    return g;
  }
  const uniq = (cd.command || []).map(c => c.d + c.b);
  const tcs = [];
  (cd.tc || []).forEach(t => t.seq.slice(1).forEach(x => { if (!tcs.includes(x.n) && !/^5/.test(x.n)) tcs.push(x.n); }));
  const sps = [], ods = [], sas = [];
  for (const sp of cd.specials) {
    const pre = sp.air ? 'j.' : '';
    if (sp.kind === 'super') { sas.push(pre + sp.m + (sp.type === 'K' ? 'LK' : 'LP')); continue; }
    if (sp.exact && sp.exact.length === 2) { ods.push(pre + sp.m + sp.exact.join('+')); continue; }
    if ((sp.min || 1) === 2) { ods.push(pre + sp.m + (sp.type === 'K' ? 'LK+MK' : 'LP+MP')); continue; }
    if (sp.exact) { sps.push(pre + sp.m + sp.exact[0]); continue; }
    for (const l of ['L', 'M', 'H']) sps.push(pre + sp.m + l + sp.type);
  }
  return [
    ['Normales de pie', ['5LP', '5MP', '5HP', '5LK', '5MK', '5HK'], ''],
    ['Agachado', ['2LP', '2MP', '2HP', '2LK', '2MK', '2HK'], ''],
    ['En salto', ['j.LP', 'j.MP', 'j.HP', 'j.LK', 'j.MK', 'j.HK'], ''],
    ['Únicos y target combos', [...uniq, ...tcs.filter(t => !uniq.includes(t))], ''],
    ['Especiales', sps, 'sp'],
    ['OD', ods, 'sp'],
    ['Super Arts', sas, 'sa'],
    ['Drive y otros', ['DR', 'PDR', 'HP+HK', 'MP+MK', 'LP+LK', '4LP+LK', '66', ...(cd.pairs || []).map(p => p.nota)], '']
  ];
}
function buildPalette() {
  $('palTitle').textContent = 'Paleta de ' + charName() + ' (' + schemeLabel().toLowerCase() + ')';
  $('palette').innerHTML = paletteGroups().filter(g => g[1].length).map(([t, list, c]) =>
    `<div class="grp"><b>${t}</b>${list.map(n => `<button class="chip ${c}" data-n="${esc(n)}" title="${esc(cls(n).name)}">${esc(n)}</button>`).join('')}</div>`).join('') +
    '<p class="muted" style="margin:0">Si seleccionas un paso, lo nuevo se inserta justo después.</p>';
  $('palette').querySelectorAll('.chip').forEach(b => b.onclick = () => addStep(b.dataset.n));
}

function buildIconGrid() {
  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'LP', 'MP', 'HP', 'LK', 'MK', 'HK', 'P', 'K', 'L', 'M', 'H', 'SP', 'AUTO'];
  $('iconGrid').innerHTML = keys.map(k => `<div style="background:#2a2338">${smallIcon(k, 34)}<span>${k}</span></div>`).join('');
  $('usePack').checked = usePack;
}
$('iconFiles').addEventListener('change', async ev => {
  const valid = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9', 'LP', 'MP', 'HP', 'LK', 'MK', 'HK', 'P', 'K', 'PLUS', 'L', 'M', 'H', 'SP', 'AUTO', 'DI', 'PARRY', 'TH']);
  let n = 0;
  for (const file of ev.target.files) {
    const key = file.name.replace(/\.[^.]+$/, '').trim().toUpperCase();
    if (!valid.has(key)) continue;
    customIcons[key] = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(file); });
    n++;
  }
  const saved = store.set('icons', customIcons);
  toast(n + ' iconos cargados' + (saved ? '' : ' (no se pudieron guardar para la próxima visita)'));
  buildIconGrid(); refresh(); ev.target.value = '';
});
$('usePack').onchange = e => { usePack = e.target.checked; store.set('usePack', usePack); buildIconGrid(); refresh(); };
$('iconReset').onclick = () => { customIcons = {}; store.set('icons', {}); buildIconGrid(); refresh(); };

let lastLive = '';
function maskButtons(m, scheme) {
  if (scheme === 'modern') return Object.keys(SF6.MBIT).filter(b => m & SF6.MBIT[b]).map(b => ({ DP: 'PARRY' }[b] || b));
  return SF6.CLASSIC_BTNS.filter(b => m & SF6.BIT[b]);
}
function showLive(d, m, src) {
  const key = d + '|' + m + '|' + src;
  if (key === lastLive) return;
  lastLive = key;
  const rel = app.side === 'P2' ? SF6.MIRROR[d] : d;
  $('live').innerHTML = smallIcon(String(rel), 34) + maskButtons(m, app.scheme).map(b => smallIcon(b, 34)).join('') + '<span class="muted" style="margin-left:auto">' + src + '</span>';
}
function loop() {
  const st = readState();
  const s = { d: st.d, m: app.scheme === 'modern' ? st.mm : st.m };
  if (!bridge.connected) showLive(s.d, s.m, 'en vivo');
  if (gp.recording && !bridge.connected) {
    const idx = Math.floor((performance.now() - gp.t0) / (1000 / 60));
    while (gp.frames.length <= idx) gp.frames.push([s.d, s.m]);
    $('timer').textContent = gp.frames.length + ' frames · ' + (gp.frames.length / 60).toFixed(1) + ' s';
  }
  requestAnimationFrame(loop);
}

function toggleRec() {
  if (bridge.connected) { bridge.send({ t: 'toggle' }); return; }
  if (!gp.recording) {
    gp.recording = true; gp.frames = []; gp.t0 = performance.now();
    recUI(true);
  } else {
    gp.recording = false;
    recUI(false);
    const fr = trim(gp.frames);
    if (fr.length < 2) { toast('No se detectaron inputs en la grabación'); return; }
    loadRec({ version: 2, fps: 60, scheme: app.scheme, char: app.char, side: app.side, frames: fr }, 'Grabación en vivo');
  }
}
function trim(frames) {
  const busy = f => f[0] !== 5 || f[1] !== 0;
  let a = frames.findIndex(busy), b = frames.length - 1 - [...frames].reverse().findIndex(busy);
  if (a < 0) return [];
  a = Math.max(0, a - 10); b = Math.min(frames.length - 1, b + 10);
  return frames.slice(a, b + 1);
}
function loadRec(rec, source) {
  if (app.steps.length) snapshot();
  rec.scheme = rec.scheme || 'classic';
  if (rec.char && SF6.chars[rec.char] && rec.char !== app.char) setChar(rec.char, true);
  if (rec.scheme !== app.scheme) setScheme(rec.scheme, true);
  app.rec = rec; app.flips = Array.isArray(rec.flips) ? rec.flips.slice() : []; app.source = source;
  if (rec.side === 'P1' || rec.side === 'P2') setSide(rec.side, true);
  $('srcBadge').textContent = source + ' · ' + rec.frames.length + ' frames';
  reparse();
}

function setSide(v, silent) {
  app.side = v;
  $('sideSeg').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  lastLive = '';
  if (!silent) reparse();
  refresh();
}
$('sideSeg').querySelectorAll('button').forEach(b => b.onclick = () => setSide(b.dataset.v));
$('recBtn').onclick = toggleRec;
$('fmtSeg').querySelectorAll('button').forEach(b => b.onclick = () => { app.fmt = b.dataset.v; $('fmtSeg').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); });
$('optNames').onchange = refresh;
$('optConn').onchange = refresh;
$('optTiming').onchange = () => reparse();
$('optMerge').onchange = () => reparse();

$('fileRec').addEventListener('change', async ev => {
  const f = ev.target.files[0]; if (!f) return;
  try {
    const rec = JSON.parse(await f.text());
    if (!Array.isArray(rec.frames)) throw new Error('Falta "frames"');
    loadRec(rec, f.name);
  } catch (e) { toast('Archivo no válido: ' + e.message); }
  ev.target.value = '';
});

DEMOS.forEach((d, i) => $('demoSel').insertAdjacentHTML('beforeend', `<option value="${i}">${esc(SF6.chars[d.char].name + ' · ' + d.name)}</option>`));
$('demoBtn').onclick = () => {
  const d = DEMOS[+$('demoSel').value];
  const rec = SF6.parseDSL(d.dsl, d.scheme); rec.side = d.side; rec.char = d.char;
  loadRec(rec, 'Prueba ' + (+$('demoSel').value + 1));
  const got = app.steps.map(s => s.nota);
  const ok = JSON.stringify(got) === JSON.stringify(d.expect);
  $('demoCheck').innerHTML = (ok ? '<span class="ok">✔ Coincide</span>' : '<span class="bad">✘ No coincide</span>') + ' con lo esperado: <code>' + esc(d.expect.join(', ')) + '</code>';
};

function setChar(id, silent) {
  app.char = id; store.set('char', id);
  $('charSel').value = id;
  buildPalette();
  if (!silent) { if (app.rec) reparse(); else { app.steps.forEach(s => { const c = cls(s.nota); if (c.name) s.name = c.name; s.kind = c.kind; }); refresh(); } }
}
function setScheme(v, silent) {
  app.scheme = v; store.set('scheme', v);
  $('schemeSeg').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  buildPalette(); buildMap(); lastLive = '';
  if (!silent) refresh();
}
$('charSel').innerHTML = Object.values(SF6.chars).map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
$('charSel').value = app.char;
$('charSel').onchange = e => setChar(e.target.value);
$('schemeSeg').querySelectorAll('button').forEach(b => b.onclick = () => setScheme(b.dataset.v));

$('notaApply').onclick = () => {
  snapshot();
  setSteps(SF6.parseText($('notaTxt').value, app.char, app.scheme));
};
$('clearBtn').onclick = () => { if (!app.steps.length) return; snapshot(); app.rec = null; app.flips = []; $('srcBadge').textContent = 'Sin grabación'; renderRaw({}); setSteps([]); };
$('undoBtn').onclick = () => { const s = app.undo.pop(); if (s) { app.steps = JSON.parse(s); app.sel = -1; refresh(); } $('undoBtn').disabled = !app.undo.length; };

function comboPayload() {
  return { v: 2, c: app.char, sc: app.scheme, t: $('title').value, st: $('subtitle').value, s: app.steps.map(x => [x.nota, x.conn, x.name, x.note || '', x.drive || 0, x.sa || 0]) };
}
function loadPayload(o) {
  if (o.c && SF6.chars[o.c]) setChar(o.c, true);
  if (o.sc) setScheme(o.sc, true);
  $('title').value = o.t || ''; $('subtitle').value = o.st || '';
  app.rec = null; app.flips = []; renderRaw({});
  $('srcBadge').textContent = 'Combo compartido';
  setSteps(o.s.map(([nota, conn, name, note, drive, sa], i) => ({ id: 'm' + i + Date.now(), f: 0, nota, conn: i ? conn : '', name, note: note || '', drive: drive || 0, sa: sa || 0, kind: cls(nota).kind })));
}
function baseURL() { return location.href.split('#')[0].replace(/[^/]*$/, ''); }
function shareURL() { return baseURL() + 'index.html#c=' + encode(comboPayload()); }
function overlayURL(mode) { return baseURL() + 'overlay.html#m=' + mode + '&c=' + encode(comboPayload()); }
function updateShare() {
  if (!$('shareURL')) return;
  $('shareURL').value = app.steps.length ? shareURL() : '';
}
$('copyLink').onclick = () => { if (!app.steps.length) { toast('No hay pasos para compartir'); return; } copy(shareURL()); };
$('copyOverlay').onclick = () => { if (!app.steps.length) { toast('Primero arma el combo'); return; } copy(overlayURL('trial')); };
$('copyOverlayLive').onclick = () => copy(baseURL() + 'overlay.html#m=live&ch=' + app.char + '&sc=' + app.scheme + '&side=' + app.side);
$('copyCode').onclick = () => copy('SF6CV:' + encode(comboPayload()));
$('pasteCode').onclick = () => {
  modal('<h3 style="margin-top:0">Importar código o enlace</h3><textarea id="codeIn" style="width:600px;max-width:85vw;height:110px" placeholder="SF6CV:... o un enlace con #c="></textarea><div class="row" style="margin-top:8px"><button class="btn pri" id="codeGo">Importar</button></div>');
  $('codeGo').onclick = () => {
    try {
      let v = $('codeIn').value.trim();
      const m = v.match(/[#&]c=([^&]+)/);
      if (m) v = m[1];
      const o = v.startsWith('{') ? JSON.parse(v) : decode(v);
      snapshot();
      if (Array.isArray(o.frames)) loadRec(o, 'Grabación pegada'); else loadPayload(o);
      $('modal').classList.remove('on');
    } catch (e) { toast('Código no válido'); }
  };
};
$('recCopy').onclick = () => { if (!app.rec) { toast('No hay grabación cargada'); return; } copy(JSON.stringify(Object.assign({}, app.rec, { side: app.side, flips: app.flips, char: app.char }))); };
$('recSave').onclick = async () => {
  if (!app.rec) { toast('No hay grabación cargada'); return; }
  const data = JSON.stringify(Object.assign({}, app.rec, { side: app.side, flips: app.flips, char: app.char }));
  const fname = 'grabacion_' + app.char + '_' + Date.now() + '.json';
  let dl = null;
  try { dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null; } catch (e) { dl = null; }
  if (dl) { try { await dl.save({ filename: fname, data }); } catch (e) { } return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' })); a.download = fname; document.body.appendChild(a); a.click(); a.remove();
};

$('pngBtn').onclick = () => {
  if (!app.steps.length) { toast('No hay pasos para exportar'); return; }
  const width = 900;
  const r = renderCombo(app.steps, { tag: tagText(), names: $('optNames').checked, conn: $('optConn').checked, width, header: true, sel: $('optHl').checked ? app.sel : -1, title: $('title').value, subtitle: $('subtitle').value, nota: $('optNota').checked });
  let H = r.H;
  let svg = r.svg;
  if (app.fmt === 'v') {
    const k = 1080 / r.W;
    const VH = Math.max(1920, Math.ceil(H * k));
    const off = Math.round((VH - H * k) / 2);
    const inner = r.svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${VH}" viewBox="0 0 1080 ${VH}"><defs><linearGradient id="vbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c0f2c"/><stop offset=".5" stop-color="#0d0b12"/><stop offset="1" stop-color="#1c0f2c"/></linearGradient></defs><rect width="1080" height="${VH}" fill="url(#vbg)"/><g transform="translate(0,${off}) scale(${k})">${inner}</g></svg>`;
    H = VH;
    r.W = 1080;
  }
  const scale = app.fmt === 'h' ? 2 : 1;
  const img = new Image();
  img.onload = () => {
    const cv = document.createElement('canvas');
    cv.width = r.W * scale; cv.height = H * scale;
    const ctx = cv.getContext('2d');
    ctx.scale(scale, scale); ctx.drawImage(img, 0, 0);
    const url = cv.toDataURL('image/png');
    const fname = ($('title').value || 'combo').replace(/[^\wáéíóúñ\- ]+/gi, '').trim().replace(/\s+/g, '_') + '.png';
    modal(`<div class="row" style="justify-content:space-between"><b>Vista previa (${cv.width}×${cv.height})</b><span class="row"><button class="btn" id="copyImg">Copiar imagen</button><button class="btn pri" id="dlPng">Descargar PNG</button></span></div><img src="${url}" alt="combo"><p class="muted">Si la descarga no arranca, haz clic derecho sobre la imagen y elige "Guardar imagen como".</p>`);
    $('dlPng').onclick = () => cv.toBlob(async b => {
      let dl = null;
      try { dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null; } catch (e) { dl = null; }
      if (dl) {
        try { await dl.save({ filename: fname, data: b }); toast('PNG guardado'); }
        catch (e) { if (e && e.code !== 'declined') toast('No se pudo guardar: usa clic derecho sobre la imagen'); }
        return;
      }
      const a = document.createElement('a'); a.href = url; a.download = fname; document.body.appendChild(a); a.click(); a.remove();
    });
    $('copyImg').onclick = () => cv.toBlob(b => {
      try { navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]).then(() => toast('Imagen copiada'), () => toast('Tu navegador no permitió copiar la imagen')); }
      catch (e) { toast('Tu navegador no permitió copiar la imagen'); }
    });
  };
  img.onerror = () => toast('No se pudo generar la imagen');
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};

$('modal').addEventListener('click', e => { if (e.target.id === 'modal') $('modal').classList.remove('on'); });
$('copyTxt').onclick = () => copy(SF6.stepsToText(app.steps));
window.addEventListener('resize', () => refresh());
setScheme(app.scheme, true);
setChar(app.char, true);
buildIconGrid();
(function initFromHash() {
  const m = location.hash.match(/[#&]c=([^&]+)/);
  if (!m) return;
  try { loadPayload(decode(m[1])); } catch (e) { toast('El enlace del combo no es válido'); }
})();
refresh();
requestAnimationFrame(loop);
