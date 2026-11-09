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
  // each piece of clothing hangs from a hook at (32, 17) on its hanger; drawn facing you, then turned a little to the side
  const CLOTHES = {
    top: { len: 92, d: "M24 22 Q32 28 40 22 L52 26 Q58 28 60 34 L62 44 Q57 47 52 46 L50 42 L50 88 Q32 92 14 88 L14 42 L12 46 Q7 47 2 44 L4 34 Q6 28 12 26 Z", inner: "M24 22 Q32 21 40 22 Q32 30 24 22Z", folds: "M22 48 Q20 70 22 88 M42 48 Q45 70 43 88 M32 34 Q31 60 33 90", extra: (c) => `<path d="M14 42 L50 42" stroke="${mix(c, "#000", 0.2)}" stroke-width=".8" opacity=".5"/><path d="M28 27 q4 3 8 0 l-2 3 h-4Z" fill="${mix(c, "#fff", 0.4)}"/>` },
    shirt: { len: 102, d: "M24 22 Q32 28 40 22 L52 25 Q57 27 58 33 L61 92 Q58 95 54 93 L51 46 L50 98 Q32 102 14 98 L13 46 L10 93 Q6 95 3 92 L6 33 Q7 27 12 25 Z", inner: "M24 22 Q32 21 40 22 Q32 30 24 22Z", folds: "M20 50 Q18 76 21 98 M44 50 Q47 76 43 98 M56 40 Q58 66 57 92 M8 40 Q6 66 7 92", extra: (c) => `<path d="M24 22 L28 33 L32 27 L36 33 L40 22 Q32 27 24 22Z" fill="${mix(c, "#fff", 0.25)}"/><path d="M32 28 V100" stroke="${mix(c, "#000", 0.25)}" stroke-width=".7"/>${[38, 52, 66, 80].map((y) => `<circle cx="33.6" cy="${y}" r="1.1" fill="#fff8ee"/>`).join("")}` },
    dress: { len: 126, strap: true, d: "M17 32 Q32 37 47 32 Q47 44 46 50 Q45 54 44 57 L58 122 Q32 130 6 122 L20 57 Q19 54 18 50 Q17 44 17 32Z", inner: "", folds: "M26 62 Q22 92 18 122 M32 63 Q32 96 32 126 M38 62 Q42 92 46 122 M23 62 Q15 90 10 120", extra: (c) => `<path d="M19 55 Q32 58 45 55 L44.6 60 Q32 63 19.4 60Z" fill="${mix(c, "#fff", 0.45)}"/><path d="M29 57 q3 -3 3 0 q0 3 -3 0Z M35 57 q-3 -3 -3 0 q0 3 3 0Z" fill="${mix(c, "#fff", 0.6)}"/>` },
    skirt: { len: 100, clip: true, d: "M14 30 L50 30 L58 96 Q32 102 6 96 Z", inner: "", folds: "M20 36 L14 97 M26 36 L23 99 M32 36 L32 100 M38 36 L41 99 M44 36 L50 97", extra: (c) => `<rect x="14" y="30" width="36" height="6" fill="${mix(c, "#000", 0.25)}"/>` },
  };
  const HOOK = `<path d="M32 17 V10.5 C32 4.5 39.5 3.5 40 8.5 C40.3 11 38.5 12 37 11.6" stroke="#5a5e68" stroke-width="1.7" fill="none" transform="translate(.5 .5)"/><path d="M32 17 V10.5 C32 4.5 39.5 3.5 40 8.5 C40.3 11 38.5 12 37 11.6" stroke="#eef1f6" stroke-width="1.4" fill="none"/>`;
  const ACRYLIC = `<path d="M32 17 L5 31 Q2 33.5 5.5 34.5 L58.5 34.5 Q62 33.5 59 31 Z" fill="rgba(255,255,255,.16)" stroke="rgba(255,236,248,.8)" stroke-width="1"/><path d="M32 21.5 L12 31.6 H52 Z" fill="rgba(80,10,50,.22)" stroke="rgba(255,255,255,.45)" stroke-width=".6"/><path d="M8 32.6 H56" stroke="#fff" stroke-width=".6" opacity=".7"/>`;
  const CLIPS = `<rect x="10" y="20" width="44" height="4" rx="2" fill="rgba(255,255,255,.2)" stroke="rgba(255,236,248,.8)" stroke-width=".9"/><path d="M32 17 V20" stroke="#eef1f6" stroke-width="1.4"/>`
    + `<rect x="13" y="23" width="5" height="9" rx="1" fill="url(#cxChr)"/><rect x="46" y="23" width="5" height="9" rx="1" fill="url(#cxChr)"/>`;
  let rodN = 0;
  function closetRodEl(w, cfg) {
    const id = "cx" + rodN++, k = w < 600 ? 0.82 : 1, R = rng((Math.round(w) * 7 + [...String(cfg.seed || "")].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 233280, 3)) % 233280), rodY = 9;
    const items = []; let x = 24, last = -1;
    while (x < w - 30) {
      if (R() < 0.3) {
        // a few empty hangers pushed together
        for (let n = 1 + Math.floor(R() * 3); n > 0 && x < w - 30; n--) { items.push({ x, kind: "empty" }); x += (6 + R() * 4) * k; }
        x += 10 * k;
      } else {
        const kinds = Object.keys(CLOTHES), kind = kinds[Math.floor(R() * kinds.length)];
        let c; do c = Math.floor(R() * SATIN.length); while (c === last); last = c;
        items.push({ x, kind, c, dots: R() < 0.18 });
        x += (17 + R() * 10) * k;
      }
      if (R() < 0.1) x += 26 * k;
    }
    let defs = grad(`${id}v`, [[0, "#000", 0], [0.55, "#000", 0.05], [1, "#2a0418", 0.34]], 0, 1)
      // the side turned away from you is darker
      + grad(`${id}t`, [[0, "#fff", 0.1], [0.5, "#fff", 0], [0.75, "#2a0418", 0.12], [1, "#2a0418", 0.42]])
      + `<pattern id="${id}d" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.6" fill="#fff" opacity=".85"/><circle cx="7" cy="7" r="1.6" fill="#fff" opacity=".85"/></pattern>`
      + grad("cxChr", CHROME, 0, 1);
    SATIN.forEach((c, i) => {
      defs += grad(`${id}s${i}`, [[0, mix(c, "#fff", 0.28)], [0.16, mix(c, "#fff", 0.42)], [0.3, c], [0.44, mix(c, "#000", 0.12)], [0.58, mix(c, "#fff", 0.2)], [0.74, c], [1, mix(c, "#000", 0.45)]]);
    });
    const hangers = items.map((it, i) => {
      let body = "";
      if (it.kind === "empty") body = HOOK + ACRYLIC;
      else {
        const G = CLOTHES[it.kind], c = SATIN[it.c];
        // turned a little to the side, like clothes really hang on a rail
        const turn = `translate(32 0) scale(.62 1) translate(-32 0)`;
        body = (G.clip ? CLIPS : HOOK)
          + `<g transform="${turn}">${G.strap ? ACRYLIC.replace(/rgba\(255,236,248,\.8\)/, "rgba(255,236,248,.6)") : ""}`
          + `<path d="${G.d}" fill="#2a0418" opacity=".22" transform="translate(5 3)"/>`
          + (G.inner ? `<path d="${G.inner}" fill="${mix(c, "#000", 0.5)}"/>` : "")
          + (G.strap ? `<path d="M20.5 33 L21 23 M43.5 33 L43 23" stroke="${mix(c, "#000", 0.1)}" stroke-width="1.6"/>` : "")
          + `<path d="${G.d}" fill="url(#${id}s${it.c})"/>${it.dots ? `<path d="${G.d}" fill="url(#${id}d)"/>` : ""}`
          + `<path d="${G.folds}" stroke="#fff" stroke-width="1.1" fill="none" opacity=".2"/><path d="${G.folds}" stroke="#2a0418" stroke-width="1.4" fill="none" opacity=".14" transform="translate(2.2 0)"/>`
          + G.extra(c)
          + `<path d="${G.d}" fill="url(#${id}v)"/><path d="${G.d}" fill="url(#${id}t)"/></g>`;
      }
      const W = 64 * k, H = 140 * k, tilt = ((R() - 0.5) * 3).toFixed(1);
      return `<svg class="hgr" data-i="${i}" width="${f1(W)}" height="${f1(H)}" viewBox="0 0 64 140" style="left:${f1(it.x - 36 * k)}px;top:${f1(rodY - 8.6 * k)}px;--r:${tilt}deg" aria-hidden="true"><g class="hit">${body}</g></svg>`;
    });
    // the leftmost is nearest, so it goes on last
    const rod = `<svg class="rod" width="${w}" height="20" viewBox="0 0 ${w} 20" aria-hidden="true">`
      + [10, w - 10].map((bx) => `<rect x="${bx - 4}" y="0" width="8" height="5" fill="url(#cxChr)"/><circle cx="${bx}" cy="${rodY}" r="5.2" fill="url(#cxChr)"/><circle cx="${bx}" cy="${rodY}" r="5.2" fill="none" stroke="#3a3d45" stroke-width=".6"/>`).join("")
      + `<rect x="10" y="${rodY - 2.6}" width="${w - 20}" height="5.2" rx="2.6" fill="url(#cxChr)"/></svg>`;
    const el = document.createElement("div");
    el.className = "lights closetRod on";
    el.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${defs}</defs></svg>${rod}${hangers.reverse().join("")}`;
    el.style.height = Math.ceil(140 * k + 6) + "px";
    // tap a hanger and it swings, nudging its neighbours a little
    el.addEventListener("click", (ev) => {
      const s = ev.target.closest && ev.target.closest(".hgr"); if (!s) return;
      ev.stopPropagation();
      const all = [...el.querySelectorAll(".hgr")], me = +s.dataset.i, dir = ev.clientX < s.getBoundingClientRect().left + s.getBoundingClientRect().width * 0.56 ? -1 : 1;
      all.forEach((h) => {
        const d = Math.abs(+h.dataset.i - me); if (d > 2) return;
        const amp = (d === 0 ? 7 : d === 1 ? 3 : 1.2) * dir;
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
  const shadow = (cx, rx, y = 199) => `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="2.6" fill="#1a0312" opacity=".45"/><ellipse cx="${cx}" cy="${y}" rx="${f1(rx * 0.7)}" ry="1.4" fill="#1a0312" opacity=".4"/>`;
  D.ORNAMENTS.handbag = {
    label: "Handbag", scale: 0.95, vw: 120, still: true,
    draw: (g) => {
      const leather = grad(`${g}l`, [[0, "#2a1020"], [0.25, "#5a2843"], [0.5, "#6e3354"], [0.78, "#43192f"], [1, "#220c19"]]);
      const body = "M18 128 Q18 122 24 122 L96 122 Q102 122 102 128 L108 192 Q108 198 102 198 L18 198 Q12 198 12 192 Z";
      const flap = "M16 123 L104 123 L106 150 Q105 161 94 163 L26 163 Q15 161 14 150 Z";
      let pom = ""; const R = rng(5);
      for (let i = 0; i < 26; i++) { const a = R() * Math.PI * 2, l = 4 + R() * 4; pom += `<path d="M92 156 q${f1(Math.cos(a + 0.6) * l * 0.6)} ${f1(Math.sin(a + 0.6) * l * 0.6)} ${f1(Math.cos(a) * l)} ${f1(Math.sin(a) * l)}" stroke="${["#ff8fc8", "#ffc2e0", "#ff6fb3"][i % 3]}" stroke-width="1.6" stroke-linecap="round" fill="none"/>`; }
      return `<defs>${leather}${grad(`${g}g`, GOLD, 0, 1)}${grad(`${g}v`, [[0, "#000", 0], [1, "#000", 0.35]], 0, 1)}</defs>${shadow(60, 52)}`
        + `<path d="M36 124 C33 82 87 82 84 124" stroke="url(#${g}l)" stroke-width="6.5" fill="none" stroke-linecap="round"/><path d="M39 116 C39 90 81 90 81 116" stroke="#b77598" stroke-width="1" fill="none" opacity=".45"/>`
        + `<circle cx="36" cy="124" r="3.6" fill="none" stroke="url(#${g}g)" stroke-width="2"/><circle cx="84" cy="124" r="3.6" fill="none" stroke="url(#${g}g)" stroke-width="2"/>`
        + `<path d="M84 127 L92 152" stroke="url(#${g}g)" stroke-width="1.3" stroke-dasharray="1.6 1"/><circle cx="92" cy="156" r="5.5" fill="#ff8fc8"/>${pom}`
        + `<path d="${body}" fill="url(#${g}l)"/><path d="${body}" fill="url(#${g}v)"/><path d="M20 168 L100 168 L104 193 L16 193Z" fill="none" stroke="#a0607f" stroke-width=".7" stroke-dasharray="2 1.6" opacity=".55"/>`
        + `<path d="M24 163 H96 L97 167 H23Z" fill="#000" opacity=".3"/>`
        + `<path d="${flap}" fill="url(#${g}l)"/><path d="${flap}" fill="#fff" opacity=".05"/><path d="M19 127 L101 127 L102.5 149 Q101.5 157 93 159 L27 159 Q18.5 157 17.5 149 Z" fill="none" stroke="#a0607f" stroke-width=".7" stroke-dasharray="2 1.6" opacity=".55"/>`
        + `<path d="M22 130 Q22 126 27 126 H44 Q30 132 24 150Z" fill="#fff" opacity=".06"/>`
        + `<rect x="50" y="150" width="20" height="16" rx="3" fill="url(#${g}g)"/><rect x="52" y="152" width="16" height="12" rx="2" fill="#2a1020" opacity=".25"/>${crown(60, 158, 5.6, `url(#${g}g)`)}`
        + `<circle cx="22" cy="198" r="2" fill="url(#${g}g)"/><circle cx="98" cy="198" r="2" fill="url(#${g}g)"/>`;
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
        + shadow(46, 30) + shadow(108, 38)
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

  D.ORNAMENTS.giftBoxes = {
    label: "Gift boxes", scale: 0.82, vw: 124, still: true, flat: true,
    draw: (g) => {
      const box = (x0, x1, yl, yb, yt, col, fillPat, lidCol) => {
        const lx0 = x0 - 3, lx1 = x1 + 3;
        return `<path d="M${lx0} ${yl} L${lx1} ${yl} L${lx1 - 5} ${yl - 4.5} L${lx0 + 5} ${yl - 4.5}Z" fill="${mix(lidCol, "#fff", 0.25)}"/>`
          + `<rect x="${x0}" y="${yb}" width="${x1 - x0}" height="${yt - yb}" fill="${col}"/>${fillPat ? `<rect x="${x0}" y="${yb}" width="${x1 - x0}" height="${yt - yb}" fill="url(#${fillPat})"/>` : ""}`
          + `<rect x="${x0}" y="${yb}" width="${x1 - x0}" height="${yt - yb}" fill="url(#${g}sh)"/><rect x="${x0}" y="${yb}" width="${x1 - x0}" height="4" fill="#000" opacity=".3"/>`
          + `<rect x="${lx0}" y="${yl}" width="${lx1 - lx0}" height="${yb - yl + 1}" fill="${lidCol}"/>${fillPat ? `<rect x="${lx0}" y="${yl}" width="${lx1 - lx0}" height="${yb - yl + 1}" fill="url(#${fillPat})"/>` : ""}<rect x="${lx0}" y="${yl}" width="${lx1 - lx0}" height="${yb - yl + 1}" fill="url(#${g}sh)"/>`
          + `<path d="M${lx0} ${yl + 0.6} H${lx1}" stroke="#fff" stroke-width=".8" opacity=".5"/>`;
      };
      const ribbon = (x, w, y0, y1, col) => `<rect x="${x - w / 2}" y="${y0}" width="${w}" height="${y1 - y0}" fill="${col}"/><rect x="${x - w / 2}" y="${y0}" width="${f1(w * 0.3)}" height="${y1 - y0}" fill="#fff" opacity=".3"/>`;
      return `<defs>${grad(`${g}sh`, [[0, "#fff", 0.16], [0.35, "#fff", 0.04], [0.75, "#000", 0.06], [1, "#000", 0.32]])}${grad(`${g}g`, GOLD, 0, 1)}`
        + `<pattern id="${g}dm" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M7 2 L9 7 L7 12 L5 7Z" fill="#f2cf7a" opacity=".55"/><circle cx="0" cy="0" r="1.2" fill="#f2cf7a" opacity=".55"/><circle cx="14" cy="14" r="1.2" fill="#f2cf7a" opacity=".55"/><circle cx="14" cy="0" r="1.2" fill="#f2cf7a" opacity=".55"/><circle cx="0" cy="14" r="1.2" fill="#f2cf7a" opacity=".55"/></pattern>`
        + `<pattern id="${g}wd" width="11" height="11" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2" fill="#fff"/><circle cx="8.5" cy="8.5" r="2" fill="#fff"/></pattern>`
        + `<pattern id="${g}pd" width="13" height="13" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="2.6" fill="#ff6fb3"/><circle cx="10" cy="10" r="1.6" fill="#ffb3d6"/></pattern></defs>`
        + shadow(62, 58)
        + box(10, 114, 147, 160, 198, "#b81c6a", `${g}dm`, "#c92476") + `<g>${crown(62, 152.5, 6.5, `url(#${g}g)`)}</g>`
        + box(22, 102, 109, 120, 147, "#f7b3d1", `${g}wd`, "#f9bfd9") + ribbon(62, 12, 109, 147, "#e8358f")
        + `<path d="M22 147 H102" stroke="#1a0312" stroke-width="2" opacity=".25"/>`
        + `<g transform="rotate(-5 62 108)">${box(36, 88, 74, 84, 108, "#3d6fd1", `${g}pd`, "#4479da")}${ribbon(62, 8, 74, 108, "#ff6fb3")}`
        + `<path d="M62 70 C50 54 40 62 49 70 Z" fill="#ff6fb3"/><path d="M62 70 C74 54 84 62 75 70 Z" fill="#e8358f"/><path d="M54 64 q4 1 6 5 M70 64 q-4 1 -6 5" stroke="#fff" stroke-width=".8" fill="none" opacity=".5"/>`
        + `<path d="M61 71 L53 86 L57 85 L59 88 Z M63 71 L71 86 L67 85 L65 88 Z" fill="#e8358f"/><circle cx="62" cy="70.5" r="3.4" fill="#ff8fc8"/></g>`;
    },
  };

  D.ORNAMENTS.shoppingBags = {
    label: "Shopping bags", scale: 1, vw: 176, still: true, flat: true,
    draw: (g) => {
      const R = rng(19);
      const bag = (x, y, w, gw, col, pat, handle, tissue) => {
        const xr = x + w, back = `M${x + gw} ${y - 3} H${xr + gw}`;
        let t = "";
        if (tissue) {
          // soft crumpled tissue paper puffing out of the top
          const n = 5, step = (w + gw - 6) / n;
          for (const [lift, col, op] of [[0, mix(tissue, "#000", 0.08), 1], [4, mix(tissue, "#fff", 0.45), 1]]) {
            t += `<path d="M${x + 3} ${y + 1}`;
            for (let i = 0; i < n; i++) { const a = x + 3 + i * step, b = a + step; t += ` C${f1(a + step * 0.1)} ${f1(y - 10 - lift - R() * 8)} ${f1(b - step * 0.25)} ${f1(y - 12 - lift - R() * 8)} ${f1(b)} ${f1(y - 2 - R() * 3)}`; }
            t += ` L${xr + gw - 2} ${y + 1}Z" fill="${col}" opacity="${op}"/>`;
          }
          t += `<path d="M${x + 8} ${y - 6} q6 -6 10 2 M${x + w * 0.55} ${y - 9} q5 -5 9 1" stroke="${mix(tissue, "#000", 0.2)}" stroke-width=".7" fill="none" opacity=".6"/>`;
        }
        const arc = (dx, dy, op) => `<path d="M${x + w * 0.3 + dx} ${y + 7 + dy} C${x + w * 0.3 + dx} ${y - 22 + dy} ${x + w * 0.7 + dx} ${y - 22 + dy} ${x + w * 0.7 + dx} ${y + 7 + dy}" stroke="${handle}" stroke-width="2.4" fill="none" opacity="${op}"/>`;
        return arc(gw, -3, 0.7) + `<path d="M${x} ${y} L${x + gw} ${y - 3} H${xr + gw} L${xr} ${y}Z" fill="#2a0418"/>` + t
          + `<path d="M${xr} ${y} L${xr + gw} ${y - 3} V196 L${xr} 198Z" fill="${mix(col, "#000", 0.32)}"/>${pat ? `<path d="M${xr} ${y} L${xr + gw} ${y - 3} V196 L${xr} 198Z" fill="url(#${pat})" opacity=".55"/>` : ""}`
          + `<path d="M${xr} ${y} L${xr + gw / 2} ${y + 16} L${xr + gw} ${y - 3} M${xr + gw / 2} ${y + 16} V197" stroke="#000" stroke-width=".7" fill="none" opacity=".35"/>`
          + `<rect x="${x}" y="${y}" width="${w}" height="${198 - y}" fill="${col}"/>${pat ? `<rect x="${x}" y="${y}" width="${w}" height="${198 - y}" fill="url(#${pat})"/>` : ""}`
          + `<rect x="${x}" y="${y}" width="${w}" height="${198 - y}" fill="url(#${g}sh)"/><rect x="${x}" y="${y}" width="${w}" height="7" fill="#fff" opacity=".14"/><path d="M${x} ${y + 7} H${xr}" stroke="#000" stroke-width=".6" opacity=".25"/>`
          + `<circle cx="${x + w * 0.3}" cy="${y + 7}" r="1.6" fill="url(#${g}g)"/><circle cx="${x + w * 0.7}" cy="${y + 7}" r="1.6" fill="url(#${g}g)"/>` + arc(0, 0, 1);
      };
      let glit = ""; for (let i = 0; i < 40; i++) glit += `<circle cx="${f1(R() * 30)}" cy="${f1(R() * 30)}" r="${f1(0.3 + R() * 0.7)}" fill="${R() < 0.5 ? "#fff" : "#ffc2ec"}" opacity="${f1(0.4 + R() * 0.6)}"/>`;
      return `<defs>${grad(`${g}sh`, [[0, "#fff", 0.18], [0.3, "#fff", 0.04], [0.8, "#000", 0.08], [1, "#000", 0.3]])}${grad(`${g}g`, GOLD, 0, 1)}`
        + `<pattern id="${g}st" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="5" height="12" fill="#fff" opacity=".55"/></pattern>`
        + `<pattern id="${g}dt" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2.2" fill="#fff" opacity=".9"/><circle cx="9" cy="9" r="2.2" fill="#fff" opacity=".9"/></pattern>`
        + `<pattern id="${g}gl" width="30" height="30" patternUnits="userSpaceOnUse">${glit}</pattern></defs>`
        + shadow(86, 82)
        + bag(6, 96, 48, 12, "#17a39b", `${g}st`, "#f7a6c9", "#ffd6ea")
        + bag(52, 122, 54, 14, "#ef4f9f", `${g}dt`, "#fff3f8", "#c79be8")
        + bag(110, 142, 44, 12, "#8b3fd0", `${g}gl`, "#f2cf7a", null)
        + `<path d="M140 146 L146 158" stroke="#f2cf7a" stroke-width=".8"/><rect x="141" y="157" width="12" height="9" rx="1.5" fill="#fff4fb" transform="rotate(14 147 161)"/>${crown(147, 161.5, 3, `url(#${g}g)`)}`;
    },
  };

  // each closet shelf gets two of these, taking turns down the room
  D.ORNAMENTS.pencilCup.cycle = ["pencilCup", "shoppingBags", "handbag", "giftBoxes"];
  D.LOOKS.closet = { label: "Princess closet", set: { theme: "closet", accent: "#f2c76b", shelfMat: "pinkLacquer", backdrop: "closet", lights: { style: "closetRod", colour: "warm", on: false }, headFont: "playfair", ornament: { kind: "pencilCup", pos: "end" } } };
  if (D.READER_PAGES) D.READER_PAGES.closet = { bg: "#fbeef4", fg: "#3b1830" };
})();
