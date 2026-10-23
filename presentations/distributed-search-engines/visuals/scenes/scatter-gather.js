/* Principles: scatter-gather. The broker sends the query to every shard, each
 * shard returns a local top-k, the broker merges them with a priority queue.
 * Neutral query text ("a query", not the toy index's "data search") and
 * document ids from a bigger collection (d14 ... d97), so the lists do not
 * contradict the 9-document toy index. Invented scores.
 * Layout: query and broker on the left, shards in a column on the right, the
 * local lists between them. Scatter is a fan out of the broker, gather a fan
 * back into it, and the merged list appears under the broker. */
VIS.scene({
  id: 'scatter-gather',
  section: 'principles',
  title: 'Scatter-gather',
  layout: 'full',
  steps: ['parts', 'scatter', 'gather', 'merge'],
  render(step, { S, P, C, T }) {
    const sh = T.shard;
    const out = [];
    const parts = step === 0;
    const scatter = step === 1;
    const gather = step >= 2;
    const merge = step === 3;

    // ---- Geometry shared by all steps ----
    const BX = 100, BY = 170, BW = 110, BH = 100;   // broker
    const BCX = BX + BW / 2, BCY = BY + BH / 2;     // 155, 220
    const BR = BX + BW;                             // broker right edge
    const SX = 950, SW = 84, SH = 72;               // front replica of each shard
    const SC = [76, 184, 292, 400];                 // shard centre lines
    const LX = 750, LW = 146;                       // local top-k lists
    const capX = 320, capY = 47;                    // caption slot, top row

    // ---- The query comes in and the broker receives it ----
    out.push(P.searchBox(30, 22, 250, { text: 'a query', h: 50, size: 20 }));
    out.push(S.arrow(BCX, 76, BCX, BY - 4, { color: C.muted, sw: 2 }));
    out.push(P.machine(BX, BY, { w: BW, h: BH, color: 'grey', sub: 'Broker', subSize: 20 }));

    // ---- Four shards, each a stack of three replicas ----
    SC.forEach((cy, i) => {
      const y = cy - SH / 2;
      out.push(P.machine(SX + 14, y + 14, { w: SW, h: SH, color: i, opacity: 0.35 }));
      out.push(P.machine(SX + 7, y + 7, { w: SW, h: SH, color: i, opacity: 0.35 }));
      out.push(P.machine(SX, y, { w: SW, h: SH, color: i }));
      out.push(S.text(SX + SW + 28, cy, `Shard ${i + 1}`, { size: 20, weight: 'bold', fill: sh[i].ink, vc: true }));
    });

    // ---- Step 1: what each part does ----
    if (parts) {
      // The broker is linked to every shard; step 2 turns the links into arrows.
      SC.forEach((cy) => out.push(S.line(BR + 4, BCY, SX - 8, cy, { stroke: C.line, sw: 2 })));
      out.push(S.text(BX - 70, 326, ['receives the query,', 'sends it out,', 'merges the answers'], { size: 19, fill: C.text2, lh: 25 }));
      out.push(S.text(SX - 30, 228, ['each shard searches', 'only its own documents'], { size: 19, fill: C.text2, lh: 25, anchor: 'end' }));
    }

    // ---- Step 2: scatter, one arrow from the broker to every shard ----
    if (scatter) {
      SC.forEach((cy) => out.push(S.arrow(BR + 4, BCY, SX - 8, cy, { color: C.text2, sw: 2.2 })));
    }

    // ---- Steps 3-4: gather, each shard's local top-3 goes back to the broker ----
    const lists = [
      [['d14', 2.9], ['d27', 1.7], ['d31', 0.9]],
      [['d42', 2.4], ['d55', 2.2], ['d58', 0.4]],
      [['d63', 3.1], ['d71', 1.1], ['d77', 0.8]],
      [['d86', 2.6], ['d90', 1.9], ['d97', 0.5]],
    ];
    // The five best of the twelve, with the shard each came from.
    const top = [['d63', 3.1, 2], ['d14', 2.9, 0], ['d86', 2.6, 3], ['d42', 2.4, 1], ['d55', 2.2, 1]];
    const inTop = (d) => merge && top.some((t) => t[0] === d);
    if (gather) {
      SC.forEach((cy, i) => {
        const p = sh[i];
        out.push(P.rankList(LX, cy - 42, lists[i].map(([d, s]) => ({ label: d, score: s, color: i, hl: inTop(d) })),
          { w: LW, rh: 30, size: 17 }));
        out.push(S.arrow(SX - 6, cy, LX + LW + 6, cy, { color: p.main, sw: 2 }));
        out.push(S.arrow(LX - 6, cy, BR + 6, BCY - 27 + i * 18, { color: p.main, sw: 2.2 }));
      });
    }

    // ---- Step 4: merge, the broker keeps the global top-k ----
    if (merge) {
      out.push(S.text(BX - 70, 324, 'Global top-k', { size: 19, weight: 'bold', fill: C.text2 }));
      out.push(P.rankList(BX - 70, 336, top.map(([d, s, c]) => ({ label: d, score: s, color: c })),
        { w: 250, rh: 28, size: 17 }));
    }

    // ---- Caption: what is happening in this step ----
    const cap = [null,
      ['Scatter: ', 'the same query to every shard'],
      ['Gather: ', 'each shard returns its local top-k'],
      ['Merge: ', 'a priority queue keeps the global top-k']][step];
    if (cap) {
      // Bold word and the rest as two text elements (rsvg drops a space at the end of a <tspan>).
      const w0 = S.tw(cap[0], 19, true);
      out.push(S.text(capX, capY, cap[0], { size: 19, weight: 'bold', fill: C.text, vc: true }));
      out.push(S.text(capX + w0, capY, cap[1], { size: 19, fill: C.text2, vc: true }));
    }
    if (gather) out.push(P.illustrative(1184, 466, { anchor: 'end' }));

    return out;
  },
});
