/* Principles: sizing a cluster. One square = one machine. Columns are shards
 * (they split the data), rows are replicas (full copies, they add query rate).
 * Step 1: enough shards to fit in memory. Step 2: enough replicas for the
 * query rate, plus one spare row (drawn hollow) so a failed machine does not
 * cut peak capacity: 50 x 11 = 550 machines. Illustrative numbers, generic. */
VIS.scene({
  id: 'sizing',
  section: 'principles',
  title: 'Sizing: shards, then replicas',
  layout: 'full',
  steps: ['shards', 'replicas'],
  render(step, { S, P, C, T }) {
    const sh = T.shard;
    const ink = sh[0].ink;
    const out = [];
    const all = step === 1;

    // ---- Geometry shared by both steps ----
    const X0 = 40, Y0 = 84, PITCH = 17, SQ = 14, COLS = 50, ROWS = 10;
    const colX = (c) => X0 + c * PITCH;
    const rowY = (r) => Y0 + r * PITCH;
    const gridR = colX(COLS - 1) + SQ; // 887
    const gridB = rowY(ROWS - 1) + SQ; // 251
    const RX = gridR + 30;             // right-hand labels
    const spareY = gridB + 13;         // the spare row, set apart: 264..278
    const EQ = 350;                    // first equation baseline

    // ---- The grid: one column per shard, one row per copy of the index ----
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const live = all || r === 0;
        out.push(S.rect(colX(c), rowY(r), SQ, SQ, { rx: 2, fill: live ? sh[c % 4].main : C.bgGrey }));
      }
    }

    // Bracket over the first row: the shards. Legend for one square.
    out.push(P.bracket(X0, gridR, Y0 - 8, { up: true, label: '50 shards', color: sh[0].main, ink, size: 20, bold: true }));
    out.push(S.rect(RX, 43, SQ, SQ, { rx: 2, fill: sh[0].main }));
    out.push(S.text(RX + SQ + 10, 50, 'one machine, 128 GB', { size: 18, fill: C.text2, vc: true }));

    // The first row is one complete copy of the index.
    out.push(S.text(RX, rowY(0) + SQ / 2, '1 copy of the index', { size: 20, weight: 'bold', fill: C.text, vc: true }));

    // Equation 1: shards come from the data size.
    out.push(S.text(X0, EQ, [[
      // Plain string first: rsvg drops a space at the end of a <tspan>.
      '6 TB ÷ 128 GB per machine ≈ ',
      { t: '50 shards', weight: 'bold', fill: ink },
    ]], { size: 22, fill: C.text2 }));

    if (all) {
      // The spare row: same machines, hollow, inside a dashed frame.
      out.push(S.rect(X0 - 5, spareY - 5, gridR - X0 + 10, SQ + 10, { rx: 6, stroke: C.faint, sw: 1.4, dash: '5 4' }));
      for (let c = 0; c < COLS; c++) {
        out.push(S.rect(colX(c) + 0.75, spareY + 0.75, SQ - 1.5, SQ - 1.5, { rx: 2, fill: '#FFFFFF', stroke: sh[c % 4].main, sw: 1.5 }));
      }

      // Vertical bracket: the ten replicas the query rate needs.
      out.push(S.path(`M${gridR + 10},${Y0} H${gridR + 18} V${gridB} H${gridR + 10}`, { stroke: sh[0].main, sw: 1.6 }));
      out.push(S.text(RX, 154, '10 replicas', { size: 22, weight: 'bold', fill: ink, vc: true }));

      // What each direction buys.
      out.push(S.text(RX, 198, ['1 more row: +500 queries/s', 'and costs +50 machines'], { size: 18, fill: C.text2, vc: true, lh: 22 }));
      out.push(S.text(gridR, spareY + SQ + 30, '1 more column: more data, same queries/s', { size: 18, fill: C.text2, anchor: 'end', vc: true }));

      // The spare: bold name and plain text as two runs (rsvg tspan spaces).
      const sy = spareY + SQ / 2;
      out.push(S.text(RX, sy, 'spare:', { size: 18, weight: 'bold', fill: C.text, vc: true }));
      out.push(S.text(RX + S.tw('spare:', 18, true) + 6, sy, 'a failed machine', { size: 18, fill: C.text2, vc: true }));
      out.push(S.text(RX, sy + 22, 'does not cut peak capacity', { size: 18, fill: C.text2, vc: true }));

      // Equations 2 and 3.
      out.push(S.text(X0, EQ + 42, [[
        '5,000 queries/s ÷ 500 per copy = 10 replicas, + 1 spare = ',
        { t: '11 replicas', weight: 'bold', fill: ink },
      ]], { size: 22, fill: C.text2 }));
      out.push(S.text(X0, EQ + 96, '50 × 11 = 550 machines', { size: 28, weight: 'bold', fill: ink }));
    }

    out.push(P.illustrative(1184, 462, { anchor: 'end' }));
    return out;
  },
});
