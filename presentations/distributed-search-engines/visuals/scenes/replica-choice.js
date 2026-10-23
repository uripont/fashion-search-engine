/* Principles: which replica of a shard answers. Generic, no football.
 * Illustrative numbers: queues 4, 1, 2 and recent service times 5, 8, 5 ms.
 * Step 1: round-robin / random ignores the load and lands on the busy replica.
 * Step 2: least expected wait, (queue + 1) x recent service time: 25, 16 and
 * 15 ms, so replica 3 wins although replica 2 has the shortest queue.
 * The new query is drawn as an extra box at the end of the queue it joins.
 * The stepper at the top is shared with two-phase and which-shards: keep the
 * call identical in all three. */
VIS.scene({
  id: 'replica-choice',
  section: 'principles',
  title: 'Which replica answers',
  layout: 'full',
  steps: ['round-robin', 'least-wait'],
  render(step, { S, P, C, T }) {
    const sh = T.shard;
    const out = [];
    const smart = step === 1;

    // Geometry (shared by both steps so nothing jumps).
    const rows = [190, 290, 390];        // replica centre lines
    const queues = [4, 1, 2];            // waiting requests, out of 5
    const service = [5, 8, 5];           // recent service time, ms per request
    const waitMs = queues.map((q, r) => (q + 1) * service[r]); // 25, 16, 15
    const brokerX = 70, brokerW = 110, brokerH = 84;
    const brokerY = 290 - brokerH / 2;   // centred on the middle replica
    const cardX = 580, cardY = 80, cardW = 604, cardH = 380;
    const mX = 612, mW = 64, mH = 72;    // replica machines
    const labelX = mX + mW + 24;         // replica label and queue column
    const qs = 16, qgap = 4;             // queue box size and gap
    const svcX = 820;                    // service time column
    const waitX = 985;                   // expected wait column (step 2)
    const headY = 154;                   // column headers
    const target = smart ? 2 : 0;        // the replica this step's query joins
    const argColor = smart ? C.green : C.text2;

    out.push(P.stepper(16, 26, ['Which replica?', 'What travels back?', 'Which shards?'], 0, { size: 17 }));
    out.push(P.illustrative(1184, 14, { anchor: 'end' }));

    out.push(P.machine(brokerX, brokerY, { w: brokerW, h: brokerH, color: 'grey', sub: 'Broker', subSize: 20 }));

    // One shard, drawn as a blue panel holding its three replicas.
    out.push(S.rect(cardX, cardY, cardW, cardH, { rx: 14, fill: sh[0].soft }));
    out.push(S.text(cardX + 24, cardY + 36, 'Shard 1: three replicas', { size: 20, weight: 'bold', fill: sh[0].ink }));
    out.push(S.text(svcX, headY, 'recent service time', { size: 16, fill: C.muted }));
    if (smart) out.push(S.text(waitX, headY, 'expected wait', { size: 16, weight: 'bold', fill: C.muted }));

    rows.forEach((yc, r) => {
      // Replica 1 is always the busy one. In step 2 replica 3 is the chosen one.
      const chosen = smart && r === target;
      const state = r === 0 ? 'slow' : chosen ? 'active' : 'normal';
      out.push(P.machine(mX, yc - mH / 2, { w: mW, h: mH, color: 0, state }));
      if (chosen) out.push(P.checkBadge(mX + mW - 2, yc - mH / 2 + 2, 11));
      out.push(S.text(labelX, yc - 4, `replica ${r + 1}`, { size: 20, weight: 'bold', fill: C.text2 }));
      out.push(P.queue(labelX, yc + 8, queues[r], { s: qs, gap: qgap, color: 0 }));
      out.push(S.text(svcX, yc + 16, `${service[r]} ms`, { size: 20, weight: 'bold', fill: C.text2, vc: true }));
      if (smart) {
        // Plain string first: rsvg drops a space at the end of a <tspan>.
        out.push(S.text(waitX, yc + 16, [[
          `(${queues[r]} + 1) × ${service[r]} = `,
          { t: `${waitMs[r]} ms`, weight: 'bold', fill: chosen ? C.green : C.text },
        ]], { size: 19, fill: chosen ? C.green : C.text2, vc: true }));
      }
    });

    // The new query joins the end of the target replica's queue.
    const ty = rows[target];
    const slotX = labelX + queues[target] * (qs + qgap);
    out.push(S.rect(slotX, ty + 8, qs, qs, { rx: 2, fill: argColor }));
    if (!smart) {
      out.push(S.text(900, ty + 16, `waits behind ${queues[target]} requests`, {
        size: 19, fill: C.text2, weight: 'bold', vc: true,
      }));
    }

    // The broker's choice: an arrow and its policy.
    const startX = brokerX + brokerW + 8;
    out.push(S.arrow(startX, 290, mX - 8, rows[target], { color: argColor, sw: 2.5 }));
    if (!smart) {
      out.push(S.text(330, 200, [[{ t: 'round-robin or random', weight: 'bold', fill: C.text }], 'ignores the load'], {
        size: 19, fill: C.text2, anchor: 'middle', lh: 26,
      }));
    } else {
      out.push(S.text(370, 186, [[{ t: 'least expected wait', weight: 'bold', fill: C.green }], '(queue + 1) × recent service time'], {
        size: 19, fill: C.text2, anchor: 'middle', lh: 26,
      }));
      out.push(S.text(370, 256, 'shortest queue ≠ fastest answer', { size: 20, weight: 'bold', fill: C.text, anchor: 'middle' }));
    }

    out.push(P.source(16, 484, 'Simplified from C3 (Suresh et al. 2015), which Elasticsearch’s adaptive replica selection implements', { size: 16 }));
    return out;
  },
});
