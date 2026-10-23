/* Section 4: the same scatter-gather picture, now for vector search. Drawn in
 * the vocabulary of the scatter-gather figure: the Broker on the left, the
 * shards side by side, the query scattered in grey on a bus over the top, each
 * shard's local top-k coming back underneath in that shard's colour, one arrow
 * per shard into the Broker, which merges them (merged list under it). Each
 * shard is a slice of the documents (the same term "data" in every shard, with
 * that shard's own doc IDs, as in partition) and holds them as postings or as
 * embeddings. The script's words map onto the picture: "Shard n", "3 replicas",
 * "scatter", "merge".
 * Build: 1) the picture and its message (right column, top), 2) + what
 * changes (right column, below). Nothing moves between the steps. */
VIS.scene({
  id: 'trend-same',
  section: 'trends',
  title: 'Same pattern for postings and embeddings',
  layout: 'full',
  steps: ['same', 'changes'],
  render(step, { S, P, C, T }) {
    const sh = T.shard;
    const out = [];

    // ---- Geometry ----
    const colTop = 88, colH = 276, colW = 200, colGap = 14;
    const colX = [0, 1, 2].map((i) => 196 + i * (colW + colGap));
    const colC = colX.map((x) => x + colW / 2);
    const colBot = colTop + colH;
    const busTop = 52;                                  // scatter bus
    const BX = 16, BY = 170, BW = 96, BH = 100;         // Broker
    const BCX = BX + BW / 2;
    // Return paths, nested so they never cross: Shard 1 on the inner lane,
    // the rightmost trunk and the highest entry into the Broker.
    const lane = [388, 402, 416];
    const trunk = [176, 162, 148];
    const entry = [BY + 30, BY + 50, BY + 70];

    // ---- Broker ----
    out.push(P.machine(BX, BY, { w: BW, h: BH, color: 'grey', sub: 'Broker', subSize: 20 }));

    // ---- Scatter: the same query from the Broker to every shard, over the top ----
    colC.forEach((cx) => {
      out.push(S.elbow([[BCX, BY - 2], [BCX, busTop], [cx, busTop], [cx, colTop - 4]], { color: C.text2, sw: 2.2 }));
    });
    out.push(S.text(BCX + 16, busTop - 12, 'scatter', { size: 19, weight: 'bold', fill: C.text }));

    // ---- Return: each shard's local top-k back into the Broker ----
    colC.forEach((cx, i) => {
      out.push(S.elbow([[cx, colBot + 2], [cx, lane[i]], [trunk[i], lane[i]], [trunk[i], entry[i]], [BX + BW + 4, entry[i]]],
        { color: sh[i].main, sw: 2.2, r: 8 }));
    });
    out.push(S.text(colX[0], lane[2] + 28, 'local top-k from each shard', { size: 17, fill: C.muted }));

    // ---- Merge: the Broker's merged list, under it ----
    out.push(S.text(BX, 326, 'merge', { size: 19, weight: 'bold', fill: C.text }));
    out.push(P.rankList(BX, 338, [
      { label: 'doc 7', color: 2 }, { label: 'doc 3', color: 0 }, { label: 'doc 4', color: 1 },
    ], { w: BW, rh: 30, size: 17 }));

    // ---- Three shards: replicas, postings, embeddings ----
    const shards = [
      { ids: ['1', '3'], cloud: [[-60, -12], [-28, 10], [-4, -14], [22, 8], [50, -8], [68, 14]] },
      { ids: ['4', '6'], cloud: [[-64, 6], [-40, -14], [-12, 12], [12, -6], [40, 14], [64, -12]] },
      { ids: ['7', '9'], cloud: [[-62, -4], [-34, 14], [-10, -12], [18, 12], [44, -14], [66, 6]] },
    ];
    shards.forEach((r, i) => {
      const x0 = colX[i], col = sh[i];
      out.push(S.rect(x0, colTop, colW, colH, { rx: 14, fill: col.soft }));

      // Replicas: two faded copies behind the front machine (as in scatter-gather).
      const mx = x0 + 16, my = colTop + 14;
      out.push(P.machine(mx + 14, my + 14, { w: 52, h: 60, color: i, opacity: 0.35 }));
      out.push(P.machine(mx + 7, my + 7, { w: 52, h: 60, color: i, opacity: 0.35 }));
      out.push(P.machine(mx, my, { w: 52, h: 60, color: i }));
      out.push(S.text(x0 + 96, colTop + 38, `Shard ${i + 1}`, { size: 20, weight: 'bold', fill: col.ink }));
      out.push(S.text(x0 + 96, colTop + 64, '3 replicas', { size: 17, fill: C.muted }));

      // Postings: the same term in every shard, with this shard's own documents.
      const py = colTop + 124;
      out.push(S.text(x0 + 16, py - 10, 'postings', { size: 17, fill: C.muted }));
      out.push(S.line(x0 + 76, py + 15, x0 + 160, py + 15, { stroke: col.main, sw: 1.5 }));
      out.push(P.chip(x0 + 16, py, 'data', { w: 60, h: 30, size: 17, bold: true, fill: C.bg, stroke: col.main, color: col.ink }));
      r.ids.forEach((d, k) => {
        out.push(P.chip(x0 + 92 + k * 48, py, d, { w: 34, h: 30, size: 17, fill: C.bg, stroke: col.main, color: col.ink }));
      });

      // Embeddings: the same documents as points in a vector space.
      const ey = colTop + 190, eh = 66;
      out.push(S.text(x0 + 16, ey - 10, 'embeddings', { size: 17, fill: C.muted }));
      out.push(S.rect(x0 + 16, ey, colW - 32, eh, { rx: 10, fill: C.bg, stroke: col.mid, sw: 1 }));
      r.cloud.forEach(([dx, dy]) => out.push(S.circle(x0 + colW / 2 + dx, ey + eh / 2 + dy, 5.5, { fill: col.main })));
    });

    // ---- Right column: what stays (step 1), what changes (step 2) ----
    const divX = colX[2] + colW + 22;                    // 846
    const nx = divX + 20, tx = nx + 34;                  // badge column, text column
    out.push(S.line(divX, colTop, divX, colBot + 74, { stroke: C.lineSoft, sw: 1.5 }));  // down to the last note line

    // The message of step 1: same badge-and-text shape as the notes below.
    out.push(P.checkBadge(nx + 12, colTop + 8, 12));
    out.push(S.text(tx, colTop + 14, 'postings lists or embeddings:', { size: 19, fill: C.text2 }));
    out.push(S.text(tx, colTop + 44, 'the same pattern', { size: 24, weight: 'bold', fill: C.text }));

    if (step >= 1) {
      out.push(S.line(nx, colTop + 76, 1184, colTop + 76, { stroke: C.lineSoft, sw: 1.5 }));
      out.push(S.text(nx, colTop + 112, 'What changes', { size: 22, weight: 'bold', fill: C.text }));
      // Lines broken by hand so no phrase is split and both notes have the
      // same shape (two-line title, then the body).
      const note = (y, tl, bl) => {
        out.push(P.warnBadge(nx + 12, y + 14, 11));
        out.push(S.text(tx, y + 20, tl, { size: 19, weight: 'bold', fill: C.text, lh: 24 }));
        const by = y + 20 + (tl.length - 1) * 24 + 26;
        out.push(S.text(tx, by, bl, { size: 17, fill: C.text2, lh: 22 }));
        return by + (bl.length - 1) * 22;              // last baseline
      };
      const end1 = note(colTop + 134, ['Which shard gets', 'each vector?'],
        ['at random (ask all),', 'or by cluster (ask a few,', 'like selective search)']);
      note(end1 + 30, ['Fusing keyword', 'and vector scores'], ['normalise, or fuse by rank']);
    }

    // ---- Sources ----
    out.push(S.text(1184, 486, 'arXiv 2507.06653, Elastic Search Labs', { size: 16, fill: C.faint, anchor: 'end' }));
    return out;
  },
});
