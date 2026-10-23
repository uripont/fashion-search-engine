/* Section 2d (principles): local IDF versus global IDF. Two shards, each with
 * 100 documents. "cloud" appears in 50 of shard 1 and in 2 of shard 2, so the
 * same match gets a much higher IDF weight on shard 2 (log10: 0.30 vs 1.70).
 * Step 2 shares global statistics (N = 200, df = 52) and both shards then use
 * the same IDF (0.59). Each panel has a weight bar on one shared scale, so the
 * ~5.7x gap (1.70 / 0.30 = 5.67, from the numbers shown) and its fix are
 * visible without reading the formulas.
 * Illustrative numbers. Generic term "cloud", no football. */
VIS.scene({
  id: 'idf-trap',
  section: 'principles',
  title: 'Local IDF is not global IDF',
  layout: 'full',
  steps: ['local', 'global'],
  render(step, { S, P, C, T }) {
    const sh = T.shard;
    const global = step === 1;
    const out = [];

    // Local helper: a red warning triangle (warnBadge is yellow).
    const redWarn = (cx, cy, r) => S.group([
      S.poly([[cx, cy - r * 1.05], [cx + r * 1.1, cy + r * 0.85], [cx - r * 1.1, cy + r * 0.85]],
        { fill: C.red, stroke: '#FFFFFF', sw: 2 }),
      S.line(cx, cy - r * 0.32, cx, cy + r * 0.28, { stroke: '#FFFFFF', sw: 2.6 }),
      S.circle(cx, cy + r * 0.55, 1.9, { fill: '#FFFFFF' }),
    ]);

    // Documents containing "cloud" on each shard (fixed patterns, 100 docs each).
    // Shard 1: exactly 50, a permutation of the 100 cells. Shard 2: exactly 2.
    const hits = [
      new Set(Array.from({ length: 100 }, (_, k) => k).filter((k) => ((k * 37 + 11) % 100) < 50)),
      new Set([23, 71]),
    ];
    const df = [50, 2];
    const localIdf = [0.30, 1.70];
    const globalIdf = 0.59;

    // Geometry shared by both steps. Panels at the sides; the middle column
    // holds the warning (step 1) or the global statistics (step 2).
    const PY = 56, PW = 360, PH = 410;
    const panelX = [40, 800];
    const gridTop = 112, pitch = 22, cell = 18;
    const barBottom = gridTop + 9 * pitch + cell; // 328, level with the grid
    const barScale = 200 / 1.70;                  // units per idf unit
    const barW = 40;

    out.push(S.text(40, 34, 'Each square is one document, coloured if it contains “cloud”', { size: 18, fill: C.text2 }));
    out.push(P.illustrative(1184, 14, { anchor: 'end' }));

    for (let b = 0; b < 2; b++) {
      const p = sh[b];
      const x0 = panelX[b];
      const gx = x0 + 24;
      const bcx = x0 + PW - 60; // weight bar centre
      out.push(S.rect(x0, PY, PW, PH, { rx: 14, fill: '#FFFFFF', stroke: C.line, sw: 1.5 }));
      out.push(S.text(gx, PY + 36, `Shard ${b + 1}`, { size: 22, weight: 'bold', fill: p.ink }));
      out.push(S.text(x0 + PW - 24, PY + 36, '100 documents', { size: 17, fill: C.muted, anchor: 'end' }));

      for (let k = 0; k < 100; k++) {
        const r = Math.floor(k / 10), c = k % 10;
        out.push(S.rect(gx + c * pitch, gridTop + r * pitch, cell, cell, {
          rx: 3, fill: hits[b].has(k) ? p.main : C.lineSoft,
        }));
      }

      // Weight bar: local IDF in the shard colour; in step 2 it fades and the
      // global IDF (grey, the same in both shards) is drawn over it.
      const hL = localIdf[b] * barScale;
      out.push(S.rect(bcx - barW / 2, barBottom - hL, barW, hL, { rx: 3, fill: p.main, opacity: global ? 0.25 : 1 }));
      if (global) {
        const hG = globalIdf * barScale;
        out.push(S.rect(bcx - barW / 2, barBottom - hG, barW, hG, { rx: 3, fill: C.muted }));
      }
      out.push(S.line(bcx - barW / 2 - 8, barBottom, bcx + barW / 2 + 8, barBottom, { stroke: C.faint, sw: 1.5 }));
      out.push(S.text(bcx, barBottom + 24, 'weight', { size: 17, fill: C.muted, anchor: 'middle' }));

      // Document frequency (always local: each shard counts its own documents).
      out.push(S.text(gx, 374, `df = ${df[b]} of 100`, { size: 20, fill: C.text2 }));

      // Local IDF, faded in step 2 once the global value replaces it.
      const preL = `idf = log(100 / ${df[b]}) =`;
      out.push(S.group([
        S.text(gx, 406, preL, { size: 20, fill: C.text2 }),
        S.text(gx + S.tw(preL, 20) + 7, 406, localIdf[b].toFixed(2), { size: 20, weight: 'bold', fill: p.ink }),
      ], { opacity: global ? 0.35 : 1 }));

      // Global IDF, step 2 only.
      if (global) {
        const preG = 'idf = log(200 / 52) =';
        const vx = gx + S.tw(preG, 20) + 7;
        out.push(S.text(gx, 438, preG, { size: 20, fill: C.text2 }));
        out.push(S.text(vx, 438, globalIdf.toFixed(2), { size: 20, weight: 'bold', fill: C.text }));
        out.push(P.checkBadge(vx + S.tw('0.59', 20, true) + 22, 431, 11));
      }
    }

    // Middle column.
    if (!global) {
      out.push(redWarn(600, 196, 16));
      out.push(S.text(600, 248, 'Same kind of match,', { size: 19, fill: C.text2, anchor: 'middle' }));
      out.push(S.text(600, 276, '≈ 5.7× the weight on Shard 2', { size: 19, weight: 'bold', fill: C.red, anchor: 'middle' }));
    } else {
      // Global statistics, computed offline and pushed to every shard.
      out.push(S.rect(456, 112, 288, 104, { rx: 12, fill: C.bgSoft, stroke: C.line, sw: 1.5 }));
      out.push(S.text(600, 142, 'Global statistics', { size: 20, weight: 'bold', fill: C.text2, anchor: 'middle' }));
      out.push(S.text(600, 166, 'computed offline', { size: 17, fill: C.muted, anchor: 'middle' }));
      out.push(S.text(600, 198, 'N = 200,  df = 52', { size: 20, weight: 'bold', fill: C.text, anchor: 'middle' }));
      out.push(S.arrow(452, 164, PW + panelX[0] + 4, 164, { color: C.muted, sw: 2 }));
      out.push(S.arrow(748, 164, panelX[1] - 4, 164, { color: C.muted, sw: 2 }));
      // Payoff: same match, same weight.
      out.push(P.checkBadge(600, 262, 14));
      out.push(S.text(600, 304, 'Same match, same weight', { size: 19, weight: 'bold', fill: C.green, anchor: 'middle' }));
    }

    // Source line, two lines at the foot of the middle column.
    out.push(S.text(600, 436, ['Melnik, Raghavan, Yang &', 'Garcia-Molina (2001)'], { size: 16, fill: C.muted, anchor: 'middle', lh: 22 }));
    return out;
  },
});
