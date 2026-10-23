/* Section 1: unreliable machines need two tools. Step 1 is the fleet: many
 * grey machines, some down or slow, that must answer as one search engine
 * ("how?"). Steps 2-3 are two panels side by side: sharding (split the data:
 * Shard 1, 2, 3 on three machines) and replication (copy one piece: Shard 1
 * on three machines, one of them dead). The left panel keeps identical
 * coordinates in both steps, the right panel appears in step 3. Machines use
 * the shard colours, as in the later replication figure. */
VIS.scene({
  id: 'two-tools',
  section: 'problem',
  title: 'Two tools: sharding and replication',
  layout: 'full',
  steps: ['fleet', 'sharding', 'replication'],
  render(step, { S, P, C, T }) {
    const sh = T.shard;
    const out = [];
    const BOTTOM = 466; // baseline of the bottom caption(s)

    if (step === 0) {
      // ---- Fleet: cheap machines, some failing or slow
      out.push(S.text(40, 84, 'Millions of cheap machines', { size: 22, weight: 'bold', fill: C.text }));
      const down = [[0, 3], [2, 7], [4, 1], [5, 5]];
      const slow = [[1, 8], [3, 2], [3, 6], [5, 9]];
      const inList = (list, r, c) => list.some((p) => p[0] === r && p[1] === c);
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 10; c++) {
          const state = inList(down, r, c) ? 'down' : inList(slow, r, c) ? 'slow' : 'normal';
          out.push(P.machine(40 + c * 54, 108 + r * 56, { w: 34, h: 38, color: 'grey', state }));
        }
      }
      out.push(S.text(40, BOTTOM, 'something is always failing or slow', { size: 20, fill: C.text2 }));

      // The open question: how do they answer as one?
      out.push(S.arrow(584, 267, 648, 267, { color: C.blue, sw: 3, size: 16 }));
      out.push(S.text(616, 248, 'how?', { size: 20, weight: 'bold', fill: C.blue, anchor: 'middle' }));

      out.push(S.text(660, 84, 'One search engine', { size: 22, weight: 'bold', fill: C.text }));
      out.push(P.searchBox(660, 108, 500, { h: 56, size: 20, placeholder: 'search the web' }));
      out.push(P.rankList(660, 196, [
        { label: 'page 1', color: 'grey' },
        { label: 'page 2', color: 'grey' },
        { label: 'page 3', color: 'grey' },
      ], { w: 500, rh: 62, size: 19 }));
      out.push(P.checkBadge(674, BOTTOM - 7, 13));
      out.push(S.text(698, BOTTOM, 'one fast, reliable answer', { size: 20, fill: C.text }));
      return out;
    }

    // ---- Two panels. Geometry: the right panel is the left one shifted by 600.
    const W = 520, seg = W / 3;
    const BAR_Y = 84, BAR_H = 38, MACH_Y = 224, MACH_W = 100, MACH_H = 120;
    const PIECE_Y = MACH_Y + 46, LABEL_Y = 380, CAP_Y = 446;
    const holder = (cx, color, piece, o = {}) => [
      P.machine(cx - MACH_W / 2, MACH_Y, { w: MACH_W, h: MACH_H, color, state: o.state }),
      S.rect(cx - 34, PIECE_Y, 68, 38, { rx: 6, fill: piece }),
      S.text(cx, LABEL_Y, o.label, { size: 20, weight: 'bold', fill: o.ink, anchor: 'middle' }),
    ];

    // Left panel: sharding (always shown in steps 2 and 3).
    out.push(P.card(16, 16, 568, 468, { fill: C.bgSoft, stroke: C.line }));
    out.push(S.text(40, 58, 'Sharding: split the data', { size: 22, weight: 'bold', fill: C.text }));
    for (let i = 0; i < 3; i++) out.push(S.rect(40 + i * seg, BAR_Y, seg, BAR_H, { fill: sh[i].main }));
    for (let i = 0; i < 3; i++) {
      const cx = 40 + seg * (i + 0.5);
      out.push(S.arrow(cx, BAR_Y + BAR_H + 8, cx, MACH_Y - 8, { color: C.muted, sw: 2.5 }));
      out.push(holder(cx, i, sh[i].main, { label: `Shard ${i + 1}`, ink: sh[i].ink }));
    }
    out.push(S.text(40 + W / 2, CAP_Y, 'each machine holds a different piece', { size: 20, fill: C.text2, anchor: 'middle' }));

    // Right panel: replication (teaser in step 2, full in step 3).
    if (step === 1) {
      out.push(P.card(616, 16, 568, 468, { fill: '#FFFFFF', stroke: C.faint, dash: '6 5' }));
      out.push(S.text(640, 58, 'Replication: keep copies', { size: 22, weight: 'bold', fill: C.faint }));
      return out;
    }
    out.push(P.card(616, 16, 568, 468, { fill: C.bgSoft, stroke: C.line }));
    out.push(S.text(640, 58, 'Replication: keep copies', { size: 22, weight: 'bold', fill: C.text }));
    // One piece (Shard 1, same width as in the left panel), copied three times.
    const pcx = 640 + W / 2;
    out.push(S.rect(pcx - seg / 2, BAR_Y, seg, BAR_H, { fill: sh[0].main }));
    for (let i = 0; i < 3; i++) {
      const cx = 640 + seg * (i + 0.5);
      const down = i === 1;
      out.push(S.arrow(pcx + (i - 1) * 46, BAR_Y + BAR_H + 8, cx, MACH_Y - 8, { color: C.muted, sw: 2.5 }));
      out.push(holder(cx, 0, down ? sh[0].mid : sh[0].main, { label: 'Shard 1', ink: sh[0].ink, state: down ? 'down' : 'normal' }));
      if (!down) out.push(P.checkBadge(cx + MACH_W / 2 - 2, MACH_Y + 2, 11));
    }
    out.push(S.text(640 + W / 2, CAP_Y, 'a machine can die, a copy answers', { size: 20, fill: C.text2, anchor: 'middle' }));
    return out;
  },
});
