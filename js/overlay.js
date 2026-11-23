(() => {
  const q = Object.fromEntries(location.hash.replace(/^#/, '').split('&').filter(Boolean).map(kv => { const i = kv.indexOf('='); return [kv.slice(0, i), decodeURIComponent(kv.slice(i + 1))]; }));
  const mode = q.m === 'live' ? 'live' : 'trial';
  let combo = null;
  if (q.c) { try { combo = decode(q.c); } catch (e) { combo = null; } }
  const charId = (combo && combo.c) || q.ch || 'juri';
  const scheme = (combo && combo.sc) || q.sc || 'classic';
  let side = q.side || 'P1';
  const width = +q.w || 900;
  const steps = combo ? combo.s.map(([nota, conn, name, note, drive, sa], i) => ({ nota, conn: i ? conn : '', name, note, drive, sa })) : [];
  const tag = ((SF6.chars[charId] || {}).name + ' · ' + (scheme === 'modern' ? 'Moderno' : 'Clásico')).toUpperCase();
  const wrap = document.getElementById('wrap');
  const statusEl = document.getElementById('status');
  const doneEl = document.getElementById('done');
  const buf = [];
  let lastActive = 0, progress = 0, lastParse = 0, frameN = 0, recSteps = [];
  const MAX = 900;
  const norm = n => SF6.normNota(n);

  function draw() {
    if (mode === 'trial') {
      if (!steps.length) { wrap.innerHTML = '<div style="padding:20px;background:rgba(0,0,0,.6)">Falta el combo: copia el enlace desde "Overlay OBS: este combo".</div>'; return; }
      wrap.innerHTML = renderCombo(steps, { tag, names: true, width, header: true, transparent: q.bg !== '1', title: combo.t || '', subtitle: combo.st || '', sel: progress < steps.length ? progress : -1, done: progress, nota: false }).svg;
    } else {
      const shown = recSteps.slice(-(+q.n || 6));
      wrap.innerHTML = shown.length ? renderCombo(shown, { tag, names: true, width, header: false, sel: shown.length - 1, nota: false }).svg : '';
    }
  }

  function evaluate() {
    const r = SF6.parse({ scheme, frames: buf }, { char: charId, scheme, side });
    recSteps = r.steps;
    if (mode !== 'trial') { draw(); return; }
    const got = r.steps.map(s => norm(s.nota));
    const want = steps.map(s => norm(s.nota));
    let best = 0;
    for (let k = Math.min(want.length, got.length); k >= 1; k--) {
      let ok = true;
      for (let i = 0; i < k; i++) if (got[got.length - k + i] !== want[i]) { ok = false; break; }
      if (ok) { best = k; break; }
    }
    if (best !== progress) {
      progress = best;
      draw();
      if (progress === want.length) {
        doneEl.classList.add('on');
        setTimeout(() => { doneEl.classList.remove('on'); buf.length = 0; progress = 0; draw(); }, 1800);
      }
    }
  }

  function onFrame(d, m) {
    frameN++;
    buf.push([d, m]);
    if (buf.length > MAX) buf.splice(0, buf.length - MAX);
    if (d !== 5 || m !== 0) lastActive = frameN;
    if (frameN - lastActive > 120 && buf.length) {
      buf.length = 0;
      if (mode === 'live' && recSteps.length) { recSteps = []; draw(); }
      if (mode === 'trial' && progress && progress < steps.length) { progress = 0; draw(); }
      return;
    }
    if (frameN - lastParse >= 6 && frameN - lastActive < 40) { lastParse = frameN; evaluate(); }
  }

  let padCfg = null;
  if (q.pad) { try { padCfg = decode(q.pad); } catch (e) { padCfg = null; } }
  const CMASK = { LP: 1, MP: 2, HP: 4, LK: 8, MK: 16, HK: 32, DP: 18, DI: 36, THROW: 9, PP: 3, KK: 24 };
  const MMASK = { L: 1, M: 2, H: 4, SP: 8, AUTO: 16, MDI: 32, MDP: 64, MTH: 128 };
  const DEF = scheme === 'modern'
    ? { L: 'b2', M: 'b0', H: 'b1', SP: 'b3', AUTO: 'b7', MDI: 'b4', MDP: 'b5', MTH: 'b6' }
    : { LP: 'b2', MP: 'b3', HP: 'b5', LK: 'b0', MK: 'b1', HK: 'b7' };
  const map = (padCfg && padCfg.pad) || DEF;
  const masks = scheme === 'modern' ? MMASK : CMASK;
  function act(pad, v) {
    if (!v) return false;
    if (v[0] === 'b') { const b = pad.buttons[+v.slice(1)]; return !!b && (b.pressed || b.value > 0.5); }
    const mm = v.match(/^a(\d+)([+-])$/);
    if (!mm) return false;
    const a = pad.axes[+mm[1]] || 0;
    return mm[2] === '+' ? a > 0.5 : a < -0.5;
  }
  function hat(v) {
    if (v === undefined || v < -1.05 || v > 1.05) return null;
    const t = [[-1, 8], [-0.714, 9], [-0.428, 6], [-0.142, 3], [0.142, 2], [0.428, 1], [0.714, 4], [1, 7]];
    for (const [x, d] of t) if (Math.abs(v - x) < 0.1) return d;
    return null;
  }
  function readPad() {
    let pads = [];
    try { pads = [...navigator.getGamepads()].filter(Boolean); } catch (e) { return null; }
    const pad = pads[0];
    if (!pad) return null;
    const btn = k => { const b = pad.buttons[k]; return !!b && b.pressed; };
    const up = act(pad, map.UP) || btn(12), dn = act(pad, map.DOWN) || btn(13), lf = act(pad, map.LEFT) || btn(14), rt = act(pad, map.RIGHT) || btn(15);
    let x = 0, y = 0;
    if (up || dn || lf || rt) { y = up ? 1 : (dn ? -1 : 0); x = lf === rt ? 0 : (rt ? 1 : -1); }
    else {
      const ax = pad.axes[0] || 0, ay = pad.axes[1] || 0;
      if (Math.hypot(ax, ay) > 0.5) {
        const o = Math.round(Math.atan2(-ay, ax) / (Math.PI / 4));
        [x, y] = { 0: [1, 0], 1: [1, 1], 2: [0, 1], 3: [-1, 1], 4: [-1, 0], '-4': [-1, 0], '-3': [-1, -1], '-2': [0, -1], '-1': [1, -1] }[o];
      } else { const h = hat(pad.axes[9]); if (h) { x = ((h - 1) % 3) - 1; y = Math.floor((h - 1) / 3) - 1; } }
    }
    let m = 0;
    for (const k of Object.keys(masks)) if (act(pad, map[k])) m |= masks[k];
    return { d: 5 + x + 3 * y, m, id: pad.id };
  }
  let padSeen = false, lastIdx = -1, cur = { d: 5, m: 0 };
  const t0 = performance.now();
  function pollPad() {
    if (bridge.connected) return;
    const st = readPad();
    if (st) {
      cur = st;
      if (!padSeen) { padSeen = true; statusEl.textContent = 'Leyendo el control directamente: ' + st.id.replace(/\(.*?\)/g, '').trim(); setTimeout(() => statusEl.classList.add('hide'), 4000); }
    }
    if (!padSeen) return;
    const idx = Math.floor((performance.now() - t0) / (1000 / 60));
    if (lastIdx < 0) lastIdx = idx - 1;
    while (lastIdx < idx) { lastIdx++; onFrame(cur.d, cur.m); }
  }

  const bridge = createBridge({
    autoRetry: true,
    status(state, text) {
      if (state === 'on') { statusEl.classList.add('hide'); return; }
      if (padSeen) return;
      statusEl.textContent = 'Pulsa cualquier botón del control (o abre el capturador)';
      statusEl.classList.remove('hide');
    },
    info(msg) { if (!q.side && msg.side) side = msg.side; },
    f(msg) { onFrame(msg.d, msg.m); }
  });
  setInterval(pollPad, 4);
  (function raf() { pollPad(); requestAnimationFrame(raf); })();
  draw();
  bridge.connect(+q.port || 8765);
})();
