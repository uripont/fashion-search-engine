/* Principles: replicas do two jobs, availability and throughput. Generic
 * (no football, no named players). One shard, three identical replicas.
 * The front-end node is the "Broker", the same name as in every other figure.
 * Step 1: the copies. Step 2: one replica dies, the broker reroutes.
 * Step 3: the queries are spread over the three replicas. */
VIS.scene({
  id: 'replication',
  section: 'principles',
  title: 'Replication: two jobs',
  layout: 'full',
  steps: ['copies', 'availability', 'throughput'],
  render(step, { S, P, C, T }) {
    const blue = T.shard[0];
    const out = [];
    const copies = step === 0;
    const down = step === 1;
    const scaled = step === 2;

    // ---- Geometry shared by all steps ----
    const RX = 410, RW = 140, RH = 88;          // replica machines
    const tops = [88, 218, 348];
    const centres = tops.map((y) => y + RH / 2); // 132, 262, 392
    const midY = centres[1];
    const rtX = 200, rtW = 96, rtH = 110;        // broker
    const rtY = midY - rtH / 2;
    const rtR = rtX + rtW;                       // broker right edge
    const labelX = RX + RW + 24;                 // replica labels and queues

    // ---- Incoming queries and the broker ----
    const qy = [midY - 100, midY, midY + 100];
    qy.forEach((y, i) => {
      out.push(P.chip(40, y - 17, 'query', { w: 96, h: 34, size: 18 }));
      out.push(S.arrow(140, y, rtX - 4, midY + (i - 1) * 14, { color: C.faint, sw: 2 }));
    });
    out.push(P.machine(rtX, rtY, { w: rtW, h: rtH, color: 'grey', sub: 'Broker', subSize: 20 }));

    // ---- Shard 1: three identical replicas in a column ----
    out.push(S.rect(360, 24, 400, 452, { rx: 14, fill: blue.soft }));
    out.push(S.text(384, 60, 'Shard 1: three identical copies', { size: 20, weight: 'bold', fill: blue.ink }));

    tops.forEach((y, i) => {
      const state = down && i === 1 ? 'down' : down && i === 2 ? 'active' : 'normal';
      out.push(P.machine(RX, y, { w: RW, h: RH, color: 0, state }));
      // The same small index block in every replica.
      for (let k = 0; k < 3; k++) {
        out.push(S.rect(RX + 18 + k * 24, y + 56, 19, 12, { rx: 2, fill: state === 'down' ? '#F6AEA9' : blue.mid }));
      }
      out.push(S.text(labelX, centres[i] - 4, `replica ${i + 1}`, {
        size: 20, weight: 'bold', fill: state === 'down' ? C.red : C.text2,
      }));
      if (scaled) out.push(P.queue(labelX, centres[i] + 8, 3, { max: 5, s: 16, gap: 4, color: 0 }));
    });

    // Step 1: dotted copy arrows down the column.
    if (copies) {
      const ax = RX + RW / 2;
      for (let i = 0; i < 2; i++) {
        out.push(S.arrow(ax, tops[i] + RH + 5, ax, tops[i + 1] - 5, { color: C.muted, sw: 2, dash: '3 4', size: 10 }));
        out.push(S.text(ax + 14, (tops[i] + RH + tops[i + 1]) / 2 + 6, 'copy', { size: 17, fill: C.muted }));
      }
    }

    // Step 2: replica 2 is down, the broker sends the query to replica 3.
    if (down) {
      out.push(S.arrow(rtR + 4, midY, RX - 8, midY, { color: C.red, sw: 2.2, dash: '6 5' }));
      out.push(S.arrow(rtR + 4, midY + 14, RX - 10, centres[2] - 10, { color: blue.main, sw: 3 }));
    }

    // Step 3: nine queries, three per replica, equal load on each.
    if (scaled) {
      centres.forEach((cy) => {
        out.push(S.arrow(rtR + 4, midY, RX - 8, cy, { color: C.faint, sw: 2 }));
        [0.22, 0.47, 0.72].forEach((t) => {
          const x = rtR + 4 + (RX - 8 - rtR - 4) * t;
          out.push(S.circle(x, midY + (cy - midY) * t, 6, { fill: blue.main }));
        });
      });
    }

    // ---- Right column: the two jobs ----
    // Same look as P.callout, with hand-set line breaks.
    const cx = 832, cw = 340, csz = 19, lh = csz * 1.3;
    const jobs = [
      { title: 'Availability', lines: ['If a replica dies, the broker sends', 'the query to another copy.', 'The user never notices.'] },
      { title: 'Throughput', lines: ['One replica answers only so many', 'queries per second.', '3 replicas ≈ 3× the throughput.'] },
    ];
    const ys = [104, 290];
    const boxH = 18 + csz * 1.35 + 2 * lh + 24;
    jobs.forEach((j, i) => {
      const on = (i === 0 && down) || (i === 1 && scaled);
      const off = (i === 0 && scaled) || (i === 1 && down);
      const y = ys[i];
      const parts = [];
      if (on) parts.push(S.rect(cx - 14, y - 14, cw + 28, boxH + 14, { rx: 12, fill: blue.soft }));
      parts.push(P.numBadge(cx + 13, y + 12, i + 1, { fill: on ? blue.main : C.muted }));
      parts.push(S.text(cx + 34, y + 18, j.title, { size: csz + 1, weight: 'bold', fill: C.text }));
      parts.push(S.text(cx + 34, y + 18 + csz * 1.35, j.lines, { size: csz, fill: C.text2, lh }));
      out.push(S.group(parts, { opacity: off ? 0.35 : null }));
    });
    return out;
  },
});
