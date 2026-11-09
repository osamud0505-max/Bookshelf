/* The princess closet: a pink lacquered walk-in closet with a plaid back wall, a chrome rod under every shelf with clear
   hangers and satin clothes, and desk things on the shelves: a handbag, a pencil cup with pens and a lipstick, a stack of
   gift boxes and three shopping bags. Everything is drawn here, nothing is a picture file. */
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
  const CHROME = [[0, "#4a4e58"], [0.28, "#f4f6fa"], [0.45, "#c3c8d2"], [0.7, "#7c818c"], [1, "#3a3d45"]];

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
  D.LIGHT_STYLES.closetRod = "Closet rod";
  const SATIN = ["#e8358f", "#17a39b", "#8b3fd0", "#f0506a", "#e0ae48", "#c79be8", "#f3e3ee", "#f7a6c9", "#1f9a68", "#3b6fd6"];
  // ---- hangers and the clothes on them, drawn in the hanger's own picture (64 x 140): the hook's top, where it rests
  // on the rod, is at (32, 3); its neck is at (32, 17.5) and its arms slope down to the tips at x 3 and 61. Clothes
  // follow the arms exactly, so the hanger sits inside them. The whole hanger is turned a little to the side.
  const HOOK_D = "M32 18 C32 14.6 28.4 12.6 28.4 8.6 C28.4 4.8 30.4 3 32.6 3 C35.2 3 37.2 4.9 37 7.6 C36.9 9.4 35.8 10.4 34.6 10.2";
  const HOOK = `<path d="${HOOK_D}" stroke="#4a4e58" stroke-width="1.25" fill="none" stroke-linecap="round" transform="translate(.3 .35)"/><path d="${HOOK_D}" stroke="url(#cxChrH)" stroke-width="1" fill="none" stroke-linecap="round"/><path d="M29.3 9 C29 6 30.6 3.9 32.4 3.7" stroke="#fff" stroke-width=".35" fill="none" stroke-linecap="round"/>`
    + `<rect x="30.5" y="16.6" width="3" height="3.4" rx=".8" fill="url(#cxChr)"/>`;
  const ARM_TOP = "M32 17.5 C26 20 12 27 4.2 31.4 Q1.4 33 2.3 34.6 Q3 35.7 5 35.7 H59 Q61 35.7 61.7 34.6 Q62.6 33 59.8 31.4 C52 27 38 20 32 17.5Z";
  const ARM_HOLE = "M32 22.2 C27 24.6 16.5 29.8 10.4 32.8 H53.6 C47.5 29.8 37 24.6 32 22.2Z";
  const ACRYLIC = `<path d="${ARM_TOP} ${ARM_HOLE}" fill-rule="evenodd" fill="rgba(255,240,250,.2)" stroke="rgba(255,240,250,.85)" stroke-width=".55"/>`
    + `<path d="M31 18.6 C25 21.4 13 27.6 5.4 31.8" stroke="#fff" stroke-width=".5" fill="none" opacity=".85"/><path d="M5 34.6 H59" stroke="#fff" stroke-width=".4" opacity=".6"/>`
    + `<path d="M10.4 32.8 H53.6" stroke="rgba(60,0,40,.35)" stroke-width=".5"/>`
    // the little notches in the arms that hold straps
    + `<path d="M15.6 25.2 q1.2 1.5 2.4 0 M46 25.2 q1.2 1.5 2.4 0" stroke="rgba(255,255,255,.9)" stroke-width=".45" fill="none"/>`;
  // a hanger with a bar and two clips, for skirts
  const CLIP_BAR = `<rect x="7" y="18.6" width="50" height="3.6" rx="1.8" fill="rgba(255,240,250,.22)" stroke="rgba(255,240,250,.85)" stroke-width=".55"/><path d="M8 19.6 H56" stroke="#fff" stroke-width=".4" opacity=".8"/>`;
  const clipBack = (x) => `<rect x="${x - 2.6}" y="21.6" width="5.2" height="4" rx=".8" fill="url(#cxChr)"/>`;
  const clipFront = (x) => `<path d="M${x - 2.8} 25 H${x + 2.8} L${x + 2.4} 32.4 Q${x} 33.4 ${x - 2.4} 32.4Z" fill="url(#cxChr)"/><path d="M${x - 2.8} 25 H${x + 2.8}" stroke="#3a3d45" stroke-width=".4"/><path d="M${x - 1.6} 26.6 V31.6" stroke="#fff" stroke-width=".45" opacity=".8"/><path d="M${x - 2.4} 32.4 Q${x} 33.4 ${x + 2.4} 32.4" stroke="#3a3d45" stroke-width=".4" fill="none"/>`;
  // soft folds: narrow at the top, widening as the cloth falls; filled with a gradient so they have no hard edges
  const fold = (x0, y0, x1, y1, w0, w1, fill) => `<path d="M${f1(x0 - w0 / 2)} ${y0} Q${f1((x0 + x1) / 2 - (w0 + w1) / 4)} ${f1((y0 + y1) / 2)} ${f1(x1 - w1 / 2)} ${y1} L${f1(x1 + w1 / 2)} ${y1} Q${f1((x0 + x1) / 2 + (w0 + w1) / 4)} ${f1((y0 + y1) / 2)} ${f1(x0 + w0 / 2)} ${y0}Z" fill="${fill}"/>`;
  const hemY = (t, a, b) => (1 - t) * (1 - t) * a + 2 * t * (1 - t) * b + t * t * a;
  const CLOTHES = {
    top: {
      len: 92,
      d: "M25 21.2 Q32 27 39 21.2 C44 23.2 52 27.2 58.5 30.6 Q62 32 62.6 36 L63.5 45 Q58.5 47.6 53.2 46.6 L51.2 41.5 L50.8 88 Q32 92 13.2 88 L12.8 41.5 L10.8 46.6 Q5.5 47.6 0.5 45 L1.4 36 Q2 32 5.5 30.6 C12 27.2 20 23.2 25 21.2Z",
      inner: "M25 21.2 Q32 19.6 39 21.2 Q32 27 25 21.2Z",
      folds: (L, D) => fold(18, 44, 17, 89, 2, 6, L) + fold(24, 30, 25, 90, 2, 7, D) + fold(36, 30, 39, 90, 2, 6, L) + fold(45, 44, 47, 89, 2, 5, D) + fold(6, 36, 6, 46, 2, 4, L) + fold(57, 36, 58, 46, 2, 4, D),
      extra: (c) => {
        const band = (x0, x1, y) => `<path d="M${x0} ${y} Q${(x0 + x1) / 2} ${y + 2.4} ${x1} ${y - 1} L${x1 + 0.2} ${y + 1.6} Q${(x0 + x1) / 2} ${y + 5} ${x0 - 0.2} ${y + 2.6}Z" fill="${mix(c, "#fff", 0.32)}"/>`;
        return band(0.5, 10.8, 45) + band(53.2, 63.5, 45.4)
          + `<path d="M13 41.6 Q32 44.4 51 41.6" stroke="${mix(c, "#000", 0.3)}" stroke-width=".45" fill="none" opacity=".55"/>`
          + `<path d="M14 85.6 Q32 89.6 50 85.6" stroke="${mix(c, "#fff", 0.55)}" stroke-width=".4" stroke-dasharray="1.1 .9" fill="none"/>`
          + `<path d="M32 26.4 C30 24 27.2 24.4 28 26.8 C28.6 28.4 31 27.6 32 26.4Z M32 26.4 C34 24 36.8 24.4 36 26.8 C35.4 28.4 33 27.6 32 26.4Z" fill="${mix(c, "#fff", 0.5)}"/><path d="M31.4 27 Q30.4 30 29.6 32 M32.6 27 Q33.6 30 34.4 32" stroke="${mix(c, "#fff", 0.45)}" stroke-width=".8" stroke-linecap="round" fill="none"/><circle cx="32" cy="26.6" r=".9" fill="${mix(c, "#fff", 0.7)}"/>`;
      },
    },
    shirt: {
      len: 102,
      d: "M25 21.2 Q32 27 39 21.2 C44 23.2 52 27.2 58.5 30.6 Q61.8 32.2 62 37 L62.4 92 Q58.6 94.6 54.6 93 L52 46 L51 98 Q32 102 13 98 L12 46 L9.4 93 Q5.4 94.6 1.6 92 L2 37 Q2.2 32.2 5.5 30.6 C12 27.2 20 23.2 25 21.2Z",
      inner: "M25 21.2 Q32 19.6 39 21.2 Q32 27 25 21.2Z",
      folds: (L, D) => fold(19, 40, 18, 98, 2, 7, L) + fold(26, 46, 25, 99, 2, 5, D) + fold(44, 46, 46, 98, 2, 7, D) + fold(57, 40, 58, 92, 1.6, 3, D) + fold(6, 40, 5.6, 92, 1.6, 3, L),
      extra: (c) => `<path d="M25 21.2 Q32 24.6 39 21.2 L38.4 23.6 Q32 26.6 25.6 23.6Z" fill="${mix(c, "#000", 0.08)}"/>`
        + `<path d="M25 21.2 L27.4 33.4 L32 27.2 L36.6 33.4 L39 21.2 Q32 25.6 25 21.2Z" fill="${mix(c, "#fff", 0.3)}"/><path d="M27.4 33.4 L32 27.2 L36.6 33.4" stroke="${mix(c, "#000", 0.35)}" stroke-width=".4" fill="none"/>`
        + `<path d="M30.2 28.4 V100.5 M33.8 28.4 V100.5" stroke="${mix(c, "#000", 0.22)}" stroke-width=".35"/>${[38, 50, 62, 74, 86].map((y) => `<circle cx="32" cy="${y}" r="1.05" fill="#fff8ee"/><circle cx="32.25" cy="${y + 0.25}" r=".38" fill="#c9b8a8"/>`).join("")}`
        + `<path d="M39 46 h8 v7.6 q-4 1.8 -8 0Z" fill="${mix(c, "#000", 0.06)}" stroke="${mix(c, "#000", 0.28)}" stroke-width=".4"/><path d="M39 47.4 h8" stroke="${mix(c, "#fff", 0.4)}" stroke-width=".35"/>`
        + `<path d="M1.7 85 L9.7 86 L9.4 93 Q5.4 94.6 1.6 92Z M62.3 85 L54.3 86 L54.6 93 Q58.6 94.6 62.4 92Z" fill="${mix(c, "#fff", 0.2)}"/><path d="M1.7 85 L9.7 86 M62.3 85 L54.3 86" stroke="${mix(c, "#000", 0.3)}" stroke-width=".4"/>`,
    },
    dress: {
      len: 128, strap: true,
      d: "M15 42 Q19 38.5 24.5 40 Q29 41 32 44 Q35 41 39.5 40 Q45 38.5 49 42 Q49.6 50 48 56 L46.5 60 L60 124 Q32 131 4 124 L17.5 60 L16 56 Q14.4 50 15 42Z",
      inner: "",
      folds: (L, D) => fold(21, 61, 9, 124, 2, 9, L) + fold(26, 61, 20, 127, 2, 8, D) + fold(31, 61, 31, 128, 2, 9, L) + fold(37, 61, 43, 127, 2, 8, D) + fold(43, 61, 54, 124, 2, 8, L) + fold(23.5, 44, 22.5, 56, 3, 2, L) + fold(40.5, 44, 41.5, 56, 3, 2, D),
      extra: (c) => {
        // a scalloped lace edge along the hem
        let lace = "", top = "";
        for (let i = 0; i < 16; i++) {
          const t0 = i / 16, t1 = (i + 1) / 16, tm = (t0 + t1) / 2;
          const p0 = [4 + 56 * t0, hemY(t0, 124, 131)], p1 = [4 + 56 * t1, hemY(t1, 124, 131)], pm = [4 + 56 * tm, hemY(tm, 124, 131)];
          if (!i) lace += `M${f1(p0[0])} ${f1(p0[1] - 2.4)} L${f1(p0[0])} ${f1(p0[1])}`;
          lace += ` Q${f1(pm[0])} ${f1(pm[1] + 4)} ${f1(p1[0])} ${f1(p1[1])}`;
          top += `<circle cx="${f1(pm[0])}" cy="${f1(pm[1] + 0.6)}" r=".55" fill="${mix(c, "#000", 0.15)}" opacity=".5"/>`;
        }
        lace += ` L60 121.6 Q32 128.6 4 121.6Z`;
        const sash = "M16.6 56 Q32 59.4 47.4 56 L46.9 61 Q32 64.4 17.1 61Z";
        return `<path d="${lace}" fill="#fff4f8" opacity=".92"/><path d="M4 121.6 Q32 128.6 60 121.6" stroke="${mix(c, "#000", 0.2)}" stroke-width=".35" fill="none" opacity=".5"/>${top}`
          + `<path d="M15 42 Q19 38.5 24.5 40 Q29 41 32 44 Q35 41 39.5 40 Q45 38.5 49 42" stroke="${mix(c, "#fff", 0.45)}" stroke-width=".9" fill="none"/>`
          + `<path d="${sash}" fill="${mix(c, "#fff", 0.42)}"/><path d="M17 57.6 Q32 61 47 57.6" stroke="#fff" stroke-width=".5" fill="none" opacity=".55"/><path d="M17.1 61 Q32 64.4 46.9 61" stroke="${mix(c, "#000", 0.25)}" stroke-width=".4" fill="none"/>`
          + `<path d="M38 59.4 C34.6 54.6 30.6 56 31.8 59.2 C32.6 61.2 36 60.8 38 59.4Z" fill="${mix(c, "#fff", 0.55)}"/><path d="M38 59.4 C41.4 54.6 45.4 56 44.2 59.2 C43.4 61.2 40 60.8 38 59.4Z" fill="${mix(c, "#fff", 0.48)}"/>`
          + `<path d="M37.4 60.4 L35.2 72 L36.8 71 L37.6 72.8Z M38.6 60.4 L40.6 71.4 L39 70.6 L38.4 72.4Z" fill="${mix(c, "#fff", 0.42)}"/><ellipse cx="38" cy="59.6" rx="1.4" ry="1.6" fill="${mix(c, "#fff", 0.66)}"/>`;
      },
    },
    skirt: {
      len: 100, clip: true,
      d: "M15 28.6 Q32 30.2 49 28.6 L49.4 34.6 L58 96 Q32 102 6 96 L14.6 34.6Z",
      inner: "",
      folds: (L, D) => [0, 1, 2, 3, 4, 5, 6].map((i) => fold(16 + i * 5.3, 35, 8 + i * 8, hemY(i / 6, 96, 102) - 1, 1.6, 5, i % 2 ? D : L)).join(""),
      extra: (c) => `<path d="M15 28.6 Q32 30.2 49 28.6 L49.4 34.6 Q32 36.2 14.6 34.6Z" fill="${mix(c, "#000", 0.16)}"/><path d="M15.2 30 Q32 31.6 48.8 30" stroke="#fff" stroke-width=".4" opacity=".45" fill="none"/>`
        + `<circle cx="44" cy="32" r="1.1" fill="#f2cf7a"/><circle cx="43.7" cy="31.7" r=".35" fill="#fff"/>`
        // the waistband puckers a little where each clip bites
        + `<path d="M15.2 30.8 l1.8 1.6 M18.8 30.8 l-1.8 1.6 M45.2 30.8 l1.8 1.6 M48.8 30.8 l-1.8 1.6" stroke="${mix(c, "#000", 0.35)}" stroke-width=".4" opacity=".6"/>`
        + `<path d="M7 93 Q32 99 57 93" stroke="${mix(c, "#fff", 0.45)}" stroke-width=".4" stroke-dasharray="1.1 .9" fill="none"/>`,
    },
  };
  let rodN = 0;
  function closetRodEl(w, cfg) {
    const bookH = w < 560 ? 196 : 246, k = bookH * 1.75 / 128;
    const id = "cx" + rodN++, R = rng((Math.round(w) * 7 + [...String(cfg.seed || "")].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 233280, 3)) % 233280);
    const rodR = f1(1.7 * k), rodY = rodR + 7;
    const items = []; let x = 14 * k, last = -1;
    while (x < w - 10 * k) {
      if (R() < 0.2) {
        // a couple of empty hangers pushed together
        for (let n = 1 + Math.floor(R() * 2); n > 0 && x < w - 10 * k; n--) { items.push({ x, kind: "empty" }); x += (4.5 + R() * 3) * k; }
        x += 9 * k;
      } else {
        const kinds = Object.keys(CLOTHES), kind = kinds[Math.floor(R() * kinds.length)];
        let c; do c = Math.floor(R() * SATIN.length); while (c === last); last = c;
        items.push({ x, kind, c, dots: R() < 0.18 });
        x += (15 + R() * 9) * k;
      }
      if (R() < 0.08) x += 18 * k;
    }
    let defs = grad(`${id}v`, [[0, "#000", 0], [0.5, "#000", 0.03], [1, "#2a0418", 0.3]], 0, 1)
      // the side turned away from you is darker
      + grad(`${id}t`, [[0, "#fff", 0.12], [0.35, "#fff", 0], [0.7, "#2a0418", 0.1], [1, "#2a0418", 0.4]])
      + grad(`${id}fl`, [[0, "#fff", 0], [0.5, "#fff", 0.26], [1, "#fff", 0]]) + grad(`${id}fd`, [[0, "#2a0418", 0], [0.5, "#2a0418", 0.2], [1, "#2a0418", 0]])
      + `<pattern id="${id}d" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.5" fill="#fff" opacity=".85"/><circle cx="7" cy="7" r="1.5" fill="#fff" opacity=".85"/></pattern>`
      + grad("cxChr", CHROME, 0, 1) + grad("cxChrH", CHROME);
    SATIN.forEach((c, i) => {
      defs += grad(`${id}s${i}`, [[0, mix(c, "#fff", 0.22)], [0.18, mix(c, "#fff", 0.36)], [0.34, c], [0.5, mix(c, "#000", 0.08)], [0.66, mix(c, "#fff", 0.14)], [0.82, c], [1, mix(c, "#000", 0.38)]]);
    });
    const L = `url(#${id}fl)`, Dk = `url(#${id}fd)`;
    const hangers = items.map((it, i) => {
      let body = "";
      if (it.kind === "empty") body = HOOK + ACRYLIC;
      else {
        const G = CLOTHES[it.kind], c = SATIN[it.c], cp = `${id}c${i}`, edge = mix(c, "#000", 0.38);
        const strapBack = (x0, x1) => `<path d="M${x0} 40.5 L${x1} 25.6" stroke="${mix(c, "#000", 0.35)}" stroke-width="1.3" stroke-linecap="round"/>`;
        const strapFront = (x0, x1, dir) => `<path d="M${x0} 41 L${x1} 25.4" stroke="${mix(c, "#000", 0.06)}" stroke-width="1.4" stroke-linecap="round"/><path d="M${f1(x1 - 1.5 * dir)} 26.4 Q${f1(x1 - 0.7 * dir)} 23.9 ${f1(x1 + 0.6 * dir)} 25.2" stroke="${mix(c, "#000", 0.06)}" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M${x0 - 0.3} 40 L${x1 - 0.3} 26" stroke="#fff" stroke-width=".35" opacity=".5"/>`;
        body = `<clipPath id="${cp}"><path d="${G.d}"/></clipPath>`
          + (G.clip ? HOOK + CLIP_BAR + clipBack(17) + clipBack(47) : HOOK)
          + (G.strap ? strapBack(20.6, 18.2) + strapBack(43.4, 45.8) + ACRYLIC : "")
          + `<path d="${G.d}" fill="#2a0418" opacity=".2" transform="translate(4 2.5)"/>`
          + (G.inner ? `<path d="${G.inner}" fill="${mix(c, "#000", 0.5)}"/><path d="M28.6 21.8 Q32 26 35.4 21.8" stroke="url(#cxChr)" stroke-width="1.6" fill="none"/>` : "")
          + `<path d="${G.d}" fill="url(#${id}s${it.c})"/>${it.dots ? `<path d="${G.d}" fill="url(#${id}d)"/>` : ""}`
          + `<g clip-path="url(#${cp})">${G.folds(L, Dk)}`
          // satin catches the light in a long soft streak
          + fold(20, 32, 15, G.len - 4, 2.4, 5, L)
          + `<rect x="0" y="0" width="64" height="140" fill="url(#${id}v)"/><path d="${G.d}" fill="url(#${id}t)"/></g>`
          + G.extra(c)
          + `<path d="${G.d}" fill="none" stroke="${edge}" stroke-width=".45" opacity=".7"/>`
          + (G.strap ? strapFront(19.8, 17.4, 1) + strapFront(44.2, 46.6, -1) : "")
          + (G.clip ? clipFront(17) + clipFront(47) : "");
      }
      // the hook's tip goes down behind the rod: a piece of the rod is drawn again over it
      body += `<rect x="32.8" y="3.6" width="5.6" height="3.4" fill="url(#cxChr)"/><path d="M32.8 3.6 H38.4 M32.8 7 H38.4" stroke="#3a3d45" stroke-width=".25" opacity=".5"/>`;
      const tilt = ((R() - 0.5) * 2.4).toFixed(1);
      return `<svg class="hgr" data-i="${i}" width="${f1(64 * 0.62 * k)}" height="${f1(140 * k)}" viewBox="0 0 64 140" preserveAspectRatio="none" style="left:${f1(it.x - 32 * 0.62 * k)}px;top:${f1(rodY - rodR - 3.5 * k)}px;--r:${tilt}deg" aria-hidden="true"><g class="hit">${body}</g></svg>`;
    });
    const rh = Math.ceil(rodY + rodR * 2 + 4);
    const rod = `<svg class="rod" width="${w}" height="${rh}" viewBox="0 0 ${w} ${rh}" aria-hidden="true">`
      + [rodR * 2.4, w - rodR * 2.4].map((bx) => `<rect x="${f1(bx - rodR * 1.1)}" y="0" width="${f1(rodR * 2.2)}" height="${f1(rodY - rodR)}" fill="url(#cxChrH)"/><circle cx="${f1(bx)}" cy="${rodY}" r="${f1(rodR * 1.9)}" fill="url(#cxChr)"/><circle cx="${f1(bx)}" cy="${rodY}" r="${f1(rodR * 1.9)}" fill="none" stroke="#3a3d45" stroke-width=".7"/><circle cx="${f1(bx)}" cy="${rodY}" r="${f1(rodR * 1.15)}" fill="none" stroke="#fff" stroke-width=".6" opacity=".6"/>`).join("")
      + `<rect x="${f1(rodR * 2.4)}" y="${f1(rodY - rodR)}" width="${f1(w - rodR * 4.8)}" height="${f1(rodR * 2)}" rx="${rodR}" fill="url(#cxChr)"/></svg>`;
    // the hooks go over the rod: drawn again on top of it, only their part above the rod's middle
    const el = document.createElement("div");
    el.className = "lights closetRod on";
    el.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${defs}</defs></svg>${rod}${hangers.reverse().join("")}`;
    el.style.height = Math.ceil(rodY - rodR - 3.5 * k + 134 * k) + "px";
    // tap a hanger and it swings, nudging its neighbours a little
    el.addEventListener("click", (ev) => {
      const s = ev.target.closest && ev.target.closest(".hgr"); if (!s) return;
      ev.stopPropagation();
      const all = [...el.querySelectorAll(".hgr")], me = +s.dataset.i, r = s.getBoundingClientRect(), dir = ev.clientX < r.left + r.width / 2 ? -1 : 1;
      all.forEach((h) => {
        const d = Math.abs(+h.dataset.i - me); if (d > 2) return;
        const amp = (d === 0 ? 5 : d === 1 ? 2.2 : 0.9) * dir;
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
  // every drawing stands on y = 200, the top of the shelf
  const shadow = (cx, rx, y = 200) => `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="3" fill="#1a0312" opacity=".4"/><ellipse cx="${cx}" cy="${y}" rx="${f1(rx * 0.75)}" ry="1.6" fill="#1a0312" opacity=".45"/>`;
  const pompom = (cx, cy, r, seed) => {
    const R = rng(seed); let o = `<circle cx="${cx}" cy="${cy}" r="${f1(r * 0.75)}" fill="#ff8fc8"/>`;
    for (let i = 0; i < 60; i++) { const a = R() * Math.PI * 2, l = r * (0.5 + R() * 0.6); o += `<path d="M${cx} ${cy} q${f1(Math.cos(a + 0.6) * l * 0.6)} ${f1(Math.sin(a + 0.6) * l * 0.6)} ${f1(Math.cos(a) * l)} ${f1(Math.sin(a) * l)}" stroke="${["#ff8fc8", "#ffc2e0", "#ff6fb3", "#fff0f7"][i % 4]}" stroke-width="${f1(0.7 + R() * 0.7)}" stroke-linecap="round" fill="none"/>`; }
    return o + `<circle cx="${f1(cx - r * 0.3)}" cy="${f1(cy - r * 0.3)}" r="${f1(r * 0.28)}" fill="#fff" opacity=".35"/>`;
  };

  D.ORNAMENTS.handbag = {
    label: "Handbag", scale: 1.4, vw: 150, still: true,
    draw: (g) => {
      const body = "M24 106 Q24 100 30 100 H120 Q126 100 126 106 L134 191 Q134 200 125 200 H25 Q16 200 16 191 Z";
      const flap = "M21 101 H129 L131.5 139 Q131 155 116 157.5 H34 Q19 155 18.5 139 Z";
      const scarfTail = (d) => `<path d="${d}" fill="url(#${g}sc)"/><path d="${d}" fill="url(#${g}sd)"/>`;
      return `<defs>${grad(`${g}l`, [[0, "#2a1020"], [0.18, "#4e2239"], [0.42, "#713658"], [0.6, "#5a2845"], [0.82, "#3e172c"], [1, "#220c19"]])}${grad(`${g}g`, GOLD, 0, 1)}`
        + grad(`${g}v`, [[0, "#fff", 0.06], [0.4, "#000", 0], [1, "#000", 0.38]], 0, 1)
        + grad(`${g}sc`, [[0, "#ff8fc8"], [0.5, "#ffc2e0"], [1, "#e8358f"]])
        + `<pattern id="${g}sd" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".9" fill="#fff" opacity=".9"/><circle cx="4.5" cy="4.5" r=".9" fill="#fff" opacity=".9"/></pattern>`
        + `<pattern id="${g}gr" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="1" cy="1.5" r=".45" fill="#000" opacity=".25"/><circle cx="3.6" cy="3.8" r=".4" fill="#fff" opacity=".08"/></pattern></defs>`
        + shadow(75, 64)
        // the top handle, stitched along its edge, on gold D-rings
        + `<path d="M51 100 C46 26 104 26 99 100" stroke="url(#${g}l)" stroke-width="9" fill="none"/><path d="M51 100 C46 26 104 26 99 100" stroke="#000" stroke-width="9" fill="none" opacity=".12"/>`
        + `<path d="M55 96 C52 40 98 40 95 96" stroke="#c48aaa" stroke-width=".9" fill="none" opacity=".5"/><path d="M47 98 C42 21 108 21 103 98" stroke="#d29ab8" stroke-width=".6" stroke-dasharray="2 1.5" fill="none" opacity=".55"/>`
        + `<path d="M49.5 82 C50 60 60 46 75 44" stroke="#fff" stroke-width="1.6" fill="none" opacity=".18" stroke-linecap="round"/>`
        + [51, 99].map((x) => `<rect x="${x - 6}" y="91" width="12" height="7" rx="3.5" fill="none" stroke="url(#${g}g)" stroke-width="2.4"/><path d="M${x - 5} 97 h10 v9 q-5 3 -10 0Z" fill="url(#${g}l)"/><circle cx="${x}" cy="102" r="1.1" fill="url(#${g}g)"/>`).join("")
        // a silk scarf tied in a bow at the foot of the handle, its ends hanging down
        + scarfTail("M49 86 C44 96 41 108 40 124 L44 120 L47 125 C47 110 49 98 52 88Z") + scarfTail("M51 86 C53 98 57 110 60 122 L62 117 L66 120 C61 106 57 96 53 86Z")
        + `<path d="M50 87 C42 76 32 80 37 88 C40 92 46 90 50 87Z" fill="url(#${g}sc)"/><path d="M50 87 C42 76 32 80 37 88 C40 92 46 90 50 87Z" fill="url(#${g}sd)"/>`
        + `<path d="M50 87 C58 76 68 80 63 88 C60 92 54 90 50 87Z" fill="url(#${g}sc)"/><path d="M50 87 C58 76 68 80 63 88 C60 92 54 90 50 87Z" fill="url(#${g}sd)"/><path d="M50 87 C58 76 68 80 63 88" stroke="#a51e62" stroke-width=".6" fill="none" opacity=".6"/>`
        + `<ellipse cx="50" cy="87.5" rx="3.6" ry="3.2" fill="#e8358f"/><path d="M48 86.5 q2 -1.6 4 0" stroke="#fff" stroke-width=".6" fill="none" opacity=".6"/>`
        // the bag
        + `<path d="${body}" fill="url(#${g}l)"/><path d="${body}" fill="url(#${g}gr)"/><path d="${body}" fill="url(#${g}v)"/><path d="${body}" fill="none" stroke="#8a4a6a" stroke-width="1.4"/>`
        + `<path d="M26 166 H124 L129 190 Q129 195 124 195 H26 Q21 195 21 190 Z" fill="none" stroke="#c48aaa" stroke-width=".6" stroke-dasharray="2.2 1.6" opacity=".55"/>`
        + `<path d="M17 188 Q75 192 133 188" stroke="#000" stroke-width="5" fill="none" opacity=".18"/>`
        + `<path d="M34 157 H116 L118 163 H32Z" fill="#000" opacity=".32"/>`
        + `<path d="${flap}" fill="url(#${g}l)"/><path d="${flap}" fill="url(#${g}gr)"/><path d="${flap}" fill="#fff" opacity=".05"/><path d="${flap}" fill="none" stroke="#a5638a" stroke-width="1.8"/><path d="${flap}" fill="none" stroke="#2a1020" stroke-width=".5" transform="translate(0 1.4)" opacity=".6"/>`
        + `<path d="M25 106 H125 L127 138 Q126.5 150 114 152.5 H36 Q23.5 150 23 138 Z" fill="none" stroke="#c48aaa" stroke-width=".6" stroke-dasharray="2.2 1.6" opacity=".55"/>`
        + `<path d="M28 108 Q27 128 34 146" stroke="#fff" stroke-width="5" fill="none" opacity=".07" stroke-linecap="round"/><path d="M30 108 Q30 126 35 140" stroke="#fff" stroke-width="1.2" fill="none" opacity=".16" stroke-linecap="round"/>`
        // the gold crown turn-lock
        + `<rect x="61" y="141" width="28" height="22" rx="5" fill="url(#${g}g)"/><rect x="61" y="141" width="28" height="22" rx="5" fill="none" stroke="#6e4a12" stroke-width=".7"/><rect x="64" y="144" width="22" height="16" rx="3.5" fill="#3a1b2c" opacity=".35"/>`
        + `<circle cx="64.5" cy="144.5" r=".9" fill="#fff6d0"/><circle cx="85.5" cy="144.5" r=".9" fill="#fff6d0"/><circle cx="64.5" cy="159.5" r=".9" fill="#fff6d0"/><circle cx="85.5" cy="159.5" r=".9" fill="#fff6d0"/>${crown(75, 152, 6.6, `url(#${g}g)`)}<path d="M65 145 h9" stroke="#fff" stroke-width=".8" opacity=".6"/>`
        + [27, 123].map((x) => `<ellipse cx="${x}" cy="199" rx="3.2" ry="1.8" fill="url(#${g}g)"/><circle cx="${x - 0.8}" cy="198.4" r=".7" fill="#fff" opacity=".7"/>`).join("")
        // a pink pompom charm on the other ring
        + `<path d="M99 99 L108 128" stroke="url(#${g}g)" stroke-width="1.4" stroke-dasharray="1.8 1"/>${pompom(109, 134, 9, 5)}`;
    },
  };

  D.ORNAMENTS.pencilCup = {
    label: "Pencil cup & lipstick", scale: 0.85, vw: 150, still: true,
    draw: (g) => {
      const cup = "M18 112 A28 6 0 0 0 74 112 L69 196 Q46 201 23 196 Z";
      const pen = (x, top, rot, col, w = 6) => `<g transform="rotate(${rot} ${x} 132)"><rect x="${x - w / 2}" y="${top + 16}" width="${w}" height="${132 - top}" rx="1" fill="${col}"/><rect x="${x - w / 2}" y="${top + 16}" width="${f1(w * 0.35)}" height="${132 - top}" fill="#fff" opacity=".28"/>`
        + `<rect x="${x - w / 2 - 0.5}" y="${top}" width="${w + 1}" height="22" rx="${f1(w / 2)}" fill="${mix(col, "#000", 0.25)}"/><rect x="${x - 0.8}" y="${top + 4}" width="1.6" height="16" rx=".8" fill="#e8ebf0"/><rect x="${x - w / 2 - 0.5}" y="${top}" width="${f1(w * 0.4)}" height="22" rx="${f1(w / 2)}" fill="#fff" opacity=".2"/></g>`;
      let fluff = ""; const R = rng(41);
      for (let i = 0; i < 90; i++) { const a = R() * Math.PI * 2, l = 6 + R() * 9, cx = 92.5, cy = 38.5; fluff += `<path d="M${cx} ${cy} q${f1(Math.cos(a + 0.7) * l * 0.55)} ${f1(Math.sin(a + 0.7) * l * 0.55)} ${f1(Math.cos(a) * l)} ${f1(Math.sin(a) * l)}" stroke="${["#ff8fc8", "#ffd0e8", "#ff6fb3", "#fff0f7"][i % 4]}" stroke-width="${f1(0.8 + R() * 0.8)}" stroke-linecap="round" fill="none" opacity=".9"/>`; }
      const emb = (s) => `<circle cx="46" cy="164" r="13" fill="none" stroke="${s}" stroke-width="1.2"/><circle cx="46" cy="164" r="9.5" fill="none" stroke="${s}" stroke-width=".7"/>`
        + `<path d="M36 176 Q46 182 56 176 M33 160 Q31 172 38 178 M59 160 Q61 172 54 178" stroke="${s}" stroke-width=".9" fill="none"/><path d="M41.5 159 H50.5 V164 Q50.5 169.5 46 171.5 Q41.5 169.5 41.5 164Z M46 159 V171 M41.5 164 H50.5" stroke="${s}" stroke-width=".8" fill="none"/>`;
      return `<defs>${grad(`${g}c`, [[0, "#a8336f"], [0.22, "#f29ccb"], [0.45, "#e46aa8"], [0.75, "#c94a8c"], [1, "#8c2560"]])}${grad(`${g}y`, [[0, "#c9971a"], [0.35, "#ffe27a"], [0.6, "#f2c230"], [1, "#a8780e"]])}${grad(`${g}g`, GOLD, 0, 1)}${grad(`${g}p`, [[0, "#ff6f9e"], [0.35, "#ff9fbe"], [1, "#a8124a"]], 0, 1)}</defs>`
        + shadow(46, 30, 198.2) + shadow(108, 38, 198.2)
        + `<ellipse cx="46" cy="112" rx="28" ry="6" fill="#7a1d52"/>`
        // the pencil, three pens and the fluffy pen, standing in the cup
        + `<g transform="rotate(-13 34 132)"><rect x="30.5" y="46" width="7" height="86" fill="url(#${g}y)"/><path d="M32.8 46 V132 M35.2 46 V132" stroke="#a8780e" stroke-width=".5" opacity=".6"/><rect x="30.2" y="40" width="7.6" height="7" fill="#c9ccd4"/><path d="M30.2 42 h7.6 M30.2 44.5 h7.6" stroke="#8a8e98" stroke-width=".6"/><rect x="30.5" y="32" width="7" height="9" rx="2.4" fill="#f28aa6"/></g>`
        + pen(42, 50, -5, "#2f6fd6") + pen(50, 58, 3, "#8b3fd0") + pen(57, 66, 9, "#2bbf9a", 5.5)
        + `<g transform="rotate(17 64 132)"><rect x="61.5" y="40" width="5" height="92" rx="2" fill="#ff6fae"/><rect x="61.5" y="40" width="1.8" height="92" fill="#fff" opacity=".3"/>${[60, 76, 92].map((y) => `<circle cx="64" cy="${y}" r="1.2" fill="#fff" opacity=".8"/>`).join("")}</g>`
        + `<circle cx="92.5" cy="38.5" r="9.5" fill="#ff9ccc"/><circle cx="92.5" cy="38.5" r="12" fill="#ffc2e0" opacity=".35"/>${fluff}<circle cx="89.5" cy="35.5" r="2.4" fill="#fff" opacity=".5"/>`
        // the cup, embossed with a crest
        + `<path d="${cup}" fill="url(#${g}c)"/><g transform="translate(.7 .8)">${emb("#8c2560")}${crown(46, 142, 6, "none").replace(/fill="none"/g, 'fill="#8c2560" opacity=".5"')}</g>${emb("#f8b8d8")}${crown(46, 142, 6, "#f3a2cb")}`
        + `<path d="M18 112 A28 6 0 0 0 74 112" stroke="#f8c6e0" stroke-width="1.6" fill="none"/><path d="M18.5 113 A28 6 0 0 1 73.5 113" stroke="#c94a8c" stroke-width="1" fill="none" opacity=".7"/>`
        + `<path d="M24 120 L27 190" stroke="#fff" stroke-width="2.4" opacity=".22" stroke-linecap="round"/>`
        // the lipstick lying beside it with its cap off
        + `<g><rect x="124" y="186" width="22" height="12" rx="2.4" fill="url(#${g}g)"/><rect x="128" y="186" width="5" height="12" fill="#e8358f"/><ellipse cx="146" cy="192" rx="1.5" ry="6" fill="#a8780e"/></g>`
        + `<rect x="72" y="185" width="18" height="13" rx="2" fill="#2a1020"/><rect x="72" y="185" width="18" height="3" rx="1.5" fill="#6e3354" opacity=".7"/>`
        + `<rect x="90" y="186" width="13" height="11" fill="url(#${g}g)"/><path d="M93 186 V197 M96 186 V197 M99 186 V197" stroke="#8a5a12" stroke-width=".5" opacity=".6"/>`
        + `<path d="M103 187.5 H113 L120 195 Q120.5 196.6 118.6 196.6 H103Z" fill="url(#${g}p)"/><path d="M104 189.5 H112.5 L116 193" stroke="#fff" stroke-width="1" fill="none" opacity=".5"/>`
        + `<ellipse cx="72" cy="191.5" rx="1.4" ry="6.5" fill="#1a0a14"/>`;
    },
  };

  /** A box seen a little from above: front, a sliver of its right side and its lid with a lip. */
  const box3d = (g, o) => {
    const { x0, x1, yb, ybot, yl, lh, col, lid, pat, d = 7 } = o, dy = d * 0.55, lx0 = x0 - 3, lx1 = x1 + 3;
    const face = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>${pat ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${pat})"/>` : ""}<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${g}sh)"/>`;
    const side = (x, y0, y1, c) => `<path d="M${x} ${y0} L${x + d} ${y0 - dy} V${y1 - dy} L${x} ${y1}Z" fill="${mix(c, "#000", 0.35)}"/>${pat ? `<path d="M${x} ${y0} L${x + d} ${y0 - dy} V${y1 - dy} L${x} ${y1}Z" fill="url(#${pat})" opacity=".5"/>` : ""}`;
    return side(x1, yb, ybot, col) + face(x0, yb, x1 - x0, ybot - yb, col)
      + `<rect x="${x0}" y="${yl + lh}" width="${x1 - x0}" height="4" fill="#1a0312" opacity=".32"/>`
      + `<path d="M${lx0} ${yl} L${lx1} ${yl} L${lx1 + d} ${yl - dy} L${lx0 + d} ${yl - dy}Z" fill="${mix(lid, "#fff", 0.28)}"/>${pat ? `<path d="M${lx0} ${yl} L${lx1} ${yl} L${lx1 + d} ${yl - dy} L${lx0 + d} ${yl - dy}Z" fill="url(#${pat})" opacity=".6"/>` : ""}`
      + side(lx1, yl, yl + lh, lid) + face(lx0, yl, lx1 - lx0, lh, lid)
      + `<path d="M${lx0} ${yl + 0.5} H${lx1}" stroke="#fff" stroke-width=".9" opacity=".55"/><path d="M${lx0} ${yl + lh} H${lx1}" stroke="#1a0312" stroke-width=".6" opacity=".4"/>`;
  };
  const satinBand = (x, w, y0, y1, col) => `<rect x="${f1(x - w / 2)}" y="${y0}" width="${w}" height="${y1 - y0}" fill="${col}"/><rect x="${f1(x - w / 2 + w * 0.15)}" y="${y0}" width="${f1(w * 0.22)}" height="${y1 - y0}" fill="#fff" opacity=".35"/><rect x="${f1(x + w / 2 - w * 0.18)}" y="${y0}" width="${f1(w * 0.18)}" height="${y1 - y0}" fill="#000" opacity=".15"/>`;
  const satinBandH = (x0, x1, y, h, col) => `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="${h}" fill="${col}"/><rect x="${x0}" y="${f1(y + h * 0.15)}" width="${x1 - x0}" height="${f1(h * 0.22)}" fill="#fff" opacity=".35"/><rect x="${x0}" y="${f1(y + h * 0.82)}" width="${x1 - x0}" height="${f1(h * 0.18)}" fill="#000" opacity=".15"/>`;
  const bow = (cx, cy, s, col, dark) => `<path d="M${cx} ${cy} C${cx - 4 * s} ${cy - 22 * s} ${cx - 24 * s} ${cy - 18 * s} ${cx - 16 * s} ${cy - 2 * s} C${cx - 12 * s} ${cy + 3 * s} ${cx - 5 * s} ${cy + 1 * s} ${cx} ${cy}Z" fill="${col}"/>`
    + `<path d="M${cx} ${cy} C${cx + 4 * s} ${cy - 22 * s} ${cx + 24 * s} ${cy - 18 * s} ${cx + 16 * s} ${cy - 2 * s} C${cx + 12 * s} ${cy + 3 * s} ${cx + 5 * s} ${cy + 1 * s} ${cx} ${cy}Z" fill="${dark}"/>`
    + `<path d="M${cx - 1} ${cy - 1} C${cx - 5 * s} ${cy - 14 * s} ${cx - 15 * s} ${cy - 13 * s} ${cx - 12 * s} ${cy - 4 * s}" stroke="${dark}" stroke-width="${f1(1.4 * s)}" fill="none" opacity=".8"/><path d="M${cx + 1} ${cy - 1} C${cx + 5 * s} ${cy - 14 * s} ${cx + 15 * s} ${cy - 13 * s} ${cx + 12 * s} ${cy - 4 * s}" stroke="#000" stroke-width="${f1(1.2 * s)}" fill="none" opacity=".18"/>`
    + `<path d="M${cx - 6 * s} ${cy - 12 * s} q-4 2 -6 7" stroke="#fff" stroke-width="${f1(1.2 * s)}" fill="none" opacity=".5" stroke-linecap="round"/>`
    + `<path d="M${cx - 1.5 * s} ${cy + 1} L${cx - 10 * s} ${cy + 20 * s} L${cx - 6 * s} ${cy + 18 * s} L${cx - 4.5 * s} ${cy + 22 * s} Z" fill="${col}"/><path d="M${cx + 1.5 * s} ${cy + 1} L${cx + 9 * s} ${cy + 21 * s} L${cx + 5 * s} ${cy + 19 * s} L${cx + 3 * s} ${cy + 22.5 * s} Z" fill="${dark}"/>`
    + `<rect x="${f1(cx - 3.6 * s)}" y="${f1(cy - 3.4 * s)}" width="${f1(7.2 * s)}" height="${f1(6.8 * s)}" rx="${f1(2.4 * s)}" fill="${col}"/><path d="M${f1(cx - 2.4 * s)} ${f1(cy - 2 * s)} h${f1(3 * s)}" stroke="#fff" stroke-width="${f1(0.9 * s)}" opacity=".55"/>`;

  D.ORNAMENTS.giftBoxes = {
    label: "Gift boxes", scale: 1.35, vw: 140, still: true, flat: true,
    draw: (g) => `<defs>${grad(`${g}sh`, [[0, "#fff", 0.18], [0.3, "#fff", 0.04], [0.75, "#000", 0.06], [1, "#000", 0.3]])}${grad(`${g}g`, GOLD, 0, 1)}`
      + `<pattern id="${g}dm" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M8 2.5 C10 5 10 6 8 8 C6 6 6 5 8 2.5Z M8 13.5 C10 11 10 10 8 8 C6 10 6 11 8 13.5Z M2.5 8 C5 6 6 6 8 8 C6 10 5 10 2.5 8Z M13.5 8 C11 6 10 6 8 8 C10 10 11 10 13.5 8Z" fill="#f2cf7a" opacity=".42"/><circle cx="0" cy="0" r="1.3" fill="#f2cf7a" opacity=".5"/><circle cx="16" cy="0" r="1.3" fill="#f2cf7a" opacity=".5"/><circle cx="0" cy="16" r="1.3" fill="#f2cf7a" opacity=".5"/><circle cx="16" cy="16" r="1.3" fill="#f2cf7a" opacity=".5"/></pattern>`
      + `<pattern id="${g}wd" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2.3" fill="#fff"/><circle cx="9" cy="9" r="2.3" fill="#fff"/></pattern>`
      + `<pattern id="${g}pd" width="13" height="13" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="2.7" fill="#ff6fb3"/><circle cx="10" cy="10" r="1.7" fill="#ffb3d6"/></pattern></defs>`
      + shadow(70, 66)
      // the big box: magenta with a gold damask print, gold-edged lid and a crown
      + box3d(g, { x0: 8, x1: 124, yb: 152, ybot: 200, yl: 134, lh: 19, col: "#b81c6a", lid: "#c92476", pat: `${g}dm` })
      + `<path d="M5 135.5 H127 M5 151.5 H127" stroke="url(#${g}g)" stroke-width="1.2"/>${crown(66, 143, 7.5, `url(#${g}g)`)}`
      // the middle box: pale pink with white spots, tied with a hot pink ribbon both ways
      + box3d(g, { x0: 22, x1: 108, yb: 96, ybot: 131, yl: 80, lh: 17, col: "#f7b3d1", lid: "#f9bfd9", pat: `${g}wd`, d: 6 })
      + satinBandH(22, 108, 108, 9, "#e8358f") + `<path d="M108 108 L114 104.7 V113.7 L108 117Z" fill="#a51e62"/>` + satinBand(65, 11, 80, 131, "#e8358f") + `<path d="M59.5 80 H70.5 L76.5 76.7 H65.5Z" fill="#f0479a"/><path d="M61 80 L67 76.7" stroke="#fff" stroke-width=".8" opacity=".4"/>`
      + `<rect x="59.5" y="106.5" width="11" height="12" rx="2" fill="#f0479a"/>`
      // the little box on top, a bit askew: blue with pink spots and a big bow
      + `<g transform="rotate(-4 66 78)">${box3d(g, { x0: 38, x1: 92, yb: 54, ybot: 78, yl: 42, lh: 13, col: "#3d6fd1", lid: "#4479da", pat: `${g}pd`, d: 5 })}`
      + satinBand(65, 8, 42, 78, "#ff6fb3") + `<path d="M61 42 H69 L74 39.25 H66Z" fill="#ff8fc8"/>${bow(67, 37, 1, "#ff6fb3", "#e8358f")}</g>`,
  };

  D.ORNAMENTS.shoppingBags = {
    label: "Shopping bags", scale: 1.4, vw: 172, still: true, flat: true,
    draw: (g) => {
      const R = rng(19);
      const bag = (o) => {
        const { x, y, w, gw, col, pat, handle, tissue } = o, xr = x + w, gy = gw * 0.3, mid = xr + gw / 2;
        let t = "";
        if (tissue) {
          // soft crumpled tissue paper puffing out of the top
          const n = 5, step = (w + gw - 6) / n;
          for (const [lift, c] of [[0, mix(tissue, "#000", 0.08)], [4, mix(tissue, "#fff", 0.45)]]) {
            t += `<path d="M${x + 3} ${y + 1}`;
            for (let i = 0; i < n; i++) { const a = x + 3 + i * step, b = a + step; t += ` C${f1(a + step * 0.1)} ${f1(y - 11 - lift - R() * 9)} ${f1(b - step * 0.25)} ${f1(y - 13 - lift - R() * 9)} ${f1(b)} ${f1(y - 2 - R() * 3)}`; }
            t += ` L${xr + gw - 2} ${y + 1}Z" fill="${c}"/>`;
          }
          t += `<path d="M${x + 8} ${y - 7} q6 -7 11 2 M${f1(x + w * 0.55)} ${y - 10} q5 -6 10 1 M${f1(x + w * 0.3)} ${y - 4} q3 -5 7 0" stroke="${mix(tissue, "#000", 0.22)}" stroke-width=".7" fill="none" opacity=".6"/>`;
        }
        const rope = (dx, dy, op) => {
          const p = `M${f1(x + w * 0.3 + dx)} ${y + 8 + dy} C${f1(x + w * 0.28 + dx)} ${f1(y - w * 0.5 + dy)} ${f1(x + w * 0.72 + dx)} ${f1(y - w * 0.5 + dy)} ${f1(x + w * 0.7 + dx)} ${y + 8 + dy}`;
          return `<g opacity="${op}"><path d="${p}" stroke="${mix(handle, "#000", 0.3)}" stroke-width="3.2" fill="none"/><path d="${p}" stroke="${handle}" stroke-width="2.4" fill="none"/><path d="${p}" stroke="#fff" stroke-width="2.4" stroke-dasharray="1.2 1.6" fill="none" opacity=".35"/></g>`;
        };
        const front = `<rect x="${x}" y="${y}" width="${w}" height="${200 - y}" fill="${col}"/>${pat ? `<rect x="${x}" y="${y}" width="${w}" height="${200 - y}" fill="url(#${pat})"/>` : ""}`;
        return rope(gw, -gy, 0.75)
          + `<path d="M${x} ${y} L${x + gw} ${y - gy} H${xr + gw} L${xr} ${y}Z" fill="#2a0418"/>` + t
          // the side: folded in at the top, the near half lit, the far half in shadow
          + `<path d="M${xr} ${y} L${mid} ${y + 12} V199 L${xr} 200Z" fill="${mix(col, "#000", 0.22)}"/><path d="M${mid} ${y + 12} L${xr + gw} ${y - gy} V${198 - gy} L${mid} 199Z" fill="${mix(col, "#000", 0.42)}"/>`
          + (pat ? `<path d="M${xr} ${y} L${mid} ${y + 12} L${xr + gw} ${y - gy} V${198 - gy} L${xr} 200Z" fill="url(#${pat})" opacity=".45"/>` : "")
          + `<path d="M${xr} ${y} L${mid} ${y + 12} L${xr + gw} ${y - gy}Z" fill="${mix(col, "#2a0418", 0.6)}"/><path d="M${xr} ${y} L${mid} ${y + 12} L${xr + gw} ${y - gy}" stroke="${mix(col, "#fff", 0.3)}" stroke-width=".6" fill="none" opacity=".7"/><path d="M${mid} ${y + 12} V199" stroke="#fff" stroke-width=".5" opacity=".2"/>`
          + `<path d="M${xr} 190 L${mid} 186 L${xr + gw} ${190 - gy}" stroke="#000" stroke-width=".6" fill="none" opacity=".3"/>`
          + front + `<rect x="${x}" y="${y}" width="${w}" height="${200 - y}" fill="url(#${g}sh)"/>`
          // the folded hem at the top, the creases at the bottom, the lit edge
          + `<rect x="${x}" y="${y}" width="${w}" height="9" fill="#fff" opacity=".16"/><path d="M${x} ${y + 9} H${xr}" stroke="#000" stroke-width=".8" opacity=".28"/><path d="M${x} ${y + 10} H${xr}" stroke="#fff" stroke-width=".5" opacity=".25"/>`
          + `<path d="M${x + 0.6} ${y} V200" stroke="#fff" stroke-width="1" opacity=".35"/><rect x="${x}" y="194" width="${w}" height="6" fill="#000" opacity=".1"/>`
          + [0.3, 0.7].map((f) => `<circle cx="${f1(x + w * f)}" cy="${y + 8}" r="2.2" fill="url(#${g}g)"/><circle cx="${f1(x + w * f)}" cy="${y + 8}" r="1" fill="#3a1020"/>`).join("") + rope(0, 0, 1);
      };
      // where a bag in front shades the one behind it
      const shade = (x, y) => `<path d="M${x - 10} ${y} H${x} V200 H${x - 10}Z" fill="url(#${g}cs)"/>`;
      let glit = ""; for (let i = 0; i < 46; i++) glit += `<circle cx="${f1(R() * 30)}" cy="${f1(R() * 30)}" r="${f1(0.3 + R() * 0.8)}" fill="${R() < 0.5 ? "#fff" : "#ffc2ec"}" opacity="${f1(0.4 + R() * 0.6)}"/>`;
      for (let i = 0; i < 3; i++) { const x = R() * 30, y = R() * 30; glit += `<path d="M${f1(x)} ${f1(y - 2.4)} L${f1(x + 0.5)} ${f1(y - 0.5)} L${f1(x + 2.4)} ${f1(y)} L${f1(x + 0.5)} ${f1(y + 0.5)} L${f1(x)} ${f1(y + 2.4)} L${f1(x - 0.5)} ${f1(y + 0.5)} L${f1(x - 2.4)} ${f1(y)} L${f1(x - 0.5)} ${f1(y - 0.5)}Z" fill="#fff"/>`; }
      return `<defs>${grad(`${g}sh`, [[0, "#fff", 0.2], [0.25, "#fff", 0.05], [0.8, "#000", 0.08], [1, "#000", 0.3]])}${grad(`${g}g`, GOLD, 0, 1)}${grad(`${g}cs`, [[0, "#000", 0], [1, "#1a0312", 0.35]])}`
        + `<pattern id="${g}st" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="6" height="14" fill="#fff" opacity=".6"/><rect x="8.5" width="1.2" height="14" fill="#fff" opacity=".4"/></pattern>`
        + `<pattern id="${g}dt" width="13" height="13" patternUnits="userSpaceOnUse"><circle cx="3.2" cy="3.2" r="2.4" fill="#fff" opacity=".92"/><circle cx="9.7" cy="9.7" r="2.4" fill="#fff" opacity=".92"/></pattern>`
        + `<pattern id="${g}gl" width="30" height="30" patternUnits="userSpaceOnUse">${glit}</pattern></defs>`
        + shadow(86, 84)
        + bag({ x: 3, y: 62, w: 58, gw: 14, col: "#17a39b", pat: `${g}st`, handle: "#f7a6c9", tissue: "#ffd6ea" })
        + shade(56, 104) + bag({ x: 56, y: 104, w: 62, gw: 14, col: "#ef4f9f", pat: `${g}dt`, handle: "#fff3f8", tissue: "#c79be8" })
        // a white scalloped label with a gold crown on the pink bag
        + `<ellipse cx="87" cy="152" rx="15" ry="11" fill="#fff6fa" stroke="#f2cf7a" stroke-width="1.2"/><ellipse cx="87" cy="152" rx="12" ry="8.4" fill="none" stroke="#f2cf7a" stroke-width=".5" stroke-dasharray="1.4 1"/>${crown(87, 150, 4.4, `url(#${g}g)`)}<path d="M80 157.5 h14" stroke="#c94a8c" stroke-width=".8"/>`
        + shade(118, 136) + bag({ x: 118, y: 136, w: 42, gw: 11, col: "#8b3fd0", pat: `${g}gl`, handle: "#f2cf7a", tissue: null })
        // a satin bow tied on the purple bag's handle, and a little crown tag
        + (() => {
          // points on the purple bag's front handle, so the bow and the tag's string are really tied round it
          const P = [[130.6, 144], [129.8, 115], [148.2, 115], [147.4, 144]];
          const at = (t) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k]); };
          const [bx, by] = at(0.22), [tx, ty] = at(0.8);
          // the bow: its knot sits on the rope, a wrap of ribbon going round behind
          const tie = `<path d="M${f1(bx - 2.4)} ${f1(by - 0.6)} Q${f1(bx)} ${f1(by + 1.8)} ${f1(bx + 2.4)} ${f1(by - 0.2)}" stroke="#c21e6e" stroke-width="2.2" fill="none"/>` + bow(f1(bx), f1(by), 0.5, "#ff8fc8", "#e8358f");
          // the tag hangs from a loop of gold string round the handle, threaded through the tag's eyelet
          const lx = tx, ly = ty, ex = tx + 4, ey = ty + 15;
          const tag = `<path d="M${f1(lx - 1.8)} ${f1(ly - 1.2)} C${f1(lx - 2.2)} ${f1(ly + 2.6)} ${f1(lx + 1.6)} ${f1(ly + 3.2)} ${f1(lx + 2)} ${f1(ly - 0.6)}" stroke="#d7a849" stroke-width=".8" fill="none"/>`
            + `<path d="M${f1(lx)} ${f1(ly + 2.4)} L${f1(ex - 0.6)} ${f1(ey)} M${f1(lx + 0.8)} ${f1(ly + 2.2)} L${f1(ex + 0.6)} ${f1(ey)}" stroke="#d7a849" stroke-width=".7"/>`
            + `<g transform="rotate(10 ${f1(ex)} ${f1(ey + 6)})"><path d="M${f1(ex - 6.5)} ${f1(ey + 1)} L${f1(ex - 3)} ${f1(ey - 1.6)} H${f1(ex + 3)} L${f1(ex + 6.5)} ${f1(ey + 1)} V${f1(ey + 12)} H${f1(ex - 6.5)}Z" fill="#fff4fb" stroke="#e8b0cf" stroke-width=".5"/>`
            + `<circle cx="${f1(ex)}" cy="${f1(ey + 0.6)}" r="1.1" fill="none" stroke="url(#${g}g)" stroke-width=".8"/>${crown(ex, ey + 7, 2.8, `url(#${g}g)`)}</g>`;
          return tie + tag;
        })();
    },
  };

  // the cup and lipstick were drawn standing on y = 198; set them down on the shelf
  const cupDraw = D.ORNAMENTS.pencilCup.draw;
  D.ORNAMENTS.pencilCup.draw = (g) => `<g transform="translate(0 1.8)">${cupDraw(g)}</g>`;
  // each closet shelf gets two of these, taking turns down the room
  D.ORNAMENTS.pencilCup.cycle = ["pencilCup", "shoppingBags", "handbag", "giftBoxes"];
  D.LOOKS.closet = { label: "Princess closet", set: { theme: "closet", accent: "#f2c76b", shelfMat: "pinkLacquer", backdrop: "closet", lights: { style: "closetRod", colour: "warm", on: false }, headFont: "playfair", ornament: { kind: "pencilCup", pos: "end" } } };
  if (D.READER_PAGES) D.READER_PAGES.closet = { bg: "#fbeef4", fg: "#3b1830" };
})();
