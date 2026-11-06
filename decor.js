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

  /** Tiny lilac and blue flowers on thin vines, like old cottage wallpaper. */
  const ditsyTile = () => {
    const fl = (x, y, c, r = 2.1) => Array.from({ length: 5 }, (_, i) => { const a = i * 1.2566 - 1.57; return `<circle cx="${(x + Math.cos(a) * r).toFixed(2)}" cy="${(y + Math.sin(a) * r).toFixed(2)}" r="${(r * 0.62).toFixed(2)}" fill="${c}"/>`; }).join("") + `<circle cx="${x}" cy="${y}" r="${(r * 0.42).toFixed(2)}" fill="#e9d79a"/>`;
    const leaf = (x, y, a) => `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="1.1" fill="#9aa58e" transform="rotate(${a} ${x} ${y})"/>`;
    const sprig = (x, y, flip) => `<path d="M${x} ${y} q${6 * flip} -6 ${2 * flip} -14 q${-4 * flip} -7 ${3 * flip} -14" stroke="#a3ab98" stroke-width=".7" fill="none"/>` + leaf(x + 3 * flip, y - 6, 30 * flip) + leaf(x + 1 * flip, y - 15, -40 * flip) + leaf(x + 5 * flip, y - 22, 20 * flip);
    return svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>${sprig(10, 34, 1)}${fl(15, 12, "#8d98c6")}${fl(8, 30, "#b3a4cf", 1.7)}${sprig(44, 62, -1)}${fl(40, 40, "#9fb0d6")}${fl(50, 46, "#b3a4cf", 1.6)}${fl(30, 58, "#8d98c6", 1.5)}${fl(58, 18, "#a69bcb", 1.8)}</svg>`);
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
    ditsy: { label: "Ditsy floral", tone: "light", css: () => [`${noise({ fx: 0.01, fy: 0.01, oct: 3, a: 0.5, b: -0.22 })} 0 0 / 360px`, `${ditsyTile()} 0 0 / 64px 64px`, "radial-gradient(ellipse 120% 90% at 50% 30%, #ebe4d8, #d9cfbf)"].join(",") },
    goldenHour: {
      label: "Golden hour", tone: "dark",
      css: () => [
        // late sun through a window: soft slanted panes of warm light, with the frame's shadow between them
        "linear-gradient(118deg, transparent 0 30%, rgba(255,190,110,.16) 33%, rgba(255,200,130,.22) 39%, transparent 40.5% 42%, rgba(255,200,130,.2) 43.5%, rgba(255,190,110,.14) 50%, transparent 53%)",
        "linear-gradient(118deg, transparent 0 58%, rgba(255,190,110,.10) 61%, rgba(255,200,130,.14) 66%, transparent 67.5% 69%, rgba(255,200,130,.12) 70.5%, transparent 76%)",
        "radial-gradient(ellipse 70% 45% at 78% 18%, rgba(255,186,96,.22), transparent 70%)",
        `${noise({ fx: 0.012, fy: 0.012, oct: 3, a: 0.6, b: -0.28 })} 0 0 / 360px`,
        "linear-gradient(180deg, #4f4339, #3a3029 65%, #2c241f)",
      ].join(","),
    },
    lanternNight: { label: "Lantern night", tone: "dark", css: () => ["radial-gradient(ellipse 90% 45% at 50% 0, rgba(255,70,30,.32), transparent 70%)", "radial-gradient(ellipse 60% 40% at 15% 60%, rgba(255,60,25,.12), transparent 70%)", "radial-gradient(ellipse 60% 40% at 90% 75%, rgba(255,60,25,.10), transparent 70%)", `${noise({ fx: 0.01, fy: 0.01, oct: 3, a: 0.9, b: -0.4 })} 0 0 / 360px`, "linear-gradient(#1c0706, #0b0303)"].join(",") },
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
    honey: { label: "Honey oak", base: "#87562f", tex: () => grainH(0.55, 0.3) },
    paintedWhite: { label: "Painted white", base: "#ddd5c8", tex: () => [`${noise({ w: 700, h: 160, fx: 0.003, fy: 0.2, oct: 3, a: 0.6, b: -0.28 })} 0 0 / 700px 160px`] },
    lacquer: { label: "Black lacquer", base: "#1f0b09", tex: () => ["linear-gradient(90deg, rgba(255,255,255,0), rgba(255,220,200,.10) 35%, rgba(255,255,255,0) 55%, rgba(255,220,200,.06) 80%, rgba(255,255,255,0))", ...grainH(0.5, 0.08)] },
    glass: { label: "Glass", base: "rgba(200,230,228,.28)", tex: () => ["linear-gradient(90deg, rgba(255,255,255,.0), rgba(255,255,255,.25) 30%, rgba(255,255,255,.05) 55%, rgba(255,255,255,.2) 80%, rgba(255,255,255,0))"] },
  };

  // ------------------------------------------------------------------ hanging lights
  const LIGHT_STYLES = { none: "None", fairy: "Fairy lights", globe: "Globe bulbs", stars: "Little stars", candles: "Hanging candles", lanterns: "Paper lanterns", chinese: "Red lanterns", fireflies: "Fireflies", wisteria: "Wisteria" };
  const LIGHT_COLOURS = { warm: ["Warm", "#ffc46b"], white: ["Soft white", "#fff1d6"], multi: ["Party", null], pink: ["Pink", "#ff8fc3"], blue: ["Ice blue", "#9fd6ff"], green: ["Fern", "#a9f08d"] };
  const MULTI = ["#ff6b6b", "#ffd166", "#5be3a5", "#5cc8f5", "#c792ff"];
  let lid = 0;
  /** A string of lights draped under a shelf `w` pixels wide. */
  function lightsEl(w, cfg) {
    const style = cfg.style || "none"; if (style === "none") return null;
    if (style === "candles") return candlesEl(w, cfg);
    if (style === "fireflies") return firefliesEl(w, cfg);
    if (style === "wisteria") return wisteriaEl(w);
    if (style === "chinese") return chineseEl(w, cfg);
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
            + `<circle class="halo" cx="${p.x}" cy="${p.y + 20}" r="16" fill="${c}" filter="url(#${id})"/><circle class="glassOff" cx="${p.x}" cy="${p.y + 20}" r="8" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.45)" stroke-width=".8"/>`
            + `<path d="M${p.x - 2.5} ${p.y + 21} q2.5 -4 5 0" stroke="rgba(80,70,60,.6)" stroke-width="1" fill="none"/>`
            + `<circle class="ember" cx="${p.x}" cy="${p.y + 20}" r="4" fill="#ff7a1a" filter="url(#${id}e)"/>`
            + `<circle class="glass" cx="${p.x}" cy="${p.y + 20}" r="8" fill="${c}" stroke="rgba(255,255,255,.45)" stroke-width=".8"/>`
            + `<path class="glass" d="M${p.x - 2.5} ${p.y + 21} q2.5 -4 5 0" stroke="#fff7e0" stroke-width="1" fill="none"/></g>`;
        } else if (style === "lanterns") {
          // round paper lantern: ribbed shade, dark cap and base, a tassel
          const cy = p.y + 24, rx = 13, ry = 15, lit = on ? c : "#d9cdbb";
          const ribs = [-0.62, -0.25, 0.25, 0.62].map((f) => `<ellipse cx="${p.x}" cy="${cy}" rx="${(rx * Math.abs(f)).toFixed(1)}" ry="${ry}" fill="none" stroke="rgba(90,40,20,.28)" stroke-width=".7"/>`).join("");
          bulbs += `<g class="bulb" style="--d:${d}s"><line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="${cy - ry}" stroke="#2a2420" stroke-width="1.1"/>`
            + `<circle class="halo" cx="${p.x}" cy="${cy}" r="24" fill="${c}" filter="url(#${id})"/>`
            + `<ellipse class="glassOff" cx="${p.x}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#d9cdbb" stroke="rgba(90,40,20,.35)" stroke-width=".8"/>`
            + `<ellipse class="ember" cx="${p.x}" cy="${cy}" rx="${rx * 0.6}" ry="${ry * 0.6}" fill="#ff8a3a" filter="url(#${id}e)"/>`
            + `<ellipse class="glass" cx="${p.x}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}" stroke="rgba(90,40,20,.35)" stroke-width=".8"/>${ribs}`
            + `<ellipse cx="${p.x - 4}" cy="${cy - 4}" rx="4" ry="7" fill="#fff" opacity=".25"/>`
            + `<rect x="${p.x - 6}" y="${cy - ry - 2}" width="12" height="4" rx="1" fill="#2a2420"/><rect x="${p.x - 6}" y="${cy + ry - 2}" width="12" height="4" rx="1" fill="#2a2420"/>`
            + `<line x1="${p.x}" y1="${cy + ry + 2}" x2="${p.x}" y2="${cy + ry + 10}" stroke="#b33a2c" stroke-width="2"/></g>`;
        } else if (style === "stars") {
          const r = 5.5, pts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; return `${(p.x + rr * Math.cos(a)).toFixed(1)},${(p.y + 9 + rr * Math.sin(a)).toFixed(1)}`; }).join(" ");
          bulbs += `<g class="bulb" style="--d:${d}s"><line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="${p.y + 4}" stroke="#2a2420" stroke-width="1"/><circle class="halo" cx="${p.x}" cy="${p.y + 9}" r="11" fill="${c}" filter="url(#${id})"/><polygon class="glassOff" points="${pts}" fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.4)" stroke-width=".6"/><circle class="ember" cx="${p.x}" cy="${p.y + 9}" r="3" fill="#ff7a1a" filter="url(#${id}e)"/><polygon class="glass" points="${pts}" fill="${c}" stroke="rgba(255,255,255,.4)" stroke-width=".6"/></g>`;
        } else {
          bulbs += `<g class="bulb" style="--d:${d}s"><circle class="halo" cx="${p.x}" cy="${p.y + 3}" r="8" fill="${c}" filter="url(#${id})"/><ellipse class="glassOff" cx="${p.x}" cy="${p.y + 3.5}" rx="2.4" ry="3.2" fill="rgba(255,255,255,.28)"/><circle class="ember" cx="${p.x}" cy="${p.y + 3.5}" r="2" fill="#ff7a1a" filter="url(#${id}e)"/><ellipse class="glass" cx="${p.x}" cy="${p.y + 3.5}" rx="2.4" ry="3.2" fill="${c}"/><circle cx="${p.x}" cy="${p.y}" r="1.3" fill="#2a2420"/></g>`;
        }
        k++;
      }
    }
    const glowCol = col[1] || "#ffd9a0";
    const el = document.createElement("div");
    el.className = "lights " + style + (on ? " on" : "");
    el.innerHTML = `<div class="lightGlow" style="--glow:${glowCol}"></div><svg width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" aria-hidden="true"><defs><filter id="${id}" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="${style === "globe" ? 5 : 3}"/></filter><filter id="${id}e" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="1.2"/></filter></defs><path d="${wire}" stroke="#2a2420" stroke-width="1.3" fill="none" opacity=".85"/>${bulbs}</svg>`;
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

  /** Strands of wisteria hanging from the shelf edge (decoration, not a light). */
  function wisteriaEl(w) {
    const n = Math.max(6, Math.round(w / 34)), gap = w / n;
    let vine = `M0 3`, leaves = "", strands = "", H = 0;
    for (let i = 0; i <= n; i++) vine += ` Q${(i - 0.5) * gap} ${i % 2 ? 9 : 1} ${i * gap} 3`;
    const purple = ["#c8a6d8", "#b996cf", "#d6b8e2", "#a987c4"];
    for (let i = 0; i < n; i++) {
      const x0 = gap * (i + 0.5) + ((i * 17) % 9) - 4, len = 34 + ((i * 41) % 6) * 11, green = i % 3 === 1;
      H = Math.max(H, len + 10);
      // each strand is its own little picture, so the swaying runs on the graphics card and stays smooth
      const c = 10; // centre of the strand's box
      let st = `<path d="M${c} 0 q2 ${len / 2} -1 ${len}" stroke="#5c6b4a" stroke-width=".8" fill="none"/>`;
      if (green) { for (let y = 4; y < len; y += 5) st += `<ellipse cx="${c + (y % 10 ? 2.6 : -2.6)}" cy="${y}" rx="2.8" ry="1.3" fill="${["#55663f", "#6b7d4f", "#4a5a37"][y % 3]}" transform="rotate(${y % 10 ? 35 : -35} ${c + (y % 10 ? 2.6 : -2.6)} ${y})"/>`; }
      else { for (let y = 2; y < len; y += 2.6) { const r = 3.4 * (1 - y / (len + 8)) + 0.9; st += `<circle cx="${(c + Math.sin(y * 1.7) * r * 0.7).toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${purple[Math.round(y) % 4]}"/>`; } }
      strands += `<svg class="strand" width="20" height="${len + 6}" viewBox="0 0 20 ${len + 6}" style="left:${(x0 - c).toFixed(1)}px;--d:-${((i * 0.53) % 2.4).toFixed(2)}s;--t:${(4.6 + (i % 4) * 0.7).toFixed(1)}s" aria-hidden="true">${st}</svg>`;
      leaves += `<ellipse cx="${gap * i + 10}" cy="5" rx="3.2" ry="1.4" fill="#55663f" transform="rotate(${i % 2 ? 25 : -20} ${gap * i + 10} 5)"/>`;
    }
    const el = document.createElement("div");
    el.className = "lights wisteria";
    el.innerHTML = `${strands}<svg class="vine" width="${w}" height="12" viewBox="0 0 ${w} 12" aria-hidden="true"><path d="${vine}" stroke="#4d5a3c" stroke-width="1.6" fill="none"/>${leaves}</svg>`;
    el.style.height = H + "px";
    return el;
  }

  /** Big round red lanterns with gold caps and tassels, on cords of different lengths. */
  function chineseEl(w, cfg) {
    const on = !!cfg.on, n = Math.max(2, Math.round(w / 120)), gap = w / n, id = "lg" + lid++;
    let out = "", H = 0;
    for (let i = 0; i < n; i++) {
      const x = gap * (i + 0.5) + ((i * 23) % 13) - 6, cord = 6 + ((i * 37) % 3) * 9, rx = 20, ry = 16, cy = cord + 6 + ry;
      H = Math.max(H, cy + ry + 30);
      let ribs = ""; for (const f of [-0.75, -0.4, 0, 0.4, 0.75]) ribs += `<ellipse cx="${x}" cy="${cy}" rx="${(rx * Math.abs(f)).toFixed(1)}" ry="${ry}" fill="none" stroke="rgba(90,10,0,.45)" stroke-width=".7"/>`;
      out += `<g class="bulb" style="--d:${((i * 0.7) % 2).toFixed(2)}s"><line x1="${x}" y1="0" x2="${x}" y2="${cord + 3}" stroke="#2a1410" stroke-width="1"/>`
        + `<circle class="halo" cx="${x}" cy="${cy}" r="34" fill="#ff4a1c" filter="url(#${id})"/>`
        + `<ellipse class="glassOff" cx="${x}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#6e1a12"/><ellipse class="ember" cx="${x}" cy="${cy}" rx="${rx * 0.55}" ry="${ry * 0.55}" fill="#ff6a2a" filter="url(#${id}e)"/><ellipse class="glass" cx="${x}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id}f)"/>${ribs}`
        + `<path d="M${x - 6} ${cy - 3} q6 -5 12 0 q-6 5 -12 0Z" fill="#2a0a05" opacity=".45"/>`
        + `<rect x="${x - 9}" y="${cy - ry - 3}" width="18" height="5" rx="1.5" fill="#d6a73e"/><rect x="${x - 9}" y="${cy + ry - 2}" width="18" height="5" rx="1.5" fill="#d6a73e"/>`
        + Array.from({ length: 7 }, (_, k) => `<line x1="${x - 4.5 + k * 1.5}" y1="${cy + ry + 3}" x2="${x - 5 + k * 1.7}" y2="${cy + ry + 22 + (k % 2) * 3}" stroke="#e0b14d" stroke-width=".9"/>`).join("")
        + `<rect x="${x - 2}" y="${cy + ry + 2}" width="4" height="4" rx="1" fill="#b8402f"/></g>`;
    }
    const el = document.createElement("div");
    el.className = "lights chinese" + (on ? " on" : "");
    el.innerHTML = `<div class="lightGlow" style="--glow:#ff5a2a"></div><svg width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" aria-hidden="true"><defs><filter id="${id}" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9"/></filter><filter id="${id}e" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4"/></filter><radialGradient id="${id}f" cx=".45" cy=".42" r=".65"><stop offset="0" stop-color="#ffb070"/><stop offset=".45" stop-color="#ff4a1f"/><stop offset="1" stop-color="#b3180c"/></radialGradient></defs>${out}</svg>`;
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

  // ------------------------------------------------------------------ an ornament that stands on the shelf among the books
  // Drawn in a box `vw` wide and 200 tall; `w` is its width as a share of the book height.
  const metal = (id, stops) => `<linearGradient id="${id}" x1="0" x2="1" y1="0" y2="0">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;
  const BRASS = [[0, "#5a421c"], [0.28, "#c9a65e"], [0.45, "#f3dc9a"], [0.62, "#a9843f"], [1, "#4a3616"]];
  const BRONZE = [[0, "#33240f"], [0.28, "#87683a"], [0.45, "#c9a46a"], [0.62, "#6e5226"], [1, "#281b0b"]];
  const SILVER = [[0, "#3d4046"], [0.3, "#a9adb5"], [0.46, "#f1f3f6"], [0.62, "#8b9097"], [1, "#30333a"]];
  const taper = (x, top, bottom, wd, wax = "#efe6d2") => `<rect x="${x - wd / 2}" y="${top}" width="${wd}" height="${bottom - top}" rx="1.6" fill="${wax}"/>`
    + `<rect x="${x - wd / 2}" y="${top}" width="${wd * 0.3}" height="${bottom - top}" fill="#fff" opacity=".28"/>`
    + `<path d="M${x - wd / 2 + 0.6} ${top + 2} q-1 7 .4 12 M${x + wd / 2 - 1.2} ${top + 1} q1.4 5 .2 9 M${x} ${top + 1} q.8 4 0 6" stroke="${wax}" stroke-width="2.6" stroke-linecap="round" fill="none"/>`
    + `<line x1="${x}" y1="${top}" x2="${x}" y2="${top - 4}" stroke="#2a2420" stroke-width="1.2"/>`;
  const flame = (x, y, s = 1) => `<circle class="ember" cx="${x}" cy="${y - 0.5}" r="${1.4 * s}" fill="#ff7a2a"/><g class="ornFlame" data-x="${x}" data-y="${y}"><g class="ornFlicker"><ellipse cx="${x}" cy="${y - 9 * s}" rx="${5 * s}" ry="${11 * s}" fill="#ffb347" opacity=".55"/><path d="M${x} ${y - 20 * s} C${x + 6 * s} ${y - 12 * s} ${x + 5 * s} ${y - 2 * s} ${x} ${y} C${x - 5 * s} ${y - 2 * s} ${x - 6 * s} ${y - 12 * s} ${x} ${y - 20 * s}Z" fill="#ffc861"/><path d="M${x} ${y - 13 * s} C${x + 2.6 * s} ${y - 9 * s} ${x + 2.2 * s} ${y - 3 * s} ${x} ${y - 1.5 * s} C${x - 2.2 * s} ${y - 3 * s} ${x - 2.6 * s} ${y - 9 * s} ${x} ${y - 13 * s}Z" fill="#fffbe6"/><ellipse cx="${x}" cy="${y - 1}" rx="${1.6 * s}" ry="${2.4 * s}" fill="#5a7cff" opacity=".55"/></g></g>`;
  const ORNAMENTS = {
    none: { label: "None" },
    candlestick: {
      label: "Brass candlestick", scale: 0.74, vw: 60,
      draw: (g) => `<defs>${metal(g, BRASS)}</defs>`
        + `<path d="M4 200 L4 196 Q8 182 22 178 L38 178 Q52 182 56 196 L56 200Z" fill="url(#${g})"/><ellipse cx="30" cy="196" rx="26" ry="3" fill="url(#${g})"/>`
        + `<path d="M25 178 C20 170 22 160 27 156 C22 148 24 136 27 128 L26 96 C21 92 21 86 27 84 L33 84 C39 86 39 92 34 96 L33 128 C36 136 38 148 33 156 C38 160 40 170 35 178Z" fill="url(#${g})"/>`
        + `<ellipse cx="30" cy="84" rx="15" ry="3.5" fill="url(#${g})"/><path d="M15 84 Q30 92 45 84" fill="url(#${g})"/>`
        + taper(30, 30, 82, 11) + flame(30, 25, 1.05),
    },
    candelabra: {
      label: "Silver candelabra", scale: 0.7, vw: 140,
      draw: (g) => `<defs>${metal(g, SILVER)}</defs>`
        + `<path d="M36 200 L36 196 Q42 180 60 176 L80 176 Q98 180 104 196 L104 200Z" fill="url(#${g})"/><ellipse cx="70" cy="196" rx="34" ry="3.2" fill="url(#${g})"/>`
        + `<path d="M66 176 C60 166 62 152 67 146 L66 112 C60 108 61 101 67 99 L73 99 C79 101 80 108 74 112 L73 146 C78 152 80 166 74 176Z" fill="url(#${g})"/>`
        + `<path d="M70 112 C46 112 22 112 20 92 M70 112 C94 112 118 112 120 92" stroke="url(#${g})" stroke-width="5" fill="none" stroke-linecap="round"/>`
        + `<path d="M70 112 C56 122 34 124 30 110 M70 112 C84 122 106 124 110 110" stroke="url(#${g})" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>`
        + [[20, 92], [120, 92], [70, 76]].map(([x, y]) => `<path d="M${x - 10} ${y} Q${x} ${y + 8} ${x + 10} ${y}Z" fill="url(#${g})"/><ellipse cx="${x}" cy="${y}" rx="10" ry="2.6" fill="url(#${g})"/>`).join("")
        + `<rect x="67" y="76" width="6" height="26" fill="url(#${g})"/><ellipse cx="70" cy="88" rx="5" ry="4" fill="url(#${g})"/>`
        + taper(20, 46, 90, 9) + taper(120, 46, 90, 9) + taper(70, 22, 74, 10)
        + flame(20, 41, 0.9) + flame(120, 41, 0.9) + flame(70, 17, 1),
    },
    twist: {
      label: "Barley-twist brass", scale: 0.78, vw: 50,
      draw: (g) => {
        let twist = ""; for (let y = 122; y < 176; y += 7) twist += `<path d="M20 ${y + 6} Q25 ${y - 1} 30 ${y}" stroke="#5a421c" stroke-width="2.2" fill="none" opacity=".7"/>`;
        return `<defs>${metal(g, BRASS)}</defs>`
          + `<path d="M3 200 L3 196 Q6 186 17 182 Q22 178 22 174 L28 174 Q28 178 33 182 Q44 186 47 196 L47 200Z" fill="url(#${g})"/><ellipse cx="25" cy="196" rx="22" ry="2.6" fill="url(#${g})"/>`
          + `<rect x="20" y="116" width="10" height="60" rx="3" fill="url(#${g})"/>${twist}`
          + `<path d="M17 116 L33 116 L31 106 Q25 103 19 106Z" fill="url(#${g})"/><ellipse cx="25" cy="106" rx="9" ry="2.4" fill="url(#${g})"/>`
          + taper(25, 18, 106, 11, "#f4f1ea") + flame(25, 14, 1);
      },
    },
    chamber: {
      label: "Chamberstick", scale: 0.5, vw: 130,
      draw: (g) => {
        let rays = ""; for (let a = 0; a < 18; a++) { const x = 14 + a * 5.6; rays += `<line x1="${x}" y1="190" x2="${54 + (x - 54) * 0.5}" y2="184" stroke="#2e2010" stroke-width=".8" opacity=".45"/>`; }
        let flutes = ""; for (let x = 45; x <= 63; x += 3.6) flutes += `<line x1="${x}" y1="160" x2="${x + (54 - x) * 0.25}" y2="180" stroke="#2e2010" stroke-width=".9" opacity=".45"/>`;
        return `<defs>${metal(g, BRONZE)}</defs>`
          + `<path d="M4 200 L4 194 Q54 180 104 194 L104 200Z" fill="url(#${g})"/><ellipse cx="54" cy="191" rx="50" ry="7" fill="url(#${g})"/><ellipse cx="54" cy="190" rx="42" ry="5" fill="#000" opacity=".18"/>${rays}`
          + `<path d="M46 186 Q46 180 50 178 L58 178 Q62 180 62 186Z" fill="url(#${g})"/>`
          + `<path d="M42 158 Q44 176 50 180 L58 180 Q64 176 66 158Z" fill="url(#${g})"/>${flutes}`
          + `<ellipse cx="54" cy="158" rx="14" ry="3.6" fill="url(#${g})"/>`
          + `<path d="M64 172 C84 172 96 150 112 146 C126 143 128 160 118 166 C112 170 108 162 114 160" stroke="url(#${g})" stroke-width="5" fill="none" stroke-linecap="round"/>`
          + taper(54, 64, 158, 22, "#efe4cc") + flame(54, 60, 1.25);
      },
    },
    squareBrass: {
      label: "Square-base brass", scale: 0.8, vw: 56,
      draw: (g) => `<defs>${metal(g, BRASS)}</defs>`
        + `<path d="M4 200 L4 188 L10 182 L46 182 L52 188 L52 200Z" fill="url(#${g})"/><rect x="4" y="186" width="48" height="2" fill="#5a421c" opacity=".5"/>`
        + `<path d="M14 182 L18 176 L38 176 L42 182Z" fill="url(#${g})"/>`
        + `<rect x="22" y="112" width="12" height="64" fill="url(#${g})"/>`
        + [116, 124, 160, 168].map((y) => `<rect x="19.5" y="${y}" width="17" height="4" rx="2" fill="url(#${g})"/>`).join("")
        + `<path d="M17 112 L39 112 L37 104 L19 104Z" fill="url(#${g})"/><ellipse cx="28" cy="104" rx="10" ry="2.4" fill="url(#${g})"/>`
        + taper(28, 16, 104, 12, "#f4f1ea") + flame(28, 12, 1),
    },
    pinkLamp: {
      label: "Pink glass lamp", scale: 0.78, vw: 80,
      draw: (g) => `<defs>${metal(g, BRASS)}<radialGradient id="${g}p" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#f6c9e0"/><stop offset=".55" stop-color="#d98ab4"/><stop offset="1" stop-color="#a95a86"/></radialGradient><radialGradient id="${g}s" cx=".5" cy=".7" r=".8"><stop offset="0" stop-color="#ffe3ee"/><stop offset=".6" stop-color="#f3a6c9"/><stop offset="1" stop-color="#c96f9d"/></radialGradient></defs>`
        + `<path d="M12 200 L12 195 Q20 186 30 184 L50 184 Q60 186 68 195 L68 200Z" fill="url(#${g})"/><ellipse cx="40" cy="195" rx="28" ry="3" fill="url(#${g})"/>`
        + `<path d="M40 184 C18 182 14 150 30 142 L50 142 C66 150 62 182 40 184Z" fill="url(#${g}p)"/><ellipse cx="33" cy="160" rx="4" ry="10" fill="#fff" opacity=".35"/>`
        + `<rect x="28" y="134" width="24" height="9" rx="2" fill="url(#${g})"/><path d="M24 134 q4 -8 16 -8 q12 0 16 8" stroke="url(#${g})" stroke-width="2.4" fill="none"/>`
        + `<path d="M34 126 L34 104 Q34 98 37 96 L43 96 Q46 98 46 104 L46 126Z" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.35)" stroke-width=".7"/>`
        + `<line x1="40" y1="126" x2="40" y2="118" stroke="#2a2420" stroke-width="1.6"/>` + flame(40, 118, 0.65)
        + `<path d="M14 98 C10 60 24 40 40 40 C56 40 70 60 66 98 C58 104 22 104 14 98Z" fill="url(#${g}s)" opacity=".92"/>`
        + `<path class="litOnly" d="M14 98 C10 60 24 40 40 40 C56 40 70 60 66 98 C58 104 22 104 14 98Z" fill="#fff2c4" opacity=".0"/>`
        + `<ellipse cx="28" cy="66" rx="5" ry="16" fill="#fff" opacity=".28"/><path d="M14 98 C22 104 58 104 66 98" stroke="url(#${g})" stroke-width="3" fill="none"/>`,
    },
    bracketLantern: {
      // a garden-lamp post whose lantern hangs straight in front of it, glass facing you
      label: "Iron lantern post", scale: 0.95, vw: 70,
      draw: (g) => {
        const iron = "#1d1a18";
        let chain = ""; for (let y = 50; y < 70; y += 4.5) chain += `<ellipse cx="35" cy="${y}" rx="${Math.round(y) % 9 ? 1.3 : 2}" ry="2.4" fill="none" stroke="${iron}" stroke-width="1.2"/>`;
        return `<defs><linearGradient id="${g}l" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff6d8"/><stop offset=".6" stop-color="#ffd27a"/><stop offset="1" stop-color="#f0a948"/></linearGradient></defs>`
          + `<path d="M22 200 L24 194 L46 194 L48 200Z" fill="${iron}"/><rect x="32.5" y="30" width="5" height="166" fill="${iron}"/><rect x="31" y="150" width="8" height="4" fill="${iron}"/>`
          + `<circle cx="35" cy="25" r="4" fill="${iron}"/><path d="M35 21 l0 -6" stroke="${iron}" stroke-width="1.6"/>`
          // a scroll on each side of the post and a short arm that comes towards you
          + `<path d="M35 44 C28 44 22 40 22 34 C22 29 28 29 28 33" stroke="${iron}" stroke-width="2" fill="none"/><path d="M35 44 C42 44 48 40 48 34 C48 29 42 29 42 33" stroke="${iron}" stroke-width="2" fill="none"/>`
          + `<ellipse cx="35" cy="46" rx="5" ry="2.6" fill="${iron}"/>` + chain
          // the lantern, front on
          + `<path d="M17 82 L35 68 L53 82Z" fill="${iron}"/><circle cx="35" cy="67" r="2.4" fill="${iron}"/><rect x="18" y="82" width="34" height="3.5" fill="${iron}"/>`
          + `<rect x="21" y="85.5" width="28" height="36" fill="rgba(60,50,40,.55)"/><rect class="litOnly" x="21" y="85.5" width="28" height="36" fill="url(#${g}l)"/>`
          + flame(35, 115, 0.62)
          + `<rect x="21" y="85.5" width="28" height="36" fill="none" stroke="${iron}" stroke-width="2.4"/><line x1="35" y1="85.5" x2="35" y2="102" stroke="${iron}" stroke-width="1.4"/><line x1="21" y1="102" x2="49" y2="102" stroke="${iron}" stroke-width="1.2"/>`
          + `<path d="M24 89 l3 0 0 10 -3 0Z" fill="#fff" opacity=".25"/>`
          + `<path d="M17 121.5 L53 121.5 L49 128 L21 128Z" fill="${iron}"/><path d="M30 128 L40 128 L37 134 L33 134Z" fill="${iron}"/>`;
      },
    },
    oilLamp: {
      label: "Oil lamp", scale: 0.62, vw: 80,
      draw: (g) => `<defs>${metal(g, BRASS)}<linearGradient id="${g}c" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".08"/><stop offset=".3" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient></defs>`
        + `<path d="M10 200 L10 196 Q18 184 32 182 L48 182 Q62 184 70 196 L70 200Z" fill="url(#${g})"/><ellipse cx="40" cy="196" rx="30" ry="3" fill="url(#${g})"/>`
        + `<path d="M35 182 L33 160 L47 160 L45 182Z" fill="url(#${g})"/>`
        + `<path d="M40 160 C14 160 10 122 40 118 C70 122 66 160 40 160Z" fill="url(#${g})"/><path d="M40 156 C22 154 20 128 40 124 C60 128 58 154 40 156Z" fill="#000" opacity=".12"/>`
        + `<rect x="30" y="110" width="20" height="9" rx="2" fill="url(#${g})"/>`
        + `<path d="M31 110 C20 92 22 74 31 64 L31 34 L49 34 L49 64 C58 74 60 92 49 110Z" fill="url(#${g}c)" stroke="rgba(255,255,255,.35)" stroke-width="1"/>`
        + `<line x1="40" y1="110" x2="40" y2="98" stroke="#2a2420" stroke-width="2"/>` + flame(40, 98, 0.95),
    },
    pillars: {
      label: "Melted candles", scale: 0.5, vw: 110,
      draw: (g) => `<defs>${metal(g, BRASS)}</defs><path d="M3 200 L3 195 Q55 187 107 195 L107 200Z" fill="#2c2a2e"/><ellipse cx="55" cy="194" rx="52" ry="4" fill="#4a474d"/>`
        + [[28, 96, 24], [60, 52, 28], [88, 120, 20]].map(([x, top, wd]) => `<rect x="${x - wd / 2}" y="${top}" width="${wd}" height="${193 - top}" rx="3" fill="#ece1cb"/><rect x="${x - wd / 2}" y="${top}" width="${wd * 0.3}" height="${193 - top}" fill="#fff" opacity=".3"/><path d="M${x - wd / 2} ${top + 2} Q${x - wd / 2 - 1} ${top + 18} ${x - wd / 2 + 2} ${top + 26} M${x + wd / 2 - 2} ${top + 2} Q${x + wd / 2 + 1} ${top + 12} ${x + wd / 2 - 1} ${top + 16}" stroke="#ece1cb" stroke-width="4" stroke-linecap="round" fill="none"/><ellipse cx="${x}" cy="${top + 1}" rx="${wd / 2}" ry="3" fill="#d9ccb2"/><line x1="${x}" y1="${top + 1}" x2="${x}" y2="${top - 4}" stroke="#2a2420" stroke-width="1.2"/>` + flame(x, top - 4, 0.95)).join(""),
    },
  };
  let ornN = 0;
  /** The ornament as an element sized for books `H` pixels tall. */
  function ornamentEl(kind, H, lit) {
    const o = ORNAMENTS[kind]; if (!o || !o.draw) return null;
    const h = Math.round(H * (o.scale || 0.7)), w = Math.round(h * o.vw / 200);
    const el = document.createElement("div");
    el.className = "ornament" + (lit ? " lit" : ""); el.dataset.kind = kind;
    el.style.width = w + "px"; el.style.height = h + "px";
    if (o.soft) el.classList.add("soft");
    const id = "orn" + ornN++;
    // every object gets the same finish: relief lighting, a darker rim and a touch more contrast.
    // Flames stay outside it so they stay cheap to animate.
    let body = o.draw(id), flames = "";
    body = body.replace(/<circle class="ember"[^>]*\/><g class="ornFlame"[^>]*><g class="ornFlicker">.*?<\/g><\/g>/g, (m) => { flames += m; return ""; });
    const fx = `<filter id="${id}fx" x="-4%" y="-4%" width="108%" height="108%" color-interpolation-filters="sRGB">`
      // the picture's own light and dark become relief, so every fold, rim and carving catches light from the top left
      + `<feColorMatrix in="SourceGraphic" type="luminanceToAlpha"/><feGaussianBlur stdDeviation=".7" result="hm"/>`
      + `<feDiffuseLighting in="hm" surfaceScale="4" diffuseConstant="1.15" lighting-color="#fff"><feDistantLight azimuth="235" elevation="60"/></feDiffuseLighting>`
      + `<feComponentTransfer result="sh"><feFuncR type="linear" slope="1"/><feFuncG type="linear" slope="1"/><feFuncB type="linear" slope="1"/></feComponentTransfer>`
      + `<feComposite in="SourceGraphic" in2="sh" operator="arithmetic" k1="1" result="lit"/>`
      // a darker rim where the shape turns away from you
      + `<feGaussianBlur in="SourceAlpha" stdDeviation="2" result="bl"/><feComposite in="SourceAlpha" in2="bl" operator="out" result="rim0"/><feFlood flood-color="#000" flood-opacity=".28"/><feComposite in2="rim0" operator="in" result="rim"/>`
      + `<feComponentTransfer in="lit" result="cr"><feFuncR type="linear" slope="1.08" intercept="-.02"/><feFuncG type="linear" slope="1.08" intercept="-.02"/><feFuncB type="linear" slope="1.08" intercept="-.02"/></feComponentTransfer>`
      + `<feMerge><feMergeNode in="cr"/><feMergeNode in="rim"/></feMerge></filter>`;
    el.innerHTML = `<div class="ornGlow"${o.glow ? ` style="background:radial-gradient(closest-side, ${o.glow}, transparent)"` : ""}></div><svg viewBox="0 0 ${o.vw} 200" width="${w}" height="${h}" aria-hidden="true">${o.soft ? body : `<defs>${fx}</defs><g filter="url(#${id}fx)">${body}</g>`}${flames}</svg>`;
    // where the glow sits: the highest flame
    const ys = [...o.draw("x").matchAll(/data-y="([\d.]+)"/g)].map((m) => +m[1]);
    if (ys.length) el.style.setProperty("--fy", (Math.min(...ys) / 200 * 100).toFixed(1) + "%");
    if (o.still) el.classList.add("still");
    if (o.hang) el.classList.add("hanging");
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
    cottage: { label: "Cottage cream", t: ["#e4dccd", "#2f2620", "#dbd1bf", "#f1ebe1", "#d3c7b2", "#74675a", "#c9bba4", "#cfc1aa", "#bfae95", "light"] },
    golden: { label: "Golden hour", t: ["#2b231d", "#f3e7d5", "#342a22", "#3a2f26", "#3f3329", "#ad9b85", "#4c3f33", "#483b2f", "#5c4c3d", "dark"] },
    lacquer: { label: "Lacquer", t: ["#100605", "#f6e3d0", "#1a0b09", "#1f0d0b", "#25100d", "#b0897a", "#3b1913", "#351611", "#4e221a", "dark"] },
    latte: { label: "Latte", t: ["#efe4d4", "#2b2016", "#e6d8c4", "#f8f1e6", "#dfcfb8", "#7b6853", "#d6c4ab", "#dccab0", "#cbb79c", "light"] },
  };
  const LOOK_KEYS = ["theme", "customBg", "accent", "shelf", "shelfMat", "backdrop", "lights", "headFont", "ornament"];
  const LOOKS = {
    minimal: { label: "Minimal", set: { theme: "graphite", accent: "#f2c76b", shelf: "#34343f", shelfMat: "paint", backdrop: "none", lights: { style: "none", colour: "warm", on: false }, headFont: "bricolage" } },
    cabin: { label: "Cozy cabin", set: { theme: "cabin", accent: "#f0a85a", shelfMat: "oak", backdrop: "walnutPanel", lights: { style: "fairy", colour: "warm", on: true }, headFont: "cormorant" } },
    nook: { label: "Reading nook", set: { theme: "golden", accent: "#e6ad5c", shelfMat: "paintedWhite", backdrop: "goldenHour", lights: { style: "wisteria", colour: "warm", on: true }, headFont: "cormorant" } },
    library: { label: "Old library", set: { theme: "moss", accent: "#d8b26a", shelfMat: "mahogany", backdrop: "greenWall", lights: { style: "none", colour: "warm", on: false }, headFont: "cinzel" } },
    loft: { label: "Brick loft", set: { theme: "graphite", accent: "#f2b35b", shelfMat: "steel", backdrop: "brick", lights: { style: "globe", colour: "warm", on: true }, headFont: "oswald" } },
    starry: { label: "Starry night", set: { theme: "midnight", accent: "#9fc4ff", shelfMat: "ebony", backdrop: "night", lights: { style: "stars", colour: "white", on: true }, headFont: "dmserif" } },
    cottage: { label: "Cottage", set: { theme: "cottage", accent: "#b2738f", shelfMat: "honey", backdrop: "ditsy", lights: { style: "none", colour: "warm", on: false }, headFont: "fell" } },
    candle: { label: "Candlelit", set: { theme: "candle", accent: "#f0b45c", shelfMat: "walnut", backdrop: "candle", lights: { style: "globe", colour: "warm", on: true }, headFont: "abril" } },
  };
  Object.assign(LOOKS, {
    vampire: { label: "Vampire's lair", set: { theme: "crimson", accent: "#c4243a", shelfMat: "ebony", backdrop: "velvet", lights: { style: "candles", colour: "warm", on: true }, headFont: "gothic" } },
    victorian: { label: "Victorian parlour", set: { theme: "parlour", accent: "#d4af6a", shelfMat: "mahogany", backdrop: "greenDamask", lights: { style: "candles", colour: "warm", on: true }, headFont: "fell" } },
    castle: { label: "Haunted castle", set: { theme: "graphite", accent: "#b9a7ff", shelfMat: "steel", backdrop: "stone", lights: { style: "candles", colour: "white", on: true }, headFont: "cinzel" } },
    bordello: { label: "Gothic romance", set: { theme: "crimson", accent: "#e0b46a", shelfMat: "brass", backdrop: "damask", lights: { style: "globe", colour: "warm", on: true }, headFont: "fell" } },
    forest: { label: "Enchanted forest", set: { theme: "pinewood", accent: "#a9f08d", shelfMat: "driftwood", backdrop: "forest", lights: { style: "fireflies", colour: "green", on: true }, headFont: "cormorant" } },
    academia: { label: "Dark academia", set: { theme: "cabin", accent: "#c9a25b", shelfMat: "walnut", backdrop: "leather", lights: { style: "globe", colour: "warm", on: true }, headFont: "fell" } },
    teahouse: { label: "Tea house", set: { theme: "lacquer", accent: "#e8432f", shelfMat: "lacquer", backdrop: "lanternNight", lights: { style: "chinese", colour: "warm", on: true }, headFont: "dmserif" } },
  });
  const ORN = { forest: "mushrooms", cottage: "pinkLamp", nook: "bracketLantern", vampire: "gothicCandelabra", victorian: "twist", castle: "pillars", bordello: "chamber", academia: "squareBrass" };
  for (const [k, L] of Object.entries(LOOKS)) {
    L.set.ornament = { kind: ORN[k] || "none", pos: "end" };
    if (ORN[k] && !["nook", "forest"].includes(k)) L.set.lights = { ...L.set.lights, style: "none" };
  }
  // ------------------------------------------------------------------ enchanted forest: a moonlit glade drawn as one SVG scene
  function enchantedScene() {
    let rnd = 7; const R = () => (rnd = (rnd * 9301 + 49297) % 233280) / 233280;
    const trunk = (x, w, top, col, lean = 0) => `<path d="M${x - w / 2} 860 C${x - w * 0.9} 800 ${x - w * 0.42 + lean} 700 ${x - w * 0.38 + lean} ${top} L${x + w * 0.38 + lean} ${top} C${x + w * 0.42 + lean} 700 ${x + w * 0.9} 800 ${x + w / 2} 860Z" fill="${col}"/>`;
    const far = [30, 95, 150, 230, 290, 350, 385].map((x, i) => trunk(x, 16 + (i % 3) * 6, 0, "#1b2740", (i % 2 ? 6 : -4))).join("");
    const mid = [[60, 46], [205, 34], [330, 52]].map(([x, w], i) => trunk(x, w, 0, "#0e1622", i % 2 ? -10 : 8)).join("");
    // mossy roots and ground
    const ground = `<path d="M0 720 C60 690 110 712 160 700 C220 686 260 714 320 698 C360 688 390 700 400 696 L400 860 L0 860Z" fill="#0a1712"/>`
      + `<path d="M0 760 C80 742 140 770 210 752 C280 736 330 762 400 748 L400 860 L0 860Z" fill="#07110d"/>`
      + `<path d="M0 722 C60 692 110 714 160 702 C220 688 260 716 320 700" stroke="#2f5a34" stroke-width="2" fill="none" opacity=".55"/>`;
    // glowing mushrooms, clustered at the roots
    const shroom = (x, y, r, col) => `<g><rect x="${x - r * 0.18}" y="${y - r * 1.1}" width="${r * 0.36}" height="${r * 1.1}" rx="${r * 0.15}" fill="#cfeee6" opacity=".85"/><ellipse cx="${x}" cy="${y - r * 1.1}" rx="${r * 1.6}" ry="${r * 2}" fill="${col}" opacity=".35" filter="url(#bl)"/><path d="M${x - r} ${y - r * 1.05} Q${x} ${y - r * 2.1} ${x + r} ${y - r * 1.05}Z" fill="${col}"/></g>`;
    let shrooms = "";
    for (const [cx, cy, n, col] of [[60, 712, 6, "#8ff7e4"], [205, 700, 4, "#a8f0ff"], [330, 704, 5, "#8ff7e4"], [130, 760, 3, "#ffd79a"], [270, 752, 4, "#b9fff0"], [380, 742, 3, "#ffc7ef"]]) {
      for (let k = 0; k < n; k++) shrooms += shroom(cx + (R() - 0.5) * 50, cy + R() * 14, 3 + R() * 5, col);
    }
    let specks = ""; for (let i = 0; i < 70; i++) { const x = R() * 400, y = 120 + R() * 700, r = 0.6 + R() * 1.4; specks += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${R() > 0.35 ? "#ffe08a" : "#9ff6e8"}" opacity="${(0.35 + R() * 0.6).toFixed(2)}"/>`; }
    // a dark canopy with moss hanging from it
    let canopy = ""; for (let i = 0; i < 46; i++) { const x = R() * 420 - 10, y = R() * 120 - 20, r = 26 + R() * 40; canopy += `<circle cx='${x.toFixed(0)}' cy='${y.toFixed(0)}' r='${r.toFixed(0)}' fill='${i % 3 ? "#050a12" : "#0a1622"}'/>`; }
    let moss = ""; for (let i = 0; i < 26; i++) { const x = R() * 400, y = 40 + R() * 90, l = 40 + R() * 150; moss += `<path d='M${x.toFixed(0)} ${y.toFixed(0)} q${(R() * 8 - 4).toFixed(1)} ${(l / 2).toFixed(0)} ${(R() * 6 - 3).toFixed(1)} ${l.toFixed(0)}' stroke='${R() > 0.5 ? "#21452f" : "#2f5a3a"}' stroke-width='${(0.8 + R() * 1.4).toFixed(1)}' fill='none' opacity='.75'/>`; }
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 860' preserveAspectRatio='xMidYMax slice'><defs>`
      + `<linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#070a18'/><stop offset='.3' stop-color='#152a52'/><stop offset='.55' stop-color='#2c5274'/><stop offset='.75' stop-color='#1a4448'/><stop offset='1' stop-color='#08130f'/></linearGradient>`
      + `<radialGradient id='dusk' cx='.5' cy='.5' r='.5'><stop offset='0' stop-color='#d3a0d8' stop-opacity='.5'/><stop offset='.5' stop-color='#7a74c0' stop-opacity='.22'/><stop offset='1' stop-color='#1a1f4a' stop-opacity='0'/></radialGradient>`
      + `<filter id='bl' x='-100%' y='-100%' width='300%' height='300%'><feGaussianBlur stdDeviation='4'/></filter><filter id='fog' x='-20%' y='-50%' width='140%' height='200%'><feGaussianBlur stdDeviation='22'/></filter><filter id='ray' x='-20%' y='-5%' width='140%' height='110%'><feGaussianBlur stdDeviation='9'/></filter><filter id='glowS' x='-200%' y='-200%' width='500%' height='500%'><feGaussianBlur stdDeviation='2.4'/></filter>`
      + `<filter id='bark' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.06 0.004' numOctaves='3' seed='4' result='n'/><feColorMatrix in='n' values='0 0 0 0 0.12  0 0 0 0 0.16  0 0 0 0 0.2  0 0 0 1.4 -0.55' result='s'/><feComposite in='s' in2='SourceGraphic' operator='in' result='t'/><feMerge><feMergeNode in='SourceGraphic'/><feMergeNode in='t'/></feMerge></filter>`
      + `<filter id='soft'><feGaussianBlur stdDeviation='1.5'/></filter></defs>`
      + `<rect width='400' height='860' fill='url(#sky)'/><ellipse cx='200' cy='470' rx='240' ry='220' fill='url(#dusk)'/>`
      + `<g filter='url(#soft)' opacity='.85'>${far.replace(/#1b2740/g, "#14243e")}</g>`
      + `<ellipse cx='200' cy='600' rx='300' ry='70' fill='#a9c6e0' opacity='.22' filter='url(#fog)'/>`
      + `<ellipse cx='140' cy='480' rx='200' ry='45' fill='#c3b6e2' opacity='.16' filter='url(#fog)'/>`
      // shafts of moonlight slanting down through the canopy
      + `<g filter='url(#ray)' opacity='.9'><path d='M150 0 L210 0 L300 760 L200 760Z' fill='#bfe6ff' opacity='.10'/><path d='M228 0 L256 0 L330 700 L282 700Z' fill='#d8c8ff' opacity='.08'/><path d='M96 0 L118 0 L170 640 L136 640Z' fill='#bff5ea' opacity='.07'/></g>`
      // the near trees, with bark, flared roots and glowing moss
      + `<g filter='url(#bark)'>${mid.replace(/#0e1622/g, "#0a121c")}</g>`
      + [[60, 46], [205, 34], [330, 52]].map(([x, w]) => [-1, 1].map((d) => `<path d='M${x + d * w * 0.3} 690 C${x + d * w * 0.9} 700 ${x + d * w * 1.3} 712 ${x + d * w * 1.9} 722 L${x + d * w * 1.6} 728 C${x + d * w * 1.1} 718 ${x + d * w * 0.7} 712 ${x + d * w * 0.1} 712Z' fill='#0a121c'/>`).join("")).join("")
      + (() => { let g = ""; for (const [x, w] of [[60, 46], [205, 34], [330, 52]]) for (let i = 0; i < 26; i++) { const yy = 560 + R() * 150, xx = x + (R() - 0.5) * w * 0.9; g += `<circle cx='${xx.toFixed(1)}' cy='${yy.toFixed(1)}' r='${(0.8 + R() * 1.6).toFixed(1)}' fill='${R() > 0.5 ? "#7ff0d2" : "#5fae6a"}' opacity='${(0.4 + R() * 0.5).toFixed(2)}'/>`; } return `<g filter='url(#glowS)'>${g}</g>${g}`; })()
      + `<path d='M0 0 L0 860 L30 860 C44 760 36 520 50 0Z' fill='#040809'/><path d='M400 0 L400 860 L370 860 C358 760 366 500 352 0Z' fill='#040809'/>`
      + canopy + moss
      + `<ellipse cx='200' cy='705' rx='260' ry='42' fill='#7fd9c8' opacity='.16' filter='url(#fog)'/>`
      + ground
      // a thick carpet of grass over the ground, darker at the back, catching the glow at the front
      + (() => { let g = ""; for (let i = 0; i < 420; i++) { const x = R() * 410 - 5, base = 700 + R() * 160, h = 10 + R() * 26 + (base - 700) * 0.12, lean = (R() - 0.5) * 14; const c = ["#0d2416", "#123020", "#18402a", "#0a1c12", "#1f4a2e"][Math.floor(R() * 5)]; g += `<path d='M${x.toFixed(1)} ${base.toFixed(1)} q${(lean * 0.3).toFixed(1)} ${(-h * 0.6).toFixed(1)} ${lean.toFixed(1)} ${(-h).toFixed(1)} q${(-lean * 0.2 + 1).toFixed(1)} ${(h * 0.5).toFixed(1)} 2 ${h.toFixed(1)}Z' fill='${c}'/>`; } for (let i = 0; i < 60; i++) { const x = R() * 400, base = 760 + R() * 100, h = 14 + R() * 20, lean = (R() - 0.5) * 12; g += `<path d='M${x.toFixed(1)} ${base.toFixed(1)} q${(lean * 0.3).toFixed(1)} ${(-h * 0.6).toFixed(1)} ${lean.toFixed(1)} ${(-h).toFixed(1)}' stroke='#5fbf8a' stroke-width='.7' fill='none' opacity='.35'/>`; } return g; })()
      // bluebells glowing in the moss
      + (() => { let b = ""; for (let i = 0; i < 40; i++) { const x = R() * 400, y = 712 + R() * 70; b += `<path d='M${x.toFixed(1)} ${(y + 10).toFixed(1)} q1 -6 0 -12' stroke='#2f5a34' stroke-width='.8' fill='none'/><ellipse cx='${(x + 0.5).toFixed(1)}' cy='${(y - 2).toFixed(1)}' rx='1.8' ry='2.4' fill='${R() > 0.5 ? "#8fb8ff" : "#c9a0ff"}'/>`; } return `<g filter='url(#glowS)' opacity='.8'>${b}</g>${b}`; })()
      + shrooms + specks
      // ferns curling in from the corners, closest to you
      + (() => { let f = ""; for (const [x0, y0, dir, len] of [[0, 860, 1, 150], [20, 860, 1, 110], [400, 860, -1, 160], [380, 860, -1, 120]]) { const tx = x0 + dir * len, ty = y0 - len * 0.9; f += `<path d='M${x0} ${y0} Q${x0 + dir * len * 0.2} ${y0 - len * 0.7} ${tx} ${ty}' stroke='#06100b' stroke-width='2.5' fill='none'/>`; for (let t = 0.12; t < 1; t += 0.07) { const px = x0 + dir * len * (0.2 * 2 * t * (1 - t) + t * t), py = y0 - len * 0.7 * 2 * t * (1 - t) - len * 0.9 * t * t, L = 26 * (1 - t) + 6; f += `<path d='M${px.toFixed(1)} ${py.toFixed(1)} q${(dir * L * 0.4).toFixed(1)} ${(-L * 0.6).toFixed(1)} ${(dir * L).toFixed(1)} ${(-L * 0.2).toFixed(1)} q${(-dir * L * 0.5).toFixed(1)} ${(L * 0.3).toFixed(1)} ${(-dir * L).toFixed(1)} ${(L * 0.2).toFixed(1)}Z M${px.toFixed(1)} ${py.toFixed(1)} q${(-dir * L * 0.3).toFixed(1)} ${(-L * 0.7).toFixed(1)} ${(-dir * L * 0.6).toFixed(1)} ${(-L * 0.5).toFixed(1)} q${(dir * L * 0.3).toFixed(1)} ${(L * 0.4).toFixed(1)} ${(dir * L * 0.6).toFixed(1)} ${(L * 0.5).toFixed(1)}Z' fill='#071510'/>`; } } return f; })()
      + `</svg>`;
    return svgUrl(svg);
  }
  BACKDROPS.enchanted = { label: "Enchanted glade", tone: "dark", fx: "motes", css: () => [`${enchantedScene()} center bottom / cover no-repeat`, "#0c0f22"].join(",") };
  BACKDROPS.night.fx = "meteors";
  MATERIALS.moss = { label: "Mossy log", base: "#2b2519", tex: () => ["linear-gradient(180deg, #5f8f45 0 2px, #426b33 3px, rgba(66,107,51,.6) 5px, transparent 8px)", ...grainH(0.6, 0.18)] };
  PALETTES.moonwood = { label: "Moonwood", t: ["#0b1020", "#e4eef0", "#111829", "#141c2e", "#182134", "#8fa3b3", "#223047", "#1f2b40", "#2e3d57", "dark"] };
  ORNAMENTS.mushrooms = {
    label: "Glowing mushrooms", scale: 0.42, vw: 120, soft: true, glow: "rgba(120,255,225,.4)",
    caps: [[34, 196, 20, 46, "#8ff7e4"], [70, 196, 26, 70, "#a8f0ff"], [98, 196, 14, 34, "#ffc7ef"], [52, 196, 10, 24, "#b9fff0"]],
    draw: (g) => {
      const caps = ORNAMENTS.mushrooms.caps;
      return `<defs><filter id="${g}b" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6"/></filter></defs><g data-y="120"></g>`
        + `<path d="M4 200 C10 188 30 186 60 188 C90 186 110 188 116 200Z" fill="#3c6a36"/><path d="M8 196 C30 190 90 190 112 196" stroke="#6fa452" stroke-width="2" fill="none"/>`
        + caps.map(([x, y, r, h, c]) => `<path d="M${x - r * 0.16} ${y} C${x - r * 0.2} ${y - h * 0.5} ${x - r * 0.12} ${y - h + 6} ${x} ${y - h + 4} C${x + r * 0.12} ${y - h + 6} ${x + r * 0.2} ${y - h * 0.5} ${x + r * 0.16} ${y}Z" fill="#e6f4ef"/>`
          + `<ellipse class="litOnly" cx="${x}" cy="${y - h + 2}" rx="${r * 1.5}" ry="${r}" fill="${c}" filter="url(#${g}b)"/>`
          + `<path d="M${x - r} ${y - h + 6} C${x - r} ${y - h - r * 0.9} ${x + r} ${y - h - r * 0.9} ${x + r} ${y - h + 6} Q${x} ${y - h + 1} ${x - r} ${y - h + 6}Z" fill="#cfe9e2"/>`
          + `<path class="litOnly" d="M${x - r} ${y - h + 6} C${x - r} ${y - h - r * 0.9} ${x + r} ${y - h - r * 0.9} ${x + r} ${y - h + 6} Q${x} ${y - h + 1} ${x - r} ${y - h + 6}Z" fill="${c}"/>`
          + `<circle cx="${x - r * 0.4}" cy="${y - h - r * 0.2}" r="${r * 0.12}" fill="#fff" opacity=".8"/><circle cx="${x + r * 0.3}" cy="${y - h - r * 0.35}" r="${r * 0.09}" fill="#fff" opacity=".7"/>`).join("");
    },
  };
  // ------------------------------------------------------------------ more things to stand among the books
  // (`still` ones have no light: a tap just nudges them)
  const leaf = (x, y, rot, s, c) => `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0 0 C-7 -3 -9 -12 -4 -17 C-2 -19 0 -18 0 -16 C0 -18 2 -19 4 -17 C9 -12 7 -3 0 0Z" fill="${c}"/><path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0 -1 L0 -15" stroke="rgba(255,255,255,.25)" stroke-width=".8" fill="none"/>`;
  const TERRA = [[0, "#7a3a1e"], [0.35, "#c46a3c"], [0.55, "#d9824f"], [1, "#6b3018"]];
  const CERAMIC = [[0, "#b8b2a8"], [0.35, "#f4f0e8"], [0.55, "#ffffff"], [1, "#a9a296"]];
  const WOOD = [[0, "#3b2210"], [0.35, "#7a4a24"], [0.55, "#9a6232"], [1, "#2e1a0c"]];
  Object.assign(ORNAMENTS, {
    plant: {
      label: "Trailing plant", scale: 0.66, vw: 120, still: true,
      draw: (g) => {
        const greens = ["#2f6b3a", "#3f8a4a", "#57a35c", "#2a5e33"];
        let vines = "", leaves = "";
        // leaves on top, then vines trailing over the rim and down the side
        [[48, 118, -30], [60, 104, -5], [74, 112, 25], [40, 132, -55], [86, 128, 50], [56, 120, 10], [66, 98, 0], [32, 140, -70], [92, 140, 65]].forEach(([x, y, r], i) => (leaves += leaf(x, y, r, 1.25, greens[i % 4])));
        [[30, 148, 18, 196], [90, 148, 104, 186], [24, 150, 8, 178]].forEach(([x0, y0, x1, y1], k) => {
          vines += `<path d="M${x0} ${y0} C${x0 - 8 + k * 4} ${y0 + 12} ${x1 + 6} ${y1 - 18} ${x1} ${y1}" stroke="#2d5a30" stroke-width="1.4" fill="none"/>`;
          for (let j = 1; j <= 4; j++) { const t = j / 5, x = x0 + (x1 - x0) * t + (k === 1 ? 3 : -3), y = y0 + (y1 - y0) * t; leaves += leaf(x, y + 4, k === 1 ? 140 + j * 8 : -140 - j * 8, 0.85, greens[(j + k) % 4]); }
        });
        return `<defs>${metal(g, TERRA)}</defs>`
          + `<path d="M30 200 L88 200 L96 152 L22 152Z" fill="url(#${g})"/><path d="M30 200 L88 200 L89 194 L29 194Z" fill="#000" opacity=".15"/>`
          + `<rect x="16" y="140" width="86" height="14" rx="3" fill="url(#${g})"/><rect x="16" y="140" width="86" height="3" rx="1.5" fill="#fff" opacity=".15"/>`
          + `<ellipse cx="59" cy="141" rx="40" ry="3.5" fill="#3a2414"/>` + vines + leaves;
      },
    },
    succulent: {
      label: "Succulent", scale: 0.4, vw: 110, still: true,
      draw: (g) => {
        let petals = "";
        const ring = (n, r, len, wd, c, rot0) => { for (let i = 0; i < n; i++) { const a = rot0 + (i / n) * 180 - 90; petals += `<path transform="translate(55 122) rotate(${a})" d="M0 0 C${wd} ${-len * 0.4} ${wd * 0.7} ${-len * 0.9} 0 ${-len} C${-wd * 0.7} ${-len * 0.9} ${-wd} ${-len * 0.4} 0 0Z" fill="${c}" stroke="#4f7a6e" stroke-width=".6"/>`; } };
        ring(9, 0, 46, 13, "#8fb7a5", 0); ring(7, 0, 36, 12, "#a6c9b6", 10); ring(5, 0, 26, 10, "#bcd9c6", 4); ring(3, 0, 16, 8, "#d3e8d6", 20);
        return `<defs>${metal(g, CERAMIC)}</defs>`
          + `<path d="M24 200 L86 200 C92 176 94 150 92 128 L18 128 C16 150 18 176 24 200Z" fill="url(#${g})"/><rect x="14" y="122" width="82" height="9" rx="4" fill="url(#${g})"/>`
          + `<ellipse cx="55" cy="124" rx="38" ry="3" fill="#3a2a1e"/>` + petals + `<path d="M30 168 C46 162 64 174 80 166" stroke="#c9a96b" stroke-width="1.4" fill="none" opacity=".7"/>`;
      },
    },
    hourglass: {
      label: "Hourglass", scale: 0.62, vw: 76, still: true,
      draw: (g) => `<defs>${metal(g, WOOD)}<linearGradient id="${g}gl" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".05"/><stop offset=".3" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity=".12"/></linearGradient></defs>`
        + `<path d="M22 34 C18 70 34 92 36 104 C34 116 18 138 22 176 L54 176 C58 138 42 116 40 104 C42 92 58 70 54 34Z" fill="rgba(210,230,240,.12)"/>`
        + `<path d="M24 54 C26 72 34 88 38 102 C42 88 50 72 52 54 C44 60 32 60 24 54Z" fill="#d8b47a"/>`
        + `<path d="M23 176 L53 176 C52 164 44 156 38 150 C32 156 24 164 23 176Z" fill="#d8b47a"/><line x1="38" y1="102" x2="38" y2="152" stroke="#d8b47a" stroke-width="1.2"/>`
        + `<path d="M22 34 C18 70 34 92 36 104 C34 116 18 138 22 176 L54 176 C58 138 42 116 40 104 C42 92 58 70 54 34Z" fill="url(#${g}gl)" stroke="rgba(255,255,255,.4)" stroke-width="1"/>`
        + `<rect x="8" y="22" width="60" height="12" rx="3" fill="url(#${g})"/><rect x="8" y="176" width="60" height="12" rx="3" fill="url(#${g})"/>`
        + [12, 64].map((x) => `<rect x="${x - 2.5}" y="34" width="5" height="142" rx="2" fill="url(#${g})"/>`).join("")
        + `<rect x="4" y="188" width="68" height="12" rx="3" fill="url(#${g})"/>`,
    },
    globe: {
      label: "Antique globe", scale: 0.78, vw: 120, still: true,
      draw: (g) => `<defs>${metal(g, BRASS)}<radialGradient id="${g}o" cx=".35" cy=".32" r=".8"><stop offset="0" stop-color="#e9dcb4"/><stop offset=".55" stop-color="#c9b27c"/><stop offset="1" stop-color="#6e5a33"/></radialGradient><clipPath id="${g}c"><circle cx="60" cy="86" r="44"/></clipPath></defs>`
        + `<path d="M40 200 L44 192 L76 192 L80 200Z" fill="url(#${g})"/><path d="M57 192 L55 150 L65 150 L63 192Z" fill="url(#${g})"/>`
        + `<circle cx="60" cy="86" r="44" fill="url(#${g}o)"/>`
        + `<g clip-path="url(#${g}c)" fill="#8a7444" opacity=".75"><path d="M30 60 C40 50 52 56 50 66 C56 72 48 82 40 78 C34 86 24 78 26 70Z"/><path d="M62 70 C74 64 86 70 84 82 C92 92 80 108 70 104 C66 116 56 112 58 100 C52 92 56 80 62 70Z"/><path d="M78 46 C86 44 94 50 92 56 C86 58 80 54 78 46Z"/><path d="M34 100 C40 98 44 106 40 112 C36 112 32 106 34 100Z"/></g>`
        + `<g clip-path="url(#${g}c)" fill="none" stroke="#6e5a33" stroke-width=".6" opacity=".5"><ellipse cx="60" cy="86" rx="44" ry="14"/><ellipse cx="60" cy="86" rx="20" ry="44"/><line x1="16" y1="86" x2="104" y2="86"/></g>`
        + `<path d="M60 36 A50 50 0 0 1 60 136" stroke="url(#${g})" stroke-width="5" fill="none" transform="rotate(-20 60 86)"/><path d="M60 36 A50 50 0 0 0 60 136" stroke="url(#${g})" stroke-width="2" fill="none" opacity=".5" transform="rotate(-20 60 86)"/>`
        + `<path d="M42 150 Q60 140 78 150" stroke="url(#${g})" stroke-width="4" fill="none"/><ellipse cx="44" cy="62" rx="10" ry="16" fill="#fff" opacity=".15" transform="rotate(30 44 62)"/>`,
    },
    crystal: {
      label: "Amethyst crystals", scale: 0.5, vw: 120, soft: true, glow: "rgba(190,120,255,.45)",
      draw: (g) => {
        // each point has its dark faces, a lit face and an inner light that wakes from the base upward
        const shards = [[22, 40, 8, -12], [34, 70, 12, -10], [46, 52, 9, -4], [60, 104, 15, 2], [76, 48, 9, 5], [84, 80, 13, 9], [98, 42, 8, 12]];
        const n = shards.length;
        const one = ([x, h, w, l], k) => {
          const tip = [x + l, 196 - h], sh = 196 - h + 14;
          return `<path d="M${x - w} 196 L${x - w * 0.8 + l} ${sh} L${tip[0]} ${tip[1]} L${x + l * 0.3} 196Z" fill="#5e3290"/>`
            + `<path d="M${x + l * 0.3} 196 L${tip[0]} ${tip[1]} L${x + w * 0.8 + l} ${sh} L${x + w} 196Z" fill="#8a5cc4"/>`
            + `<path d="M${x - w * 0.8 + l} ${sh} L${tip[0]} ${tip[1]} L${x + w * 0.8 + l} ${sh} L${x + l * 0.3} ${sh + 6}Z" fill="#b48ae6"/>`
            + `<path d="M${tip[0]} ${tip[1] + 3} L${x + l * 0.3} 194" stroke="#e6d4ff" stroke-width=".8" opacity=".5"/>`
            + `<g class="amLight" style="--i:${k};--j:${n - 1 - k}"><path d="M${x - w} 196 L${x - w * 0.8 + l} ${sh} L${tip[0]} ${tip[1]} L${x + w * 0.8 + l} ${sh} L${x + w} 196Z" fill="url(#${g}l)"/>`
            + `<path d="M${tip[0]} ${tip[1] + 4} L${x + l * 0.3} 190" stroke="#fff" stroke-width="1.4" opacity=".7"/></g>`;
        };
        const order = shards.map((s, i) => [s, i]).sort((a, b) => a[0][1] - b[0][1]); // short ones wake first, the tallest last
        const ranks = new Map(order.map(([, i], r) => [i, r]));
        let sparks = ""; [[40, 120], [70, 96], [88, 130], [56, 150], [26, 160], [100, 150]].forEach(([x, y], i) => (sparks += `<path class="amSpark" style="--i:${i}" d="M${x} ${y - 5} L${x + 1.2} ${y - 1.2} L${x + 5} ${y} L${x + 1.2} ${y + 1.2} L${x} ${y + 5} L${x - 1.2} ${y + 1.2} L${x - 5} ${y} L${x - 1.2} ${y - 1.2}Z" fill="#fff"/>`));
        return `<defs><filter id="${g}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>`
          + `<linearGradient id="${g}l" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e8c8ff" stop-opacity=".7"/><stop offset=".5" stop-color="#b070ff" stop-opacity=".35"/><stop offset="1" stop-color="#ffffff" stop-opacity=".6"/></linearGradient></defs><g data-y="110"></g>`
          + `<ellipse class="amHalo" cx="60" cy="150" rx="50" ry="46" fill="#b880ff" filter="url(#${g}b)"/>`
          + `<path d="M4 200 C8 184 30 180 60 182 C90 180 112 184 116 200Z" fill="#4a4550"/><path d="M14 196 C30 188 50 190 60 188" stroke="#6a6570" stroke-width="2" fill="none"/>`
          + shards.map((s, i) => one(s, ranks.get(i))).join("") + sparks;
      },
    },
    lavender: {
      label: "Dried lavender", scale: 0.82, vw: 80, still: true,
      draw: (g) => {
        let stems = "", buds = "";
        [[40, 20, 0], [30, 30, -10], [50, 26, 9], [22, 44, -18], [58, 40, 16], [36, 38, -4], [46, 34, 5]].forEach(([x, top, lean], i) => {
          stems += `<path d="M40 150 Q${40 + lean * 0.5} ${(150 + top) / 2} ${x + lean} ${top + 20}" stroke="#7b8a5a" stroke-width="1.3" fill="none"/>`;
          for (let k = 0; k < 7; k++) { const t = k / 7, bx = x + lean - lean * 0.08 * k, by = top + 20 - k * 4.2; buds += `<ellipse cx="${bx + (k % 2 ? 1.6 : -1.6)}" cy="${by}" rx="2.4" ry="3.6" fill="${["#8d6fc4", "#a68ad6", "#7a5bb4"][(i + k) % 3]}"/>`; }
        });
        return `<defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#9fb8b0" stop-opacity=".35"/><stop offset=".35" stop-color="#e6f2ee" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#7f9a92" stop-opacity=".4"/></linearGradient></defs>`
          + stems + buds
          + `<path d="M28 200 C16 196 14 176 22 164 C26 158 32 154 32 146 L32 132 L48 132 L48 146 C48 154 54 158 58 164 C66 176 64 196 52 200Z" fill="url(#${g})" stroke="rgba(255,255,255,.4)" stroke-width="1"/>`
          + `<path d="M30 190 C26 182 28 172 34 166 L46 166 C52 172 54 182 50 190Z" fill="#9fb8b0" opacity=".25"/><rect x="30" y="128" width="20" height="6" rx="2" fill="#c9a96b"/><path d="M33 140 q7 6 14 0" stroke="#b08a45" stroke-width="1.4" fill="none"/>`;
      },
    },
    fairyJar: {
      label: "Fairy-light jar", scale: 0.56, vw: 80, soft: true, glow: "rgba(255,210,120,.45)",
      draw: (g) => {
        let lights = "", wire = "M22 182";
        const pts = [[26, 176], [52, 168], [30, 156], [56, 146], [28, 134], [50, 122], [36, 112], [54, 102], [30, 96]];
        // each bulb wakes in turn along the wire from the bottom, flaring then settling; going out they fade top-down
        const n = pts.length;
        pts.forEach(([x, y], i) => { wire += ` Q${x + 8} ${y + 6} ${x} ${y}`; lights += `<circle cx="${x}" cy="${y}" r="2.2" fill="#6b5a3a"/><g class="fjBulb" style="--i:${i};--j:${n - 1 - i};--tw:${(1.6 + ((i * 7) % 5) * 0.37).toFixed(2)}s"><circle cx="${x}" cy="${y}" r="9" fill="#ffd27a" opacity=".45" filter="url(#${g}b)"/><circle cx="${x}" cy="${y}" r="3.4" fill="#fff1c4"/><circle cx="${x - 0.8}" cy="${y - 0.8}" r="1.2" fill="#fff"/></g>`; });
        return `<defs><filter id="${g}b" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.5"/></filter><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#cfe3e0" stop-opacity=".25"/><stop offset=".3" stop-color="#fff" stop-opacity=".4"/><stop offset=".45" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#b9d0cc" stop-opacity=".3"/></linearGradient></defs><g data-y="130"></g>`
          + `<path d="${wire}" stroke="#4a3f2a" stroke-width=".9" fill="none"/>` + lights
          + `<path d="M14 92 C10 96 10 104 12 110 L12 192 Q12 200 20 200 L60 200 Q68 200 68 192 L68 110 C70 104 70 96 66 92Z" fill="url(#${g})" stroke="rgba(255,255,255,.45)" stroke-width="1.2"/>`
          + `<rect x="14" y="78" width="52" height="16" rx="3" fill="#9b8a6a"/>` + [82, 86, 90].map((y) => `<line x1="14" y1="${y}" x2="66" y2="${y}" stroke="#6e5f44" stroke-width=".8"/>`).join("")
          + `<rect x="20" y="100" width="5" height="80" rx="2.5" fill="#fff" opacity=".22"/>`;
      },
    },
    clock: {
      label: "Mantel clock", scale: 0.52, vw: 120, still: true,
      draw: (g) => `<defs>${metal(g, WOOD)}${metal(g + "b", BRASS)}</defs>`
        + `<path d="M6 200 L6 190 L114 190 L114 200Z" fill="url(#${g})"/><path d="M14 190 L14 112 C14 62 106 62 106 112 L106 190Z" fill="url(#${g})"/>`
        + `<circle cx="60" cy="122" r="36" fill="url(#${g}b)"/><circle cx="60" cy="122" r="31" fill="#f3ead6"/>`
        + Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<line x1="${60 + Math.sin(a) * 26}" y1="${122 - Math.cos(a) * 26}" x2="${60 + Math.sin(a) * 29}" y2="${122 - Math.cos(a) * 29}" stroke="#2a2018" stroke-width="${i % 3 ? 1 : 2}"/>`; }).join("")
        + `<line x1="60" y1="122" x2="60" y2="102" stroke="#2a2018" stroke-width="2.2" stroke-linecap="round"/><line x1="60" y1="122" x2="74" y2="130" stroke="#2a2018" stroke-width="1.6" stroke-linecap="round"/><circle cx="60" cy="122" r="2" fill="#2a2018"/>`
        + `<rect x="30" y="166" width="60" height="14" rx="2" fill="#000" opacity=".2"/><path d="M40 80 Q60 70 80 80" stroke="url(#${g}b)" stroke-width="2" fill="none"/>`
        + [16, 104].map((x) => `<circle cx="${x}" cy="194" r="4" fill="url(#${g}b)"/>`).join(""),
    },
    bust: {
      label: "Marble bust", scale: 0.8, vw: 90, still: true,
      draw: (g) => `<defs>${metal(g, [[0, "#9c978f"], [0.35, "#e9e5dd"], [0.55, "#fbfaf6"], [1, "#8a857c"]])}</defs>`
        + `<path d="M20 200 L22 186 L68 186 L70 200Z" fill="url(#${g})"/><rect x="30" y="176" width="30" height="10" fill="url(#${g})"/>`
        + `<path d="M10 176 C10 146 26 132 45 130 C64 132 80 146 80 176Z" fill="url(#${g})"/>`
        + `<path d="M38 132 L38 118 L52 118 L52 132Z" fill="url(#${g})"/>`
        + `<path d="M30 92 C28 66 40 54 48 54 C60 54 66 66 64 88 C64 104 58 118 46 120 C36 120 31 108 30 92Z" fill="url(#${g})"/>`
        + `<path d="M28 82 C24 58 36 44 50 46 C64 46 70 60 66 78 C62 64 56 60 48 60 C40 60 34 66 28 82Z" fill="#cfcac0"/>`
        + `<path d="M28 70 q-4 6 0 12 M66 66 q4 6 0 12 M34 54 q4 -4 8 -2 M50 50 q6 -2 10 2" stroke="#b5afa4" stroke-width="2" fill="none" stroke-linecap="round"/>`
        + `<path d="M56 86 L62 96 L56 98" stroke="#b5afa4" stroke-width="1.4" fill="none"/><path d="M40 82 q4 -2 8 0 M54 82 q3 -2 6 0" stroke="#a49e92" stroke-width="1.2" fill="none"/>`
        + `<path d="M22 150 C34 140 46 152 58 142 C66 136 74 146 78 160" stroke="#cfcac0" stroke-width="3" fill="none"/>`,
    },
    gothicCandelabra: {
      label: "Gothic candelabra", scale: 0.98, vw: 160,
      draw: (g) => {
        const B = `url(#${g})`;
        // a blood-red wax run down the side of a candle: thick at the top, a bead at the end
        const drip = (x, y, len, w = 2.2) => `<path d="M${x - w / 2} ${y} L${x - w / 2} ${y + len} a${w / 2} ${w / 2} 0 0 0 ${w} 0 L${x + w / 2} ${y}Z" fill="#6a0a14"/><ellipse cx="${x}" cy="${y + len + 0.6}" rx="${w * 0.75}" ry="${w * 0.9}" fill="#5a0610"/>`;
        const candle = (x, top, bottom, wd) => taper(x, top, bottom, wd, "#e8dcc2")
          + `<path d="M${x - wd / 2} ${top + 1} Q${x} ${top + 5} ${x + wd / 2} ${top + 1} L${x + wd / 2} ${top + 4} Q${x} ${top + 8} ${x - wd / 2} ${top + 4}Z" fill="#7a0c18"/>`
          + drip(x - wd * 0.32, top + 3, (bottom - top) * 0.55, 2) + drip(x + wd * 0.1, top + 4, (bottom - top) * 0.3, 1.8) + drip(x + wd * 0.38, top + 2, (bottom - top) * 0.8, 1.6)
          + `<rect x="${x - wd / 2}" y="${top}" width="${wd}" height="${bottom - top}" fill="url(#${g}sh)"/>`;
        const cup = (x, y) => `<path d="M${x - 13} ${y} C${x - 13} ${y + 8} ${x - 7} ${y + 13} ${x - 3} ${y + 15} L${x + 3} ${y + 15} C${x + 7} ${y + 13} ${x + 13} ${y + 8} ${x + 13} ${y}Z" fill="${B}"/>`
          + `<ellipse cx="${x}" cy="${y}" rx="14" ry="3.2" fill="${B}"/><path d="M${x - 9} ${y + 5} q4 4 0 8 M${x} ${y + 4} v9 M${x + 9} ${y + 5} q-4 4 0 8" stroke="#1e1406" stroke-width=".9" fill="none" opacity=".7"/>`
          + `<path d="M${x - 11} ${y + 1} q2 6 1 11" stroke="#6a0a14" stroke-width="2" stroke-linecap="round" fill="none"/><ellipse cx="${x - 10}" cy="${y + 13}" rx="1.4" ry="1.8" fill="#5a0610"/>`;
        return `<defs>${metal(g, [[0, "#140d06"], [0.25, "#4a3a1e"], [0.45, "#9a8452"], [0.6, "#3e2f15"], [1, "#0e0904"]])}<linearGradient id="${g}sh" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset=".75" stop-color="#000" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient></defs>`
          // base: domed foot on four scrolled claws
          + `<path d="M26 200 C24 192 30 188 36 190 C40 184 48 180 56 178 L104 178 C112 180 120 184 124 190 C130 188 136 192 134 200 C126 196 120 198 116 200 L44 200 C40 198 34 196 26 200Z" fill="${B}"/>`
          + `<path d="M50 178 C54 164 68 156 80 154 C92 156 106 164 110 178Z" fill="${B}"/>`
          + `<path d="M58 172 q22 -14 44 0 M64 166 q16 -8 32 0" stroke="#1e1406" stroke-width="1" fill="none" opacity=".75"/><path d="M60 176 q4 -6 10 -4 M100 176 q-4 -6 -10 -4" stroke="#e0c890" stroke-width=".8" fill="none" opacity=".5"/>`
          + [0, 1, 2, 3, 4, 5].map((k) => `<path d="M${46 + k * 14} 196 q4 -8 0 -14" stroke="#0a0602" stroke-width=".9" fill="none" opacity=".7"/><circle cx="${53 + k * 12}" cy="188" r="1.6" fill="#c9b07a" opacity=".35"/>`).join("")
          // stem: stacked knops and an urn
          + `<path d="M74 154 C70 146 70 140 76 136 C68 130 66 118 76 110 L74 92 L86 92 L84 110 C94 118 92 130 84 136 C90 140 90 146 86 154Z" fill="${B}"/>`
          + `<path d="M74 122 q6 -8 12 0 q-6 8 -12 0Z" fill="#1e1406" opacity=".5"/><path d="M76 110 h8 M75 136 h10" stroke="#e0c890" stroke-width=".8" opacity=".45"/>`
          // arms: S-scrolls out to each side, with curled ends
          + `<path d="M76 104 C60 104 54 120 44 120 C32 120 26 112 28 102" stroke="${B}" stroke-width="5.5" fill="none" stroke-linecap="round"/><path d="M84 104 C100 104 106 120 116 120 C128 120 134 112 132 102" stroke="${B}" stroke-width="5.5" fill="none" stroke-linecap="round"/>`
          + `<path d="M44 120 c-4 6 2 12 7 8 c3 -3 0 -7 -3 -5" stroke="${B}" stroke-width="3" fill="none"/><path d="M116 120 c4 6 -2 12 -7 8 c-3 -3 0 -7 3 -5" stroke="${B}" stroke-width="3" fill="none"/>`
          + `<path d="M80 96 L80 82" stroke="${B}" stroke-width="8"/><path d="M72 92 h16 l-2 6 h-12Z" fill="${B}"/><ellipse cx="80" cy="88" rx="6" ry="4" fill="${B}"/>`
          + candle(28, 42, 96, 13) + candle(132, 48, 96, 13) + candle(80, 12, 70, 15)
          + cup(28, 96) + cup(132, 96) + cup(80, 70)
          // cobwebs caught between the arms and the stem
          + `<g stroke="rgba(220,220,225,.42)" stroke-width=".5" fill="none"><path d="M34 104 Q56 112 76 98 M36 110 Q58 116 76 106 M40 104 L46 116 M52 104 L58 112 M64 101 L66 110"/><path d="M126 104 Q110 118 88 112 M84 120 Q104 128 118 122 M100 114 L104 124"/><path d="M76 140 q-10 10 -14 26 M84 142 q8 12 10 24" opacity=".7"/></g>`
          + flame(28, 37, 1) + flame(132, 43, 1) + flame(80, 7, 1.1);
      },
    },
    // ---- second batch, from osamu's shelf photos
    bunny: {
      label: "Plush bunny", scale: 0.5, vw: 120, still: true,
      draw: (g) => `<defs><radialGradient id="${g}" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#fffaf2"/><stop offset=".7" stop-color="#efe3d0"/><stop offset="1" stop-color="#cdbda4"/></radialGradient></defs>`
        + `<ellipse cx="60" cy="160" rx="40" ry="38" fill="url(#${g})"/>`
        + `<ellipse cx="34" cy="192" rx="18" ry="9" fill="url(#${g})"/><ellipse cx="86" cy="192" rx="18" ry="9" fill="url(#${g})"/>`
        + `<path d="M44 66 C30 30 30 4 40 2 C50 0 54 34 52 66Z" fill="url(#${g})"/><path d="M76 66 C90 30 92 6 82 4 C72 2 66 36 68 66Z" fill="url(#${g})"/>`
        + `<path d="M43 60 C36 34 37 14 41 10 C46 14 48 40 48 60Z" fill="#f2c9c4" opacity=".75"/><path d="M77 60 C84 34 85 16 81 12 C76 16 72 40 72 60Z" fill="#f2c9c4" opacity=".75"/>`
        + `<ellipse cx="60" cy="96" rx="36" ry="32" fill="url(#${g})"/>`
        + `<ellipse cx="46" cy="140" rx="10" ry="16" fill="url(#${g})" stroke="#d9cbb4" stroke-width=".8"/><ellipse cx="74" cy="140" rx="10" ry="16" fill="url(#${g})" stroke="#d9cbb4" stroke-width=".8"/>`
        + `<circle cx="48" cy="94" r="2.6" fill="#3a2a22"/><circle cx="72" cy="94" r="2.6" fill="#3a2a22"/><path d="M57 102 L63 102 L60 106Z" fill="#e8a3a0"/><path d="M60 106 q-4 4 -7 2 M60 106 q4 4 7 2" stroke="#a88" stroke-width=".9" fill="none"/>`
        + `<ellipse cx="40" cy="104" rx="6" ry="3.5" fill="#f6c9c3" opacity=".6"/><ellipse cx="80" cy="104" rx="6" ry="3.5" fill="#f6c9c3" opacity=".6"/>`,
    },
    teddy: {
      label: "Teddy bear", scale: 0.52, vw: 130, still: true,
      draw: (g) => `<defs><radialGradient id="${g}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#e6c48e"/><stop offset=".7" stop-color="#c49a5e"/><stop offset="1" stop-color="#8a6538"/></radialGradient></defs>`
        + `<ellipse cx="65" cy="150" rx="42" ry="44" fill="url(#${g})"/><ellipse cx="65" cy="158" rx="22" ry="26" fill="#e9d2a8" opacity=".7"/>`
        + `<ellipse cx="32" cy="186" rx="20" ry="13" fill="url(#${g})"/><ellipse cx="98" cy="186" rx="20" ry="13" fill="url(#${g})"/><ellipse cx="28" cy="188" rx="9" ry="8" fill="#e9d2a8"/><ellipse cx="102" cy="188" rx="9" ry="8" fill="#e9d2a8"/>`
        + `<ellipse cx="26" cy="140" rx="13" ry="22" fill="url(#${g})" transform="rotate(20 26 140)"/><ellipse cx="104" cy="140" rx="13" ry="22" fill="url(#${g})" transform="rotate(-20 104 140)"/>`
        + `<circle cx="34" cy="50" r="15" fill="url(#${g})"/><circle cx="96" cy="50" r="15" fill="url(#${g})"/><circle cx="34" cy="50" r="8" fill="#e9d2a8"/><circle cx="96" cy="50" r="8" fill="#e9d2a8"/>`
        + `<ellipse cx="65" cy="78" rx="38" ry="34" fill="url(#${g})"/><ellipse cx="65" cy="92" rx="16" ry="12" fill="#ead6ae"/>`
        + `<ellipse cx="65" cy="86" rx="6" ry="4.5" fill="#3a2414"/><path d="M65 90 v6 M65 96 q-5 4 -9 1 M65 96 q5 4 9 1" stroke="#3a2414" stroke-width="1.4" fill="none"/>`
        + `<circle cx="51" cy="72" r="3.4" fill="#22160c"/><circle cx="79" cy="72" r="3.4" fill="#22160c"/><circle cx="52" cy="71" r="1" fill="#fff"/><circle cx="80" cy="71" r="1" fill="#fff"/>`
        + `<path d="M50 112 Q65 120 80 112 L86 120 Q65 128 44 120Z" fill="#c9a07a"/><path d="M58 116 L65 112 L72 116 L65 122Z" fill="#b48c66"/>`,
    },
    catLamp: {
      label: "Cat night-light", scale: 0.4, vw: 120, soft: true, glow: "rgba(255,240,215,.55)",
      draw: (g) => `<defs><radialGradient id="${g}" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f4efe6"/><stop offset="1" stop-color="#cfc8bc"/></radialGradient><filter id="${g}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter></defs><g data-y="110"></g>`
        + `<ellipse class="litOnly" cx="60" cy="130" rx="54" ry="56" fill="#fff6e4" filter="url(#${g}b)"/>`
        + `<path d="M14 200 C8 150 14 90 30 74 L28 40 L48 64 C56 62 64 62 72 64 L92 40 L90 74 C106 90 112 150 106 200Z" fill="url(#${g})"/>`
        + `<path class="litOnly" d="M14 200 C8 150 14 90 30 74 L28 40 L48 64 C56 62 64 62 72 64 L92 40 L90 74 C106 90 112 150 106 200Z" fill="#fffaf0"/>`
        + `<circle cx="46" cy="104" r="3.2" fill="#2a2522"/><circle cx="74" cy="104" r="3.2" fill="#2a2522"/><path d="M56 112 q4 4 8 0" stroke="#2a2522" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
        + `<ellipse cx="38" cy="114" rx="6" ry="3" fill="#f6c4be" opacity=".55"/><ellipse cx="82" cy="114" rx="6" ry="3" fill="#f6c4be" opacity=".55"/>`,
    },
    tulips: {
      label: "Tulips in a vase", scale: 0.66, vw: 110, still: true,
      draw: (g) => {
        const bloom = (x, y, r) => `<g transform="rotate(${r} ${x} ${y + 18})"><path d="M${x - 9} ${y + 4} C${x - 10} ${y + 18} ${x + 10} ${y + 18} ${x + 9} ${y + 4} L${x + 6} ${y - 8} L${x + 2} ${y} L${x} ${y - 10} L${x - 3} ${y} L${x - 7} ${y - 8}Z" fill="#e88a98"/><path d="M${x - 2} ${y - 6} C${x - 6} ${y + 6} ${x - 4} ${y + 14} ${x} ${y + 15}" stroke="#c9667a" stroke-width="1.2" fill="none"/><path d="M${x + 1} ${y - 9} C${x + 8} ${y} ${x + 6} ${y + 12} ${x + 2} ${y + 15}" fill="#f5aab6" opacity=".7"/></g>`;
        return `<defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#cfe3e0" stop-opacity=".25"/><stop offset=".3" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#b9d0cc" stop-opacity=".3"/></linearGradient></defs>`
          + `<path d="M55 196 C52 150 36 90 28 40 M55 196 C56 140 52 80 56 28 M55 196 C60 150 72 96 82 46" stroke="#5f8a4a" stroke-width="2.2" fill="none"/>`
          + `<path d="M50 150 C34 130 30 112 34 96 C42 116 48 128 52 146Z" fill="#6f9a56"/><path d="M60 150 C76 130 82 116 80 100 C72 118 64 130 58 146Z" fill="#5f8a4a"/>`
          + bloom(28, 30, -14) + bloom(56, 18, 0) + bloom(82, 36, 14)
          + `<path d="M38 140 C34 150 32 166 34 186 Q36 200 55 200 Q74 200 76 186 C78 166 76 150 72 140Z" fill="url(#${g})" stroke="rgba(255,255,255,.5)" stroke-width="1.2"/>`
          + `<path d="M36 168 C44 172 66 172 76 168 L76 186 Q74 200 55 200 Q36 200 34 186Z" fill="#a9c7c2" opacity=".25"/><ellipse cx="55" cy="140" rx="17" ry="3" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.2"/>`;
      },
    },
    instax: {
      label: "Instant camera", scale: 0.36, vw: 150, still: true,
      draw: (g) => `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6cfc6"/><stop offset="1" stop-color="#d9a197"/></linearGradient><radialGradient id="${g}l" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#5a6a8a"/><stop offset=".5" stop-color="#1d2230"/><stop offset="1" stop-color="#0a0c12"/></radialGradient></defs>`
        + `<rect x="8" y="44" width="134" height="154" rx="26" fill="url(#${g})"/><rect x="8" y="44" width="134" height="40" rx="20" fill="#fff" opacity=".18"/>`
        + `<circle cx="78" cy="126" r="46" fill="#f1c2b8" stroke="#c98f86" stroke-width="2"/><circle cx="78" cy="126" r="32" fill="#e6b0a6"/><circle cx="78" cy="126" r="22" fill="url(#${g}l)"/><circle cx="71" cy="118" r="5" fill="#fff" opacity=".45"/>`
        + `<rect x="18" y="58" width="30" height="22" rx="5" fill="#2a2a32"/><rect x="104" y="56" width="26" height="26" rx="13" fill="#fff6e6" opacity=".85"/><rect x="58" y="54" width="18" height="12" rx="3" fill="#2a2a32"/>`,
    },
    heartMirror: {
      label: "Heart mirror", scale: 0.56, vw: 120, still: true,
      draw: (g) => `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9c8c6"/><stop offset="1" stop-color="#b98a8a"/></linearGradient><linearGradient id="${g}m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f3f0"/><stop offset=".45" stop-color="#cfd3d6"/><stop offset=".55" stop-color="#eef0f2"/><stop offset="1" stop-color="#b9bec4"/></linearGradient></defs>`
        + `<path d="M60 178 C20 146 4 116 8 86 C12 58 44 50 60 74 C76 50 108 58 112 86 C116 116 100 146 60 178Z" fill="url(#${g})"/>`
        + `<path d="M60 166 C28 140 16 116 19 90 C22 68 46 64 60 86 C74 64 98 68 101 90 C104 116 92 140 60 166Z" fill="url(#${g}m)"/>`
        + `<path d="M30 86 L48 74 M30 100 L58 80" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/>`
        + `<path d="M56 176 L54 190 L66 190 L64 176Z" fill="url(#${g})"/><ellipse cx="60" cy="194" rx="28" ry="6" fill="url(#${g})"/>`,
    },
    candleJar: {
      label: "Candle jar", scale: 0.34, vw: 110,
      draw: (g) => `<defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".15"/><stop offset=".3" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity=".25"/></linearGradient></defs>`
        + `<rect x="10" y="40" width="90" height="160" rx="10" fill="#f1e8d6"/><ellipse cx="55" cy="80" rx="38" ry="7" fill="#e8dcc4"/>`
        + `<rect x="24" y="112" width="62" height="56" rx="3" fill="#fbf7ef"/><text x="55" y="140" font-family="Georgia,serif" font-size="12" text-anchor="middle" fill="#7a6a58">vanilla</text><line x1="38" y1="150" x2="72" y2="150" stroke="#b9a988" stroke-width=".8"/>`
        + `<rect x="10" y="40" width="90" height="160" rx="10" fill="url(#${g})" stroke="rgba(255,255,255,.5)" stroke-width="1.2"/>`
        + `<line x1="55" y1="80" x2="55" y2="72" stroke="#2a2420" stroke-width="1.4"/>` + flame(55, 72, 1.15),
    },
    oldCamera: {
      label: "Vintage camera", scale: 0.32, vw: 170, still: true,
      draw: (g) => `<defs>${metal(g, SILVER)}<radialGradient id="${g}l" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#6a7a9a"/><stop offset=".45" stop-color="#14161c"/><stop offset="1" stop-color="#050608"/></radialGradient></defs>`
        + `<rect x="8" y="70" width="154" height="122" rx="10" fill="#1d1d20"/><rect x="8" y="70" width="154" height="34" rx="8" fill="url(#${g})"/><rect x="8" y="164" width="154" height="28" rx="8" fill="url(#${g})"/>`
        + `<path d="M60 70 L68 40 L102 40 L110 70Z" fill="url(#${g})"/><rect x="74" y="46" width="22" height="12" rx="2" fill="#2a2a30"/>`
        + `<rect x="20" y="56" width="22" height="14" rx="3" fill="url(#${g})"/><rect x="128" y="58" width="20" height="12" rx="3" fill="url(#${g})"/>`
        + `<circle cx="85" cy="132" r="44" fill="url(#${g})"/><circle cx="85" cy="132" r="36" fill="#111"/><circle cx="85" cy="132" r="26" fill="url(#${g}l)"/><circle cx="76" cy="122" r="6" fill="#fff" opacity=".3"/>`
        + `<text x="30" y="92" font-family="Arial,sans-serif" font-size="9" font-weight="bold" fill="#222" opacity=".7">OLD</text>`,
    },
    snowGlobe: {
      label: "Snow globe", scale: 0.5, vw: 120, soft: true, glow: "rgba(255,230,180,.4)",
      draw: (g) => {
        let snow = ""; for (let i = 0; i < 22; i++) { const a = i * 2.4, r = 6 + (i * 13) % 30; snow += `<circle cx="${(60 + Math.cos(a) * r).toFixed(1)}" cy="${(80 + Math.sin(a) * r * 0.9).toFixed(1)}" r="${(0.8 + (i % 3) * 0.5).toFixed(1)}" fill="#fff" opacity=".85"/>`; }
        return `<defs>${metal(g, BRASS)}<radialGradient id="${g}o" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".5" stop-color="#cfe0ea" stop-opacity=".15"/><stop offset="1" stop-color="#8aa0b0" stop-opacity=".35"/></radialGradient></defs><g data-y="90"></g>`
          + `<circle class="litOnly" cx="60" cy="86" r="40" fill="#ffe6b0" opacity=".35"/>`
          + `<path d="M44 128 L48 96 L52 96 L54 88 L58 70 L62 88 L66 88 L66 128Z" fill="#c9a65e"/><path d="M50 96 L60 76 L70 96Z" fill="#e3c27a"/><rect x="40" y="118" width="40" height="10" fill="#d8b47a"/>`
          + snow + `<circle cx="60" cy="86" r="46" fill="url(#${g}o)" stroke="rgba(255,255,255,.55)" stroke-width="1.4"/><ellipse cx="44" cy="64" rx="10" ry="16" fill="#fff" opacity=".25" transform="rotate(30 44 64)"/>`
          + `<path d="M22 132 L98 132 L106 192 L14 192Z" fill="url(#${g})"/><rect x="8" y="190" width="104" height="10" rx="3" fill="url(#${g})"/><path d="M24 150 L96 150" stroke="#5a421c" stroke-width="1" opacity=".5"/>`;
      },
    },
    apothecary: {
      label: "Apothecary bottle", scale: 0.62, vw: 100, still: true,
      draw: (g) => `<defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#1f3a1c"/><stop offset=".3" stop-color="#4f7a3c"/><stop offset=".45" stop-color="#8ab06a"/><stop offset=".6" stop-color="#3f6a30"/><stop offset="1" stop-color="#1a3018"/></linearGradient></defs>`
        + `<path d="M40 10 L60 10 L60 52 C86 62 90 80 90 100 L90 186 Q90 200 76 200 L24 200 Q10 200 10 186 L10 100 C10 80 14 62 40 52Z" fill="url(#${g})" opacity=".92"/>`
        + `<rect x="36" y="2" width="28" height="12" rx="3" fill="#7a5a34"/>`
        + `<rect x="22" y="112" width="56" height="58" rx="4" fill="#efe6cc"/><rect x="25" y="115" width="50" height="52" rx="3" fill="none" stroke="#3f6a30" stroke-width="1"/>`
        + `<path d="M50 124 C40 132 40 150 50 160 C60 150 60 132 50 124Z M50 128 L50 158" fill="#5f8a4a" stroke="#efe6cc" stroke-width=".8"/>`
        + `<rect x="18" y="70" width="6" height="110" rx="3" fill="#fff" opacity=".2"/>`,
    },
    mortar: {
      label: "Mortar and pestle", scale: 0.36, vw: 130, still: true,
      draw: (g) => `<defs>${metal(g, BRASS)}</defs>`
        + `<path d="M82 110 L118 10 L126 14 L92 112Z" fill="#8a6a3a"/><circle cx="122" cy="12" r="7" fill="#8a6a3a"/>`
        + `<path d="M10 96 L120 96 C118 140 96 160 65 160 C34 160 12 140 10 96Z" fill="url(#${g})"/><ellipse cx="65" cy="96" rx="55" ry="8" fill="#5a421c"/><ellipse cx="65" cy="96" rx="55" ry="8" fill="none" stroke="#f3dc9a" stroke-width="1.5"/>`
        + `<path d="M50 160 L44 186 L86 186 L80 160Z" fill="url(#${g})"/><ellipse cx="65" cy="192" rx="40" ry="8" fill="url(#${g})"/>`,
    },
    scales: {
      label: "Brass scales", scale: 0.62, vw: 140, still: true,
      draw: (g) => {
        const pan = (x) => `<path d="M${x} 46 L${x - 20} 108 M${x} 46 L${x + 20} 108" stroke="url(#${g})" stroke-width="1.2"/><path d="M${x - 26} 108 Q${x} 128 ${x + 26} 108Z" fill="url(#${g})"/>`;
        return `<defs>${metal(g, BRASS)}</defs>`
          + `<rect x="66" y="30" width="8" height="150" fill="url(#${g})"/><circle cx="70" cy="22" r="8" fill="url(#${g})"/><path d="M70 10 L74 18 L66 18Z" fill="url(#${g})"/>`
          + `<path d="M20 46 Q70 30 120 46" stroke="url(#${g})" stroke-width="5" fill="none"/>` + pan(24) + pan(116)
          + `<path d="M50 180 L90 180 L96 190 L44 190Z" fill="url(#${g})"/><rect x="24" y="188" width="92" height="12" rx="3" fill="#e6ded2"/><rect x="24" y="188" width="92" height="3" fill="#fff" opacity=".5"/>`;
      },
    },
    ballet: {
      label: "Ballet slippers", scale: 0.62, vw: 120, still: true, hang: true,
      draw: (g) => {
        // a pair of satin pointe shoes hanging by their ribbons from a nail in the shelf's edge
        // one pointe shoe seen from the side, hanging heel up: the satin vamp, the dark opening, the leather sole, the flat platform
        const shoe = (x, top, len, rot) => { const L = len, y = (f) => top + L * f;
          return `<g transform="rotate(${rot} ${x} ${top})">`
          + `<path d="M${x - 7} ${top} C${x - 14} ${y(0.12)} ${x - 14} ${y(0.34)} ${x - 11} ${y(0.52)} C${x - 8} ${y(0.72)} ${x - 6} ${y(0.88)} ${x - 4} ${y(1)} L${x + 6} ${y(1)} C${x + 10} ${y(0.88)} ${x + 14} ${y(0.68)} ${x + 14} ${y(0.5)} C${x + 14} ${y(0.36)} ${x + 12} ${y(0.27)} ${x + 8} ${y(0.22)} Q${x + 1} ${y(0.07)} ${x - 7} ${top}Z" fill="url(#${g})"/>`
          + `<path d="M${x + 8} ${y(0.22)} Q${x + 1} ${y(0.07)} ${x - 7} ${top} Q${x - 1} ${y(0.16)} ${x + 8} ${y(0.22)}Z" fill="#8e5047"/><path d="M${x + 8} ${y(0.22)} Q${x + 1} ${y(0.07)} ${x - 7} ${top}" stroke="#f6d6cc" stroke-width="1.1" fill="none"/>`
          + `<path d="M${x - 12} ${y(0.42)} C${x - 10} ${y(0.66)} ${x - 7} ${y(0.86)} ${x - 4.5} ${y(0.995)}" stroke="#8a5a3a" stroke-width="1.6" fill="none"/>`
          + `<path d="M${x - 4} ${y(1)} L${x + 6} ${y(1)}" stroke="#b97a70" stroke-width="2.2" stroke-linecap="round"/>`
          + [-2, 1.5, 5].map((d) => `<path d="M${x + d} ${y(0.98)} L${x + d * 0.6 + 1} ${y(0.86)}" stroke="#c98f86" stroke-width=".7" opacity=".7"/>`).join("")
          + `<path d="M${x + 4} ${y(0.3)} C${x + 9} ${y(0.45)} ${x + 9} ${y(0.7)} ${x + 4} ${y(0.92)}" stroke="#fff" stroke-width="2.4" opacity=".45" fill="none" stroke-linecap="round"/>`
          + `<path d="M${x - 9} ${y(0.2)} C${x - 11} ${y(0.4)} ${x - 9} ${y(0.6)} ${x - 7} ${y(0.75)}" stroke="#b97a70" stroke-width="1.6" opacity=".45" fill="none"/></g>`; };
        const ribbon = (x0, y0, x1, y1, c) => `<path d="M${x0} ${y0} C${x0 + (x1 - x0) * 0.2} ${y0 + 30} ${x1 + (x0 - x1) * 0.1} ${y1 - 24} ${x1} ${y1}" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
        return `<defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#d79c90"/><stop offset=".35" stop-color="#f9ddd4"/><stop offset=".6" stop-color="#f1c2b6"/><stop offset="1" stop-color="#c5877b"/></linearGradient>${metal(g + "n", [[0, "#3a3a40"], [0.5, "#c9c9d0"], [1, "#2a2a30"]])}</defs>`
          // ribbons up to the nail, and loose ends dangling with cut tails
          + ribbon(60, 10, 40, 64, "#efbcae") + ribbon(60, 10, 50, 62, "#f6cfc4") + ribbon(60, 10, 78, 80, "#efbcae") + ribbon(60, 10, 88, 78, "#f6cfc4")
          + shoe(44, 64, 96, 6) + shoe(80, 80, 96, -7)
          + `<path d="M36 66 C30 96 34 120 28 146 l3 4 3 -5" stroke="#f0bdb0" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M92 82 C100 110 96 132 102 160 l-3 4 -3 -5" stroke="#efbcae" stroke-width="3" fill="none" stroke-linecap="round"/>`
          + `<rect x="58.4" y="2" width="3.2" height="12" rx="1" fill="url(#${g}n)"/><ellipse cx="60" cy="4" rx="5.5" ry="3" fill="url(#${g}n)"/><ellipse cx="59" cy="3.2" rx="2" ry="1" fill="#fff" opacity=".6"/>`;
      },
    },
    perfume: {
      label: "Perfume bottle", scale: 0.38, vw: 110, still: true,
      draw: (g) => `<defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#e6a9b8" stop-opacity=".6"/><stop offset=".3" stop-color="#fff" stop-opacity=".7"/><stop offset=".5" stop-color="#f3c6d0" stop-opacity=".4"/><stop offset="1" stop-color="#c98a9a" stop-opacity=".7"/></linearGradient>${metal(g + "b", BRASS)}</defs>`
        + `<path d="M20 90 L90 90 L96 192 Q96 200 88 200 L22 200 Q14 200 14 192Z" fill="url(#${g})" stroke="rgba(255,255,255,.6)" stroke-width="1.2"/>`
        + `<path d="M20 140 L90 140 L94 192 Q94 198 88 198 L22 198 Q16 198 16 192Z" fill="#f2b8c6" opacity=".55"/>`
        + `<rect x="42" y="72" width="26" height="20" rx="2" fill="url(#${g}b)"/><path d="M55 72 C30 60 34 24 55 18 C76 24 80 60 55 72Z" fill="url(#${g})" stroke="rgba(255,255,255,.6)" stroke-width="1"/>`
        + `<path d="M8 196 C30 186 60 200 102 190" stroke="#f6efe4" stroke-width="5" stroke-dasharray=".1 6.5" stroke-linecap="round" fill="none"/>`,
    },
    topiary: {
      label: "Rose topiary", scale: 0.62, vw: 110, still: true,
      draw: (g) => {
        let roses = "", leaves = ""; const pts = [];
        for (let i = 0; i < 26; i++) { const a = i * 2.39996, r = Math.sqrt(i / 26) * 36; pts.push([55 + Math.cos(a) * r, 64 + Math.sin(a) * r]); }
        pts.forEach(([x, y], i) => (leaves += leaf(x, y + 6, i * 47, 0.9, i % 2 ? "#4f7a3c" : "#3f6a30")));
        pts.filter((_, i) => i % 2).forEach(([x, y], i) => (roses += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.4" fill="${["#e88a6a", "#f3b48a", "#e8a3a0"][i % 3]}"/><path d="M${(x - 2.5).toFixed(1)} ${y.toFixed(1)} a2.5 2.5 0 1 1 5 0" stroke="#b9584a" stroke-width=".8" fill="none"/>`));
        return `<defs>${metal(g, CERAMIC)}</defs><circle cx="55" cy="64" r="40" fill="#2f5a28"/>` + leaves + roses
          + `<rect x="52" y="104" width="6" height="44" fill="#6b4a2a"/>`
          + `<path d="M30 148 L80 148 L72 186 L38 186Z" fill="url(#${g})"/><rect x="26" y="144" width="58" height="8" rx="2" fill="url(#${g})"/><path d="M30 200 L80 200 L74 186 L36 186Z" fill="url(#${g})"/>`;
      },
    },
    wineBottle: {
      label: "Wine bottle", scale: 0.78, vw: 60, still: true,
      draw: (g) => `<defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#2a3a14"/><stop offset=".3" stop-color="#6a7a2a"/><stop offset=".42" stop-color="#b9c47a"/><stop offset=".6" stop-color="#4a5a1c"/><stop offset="1" stop-color="#1e2a0e"/></linearGradient></defs>`
        + `<path d="M24 4 L36 4 L36 60 C36 76 54 84 54 104 L54 194 Q54 200 48 200 L12 200 Q6 200 6 194 L6 104 C6 84 24 76 24 60Z" fill="url(#${g})" opacity=".95"/>`
        + `<rect x="22" y="4" width="16" height="22" rx="2" fill="#d8c9a8"/>`
        + `<rect x="8" y="130" width="44" height="46" fill="#f3ece0"/><text x="30" y="160" font-family="Georgia,serif" font-size="22" text-anchor="middle" fill="#7a1a2a">A</text><line x1="14" y1="168" x2="46" y2="168" stroke="#555" stroke-width=".8"/>`,
    },
    tulipCandle: {
      label: "Tulip candleholder", scale: 0.86, vw: 90,
      draw: (g) => `<defs>${metal(g, BRASS)}</defs>`
        + `<path d="M43 196 C42 160 30 120 42 70 M47 196 C48 160 60 120 48 70" stroke="url(#${g})" stroke-width="3" fill="none"/>`
        + `<path d="M46 150 C70 130 84 110 86 96 C70 104 56 124 46 150Z" fill="url(#${g})"/><path d="M44 130 C24 118 10 100 8 86 C24 92 36 108 44 130Z" fill="url(#${g})"/>`
        + `<path d="M30 46 C30 62 36 72 45 72 C54 72 60 62 60 46 L54 54 L50 42 L45 52 L40 42 L36 54Z" fill="url(#${g})"/>`
        + `<ellipse cx="45" cy="194" rx="34" ry="6" fill="url(#${g})"/>`
        + taper(45, 18, 46, 10) + flame(45, 13, 1),
    },
    specimenJar: {
      label: "Specimen jar", scale: 0.66, vw: 100, still: true,
      draw: (g) => `<defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#5a3a2a" stop-opacity=".55"/><stop offset=".3" stop-color="#e6c9a6" stop-opacity=".3"/><stop offset=".45" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#4a2a1e" stop-opacity=".6"/></linearGradient>${metal(g + "m", BRONZE)}</defs>`
        + `<path d="M18 50 L82 50 L82 162 L18 162Z" fill="#c9a66a" opacity=".35"/>`
        + `<path d="M50 80 C34 66 20 82 28 102 C34 118 46 128 50 138 C54 128 66 118 72 102 C80 82 66 66 50 80Z" fill="#9a3a3a"/><path d="M44 72 C42 60 46 54 52 56 M56 74 C58 62 64 58 66 62" stroke="#7a2a2a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M38 92 C44 100 48 112 50 124" stroke="#5a1a1a" stroke-width="1.2" fill="none"/>`
        + `<path d="M18 50 L82 50 L82 162 L18 162Z" fill="url(#${g})" stroke="rgba(255,255,255,.35)" stroke-width="1"/>`
        + `<path d="M14 40 L86 40 L82 52 L18 52Z" fill="url(#${g}m)"/><path d="M32 40 C32 22 68 22 68 40Z" fill="url(#${g}m)"/><circle cx="50" cy="20" r="6" fill="url(#${g}m)"/>`
        + `<path d="M18 162 L82 162 L76 176 L24 176Z" fill="url(#${g}m)"/><rect x="44" y="176" width="12" height="12" fill="url(#${g}m)"/><ellipse cx="50" cy="194" rx="30" ry="6" fill="url(#${g}m)"/>`,
    },
    beetles: {
      label: "Beetle display", scale: 0.6, vw: 130, still: true,
      draw: (g) => {
        const cols = ["#2f8a5a", "#3a6ac9", "#8a3ac9", "#c9a03a", "#2a9aa8", "#6ac93a"];
        let bugs = "";
        for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const x = 34 + c * 31, y = 46 + r * 38, k = (r * 3 + c) % 6; bugs += `<ellipse cx="${x}" cy="${y + 2}" rx="7" ry="10" fill="${cols[k]}"/><circle cx="${x}" cy="${y - 9}" r="3.5" fill="#1a1a1a"/><line x1="${x}" y1="${y - 6}" x2="${x}" y2="${y + 12}" stroke="#111" stroke-width=".8"/><path d="M${x - 7} ${y} l-5 -3 M${x + 7} ${y} l5 -3 M${x - 7} ${y + 6} l-5 3 M${x + 7} ${y + 6} l5 3" stroke="#222" stroke-width=".8"/><ellipse cx="${x - 2}" cy="${y - 1}" rx="2" ry="4" fill="#fff" opacity=".35"/>`; }
        return `<rect x="6" y="14" width="118" height="186" rx="3" fill="#3a2418"/><rect x="14" y="22" width="102" height="170" fill="#ece3d0"/>` + bugs
          + `<rect x="14" y="22" width="102" height="170" fill="#fff" opacity=".08"/><path d="M18 26 L60 26 L20 90Z" fill="#fff" opacity=".12"/>`;
      },
    },
    heartPotion: {
      label: "Heart potion", scale: 0.5, vw: 100, still: true,
      draw: (g) => `<defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".15"/><stop offset=".3" stop-color="#fff" stop-opacity=".5"/><stop offset=".5" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/></linearGradient></defs>`
        + `<path d="M50 160 C20 136 8 116 10 96 C12 76 34 70 50 88 C66 70 88 76 90 96 C92 116 80 136 50 160Z" fill="rgba(230,230,235,.2)"/>`
        + `<path d="M50 160 C26 140 14 126 12 112 L88 112 C86 126 74 140 50 160Z" fill="#7a0e1e"/><path d="M12 112 L88 112" stroke="#a81a2e" stroke-width="2"/>`
        + `<path d="M50 160 C20 136 8 116 10 96 C12 76 34 70 50 88 C66 70 88 76 90 96 C92 116 80 136 50 160Z" fill="url(#${g})" stroke="rgba(255,255,255,.6)" stroke-width="1.2"/>`
        + `<rect x="44" y="50" width="12" height="36" fill="rgba(230,230,235,.35)" stroke="rgba(255,255,255,.5)"/>`
        + `<path d="M50 52 C38 46 38 30 46 28 C42 20 58 20 54 28 C62 30 62 46 50 52Z" fill="#4a1a3a"/><path d="M50 50 C44 44 46 34 50 32 C54 34 56 44 50 50Z" fill="#6a2a5a"/>`
        + `<path d="M50 160 L40 198 M50 160 L60 198 M30 150 C20 170 16 186 12 198 M70 150 C80 170 84 186 88 198" stroke="#3a2a3a" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
    },
    grimoire: {
      label: "Open book on a stand", scale: 0.96, vw: 200, still: true,
      draw: (g) => {
        // an old book lying open on a wooden lectern: pages that bow up from the spine, text that follows the curve,
        // the page block's edges, the cover showing round the pages and a ribbon marker
        const page = (side) => {
          const s = side, gx = 100, ox = 100 + s * 86;
          const top = `M${gx} 40 C${gx + s * 20} 26 ${gx + s * 60} 22 ${ox} 30`, bottom = `L${ox + s * 2} 160 C${gx + s * 60} 152 ${gx + s * 22} 154 ${gx} 166Z`;
          let lines = "";
          for (let i = 0; i < 12; i++) {
            const y = 46 + i * 9, sag = 7 - i * 0.25, x0 = gx + s * 12, x1 = gx + s * (i === 0 && s < 0 ? 62 : 76);
            if (s < 0 && i < 3) { lines += `<path d="M${gx + s * 12} ${y + sag} C${gx + s * 26} ${y + sag * 0.2} ${gx + s * 40} ${y - 2} ${gx + s * 52} ${y - 2}" stroke="#7a6e5c" stroke-width=".8" fill="none" opacity=".55"/>`; continue; }
            lines += `<path d="M${x0} ${y + sag} C${gx + s * 30} ${y + sag * 0.1} ${gx + s * 55} ${y - 3} ${x1} ${y - 2}" stroke="#7a6e5c" stroke-width=".8" fill="none" opacity="${i % 4 === 3 ? 0.3 : 0.55}" stroke-dasharray="${i % 4 === 3 ? "20 4 12 3" : "none"}"/>`;
          }
          return `<path d="${top} ${bottom}" fill="url(#${g}p${s > 0 ? "r" : "l"})"/>` + lines;
        };
        return `<defs>${metal(g, [[0, "#2a160a"], [0.4, "#6a3f1e"], [0.55, "#8a5530"], [1, "#24120a"]])}`
          + `<linearGradient id="${g}pl" x1="1" x2="0"><stop offset="0" stop-color="#b8aa8a"/><stop offset=".12" stop-color="#e6dcc4"/><stop offset=".5" stop-color="#f3ecdb"/><stop offset="1" stop-color="#e2d6ba"/></linearGradient>`
          + `<linearGradient id="${g}pr" x1="0" x2="1"><stop offset="0" stop-color="#ab9c7c"/><stop offset=".12" stop-color="#e2d8c0"/><stop offset=".5" stop-color="#f1e9d6"/><stop offset="1" stop-color="#ddd0b2"/></linearGradient></defs>`
          // the lectern: a slanted board and a lip that holds the book, on a turned foot
          + `<path d="M18 150 L182 150 L176 170 L24 170Z" fill="url(#${g})"/><path d="M14 166 L186 166 L186 176 L14 176Z" fill="url(#${g})"/><path d="M14 166 H186" stroke="#c99a62" stroke-width="1" opacity=".5"/>`
          + `<path d="M88 176 L84 188 L116 188 L112 176Z" fill="url(#${g})"/><path d="M60 188 L140 188 Q146 194 140 200 L60 200 Q54 194 60 188Z" fill="url(#${g})"/>`
          // the cover round the pages
          + `<path d="M100 42 C78 24 40 18 8 26 L4 166 C40 158 76 160 100 170 C124 160 160 158 196 166 L192 26 C160 18 122 24 100 42Z" fill="#4a1a14"/>`
          + `<path d="M100 42 C78 24 40 18 8 26 L4 166 C40 158 76 160 100 170 C124 160 160 158 196 166 L192 26 C160 18 122 24 100 42Z" fill="none" stroke="#c9a24e" stroke-width=".8" opacity=".6"/>`
          // the page block: thin edges stacked under each side
          + [1, 2, 3, 4].map((k) => `<path d="M${100 - 84 - k * 0.6} ${160 + k * 1.2} C40 ${152 + k} 78 ${155 + k} 100 ${166 + k * 0.8} C122 ${155 + k} 160 ${152 + k} ${184 + k * 0.6} ${160 + k * 1.2}" stroke="${k % 2 ? "#d8ccae" : "#bfb194"}" stroke-width="1.2" fill="none"/>`).join("")
          + page(-1) + page(1)
          // the spine's shadow, and a drop cap
          + `<path d="M100 40 C96 80 96 130 100 166 C104 130 104 80 100 40Z" fill="#5a4a32" opacity=".35"/><rect x="99.3" y="40" width="1.4" height="126" fill="#4a3a26" opacity=".5"/>`
          + `<text x="24" y="62" font-family="Georgia,serif" font-size="20" fill="#7a1a14" font-style="italic">T</text>`
          // a ribbon marker running out of the gutter and over the lip
          + `<path d="M101 44 C104 90 98 140 106 178 L102 186 L110 182 L112 188 C110 150 108 96 103 44Z" fill="#8a1a22"/>`;
      },
    },
    crystalBall: {
      label: "Crystal ball", scale: 0.44, vw: 120, soft: true, glow: "rgba(170,140,255,.55)",
      draw: (g) => {
        let specks = ""; for (let i = 0; i < 24; i++) { const a = i * 2.39996, r = Math.sqrt(i / 24) * 36; specks += `<circle class="cbSpeck" style="--i:${i % 7}" cx="${(60 + Math.cos(a) * r).toFixed(1)}" cy="${(84 + Math.sin(a) * r * 0.85).toFixed(1)}" r="${(0.7 + (i % 3) * 0.45).toFixed(1)}" fill="#fff"/>`; }
        // colours that drift through violet, blue, teal and rose while it is awake
        const cyc = (vals, dur) => `<animate attributeName="stop-color" values="${vals}" dur="${dur}s" repeatCount="indefinite"/>`;
        return `<defs>${metal(g, BRASS)}<radialGradient id="${g}o" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff" stop-opacity=".75"/><stop offset=".35" stop-color="#d9dde6" stop-opacity=".35"/><stop offset=".8" stop-color="#6a7080" stop-opacity=".45"/><stop offset="1" stop-color="#3a3f4a" stop-opacity=".75"/></radialGradient>`
          + `<radialGradient id="${g}c"><stop offset="0" stop-color="#fff">${cyc("#ffffff;#f4e8ff;#e6fbff;#ffffff", 10)}</stop><stop offset=".35" stop-color="#b48cff">${cyc("#b48cff;#6ab0ff;#5be0d0;#ff8ac8;#b48cff", 12)}</stop><stop offset="1" stop-color="#3a1a7a" stop-opacity="0">${cyc("#3a1a7a;#123a8a;#0e5a5a;#7a1a4a;#3a1a7a", 12)}</stop></radialGradient>`
          + `<radialGradient id="${g}m"><stop offset="0" stop-color="#ff9ae0">${cyc("#ff9ae0;#9ab8ff;#8affe0;#ffd38a;#ff9ae0", 9)}</stop><stop offset="1" stop-color="#ff9ae0" stop-opacity="0">${cyc("#ff9ae0;#9ab8ff;#8affe0;#ffd38a;#ff9ae0", 9)}</stop></radialGradient>`
          + `<radialGradient id="${g}n"><stop offset="0" stop-color="#8ad8ff">${cyc("#8ad8ff;#c08aff;#ff8ab0;#8affc8;#8ad8ff", 14)}</stop><stop offset="1" stop-color="#8ad8ff" stop-opacity="0">${cyc("#8ad8ff;#c08aff;#ff8ab0;#8affc8;#8ad8ff", 14)}</stop></radialGradient>`
          + `<filter id="${g}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter><clipPath id="${g}k"><circle cx="60" cy="84" r="50"/></clipPath></defs><g data-y="90"></g>`
          // the stand
          + `<path d="M24 160 C34 150 44 140 60 140 C76 140 86 150 96 160" stroke="url(#${g})" stroke-width="6" fill="none"/>`
          + `<path d="M28 158 C18 170 26 184 16 196 L28 198 C36 186 40 172 34 160Z" fill="url(#${g})"/><path d="M92 158 C102 170 94 184 104 196 L92 198 C84 186 80 172 86 160Z" fill="url(#${g})"/><path d="M56 142 C52 160 62 178 54 196 L66 196 C70 178 66 160 64 142Z" fill="url(#${g})"/>`
          // smoky glass, then the magic inside it, then the glass's own shine on top
          + `<circle cx="60" cy="84" r="52" fill="#16131f" opacity=".55"/>`
          + `<g class="cbMagic" clip-path="url(#${g}k)"><circle class="cbCore" cx="60" cy="88" r="34" fill="url(#${g}c)" filter="url(#${g}b)"/>`
          + `<g class="cbSwirl"><ellipse cx="44" cy="74" rx="26" ry="14" fill="url(#${g}m)" filter="url(#${g}b)" transform="rotate(-30 44 74)"/><ellipse cx="78" cy="98" rx="24" ry="12" fill="url(#${g}n)" filter="url(#${g}b)" transform="rotate(25 78 98)"/><path d="M30 92 C40 70 70 66 82 80 C90 90 78 104 64 98" stroke="#fff" stroke-width="2" fill="none" opacity=".35" filter="url(#${g}b)"/></g>`
          + specks + `</g>`
          + `<circle class="cbFlash" cx="60" cy="84" r="50" fill="#fff"/>`
          + `<circle cx="60" cy="84" r="52" fill="url(#${g}o)"/>`
          + `<rect x="34" y="50" width="14" height="14" fill="#fff" opacity=".6" transform="rotate(-8 40 56)"/><path d="M94 96 C100 110 96 124 86 130" stroke="#fff" stroke-width="3" opacity=".4" fill="none"/>`;
      },
    },
  });
  LOOKS.forest.set = { theme: "moonwood", accent: "#8ff7e4", shelfMat: "moss", backdrop: "enchanted", lights: { style: "fireflies", colour: "warm", on: true }, headFont: "cormorant", ornament: { kind: "mushrooms", pos: "end" } };

  // ------------------------------------------------------------------ bookmarks for the reader, one to suit each look
  // Each is drawn in a 28 × 84 box; the top edge tucks under the top of the page.
  let bmN = 0;
  const RIB = "M7 0 H21 V80 L14 72 L7 80Z";
  const BOOKMARKS = {
    ribbon: { label: "Silk ribbon", draw: (g) => `<defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#a82a24"/><stop offset=".45" stop-color="#e0503f"/><stop offset=".6" stop-color="#c63a31"/><stop offset="1" stop-color="#9a241f"/></linearGradient></defs><path d="${RIB}" fill="url(#${g})"/><path d="M9 0 V78" stroke="#fff" stroke-width=".6" opacity=".25"/>` },
    velvet: { label: "Velvet & tassel", draw: (g) => `<defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#3d0710"/><stop offset=".5" stop-color="#7d1224"/><stop offset="1" stop-color="#3a0610"/></linearGradient></defs><rect x="7" y="0" width="14" height="58" fill="url(#${g})"/><rect x="6" y="56" width="16" height="5" rx="1.5" fill="#d4ad5a"/><path d="M11 61 L14 66 L17 61Z" fill="#b8913f"/>${Array.from({ length: 7 }, (_, k) => `<path d="M${11.5 + k * 0.8} 65 Q${10 + k * 1.3} 75 ${8 + k * 2} 84" stroke="${k % 2 ? "#e6c271" : "#b8913f"}" stroke-width=".9" fill="none"/>`).join("")}` },
    lace: { label: "Lace", draw: (g) => `<path d="M8 0 H20 V76 L14 70 L8 76Z" fill="#f6efe2"/>${Array.from({ length: 13 }, (_, k) => `<circle cx="7.5" cy="${3 + k * 5.6}" r="2.2" fill="#f6efe2"/><circle cx="20.5" cy="${3 + k * 5.6}" r="2.2" fill="#f6efe2"/><circle cx="14" cy="${4 + k * 5.6}" r="1.1" fill="#d9cdb8"/>`).join("")}<circle cx="14" cy="64" r="5" fill="#e7a3bd"/><circle cx="14" cy="64" r="2.4" fill="#c9708f"/><path d="M9 68 q-3 3 -4 1 M19 68 q3 3 4 1" stroke="#7d9a6a" stroke-width="1.6" fill="none"/>` },
    leather: { label: "Leather strap", draw: (g) => `<defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#5a3519"/><stop offset=".5" stop-color="#8d5a2e"/><stop offset="1" stop-color="#53301a"/></linearGradient></defs><path d="M6 0 H22 V74 L14 82 L6 74Z" fill="url(#${g})"/><path d="M8.5 0 V73 L14 78.5 L19.5 73 V0" stroke="#e4c48f" stroke-width=".8" stroke-dasharray="2.2 1.6" fill="none" opacity=".8"/><circle cx="14" cy="66" r="2" fill="#2e1a0c"/>` },
    brass: { label: "Brass filigree", draw: (g) => `<defs>${metal(g, BRASS)}</defs><path d="M10 0 Q10 -2 14 -2 Q18 -2 18 0 V8" stroke="url(#${g})" stroke-width="2" fill="none"/><path d="M11 6 H17 V60 L14 66 L11 60Z" fill="url(#${g})"/>${[14, 26, 38, 50].map((y) => `<path d="M14 ${y} l2.4 4 l-2.4 4 l-2.4 -4Z" fill="#3a2a10" opacity=".55"/>`).join("")}<circle cx="14" cy="72" r="7" fill="url(#${g})"/><circle cx="14" cy="72" r="4.4" fill="none" stroke="#5a421c" stroke-width=".9"/><path d="M14 69 l1 2.2 2.3.2 -1.8 1.5.6 2.3 -2.1 -1.3 -2.1 1.3.6 -2.3 -1.8 -1.5 2.3 -.2Z" fill="#5a421c"/>` },
    key: { label: "Old key", draw: (g) => `<defs>${metal(g, BRONZE)}</defs><rect x="11" y="0" width="6" height="30" fill="#1b1b22"/><path d="M11 30 L14 34 L17 30" fill="#1b1b22"/><circle cx="14" cy="42" r="7" fill="none" stroke="url(#${g})" stroke-width="3"/><circle cx="14" cy="42" r="2.4" fill="none" stroke="url(#${g})" stroke-width="1.2"/><rect x="12.6" y="48" width="2.8" height="30" fill="url(#${g})"/><path d="M15.4 70 h5 v3 h-2 v3 h3 v3 h-6Z" fill="url(#${g})"/><circle cx="14" cy="53" r="2" fill="url(#${g})"/>` },
    star: { label: "Star charm", draw: (g) => `<defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#101a3d"/><stop offset=".5" stop-color="#25367a"/><stop offset="1" stop-color="#0e1636"/></linearGradient><filter id="${g}b"><feGaussianBlur stdDeviation="1.6"/></filter></defs><rect x="8" y="0" width="12" height="58" fill="url(#${g})"/>${[[11, 8], [17, 17], [12, 29], [16, 41], [11, 51]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".8" fill="#fff" opacity=".8"/>`).join("")}<line x1="14" y1="58" x2="14" y2="63" stroke="#d9c27a" stroke-width="1"/><path d="M14 62 l2.6 5.6 6 .7 -4.5 4.1 1.3 6 -5.4 -3.1 -5.4 3.1 1.3 -6 -4.5 -4.1 6 -.7Z" fill="#ffe08a" filter="url(#${g}b)" opacity=".7"/><path d="M14 62 l2.6 5.6 6 .7 -4.5 4.1 1.3 6 -5.4 -3.1 -5.4 3.1 1.3 -6 -4.5 -4.1 6 -.7Z" fill="#f5d36b"/>` },
    fern: { label: "Pressed fern", draw: (g) => `<defs><filter id="${g}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter></defs><line x1="14" y1="0" x2="14" y2="14" stroke="#cfe0c0" stroke-width=".7"/><path d="M14 14 Q15 50 13 84" stroke="#9fe0a8" stroke-width="5" fill="none" opacity=".3" filter="url(#${g}b)"/><path d="M14 14 Q15 50 13 84" stroke="#4f7d3c" stroke-width="1.1" fill="none"/>${Array.from({ length: 11 }, (_, k) => { const y = 18 + k * 5.6, L = 9 - Math.abs(k - 4) * 0.9; return `<path d="M14.3 ${y} q${L * 0.6} -3 ${L} -1 q${-L * 0.5} 2.4 ${-L} 1Z M14 ${y + 2.4} q${-L * 0.6} -3 ${-L} -1 q${L * 0.5} 2.4 ${L} 1Z" fill="${k % 2 ? "#6c9e4f" : "#5b8c43"}"/>`; }).join("")}` },
    flower: { label: "Pressed flower", draw: (g) => `<line x1="14" y1="0" x2="14" y2="22" stroke="#d8c8a8" stroke-width=".7"/><path d="M14 22 Q13 52 15 84" stroke="#6a7d4c" stroke-width="1.1" fill="none"/><path d="M14 60 q-9 -2 -10 -10 q8 1 10 8Z M15 70 q9 -2 10 -10 q-8 1 -10 8Z" fill="#7b8f57"/>${Array.from({ length: 16 }, (_, k) => { const y = 24 + k * 2.3, r = 3.6 - k * 0.15; return `<circle cx="${(14 + Math.sin(k * 1.9) * (5 - k * 0.22)).toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${["#c8a6d8", "#b996cf", "#d9bde5", "#a987c4"][k % 4]}"/>`; }).join("")}` },
    tassel: { label: "Silk tassel", draw: (g) => `<defs><radialGradient id="${g}" cx=".35" cy=".35"><stop offset="0" stop-color="#c8f2d4"/><stop offset=".5" stop-color="#4fa877"/><stop offset="1" stop-color="#1f5a3c"/></radialGradient></defs><path d="M14 0 V42" stroke="#c4241a" stroke-width="2.4"/><circle cx="14" cy="48" r="5.6" fill="url(#${g})"/><path d="M11 54 h6 l-1 4 h-4Z" fill="#a51d14"/>${Array.from({ length: 9 }, (_, k) => `<path d="M${12 + k * 0.5} 58 Q${11 + k * 0.8} 70 ${9 + k * 1.25} 84" stroke="${k % 2 ? "#e0412f" : "#b5221a"}" stroke-width="1.1" fill="none"/>`).join("")}<rect x="11" y="61" width="6" height="2.4" rx="1" fill="#d6a73e"/>` },
    seal: { label: "Wax seal", draw: (g) => `<defs><radialGradient id="${g}" cx=".38" cy=".35"><stop offset="0" stop-color="#d6463c"/><stop offset=".7" stop-color="#9c1f1a"/><stop offset="1" stop-color="#6b120f"/></radialGradient></defs><rect x="9" y="0" width="10" height="62" fill="#5a1f1a"/><rect x="10.5" y="0" width="1" height="62" fill="#fff" opacity=".15"/><path d="M14 58 m-10 0 q2 -9 10 -10 q9 1 10 9 q-1 10 -10 11 q-9 -1 -10 -10Z" fill="url(#${g})"/><circle cx="14" cy="59" r="6" fill="none" stroke="#6b120f" stroke-width="1.1"/><path d="M11.5 61.5 L14 55 L16.5 61.5 M12.3 59.5 H15.7" stroke="#6b120f" stroke-width="1.1" fill="none"/>` },
  };
  const bookmarkSvg = (kind, w = 28) => { const b = BOOKMARKS[kind] || BOOKMARKS.ribbon; return `<svg viewBox="0 -3 28 87" width="${w}" height="${(w * 87) / 28}" aria-hidden="true" overflow="visible">${b.draw("bm" + bmN++)}</svg>`; };
  const BM = { minimal: "ribbon", cabin: "leather", nook: "flower", library: "seal", loft: "leather", starry: "star", cottage: "lace", candle: "seal", vampire: "velvet", victorian: "brass", castle: "key", bordello: "velvet", forest: "fern", academia: "brass", teahouse: "tassel" };
  for (const [k, L] of Object.entries(LOOKS)) L.set.bookmark = BM[k] || "ribbon";

  /** Moving pieces that live inside the backdrop layer (falling stars, floating motes). */
  function backdropFx(kind) {
    let out = "", r = 3; const R = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    if (kind === "meteors") {
      for (let i = 0; i < 6; i++) out += `<i class="meteor" style="--x:${(25 + R() * 80).toFixed(1)}%;--y:${(R() * 45).toFixed(1)}%;--a:${(148 + R() * 18).toFixed(0)}deg;--t:${(9 + R() * 9).toFixed(1)}s;--d:${(i * 2.3 + R() * 2).toFixed(1)}s;--l:${(90 + R() * 110).toFixed(0)}px"></i>`;
      for (let i = 0; i < 14; i++) out += `<i class="twinkle" style="left:${(R() * 100).toFixed(1)}%;top:${(R() * 70).toFixed(1)}%;--t:${(2.5 + R() * 4).toFixed(1)}s;--d:${(R() * 4).toFixed(1)}s"></i>`;
    } else if (kind === "motes") {
      for (let i = 0; i < 26; i++) {
        const warm = R() > 0.4;
        out += `<i class="mote" style="left:${(R() * 100).toFixed(1)}%;top:${(15 + R() * 85).toFixed(1)}%;--c:${warm ? "#ffd977" : "#8ff7e4"};--s:${(2 + R() * 3.5).toFixed(1)}px;--t:${(9 + R() * 12).toFixed(1)}s;--p:${(2 + R() * 3).toFixed(1)}s;--d:-${(R() * 20).toFixed(1)}s;--dx:${((R() - 0.5) * 90).toFixed(0)}px;--dy:${(-40 - R() * 120).toFixed(0)}px"></i>`;
      }
    }
    return out;
  }

  MATERIALS.whitewashWood = { label: "Whitewashed", base: "#d9cfc0", tex: () => grainH(0.3, 0.2) };

  window.Decor = { BACKDROPS, MATERIALS, LIGHT_STYLES, LIGHT_COLOURS, HEAD_FONTS, PALETTES, LOOKS, LOOK_KEYS, ORNAMENTS, lightsEl, ornamentEl, backdropFx, BOOKMARKS, bookmarkSvg };
})();
