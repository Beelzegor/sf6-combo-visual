const $ = id => document.getElementById(id);
const STORE = 'sf6cv_';
const store = {
  get(k, d) { try { const v = localStorage.getItem(STORE + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(STORE + k, JSON.stringify(v)); return true; } catch (e) { return false; } }
};

function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2600); }
function copy(t) {
  const ok = () => toast('Copiado al portapapeles');
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(ok, () => fallback());
  else fallback();
  function fallback() { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) { modal('<h3>Copia este texto</h3><textarea style="width:600px;max-width:85vw;height:120px">' + esc(t) + '</textarea>'); } ta.remove(); }
}
function modal(html) { $('modalBox').innerHTML = html + '<div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn" id="mClose">Cerrar</button></div>'; $('modal').classList.add('on'); $('mClose').onclick = () => $('modal').classList.remove('on'); }

function encode(obj) { return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function decode(s) { s = s.trim().replace(/^SF6CV:/, '').replace(/-/g, '+').replace(/_/g, '/'); return JSON.parse(decodeURIComponent(escape(atob(s)))); }
