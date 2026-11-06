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
  const LIGHT_STYLES = { none: "None", fairy: "Fairy lights", globe: "Globe bulbs", stars: "Little stars" };
  const LIGHT_COLOURS = { warm: ["Warm", "#ffc46b"], white: ["Soft white", "#fff1d6"], multi: ["Party", null], pink: ["Pink", "#ff8fc3"], blue: ["Ice blue", "#9fd6ff"], green: ["Fern", "#a9f08d"] };
  const MULTI = ["#ff6b6b", "#ffd166", "#5be3a5", "#5cc8f5", "#c792ff"];
  let lid = 0;
  /** A string of lights draped under a shelf `w` pixels wide. */
  function lightsEl(w, cfg) {
    const style = cfg.style || "none"; if (style === "none") return null;
    const on = !!cfg.on, col = LIGHT_COLOURS[cfg.colour] || LIGHT_COLOURS.warm;
    const colour = (i) => col[1] || MULTI[i % MULTI.length];
    const sag = style === "globe" ? 24 : 18, span = style === "globe" ? 190 : 130;
    const n = Math.max(2, Math.round(w / span)), L = w / n, H = sag + (style === "globe" ? 34 : 18);
    const id = "lg" + lid++;
    const q = (x0, t) => { const x1 = x0 + L, cx = x0 + L / 2, cy = 2 + sag * 2, u = 1 - t; return { x: u * u * x0 + 2 * u * t * cx + t * t * x1, y: u * u * 2 + 2 * u * t * cy + t * t * 2 }; };
    let wire = "M0 2", bulbs = "", k = 0;
    for (let s = 0; s < n; s++) {
      const x0 = s * L; wire += ` Q${(x0 + L / 2).toFixed(1)} ${2 + sag * 2} ${(x0 + L).toFixed(1)} 2`;
      const ts = style === "globe" ? [0.27, 0.73] : style === "stars" ? [0.2, 0.5, 0.8] : [0.12, 0.31, 0.5, 0.69, 0.88];
      for (const t of ts) {
        const p = q(x0, t), c = colour(k), d = ((k * 0.73) % 3).toFixed(2);
        if (style === "globe") {
          bulbs += `<g class="bulb" style="--d:${d}s"><line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="${p.y + 9}" stroke="#2a2420" stroke-width="1.4"/><rect x="${p.x - 2.6}" y="${p.y + 8}" width="5.2" height="5" rx="1" fill="#3a332d"/>`
            + `<circle class="halo" cx="${p.x}" cy="${p.y + 20}" r="16" fill="${c}" filter="url(#${id})"/><circle class="glass" cx="${p.x}" cy="${p.y + 20}" r="8" fill="${on ? c : "rgba(255,255,255,.2)"}" stroke="rgba(255,255,255,.45)" stroke-width=".8"/>`
            + `<path class="filament" d="M${p.x - 2.5} ${p.y + 21} q2.5 -4 5 0" stroke="${on ? "#fff7e0" : "rgba(80,70,60,.6)"}" stroke-width="1" fill="none"/></g>`;
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
  };

  // ------------------------------------------------------------------ cozy palettes and ready-made looks
  const PALETTES = {
    cabin: { label: "Cabin", t: ["#1d140e", "#f3e7d6", "#271b13", "#2b1f16", "#30231a", "#a8927b", "#3d2d21", "#3a2b20", "#4d3a2b", "dark"] },
    candle: { label: "Candle", t: ["#160f0a", "#f6e6cf", "#20160f", "#241912", "#2a1d14", "#a99075", "#38291d", "#35271c", "#4a3726", "dark"] },
    moss: { label: "Moss", t: ["#121a14", "#ebe7d6", "#19231b", "#1c271e", "#202c22", "#97a08a", "#2b382d", "#28362a", "#3a4a3c", "dark"] },
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
  MATERIALS.whitewashWood = { label: "Whitewashed", base: "#d9cfc0", tex: () => grainH(0.3, 0.2) };

  window.Decor = { BACKDROPS, MATERIALS, LIGHT_STYLES, LIGHT_COLOURS, HEAD_FONTS, PALETTES, LOOKS, LOOK_KEYS, lightsEl };
})();
