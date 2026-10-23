/* Section principles: selective search (Kulkarni & Callan 2015, Kim et al. 2017).
 * Generic topics (music, science, travel, sport), no football.
 * Step 1: documents spread at random, so every shard holds a mix and every
 * query has to ask every shard. Step 2: documents grouped by topic, so a music
 * query only asks the music shard. Positions are identical in both steps.
 * Here colour means topic, so the shard labels stay grey while shards are a
 * random mix and take their (matching) colour once each shard has a topic. */
VIS.scene({
  id: 'selective',
  section: 'principles',
  title: 'Selective search: topical shards',
  layout: 'full',
  steps: ['random', 'topical'],
  render(step, { S, P, C, T }) {
    const sh = T.shard;
    const topics = [
      { name: 'music', col: sh[0] },
      { name: 'science', col: sh[1] },
      { name: 'travel', col: sh[2] },
      { name: 'sport', col: sh[3] },
    ];

    // Deterministic shuffle, so both steps show the same 64 documents.
    let seed = 20151;
    const rnd = () => {
      seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
      return (seed >>> 0) / 4294967296;
    };
    const shuffle = (a) => {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    // Random: every shard gets 4 documents of each topic, in a shuffled order.
    const randomDocs = [0, 1, 2, 3].map(() => shuffle([0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3]));
    // Topical: 13 documents of the shard's own topic, plus one of each other topic.
    const strayPos = [[3, 8, 13], [1, 6, 11], [4, 9, 15], [2, 7, 12]];
    const topicalDocs = [0, 1, 2, 3].map((s) => {
      const a = new Array(16).fill(s);
      const others = [0, 1, 2, 3].filter((t) => t !== s);
      strayPos[s].forEach((pos, k) => { a[pos] = others[k]; });
      return a;
    });
    const docs = step === 0 ? randomDocs : topicalDocs;

    const out = [];
    const qy = 256; // centre line of query -> broker -> shards
    const bx = 262; // broker left edge
    const strip = { x: 430, w: 754, h: 84, gap: 12, y0: 70 };
    const stripY = (i) => strip.y0 + i * (strip.h + strip.gap);

    // ---- Legend (topic colours) ----
    let lx = strip.x;
    for (const t of topics) {
      out.push(S.circle(lx + 8, 36, 8, { fill: t.col.main }));
      out.push(S.text(lx + 24, 36, t.name, { size: 18, fill: C.text2, vc: true }));
      lx += 24 + S.tw(t.name, 18) + 34;
    }

    // ---- Query, broker, and the arrows that fan out to the shards ----
    const qw = 176;
    out.push(P.searchBox(16, qy - 24, qw, { text: 'music', h: 48, size: 20 }));
    out.push(S.arrow(16 + qw + 8, qy, bx - 8, qy, { color: C.muted, sw: 2 }));
    out.push(P.machine(bx, qy - 36, { w: 60, h: 72, color: 'grey', sub: 'Broker', subSize: 20 }));
    for (let i = 0; i < 4; i++) {
      const on = step === 0 || i === 0;
      const col = step === 1 && i === 0 ? sh[0].main : C.muted;
      out.push(S.arrow(bx + 66, qy, strip.x - 6, stripY(i) + strip.h / 2, {
        color: col, sw: step === 1 && i === 0 ? 2.5 : 2, opacity: on ? 1 : 0.25,
      }));
    }

    // ---- Shards: one strip per shard, one dot per document ----
    for (let i = 0; i < 4; i++) {
      const y = stripY(i);
      const chosen = step === 1 && i === 0;
      const g = [
        S.rect(strip.x, y, strip.w, strip.h, {
          rx: 14, fill: '#FFFFFF', stroke: chosen ? sh[0].main : C.faint, sw: chosen ? 2.5 : 1.5,
        }),
        // Same label position in both steps; the second line says what the
        // shard holds (a random mix, then one topic in that topic's colour).
        S.text(strip.x + 22, y + strip.h / 2 - 11, `Shard ${i + 1}`, { size: 20, weight: 'bold', fill: step === 1 ? topics[i].col.ink : C.text2, vc: true }),
        S.text(strip.x + 22, y + strip.h / 2 + 14, step === 1 ? topics[i].name : 'random mix', { size: 17, fill: step === 1 ? topics[i].col.ink : C.muted, vc: true }),
      ];
      docs[i].forEach((t, k) => {
        g.push(S.circle(strip.x + 150 + k * 36, y + strip.h / 2, 10, { fill: topics[t].col.main }));
      });
      out.push(S.group(g, { opacity: step === 1 && i !== 0 ? 0.4 : 1 }));
    }

    // ---- Caption and source ----
    const caption = step === 0
      ? 'Random assignment: ask all 4 shards'
      : 'Topical shards: ask 1 of 4, results close to asking all';
    out.push(S.text(16, 470, caption, { size: 22, weight: 500, fill: C.text }));
    out.push(S.text(1184, 470, 'Kulkarni & Callan (2015), Kim et al. (2017)', { size: 16, fill: C.faint, anchor: 'end' }));
    return out;
  },
});
