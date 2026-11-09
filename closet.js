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
  const GARMENTS = {
    "blouse-white": [350, 522, 170, 7], "blue-stars": [485, 856, 239, 7], "butter-floral": [345, 609, 167, 7],
    "cardigan-pink": [361, 510, 175, 7], "gold-sequin": [395, 629, 193, 7], "ivory-roses": [493, 929, 242, 7],
    "lavender": [360, 761, 173, 7], "magenta": [415, 588, 205, 7], "peach-cape": [435, 934, 213, 7],
    "periwinkle": [352, 716, 169, 7], "pinafore": [401, 704, 194, 7], "pink-tutu": [494, 629, 242, 7],
    "red-velvet": [445, 745, 219, 7], "rose-tiers": [442, 715, 216, 7],
  };
  const EMPTY = [304, 182, 148, 7];
  // how far the hook's curve reaches to the left of its inside top, where its tip goes down behind the rod (same hook on all)
  const HOOK_TIP = 24;
  // the wardrobe in one fixed order, mixing colours and lengths. Each shelf starts at a different place in it,
  // so every shelf shows different clothes
  const WARDROBE = ["blue-stars", "rose-tiers", "blouse-white", "gold-sequin", "lavender", "red-velvet", "butter-floral",
    "cardigan-pink", "periwinkle", "pink-tutu", "magenta", "pinafore", "ivory-roses", "peach-cape"];
  const shelfOrder = [];
  const pic = (n) => `obj/closet-${n}-cosy.webp`;
  const hung = (n) => `obj/closet-${n}-hung.webp`;
  // the rod picture: a chrome tube 34 px thick whose middle is 58 px from the top of its 118 px strip; each end piece
  // is 234 px wide with its wall flange centred 60 px (left) or 173 px (right) along it
  const ROD = { th: 34, h: 118, mid: 58, endW: 234, fl: 60, fr: 173, flR: 56 };
  // chrome ceiling brackets: a round plate screwed to the underside of the shelf, a stem, and a saddle the rod rests in;
  // two near the ends (three on a wide shelf), plus rounded caps on the rod's ends
  function rodMounts(w, rodY, rodR, midL, midW) {
    const xs = w > 720 ? [0.07, 0.5, 0.93] : [0.09, 0.91];
    const pw = rodR * 3.4, sw = Math.max(3, rodR * 0.62), cw = rodR * 2.3;
    const grad = `<defs><linearGradient id="rmC" x1="0" x2="1"><stop offset="0" stop-color="#7d7f86"/><stop offset=".3" stop-color="#f4f5f7"/><stop offset=".55" stop-color="#b9bcc3"/><stop offset="1" stop-color="#6c6e75"/></linearGradient>`
      + `<linearGradient id="rmV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9eaee"/><stop offset=".6" stop-color="#a7aab2"/><stop offset="1" stop-color="#6e7078"/></linearGradient></defs>`;
    const one = (cx) => `<g>`
      // plate against the shelf's underside, seen a little from below
      + `<ellipse cx="${f1(cx)}" cy="1.6" rx="${f1(pw / 2)}" ry="2.6" fill="url(#rmV)" stroke="#5d5f66" stroke-width=".6"/>`
      + `<rect x="${f1(cx - sw / 2)}" y="2" width="${f1(sw)}" height="${f1(rodY - 1)}" rx="${f1(sw / 2)}" fill="url(#rmC)" stroke="#5d5f66" stroke-width=".5"/>`
      // the saddle: a cup under the rod, open at the top, wrapping its lower half
      + `<path d="M${f1(cx - cw / 2)} ${f1(rodY - rodR * 0.2)} a${f1(cw / 2)} ${f1(rodR * 1.25)} 0 0 0 ${f1(cw)} 0 v${f1(-rodR * 0.35)} h${f1(-cw * 0.14)} a${f1(cw * 0.36)} ${f1(rodR * 0.95)} 0 0 1 ${f1(-cw * 0.72)} 0 h${f1(-cw * 0.14)}z" fill="url(#rmC)" stroke="#5d5f66" stroke-width=".6"/></g>`;
    const cap = (x) => `<ellipse cx="${f1(x)}" cy="${f1(rodY)}" rx="${f1(rodR * 0.55)}" ry="${f1(rodR * 1.02)}" fill="url(#rmC)" stroke="#5d5f66" stroke-width=".6"/>`;
    return `<svg class="rodMount" width="${f1(w)}" height="${f1(rodY + rodR * 1.4)}" viewBox="0 0 ${f1(w)} ${f1(rodY + rodR * 1.4)}" aria-hidden="true">${grad}${xs.map((t) => one(w * t)).join("")}${cap(midL + 1)}${cap(midL + +midW - 1)}</svg>`;
  }
  function closetRodEl(w, cfg) {
    const bookH = w < 560 ? 196 : 246;
    // every garment shares one scale, so their sizes stay true to each other; the longest gown is 3 books long, so the clothes are much bigger than the books.
    // Hangers are seen a little from the side, so the pictures are narrowed
    const s = bookH * 3.0 / 934, sx = 0.78, k = bookH * 1.75 / 128;
    const R = rng((Math.round(w) * 7 + [...String(cfg.seed || "")].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 233280, 3)) % 233280);
    // the rod hangs from the underside of the shelf above on ceiling brackets, so it sits a bracket's drop below the top
    const rodR = 1.7 * k, rs = (rodR * 2) / ROD.th, drop = Math.round(4.2 * k), rodY = f1(drop + rodR);
    const items = []; let x = 34;
    // this shelf's place in the room (shelves ask in order, top first) picks where it starts in the wardrobe, 5 apart,
    // so the shelves under each other hang different clothes; a neighbour or two swap places for a less tidy rail
    const key = String(cfg.seed || "");
    if (!shelfOrder.includes(key)) shelfOrder.push(key);
    const start = (shelfOrder.indexOf(key) * 5) % WARDROBE.length;
    const deck = WARDROBE.slice(start).concat(WARDROBE.slice(0, start));
    for (let i = 0; i < deck.length - 1; i++) if (R() < 0.3) { [deck[i], deck[i + 1]] = [deck[i + 1], deck[i]]; i++; }
    let di = 0;
    const draw = () => deck[di++ % deck.length];
    while (x < w - 30) {
      if (R() < 0.18) {
        // a couple of empty hangers pushed together
        for (let n = 1 + Math.floor(R() * 2); n > 0 && x < w - 30; n--) { items.push({ x, kind: "empty", m: EMPTY }); x += 304 * s * sx * (0.22 + R() * 0.12); }
        x += 304 * s * sx * 0.45;
      } else {
        const n = draw();
        items.push({ x, kind: n, m: GARMENTS[n] });
        x += 304 * s * sx * (0.5 + R() * 0.25);
        // keep hooks off the brackets
        if ([0.09, 0.91, 0.07, 0.5, 0.93].some((t) => Math.abs(x - w * t) < 3.5 * k)) x += 7 * k;
      }
      if (R() < 0.08) x += 304 * s * sx * 0.5;
    }
    let bottom = 0;
    const top = rodY - rodR;
    const ph = f1(ROD.h * rs), pt = f1(rodY - ROD.mid * rs);
    const midL = 14, midW = f1(w - 28);
    const hangers = items.map((it, i) => {
      const [W, H, ax, ay] = it.m, dw = W * s * sx, dh = H * s, ox = ax * s * sx, oy = ay * s;
      bottom = Math.max(bottom, top - oy + dh);
      const tilt = ((R() - 0.5) * 2.4).toFixed(1);
      return `<div class="hgr" data-i="${i}" style="left:${f1(it.x - ox)}px;top:${f1(top - oy)}px;width:${f1(dw)}px;height:${f1(dh)}px;transform-origin:${f1(ox)}px ${f1(oy)}px;--r:${tilt}deg">`
        + `<img src="${hung(it.kind === "empty" ? "hanger" : it.kind)}" alt="" draggable="false" decoding="async"><i class="hit" style="left:${f1(ox - Math.min(dw * 0.36, 60))}px;width:${f1(Math.min(dw * 0.72, 120))}px"></i></div>`
        // the hook's curve goes over the rod and its tip down behind it: a piece of the rod is laid again over the tip
        + (() => { const pl = f1(it.x - HOOK_TIP * s * sx - 2.5); return `<div class="rodPatch" style="left:${pl}px;width:${f1(HOOK_TIP * s * sx + 1.5)}px;top:${f1(rodY - rodR - 1)}px;height:${f1(rodR * 2 + 2)}px"><img src="${pic("rod-mid")}" alt="" style="left:${f1(midL - pl)}px;top:${f1(pt - (rodY - rodR - 1))}px;width:${f1(midW)}px;height:${ph}px"></div>`; })();
    });
    // the rod is behind the hangers; each hanger brings its own piece of rod to hide its hook's tip
    const rod = `<div class="rod" style="top:${pt}px;height:${ph}px">`
      + `<img class="rodMid" src="${pic("rod-mid")}" alt="" style="left:${midL}px;width:${midW}px"></div>`
      + rodMounts(w, rodY, rodR, midL, midW);
    const el = document.createElement("div");
    el.className = "lights closetRod on";
    el.innerHTML = rod + hangers.reverse().join("");
    el.style.height = Math.ceil(bottom + 2) + "px";
    // tap a hanger and it swings, nudging its neighbours a little
    el.addEventListener("click", (ev) => {
      const t = ev.target.closest && ev.target.closest(".hit"), s2 = t && t.parentNode; if (!s2) return;
      ev.stopPropagation();
      const all = [...el.querySelectorAll(".hgr")], me = +s2.dataset.i, r = t.getBoundingClientRect(), dir = ev.clientX < r.left + r.width / 2 ? -1 : 1;
      all.forEach((h) => {
        const dd = Math.abs(+h.dataset.i - me); if (dd > 2) return;
        const amp = (dd === 0 ? 5 : dd === 1 ? 2.2 : 0.9) * dir;
        h.style.setProperty("--a", amp + "deg"); h.classList.remove("swing"); void h.getBoundingClientRect(); h.classList.add("swing");
        clearTimeout(h._sw); h._sw = setTimeout(() => h.classList.remove("swing"), 2300);
      });
      hangerTick(items[me] && items[me].kind === "empty");
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
