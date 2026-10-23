/* Section 1: how one machine searches (theory session 5). The same grid is
 * cut in section 2a (scene `partition`). */
VIS.scene({
  id: 'inverted-index',
  section: 'problem',
  title: 'One machine: the inverted index',
  layout: 'full',
  steps: ['index', 'query'],
  render(step, { S, P, C }) {
    const D = VIS.data;
    const q = step === 1;
    const grid = P.indexGrid({
      x: 90, y: 168, rowStep: 40, chipH: 28, docHeader: 58,
      hlTerms: q ? D.query : [], hlDocs: q ? [3, 7] : [], dimOthers: q,
    });
    const G = grid.geom;
    const out = [];
    // P.illustrative draws at 15 units; same look at the 16-unit minimum.
    // Callout number badges at 17 units (P.callout's own `num` draws 15.6).
    const num = (n, fill) => (x, y) => P.numBadge(x, y, n, { r: 13, size: 17, fill: fill || C.muted });
    const illustrative = (x, y, label) => P.badge(x, y, label, {
      fill: '#FFFFFF', stroke: C.line, dash: '4 3', ink: C.muted, size: 16, italic: true, anchor: 'end',
    });

    // The one machine that holds everything.
    const fx = G.left - 40, fy = 22, fw = G.right - G.left + 80, fh = 466;
    out.push(S.rect(fx, fy, fw, fh, { rx: 18, fill: C.bgSoft, stroke: C.line, sw: 1.5 }));
    out.push(P.machine(fx + 18, fy + 14, { w: 30, h: 34, color: 'grey' }));
    out.push(S.text(fx + 60, fy + 37, 'One machine: all documents, all terms', { size: 19, weight: 'bold', fill: C.text2 }));
    out.push(grid.svg);

    // Intersection: vertical guides through the matching documents.
    if (q) {
      for (const d of [3, 7]) {
        const x = G.colX(d);
        const y1 = G.rowY('data') - 22, y2 = G.rowY('search') + 22;
        out.push(S.rect(x - 28, y1, 56, y2 - y1, { rx: 10, stroke: C.blue, sw: 2, dash: '6 5' }));
      }
    }

    // Right column: what we are looking at, or what the query does.
    // Equal outer margins (the panel starts at x = 50, the column ends 50
    // from the right edge).
    const rx = G.right + 64, rw = 1200 - rx - (G.left - 40);
    if (!q) {
      out.push(P.callout(rx, 118, rw, {
        icon: num(1, C.faint), title: 'Documents', body: 'each crawled page gets a number',
      }));
      out.push(P.callout(rx, 250, rw, {
        icon: num(2, C.faint), title: 'Postings lists', body: 'for each term, the sorted list of documents that contain it',
      }));
      out.push(S.arrow(rx - 8, 136, G.colX(9) + 26, 112, { color: C.faint, sw: 1.6 }));
      out.push(S.arrow(rx - 8, 268, G.colX(8) + 28, G.rowY('news'), { color: C.faint, sw: 1.6 }));
    } else {
      out.push(P.searchBox(rx, 40, rw, { text: 'data search', h: 50, size: 20, cursor: true, focus: true }));
      out.push(P.callout(rx, 128, rw, { icon: num(1), title: 'Look up', body: 'the two postings lists' }));
      out.push(P.callout(rx, 218, rw, { icon: num(2), title: 'Intersect', body: 'documents in both lists' }));
      out.push(P.chip(rx + 34, 290, '3', { w: 40, fill: C.blue, color: '#fff', bold: true }));
      out.push(P.chip(rx + 82, 290, '7', { w: 40, fill: C.blue, color: '#fff', bold: true }));
      out.push(P.callout(rx, 352, rw, { icon: num(3), title: 'Rank', body: 'score them and sort' }));
      out.push(illustrative(rx + rw - 6, 352, 'illustrative scores'));
      out.push(P.rankList(rx + 34, 418, [
        { label: 'doc 7', score: D.result[0].score, color: 'grey' },
        { label: 'doc 3', score: D.result[1].score, color: 'grey' },
      ], { w: rw - 40, rh: 36 }));
    }
    return out;
  },
});
