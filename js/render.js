const COLORS = { L: '#2f9bff', M: '#ffb400', H: '#ff3b4e' };
const ANG = { 8: 0, 9: 45, 6: 90, 3: 135, 2: 180, 1: 225, 4: 270, 7: 315 };
let customIcons = store.get('icons', {});
let usePack = store.get('usePack', true);


const FIST = `<path d="M30 40c0-5 3-8 7-8s7 3 7 8v-3c0-5 3-8 7-8s7 3 7 8v1c0-5 3-7 6.5-7s6.5 2 6.5 7v3c0-4 3-6 6-6s6 2 6 6v18c0 14-10 23-25 23H45c-9 0-15-6-15-15z" fill="#fff"/><path d="M30 52c-6 0-9 4-9 9s4 8 9 8h10" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M44 40v8M58 38v9M71 40v8" stroke="rgba(0,0,0,.28)" stroke-width="3" stroke-linecap="round"/>`;
const FOOT = `<path d="M34 16h20v40c0 3 2 5 5 6l18 6c7 2 10 6 10 11v5H30c-4 0-6-3-6-6V56c0-4 3-6 6-7l4-1z" fill="#fff"/><path d="M30 78h57" stroke="rgba(0,0,0,.28)" stroke-width="3"/>`;


function iconSVG(key, x, y, s) {
  if (customIcons[key]) return `<image href="${customIcons[key]}" x="${x}" y="${y}" width="${s}" height="${s}"/>`;
  if (usePack && ICON_PACK[key]) return `<image href="${ICON_PACK[key].src}" x="${x}" y="${y}" width="${s}" height="${s}" preserveAspectRatio="xMidYMid meet"/>`;
  const k = s / 100;
  if (/^[1-9]$/.test(key)) {
    const d = +key;
    if (d === 5) return `<g transform="translate(${x},${y}) scale(${k})"><circle cx="50" cy="50" r="13" fill="#fff" stroke="#120d1c" stroke-width="5"/></g>`;
    const path = 'M50 8 L88 48 L64 48 L64 92 L36 92 L36 48 L12 48 Z';
    return `<g transform="translate(${x},${y}) scale(${k})"><g transform="rotate(${ANG[d]} 50 50)"><path d="${path}" fill="#120d1c" stroke="#120d1c" stroke-width="12" stroke-linejoin="round" opacity=".85"/><path d="${path}" fill="#ffffff" stroke="#ffffff" stroke-width="3" stroke-linejoin="round"/></g></g>`;
  }
  if (['L', 'M', 'H', 'SP', 'AUTO', 'DI', 'PARRY', 'TH', 'DR'].includes(key)) {
    const MC = { L: '#2f9bff', M: '#ffb400', H: '#ff3b4e', SP: '#9b5cff', AUTO: '#20b2a6', DI: '#3ddc5f', PARRY: '#3ddc5f', TH: '#8d87a3', DR: '#3ddc5f' };
    const lab = { AUTO: 'AUTO', PARRY: 'DP', TH: 'TH' }[key] || key;
    const fs = lab.length >= 4 ? 24 : lab.length === 2 ? 36 : 48;
    return `<g transform="translate(${x},${y}) scale(${k})"><circle cx="50" cy="50" r="46" fill="#120d1c"/><circle cx="50" cy="50" r="41" fill="${MC[key]}"/><circle cx="50" cy="50" r="41" fill="url(#shine)" opacity=".3"/><text x="50" y="52" text-anchor="middle" dominant-baseline="central" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="${fs}" fill="#fff" stroke="#120d1c" stroke-width="5" paint-order="stroke">${lab}</text></g>`;
  }
  const kick = key.endsWith('K');
  const col = COLORS[key[0]] || '#8d87a3';
  const letter = key.length === 2 ? key[0] : '';
  const glyph = kick ? FOOT : FIST;
  let out = `<g transform="translate(${x},${y}) scale(${k})"><circle cx="50" cy="50" r="46" fill="#120d1c"/><circle cx="50" cy="50" r="41" fill="${col}"/><circle cx="50" cy="50" r="41" fill="url(#shine)" opacity=".35"/><g transform="translate(9 6) scale(.78)">${glyph}</g>`;
  if (letter) out += `<text x="82" y="86" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="34" fill="#fff" stroke="#120d1c" stroke-width="8" paint-order="stroke">${letter}</text>`;
  return out + '</g>';
}
const ICON_DEFS = `<defs><radialGradient id="shine" cx=".35" cy=".25" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`;

