/* Section 4: the limits of distributing search. Three cards on the same grid
 * and with the same header and caption style as three-breaks (section 1), one
 * limit each:
 *   1. replicas cost memory: three full copies of one shard, 3x the memory;
 *   2. more shards, worse tail: the curve 1 - 0.99^N from the tail figure
 *      (chance that at least one of N shards is slow, 1% each), 63% at 100;
 *   3. selective search can miss: only Shard 1 is asked, a relevant page in
 *      Shard 3 is never seen.
 * Build: one card per click; cards still to come are dashed outlines with a
 * faint number and title, and shown cards never move. */
VIS.scene({
  id: 'limits',
  section: 'trends',
  title: 'Limits: memory, fan-out, selective misses',
  layout: 'full',
  steps: ['memory', 'tail', 'selective'],
  render(step, { S, P, C, T }) {
    const sh = T.shard;
    const out = [];
    const PY = 30, PW = 372, PH = 440;
    const xs = [16, 414, 812];

    // ---- 1. Three identical full copies of the same shard ----
    const memory = (px) => {
      const g = [];
      const cx = px + PW / 2;
      const bw = 84, bh = 150, gap = 22, y0 = 138;
      const x0 = cx - (3 * bw + 2 * gap) / 2;
      const bars = [56, 44, 52, 36, 50, 40];
      for (let k = 0; k < 3; k++) {
        const bx = x0 + k * (bw + gap);
        g.push(S.rect(bx, y0, bw, bh, { rx: 10, fill: sh[0].soft, stroke: sh[0].main, sw: 2 }));
        bars.forEach((w, i) => g.push(S.rect(bx + 14, y0 + 20 + i * 21, w, 10, { rx: 3, fill: sh[0].mid })));
        g.push(S.text(bx + bw / 2, y0 + bh + 26, `replica ${k + 1}`, { size: 17, fill: C.muted, anchor: 'middle' }));
      }
      g.push(P.bracket(x0, x0 + 3 * bw + 2 * gap, y0 + bh + 44, { label: '3× the memory', size: 19, bold: true, ink: C.text, color: C.faint }));
      return g;
    };

    // ---- 2. 1 - 0.99^N: the tail chart again, in miniature ----
    const tail = (px) => {
      const g = [];
      const x0 = px + 62, W = 262, base = 346, H = 200;   // y axis 0..100 %
      const f = (n) => 1 - Math.pow(0.99, n);
      const X = (n) => x0 + ((n - 1) / 99) * W;
      const Y = (v) => base - v * H;
      g.push(S.text(x0 - 10, 128, 'queries that hit a slow shard', { size: 17, fill: C.muted }));
      g.push(S.line(x0, base, x0 + W + 6, base, { stroke: C.faint, sw: 1.5 }));
      g.push(S.line(x0, base, x0, base - H, { stroke: C.faint, sw: 1.5 }));
      [[0, '0%'], [1, '100%']].forEach(([v, l]) => g.push(S.text(x0 - 8, Y(v), l, { size: 16, fill: C.muted, anchor: 'end', vc: true })));
      g.push(S.line(x0, Y(1), x0 + W, Y(1), { stroke: C.lineSoft, sw: 1 }));
      const pts = [];
      for (let n = 1; n <= 100; n += 1) pts.push([X(n), Y(f(n))]);
      g.push(S.path('M' + pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L'), { stroke: sh[0].main, sw: 3.5 }));
      g.push(S.circle(X(100), Y(f(100)), 7, { fill: C.red, stroke: C.bg, sw: 2 }));
      g.push(S.text(X(100), Y(f(100)) - 18, '63%', { size: 22, weight: 'bold', fill: C.red, anchor: 'middle' }));
      g.push(S.text(X(1), base + 24, '1', { size: 16, fill: C.muted, anchor: 'middle' }));
      g.push(S.text(X(100), base + 24, '100', { size: 16, fill: C.muted, anchor: 'middle' }));
      g.push(S.text((X(1) + X(100)) / 2, base + 24, 'shards', { size: 17, fill: C.muted, anchor: 'middle' }));
      return g;
    };

    // ---- 3. Selective search: only Shard 1 is asked; a match in Shard 3 is missed ----
    const miss = (px) => {
      const g = [];
      const cx = px + PW / 2;
      const bw = 76, bh = 112, gap = 10, y0 = 212;
      const x0 = cx - (4 * bw + 3 * gap) / 2;
      const bxs = [0, 1, 2, 3].map((k) => x0 + k * (bw + gap));
      // The query goes to Shard 1 only.
      const q1 = bxs[0] + bw / 2;
      const qw = P.chipWidth('query', { size: 18, padX: 14 });
      g.push(P.chip(q1 - qw / 2, 134, 'query', { w: qw, h: 34, size: 18, fill: C.bgGrey, color: C.text2 }));
      g.push(S.arrow(q1, 172, q1, y0 - 6, { color: sh[0].main, sw: 2.5 }));
      bxs.forEach((bx, k) => {
        const asked = k === 0;
        const col = sh[k];
        g.push(S.group([
          S.rect(bx, y0, bw, bh, { rx: 10, fill: asked ? col.soft : C.bg, stroke: col.main, sw: asked ? 2.5 : 1.5 }),
          S.text(bx + bw / 2, y0 + 26, `Shard ${k + 1}`, { size: 17, weight: 'bold', fill: col.ink, anchor: 'middle' }),
        ], { opacity: asked ? 1 : 0.4 }));
      });
      // A relevant page in each of Shard 1 (found) and Shard 3 (missed).
      const dw = 30, dh = 40, dy = y0 + 50;
      g.push(P.doc(bxs[0] + (bw - dw) / 2, dy, { w: dw, h: dh, color: 0, state: 'hl' }));
      g.push(P.checkBadge(bxs[0] + (bw + dw) / 2, dy + 2, 10));
      g.push(P.doc(bxs[2] + (bw - dw) / 2, dy, { w: dw, h: dh, color: 2, state: 'hl' }));
      g.push(P.xBadge(bxs[2] + (bw + dw) / 2, dy + 2, 10));
      g.push(S.text(bxs[0] + bw / 2, y0 + bh + 26, 'found', { size: 17, weight: 'bold', fill: C.green, anchor: 'middle' }));
      g.push(S.text(bxs[2] + bw / 2, y0 + bh + 26, 'missed', { size: 17, weight: 'bold', fill: C.red, anchor: 'middle' }));
      return g;
    };

    const cards = [
      { n: 1, title: 'Replicas cost memory', caption: 'every copy is a full copy', draw: memory },
      { n: 2, title: 'More shards, worse tail', caption: 'the slowest shard sets the pace', draw: tail },
      { n: 3, title: 'Selective search can miss', caption: 'relevant pages in shards not asked', draw: miss },
    ];
    cards.forEach((c, i) => {
      const px = xs[i];
      if (i > step) {
        // Still to come: dashed outline, faint number and title (as in three-breaks).
        out.push(P.card(px, PY, PW, PH, { rx: 14, stroke: C.faint, dash: '6 5' }));
        out.push(P.numBadge(px + 34, PY + 36, c.n, { r: 15, fill: C.line }));
        out.push(S.text(px + 58, PY + 36, c.title, { size: 22, weight: 'bold', fill: C.faint, vc: true }));
        return;
      }
      out.push(P.card(px, PY, PW, PH, { rx: 14 }));
      out.push(P.numBadge(px + 34, PY + 36, c.n, { r: 15 }));
      out.push(S.text(px + 58, PY + 36, c.title, { size: 22, weight: 'bold', fill: C.text, vc: true }));
      out.push(c.draw(px));
      out.push(S.text(px + PW / 2, 420, c.caption, { size: 18, fill: C.text2, anchor: 'middle', vc: true }));
    });
    return out;
  },
});
