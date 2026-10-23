/* Scene registry. A scene is one visual with one or more steps; every step
 * becomes one SVG and one slide (the PDF has no animations, so "clicking to
 * the next slide" is what moves things). Keep unchanged elements at the same
 * coordinates across steps so the jump reads as a transition.
 *
 *   VIS.scene({
 *     id: 'replication',             // file name: scenes/replication.js
 *     section: 'principles',         // problem | principles | example | trends | discussion
 *     title: 'Replication: two jobs',// label in the viewer only (slide titles live in the deck)
 *     layout: 'full',                // 'full' (1200x500) or 'right' (800x500)
 *     steps: ['copies', 'availability', 'throughput'],
 *     render(step, ctx) { return [ ...svg strings ] },  // step is 0-based
 *   });
 *
 * Exported files are named <id>-<n>.svg with n starting at 1. */
(function (g) {
  'use strict';
  const VIS = (g.VIS = g.VIS || {});
  VIS.scenes = VIS.scenes || [];
  VIS.sceneById = VIS.sceneById || {};

  VIS.SECTIONS = [
    { key: 'problem', label: 'Problem' },
    { key: 'principles', label: 'Principles' },
    { key: 'example', label: 'Example' },
    { key: 'trends', label: 'Trends' },
    { key: 'discussion', label: 'Discussion' },
  ];

  VIS.scene = function (def) {
    if (!def.id || !def.render) throw new Error('scene needs id and render');
    const size = VIS.theme.layouts[def.layout || 'full'];
    if (!size) throw new Error(`scene ${def.id}: unknown layout ${def.layout}`);
    const steps = def.steps && def.steps.length ? def.steps : ['main'];
    const scene = Object.assign({}, def, { layout: def.layout || 'full', steps, w: size.w, h: size.h });
    scene.svg = function (i) {
      const ctx = { w: size.w, h: size.h, step: i, steps, name: steps[i], S: VIS.svg, P: VIS.parts, T: VIS.theme, C: VIS.theme.c };
      return VIS.svg.svgDoc(size.w, size.h, def.render(i, ctx));
    };
    scene.key = (i) => `${def.id}-${i + 1}`;
    if (VIS.sceneById[def.id]) VIS.scenes = VIS.scenes.filter((s) => s.id !== def.id);
    VIS.sceneById[def.id] = scene;
    VIS.scenes.push(scene);
    return scene;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
