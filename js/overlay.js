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

  const bridge = createBridge({
    autoRetry: true,
    status(state, text) {
      statusEl.textContent = text;
      statusEl.classList.toggle('hide', state === 'on');
    },
    info(msg) { if (!q.side && msg.side) side = msg.side; },
    f(msg) {
      frameN++;
      buf.push([msg.d, msg.m]);
      if (buf.length > MAX) buf.splice(0, buf.length - MAX);
      if (msg.d !== 5 || msg.m !== 0) lastActive = frameN;
      if (frameN - lastActive > 120 && buf.length) {
        buf.length = 0;
        if (mode === 'live' && recSteps.length) { recSteps = []; draw(); }
        if (mode === 'trial' && progress && progress < steps.length) { progress = 0; draw(); }
        return;
      }
      if (frameN - lastParse >= 6 && frameN - lastActive < 40) { lastParse = frameN; evaluate(); }
    }
  });
  draw();
  bridge.connect(+q.port || 8765);
})();
