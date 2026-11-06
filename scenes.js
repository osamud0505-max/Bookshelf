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
      + `<radialGradient id="warm" cx=".85" cy=".9" r=".75"><stop offset="0" stop-color="#ff8a2a" stop-opacity=".35"/><stop offset=".6" stop-color="#a04a14" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`
      + `<linearGradient id="dim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".6"/><stop offset=".4" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>`
      + `<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>`;
    return SVG(`${logs}${ceil}${win}${rug}<rect width="400" height="860" fill="url(#dim)"/>${lamp}<g filter="url(#glow)">${gl}</g>${gl}<rect width="400" height="860" fill="url(#warm)"/>`, defs);
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
    return SVG(`${bricks}<rect x="178" y="90" width="222" height="770" fill="url(#wash)"/>${ceil}${win}<rect width="400" height="860" fill="url(#dim)"/>${lamp}<g filter="url(#blur)">${glow}</g>${bulbs}`, defs);
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

  Object.assign(D.BACKDROPS, {
    libraryStacks: { label: "Library stacks", tone: "dark", fx: "dust", css: () => `${library()} center / cover no-repeat, #0d0705` },
    cabinNight: { label: "Log cabin", tone: "dark", fx: "fire", css: () => `${cabin()} center / cover no-repeat, #1e1008` },
    loftDusk: { label: "Loft at dusk", tone: "dark", css: () => `${loft()} center / cover no-repeat, #1a120e` },
    candleRoom: { label: "Candlelit room", tone: "dark", fx: "candles", css: () => `${candlelit()} center bottom / cover no-repeat, #140b07` },
    teaNight: { label: "Tea house night", tone: "dark", fx: "lanterns petals", css: () => `${teahouse()} center / cover no-repeat, #14050a` },
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
  Object.assign(L.cottage.set, { theme: "cottageEve", accent: "#e39aa6", shelfMat: "honey", backdrop: "cottageDusk" });

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
    // floral curtains tied back at both edges, always behind the text
    curtains: () => {
      const one = (flip) => `<div class="fxCurtain${flip ? " r" : ""}"><svg viewBox="0 0 100 860" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="cf${flip ? "r" : "l"}" x1="0" x2="1">${[0, 0.12, 0.24, 0.36, 0.5, 0.62, 0.76, 0.88, 1].map((o, i) => `<stop offset="${o}" stop-color="${i % 2 ? "#f0d8cc" : "#c99a94"}"/>`).join("")}</linearGradient><pattern id="cp${flip ? "r" : "l"}" width="14" height="18" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.8" fill="#c0606e" opacity=".7"/><circle cx="11" cy="13" r="1.5" fill="#8e9a64" opacity=".7"/></pattern></defs>`
        + `<path d="M0 0 H100 C96 220 60 420 34 470 C60 560 80 720 74 860 H0Z" fill="url(#cf${flip ? "r" : "l"})"/><path d="M0 0 H100 C96 220 60 420 34 470 C60 560 80 720 74 860 H0Z" fill="url(#cp${flip ? "r" : "l"})"/>`
        + `<path d="M100 0 C96 220 60 420 34 470 C60 560 80 720 74 860" stroke="#fff4ea" stroke-width="3" fill="none" stroke-dasharray="2 3" opacity=".8"/>`
        + `<path d="M0 462 Q22 452 40 466 Q22 480 0 474Z" fill="#9a4a5a"/><circle cx="40" cy="468" r="5" fill="#b85a6c"/><path d="M40 468 q8 10 4 22 M40 468 q-4 12 2 22" stroke="#9a4a5a" stroke-width="2.6" fill="none"/>`
        + `<rect x="0" y="0" width="100" height="5" fill="#a9843f"/></svg></div>`;
      return one(false) + one(true);
    },
  };
  const baseFx = D.backdropFx;
  D.backdropFx = (kinds) => String(kinds).split(" ").map((k) => (FX[k] ? FX[k]() : baseFx(k))).join("");
})();
