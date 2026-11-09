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
  // v155: osamu's Gemini pictures with ONE item each (a garment on its own hanger), so each one swings on its own
  // with nothing hidden behind it. [file, width, height, pivot x, pivot y (inside the top of the hook), hook tip
  // from, to] in the stored picture's pixels
  const SINGLES = [["single-1",338,1016,158.6,21.0,168.0,178.1],["single-2",262,1038,95.2,21.0,106.1,118.5],["single-3",170,249,93.0,21.0,104.6,117.0],["single-4",196,751,90.9,21.0,101.2,113.2],["single-5",196,758,103.1,22.5,107.2,117.8],["single-6",251,1037,133.5,21.8,117.0,128.2],["single-7",211,1040,100.4,21.0,78.0,89.6],["single-8",203,946,85.7,21.0,66.4,76.9]];
  // v158: a second picture (the school uniforms), so the clothes shelves take turns. Each picture keeps its own hook
  // size (gap), tallest piece and hook spacing (pitch), all in stored pixels
  const SINGLES_B = [["single-b1",276,880,143.2,18.0,150.0,159.8],["single-b2",231,634,117.9,17.2,124.5,133.9],["single-b3",229,856,89.8,18.8,96.4,106.5],["single-b4",260,798,121.6,18.8,128.6,138.8],["single-b5",275,893,143.7,17.5,149.4,160.3],["single-b6",316,1005,137.4,17.5,120.9,131.9],["single-b7",305,1063,134.8,18.1,118.3,129.3],["single-b8",226,823,125.2,18.0,109.5,119.2]];
  // v160: the uniforms hang all together on one rod, close like osamu's layout pictures (uniforms-layout-ref.jpg, party-layout-ref.jpg): hook spacing measured against each piece's length there
  // v165: a third picture, the party gowns (gowns-spaced.jpg), hung as in gowns-layout-ref.jpg. The purple, pink and gold
  // dresses are drawn wider here than in that photo, so their hooks sit further apart (steps) to show as much of each
  // dress as the photo does
  const SINGLES_C = [["single-c1",303,1048,169.0,19.0,155.0,164.0],["single-c2",173,273,85.0,17.0,97.0,109.0],["single-c3",108,754,56.0,20.0,40.5,51.0],["single-c4",140,226,66.5,17.0,43.0,54.0],["single-c5",198,650,91.0,14.0,70.0,80.0],["single-c6",291,1091,136.0,17.0,112.0,124.0],["single-c7",333,987,166.0,16.0,141.0,153.0],["single-c8",245,983,137.0,17.0,112.0,124.0]];
  // z: which piece hangs in front of which, checked pair by pair in osamu's photos (higher = nearer). Party: the
  // jacket over the skirt and the ruffle dress, that dress over the trousers, the trousers over the bow dress.
  // Uniforms: each over the one on its left, the teal dress and the blouse over the purple-skirt outfit. Gowns: the
  // purple dress over the blue skirt, the skirt over the pink ruffle dress (osamu), that dress over the gold one
  const RAILS = [
    { list: SINGLES, tall: 1040, pitch: 172, z: [1, 2, 3, 4, 8, 7, 6, 5] },
    { list: SINGLES_B, tall: 1063, pitch: 136, z: [1, 2, 3, 4, 5, 7, 6, 8] },
    { list: SINGLES_C, tall: 1040, pitch: 112, steps: [1.03, 0.83, 0.98, 1.35, 1.5, 1.7, 0.95], z: [1, 2, 3, 4, 8, 7, 6, 5] },
  ];
  // which picture each shelf hangs, down the room: party clothes, heels, uniforms, gowns, party clothes
  const RAIL_OF = [0, 0, 1, 2, 0];
  // v170: shoes, one per picture (shoes-spaced.jpg), in pairs: [file, w, h, pivotX, pivotY, tipFrom, tipTo]
  const SHOES = [["shoe-1",116,436,74.1,13.5,78.2,88.2],["shoe-2",114,432,45.1,12.5,49.5,59.5],["shoe-3",122,430,81.5,13.5,85.8,95.5],["shoe-4",124,433,46.8,13.0,51.0,61.0],["shoe-5",135,438,86.5,12.5,72.5,82.5],["shoe-6",130,435,56.2,13.0,42.0,52.0],["shoe-7",131,438,75.0,13.0,60.5,71.0],["shoe-8",123,434,51.4,13.0,37.2,47.2]];
  // v172: glints, found in osamu's pictures: every bright white highlight (sequins, glitter, hanger and hook glints) gets a
  // little star that twinkles on its own beat. [x, y, strength] in each picture's own pixels
  const SPARK = {"shoe-1":[[59.4,341.7,1.0],[13.7,348.6,1.0],[62.7,110.0,0.35],[67.5,10.0,0.1],[41.5,131.0,0.05]],"shoe-2":[[96.9,354.2,1.0],[53.4,338.2,0.62],[17.0,363.9,0.62],[33.8,108.7,0.25],[93.7,306.7,0.25],[34.0,21.5,0.1]],"shoe-3":[[56.3,255.2,1.0],[48.2,301.5,1.0],[54.0,342.1,1.0],[92.1,235.7,1.0],[111.0,165.3,1.0],[82.4,408.0,1.0],[50.8,119.6,0.75],[85.0,108.3,0.17],[46.4,202.1,0.17]],"shoe-4":[[70.0,247.9,1.0],[67.3,308.2,1.0],[75.6,338.5,1.0],[10.1,165.9,1.0],[30.6,237.7,1.0],[76.3,408.1,1.0],[71.0,119.6,0.55],[87.6,151.1,0.33],[113.8,343.2,0.55]],"shoe-5":[[54.6,376.6,1.0],[52.3,341.2,1.0],[20.4,210.5,1.0],[78.4,150.1,0.57],[86.2,108.8,0.33],[60.3,314.7,0.95],[101.4,344.4,1.0],[46.8,200.6,0.4],[96.0,15.5,0.05]],"shoe-6":[[37.1,268.4,1.0],[53.0,388.6,1.0],[67.1,111.0,0.62],[14.3,217.2,0.62],[50.0,354.4,0.97],[55.7,325.4,0.82],[106.5,334.2,0.35],[58.3,153.7,0.07],[116.7,411.7,0.07]],"shoe-7":[[99.1,189.9,1.0],[52.0,174.5,1.0],[13.0,200.4,1.0],[88.3,103.7,0.57],[35.1,97.9,1.0],[86.9,24.9,0.17],[44.6,206.2,0.12],[28.8,154.8,0.12],[90.0,275.3,0.17]],"shoe-8":[[34.2,193.4,1.0],[9.8,209.5,1.0],[96.8,161.9,1.0],[64.1,104.2,0.95],[22.8,95.5,1.0],[84.6,332.6,1.0],[46.5,337.5,0.97],[9.0,253.0,0.23],[94.5,85.9,0.45]],"single-1":[[149.9,117.7,1.0],[159.2,9.5,0.25],[141.8,508.0,0.1]],"single-2":[[46.7,196.6,1.0],[78.8,17.1,0.45],[83.7,118.1,1.0],[149.9,894.9,0.45],[143.3,824.6,0.28],[107.5,424.5,0.1]],"single-3":[[73.9,23.2,0.75],[80.4,117.4,1.0],[26.8,195.2,0.9]],"single-4":[[43.5,133.7,0.95],[73.3,157.2,0.33],[93.3,543.6,0.17],[69.0,36.0,0.07],[133.0,212.0,0.05],[133.0,174.5,0.05]],"single-5":[[171.3,425.7,1.0],[125.8,744.5,0.2],[98.5,110.0,0.25],[28.1,386.6,0.25],[123.2,421.8,0.2]],"single-6":[[175.5,376.0,0.42],[140.2,116.4,0.65]],"single-7":[[153.5,181.1,1.0],[117.1,168.1,1.0],[138.2,434.6,1.0],[106.6,11.4,0.68],[145.7,128.6,0.62],[123.0,43.5,0.3],[178.8,94.9,0.42],[46.0,159.6,0.2],[126.7,525.2,0.7]],"single-8":[[93.1,117.8,1.0],[124.3,201.9,1.0],[183.2,448.8,0.15]],"single-b1":[[129.9,25.6,1.0],[131.3,117.9,0.3]],"single-b2":[[85.1,178.7,1.0],[108.3,15.5,1.0],[44.3,107.6,1.0],[75.2,135.5,0.53],[168.4,145.6,0.3],[168.0,203.0,0.07]],"single-b3":[[155.2,698.4,1.0],[144.8,309.0,1.0],[197.2,363.5,1.0],[136.3,190.4,1.0],[189.7,275.7,1.0],[93.3,348.9,1.0],[159.1,395.1,1.0],[157.3,446.7,1.0],[217.4,680.2,1.0]],"single-b4":[[174.3,752.7,1.0],[109.9,29.4,1.0],[163.6,200.3,1.0],[143.0,266.4,1.0],[198.0,770.7,1.0],[246.5,378.5,1.0],[42.8,249.6,1.0],[171.5,549.7,0.85],[172.8,604.7,0.75]],"single-b5":[[110.1,177.9,1.0],[128.9,31.4,0.8],[102.1,138.6,1.0],[69.5,111.0,1.0],[143.0,96.0,0.38],[17.3,821.5,1.0],[260.6,796.6,0.35],[193.0,206.0,0.1],[198.5,136.8,0.1]],"single-b6":[[158.5,728.6,1.0],[131.4,243.4,1.0],[148.3,22.2,0.28],[23.8,842.8,0.53],[137.0,112.3,0.57],[84.3,255.5,0.65],[50.5,686.0,0.1],[49.3,935.7,0.07],[37.3,793.7,0.07]],"single-b7":[[204.8,612.6,1.0],[145.2,18.1,0.82],[136.0,96.0,0.28],[190.2,190.4,0.3],[93.4,558.2,0.12],[208.2,276.0,0.12],[192.7,586.7,0.07],[150.0,49.0,0.07],[214.0,658.0,0.05]],"single-b8":[[195.7,767.5,1.0],[35.8,715.1,1.0],[124.9,740.4,1.0],[134.6,15.5,1.0],[169.4,214.5,1.0],[207.1,403.8,1.0],[138.4,149.2,1.0],[140.4,196.2,1.0],[65.0,786.2,1.0]],"single-c1":[[176.1,187.5,1.0],[175.7,134.7,1.0],[193.3,228.7,1.0],[95.0,1011.5,1.0],[253.1,822.0,0.7],[263.9,941.2,0.93],[166.8,474.7,0.45],[205.6,516.2,0.12],[199.3,960.7,0.47]],"single-c2":[[100.5,142.4,1.0],[64.7,34.5,0.47],[14.0,216.0,1.0],[155.3,226.9,0.72],[79.2,8.0,0.15],[125.5,224.7,0.55],[136.8,250.6,0.12],[56.6,163.6,0.12]],"single-c3":[[54.9,423.3,1.0],[66.5,679.4,1.0],[63.1,191.7,1.0],[51.1,580.6,1.0],[76.2,559.8,1.0],[85.9,374.7,1.0],[53.5,541.5,1.0],[23.2,486.7,1.0],[27.1,681.2,1.0]],"single-c4":[[84.9,27.4,1.0],[126.9,137.8,1.0],[100.9,176.1,0.38],[20.0,175.5,0.25],[51.0,135.0,0.17]],"single-c5":[[173.3,183.9,1.0],[108.6,26.1,0.25],[101.8,103.2,0.28],[26.5,581.0,0.05],[152.0,584.5,0.1]],"single-c6":[[201.3,143.2,1.0],[156.8,37.2,0.55],[173.6,822.3,0.8],[137.0,92.5,0.33],[103.8,174.0,0.35],[76.7,170.8,0.15],[144.4,8.2,0.12],[106.0,137.0,0.28],[168.0,177.0,0.07]],"single-c7":[[182.2,134.5,1.0],[227.1,226.9,1.0],[186.7,37.4,0.68],[248.5,205.5,0.05]],"single-c8":[[222.1,227.6,1.0],[154.5,18.1,0.88],[63.7,215.1,0.47],[157.4,616.2,0.9],[63.4,755.2,0.4],[153.1,180.8,0.5],[192.7,611.9,0.65],[34.2,783.5,0.25],[129.5,590.5,0.4]]};
  // a pair of heels still swings as one, from between its two hooks
  RAIL.heels.forEach((m, j) => { m.pieces = [[`heels-${j + 1}`, 0, 0, m.w, m.h, (m.hooks[0][0] + m.hooks[1][0]) / 2, m.inner]]; });
  const pic = (n) => `obj/closet-${n}-cosy.webp`;
  // twinkling stars on a picture's bright spots. Each has its own size, length of beat and place in the beat
  const glints = (f, x, y, s, seed) => (SPARK[f] || []).map(([sx, sy, st], q) => {
    const h = ((seed + 3) * 2654435761 + (q + 1) * 40503) >>> 0, dur = 2.4 + (h % 19) / 19 * 2.6, del = ((h >> 5) % 100) / 100 * dur;
    const sz = Math.max(8, 46 * s * (0.75 + 0.55 * st));
    return `<i class="sp" style="left:${f1((sx - x) * s)}px;top:${f1((sy - y) * s)}px;width:${f1(sz)}px;height:${f1(sz)}px;animation-duration:${dur.toFixed(2)}s;animation-delay:-${del.toFixed(2)}s"></i>`;
  }).join("");
  const railPic = (n) => `obj/closet-${n}.webp?f=3`;
  // the shelves take turns down the room: clothes, heels, clothes, clothes, clothes
  const PLAN = [["s"], ["heels"], ["s"], ["s"], ["s"]];
  const shelfOrder = [];
  function closetRodEl(w, cfg) {
    const bookH = w < 560 ? 196 : 246;
    const key = String(cfg.seed || "");
    if (!shelfOrder.includes(key)) shelfOrder.push(key);
    const idx = shelfOrder.indexOf(key), plan = PLAN[idx % PLAN.length];
    const rod = RAIL.rod, inset = 6;
    // clothes about 2.4 books long, smaller on a narrow shelf so every hook of a set still sits on the rod
    const first = RAIL["set-a"];
    const hookSpan = (m) => m.hooks[m.hooks.length - 1][0] - m.hooks[0][0];
    // the rod is a bit thicker than the hooks' opening, so the curve of each hook sits snugly over it
    const rodScale = (scl) => (first.gap * scl * 1.15) / rod.d;
    const ends = (rs) => [inset + (rod.stemL + 14) * rs, w - inset - (rod.r[0] - rod.stemR + 14) * rs];
    let sc = bookH * 2.4 / 1150;
    for (let t = 0; t < 4; t++) { const [a, b] = ends(rodScale(sc)); sc = Math.min(sc, (b - a) / hookSpan(first)); }
    // v159: one rod, the same thickness under every shelf, whatever hangs on it (osamu)
    const rs = (bookH * 0.039) / rod.d, rodD = rod.d * rs, [x0, x1] = ends(rs);
    const rodC = rod.l[2] * rs + 1, rodTop = rodC - rodD / 2;
    const items = [];
    if (plan[0] === "heels") {
      // v170: osamu's spaced-out shoes, each shoe on its own S-hook so each one swings by itself. A pair's hooks sit
      // close, with a wider gap to the next pair; the shoes are as tall as the old pairs were. Each heels shelf
      // starts with a different pair and shows only whole pairs that fit
      const hs = (1150 * sc * 0.27) / 320, s3 = (391 * hs) / 435;
      const IN = 115 * s3, OUT = 180 * s3, n = SHOES.length;
      let at = x0 + 8 + SHOES[(idx * 2) % n][3] * s3;
      for (let k = 0; k < n; k++) {
        const [f, gw, gh, px, py, t0, t1] = SHOES[(idx * 2 + k) % n];
        if (at - px * s3 + gw * s3 > x1 - 8) break;
        const m = { w: gw, h: gh, inner: py, hooks: [[px, t0, t1]], pieces: [[f, 0, 0, gw, gh, px, py]] };
        items.push({ m, s: s3, x: at - px * s3, amp: 6 });
        at += k % 2 ? OUT : IN;
      }
      if (items.length % 2) items.pop();
    } else {
      // osamu's order, spacing and overlap copied from their layout photos, always full size (2.1 books long). A
      // shelf too short for the whole rail shows only the run of pieces that fits at that spacing: the first part of
      // the rail on the upper shelves of each kind, the last part on the lower ones
      const R = RAILS[RAIL_OF[idx % RAIL_OF.length]], LIST = R.list, SINGLE_TALL = R.tall;
      // steps: how far each hanger is from the one before, in pitches (an empty hanger can sit closer)
      const steps = R.steps || LIST.slice(1).map(() => 1), units = steps.reduce((t, v) => t + v, 0);
      const n = LIST.length, PITCH = R.pitch, span = units * PITCH;
      const s2 = bookH * 2.1 / SINGLE_TALL, pitch = PITCH * s2, room = x1 - x0 - 16;
      let k = n; while (k > 1 && steps.slice(0, k - 1).reduce((t, v) => t + v, 0) * pitch > room) k--;
      const from = k < n && idx % RAIL_OF.length >= 3 ? n - k : 0;
      let at = x0 + 8;
      LIST.forEach(([f, gw, gh, px, py, t0, t1], i) => {
        if (i < from || i >= from + k) return;
        const m = { w: gw, h: gh, inner: py, hooks: [[px, t0, t1]], pieces: [[f, 0, 0, gw, gh, px, py]] };
        if (i > from) at += steps[i - 1] * pitch;
        items.push({ m, s: s2, x: at - px * s2, amp: 1.6, z: R.z ? R.z[i] : i });
      });
    }
    // centre what fits between the brackets
    if (items.length) {
      const pv = (it, k) => it.x + it.m.hooks[k < 0 ? it.m.hooks.length - 1 : 0][0] * it.s;
      const shift = (x0 + x1) / 2 - (pv(items[0], 0) + pv(items[items.length - 1], -1)) / 2;
      items.forEach((it) => { it.x += shift; });
      // drawn back to front
      items.sort((a, b) => (a.z || 0) - (b.z || 0));
    }
    let bottom = rodC + rodD;
    const tube = (l, wd) => `<i class="tube" style="left:${f1(l)}px;width:${f1(wd)}px;top:${f1(rodTop - 0.4)}px;height:${f1(rodD + 0.8)}px;background-size:auto ${f1(rod.m[1] * rs)}px;background-position:0 ${f1(-(rod.m[2] * rs - rodD / 2 - 0.4))}px"></i>`;
    // v153: every hanger (and every shoe) is its own picture, so each one swings on its own. pcs holds them in
    // the rail's pixels, back to front: the bounding box, the pivot (the inside of the hook resting on the rod)
    const pcs = [];
    const parts = items.map((it, i) => {
      const { m, s } = it, top = rodTop - m.inner * s;
      bottom = Math.max(bottom, top + m.h * s);
      const tips = m.hooks.map((h) => tube(it.x + h[1] * s - 0.5, (h[2] - h[1]) * s + 1)).join("");
      const shoe = it.amp > 3;
      const inner = m.pieces.map(([f, x, y, pw, ph, px, py], j) => {
        const n = pcs.length;
        // the heels hang a touch crooked on their hooks, each its own way
        const th0 = shoe ? ((((idx * 7 + i * 13 + j * 5) % 9) - 4) * 0.006) : 0;
        pcs.push({ shoe, x: it.x + x * s, y: top + y * s, w: pw * s, h: ph * s, cx: it.x + px * s, cy: top + py * s,
          len: Math.max(20, (y + ph - py) * s), src: railPic(f), th0, th: th0, om: 0, b: 0, bv: 0, tw: 0, tv: 0, hit: 0 });
        return `<div class="pc" data-n="${n}" style="left:${f1(x * s)}px;top:${f1(y * s)}px;width:${f1(pw * s)}px;height:${f1(ph * s)}px;transform-origin:${f1((px - x) * s)}px ${f1((py - y) * s)}px${th0 ? `;transform:rotate(${th0}rad)` : ""}"><img src="${railPic(f)}" alt="" draggable="false" decoding="async">${glints(f, x, y, s, i * 7 + j + idx * 3)}</div>`;
      }).join("");
      return `<div class="hgr" style="left:${f1(it.x)}px;top:${f1(top)}px;width:${f1(m.w * s)}px;height:${f1(m.h * s)}px">${inner}</div>${tips}`;
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
    const pcEls = el.querySelectorAll(".pc");
    pcs.forEach((p, n) => { p.el = pcEls[n]; p.img = pcEls[n].firstChild; });
    railTouch(el, el.firstChild, pcs);
    // the twinkling only runs while the rail is on screen
    if (window.IntersectionObserver) new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("vis", e.isIntersecting)), { rootMargin: "80px" }).observe(el);
    else el.classList.add("vis");
    return el;
  }

  // ------------------------------------------------------------------ touching the clothes and the heels
  // Each hanger is a pendulum hung from the rod. A tap pushes just the one under the finger, away from the side it
  // was touched on. A finger drawn across the rail brushes every piece it passes over, each one pushed as hard as
  // the finger was moving. Clothes are long and soft: they swing slowly, settle quickly, the hem trails behind the
  // hanger (a shear that follows the swing) and the hanger turns a little on the rod. Heels are short and stiff:
  // they swing faster and longer, twist on their S-hooks, and knock into the shoe beside them with a little clink.
  const PHYS = {
    cloth: { k: 22, z: 0.17, tap: 0.3, gain: 0.34, max: 0.75, lim: 0.16, tk: 14, tz: 0.18, twist: 0.6 },
    shoe: { k: 62, z: 0.09, tap: 1.45, gain: 1.5, max: 3.2, lim: 0.42, tk: 9, tz: 0.14, twist: 1.0 },
  };
  const reduce = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };
  // where each picture is see-through, so a tap on the gap between two dresses touches the one behind
  const MASKS = {};
  function maskOf(p) {
    if (MASKS[p.src] !== undefined) return MASKS[p.src];
    const im = p.img; if (!im || !im.complete || !im.naturalWidth) return null;
    try {
      const W = Math.max(1, Math.round(im.naturalWidth / 4)), H = Math.max(1, Math.round(im.naturalHeight / 4));
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const g = c.getContext("2d"); g.drawImage(im, 0, 0, W, H);
      const d = g.getImageData(0, 0, W, H).data, a = new Uint8Array(W * H);
      for (let q = 0; q < W * H; q++) a[q] = d[q * 4 + 3] > 40 ? 1 : 0;
      MASKS[p.src] = { W, H, a };
    } catch (e) { MASKS[p.src] = null; }
    return MASKS[p.src];
  }
  function solidAt(p, X, Y) {
    // undo the piece's current swing so the test follows it
    const c = Math.cos(-p.th), s = Math.sin(-p.th), dx = X - p.cx, dy = Y - p.cy;
    const lx = p.cx + dx * c - dy * s - p.x, ly = p.cy + dx * s + dy * c - p.y;
    if (lx < 0 || ly < 0 || lx >= p.w || ly >= p.h) return false;
    const m = maskOf(p); if (!m) return true;
    return !!m.a[Math.floor(ly / p.h * m.H) * m.W + Math.floor(lx / p.w * m.W)];
  }
  function railTouch(el, inner, pcs) {
    el.style.pointerEvents = "auto";
    el.style.touchAction = "pan-y";
    let raf = 0, last = 0, down = null, lastSound = 0;
    const local = (ev) => { const r = inner.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
    // front-most first: later pieces in the list are drawn over earlier ones
    const under = (X, Y) => { const out = []; for (let n = pcs.length - 1; n >= 0; n--) if (solidAt(pcs[n], X, Y)) out.push(pcs[n]); return out; };
    const draw = (p) => {
      const t = `rotate(${p.th.toFixed(4)}rad)` + (p.shoe ? "" : ` skewX(${p.b.toFixed(4)}rad)`);
      p.el.style.transform = Math.abs(p.tw) > 0.002 ? `perspective(700px) rotateY(${p.tw.toFixed(4)}rad) ${t}` : t;
    };
    const sound = (now, empty, clink) => { if (now - lastSound < (clink ? 45 : 85)) return; lastSound = now; clink ? shoeClink(clink) : hangerTick(empty); };
    function step(dt) {
      for (const p of pcs) {
        const P = p.shoe ? PHYS.shoe : PHYS.cloth;
        const k = P.k, c = 2 * P.z * Math.sqrt(k);
        const acc = -k * (p.th - p.th0) - c * p.om;
        p.om += acc * dt; p.th += p.om * dt;
        // a closet is crowded: a hanger can only swing so far before the clothes beside it hold it back
        if (Math.abs(p.th - p.th0) > P.lim) { p.th = p.th0 + Math.sign(p.th - p.th0) * P.lim; p.om *= -0.25; }
        if (!p.shoe) {
          // the hem trails the hanger: pushed one way by the hanger's swing, springing back on its own
          const bacc = -70 * p.b - 2 * 0.22 * Math.sqrt(70) * p.bv + 0.9 * acc * (p.len / 260);
          p.bv += bacc * dt; p.b = Math.max(-0.12, Math.min(0.12, p.b + p.bv * dt));
        }
        const tacc = -P.tk * p.tw - 2 * P.tz * Math.sqrt(P.tk) * p.tv;
        p.tv += tacc * dt; p.tw = Math.max(-0.5, Math.min(0.5, p.tw + p.tv * dt));
      }
      // heels side by side knock into each other. A shoe that hits one hanging still bounces back off it; two
      // swinging shoes that meet trade their swing
      for (let n = 0; n + 1 < pcs.length; n++) {
        const a = pcs[n], b = pcs[n + 1]; if (!a.shoe || !b.shoe) continue;
        const L = (a.len + b.len) / 2, room = Math.max(4, (b.cx - a.cx) - 0.8 * (a.w + b.w) / 2) / L;
        const close = (b.th - b.th0) - (a.th - a.th0); if (close <= room) continue;
        const rel = b.om - a.om; if (rel <= 0) continue;
        const still = (q) => Math.abs(q.om) < 0.25 && Math.abs(q.th - q.th0) < 0.02;
        if (still(b)) { a.om = -a.om * 0.45; a.th = a.th0 + (b.th - b.th0) - room; }
        else if (still(a)) { b.om = -b.om * 0.45; b.th = b.th0 + (a.th - a.th0) + room; }
        else { const e = 0.55, m = (a.om + b.om) / 2; a.om = m + rel * (1 + e) / 2 - rel / 2; b.om = m - rel * (1 + e) / 2 + rel / 2; }
        a.tv += rel * 0.4; b.tv -= rel * 0.4;
        sound(performance.now(), false, Math.min(1, rel / 3));
      }
    }
    function frame(now) {
      raf = 0;
      let dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
      while (dt > 0) { const h = Math.min(1 / 120, dt); step(h); dt -= h; }
      let moving = false;
      for (const p of pcs) {
        const live = Math.abs(p.th - p.th0) > 1.5e-3 || Math.abs(p.om) > 8e-3 || Math.abs(p.b) > 1e-3 || Math.abs(p.bv) > 8e-3 || Math.abs(p.tw) > 3e-3 || Math.abs(p.tv) > 1e-2;
        if (live) { moving = true; draw(p); }
        else if (p.on) { p.th = p.th0; p.om = p.b = p.bv = p.tw = p.tv = 0; draw(p); }
        if (p.on !== live) { p.on = live; p.el.classList.toggle("live", live); }
      }
      if (moving && el.isConnected) raf = requestAnimationFrame(frame);
    }
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    // push a piece; v is how fast the bottom of it is sent sideways (+ to the right), tw how much it turns
    const push = (p, v, tw) => {
      const P = p.shoe ? PHYS.shoe : PHYS.cloth, k = reduce() ? 0.35 : 1;
      const dv = Math.max(-P.max, Math.min(P.max, v)) * k;
      p.om -= dv; p.tv += tw * P.twist * k;
      kick();
    };
    el.addEventListener("pointerdown", (ev) => {
      if (ev.button > 0) return;
      const [X, Y] = local(ev);
      down = { X, Y, x: X, y: Y, t: ev.timeStamp, lt: ev.timeStamp, moved: false, id: ev.pointerId, hit: under(X, Y)[0] };
    });
    el.addEventListener("pointermove", (ev) => {
      if (!down || ev.pointerId !== down.id) return;
      const [X, Y] = local(ev), dx = X - down.x, dy = Y - down.y, dt = Math.max(8, ev.timeStamp - down.lt);
      if (!down.moved && Math.hypot(X - down.X, Y - down.Y) < 8) return;
      down.moved = true;
      const vx = dx / dt, now = ev.timeStamp;
      // everything the finger passed over since the last move: the one in front gets the full push, the ones
      // behind it are dragged along a little less
      const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 6));
      let touched = 0, empty = false;
      for (let q = 1; q <= steps; q++) {
        const px = down.x + dx * q / steps, py = down.y + dy * q / steps;
        under(px, py).forEach((p, depth) => {
          if (now - p.hit < 180) return;
          p.hit = now; touched++; empty = empty || p.len < 60;
          const P = p.shoe ? PHYS.shoe : PHYS.cloth;
          // a push lower down the piece turns it less for the same finger speed than one near the hook
          const reach = Math.max(0.35, Math.min(1, (py - p.cy) / p.len));
          push(p, vx * P.gain * (depth ? 0.55 : 1) / Math.sqrt(reach), (Math.random() - 0.5) * Math.sign(vx || 1) * 0.6);
        });
      }
      if (touched) sound(performance.now(), empty);
      down.x = X; down.y = Y; down.lt = ev.timeStamp;
    });
    const up = (ev) => {
      if (!down || ev.pointerId !== down.id) return;
      const d = down; down = null;
      if (d.moved || ev.type === "pointercancel" || ev.timeStamp - d.t > 600) return;
      const p = d.hit; if (!p) return;
      const P = p.shoe ? PHYS.shoe : PHYS.cloth;
      // tapped on its left, it swings right, and the other way round; off the middle line it turns a little too
      const off = (d.X - p.cx) / Math.max(10, p.w / 2), dir = off < 0 ? 1 : -1;
      push(p, dir * P.tap * (0.75 + 0.25 * Math.min(1, Math.abs(off))), -off * 0.5);
      sound(performance.now(), p.len < 60, p.shoe ? 0.35 : 0);
    };
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("click", (ev) => { if (under(...local(ev)).length) ev.stopPropagation(); });
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

  // a heel knocking the one beside it: a short bright clink of patent and metal, louder the harder they meet
  function shoeClink(force) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const lvl = window.ShelfSfxLevel ? window.ShelfSfxLevel() : 1; if (!lvl) return;
      const t = actx.currentTime, v = 0.02 * lvl * (0.4 + 0.6 * force);
      [[1850 + Math.random() * 300, 1], [4100 + Math.random() * 500, 0.45]].forEach(([f, k]) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = "triangle"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v * k, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.09);
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
