/* Section 2a verdict: term versus document partitioning, as a comparison
 * table. Generic content, no names. The document column is the preferred
 * one, so it sits on a soft blue card with a "preferred" pill on top. The
 * line under the table is what "shard" means in the rest of the deck.
 * Two steps: first the criteria and the term column (the document column
 * shows only its header, faint), then the document column, the "preferred"
 * pill, the definition of "shard", Google's 2003 example and the source. */
VIS.scene({
  id: 'partition-verdict',
  section: 'principles',
  title: 'Verdict: document partitioning',
  layout: 'full',
  steps: ['criteria', 'verdict'],
  render(step, { S, P, C, T }) {
    const blue = T.shard[0];
    const verdict = step === 1;
    const out = [];

    // [criterion, [works?, term text], [works?, document text]]
    const rows = [
      ['Machines per query', [true, 'only the owners of its terms'], [false, 'every shard']],
      ['Network traffic', [false, 'whole postings lists'], [true, 'small top-k lists']],
      ['Adding a page', [false, 'one machine per term'], [true, 'one shard']],
      ['Load', [false, 'hot terms overload a machine'], [true, 'spread evenly']],
      ['Losing a machine', [false, 'some terms disappear'], [true, 'a slice of the results']],
    ];
    const ROW0 = 146, RH = 58;
    const TERM_BADGE = 396, TERM_TEXT = 418;
    const DOC_X = 740, DOC_W = 420, DOC_BADGE = 764, DOC_TEXT = 786;

    const cell = (bx, tx, y, [ok, label]) => S.group([
      ok ? P.checkBadge(bx, y, 11) : P.xBadge(bx, y, 11),
      S.text(tx, y, label, { size: 18, fill: C.text2, vc: true }),
    ]);

    // Row dividers first, so the highlighted card covers them in its column.
    out.push(S.line(40, 116, 1160, 116, { stroke: C.line, sw: 1.5 }));
    for (let i = 0; i < rows.length - 1; i++) {
      const y = ROW0 + i * RH + RH / 2;
      out.push(S.line(40, y, 1160, y, { stroke: C.lineSoft, sw: 1.5 }));
    }

    // Highlighted document column (step 2).
    if (verdict) {
      out.push(S.rect(DOC_X, 58, DOC_W, 352, { rx: 14, fill: blue.soft, stroke: blue.main, sw: 2 }));
      out.push(P.badge(DOC_X + DOC_W / 2, 44, 'preferred', {
        anchor: 'middle', fill: blue.main, ink: '#FFFFFF', size: 16, bold: true,
      }));
    }

    // Column headers, both aligned with the left edge of their badges. In
    // step 1 the document header is a faint teaser of the column to come.
    out.push(S.text(TERM_BADGE - 11, 96, 'Term partitioning', { size: 20, weight: 'bold', fill: C.text2 }));
    out.push(S.text(DOC_BADGE - 11, 96, 'Document partitioning', { size: 20, weight: 'bold', fill: verdict ? blue.ink : C.faint }));

    // Rows.
    rows.forEach(([crit, term, doc], i) => {
      const y = ROW0 + i * RH;
      out.push(S.text(40, y, crit, { size: 19, weight: 'bold', fill: C.text, vc: true }));
      out.push(cell(TERM_BADGE, TERM_TEXT, y, term));
      if (verdict) out.push(cell(DOC_BADGE, DOC_TEXT, y, doc));
    });
    if (!verdict) return out;

    // What "shard" means from here on. Edge spaces sit in plain strings
    // because rsvg trims whitespace at the edges of a <tspan>.
    out.push(S.text(40, 440, [[
      'From now on, a ',
      { t: 'shard', weight: 'bold', fill: blue.ink },
      ' is a slice of the documents with its own full index. Each document is in exactly one shard.',
    ]], { size: 20, fill: C.text }));
    // The verified historical example, muted, then the source of the table.
    out.push(S.text(40, 467, 'Google in 2003: each shard held a random subset of the documents (Barroso, Dean & Hölzle)',
      { size: 18, fill: C.muted }));
    out.push(P.source(40, 494, 'Moffat, Webber, Zobel & Baeza-Yates (2007), IRWA theory session 5', { size: 16 }));
    return out;
  },
});
