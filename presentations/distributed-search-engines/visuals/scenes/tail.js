/* Section 2e (principles): the tail at scale. A derived calculation, not an
 * illustration: P(at least one of N shards is slow) = 1 - 0.99^N, when each
 * shard is slow 1% of the time. Left: the broker with one shard, then with 100
 * shards (one of them slow). Right: the curve for N = 1..100, labelled only at
 * the two values the speaker says (1% and 63%). */
VIS.scene({
  id: 'tail',
  section: 'principles',
  title: 'The tail at scale',
  layout: 'full',
  steps: ['one-shard', 'fan-out'],
  render(step, { S, P, C, T }) {
    const sh = T.shard;
    const fan = step === 1;
    const out = [];

    // ---- Left: broker -> one shard, or a grid of 100 shards ---------------
    const midY = 262;                       // shared centre line
    out.push(P.machine(40, midY - 42, { w: 110, h: 84, color: 'grey', sub: 'Broker', subSize: 20 }));
    out.push(S.arrow(158, midY, 282, midY, { color: C.muted, sw: 2 }));
    const gx0 = 290;                        // left edge of the shard(s)

    if (!fan) {
      out.push(P.machine(gx0, midY - 48, { w: 80, h: 96, color: 0 }));
      out.push(S.text(gx0 + 40, midY - 66, '1 shard', { size: 19, weight: 'bold', fill: sh[0].ink, anchor: 'middle' }));
    } else {
      const cell = 17, pitch = 22, side = 9 * pitch + cell;
      const gy0 = midY - side / 2;
      const slow = 46;
      for (let k = 0; k < 100; k++) {
        const r = Math.floor(k / 10), c = k % 10;
        const x = gx0 + c * pitch, y = gy0 + r * pitch;
        if (k === slow) {
          out.push(S.rect(x, y, cell, cell, { rx: 3, fill: sh[2].main, stroke: sh[2].ink, sw: 1.5 }));
          out.push(P.clockBadge(x + cell + 4, y - 4, 10));
        } else {
          out.push(S.rect(x, y, cell, cell, { rx: 3, fill: sh[0].mid }));
        }
      }
      out.push(S.text(gx0 + side / 2, gy0 - 18, '100 shards', { size: 19, weight: 'bold', fill: sh[0].ink, anchor: 'middle' }));
    }

    // Caption: the assumption (both steps), then the consequence (step 2).
    out.push(S.text(40, 430, 'Each shard is slow 1% of the time', { size: 20, fill: C.text2 }));
    if (fan) out.push(S.text(40, 458, 'The broker waits for the slowest one', { size: 20, weight: 'bold', fill: C.text }));

    // ---- Right: chart of P(at least one slow shard) against N -------------
    const X0 = 640, X1 = 1150, Y0 = 96, Y1 = 384;
    const px = (N) => X0 + ((N - 1) / 99) * (X1 - X0);
    const py = (p) => Y1 - p * (Y1 - Y0);
    const f = (N) => 1 - Math.pow(0.99, N);

    // Gridlines and y tick labels.
    for (const p of [0, 0.25, 0.5, 0.75, 1]) {
      if (p > 0) out.push(S.line(X0, py(p), X1, py(p), { stroke: C.lineSoft, sw: 1.2 }));
      out.push(S.text(X0 - 14, py(p) + 6, `${Math.round(p * 100)}%`, { size: 18, fill: C.muted, anchor: 'end' }));
    }
    out.push(S.text(X0 - 58, 62, 'Queries that hit a slow shard', { size: 18, fill: C.text2 }));

    // Axes and x ticks.
    out.push(S.line(X0, Y1, X1, Y1, { stroke: C.muted, sw: 1.5 }));
    out.push(S.line(X0, Y0, X0, Y1, { stroke: C.muted, sw: 1.5 }));
    for (const N of [1, 25, 50, 75, 100]) {
      out.push(S.line(px(N), Y1, px(N), Y1 + 6, { stroke: C.muted, sw: 1.5 }));
      out.push(S.text(px(N), Y1 + 26, String(N), { size: 18, fill: C.muted, anchor: 'middle' }));
    }
    out.push(S.text((X0 + X1) / 2, Y1 + 56, 'Shards per query (N)', { size: 18, fill: C.text2, anchor: 'middle' }));

    // The curve and its formula, step 2 only.
    if (fan) {
      let d = '';
      for (let N = 1; N <= 100; N++) d += `${N === 1 ? 'M' : 'L'}${px(N).toFixed(1)},${py(f(N)).toFixed(1)} `;
      out.push(S.path(d.trim(), { stroke: sh[0].main, sw: 3 }));
      // Formula above the middle of the curve, with a real superscript N.
      const fMain = '1 − 0.99', fx = 760, fy = 262;
      out.push(S.text(fx, fy, fMain, { size: 22, weight: 'bold', fill: C.text2 }));
      out.push(S.text(fx + S.tw(fMain, 22, true), fy - 10, 'N', { size: 16, weight: 'bold', fill: C.text2 }));
    }

    // N = 1: 1%, in both steps. The label sits above-right, clear of the curve.
    out.push(S.circle(px(1), py(f(1)), 6, { fill: sh[0].main }));
    out.push(S.text(px(1) + 8, py(f(1)) - 36, '1%', { size: 22, weight: 'bold', fill: sh[0].ink }));

    // N = 100: 63%, the punchline.
    if (fan) {
      out.push(S.circle(px(100), py(f(100)), 8, { fill: C.red }));
      out.push(S.text(px(100) - 16, py(f(100)) - 18, '63%', { size: 32, weight: 'bold', fill: C.red, anchor: 'end' }));
    }

    // Source line.
    out.push(S.text(1184, 482, 'Dean & Barroso (2013), The tail at scale', { size: 16, fill: C.muted, anchor: 'end' }));
    return out;
  },
});
