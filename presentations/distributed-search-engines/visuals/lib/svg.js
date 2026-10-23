/* Tiny SVG string builder. Pure functions, no DOM, so the same scene code runs
 * in the browser viewer and in `node export.js`.
 *
 * PowerPoint renders embedded SVG with its own engine, which ignores CSS
 * classes, filters and markers. So everything here uses plain presentation
 * attributes, arrowheads are real polygons, and text baselines are computed
 * by hand instead of using dominant-baseline. */
(function (g) {
  'use strict';
  const VIS = (g.VIS = g.VIS || {});

  const esc = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const num = (v) => (typeof v === 'number' ? String(Math.round(v * 100) / 100) : v);

  function attrs(o) {
    let s = '';
    for (const k in o) {
      const v = o[k];
      if (v === null || v === undefined || v === false) continue;
      const name = k === 'viewBox' ? k : k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
      s += ` ${name}="${esc(num(v))}"`;
    }
    return s;
  }

  function el(tag, a, ...children) {
    const inner = children.flat(Infinity).filter((x) => x !== null && x !== undefined && x !== false && x !== '').join('');
    return inner ? `<${tag}${attrs(a || {})}>${inner}</${tag}>` : `<${tag}${attrs(a || {})}/>`;
  }

  // ---- Text width estimate ------------------------------------------------
  // Google Sans advance widths per 1000 em, measured from fonts/GoogleSans.ttf
  // at weights 400, 500 and 700 (tools: PIL getlength).
  const GS = {
    400: { chars: " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]_abcdefghijklmnopqrstuvwxyz|~·×→←↑↓…–—≈’“”✓✗∩≥≤÷°ÀÁÈÉÍÏÒÓÚÜàáèéíïòóúüçÇñ", w: [232,236,320,640,540,828,623,177,321,321,425,556,236,439,236,300,643,430,524,533,591,559,555,527,550,555,236,236,495,566,495,487,882,670,600,736,701,544,529,806,696,243,530,627,505,864,706,822,574,822,591,555,530,667,633,944,619,585,570,316,316,476,531,600,540,600,561,362,595,562,209,209,504,209,873,559,594,600,600,370,471,364,559,508,775,473,508,486,235,534,236,544,1074,1074,451,451,696,600,900,534,222,391,391,934,580,580,495,495,542,322,670,670,544,544,243,243,822,822,667,667,531,531,561,561,209,209,594,594,559,559,540,736,559] },
    500: { chars: " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]_abcdefghijklmnopqrstuvwxyz|~·×→←↑↓…–—≈’“”✓✗∩≥≤÷°ÀÁÈÉÍÏÒÓÚÜàáèéíïòóúüçÇñ", w: [233,260,357,655,555,843,640,200,339,339,443,568,260,451,260,323,657,445,539,555,607,567,566,541,577,566,260,260,512,579,512,499,888,696,620,740,718,565,550,812,714,270,548,656,526,881,723,830,591,830,615,568,554,683,659,962,650,609,589,340,340,487,545,614,553,614,572,377,608,581,233,233,530,233,890,578,603,614,614,395,487,389,578,540,803,497,539,497,258,548,260,583,1098,1098,504,504,732,612,915,548,244,438,438,934,585,585,512,512,554,322,696,696,565,565,270,270,830,830,683,683,545,545,572,572,233,233,603,603,578,578,553,740,578] },
    700: { chars: " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]_abcdefghijklmnopqrstuvwxyz|~·×→←↑↓…–—≈’“”✓✗∩≥≤÷°ÀÁÈÉÍÏÒÓÚÜàáèéíïòóúüçÇñ", w: [234,284,395,670,570,858,658,223,357,357,462,581,284,463,284,346,672,460,554,578,624,575,577,555,604,577,284,284,529,593,529,512,895,722,641,745,736,586,571,818,733,297,567,685,547,899,741,838,608,838,639,582,579,700,686,981,682,633,608,365,365,499,560,628,567,628,584,392,622,600,257,257,557,257,908,597,613,628,628,421,503,415,597,572,832,522,570,508,282,563,284,623,1123,1123,559,559,768,625,931,563,267,486,486,934,590,590,529,529,567,323,722,722,586,586,297,297,838,838,700,700,560,560,584,584,257,257,613,613,597,597,567,745,597] },
  };
  const TABLES = {};
  for (const k in GS) {
    const t = {};
    Array.from(GS[k].chars).forEach((ch, i) => { t[ch] = GS[k].w[i]; });
    TABLES[k] = t;
  }

  // weight: false/'normal'/400, 500/'medium', true/'bold'/700
  function tw(str, size = 20, weight = false) {
    const wk = weight === true || weight === 'bold' || weight === 700 ? 700 : weight === 500 || weight === 'medium' ? 500 : 400;
    const table = TABLES[wk];
    let w = 0;
    for (const ch of String(str)) {
      const v = table[ch];
      w += v === undefined ? 600 : v;
    }
    return (w / 1000) * size;
  }

  // ---- Shapes --------------------------------------------------------------
  function rect(x, y, w, h, o = {}) {
    return el('rect', {
      x, y, width: w, height: h, rx: o.rx, ry: o.rx,
      fill: o.fill || 'none', fillOpacity: o.fo, stroke: o.stroke, strokeWidth: o.stroke ? o.sw || 1.5 : null,
      strokeDasharray: o.dash, strokeOpacity: o.so, opacity: o.opacity,
    });
  }
  function circle(cx, cy, r, o = {}) {
    return el('circle', {
      cx, cy, r, fill: o.fill || 'none', fillOpacity: o.fo, stroke: o.stroke,
      strokeWidth: o.stroke ? o.sw || 1.5 : null, strokeDasharray: o.dash, opacity: o.opacity,
    });
  }
  function line(x1, y1, x2, y2, o = {}) {
    return el('line', {
      x1, y1, x2, y2, stroke: o.stroke || VIS.theme.c.muted, strokeWidth: o.sw || 1.5,
      strokeDasharray: o.dash, strokeLinecap: o.cap || 'round', opacity: o.opacity, strokeOpacity: o.so,
    });
  }
  function path(d, o = {}) {
    return el('path', {
      d, fill: o.fill || 'none', fillOpacity: o.fo, stroke: o.stroke, strokeWidth: o.stroke ? o.sw || 1.5 : null,
      strokeDasharray: o.dash, strokeLinecap: o.cap || 'round', strokeLinejoin: o.join || 'round', opacity: o.opacity,
    });
  }
  function poly(points, o = {}) {
    const pts = points.map((p) => `${num(p[0])},${num(p[1])}`).join(' ');
    return el('polygon', {
      points: pts, fill: o.fill || 'none', stroke: o.stroke, strokeWidth: o.stroke ? o.sw || 1.5 : null,
      strokeLinejoin: 'round', opacity: o.opacity,
    });
  }
  function group(children, o = {}) {
    return el('g', { transform: o.transform, opacity: o.opacity }, children);
  }

  // ---- Text ----------------------------------------------------------------
  // text(x, y, str, opts): y is the baseline unless opts.vc (vertical centre).
  // str may be a string, a string with '\n', or an array of lines. A line may
  // itself be an array of segments: { t, weight, fill, italic, size }.
  function text(x, y, str, o = {}) {
    const size = o.size || 20;
    const lh = o.lh || size * 1.25;
    const lines = Array.isArray(str) ? str : String(str).split('\n');
    const total = lh * (lines.length - 1);
    let y0 = o.vc ? y - total / 2 + size * 0.35 : y;
    const base = {
      // rsvg-convert drops spaces at the edges of a <tspan> without this.
      'xml:space': 'preserve',
      x, y: y0, 'font-family': VIS.theme.font, 'font-size': size,
      'font-weight': o.weight && o.weight !== 'normal' ? o.weight : null,
      'font-style': o.italic ? 'italic' : null, fill: o.fill || VIS.theme.c.text,
      'text-anchor': o.anchor && o.anchor !== 'start' ? o.anchor : null, opacity: o.opacity,
      'letter-spacing': o.ls,
    };
    const seg = (s) => {
      if (typeof s === 'string') return esc(s);
      return el('tspan', {
        'font-weight': s.weight, fill: s.fill, 'font-style': s.italic ? 'italic' : null, 'font-size': s.size,
      }, esc(s.t));
    };
    if (lines.length === 1) {
      const l = lines[0];
      return el('text', base, Array.isArray(l) ? l.map(seg) : esc(l));
    }
    return el('text', base, lines.map((l, i) =>
      el('tspan', { x, dy: i === 0 ? 0 : lh }, Array.isArray(l) ? l.map(seg) : esc(l))));
  }

  // Greedy word wrap using the width estimate. Returns an array of lines.
  function wrap(str, maxW, size = 20, bold = false) {
    const words = String(str).split(/\s+/);
    const out = [];
    let cur = '';
    for (const w of words) {
      const next = cur ? cur + ' ' + w : w;
      if (tw(next, size, bold) > maxW && cur) { out.push(cur); cur = w; } else cur = next;
    }
    if (cur) out.push(cur);
    return out;
  }

  // ---- Arrows --------------------------------------------------------------
  function head(x, y, ang, size, color) {
    const a1 = ang + Math.PI * 0.84, a2 = ang - Math.PI * 0.84;
    return poly([
      [x, y],
      [x + size * Math.cos(a1), y + size * Math.sin(a1)],
      [x + size * 0.55 * Math.cos(ang + Math.PI), y + size * 0.55 * Math.sin(ang + Math.PI)],
      [x + size * Math.cos(a2), y + size * Math.sin(a2)],
    ], { fill: color });
  }

  // Straight arrow from (x1,y1) to (x2,y2). opts: color, sw, size, dash,
  // both (head at start too), gap1/gap2 (shorten each end), opacity.
  function arrow(x1, y1, x2, y2, o = {}) {
    const color = o.color || VIS.theme.c.muted;
    const sw = o.sw || 2;
    const size = o.size || 8 + sw * 2;
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const g1 = o.gap1 || 0, g2 = o.gap2 || 0;
    const sx = x1 + g1 * Math.cos(ang), sy = y1 + g1 * Math.sin(ang);
    const ex = x2 - g2 * Math.cos(ang), ey = y2 - g2 * Math.sin(ang);
    const back = size * 0.6;
    const lx2 = ex - back * Math.cos(ang), ly2 = ey - back * Math.sin(ang);
    const lx1 = o.both ? sx + back * Math.cos(ang) : sx, ly1 = o.both ? sy + back * Math.sin(ang) : sy;
    return group([
      line(lx1, ly1, lx2, ly2, { stroke: color, sw, dash: o.dash }),
      head(ex, ey, ang, size, color),
      o.both ? head(sx, sy, ang + Math.PI, size, color) : null,
    ], { opacity: o.opacity });
  }

  // Curved arrow (quadratic). bend > 0 bows to the left of the direction.
  function curve(x1, y1, x2, y2, o = {}) {
    const color = o.color || VIS.theme.c.muted;
    const sw = o.sw || 2;
    const size = o.size || 8 + sw * 2;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    const bend = o.bend === undefined ? 0.25 : o.bend;
    const cx = mx - (dy / len) * len * bend, cy = my + (dx / len) * len * bend;
    const ang = Math.atan2(y2 - cy, x2 - cx);
    const back = size * 0.6;
    const ex = x2 - back * Math.cos(ang), ey = y2 - back * Math.sin(ang);
    return group([
      path(`M${num(x1)},${num(y1)} Q${num(cx)},${num(cy)} ${num(ex)},${num(ey)}`, { stroke: color, sw, dash: o.dash }),
      head(x2, y2, ang, size, color),
    ], { opacity: o.opacity });
  }

  // Polyline arrow through points [[x,y],...] with rounded corners.
  function elbow(points, o = {}) {
    const color = o.color || VIS.theme.c.muted;
    const sw = o.sw || 2;
    const size = o.size || 8 + sw * 2;
    const n = points.length;
    const [px, py] = points[n - 2], [ex, ey] = points[n - 1];
    const ang = Math.atan2(ey - py, ex - px);
    const back = size * 0.6;
    const pts = points.slice(0, n - 1).concat([[ex - back * Math.cos(ang), ey - back * Math.sin(ang)]]);
    const r = o.r === undefined ? 10 : o.r;
    let d = `M${num(pts[0][0])},${num(pts[0][1])}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i], [cx2, cy2] = pts[i + 1];
      const l1 = Math.hypot(bx - ax, by - ay) || 1, l2 = Math.hypot(cx2 - bx, cy2 - by) || 1;
      const rr = Math.min(r, l1 / 2, l2 / 2);
      const p1 = [bx - ((bx - ax) / l1) * rr, by - ((by - ay) / l1) * rr];
      const p2 = [bx + ((cx2 - bx) / l2) * rr, by + ((cy2 - by) / l2) * rr];
      d += ` L${num(p1[0])},${num(p1[1])} Q${num(bx)},${num(by)} ${num(p2[0])},${num(p2[1])}`;
    }
    d += ` L${num(pts[pts.length - 1][0])},${num(pts[pts.length - 1][1])}`;
    return group([path(d, { stroke: color, sw, dash: o.dash }), head(ex, ey, ang, size, color)], { opacity: o.opacity });
  }

  // ---- Document wrapper ----------------------------------------------------
  function svgDoc(w, h, body, o = {}) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">` +
      (o.bg ? rect(0, 0, w, h, { fill: o.bg }) : '') + (Array.isArray(body) ? body.flat(Infinity).filter(Boolean).join('') : body) +
      '</svg>';
  }

  VIS.svg = { esc, el, attrs, tw, wrap, rect, circle, line, path, poly, group, text, arrow, curve, elbow, svgDoc };
})(typeof globalThis !== 'undefined' ? globalThis : window);
