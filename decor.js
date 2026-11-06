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
    el.className = "ornament" + (lit ? " lit" : "");
    el.style.width = w + "px"; el.style.height = h + "px";
    if (o.soft) el.classList.add("soft");
    el.innerHTML = `<div class="ornGlow"${o.glow ? ` style="background:radial-gradient(closest-side, ${o.glow}, transparent)"` : ""}></div><svg viewBox="0 0 ${o.vw} 200" width="${w}" height="${h}" aria-hidden="true">${o.draw("orn" + ornN++)}</svg>`;
    // where the glow sits: the highest flame
    const ys = [...o.draw("x").matchAll(/data-y="([\d.]+)"/g)].map((m) => +m[1]);
    el.style.setProperty("--fy", (Math.min(...ys) / 200 * 100).toFixed(1) + "%");
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
  const ORN = { forest: "mushrooms", cottage: "pinkLamp", nook: "bracketLantern", vampire: "candelabra", victorian: "twist", castle: "pillars", bordello: "chamber", academia: "squareBrass" };
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
    draw: (g) => {
      const caps = [[34, 196, 20, 46, "#8ff7e4"], [70, 196, 26, 70, "#a8f0ff"], [98, 196, 14, 34, "#ffc7ef"], [52, 196, 10, 24, "#b9fff0"]];
      return `<defs><filter id="${g}b" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6"/></filter></defs><g data-y="120"></g>`
        + `<path d="M4 200 C10 188 30 186 60 188 C90 186 110 188 116 200Z" fill="#3c6a36"/><path d="M8 196 C30 190 90 190 112 196" stroke="#6fa452" stroke-width="2" fill="none"/>`
        + caps.map(([x, y, r, h, c]) => `<path d="M${x - r * 0.16} ${y} C${x - r * 0.2} ${y - h * 0.5} ${x - r * 0.12} ${y - h + 6} ${x} ${y - h + 4} C${x + r * 0.12} ${y - h + 6} ${x + r * 0.2} ${y - h * 0.5} ${x + r * 0.16} ${y}Z" fill="#e6f4ef"/>`
          + `<ellipse class="litOnly" cx="${x}" cy="${y - h + 2}" rx="${r * 1.5}" ry="${r}" fill="${c}" filter="url(#${g}b)"/>`
          + `<path d="M${x - r} ${y - h + 6} C${x - r} ${y - h - r * 0.9} ${x + r} ${y - h - r * 0.9} ${x + r} ${y - h + 6} Q${x} ${y - h + 1} ${x - r} ${y - h + 6}Z" fill="#cfe9e2"/>`
          + `<path class="litOnly" d="M${x - r} ${y - h + 6} C${x - r} ${y - h - r * 0.9} ${x + r} ${y - h - r * 0.9} ${x + r} ${y - h + 6} Q${x} ${y - h + 1} ${x - r} ${y - h + 6}Z" fill="${c}"/>`
          + `<circle cx="${x - r * 0.4}" cy="${y - h - r * 0.2}" r="${r * 0.12}" fill="#fff" opacity=".8"/><circle cx="${x + r * 0.3}" cy="${y - h - r * 0.35}" r="${r * 0.09}" fill="#fff" opacity=".7"/>`).join("");
    },
  };
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
