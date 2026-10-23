/* Section 1: how fast the machine count grew, 1998 -> 2003 -> 2016 (about
 * 15 s, three clicks). Left: the number, its unit (with a page or a machine
 * icon so pages and machines cannot be confused) and a one-line note. Right:
 * a waffle of squares, one square = 15,000 machines (the whole 2003 fleet).
 * The grid is drawn faintly from the first step; 2003 fills its corner
 * square, 2016 fills all 168. The label under the grid points at the corner.
 * The 1998 figure is pages, not machines, so the right side shows only the
 * prototype, not to scale. Everything that stays keeps its coordinates. */
VIS.scene({
  id: 'growth',
  section: 'problem',
  title: 'Growth: 1998, 2003, 2016',
  layout: 'full',
  steps: ['1998', '2003', '2016'],
  render(step, { S, P, C, T }) {
    const blue = T.shard[0];
    const out = [];

    // ---- Left column: number, unit, note (same place in every step) -------
    const facts = [
      { big: '24 million', unit: 'web pages', icon: 'page', sub: 'indexed by a research prototype' },
      { big: '15,000+', unit: 'commodity PCs', icon: 'machine', sub: 'cheap machines, not big servers' },
      { big: '≈ 2.5 million', unit: 'servers, Gartner estimate (July 2016)', icon: 'machine', sub: 'Google publishes no official server count' },
    ];
    const f = facts[step];
    out.push(S.text(40, 214, f.big, { size: 80, weight: 'bold', fill: C.blue }));
    if (f.icon === 'page') out.push(P.doc(42, 236, { w: 22, h: 28, color: 'grey' }));
    else out.push(P.machine(40, 236, { w: 26, h: 28, color: 'grey' }));
    out.push(S.text(78, 250, f.unit, { size: 28, fill: C.text, vc: true }));
    out.push(S.text(40, 300, f.sub, { size: 20, fill: C.muted }));

    // ---- Right: waffle, 14 x 12 squares, one square = 15,000 machines ------
    // 168 x 15,000 = 2.52 million, the 2016 estimate. Filled from the
    // bottom-left corner, where the 2003 square sits in every step. Before
    // 2016 the empty grid is drawn faintly, so the space it will fill is
    // already there and nothing moves on the last click.
    const COLS = 14, ROWS = 12, CELL = 28, PITCH = 32;
    const GX = 680, GY = 30;
    const GB = GY + (ROWS - 1) * PITCH + CELL;          // grid bottom, 410
    const cell = (col, row, o) =>                       // row 0 = bottom row
      S.rect(GX + col * PITCH, GB - CELL - row * PITCH, CELL, CELL, Object.assign({ rx: 4 }, o));

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!r && !c) continue;                          // the corner square
        out.push(step === 2 ? cell(c, r, { fill: blue.mid }) : cell(c, r, { stroke: C.lineSoft, sw: 1.5 }));
      }
    }
    // The corner: the prototype (1998, smaller than one square on purpose),
    // then the 2003 fleet, which stays dark blue in 2016.
    if (step === 0) out.push(P.machine(GX + 3, GB - 27, { w: 22, h: 26, color: 'grey' }));
    else out.push(cell(0, 0, { fill: blue.main }));

    // Label under the grid, tied to the corner square by a short leader, so
    // the square itself is the legend (no second swatch).
    const LY = 440, lx = GX + CELL / 2;
    out.push(S.path(`M${lx},${GB + 6} V${LY - 6} Q${lx},${LY} ${lx + 6},${LY} H${lx + 14}`, { stroke: C.faint, sw: 1.6 }));
    const tx = lx + 22;
    if (step === 0) out.push(S.text(tx, LY, 'the prototype', { size: 19, fill: C.muted, vc: true }));
    else {
      // Edge spaces live in plain strings: rsvg trims whitespace (even NBSP)
      // at the start and end of every <tspan>.
      out.push(S.text(tx, LY, [[
        'one square = ',
        { t: '15,000 machines', weight: 'bold' },
        ' (Google in 2003)',
      ]], { size: 19, fill: C.text2, vc: true }));
    }

    // ---- Timeline (x 60-440 = 1998-2016, proportional to years) ----------
    const yearX = (y) => 60 + ((y - 1998) * 380) / 18;
    const years = [1998, 2003, 2016];
    out.push(S.line(60, 440, 440, 440, { stroke: C.line, sw: 2 }));
    years.forEach((y, i) => {
      const x = yearX(y);
      const active = i === step;
      const past = i < step;
      if (active) out.push(S.circle(x, 440, 9, { fill: C.blue }));
      else if (past) out.push(S.circle(x, 440, 9, { fill: C.faint }));
      else out.push(S.circle(x, 440, 9, { fill: '#FFFFFF', stroke: C.faint, sw: 2 }));
      out.push(S.text(x, 472, String(y), {
        size: 18, anchor: 'middle', weight: active ? 'bold' : null,
        fill: active ? C.blue : past ? C.muted : C.faint,
      }));
    });

    // ---- Source of the numbers on screen, bottom right --------------------
    const src = [
      'Brin & Page (1998)',
      'Barroso, Dean & Hölzle (2003)',
      // Starts right of the '2016' timeline label (x 420-460), so the two do not touch.
      'Brin & Page (1998), Barroso, Dean & Hölzle (2003), Gartner (2016) as cited in IRWA theory session 5',
    ];
    out.push(P.source(1184, 488, src[step], { size: 16, anchor: 'end' }));
    return out;
  },
});
