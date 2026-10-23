#!/usr/bin/env node
/* Export the figures.
 *
 *   node visuals/export.js              every figure
 *   node visuals/export.js tail sizing  only these scenes
 *   node visuals/export.js --no-png     SVG only
 *
 * Writes, for every step of every scene:
 *   export/svg/<id>-<n>.svg
 *   export/png/<id>-<n>.png          3x, white background
 *   export/pages/p<NN>_<id>-<n>.png  same PNG, named by deck page
 *
 * Google Slides cannot show SVG, so the PNG is what goes into the deck:
 * select the figure on that page > Replace image > Upload from computer.
 * PNGs are rendered with rsvg-convert (brew install librsvg), using the
 * Google Sans file in fonts/ without installing it. */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = __dirname;
// Same load order as index.html.
for (const f of ['lib/theme.js', 'lib/svg.js', 'lib/parts.js', 'lib/scene.js', 'lib/data.js', 'lib/indexgrid.js', 'scenes/manifest.js']) {
  require(path.join(ROOT, f));
}
const VIS = globalThis.VIS;

const args = process.argv.slice(2);
const noPng = args.includes('--no-png');
const only = args.filter((a) => !a.startsWith('--'));

const ids = VIS.manifest.filter((m) => typeof m === 'string');
for (const id of ids) {
  const p = path.join(ROOT, 'scenes', id + '.js');
  if (!fs.existsSync(p)) continue;
  try { require(p); } catch (e) { console.error(`! ${id}: ${e.stack}`); process.exitCode = 1; }
}
const pages = VIS.pages();
// `node visuals/export.js --list-pages` prints the page -> figure map as JSON
// (used by place_figures.py) and exports nothing.
if (args.includes('--list-pages')) {
  process.stdout.write(JSON.stringify(pages.map((p) => ({ page: p.page, key: p.key || null, text: p.text || null }))));
  process.exit(0);
}
const wanted = only.length ? only : ids.filter((id) => VIS.sceneById[id]);

const dirs = { svg: path.join(ROOT, 'export', 'svg'), png: path.join(ROOT, 'export', 'png'), pages: path.join(ROOT, 'export', 'pages') };
for (const d of Object.values(dirs)) fs.mkdirSync(d, { recursive: true });

const RSVG_ENV = Object.assign({}, process.env, { FONTCONFIG_FILE: path.join(ROOT, 'fonts', 'fonts.conf') });
let png = !noPng;
if (png) { try { execFileSync('rsvg-convert', ['--version'], { stdio: 'ignore' }); } catch { png = false; console.warn('! rsvg-convert not found, SVG only'); } }

for (const id of wanted) {
  const sc = VIS.sceneById[id];
  if (!sc) { console.warn(`! no scene "${id}"`); continue; }
  // Remove files left over from a version with more steps.
  for (const d of [dirs.svg, dirs.png]) {
    for (const f of fs.readdirSync(d)) {
      const m = f.match(/^(.*)-(\d+)\.(svg|png)$/);
      if (m && m[1] === id && Number(m[2]) > sc.steps.length) fs.unlinkSync(path.join(d, f));
    }
  }
  sc.steps.forEach((name, i) => {
    const key = sc.key(i);
    let svg;
    try { svg = sc.svg(i); } catch (e) { console.error(`! ${key}: ${e.stack}`); process.exitCode = 1; return; }
    const svgPath = path.join(dirs.svg, key + '.svg');
    fs.writeFileSync(svgPath, svg);
    if (!png) return;
    const pngPath = path.join(dirs.png, key + '.png');
    try {
      execFileSync('rsvg-convert', ['-w', String(sc.w * 3), '-b', 'white', svgPath, '-o', pngPath], { env: RSVG_ENV });
    } catch (e) { console.error(`! ${key}: rsvg-convert failed (malformed SVG?)\n${e.stderr || e}`); process.exitCode = 1; return; }
    const pg = pages.find((p) => p.key === key);
    if (pg) {
      const prefix = `p${String(pg.page).padStart(2, '0')}_`;
      for (const f of fs.readdirSync(dirs.pages)) if (f.startsWith(prefix) || f.endsWith(`_${key}.png`)) fs.unlinkSync(path.join(dirs.pages, f));
      fs.copyFileSync(pngPath, path.join(dirs.pages, `${prefix}${key}.png`));
    }
  });
  const pg = pages.filter((p) => p.id === id).map((p) => p.page);
  console.log(`✓ ${id}  (${sc.steps.length} step${sc.steps.length > 1 ? 's' : ''}, page${pg.length > 1 ? 's' : ''} ${pg[0]}${pg.length > 1 ? '–' + pg[pg.length - 1] : ''})`);
}
