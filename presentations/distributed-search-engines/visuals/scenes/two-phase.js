/* Principles: what travels back from the shards. Generic. Illustrative numbers:
 * 100 shards x top 10 hits. One phase: 2 KB snippet per hit, about 2 MB per
 * query. Two phases: 12 B per hit (id, score) = 12 KB, then 2 KB snippets for
 * the 10 winners only = 20 KB. The bars share one linear scale (480 units = 2 MB).
 * Left: shards 1, 2, 3 ... 100 send back to the broker on parallel lanes.
 *   Step 1: every lane carries full results (document icons).
 *   Step 2: solid lanes carry a tiny "id, score" (phase 1); dashed blue lanes
 *   carry snippets, only from the shards that hold winners (phase 2). */
VIS.scene({
  id: 'two-phase',
  section: 'principles',
  title: 'One phase or two',
  layout: 'full',
  steps: ['one-phase', 'two-phase'],
  render(step, { S, P, C, T }) {
    const sh = T.shard;
    const two = step === 1;
    const out = [];

    // ---- Geometry shared by both steps ------------------------------------
    const shards = [
      { name: 'Shard 1', col: 0, y: 166 },
      { name: 'Shard 2', col: 1, y: 246 },
      { name: 'Shard 3', col: 2, y: 326 },
      { name: 'Shard 100', col: 3, y: 426 }, // (100 - 1) % 4 = green
    ];
    const winners = [0, 2];             // shards that hold some of the 10 winners
    const solidDY = -16, dashDY = 16;   // phase 1 / full-result lane, phase 2 lane
    const SX = 400;                     // shard machines, left edge
    const LX = 180;                     // arrows end at the broker panel
    const midX = 290;                   // centre of what rides on a lane
    const p2 = C.blue;                  // phase 2 colour

    out.push(P.stepper(16, 26, ['Which replica?', 'What travels back?', 'Which shards?'], 1, { size: 17 }));
    out.push(P.illustrative(1184, 14, { anchor: 'end' }));

    // ---- Legend: names the line styles, right above the lanes --------------
    // Bold name and plain text are two <text> runs placed by width, because
    // rsvg drops the space at the edge of a tspan (even a no-break space).
    // Digits render wider than S.tw estimates (tabular figures), so both
    // "Phase n:" rows share one text column, measured on the wider estimate.
    const phaseX = 96 + S.tw('Phase 2:', 18, true) + 8;
    const legend = (y, dashed, color, name, rest) => {
      const nameFill = dashed ? color : C.text2;
      const restX = /\d/.test(name) ? phaseX : 96 + S.tw(name, 18, true) + 6;
      return [
        S.arrow(84, y, 40, y, { color, sw: 2, dash: dashed ? '6 5' : null }),
        S.text(96, y, name, { size: 18, weight: 'bold', fill: nameFill, vc: true }),
        S.text(restX, y, rest, { size: 18, fill: C.text2, vc: true }),
      ];
    };
    if (!two) {
      out.push(legend(78, false, C.muted, 'One phase:', 'every shard sends its top 10 with snippets'));
    } else {
      out.push(legend(78, false, C.muted, 'Phase 1:', 'every shard sends only id and score'));
      out.push(legend(106, true, p2, 'Phase 2:', 'snippets, only from shards with winners'));
    }

    // ---- Broker (left) and shards (right of the lanes) ----------------------
    out.push(S.rect(40, 130, 136, 324, { rx: 14, fill: C.bgSoft, stroke: C.line, sw: 1.5 }));
    out.push(P.machine(53, 246, { w: 110, h: 84, color: 'grey', sub: 'Broker', subSize: 20 }));
    shards.forEach((s) => {
      out.push(P.machine(SX, s.y - 25, { w: 64, h: 50, color: s.col }));
      out.push(S.text(SX + 76, s.y + 7, s.name, { size: 19, weight: 'bold', fill: sh[s.col].ink }));
    });
    // "...": the shards between 3 and 100.
    [364, 376, 388].forEach((y) => out.push(S.circle(SX + 32, y, 3, { fill: C.faint })));

    // ---- Lanes ----------------------------------------------------------------
    shards.forEach((s, i) => {
      const y = s.y + solidDY;
      out.push(S.arrow(SX - 4, y, LX, y, { color: C.muted, sw: 2 }));
      if (!two) {
        // Full results: a stack of documents (titles, URLs, snippets).
        for (let k = 0; k < 3; k++) out.push(P.doc(midX - 37 + k * 26, y - 14, { w: 22, h: 28, color: s.col }));
      } else {
        const label = 'id, score';
        const w = P.chipWidth(label, { size: 16 });
        out.push(P.chip(midX - w / 2, y - 12, label, {
          h: 24, size: 16, fill: sh[s.col].soft, stroke: sh[s.col].main, color: sh[s.col].ink,
        }));
      }
      if (two && winners.includes(i)) {
        const yd = s.y + dashDY;
        out.push(S.arrow(SX - 4, yd, LX, yd, { color: p2, sw: 2, dash: '6 5' }));
        for (let k = 0; k < 2; k++) out.push(P.doc(midX - 23 + k * 26, yd - 12, { w: 20, h: 25, color: s.col }));
      }
    });

    // ---- Right: both answers on one linear scale. 480 units = 2 MB ----------
    const bx = 660, barW = 480, unit = barW / 2048; // units per KB
    const barH = 40;
    out.push(S.text(bx, 150, 'Bytes back to the broker, per query', { size: 19, weight: 'bold', fill: C.text2 }));

    // Bar A: one phase.
    out.push(S.text(bx, 196, 'One phase', { size: 21, weight: 'bold', fill: C.red }));
    out.push(S.rect(bx, 208, barW, barH, { rx: 4, fill: C.red }));
    out.push(S.text(bx + barW - 14, 208 + barH / 2, '2 MB', { size: 24, weight: 'bold', fill: '#FFFFFF', anchor: 'end', vc: true }));
    out.push(S.text(bx, 274, '100 shards × 10 hits × 2 KB', { size: 17, fill: C.text2 }));
    out.push(S.text(bx + barW, 274, '99% thrown away', { size: 17, italic: true, fill: C.text2, anchor: 'end' }));

    // Bar B: two phases, 12 KB + 20 KB = 32 KB, a sliver on the same scale.
    if (two) {
      const wB = 32 * unit;
      out.push(S.text(bx, 330, 'Two phases', { size: 21, weight: 'bold', fill: p2 }));
      out.push(S.rect(bx, 342, wB, barH, { fill: p2 }));
      out.push(S.text(bx + wB + 12, 342 + barH / 2, '32 KB', { size: 24, weight: 'bold', fill: p2, vc: true }));
      out.push(S.text(bx, 408, '12 KB (phase 1) + 20 KB (phase 2)', { size: 17, fill: C.text2 }));
    }

    // Shared axis under both bars.
    const ax = 432;
    out.push(S.line(bx, ax, bx + barW, ax, { stroke: C.faint, sw: 1.5 }));
    [[0, '0'], [1024, '1 MB'], [2048, '2 MB']].forEach(([kb, label]) => {
      const x = bx + kb * unit;
      out.push(S.line(x, ax, x, ax + 6, { stroke: C.faint, sw: 1.5 }));
      out.push(S.text(x, ax + 26, label, { size: 16, fill: C.muted, anchor: 'middle' }));
    });

    if (two) {
      out.push(P.source(16, 488, 'Two phases as in Barroso, Dean & Hölzle (2003): index servers return document IDs, ' +
        'then document servers build titles and snippets', { size: 16 }));
    }

    return out;
  },
});
