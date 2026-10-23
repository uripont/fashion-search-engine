/* The deck, page by page. A string is a scene (scenes/<id>.js) and takes one
 * page per step; an object is a page with no figure (text only, edited in the
 * deck). Keep this in the same order as the slides, so page numbers here match
 * the page numbers in the deck. */
(function (g) {
  'use strict';
  const VIS = (g.VIS = g.VIS || {});
  VIS.manifest = [
    { text: 'Title' },
    { text: 'Agenda' },
    // 1. Problem (Marc)
    'scenario',         // the query, the afternoon after the match
    'inverted-index',   // one machine: the index, then a query
    'three-breaks',     // capacity, speed, availability
    'scaling',          // vertical vs horizontal
    'growth',           // 1998 -> 2003 -> 2016 (15 s)
    'two-tools',        // unreliable machines; sharding and replication
    // 2a. Partitioning (Marc)
    'partition',        // the same index, cut by term or by document
    'partition-verdict',
    // 2b-2e. Replication, routing, merging, tail (Èric)
    'replication',
    'sizing',
    'scatter-gather',
    'replica-choice',
    'two-phase',
    'which-shards',
    'idf-trap',
    'tail',
    'hedge',
    'selective',
    // 3. Worked example (Oriol)
    'cluster',
    // 4. Trends and limits (Oriol)
    'trend-content',
    'trend-consumer',
    'trend-same',
    'limits',
    // 5. Sources and disclosure (Oriol). The discussion page was removed on the team's request.
    { text: 'Sources' },
    { text: 'How we used LLMs' },
  ];

  // Expand the manifest into pages, once the scene files are loaded. A scene
  // that is not written yet still takes `plannedSteps` pages (see below) so
  // the numbering does not shift while scenes are being added.
  VIS.pages = function () {
    const out = [];
    for (const m of VIS.manifest) {
      if (typeof m !== 'string') { out.push({ page: out.length + 1, text: m.text }); continue; }
      const sc = VIS.sceneById && VIS.sceneById[m];
      const n = sc ? sc.steps.length : (VIS.plannedSteps[m] || 1);
      for (let i = 0; i < n; i++) {
        out.push({ page: out.length + 1, id: m, step: i, key: `${m}-${i + 1}`, missing: !sc });
      }
    }
    return out;
  };

  // Planned number of steps per scene (used only while a scene is missing).
  VIS.plannedSteps = {
    scenario: 1, 'inverted-index': 2, 'three-breaks': 3, scaling: 2, growth: 3, 'two-tools': 3,
    partition: 5, 'partition-verdict': 1, replication: 3, sizing: 2, 'scatter-gather': 4,
    'replica-choice': 2, 'two-phase': 2, 'which-shards': 2, 'idf-trap': 2, tail: 2, hedge: 2,
    selective: 2, cluster: 7, 'trend-content': 1, 'trend-consumer': 2, 'trend-same': 1, limits: 1,
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
