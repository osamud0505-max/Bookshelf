/* Scenes: full-room backdrops for the cozy looks (old library, cabin, loft, candlelit, tea house, cottage).
   Each room is one generated SVG picture behind everything, plus a few moving pieces (fire, candle flames,
   lanterns, curtains) that live in the backdrop layer, so nothing here can ever sit on top of text. */
(() => {
  "use strict";
  const D = window.Decor;
  if (!D) return;
  // big pictures go in as blob links (short, fast); made once and reused
  const cache = {};
  const pic = (key, make) => () => {
    if (!cache[key]) {
      const svg = make();
      try { cache[key] = `url('${URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }))}')`; }
      catch (e) { cache[key] = `url('data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29")}')`; }
    }
    return cache[key];
  };
  const rng = (seed) => () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const f1 = (n) => Math.round(n * 10) / 10;
  const SVG = (body, defs = "", align = "xMidYMid") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 860" preserveAspectRatio="${align} slice"><defs>${defs}</defs>${body}</svg>`;

  // ------------------------------------------------------------------ old leather books on a shelf
  const LEATHER = ["#5a1a14", "#6b2a17", "#3b2a1a", "#2d3a26", "#7a4a22", "#4a1f1a", "#8a6a3a", "#24283a", "#5e3b1e", "#702418", "#3a4a2c", "#94703c"];
  function bookRow(R, x0, x1, base, hgt, opt = {}) {
    let spines = "", gold = "", x = x0 + R() * 3;
    while (x < x1 - 3) {
      if (R() < 0.06) { x += 3 + R() * 6; continue; } // a gap
      const w = Math.min(x1 - x, hgt * (0.1 + R() * 0.12)), h = hgt * (0.72 + R() * 0.26), top = base - h;
      const c = opt.pale && R() < 0.35 ? ["#c9b28a", "#b8a07a", "#d8c49c"][Math.floor(R() * 3)] : LEATHER[Math.floor(R() * LEATHER.length)];
      spines += `<rect x="${f1(x)}" y="${f1(top)}" width="${f1(w - 0.6)}" height="${f1(h)}" fill="${c}"/>`;
      if (R() < 0.8) {
        const bands = R() < 0.5 ? [0.1, 0.16, 0.84, 0.9] : [0.12, 0.88];
        for (const b of bands) gold += `M${f1(x)} ${f1(top + h * b)}h${f1(w - 0.6)}v${f1(Math.max(0.6, hgt * 0.012))}h${f1(-(w - 0.6))}Z`;
        if (R() < 0.5) gold += `M${f1(x + w * 0.2)} ${f1(top + h * 0.3)}h${f1(w * 0.5)}v${f1(h * 0.12)}h${f1(-w * 0.5)}Z`;
      }
      x += w;
    }
    return `${spines}<path d="${gold}" fill="#d4b06a" opacity=".55"/>`;
  }
  /** A bay of shelves full of books, with its own shadow at the top of each shelf. */
  function bookcase(R, x0, x1, y0, y1, step, wood, opt) {
    let out = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#0d0705"/>`;
    for (let y = y0 + step; y <= y1; y += step) {
      out += bookRow(R, x0 + 2, x1 - 2, y - 3, step - 8, opt);
      out += `<rect x="${x0}" y="${y - 3}" width="${x1 - x0}" height="5" fill="${wood}"/><rect x="${x0}" y="${y - 3}" width="${x1 - x0}" height="1" fill="#fff" opacity=".12"/>`;
      out += `<rect x="${x0}" y="${y + 2}" width="${x1 - x0}" height="${step * 0.45}" fill="url(#shelfShade)"/>`;
    }
    return out;
  }
  const SHELF_SHADE = `<linearGradient id="shelfShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".7"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`;

  // ------------------------------------------------------------------ Old library: two storeys of stacks with a carved gallery
  const library = pic("library", () => {
    const R = rng(11), wood = "#2a160b", dark = "#1a0d06";
    const bays = [[0, 124], [140, 260], [276, 400]];
    let up = "", low = "";
    for (const [a, b] of bays) { up += bookcase(R, a, b, 0, 330, 41, wood, { pale: true }); low += bookcase(R, a, b, 430, 860, 54, wood, {}); }
    let pil = "";
    for (const x of [124, 260]) pil += `<rect x="${x}" y="0" width="16" height="860" fill="${dark}"/><rect x="${x + 3}" y="0" width="2" height="860" fill="#5a3418" opacity=".5"/><rect x="${x + 11}" y="0" width="1.5" height="860" fill="#000" opacity=".5"/>`;
    // the gallery: cornice, balusters, a deep beam with dentils
    let rail = `<rect x="0" y="322" width="400" height="10" fill="#3a1f0f"/><rect x="0" y="322" width="400" height="2" fill="#7a4a24" opacity=".6"/>`;
    for (let x = 4; x < 400; x += 9) rail += `<path d="M${x} 334 h4 v3 q-2 4 0 8 v26 q-2 4 0 6 v3 h-4 v-3 q2 -2 0 -6 v-26 q2 -4 0 -8Z" fill="#4a2814"/>`;
    rail += `<rect x="0" y="380" width="400" height="7" fill="#3a1f0f"/><rect x="0" y="387" width="400" height="34" fill="${dark}"/>`;
    for (let x = 2; x < 400; x += 8) rail += `<rect x="${x}" y="389" width="5" height="7" fill="#3a1f0f"/>`;
    rail += `<rect x="0" y="404" width="400" height="3" fill="#5a3418" opacity=".5"/><rect x="0" y="421" width="400" height="9" fill="#24130a"/>`;
    const defs = SHELF_SHADE + `<filter id="soft"><feGaussianBlur stdDeviation=".45"/></filter>`
      + `<radialGradient id="lamp" cx=".3" cy=".72" r=".6"><stop offset="0" stop-color="#ffb35a" stop-opacity=".32"/><stop offset=".5" stop-color="#c06a24" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`
      + `<linearGradient id="dim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".78"/><stop offset=".35" stop-color="#000" stop-opacity=".45"/><stop offset=".7" stop-color="#000" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>`;
    return SVG(`<rect width="400" height="860" fill="#0d0705"/><g filter="url(#soft)">${up}${low}${pil}${rail}</g><rect width="400" height="860" fill="url(#dim)"/><rect width="400" height="860" fill="url(#lamp)"/>`, defs);
  });

  // ------------------------------------------------------------------ Cozy cabin: log walls, heavy beams, a snowy window wrapped in lights
  const cabin = pic("cabin", () => {
    const R = rng(23);
    let logs = "";
    for (let y = 110; y < 860; y += 27) {
      logs += `<rect x="0" y="${y}" width="400" height="27" fill="url(#log)"/><rect x="0" y="${y + 25}" width="400" height="2.5" fill="#1a0d06" opacity=".75"/>`;
      for (let k = 0; k < 2; k++) if (R() < 0.6) { const x = R() * 400; logs += `<ellipse cx="${f1(x)}" cy="${y + 13}" rx="${f1(3 + R() * 4)}" ry="${f1(2 + R() * 2)}" fill="#3a1d0c" opacity=".7"/>`; }
      if (R() < 0.5) { const x = 40 + R() * 320; logs += `<rect x="${f1(x)}" y="${y}" width="2" height="25" fill="#2a150a" opacity=".6"/>`; }
    }
    let ceil = `<rect x="0" y="0" width="400" height="112" fill="#2e1a0d"/>`;
    for (let x = 0; x < 400; x += 22) ceil += `<rect x="${x}" y="0" width="1.5" height="112" fill="#1a0d06" opacity=".7"/>`;
    ceil += `<rect x="0" y="28" width="400" height="24" fill="#1e1008"/><rect x="0" y="28" width="400" height="3" fill="#5a3418" opacity=".55"/><rect x="0" y="82" width="400" height="30" fill="#1e1008"/><rect x="0" y="82" width="400" height="3" fill="#6a3c1c" opacity=".55"/>`;
    // the window with snow and pines outside
    let win = `<rect x="44" y="190" width="150" height="200" fill="#2a170c"/><rect x="52" y="198" width="134" height="184" fill="url(#night)"/>`;
    for (let i = 0; i < 7; i++) { const x = 52 + R() * 134, h = 60 + R() * 70; win += `<path d="M${f1(x)} ${382 - h} l${f1(h * 0.22)} ${f1(h)} h${f1(-h * 0.44)}Z" fill="#0d1a24" opacity=".85"/>`; }
    for (let i = 0; i < 40; i++) win += `<circle cx="${f1(52 + R() * 134)}" cy="${f1(198 + R() * 184)}" r="${f1(0.6 + R())}" fill="#dfe8f5" opacity=".6"/>`;
    win += `<rect x="116" y="198" width="6" height="184" fill="#2a170c"/><rect x="52" y="286" width="134" height="6" fill="#2a170c"/><rect x="40" y="388" width="158" height="9" fill="#3a2010"/>`;
    // a garland of lights around the window
    let gl = `<path d="M30 400 C26 300 30 200 70 176 C110 160 150 160 190 176 C222 198 214 300 210 400" stroke="#2c4a22" stroke-width="7" fill="none" opacity=".9"/>`;
    for (let t = 0; t <= 1; t += 0.035) {
      const p = t < 0.5 ? [30 + (70 - 30) * (t * 2) * 0.9, 400 - 224 * Math.sin(t * Math.PI)] : [210 - (210 - 150) * ((1 - t) * 2) * 0.9, 400 - 224 * Math.sin(t * Math.PI)];
      gl += `<circle cx="${f1(p[0] + (R() - 0.5) * 8)}" cy="${f1(p[1] + (R() - 0.5) * 6)}" r="${f1(1.3 + R())}" fill="#ffe6a8"/>`;
    }
    // floor lamp in the corner, and a rug on the floor
    const lamp = `<rect x="338" y="440" width="3" height="300" fill="#1a0d06"/><path d="M318 440 L362 440 L352 404 L328 404Z" fill="#f2c983"/><ellipse cx="340" cy="440" rx="80" ry="90" fill="url(#lampGlow)"/>`;
    const rug = `<ellipse cx="160" cy="880" rx="300" ry="70" fill="#5a1a14"/><ellipse cx="160" cy="880" rx="270" ry="56" fill="none" stroke="#c99a52" stroke-width="3" stroke-dasharray="6 5" opacity=".6"/><ellipse cx="160" cy="880" rx="220" ry="40" fill="#2a1630"/>`;
    const defs = `<linearGradient id="log" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3e2312"/><stop offset=".35" stop-color="#74472a"/><stop offset=".6" stop-color="#673e22"/><stop offset="1" stop-color="#2c170b"/></linearGradient>`
      + `<linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1830"/><stop offset="1" stop-color="#1e3048"/></linearGradient>`
      + `<radialGradient id="lampGlow"><stop offset="0" stop-color="#ffcf80" stop-opacity=".45"/><stop offset="1" stop-color="#ffcf80" stop-opacity="0"/></radialGradient>`
      + `<radialGradient id="warm" cx=".5" cy="1" r=".8"><stop offset="0" stop-color="#ff8a2a" stop-opacity=".35"/><stop offset=".6" stop-color="#a04a14" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`
      + `<linearGradient id="dim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".6"/><stop offset=".4" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>`
      + `<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>`;
    return SVG(`${logs}<rect width="400" height="860" fill="url(#dim)"/><rect width="400" height="860" fill="url(#warm)"/>`, defs);
  });

  // ------------------------------------------------------------------ Brick loft: warm-washed brick, a steel window at dusk, Edison bulbs
  const loft = pic("loft", () => {
    const R = rng(37), BR = ["#7a3a26", "#8a4a30", "#6a3020", "#9a5a3a", "#5a2a1c", "#84402a", "#6e3a2a"];
    let bricks = `<rect x="0" y="90" width="400" height="770" fill="#2e211b"/>`;
    for (let y = 90, r = 0; y < 860; y += 13, r++) for (let x = r % 2 ? -14 : 0; x < 400; x += 29) bricks += `<rect x="${x + 0.8}" y="${y + 0.8}" width="27.4" height="11.4" rx="1" fill="${BR[Math.floor(R() * BR.length)]}" opacity="${f1(0.8 + R() * 0.2)}"/>`;
    let ceil = `<rect x="0" y="0" width="400" height="92" fill="#24170f"/>`;
    for (let x = 0; x < 400; x += 26) ceil += `<rect x="${x}" y="0" width="1.5" height="92" fill="#120b06"/>`;
    ceil += `<rect x="0" y="40" width="400" height="16" fill="#140c07"/><rect x="0" y="70" width="400" height="20" fill="#140c07"/><rect x="0" y="62" width="400" height="4" fill="#3a3a3e"/>`;
    // tall steel window with the city at dusk
    let city = "";
    for (let i = 0; i < 14; i++) { const x = -10 + i * 14 + R() * 6, w = 10 + R() * 16, h = 60 + R() * 170; city += `<rect x="${f1(x)}" y="${f1(560 - h)}" width="${f1(w)}" height="${f1(h)}" fill="#141626"/>`; for (let k = 0; k < h / 9; k++) if (R() < 0.35) city += `<rect x="${f1(x + 2 + R() * (w - 4))}" y="${f1(560 - h + 4 + k * 9)}" width="1.6" height="2.2" fill="#ffd98a" opacity=".85"/>`; }
    let win = `<rect x="0" y="120" width="178" height="460" fill="#0e0e12"/><g clip-path="url(#pane)"><rect x="0" y="126" width="172" height="448" fill="url(#dusk)"/>${city}</g>`;
    for (let x = 0; x <= 172; x += 43) win += `<rect x="${x}" y="126" width="3" height="448" fill="#0e0e12"/>`;
    for (let y = 126; y <= 574; y += 64) win += `<rect x="0" y="${y}" width="172" height="3" fill="#0e0e12"/>`;
    // string of Edison bulbs across the top of the wall
    let bulbs = `<path d="M178 118 Q240 150 300 122 Q350 148 400 124" stroke="#0e0e10" stroke-width="1.2" fill="none"/>`, glow = "";
    for (let i = 0; i < 9; i++) { const t = i / 8, x = 184 + t * 212, y = 120 + Math.sin(t * Math.PI * 2) * 0 + (t < 0.55 ? Math.sin(t / 0.55 * Math.PI) * 22 : Math.sin((t - 0.55) / 0.45 * Math.PI) * 18); bulbs += `<line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x)}" y2="${f1(y + 8)}" stroke="#0e0e10"/><ellipse cx="${f1(x)}" cy="${f1(y + 12)}" rx="2.6" ry="3.6" fill="#ffd27a"/>`; glow += `<circle cx="${f1(x)}" cy="${f1(y + 12)}" r="16" fill="#ffb34a" opacity=".5"/>`; }
    // monstera leaves and an arc floor lamp by the window
    let plant = "";
    for (let i = 0; i < 7; i++) { const a = -70 + i * 22 + R() * 8, x = 150 + Math.cos(a * Math.PI / 180) * 10, y = 700; plant += `<path d="M150 760 Q${f1(x)} ${f1(y)} ${f1(150 + Math.sin(a * Math.PI / 180) * 90)} ${f1(650 - Math.cos(a * Math.PI / 180) * 40)}" stroke="#0e1a10" stroke-width="2" fill="none"/><ellipse cx="${f1(150 + Math.sin(a * Math.PI / 180) * 90)}" cy="${f1(650 - Math.cos(a * Math.PI / 180) * 40)}" rx="30" ry="18" transform="rotate(${f1(a)} ${f1(150 + Math.sin(a * Math.PI / 180) * 90)} ${f1(650 - Math.cos(a * Math.PI / 180) * 40)})" fill="#12241a"/>`; }
    const lamp = `<path d="M40 860 L40 640 Q40 600 80 590" stroke="#18181c" stroke-width="3" fill="none"/><path d="M74 580 l22 4 l-6 16 l-20 -6Z" fill="#26262a"/><ellipse cx="95" cy="640" rx="120" ry="110" fill="url(#lampGlow)"/>`;
    const defs = `<linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2048"/><stop offset=".45" stop-color="#4c3c78"/><stop offset=".72" stop-color="#b0627a"/><stop offset="1" stop-color="#e89a6a"/></linearGradient>`
      + `<clipPath id="pane"><rect x="0" y="126" width="172" height="448"/></clipPath>`
      + `<radialGradient id="lampGlow"><stop offset="0" stop-color="#ffcf80" stop-opacity=".4"/><stop offset="1" stop-color="#ffcf80" stop-opacity="0"/></radialGradient>`
      + `<linearGradient id="wash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb060" stop-opacity=".28"/><stop offset=".3" stop-color="#ff9a40" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`
      + `<linearGradient id="dim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".4"/><stop offset=".5" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></linearGradient>`
      + `<filter id="blur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7"/></filter>`;
    return SVG(`${bricks}<rect x="178" y="90" width="222" height="770" fill="url(#wash)"/>${ceil}${win}<rect width="400" height="860" fill="url(#dim)"/>${lamp}`, defs);
  });

  // ------------------------------------------------------------------ Candlelit: a dark panelled room, a gilt frame, warm haze
  const candlelit = pic("candlelit", () => {
    const R = rng(5);
    let panels = `<rect width="400" height="860" fill="#140b07"/>`;
    for (const [x, w] of [[14, 112], [144, 112], [274, 112]]) for (const [y, h] of [[60, 300], [390, 250]]) panels += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#3a2214" stroke-width="3"/><rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" fill="#1a0f09" stroke="#000" stroke-opacity=".5"/>`;
    const frame = `<rect x="128" y="120" width="144" height="180" fill="#2a1a0c" stroke="#a9843f" stroke-width="7"/><rect x="140" y="132" width="120" height="156" fill="#1a1410"/><ellipse cx="200" cy="200" rx="40" ry="52" fill="#3a2a1c" opacity=".7"/>`;
    const mantel = `<rect x="0" y="672" width="400" height="16" fill="#3a2214"/><rect x="0" y="672" width="400" height="2" fill="#8a5a2c" opacity=".6"/><rect x="0" y="688" width="400" height="172" fill="#100805"/>`;
    let bokeh = ""; for (let i = 0; i < 18; i++) bokeh += `<circle cx="${f1(R() * 400)}" cy="${f1(80 + R() * 560)}" r="${f1(6 + R() * 20)}" fill="#ffb45a" opacity="${f1(0.05 + R() * 0.12)}"/>`;
    const defs = `<radialGradient id="g" cx=".5" cy=".85" r=".8"><stop offset="0" stop-color="#ff9a3a" stop-opacity=".45"/><stop offset=".45" stop-color="#a04a14" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>`;
    return SVG(`${panels}${frame}${mantel}<rect width="400" height="860" fill="url(#g)"/><g filter="url(#b)">${bokeh}</g>`, defs, "xMidYMax");
  });

  // ------------------------------------------------------------------ Tea house: carved eaves, glowing paper screens, lanterns far off
  const teahouse = pic("teahouse", () => {
    const R = rng(71);
    let far = ""; for (let i = 0; i < 30; i++) { const x = R() * 400, y = 120 + R() * 520, r = 4 + R() * 12; far += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(r)}" ry="${f1(r * 1.1)}" fill="${R() > 0.3 ? "#ff4a1c" : "#ffb04a"}" opacity="${f1(0.15 + R() * 0.3)}"/>`; }
    // screens on both sides: warm paper behind a dark lattice
    const screen = (x0, w) => {
      let s = `<rect x="${x0}" y="140" width="${w}" height="720" fill="url(#paper)"/>`;
      for (let x = x0; x <= x0 + w; x += 18) s += `<rect x="${x - 1.2}" y="140" width="2.4" height="720" fill="#1a0806"/>`;
      for (let y = 140; y < 860; y += 26) s += `<rect x="${x0}" y="${y - 1.2}" width="${w}" height="2.4" fill="#1a0806"/>`;
      return s + `<rect x="${x0 - 4}" y="140" width="8" height="720" fill="#4a0f0a"/><rect x="${x0 + w - 4}" y="140" width="8" height="720" fill="#4a0f0a"/>`;
    };
    // a curved roof eave across the top with tile ribs
    let roof = `<path d="M-10 0 H410 V70 Q380 66 370 96 Q300 80 200 82 Q100 80 30 96 Q20 66 -10 70Z" fill="#0b0505"/>`;
    for (let x = 0; x < 400; x += 11) roof += `<rect x="${x}" y="0" width="5" height="${f1(76 + Math.abs(x - 200) * 0.07)}" fill="#1a0b08"/>`;
    roof += `<path d="M-10 70 Q20 66 30 96 Q100 80 200 82 Q300 80 370 96 Q380 66 410 70" stroke="#6a1a10" stroke-width="5" fill="none"/>`;
    const moon = `<circle cx="300" cy="200" r="34" fill="#f3d9b0" opacity=".85"/><circle cx="300" cy="200" r="70" fill="#f3c88a" opacity=".12"/>`;
    const defs = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14050a"/><stop offset=".5" stop-color="#2a0a0a"/><stop offset="1" stop-color="#0c0303"/></linearGradient>`
      + `<linearGradient id="paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8742a" stop-opacity=".55"/><stop offset=".6" stop-color="#e8a050" stop-opacity=".45"/><stop offset="1" stop-color="#7a3010" stop-opacity=".35"/></linearGradient>`
      + `<filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>`
      + `<linearGradient id="mid" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".22" stop-color="#000" stop-opacity=".55"/><stop offset=".78" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`;
    return SVG(`<rect width="400" height="860" fill="url(#sky)"/>${moon}<g filter="url(#b)">${far}</g>${screen(0, 72)}${screen(328, 72)}<rect width="400" height="860" fill="url(#mid)"/>${roof}`, defs);
  });

  // ------------------------------------------------------------------ Cottage at dusk: rose wallpaper, painted panelling, lamplight
  const cottage = pic("cottage", () => {
    const R = rng(91);
    let flowers = "";
    for (let y = 10; y < 640; y += 34) for (let x = (y / 34) % 2 ? 0 : 17; x < 410; x += 34) {
      const px = x + (R() - 0.5) * 6, py = y + (R() - 0.5) * 6, c = R() < 0.5 ? "#f1d9c0" : "#e8a7a8";
      flowers += `<g transform="translate(${f1(px)} ${f1(py)}) rotate(${Math.floor(R() * 360)})"><path d="M0 0 q4 -6 8 -2" stroke="#8e9a64" stroke-width="1" fill="none"/><ellipse cx="9" cy="-4" rx="2.4" ry="1.2" fill="#8e9a64"/>`
        + [0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-2.4" rx="1.5" ry="2.4" transform="rotate(${a})" fill="${c}"/>`).join("") + `<circle r="1.1" fill="#d9a94a"/></g>`;
    }
    let wains = `<rect x="0" y="640" width="400" height="220" fill="#b8a184"/><rect x="0" y="636" width="400" height="10" fill="#d9c7a8"/>`;
    for (let x = 0; x < 400; x += 14) wains += `<rect x="${x}" y="646" width="1.5" height="214" fill="#7a6650" opacity=".6"/>`;
    const defs = `<radialGradient id="lamp" cx=".72" cy=".55" r=".75"><stop offset="0" stop-color="#ffc77a" stop-opacity=".35"/><stop offset=".55" stop-color="#e8955a" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`
      + `<radialGradient id="dim" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#2a140c" stop-opacity=".35"/><stop offset="1" stop-color="#1a0a06" stop-opacity=".78"/></radialGradient>`;
    return SVG(`<rect width="400" height="860" fill="#8a5a4a"/><g opacity=".8">${flowers}</g>${wains}<rect width="400" height="860" fill="url(#dim)"/><rect width="400" height="860" fill="url(#lamp)"/>`, defs);
  });

  // ------------------------------------------------------------------ Candlelit: a salon wall of gilt-framed paintings in candlelight
  function painting(R, x, y, w, h, kind) {
    const g = `pf${Math.floor(R() * 1e6)}`;
    const fw = Math.max(5, Math.min(w, h) * 0.09);
    let art = "";
    const ix = x + fw, iy = y + fw, iw = w - fw * 2, ih = h - fw * 2;
    if (kind === "portrait") art = `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#2a1c12"/><ellipse cx="${f1(ix + iw / 2)}" cy="${f1(iy + ih * 0.4)}" rx="${f1(iw * 0.18)}" ry="${f1(ih * 0.17)}" fill="#c9a07a" opacity=".55"/><path d="M${f1(ix + iw * 0.15)} ${iy + ih} Q${f1(ix + iw / 2)} ${f1(iy + ih * 0.5)} ${f1(ix + iw * 0.85)} ${iy + ih}Z" fill="#3a1414"/><ellipse cx="${f1(ix + iw / 2)}" cy="${f1(iy + ih * 0.33)}" rx="${f1(iw * 0.2)}" ry="${f1(ih * 0.12)}" fill="#1a100a"/>`;
    else if (kind === "landscape") art = `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#4a5a52"/><rect x="${ix}" y="${f1(iy + ih * 0.55)}" width="${iw}" height="${f1(ih * 0.45)}" fill="#3a3a22"/><path d="M${ix} ${f1(iy + ih * 0.6)} Q${f1(ix + iw * 0.3)} ${f1(iy + ih * 0.35)} ${f1(ix + iw * 0.55)} ${f1(iy + ih * 0.58)} T${ix + iw} ${f1(iy + ih * 0.5)} V${iy + ih} H${ix}Z" fill="#2a3420"/><circle cx="${f1(ix + iw * 0.7)}" cy="${f1(iy + ih * 0.3)}" r="${f1(ih * 0.1)}" fill="#e8c88a" opacity=".6"/><ellipse cx="${f1(ix + iw * 0.25)}" cy="${f1(iy + ih * 0.55)}" rx="${f1(iw * 0.08)}" ry="${f1(ih * 0.2)}" fill="#1e2814"/>`;
    else if (kind === "still") art = `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#1e140c"/><rect x="${ix}" y="${f1(iy + ih * 0.72)}" width="${iw}" height="${f1(ih * 0.28)}" fill="#3a2414"/><path d="M${f1(ix + iw * 0.35)} ${f1(iy + ih * 0.74)} q${f1(-iw * 0.08)} ${f1(-ih * 0.3)} ${f1(iw * 0.1)} ${f1(-ih * 0.4)} q${f1(iw * 0.18)} ${f1(ih * 0.1)} ${f1(iw * 0.1)} ${f1(ih * 0.4)}Z" fill="#6a4a3a"/>${[[0.35, 0.3, "#9a2a2a"], [0.5, 0.25, "#d8b0b0"], [0.62, 0.34, "#a83a3a"], [0.44, 0.4, "#e0c070"]].map(([fx, fy, c]) => `<circle cx="${f1(ix + iw * fx)}" cy="${f1(iy + ih * fy)}" r="${f1(iw * 0.08)}" fill="${c}" opacity=".75"/>`).join("")}<circle cx="${f1(ix + iw * 0.75)}" cy="${f1(iy + ih * 0.68)}" r="${f1(iw * 0.07)}" fill="#8a6a2a"/>`;
    else art = `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#2c3440"/><path d="M${ix} ${f1(iy + ih * 0.7)} q${f1(iw * 0.25)} ${f1(-ih * 0.1)} ${f1(iw * 0.5)} 0 t${f1(iw * 0.5)} 0 V${iy + ih} H${ix}Z" fill="#1a2028"/><path d="M${f1(ix + iw * 0.4)} ${f1(iy + ih * 0.68)} l${f1(iw * 0.1)} ${f1(-ih * 0.4)} l${f1(iw * 0.1)} ${f1(ih * 0.4)}Z" fill="#d8d0c0" opacity=".5"/>`;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#gilt)"/><rect x="${f1(x + fw * 0.35)}" y="${f1(y + fw * 0.35)}" width="${f1(w - fw * 0.7)}" height="${f1(h - fw * 0.7)}" fill="none" stroke="#5a421c" stroke-width="1"/>${art}<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="url(#varnish)"/>`;
  }
  const candlelit2 = pic("candlelit2", () => {
    const R = rng(13);
    const frames = [[24, 70, 110, 140, "portrait"], [150, 40, 160, 110, "landscape"], [330, 60, 64, 84, "portrait"], [148, 166, 76, 96, "still"], [240, 166, 70, 70, "sea"], [20, 230, 72, 96, "still"], [104, 230, 30, 40, "portrait"], [322, 160, 70, 120, "portrait"], [44, 352, 140, 96, "landscape"], [200, 260, 124, 150, "portrait"], [340, 300, 50, 64, "sea"], [16, 470, 90, 70, "sea"], [120, 470, 64, 84, "still"], [210, 430, 96, 74, "landscape"], [320, 390, 72, 110, "still"], [326, 516, 60, 46, "landscape"]];
    let wall = `<rect width="400" height="860" fill="#2a1410"/>`;
    for (let x = 0; x < 400; x += 16) wall += `<rect x="${x}" y="0" width="8" height="640" fill="#331a14" opacity=".55"/>`;
    const art = frames.map(([x, y, w, h, k]) => `<rect x="${x + 3}" y="${y + 5}" width="${w}" height="${h}" fill="#000" opacity=".45" filter="url(#sh)"/>` + painting(R, x, y, w, h, k)).join("");
    const dado = `<rect x="0" y="640" width="400" height="12" fill="#3a2214"/><rect x="0" y="640" width="400" height="2" fill="#a9843f" opacity=".5"/><rect x="0" y="652" width="400" height="208" fill="#160c08"/>` + [10, 140, 270].map((x) => `<rect x="${x}" y="676" width="120" height="150" fill="none" stroke="#2a1810" stroke-width="3"/>`).join("");
    const defs = `<linearGradient id="gilt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6a4a1c"/><stop offset=".3" stop-color="#d4b060"/><stop offset=".5" stop-color="#8a6a2c"/><stop offset=".75" stop-color="#c9a24e"/><stop offset="1" stop-color="#4a3414"/></linearGradient>`
      + `<linearGradient id="varnish" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".08"/><stop offset=".5" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>`
      + `<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>`
      + `<radialGradient id="cl" cx=".5" cy=".95" r=".85"><stop offset="0" stop-color="#ffb060" stop-opacity=".38"/><stop offset=".5" stop-color="#a04a14" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`
      + `<linearGradient id="dim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".72"/><stop offset=".5" stop-color="#000" stop-opacity=".48"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>`;
    return SVG(`${wall}${art}${dado}<rect width="400" height="860" fill="url(#dim)"/><rect width="400" height="860" fill="url(#cl)"/>`, defs);
  });

  // ------------------------------------------------------------------ Vampire: a tall gilt mirror half hidden behind blood-red velvet, silver candelabra
  const drape = (x0, x1, flip, top, bottom, col, tie) => {
    // a heavy velvet curtain gathered at a tie-back: folds as alternating light and dark bands
    const w = x1 - x0, folds = 7; let d = "";
    for (let k = 0; k < folds; k++) {
      const a = x0 + (w / folds) * k, b = a + w / folds, ta = flip ? x1 - (x1 - a) * 0.5 : x0 + (a - x0) * 0.5, tb = flip ? x1 - (x1 - b) * 0.5 : x0 + (b - x0) * 0.5;
      d += `<path d="M${f1(a)} ${top} L${f1(b)} ${top} C${f1(b)} ${tie * 0.6} ${f1(tb)} ${tie - 30} ${f1(tb)} ${tie} C${f1(tb)} ${tie + 40} ${f1(b + (flip ? -6 : 6))} ${bottom - 60} ${f1(b + (flip ? -10 : 10))} ${bottom} L${f1(a + (flip ? -10 : 10))} ${bottom} C${f1(a)} ${bottom - 60} ${f1(ta)} ${tie + 40} ${f1(ta)} ${tie} C${f1(ta)} ${tie - 30} ${f1(a)} ${tie * 0.6} ${f1(a)} ${top}Z" fill="${k % 2 ? col[0] : col[1]}"/>`;
    }
    return d;
  };
  const vampire = pic("vampire", () => {
    const R = rng(66), RED = ["#4a0710", "#8a1222"];
    const mirror = `<rect x="110" y="120" width="180" height="420" rx="90" fill="url(#gilt)"/><rect x="122" y="132" width="156" height="396" rx="78" fill="url(#glass)"/><rect x="122" y="132" width="156" height="396" rx="78" fill="none" stroke="#5a421c" stroke-width="2"/>`
      + `<path d="M150 180 Q170 160 200 170" stroke="#fff" stroke-width="6" opacity=".06" fill="none"/>`
      + `<path d="M190 112 q10 -22 20 0 q-10 -6 -20 0Z" fill="url(#gilt)"/>`;
    const cand = (x, y, s) => {
      let o = `<path d="M${x - 14 * s} ${y + 140 * s} h${28 * s} l${-6 * s} ${-12 * s} h${-16 * s}Z" fill="url(#silver)"/><rect x="${x - 2 * s}" y="${y + 30 * s}" width="${4 * s}" height="${100 * s}" fill="url(#silver)"/>`;
      for (const dx of [-30, -15, 0, 15, 30]) {
        const tall = dx === 0 ? 1.15 : Math.abs(dx) === 15 ? 1 : 0.9, top = y + (dx === 0 ? -6 : Math.abs(dx) === 15 ? 6 : 16) * s;
        o += `<path d="M${x} ${y + 40 * s} Q${x + dx * s} ${y + 40 * s} ${x + dx * s} ${top + 30 * s}" stroke="url(#silver)" stroke-width="${2.2 * s}" fill="none"/><rect x="${x + dx * s - 3 * s}" y="${top + 26 * s}" width="${6 * s}" height="${4 * s}" fill="url(#silver)"/>`
          + `<rect x="${x + dx * s - 1.8 * s}" y="${top - 6 * s * tall}" width="${3.6 * s}" height="${32 * s * tall}" fill="#efe4cc"/><ellipse cx="${x + dx * s}" cy="${top - 12 * s * tall}" rx="${2.4 * s}" ry="${5 * s}" fill="#ffc861"/><circle cx="${x + dx * s}" cy="${top - 12 * s * tall}" r="${14 * s}" fill="#ff9a40" opacity=".18" filter="url(#b)"/>`;
      }
      return o;
    };
    const valance = Array.from({ length: 9 }, (_, i) => `<path d="M${i * 46 - 10} 0 h56 v26 Q${i * 46 + 18} 64 ${i * 46 - 10} 26Z" fill="${i % 2 ? RED[1] : RED[0]}"/><path d="M${i * 46 - 10} 26 Q${i * 46 + 18} 64 ${i * 46 + 46} 26" stroke="#c9a24e" stroke-width="2" fill="none"/><path d="M${i * 46 + 18} 46 v14" stroke="#c9a24e" stroke-width="2"/><path d="M${i * 46 + 14} 58 h8 l2 14 h-12Z" fill="#b8913f"/>`).join("");
    let lace = ""; for (let i = 0; i < 26; i++) lace += `<path d="M${f1(330 + R() * 70)} ${f1(80 + R() * 700)} q4 6 0 12 q-4 6 0 12" stroke="#d8d0c0" stroke-width=".6" fill="none" opacity=".25"/>`;
    const defs = `<linearGradient id="gilt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6a4a1c"/><stop offset=".3" stop-color="#e0bc6a"/><stop offset=".5" stop-color="#8a6a2c"/><stop offset=".75" stop-color="#d4ae58"/><stop offset="1" stop-color="#4a3414"/></linearGradient>`
      + `<linearGradient id="silver" x1="0" x2="1"><stop offset="0" stop-color="#5a5a62"/><stop offset=".45" stop-color="#e8e8ee"/><stop offset="1" stop-color="#4a4a52"/></linearGradient>`
      + `<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2830"/><stop offset=".5" stop-color="#14121a"/><stop offset="1" stop-color="#0a080e"/></linearGradient>`
      + `<filter id="b" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5"/></filter>`
      + `<radialGradient id="g" cx=".5" cy=".55" r=".7"><stop offset="0" stop-color="#ff7a40" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`
      + `<linearGradient id="dim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset=".5" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>`;
    let damask = ""; for (let y = 20, r = 0; y < 860; y += 60, r++) for (let x = r % 2 ? 0 : 30; x < 420; x += 60) damask += `<path d="M${x} ${y - 18} q10 10 0 18 q-10 8 0 18 q-10 -8 -14 -18 q4 -10 14 -18Z M${x} ${y - 18} q-10 10 0 18 q10 8 0 18 q10 -8 14 -18 q-4 -10 -14 -18Z" fill="#3a0a14" opacity=".55"/>`;
    return SVG(`<rect width="400" height="860" fill="#1c060c"/>${damask}${lace}<rect width="400" height="860" fill="url(#g)"/><rect width="400" height="860" fill="url(#dim)"/>`, defs);
  });

  // ------------------------------------------------------------------ Dark academia: a study at night, rain on the window, a green banker's lamp
  const academia = pic("academia", () => {
    const R = rng(29), wood = "#24130a";
    let cases = bookcase(R, 0, 112, 0, 860, 50, wood, { pale: false }) + bookcase(R, 288, 400, 0, 860, 50, wood, { pale: false });
    cases += `<rect x="108" y="0" width="10" height="860" fill="#160b05"/><rect x="282" y="0" width="10" height="860" fill="#160b05"/>`;
    const wall = `<rect x="118" y="0" width="164" height="860" fill="#1c1410"/>` + Array.from({ length: 6 }, (_, i) => `<rect x="${118 + i * 28}" y="0" width="14" height="860" fill="#22180f" opacity=".7"/>`).join("");
    // an oil painting (a ship at sea) and a plaster bust on a column
    const art = `<rect x="140" y="70" width="120" height="90" fill="url(#gilt)"/><rect x="148" y="78" width="104" height="74" fill="#2a3238"/><path d="M148 130 q26 -8 52 0 t52 0 V152 H148Z" fill="#1a2024"/><path d="M196 96 v30 M196 98 l16 22 h-16Z M196 104 l-12 18 h12Z" stroke="#c8bca0" stroke-width="1" fill="#c8bca0" opacity=".7"/><rect x="148" y="78" width="104" height="74" fill="#000" opacity=".25"/>`;
    const bust = `<rect x="226" y="560" width="40" height="120" fill="#5e5852"/><rect x="220" y="552" width="52" height="10" fill="#6e6862"/><path d="M226 552 q0 -26 20 -30 q20 4 20 30Z" fill="#b8b0a4"/><ellipse cx="246" cy="506" rx="13" ry="16" fill="#c8c0b4"/><path d="M233 500 q13 -18 26 0 q-4 -10 -13 -10 q-9 0 -13 10Z" fill="#a8a094"/>`;
    // desk with a green banker's lamp, a globe and stacked books
    const desk = `<rect x="100" y="690" width="200" height="14" fill="#3a2010"/><rect x="100" y="704" width="200" height="156" fill="#1a0e07"/>`
      + `<rect x="128" y="664" width="44" height="8" fill="#5a1a14"/><rect x="132" y="656" width="38" height="8" fill="#2d3a26"/><rect x="126" y="672" width="48" height="18" fill="#6b2a17"/><rect x="126" y="680" width="48" height="2" fill="#d4b06a" opacity=".6"/>`
      + `<circle cx="276" cy="650" r="20" fill="#7a6a42"/><path d="M262 640 q14 -6 28 6 M258 654 q18 6 36 -2" stroke="#3a4a2c" stroke-width="5" fill="none" opacity=".7"/><path d="M276 628 a22 22 0 0 1 0 44" stroke="#a9843f" stroke-width="2" fill="none"/><rect x="272" y="670" width="8" height="20" fill="#a9843f"/>`
      + `<rect x="196" y="640" width="4" height="50" fill="#c9a24e"/><ellipse cx="198" cy="690" rx="16" ry="4" fill="#a9843f"/><path d="M168 640 h60 q-4 -16 -30 -16 q-26 0 -30 16Z" fill="#1f5a34"/><path d="M170 638 h56" stroke="#7ab88a" stroke-width="1" opacity=".6"/><ellipse cx="198" cy="660" rx="90" ry="60" fill="url(#lamp)"/>`;
    const defs = SHELF_SHADE + `<linearGradient id="gilt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6a4a1c"/><stop offset=".35" stop-color="#d4b060"/><stop offset=".6" stop-color="#8a6a2c"/><stop offset="1" stop-color="#4a3414"/></linearGradient>`
      + `<radialGradient id="lamp"><stop offset="0" stop-color="#ffd890" stop-opacity=".5"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/></radialGradient>`
      + `<filter id="soft"><feGaussianBlur stdDeviation=".4"/></filter>`
      + `<linearGradient id="dim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".6"/><stop offset=".5" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>`
      + `<radialGradient id="warm" cx=".5" cy=".8" r=".7"><stop offset="0" stop-color="#ffb060" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`;
    return SVG(`<g filter="url(#soft)">${wall}${cases}${bust}</g><rect width="400" height="860" fill="url(#dim)"/>${desk}<rect width="400" height="860" fill="url(#warm)"/>`, defs);
  });

  // ------------------------------------------------------------------ Cottage: butter-cream rose wallpaper, white beadboard, lamplight
  const cottage2 = pic("cottage2", () => {
    const R = rng(52);
    let paper = `<rect width="400" height="860" fill="#ecd8b8"/>`;
    for (let x = 0; x < 400; x += 26) paper += `<rect x="${x}" y="0" width="9" height="620" fill="#e2c9a2" opacity=".55"/>`;
    for (let y = 18, r = 0; y < 620; y += 48, r++) for (let x = r % 2 ? 13 : 39; x < 420; x += 52) {
      const px = x + (R() - 0.5) * 4, py = y + (R() - 0.5) * 4;
      paper += `<g transform="translate(${f1(px)} ${f1(py)})"><path d="M-9 4 q5 -2 7 -7 M9 5 q-4 -3 -6 -8" stroke="#7d8f58" stroke-width="1.2" fill="none"/><ellipse cx="-9" cy="5" rx="4.6" ry="2.2" fill="#8fa36a" transform="rotate(-25 -9 5)"/><ellipse cx="9" cy="6" rx="4.4" ry="2.1" fill="#7d9460" transform="rotate(30 9 6)"/>`
        + `<circle cx="0" cy="-2" r="5.6" fill="#e49aa8"/><circle cx="-1.6" cy="-3" r="3.6" fill="#f2b8c0"/><path d="M-2.6 -2 q2.6 -3 5 0 q-2 2.4 -5 0Z" fill="#c9707f"/><circle cx="7" cy="-6" r="2.4" fill="#f3c9cf"/></g>`;
    }
    let bead = `<rect x="0" y="620" width="400" height="240" fill="#f6eee0"/><rect x="0" y="612" width="400" height="12" fill="#fbf5ea"/><rect x="0" y="622" width="400" height="3" fill="#cdbfa6"/>`;
    for (let x = 0; x < 400; x += 13) bead += `<rect x="${x}" y="625" width="1.2" height="235" fill="#d9ccb4"/>`;
    const defs = `<radialGradient id="lamp" cx=".7" cy=".5" r=".75"><stop offset="0" stop-color="#ffd38a" stop-opacity=".38"/><stop offset=".6" stop-color="#f0a860" stop-opacity=".12"/><stop offset="1" stop-color="#f0a860" stop-opacity="0"/></radialGradient>`
      + `<radialGradient id="vig" cx=".5" cy=".5" r=".72"><stop offset=".55" stop-color="#6a3a1c" stop-opacity="0"/><stop offset="1" stop-color="#5a2e14" stop-opacity=".5"/></radialGradient>`;
    return SVG(`${paper}${bead}<rect width="400" height="860" fill="url(#lamp)"/><rect width="400" height="860" fill="url(#vig)"/>`, defs);
  });

  // ------------------------------------------------------------------ Haunted castle: old stone blocks with moss in the joints and ivy hanging down
  const castle = pic("castle", () => {
    const R = rng(77);
    let stones = "", moss = "";
    for (let y = 0, r = 0; y < 860; y += 38, r++) {
      for (let x = r % 2 ? -30 : 0; x < 420;) {
        const w = 52 + Math.floor(R() * 34);
        const c = ["#4a4c54", "#3e4048", "#545660", "#44464e", "#3a3c42"][Math.floor(R() * 5)];
        stones += `<rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="34" rx="5" fill="${c}"/><rect x="${x + 4}" y="${y + 3}" width="${w - 10}" height="3" rx="1.5" fill="#fff" opacity=".05"/>`;
        // moss creeping along the joints
        if (R() < 0.55) { const mx = x + R() * w, len = 10 + R() * 34; moss += `<path d="M${f1(mx)} ${y + 36.5} q${f1(len / 2)} ${f1(-3 - R() * 4)} ${f1(len)} 0" stroke="${["#3f5f2c", "#4c7034", "#355024"][Math.floor(R() * 3)]}" stroke-width="${f1(3 + R() * 3)}" stroke-linecap="round" fill="none"/>`; for (let k = 0; k < 4; k++) moss += `<circle cx="${f1(mx + R() * len)}" cy="${f1(y + 34 + R() * 4)}" r="${f1(1 + R() * 2)}" fill="#5e8a3e"/>`; }
        if (R() < 0.25) moss += `<path d="M${x + 1} ${f1(y + 4 + R() * 20)} q${f1(-2 + R() * 4)} ${f1(8 + R() * 10)} 0 ${f1(16 + R() * 10)}" stroke="#3f5f2c" stroke-width="3.5" stroke-linecap="round" fill="none"/>`;
        x += w;
      }
    }
    // ivy trailing down from the top
    let ivy = "";
    for (const [x0, len] of [[18, 520], [62, 300], [118, 160], [300, 220], [348, 600], [384, 380]]) {
      let d = `M${x0} -10`, x = x0, leaves = "";
      for (let y = 0; y < len; y += 22) { const nx = x0 + Math.sin(y / 40 + x0) * 10; d += ` Q${f1(x + (R() - 0.5) * 14)} ${y + 11} ${f1(nx)} ${y + 22}`; x = nx;
        for (const side of [-1, 1]) if (R() < 0.85) { const lx = nx + side * (5 + R() * 4), ly = y + 18 + R() * 6, sz = 4 + R() * 3.5; leaves += `<path d="M${f1(lx)} ${f1(ly)} c${f1(-sz)} ${f1(-sz * 0.4)} ${f1(-sz * 0.6)} ${f1(-sz * 1.5)} 0 ${f1(-sz * 1.6)} c${f1(sz * 0.6)} ${f1(sz * 0.1)} ${f1(sz)} ${f1(sz * 1.2)} 0 ${f1(sz * 1.6)}Z" fill="${["#2f5a26", "#3e7030", "#264a20", "#4a7e38"][Math.floor(R() * 4)]}" transform="rotate(${f1(side * (20 + R() * 40))} ${f1(lx)} ${f1(ly)})"/>`; }
      }
      ivy += `<path d="${d}" stroke="#2a3a1e" stroke-width="1.6" fill="none"/>${leaves}`;
    }
    const defs = `<radialGradient id="moon" cx=".75" cy=".15" r=".8"><stop offset="0" stop-color="#9ab0d8" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`
      + `<linearGradient id="dim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05060a" stop-opacity=".55"/><stop offset=".5" stop-color="#05060a" stop-opacity=".5"/><stop offset="1" stop-color="#05060a" stop-opacity=".7"/></linearGradient>`;
    return SVG(`<rect width="400" height="860" fill="#1a1b20"/>${stones}${moss}<rect width="400" height="860" fill="url(#dim)"/><rect width="400" height="860" fill="url(#moon)"/>${ivy}`, defs);
  });

  Object.assign(D.BACKDROPS, {
    libraryStacks: { label: "Library stacks", tone: "dark", fx: "dust", css: () => `${library()} center / cover no-repeat, #0d0705` },
    cabinNight: { label: "Log cabin", tone: "dark", fx: "hearth", css: () => `${cabin()} center / cover no-repeat, #1e1008` },
    loftDusk: { label: "Loft at dusk", tone: "dark", fx: "glowmotes", css: () => `${loft()} center / cover no-repeat, #1a120e` },
    candleRoom: { label: "Candlelit room", tone: "dark", fx: "candles", css: () => `${candlelit()} center bottom / cover no-repeat, #140b07` },
    teaNight: { label: "Tea house night", tone: "dark", fx: "lanterns petals", css: () => `${teahouse()} center / cover no-repeat, #14050a` },
    castleIvy: { label: "Ivy-covered stone", tone: "dark", fx: "fog", css: () => `${castle()} center / cover no-repeat, #1a1b20` },
    galleryWall: { label: "Gallery wall", tone: "dark", css: () => `${candlelit2()} center / cover no-repeat, #1a0c08` },
    vampireMirror: { label: "Velvet & mirror", tone: "dark", fx: "mirror drapesVamp bats", css: () => `${vampire()} center / cover no-repeat, #12050a` },
    study: { label: "Rainy study", tone: "dark", fx: "rainWindow", css: () => `${academia()} center / cover no-repeat, #140c08` },
    cottageRoses: { label: "Rose cottage", tone: "light", fx: "curtains", css: () => `${cottage2()} center / cover no-repeat, #ecd8b8` },
    cottageDusk: { label: "Cottage evening", tone: "dark", fx: "curtains", css: () => `${cottage()} center / cover no-repeat, #3a2018` },
  });
  D.PALETTES.cottageEve = { label: "Cottage evening", t: ["#24150f", "#f6e9da", "#2e1c14", "#331f16", "#3a241a", "#c2a491", "#4a3024", "#45291e", "#5e3c2c", "dark"] };
  D.PALETTES.library = { label: "Old library", t: ["#120a06", "#f0e2c8", "#1a0f09", "#1e120b", "#24160d", "#ad9473", "#3a2516", "#342114", "#4e321e", "dark"] };
  D.PALETTES.loft = { label: "Loft", t: ["#14100e", "#f1e6dc", "#1c1714", "#211a16", "#271f1a", "#a8988a", "#3a2e27", "#342922", "#4a3a30", "dark"] };
  // looks pointed at the new rooms (themes merge palettes on load, so add them there too)
  const L = D.LOOKS;
  Object.assign(L.library.set, { theme: "library", accent: "#d8b26a", shelfMat: "mahogany", backdrop: "libraryStacks", headFont: "cinzel", ornament: { kind: "squareBrass", pos: "end" }, lights: { style: "none", colour: "warm", on: false } });
  Object.assign(L.cabin.set, { theme: "cabin", accent: "#f0a85a", shelfMat: "oak", backdrop: "cabinNight", headFont: "cormorant", lights: { style: "fairy", colour: "warm", on: true } });
  Object.assign(L.loft.set, { theme: "loft", accent: "#f2b35b", shelfMat: "steel", backdrop: "loftDusk", headFont: "oswald", lights: { style: "globe", colour: "warm", on: true } });
  Object.assign(L.candle.set, { theme: "candle", accent: "#f0b45c", shelfMat: "walnut", backdrop: "candleRoom", headFont: "abril", lights: { style: "none", colour: "warm", on: false }, ornament: { kind: "pillars", pos: "end" } });
  Object.assign(L.teahouse.set, { backdrop: "teaNight" });
  D.PALETTES.cottageWarm = { label: "Butter cream", t: ["#ecd8b8", "#3a2618", "#e4ccaa", "#f6ead6", "#dcc29c", "#7a5e46", "#d2b68e", "#d8be98", "#c4a47a", "light"] };
  Object.assign(L.cottage.set, { theme: "cottageWarm", accent: "#c9707f", shelfMat: "paintedWhite", backdrop: "cottageRoses", headFont: "fell" });
  Object.assign(L.candle.set, { backdrop: "galleryWall" });
  Object.assign(L.castle.set, { backdrop: "castleIvy" });
  D.BACKDROPS.enchanted.fx = "motes fog";
  Object.assign(L.vampire.set, { backdrop: "vampireMirror", lights: { style: "none", colour: "warm", on: false } });
  Object.assign(L.academia.set, { theme: "library", accent: "#c9a25b", shelfMat: "walnut", backdrop: "study", headFont: "fell", lights: { style: "none", colour: "warm", on: false } });
  D.BACKDROPS.greenDamask.fx = "drapesGreen";
  D.BACKDROPS.damask.fx = "drapesRed";

  /** Heavy velvet curtains with a fringed swag across the top, tied back at both edges. */
  const ROPE_TIE = `<div class="tie rope"><i class="band"></i><i class="tassel"><b></b></i></div>`;
  function drapesFx(col, gold, cls = "") {
    const side = (flip) => `<div class="fxDrape${flip ? " r" : ""} ${cls}"><svg viewBox="0 0 120 860" preserveAspectRatio="none" aria-hidden="true">${drape(0, 120, false, 0, 860, col, 470)}</svg>${ROPE_TIE}</div>`;
    const swag = `<div class="fxSwag"><svg viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">${Array.from({ length: 5 }, (_, i) => `<path d="M${i * 80 - 4} 0 h88 v14 Q${i * 80 + 40} 58 ${i * 80 - 4} 14Z" fill="${i % 2 ? col[1] : col[0]}"/><path d="M${i * 80 - 4} 14 Q${i * 80 + 40} 58 ${i * 80 + 84} 14" stroke="${gold}" stroke-width="2.4" fill="none"/>`).join("")}<rect x="0" y="0" width="400" height="5" fill="${gold}"/></svg></div>`;
    return side(false) + side(true) + swag;
  }

  // ------------------------------------------------------------------ moving pieces
  const FX = {
    // dust drifting through lamplight
    dust: () => { const R = rng(4); let o = `<i class="fxBeam"></i>`; for (let i = 0; i < 22; i++) o += `<i class="mote dust" style="left:${f1(R() * 70)}%;top:${f1(30 + R() * 65)}%;--c:#ffd9a0;--s:${f1(1 + R() * 1.8)}px;--t:${f1(14 + R() * 14)}s;--p:${f1(3 + R() * 3)}s;--d:-${f1(R() * 20)}s;--dx:${f1((R() - 0.5) * 60)}px;--dy:${f1(-20 - R() * 60)}px"></i>`; return o; },
    // a stone fireplace in the corner with a living fire and sparks
    fire: () => {
      const R = rng(9); let sparks = "";
      for (let i = 0; i < 10; i++) sparks += `<i class="spark" style="left:${f1(30 + R() * 40)}%;--t:${f1(2.2 + R() * 2)}s;--d:-${f1(R() * 4)}s;--dx:${f1((R() - 0.5) * 40)}px"></i>`;
      const flames = [[50, 1, "#ff7a1a"], [38, 0.75, "#ff5a10"], [62, 0.8, "#ff6a14"], [50, 0.62, "#ffd36a"], [44, 0.45, "#fff0b0"]].map(([x, s, c], i) => `<path class="fl" style="--d:-${(i * 0.37).toFixed(2)}s" d="M${x} 150 C${x - 18 * s} 140 ${x - 14 * s} ${150 - 60 * s} ${x} ${150 - 90 * s} C${x + 4 * s} ${150 - 60 * s} ${x + 20 * s} ${150 - 40 * s} ${x + 14 * s} 150Z" fill="${c}"/>`).join("");
      return `<div class="fxFire"><div class="fireGlow"></div><svg viewBox="0 0 100 190" aria-hidden="true"><path d="M0 190 V40 H100 V190Z" fill="#3a2a22"/>${Array.from({ length: 10 }, (_, r) => Array.from({ length: 4 }, (_, k) => `<rect x="${(r % 2 ? -12 : 0) + k * 25 + 1}" y="${40 + r * 15 + 1}" width="23" height="13" fill="${["#6a3a28", "#7a4630", "#5a3020"][(r + k) % 3]}"/>`).join("")).join("")}<path d="M16 190 V92 Q50 70 84 92 V190Z" fill="#0c0604"/><rect x="-4" y="30" width="108" height="12" fill="#2a170c"/><g class="flames">${flames}</g><rect x="24" y="148" width="52" height="8" rx="3" fill="#2a140a"/><rect x="30" y="144" width="40" height="6" rx="3" fill="#3a1c0c" transform="rotate(-8 50 147)"/></svg>${sparks}</div>`;
    },
    // a close-up of a stone fireplace filling the bottom of the screen, fire dancing inside
    hearth: () => {
      const R = rng(19);
      let stones = "";
      for (let y = 0, r = 0; y < 200; y += 26, r++) for (let x = r % 2 ? -24 : 0; x < 420; x += 44 + Math.floor(R() * 10)) stones += `<rect x="${x + 1.5}" y="${y + 1.5}" width="${40 + Math.floor(R() * 8)}" height="23" rx="6" fill="${["#5a4a40", "#4a3c34", "#665446", "#3e322c"][Math.floor(R() * 4)]}"/>`;
      const flames = [[200, 1.25, "#ff6a10"], [160, 0.95, "#ff5a0c"], [240, 1, "#ff6a14"], [128, 0.7, "#ff7a1a"], [272, 0.72, "#ff7a1a"], [200, 0.85, "#ffb030"], [178, 0.6, "#ffd36a"], [222, 0.62, "#ffd36a"], [200, 0.42, "#fff0b0"]]
        .map(([x, sc, c], i) => `<path class="fl" style="--d:-${(i * 0.23).toFixed(2)}s;--t:${(0.9 + (i % 3) * 0.25).toFixed(2)}s" d="M${x - 30 * sc} 196 C${x - 40 * sc} ${196 - 50 * sc} ${x - 12 * sc} ${196 - 80 * sc} ${x} ${196 - 120 * sc} C${x + 6 * sc} ${196 - 80 * sc} ${x + 40 * sc} ${196 - 60 * sc} ${x + 30 * sc} 196Z" fill="${c}"/>`).join("");
      let sparks = ""; for (let i = 0; i < 12; i++) sparks += `<i class="spark" style="left:${f1(35 + R() * 30)}%;--t:${f1(2 + R() * 2.4)}s;--d:-${f1(R() * 4)}s;--dx:${f1((R() - 0.5) * 60)}px"></i>`;
      return `<div class="fxHearth"><div class="fireGlow"></div><svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><radialGradient id="hb" cx=".5" cy="1" r=".8"><stop offset="0" stop-color="#3a1404"/><stop offset="1" stop-color="#080302"/></radialGradient></defs>`
        + `<rect width="400" height="200" fill="#2e2620"/>${stones}<rect x="0" y="0" width="400" height="16" fill="#3a2010"/><rect x="0" y="14" width="400" height="3" fill="#1a0d06"/>`
        + `<path d="M84 200 V86 Q200 40 316 86 V200Z" fill="url(#hb)"/><path d="M84 200 V86 Q200 40 316 86 V200" stroke="#2a201a" stroke-width="6" fill="none"/>`
        + `<g class="flames">${flames}</g><rect x="120" y="184" width="160" height="12" rx="6" fill="#2a1408"/><rect x="132" y="176" width="136" height="11" rx="5" fill="#3a1c0c" transform="rotate(-5 200 182)"/><rect x="110" y="194" width="180" height="6" fill="#ff7a1a" opacity=".55"/></svg>${sparks}</div>`;
    },
    // low drifting fog in three layers
    fog: () => `<i class="fog f1"></i><i class="fog f2"></i><i class="fog f3"></i>`,
    // warm specks of light floating in the air
    glowmotes: () => { const R = rng(31); let o = ""; for (let i = 0; i < 22; i++) o += `<i class="mote" style="left:${f1(R() * 100)}%;top:${f1(10 + R() * 85)}%;--c:${R() > 0.25 ? "#ffcf7a" : "#ffe8b8"};--s:${f1(2 + R() * 3)}px;--t:${f1(10 + R() * 12)}s;--p:${f1(2 + R() * 3)}s;--d:-${f1(R() * 20)}s;--dx:${f1((R() - 0.5) * 90)}px;--dy:${f1(-40 - R() * 110)}px"></i>`; return o; },
    // a cluster of church candles on the mantel
    candles: () => {
      const C = [[18, 60, 9], [36, 92, 11], [56, 72, 10], [76, 110, 12], [98, 66, 9], [116, 84, 10], [134, 54, 8]];
      const body = C.map(([x, h, w], i) => {
        const top = 170 - h;
        return `<rect x="${x - w}" y="${top}" width="${w * 2}" height="${h}" rx="2" fill="url(#wax)"/><path d="M${x - w} ${top + 3} q2 ${8 + (i % 3) * 5} 0 ${14 + (i % 2) * 8} M${x + w * 0.4} ${top + 2} q1.5 ${6 + (i % 2) * 6} -.5 ${10 + (i % 3) * 4}" stroke="#f3e6cc" stroke-width="3" stroke-linecap="round" fill="none"/>`
          + `<line x1="${x}" y1="${top}" x2="${x}" y2="${top - 4}" stroke="#1a100a" stroke-width="1.2"/><g class="cfl" style="--d:-${(i * 0.29).toFixed(2)}s"><path d="M${x} ${top - 22} C${x + 6} ${top - 13} ${x + 5} ${top - 3} ${x} ${top - 2.5} C${x - 5} ${top - 3} ${x - 6} ${top - 13} ${x} ${top - 22}Z" fill="#ffc861"/><path d="M${x} ${top - 14} C${x + 2.4} ${top - 9} ${x + 2} ${top - 4} ${x} ${top - 3.5} C${x - 2} ${top - 4} ${x - 2.4} ${top - 9} ${x} ${top - 14}Z" fill="#fffbe6"/></g>`;
      }).join("");
      return `<div class="fxCandles"><div class="candleGlow"></div><svg viewBox="0 0 152 174" aria-hidden="true"><defs><linearGradient id="wax" x1="0" x2="1"><stop offset="0" stop-color="#b8a07a"/><stop offset=".45" stop-color="#f1e3c4"/><stop offset="1" stop-color="#a8906a"/></linearGradient></defs>${body}</svg></div>`;
    },
    // red lanterns hanging at different depths, swaying
    lanterns: () => [[6, 210, 0.4, 0], [84, 130, 0.42, 0.6], [62, 340, 0.3, 1.2], [26, 470, 0.27, 1.8]].map(([x, top, s, d]) => `<div class="fxLantern" style="left:${x}%;--s:${s};--top:${top}px;--d:-${d}s"><svg viewBox="0 0 60 150" aria-hidden="true"><line x1="30" y1="0" x2="30" y2="40" stroke="#1a0806" stroke-width="1.4"/><rect x="20" y="38" width="20" height="6" rx="2" fill="#d6a73e"/><ellipse cx="30" cy="72" rx="28" ry="30" fill="url(#lf)"/>${[0.35, 0.7, 1].map((f) => `<ellipse cx="30" cy="72" rx="${28 * f}" ry="30" fill="none" stroke="rgba(90,10,0,.45)" stroke-width=".8"/>`).join("")}<rect x="20" y="100" width="20" height="6" rx="2" fill="#d6a73e"/>${Array.from({ length: 7 }, (_, k) => `<line x1="${26 + k * 1.3}" y1="106" x2="${24 + k * 2}" y2="${136 + (k % 2) * 4}" stroke="#e0b14d" stroke-width="1"/>`).join("")}<defs><radialGradient id="lf" cx=".45" cy=".42" r=".65"><stop offset="0" stop-color="#ffc080"/><stop offset=".45" stop-color="#ff4a1f"/><stop offset="1" stop-color="#9a140a"/></radialGradient></defs></svg></div>`).join(""),
    // plum-blossom petals drifting down
    petals: () => { const R = rng(17); let o = ""; for (let i = 0; i < 14; i++) o += `<i class="petal" style="left:${f1(R() * 100)}%;--t:${f1(9 + R() * 9)}s;--d:-${f1(R() * 18)}s;--dx:${f1((R() - 0.5) * 160)}px;--r:${Math.floor(R() * 360)}deg"></i>`; return o; },
    // bats crossing the room, wings beating
    bats: () => { const R = rng(8); let o = ""; for (let i = 0; i < 7; i++) { const s = 0.5 + R() * 0.8; o += `<i class="bat" style="--y:${f1(5 + R() * 55)}%;--y2:${f1(-30 + R() * 60)}vh;--s:${f1(s)};--t:${f1(9 + R() * 10)}s;--d:-${f1(R() * 18)}s;--f:${f1(0.16 + R() * 0.1)}s;--dir:${R() > 0.5 ? 1 : -1}"><svg viewBox="0 0 60 26" aria-hidden="true"><path class="w l" d="M30 12 C24 4 14 2 2 6 C8 8 9 12 7 15 C12 12 16 14 17 18 C20 14 25 14 30 16Z"/><path class="w r" d="M30 12 C36 4 46 2 58 6 C52 8 51 12 53 15 C48 12 44 14 43 18 C40 14 35 14 30 16Z"/><ellipse cx="30" cy="14" rx="3.4" ry="5"/><path d="M27.6 10 l.8 -3 1.2 2.4 M32.4 10 l-.8 -3 -1.2 2.4"/></svg></i>`; } return o; },
    // rain running down a tall study window
    rainWindow: () => { const R = rng(12); let drops = ""; for (let i = 0; i < 40; i++) drops += `<i class="drop" style="left:${f1(R() * 100)}%;--t:${f1(0.7 + R() * 0.9)}s;--d:-${f1(R() * 2)}s;--h:${f1(10 + R() * 18)}px"></i>`; let beads = ""; for (let i = 0; i < 26; i++) beads += `<i class="bead" style="left:${f1(R() * 96)}%;top:${f1(R() * 90)}%;--t:${f1(5 + R() * 8)}s;--d:-${f1(R() * 10)}s"></i>`; return `<div class="fxWindow"><div class="pane">${[[20, 70], [62, 40], [80, 78], [35, 30], [50, 85]].map(([x, y]) => `<b style="left:${x}%;top:${y}%"></b>`).join("")}${drops}${beads}</div></div>`; },
    drapesGreen: () => drapesFx(["#0e2a1c", "#1e4a32"], "#d4af5a"),
    drapesRed: () => drapesFx(["#3a0610", "#76121f"], "#d4af5a"),
    drapesVamp: () => drapesFx(["#4a0710", "#8a1222"], "#d4af5a", "wide"),
    // a tall antique mirror; it reflects your shelves and the reflection moves as you scroll
    mirror: () => {
      const books = (window.Shelf && window.Shelf.books ? window.Shelf.books() : []).map((b) => b.spineColor).filter(Boolean);
      const cols = books.length ? books : ["#5a1a14", "#2b3550", "#3d5c4a", "#7a4a22", "#c9a6c6", "#e8dcc5"];
      const R = rng(3); let row = "", x = 14, k = 0;
      while (x < 290) { const w = 12 + R() * 20, h = 150 + R() * 70; row += `<rect x="${f1(x)}" y="${f1(296 - h)}" width="${f1(w - 1)}" height="${f1(h)}" fill="${cols[k++ % cols.length]}"/>`; x += w; }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="340" viewBox="0 0 300 340">${row}<rect x="0" y="296" width="300" height="12" fill="#3a2414"/><rect x="0" y="308" width="300" height="20" fill="#000" opacity=".4"/></svg>`;
      let url = ""; try { url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })); } catch (e) { /* no reflection */ }
      return `<div class="fxMirror"><div class="glass"><div class="refl" style="background-image:url('${url}')"></div></div></div>`;
    },
    // floral curtains tied back at both edges, always behind the text
    curtains: () => {
      const one = (flip) => `<div class="fxCurtain${flip ? " r" : ""}"><svg viewBox="0 0 100 860" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="cf${flip ? "r" : "l"}" x1="0" x2="1">${[0, 0.12, 0.24, 0.36, 0.5, 0.62, 0.76, 0.88, 1].map((o, i) => `<stop offset="${o}" stop-color="${i % 2 ? "#f0d8cc" : "#c99a94"}"/>`).join("")}</linearGradient><pattern id="cp${flip ? "r" : "l"}" width="14" height="18" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.8" fill="#c0606e" opacity=".7"/><circle cx="11" cy="13" r="1.5" fill="#8e9a64" opacity=".7"/></pattern></defs>`
        + `<path d="M0 0 H100 C96 220 60 420 34 470 C60 560 80 720 74 860 H0Z" fill="url(#cf${flip ? "r" : "l"})"/><path d="M0 0 H100 C96 220 60 420 34 470 C60 560 80 720 74 860 H0Z" fill="url(#cp${flip ? "r" : "l"})"/>`
        + `<path d="M100 0 C96 220 60 420 34 470 C60 560 80 720 74 860" stroke="#fff4ea" stroke-width="3" fill="none" stroke-dasharray="2 3" opacity=".8"/>`

        + `<rect x="0" y="0" width="100" height="5" fill="#a9843f"/></svg><div class="tie ribbon"><i class="band"></i><svg class="bow" viewBox="0 0 30 26" aria-hidden="true"><path d="M15 10 C8 0 0 2 2 10 C3 16 10 14 15 12Z M15 10 C22 0 30 2 28 10 C27 16 20 14 15 12Z" fill="#c25a72"/><path d="M14 12 l-5 13 4 -2 2 3Z M16 12 l5 13 -4 -2 -2 3Z" fill="#a8465e"/><circle cx="15" cy="11" r="3" fill="#d97a90"/></svg></div></div>`;
      return one(false) + one(true);
    },
  };
  const baseFx = D.backdropFx;
  D.backdropFx = (kinds) => String(kinds).split(" ").map((k) => (FX[k] ? FX[k]() : baseFx(k))).join("");
})();
