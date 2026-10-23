/* Section 3 (example): a deliberately tiny toy cluster answering the query
 * "lamine yamal". 3 shards x 3 replicas = machines A-I, 9 documents, one
 * fresh index. Eight steps, one slide each:
 *   setup  the cluster and a legend
 *   cache  0  cache first
 *   route  1  least expected wait in each shard (A, E, I)
 *   local  2  each machine returns its top 2; shard 2 is still waiting for E
 *   trap      same slide plus the merging trap, visible in the data
 *   hedge  3  E is slow, the broker asks D, D answers first
 *   fresh  4  the fresh index, queried in parallel with A, D and I
 *   merge  5  merge into the top 3, phase 2 fetches only those 3
 * The narration badge shows the step number the speaker says.
 * The cluster (right) and the query path (search box, cache, broker) keep
 * fixed coordinates; the narration under the broker changes per step.
 * All numbers are invented and kept in the local table below (the older
 * VIS.data.example in lib/data.js has outdated titles and order).
 * Section 3 names no opponent, competition or match score. */
VIS.scene({
  id: 'cluster',
  section: 'example',
  title: 'Worked example: a toy cluster',
  layout: 'full',
  steps: ['setup', 'cache', 'route', 'local', 'trap', 'hedge', 'fresh', 'merge'],
  render(step, { S, P, C, T }) {
    const sh = T.shard;
    const SETUP = 0, CACHE = 1, ROUTE = 2, LOCAL = 3, TRAP = 4, HEDGE = 5, FRESH = 6, MERGE = 7;

    // ---- Toy data (invented) ---------------------------------------------------
    // `share`: illustrative share of the shard's documents that contain 'yamal'.
    // `local`: score with the shard's own IDF; `score`: with global statistics.
    const X = {
      shards: [
        { name: 'Shard 1', kind: 'sports news', machines: ['A', 'B', 'C'], load: [1, 3, 2], share: '3%',
          docs: [
            { id: 'N1', title: 'Yamal: best young player', match: true, score: 8.1 },
            { id: 'N2', title: 'Barça squad list', match: true, score: 7.4 },
            { id: 'N3', title: 'Weekend fixtures', match: false },
          ] },
        { name: 'Shard 2', kind: 'encyclopedic', machines: ['D', 'E', 'F'], load: [2, 1, 3], share: '3%',
          docs: [
            { id: 'E1', title: 'Lamine Yamal: biography', match: true, score: 9.0 },
            { id: 'E2', title: 'FC Barcelona squad', match: true, score: 3.2 },
            { id: 'E3', title: 'Camp Nou stadium', match: false },
          ] },
        { name: 'Shard 3', kind: 'social media', machines: ['G', 'H', 'I'], load: [3, 2, 1], share: '0.2%',
          docs: [
            { id: 'S1', title: 'Lamine Yamal skills compilation', match: true, local: 9.6, score: 6.0 },
            { id: 'S2', title: 'Fan thread: is Yamal best?', match: true, local: 4.1, score: 2.5 },
            { id: 'S3', title: 'Cat video of the day', more: '+ millions more', match: false },
          ] },
      ],
      chosen: ['A', 'E', 'I'],          // least expected wait, (queue + 1) x service time
      slow: 'E', backup: 'D',           // the hedged request
      fresh: [
        { id: 'F1', title: 'Match report: last night', score: 9.3, age: '3 hours ago' },
        { id: 'F2', title: 'Reactions to the match', score: 8.7, age: '5 hours ago' },
      ],
    };

    // ---- Geometry (identical in every step) ---------------------------------
    const PX = 320, PW = 864, PH = 120, TOPS = [12, 142, 272];
    const MX = [452, 516, 580], MW = 52, MH = 54, MY = 42;   // machine columns
    const LX = 336;                                          // shard label column
    const DX = 672;                                          // documents column
    const CHECK = 980;                                       // match ticks, one column
    const RX = 1010, RW = 160;                               // top-2 lists
    const TRUNK = 305, LANE = 14;                            // arrow bus
    const LW = 274;                                          // left column (x 16..290)
    const QX = 153;                                          // query path centre line
    const CARD = { y: 84, h: 60 };                           // cache card
    const BRK = { x: QX - 28, y: 168, w: 56, h: 64 }, BY = BRK.y + BRK.h / 2;
    const LY = 250;                                          // narration top
    const FY = 402, FH = 72, FC = FY + FH / 2;               // fresh index row
    const FOOT = 496.5;                                      // footer baseline (merge; the text has no descenders)

    const f1 = (n) => n.toFixed(1);
    const info = {};   // id -> { score, color, title, age }
    X.shards.forEach((s, si) => s.docs.forEach((d) => { if (d.match) info[d.id] = { score: d.score, color: si, title: d.title }; }));
    X.fresh.forEach((d) => { info[d.id] = { score: d.score, color: 3, title: d.title, age: d.age }; });
    const finalTop = Object.keys(info).sort((a, b) => info[b].score - info[a].score).slice(0, 3);
    const merged = step === MERGE;

    // ---- Per-step state --------------------------------------------------------
    const letterState = (l) => {
      if (step >= HEDGE) { if (l === X.slow) return 'slow'; if (l === X.backup) return 'active'; }
      if (step >= ROUTE && X.chosen.includes(l)) return 'active';
      return 'normal';
    };
    const answerer = (si) => (step >= HEDGE && si === 1 ? X.backup : X.chosen[si]);

    // One result row: colour swatch, id, optional tag, optional struck local score, score.
    function resultRow(x, y, w, h, r) {
      const p = P.pal(r.color), cy = y + h / 2, parts = [];
      parts.push(S.rect(x, y, w, h, { rx: 6, fill: '#FFFFFF', stroke: r.hl ? p.main : C.line, sw: r.hl ? 2 : 1.2 }));
      parts.push(S.rect(x + 8, cy - 5, 10, 10, { rx: 2, fill: p.main }));
      parts.push(S.text(x + 26, cy, r.id, { size: 17, fill: C.text, vc: true }));
      if (r.tag) parts.push(S.text(x + 58, cy, r.tag, { size: 16, fill: sh[3].ink, vc: true }));
      parts.push(S.text(x + w - 10, cy, r.score, { size: 17, weight: 'bold', fill: C.text2, anchor: 'end', vc: true }));
      if (r.local) {
        const sx = x + w - 10 - S.tw(r.score, 17, true);
        const ax2 = sx - 8, ax1 = ax2 - 20;
        parts.push(S.arrow(ax1, cy, ax2, cy, { color: C.muted, sw: 1.6, size: 8 }));
        const lx = ax1 - 8, lw = S.tw(r.local, 17);
        parts.push(S.text(lx, cy, r.local, { size: 17, fill: C.muted, anchor: 'end', vc: true }));
        parts.push(S.line(lx - lw - 3, cy + 1, lx + 3, cy - 1, { stroke: C.red, sw: 2 }));
      }
      return S.group(parts, { opacity: r.dim ? 0.4 : null });
    }

    // Narration block under the broker: the script's step number, a bold
    // title and up to two short lines. Same position on every step.
    function note(n, title, lines) {
      const parts = [
        P.numBadge(29, LY + 12, n, { r: 13, size: 16, fill: C.muted }),
        S.text(50, LY + 18, title, { size: 19, weight: 'bold', fill: C.text }),
      ];
      if (lines) parts.push(S.text(50, LY + 44, lines, { size: 18, fill: C.text2, lh: 24 }));
      return S.group(parts);
    }

    // ================= Left column: query path =================================
    const out = [];
    out.push(P.searchBox(16, 14, LW, { text: 'lamine yamal', h: 48, size: 20, focus: true }));

    // Cache card: tokens and status.
    out.push(S.group([
      S.rect(16, CARD.y, LW, CARD.h, { rx: 12, fill: '#FFFFFF', stroke: step === CACHE ? C.blue : C.line, sw: step === CACHE ? 2 : 1.5 }),
      S.text(30, CARD.y + 18, 'Cache', { size: 18, weight: 'bold', fill: C.text2, vc: true }),
      P.chip(30, CARD.y + 30, 'lamine', { h: 24, size: 17, padX: 11 }),
      P.chip(30 + P.chipWidth('lamine', { size: 17, padX: 11 }) + 8, CARD.y + 30, 'yamal', { h: 24, size: 17, padX: 11 }),
      step >= ROUTE ? P.badge(16 + LW - 14, CARD.y + 8, 'miss', { anchor: 'end', size: 16, bold: true, fill: '#FCE8E6', ink: C.red }) : null,
    ], { opacity: step === SETUP ? 0.35 : null }));
    if (step >= CACHE) out.push(S.arrow(QX, 64, QX, CARD.y - 2, { color: C.muted, sw: 2, size: 10 }));
    if (step >= ROUTE) out.push(S.arrow(QX, CARD.y + CARD.h + 2, QX, BRK.y - 2, { color: C.muted, sw: 2, size: 10 }));

    // Broker.
    out.push(P.machine(BRK.x, BRK.y, { w: BRK.w, h: BRK.h, color: 'grey' }));
    out.push(S.text(BRK.x - 12, BY, 'Broker', { size: 20, weight: 'bold', fill: C.text2, anchor: 'end', vc: true }));

    // ================= Cluster: three shard rows ===============================
    X.shards.forEach((shard, si) => {
      const T0 = TOPS[si], p = sh[si];
      out.push(S.rect(PX, T0, PW, PH, { rx: 14, fill: p.soft }));
      // Name top-aligned with the machines, leaving room for the trap chip below.
      out.push(S.text(LX, T0 + 56, shard.name, { size: 20, weight: 'bold', fill: p.ink }));
      out.push(S.text(LX, T0 + 79, shard.kind, { size: 17, fill: C.muted }));

      // The merging trap: how common 'yamal' is on this shard (trap step only).
      if (step === TRAP) {
        const segs = [{ t: 'yamal in ' }, { t: shard.share, weight: 'bold' }];
        const w = S.tw('yamal in ', 16) + S.tw(shard.share, 16, true) + 12;
        out.push(S.rect(LX - 6, T0 + 89, w, 22, { rx: 11, fill: '#FFFFFF', stroke: p.mid, sw: 1.2 }));
        out.push(S.text(LX, T0 + 100, [segs], { size: 16, fill: p.ink, vc: true }));
      }

      // Replicas with their queues.
      shard.machines.forEach((l, ci) => {
        const state = letterState(l);
        out.push(P.machine(MX[ci], T0 + MY, { w: MW, h: MH, color: si, label: l, labelSize: 18, state }));
        out.push(P.queue(MX[ci] + (MW - 49) / 2, T0 + MY + MH + 8, shard.load[ci], { max: 4, s: 10, gap: 3, color: si }));
      });
      if (step === SETUP) out.push(P.bracket(MX[0], MX[2] + MW, T0 + 36, { up: true, label: '3 replicas', size: 16 }));

      // Documents of the shard.
      shard.docs.forEach((d, k) => {
        const cy = T0 + 24 + k * 36;
        const dim = step >= LOCAL && !d.match;
        const fetched = merged && finalTop.includes(d.id);
        const parts = [
          P.doc(DX, cy - 13, { w: 20, h: 26, color: si, state: fetched ? 'hl' : null }),
          S.text(DX + 30, cy, d.id, { size: 17, weight: 'bold', fill: p.ink, vc: true }),
          S.text(DX + 62, cy, d.title, { size: 16, fill: C.text2, vc: true }),
        ];
        if (step >= LOCAL && d.match) parts.push(P.checkBadge(CHECK, cy, 9));
        out.push(S.group(parts, { opacity: dim ? 0.35 : null }));
        // Shard 3 holds mostly unrelated posts (shown from the trap on).
        if (d.more && step >= TRAP) {
          out.push(S.text(DX + 62 + S.tw(d.title, 16) + 6, cy, d.more, { size: 16, fill: p.ink, vc: true }));
        }
      });

      // Top-2 list returned by the answering replica (from `local` on).
      if (step >= LOCAL) {
        const ly = T0 + 14;
        if (si === 1 && step < HEDGE) {
          // Shard 2 is still waiting for E (it turns out to be slow).
          out.push(S.text(RX, ly + 17, [[{ t: 'Waiting for ' }, { t: X.chosen[1], fill: p.ink }, { t: '…' }]],
            { size: 17, weight: 'bold', fill: C.muted }));
          [0, 1].forEach((k) => out.push(S.rect(RX, ly + 27 + k * 34, RW, 28,
            { rx: 6, fill: '#FFFFFF', fo: 0.55, stroke: p.mid, sw: 1.2, dash: '5 4' })));
        } else {
          out.push(S.text(RX, ly + 17, [[{ t: 'Top 2 from ' }, { t: answerer(si), fill: p.ink }]],
            { size: 17, weight: 'bold', fill: C.text2 }));
          shard.docs.filter((d) => d.match).forEach((d, k) => {
            const corrected = d.local !== undefined && step >= TRAP;
            const shown = d.local !== undefined && step < TRAP ? d.local : d.score;
            out.push(resultRow(RX, ly + 27 + k * 34, RW, 28, {
              id: d.id, color: si, score: f1(shown), local: corrected ? f1(d.local) : null,
              hl: merged && finalTop.includes(d.id), dim: merged && !finalTop.includes(d.id),
            }));
          });
        }
        if (si === 2 && step === TRAP) out.push(P.warnBadge(RX + RW - 12, T0 + 22, 12));
      }
    });

    // ================= Arrows from the broker ==================================
    const sx = BRK.x + BRK.w + 8;
    const route = (si, ci, o) => {
      const T0 = TOPS[si], x = MX[ci] + MW / 2;
      return S.elbow([[sx, BY], [TRUNK, BY], [TRUNK, T0 + LANE], [x, T0 + LANE], [x, T0 + MY - 7]], o);
    };
    const light = { color: sh[0].mid, sw: 2 };
    const strong = { color: C.blue, sw: 2.5 };
    const stalled = { color: C.faint, sw: 2, dash: '7 5' };
    if (step === ROUTE) {
      out.push(route(0, 0, strong), route(1, 1, strong), route(2, 2, strong));
    } else if (step >= LOCAL) {
      out.push(route(0, 0, light), route(2, 2, light));
      if (step < HEDGE) out.push(route(1, 1, light));
      else out.push(route(1, 1, stalled), route(1, 0, step === HEDGE ? strong : light));   // E stalls, D is the hedge
      // The fresh index, drawn last so its new (strong) path shows over the shared trunk.
      if (step >= FRESH) out.push(S.elbow([[sx, BY], [TRUNK, BY], [TRUNK, FC], [332, FC]], step === FRESH ? strong : light));
    }

    // ================= Fresh index row (from `fresh` on) =======================
    if (step >= FRESH) {
      const p = sh[3];
      out.push(S.rect(PX, FY, PW, FH, { rx: 14, fill: p.soft }));
      out.push(P.machine(340, FC - 22, { w: 42, h: 44, color: 3 }));
      out.push(S.text(398, FC - 3, 'Fresh index', { size: 20, weight: 'bold', fill: p.ink }));
      out.push(S.text(398, FC + 20, 'updated continuously', { size: 17, fill: C.muted }));
      X.fresh.forEach((d, k) => {
        const cy = FC - 18 + k * 36;
        out.push(P.doc(588, cy - 13, { w: 20, h: 26, color: 3, state: merged ? 'hl' : null }));
        out.push(S.text(618, cy, d.id, { size: 17, weight: 'bold', fill: p.ink, vc: true }));
        out.push(S.text(650, cy, d.title, { size: 16, fill: C.text2, vc: true }));
        out.push(P.badge(862, cy - 12, d.age, { color: 3, size: 16, h: 24, fill: '#FFFFFF', stroke: p.mid }));
        out.push(resultRow(RX, cy - 14, RW, 28, { id: d.id, color: 3, score: f1(d.score), hl: merged }));
      });
    }

    // ================= The merging trap, under shard 3 (trap only) =============
    if (step === TRAP) {
      out.push(P.warnBadge(LX + 12, 425, 12));
      out.push(S.text(LX + 32, 431, 'The merging trap', { size: 19, weight: 'bold', fill: C.text }));
      out.push(S.text(LX + 32, 457, [
        '‘yamal’ is rare among shard 3’s posts, so its local IDF inflates the scores.',
        'Global statistics fix it, and shards 1–2 change only slightly.',
      ], { size: 18, fill: C.text2, lh: 24 }));
    }

    // ================= Left column, lower part: narration per step =============
    if (step === SETUP) {
      out.push(P.machine(22, LY + 4, { w: 28, h: 32, color: 'grey' }));
      out.push(S.text(64, LY + 20, 'machine', { size: 18, fill: C.text2, vc: true }));
      out.push(P.doc(26, LY + 46, { w: 20, h: 26, color: 'grey' }));
      out.push(S.text(64, LY + 59, 'document', { size: 18, fill: C.text2, vc: true }));
      out.push(P.queue(22, LY + 93, 3, { max: 4, s: 10, gap: 3, color: 'grey' }));
      out.push(S.text(82, LY + 98, 'waiting requests', { size: 18, fill: C.text2, vc: true }));
    }
    if (step === CACHE) out.push(note(0, 'Cache first', ['lowercase, split into tokens', 'a hit skips the cluster']));
    if (step === ROUTE) out.push(note(1, 'Least expected wait', ['(queue + 1) × service time,', `lowest in each shard: ${X.chosen.join(', ')}`]));
    if (step === LOCAL || step === TRAP) out.push(note(2, 'Local search', ['look up both terms, intersect,', 'score, send back the top 2']));
    if (step === HEDGE) out.push(note(3, 'Hedged request', [`${X.slow} is slow: same request to ${X.backup},`, 'first answer wins']));
    if (step === FRESH) out.push(note(4, 'Freshness', ['recent posts, queried in', `parallel with ${X.chosen[0]}, ${X.backup} and ${X.chosen[2]}`]));
    if (merged) {
      out.push(note(5, 'Merge, then fetch'));
      finalTop.forEach((id, k) => {
        out.push(resultRow(16, LY + 30 + k * 26, LW, 22, { id, color: info[id].color, score: f1(info[id].score), tag: info[id].age }));
      });
      out.push(S.line(16, LY + 114, 16 + LW, LY + 114, { stroke: C.lineSoft, sw: 1.5 }));
      // Phase two: titles and snippets for the 3 winners only.
      out.push(S.text(16, LY + 134, 'Phase 2: titles and snippets', { size: 16, fill: C.muted }));
      finalTop.forEach((id, k) => {
        const cy = LY + 152 + k * 21, p = sh[info[id].color];
        out.push(S.circle(24, cy, 7, { fill: p.soft, stroke: p.main, sw: 1.5 }));
        out.push(S.text(40, cy, info[id].title, { size: 17, fill: C.link, vc: true }));
      });
      // Closing line of the example.
      out.push(S.text(PX, FOOT, [[{ t: 'A few tens of milliseconds', weight: 'bold', fill: C.text },
        ', 9 shard machines plus 1 fresh index, one of them slow']], { size: 17, fill: C.text2 }));
    }
    out.push(P.illustrative(16, 471, { label: 'toy example, invented scores' }));   // fixed, free in every step
    return out;
  },
});
