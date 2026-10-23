/* Section 1 opener: the query "lamine yamal". Three columns, read left to
 * right: a crowd types the same query at once -> the search box -> about a
 * tenth of a second later, a results page with ten results, the top ones
 * written hours ago. Under each column, the property it shows: popular, all at
 * once, fresh. No competition, opponent or score is named. Three steps, one
 * column each; what is already there keeps its coordinates. The three results
 * are the final answer of the worked example (section 3), in the same order. */
VIS.scene({
  id: 'scenario',
  section: 'problem',
  title: 'The query: lamine yamal',
  layout: 'full',
  steps: ['crowd', 'query', 'results'],
  render(step, { S, P, C, T }) {
    const out = [];
    // Column i is drawn from step i on.
    const labels = [
      ['Popular', 0, 'everyone types the same query'],
      ['All at once', 2, 'thousands at the same moment'], // yellow: red means failure in this deck
      ['Fresh', 3, 'pages written hours ago'],
    ];
    const MID = 208;                   // shared centre line of the three columns
    const COL = [150, 500, 982];       // column centres (crowd, box, results)
    const green = T.shard[3].ink;

    // ---- LEFT: a crowd, everyone sending the same query --------------------
    const cols = [66, 122, 178, 234];
    const rows = [MID - 96, MID - 32, MID + 32, MID + 96];
    const jx = [0, 4, -3, 2, -4, 3, 1, -2, 4, -1, 2, -3, 3, 0, -2];
    const jy = [0, -3, 2, -2, 3, -1, 2, -3, 1, 3, -2, 0, 2, -2, 1];
    const people = [];
    rows.forEach((y, r) => cols.forEach((x, c) => {
      if (r === 3 && c === 0) return; // 15 people, not 16
      people.push([x + jx[people.length], y + jy[people.length]]);
    }));
    people.forEach(([x, y]) => out.push(P.user(x, y, 36, C.muted)));

    // ---- CENTRE: the search box ---------------------------------------------
    const boxX = 340, boxW = 320, boxH = 56, boxY = MID - boxH / 2;
    // x of the pill's left edge at height y, so arrows stop just outside it.
    const edgeX = (y) => {
      const dy = y - MID, r = boxH / 2;
      return boxX + r - Math.sqrt(Math.max(0, r * r - dy * dy));
    };
    // Arrows from the right-hand column of the crowd, converging on the box.
    if (step >= 1) {
      [3, 7, 11, 14].map((k) => people[k]).forEach((p, i) => {
        const ty = MID - 18 + i * 12;
        out.push(S.arrow(p[0] + 18, p[1], edgeX(ty) - 4, ty, { color: C.faint, sw: 1.5, size: 9 }));
      });
      out.push(P.searchBox(boxX, boxY, boxW, { h: boxH, text: 'lamine yamal', cursor: true, focus: true }));
    }

    // ---- BOTTOM: the property each column shows ------------------------------
    labels.slice(0, step + 1).forEach(([label, color, caption], i) => {
      out.push(P.badge(COL[i], 412, label, { color, size: 19, bold: true, anchor: 'middle' }));
      out.push(S.text(COL[i], 472, caption, { size: 18, fill: C.text2, anchor: 'middle' }));
    });
    if (step < 2) return out;

    // ---- Box -> results, about a tenth of a second ---------------------------
    const cx = 780, cw = 404, cy = 24, ch = 362, L = 800;
    out.push(S.arrow(boxX + boxW + 10, MID, cx - 10, MID, { color: C.muted, sw: 2, size: 11 }));
    out.push(P.badge((boxX + boxW + cx) / 2, MID - 46, '≈ 0.1 s', { color: 0, size: 20, bold: true, anchor: 'middle' }));

    // ---- RIGHT: a results page -------------------------------------------------
    out.push(P.card(cx, cy, cw, ch, { rx: 14 }));
    out.push(S.text(L, cy + 34, '10 results', { size: 20, weight: 'bold', fill: C.text }));
    out.push(S.text(cx + cw - 20, cy + 34, 'out of billions of pages', { size: 17, fill: C.muted, anchor: 'end' }));

    // One result: favicon and site, blue title, then the date and the snippet
    // in the results-page style. Fresh dates are green, like the "Fresh" label
    // below. The comma after the date sits in a plain string, not a tspan, so
    // rsvg keeps the space after it.
    const result = (y, o) => {
      const p = P.pal(o.color);
      const line = o.age ? [{ t: o.age, weight: 'bold', fill: green }, ', ' + o.snippet] : [o.snippet];
      return S.group([
        S.circle(L + 11, y + 11, 11, { fill: p.soft, stroke: C.lineSoft, sw: 1 }),
        S.text(L + 11, y + 11, o.site[0].toUpperCase(), { size: 16, weight: 'bold', fill: p.ink, anchor: 'middle', vc: true }),
        S.text(L + 30, y + 11, o.site, { size: 16, fill: C.text2, vc: true }),
        S.text(L, y + 44, o.title, { size: 21, fill: C.link }),
        S.text(L, y + 71, [line], { size: 16, fill: C.snippet }),
      ]);
    };
    // Same three pages, same order, as the final answer of the worked example.
    out.push(result(cy + 54, { site: 'sports-daily.example', color: 0, title: 'Match report: last night', age: '3 hours ago', snippet: 'ratings and key moments.' }));
    out.push(result(cy + 140, { site: 'wiki-profiles.example', color: 1, title: 'Lamine Yamal: biography', snippet: 'Early life, career and clubs.' }));
    out.push(result(cy + 226, { site: 'fan-news.example', color: 2, title: 'Reactions to the match', age: '5 hours ago', snippet: 'what fans are saying.' }));
    // Grey skeleton results stand for the rest of the ten.
    [cy + 314].forEach((y) => {
      out.push(S.rect(L, y, 150, 14, { rx: 7, fill: C.lineSoft }));
      out.push(S.rect(L, y + 22, 330, 10, { rx: 5, fill: C.lineSoft }));
    });

    return out;
  },
});