function smallIcon(key, s) { return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">${ICON_DEFS}${iconSVG(key, 0, 0, s)}</svg>`; }

const IS = 40, GAPI = 3, PLUS = 22, SEP = 20;
function partWidth(p) {
  if (p.t === 'dir' || p.t === 'btn' || p.t === 'charge') return IS;
  if (p.t === 'plus') return PLUS;
  if (p.t === 'sep') return SEP;
  if (p.t === 'air') return 64;
  if (p.t === 'txt') return Math.max(30, p.v.length * 11);
  return 0;
}
function trialParts(nota) {
  const raw = SF6.partsOf(nota);
  const out = [];
  raw.forEach((p, i) => {
    out.push(p);
    const n = raw[i + 1];
    if (p.t === 'dir' && n && n.t === 'btn') out.push({ t: 'plus' });
  });
  return out;
}

function renderCombo(steps, o) {
  const W = o.width;
  const header = o.header;
  const headH = header ? (o.subtitle ? 104 : 80) : 0;
  const ROW = 60, NOTE = 24, GAP = 6, LEFT = 64;
  const rows = steps.map(s => ({ s, h: ROW + (s.note ? NOTE : 0) }));
  const listH = rows.reduce((a, r) => a + r.h + GAP, 0);
  const notaLines = [];
  if (o.nota) {
    const maxCh = Math.floor((W - 60) / 9.7);
    let line = '';
    SF6.stepsToText(steps).split(/(?<=,|>) /).forEach(tok => {
      if ((line + ' ' + tok).length > maxCh && line) { notaLines.push(line); line = tok; }
      else line = line ? line + ' ' + tok : tok;
    });
    if (line) notaLines.push(line);
  }
  const footH = o.nota ? 26 + notaLines.length * 22 : 0;
  const pad = header ? 22 : 0;
  const H = headH + listH + footH + pad + (header ? 10 : 0);
  let g = ICON_DEFS.replace('</defs>', `<linearGradient id="bgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a1027"/><stop offset="1" stop-color="#07060b"/></linearGradient>
    <linearGradient id="hl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a23cf0"/><stop offset=".55" stop-color="#5d1aa0"/><stop offset="1" stop-color="#5d1aa0" stop-opacity=".15"/></linearGradient>
    <linearGradient id="rowg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1b1626" stop-opacity=".96"/><stop offset=".7" stop-color="#15111e" stop-opacity=".9"/><stop offset="1" stop-color="#15111e" stop-opacity=".35"/></linearGradient>
    <linearGradient id="hdg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a2bd0"/><stop offset=".6" stop-color="#3b1366"/><stop offset="1" stop-color="#3b1366" stop-opacity="0"/></linearGradient>
    <pattern id="str" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="7" height="14" fill="#ffffff" opacity=".018"/></pattern></defs>`);
  if (header) {
    if (!o.transparent) g += `<rect width="${W}" height="${H}" fill="url(#bgg)"/><rect width="${W}" height="${H}" fill="url(#str)"/>`;
    g += `<rect x="0" y="18" width="${W * 0.82}" height="${headH - 30}" fill="url(#hdg)"/>`;
    g += `<rect x="0" y="18" width="7" height="${headH - 30}" fill="#e7b8ff"/>`;
    g += `<text x="30" y="56" font-family="Arial Black,Arial,sans-serif" font-style="italic" font-weight="900" font-size="28" fill="#fff">${esc(o.title || '')}</text>`;
    if (o.subtitle) g += `<text x="30" y="84" font-family="Segoe UI,Arial,sans-serif" font-size="16" fill="#e6d6ff">${esc(o.subtitle)}</text>`;
    g += `<text x="${W - 24}" y="54" text-anchor="end" font-family="Arial Black,Arial,sans-serif" font-size="14" fill="#cfa6ff" opacity=".9">${esc(o.tag || '')}</text>`;
  }
  let y = headH + (header ? 6 : 0);
  rows.forEach((r, i) => {
    const s = r.s;
    const hl = i === o.sel;
    const x0 = header ? 14 : 0;
    const rw = W - x0 - (header ? 14 : 0);
    g += `<g class="step" data-i="${i}">`;
    g += `<rect x="${x0}" y="${y}" width="${rw}" height="${r.h}" fill="${hl ? 'url(#hl)' : 'url(#rowg)'}"/>`;
    g += `<rect x="${x0}" y="${y}" width="${rw}" height="1.5" fill="#ffffff" opacity="${hl ? .35 : .07}"/>`;
    const done = o.done !== undefined && i < o.done;
    if (done) {
      g += `<circle cx="${x0 + 27}" cy="${y + ROW / 2}" r="14" fill="#1f9d55"/><path d="M${x0 + 20} ${y + ROW / 2} l5 6 l10 -12" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else if (hl) {
      g += `<path d="M${x0 + 14} ${y + 18} l10 12 l-10 12 M${x0 + 26} ${y + 18} l10 12 l-10 12" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else {
      g += `<circle cx="${x0 + 27}" cy="${y + ROW / 2}" r="13" fill="#0c0a12" stroke="#4a3d63" stroke-width="1.5"/><text x="${x0 + 27}" y="${y + ROW / 2 + 5}" text-anchor="middle" font-family="Arial Black,Arial" font-size="13" fill="#b9a9d6">${i + 1}</text>`;
    }
    let px = x0 + LEFT;
    const py = y + (ROW - IS) / 2;
    if (o.conn && i > 0) {
      const lab = s.conn === '>' ? 'cancel' : 'link';
      g += `<rect x="${px}" y="${y + ROW / 2 - 11}" width="54" height="22" rx="4" fill="${s.conn === '>' ? '#ff3d8b' : '#3a3150'}" opacity=".9"/><text x="${px + 27}" y="${y + ROW / 2 + 5}" text-anchor="middle" font-family="Segoe UI,Arial" font-weight="700" font-size="12" fill="#fff">${lab}</text>`;
      px += 64;
    } else if (o.conn) px += 64;
    for (const p of trialParts(s.nota)) {
      if (p.t === 'dir' || p.t === 'btn') g += iconSVG(String(p.v), px, py, IS);
      else if (p.t === 'charge') g += iconSVG(String(p.v), px, py, IS) + `<rect x="${px + 2}" y="${py + IS - 6}" width="${IS - 4}" height="12" rx="6" fill="#120d1c" stroke="#ffb400"/><text x="${px + IS / 2}" y="${py + IS + 4}" text-anchor="middle" font-family="Segoe UI,Arial" font-weight="800" font-size="9.5" fill="#ffd36b">CARGA</text>`;
      else if (p.t === 'plus') g += (customIcons.PLUS || (usePack && ICON_PACK.PLUS)) ? `<image href="${customIcons.PLUS || ICON_PACK.PLUS.src}" x="${px}" y="${py + (IS - PLUS) / 2}" width="${PLUS}" height="${PLUS}"/>` : `<text x="${px + PLUS / 2}" y="${py + IS / 2 + 8}" text-anchor="middle" font-family="Arial Black,Arial" font-size="24" fill="#fff" stroke="#120d1c" stroke-width="4" paint-order="stroke">+</text>`;
      else if (p.t === 'sep') g += `<text x="${px + SEP / 2}" y="${py + IS / 2 + 8}" text-anchor="middle" font-family="Arial Black,Arial" font-size="22" fill="#d9c9f5">~</text>`;
      else if (p.t === 'air') g += `<rect x="${px}" y="${py + 8}" width="58" height="24" rx="12" fill="#120d1c" stroke="#bfa2ea"/><text x="${px + 29}" y="${py + 25}" text-anchor="middle" font-family="Segoe UI,Arial" font-weight="800" font-size="12.5" fill="#f0e6ff">SALTO</text>`;
      else if (p.t === 'txt') g += `<text x="${px}" y="${py + IS / 2 + 6}" font-family="Consolas,monospace" font-size="18" fill="#fff">${esc(p.v)}</text>`;
      px += partWidth(p) + GAPI;
    }
    let gx = x0 + rw - 14;
    const gauge = (key, label, col) => {
      const gh = 30;
      if (usePack && ICON_PACK[key] && !customIcons.noGauge) {
        const gw = ICON_PACK[key].w * gh / ICON_PACK[key].h;
        gx -= gw;
        g += `<image href="${ICON_PACK[key].src}" x="${gx}" y="${y + (ROW - gh) / 2}" width="${gw}" height="${gh}"/>`;
      } else {
        gx -= 70;
        g += `<path d="M${gx + 6} ${y + ROW / 2 - 9} h34 l10 18 h-34 z" fill="${col}"/><text x="${gx + 58}" y="${y + ROW / 2 + 7}" font-family="Arial Black,Arial" font-size="18" fill="#ddd">${label}</text>`;
      }
      gx -= 10;
    };
    if (s.sa) gauge('S' + s.sa, s.sa, '#ff4fa8');
    if (s.drive) gauge('D' + String(s.drive).replace('0.5', '05'), s.drive, '#3ddc5f');
    if (o.names && s.name) g += `<text x="${px + 14}" y="${y + ROW / 2 + 6}" font-family="Segoe UI,Arial,sans-serif" font-size="16" font-weight="600" fill="${hl ? '#fff' : '#d6cbe9'}">${esc(s.name)}</text>`;
    if (s.note) g += `<text x="${x0 + LEFT + (o.conn ? 64 : 0)}" y="${y + ROW + 12}" font-family="Segoe UI,Arial,sans-serif" font-size="14.5" fill="#cbb8e8">(${esc(s.note)})</text>`;
    g += '</g>';
    y += r.h + GAP;
  });
  notaLines.forEach((ln, k) => { g += `<text x="${header ? 30 : 4}" y="${y + 30 + k * 22}" font-family="Consolas,monospace" font-size="16" fill="#8d82a6">${esc(ln)}</text>`; });
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g}</svg>`, W, H };
}

