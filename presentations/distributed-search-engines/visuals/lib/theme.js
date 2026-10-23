/* Design tokens for every visual. Google-search inspired: white, thin lines,
 * the four Google colours as the shard colours, Google Sans text (open source
 * since 2025, file in fonts/, also available in Google Slides). */
(function (g) {
  'use strict';
  const VIS = (g.VIS = g.VIS || {});

  const c = {
    text: '#202124',     // primary text
    text2: '#3C4043',    // secondary text
    muted: '#5F6368',    // labels, arrows
    faint: '#9AA0A6',    // icons, disabled
    line: '#DADCE0',     // borders
    lineSoft: '#E8EAED', // dividers, grid
    bg: '#FFFFFF',
    bgSoft: '#F8F9FA',   // panels
    bgGrey: '#F1F3F4',   // chips
    link: '#1A0DAB',     // result titles
    snippet: '#4D5156',  // result snippets
    blue: '#1A73E8',     // accent / active
    red: '#D93025',      // error / down
    yellow: '#F9AB00',   // warning / slow
    green: '#188038',    // ok / chosen
  };

  // Shard palette, in Google logo order. `main` for fills/strokes, `ink` for
  // text on white, `soft` for backgrounds, `mid` for chips and highlights.
  const shard = [
    { name: 'blue',   main: '#4285F4', ink: '#1967D2', soft: '#E8F0FE', mid: '#AECBFA' },
    { name: 'red',    main: '#EA4335', ink: '#C5221F', soft: '#FCE8E6', mid: '#F6AEA9' },
    { name: 'yellow', main: '#FBBC04', ink: '#B06000', soft: '#FEF7E0', mid: '#FDE293' },
    { name: 'green',  main: '#34A853', ink: '#137333', soft: '#E6F4EA', mid: '#A8DAB5' },
  ];
  // Neutral "colour" for brokers, users and things that are not a shard.
  const neutral = { name: 'grey', main: '#5F6368', ink: '#3C4043', soft: '#F1F3F4', mid: '#DADCE0' };

  VIS.theme = {
    font: "'Google Sans', Arial, sans-serif",
    c,
    shard,
    neutral,
    // Visual sizes in SVG units. 1 unit is about 0.74 pt once placed on the
    // slide, so 20 units is about 15 pt. Never go below 16 units.
    layouts: {
      full: { w: 1200, h: 500 },  // placed 12.33 in wide under the title bar
      right: { w: 800, h: 500 },  // placed 8.0 in wide, text column on the left
    },
    fs: { xxl: 56, xl: 40, lg: 30, md: 24, sm: 20, xs: 17 },
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
