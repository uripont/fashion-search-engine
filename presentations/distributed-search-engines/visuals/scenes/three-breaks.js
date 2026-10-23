/* Section 1: why one machine does not work. Three panels, progressive: step 1
 * shows capacity, step 2 adds speed, step 3 adds availability. Panels still to
 * come are dashed outlines with a faint title (as in `two-tools`), so the
 * audience sees "three things" from the start. Every panel draws the same
 * machine at the same place; what breaks it is drawn to its right, and its
 * status icon follows the deck convention (x = failed, clock = slow). Earlier
 * panels keep their coordinates. No invented numbers beyond the "0.1 s"
 * budget from the opening slide. */
VIS.scene({
  id: 'three-breaks',
  section: 'problem',
  title: 'Three things break at once',
  layout: 'full',
  steps: ['capacity', 'speed', 'availability'],
  render(step, { S, P, C, T }) {
    const out = [];
    const PY = 30, PW = 372, PH = 440;
    const xs = [16, 414, 812];
    const MY = 146, MW = 90, MH = 100;    // the one machine, same in every panel
    const mx = (px) => px + 36;

    // Panel 1: the index is far bigger than one machine. The dashed box is
    // what one machine holds; the rest of the index spills out of it.
    const capacity = (px) => {
      const g = [];
      const bx = px + 20, by = 112, bw = 332, bh = 143; // bottom edge falls between bars 4 and 5
      g.push(S.rect(bx, by, bw, bh, { rx: 12, stroke: C.muted, sw: 1.5, dash: '6 5' }));
      g.push(S.text(bx + 16, by + 22, 'one machine', { size: 17, fill: C.muted }));
      g.push(P.machine(mx(px), MY, { w: MW, h: MH, color: 'grey' }));
      const widths = [180, 150, 170, 120, 190, 160, 180, 140, 165];
      widths.forEach((w, k) => {
        const y = 150 + k * 28;
        const out_ = y > by + bh;            // outside the machine
        const fade = out_ ? 1 - (y - (by + bh)) / 190 : 1;
        g.push(S.rect(px + 146, y, w, 14, { rx: 4, fill: T.shard[0].mid, opacity: Math.max(0.25, fade) }));
      });
      g.push(P.xBadge(bx + bw, by + bh, 13)); // it does not fit
      return g;
    };

    // Panel 2: one machine has to score millions of candidates per query.
    const speed = (px) => {
      const g = [];
      g.push(P.machine(mx(px), MY, { w: MW, h: MH, color: 'grey', state: 'slow' })); // clock = slow
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 6; c++) {
          g.push(P.doc(px + 150 + c * 34, 116 + r * 34, { w: 20, h: 24, color: 'grey' }));
        }
      }
      // The answer misses the 0.1 s budget. Yellow, like the clock badge:
      // slow, not failed.
      g.push(S.text(px + PW / 2, 338, '> 0.1 s', { size: 34, weight: 'bold', fill: T.shard[2].ink, anchor: 'middle', vc: true }));
      return g;
    };

    // Panel 3: the machine is down, and everyone queues behind it. The queue
    // snakes back under the machine, like a queue at a counter.
    const availability = (px) => {
      const g = [];
      const r1 = MY + MH / 2, r2 = 290;     // the two rows of the queue
      const xL = px + 40, xR = px + 310;    // the U-turn stays inside the panel
      // Rope behind the people.
      g.push(S.path(`M${px + 140},${r1 + 6} H${xR} A${(r2 - r1) / 2},${(r2 - r1) / 2} 0 0 1 ${xR},${r2 + 6} H${xL}`,
        { stroke: C.line, sw: 2.5 }));
      g.push(P.machine(mx(px), MY, { w: MW, h: MH, color: 'grey', state: 'down' }));
      for (let i = 0; i < 5; i++) g.push(P.user(px + 166 + i * 36, r1, 34, C.muted));
      for (let i = 0; i < 8; i++) g.push(P.user(xR - i * 36, r2, 34, C.muted));
      g.push(S.text(px + 166 - 14, r1 - 34, 'waiting', { size: 17, fill: C.muted }));
      return g;
    };

    const panels = [
      { n: 1, title: 'Capacity', caption: 'index bigger than one machine', draw: capacity },
      { n: 2, title: 'Speed', caption: 'millions of candidates per query', draw: speed },
      { n: 3, title: 'Availability', caption: 'one failure stops everyone', draw: availability },
    ];

    panels.forEach((p, i) => {
      const px = xs[i];
      if (i > step) {
        // Still to come: dashed outline, faint number and title.
        out.push(P.card(px, PY, PW, PH, { rx: 14, stroke: C.faint, dash: '6 5' }));
        out.push(P.numBadge(px + 34, PY + 36, p.n, { r: 15, fill: C.line }));
        out.push(S.text(px + 58, PY + 36, p.title, { size: 22, weight: 'bold', fill: C.faint, vc: true }));
        return;
      }
      out.push(P.card(px, PY, PW, PH, { rx: 14 }));
      out.push(P.numBadge(px + 34, PY + 36, p.n, { r: 15 }));
      out.push(S.text(px + 58, PY + 36, p.title, { size: 22, weight: 'bold', fill: C.text, vc: true }));
      out.push(p.draw(px));
      out.push(S.text(px + PW / 2, 428, p.caption, { size: 18, fill: C.text2, anchor: 'middle', vc: true }));
    });

    return out;
  },
});
