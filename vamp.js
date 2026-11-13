/* Velvet drapes: the vampire room's lights. osamu's Gemini velvet drape, red with gold rope, fringe and tassels,
   hangs in two halves under each shelf that meet in the middle under a gold knot, and between them hang ruby crystal
   drops in gold caps, each on its own gold chain from the shelf's underside, hanging behind the velvet. Each drop is
   a pendulum on its chain: a tap pushes the one under the finger, a finger drawn across brushes every drop it passes
   and stirs the velvet. With the shelf's light on, the crystals glow red from inside. */
(function () {
  const D = window.Decor;
  if (!D) return;
  const f1 = (n) => Math.round(n * 10) / 10;
  D.LIGHT_STYLES.vampDrapes = "Velvet drapes";

  // the left half of the drape as stored (the right half is its mirror), the knot and tassel where the two halves
  // meet (cut from the same painting, at the same scale), and the ruby drop
  const CO = { w: 1361, h: 2296, tuck: 0.03 };
  const KN = { w: 108, h: 449, cx: 50, cy: 35 };
  const DR = { w: 212, h: 877 };
  const CL = { w: 1300, h: 584, hem: 0.347 }; // hem: the middle swag's lowest point, in cloth widths // osamu's tablecloth front (obj/vamp-cloth-front.webp)
  const reduce = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };

  // osamu's picture (2026-11-10): the two halves of a velvet drape meet in the middle of the shelf under a gold knot
  // and tassel, their tails falling at the shelf's ends. Seven ruby drops hang between them, each on its own gold chain
  // that runs up behind the velvet to somewhere under the shelf nobody can see. [across the pair, the crystal's top
  // below the shelf] in pair widths, read off their picture: the middle one lowest, the two outer ones over the tails.
  // v345 (osamu: with the tablecloth the hanging lights were too long): each crystal now hangs just below the cloth's hem
  const DROPS = [[0.125, 0.27], [0.25, 0.23], [0.385, 0.29], [0.5, 0.34], [0.615, 0.29], [0.75, 0.23], [0.875, 0.27]];
  function drapesEl(w, cfg) {
    // a phone's shelf takes one pair; a wide one hangs as many phone-sized pairs side by side
    // an odd number of cloths, so one cloth's middle swag is always in the middle of the shelf, over the chandelier
    const n = Math.max(1, 2 * Math.round((w / 430 - 1) / 2) + 1), cell = w / n;
    const cw = cell / 2, ch = cw * CO.h / CO.w, k = cw / CO.w, lift = CO.tuck * ch;
    const dh = 0.2 * cell, dw = dh * DR.w / DR.h;
    const parts = [], knots = [], drops = [];
    // v344 (osamu): the drapes became a tablecloth: osamu's Gemini cloth lies on the shelf (its top, behind the books, is
    // the shelf's ::before, see style.css) and its front hangs over the shelf's front edge, one cloth per phone-sized cell
    const clH = cell * CL.h / CL.w;
    for (let c = 0; c < n; c++) {
      const x = c * cell;
      parts.push(`<div class="vSwag vCloth" style="left:${f1(x)}px;top:-16px;width:${f1(cell)}px;height:${f1(clH)}px;transform-origin:50% 0"><img src="obj/vamp-cloth-front.webp" alt="" draggable="false" decoding="async"></div>`);
      DROPS.forEach(([u, v]) => { const top = v * cell; drops.push({ cx: x + u * cell, top, dh, len: top + dh, th: 0, om: 0, els: [] }); });
    }
    // v350 (osamu: "remove the light, I don't like it"): no hanging light under the cloth any more, just the tablecloth
    drops.length = 0;
    const back = "", front = "";
    const el = document.createElement("div");
    el.className = "lights vampDrapes" + (cfg.on ? " on" : "");
    const bottom = clH - 16 + 8;
    el.style.height = Math.ceil(bottom) + "px";
    el.innerHTML = `<div class="vIn">${back}${front}${parts.join("")}</div>`;
    el.style.setProperty("--vcell", f1(cell) + "px"); requestAnimationFrame(() => { const sh = el.closest(".shelf"); if (sh) sh.style.setProperty("--vcell", f1(cell) + "px"); });
    const swags = [...el.querySelectorAll(".vSwag")].map((s) => ({ el: s, b: 0, bv: 0 }));
    touch(el, drops, swags);
    return el;
  }

  // ------------------------------------------------------------------ touching them
  function touch(el, drops, swags, opt) {
    opt = opt || {};
    const bands = opt.bands || [];
    el.style.pointerEvents = "auto";
    el.style.touchAction = "pan-y";
    let raf = 0, last = 0, down = null, lastSound = 0;
    const KL = 1500, Z = 0.06, MAX = 0.55; // a crystal on a long chain swings slowly and keeps going a while
    const clink = (d, v) => {
      if (opt.quiet) return;
      const now = performance.now(); if (now - lastSound < 70) return; lastSound = now;
      try { window.ShelfSfx && window.ShelfSfx.clink && window.ShelfSfx.clink(2600 + (d.cx % 7) * 90, Math.min(1, 0.25 + v * 0.5), (d.cx / innerWidth - 0.5) * 1.2); } catch (e) { /* no sound */ }
    };
    function frame(now) {
      raf = 0;
      let dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
      let moving = false;
      while (dt > 0) {
        const h = Math.min(1 / 120, dt); dt -= h;
        for (const d of drops) { const K = KL / d.len; d.om += (-K * Math.sin(d.th) - 2 * Z * Math.sqrt(K) * d.om) * h; d.th += d.om * h; }
        for (const s of swags) { s.bv += (-9 * s.b - 2 * 0.7 * Math.sqrt(9) * s.bv) * h; s.b += s.bv * h; }
        // light strands of fairy lights: they swing freely and take a while to settle
        for (const s of bands) { s.bv += (-14 * s.b - 2 * 0.11 * Math.sqrt(14) * s.bv) * h; s.b += s.bv * h; }
      }
      for (const s of bands) {
        const live = Math.abs(s.b) > 3e-4 || Math.abs(s.bv) > 3e-3;
        if (live) moving = true; else { s.b = s.bv = 0; }
        s.el.style.transform = live ? `skewX(${s.b.toFixed(4)}rad)` : "";
      }
      for (const d of drops) {
        const live = Math.abs(d.th) > 1e-3 || Math.abs(d.om) > 5e-3;
        if (live) moving = true; else { d.th = d.om = 0; }
        const tf = live ? `rotate(${d.th.toFixed(4)}rad)` : ""; d.els.forEach((e) => { e.style.transform = tf; });
      }
      for (const s of swags) {
        const live = Math.abs(s.b) > 2e-4 || Math.abs(s.bv) > 2e-3;
        if (live) moving = true; else { s.b = s.bv = 0; }
        // heavy velvet: it shifts a little, slowly, and settles without bouncing
        s.el.style.transform = live ? `skewX(${(s.b * 0.22).toFixed(4)}rad) scaleY(${(1 - Math.abs(s.b) * 0.03).toFixed(4)})` : "";
      }
      if (moving && el.isConnected) raf = requestAnimationFrame(frame);
    }
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const k = reduce() ? 0.35 : 1;
    const push = (d, v) => { const dv = Math.max(-MAX, Math.min(MAX, v)) * k * Math.min(1, 90 / d.len); d.om += dv; clink(d, Math.abs(dv) / MAX); kick(); };
    const pull = (d, side) => {
      const cord = el.parentNode && el.parentNode.querySelector(".pullCord");
      if (d.yanking) return; d.yanking = true;
      const p = Math.max(8, d.dh * 0.16);
      d.els.forEach((e) => { e.style.setProperty("--pull", p + "px"); e.style.setProperty("--cs", (((d.chain || d.top) + p) / (d.chain || d.top)).toFixed(4)); e.classList.remove("yank"); void e.offsetWidth; e.classList.add("yank"); });
      if (cord) cord.click();
      setTimeout(() => { push(d, side * 0.3); }, reduce() ? 0 : 280);
      setTimeout(() => { d.yanking = false; d.els.forEach((e) => e.classList.remove("yank")); }, 1000);
    };
    const local = (ev) => { const r = el.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
    // where the velvet is, read from the pictures' own alpha, so a tap on the drape never counts as a crystal
    const masks = {};
    const maskOf = (src) => {
      if (masks[src] !== undefined) return masks[src];
      masks[src] = null;
      const im = new Image();
      im.onload = () => { try { const c = document.createElement("canvas"); c.width = 170; c.height = Math.round(170 * im.naturalHeight / im.naturalWidth); const g = c.getContext("2d"); g.drawImage(im, 0, 0, c.width, c.height); masks[src] = { w: c.width, h: c.height, a: g.getImageData(0, 0, c.width, c.height).data }; } catch (e) { /* no mask: count it as open */ } };
      im.src = src; return null;
    };
    const onVelvet = (x, y) => swags.some((s) => {
      const r = s.el.getBoundingClientRect(), er = el.getBoundingClientRect(), img = s.el.querySelector("img");
      const lx = x - (r.left - er.left), ly = y - (r.top - er.top);
      if (lx < 0 || ly < 0 || lx >= r.width || ly >= r.height) return false;
      const m = maskOf(img.getAttribute("src")); if (!m) return false;
      const px = Math.floor(lx / r.width * m.w), py = Math.floor(ly / r.height * m.h);
      return m.a[(py * m.w + px) * 4 + 3] > 60;
    });
    swags.forEach((s) => maskOf(s.el.querySelector("img").getAttribute("src")));
    const nearDrop = (x, y) => onVelvet(x, y) ? null : drops.find((d) => !d.noTap && Math.abs(x - d.cx) < (d.hw || Math.max(14, d.dh * 0.16)) && y > d.top - 6 && y < d.top + d.dh + 4);
    el.addEventListener("pointerdown", (ev) => {
      const [x, y] = local(ev);
      down = { x, y, t: performance.now(), lx: x, lt: performance.now(), moved: false };
    });
    el.addEventListener("pointermove", (ev) => {
      if (!down) return;
      const [x, y] = local(ev), now = performance.now();
      const vx = (x - down.lx) / Math.max(8, now - down.lt); // px per ms
      if (Math.abs(x - down.x) > 6) down.moved = true;
      // brush every drop the finger crosses, and stir the velvet it passes under
      for (const d of drops) if ((down.lx - d.cx) * (x - d.cx) <= 0 && down.lx !== x) push(d, vx * 0.5);
      if (bands.length && down.lx !== x) {
        const a = Math.min(down.lx, x), b = Math.max(down.lx, x);
        for (const s of bands) if (s.x1 > a && s.x0 < b) { s.bv = Math.max(-0.7, Math.min(0.7, s.bv + vx * 0.28 * k)); kick(); }
      }
      swags.forEach((s) => { const r = s.el.getBoundingClientRect(), er = el.getBoundingClientRect(); const sx = r.left - er.left; if (x > sx && x < sx + r.width) { s.bv = Math.max(-0.25, Math.min(0.25, s.bv + vx * 0.06 * k)); kick(); } });
      down.lx = x; down.lt = now;
    });
    const up = (ev) => {
      if (!down) return;
      const [x, y] = local(ev);
      if (!down.moved) {
        const d = nearDrop(x, y);
        // a tap pushes the crystal away from the side it was touched on
        // a tap on a crystal is this room's light switch: it's pulled down on its chain like the pull cord, the
        // shelf's lights click over, and it swings as it's let go
        if (d) pull(d, x < d.cx ? 1 : -1);
        else swags.forEach((s) => { const r = s.el.getBoundingClientRect(), er = el.getBoundingClientRect(); const sx = r.left - er.left; if (x > sx && x < sx + r.width) { s.bv += (x < sx + r.width / 2 ? 1 : -1) * 0.12 * k; kick(); } });
      }
      down = null;
    };
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", () => { down = null; });
  }


  // ------------------------------------------------------------------ the cottage's flower lamps
  // osamu's idea (2026-11-10, from their photo): a driftwood branch with ivy fixed along the front of the shelf, and
  // pink lotus pendant lamps hanging from it on ivy-wound cords, at two heights so six fit on a phone. Tapping a
  // flower is the light switch, as with the vampire room's crystals.
  D.LIGHT_STYLES.cottageLotus = "Flower lamps";
  const BR = { w: 1240, h: 179, mid: 0.45 };
  // the branch's centre line across its length, every 2.5% (fraction of its height)
  const BMID = [0.472, 0.527, 0.522, 0.471, 0.472, 0.45, 0.401, 0.432, 0.426, 0.472, 0.492, 0.507, 0.56, 0.508, 0.56,
    0.55, 0.547, 0.483, 0.433, 0.39, 0.349, 0.342, 0.342, 0.3, 0.316, 0.293, 0.27, 0.288, 0.337, 0.374, 0.344, 0.395,
    0.47, 0.53, 0.56, 0.55, 0.538, 0.496, 0.383, 0.352, 0.288];
  const bmid = (u) => { const t = Math.max(0, Math.min(40, u * 40)), i = Math.min(39, Math.floor(t)); return BMID[i] + (BMID[i + 1] - BMID[i]) * (t - i); };
  const LO = { w: 400, h: 411 }, IVY = { w: 94, h: 686, cx: 41.1 };
  const DROPS_L = [50, 12, 62, 20, 54, 8]; // how far below the branch each lamp hangs, repeating
  function lotusEl(w, cfg) {
    const phone = w < 600;
    const nb = Math.max(1, Math.round(w / 700)), bw = w / nb, bk = Math.min(bw, 640) / BR.w, bh = BR.h * bk;
    // the branch sits on the shelf's front edge (the plank is 16px thick, the lights hang from its bottom)
    const by = -8 - BR.mid * bh;
    const branches = [];
    for (let i = 0; i < nb; i++) branches.push(`<div class="lBranch" style="left:${f1(i * bw - 2)}px;top:${f1(by)}px;width:${f1(bw + 4)}px;height:${f1(bh)}px"><img src="obj/cottage-branch.webp" alt="" draggable="false" decoding="async"></div>`);
    const pivotAt = (x) => { const i = Math.min(nb - 1, Math.floor(x / bw)); return by + bmid((x - i * bw) / bw) * bh; };
    const lw = phone ? 74 : 84, lh = lw * LO.h / LO.w, iw = phone ? 24 : 27, ik = iw / IVY.w;
    const x0 = 0.1 * w, x1 = 0.9 * w, n = phone ? 6 : Math.max(6, Math.round((x1 - x0) / 95) + 1);
    const drops = [];
    for (let i = 0; i < n; i++) {
      const cx = x0 + (x1 - x0) * i / (n - 1), py = pivotAt(cx), chain = DROPS_L[i % DROPS_L.length] * (phone ? 1 : 1.15) + 14;
      drops.push({ cx, py, chain, top: py + chain, dh: lh, hw: lw * 0.42, len: chain + lh * 0.5, th: 0, om: 0, els: [] });
    }
    const box = (d, i, cls) => `<div class="${cls}" data-n="${i}" style="left:${f1(d.cx - lw / 2)}px;top:${f1(d.py)}px;width:${f1(lw)}px;height:${f1(d.chain + d.dh)}px;transform-origin:50% 0;--i:${i}">`;
    const back = drops.map((d, i) => box(d, i, "vDrop") + `<i class="vChain" style="left:${f1(lw / 2 - IVY.cx * ik)}px;width:${f1(iw)}px;height:${f1(d.chain + 3)}px"><img src="obj/cottage-ivy.webp" alt="" draggable="false" decoding="async" style="width:${f1(iw)}px;top:${f1(-((i * 37) % 120))}px"></i></div>`).join("");
    const front = drops.map((d, i) => box(d, i, "vDrop vDropF")
      + `<i class="vHalo" style="top:${f1(d.chain + d.dh * 0.55)}px;width:${f1(lw * 1.7)}px;height:${f1(lw * 1.7)}px"></i>`
      + `<img src="obj/cottage-lotus.webp" alt="" draggable="false" decoding="async" style="top:${f1(d.chain)}px;height:${f1(d.dh)}px"></div>`).join("");
    const el = document.createElement("div");
    el.className = "lights cottageLotus" + (cfg.on ? " on" : "");
    el.style.height = Math.ceil(Math.max(...drops.map((d) => d.top + d.dh)) + 10) + "px";
    el.innerHTML = `<div class="vIn">${back}${front}${branches.join("")}</div>`;
    touch(el, drops, [], { quiet: true });
    return el;
  }


  // ------------------------------------------------------------------ the enchanted forest's wisteria and suncatchers
  // osamu's idea (2026-11-10): a wisteria garland across each shelf, long at the ends and short in the middle like an
  // arch, and three wire-spiral suncatchers hanging at different heights on beaded brass chains from behind the
  // flowers. The suncatchers are the light: lit, they glow and throw little rainbow spots; tapping one is the switch.
  D.LIGHT_STYLES.forestCatchers = "Wisteria & suncatchers";
  const WI = { w: 1400, h: 774, tuck: 0.035 };
  const SC = { w: 360, h: 845, chainX: 170.1, hook: 170, tileL: 147.6, tileW: 47, tileH: 92 };
  // osamu's mock-up (2026-11-10): six small suncatchers per arch, [across, the hook's depth below the shelf] in arch
  // widths, at uneven heights
  const CATCHERS = [[0.143, 0.434], [0.318, 0.375], [0.459, 0.272], [0.587, 0.381], [0.721, 0.277], [0.82, 0.461]];
  // where the glass beads and crystals catch the light on the suncatcher picture (fractions of it)
  const GLINTS = [[0.456, 0.836], [0.815, 0.33], [0.649, 0.325], [0.653, 0.599], [0.793, 0.642], [0.197, 0.391], [0.241, 0.853],
    [0.468, 0.475], [0.643, 0.856], [0.487, 0.282], [0.671, 0.446], [0.478, 0.17], [0.143, 0.629], [0.426, 0.703], [0.271, 0.542], [0.091, 0.558]];
  const SPOTS = ["255,120,200", "255,210,120", "160,140,255", "130,230,255", "255,160,120", "200,255,160"];
  function forestEl(w, cfg) {
    // the garland is a little wider than the shelf, so its long side tails are cut off by the screen's edges, and its
    // leaves start at the top of the shelf's front edge and cover it (the plank is 16px thick)
    const n = Math.max(1, Math.round(w / 430)), cell = w / n, gw = cell * 1.15, wh = gw * WI.h / WI.w, lift = WI.tuck * wh + 16;
    const sw = 0.095 * cell, k = sw / SC.w, sh = SC.h * k;
    const garlands = [], drops = [], spots = [];
    for (let c = 0; c < n; c++) {
      const x = c * cell;
      garlands.push(`<div class="vSwag fWis" style="left:${f1(x + (cell - gw) / 2)}px;top:${f1(-lift)}px;width:${f1(gw)}px;height:${f1(wh)}px;transform-origin:50% 0"><img src="obj/forest-wisteria2.webp" alt="" draggable="false" decoding="async"></div>`);
      CATCHERS.forEach(([u, v], j) => {
        const cx = x + u * cell, hook = v * cell, top = hook - SC.hook * k;
        drops.push({ cx, chain: Math.max(4, top), top, dh: sh, hw: sw * 0.55, len: hook + sh * 0.35, th: 0, om: 0, els: [] });
        // rainbow spots thrown on the wall around it
        for (let s2 = 0; s2 < 3; s2++) {
          const a = (j * 2.1 + s2 * 2.09 + c) % (Math.PI * 2), r = sw * (0.9 + ((s2 * 37 + j * 11) % 10) / 10);
          spots.push(`<i class="fSpot" style="left:${f1(cx + Math.cos(a) * r)}px;top:${f1(top + sh * 0.42 + Math.sin(a) * r * 0.8)}px;--c:${SPOTS[(s2 + j * 2) % SPOTS.length]};--d:${((s2 * 0.7 + j * 1.3) % 3).toFixed(2)}s;--s:${(0.6 + (s2 % 3) * 0.2).toFixed(2)}"></i>`);
        }
      });
    }
    const box = (d, i, cls) => `<div class="${cls}" data-n="${i}" style="left:${f1(d.cx - sw / 2)}px;top:0;width:${f1(sw)}px;height:${f1(d.top + d.dh)}px;transform-origin:50% 0;--i:${i}">`;
    // the chain from under the shelf down to the suncatcher's own chain, its links repeating
    const back = drops.map((d, i) => box(d, i, "vDrop") + (d.top > 0 ? `<i class="vChain" style="left:${f1(sw / 2 - (SC.chainX - SC.tileL) * k)}px;width:${f1(SC.tileW * k)}px;height:${f1(d.top + 1)}px;background-size:${f1(SC.tileW * k)}px ${f1(SC.tileH * k)}px"></i>` : "") + "</div>").join("");
    const front = drops.map((d, i) => box(d, i, "vDrop vDropF")
      + `<i class="vHalo" style="top:${f1(d.top + d.dh * 0.42)}px;width:${f1(sw * 2)}px;height:${f1(sw * 2)}px"></i>`
      + `<img class="fGlow" src="obj/forest-catcher.webp" alt="" draggable="false" decoding="async" style="left:${f1(sw / 2 - SC.chainX * k)}px;width:${f1(SC.w * k)}px;top:${f1(d.top)}px;height:${f1(d.dh)}px">`
      + `<img src="obj/forest-catcher.webp" alt="" draggable="false" decoding="async" style="left:${f1(sw / 2 - SC.chainX * k)}px;width:${f1(SC.w * k)}px;top:${f1(d.top)}px;height:${f1(d.dh)}px">`
      // little star glints that twinkle on the glass, each in its own rhythm
      + GLINTS.map(([gx, gy], g) => `<i class="fGlint" style="left:${f1(sw / 2 - SC.chainX * k + gx * SC.w * k)}px;top:${f1(d.top + gy * d.dh)}px;--t:${(1.6 + ((g * 7 + i * 3) % 9) * 0.22).toFixed(2)}s;--d:${(((g * 0.61 + i * 0.37) % 2.4)).toFixed(2)}s;--z:${(0.6 + ((g + i) % 4) * 0.18).toFixed(2)}"></i>`).join("")
      + "</div>").join("");
    const el = document.createElement("div");
    el.className = "lights forestCatchers" + (cfg.on ? " on" : "");
    el.style.height = Math.ceil(Math.max(wh - lift, ...drops.map((d) => d.top + d.dh)) + 10) + "px";
    // the suncatchers hang behind the wisteria; their light spots fall on the wall over everything
    el.innerHTML = `<div class="vIn">${back}${front}${garlands.join("")}<div class="fSpots">${spots.join("")}</div></div>`;
    const swags = [...el.querySelectorAll(".vSwag")].map((s2) => ({ el: s2, b: 0, bv: 0 }));
    touch(el, drops, swags);
    return el;
  }


  // ------------------------------------------------------------------ starry night: a curtain of lights and a star trim
  // osamu's idea (2026-11-10, from their photo): strands of tiny warm lights hanging close together from under the shelf
  // like a curtain, little paper stars dangling among them, and along the shelf's front a scalloped trim in the shelf's
  // own wood with a star cut into every scallop, the stars glowing when the lights are on. Drawn as one SVG; the
  // twinkle is four groups fading in turn, and switching only fades opacity.
  D.LIGHT_STYLES.starCurtain = "Light curtain";
  const rnd = (seed) => { let x = seed >>> 0 || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 10000) / 10000; }; };
  const starPts = (cx, cy, r, n = 5, inner = 0.45, rot = -Math.PI / 2) => {
    const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + (i * Math.PI) / n, rr = i % 2 ? r * inner : r; p.push(f1(cx + Math.cos(a) * rr) + "," + f1(cy + Math.sin(a) * rr)); } return p.join(" ");
  };
  function curtainEl(w, cfg) {
    const R = rnd(7919 + Math.round(w)), unit = Math.min(w, 430);
    const top = 16; // strands start behind the trim
    // the strands are kept in narrow bands, each its own little picture, so a finger brushing across them can set
    // each band swinging on its own
    const BW = 34, nb = Math.ceil(w / BW), bands = [];
    for (let i = 0; i < nb; i++) bands.push({ b: {}, lo: 1e9, hi: 0 });
    let maxY = 0;
    // three depths of strands, packed close: the back ones fainter and finer, every length different,
    // short and long mixed in clumps, a whole tumble of light
    const LAYERS = [{ gap: 9, k: 0.6, r: 0.9, cls: "b" }, { gap: 10, k: 0.8, r: 1.15, cls: "m" }, { gap: 13, k: 1, r: 1.4, cls: "f" }];
    for (const ly of LAYERS) {
      const n = Math.floor(w / ly.gap);
      for (let i = 0; i < n; i++) {
        const x = (i + 0.5) * (w / n) + (R() - 0.5) * ly.gap * 0.8;
        const bd = bands[Math.max(0, Math.min(nb - 1, Math.floor(x / BW)))];
        const g = bd.b[ly.cls] || (bd.b[ly.cls] = { lo: [], of: [], st: [], dl: [[], [], [], []] });
        const wave = 0.3 + 0.14 * Math.sin(i * ly.gap * 0.021 + ly.k * 5) + 0.1 * Math.sin(i * ly.gap * 0.11 + ly.k);
        const L = unit * Math.max(0.1, R() < 0.18 ? 0.12 + R() * 0.14 : R() < 0.15 ? wave + 0.25 + R() * 0.2 : wave + (R() - 0.3) * 0.22);
        const sway = (R() - 0.5) * 2.2, y1 = top + L;
        maxY = Math.max(maxY, y1);
        g.lo.push(`<path d="M${f1(x)} ${top} Q${f1(x + sway)} ${f1(top + L / 2)} ${f1(x + sway * 0.4)} ${f1(y1)}"/>`);
        for (let y = top + 4 + R() * 10; y < y1; y += 9 + R() * 6) {
          const t = (y - top) / L, dx = sway * 2 * t * (1 - t) + sway * 0.4 * t * t, r = ly.r * (0.85 + R() * 0.4);
          const at = `cx="${f1(x + dx)}" cy="${f1(y)}"`;
          g.dl[Math.floor(R() * 4)].push(`<circle ${at} r="${(r * 2.2).toFixed(1)}"/>`); g.of.push(`<circle ${at} r="${r.toFixed(1)}"/>`);
        }
        // little paper stars all through it, at the ends and part way down
        if (R() < (ly.cls === "b" ? 0.12 : 0.24)) {
          const sy = R() < 0.55 ? y1 + 4 : top + L * (0.3 + R() * 0.6), sr = (3.5 + R() * 4) * (0.7 + ly.k * 0.3);
          g.st.push(`<polygon points="${starPts(x + sway * 0.3, sy, sr)}"/>`);
          maxY = Math.max(maxY, sy + sr);
        }
      }
    }
    // the big paper star lanterns: three to a shelf's width, on cords of different lengths. They're the light switch.
    const groups = Math.max(1, Math.round(w / unit)), lan = [], drops = [];
    const SPOT = [[0.18, 0.3], [0.5, 0.12], [0.8, 0.36]];
    for (let k = 0; k < groups * 3; k++) {
      const sp = SPOT[k % 3], s = Math.round(unit * (0.2 + R() * 0.05));
      const x = Math.min(w - s / 2 - 4, Math.max(s / 2 + 4, (Math.floor(k / 3) + sp[0] + (R() - 0.5) * 0.05) * (w / groups)));
      const cord = Math.round(top + unit * sp[1] + R() * unit * 0.06);
      lan.push(`<div class="scLan" style="left:${f1(x - s / 2)}px;top:${top}px;width:${s}px;height:${cord - top + s}px;--cord:${cord - top}px;--sw:${(2.6 + R() * 1.4).toFixed(1)}s;--sd:${(-R() * 3).toFixed(1)}s"><div class="scLanIn">`
        + `<i class="scCord"></i><b class="scHalo"></b><img class="scOffImg" src="obj/star-lantern.webp" alt="" draggable="false"><img class="scOnImg" src="obj/star-lantern-lit.webp" alt="" draggable="false"></div></div>`);
      drops.push({ cx: x, top: cord, dh: s, hw: s * 0.42, chain: cord - top, len: cord - top + s * 0.5, th: 0, om: 0, els: [] });
      maxY = Math.max(maxY, cord + s);
    }
    const H = Math.ceil(maxY + 8);
    const el = document.createElement("div");
    el.className = "lights starCurtain" + (cfg.on ? " on" : "");
    el.style.height = H + "px";
    const layer = (g, cls) => !g ? "" : `<g class="scL${cls}"><g class="scWire">${g.lo.join("")}</g><g class="scOff">${g.of.join("")}</g><g class="scStars">${g.st.join("")}</g>`
      + `<g class="scLit">${g.dl.map((d, k) => `<g class="scTw scTw${k}">${d.join("")}</g>`).join("")}</g></g>`;
    el.innerHTML = `<svg class="scDefs" width="0" height="0" aria-hidden="true"><defs><radialGradient id="scDot"><stop offset="0" stop-color="#fffdf2"/><stop offset=".3" stop-color="#ffeab0"/><stop offset=".5" stop-color="rgba(255,205,120,.35)"/><stop offset="1" stop-color="rgba(255,190,100,0)"/></radialGradient></defs></svg>`
      + bands.map((bd, i) => `<svg class="scBand" style="left:${i * BW}px" width="${BW}" height="${H}" viewBox="${i * BW} 0 ${BW} ${H}" aria-hidden="true">${layer(bd.b.b, "b")}${layer(bd.b.m, "m")}${layer(bd.b.f, "f")}</svg>`).join("")
      + `${lan.join("")}<div class="scShade"></div><div class="starTrimGlow"></div><div class="starTrim"></div>`;
    const lEls = el.querySelectorAll(".scLan");
    drops.forEach((d, i) => { d.els = [lEls[i]]; });
    const bEls = el.querySelectorAll(".scBand");
    touch(el, drops, [], { quiet: true, bands: bands.map((bd, i) => ({ el: bEls[i], x0: i * BW, x1: (i + 1) * BW, b: 0, bv: 0 })) });
    return el;
  }

  // ------------------------------------------------------------------ the brick loft's bamboo pole and cage lamps
  // osamu's idea (2026-11-10, from their photo): a bamboo pole wound with pothos along the shelf front, the shelf's
  // full width, with black wire cage lamps and Edison bulbs hanging on thick jute rope at different heights and trailing
  // vines between them. Tapping a lamp is the light switch; a finger brushing past sets lamps and vines swaying.
  D.LIGHT_STYLES.loftCages = "Bamboo cage lamps";
  const PO = { w: 1600, h: 221, mid: 0.507 }, LC = { w: 200, h: 314 }, VN = { w: 120, h: 743 };
  const DROPS_C = [40, 96, 62, 104, 36, 78]; // rope lengths below the pole, repeating (photo: high, low, mid, low, high)
  // a thin twisted jute rope, drawn: a tan core, darker twist marks along it and a soft highlight
  const ropePath = (d, wd, id) => `<defs><pattern id="${id}" patternUnits="userSpaceOnUse" width="3.4" height="3.4" patternTransform="rotate(38)">`
    + `<rect width="3.4" height="3.4" fill="#c29a68"/><rect width="1.25" height="3.4" fill="#8a6338"/><rect x="1.9" width=".7" height="3.4" fill="#e6cc9c" opacity=".8"/></pattern></defs>`
    + `<path d="${d}" stroke="#6e4f2e" stroke-width="${wd + 1.1}"/><path d="${d}" stroke="url(#${id})" stroke-width="${wd}"/>`;
  let ropeN = 0;
  function loftEl(w, cfg) {
    const phone = w < 600, R = rnd(4243 + Math.round(w));
    const ph = Math.round(PO.h * Math.min(w, 480) / PO.w * 1.25), py = -8 - PO.mid * ph, pTop = py + ph * 0.32;
    const lw = phone ? 40 : 44, lh = lw * LC.h / LC.w, rw = 4.6;
    const x0 = 0.1 * w, x1 = 0.9 * w, n = phone ? 5 : Math.max(5, Math.round((x1 - x0) / 110) + 1);
    const drops = [];
    for (let i = 0; i < n; i++) {
      const cx = x0 + (x1 - x0) * i / (n - 1) + (R() - 0.5) * 10, chain = DROPS_C[i % DROPS_C.length] * (phone ? 1 : 1.1);
      drops.push({ cx, py: pTop, chain: chain - pTop - 8, top: chain - 8, dh: lh, hw: lw * 0.55, len: chain + lh * 0.5, th: 0, om: 0, els: [] });
    }
    const vimg = (x, y, vw, stretch, flip, cls) => `<img class="${cls || ""}" src="obj/loft-vine.webp" alt="" draggable="false" decoding="async" style="left:${f1(x - vw / 2)}px;top:${f1(y)}px;width:${f1(vw)}px;height:${f1(vw * VN.h / VN.w * stretch)}px;${flip ? "transform:scaleX(-1);" : ""}">`;
    // each lamp: its rope comes over the pole (drawn in front of it), some with a loose loop hanging beside, a vine
    // wound down the rope and spilling over the cage, then the cage and its bulb
    const lamps = drops.map((d, i) => {
      const bw = lw * 2.4, c = bw / 2, L = d.chain + 4;
      let rope = `M${f1(c)} 0 C${f1(c + 1.2)} ${f1(L * 0.35)} ${f1(c - 1.2)} ${f1(L * 0.7)} ${f1(c)} ${f1(L)}`;
      const loop = i % 2 === 0 || R() < 0.3, side = R() < 0.5 ? -1 : 1, ld = 18 + R() * 16, lwid = 7 + R() * 5;
      if (loop) rope += ` M${f1(c)} 2 C${f1(c + side * lwid * 1.6)} ${f1(ld * 0.5)} ${f1(c + side * lwid * 1.5)} ${f1(ld * 1.15)} ${f1(c + side * lwid * 0.6)} ${f1(ld)} C${f1(c + side * lwid * 0.1)} ${f1(ld * 0.9)} ${f1(c)} ${f1(ld * 0.7)} ${f1(c)} ${f1(ld * 0.5)}`;
      const svg = `<svg class="vChain lRope" width="${f1(bw)}" height="${f1(L + 2)}" viewBox="0 0 ${f1(bw)} ${f1(L + 2)}" fill="none" stroke-linecap="round" aria-hidden="true">${ropePath(rope, rw, "lrp" + (ropeN++))}</svg>`;
      // about half the ropes carry a vine wound partway down, ending somewhere on the rope or just over the cage
      const vOn = R() < 0.55, vw = 16 + R() * 5, vs = Math.max(0.5, (L * (0.5 + R() * 0.55)) / (vw * VN.h / VN.w));
      return `<div class="vDrop vDropF" data-n="${i}" style="left:${f1(d.cx - bw / 2)}px;top:${f1(d.py)}px;width:${f1(bw)}px;height:${f1(d.chain + d.dh)}px;transform-origin:50% 0;--i:${i}">`
        + `<i class="vHalo" style="top:${f1(d.chain + lh * 0.62)}px;width:${f1(lw * 5)}px;height:${f1(lw * 5)}px"></i>`
        + svg
        + `<i class="lBulb" style="left:${f1(c - lw * 0.2)}px;width:${f1(lw * 0.4)}px;top:${f1(d.chain + lh * 0.3)}px;height:${f1(lh * 0.48)}px"></i>`
        + `<img class="lCage" src="obj/loft-lamp2.webp" alt="" draggable="false" decoding="async" style="left:${f1(c - lw / 2)}px;width:${f1(lw)}px;top:${f1(d.chain)}px;height:${f1(lh)}px">`
        + `<i class="lFil" style="left:${f1(c - lw * 0.09)}px;width:${f1(lw * 0.18)}px;top:${f1(d.chain + lh * 0.38)}px;height:${f1(lh * 0.3)}px"></i>`
        + (vOn ? vimg(c + (R() - 0.5) * 4, -6, vw, vs, R() < 0.5, "lRv") : "") + `</div>`;
    }).join("");
    // long trailing vines between the lamps, two or three in each gap, some reaching past the lamps
    const vines = [];
    for (let i = 0; i < n + 1; i++) {
      const a = i === 0 ? 4 : drops[i - 1].cx, b2 = i === n ? w - 4 : drops[i].cx, k = 1 + (R() < 0.45 ? 1 : 0);
      for (let j = 0; j < k; j++) {
        const cx = a + (b2 - a) * (j + 0.5 + (R() - 0.5) * 0.5) / k, vw = 17 + R() * 8, vh = vw * VN.h / VN.w * (0.35 + R() * 0.6);
        vines.push({ cx, py: py + ph * 0.35, chain: 0, top: py + ph * 0.35, dh: vh, vw, flip: R() < 0.5, len: vh * 0.5, th: 0, om: 0, els: [], noTap: true });
      }
    }
    const vin = vines.map((v, i) => `<div class="vDrop lVine" style="left:${f1(v.cx - v.vw / 2)}px;top:${f1(v.py)}px;width:${f1(v.vw)}px;height:${f1(v.dh)}px;transform-origin:50% 0">`
      + `<img src="obj/loft-vine.webp" alt="" draggable="false" decoding="async" style="height:${f1(v.dh)}px;${v.flip ? "transform:scaleX(-1);" : ""}"></div>`).join("");
    // short sprigs tumbling over the front of the pole so it reads leafy all along, like the photo
    const sprigs = [];
    for (let x = 6 + R() * 14; x < w - 4; x += 30 + R() * 26) {
      const vw = 16 + R() * 8;
      sprigs.push(vimg(x, py + ph * (0.12 + R() * 0.2), vw, 0.18 + R() * 0.22, R() < 0.5, "lSprig"));
    }
    const el = document.createElement("div");
    el.className = "lights loftCages" + (cfg.on ? " on" : "");
    el.style.height = Math.ceil(Math.max(...drops.map((d) => d.top + d.dh), ...vines.map((v) => v.top + v.dh)) + 10) + "px";
    el.innerHTML = `<div class="vIn">${vin}<div class="lPole" style="left:-2px;top:${f1(py)}px;width:${f1(w + 4)}px;height:${f1(ph)}px"><img src="obj/loft-pole2.webp" alt="" draggable="false" decoding="async"></div>`
      + `<div class="lSprigs">${sprigs.join("")}</div>${lamps}</div>`;
    const fEls = el.querySelectorAll(".vDropF"), vEls = el.querySelectorAll(".lVine");
    drops.forEach((d, i) => { d.els = [fEls[i]]; });
    vines.forEach((v, i) => { v.els = [vEls[i]]; });
    touch(el, drops.concat(vines), [], { quiet: true });
    return el;
  }

  // ------------------------------------------------------------------ the brick loft's Edison spider
  // osamu's idea (2026-11-10, from their photo): a spider pendant whose canopy hides under the shelf. Black cords come
  // out from under the board, sag across to little hooks along its underside and drop to bare globe Edison bulbs at
  // different heights. All drawn here. Tapping a bulb is the light switch; a finger brushing past sets them swinging.
  D.LIGHT_STYLES.loftSpider = "Edison spider";
  // osamu's Gemini bulbs (round globe and teardrop), each with a lit twin; the cord stub at their top meets the cord
  const BULBS = { g: { src: "loft-globe2", iw: 120, h: 199, w: 24, cy: 0.683, sw: 8 }, t: { src: "loft-tear2", iw: 90, h: 230, w: 17, cy: 0.681, sw: 10 } };
  const KINDS = ["g", "t", "g", "g", "t", "g", "t", "g"].map((k) => BULBS[k]);
  function spiderEl(w, cfg) {
    const R = rnd(9173 + Math.round(w));
    const nc = Math.max(1, Math.round(w / 430)), cell = w / nc, hy = 3;
    const drops = [], drapes = [];
    const LEN = [52, 112, 34, 86, 128, 46, 96, 64]; // drop below each hook, left to right
    for (let c = 0; c < nc; c++) {
      const sx = (c + 0.5) * cell, k = 8;
      for (let i = 0; i < k; i++) {
        // hooks spread across the cell, a little irregular
        const u = 0.07 + 0.86 * (i + 0.5) / k + (R() - 0.5) * 0.04, hx = c * cell + u * cell;
        // the cord leaves the hidden canopy, sags, and rises to its hook
        const sxo = sx + (i - (k - 1) / 2) * 2.2, dist = Math.abs(hx - sxo), sag = 22 + dist * (0.42 + R() * 0.22);
        const dir = Math.sign(hx - sxo) || 1;
        drapes.push(`M${f1(sxo)} 8 C${f1(sxo + dir * 2)} ${f1(sag * 0.9)} ${f1(hx - dir * dist * 0.45)} ${f1(sag * 1.05)} ${f1(hx - dir * 1.5)} ${f1(hy + 2)}`);
        const len = LEN[(i + c * 3) % LEN.length] * (0.9 + R() * 0.2), kind = KINDS[(i + c * 5) % KINDS.length];
        const bw = kind.w * (0.92 + R() * 0.16), bh = bw * kind.h / kind.iw;
        drops.push({ cx: hx, py: hy, chain: len, top: hy + len, dh: bh, kind, bw, hw: bw * 0.6, len: len + bh * 0.6, th: 0, om: 0, els: [] });
      }
    }
    const bulb = (d, i) => {
      const bw = d.bw, c = Math.max(bw, 8) / 2 + 2, box = c * 2, y0 = d.chain, k = d.kind, cw = Math.max(1.5, k.sw * bw / k.iw);
      return `<div class="vDrop sDrop" data-n="${i}" style="left:${f1(d.cx - c)}px;top:${f1(d.py)}px;width:${f1(box)}px;height:${f1(d.chain + d.dh)}px;transform-origin:50% 0;--i:${i}">`
        + `<i class="vHalo" style="top:${f1(y0 + d.dh * k.cy)}px;width:${f1(bw * 6)}px;height:${f1(bw * 6)}px"></i>`
        + `<i class="vChain sCord" style="left:${f1(c - cw / 2)}px;width:${f1(cw)}px;height:${f1(y0 + 2)}px"></i>`
        + `<div class="sBulb" style="left:${f1(c - bw / 2)}px;top:${f1(y0)}px;width:${f1(bw)}px;height:${f1(d.dh)}px">`
        + `<img src="obj/${k.src}.webp" alt="" draggable="false" decoding="async"><img class="sLit" src="obj/${k.src}-lit.webp" alt="" draggable="false" decoding="async"></div></div>`;
    };
    // modern loft trim: a matte black steel fascia under the plank, perforated in a staggered dot band;
    // the bulbs below light the space behind it, so the holes glow dimly (brighter over the shorter drops)
    const trim = (w, ds) => {
      const g = ds.map((d) => {
        const a = (0.34 + 0.5 * Math.max(0, 1 - d.chain / 150)).toFixed(2);
        return `radial-gradient(ellipse ${f1(d.bw * 3.2)}px 26px at ${f1(d.cx)}px 120%, rgba(255,214,150,${a}), rgba(255,170,80,0))`;
      }).join(",");
      return `<div class="spTrim" aria-hidden="true"><i class="spTrimBack"></i><i class="spTrimLit" style="background:${g},rgba(120,64,18,.32)"></i><i class="spTrimFace"></i></div>`;
    };
    const el = document.createElement("div");
    el.className = "lights loftSpider" + (cfg.on ? " on" : "");
    const H = Math.ceil(Math.max(...drops.map((d) => d.top + d.dh)) + 10);
    el.style.height = H + "px";
    el.innerHTML = `<div class="vIn"><svg class="sDrape" width="${w}" height="${H}" viewBox="0 -6 ${w} ${H}" fill="none" aria-hidden="true">`
      + `<g class="sCords">${drapes.map((d) => `<path d="${d}"/>`).join("")}</g><g class="sCordsHi">${drapes.map((d) => `<path d="${d}"/>`).join("")}</g></svg><div class="sShade"></div>`
      + drops.map(bulb).join("") + trim(w, drops) + `</div>`;
    const dEls = el.querySelectorAll(".sDrop");
    drops.forEach((d, i) => { d.els = [dEls[i]]; });
    touch(el, drops, [], { quiet: true });
    return el;
  }

  // ---- Cozy cabin (osamu's hallway photo, lights and hung ornaments only): overlapping swags of warm icicle fairy
  // lights in several rows and depths, with red glass baubles and red stars hanging here and there. Tap an ornament
  // to switch; a swipe swings them.
  D.LIGHT_STYLES.cabinSwags = "Baubles & swags";
  function cabinEl(w, cfg) {
    const R = rnd(4409 + Math.round(w)), top = 3;
    // rows of swags: each row has its own span and depth and starts at its own offset, so the loops overlap and cross
    const ROWS = [{ span: 118, sag: 22, d: "b" }, { span: 150, sag: 40, d: "b" }, { span: 132, sag: 60, d: "m" }, { span: 176, sag: 84, d: "m" }, { span: 104, sag: 30, d: "f" }, { span: 160, sag: 104, d: "f" }];
    const L = { b: { wire: [], off: [], lit: [[], [], [], []] }, m: { wire: [], off: [], lit: [[], [], [], []] }, f: { wire: [], off: [], lit: [[], [], [], []] } };
    const pts = []; let maxY = 0;
    for (const row of ROWS) {
      const g = L[row.d], rr = row.d === "b" ? 0.75 : row.d === "m" ? 0.95 : 1.15;
      let x0 = -R() * row.span;
      while (x0 < w) {
        const span = row.span * (0.85 + R() * 0.3), sag = row.sag * (0.85 + R() * 0.3), x1 = x0 + span;
        g.wire.push(`<path d="M${f1(x0)} ${top} Q${f1((x0 + x1) / 2)} ${f1(top + sag * 2)} ${f1(x1)} ${top}"/>`);
        // icicle drops hang off the wire every few px, each with a couple of tiny bulbs
        for (let t = 0.03 + R() * 0.04; t < 0.98; t += (5.5 + R() * 3) / span) {
          const x = x0 + span * t, y = top + 4 * sag * t * (1 - t);
          if (x < -4 || x > w + 4) continue;
          const dl = 3 + R() * (row.d === "f" ? 13 : 10), n = dl > 9 ? 2 : 1;
          g.wire.push(`<path d="M${f1(x)} ${f1(y)}v${f1(dl)}"/>`);
          for (let k = 0; k <= n; k++) {
            const by = y + (k === 0 ? 0.6 : dl * k / n), r = rr * (0.8 + R() * 0.4), at = `cx="${f1(x)}" cy="${f1(by)}"`;
            g.off.push(`<circle ${at} r="${r.toFixed(2)}"/>`);
            g.lit[Math.floor(R() * 4)].push(`<circle ${at} r="${(r * 2.6).toFixed(2)}"/>`);
            maxY = Math.max(maxY, by + r * 2.6);
          }
          if (row.d !== "b" && t > 0.12 && t < 0.88) pts.push({ x, y, d: row.d });
        }
        x0 = x1 - row.span * (0.04 + R() * 0.08);
      }
    }
    // ornaments (osamu's Gemini paintings): red baubles and stars on red ribbons, clear acrylic icicles and shapes on
    // fine clear threads, mixed here and there. h = height in px on screen, hx = where the loop sits across the picture
    const ORN = {
      gloss: { src: "cabin-red-gloss", ar: 0.829, h: 25, hx: 0.486, red: 1 }, swirl: { src: "cabin-red-swirl", ar: 0.829, h: 25, hx: 0.486, red: 1 },
      star: { src: "cabin-red-star", ar: 0.894, h: 27, hx: 0.503, red: 1 }, rheart: { src: "cabin-red-heart", ar: 0.947, h: 23, hx: 0.5, red: 1 },
      spire: { src: "cabin-red-spire", ar: 0.28, h: 44, hx: 0.491, red: 1 }, ribbed: { src: "cabin-red-ribbed", ar: 0.806, h: 25, hx: 0.5, red: 1 },
      ronion: { src: "cabin-red-onion", ar: 0.606, h: 30, hx: 0.495, red: 1 },
      snow: { src: "cabin-snow", ar: 0.825, h: 28, hx: 0.497 }, tree: { src: "cabin-tree", ar: 0.635, h: 29, hx: 0.5 }, deer: { src: "cabin-deer", ar: 0.635, h: 29, hx: 0.437 },
      twist: { src: "cabin-ice-twist", ar: 0.2, h: 46, hx: 0.548 }, drop: { src: "cabin-ice-drop", ar: 0.296, h: 42, hx: 0.448 },
      ice: { src: "cabin-ice-plain", ar: 0.146, h: 44, hx: 0.434 }, bead: { src: "cabin-ice-bead", ar: 0.215, h: 42, hx: 0.455 },
      bell: { src: "cabin-clear-bell", ar: 0.818, h: 24, hx: 0.496 }, cheart: { src: "cabin-clear-heart", ar: 0.988, h: 23, hx: 0.497 },
      cone: { src: "cabin-clear-cone", ar: 0.571, h: 29, hx: 0.49 }, conion: { src: "cabin-clear-onion", ar: 0.505, h: 36, hx: 0.45 },
    };
    // red and clear take turns; shapes are spread so the same one rarely sits close to itself
    const CYCLE = ["gloss", "bell", "spire", "snow", "rheart", "twist", "ribbed", "cone", "star", "drop", "ronion", "cheart", "swirl", "deer",
      "spire", "conion", "gloss", "tree", "rheart", "ice", "ribbed", "bead", "star", "bell", "swirl", "cheart", "ronion", "cone", "gloss", "snow"];
    // v263 (osamu): more ornaments, each on a thin red satin ribbon tied in a bow or a fine gold chain; the ornaments are
    // the lights, glowing warm from inside when switched on
    const nOrn = Math.max(5, Math.round(w / 430 * 10)), drops = [], BIG = 1.6;
    const LENS = [96, 150, 120, 176, 106, 140, 160, 112, 132, 168];
    maxY = 0;
    for (let i = 0; i < nOrn; i++) {
      const x = (i + 0.5) / nOrn * w + (R() - 0.5) * (w / nOrn) * 0.3;
      const o = ORN[CYCLE[(i + Math.floor(w / 97)) % CYCLE.length]], hh = o.h * BIG * (0.9 + R() * 0.2), ww = hh * o.ar;
      const py = -6, rib = LENS[i % LENS.length] * (0.92 + R() * 0.16);
      drops.push({ cx: x, py, chain: rib, top: py + rib, dh: hh, hw: Math.max(12, ww * 0.6), len: rib + hh * 0.6, th: 0, om: 0, els: [], o, hh, ww, gold: i % 3 === 1 });
      maxY = Math.max(maxY, py + rib + hh);
    }
    const bauble = (d, i) => {
      const c = Math.max(d.ww * Math.max(d.o.hx, 1 - d.o.hx), 9) + 2, box = c * 2, src = `obj/${d.o.src}.webp`;
      // v264 (osamu: the ornaments looked unattached): the bow is tied right over the ornament's glass loop, so its knot
      // covers the loop; the chain runs down into the loop and ends in a small gold jump ring through it
      const L = d.hh * 0.035 + 0.6, ly = d.chain + L;
      const ring = (cls, dd) => `<svg class="${cls}" viewBox="-4 -5 8 10" style="left:${f1(c - 4)}px;top:${f1(ly - 5)}px"><path d="${dd}"/></svg>`;
      const hang = d.gold
        ? `<i class="cChain" style="left:${f1(c - 1.5)}px;height:${f1(ly - 1.8)}px"></i>` + ring("cRingB", "M0 -2.6 A1.8 2.6 0 1 1 0 2.6 A1.8 2.6 0 1 1 0 -2.6")
        : `<i class="cRibbon" style="left:${f1(c - 1.67)}px;height:${f1(ly - 2)}px"></i>`;
      const front = d.gold ? ring("cRingF", "M0 -2.6 A1.8 2.6 0 0 0 0 2.6") : `<i class="cBow" style="left:${f1(c - 9)}px;top:${f1(ly - 5.6)}px"></i>`;
      return `<div class="vDrop cDrop${d.o.red ? " cRed" : " cClear"}" data-n="${i}" style="left:${f1(d.cx - c)}px;top:${f1(d.py)}px;width:${f1(box)}px;height:${f1(d.chain + d.hh)}px;transform-origin:50% 0;--i:${i};--o:${(d.cx / w).toFixed(3)}">`
        + `<i class="cHalo" style="top:${f1(d.chain + d.hh * 0.55)}px;width:${f1(d.ww * 4)}px;height:${f1(d.hh * 3)}px"></i>${hang}`
        + `<div class="cOrn" style="left:${f1(c - d.ww * d.o.hx)}px;top:${f1(d.chain)}px;width:${f1(d.ww)}px;height:${f1(d.hh)}px">`
        + `<img class="cDim" src="${src}" alt="" draggable="false" decoding="async"><img class="cOn" src="${src}" alt="" draggable="false" decoding="async">`
        + `<i class="cIn" style="-webkit-mask-image:url(${src});mask-image:url(${src})"></i>`
        + `<i class="cGlint" style="left:${f1(d.ww * 0.68)}px;top:${f1(d.hh * (d.o.ar < 0.35 ? 0.22 : 0.36))}px;width:${f1(Math.min(32, Math.max(18, d.ww * 0.95)))}px;height:${f1(Math.min(32, Math.max(18, d.ww * 0.95)))}px"></i></div>${front}</div>`;
    };
    // v266 (osamu: switching should feel festive): glints that wink along the snowy lip, swept left to right when the
    // lights come on and twinkling now and then while they're on
    let sparks = "";
    for (let x = 6 + R() * 14; x < w - 4; x += 22 + R() * 20) {
      const s = 8 + R() * 7;
      sparks += `<i style="left:${f1(x - s / 2)}px;top:${f1(8 + R() * 30 - s / 2)}px;width:${f1(s)}px;height:${f1(s)}px;--o:${(x / w).toFixed(3)};--sd:${(R() * 7).toFixed(2)}s"></i>`;
    }
    const H = Math.ceil(maxY + 10);
    const el = document.createElement("div");
    el.className = "lights cabinSwags" + (cfg.on ? " on" : "");
    el.style.height = H + "px";
    const layer = (k) => { const g = L[k]; return `<svg class="cRow cRow${k}" width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" aria-hidden="true"><g class="cWire">${g.wire.join("")}</g><g class="cOff">${g.off.join("")}</g>`
      + `<g class="cLit">${g.lit.map((d, j) => `<g class="cTw cTw${j}">${d.join("")}</g>`).join("")}</g></svg>`; };
    el.innerHTML = `<div class="vIn"><svg class="cDefs" width="0" height="0" aria-hidden="true"><defs>`
      + `<radialGradient id="cbDot"><stop offset="0" stop-color="#fffbe8"/><stop offset=".28" stop-color="#ffe3a6"/><stop offset=".55" stop-color="rgba(255,196,110,.3)"/><stop offset="1" stop-color="rgba(255,180,90,0)"/></radialGradient>`
      + `</defs></svg><div class="cShade"></div>${drops.map(bauble).join("")}<div class="cSnow" aria-hidden="true"><i class="cSnowLit"></i></div><div class="cSparks" aria-hidden="true">${sparks}</div></div>`;
    const dEls = el.querySelectorAll(".cDrop");
    drops.forEach((d, i) => { d.els = [dEls[i]]; });
    touch(el, drops, []);
    // v266: a little run of glass bells as the lights sweep on (rising, left to right), falling softly when they go off
    const NOTES = [1568, 1760, 2093, 2349, 2637, 3136, 3520];
    let was = el.classList.contains("on");
    new MutationObserver(() => {
      const on = el.classList.contains("on"); if (on === was) return; was = on;
      if (!el.isConnected || !window.ShelfSfx || !window.ShelfSfx.clink) return;
      const seq = on ? NOTES : NOTES.slice(0, 4).reverse(), step = on ? 120 : 140;
      seq.forEach((f, j) => setTimeout(() => { try { window.ShelfSfx.clink(f, on ? 0.55 - j * 0.03 : 0.3, (j / (seq.length - 1) - 0.5) * (on ? 1 : -1)); } catch (e) { /* no sound */ } }, j * step));
    }).observe(el, { attributes: true, attributeFilter: ["class"] });
    return el;
  }

  // ------------------------------------------------------------------ the tea house's beaded silk lanterns
  // osamu's idea (2026-11-13, from their photo): a red paper lantern painted with gold peonies, hanging
  // below the red lambrequin valance. Two Gemini paintings (unlit and lit, matched pixel for pixel), repeated at different
  // sizes and heights, every other one mirrored. Tapping a lantern is the light switch; a swipe sets them swaying.
  D.LIGHT_STYLES.teaBeads = "Beaded silk lanterns";
  const TL = { w: 240, h: 599, globeTop: 0.285, globeMid: 0.488, src: 1068, cordW: 32, cordH: 300, flameX: 0.497, flameY: 0.498, ringTop: 140 / 599 }; // flameX/Y: the foot of the painted candle flame // 1068px wide at source; the cord tile is cut from its own cord
  const TDROP = [134, 168, 146, 176, 138, 160, 150]; // how far below the shelf each lantern's silk globe starts, repeating
  const TSIZE = [1, 0.86, 0.94, 0.8, 1.04, 0.9, 0.84];
  function teaEl(w, cfg) {
    const phone = w < 600, base = phone ? 50 : 56;
    const n = Math.max(3, Math.round(w / (phone ? 98 : 120))), gap = w / n;
    const drops = [];
    for (let i = 0; i < n; i++) {
      const lw = base * TSIZE[i % TSIZE.length], lh = lw * TL.h / TL.w, chain = TDROP[i % TDROP.length] * (phone ? 0.9 : 1) - lh * TL.globeTop;
      const cx = gap * (i + 0.5) + ((i * 29) % 11) - 5;
      drops.push({ cx, lw, chain, top: chain + lh * TL.globeTop, dh: lh * (1 - TL.globeTop), hw: lw * 0.5, len: chain + lh * TL.globeMid, th: 0, om: 0, els: [], flip: i % 2 === 1 });
    }
    const html = drops.map((d, i) => {
      const lh = d.lw * TL.h / TL.w, sh = Math.max(0, d.chain + lh * TL.ringTop), k = d.lw / TL.src; // v389: our one cord runs all the way down behind the ring (the painted cord is erased)
      return `<div class="vDrop" data-n="${i}" style="left:${f1(d.cx - d.lw / 2)}px;top:0;width:${f1(d.lw)}px;height:${f1(d.chain + lh)}px;transform-origin:50% 0;--i:${i}">`
        + `<i class="vChain" style="left:${f1(d.lw / 2 - TL.cordW / 2 * k)}px;width:${f1(TL.cordW * k)}px;height:${f1(sh)}px;background-size:${f1(TL.cordW * k)}px ${f1(TL.cordH * k)}px"></i>`
        + `<i class="vHalo" style="top:${f1(d.chain + lh * TL.globeMid)}px;width:${f1(d.lw * 2.4)}px;height:${f1(d.lw * 2.4)}px"></i>`
        + `<img class="tOff" src="obj/tea-paper-off2.webp" alt="" draggable="false" decoding="async" style="top:${f1(d.chain)}px;height:${f1(lh)}px${d.flip ? ";transform:scaleX(-1)" : ""}">`
        + `<img class="tOn" src="obj/tea-paper-glow2.webp" alt="" draggable="false" decoding="async" style="top:${f1(d.chain)}px;height:${f1(lh)}px${d.flip ? ";transform:scaleX(-1)" : ""}">`
        + `</div>`;
    }).join("");
    const el = document.createElement("div");
    el.className = "lights teaBeads" + (cfg.on ? " on" : "");
    el.style.height = Math.ceil(Math.max(...drops.map((d) => d.chain + d.lw * TL.h / TL.w)) + 8) + "px";
    el.innerHTML = `<div class="vIn">${html}</div>`;
    el.querySelectorAll(".vDrop").forEach((e, i) => drops[i].els.push(e));
    setTimeout(() => el.classList.add("tReady"), 1000);
    touch(el, drops, [], { quiet: true });
    return el;
  }

  // ------------------------------------------------------------------ the witch's tower: dewy webs and dew spiders
  // osamu's idea (2026-11-13, from their photos): a big and a small dew-covered cobweb under each shelf (which side gets the
  // big one alternates by shelf), and three spiders woven out of the same dewy silk, hanging on single threads. The spiders
  // are the light: a cold moonlight glows inside them, and when they light up they let themselves down a little on their
  // threads; switching off they climb back up as they dim. The web's drops twinkle finely. All pictures are osamu's Gemini
  // paintings (black background, cut out by brightness); the lit twins are made in code. Tap a spider to switch, swipe to swing.
  D.LIGHT_STYLES.witchWeb = "Dew webs & spiders";
  const WEB = { big: { ar: 587 / 900, tw: [[0.331, 0.531], [0.509, 0.625], [0.801, 0.324], [0.686, 0.509], [0.204, 0.321], [0.418, 0.606], [0.228, 0.727], [0.394, 0.22], [0.431, 0.502], [0.149, 0.14], [0.294, 0.327], [0.843, 0.233], [0.729, 0.451], [0.404, 0.425], [0.331, 0.047], [0.324, 0.218], [0.658, 0.351], [0.894, 0.135], [0.417, 0.078], [0.49, 0.552], [0.74, 0.349], [0.537, 0.152]] },
    small: { ar: 435 / 540, tw: [[0.59, 0.245], [0.206, 0.197], [0.253, 0.223], [0.146, 0.133], [0.634, 0.408], [0.839, 0.215], [0.703, 0.376], [0.247, 0.506], [0.245, 0.575], [0.435, 0.384], [0.739, 0.439], [0.856, 0.324]] } };
  const SPTW = [[[0.536, 0.412], [0.448, 0.766], [0.554, 0.542], [0.688, 0.29], [0.749, 0.813], [0.839, 0.357]], [[0.17, 0.309], [0.384, 0.562], [0.375, 0.405], [0.636, 0.202], [0.062, 0.529], [0.46, 0.169]], [[0.438, 0.419], [0.366, 0.74], [0.855, 0.299], [0.239, 0.28], [0.757, 0.557], [0.504, 0.765]]]; // where the spiders' drops twinkle
  // spider pictures: size in css px at full size, and where the thread meets the spider (fractions of the picture)
  const SPI = [{ src: 1, w: 77, h: 96, ax: 0.510, ay: 0.401 }, { src: 2, w: 72, h: 93.5, ax: 0.495, ay: 0.160 }, { src: 3, w: 44.5, h: 96, ax: 0.490, ay: 0.417 }];
  function witchEl(w, cfg) {
    const phone = w < 600, k = phone ? 0.82 : 1;
    const bw = Math.min(w * 0.7, 380), bh = bw * WEB.big.ar, sw_ = Math.min(w * 0.42, 230), sh_ = sw_ * WEB.small.ar;
    let seed = 7; for (const c of String(cfg.seed || "")) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
    const flip = seed % 2 === 1; // big web on the right on every other shelf
    const X = (x) => (flip ? w - x : x);
    const webHtml = (kind, ww, wh, right) => `<div class="wWeb" style="${right ? "right" : "left"}:0;top:0;width:${f1(ww)}px;height:${f1(wh)}px${right ? ";transform:scaleX(-1)" : ""}">`
      + `<img class="tOff" src="obj/witch-dew-${kind}.webp" alt="" draggable="false" decoding="async"><img class="tOn" src="obj/witch-dew-${kind}-gem.webp" alt="" draggable="false" decoding="async">`
      + WEB[kind].tw.map(([x, y], j) => `<i class="wTw" style="left:${f1(x * 100)}%;top:${f1(y * 100)}%;--j:${j}"></i>`).join("") + `</div>`;
    const webs = webHtml("big", bw, bh, flip) + webHtml("small", sw_, sh_, !flip);
    // two spiders under the big web, one under the small one, at different heights
    const spots = [{ x: bw * 0.3, len: bh * 0.62, s: 0 }, { x: bw * 0.74, len: bh * 0.36, s: 1 }, { x: w - sw_ * 0.5, len: sh_ * 0.95, s: 2 }];
    const drops = spots.map((p, i) => {
      const S = SPI[p.s], sw = S.w * k, sh = S.h * k, cx = X(p.x), chain = p.len - sh * S.ay;
      return { cx, sw, sh, S, chain, top: chain, dh: sh, hw: sw * 0.42, len: chain + sh * 0.5, th: 0, om: 0, els: [], mir: flip !== (i === 2) };
    });
    const html = drops.map((d, i) => {
      const ax = d.mir ? 1 - d.S.ax : d.S.ax, thread = d.chain + d.sh * d.S.ay;
      return `<div class="vDrop" data-n="${i}" style="left:${f1(d.cx - ax * d.sw)}px;top:0;width:${f1(d.sw)}px;height:${f1(d.chain + d.sh)}px;transform-origin:${f1(ax * 100)}% 0;--i:${i};--L:${f1(thread)}px">`
        + `<i class="wThread" style="left:${f1(ax * d.sw - 0.5)}px;height:${f1(thread + 3)}px"></i>`
        + `<div class="wSp" style="top:${f1(d.chain)}px;height:${f1(d.sh)}px${d.mir ? ";transform:scaleX(-1)" : ""}">`
        + `<img class="tOff" src="obj/witch-dewspider${d.S.src}.webp" alt="" draggable="false" decoding="async">`
        + `<img class="tOn" src="obj/witch-dewspider${d.S.src}-gem.webp" alt="" draggable="false" decoding="async">`
        + SPTW[d.S.src - 1].map(([x, y], j) => `<i class="wTw" style="left:${f1(x * 100)}%;top:${f1(y * 100)}%;--j:${j + i * 3}"></i>`).join("") + `</div></div>`;
    }).join("");
    const el = document.createElement("div");
    el.className = "lights witchWeb" + (cfg.on ? " on" : "");
    el.style.height = Math.ceil(Math.max(bh, sh_, ...drops.map((d) => d.chain + d.sh + 16)) + 8) + "px";
    el.innerHTML = `<div class="vIn">${webs}${html}</div>`;
    el.querySelectorAll(".vDrop").forEach((e, i) => drops[i].els.push(e));
    setTimeout(() => el.classList.add("tReady"), 1000);
    touch(el, drops, [], { quiet: true });
    return el;
  }

  const baseLights = D.lightsEl;
  D.lightsEl = (w, cfg) => (cfg && cfg.style === "vampDrapes" ? drapesEl(w, cfg) : cfg && cfg.style === "cottageLotus" ? lotusEl(w, cfg) : cfg && cfg.style === "forestCatchers" ? forestEl(w, cfg) : cfg && cfg.style === "starCurtain" ? curtainEl(w, cfg) : cfg && cfg.style === "loftCages" ? loftEl(w, cfg) : cfg && cfg.style === "loftSpider" ? spiderEl(w, cfg) : cfg && cfg.style === "cabinSwags" ? cabinEl(w, cfg) : cfg && cfg.style === "teaBeads" ? teaEl(w, cfg) : cfg && cfg.style === "witchWeb" ? witchEl(w, cfg) : baseLights(w, cfg));
  if (D.LOOKS && D.LOOKS.teahouse) D.LOOKS.teahouse.set.lights = { style: "teaBeads", colour: "warm", on: true };
  if (D.LOOKS && D.LOOKS.witch) D.LOOKS.witch.set.lights = { style: "witchWeb", colour: "warm", on: true };
  // the vampire room hangs them under every shelf, lit
  if (D.LOOKS && D.LOOKS.vampire) D.LOOKS.vampire.set.lights = { style: "vampDrapes", colour: "warm", on: true };
  // the cottage no longer hangs its flower lamps by default (v379, rose shelf); they stay in the ✦ menu
  if (D.LOOKS && D.LOOKS.cottage) D.LOOKS.cottage.set.lights = { style: "none", colour: "warm", on: false };
  // the enchanted forest's wisteria becomes the painted garland with suncatchers, fireflies still drifting about
  if (D.LOOKS && D.LOOKS.forest) D.LOOKS.forest.set.lights = { style: "forestCatchers", styles: ["forestCatchers", "fireflies"], colour: "warm", on: true };
  // starry night: the light curtain and star trim instead of the old string of stars
  if (D.LOOKS && D.LOOKS.starry) D.LOOKS.starry.set.lights = { style: "starCurtain", colour: "warm", on: true };
  // the brick loft: the bamboo pole with cage lamps instead of the old globe string
  if (D.LOOKS && D.LOOKS.loft) D.LOOKS.loft.set.lights = { style: "loftSpider", colour: "warm", on: true };
  if (D.LOOKS && D.LOOKS.cabin) D.LOOKS.cabin.set.lights = { style: "cabinSwags", colour: "warm", on: true };
  D.LIGHT_SWAP = { forest: { wisteria: "forestCatchers" }, starry: { stars: "starCurtain" }, loft: { globe: "loftSpider", loftCages: "loftSpider" }, cabin: { fairy: "cabinSwags" }, teahouse: { chinese: "teaBeads" } };
})();
