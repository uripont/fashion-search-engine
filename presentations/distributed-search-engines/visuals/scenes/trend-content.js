/* Section 4, trend 1: what is matched changes. Three cards, the same query in
 * each, so only the treatment differs: exact words (postings lists), then
 * language and intent (learned models), then meaning as vectors (nearest
 * neighbours). Every card has the same skeleton: header, search box, arrow with
 * the mechanism, what it finds, one-line caption. The example query is allowed
 * in this section. Same card grid as three-breaks and limits.
 * Build: one card per click. Cards still to come are dashed outlines with a
 * faint number and title (as in three-breaks), so the audience sees "three
 * stages" from the start; shown cards never move. */
VIS.scene({
  id: 'trend-content',
  section: 'trends',
  title: 'Content: words, intent, meaning',
  layout: 'full',
  steps: ['words', 'intent', 'vectors'],
  render(step, { S, P, C }) {
    const out = [];
    const PY = 24, PH = 368, PW = 372;
    const xs = [16, 414, 812];
    const boxY = 92, boxH = 46;
    const arrowY1 = boxY + boxH + 8, arrowY2 = 178;
    const captionY = PY + PH - 36;

    // Card skeleton shared by the three stages.
    const frame = (px, n, title, mechanism, caption) => {
      const cx = px + PW / 2;
      out.push(P.card(px, PY, PW, PH, { rx: 14 }));
      out.push(P.numBadge(px + 34, PY + 36, n, { r: 15 }));
      out.push(S.text(px + 58, PY + 36, title, { size: 22, weight: 'bold', fill: C.text, vc: true }));
      out.push(P.searchBox(px + 20, boxY, PW - 40, { text: 'lamine yamal', h: boxH, size: 19 }));
      out.push(S.arrow(cx, arrowY1, cx, arrowY2, { color: C.muted, sw: 2 }));
      out.push(S.text(cx + 14, (arrowY1 + arrowY2) / 2, mechanism, { size: 17, fill: C.muted, vc: true }));
      out.push(S.text(cx, captionY, caption, { size: 18, fill: C.text2, anchor: 'middle', vc: true }));
      return cx;
    };

    // ---- 1. Words: two postings lists, the shared documents highlighted -----
    const words = (x1) => {
      frame(x1, 1, 'Words', 'postings lists', 'pages containing both words');
      const ch = 40, rowA = 194, rowB = 250, cw = 46;
      const cols = { 2: x1 + 150, 5: x1 + 216, 9: x1 + 282 };
      const lists = [['lamine', rowA, [2, 5, 9]], ['yamal', rowB, [2, 9]]];
      // The dashed boxes mark the documents both lists share (as in inverted-index).
      [2, 9].forEach((d) => out.push(S.rect(cols[d] - 6, rowA - 7, cw + 12, rowB + ch - rowA + 14,
        { rx: 10, stroke: C.blue, sw: 2, dash: '6 5' })));
      lists.forEach(([term, y, docs]) => {
        out.push(S.line(x1 + 120, y + ch / 2, cols[9] + cw / 2, y + ch / 2, { stroke: C.blue, sw: 1.5 }));
        out.push(P.chip(x1 + 20, y, term, { w: 100, h: ch, size: 19, bold: true, fill: C.bgGrey, color: C.text }));
        docs.forEach((d) => {
          const both = d !== 5;
          out.push(P.chip(cols[d], y, String(d), {
            w: cw, h: ch, size: 19, bold: true, fill: both ? C.blue : C.bg, stroke: both ? null : C.blue, color: both ? C.bg : C.blue,
          }));
        });
      });
    };

    // ---- 2. Language and intent: what the query is about ---------------------
    const intent = (px) => {
      const cx2 = frame(px, 2, 'Language and intent', 'learned models', 'plus many ranking signals');
      ['person: footballer', 'intent: latest news'].forEach((label, i) => {
        const w = P.chipWidth(label, { size: 19, padX: 16 });
        out.push(P.chip(cx2 - w / 2, 198 + i * 56, label, { w, h: 40, size: 19, fill: C.bgGrey, color: C.text2 }));
      });
    };

    // ---- 3. Meaning as vectors: the query is a point, its neighbours match ----
    const vectors = (px) => {
      const cx3 = frame(px, 3, 'Meaning as vectors', '[0.12, −0.83, …]', 'with or instead of postings lists');
      const pTop = 186, pBot = 324;
      out.push(S.rect(px + 20, pTop, PW - 40, pBot - pTop, { rx: 10, fill: C.bgSoft }));
      const qx = cx3, qy = 244;
      const near = [[26, -20], [-22, -14], [16, 26], [-28, 16], [36, 4]];
      const far = [[-120, -38], [-92, 34], [-140, 6], [-66, -46], [70, -44], [118, -24], [146, 22], [98, 40], [-118, 62], [124, 64]];
      far.forEach(([dx, dy]) => out.push(S.circle(qx + dx, qy + dy, 4.5, { fill: C.faint })));
      near.forEach(([dx, dy]) => out.push(S.circle(qx + dx, qy + dy, 5.5, { fill: C.muted })));
      out.push(S.circle(qx, qy, 46, { stroke: C.blue, sw: 2, dash: '6 5' }));
      out.push(S.circle(qx, qy, 8, { fill: C.blue, stroke: C.bg, sw: 2 }));
      out.push(S.text(qx, 312, 'nearest neighbours', { size: 17, fill: C.blue, anchor: 'middle' }));
    };

    const cards = [
      { n: 1, title: 'Words', draw: words },
      { n: 2, title: 'Language and intent', draw: intent },
      { n: 3, title: 'Meaning as vectors', draw: vectors },
    ];
    cards.forEach((c, i) => {
      const px = xs[i];
      if (i > step) {
        // Still to come: dashed outline, faint number and title.
        out.push(P.card(px, PY, PW, PH, { rx: 14, stroke: C.faint, dash: '6 5' }));
        out.push(P.numBadge(px + 34, PY + 36, c.n, { r: 15, fill: C.line }));
        out.push(S.text(px + 58, PY + 36, c.title, { size: 22, weight: 'bold', fill: C.faint, vc: true }));
        return;
      }
      c.draw(px);
    });

    // ---- Time runs left to right under the three cards (every step) ----------
    out.push(S.text(16, 436, 'over the last decade', { size: 18, fill: C.muted }));
    out.push(S.arrow(16, 456, 1184, 456, { color: C.faint, sw: 1.5, size: 12 }));
    return out;
  },
});
