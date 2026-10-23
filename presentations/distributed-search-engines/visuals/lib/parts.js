/* Reusable visual vocabulary. Every scene should draw machines, documents,
 * postings chips, search boxes and arrows with these, so the whole deck looks
 * like one system. All functions return SVG strings. Coordinates are the
 * top-left corner unless the name says "c" (centre). */
(function (g) {
  'use strict';
  const VIS = (g.VIS = g.VIS || {});
  const S = VIS.svg;
  const T = () => VIS.theme;
  const C = () => VIS.theme.c;

  // Resolve a colour spec: a shard index (0-3), 'grey', or a palette object.
  function pal(p) {
    if (p === undefined || p === null || p === 'grey' || p === 'neutral') return T().neutral;
    if (typeof p === 'number') return T().shard[p % 4];
    if (typeof p === 'string') return T().shard.find((s) => s.name === p) || T().neutral;
    return p;
  }

  // ---- Status badges (small circles drawn on top of things) ----------------
  function xBadge(cx, cy, r = 11) {
    const d = r * 0.42;
    return S.group([
      S.circle(cx, cy, r, { fill: C().red, stroke: '#fff', sw: 2 }),
      S.line(cx - d, cy - d, cx + d, cy + d, { stroke: '#fff', sw: 2.4 }),
      S.line(cx - d, cy + d, cx + d, cy - d, { stroke: '#fff', sw: 2.4 }),
    ]);
  }
  function checkBadge(cx, cy, r = 11, color) {
    return S.group([
      S.circle(cx, cy, r, { fill: color || C().green, stroke: '#fff', sw: 2 }),
      S.path(`M${cx - r * 0.45},${cy + r * 0.02} L${cx - r * 0.1},${cy + r * 0.38} L${cx + r * 0.5},${cy - r * 0.35}`,
        { stroke: '#fff', sw: 2.4 }),
    ]);
  }
  function clockBadge(cx, cy, r = 11) {
    return S.group([
      S.circle(cx, cy, r, { fill: C().yellow, stroke: '#fff', sw: 2 }),
      S.line(cx, cy, cx, cy - r * 0.55, { stroke: '#fff', sw: 2.2 }),
      S.line(cx, cy, cx + r * 0.45, cy + r * 0.2, { stroke: '#fff', sw: 2.2 }),
    ]);
  }
  function warnBadge(cx, cy, r = 12) {
    const h = r * 1.8;
    return S.group([
      S.poly([[cx, cy - h * 0.55], [cx + r, cy + h * 0.45], [cx - r, cy + h * 0.45]], { fill: C().yellow, stroke: '#fff', sw: 2 }),
      S.line(cx, cy - h * 0.18, cx, cy + h * 0.12, { stroke: '#fff', sw: 2.4 }),
      S.circle(cx, cy + h * 0.3, 1.6, { fill: '#fff' }),
    ]);
  }
  function numBadge(cx, cy, n, o = {}) {
    const r = o.r || 13;
    return S.group([
      S.circle(cx, cy, r, { fill: o.fill || C().blue }),
      S.text(cx, cy, String(n), { size: o.size || r * 1.2, weight: 'bold', fill: '#fff', anchor: 'middle', vc: true }),
    ]);
  }

  // ---- Machine (a server card) ----------------------------------------------
  // opts: color (shard index / 'grey'), label, w, h, state:
  //   'normal' | 'active' (chosen) | 'down' (failed) | 'slow' | 'dim'
  //   sub: small text under the card.
  function machine(x, y, o = {}) {
    const w = o.w || 56, h = o.h || 64;
    const p = pal(o.color);
    const st = o.state || 'normal';
    const stroke = st === 'down' ? C().red : p.main;
    const fill = st === 'active' ? p.soft : st === 'down' ? '#FCE8E6' : '#FFFFFF';
    const led = st === 'down' ? C().red : st === 'slow' ? C().yellow : st === 'dim' ? C().faint : '#34A853';
    const bay = st === 'active' ? '#FFFFFF' : p.soft;
    const parts = [];
    if (st === 'active') parts.push(S.rect(x - 5, y - 5, w + 10, h + 10, { rx: 13, fill: 'none', stroke: p.mid, sw: 4 }));
    parts.push(S.rect(x, y, w, h, { rx: 9, fill, stroke, sw: st === 'active' ? 2.5 : 2, dash: st === 'down' ? '5 4' : null }));
    const bx = x + w * 0.16, bw = w * 0.68, bh = Math.max(6, h * 0.13);
    parts.push(S.rect(bx, y + h * 0.17, bw, bh, { rx: 3, fill: bay, stroke: st === 'active' ? p.mid : null, sw: 1 }));
    parts.push(S.rect(bx, y + h * 0.17 + bh * 1.75, bw, bh, { rx: 3, fill: bay, stroke: st === 'active' ? p.mid : null, sw: 1 }));
    parts.push(S.circle(x + w - w * 0.22, y + h - h * 0.19, Math.max(3, w * 0.06), { fill: led }));
    if (o.label) {
      parts.push(S.text(x + w * 0.17, y + h - h * 0.12, o.label, {
        size: o.labelSize || Math.max(16, Math.round(h * 0.27)), weight: 'bold', fill: st === 'down' ? C().red : p.ink,
      }));
    }
    if (st === 'down') parts.push(xBadge(x + w - 2, y + 2, 11));
    if (st === 'slow') parts.push(clockBadge(x + w - 2, y + 2, 11));
    if (o.sub) parts.push(S.text(x + w / 2, y + h + 20, o.sub, { size: o.subSize || 16, fill: C().muted, anchor: 'middle' }));
    return S.group(parts, { opacity: st === 'dim' ? 0.35 : o.opacity });
  }

  // ---- Document (page with folded corner) -----------------------------------
  // opts: color, w, h, label (inside, bold), state: 'normal' | 'hl' | 'dim'
  function doc(x, y, o = {}) {
    const w = o.w || 28, h = o.h || 36;
    const p = pal(o.color);
    const f = Math.min(9, w * 0.3);
    const hl = o.state === 'hl';
    const parts = [
      S.path(`M${x},${y} H${x + w - f} L${x + w},${y + f} V${y + h} H${x} Z`,
        { fill: hl ? p.soft : '#FFFFFF', stroke: p.main, sw: hl ? 2.2 : 1.6 }),
      S.path(`M${x + w - f},${y} V${y + f} H${x + w}`, { stroke: p.main, sw: 1.4 }),
    ];
    if (o.label !== undefined) {
      parts.push(S.text(x + w / 2, y + h * 0.62, String(o.label), {
        size: o.labelSize || Math.max(16, Math.round(h * 0.42)), weight: 'bold', fill: p.ink, anchor: 'middle', vc: true,
      }));
    } else {
      for (let i = 0; i < 3; i++) {
        const ly = y + h * 0.38 + i * h * 0.17;
        parts.push(S.line(x + w * 0.2, ly, x + w * (i === 2 ? 0.55 : 0.8), ly, { stroke: p.mid, sw: 1.6 }));
      }
    }
    return S.group(parts, { opacity: o.state === 'dim' ? 0.3 : o.opacity });
  }

  // ---- Chip (rounded label: postings entries, doc IDs, scores) --------------
  // opts: w (else from text), h, fill, stroke, color (text), size, bold, rx
  function chipWidth(label, o = {}) {
    const size = o.size || 17;
    return o.w || Math.max(o.minW || 0, S.tw(label, size, o.bold) + (o.padX || 12) * 2);
  }
  function chip(x, y, label, o = {}) {
    const size = o.size || 17, h = o.h || 30;
    const w = chipWidth(label, o);
    return S.group([
      S.rect(x, y, w, h, { rx: o.rx === undefined ? 7 : o.rx, fill: o.fill || C().bgGrey, stroke: o.stroke, sw: o.sw || 1.5, dash: o.dash }),
      S.text(x + w / 2, y + h / 2, label, { size, weight: o.bold ? 'bold' : null, fill: o.color || C().text2, anchor: 'middle', vc: true }),
    ], { opacity: o.opacity });
  }

  // ---- Google-style search box ---------------------------------------------
  // opts: text, h, size, cursor (bool), placeholder (grey text), focus (blue ring)
  function magnifier(cx, cy, r, color) {
    const d = r * 0.72;
    return S.group([
      S.circle(cx - r * 0.18, cy - r * 0.18, r * 0.62, { stroke: color, sw: Math.max(1.8, r * 0.22) }),
      S.line(cx + r * 0.27, cy + r * 0.27, cx + d, cy + d, { stroke: color, sw: Math.max(2, r * 0.26) }),
    ]);
  }
  function searchBox(x, y, w, o = {}) {
    const h = o.h || 52;
    const size = o.size || Math.round(h * 0.4);
    const parts = [
      S.rect(x, y + 2, w, h, { rx: h / 2, fill: 'none', stroke: '#202124', so: 0.06, sw: 6 }),
      S.rect(x, y, w, h, { rx: h / 2, fill: '#FFFFFF', stroke: o.focus ? C().blue : '#DFE1E5', sw: o.focus ? 2 : 1.5 }),
      magnifier(x + h * 0.5, y + h * 0.5, h * 0.26, C().faint),
    ];
    const tx = x + h * 0.95;
    if (o.text) {
      parts.push(S.text(tx, y + h / 2, o.text, { size, fill: C().text, vc: true }));
      if (o.cursor) {
        const cx = tx + S.tw(o.text, size) + 3;
        parts.push(S.line(cx, y + h * 0.26, cx, y + h * 0.74, { stroke: C().text, sw: 1.6, cap: 'butt' }));
      }
    } else if (o.placeholder) {
      parts.push(S.text(tx, y + h / 2, o.placeholder, { size, fill: C().faint, vc: true }));
    }
    return S.group(parts, { opacity: o.opacity });
  }

  // ---- People and agents ------------------------------------------------------
  function user(cx, cy, s = 40, color) {
    const col = color || C().muted;
    return S.group([
      S.circle(cx, cy - s * 0.2, s * 0.2, { fill: col }),
      S.path(`M${cx - s * 0.36},${cy + s * 0.42} Q${cx - s * 0.36},${cy + s * 0.06} ${cx},${cy + s * 0.06} Q${cx + s * 0.36},${cy + s * 0.06} ${cx + s * 0.36},${cy + s * 0.42} Z`,
        { fill: col }),
    ]);
  }
  function agent(cx, cy, s = 40, color) {
    const col = color || C().blue;
    const w = s * 0.8, h = s * 0.6;
    return S.group([
      S.line(cx, cy - h / 2 - s * 0.05, cx, cy - h / 2 - s * 0.18, { stroke: col, sw: Math.max(2, s * 0.05) }),
      S.circle(cx, cy - h / 2 - s * 0.22, s * 0.06, { fill: col }),
      S.rect(cx - w / 2, cy - h / 2, w, h, { rx: s * 0.14, fill: col }),
      S.circle(cx - w * 0.2, cy - h * 0.02, s * 0.07, { fill: '#fff' }),
      S.circle(cx + w * 0.2, cy - h * 0.02, s * 0.07, { fill: '#fff' }),
      S.line(cx - w * 0.18, cy + h * 0.25, cx + w * 0.18, cy + h * 0.25, { stroke: '#fff', sw: Math.max(1.6, s * 0.04) }),
    ]);
  }

  // ---- Panels and labels ------------------------------------------------------
  // card: rounded panel. opts: fill, stroke, rx, title, titleColor, titleSize, dash
  function card(x, y, w, h, o = {}) {
    const parts = [S.rect(x, y, w, h, { rx: o.rx === undefined ? 12 : o.rx, fill: o.fill || '#FFFFFF', stroke: o.stroke === undefined ? C().line : o.stroke, sw: o.sw || 1.5, dash: o.dash })];
    if (o.title) parts.push(S.text(x + (o.padX || 16), y + (o.titleSize || 18) + 12, o.title, { size: o.titleSize || 18, weight: 'bold', fill: o.titleColor || C().text2 }));
    return S.group(parts, { opacity: o.opacity });
  }
  // A small pill label, e.g. "3 hours ago" or "illustrative numbers".
  function badge(x, y, label, o = {}) {
    const p = pal(o.color);
    const size = o.size || 16, h = o.h || size * 1.7;
    const w = S.tw(label, size, o.bold) + size * 1.4;
    const ax = o.anchor === 'middle' ? x - w / 2 : o.anchor === 'end' ? x - w : x;
    return S.group([
      S.rect(ax, y, w, h, { rx: h / 2, fill: o.fill || p.soft, stroke: o.stroke, sw: 1.2, dash: o.dash }),
      S.text(ax + w / 2, y + h / 2, label, { size, fill: o.ink || p.ink, anchor: 'middle', vc: true, weight: o.bold ? 'bold' : null, italic: o.italic }),
    ], { opacity: o.opacity });
  }
  // Marks invented numbers. Put it in a corner of every [ILLUSTRATIVE] visual.
  function illustrative(x, y, o = {}) {
    return badge(x, y, o.label || 'illustrative numbers', { fill: '#FFFFFF', stroke: C().line, dash: '4 3', ink: C().muted, size: o.size || 16, italic: true, anchor: o.anchor });
  }
  // Small grey source line, e.g. "Barroso, Dean & Hölzle (2003)".
  function source(x, y, label, o = {}) {
    return S.text(x, y, label, { size: o.size || 16, fill: C().faint, anchor: o.anchor });
  }
  // Numbered callout: circle number, bold title, wrapped body.
  function callout(x, y, w, o = {}) {
    const p = pal(o.color);
    const size = o.size || 18;
    const parts = [];
    let tx = x;
    if (o.num !== undefined) { parts.push(numBadge(x + 13, y + 12, o.num, { r: 14, fill: o.badgeFill || p.main })); tx = x + 34; }
    if (o.icon) { parts.push(o.icon(x + 13, y + 12)); tx = x + 34; }
    let yy = y + 18;
    if (o.title) { parts.push(S.text(tx, yy, o.title, { size: size + 1, weight: 'bold', fill: o.titleColor || C().text })); yy += size * 1.35; }
    if (o.body) {
      const lines = S.wrap(o.body, w - (tx - x), size);
      parts.push(S.text(tx, yy, lines, { size, fill: C().text2, lh: size * 1.3 }));
    }
    return S.group(parts, { opacity: o.opacity });
  }

  // ---- Ranked list (doc, score) ---------------------------------------------
  // rows: [{ label, score, color, hl, strike }]. opts: w, rh, size, title
  function rankList(x, y, rows, o = {}) {
    const w = o.w || 180, rh = o.rh || 34, size = o.size || 17;
    const parts = [];
    let yy = y;
    if (o.title) { parts.push(S.text(x, yy + size, o.title, { size, weight: 'bold', fill: C().text2 })); yy += size + 10; }
    rows.forEach((r, i) => {
      const p = pal(r.color);
      const ry = yy + i * rh;
      parts.push(S.rect(x, ry, w, rh - 6, { rx: 6, fill: r.hl ? p.soft : '#FFFFFF', stroke: r.hl ? p.main : C().line, sw: r.hl ? 2 : 1.2 }));
      parts.push(S.rect(x + 8, ry + (rh - 6) / 2 - 5, 10, 10, { rx: 2, fill: p.main }));
      parts.push(S.text(x + 26, ry + (rh - 6) / 2, r.label, { size, fill: C().text, vc: true }));
      if (r.score !== undefined) {
        parts.push(S.text(x + w - 10, ry + (rh - 6) / 2, String(r.score), { size, weight: 'bold', fill: r.scoreColor || C().text2, anchor: 'end', vc: true }));
      }
      if (r.strike) parts.push(S.line(x + 6, ry + (rh - 6) / 2, x + w - 6, ry + (rh - 6) / 2, { stroke: C().red, sw: 2 }));
    });
    return S.group(parts, { opacity: o.opacity });
  }

  // ---- Search result (results-page style) ----------------------------------
  // opts: site, url, title, snippet, tag (e.g. "3 hours ago"), color (favicon)
  function serpResult(x, y, w, o = {}) {
    const p = pal(o.color);
    const parts = [
      S.circle(x + 14, y + 15, 14, { fill: p.soft, stroke: C().lineSoft, sw: 1 }),
      S.text(x + 14, y + 15, (o.site || '?')[0].toUpperCase(), { size: 16, weight: 'bold', fill: p.ink, anchor: 'middle', vc: true }),
      S.text(x + 38, y + 11, o.site || '', { size: 16, fill: C().text }),
      S.text(x + 38, y + 30, o.url || '', { size: 16, fill: C().snippet }),
      S.text(x, y + 60, o.title || '', { size: o.titleSize || 21, fill: C().link }),
    ];
    if (o.snippet || o.tag) {
      const lines = S.wrap((o.tag ? o.tag + ' — ' : '') + (o.snippet || ''), w, 16);
      if (o.tag) {
        // Tag in grey at the start of the first line, as on a results page.
        const first = lines[0].slice(o.tag.length);
        lines[0] = [{ t: o.tag, fill: C().faint }, first];
      }
      parts.push(S.text(x, y + 84, lines, { size: 16, fill: C().snippet, lh: 21 }));
    }
    return S.group(parts, { opacity: o.opacity });
  }

  // ---- Queue (load) indicator: n filled boxes out of max -------------------
  function queue(x, y, n, o = {}) {
    const max = o.max || 5, s = o.s || 9, gap = o.gap || 3;
    const p = pal(o.color);
    const parts = [];
    for (let i = 0; i < max; i++) {
      parts.push(S.rect(x + i * (s + gap), y, s, s, { rx: 2, fill: i < n ? (o.fill || p.main) : '#FFFFFF', stroke: i < n ? null : C().line, sw: 1 }));
    }
    return S.group(parts, { opacity: o.opacity });
  }

  // ---- Step indicator (e.g. the three design decisions) --------------------
  function stepper(x, y, items, active, o = {}) {
    const size = o.size || 17, gap = o.gap || 28;
    const parts = [];
    let xx = x;
    items.forEach((it, i) => {
      const on = i === active;
      const done = o.done && i < active;
      parts.push(numBadge(xx + 13, y, i + 1, { r: 13, size: 16, fill: on ? C().blue : done ? C().faint : C().line }));
      parts.push(S.text(xx + 32, y, it, { size, fill: on ? C().blue : C().muted, weight: on ? 'bold' : null, vc: true }));
      // Advance by the bold width, so items keep their place whichever is active.
      xx += 32 + S.tw(it, size, true) + gap;
    });
    return S.group(parts);
  }

  // Horizontal bracket under/over a span, with an optional centred label.
  function bracket(x1, x2, y, o = {}) {
    const d = o.up ? -10 : 10;
    const col = o.color || C().faint;
    const parts = [S.path(`M${x1},${y} V${y + d} H${x2} V${y}`, { stroke: col, sw: o.sw || 1.6 })];
    if (o.label) parts.push(S.text((x1 + x2) / 2, y + d + (o.up ? -10 : 24), o.label, { size: o.size || 17, fill: o.ink || C().muted, anchor: 'middle', weight: o.bold ? 'bold' : null }));
    return S.group(parts);
  }

  VIS.parts = {
    pal, xBadge, checkBadge, clockBadge, warnBadge, numBadge, machine, doc, chip, chipWidth, magnifier, searchBox,
    user, agent, card, badge, illustrative, source, callout, rankList, serpResult, queue, stepper, bracket,
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
