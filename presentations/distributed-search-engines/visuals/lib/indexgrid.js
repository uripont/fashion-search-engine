/* The inverted index drawn as a grid: documents across the top, one row per
 * term, a chip wherever the document contains the term. Read along a row it is
 * a postings list; cut it by rows (terms) or by columns (documents) and you
 * get the two ways of partitioning. Used by `inverted-index` and `partition`. */
(function (g) {
  'use strict';
  const VIS = (g.VIS = g.VIS || {});
  const S = VIS.svg;

  // opts:
  //   x, y         top-left of the term labels column (y is the first row centre)
  //   colStep, rowStep, chipW, chipH, labelW
  //   termGap      extra space between term bands (term partitioning)
  //   docGap       extra space between document groups (document partitioning)
  //   colorBy      null | 'term' | 'doc'
  //   docHeader    draw numbered document icons above the columns (y offset)
  //   hlTerms      terms whose rows are highlighted
  //   hlDocs       documents whose chips in hlTerms rows are highlighted
  //   dimTerms     rows drawn faded
  //   bandLabels   (not drawn here; use geom to place them)
  function layout(o = {}) {
    const D = VIS.data;
    const colStep = o.colStep || 58, rowStep = o.rowStep || 44;
    const chipW = o.chipW || 44, labelW = o.labelW || 92;
    const termGap = o.termGap || 0, docGap = o.docGap || 0;
    const x = o.x === undefined ? 200 : o.x, y = o.y === undefined ? 110 : o.y;
    const cx0 = x + labelW + 22 + chipW / 2;
    const colX = (d) => cx0 + (d - 1) * colStep + D.docShard(d) * docGap;
    const rowY = (t) => y + D.terms.indexOf(t) * rowStep + D.termBand[t] * termGap;
    return {
      x, y, colStep, rowStep, chipW, chipH: o.chipH || 30, labelW, colX, rowY,
      left: x, right: colX(9) + chipW / 2, top: y - (o.chipH || 30) / 2, bottom: rowY('web') + (o.chipH || 30) / 2,
    };
  }

  function indexGrid(o = {}) {
    const D = VIS.data, c = VIS.theme.c, sh = VIS.theme.shard;
    const G = layout(o);
    const hlTerms = o.hlTerms || [], hlDocs = o.hlDocs || [], dimTerms = o.dimTerms || [];
    const out = [];

    if (o.docHeader !== undefined && o.docHeader !== false) {
      const hy = G.top - (o.docHeader === true ? 62 : o.docHeader);
      for (let d = 1; d <= 9; d++) {
        const colr = o.colorBy === 'doc' ? D.docShard(d) : 'grey';
        out.push(VIS.parts.doc(G.colX(d) - 15, hy, { w: 30, h: 38, label: d, color: colr, labelSize: 16 }));
      }
    }

    for (const t of D.terms) {
      const yy = G.rowY(t);
      const hl = hlTerms.includes(t);
      const dim = dimTerms.includes(t) || (o.dimOthers && hlTerms.length && !hl);
      const row = [];
      const band = D.termBand[t];
      const tp = o.colorBy === 'term' ? sh[band] : null;
      row.push(S.rect(G.x, yy - 16, G.labelW, 32, {
        rx: 7, fill: hl ? c.blue : tp ? tp.soft : '#FFFFFF', stroke: hl ? c.blue : tp ? tp.main : c.line, sw: 1.5,
      }));
      row.push(S.text(G.x + 12, yy, t, { size: 18, weight: 'bold', fill: hl ? '#FFFFFF' : tp ? tp.ink : c.text2, vc: true }));
      const list = D.postings[t];
      const lastX = G.colX(list[list.length - 1]);
      row.push(S.line(G.x + G.labelW, yy, lastX, yy, { stroke: hl ? c.blue : c.line, sw: hl ? 2 : 1.5 }));
      for (const d of list) {
        const cx = G.colX(d);
        let fill = c.bgGrey, stroke = null, ink = c.text2, bold = false;
        if (o.colorBy === 'term') { fill = sh[band].soft; stroke = sh[band].main; ink = sh[band].ink; }
        if (o.colorBy === 'doc') { const p = sh[D.docShard(d)]; fill = p.soft; stroke = p.main; ink = p.ink; }
        if (hl) { fill = '#FFFFFF'; stroke = c.blue; ink = c.blue; }
        if (hl && hlDocs.includes(d)) { fill = c.blue; stroke = c.blue; ink = '#FFFFFF'; bold = true; }
        row.push(VIS.parts.chip(cx - G.chipW / 2, yy - G.chipH / 2, String(d), {
          w: G.chipW, h: G.chipH, fill, stroke, color: ink, bold, size: 17,
        }));
      }
      out.push(S.group(row, { opacity: dim ? 0.28 : 1 }));
    }
    return { svg: S.group(out), geom: G };
  }

  VIS.parts.indexGrid = indexGrid;
  VIS.parts.indexGridLayout = layout;
})(typeof globalThis !== 'undefined' ? globalThis : window);
