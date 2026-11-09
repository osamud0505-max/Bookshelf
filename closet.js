/* The princess closet: a pink lacquered walk-in closet with a plaid back wall, a chrome rod under every shelf with clear
   hangers and satin clothes, and desk things on the shelves: a handbag, a pencil cup with pens and a lipstick, a stack of
   gift boxes and three shopping bags. The room is drawn here; the rod, hangers, clothes and objects are cosy game art pictures in obj/. */
(() => {
  "use strict";
  const D = window.Decor;
  if (!D) return;
  const rng = (seed) => () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const f1 = (n) => Math.round(n * 10) / 10;
  const hex = (c) => { if (c.length === 4) c = "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]; return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); };
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
  const grad = (id, stops, x2 = 1, y2 = 0) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ""}/>`).join("")}</linearGradient>`;
  const GOLD = [[0, "#6e4a12"], [0.3, "#c9973a"], [0.48, "#f6dc8a"], [0.62, "#d7a849"], [1, "#6a4410"]];

  /** A little five-point crown with balls on its points and a band with gems. */
  const crown = (cx, cy, s, fill, gem = "#ff5fae") => {
    const P = (x, y) => `${f1(cx + x * s)} ${f1(cy + y * s)}`;
    return `<path d="M${P(-1, 0.55)} L${P(-1.12, -0.42)} L${P(-0.52, 0.06)} L${P(0, -0.78)} L${P(0.52, 0.06)} L${P(1.12, -0.42)} L${P(1, 0.55)} Z" fill="${fill}"/>`
      + `<rect x="${f1(cx - 1.02 * s)}" y="${f1(cy + 0.42 * s)}" width="${f1(2.04 * s)}" height="${f1(0.34 * s)}" rx="${f1(0.08 * s)}" fill="${fill}"/>`
      + [[-1.12, -0.42], [0, -0.78], [1.12, -0.42]].map(([x, y]) => `<circle cx="${f1(cx + x * s)}" cy="${f1(cy + y * s - 0.12 * s)}" r="${f1(0.15 * s)}" fill="${fill}"/>`).join("")
      + `<circle cx="${f1(cx)}" cy="${f1(cy + 0.59 * s)}" r="${f1(0.11 * s)}" fill="${gem}"/><circle cx="${f1(cx - 0.6 * s)}" cy="${f1(cy + 0.59 * s)}" r="${f1(0.08 * s)}" fill="#9fe3ff"/><circle cx="${f1(cx + 0.6 * s)}" cy="${f1(cy + 0.59 * s)}" r="${f1(0.08 * s)}" fill="#9fe3ff"/>`
      + `<circle cx="${f1(cx)}" cy="${f1(cy - 0.1 * s)}" r="${f1(0.12 * s)}" fill="${gem}"/>`;
  };

  // ------------------------------------------------------------------ the room
  let roomUrl = "";
  const closetRoom = () => {
    if (roomUrl) return roomUrl;
    const R = rng(311);
    const defs = `<pattern id="cPl" width="96" height="96" patternUnits="userSpaceOnUse">`
      + `<rect width="96" height="96" fill="#7a1150"/>`
      + `<rect y="30" width="96" height="30" fill="#4e0833" opacity=".5"/><rect x="30" width="30" height="96" fill="#4e0833" opacity=".5"/>`
      + `<rect width="96" height="11" fill="#b02c78" opacity=".38"/><rect width="11" height="96" fill="#b02c78" opacity=".38"/>`
      + `<rect y="44" width="96" height="2" fill="#24082f" opacity=".55"/><rect x="44" width="2" height="96" fill="#24082f" opacity=".55"/>`
      + `<rect y="76" width="96" height="1.2" fill="#ff9ad0" opacity=".35"/><rect x="76" width="1.2" height="96" fill="#ff9ad0" opacity=".35"/>`
      + `<rect y="19" width="96" height=".8" fill="#ffd1ea" opacity=".22"/><rect x="19" width=".8" height="96" fill="#ffd1ea" opacity=".22"/></pattern>`
      // woven twill over the tartan
      + `<pattern id="cTw" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 4 L4 0" stroke="#000" stroke-width=".7" opacity=".14"/></pattern>`
      + grad("cSideL", [[0, "#a3105f"], [0.35, "#e2479b"], [0.55, "#f37ab8"], [0.7, "#c92a7f"], [1, "#6e0a42"]])
      + grad("cSideR", [[0, "#6e0a42"], [0.3, "#c92a7f"], [0.45, "#ef6cb0"], [0.65, "#d8398e"], [1, "#94105a"]])
      + grad("cCeil", [[0, "#3d0628"], [1, "#6a0f45"]], 0, 1)
      + grad("cFloor", [[0, "#c22a7c"], [0.4, "#e2509f"], [1, "#8c0d55"]], 0, 1)
      + grad("cFasc", [[0, "#f590c6"], [0.18, "#e04898"], [0.7, "#b81c6c"], [1, "#7c0c48"]], 0, 1)
      + grad("cFrame", [[0, "#8c0d55"], [0.4, "#ef6cb0"], [0.6, "#e04898"], [1, "#9c1362"]])
      + grad("cGold", GOLD, 0, 1)
      + `<radialGradient id="cLamp" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#ffd8ee" stop-opacity=".5"/><stop offset=".35" stop-color="#ff9fd2" stop-opacity=".18"/><stop offset="1" stop-color="#ff9fd2" stop-opacity="0"/></radialGradient>`
      + `<radialGradient id="cVig" cx=".5" cy=".38" r=".8"><stop offset=".45" stop-color="#1a0312" stop-opacity="0"/><stop offset="1" stop-color="#1a0312" stop-opacity=".62"/></radialGradient>`
      + `<filter id="cBl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>`
      + `<filter id="cBl2" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="2.2"/></filter>`;
    // the back wall and the closet's inside: ceiling with a little lamp, lacquered sides and a glossy floor
    const BW = [44, 74, 356, 802];
    let wall = `<rect x="${BW[0]}" y="${BW[1]}" width="${BW[2] - BW[0]}" height="${BW[3] - BW[1]}" fill="url(#cPl)"/><rect x="${BW[0]}" y="${BW[1]}" width="${BW[2] - BW[0]}" height="${BW[3] - BW[1]}" fill="url(#cTw)"/>`
      + `<ellipse cx="200" cy="${BW[1]}" rx="230" ry="380" fill="url(#cLamp)"/>`
      // the corners where the sides meet the back are in shadow
      + `<rect x="${BW[0]}" y="${BW[1]}" width="26" height="${BW[3] - BW[1]}" fill="#1a0312" opacity=".32" filter="url(#cBl)"/><rect x="${BW[2] - 26}" y="${BW[1]}" width="26" height="${BW[3] - BW[1]}" fill="#1a0312" opacity=".32" filter="url(#cBl)"/>`
      + `<rect x="${BW[0]}" y="${BW[1]}" width="${BW[2] - BW[0]}" height="20" fill="#1a0312" opacity=".4" filter="url(#cBl)"/>`;
    const ceil = `<path d="M0 0 H400 L${BW[2]} ${BW[1]} H${BW[0]}Z" fill="url(#cCeil)"/>`
      + `<ellipse cx="200" cy="52" rx="20" ry="4.5" fill="#d8c7d2"/><ellipse cx="200" cy="52.6" rx="15" ry="3" fill="#fff6fb"/><ellipse cx="200" cy="56" rx="60" ry="14" fill="#ffd3ec" opacity=".35" filter="url(#cBl)"/>`;
    const sides = `<path d="M0 0 L${BW[0]} ${BW[1]} V${BW[3]} L0 860Z" fill="url(#cSideL)"/><path d="M400 0 L${BW[2]} ${BW[1]} V${BW[3]} L400 860Z" fill="url(#cSideR)"/>`
      // lacquer catches the lamp: a long soft streak down each side and a crisp line on the edge
      + `<path d="M14 40 L24 52 V780 L14 820Z" fill="#fff" opacity=".2" filter="url(#cBl2)"/><path d="M380 50 L372 60 V780 L380 812Z" fill="#fff" opacity=".14" filter="url(#cBl2)"/>`
      + `<path d="M${BW[0]} ${BW[1]} V${BW[3]}" stroke="#ff9ad0" stroke-width="1" opacity=".5"/><path d="M${BW[2]} ${BW[1]} V${BW[3]}" stroke="#ff9ad0" stroke-width="1" opacity=".4"/>`;
    // a few hooks on the sides with a pearl necklace and a ribbon hanging from them
    let pearls = ""; for (let i = 0; i <= 22; i++) { const t = i / 22, x = 22 + Math.sin(t * Math.PI) * 9 - t * 2, y = 300 + t * 70 + Math.sin(t * Math.PI) * 4; pearls += `<circle cx="${f1(x)}" cy="${f1(y)}" r="2" fill="#f7eef2"/><circle cx="${f1(x - 0.6)}" cy="${f1(y - 0.6)}" r=".7" fill="#fff"/>`; }
    const hooks = `<path d="M18 294 q4 -6 8 0" stroke="url(#cGold)" stroke-width="2.2" fill="none"/><circle cx="22" cy="296" r="2.6" fill="#d7a849"/>${pearls}`
      + `<circle cx="380" cy="300" r="2.6" fill="#d7a849"/><path d="M380 302 c-6 10 -2 30 -8 60 M380 302 c4 14 2 34 6 58" stroke="#5fd0c8" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M380 302 c-8 -6 -14 2 -8 6 c4 2 6 -2 8 -6 c6 -6 14 2 8 6 c-4 2 -6 -2 -8 -6" fill="#3fbab2"/>`;
    const floor = `<path d="M${BW[0]} ${BW[3]} H${BW[2]} L400 860 H0Z" fill="url(#cFloor)"/><path d="M${BW[0]} ${BW[3]} H${BW[2]}" stroke="#ffb3da" stroke-width="1.2" opacity=".6"/>`
      // shoes on the closet floor: a pair of pink heels on the left, teal ankle boots on the right
      + `<g opacity=".95"><path d="M70 836 q4 -18 18 -18 q10 0 14 10 l20 4 q6 2 4 6 h-40 q-2 -6 -8 -6 q-4 0 -4 6Z" fill="#ff5fae"/><path d="M72 836 l-1 14 h3 l2 -14Z" fill="#c22a7c"/>`
      + `<path d="M96 842 q4 -18 18 -18 q10 0 14 10 l20 4 q6 2 4 6 h-40 q-2 -6 -8 -6 q-4 0 -4 6Z" fill="#ff7cbd"/><path d="M98 842 l-1 14 h3 l2 -14Z" fill="#c22a7c"/>`
      + `<path d="M300 846 v-34 q0 -6 8 -6 h8 q6 0 6 8 v18 l14 6 q6 3 4 8Z" fill="#14806f"/><path d="M322 846 v-34 q0 -6 8 -6 h8 q6 0 6 8 v18 l14 6 q6 3 4 8Z" fill="#1aa08b"/><path d="M303 812 h14 M325 812 h14" stroke="#7fe0d0" stroke-width="1" opacity=".6"/></g>`;
    // the front of the closet: a lacquered frame with a gold crown at the top
    let studs = ""; for (let x = 30; x <= 370; x += 34) if (Math.abs(x - 200) > 40) studs += `<circle cx="${x}" cy="13" r="1.8" fill="#fff" opacity=".8"/><circle cx="${x}" cy="13" r="3.6" fill="#fff" opacity=".18"/>`;
    const frame = `<rect width="400" height="26" fill="url(#cFasc)"/><rect y="25" width="400" height="3" fill="#4e0833" opacity=".6"/>${studs}`
      + `<rect width="9" height="860" fill="url(#cFrame)"/><rect x="391" width="9" height="860" fill="url(#cFrame)"/>`
      + `<g>${crown(200, 18, 15, "url(#cGold)")}</g>`;
    let sparkles = ""; for (let i = 0; i < 14; i++) { const x = R() < 0.5 ? 4 + R() * 34 : 362 + R() * 34, y = 40 + R() * 780; sparkles += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(0.5 + R() * 0.8)}" fill="#fff" opacity="${f1(0.4 + R() * 0.5)}"/>`; }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 860" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>`
      + `<rect width="400" height="860" fill="#5a0b3a"/>${wall}${ceil}${sides}${hooks}${floor}${sparkles}<rect width="400" height="860" fill="url(#cVig)"/>${frame}</svg>`;
    try { roomUrl = `url('${URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }))}')`; }
    catch (e) { roomUrl = `url('data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29")}')`; }
    return roomUrl;
  };
  D.BACKDROPS.closet = { label: "Princess closet", tone: "dark", fx: "closetGlints", css: () => `${closetRoom()} center / cover no-repeat, #5a0b3a` };
  D.PALETTES.closet = { label: "Closet", t: ["#2a0820", "#fde8f3", "#360b2a", "#3b0d2e", "#421033", "#d29abb", "#561845", "#511541", "#6e2259", "dark"] };
  D.MATERIALS.pinkLacquer = { sheen: 1, label: "Pink lacquer", base: "#e0408f", tex: () => ["linear-gradient(180deg, transparent 4.8px, rgba(255,240,248,.45) 5.3px, rgba(255,240,248,.1) 6.6px, transparent 9px)", "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,230,244,.22) 30%, rgba(255,255,255,0) 50%, rgba(255,230,244,.12) 78%, rgba(255,255,255,0))"] };
  // glints on the lacquer that come and go
  const baseFx = D.backdropFx;
  D.backdropFx = (kinds) => String(kinds).split(" ").map((k) => {
    if (k !== "closetGlints") return baseFx(k);
    const R = rng(77); let o = "";
    for (let i = 0; i < 16; i++) {
      const left = R() < 0.5 ? R() * 9 : 91 + R() * 9, top = 4 + R() * 92;
      o += `<i class="glint4" style="left:${f1(left)}%;top:${f1(top)}%;--s:${f1(7 + R() * 9)}px;--t:${f1(3.5 + R() * 4)}s;--d:-${f1(R() * 8)}s"></i>`;
    }
    for (let i = 0; i < 6; i++) o += `<i class="glint4" style="left:${f1(38 + R() * 24)}%;top:${f1(0.6 + R() * 1.6)}%;--s:${f1(6 + R() * 6)}px;--t:${f1(3 + R() * 3)}s;--d:-${f1(R() * 6)}s"></i>`;
    return o;
  }).join("");

  // ------------------------------------------------------------------ the closet rod under each shelf
  // Cosy game art pictures (obj/closet-*-cosy.webp), cut out of their painted backgrounds. Each garment picture comes
  // with the size it was painted at and the point inside its hook that rests on the top of the rod (ax, ay).
  D.LIGHT_STYLES.closetRod = "Closet rod";
  // v147: every garment is painted without a hanger and laid onto the SAME hanger picture offline (shoulders resting on
  // its arms, straps on its notches), at one shared factor, so every hanger on the rail is exactly the same size
  // v149: osamu's own Gemini pictures (cosy game art). Each clothes rail is ONE picture of a whole set of hangers, so
  // the clothes overlap like a real closet; the heels are pairs on S-hooks, placed one by one. RAIL holds, for every
  // picture, its size and its hooks: [centre x, tip from, tip to] and how far down the inside of the hooks' curve is
  // (inner), all in the stored picture's pixels. The rod is three pieces of one painted rod: left end with its ball
  // and ceiling bracket, a tube stretched along, right end.
  const RAIL = {"rod":{"l":[114,124,99.0],"r":[114,129,104.1],"m":[30,28,14.1],"d":23.7,"stemL":73.8,"stemR":38.7},"set-a":{"w":1200,"h":1122,"inner":17.1,"gap":15.5,"hooks":[[146.0,141.1,167.6],[295.2,288.7,317.1],[422.4,417.0,444.0],[559.4,553.6,580.7],[701.8,698.0,719.9],[810.7,790.1,816.5],[959.3,937.7,965.4],[1093.3,1071.8,1099.5]]},"set-b":{"w":1200,"h":1261,"inner":19.3,"gap":15.7,"hooks":[[196.7,177.0,200.0],[328.2,316.1,355.4],[433.4,413.1,437.4],[558.7,527.9,571.8],[690.5,670.2,695.7],[829.2,798.7,843.3],[970.8,941.6,983.6],[1084.9,1055.7,1097.0]]},"set-c":{"w":1200,"h":1132,"inner":22.3,"gap":14.8,"hooks":[[159.5,151.5,185.5],[285.9,276.4,309.7],[418.9,409.3,443.3],[552.1,544.7,575.6],[675.7,673.9,694.3],[813.6,795.7,817.3],[957.7,932.9,965.7],[1080.7,1056.0,1089.3]]},"hangers-empty":{"w":1200,"h":361,"inner":27.1,"gap":17.8,"hooks":[[54.2,32.0,58.0],[201.7,195.4,226.6],[322.1,298.7,327.7],[464.8,430.2,479.3],[613.4,590.0,619.7],[771.3,737.1,787.6],[931.8,898.3,945.9],[1062.2,1028.4,1075.2]]},"heels":[{"w":208,"h":391,"inner":11.5,"gap":10.8,"hooks":[[66.2,63.0,81.9],[144.5,141.3,160.2]]},{"w":223,"h":387,"inner":11.7,"gap":10.8,"hooks":[[75.1,72.0,90.9],[153.7,150.8,169.7]]},{"w":226,"h":392,"inner":11.2,"gap":10.8,"hooks":[[78.1,62.6,81.5],[161.1,145.3,164.2]]},{"w":224,"h":508,"inner":11.2,"gap":10.8,"hooks":[[67.1,51.3,70.2],[159.1,143.6,162.5]]},{"w":229,"h":397,"inner":14.4,"gap":10.8,"hooks":[[88.7,86.0,103.5],[158.0,157.1,172.8]]},{"w":224,"h":396,"inner":14.2,"gap":10.8,"hooks":[[72.2,70.7,86.9],[155.7,153.9,170.1]]},{"w":234,"h":397,"inner":14.4,"gap":10.8,"hooks":[[74.0,72.0,88.7],[150.1,150.8,165.6]]}]};
  const pic = (n) => `obj/closet-${n}-cosy.webp`;
  const railPic = (n) => `obj/closet-${n}.webp`;
  const SETS = { a: ["rail-seta", "set-a"], b: ["rail-setb", "set-b"], c: ["rail-setc", "set-c"], e: ["rail-hangers-empty", "hangers-empty"] };
  // the shelves take turns down the room: clothes, heels, clothes, empty hangers, clothes
  const PLAN = [["a", "b", "c"], ["heels"], ["b", "c", "a"], ["e", "c", "a"], ["c", "a", "b"]];
  const shelfOrder = [];
  function closetRodEl(w, cfg) {
    const bookH = w < 560 ? 196 : 246;
    const key = String(cfg.seed || "");
    if (!shelfOrder.includes(key)) shelfOrder.push(key);
    const idx = shelfOrder.indexOf(key), plan = PLAN[idx % PLAN.length];
    const rod = RAIL.rod, inset = 6;
    // clothes about 2.4 books long, smaller on a narrow shelf so every hook of a set still sits on the rod
    const first = RAIL[SETS[plan[0] === "heels" ? "a" : plan[0]][1]];
    const hookSpan = (m) => m.hooks[m.hooks.length - 1][0] - m.hooks[0][0];
    // the rod is a bit thicker than the hooks' opening, so the curve of each hook sits snugly over it
    const rodScale = (scl) => (first.gap * scl * 1.15) / rod.d;
    const ends = (rs) => [inset + (rod.stemL + 14) * rs, w - inset - (rod.r[0] - rod.stemR + 14) * rs];
    let sc = bookH * 2.4 / 1150;
    for (let t = 0; t < 4; t++) { const [a, b] = ends(rodScale(sc)); sc = Math.min(sc, (b - a) / hookSpan(first)); }
    const rs = rodScale(sc), rodD = rod.d * rs, [x0, x1] = ends(rs);
    const rodC = rod.l[2] * rs + 1, rodTop = rodC - rodD / 2;
    const items = [];
    if (plan[0] === "heels") {
      // pairs of heels, each shoe about three quarters of a book long, starting with a different pair on each heels shelf
      const hs = bookH * 0.75 / 320;
      const n = RAIL.heels.length; let i = idx * 3, left = x0 - RAIL.heels[i % n].hooks[0][0] * hs;
      const gap = 10 * hs;
      while (items.length < n) {
        const m = RAIL.heels[i % n];
        if (left + m.hooks[m.hooks.length - 1][0] * hs > x1) break;
        items.push({ pic: railPic(`heels-${(i % n) + 1}`), m, s: hs, x: left, amp: 6 });
        left += m.w * hs + gap; i++;
      }
    } else {
      // whole sets, side by side while they fit; a shelf too narrow for even one set has already scaled it down
      let x = x0;
      for (let i = 0; i < 6; i++) {
        const k = plan[i % plan.length], m = RAIL[SETS[k][1]], span = hookSpan(m) * sc;
        if (items.length && x + span > x1) break;
        items.push({ pic: railPic(SETS[k][0]), m, s: sc, x: x - m.hooks[0][0] * sc, amp: 1.6 });
        x += span + 120 * sc;
      }
    }
    // centre what fits between the brackets
    if (items.length) {
      const last = items[items.length - 1], lastX = last.x + last.m.hooks[last.m.hooks.length - 1][0] * last.s;
      const shift = (x1 - lastX) / 2; items.forEach((it) => { it.x += shift; });
    }
    let bottom = rodC + rodD;
    const tube = (l, wd) => `<i class="tube" style="left:${f1(l)}px;width:${f1(wd)}px;top:${f1(rodTop - 0.4)}px;height:${f1(rodD + 0.8)}px;background-size:auto ${f1(rod.m[1] * rs)}px;background-position:0 ${f1(-(rod.m[2] * rs - rodD / 2 - 0.4))}px"></i>`;
    const parts = items.map((it, i) => {
      const { m, s } = it, top = rodTop - m.inner * s;
      bottom = Math.max(bottom, top + m.h * s);
      const ox = (m.hooks[0][0] + m.hooks[m.hooks.length - 1][0]) / 2 * s;
      const tilt = it.amp > 3 ? ((((idx * 7 + i * 13) % 9) - 4) * 0.35).toFixed(1) : 0;
      // the tips of the hooks go down behind the rod: a piece of the tube is laid again over each tip
      const tips = m.hooks.map((h) => tube(it.x + h[1] * s - 0.5, (h[2] - h[1]) * s + 1)).join("");
      return `<div class="hgr" data-i="${i}" data-amp="${it.amp}" style="left:${f1(it.x)}px;top:${f1(top)}px;width:${f1(m.w * s)}px;height:${f1(m.h * s)}px;transform-origin:${f1(ox)}px ${f1(m.inner * s)}px;--r:${tilt}deg">`
        + `<img src="${it.pic}" alt="" draggable="false" decoding="async"><i class="hit" style="left:0;width:100%"></i></div>${tips}`;
    });
    const lw = rod.l[0] * rs, rw = rod.r[0] * rs;
    const rodEl = `<div class="rod" style="top:0;height:${f1(rodC + rodD)}px">`
      + tube(inset + lw - 2, w - 2 * inset - lw - rw + 4)
      + `<img src="${railPic("rail-rod-l")}" alt="" style="left:${inset}px;top:${f1(rodC - rod.l[2] * rs)}px;width:${f1(lw)}px;height:${f1(rod.l[1] * rs)}px">`
      + `<img src="${railPic("rail-rod-r")}" alt="" style="left:${f1(w - inset - rw)}px;top:${f1(rodC - rod.r[2] * rs)}px;width:${f1(rw)}px;height:${f1(rod.r[1] * rs)}px"></div>`;
    // the rod sits right under the shelf: the shelf's front edge hides the brackets that hold it up, so only the rod
    // and the hooks over it show. The rail is lifted and clipped at the shelf's bottom edge, just above the rod
    const lift = rodTop - 2.5;
    const el = document.createElement("div");
    el.className = "lights closetRod rail on";
    el.innerHTML = `<div class="railIn" style="top:${f1(-lift)}px">${rodEl}${parts.join("")}</div><i class="underShade"></i>`;
    el.style.height = Math.ceil(bottom - lift + 10) + "px";
    // tap a pair of heels and it swings; tap a set of clothes and the whole rail sways a little
    el.addEventListener("click", (ev) => {
      const t = ev.target.closest && ev.target.closest(".hit"), h = t && t.parentNode; if (!h) return;
      ev.stopPropagation();
      const r = t.getBoundingClientRect(), dir = ev.clientX < r.left + r.width / 2 ? -1 : 1;
      h.style.setProperty("--a", (+h.dataset.amp * dir) + "deg"); h.classList.remove("swing"); void h.getBoundingClientRect(); h.classList.add("swing");
      clearTimeout(h._sw); h._sw = setTimeout(() => h.classList.remove("swing"), 2300);
      hangerTick(false);
    });
    return el;
  }
  const baseLights = D.lightsEl;
  D.lightsEl = (w, cfg) => (cfg && cfg.style === "closetRod" ? closetRodEl(w, cfg) : baseLights(w, cfg));

  // the soft tick of a hanger on a chrome rod
  let actx = null;
  function hangerTick(empty) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const lvl = window.ShelfSfxLevel ? window.ShelfSfxLevel() : 1; if (!lvl) return;
      const t = actx.currentTime;
      [[2600, 0], [3400, 0.07], [2900, 0.16]].slice(0, empty ? 3 : 2).forEach(([f, dt], i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + dt); g.gain.exponentialRampToValueAtTime(0.018 * lvl / (i + 1), t + dt + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.09);
        o.connect(g).connect(actx.destination); o.start(t + dt); o.stop(t + dt + 0.12);
      });
    } catch (e) { /* no sound */ }
  }

  // ------------------------------------------------------------------ things on the shelves
  // cosy game art pictures standing on y = 200, the top of the shelf, with a soft contact shadow where they meet it
  const contact = (g, cx, rx) => `<defs><radialGradient id="${g}cs"><stop offset="0" stop-color="#2a0418" stop-opacity=".55"/><stop offset=".55" stop-color="#2a0418" stop-opacity=".25"/><stop offset="1" stop-color="#2a0418" stop-opacity="0"/></radialGradient></defs><ellipse cx="${cx}" cy="199.2" rx="${rx}" ry="3.2"/>`.replace("<ellipse", `<ellipse fill="url(#${g}cs)"`);
  const painted = (label, name, W, H, scale, shadows) => {
    const vw = f1(200 * W / H);
    return { label, scale, vw, still: true, flat: true, img: pic(name),
      draw: (g) => shadows.map(([cx, rx]) => contact(g, f1(cx * vw), f1(rx * vw))).join("") + `<image href="${pic(name)}" x="0" y="0" width="${vw}" height="200" preserveAspectRatio="none"/>` };
  };
  D.ORNAMENTS.handbag = painted("Handbag", "handbag", 692, 728, 1.2, [[0.5, 0.48]]);
  D.ORNAMENTS.pencilCup = painted("Pencil cup & lipstick", "pencilcup-small", 558, 503, 0.55, [[0.43, 0.3], [0.84, 0.16]]);
  D.ORNAMENTS.giftBoxes = painted("Gift boxes", "giftboxes-detail", 451, 700, 1.2, [[0.5, 0.49]]);
  D.ORNAMENTS.shoppingBags = painted("Shopping bags", "bags-detail", 768, 521, 1.1, [[0.5, 0.49]]);

  // each closet shelf gets two of these, taking turns down the room
  D.ORNAMENTS.pencilCup.cycle = ["pencilCup", "shoppingBags", "handbag", "giftBoxes"];
  D.LOOKS.closet = { label: "Princess closet", set: { theme: "closet", accent: "#f2c76b", shelfMat: "pinkLacquer", backdrop: "closet", lights: { style: "closetRod", colour: "warm", on: false }, headFont: "playfair", ornament: { kind: "pencilCup", pos: "end" } } };
  if (D.READER_PAGES) D.READER_PAGES.closet = { bg: "#fbeef4", fg: "#3b1830" };
})();
