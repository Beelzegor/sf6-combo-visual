function relayId() {
  let id = store.get('relayId', null);
  if (!id) { id = 'sf6cv-' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6); store.set('relayId', id); }
  return id;
}
function createRelaySender(onStatus) {
  const r = { peer: null, conns: [], on: false, tries: 0, lastIdx: -1, t0: performance.now() };
  function status() { onStatus(r.on ? (r.peer && r.peer.open ? (r.conns.length ? 'Enviando a ' + r.conns.length + ' overlay' + (r.conns.length > 1 ? 's' : '') : 'Esperando al overlay de OBS...') : 'Conectando...') : 'Apagado', r.on && r.conns.length > 0); }
  function start() {
    if (typeof Peer === 'undefined') { onStatus('No se pudo cargar la librería de conexión', false); r.on = false; return; }
    r.on = true; status();
    r.peer = new Peer(relayId());
    r.peer.on('open', () => { r.tries = 0; status(); });
    r.peer.on('connection', c => {
      c.on('open', () => { r.conns.push(c); c.send({ t: 'info', sc: app.scheme, side: app.side }); status(); });
      c.on('close', () => { r.conns = r.conns.filter(x => x !== c); status(); });
      c.on('error', () => { r.conns = r.conns.filter(x => x !== c); status(); });
    });
    r.peer.on('error', e => {
      if (e && e.type === 'unavailable-id' && r.tries < 8) { r.tries++; r.peer.destroy(); setTimeout(() => r.on && start(), 3000); onStatus('Reconectando...', false); return; }
      if (e && (e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error')) onStatus('Sin conexión al servidor de emparejamiento; reintentando...', false);
    });
    r.peer.on('disconnected', () => { if (r.on && r.peer && !r.peer.destroyed) setTimeout(() => { try { r.peer.reconnect(); } catch (e) { } }, 2000); });
  }
  function stop() { r.on = false; r.conns = []; if (r.peer) r.peer.destroy(); r.peer = null; status(); }
  r.toggle = () => (r.on ? stop() : start());
  r.start = start;
  r.push = (d, m) => {
    if (!r.on || !r.conns.length) return;
    const idx = Math.floor((performance.now() - r.t0) / (1000 / 60));
    if (r.lastIdx < 0) r.lastIdx = idx - 1;
    while (r.lastIdx < idx) {
      r.lastIdx++;
      for (const c of r.conns) { try { c.send({ t: 'f', n: r.lastIdx, d, m }); } catch (e) { } }
    }
  };
  r.info = () => { for (const c of r.conns) { try { c.send({ t: 'info', sc: app.scheme, side: app.side }); } catch (e) { } } };
  return r;
}
