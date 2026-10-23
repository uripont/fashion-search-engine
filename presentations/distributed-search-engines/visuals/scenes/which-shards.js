/* Principles: which shards are asked. Generic.
 * Step 1: the default, every shard. Step 2: selective search, only a few
 * (shards 3 and 6). One row of eight shards; the broker reaches them over one
 * bus above the row, the same routing as scatter-gather. Positions are
 * identical in both steps. */
VIS.scene({
  id: 'which-shards',
  section: 'principles',
  title: 'Which shards are asked',
  layout: 'full',
  steps: ['all', 'some'],
  render(step, { S, P, C, T }) {
    const out = [];
    const sh = T.shard;
    const some = step === 1;

    // Geometry shared by both steps.
    const n = 8;
    const shardW = 100, shardH = 96, pitch = 120, x0 = 226;
    const shardY = 180, busY = 126;
    const sx = (i) => x0 + i * pitch;
    const brokerX = 40, brokerW = 110, brokerH = 96;
    const asked = [2, 5];                   // Shard 3 and Shard 6 in step 2

    out.push(P.stepper(16, 26, ['Which replica?', 'What travels back?', 'Which shards?'], 2, { size: 17 }));
    out.push(P.machine(brokerX, shardY, { w: brokerW, h: brokerH, color: 'grey', sub: 'Broker', subSize: 20 }));

    // Shards in one row, colours in Google order, label under each machine
    // on the same baseline as "Broker".
    for (let i = 0; i < n; i++) {
      const on = !some || asked.includes(i);
      const p = sh[i % 4];
      out.push(S.group([
        P.machine(sx(i), shardY, { w: shardW, h: shardH, color: i % 4 }),
        S.text(sx(i) + shardW / 2, shardY + shardH + 20, `Shard ${i + 1}`, { size: 19, weight: 'bold', fill: p.ink, anchor: 'middle' }),
      ], { opacity: on ? 1 : 0.3 }));
    }

    // Arrows: up from the broker, along the bus, down into each asked shard.
    const targets = some ? asked : Array.from({ length: n }, (_, i) => i);
    const col = some ? C.text2 : C.muted;
    const sw = some ? 2.5 : 2;
    const trunk = [brokerX + brokerW / 2, shardY - 4];
    targets.forEach((i) => {
      const cx = sx(i) + shardW / 2;
      out.push(S.elbow([trunk, [trunk[0], busY], [cx, busY], [cx, shardY - 8]], { color: col, sw }));
    });

    // Caption under the row.
    const caption = some ? 'Selective search: ask only some, here 2 of 8' : 'Default: ask every shard, 8 of 8';
    out.push(S.text(brokerX, 366, caption, { size: 22, weight: 'bold', fill: C.text2 }));

    // Principle behind all three decisions, on the last step.
    if (some) {
      out.push(P.card(16, 424, 1168, 52, { fill: C.bgSoft, stroke: null, rx: 12 }));
      out.push(S.text(600, 450, 'Heavy work where the data lives, only small results travel', {
        size: 21, fill: C.text2, anchor: 'middle', vc: true,
      }));
    }

    return out;
  },
});
