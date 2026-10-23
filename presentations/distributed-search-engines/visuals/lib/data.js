/* Shared toy data, so the same inverted index appears in section 1 and is cut
 * in section 2a, and the worked example uses one consistent set of documents.
 * Everything here is invented for illustration. */
(function (g) {
  'use strict';
  const VIS = (g.VIS = g.VIS || {});

  // Generic index for sections 1 and 2 (no Lamine Yamal before section 3).
  // 8 terms x 9 documents. Term ranges for term partitioning: A-F, G-P, Q-Z.
  const terms = ['cloud', 'data', 'index', 'music', 'news', 'query', 'search', 'web'];
  const postings = {
    cloud: [2, 5, 8],
    data: [1, 3, 4, 6, 7, 9],
    index: [3, 6, 9],
    music: [2, 4],
    news: [1, 4, 5, 8],
    query: [3, 7],
    search: [3, 5, 7, 8],
    web: [1, 2, 3, 4, 6, 7, 8, 9],
  };
  const termBand = { cloud: 0, data: 0, index: 1, music: 1, news: 1, query: 2, search: 2, web: 2 };
  const termBandLabel = ['A–F', 'G–P', 'Q–Z'];
  const docShard = (d) => Math.floor((d - 1) / 3); // docs 1-3, 4-6, 7-9
  // Generic query: "data search" -> data ∩ search = {3, 7}, ranked 7 then 3.
  const query = ['data', 'search'];
  const result = [{ doc: 7, score: 2.1 }, { doc: 3, score: 1.4 }];

  VIS.data = { terms, postings, termBand, termBandLabel, docShard, query, result };

  // ---- Worked example (section 3): 3 shards x 3 replicas, 9 documents -------
  // Machines A-I. Shard 1 = A,B,C (sports news, older), shard 2 = D,E,F
  // (encyclopedic), shard 3 = G,H,I (social media). Scores are invented.
  VIS.data.example = {
    shards: [
      { name: 'Shard 1', kind: 'sports news', machines: ['A', 'B', 'C'], load: [1, 3, 2],
        docs: [
          { id: 'N1', title: 'Yamal named best young player', match: true, score: 8.1 },
          { id: 'N2', title: 'Barça squad list announced', match: true, score: 7.4 },
          { id: 'N3', title: 'Weekend fixtures preview', match: false },
        ] },
      { name: 'Shard 2', kind: 'encyclopedic', machines: ['D', 'E', 'F'], load: [2, 1, 3],
        docs: [
          { id: 'E1', title: 'Lamine Yamal – biography', match: true, score: 9.0 },
          { id: 'E2', title: 'FC Barcelona – current squad', match: true, score: 3.2 },
          { id: 'E3', title: 'History of European football', match: false },
        ] },
      { name: 'Shard 3', kind: 'social media', machines: ['G', 'H', 'I'], load: [3, 2, 1],
        docs: [
          // localScore uses shard-local IDF ("yamal" is rare on this shard),
          // score uses global IDF.
          { id: 'S1', title: '#LamineYamal skills compilation', match: true, localScore: 9.6, score: 6.0 },
          { id: 'S2', title: 'Fan thread: is Yamal the best?', match: true, localScore: 4.1, score: 2.5 },
          { id: 'S3', title: 'Cat video of the day', match: false },
        ] },
    ],
    chosen: ['A', 'E', 'I'], // least busy replica of each shard
    hedge: { slow: 'E', backup: 'D' },
    // Fresh index (small, updated continuously) for content since the match.
    fresh: [
      { id: 'F1', title: 'Match report: last night', score: 9.3, age: '3 hours ago' },
      { id: 'F2', title: 'Player ratings from last night', score: 8.7, age: '5 hours ago' },
    ],
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
