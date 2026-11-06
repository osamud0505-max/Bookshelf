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
    for (let i = 0; i < 20; i++) { const x = 60 + i * 14 + R() * 6, w = 10 + R() * 16, h = 60 + R() * 170; city += `<rect x="${f1(x)}" y="${f1(580 - h)}" width="${f1(w)}" height="${f1(h)}" fill="#141626"/>`; for (let k = 0; k < h / 9; k++) if (R() < 0.35) city += `<rect x="${f1(x + 2 + R() * (w - 4))}" y="${f1(580 - h + 4 + k * 9)}" width="1.6" height="2.2" fill="#ffd98a" opacity=".85"/>`; }
    let win = `<rect x="64" y="120" width="272" height="466" fill="#0e0e12"/><g clip-path="url(#pane)"><rect x="70" y="126" width="260" height="454" fill="url(#dusk)"/>${city}</g>`;
    for (let x = 70; x <= 330; x += 65) win += `<rect x="${x - 1.5}" y="126" width="3" height="454" fill="#0e0e12"/>`;
    for (let y = 126; y <= 580; y += 64.8) win += `<rect x="70" y="${f1(y - 1.5)}" width="260" height="3" fill="#0e0e12"/>`;
    win += `<rect x="58" y="584" width="284" height="8" fill="#3a3a3e"/>`;
    // string of Edison bulbs across the top of the wall
    let bulbs = `<path d="M178 118 Q240 150 300 122 Q350 148 400 124" stroke="#0e0e10" stroke-width="1.2" fill="none"/>`, glow = "";
    for (let i = 0; i < 9; i++) { const t = i / 8, x = 184 + t * 212, y = 120 + Math.sin(t * Math.PI * 2) * 0 + (t < 0.55 ? Math.sin(t / 0.55 * Math.PI) * 22 : Math.sin((t - 0.55) / 0.45 * Math.PI) * 18); bulbs += `<line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x)}" y2="${f1(y + 8)}" stroke="#0e0e10"/><ellipse cx="${f1(x)}" cy="${f1(y + 12)}" rx="2.6" ry="3.6" fill="#ffd27a"/>`; glow += `<circle cx="${f1(x)}" cy="${f1(y + 12)}" r="16" fill="#ffb34a" opacity=".5"/>`; }
    // monstera leaves and an arc floor lamp by the window
    let plant = "";
    for (let i = 0; i < 7; i++) { const a = -70 + i * 22 + R() * 8, x = 150 + Math.cos(a * Math.PI / 180) * 10, y = 700; plant += `<path d="M150 760 Q${f1(x)} ${f1(y)} ${f1(150 + Math.sin(a * Math.PI / 180) * 90)} ${f1(650 - Math.cos(a * Math.PI / 180) * 40)}" stroke="#0e1a10" stroke-width="2" fill="none"/><ellipse cx="${f1(150 + Math.sin(a * Math.PI / 180) * 90)}" cy="${f1(650 - Math.cos(a * Math.PI / 180) * 40)}" rx="30" ry="18" transform="rotate(${f1(a)} ${f1(150 + Math.sin(a * Math.PI / 180) * 90)} ${f1(650 - Math.cos(a * Math.PI / 180) * 40)})" fill="#12241a"/>`; }
    const lamp = `<path d="M40 860 L40 640 Q40 600 80 590" stroke="#18181c" stroke-width="3" fill="none"/><path d="M74 580 l22 4 l-6 16 l-20 -6Z" fill="#26262a"/><ellipse cx="95" cy="640" rx="120" ry="110" fill="url(#lampGlow)"/>`;
    const defs = `<linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2048"/><stop offset=".45" stop-color="#4c3c78"/><stop offset=".72" stop-color="#b0627a"/><stop offset="1" stop-color="#e89a6a"/></linearGradient>`
      + `<clipPath id="pane"><rect x="70" y="126" width="260" height="454"/></clipPath>`
      + `<radialGradient id="lampGlow"><stop offset="0" stop-color="#ffcf80" stop-opacity=".4"/><stop offset="1" stop-color="#ffcf80" stop-opacity="0"/></radialGradient>`
      + `<linearGradient id="wash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb060" stop-opacity=".28"/><stop offset=".3" stop-color="#ff9a40" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`
      + `<linearGradient id="dim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".4"/><stop offset=".5" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></linearGradient>`
      + `<filter id="blur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7"/></filter>`;
    return SVG(`${bricks}<rect x="0" y="90" width="400" height="770" fill="url(#wash)"/>${ceil}${win}<rect width="400" height="860" fill="url(#dim)"/>`, defs);
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
    // a full moon: soft halo, a bright limb, darker seas and a few craters
    const moon = `<circle cx="290" cy="210" r="120" fill="url(#halo)"/><circle cx="290" cy="210" r="36" fill="url(#moonG)"/>`
      + `<g clip-path="url(#moonC)" opacity=".9"><ellipse cx="278" cy="198" rx="12" ry="9" fill="#b8a78e" opacity=".55"/><ellipse cx="300" cy="222" rx="10" ry="7" fill="#b8a78e" opacity=".5"/><ellipse cx="270" cy="222" rx="6" ry="5" fill="#c2b296" opacity=".5"/><ellipse cx="303" cy="196" rx="5" ry="4" fill="#bfae94" opacity=".45"/>`
      + `<circle cx="288" cy="230" r="2.6" fill="none" stroke="#a8977e" stroke-width="1" opacity=".6"/><circle cx="310" cy="208" r="2" fill="none" stroke="#a8977e" stroke-width=".9" opacity=".6"/><circle cx="276" cy="186" r="1.6" fill="none" stroke="#a8977e" stroke-width=".8" opacity=".6"/>`
      + `<circle cx="${290 + 8}" cy="${210 + 6}" r="36" fill="url(#terminator)"/></g><circle cx="290" cy="210" r="36" fill="none" stroke="#fffaf0" stroke-width=".8" opacity=".6"/>`;
    const defs = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14050a"/><stop offset=".5" stop-color="#2a0a0a"/><stop offset="1" stop-color="#0c0303"/></linearGradient>`
      + `<linearGradient id="paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8742a" stop-opacity=".55"/><stop offset=".6" stop-color="#e8a050" stop-opacity=".45"/><stop offset="1" stop-color="#7a3010" stop-opacity=".35"/></linearGradient>`
      + `<radialGradient id="halo"><stop offset=".25" stop-color="#fff2d8" stop-opacity=".35"/><stop offset=".45" stop-color="#ffd9a0" stop-opacity=".12"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></radialGradient>`
      + `<radialGradient id="moonG" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#fffdf6"/><stop offset=".6" stop-color="#f3ead4"/><stop offset="1" stop-color="#d9c9a8"/></radialGradient>`
      + `<radialGradient id="terminator" cx=".3" cy=".3" r=".9"><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3a2a1a" stop-opacity=".35"/></radialGradient>`
      + `<clipPath id="moonC"><circle cx="290" cy="210" r="36"/></clipPath>`
      + `<linearGradient id="mid" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".22" stop-color="#000" stop-opacity=".55"/><stop offset=".78" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`;
    return SVG(`<rect width="400" height="860" fill="url(#sky)"/>${screen(0, 72)}${screen(328, 72)}<rect width="400" height="860" fill="url(#mid)"/>${moon}${roof}`, defs);
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
  function painting(R, x, y, w, h, kind, fwSet) {
    const g = `pf${Math.floor(R() * 1e6)}`;
    const fw = fwSet || Math.max(5, Math.min(w, h) * 0.09);
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
    // one painting, the Mona Lisa, centred on the wall in a large frame at its real proportions (0.69 : 1)
    const FW = 13, IW = 190, IH = Math.round(IW / 0.69), W = IW + FW * 2, H = IH + FW * 2;
    const frames = [[Math.round((400 - W) / 2), Math.round((640 - H) / 2), W, H, "portrait", FW]];
    let wall = `<rect width="400" height="860" fill="#2a1410"/>`;
    for (let x = 0; x < 400; x += 16) wall += `<rect x="${x}" y="0" width="8" height="640" fill="#331a14" opacity=".55"/>`;
    const art = frames.map(([x, y, w, h, k, fw]) => `<rect x="${x + 3}" y="${y + 5}" width="${w}" height="${h}" fill="#000" opacity=".45" filter="url(#sh)"/>` + painting(R, x, y, w, h, k, fw)).join("");
    const dado = `<rect x="0" y="640" width="400" height="12" fill="#3a2214"/><rect x="0" y="640" width="400" height="2" fill="#a9843f" opacity=".5"/><rect x="0" y="652" width="400" height="208" fill="#160c08"/>` + [10, 140, 270].map((x) => `<rect x="${x}" y="676" width="120" height="150" fill="none" stroke="#2a1810" stroke-width="3"/>`).join("");
    const defs = `<linearGradient id="gilt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6a4a1c"/><stop offset=".3" stop-color="#d4b060"/><stop offset=".5" stop-color="#8a6a2c"/><stop offset=".75" stop-color="#c9a24e"/><stop offset="1" stop-color="#4a3414"/></linearGradient>`
      + `<linearGradient id="varnish" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".08"/><stop offset=".5" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>`
      + `<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>`
      + `<radialGradient id="cl" cx=".5" cy=".95" r=".85"><stop offset="0" stop-color="#ffb060" stop-opacity=".38"/><stop offset=".5" stop-color="#a04a14" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`
      + `<linearGradient id="dim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".72"/><stop offset=".5" stop-color="#000" stop-opacity=".48"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>`;
    return SVG(`${wall}${art}${dado}<rect width="400" height="860" fill="url(#dim)"/><rect width="400" height="860" fill="url(#cl)"/>`, defs);
  });

  // the mirror has been struck: shards radiate from one point, and blood seeps out of the cracks and runs down
  function crackedGlass() {
    const R = rng(13), cx = 58, cy = 74, rays = [];
    const n = 11;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (R() - 0.5) * 0.35, len = 34 + R() * 70, pts = [[cx, cy]];
      let x = cx, y = cy, ang = a;
      for (let k = 1; k <= 6; k++) { ang += (R() - 0.5) * 0.3; const step = len / 6; x += Math.cos(ang) * step; y += Math.sin(ang) * step; pts.push([x, y]); }
      rays.push(pts);
    }
    const path = (pts) => "M" + pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join(" L");
    // shards: wedges between neighbouring rays, each catching the light a little differently
    let shards = "";
    for (let i = 0; i < n; i++) {
      const A = rays[i], B = rays[(i + 1) % n];
      shards += `<path d="${path([...A.slice(0, 5), ...B.slice(0, 5).reverse()])}Z" fill="${i % 3 === 0 ? "rgba(255,255,255,.05)" : i % 3 === 1 ? "rgba(0,0,0,.18)" : "rgba(120,110,140,.06)"}"/>`;
    }
    // rings of cracks joining the rays
    let rings = "";
    [1, 2, 4].forEach((k) => { let d = ""; for (let i = 0; i < n; i++) { if (R() < 0.25) continue; const p1 = rays[i][k], p2 = rays[(i + 1) % n][k]; d += `M${f1(p1[0])} ${f1(p1[1])} Q${f1((p1[0] + p2[0]) / 2 + (R() - 0.5) * 6)} ${f1((p1[1] + p2[1]) / 2 + (R() - 0.5) * 6)} ${f1(p2[0])} ${f1(p2[1])} `; } rings += `<path d="${d}"/>`; });
    const cracks = rays.map((r) => `<path d="${path(r)}"/>`).join("") + rings;
    // blood: thick near the impact, thinning along the cracks, then drips running down
    let blood = "", drips = "";
    [0, 2, 3, 5, 7, 9].forEach((i, j) => {
      const r = rays[i], upto = 2 + (j % 3);
      blood += `<path d="${path(r.slice(0, upto + 1))}" stroke-width="${f1(1.2 - j * 0.12)}"/>`;
      const [x, y] = r[upto], h = 18 + R() * 50;
      drips += `<path class="drip" style="--d:${f1(j * 1.7 + R() * 2)}s;--t:${f1(14 + R() * 8)}s" d="M${f1(x)} ${f1(y)} C${f1(x + 0.6)} ${f1(y + h * 0.4)} ${f1(x - 0.8)} ${f1(y + h * 0.7)} ${f1(x)} ${f1(y + h)}" pathLength="1"/>`;
    });
    return `<svg class="cracks" viewBox="0 0 120 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><filter id="bleed" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".8"/></filter><radialGradient id="pool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#5a0008"/><stop offset=".6" stop-color="#7a0612" stop-opacity=".8"/><stop offset="1" stop-color="#7a0612" stop-opacity="0"/></radialGradient></defs>`
      + shards
      + `<g class="dark" fill="none" stroke="rgba(0,0,0,.7)" stroke-width=".55" stroke-linejoin="round">${cracks}</g>`
      + `<g class="lit" fill="none" stroke="rgba(235,230,245,.4)" stroke-width=".18" transform="translate(.3 -.25)">${cracks}</g>`
      + `<g fill="none" stroke="#8a0a16" stroke-linecap="round" stroke-linejoin="round" filter="url(#bleed)" opacity=".85">${blood}</g>`
      + `<g fill="none" stroke="#6e0410" stroke-linecap="round" stroke-linejoin="round">${blood}</g>`
      + `<g class="drips" fill="none" stroke="#760611" stroke-width=".8" stroke-linecap="round">${drips}</g>`
      + `<circle cx="${cx}" cy="${cy}" r="5" fill="url(#pool)"/><circle cx="${cx}" cy="${cy}" r="1.2" fill="#2a0004"/></svg>`;
  }
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
      + `<linearGradient id="dim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".62"/><stop offset=".5" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity=".72"/></linearGradient>`;
    let damask = ""; for (let y = 20, r = 0; y < 860; y += 60, r++) for (let x = r % 2 ? 0 : 30; x < 420; x += 60) damask += `<path d="M${x} ${y - 18} q10 10 0 18 q-10 8 0 18 q-10 -8 -14 -18 q4 -10 14 -18Z M${x} ${y - 18} q-10 10 0 18 q10 8 0 18 q10 -8 14 -18 q-4 -10 -14 -18Z" fill="#3a0a14" opacity=".55"/>`;
    return SVG(`<rect width="400" height="860" fill="#110307"/>${damask}${lace}<rect width="400" height="860" fill="url(#g)"/><rect width="400" height="860" fill="url(#dim)"/>`, defs);
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
    teaNight: { label: "Tea house night", tone: "dark", fx: "petals", css: () => `${teahouse()} center / cover no-repeat, #14050a` },
    castleIvy: { label: "Ivy-covered stone", tone: "dark", fx: "fog", css: () => `${castle()} center / cover no-repeat, #1a1b20` },
    galleryWall: { label: "Gallery wall", tone: "dark", css: () => `${candlelit2()} center / cover no-repeat, #1a0c08` },
    vampireMirror: { label: "Velvet & mirror", tone: "dark", fx: "mirror drapesVamp fog bats vampGloom", css: () => `${vampire()} center / cover no-repeat, #12050a` },
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
  D.BACKDROPS.enchanted.fx = "motes fogThick";
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

  // ------------------------------------------------------------------ reading pages to match each look (you can still pick others in the reader)
  D.READER_PAGES = {
    minimal: { bg: "#f6f1e7", fg: "#2b2620" }, cabin: { bg: "#f1e2c6", fg: "#3a2614" }, nook: { bg: "#f6e7c8", fg: "#3e2c18" },
    library: { bg: "#e9dcbf", fg: "#2e2216" }, loft: { bg: "#26211e", fg: "#e6dccf" }, starry: { bg: "#0f1528", fg: "#cfd8ee" },
    cottage: { bg: "#f8ece2", fg: "#4a2e2a" }, candle: { bg: "#241810", fg: "#f0d9b0" }, vampire: { bg: "#1a0a0d", fg: "#e8cfc8" },
    victorian: { bg: "#efe6d2", fg: "#253626" }, castle: { bg: "#1c1d22", fg: "#cfd2da" }, bordello: { bg: "#f3e3d6", fg: "#4a1420" },
    forest: { bg: "#0f1a1a", fg: "#cfe8df" }, academia: { bg: "#e6d8bc", fg: "#2a1e14" }, teahouse: { bg: "#f3e6cf", fg: "#5a1a10" },
  };

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
    fogThick: () => `<i class="fog f1 thick"></i><i class="fog f2 thick"></i><i class="fog f3 thick"></i><i class="fog f4"></i><i class="fog f5"></i>`,
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
    bats: () => {
      // real bat shapes: finger bones fanning through a scalloped membrane, ears, a furry body.
      // a few fly close (big, soft, quick), most stay far off in the dark
      const R = rng(8); let o = "";
      const wing = `<path d="M56 19 C48 9 32 3 12 6 C9 13 5 20 2 27 C9 26 13 29 15 35 C21 31 27 33 31 39 C36 33 42 32 46 35 C48 30 52 27 56 27Z"/>`
        + `<path class="bone" d="M56 19 L30 7 M30 7 L12 6 M30 7 L3 26 M30 7 L15 34 M30 7 L31 38" />`;
      for (let i = 0; i < 9; i++) {
        const near = i < 2, s = near ? 1.7 + R() * 0.6 : 0.55 + R() * 0.75;
        o += `<i class="bat${near ? " near" : ""}" style="--y:${f1(4 + R() * 50)}%;--y2:${f1(-25 + R() * 50)}vh;--s:${f1(s)};--t:${f1(near ? 6 + R() * 3 : 11 + R() * 10)}s;--d:-${f1(R() * 20)}s;--f:${f1(near ? 0.13 + R() * 0.04 : 0.17 + R() * 0.08)}s;--dir:${R() > 0.5 ? 1 : -1}">`
          + `<svg viewBox="0 0 120 48" aria-hidden="true"><g class="flyer"><g class="w l">${wing}</g><g class="w r"><g transform="translate(120 0) scale(-1 1)">${wing}</g></g>`
          + `<path d="M55 22 C55 14 65 14 65 22 C66 30 63 38 60 40 C57 38 54 30 55 22Z"/><circle cx="60" cy="15" r="4.6"/>`
          + `<path d="M56 13 L55 5 L59 11Z M64 13 L65 5 L61 11Z"/><circle class="eye" cx="58.3" cy="15" r=".7"/><circle class="eye" cx="61.7" cy="15" r=".7"/>`
          + `<path class="bone" d="M58 40 l-1 4 M62 40 l1 4"/></g></svg></i>`;
      }
      return o;
    },
    // the vampire room's gloom: heavy dark corners and a slow red breath of candlelight from below
    vampGloom: () => `<i class="vampGloom"></i><i class="vampEmber"></i>`,
    // rain running down a tall study window
    rainWindow: () => {
      const R = rng(12); let drops = ""; for (let i = 0; i < 70; i++) drops += `<i class="drop" style="left:${f1(R() * 100)}%;--t:${f1(0.7 + R() * 0.9)}s;--d:-${f1(R() * 2)}s;--h:${f1(10 + R() * 18)}px"></i>`;
      let beads = ""; for (let i = 0; i < 40; i++) beads += `<i class="bead" style="left:${f1(R() * 96)}%;top:${f1(14 + R() * 82)}%;--t:${f1(5 + R() * 8)}s;--d:-${f1(R() * 10)}s"></i>`;
      const arch = "M0 190 V70 C0 34 22 10 50 0 C78 10 100 34 100 70 V190Z";
      const stone = "#2a1d14";
      // gothic tracery: two pointed lancets under a quatrefoil, with a transom
      const tracery = `<svg class="tracery" viewBox="0 0 100 190" preserveAspectRatio="none" aria-hidden="true">`
        + `<path d="${arch}" fill="none" stroke="${stone}" stroke-width="7"/>`
        + `<path d="M50 62 V190" stroke="${stone}" stroke-width="4"/>`
        + `<path d="M6 190 V96 C6 80 16 68 28 62 C40 68 50 80 50 96 M50 96 C50 80 60 68 72 62 C84 68 94 80 94 96 V190" stroke="${stone}" stroke-width="3" fill="none"/>`
        + `<circle cx="50" cy="38" r="13" fill="none" stroke="${stone}" stroke-width="3"/>`
        + [[50, 29], [59, 38], [50, 47], [41, 38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.4" fill="none" stroke="${stone}" stroke-width="1.8"/>`).join("")
        + `<path d="M0 140 H100" stroke="${stone}" stroke-width="3"/><path d="M28 96 V190 M72 96 V190" stroke="${stone}" stroke-width="1.2" opacity=".8"/>`
        + `<path d="M6 118 H94 M6 164 H94" stroke="${stone}" stroke-width="1" opacity=".7"/>`
        + `<path d="M-4 190 V68 C-4 30 20 4 50 -6 C80 4 104 30 104 68 V190" stroke="#160d08" stroke-width="5" fill="none"/></svg>`;
      return `<div class="fxWindow gothic"><svg width="0" height="0" style="position:absolute"><clipPath id="gothArch" clipPathUnits="objectBoundingBox"><path d="M0 1 V0.368 C0 0.179 0.22 0.053 0.5 0 C0.78 0.053 1 0.179 1 0.368 V1Z"/></clipPath></svg><div class="pane">${[[30, 70], [62, 50], [80, 82], [35, 40], [52, 88]].map(([x, y]) => `<b style="left:${x}%;top:${y}%"></b>`).join("")}${drops}${beads}</div>${tracery}</div>`;
    },
    drapesGreen: () => drapesFx(["#0e2a1c", "#1e4a32"], "#d4af5a"),
    drapesRed: () => drapesFx(["#3a0610", "#76121f"], "#d4af5a"),
    drapesVamp: () => drapesFx(["#4a0710", "#8a1222"], "#d4af5a", "wide"),
    // a tall antique mirror: old silvered glass, dim and still
    mirror: () => `<div class="fxMirror"><div class="glass"><i class="spots"></i>${crackedGlass()}</div></div>`,
    // floral curtains tied back at both edges, always behind the text
    curtains: () => {
      const one = (flip) => `<div class="fxCurtain${flip ? " r" : ""}"><svg viewBox="0 0 100 860" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="cf${flip ? "r" : "l"}" x1="0" x2="1">${[0, 0.12, 0.24, 0.36, 0.5, 0.62, 0.76, 0.88, 1].map((o, i) => `<stop offset="${o}" stop-color="${i % 2 ? "#f0d8cc" : "#c99a94"}"/>`).join("")}</linearGradient><pattern id="cp${flip ? "r" : "l"}" width="14" height="18" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.8" fill="#c0606e" opacity=".7"/><circle cx="11" cy="13" r="1.5" fill="#8e9a64" opacity=".7"/></pattern></defs>`
        + `<path d="M0 0 H100 C96 220 60 420 34 470 C60 560 80 720 74 860 H0Z" fill="url(#cf${flip ? "r" : "l"})"/><path d="M0 0 H100 C96 220 60 420 34 470 C60 560 80 720 74 860 H0Z" fill="url(#cp${flip ? "r" : "l"})"/>`
        + `<path d="M100 0 C96 220 60 420 34 470 C60 560 80 720 74 860" stroke="#fff4ea" stroke-width="3" fill="none" stroke-dasharray="2 3" opacity=".8"/>`

        + `<rect x="0" y="0" width="100" height="5" fill="#a9843f"/></svg><div class="tie ribbon"><i class="band"></i><svg class="bow" viewBox="0 0 30 26" aria-hidden="true"><path d="M15 10 C8 0 0 2 2 10 C3 16 10 14 15 12Z M15 10 C22 0 30 2 28 10 C27 16 20 14 15 12Z" fill="#c25a72"/><path d="M14 12 l-5 13 4 -2 2 3Z M16 12 l5 13 -4 -2 -2 3Z" fill="#a8465e"/><circle cx="15" cy="11" r="3" fill="#d97a90"/></svg></div></div>`;
      return one(false) + one(true);
    },
  };

  // ------------------------------------------------------------------ Fireworks over the tea house: a few at a time, spaced out, soft trails
  FX.fireworks = () => { setTimeout(startFireworks, 0); return `<canvas class="fxFireworks" aria-hidden="true"></canvas>`; };
  function startFireworks() {
    const cv = document.querySelector("#backdrop .fxFireworks");
    if (!cv || cv._running || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cv._running = true;
    const ctx = cv.getContext("2d");
    const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0;
    const size = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener("resize", size);
    const COLS = [["#ffd27a", "#fff3d6"], ["#ff8fb4", "#ffe0ea"], ["#9ff2e2", "#effffb"], ["#c9a6ff", "#f2e8ff"], ["#ff6a52", "#ffd9a8"], ["#fff1dc", "#ffffff"]];
    const shells = [], sparks = [];
    let next = 900, last = performance.now(), quiet = 0;
    const launch = () => {
      const x = W * (0.12 + Math.random() * 0.33), ty = H * (0.3 + Math.random() * 0.22);
      const g = 120, vy = -Math.sqrt(2 * g * (H - ty));
      shells.push({ x, y: H + 4, vx: (Math.random() - 0.5) * 8, vy, g, kind: ["peony", "peony", "ring", "willow", "glitter"][Math.floor(Math.random() * 5)], col: COLS[Math.floor(Math.random() * COLS.length)] });
    };
    const burst = (s) => {
      const r = W * (0.2 + Math.random() * 0.08), n = s.kind === "ring" ? 60 : s.kind === "willow" ? 90 : 110;
      const life = s.kind === "willow" ? 2.8 : 2;
      for (let i = 0; i < n; i++) {
        let a, sp;
        if (s.kind === "ring") { a = (i / n) * Math.PI * 2; sp = r * 2.6; }
        else { a = Math.random() * Math.PI * 2; const u = Math.random() * 2 - 1; sp = r * 2.9 * Math.sqrt(1 - u * u) * (0.92 + Math.random() * 0.12); }
        const inner = s.kind !== "ring" && i % 4 === 0;
        sparks.push({ x: s.x, y: s.y, px: s.x, py: s.y, vx: Math.cos(a) * sp * (inner ? 0.45 : 1), vy: Math.sin(a) * sp * (inner ? 0.45 : 1), age: 0, life: life * (0.8 + Math.random() * 0.35), col: inner ? s.col[1] : s.col[0], drag: s.kind === "willow" ? 2.4 : 1.7, g: s.kind === "willow" ? 55 : 34, glit: s.kind === "glitter" || s.kind === "willow", w: inner ? 1.5 : 2.1 });
      }
      sparks.push({ flash: true, x: s.x, y: s.y, r: r * 1.6, age: 0, life: 0.35, col: s.col[1] });
      // let the room sound hear it (a distant boom, a moment later)
      try { dispatchEvent(new CustomEvent("shelf:firework", { detail: { kind: s.kind, x: s.x / W } })); } catch (e) { /* old browser */ }
    };
    const frame = (now) => {
      if (!cv.isConnected) { cv._running = false; removeEventListener("resize", size); return; }
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      next -= dt * 1000;
      if (next <= 0) { launch(); if (Math.random() < 0.22) setTimeout(launch, 380); next = 1600 + Math.random() * 1900; }
      // old light fades away, leaving short trails
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,.2)"; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (let i = shells.length - 1; i >= 0; i--) {
        const s = shells[i]; const ox = s.x, oy = s.y;
        s.vy += s.g * dt; s.x += s.vx * dt; s.y += s.vy * dt;
        ctx.strokeStyle = "rgba(255,214,150,.55)"; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(s.x, s.y); ctx.stroke();
        if (Math.random() < 0.5) sparks.push({ x: s.x, y: s.y, px: s.x, py: s.y, vx: (Math.random() - 0.5) * 10, vy: 10 + Math.random() * 10, age: 0, life: 0.5, col: "#ffcf8a", drag: 2, g: 20, w: 0.8 });
        if (s.vy > -12) { burst(s); shells.splice(i, 1); }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i]; p.age += dt;
        const t = p.age / p.life; if (t >= 1) { sparks.splice(i, 1); continue; }
        if (p.flash) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          g.addColorStop(0, `rgba(255,240,220,${(0.12 * (1 - t)).toFixed(3)})`); g.addColorStop(1, "rgba(255,240,220,0)");
          ctx.fillStyle = g; ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); continue;
        }
        const k = Math.exp(-p.drag * dt);
        p.vx *= k; p.vy = p.vy * k + p.g * dt;
        p.px = p.x; p.py = p.y; p.x += p.vx * dt; p.y += p.vy * dt;
        let a = Math.pow(1 - t, 1.4);
        if (p.glit && t > 0.55 && Math.random() < 0.45) a *= 0.15;
        ctx.globalAlpha = a; ctx.strokeStyle = p.col; ctx.lineWidth = p.w; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // nothing in the sky: wipe it clean so no haze builds up
      if (!sparks.length && !shells.length) { if ((quiet += dt) > 1) { ctx.clearRect(0, 0, W, H); quiet = 0; } } else quiet = 0;
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
  D.BACKDROPS.teaNight.fx = "petals fireworks";

  // ------------------------------------------------------------------ Witch's tower: dark stone, moss in the joints, a leaded window with the moon
  const ivyStrand = (R, x0, y0, len, sway = 10) => {
    let d = `M${x0} ${y0}`, x = x0, leaves = "";
    for (let y = 0; y < len; y += 20) {
      const nx = x0 + Math.sin(y / 38 + x0) * sway; d += ` Q${f1(x + (R() - 0.5) * 12)} ${f1(y0 + y + 10)} ${f1(nx)} ${f1(y0 + y + 20)}`; x = nx;
      for (const side of [-1, 1]) if (R() < 0.8) {
        const lx = nx + side * (4 + R() * 4), ly = y0 + y + 16 + R() * 6, sz = 3.4 + R() * 3.4;
        leaves += `<path d="M${f1(lx)} ${f1(ly)} c${f1(-sz)} ${f1(-sz * 0.4)} ${f1(-sz * 0.6)} ${f1(-sz * 1.5)} 0 ${f1(-sz * 1.6)} c${f1(sz * 0.6)} ${f1(sz * 0.1)} ${f1(sz)} ${f1(sz * 1.2)} 0 ${f1(sz * 1.6)}Z" fill="${["#22401c", "#2c5224", "#1b3417", "#36602a"][Math.floor(R() * 4)]}" transform="rotate(${f1(side * (20 + R() * 40))} ${f1(lx)} ${f1(ly)})"/>`;
      }
    }
    return `<path d="${d}" stroke="#1c2a14" stroke-width="1.5" fill="none"/>${leaves}`;
  };
  const witchRoom = pic("witch", () => {
    const R = rng(131);
    let stones = "", moss = "";
    for (let y = 0, r = 0; y < 860; y += 36, r++) {
      for (let x = r % 2 ? -28 : 0; x < 420;) {
        const w = 46 + Math.floor(R() * 36);
        const c = ["#26252b", "#2b2a31", "#222127", "#302e35", "#1e1d22", "#292830"][Math.floor(R() * 6)];
        stones += `<rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="32" rx="4" fill="${c}"/><rect x="${x + 4}" y="${y + 3}" width="${w - 10}" height="2.5" rx="1.2" fill="#fff" opacity=".04"/><rect x="${x + 2}" y="${y + 29}" width="${w - 4}" height="5" rx="2" fill="#000" opacity=".22"/>`;
        if (R() < 0.3) stones += `<path d="M${f1(x + 6 + R() * (w - 16))} ${y + 4} l${f1(R() * 6 - 3)} ${f1(6 + R() * 8)} l${f1(R() * 6 - 3)} ${f1(5 + R() * 8)}" stroke="#121116" stroke-width=".8" fill="none" opacity=".8"/>`;
        // moss and little sprigs growing out of the joints
        if (R() < 0.6) {
          const mx = x + R() * w, len = 10 + R() * 30;
          moss += `<path d="M${f1(mx)} ${y + 35} q${f1(len / 2)} ${f1(-3 - R() * 4)} ${f1(len)} 0" stroke="${["#2c4a20", "#36592a", "#24401b"][Math.floor(R() * 3)]}" stroke-width="${f1(3 + R() * 3)}" stroke-linecap="round" fill="none"/>`;
          for (let k = 0; k < 4; k++) moss += `<circle cx="${f1(mx + R() * len)}" cy="${f1(y + 33 + R() * 4)}" r="${f1(1 + R() * 1.8)}" fill="${R() < 0.5 ? "#4a7a36" : "#3a6a2c"}"/>`;
          if (R() < 0.35) for (let k = 0; k < 4; k++) { const sx = mx + R() * len; moss += `<path d="M${f1(sx)} ${y + 35} q${f1(R() * 6 - 3)} ${f1(-5 - R() * 6)} ${f1(R() * 8 - 4)} ${f1(-9 - R() * 8)}" stroke="#4f8a3a" stroke-width="1" fill="none"/>`; }
        }
        if (R() < 0.18) moss += `<path d="M${x + 1} ${f1(y + 4 + R() * 16)} q${f1(-2 + R() * 4)} ${f1(8 + R() * 10)} 0 ${f1(16 + R() * 12)}" stroke="#2c4a20" stroke-width="3" stroke-linecap="round" fill="none"/>`;
        x += w;
      }
    }
    // the window: a pointed arch with diamond leading, the moon behind it
    const WIN = "M128 420 V200 C128 140 160 98 200 78 C240 98 272 140 272 200 V420Z";
    const OUT = "M110 432 V196 C110 128 148 80 200 56 C252 80 290 128 290 196 V432Z";
    let stars = ""; for (let i = 0; i < 26; i++) stars += `<circle cx="${f1(130 + R() * 140)}" cy="${f1(84 + R() * 320)}" r="${f1(0.4 + R() * 0.9)}" fill="#e8eeff" opacity="${f1(0.3 + R() * 0.6)}"/>`;
    let lead = "";
    for (let k = -14; k <= 14; k++) { const x = 200 + k * 22; lead += `<path d="M${x - 220} 420 L${x + 220} -20 M${x + 220} 420 L${x - 220} -20" />`; }
    let tint = ""; for (let i = 0; i < 9; i++) tint += `<rect x="${f1(130 + R() * 130)}" y="${f1(100 + R() * 300)}" width="16" height="16" transform="rotate(45 ${f1(138 + R() * 120)} ${f1(110 + R() * 290)})" fill="${["#7fae8a", "#c8b070", "#8fa0d0"][Math.floor(R() * 3)]}" opacity=".07"/>`;
    const moon = `<circle cx="222" cy="176" r="90" fill="url(#wHalo)"/><circle cx="222" cy="176" r="30" fill="url(#wMoon)"/>`
      + `<g opacity=".85"><ellipse cx="212" cy="168" rx="10" ry="7.5" fill="#b4ab98" opacity=".5"/><ellipse cx="231" cy="187" rx="8.5" ry="6" fill="#b4ab98" opacity=".45"/><ellipse cx="206" cy="187" rx="5" ry="4" fill="#bdb39e" opacity=".45"/><circle cx="234" cy="166" r="3.4" fill="#bdb39e" opacity=".4"/><circle cx="220" cy="196" r="2" fill="none" stroke="#a49a86" stroke-width=".8" opacity=".6"/></g>`;
    let voussoirs = "";
    for (let i = 0; i <= 12; i++) { const t = i / 12, a = Math.PI * (1 - t); voussoirs += `<path d="M${f1(200 + Math.cos(a) * 88)} ${f1(200 - Math.sin(a) * 128)} L${f1(200 + Math.cos(a) * 74)} ${f1(200 - Math.sin(a) * 112)}" stroke="#141318" stroke-width="1.6"/>`; }
    const window_ = `<path d="${OUT}" fill="url(#wReveal)"/><path d="${OUT}" fill="none" stroke="#0e0d11" stroke-width="3"/>${voussoirs}`
      + `<g clip-path="url(#wClip)"><rect x="120" y="60" width="160" height="370" fill="url(#wSky)"/>${stars}${moon}${tint}<g stroke="#0c0b0e" stroke-width="2.2" fill="none">${lead}</g>`
      + `<path d="M200 70 V420 M128 262 H272" stroke="#141217" stroke-width="5"/><path d="M196 300 l8 6 -5 10" stroke="#cfd8ff" stroke-width=".6" fill="none" opacity=".5"/></g>`
      + `<path d="${WIN}" fill="none" stroke="#0a090c" stroke-width="6"/><path d="${WIN}" fill="url(#wInset)"/>`
      + `<rect x="98" y="420" width="204" height="18" rx="2" fill="#35333a"/><rect x="98" y="420" width="204" height="3" fill="#4a4850"/><rect x="98" y="436" width="204" height="6" fill="#000" opacity=".35"/>`;
    // ivy round the window and down from the top corners
    const ivy = ivyStrand(R, 112, 190, 240, 6) + ivyStrand(R, 288, 150, 300, 6) + ivyStrand(R, 150, 70, 90, 8) + ivyStrand(R, 14, -10, 420) + ivyStrand(R, 386, -10, 520) + ivyStrand(R, 52, -10, 180);
    // moonlight falling from the window into the room
    const beam = `<path d="M128 420 L272 420 L250 860 L-60 860Z" fill="url(#wBeam)" filter="url(#wSoft)"/>`;
    const defs = `<linearGradient id="wSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1230"/><stop offset=".45" stop-color="#1c2b58"/><stop offset="1" stop-color="#121a36"/></linearGradient>`
      + `<radialGradient id="wHalo"><stop offset=".3" stop-color="#e8eeff" stop-opacity=".4"/><stop offset=".55" stop-color="#b8c8ff" stop-opacity=".12"/><stop offset="1" stop-color="#b8c8ff" stop-opacity="0"/></radialGradient>`
      + `<radialGradient id="wMoon" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#fffef8"/><stop offset=".6" stop-color="#ece6d6"/><stop offset="1" stop-color="#cfc6b0"/></radialGradient>`
      + `<radialGradient id="wGlow" cx=".55" cy=".2" r=".6"><stop offset="0" stop-color="#9fb4ff" stop-opacity=".14"/><stop offset="1" stop-color="#9fb4ff" stop-opacity="0"/></radialGradient>`
      + `<linearGradient id="wReveal" x1="0" x2="1"><stop offset="0" stop-color="#1c1b20"/><stop offset=".5" stop-color="#3a3840"/><stop offset="1" stop-color="#18171b"/></linearGradient>`
      + `<linearGradient id="wInset" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset=".12" stop-color="#000" stop-opacity="0"/><stop offset=".88" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>`
      + `<linearGradient id="wBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4d2ff" stop-opacity=".13"/><stop offset="1" stop-color="#c4d2ff" stop-opacity="0"/></linearGradient>`
      + `<radialGradient id="wVig" cx=".5" cy=".3" r=".85"><stop offset=".35" stop-color="#040306" stop-opacity="0"/><stop offset="1" stop-color="#040306" stop-opacity=".85"/></radialGradient>`
      + `<linearGradient id="wPot" x1="0" y1="0" x2="0" y2="1"><stop offset=".6" stop-color="#5aff8a" stop-opacity="0"/><stop offset="1" stop-color="#5aff8a" stop-opacity=".07"/></linearGradient>`
      + `<filter id="wSoft" x="-20%" y="-10%" width="140%" height="120%"><feGaussianBlur stdDeviation="10"/></filter>`
      + `<clipPath id="wClip"><path d="${WIN}"/></clipPath>`;
    return SVG(`<rect width="400" height="860" fill="#141318"/>${stones}${moss}<rect width="400" height="860" fill="#06050a" opacity=".42"/><rect width="400" height="860" fill="url(#wGlow)"/>${window_}${ivy}${beam}<rect width="400" height="860" fill="url(#wVig)"/><rect width="400" height="860" fill="url(#wPot)"/>`, defs);
  });

  // dried flowers and herbs hung upside down from a rope across the top, each bundle swaying a little
  FX.herbs = () => {
    const R = rng(23);
    const ropeY = (x) => { const t = (x + 10) / 420; return (1 - t) * (1 - t) * 18 + 2 * t * (1 - t) * 78 + t * t * 18; };
    const bundle = (kind, len) => {
      let o = "";
      const stems = kind === "rose" ? 4 : kind === "lavender" ? 9 : 7;
      for (let i = 0; i < stems; i++) {
        const spread = (i / (stems - 1) - 0.5) * (kind === "lavender" ? 18 : 22), l = len * (0.78 + R() * 0.22), ex = spread * 1.2 + (R() - 0.5) * 4;
        o += `<path d="M0 6 Q${f1(spread * 0.5)} ${f1(l * 0.5)} ${f1(ex)} ${f1(l)}" stroke="${kind === "lavender" ? "#5a6a46" : "#5a5236"}" stroke-width=".9" fill="none"/>`;
        if (kind === "lavender") for (let k = 0; k < 7; k++) { const t = 0.6 + k * 0.06; o += `<ellipse cx="${f1(ex * t)}" cy="${f1(l * t)}" rx="1.5" ry="2.3" fill="${["#7a64a6", "#6a5694", "#8a74b0"][Math.floor(R() * 3)]}"/>`; }
        else if (kind === "rose") {
          o += `<path d="M${f1(ex * 0.5)} ${f1(l * 0.5)} q4 -1 6 3 q-4 1 -6 -3Z" fill="#4a5232"/>`;
          o += `<g transform="translate(${f1(ex)} ${f1(l)})"><ellipse rx="4.6" ry="5.4" fill="#5a1620"/><path d="M-4 -1 Q0 6 4 -1 Q2 3 0 2 Q-2 3 -4 -1Z" fill="#7a2230"/><path d="M-2.5 -3 q2.5 3 5 0" stroke="#3a0c12" stroke-width=".8" fill="none"/><path d="M-3 -5 l-1 -2 M3 -5 l1 -2 M0 -5.4 v-2" stroke="#3d4a28" stroke-width="1"/></g>`;
        } else if (kind === "herb") for (let k = 0; k < 9; k++) { const t = 0.25 + k * 0.085, px = ex * t, py = l * t, sd = k % 2 ? 1 : -1; o += `<ellipse cx="${f1(px + sd * 2.6)}" cy="${f1(py)}" rx="1.3" ry="3" transform="rotate(${sd * -35} ${f1(px + sd * 2.6)} ${f1(py)})" fill="${["#6b7a58", "#7d8a66", "#5d6b4c"][Math.floor(R() * 3)]}"/>`; }
        else if (kind === "baby") for (let k = 0; k < 6; k++) { const t = 0.55 + R() * 0.45; o += `<circle cx="${f1(ex * t + (R() - 0.5) * 6)}" cy="${f1(l * t + (R() - 0.5) * 4)}" r="${f1(1 + R() * 0.9)}" fill="${R() < 0.5 ? "#e0d6ba" : "#cfc3a2"}"/>`; }
        else if (kind === "euca") for (let k = 0; k < 6; k++) { const t = 0.3 + k * 0.12, px = ex * t, py = l * t; o += `<circle cx="${f1(px + (k % 2 ? 3 : -3))}" cy="${f1(py)}" r="${f1(2.4 + R())}" fill="${["#6f8a80", "#7f988e", "#5f786e"][Math.floor(R() * 3)]}"/>`; }
      }
      // twine wrapped round the stems
      return o + `<rect x="-3.6" y="2" width="7.2" height="7" rx="1.5" fill="#8a6a44"/><path d="M-3.6 4 h7.2 M-3.6 6.5 h7.2" stroke="#5a4428" stroke-width=".7"/>`;
    };
    const spots = [[24, "lavender"], [70, "rose"], [112, "herb"], [150, "baby"], [246, "euca"], [288, "rose"], [330, "lavender"], [372, "herb"]];
    let groups = "";
    for (const [x, kind] of spots) {
      const y = ropeY(x), drop = 8 + R() * 46, len = 40 + R() * 34;
      groups += `<g class="hb" style="--t:${f1(5 + R() * 3)}s;--d:-${f1(R() * 6)}s"><path d="M${x} ${f1(y)} V${f1(y + drop)}" stroke="#8a7a5a" stroke-width=".8"/><g transform="translate(${x} ${f1(y + drop)})">${bundle(kind, len)}</g></g>`;
    }
    return `<div class="fxHerbs"><svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMin slice" aria-hidden="true"><path d="M-10 18 Q200 78 410 18" stroke="#6a5a40" stroke-width="2.2" fill="none"/><path d="M-10 18 Q200 78 410 18" stroke="#a08a62" stroke-width=".8" stroke-dasharray="2 2" fill="none"/>${groups}</svg></div>`;
  };
  // pale green and violet sparks drifting up through the room
  FX.witchMotes = () => { const R = rng(57); let o = ""; for (let i = 0; i < 18; i++) o += `<i class="mote" style="left:${f1(R() * 100)}%;top:${f1(30 + R() * 65)}%;--c:${R() > 0.4 ? "#9dff9a" : "#d0a8ff"};--s:${f1(1.6 + R() * 2.4)}px;--t:${f1(11 + R() * 12)}s;--p:${f1(2 + R() * 3)}s;--d:-${f1(R() * 20)}s;--dx:${f1((R() - 0.5) * 70)}px;--dy:${f1(-50 - R() * 110)}px"></i>`; return o; };

  D.BACKDROPS.witchTower = { label: "Witch's tower", tone: "dark", fx: "herbs witchMotes", css: () => `${witchRoom()} center / cover no-repeat, #0e0d11` };
  D.PALETTES.witch = { label: "Witch", t: ["#0d0c10", "#e8e6dc", "#15141a", "#18171d", "#1d1b22", "#9a978c", "#2a2830", "#27252c", "#3a3842", "dark"] };

  // ------------------------------------------------------------------ the skull a witch keeps on the shelf (a candle melted onto it)
  const skullOutline = (cx, cy, s) => {
    const P = (x, y) => `${f1(cx + x * s)} ${f1(cy + y * s)}`;
    return `M${P(0, -0.56)} C${P(0.3, -0.56)} ${P(0.46, -0.36)} ${P(0.46, -0.1)} C${P(0.46, 0.04)} ${P(0.42, 0.12)} ${P(0.38, 0.17)} C${P(0.36, 0.22)} ${P(0.35, 0.27)} ${P(0.28, 0.3)} C${P(0.26, 0.35)} ${P(0.24, 0.41)} ${P(0.22, 0.45)} C${P(0.2, 0.53)} ${P(0.12, 0.57)} ${P(0, 0.57)}`
      + ` C${P(-0.12, 0.57)} ${P(-0.2, 0.53)} ${P(-0.22, 0.45)} C${P(-0.24, 0.41)} ${P(-0.26, 0.35)} ${P(-0.28, 0.3)} C${P(-0.35, 0.27)} ${P(-0.36, 0.22)} ${P(-0.38, 0.17)} C${P(-0.42, 0.12)} ${P(-0.46, 0.04)} ${P(-0.46, -0.1)} C${P(-0.46, -0.36)} ${P(-0.3, -0.56)} ${P(0, -0.56)}Z`;
  };
  const skullHoles = (cx, cy, s) => {
    const P = (x, y) => `${f1(cx + x * s)} ${f1(cy + y * s)}`;
    const eye = (x, d) => `M${P(x - 0.13 * d, 0.0)} C${P(x - 0.12 * d, -0.08)} ${P(x + 0.12 * d, -0.07)} ${P(x + 0.14 * d, 0.03)} C${P(x + 0.15 * d, 0.12)} ${P(x + 0.06 * d, 0.17)} ${P(x, 0.17)} C${P(x - 0.08 * d, 0.17)} ${P(x - 0.14 * d, 0.1)} ${P(x - 0.13 * d, 0.0)}Z`;
    const nose = `M${P(0, 0.19)} C${P(0.03, 0.21)} ${P(0.065, 0.28)} ${P(0.05, 0.31)} C${P(0.04, 0.33)} ${P(0.01, 0.32)} ${P(0, 0.3)} C${P(-0.01, 0.32)} ${P(-0.04, 0.33)} ${P(-0.05, 0.31)} C${P(-0.065, 0.28)} ${P(-0.03, 0.21)} ${P(0, 0.19)}Z`;
    return eye(0.18, -1) + eye(-0.18, 1) + nose;
  };
  const skullArt = (g, cx, cy, s) => {
    const P = (x, y) => `${f1(cx + x * s)} ${f1(cy + y * s)}`;
    let teeth = "";
    for (let i = 0; i < 8; i++) { const x = -0.155 + i * 0.039; teeth += `<rect x="${f1(cx + x * s)}" y="${f1(cy + 0.375 * s)}" width="${f1(0.034 * s)}" height="${f1(0.07 * s)}" rx="${f1(0.01 * s)}" fill="url(#${g}t)"/><rect x="${f1(cx + x * s)}" y="${f1(cy + 0.452 * s)}" width="${f1(0.034 * s)}" height="${f1(0.06 * s)}" rx="${f1(0.01 * s)}" fill="url(#${g}t)"/>`; }
    return `<defs><radialGradient id="${g}b" cx=".38" cy=".3" r=".75"><stop offset="0" stop-color="#f1e8d2"/><stop offset=".55" stop-color="#cdbf9f"/><stop offset="1" stop-color="#7d6f56"/></radialGradient>`
      + `<linearGradient id="${g}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9dfc6"/><stop offset="1" stop-color="#a8987a"/></linearGradient>`
      + `<radialGradient id="${g}e" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#050404"/><stop offset=".7" stop-color="#16110c"/><stop offset="1" stop-color="#4a3e2e"/></radialGradient></defs>`
      + `<path d="${skullOutline(cx, cy, s)}" fill="url(#${g}b)"/>`
      // temples and cheek hollows in shadow, a light brow
      + `<ellipse cx="${P(0.4, 0.08).split(" ")[0]}" cy="${P(0.4, 0.08).split(" ")[1]}" rx="${f1(0.08 * s)}" ry="${f1(0.16 * s)}" fill="#5a4c3a" opacity=".45"/><ellipse cx="${P(-0.4, 0.08).split(" ")[0]}" cy="${P(-0.4, 0.08).split(" ")[1]}" rx="${f1(0.08 * s)}" ry="${f1(0.16 * s)}" fill="#5a4c3a" opacity=".35"/>`
      + `<path d="M${P(-0.3, -0.07)} Q${P(-0.17, -0.12)} ${P(-0.04, -0.06)} M${P(0.04, -0.06)} Q${P(0.17, -0.12)} ${P(0.3, -0.07)}" stroke="#fff6e2" stroke-width="${f1(0.025 * s)}" stroke-linecap="round" fill="none" opacity=".5"/>`
      + `<path d="M${P(-0.3, 0.3)} Q${P(-0.2, 0.36)} ${P(-0.19, 0.46)} M${P(0.3, 0.3)} Q${P(0.2, 0.36)} ${P(0.19, 0.46)}" stroke="#6a5a44" stroke-width="${f1(0.03 * s)}" fill="none" opacity=".5"/>`
      + `<rect x="${f1(cx - 0.175 * s)}" y="${f1(cy + 0.36 * s)}" width="${f1(0.35 * s)}" height="${f1(0.17 * s)}" rx="${f1(0.04 * s)}" fill="#1a140e"/>${teeth}`
      + `<path d="${skullHoles(cx, cy, s)}" fill="url(#${g}e)"/>`
      + `<path d="M${P(0.12, -0.5)} l${f1(0.03 * s)} ${f1(0.08 * s)} l${f1(-0.04 * s)} ${f1(0.06 * s)} l${f1(0.03 * s)} ${f1(0.07 * s)}" stroke="#5a4c3a" stroke-width="${f1(0.012 * s)}" fill="none"/>`;
  };
  D.ORNAMENTS.skull = {
    label: "Skull & candle", scale: 0.62, vw: 110,
    draw: (g) => {
      const wax = "#e6dbc0";
      return skullArt(g, 55, 147, 92)
        + `<rect x="47" y="58" width="16" height="40" rx="2" fill="${wax}"/><rect x="47" y="58" width="5" height="40" fill="#fff" opacity=".3"/>`
        + `<path d="M47 94 q-6 2 -9 9 q-2 6 1 12 q2 3 3 -1 q0 -8 6 -12Z M63 93 q5 3 7 9 q1 9 -2 14 q-3 2 -3 -3 q1 -10 -4 -14Z M52 97 q0 6 -1 11 q1 4 3 0 q1 -6 0 -11Z" fill="${wax}"/>`
        + `<path d="M48 61 q-1 8 .5 13 M61 60 q1.5 6 .2 10" stroke="${wax}" stroke-width="3" stroke-linecap="round" fill="none"/>`
        + `<line x1="55" y1="58" x2="55" y2="54" stroke="#2a2420" stroke-width="1.2"/>`
        + `<circle class="ember" cx="55" cy="53.5" r="1.4" fill="#ff7a2a"/><g class="ornFlame" data-x="55" data-y="54"><g class="ornFlicker"><ellipse cx="55" cy="45" rx="5" ry="11" fill="#ffb347" opacity=".55"/><path d="M55 34 C61 42 60 52 55 54 C50 52 49 42 55 34Z" fill="#ffc861"/><path d="M55 42 C57.4 46 57 51.5 55 52.5 C53 51.5 52.6 46 55 42Z" fill="#fffbe6"/></g></g>`;
    },
  };

  // ------------------------------------------------------------------ potion bottles that light the shelf; tapped, the potions rise out, become a skull and vanish
  const POTS = [
    // body path, liquid top, colour, mouth, glow centre
    { body: "M12 112 H26 V190 Q26 198 19 198 Q12 198 12 190Z", neck: [13, 104, 12, 8], cork: [14, 96, 10, 9], level: 132, col: "#4ff0d8", mouth: [19, 96], c: [19, 160, 14, 40] },
    { body: "M40 104 H52 V136.6 A30 30 0 1 1 40 136.6Z", neck: null, cork: [41, 92, 10, 12], level: 148, col: "#6dff6a", mouth: [46, 92], c: [46, 168, 34, 32] },
    { body: "M84 198 V132 Q84 122 94 120 H108 Q118 122 118 132 V198Z", neck: [95, 106, 12, 15], cork: [96, 95, 10, 12], level: 140, col: "#b46bff", mouth: [101, 95], c: [101, 160, 22, 40], label: true },
    { body: "M128 156 H136 V167.6 A15 15 0 1 1 128 167.6Z", neck: null, cork: [128.5, 148, 7, 9], level: 172, col: "#ffae3a", mouth: [132, 148], c: [132, 182, 18, 18] },
    { body: "M69 160 H75 V172 C81 177 84 182 84 188 A12 12 0 0 1 60 188 C60 182 63 177 69 172Z", neck: null, cork: [69, 152, 6, 9], level: 180, col: "#ff5fa8", mouth: [72, 152], c: [72, 188, 14, 12] },
  ];
  D.ORNAMENTS.potions = {
    label: "Potions & skull", scale: 0.74, vw: 150, alt: "skull", glow: "rgba(120,255,160,.32)",
    draw: (g) => {
      let back = "", art = "";
      POTS.forEach((p, i) => {
        back += `<g class="potGlowW" style="--i:${i}"><ellipse class="potGlow" cx="${p.c[0]}" cy="${p.c[1]}" rx="${p.c[2] * 1.4}" ry="${p.c[3] * 1.3}" fill="${p.col}" filter="url(#${g}b)"/></g>`;
        let bub = ""; for (let k = 0; k < 4; k++) bub += `<circle class="potBub" cx="${p.c[0] + (k - 1.5) * p.c[2] * 0.22}" cy="196" r="${1 + (k % 2) * 0.7}" fill="#fff" style="--d:-${(k * 0.7 + i * 0.3).toFixed(1)}s;--rise:${(196 - p.level).toFixed(0)}px"/>`;
        art += `<clipPath id="${g}c${i}"><path d="${p.body}"/>${p.neck ? `<rect x="${p.neck[0]}" y="${p.neck[1]}" width="${p.neck[2]}" height="${p.neck[3]}"/>` : ""}</clipPath>`
          + `<g clip-path="url(#${g}c${i})"><rect x="0" y="0" width="150" height="200" fill="#0c0c10" opacity=".35"/>`
          + `<g class="potLiq" style="--i:${i}"><rect x="0" y="${p.level}" width="150" height="${200 - p.level}" fill="${p.col}"/><rect x="0" y="${p.level}" width="150" height="${200 - p.level}" fill="url(#${g}d)"/><rect x="0" y="${p.level}" width="150" height="1.6" fill="#fff" opacity=".55"/>${bub}</g></g>`
          + (p.neck ? `<rect x="${p.neck[0]}" y="${p.neck[1]}" width="${p.neck[2]}" height="${p.neck[3]}" fill="rgba(210,235,255,.1)" stroke="rgba(230,245,255,.45)" stroke-width="1"/>` : "")
          + `<path d="${p.body}" fill="rgba(210,235,255,.08)" stroke="rgba(230,245,255,.5)" stroke-width="1.2"/>`
          + `<path d="${p.body}" fill="url(#${g}h)"/>`
          + `<rect x="${p.cork[0]}" y="${p.cork[1]}" width="${p.cork[2]}" height="${p.cork[3]}" rx="2" fill="#7a5a38"/><rect x="${p.cork[0]}" y="${p.cork[1]}" width="${p.cork[2]}" height="2.4" rx="1" fill="#a07a4c"/>`
          + (p.label ? `<rect x="89" y="152" width="24" height="22" rx="1.5" fill="#cbb88e"/><rect x="89" y="152" width="24" height="22" rx="1.5" fill="none" stroke="#7a6440" stroke-width=".8"/><path d="M104 158 a5 5 0 1 0 0 9 a4 4 0 1 1 0 -9Z" fill="#4a3a26"/><path d="M92 170 h10 M92 172.5 h14" stroke="#6a5436" stroke-width=".7"/>` : "");
      });
      // the potions' spirits: one stream from each bottle, meeting above them
      const C = [74, 42];
      const sd = (p, i) => `M${p.mouth[0]} ${p.mouth[1]} C${p.mouth[0]} ${p.mouth[1] - 30} ${(p.mouth[0] + C[0]) / 2 + (i % 2 ? 18 : -18)} ${C[1] + 24} ${C[0]} ${C[1]}`;
      const streams = `<g opacity=".5" filter="url(#${g}b)">${POTS.map((p, i) => `<path class="potStream wide" pathLength="1" style="--i:${i}" d="${sd(p, i)}" stroke="${p.col}"/>`).join("")}</g>`
        + POTS.map((p, i) => `<path class="potStream" pathLength="1" style="--i:${i}" d="${sd(p, i)}" stroke="${p.col}"/>`).join("");
      const halo = `<ellipse class="potHalo" cx="${C[0]}" cy="${C[1]}" rx="34" ry="30" fill="#8dff9a" filter="url(#${g}b)"/>`;
      const mist = [[-14, -20], [10, -26], [-4, -34], [18, -12], [-20, -8], [4, -16]].map(([mx, my], k) => `<circle class="potMist" cx="${C[0] + mx * 0.4}" cy="${C[1] + my * 0.3}" r="${7 + (k % 3) * 2}" fill="#d6ffdc" filter="url(#${g}b)" style="--mx:${mx}px;--my:${my}px;--k:${k}"/>`).join("");
      const ghost = `<g class="potGhost"><path d="${skullOutline(C[0], C[1], 46)}${skullHoles(C[0], C[1], 46)}" fill="url(#${g}s)" fill-rule="evenodd"/><path d="M${C[0] - 8} ${C[1] + 17} h16" stroke="#0a1a10" stroke-width="2.4" stroke-dasharray="1.6 1.2" opacity=".6"/></g>`;
      const blob = `<g class="potBlob"><circle cx="${C[0]}" cy="${C[1]}" r="11" fill="url(#${g}s)"/></g>`;
      const wisps = [-12, 0, 12].map((dx, k) => `<path class="potWisp" pathLength="1" style="--k:${k}" d="M${C[0] + dx} ${C[1] - 18} c-6 -8 6 -14 0 -22 c-6 -8 5 -14 1 -22" />`).join("");
      return `<defs><filter id="${g}b" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7"/></filter><filter id="${g}f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1"/></filter>`
        + `<linearGradient id="${g}d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>`
        + `<linearGradient id="${g}h" x1="0" x2="1"><stop offset=".08" stop-color="#fff" stop-opacity="0"/><stop offset=".2" stop-color="#fff" stop-opacity=".32"/><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#fff" stop-opacity="0"/><stop offset=".88" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
        + `<radialGradient id="${g}s" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#f2fff0"/><stop offset=".45" stop-color="#9dffa8"/><stop offset=".8" stop-color="#8a6bff" stop-opacity=".8"/><stop offset="1" stop-color="#6a4bd8" stop-opacity=".2"/></radialGradient></defs>`
        + `<g data-y="150"></g>${back}${art}<g class="potMagic">${halo}<g filter="url(#${g}f)">${streams}${blob}${ghost}</g>${mist}</g>`;
    },
    /** Out: the liquid drains as streams rise from each bottle, they gather into a skull that drifts up and evaporates. In: the bottles fill and glow again. */
    toggle: (el, out) => {
      if (out) {
        el.style.setProperty("--up", (parseFloat(el.style.height) * 0.54).toFixed(0) + "px");
        el.classList.add("witching", "snuffing"); el.classList.remove("filling");
        witchSound(true);
        setTimeout(() => el.classList.remove("lit"), 150);
        setTimeout(() => el.classList.remove("witching", "snuffing"), 3700);
      } else {
        el.classList.remove("witching", "snuffing"); el.classList.add("lit", "filling");
        witchSound(false);
        setTimeout(() => el.classList.remove("filling"), 1400);
      }
    },
  };
  // glowing mushrooms: going dark, each cap breathes out its light as fairy dust that drifts up and twinkles away;
  // lighting up, the dust drifts down and each cap blooms with light where it lands
  D.ORNAMENTS.mushrooms.toggle = (el, out) => {
    const svg = el.querySelector("svg"), caps = D.ORNAMENTS.mushrooms.caps;
    if (!svg) { el.classList.toggle("lit", !out); return; }
    if (el._fairy) el._fairy();
    const anims = [], dots = [], timers = [];
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      timers.forEach(clearTimeout); dots.forEach((d) => d.remove());
      el.classList.toggle("lit", !out);
      anims.forEach((a) => { try { a.cancel(); } catch (e) { /* gone */ } });
      el._fairy = null;
    };
    el._fairy = finish;
    const lit = [...svg.querySelectorAll(".litOnly")]; // a glow and a cap colour for each mushroom, in order
    const order = caps.map((_, i) => i).sort(() => Math.random() - 0.5);
    const NS = "http://www.w3.org/2000/svg", gap = 230, life = 1100;
    order.forEach((ci, n) => {
      const [x, y, r, h, c] = caps[ci], delay = n * gap;
      const parts = lit.slice(ci * 2, ci * 2 + 2);
      parts.forEach((p) => {
        const now = +getComputedStyle(p).opacity;
        anims.push(p.animate(out
          ? [{ opacity: now }, { opacity: Math.min(1, now + 0.4), offset: 0.22 }, { opacity: now * 0.5, offset: 0.45 }, { opacity: 0 }]
          : [{ opacity: 0 }, { opacity: 0, offset: 0.35 }, { opacity: 1, offset: 0.62 }, { opacity: 0.55 }],
        { duration: out ? life : life + 300, delay: out ? delay + 120 : delay, easing: "ease-in-out", fill: "both" }));
      });
      // the dust: a little swirl of tiny lights
      const k = 9 + Math.round(r / 4);
      for (let j = 0; j < k; j++) {
        const d = document.createElementNS(NS, "circle"), core = Math.random() < 0.45;
        d.setAttribute("cx", (x + (Math.random() - 0.5) * r * 1.4).toFixed(1)); d.setAttribute("cy", (y - h + (Math.random() - 0.3) * r * 0.5).toFixed(1));
        d.setAttribute("r", (core ? 1.8 + Math.random() * 1 : 2.6 + Math.random() * 2.4).toFixed(1));
        d.setAttribute("fill", core ? "#fff" : c);
        d.style.filter = `drop-shadow(0 0 4px ${c}) drop-shadow(0 0 1px #fff)`; d.style.transformBox = "fill-box"; d.style.transformOrigin = "center";
        svg.append(d); dots.push(d);
        const rise = 70 + Math.random() * 70, sway = (Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 16);
        const path = [0, 0.25, 0.5, 0.75, 1].map((f) => `translate(${(Math.sin(f * Math.PI * (1.5 + Math.random())) * sway).toFixed(1)}px, ${(-rise * f).toFixed(1)}px) scale(${(1 - f * 0.6).toFixed(2)})`);
        const tw = [0, 1, 0.35, 0.95, 0.25, 0.8, 0];
        const kf = path.map((tr, i) => ({ transform: tr }));
        const steps = out ? kf : [...kf].reverse();
        const dur = 1300 + Math.random() * 900, dl = delay + Math.random() * (out ? 380 : 260);
        anims.push(d.animate(steps, { duration: dur, delay: dl, easing: out ? "cubic-bezier(.3,.6,.4,1)" : "cubic-bezier(.5,0,.6,.5)", fill: "both" }));
        anims.push(d.animate(tw.map((o) => ({ opacity: o })), { duration: dur, delay: dl, easing: "ease-in-out", fill: "both" }));
      }
    });
    // the soft light around them follows
    const glow = el.querySelector(".ornGlow");
    if (glow) { const now = +getComputedStyle(glow).opacity; anims.push(glow.animate(out ? [{ opacity: now }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 0, offset: 0.3 }, { opacity: 1 }], { duration: caps.length * gap + life, easing: "ease-in-out", fill: "both" })); }
    fairySound(out);
    timers.push(setTimeout(finish, caps.length * gap + life + 1700));
  };
  let fctx = null;
  /** A soft run of tiny bells: falling as the lights go out, rising as they come on. */
  function fairySound(out) {
    try {
      fctx = fctx || new (window.AudioContext || window.webkitAudioContext)();
      if (fctx.state === "suspended") fctx.resume();
      const notes = [1568, 1760, 2093, 2349, 2637, 3136, 3520], t = fctx.currentTime;
      const seq = out ? [...notes].reverse() : notes;
      seq.forEach((f, i) => {
        const at = t + i * 0.11 + Math.random() * 0.03;
        [1, 2.76].forEach((m, j) => {
          const o = fctx.createOscillator(), g = fctx.createGain(); o.type = "sine"; o.frequency.value = f * m;
          g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(j ? 0.004 : 0.018, at + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, at + (j ? 0.4 : 1.1));
          o.connect(g).connect(fctx.destination); o.start(at); o.stop(at + 1.2);
        });
      });
    } catch (e) { /* no sound */ }
  }
  let wctx = null;
  function witchSound(out) {
    try {
      wctx = wctx || new (window.AudioContext || window.webkitAudioContext)();
      const t = wctx.currentTime, len = out ? 2.6 : 1.2;
      // an airy whoosh
      const buf = wctx.createBuffer(1, wctx.sampleRate * len, wctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const n = wctx.createBufferSource(); n.buffer = buf;
      const bp = wctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 0.9;
      bp.frequency.setValueAtTime(out ? 300 : 900, t); bp.frequency.exponentialRampToValueAtTime(out ? 1600 : 280, t + len * 0.8);
      const g = wctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + len * 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      n.connect(bp).connect(g).connect(wctx.destination); n.start(t); n.stop(t + len);
      // a soft glassy shimmer
      [0, 0.12, 0.24].forEach((dt, k) => {
        const o = wctx.createOscillator(), og = wctx.createGain();
        o.type = "sine"; const f = [880, 1175, 1568][k];
        o.frequency.setValueAtTime(out ? f : f / 2, t + dt); o.frequency.exponentialRampToValueAtTime(out ? f / 2 : f, t + dt + len * 0.7);
        og.gain.setValueAtTime(0.0001, t + dt); og.gain.exponentialRampToValueAtTime(0.025, t + dt + 0.1); og.gain.exponentialRampToValueAtTime(0.0001, t + dt + len * 0.8);
        o.connect(og).connect(wctx.destination); o.start(t + dt); o.stop(t + dt + len);
      });
    } catch (e) { /* no sound */ }
  }

  // a black feather bookmark for the witch
  D.BOOKMARKS.feather = { label: "Raven feather", draw: (g) => `<defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#0c0c12"/><stop offset=".5" stop-color="#2a2a3a"/><stop offset="1" stop-color="#0a0a10"/></linearGradient></defs><line x1="14" y1="0" x2="14" y2="12" stroke="#6a5a40" stroke-width=".8"/><path d="M14 12 C22 22 22 52 15 84 C6 60 5 26 14 12Z" fill="url(#${g})"/><path d="M14 14 Q15.5 48 15 84" stroke="#7a7a90" stroke-width=".7" fill="none"/>${Array.from({ length: 9 }, (_, k) => `<path d="M15 ${22 + k * 6} l${k % 2 ? 5 : -5} 3" stroke="#3c3c50" stroke-width=".5"/>`).join("")}<path d="M9 50 l-3 4 M20 62 l3 3" stroke="#0c0c12" stroke-width="1.2"/>` };

  D.LOOKS.witch = { label: "Witch's tower", set: { theme: "witch", accent: "#8fe388", shelfMat: "ebony", backdrop: "witchTower", lights: { style: "none", colour: "warm", on: false }, headFont: "fell", ornament: { kind: "potions", pos: "end" }, bookmark: "feather" } };
  D.READER_PAGES.witch = { bg: "#17161b", fg: "#dcdccc" };

  // ------------------------------------------------------------------ Enchanted forest: a moonlit glade of weeping willows
  // The trunks and ground are one picture; the hanging willow curtains and the grass are moving layers drawn on the same grid.
  const WILLOWS = [
    { x: 64, g: 738, w: 50, fork: 300, lean: 10, crowns: [[22, 128], [72, 70], [128, 150]], far: false },
    { x: 338, g: 740, w: 58, fork: 330, lean: -12, crowns: [[290, 116], [346, 58], [398, 150]], far: false },
    { x: 206, g: 702, w: 24, fork: 400, lean: 4, crowns: [[184, 268], [226, 250]], far: true },
  ];
  const willowGlade = pic("willowGlade", () => {
    const R = rng(311);
    const trunk = (t) => {
      const { x, g, w, fork, lean } = t, L = x + lean;
      const shape = `M${x - w * 1.35} ${g + 8} C${x - w * 0.8} ${g + 2} ${x - w * 0.62} ${g - 16} ${x - w * 0.55} ${g - 50} C${x - w * 0.5} ${g - 160} ${L - w * 0.46} ${fork + 120} ${L - w * 0.4} ${fork} L${L + w * 0.4} ${fork} C${L + w * 0.46} ${fork + 120} ${x + w * 0.5} ${g - 160} ${x + w * 0.55} ${g - 50} C${x + w * 0.62} ${g - 16} ${x + w * 0.8} ${g + 2} ${x + w * 1.35} ${g + 8}Z`;
      // ridges of bark running up the trunk, some dark furrows, some lit edges
      let ridges = "";
      for (let i = 0; i < (t.far ? 6 : 15); i++) {
        const f = -0.42 + (i / ((t.far ? 6 : 15) - 1)) * 0.84 + (R() - 0.5) * 0.04;
        let d = `M${f1(x + f * w * 1.1)} ${g - 6}`;
        for (let y = g - 6; y > fork + 4; y -= 26) {
          const k = (g - y) / (g - fork), cxp = x + (L - x) * k + f * w * (1 - 0.1 * k);
          d += ` Q${f1(cxp + (R() - 0.5) * 5)} ${f1(y - 13)} ${f1(cxp + (R() - 0.5) * 2)} ${f1(y - 26)}`;
        }
        const lit = i % 3 === 2;
        ridges += `<path d="${d}" stroke="${lit ? "#9a7a5a" : "#160d07"}" stroke-width="${lit ? 0.7 : f1(1 + R() * 1.4)}" fill="none" opacity="${lit ? 0.35 : 0.75}"/>`;
      }
      let knots = "";
      if (!t.far) for (let k = 0; k < 3; k++) { const ky = g - 120 - R() * (g - fork - 200), kx = x + (L - x) * ((g - ky) / (g - fork)) + (R() - 0.5) * w * 0.4; knots += `<ellipse cx="${f1(kx)}" cy="${f1(ky)}" rx="${f1(3 + R() * 3)}" ry="${f1(6 + R() * 5)}" fill="#120a05"/><ellipse cx="${f1(kx)}" cy="${f1(ky)}" rx="${f1(5 + R() * 3)}" ry="${f1(9 + R() * 4)}" fill="none" stroke="#6a5038" stroke-width=".8" opacity=".5"/>`; }
      // limbs from the fork up to each crown, and the thin arching branches the curtains hang from
      let limbs = "", twigs = "";
      for (const [cx, cy] of t.crowns) {
        const wd = w * 0.36, mx = (L + cx) / 2 + (cx < L ? -8 : 8), my = (fork + cy) / 2;
        limbs += `<path d="M${L} ${fork + 10} Q${f1(mx)} ${f1(my)} ${cx} ${cy}" stroke="url(#wd${t.far ? "f" : ""})" stroke-width="${f1(wd)}" stroke-linecap="round" fill="none"/><path d="M${L - wd * 0.2} ${fork + 10} Q${f1(mx - wd * 0.2)} ${f1(my)} ${cx - 2} ${cy}" stroke="#1a0f08" stroke-width="${f1(wd * 0.18)}" fill="none" opacity=".7"/>`;
        for (const dx of [-70, -40, -14, 14, 42, 74]) twigs += `<path d="M${cx} ${cy} Q${f1(cx + dx * 0.45)} ${f1(cy - 34 - R() * 16)} ${f1(cx + dx)} ${f1(cy + 6 + R() * 18)}" stroke="#24180e" stroke-width="${t.far ? 1.2 : 2.2}" fill="none"/>`;
      }
      // moss and roots at the foot
      let moss = ""; for (let i = 0; i < (t.far ? 10 : 30); i++) moss += `<circle cx="${f1(x + (R() - 0.5) * w * 1.6)}" cy="${f1(g - R() * 70)}" r="${f1(1 + R() * 2.4)}" fill="${R() < 0.5 ? "#2f5a34" : "#3e7a44"}" opacity=".8"/>`;
      const body = `<path d="${shape}" fill="url(#wd${t.far ? "f" : ""}h)"/><path d="${shape}" fill="#000" filter="url(#barkTex)" opacity=".55"/>${ridges}${knots}${limbs}${twigs}${moss}`;
      return t.far ? `<g opacity=".55" filter="url(#farSoft)">${body}</g>` : body;
    };
    let specks = ""; for (let i = 0; i < 60; i++) specks += `<circle cx="${f1(R() * 400)}" cy="${f1(140 + R() * 600)}" r="${f1(0.6 + R() * 1.3)}" fill="${R() > 0.35 ? "#ffe08a" : "#9ff6e8"}" opacity="${f1(0.3 + R() * 0.6)}"/>`;
    const shroom = (x, y, r, col) => `<rect x="${f1(x - r * 0.18)}" y="${f1(y - r * 1.1)}" width="${f1(r * 0.36)}" height="${f1(r * 1.1)}" rx="${f1(r * 0.15)}" fill="#cfeee6" opacity=".85"/><ellipse cx="${f1(x)}" cy="${f1(y - r * 1.2)}" rx="${f1(r * 1.8)}" ry="${f1(r * 1.6)}" fill="${col}" opacity=".35" filter="url(#glowBl)"/><path d="M${f1(x - r)} ${f1(y - r * 1.05)} C${f1(x - r)} ${f1(y - r * 2)} ${f1(x + r)} ${f1(y - r * 2)} ${f1(x + r)} ${f1(y - r * 1.05)}Z" fill="${col}"/>`;
    let shrooms = "";
    for (const [cx, cy, n, col] of [[66, 736, 6, "#8ff7e4"], [206, 704, 3, "#a8f0ff"], [336, 738, 5, "#8ff7e4"], [130, 770, 3, "#ffd79a"], [270, 762, 4, "#b9fff0"], [384, 752, 3, "#ffc7ef"]]) for (let k = 0; k < n; k++) shrooms += shroom(cx + (R() - 0.5) * 56, cy + R() * 12, 3 + R() * 5, col);
    // a thick carpet of grass hiding all the ground, darkest at the back
    const carpet = (y0, y1) => {
      let o = "";
      for (let y = y0; y < y1; y += 3.2) {
        const depth = (y - 684) / 190;
        const cols = depth < 0.35 ? ["#040b07", "#06100a", "#050d08"] : depth < 0.7 ? ["#071509", "#09190e", "#0b1d11", "#06120b"] : ["#0a1d11", "#0d2416", "#0b2013", "#102a19"];
        for (let i = 0; i < 46; i++) {
          const x = R() * 412 - 6, hh = 7 + depth * 22 + R() * 12, lean = (R() - 0.5) * 10 + 2, bw = 1 + depth * 1.4 + R() * 0.8;
          o += `<path d="M${f1(x)} ${f1(y + 3)} Q${f1(x + lean * 0.3)} ${f1(y + 3 - hh * 0.6)} ${f1(x + lean)} ${f1(y + 3 - hh)} Q${f1(x + lean * 0.3 + bw * 0.7)} ${f1(y + 3 - hh * 0.5)} ${f1(x + bw)} ${f1(y + 3)}Z" fill="${cols[Math.floor(R() * cols.length)]}"/>`;
        }
      }
      return o;
    };
    let far = ""; for (const x of [20, 110, 150, 260, 300, 380]) far += `<path d="M${x - 8} 860 L${x - 5} 0 L${x + 5} 0 L${x + 8} 860Z" fill="#1a2840"/>`;
    // distant willow domes in the mist
    let domes = ""; for (const [x, y, r] of [[120, 470, 90], [270, 450, 110], [10, 430, 80], [400, 480, 90]]) domes += `<path d="M${x - r} ${y + r * 1.4} C${x - r} ${y - r * 0.4} ${x + r} ${y - r * 0.4} ${x + r} ${y + r * 1.4}Z" fill="#1d3448"/>`;
    const defs = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#020309"/><stop offset=".3" stop-color="#070e22"/><stop offset=".55" stop-color="#0e2036"/><stop offset=".75" stop-color="#0a1c1e"/><stop offset="1" stop-color="#030806"/></linearGradient>`
      + `<radialGradient id="dusk" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#8a78b8" stop-opacity=".22"/><stop offset=".5" stop-color="#4a4a8a" stop-opacity=".1"/><stop offset="1" stop-color="#1a1f4a" stop-opacity="0"/></radialGradient>`
      + `<radialGradient id="night" cx=".5" cy=".45" r=".75"><stop offset=".3" stop-color="#01020a" stop-opacity=".15"/><stop offset="1" stop-color="#01020a" stop-opacity=".7"/></radialGradient>`
      + `<linearGradient id="wdh" x1="0" x2="1"><stop offset="0" stop-color="#0e0905"/><stop offset=".3" stop-color="#271b11"/><stop offset=".62" stop-color="#3a2b1e"/><stop offset=".82" stop-color="#55493e"/><stop offset="1" stop-color="#160e07"/></linearGradient>`
      + `<linearGradient id="wd" x1="0" x2="1"><stop offset="0" stop-color="#160e07"/><stop offset=".6" stop-color="#3a2b1e"/><stop offset="1" stop-color="#22180e"/></linearGradient>`
      + `<linearGradient id="wdfh" x1="0" x2="1"><stop offset="0" stop-color="#22232e"/><stop offset=".6" stop-color="#3e4250"/><stop offset="1" stop-color="#262834"/></linearGradient>`
      + `<linearGradient id="wdf" x1="0" x2="1"><stop offset="0" stop-color="#262834"/><stop offset="1" stop-color="#3a3e4c"/></linearGradient>`
      + `<filter id="barkTex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.35 0.025" numOctaves="3" seed="7" result="n"/><feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.2 -1" result="a"/><feComposite in="a" in2="SourceGraphic" operator="in"/></filter>`
      + `<filter id="glowBl" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4"/></filter><filter id="fogF" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>`
      + `<filter id="farSoft"><feGaussianBlur stdDeviation="1.4"/></filter><filter id="mistF"><feGaussianBlur stdDeviation="6"/></filter><filter id="rayF" x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur stdDeviation="8"/></filter>`;
    return SVG(`<rect width="400" height="860" fill="url(#sky)"/><ellipse cx="200" cy="470" rx="240" ry="220" fill="url(#dusk)"/>`
      + `<g filter="url(#mistF)" opacity=".55">${far.replace(/#1a2840/g, "#0e1828")}${domes.replace(/#1d3448/g, "#101e2c")}</g>`
      + `<ellipse cx="200" cy="600" rx="300" ry="70" fill="#7a96b0" opacity=".12" filter="url(#fogF)"/><ellipse cx="140" cy="480" rx="200" ry="45" fill="#8a80b0" opacity=".08" filter="url(#fogF)"/>`
      + `<g filter="url(#rayF)"><path d="M150 0 L210 0 L300 760 L200 760Z" fill="#bfe6ff" opacity=".05"/><path d="M228 0 L256 0 L330 700 L282 700Z" fill="#d8c8ff" opacity=".04"/></g>`
      + `<path d="M0 720 C60 694 110 712 160 702 C220 688 260 714 320 700 C360 690 390 702 400 698 L400 860 L0 860Z" fill="#0b1a12"/><path d="M0 762 C80 744 140 770 210 754 C280 738 330 764 400 750 L400 860 L0 860Z" fill="#07110c"/>`
      + WILLOWS.map(trunk).join("")
      + `<ellipse cx="200" cy="712" rx="260" ry="40" fill="#5fa898" opacity=".08" filter="url(#fogF)"/>`
      + carpet(684, 746) + shrooms + carpet(746, 874)
      + `<rect width="400" height="860" fill="url(#night)"/>` + specks, defs, "xMidYMax");
  });
  /** The hanging curtains of one willow, in two layers that sway a little out of step. */
  function willowCurtains(t, seed) {
    const R = rng(seed), layers = [""];
    const cols = t.far ? ["#15242a", "#1a2c30", "#1c3034"] : ["#13281b", "#183221", "#1d3a27", "#102216", "#21422d"];
    const grads = cols.concat("#3f6e54").map((c, i) => `<linearGradient id="wf${seed}_${i}" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="720"><stop offset="0" stop-color="${c}"/><stop offset=".55" stop-color="${c}" stop-opacity=".85"/><stop offset="1" stop-color="${c}" stop-opacity=".15"/></linearGradient>`).join("");
    for (const [cx, cy] of t.crowns) {
      for (const dx of [-70, -40, -14, 14, 42, 74]) {
        const ex = cx + dx, ey = cy + 6 + R() * 18, qx = cx + dx * 0.45, qy = cy - 40;
        for (let s = 0.12; s <= 1; s += t.far ? 0.18 : 0.095) {
          const px = (1 - s) * (1 - s) * cx + 2 * s * (1 - s) * qx + s * s * ex, py = (1 - s) * (1 - s) * cy + 2 * s * (1 - s) * qy + s * s * ey;
          const len = (t.far ? 120 : 230) + R() * (t.far ? 90 : 220) - Math.abs(dx) * 0.6, drift = (dx > 0 ? 1 : -1) * (4 + R() * 10);
          const d = `M${f1(px)} ${f1(py)} Q${f1(px + drift * 0.3)} ${f1(py + len * 0.5)} ${f1(px + drift)} ${f1(py + len)}`;
          const ci = R() < 0.08 && !t.far ? cols.length : Math.floor(R() * cols.length);
          layers[0] += `<path d="${d}" stroke="#14261a" stroke-width=".5" fill="none" opacity=".8"/><path d="${d}" stroke="url(#wf${seed}_${ci})" stroke-width="${t.far ? 1.6 : 2.2}" stroke-dasharray="${f1(2.6 + R() * 1.6)} ${f1(1.2 + R() * 1)}" stroke-linecap="round" fill="none"/>`;
        }
      }
    }
    // the curtain swings from the middle of the tree's crown
    const ox = t.crowns.reduce((a, c) => a + c[0], 0) / t.crowns.length, oy = Math.min(...t.crowns.map((c) => c[1]));
    // the layer only covers this tree, so it stays light to move
    const bx = Math.min(...t.crowns.map((c) => c[0])) - 110, bw = Math.max(...t.crowns.map((c) => c[0])) + 110 - bx, by = oy - 70, bh = Math.min(860, oy + 560) - by;
    return layers.map((body, i) => `<div class="fxWillow${t.far ? " far" : ""}" style="--x0:${bx};--y0:${by};--w:${bw};--h:${bh};--ox:${f1(((ox - bx) / bw) * 100)}%;--oy:${f1(((oy - by) / bh) * 100)}%;--t:${f1(6.5 + i * 1.7 + R() * 1.5)}s;--d:-${f1(R() * 8)}s"><svg viewBox="${bx} ${by} ${bw} ${bh}" preserveAspectRatio="none" aria-hidden="true"><defs>${grads}</defs>${body}</svg></div>`).join("");
  }
  FX.willows = () => willowCurtains(WILLOWS[2], 41) + willowCurtains(WILLOWS[0], 42) + willowCurtains(WILLOWS[1], 43);
  // rows of grass from the back of the glade to the front; each row bends in the wind, a gust travelling across
  FX.grassWind = () => {
    const R = rng(77); let o = "";
    const rows = [[802, ["#081a10", "#0a1e13", "#071709"]], [834, ["#0b2214", "#0e2818", "#091d11"]], [870, ["#0d2717", "#11301d", "#0b2214", "#0f2c1a"]]];
    rows.forEach(([yb, cols], ri) => {
      for (let seg = 0; seg < 2; seg++) {
        const x0 = seg * 200 - 8, x1 = x0 + 216;
        let blades = "";
        for (let i = 0; i < 170; i++) {
          const x = x0 + R() * (x1 - x0), hh = 26 + R() * 34 + ri * 10, lean = (R() - 0.35) * 18, bw = 1.1 + R() * 1.3 + ri * 0.4;
          const d = `M${f1(x)} ${yb + 2} C${f1(x)} ${f1(yb - hh * 0.4)} ${f1(x + lean * 0.5)} ${f1(yb - hh * 0.8)} ${f1(x + lean)} ${f1(yb - hh)} C${f1(x + lean * 0.5 + bw * 0.5)} ${f1(yb - hh * 0.75)} ${f1(x + bw)} ${f1(yb - hh * 0.35)} ${f1(x + bw)} ${yb + 2}Z`;
          blades += `<path d="${d}" fill="${cols[Math.floor(R() * cols.length)]}"/>`;
          if (R() < 0.14) blades += `<path d="M${f1(x + bw * 0.6)} ${f1(yb - hh * 0.3)} C${f1(x + bw * 0.6)} ${f1(yb - hh * 0.6)} ${f1(x + lean * 0.6)} ${f1(yb - hh * 0.85)} ${f1(x + lean)} ${f1(yb - hh)}" stroke="#3f7a62" stroke-width=".5" fill="none" opacity=".35"/>`;
        }
        o += `<div class="fxGrass" style="--x0:${x0};--w:${x1 - x0};--yb:${yb};--d:-${f1(6 - seg * 0.8 - ri * 0.3)}s;--t:${f1(5 + ri * 0.6)}s"><svg viewBox="${x0} ${yb - 100} ${x1 - x0} 104" preserveAspectRatio="none" aria-hidden="true">${blades}</svg></div>`;
      }
    });
    return o;
  };
  Object.assign(D.BACKDROPS.enchanted, { fx: "willows grassWind motes fogThick", css: () => `${willowGlade()} center bottom / cover no-repeat, #0c0f22` });
  const baseFx = D.backdropFx;
  D.backdropFx = (kinds) => String(kinds).split(" ").map((k) => (FX[k] ? FX[k]() : baseFx(k))).join("");
})();
