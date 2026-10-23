/* Section 1: vertical vs horizontal scaling, on ONE cost-vs-capacity chart so
 * the two shapes can be compared directly. Step 1: the vertical way (a bigger
 * machine): cost bends upwards and stops at a vertical wall, the biggest
 * machine you can buy. Step 2 adds the horizontal way (more identical
 * machines): a straight line that starts at the same point (one ordinary
 * machine costs the same either way) and goes straight past the wall.
 * Everything from step 1 keeps its coordinates. Qualitative, no numbers. */
VIS.scene({
  id: 'scaling',
  section: 'problem',
  title: 'Vertical vs horizontal scaling',
  layout: 'full',
  steps: ['vertical', 'horizontal'],
  render(step, { S, P, C }) {
    const out = [];
    const VCOL = C.text2;   // vertical: dark grey
    const HCOL = C.blue;    // horizontal: blue (the way we take)

    // ---- Chart geometry (right two thirds) ----------------------------------
    const O0 = 560, OY = 432, W = 600, H = 356; // origin, plot width and height
    const X = (t) => O0 + W * t;                 // t: capacity, 0..1
    const Y = (f) => OY - H * f;                 // f: cost, 0..1
    const SLOPE = 0.56;                          // straight line: f = SLOPE * t
    const WALL = 0.56;                           // the biggest machine, as capacity
    const BEND = (0.86 - SLOPE * WALL) / (WALL * WALL);
    const fv = (t) => SLOPE * t + BEND * t * t;  // vertical: same start, bends up

    // Section label with a short line in the colour of its curve.
    const heading = (x, y, label, col) => [
      S.line(x, y - 7, x + 26, y - 7, { stroke: col, sw: 4 }),
      S.text(x + 38, y, label, { size: 22, weight: 'bold', fill: C.text }),
    ];

    // ---- LEFT, top: vertical, ever bigger machines ---------------------------
    const LX = 40;
    out.push(heading(LX, 62, 'Vertical: a bigger machine', VCOL));
    const VB = 206; // shared bottom of the three machines
    out.push(P.machine(LX + 8, VB - 36, { w: 34, h: 36, color: 'grey' }));
    out.push(S.arrow(LX + 52, VB - 18, LX + 84, VB - 18, { color: C.faint, sw: 2, size: 9 }));
    out.push(P.machine(LX + 96, VB - 64, { w: 56, h: 64, color: 'grey' }));
    out.push(S.arrow(LX + 162, VB - 32, LX + 194, VB - 32, { color: C.faint, sw: 2, size: 9 }));
    out.push(P.machine(LX + 206, VB - 108, { w: 92, h: 108, color: 'grey' }));

    // ---- Chart axes ------------------------------------------------------------
    out.push(S.arrow(O0, OY, O0 + W + 14, OY, { color: C.muted, sw: 1.5, size: 9 }));
    out.push(S.arrow(O0, OY, O0, Y(1) - 18, { color: C.muted, sw: 1.5, size: 9 }));
    out.push(S.text(O0 + W + 14, OY + 32, 'capacity', { size: 18, fill: C.muted, anchor: 'end' }));
    out.push(S.text(O0 - 12, Y(1) - 6, 'cost', { size: 18, fill: C.muted, anchor: 'end' }));

    // The wall: no single machine has more capacity than this.
    const wx = X(WALL);
    out.push(S.line(wx, OY, wx, Y(1) + 6, { stroke: C.red, sw: 2.5, dash: '8 6', cap: 'butt' }));
    out.push(S.text(wx, Y(1) - 10, 'biggest machine you can buy', { size: 18, fill: C.red, anchor: 'middle' }));

    // Vertical curve: from the origin up to the wall, where it stops.
    const pts = [];
    for (let i = 0; i <= 60; i++) { const t = (WALL * i) / 60; pts.push([X(t), Y(fv(t))]); }
    out.push(S.path('M' + pts.map((p, i) => (i ? 'L' : '') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '),
      { stroke: VCOL, sw: 3.5 }));
    out.push(P.xBadge(wx, Y(fv(WALL)), 13));
    out.push(S.text(wx - 26, Y(fv(WALL)) + 6, 'vertical', { size: 18, weight: 'bold', fill: VCOL, anchor: 'end' }));

    if (step >= 1) {
      // ---- LEFT, bottom: horizontal, more of the same machine -----------------
      out.push(heading(LX, 290, 'Horizontal: more machines', HCOL));
      const HB = 460; // shared bottom row
      const m = (x, y) => P.machine(x, y, { w: 34, h: 36, color: 'grey' });
      out.push(m(LX + 8, HB - 36));
      out.push(S.arrow(LX + 52, HB - 18, LX + 84, HB - 18, { color: C.faint, sw: 2, size: 9 }));
      [0, 1, 2].forEach((c) => out.push(m(LX + 96 + c * 44, HB - 36)));
      out.push(S.arrow(LX + 236, HB - 18, LX + 268, HB - 18, { color: C.faint, sw: 2, size: 9 }));
      [0, 1, 2].forEach((r) => [0, 1, 2].forEach((c) => out.push(m(LX + 280 + c * 44, HB - 36 - r * 46))));

      // Straight line: each extra machine adds the same capacity for the same
      // cost, and it goes straight past the wall.
      out.push(S.arrow(O0, OY, X(1), Y(SLOPE), { color: HCOL, sw: 3.5, size: 15 }));
      out.push(S.text(X(1), Y(SLOPE) - 22, 'horizontal', { size: 18, weight: 'bold', fill: HCOL, anchor: 'end' }));
    }

    return out;
  },
});
