/* Decor: backdrops, shelf materials, hanging lights and ready-made looks. Everything is drawn with CSS
   and small generated SVG textures, so there are no image files to download. */
(() => {
  "use strict";
  // single-quoted and fully escaped, so it is safe inside a style="" attribute too
  const svgUrl = (svg) => `url('data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29")}')`;
  let seedN = 1;
  /** Soft fractal noise in one colour; fx/fy stretch it (a low fx and high fy make long horizontal grain). */
  const noise = ({ w = 360, h = 360, fx, fy, oct = 3, rgb = [0, 0, 0], a = 1.6, b = -0.62, type = "fractalNoise", seed }) =>
    svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='${type}' baseFrequency='${fx} ${fy}' numOctaves='${oct}' seed='${seed || seedN++}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${rgb[0]} 0 0 0 0 ${rgb[1]} 0 0 0 0 ${rgb[2]} 0 0 0 ${a} ${b}'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`);

  // ------------------------------------------------------------------ wood
  const grainH = (dark = 0.55, light = 0.25) => [
    `${noise({ w: 700, h: 160, fx: 0.0035, fy: 0.16, oct: 4, a: 1.9 * dark + 0.4, b: -0.75 })} 0 0 / 700px 160px`,
    `${noise({ w: 500, h: 120, fx: 0.006, fy: 0.3, oct: 2, rgb: [1, 0.92, 0.8], a: 1.2 * light + 0.3, b: -0.55 })} 0 0 / 500px 120px`,
  ];
  const grainV = (dark = 0.55, light = 0.25) => [
    `${noise({ w: 160, h: 900, fx: 0.16, fy: 0.0028, oct: 4, a: 1.9 * dark + 0.4, b: -0.75 })} 0 0 / 160px 900px`,
    `${noise({ w: 120, h: 600, fx: 0.3, fy: 0.005, oct: 2, rgb: [1, 0.92, 0.8], a: 1.2 * light + 0.3, b: -0.55 })} 0 0 / 120px 600px`,
  ];
  const panels = (base, board = 118, dark = 0.55) => [
    // seams between boards, with a little light catching each edge
    `repeating-linear-gradient(90deg, rgba(0,0,0,.42) 0 2px, rgba(255,255,255,.07) 2px 4px, transparent 4px ${board}px)`,
    // boards that are slightly lighter or darker than their neighbours
    `repeating-linear-gradient(90deg, rgba(255,255,255,.04) 0 ${board}px, rgba(0,0,0,.07) ${board}px ${board * 2}px, rgba(0,0,0,0) ${board * 2}px ${board * 3}px)`,
    ...grainV(dark), base,
  ].join(",");

  // ------------------------------------------------------------------ brick
  const brickTile = (cols, mortar) => {
    const W = 128, H = 64, bh = 30, bw = 62;
    let r = "", i = 0;
    for (let row = 0; row < 2; row++) {
      const off = row ? -bw / 2 - 1 : 0;
      for (let x = off; x < W; x += bw + 2) {
        const c = cols[(i++ * 7 + row * 3) % cols.length];
        r += `<rect x='${x + 1}' y='${row * (bh + 2) + 1}' width='${bw}' height='${bh}' rx='1.5' fill='${c}'/>`;
      }
    }
    return svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}'><rect width='${W}' height='${H}' fill='${mortar}'/>${r}</svg>`);
  };

  /** A repeating damask flourish: a flame-shaped medallion with curls, offset every other row. */
  const damaskTile = (ink, shine) => {
    const motif = (cx, cy) => `<g transform="translate(${cx} ${cy})">`
      + `<path d="M0 -26 C10 -16 14 -6 8 4 C4 10 2 16 0 26 C-2 16 -4 10 -8 4 C-14 -6 -10 -16 0 -26Z" fill="${ink}"/>`
      + `<path d="M0 -14 C5 -9 6 -3 3 2 L0 8 L-3 2 C-6 -3 -5 -9 0 -14Z" fill="${shine}"/>`
      + `<path d="M8 4 C16 2 20 -6 15 -10 C11 -12 9 -7 12 -6 M-8 4 C-16 2 -20 -6 -15 -10 C-11 -12 -9 -7 -12 -6" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/>`
      + `<circle cx="0" cy="-30" r="2.2" fill="${ink}"/><circle cx="0" cy="30" r="2.2" fill="${ink}"/></g>`;
    return svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='84' height='120'>${motif(42, 30)}${motif(0, 90)}${motif(84, 90)}</svg>`);
  };
  /** Uneven grey stone blocks with dark mortar. */
  const stoneTile = () => {
    const greys = ["#5d5c62", "#525158", "#67656b", "#4a4950", "#5a585e", "#615f64"];
    let r = "", i = 0;
    const rows = [[0, 40, [70, 50, 60]], [40, 40, [45, 75, 60]], [80, 40, [60, 60, 60]]];
    rows.forEach(([y, hgt, ws], ri) => { let x = ri === 1 ? -20 : 0; let k = 0; while (x < 180) { const wd = ws[k++ % ws.length]; r += `<rect x='${x + 1.5}' y='${y + 1.5}' width='${wd - 3}' height='${hgt - 3}' rx='4' fill='${greys[i++ % greys.length]}'/>`; x += wd; } });
    return svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='180' height='120'><rect width='180' height='120' fill='#26252a'/>${r}</svg>`);
  };

  // ------------------------------------------------------------------ backdrops
  const BACKDROPS = {
    none: { label: "Plain", tone: null, css: () => "var(--background)" },
    walnutPanel: { label: "Walnut panels", tone: "dark", css: () => panels("#3e2817", 118, 0.7) },
    oakPanel: { label: "Oak panels", tone: "light", css: () => panels("#b88a5a", 118, 0.45) },
    whitewash: { label: "Whitewashed", tone: "light", css: () => panels("#e2dbd0", 140, 0.18) },
    brick: { label: "Red brick", tone: "dark", css: () => ["linear-gradient(rgba(20,10,6,.3), rgba(20,10,6,.3))", `${noise({ fx: 0.9, fy: 0.9, oct: 2, a: 1.3, b: -0.45 })} 0 0 / 360px`, `${brickTile(["#8e3f2b", "#9b4630", "#7d3524", "#a14f37", "#87402d", "#93432f"], "#b8a99a")} 0 0 / 104px 52px`, "linear-gradient(rgba(0,0,0,.32), rgba(0,0,0,.32))"].join(",") },
    whiteBrick: { label: "White brick", tone: "light", css: () => [`${noise({ fx: 0.9, fy: 0.9, oct: 2, a: 0.55, b: -0.26 })} 0 0 / 360px`, `${brickTile(["#ece8e1", "#e4dfd7", "#f1ede7", "#e8e3dc"], "#cfc8bd")} 0 0 / 104px 52px`].join(",") },
    plaster: { label: "Warm plaster", tone: "light", css: () => [`${noise({ fx: 0.006, fy: 0.006, oct: 4, a: 0.55, b: -0.24 })} 0 0 / 360px`, `${noise({ fx: 0.02, fy: 0.02, oct: 3, rgb: [1, 0.97, 0.9], a: 0.7, b: -0.3 })} 0 0 / 360px`, "radial-gradient(ellipse 120% 80% at 50% 30%, #efe3cf, #e2d2b8)"].join(",") },
    linen: { label: "Linen", tone: "light", css: () => [`${noise({ fx: 0.9, fy: 0.02, oct: 1, a: 1.1, b: -0.48 })} 0 0 / 360px`, `${noise({ fx: 0.02, fy: 0.9, oct: 1, a: 1.1, b: -0.48 })} 0 0 / 360px`, "#ddd3c2"].join(",") },
    stripes: { label: "Striped paper", tone: "light", css: () => [`${noise({ fx: 0.5, fy: 0.5, oct: 1, a: 0.5, b: -0.24 })} 0 0 / 360px`, "repeating-linear-gradient(90deg, #dfe5d6 0 28px, #d3dbc7 28px 30px, #e8ece1 30px 58px, #d3dbc7 58px 60px)"].join(",") },
    greenWall: { label: "Library green", tone: "dark", css: () => [`${noise({ fx: 0.01, fy: 0.01, oct: 4, a: 1.3, b: -0.5 })} 0 0 / 360px`, "radial-gradient(ellipse 120% 80% at 50% 30%, #2c4a3a, #16271f)"].join(",") },
    navy: { label: "Ink blue", tone: "dark", css: () => [`${noise({ fx: 0.01, fy: 0.01, oct: 4, a: 1.2, b: -0.5 })} 0 0 / 360px`, "radial-gradient(ellipse 120% 80% at 50% 25%, #23365a, #0f1a2e)"].join(",") },
    concrete: { label: "Concrete", tone: "dark", css: () => [`${noise({ fx: 0.7, fy: 0.7, oct: 2, a: 1.2, b: -0.5 })} 0 0 / 360px`, `${noise({ fx: 0.008, fy: 0.008, oct: 4, rgb: [1, 1, 1], a: 0.7, b: -0.3 })} 0 0 / 360px`, "#5c5a57"].join(",") },
    candle: { label: "Candlelight", tone: "dark", css: () => [`${noise({ fx: 0.01, fy: 0.01, oct: 3, a: 1, b: -0.45 })} 0 0 / 360px`, "radial-gradient(ellipse 90% 60% at 50% 35%, #4a2c17, #1d120b 70%, #120b07)"].join(",") },
    damask: { label: "Crimson damask", tone: "dark", css: () => [`${noise({ fx: 0.01, fy: 0.01, oct: 3, a: 1, b: -0.42 })} 0 0 / 360px`, `${damaskTile("rgba(0,0,0,.28)", "rgba(255,200,170,.06)")} 0 0 / 84px 120px`, "radial-gradient(ellipse 110% 80% at 50% 30%, #5a1218, #2a070b)"].join(",") },
    greenDamask: { label: "Victorian green", tone: "dark", css: () => [`${noise({ fx: 0.01, fy: 0.01, oct: 3, a: 1, b: -0.42 })} 0 0 / 360px`, `${damaskTile("rgba(214,180,100,.18)", "rgba(0,0,0,.18)")} 0 0 / 84px 120px`, "radial-gradient(ellipse 110% 80% at 50% 30%, #23402f, #102019)"].join(",") },
    velvet: { label: "Velvet drapes", tone: "dark", css: () => ["repeating-linear-gradient(90deg, rgba(0,0,0,.45) 0, rgba(0,0,0,.1) 18px, rgba(255,120,120,.10) 34px, rgba(0,0,0,.08) 48px, rgba(0,0,0,.45) 70px)", `${noise({ fx: 0.4, fy: 0.01, oct: 2, a: 0.8, b: -0.35 })} 0 0 / 360px`, "linear-gradient(#3c0710, #22040a)"].join(",") },
    stone: { label: "Castle stone", tone: "dark", css: () => ["linear-gradient(rgba(12,12,16,.55), rgba(12,12,16,.55))", `${noise({ fx: 0.05, fy: 0.05, oct: 4, a: 1.4, b: -0.55 })} 0 0 / 360px`, `${stoneTile()} 0 0 / 180px 120px`].join(",") },
    shoji: { label: "Paper screen", tone: "light", css: () => ["repeating-linear-gradient(90deg, rgba(107,74,46,.42) 0 3px, transparent 3px 96px)", "repeating-linear-gradient(180deg, rgba(107,74,46,.42) 0 3px, transparent 3px 132px)", `${noise({ fx: 0.5, fy: 0.08, oct: 2, a: 0.32, b: -0.14 })} 0 0 / 360px`, "radial-gradient(ellipse 120% 90% at 50% 30%, #f6efe0, #e8dcc4)"].join(",") },
    forest: { label: "Deep forest", tone: "dark", css: () => [`${noise({ fx: 0.02, fy: 0.006, oct: 4, rgb: [0.02, 0.06, 0.03], a: 1.6, b: -0.5 })} 0 0 / 360px`, "radial-gradient(ellipse 80% 50% at 50% 20%, rgba(150,200,140,.18), transparent 70%)", "linear-gradient(#0f2219, #07120d)"].join(",") },
    leather: { label: "Leather & oak", tone: "dark", css: () => ["linear-gradient(180deg, transparent 0 62%, rgba(0,0,0,.4) 62% calc(62% + 3px), transparent calc(62% + 3px))", `${noise({ fx: 0.25, fy: 0.25, oct: 3, a: 1, b: -0.42 })} 0 0 / 360px`, "radial-gradient(ellipse 120% 80% at 50% 30%, #5b3424, #2d170f)"].join(",") },
    night: {
      label: "Starry night", tone: "dark",
      css: () => {
        const stars = []; let x = 7;
        for (let i = 0; i < 46; i++) { x = (x * 73 + 41) % 997; const y = (x * 37) % 100, px = (x * 13) % 100, r = i % 9 === 0 ? 1.6 : i % 3 === 0 ? 1.1 : 0.7; stars.push(`radial-gradient(${r}px ${r}px at ${px}% ${y}%, rgba(255,255,255,${i % 4 ? 0.8 : 1}), transparent)`); }
        return [...stars, "radial-gradient(ellipse 140% 70% at 50% 110%, #1d2c55, transparent 70%)", "linear-gradient(#070b1a, #0e1630)"].join(",");
      },
    },
  };

  // ------------------------------------------------------------------ shelf materials
  const MATERIALS = {
    paint: { label: "Painted", base: null, tex: () => "none" },
    oak: { label: "Oak", base: "#b07c48", tex: () => grainH(0.5, 0.3) },
    walnut: { label: "Walnut", base: "#5a3820", tex: () => grainH(0.75, 0.2) },
    cherry: { label: "Cherry", base: "#8e4326", tex: () => grainH(0.6, 0.25) },
    pine: { label: "Pine", base: "#d4a568", tex: () => grainH(0.45, 0.35) },
    mahogany: { label: "Mahogany", base: "#5c2216", tex: () => grainH(0.7, 0.2) },
    ebony: { label: "Ebony", base: "#221915", tex: () => grainH(0.8, 0.15) },
    driftwood: { label: "Driftwood", base: "#a49784", tex: () => grainH(0.45, 0.45) },
    marble: { label: "Marble", base: "#ebe7e1", tex: () => [`${noise({ w: 600, h: 200, fx: 0.004, fy: 0.012, oct: 5, type: "turbulence", rgb: [0.35, 0.35, 0.38], a: -3.2, b: 0.95 })} 0 0 / 600px 200px`] },
    concrete: { label: "Concrete", base: "#8b8884", tex: () => [`${noise({ fx: 0.8, fy: 0.8, oct: 2, a: 1.3, b: -0.5 })} 0 0 / 360px`] },
    steel: { label: "Black steel", base: "#2a2b2e", tex: () => [`${noise({ w: 600, h: 60, fx: 0.002, fy: 0.9, oct: 2, rgb: [1, 1, 1], a: 0.7, b: -0.32 })} 0 0 / 600px 60px`] },
    brass: { label: "Brass", base: "#b08a45", tex: () => [`${noise({ w: 600, h: 60, fx: 0.002, fy: 0.9, oct: 2, rgb: [1, 0.95, 0.8], a: 1, b: -0.4 })} 0 0 / 600px 60px`, "linear-gradient(90deg, rgba(255,255,255,.0), rgba(255,255,255,.18) 40%, rgba(255,255,255,0) 60%)"] },
    glass: { label: "Glass", base: "rgba(200,230,228,.28)", tex: () => ["linear-gradient(90deg, rgba(255,255,255,.0), rgba(255,255,255,.25) 30%, rgba(255,255,255,.05) 55%, rgba(255,255,255,.2) 80%, rgba(255,255,255,0))"] },
  };

  // ------------------------------------------------------------------ hanging lights
  const LIGHT_STYLES = { none: "None", fairy: "Fairy lights", globe: "Globe bulbs", stars: "Little stars", candles: "Hanging candles", lanterns: "Paper lanterns", fireflies: "Fireflies" };
  const LIGHT_COLOURS = { warm: ["Warm", "#ffc46b"], white: ["Soft white", "#fff1d6"], multi: ["Party", null], pink: ["Pink", "#ff8fc3"], blue: ["Ice blue", "#9fd6ff"], green: ["Fern", "#a9f08d"] };
  const MULTI = ["#ff6b6b", "#ffd166", "#5be3a5", "#5cc8f5", "#c792ff"];
  let lid = 0;
  /** A string of lights draped under a shelf `w` pixels wide. */
  function lightsEl(w, cfg) {
    const style = cfg.style || "none"; if (style === "none") return null;
    if (style === "candles") return candlesEl(w, cfg);
    if (style === "fireflies") return firefliesEl(w, cfg);
    const on = !!cfg.on, col = LIGHT_COLOURS[cfg.colour] || LIGHT_COLOURS.warm;
    const colour = (i) => col[1] || MULTI[i % MULTI.length];
    const sag = style === "globe" ? 24 : style === "lanterns" ? 20 : 18, span = style === "globe" ? 190 : style === "lanterns" ? 200 : 130;
    const n = Math.max(2, Math.round(w / span)), L = w / n, H = sag + (style === "globe" ? 34 : style === "lanterns" ? 46 : 18);
    const id = "lg" + lid++;
    const q = (x0, t) => { const x1 = x0 + L, cx = x0 + L / 2, cy = 2 + sag * 2, u = 1 - t; return { x: u * u * x0 + 2 * u * t * cx + t * t * x1, y: u * u * 2 + 2 * u * t * cy + t * t * 2 }; };
    let wire = "M0 2", bulbs = "", k = 0;
    for (let s = 0; s < n; s++) {
      const x0 = s * L; wire += ` Q${(x0 + L / 2).toFixed(1)} ${2 + sag * 2} ${(x0 + L).toFixed(1)} 2`;
      const ts = style === "globe" || style === "lanterns" ? [0.27, 0.73] : style === "stars" ? [0.2, 0.5, 0.8] : [0.12, 0.31, 0.5, 0.69, 0.88];
      for (const t of ts) {
        const p = q(x0, t), c = colour(k), d = ((k * 0.73) % 3).toFixed(2);
        if (style === "globe") {
          bulbs += `<g class="bulb" style="--d:${d}s"><line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="${p.y + 9}" stroke="#2a2420" stroke-width="1.4"/><rect x="${p.x - 2.6}" y="${p.y + 8}" width="5.2" height="5" rx="1" fill="#3a332d"/>`
            + `<circle class="halo" cx="${p.x}" cy="${p.y + 20}" r="16" fill="${c}" filter="url(#${id})"/><circle class="glass" cx="${p.x}" cy="${p.y + 20}" r="8" fill="${on ? c : "rgba(255,255,255,.2)"}" stroke="rgba(255,255,255,.45)" stroke-width=".8"/>`
            + `<path class="filament" d="M${p.x - 2.5} ${p.y + 21} q2.5 -4 5 0" stroke="${on ? "#fff7e0" : "rgba(80,70,60,.6)"}" stroke-width="1" fill="none"/></g>`;
        } else if (style === "lanterns") {
          // round paper lantern: ribbed shade, dark cap and base, a tassel
          const cy = p.y + 24, rx = 13, ry = 15, lit = on ? c : "#d9cdbb";
          const ribs = [-0.62, -0.25, 0.25, 0.62].map((f) => `<ellipse cx="${p.x}" cy="${cy}" rx="${(rx * Math.abs(f)).toFixed(1)}" ry="${ry}" fill="none" stroke="rgba(90,40,20,.28)" stroke-width=".7"/>`).join("");
          bulbs += `<g class="bulb" style="--d:${d}s"><line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="${cy - ry}" stroke="#2a2420" stroke-width="1.1"/>`
            + `<circle class="halo" cx="${p.x}" cy="${cy}" r="24" fill="${c}" filter="url(#${id})"/>`
            + `<ellipse class="glass" cx="${p.x}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${lit}" stroke="rgba(90,40,20,.35)" stroke-width=".8"/>${ribs}`
            + `<ellipse cx="${p.x - 4}" cy="${cy - 4}" rx="4" ry="7" fill="#fff" opacity="${on ? 0.35 : 0.15}"/>`
            + `<rect x="${p.x - 6}" y="${cy - ry - 2}" width="12" height="4" rx="1" fill="#2a2420"/><rect x="${p.x - 6}" y="${cy + ry - 2}" width="12" height="4" rx="1" fill="#2a2420"/>`
            + `<line x1="${p.x}" y1="${cy + ry + 2}" x2="${p.x}" y2="${cy + ry + 10}" stroke="#b33a2c" stroke-width="2"/></g>`;
        } else if (style === "stars") {
          const r = 5.5, pts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; return `${(p.x + rr * Math.cos(a)).toFixed(1)},${(p.y + 9 + rr * Math.sin(a)).toFixed(1)}`; }).join(" ");
          bulbs += `<g class="bulb" style="--d:${d}s"><line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="${p.y + 4}" stroke="#2a2420" stroke-width="1"/><circle class="halo" cx="${p.x}" cy="${p.y + 9}" r="11" fill="${c}" filter="url(#${id})"/><polygon class="glass" points="${pts}" fill="${on ? c : "rgba(255,255,255,.25)"}" stroke="rgba(255,255,255,.4)" stroke-width=".6"/></g>`;
        } else {
          bulbs += `<g class="bulb" style="--d:${d}s"><circle class="halo" cx="${p.x}" cy="${p.y + 3}" r="8" fill="${c}" filter="url(#${id})"/><ellipse class="glass" cx="${p.x}" cy="${p.y + 3.5}" rx="2.4" ry="3.2" fill="${on ? c : "rgba(255,255,255,.28)"}"/><circle cx="${p.x}" cy="${p.y}" r="1.3" fill="#2a2420"/></g>`;
        }
        k++;
      }
    }
    const glowCol = col[1] || "#ffd9a0";
    const el = document.createElement("div");
    el.className = "lights " + style + (on ? " on" : "");
    el.innerHTML = `<div class="lightGlow" style="--glow:${glowCol}"></div><svg width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" aria-hidden="true"><defs><filter id="${id}" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="${style === "globe" ? 5 : 3}"/></filter></defs><path d="${wire}" stroke="#2a2420" stroke-width="1.3" fill="none" opacity=".85"/>${bulbs}</svg>`;
    el.style.height = H + "px";
    return el;
  }

  /** Taper candles in little brass holders, hanging on chains of different lengths. */
  function candlesEl(w, cfg) {
    const on = !!cfg.on, col = LIGHT_COLOURS[cfg.colour] || LIGHT_COLOURS.warm, flameC = col[1] || "#ffc46b";
    const n = Math.max(3, Math.round(w / 78)), gap = w / n, id = "lg" + lid++;
    const wax = cfg.wax || "#efe6d2";
    let H = 0, out = "";
    for (let i = 0; i < n; i++) {
      const x = gap * (i + 0.5) + ((i * 37) % 11) - 5, chain = 8 + ((i * 53) % 5) * 7, tall = 20 + ((i * 29) % 3) * 4;
      const dishY = chain + tall + 8, top = dishY - tall;
      H = Math.max(H, dishY + 8);
      let links = ""; for (let y = 0; y < chain + 2; y += 4) links += `<ellipse cx="${x}" cy="${y + 2}" rx="${y % 8 ? 1 : 1.6}" ry="2" fill="none" stroke="#7a6640" stroke-width=".9"/>`;
      out += `<g class="bulb candle" style="--d:${((i * 0.41) % 1.3).toFixed(2)}s">${links}`
        + `<path d="M${x - 4} ${chain + 2} L${x} ${top - 2} L${x + 4} ${chain + 2}" stroke="#7a6640" stroke-width=".8" fill="none" opacity=".0"/>`
        + `<circle class="halo" cx="${x}" cy="${top - 8}" r="20" fill="${flameC}" filter="url(#${id})"/>`
        + `<rect x="${x - 3.6}" y="${top}" width="7.2" height="${tall}" rx="1.4" fill="${wax}"/>`
        + `<path d="M${x - 3.6} ${top + 2} q1.2 5 0 8 M${x + 2.2} ${top + 1} q1.3 4 .4 9" stroke="${wax}" stroke-width="2.2" stroke-linecap="round" fill="none" filter="brightness(.92)"/>`
        + `<rect x="${x - 3.6}" y="${top}" width="2.2" height="${tall}" fill="#fff" opacity=".25"/>`
        + `<line x1="${x}" y1="${top}" x2="${x}" y2="${top - 3}" stroke="#2a2420" stroke-width=".9"/>`
        + `<g class="flame"><path d="M${x} ${top - 15} C${x + 4.2} ${top - 9} ${x + 3.6} ${top - 3} ${x} ${top - 2.5} C${x - 3.6} ${top - 3} ${x - 4.2} ${top - 9} ${x} ${top - 15}Z" fill="${flameC}"/><path d="M${x} ${top - 10} C${x + 1.8} ${top - 7} ${x + 1.5} ${top - 4} ${x} ${top - 3.5} C${x - 1.5} ${top - 4} ${x - 1.8} ${top - 7} ${x} ${top - 10}Z" fill="#fffbe8"/></g>`
        + `<path d="M${x - 9} ${dishY - 2} Q${x} ${dishY + 5} ${x + 9} ${dishY - 2} Z" fill="#a88a4e"/><ellipse cx="${x}" cy="${dishY - 2}" rx="9" ry="2" fill="#c9a865"/>`
        + `<line x1="${x - 8}" y1="${dishY - 2}" x2="${x}" y2="${chain + 1}" stroke="#7a6640" stroke-width=".7"/><line x1="${x + 8}" y1="${dishY - 2}" x2="${x}" y2="${chain + 1}" stroke="#7a6640" stroke-width=".7"/>`
        + `</g>`;
    }
    const el = document.createElement("div");
    el.className = "lights candles" + (on ? " on" : "");
    el.innerHTML = `<div class="lightGlow" style="--glow:${flameC}"></div><svg width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" aria-hidden="true"><defs><filter id="${id}" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6"/></filter></defs>${out}</svg>`;
    el.style.height = H + "px";
    return el;
  }

  /** Little glowing dots drifting around the books. */
  function firefliesEl(w, cfg) {
    const on = !!cfg.on, col = LIGHT_COLOURS[cfg.colour] || LIGHT_COLOURS.green;
    const el = document.createElement("div");
    el.className = "lights fireflies" + (on ? " on" : "");
    const n = Math.max(12, Math.round(w / 22));
    let dots = "";
    for (let i = 0; i < n; i++) {
      const x = ((i * 61) % 97) + 1.5, y = ((i * 37) % 90) + 2, c = col[1] || MULTI[i % MULTI.length];
      dots += `<i style="left:${x}%;top:${y}%;--c:${c};--d:${((i * 0.77) % 6).toFixed(2)}s;--t:${(5 + (i % 5) * 1.3).toFixed(1)}s;--dx:${((i * 13) % 30) - 15}px;--dy:${((i * 7) % 26) - 18}px"></i>`;
    }
    el.innerHTML = dots;
    return el;
  }

  // ------------------------------------------------------------------ heading fonts
  const HEAD_FONTS = {
    bricolage: ["Modern", "'Bricolage Grotesque', 'Inter Tight', system-ui, sans-serif"],
    playfair: ["Classic serif", "'Playfair Display', Georgia, serif"],
    cormorant: ["Garamond", "'Cormorant Garamond', Georgia, serif"],
    dmserif: ["Soft serif", "'DM Serif Display', Georgia, serif"],
    cinzel: ["Engraved", "'Cinzel', Georgia, serif"],
    caveat: ["Handwritten", "'Caveat', cursive"],
    oswald: ["Poster", "'Oswald', 'Inter Tight', sans-serif"],
    abril: ["Fat serif", "'Abril Fatface', Georgia, serif"],
    gothic: ["Gothic", "'Pirata One', 'Cinzel', serif"],
    fell: ["Victorian", "'IM Fell English', Georgia, serif"],
  };

  // ------------------------------------------------------------------ cozy palettes and ready-made looks
  const PALETTES = {
    cabin: { label: "Cabin", t: ["#1d140e", "#f3e7d6", "#271b13", "#2b1f16", "#30231a", "#a8927b", "#3d2d21", "#3a2b20", "#4d3a2b", "dark"] },
    candle: { label: "Candle", t: ["#160f0a", "#f6e6cf", "#20160f", "#241912", "#2a1d14", "#a99075", "#38291d", "#35271c", "#4a3726", "dark"] },
    moss: { label: "Moss", t: ["#121a14", "#ebe7d6", "#19231b", "#1c271e", "#202c22", "#97a08a", "#2b382d", "#28362a", "#3a4a3c", "dark"] },
    crimson: { label: "Crimson", t: ["#120709", "#f1e2e0", "#1b0c0f", "#200e12", "#251116", "#a68588", "#3a1a20", "#33161b", "#4d2229", "dark"] },
    parlour: { label: "Parlour", t: ["#1a1012", "#f0e4cf", "#24171a", "#291b1e", "#2e1f22", "#a9917c", "#3e2b2c", "#3a2829", "#4f393a", "dark"] },
    pinewood: { label: "Pinewood", t: ["#0b1510", "#e4efe2", "#121e17", "#15231b", "#18281e", "#87a08f", "#22372a", "#203327", "#2f4636", "dark"] },
    rice: { label: "Rice paper", t: ["#f3ecdf", "#2a2219", "#ebe2d1", "#faf6ee", "#e3d8c4", "#7a6c58", "#d9ccb4", "#ddd1bb", "#cdbfa5", "light"] },
    latte: { label: "Latte", t: ["#efe4d4", "#2b2016", "#e6d8c4", "#f8f1e6", "#dfcfb8", "#7b6853", "#d6c4ab", "#dccab0", "#cbb79c", "light"] },
  };
  const LOOK_KEYS = ["theme", "customBg", "accent", "shelf", "shelfMat", "backdrop", "lights", "headFont"];
  const LOOKS = {
    minimal: { label: "Minimal", set: { theme: "graphite", accent: "#f2c76b", shelf: "#34343f", shelfMat: "paint", backdrop: "none", lights: { style: "none", colour: "warm", on: false }, headFont: "bricolage" } },
    cabin: { label: "Cozy cabin", set: { theme: "cabin", accent: "#f0a85a", shelfMat: "oak", backdrop: "walnutPanel", lights: { style: "fairy", colour: "warm", on: true }, headFont: "cormorant" } },
    nook: { label: "Reading nook", set: { theme: "latte", accent: "#b8683a", shelfMat: "pine", backdrop: "plaster", lights: { style: "globe", colour: "warm", on: true }, headFont: "playfair" } },
    library: { label: "Old library", set: { theme: "moss", accent: "#d8b26a", shelfMat: "mahogany", backdrop: "greenWall", lights: { style: "none", colour: "warm", on: false }, headFont: "cinzel" } },
    loft: { label: "Brick loft", set: { theme: "graphite", accent: "#f2b35b", shelfMat: "steel", backdrop: "brick", lights: { style: "globe", colour: "warm", on: true }, headFont: "oswald" } },
    starry: { label: "Starry night", set: { theme: "midnight", accent: "#9fc4ff", shelfMat: "ebony", backdrop: "night", lights: { style: "stars", colour: "white", on: true }, headFont: "dmserif" } },
    cottage: { label: "Cottage", set: { theme: "paper", accent: "#c4675f", shelfMat: "whitewashWood", backdrop: "stripes", lights: { style: "fairy", colour: "warm", on: true }, headFont: "caveat" } },
    candle: { label: "Candlelit", set: { theme: "candle", accent: "#f0b45c", shelfMat: "walnut", backdrop: "candle", lights: { style: "globe", colour: "warm", on: true }, headFont: "abril" } },
  };
  Object.assign(LOOKS, {
    vampire: { label: "Vampire's lair", set: { theme: "crimson", accent: "#c4243a", shelfMat: "ebony", backdrop: "velvet", lights: { style: "candles", colour: "warm", on: true }, headFont: "gothic" } },
    victorian: { label: "Victorian parlour", set: { theme: "parlour", accent: "#d4af6a", shelfMat: "mahogany", backdrop: "greenDamask", lights: { style: "candles", colour: "warm", on: true }, headFont: "fell" } },
    castle: { label: "Haunted castle", set: { theme: "graphite", accent: "#b9a7ff", shelfMat: "steel", backdrop: "stone", lights: { style: "candles", colour: "white", on: true }, headFont: "cinzel" } },
    bordello: { label: "Gothic romance", set: { theme: "crimson", accent: "#e0b46a", shelfMat: "brass", backdrop: "damask", lights: { style: "globe", colour: "warm", on: true }, headFont: "fell" } },
    forest: { label: "Enchanted forest", set: { theme: "pinewood", accent: "#a9f08d", shelfMat: "driftwood", backdrop: "forest", lights: { style: "fireflies", colour: "green", on: true }, headFont: "cormorant" } },
    academia: { label: "Dark academia", set: { theme: "cabin", accent: "#c9a25b", shelfMat: "walnut", backdrop: "leather", lights: { style: "globe", colour: "warm", on: true }, headFont: "fell" } },
    teahouse: { label: "Tea house", set: { theme: "rice", accent: "#b8402f", shelfMat: "pine", backdrop: "shoji", lights: { style: "lanterns", colour: "warm", on: true }, headFont: "cormorant" } },
  });
  MATERIALS.whitewashWood = { label: "Whitewashed", base: "#d9cfc0", tex: () => grainH(0.3, 0.2) };

  window.Decor = { BACKDROPS, MATERIALS, LIGHT_STYLES, LIGHT_COLOURS, HEAD_FONTS, PALETTES, LOOKS, LOOK_KEYS, lightsEl };
})();
