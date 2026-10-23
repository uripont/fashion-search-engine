# Figures

A slideshow of every figure in the deck, page by page, with the same page numbers as the deck.

- **View**: open `index.html` in a browser. Use ← → to move; the page number in the URL (`index.html#12`) matches the deck.
- **Edit**: each figure is `scenes/<id>.js`; its steps are consecutive pages. Reload the page to see a change.
- **Export**: `node visuals/export.js` (or `node visuals/export.js tail` for one figure). It writes
  - `export/png/<id>-<n>.png`: what goes into the deck (Google Slides cannot show SVG),
  - `export/pages/p<NN>_<id>-<n>.png`: the same files named by page,
  - `export/svg/<id>-<n>.svg`: vector version.
- **Into the deck**: in Google Slides, right-click the figure > Replace image > upload `export/pages/p<NN>_….png`. It keeps the position and size.

Needs Node.js, and `rsvg-convert` for PNGs (`brew install librsvg`). The font is Google Sans (`fonts/`, open licence).
