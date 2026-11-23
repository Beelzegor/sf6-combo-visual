function createBridge(handlers) {
  const b = {
    ws: null, connected: false, port: 8765, wantOpen: false, retry: null,
    send(o) { if (b.ws && b.ws.readyState === 1) b.ws.send(JSON.stringify(o)); },
    connect(port) {
      b.port = port || b.port;
      b.wantOpen = true;
      clearTimeout(b.retry);
      try { b.ws = new WebSocket('ws://127.0.0.1:' + b.port); }
      catch (e) { handlers.status && handlers.status('error', 'No se pudo abrir la conexión'); return; }
      handlers.status && handlers.status('connecting', 'Conectando con el capturador...');
      b.ws.onopen = () => { b.connected = true; handlers.status && handlers.status('on', 'Conectado al capturador'); b.send({ t: 'hello' }); };
      b.ws.onclose = () => {
        const was = b.connected;
        b.connected = false;
        handlers.status && handlers.status('off', was ? 'Se perdió la conexión con el capturador' : 'No se encontró el capturador. ¿Está abierto?');
        if (b.wantOpen && handlers.autoRetry) b.retry = setTimeout(() => b.connect(), 2000);
      };
      b.ws.onerror = () => {};
      b.ws.onmessage = ev => {
        let msg;
        try { msg = JSON.parse(ev.data); } catch (e) { return; }
        const h = handlers[msg.t];
        if (h) h(msg);
      };
    },
    disconnect() { b.wantOpen = false; clearTimeout(b.retry); if (b.ws) b.ws.close(); }
  };
  return b;
}
