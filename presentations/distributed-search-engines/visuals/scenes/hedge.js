/* Section 2e (principles): two ways to cut the tail, both using replicas we
 * already have. Timelines with a time axis, no numbers. Generic.
 *   1. hedged-request: replica 1 of shard 1 is slow; after the 95th-percentile
 *      response time a duplicate goes to replica 2; the first answer wins and
 *      replica 1's work is cancelled.
 *   2. deadline: after a cut-off, answer with what arrived; a late shard is
 *      dropped. Four shards, one per shard colour, as in scatter-gather. */
VIS.scene({
  id: 'hedge',
  section: 'principles',
  title: 'Hedged requests and deadlines',
  layout: 'full',
  steps: ['hedged-request', 'deadline'],
  render(step, { S, P, C, T }) {
    const sh = T.shard;
    const deadline = step === 1;
    const out = [];
    const X0 = 200, X1 = 1140, AXY = 428, bh = 26;

    // Time axis, shared by both steps (same coordinates).
    out.push(S.arrow(X0, AXY, X1 + 20, AXY, { color: C.muted, sw: 2 }));
    out.push(S.text(1184, 454, 'time', { size: 18, fill: C.muted, anchor: 'end' }));
    out.push(S.text(1184, 480, 'Dean & Barroso (2013)', { size: 16, fill: C.muted, anchor: 'end' }));

    if (!deadline) {
      // ---- Step 1: hedged request ----------------------------------------
      out.push(S.text(40, 58, 'Duplicate after the 95th-percentile time, take the first answer', { size: 20, fill: C.text2 }));

      const yA = 214, yB = 324;
      const xU = X0 + 0.4 * (X1 - X0); // usual response time, 40% along the axis
      const xB1 = 720, xA1 = 1000;     // replica 2 answers, replica 1 would have
      const blue = sh[0];

      out.push(S.text(40, yA - 46, 'Shard 1', { size: 19, weight: 'bold', fill: blue.ink }));
      out.push(P.machine(40, yA - 23, { w: 40, h: 46, color: 0, state: 'slow' }));
      out.push(S.text(92, yA + 7, 'replica 1', { size: 19, weight: 'bold', fill: C.text2 }));
      out.push(P.machine(40, yB - 23, { w: 40, h: 46, color: 0 }));
      out.push(S.text(92, yB + 7, 'replica 2', { size: 19, weight: 'bold', fill: C.text2 }));

      // Replica 1: slow; working until replica 2 answers, then cancelled.
      out.push(S.rect(X0, yA - bh / 2, xB1 - X0, bh, { rx: 6, fill: blue.main }));
      out.push(S.rect(xB1, yA - bh / 2, xA1 - xB1, bh, { rx: 6, fill: blue.main, opacity: 0.25 }));
      out.push(S.text((xB1 + xA1) / 2, yA, 'cancelled', { size: 17, italic: true, fill: blue.ink, anchor: 'middle', vc: true }));

      // Replica 2: the duplicate, sent at the 95th-percentile time, answers quickly.
      out.push(S.rect(xU, yB - bh / 2, xB1 - xU, bh, { rx: 6, fill: blue.main }));
      out.push(S.text((xU + xB1) / 2, yB, 'duplicate', { size: 17, weight: 'bold', fill: '#FFFFFF', anchor: 'middle', vc: true }));
      out.push(P.checkBadge(xB1 + 16, yB, 12));
      out.push(S.text(xB1 + 36, yB, 'first answer wins', { size: 18, weight: 'bold', fill: C.green, vc: true }));

      // 95th-percentile response time marker (Dean & Barroso hedge after the
      // 95th-percentile latency), drawn over the bars.
      out.push(S.line(xU, 112, xU, AXY - 6, { stroke: C.muted, sw: 2, dash: '7 6' }));
      out.push(S.text(xU, 98, '95th-percentile response time', { size: 18, fill: C.muted, anchor: 'middle' }));
    } else {
      // ---- Step 2: deadline -------------------------------------------------
      out.push(S.text(40, 58, 'Answer with the shards that made it: slightly less complete, much faster', { size: 20, fill: C.text2 }));

      const xD = 840;
      const ys = [145, 225, 305, 385];
      const rows = [
        { name: 'Shard 1', col: 0, end: 560 },
        { name: 'Shard 2', col: 1, end: 760 },
        { name: 'Shard 3', col: 2, end: 640 },
        { name: 'Shard 4', col: 3, end: 1010, late: true },
      ];

      rows.forEach((r, i) => {
        const y = ys[i];
        const p = sh[r.col];
        out.push(S.text(40, y + 7, r.name, { size: 19, weight: 'bold', fill: p.ink }));
        if (!r.late) {
          out.push(S.rect(X0, y - bh / 2, r.end - X0, bh, { rx: 6, fill: p.main }));
          out.push(P.checkBadge(r.end + 16, y, 12));
        } else {
          out.push(S.rect(X0, y - bh / 2, xD - X0, bh, { rx: 6, fill: p.main }));
          out.push(S.rect(xD, y - bh / 2, r.end - xD, bh, { rx: 6, fill: C.line }));
          out.push(P.xBadge(r.end + 16, y, 12));
          out.push(S.text(r.end + 36, y, 'dropped', { size: 18, weight: 'bold', fill: C.red, vc: true }));
        }
      });

      // Deadline marker, drawn over the bars.
      out.push(S.line(xD, 112, xD, AXY - 6, { stroke: C.red, sw: 2, dash: '7 6' }));
      out.push(S.text(xD, 98, 'deadline', { size: 18, weight: 'bold', fill: C.red, anchor: 'middle' }));
    }
    return out;
  },
});
