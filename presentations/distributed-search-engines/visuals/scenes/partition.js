/* Section 2a: the same inverted index as section 1, cut two ways.
 * Rows (terms) -> term partitioning; columns (documents) -> document
 * partitioning. Generic query "data search", no Lamine Yamal here. */
VIS.scene({
  id: 'partition',
  section: 'principles',
  title: 'Cutting the index: by term or by document',
  layout: 'full',
  steps: ['whole', 'by-term', 'term-cost', 'by-doc', 'doc-query'],
  render(step, { S, P, C, T }) {
    const D = VIS.data, sh = T.shard;
    const byTerm = step === 1 || step === 2;
    const byDoc = step === 3 || step === 4;
    const query = step === 2 || step === 4;
    const out = [];

    const grid = P.indexGrid({
      x: 180, y: 162, rowStep: 39, chipH: 28, docHeader: 56,
      termGap: byTerm ? 18 : 0, docGap: byDoc ? 34 : 0,
      colorBy: byTerm ? 'term' : byDoc ? 'doc' : null,
      hlTerms: query ? D.query : [], hlDocs: query ? [3, 7] : [],
      dimOthers: query,
    });
    const G = grid.geom;
    const rx = 915; // right column; text stops at least 10 units from the edge

    // Callout with hand-broken body lines (same look as P.callout), so a line
    // never ends on a lone word or runs into the right edge.
    const noteH = (lines, sz = 17) => 18 + sz * 1.35 + (lines.length - 1) * sz * 1.3 + 5;
    const note = (y, icon, title, lines, sz = 17) => {
      const tx = icon ? rx + 34 : rx;
      return S.group([
        icon ? icon(rx + 13, y + 12) : null,
        S.text(tx, y + 18, title, { size: sz + 1, weight: 'bold', fill: C.text }),
        S.text(tx, y + 18 + sz * 1.35, lines, { size: sz, fill: C.text2, lh: sz * 1.3 }),
      ]);
    };
    // Stack notes from y0 with the same gap between consecutive ones.
    const stack = (y0, gap, notes) => {
      let y = y0;
      for (const [icon, title, lines] of notes) { out.push(note(y, icon, title, lines)); y += noteH(lines) + gap; }
    };
    const bad = (x, y) => P.xBadge(x, y, 12), good = (x, y) => P.checkBadge(x, y, 12);

    // ---- Band backgrounds (drawn under the grid) ----
    if (byTerm) {
      for (let b = 0; b < 3; b++) {
        const ts = D.terms.filter((t) => D.termBand[t] === b);
        const y1 = G.rowY(ts[0]) - 22, y2 = G.rowY(ts[ts.length - 1]) + 22;
        out.push(S.rect(10, y1, G.right + 22 - 10, y2 - y1, { rx: 14, fill: sh[b].soft }));
        const my = (y1 + y2) / 2;
        out.push(P.machine(22, my - 22, { w: 38, h: 44, color: b }));
        out.push(S.text(70, my - 3, `Machine ${b + 1}`, { size: 18, weight: 'bold', fill: sh[b].ink }));
        out.push(S.text(70, my + 19, `terms ${D.termBandLabel[b]}`, { size: 16, fill: C.muted }));
      }
    }
    if (byDoc) {
      for (let b = 0; b < 3; b++) {
        const x1 = G.colX(b * 3 + 1) - 34, x2 = G.colX(b * 3 + 3) + 34;
        out.push(S.rect(x1, 18, x2 - x1, 470, { rx: 14, fill: sh[b].soft }));
        out.push(S.text((x1 + x2) / 2, 48, `Shard ${b + 1}`, { size: 19, weight: 'bold', fill: sh[b].ink, anchor: 'middle' }));
        out.push(S.text((x1 + x2) / 2, 70, `docs ${b * 3 + 1}–${b * 3 + 3} + own index`, { size: 16, fill: C.muted, anchor: 'middle' }));
      }
    }
    out.push(grid.svg);

    // ---- Right column ----
    if (step === 0) {
      out.push(S.text(rx, 150, 'Three machines.', { size: 22, weight: 'bold', fill: C.text }));
      out.push(S.text(rx, 180, 'Where does each part go?', { size: 20, fill: C.text2 }));
      for (let i = 0; i < 3; i++) out.push(P.machine(rx + i * 76, 220, { w: 54, h: 62, color: 'grey', label: String(i + 1) }));
      out.push(S.text(rx, 345, ['Cut by rows: terms', 'Cut by columns: documents'], { size: 18, fill: C.muted, lh: 28 }));
      // Hint lines for the two ways of cutting into three: rows after "data"
      // and "news" (terms A–F / G–P / Q–Z), columns after docs 3 and 6.
      for (const t of ['data', 'news']) {
        const y = G.rowY(t) + G.rowStep / 2;
        out.push(S.line(G.left - 20, y, G.right + 18, y, { stroke: C.faint, sw: 2, dash: '7 6' }));
      }
      for (const d of [3, 6]) {
        const x = G.colX(d) + G.colStep / 2;
        out.push(S.line(x, G.top - 70, x, G.bottom + 12, { stroke: C.faint, sw: 2, dash: '7 6' }));
      }
    }
    if (step === 1) {
      out.push(note(120, null, 'Term partitioning', ['Each machine owns the whole', 'postings lists of some terms.'], 18));
      out.push(note(260, good, 'A query only visits', ['the machines that', 'own its terms'], 18));
    }
    if (step === 2) {
      // Ship the whole "data" list from machine 1 to machine 3.
      const y1 = G.rowY('data'), y2 = G.rowY('search');
      const x0 = G.right + 14;
      out.push(S.curve(x0, y1, x0, y2 - 4, { color: sh[1].ink, sw: 2.5, bend: -0.22 }));
      out.push(P.badge(x0 + 4, (y1 + y2) / 2 - 15, '6 IDs', { color: 1, size: 16, bold: true }));
      out.push(P.warnBadge(G.x - 18, G.rowY('web'), 12));
      stack(40, 76, [
        [bad, 'Lists cross the network', ['to intersect, one machine', 'ships a whole list to the other']],
        [bad, 'Hot terms', ['“web” is in 8 of 9 documents', 'and many queries: machine 3', 'does most of the work']],
        [bad, 'Updates are spread', ['one new page touches one', 'machine per term in it']],
      ]);
    }
    if (step === 3) {
      out.push(note(120, null, 'Document partitioning', ['Each shard owns some', 'documents and a complete,', 'small index over them.'], 18));
      out.push(note(280, bad, 'Every query', ['goes to every shard'], 18));
    }
    if (step === 4) {
      // Local answers under each shard.
      const local = [['3'], [], ['7']];
      for (let b = 0; b < 3; b++) {
        const cx = G.colX(b * 3 + 2);
        if (local[b].length) out.push(P.chip(cx - 34, 456, '→ ' + local[b][0], { w: 68, h: 28, fill: C.blue, color: '#fff', bold: true }));
        else out.push(P.chip(cx - 34, 456, 'none', { w: 68, h: 28, fill: '#fff', stroke: C.line, color: C.muted }));
      }
      stack(40, 52, [
        [good, 'All work is local', ['lookup, intersection and', 'scoring inside each shard']],
        [good, 'Small answers travel', ['only each shard’s local', 'top results']],
        [good, 'Easy updates', ['a new page touches one shard']],
        [good, 'Losing a shard', ['loses a slice of results,', 'not whole terms']],
      ]);
    }
    return out;
  },
});
