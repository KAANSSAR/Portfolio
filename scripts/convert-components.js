// One-off conversion script: transforms design-tool jsx files (which relied on
// global `window.React`, `window.ComponentName = ...` exports, and relative
// asset paths) into normal Next.js client components. Not part of the app runtime.
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'components', 'ui');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const name = path.basename(file, '.jsx');
  const full = path.join(dir, file);
  let src = fs.readFileSync(full, 'utf8');

  // Strip the `const { useX, useY } = React;` destructure lines (we import directly).
  src = src.replace(/^const\s*\{\s*[^}]*\}\s*=\s*React;\s*$/gm, '');

  // Strip window.X = X; and module.exports lines added for the design-tool runtime.
  src = src.replace(/^window\.\w+\s*=\s*\w+;\s*$/gm, '');
  src = src.replace(/^if \(typeof module.*module\.exports.*$/gm, '');

  // Fix relative asset paths (./foo.png -> /images/foo.png) left over from the design tool.
  src = src.replace(/(['"])\.\/([\w.-]+\.(?:png|jpg|jpeg|mp4|mp3|json))\1/g, (m, q, fname) => `${q}/images/${fname}${q}`);

  // three.js: add a namespace import where THREE. is referenced as a global.
  const usesThree = /\bTHREE\./.test(src);

  const header = [
    "'use client';",
    '',
    "import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';",
    usesThree ? "import * as THREE from 'three';" : null,
  ].filter(Boolean).join('\n');

  src = src.trim() + `\n\nexport default ${name};\n`;
  src = header + '\n\n' + src;

  const outFile = path.join(dir, name + '.jsx');
  fs.writeFileSync(outFile, src);
  console.log('converted', name);
}
