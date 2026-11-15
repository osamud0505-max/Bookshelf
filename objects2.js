/* v431 (osamu, 2026-11-15): eighteen new painted objects from osamu's Gemini pictures (keyed off green, scratchpad n18/key.py).
   Candles light with a real flame and a code-lit warm twin of the picture (n18/lit.py); the lamps glow through their
   shades; the pink lamp's pull chain is its switch; the spirit in the jar floats; the skull hourglass runs its sand and is
   turned over with a tap; the grimoire skeleton's googly eyes wobble; gems glint now and then. */
(() => {
  "use strict";
  const D = window.Decor; if (!D) return;
  const f1 = (v) => +v.toFixed(2);
  const P = (n) => `obj/${n}.webp`;
  const pic = (n, vw, cls = "", x = 0, y = 0, w = vw, h = 200) => `<image${cls ? ` class="${cls}"` : ""} href="${P(n)}" x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" preserveAspectRatio="none"/>`;
  // a 4-point glint that flashes now and then (gems, crystals)
  const glint = (x, y, s, d, t = 4.2, cls = "o2Gl") => `<path class="${cls}" style="--d:${d}s;--t:${t}s" d="M${x} ${f1(y - 3 * s)} Q${f1(x + 0.35 * s)} ${f1(y - 0.35 * s)} ${f1(x + 3 * s)} ${y} Q${f1(x + 0.35 * s)} ${f1(y + 0.35 * s)} ${x} ${f1(y + 3 * s)} Q${f1(x - 0.35 * s)} ${f1(y + 0.35 * s)} ${f1(x - 3 * s)} ${y} Q${f1(x - 0.35 * s)} ${f1(y - 0.35 * s)} ${x} ${f1(y - 3 * s)}Z" fill="#fff"/>`;
  const flame = (x, y, s = 1) => `<circle class="ember" cx="${x}" cy="${y - 0.5}" r="${1.4 * s}" fill="#ff7a2a"/><g class="ornFlame" data-x="${x}" data-y="${y}"><g class="ornFlicker"><ellipse cx="${x}" cy="${y - 9 * s}" rx="${5 * s}" ry="${11 * s}" fill="#ffb347" opacity=".5"/><path d="M${x} ${y - 20 * s} C${x + 6 * s} ${y - 12 * s} ${x + 5 * s} ${y - 2 * s} ${x} ${y} C${x - 5 * s} ${y - 2 * s} ${x - 6 * s} ${y - 12 * s} ${x} ${y - 20 * s}Z" fill="url(#oFlameG)"/><path d="M${x} ${y - 13 * s} C${x + 2.6 * s} ${y - 9 * s} ${x + 2.2 * s} ${y - 3 * s} ${x} ${y - 1.5 * s} C${x - 2.2 * s} ${y - 3 * s} ${x - 2.6 * s} ${y - 9 * s} ${x} ${y - 13 * s}Z" fill="#fffbe6"/><ellipse cx="${x}" cy="${y - 1}" rx="${1.6 * s}" ry="${2.4 * s}" fill="#5a7cff" opacity=".55"/></g></g>`;
  const base = { flat: true, o2: true };

  // ---- things that just stand there (painted shadows were green and keyed away; the 3D light casts their shadows)
  const still = (label, name, vw, scale, extra = "") => ({ ...base, label, scale, vw, still: true, img: P(name), draw: () => pic(name, vw) + extra });
  D.ORNAMENTS.o2WitchHat = still("Stained-glass witch hat", "o2-witch-hat", 182.81, 0.6);
  D.ORNAMENTS.o2Potions = still("Potion bottles", "o2-potions", 230.63, 0.78);
  D.ORNAMENTS.o2Medical = still("Old medicine set", "o2-medical", 223.75, 0.5);
  D.ORNAMENTS.o2Garlic = still("Garlic and stake", "o2-garlic-stake", 307.62, 0.3);
  D.ORNAMENTS.o2Suitcase = still("Apothecary case", "o2-suitcase", 227.19, 0.62);
  D.ORNAMENTS.o2SpiderBottle = still("Spider potion", "o2-spider-bottle", 108.44, 0.78, glint(37.6, 12.6, 1.5, -1.2, 5.2));
  D.ORNAMENTS.o2Goblet = still("Blood goblet", "o2-goblet", 105, 0.6,
    glint(44.4, 36.8, 1.7, -0.4, 4.6) + glint(5.8, 32.6, 1.2, -2.6, 5.8) + glint(94.2, 34.8, 1.2, -3.9, 6.4) + glint(30.4, 182.4, 1.3, -1.8, 5.4) + glint(67.6, 183, 1.3, -4.4, 6.1));

  // ---- candles: the picture, its warm lit twin, and a live flame on every wick (tap = strike a match / blow it out)
  const candle = (label, name, vw, scale, flames) => ({ ...base, label, scale, vw, o2c: true, img: P(name), flames,
    draw: () => pic(name, vw) + pic(name + "-lit", vw, "litOnly o2Wax") + flames.map(([x, y, s]) => flame(x, y, s)).join("") });
  D.ORNAMENTS.o2MeltedTrio = candle("Melted pillar candles", "o2-melted-trio", 157.19, 0.68, [[47.3, 59, 0.85], [77.2, 4, 0.95], [108.9, 31, 0.85]]);
  D.ORNAMENTS.o2MeltedBlock = candle("Candles on a block", "o2-melted-block", 228.75, 0.62, [[73.3, 23, 0.8], [94.4, 4.5, 0.9], [125.6, 35, 0.8]]);
  D.ORNAMENTS.o2SkullCandle = candle("Skull candle", "o2-skull-candle", 160.31, 0.6, [[84.4, 7, 1.1]]);
  D.ORNAMENTS.o2Candelabra = candle("Bleeding candelabra", "o2-candelabra", 92.81, 0.95, [[9.8, 29, 0.62], [45.6, 4.5, 0.66], [82.2, 34, 0.62]]);
  D.ORNAMENTS.o2GhostCandle = candle("Ghost candle", "o2-ghost-candle", 155.62, 0.5, [[76.7, 5, 0.95]]);

  // the grimoire: its candle lights, and the skeleton's googly eyes wobble whenever it is touched or moved
  const EYES = [[77.2, 23.4, 4.6, 2.1, 1], [93.1, 40.2, 4.3, 2.0, -1]];
  D.ORNAMENTS.o2Grimoire = { ...candle("Grimoire and skeleton", "o2-grimoire", 174.06, 0.82, [[121.8, 85, 0.72]]) };
  {
    const o = D.ORNAMENTS.o2Grimoire, d0 = o.draw;
    o.draw = (g) => d0(g) + `<defs><radialGradient id="${g}ew" cx=".42" cy=".36" r=".7"><stop offset="0" stop-color="#fffdf8"/><stop offset=".7" stop-color="#ece8df"/><stop offset="1" stop-color="#b9b2a4"/></radialGradient></defs>`
      + EYES.map(([x, y, r, pr, dir], i) => `<circle cx="${x}" cy="${y}" r="${f1(r - 0.25)}" fill="url(#${g}ew)"/>`
        + `<g class="o2Pupil" style="transform-origin:${x}px ${y}px;--dir:${dir}"><circle cx="${x}" cy="${f1(y + r - pr - 0.45)}" r="${pr}" fill="#5d5a55"/><circle cx="${x}" cy="${f1(y + r - pr - 0.45)}" r="${f1(pr * 0.55)}" fill="#141210"/><circle cx="${f1(x - pr * 0.3)}" cy="${f1(y + r - pr - 0.45 - pr * 0.35)}" r="${f1(pr * 0.2)}" fill="#fff" opacity=".7"/></g>`).join("");
    o.mount = (el) => {
      const wob = () => { el.classList.remove("o2Wob"); void el.offsetWidth; el.classList.add("o2Wob"); clearTimeout(el._wob); el._wob = setTimeout(() => el.classList.remove("o2Wob"), 2000); };
      el.addEventListener("click", wob);
    };
  }

  // ---- lamps: the shade lights from inside (code-lit twin of osamu's picture), a wide warm glow behind
  const lampToggle = (el, off) => {
    if (window.ShelfSfx && window.ShelfSfx.pull) window.ShelfSfx.pull(!off);
    el.classList.toggle("lit", !off);
  };
  const lamp = (label, name, vw, scale, glow, gy, extra = "") => ({ ...base, label, scale, vw, glow, o2l: true, img: P(name),
    toggle: lampToggle, draw: () => `<g data-y="${gy}"></g>` + pic(name, vw) + pic(name + "-lit", vw, "litOnly") + extra });
  D.ORNAMENTS.o2TulipLamp = lamp("Beaded tulip lamp", "o2-tulip-lamp", 74.06, 1.0, "rgba(255,190,110,.5)", 60);
  D.ORNAMENTS.o2DomeLamp = lamp("Lilac dome lamp", "o2-dome-lamp", 92.19, 1.0, "rgba(225,170,255,.46)", 44,
    [[8, 108, 1], [11, 114, -2.1], [36, 113, -1.3], [42, 101, -3.2], [77, 110, -0.7], [82, 106, -2.8], [86, 99, -4.1]].map(([x, y, d]) => glint(x, y, 1.1, d, 3.6, "o2Gl o2GlLit")).join(""));
  // the pink lamp: the bead chain hangs free so a tap tugs it, then the light comes on
  D.ORNAMENTS.o2PinkLamp = { ...lamp("Pink crystal lamp", "o2-pink-lamp2", 131.25, 0.95, "rgba(255,160,190,.5)", 36), img: P("o2-pink-lamp") };
  {
    const o = D.ORNAMENTS.o2PinkLamp, d0 = o.draw;
    o.draw = (g) => d0(g) + `<g class="o2Chain">${pic("o2-pink-chain", 6.875, "", 50, 103.75, 6.875, 44.06)}</g>`
      + [[9, 92, -0.5], [22, 99, -2.4], [43, 103, -1.4], [60, 107, -3.3], [78, 101, -0.9], [99, 102, -2.9], [113, 96, -1.9], [124, 88, -3.8]].map(([x, y, d]) => glint(x, y, 1.2, d, 3.4, "o2Gl o2GlLit")).join("");
    o.toggle = (el, off) => {
      el.classList.remove("o2Tug"); void el.offsetWidth; el.classList.add("o2Tug");
      if (window.ShelfSfx && window.ShelfSfx.pull) window.ShelfSfx.pull(!off);
      setTimeout(() => el.classList.toggle("lit", !off), 170);
      setTimeout(() => el.classList.remove("o2Tug"), 900);
    };
  }

  // ---- the spirit jar: awake (lit) it floats and glows with drifting motes; tapped, it settles down to sleep
  {
    const motes = Array.from({ length: 11 }, (_, i) => { const x = 22 + ((i * 37) % 76), y = 95 + ((i * 53) % 80); return `<circle class="o2Mote" cx="${x}" cy="${y}" r="${f1(0.5 + (i % 3) * 0.25)}" fill="#e8f6ff" style="--d:${f1(-i * 0.73)}s;--t:${f1(4.5 + (i % 4) * 0.9)}s"/>`; }).join("");
    D.ORNAMENTS.o2GhostJar = { ...base, label: "Spirit in a jar", scale: 0.7, vw: 124.38, soft: true, glow: "rgba(160,215,255,.4)", img: P("o2-ghost-jar"),
      draw: (g) => `<g data-y="110"></g><defs><radialGradient id="${g}gh"><stop offset="0" stop-color="#cfeeff" stop-opacity=".55"/><stop offset=".55" stop-color="#9fd2ff" stop-opacity=".2"/><stop offset="1" stop-color="#9fd2ff" stop-opacity="0"/></radialGradient></defs>`
        + pic("o2-ghost-jar-empty", 124.38)
        + `<g class="o2Spirit"><ellipse class="o2Halo" cx="54.5" cy="124" rx="40" ry="50" fill="url(#${g}gh)"/>${pic("o2-ghost-spirit", 67.81, "", 20.63, 75, 67.81, 104.38)}</g><g class="o2Motes">${motes}</g>` };
  }

  // ---- the skull hourglass: sand (drawn behind the glass, so the skull and bones stay in front) runs for a minute;
  // a tap turns it over and the sand starts again
  {
    const prof = [[48, 30], [60, 27], [70, 22], [80, 14], [90, 6], [99, 2.2], [108, 6], [118, 15], [128, 23], [140, 30], [152, 33], [162, 33]];
    const side = (pts, k) => pts.map(([y, w]) => `${f1(45 + k * Math.max(0.6, w - 1.6))} ${y}`);
    const top = prof.filter(([y]) => y <= 99), bot = prof.filter(([y]) => y >= 99);
    const poly = (pts) => "M" + [...side(pts, -1), ...side(pts.slice().reverse(), 1)].join(" L") + "Z";
    D.ORNAMENTS.o2Hourglass = { ...base, label: "Skull hourglass", scale: 0.72, vw: 89.38, img: P("o2-skull-hourglass"),
      draw: (g) => `<defs><clipPath id="${g}ht"><path d="${poly(top)}"/></clipPath><clipPath id="${g}hb"><path d="${poly(bot)}"/></clipPath>`
        + `<linearGradient id="${g}hs" x1="0" x2="1"><stop offset="0" stop-color="#8f8273"/><stop offset=".35" stop-color="#d8ccb6"/><stop offset=".7" stop-color="#c4b79f"/><stop offset="1" stop-color="#7d7062"/></linearGradient></defs>`
        + `<g class="o2Sand"><g clip-path="url(#${g}ht)"><path class="o2SandT" d="M-10 0 L39 0 Q45 7 51 0 L100 0 L100 120 L-10 120Z" fill="url(#${g}hs)"/></g>`
        + `<line class="o2Stream" x1="45" y1="98" x2="45" y2="161" stroke="#d2c6af" stroke-width=".8" stroke-dasharray="2.2 1.2"/>`
        + `<g clip-path="url(#${g}hb)"><path class="o2SandB" d="M-10 7 Q45 -3 100 7 L100 80 L-10 80Z" fill="url(#${g}hs)"/></g></g>`
        + pic("o2-skull-hourglass2", 89.38),
      mount: (el) => { el.classList.add("o2Run"); el.style.setProperty("--hgd", (-Math.random() * 40).toFixed(1) + "s"); },
      toggle: (el) => {
        if (el.classList.contains("o2Turn")) return;
        el.classList.add("o2Turn");
        setTimeout(() => { el.classList.remove("o2Run"); el.style.setProperty("--hgd", "0s"); void el.offsetWidth; el.classList.add("o2Run"); }, 600);
        setTimeout(() => el.classList.remove("o2Turn"), 1250);
      } };
  }

  // v434: where each light comes from (picture units) and how it lights the 3D shelf: colour, strength, flicker
  const LIGHT = {
    o2TulipLamp: { pts: [[37, 62]], color: "#ffb36e", power: 17000, reach: 1.9, pool: 0.55, poolW: 1.8 },
    o2DomeLamp: { pts: [[46, 45]], color: "#f2b8ff", power: 15000, reach: 1.9, pool: 0.5, poolW: 1.8 },
    o2PinkLamp: { pts: [[65, 40]], color: "#ffaac2", power: 16000, reach: 1.9, pool: 0.55, poolW: 2 },
    o2GhostJar: { pts: [[54, 125]], color: "#a9d9ff", power: 3500, reach: 1.1, pool: 0.3, poolW: 1 },
  };
  for (const [k, o] of Object.entries(D.ORNAMENTS)) {
    if (!o.o2) continue;
    if (LIGHT[k]) o.light = LIGHT[k];
    else if (o.flames) o.light = { pts: o.flames.map(([x, y]) => [x, y - 8]), color: "#ffa04d", power: 5200 + 1600 * o.flames.length, reach: 1.5, pool: 0.4, poolW: 1.2, flick: true };
  }

  // v433 (osamu: "they still look like they're floating"): a dark footprint hugging each base (n18/foot.py, the closet
  // objects' shadowgen style), drawn under the picture; it stays in 3D and is left out of the 3D silhouette
  const FOOT = {"o2-tulip-lamp":[-14.06,102.19,204.69],"o2-dome-lamp":[-14.06,120.31,204.69],"o2-pink-lamp":[-15.0,161.25,205.0],"o2-spider-bottle":[-17.81,144.06,205.94],"o2-witch-hat":[-23.12,229.06,207.5],"o2-ghost-jar":[-19.69,163.75,206.56],"o2-potions":[-17.81,266.25,205.94],"o2-medical":[-27.5,278.75,209.17],"o2-garlic-stake":[-45.71,399.05,214.29],"o2-grimoire":[-17.19,208.44,205.62],"o2-suitcase":[-22.19,271.56,207.19],"o2-skull-hourglass":[-19.38,128.12,206.25],"o2-goblet":[-23.12,151.25,207.5],"o2-melted-trio":[-20.31,197.81,206.56],"o2-melted-block":[-22.19,273.12,207.19],"o2-skull-candle":[-23.12,206.56,207.5],"o2-candelabra":[-15.0,122.81,205.0],"o2-ghost-candle":[-26.56,208.75,208.44]};
  for (const o of Object.values(D.ORNAMENTS)) {
    if (!o.o2) continue;
    const n = o.img.slice(4, -5), f = FOOT[n]; if (!f) continue;
    const d0 = o.draw;
    o.draw = (g) => `<image class="o2Foot" href="obj/${n}-foot.png" x="${f[0]}" y="0" width="${f[1]}" height="${f[2]}" preserveAspectRatio="none"/>` + d0(g);
  }

  // every new object: in 3D it stands on the books' foot line, like the other painted objects
  const mk = D.ornamentEl;
  D.ornamentEl = function (kind, H, lit, thumb) {
    const el = mk(kind, H, lit, thumb), o = D.ORNAMENTS[kind];
    if (el && o && o.o2) { el.classList.add("o2"); if (o.o2c) el.classList.add("o2c"); if (o.o2l) el.classList.add("o2l"); }
    return el;
  };
})();
