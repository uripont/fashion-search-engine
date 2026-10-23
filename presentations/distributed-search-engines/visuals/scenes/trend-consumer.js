/* Section 4, trend 2: the consumer changes. Step 1 shows a person: one query,
 * a short list of links. Step 2 adds an agent: many queries in parallel, full
 * pages back, and a band with what that means for the cluster. Both panels use
 * the same skeleton (title, icon, what goes in, what comes back, badges) and
 * keep identical coordinates in both steps. */
VIS.scene({
  id: 'trend-consumer',
  section: 'trends',
  title: 'Consumers: a person, then an agent',
  layout: 'full',
  steps: ['person', 'agent'],
  render(step, { S, P, C }) {
    const out = [];
    const showAgent = step === 1;
    const PY = 16, PH = 376, PW = 568;
    const LX = 16, RX = 616;
    const badgeY = 344, badgeSize = 16;

    const panel = (x, title) => {
      out.push(S.rect(x, PY, PW, PH, { rx: 14, fill: C.bg, stroke: C.line, sw: 1.5 }));
      out.push(S.text(x + 24, 52, title, { size: 22, weight: 'bold', fill: C.text2 }));
    };
    const badges = (x, labels) => {
      let bx = x;
      labels.forEach((lbl) => {
        out.push(P.badge(bx, badgeY, lbl, { color: 'grey', size: badgeSize }));
        bx += S.tw(lbl, badgeSize) + badgeSize * 1.4 + 12;
      });
    };

    // A full page: title bar and many text lines.
    const page = (x, y, w, h, seed) => {
      const f = 14;
      out.push(S.path(`M${x},${y} H${x + w - f} L${x + w},${y + f} V${y + h} H${x} Z`,
        { fill: C.bg, stroke: C.faint, sw: 1.5 }));
      out.push(S.path(`M${x + w - f},${y} V${y + f} H${x + w}`, { stroke: C.faint, sw: 1.5 }));
      out.push(S.line(x + 12, y + 22, x + w - 22, y + 22, { stroke: C.link, sw: 5 }));
      for (let i = 0; i < 13; i++) {
        const ly = y + 42 + i * 14;
        if (ly > y + h - 12) break;
        const len = w - 24 - (((i * 37) + seed * 53) % 5) * 8;
        out.push(S.line(x + 12, ly, x + 12 + Math.max(30, len), ly, { stroke: C.line, sw: 4 }));
      }
    };

    // ---- Left panel: a person (same in both steps) ----------------------------
    panel(LX, 'A person');
    out.push(P.user(LX + 56, 117, 90, C.muted));
    out.push(S.arrow(112, 120, 138, 120, { color: C.muted, sw: 2 }));
    out.push(P.searchBox(146, 96, 418, { text: 'lamine yamal', h: 48, size: 20, cursor: true, focus: true }));
    // A short ranked list of links with snippets, as on a results page.
    const results = ['Lamine Yamal: profile', 'Match report: last night', 'Yamal stats this season'];
    results.forEach((t, i) => {
      const y = 184 + i * 55;
      out.push(S.circle(156, y - 7, 8, { fill: C.bgGrey, stroke: C.line, sw: 1 }));
      out.push(S.text(174, y, t, { size: 20, fill: C.link }));
      out.push(S.rect(174, y + 11, 372, 8, { rx: 4, fill: C.line }));
      out.push(S.rect(174, y + 24, 250, 8, { rx: 4, fill: C.line }));
    });
    badges(146, ['one query', '10 links', '≈ 0.1 s']);

    if (showAgent) {
      // ---- Right panel: an agent -------------------------------------------
      panel(RX, 'An agent');
      out.push(S.text(RX + PW - 24, 52, 'e.g. Exa, built for agents', { size: 17, italic: true, fill: C.muted, anchor: 'end' }));
      out.push(P.agent(RX + 56, 117, 90, C.blue));

      // Fan: one spine from the agent to eight parallel queries.
      const spineX = 726, chipX = 748, chipW = 176, chipH = 24, pitch = 29;
      const queries = ['yamal stats', 'yamal injury', 'match report', 'player ratings',
        'barça lineup', 'yamal goals', 'yamal age', 'match highlights'];
      const tops = queries.map((_, i) => 96 + i * pitch);
      const mids = tops.map((t) => t + chipH / 2);
      out.push(S.line(708, 117, spineX, 117, { stroke: C.muted, sw: 2 }));
      out.push(S.line(spineX, mids[0], spineX, mids[mids.length - 1], { stroke: C.muted, sw: 2 }));
      queries.forEach((q, i) => {
        out.push(S.line(spineX, mids[i], chipX, mids[i], { stroke: C.muted, sw: 1.5 }));
        out.push(P.chip(chipX, tops[i], q, { w: chipW, h: chipH, size: 17, fill: C.bgGrey, color: C.text2 }));
      });

      // Full pages come back instead of snippets.
      const pageTop = 96, pageH = tops[tops.length - 1] + chipH - pageTop;
      const midY = pageTop + pageH / 2;
      out.push(S.arrow(chipX + chipW + 10, midY, 966, midY, { color: C.muted, sw: 2 }));
      page(976, pageTop, 88, pageH, 1);
      page(1076, pageTop, 88, pageH, 2);

      badges(chipX, ['many queries in parallel']);
      badges(976, ['full page content']);

      // ---- What this means for the cluster (full width, under both panels) --
      const bandY = 410, bandH = 70, cy = bandY + bandH / 2;
      out.push(S.rect(16, bandY, 1168, bandH, { rx: 14, fill: C.bgSoft }));
      out.push(S.text(40, cy, 'For the cluster', { size: 20, weight: 'bold', fill: C.text, vc: true }));
      out.push(P.queue(214, cy - 5, 4, { max: 5, s: 10, gap: 4, color: 'grey' }));
      out.push(S.text(290, cy, 'more queries per second → more replicas', { size: 20, fill: C.text2, vc: true }));
      out.push(P.doc(722, cy - 14, { w: 22, h: 28, color: 'grey' }));
      out.push(S.text(758, cy, 'heavier phase two: full pages, not snippets', { size: 20, fill: C.text2, vc: true }));
    }
    return out;
  },
});
