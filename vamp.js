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
  const reduce = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };

  // osamu's picture (2026-11-10): the two halves of a velvet drape meet in the middle of the shelf under a gold knot
  // and tassel, their tails falling at the shelf's ends. Seven ruby drops hang between them, each on its own gold chain
  // that runs up behind the velvet to somewhere under the shelf nobody can see. [across the pair, the crystal's top
  // below the shelf] in pair widths, read off their picture: the middle one lowest, the two outer ones over the tails.
  const DROPS = [[0.125, 0.54], [0.25, 0.367], [0.385, 0.452], [0.5, 0.64], [0.615, 0.452], [0.75, 0.367], [0.875, 0.54]];
  function drapesEl(w, cfg) {
    // a phone's shelf takes one pair; a wide one hangs as many phone-sized pairs side by side
    const n = Math.max(1, Math.round(w / 430)), cell = w / n;
    const cw = cell / 2, ch = cw * CO.h / CO.w, k = cw / CO.w, lift = CO.tuck * ch;
    const dh = 0.2 * cell, dw = dh * DR.w / DR.h;
    const parts = [], knots = [], drops = [];
    for (let c = 0; c < n; c++) {
      const x = c * cell;
      parts.push(`<div class="vSwag" style="left:${f1(x)}px;top:${f1(-lift)}px;width:${f1(cw)}px;height:${f1(ch)}px;transform-origin:0 0"><img src="obj/vamp-drapeL.webp" alt="" draggable="false" decoding="async"></div>`,
        `<div class="vSwag" style="left:${f1(x + cw)}px;top:${f1(-lift)}px;width:${f1(cw)}px;height:${f1(ch)}px;transform-origin:100% 0"><img src="obj/vamp-drapeR.webp" alt="" draggable="false" decoding="async"></div>`);
      knots.push(`<div class="vKnot" style="left:${f1(x + cw - KN.cx * k)}px;top:${f1(-lift + 0.006 * ch - KN.cy * k + 6)}px;width:${f1(KN.w * k)}px;height:${f1(KN.h * k)}px"><img src="obj/vamp-knot.webp" alt="" draggable="false" decoding="async"></div>`);
      DROPS.forEach(([u, v]) => { const top = v * cell; drops.push({ cx: x + u * cell, top, dh, len: top + dh, th: 0, om: 0, els: [] }); });
    }
    const box = (d, i, cls) => `<div class="${cls}" data-n="${i}" style="left:${f1(d.cx - dw / 2)}px;top:0;width:${f1(dw)}px;height:${f1(d.top + d.dh)}px;transform-origin:50% 0;--i:${i}">`;
    // the drops hang behind the velvet, chains and crystals both (osamu: they're under the drape)
    const back = drops.map((d, i) => box(d, i, "vDrop") + `<i class="vChain" style="height:${f1(d.top + d.dh * 0.03)}px"></i></div>`).join("");
    const front = drops.map((d, i) => box(d, i, "vDrop vDropF")
      + `<i class="vHalo" style="top:${f1(d.top + d.dh * 0.6)}px;width:${f1(d.dh * 1.3)}px;height:${f1(d.dh * 1.3)}px"></i>`
      + `<img src="obj/vamp-drop.webp" alt="" draggable="false" decoding="async" style="top:${f1(d.top)}px;height:${f1(d.dh)}px"></div>`).join("");
    const el = document.createElement("div");
    el.className = "lights vampDrapes" + (cfg.on ? " on" : "");
    const bottom = Math.max(ch - lift, ...drops.map((d) => d.top + d.dh)) + 8;
    el.style.height = Math.ceil(bottom) + "px";
    el.innerHTML = `<div class="vIn">${back}${front}${parts.join("")}${knots.join("")}</div>`;
    const bEls = el.querySelectorAll(".vDrop:not(.vDropF)"), fEls = el.querySelectorAll(".vDropF");
    drops.forEach((d, i) => { d.els = [bEls[i], fEls[i]]; });
    const swags = [...el.querySelectorAll(".vSwag")].map((s) => ({ el: s, b: 0, bv: 0 }));
    touch(el, drops, swags);
    return el;
  }

  // ------------------------------------------------------------------ touching them
  function touch(el, drops, swags, opt) {
    opt = opt || {};
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
    const nearDrop = (x, y) => onVelvet(x, y) ? null : drops.find((d) => Math.abs(x - d.cx) < (d.hw || Math.max(14, d.dh * 0.16)) && y > d.top - 6 && y < d.top + d.dh + 4);
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
    const bEls = el.querySelectorAll(".vDrop:not(.vDropF)"), fEls = el.querySelectorAll(".vDropF");
    drops.forEach((d, i) => { d.els = [bEls[i], fEls[i]]; });
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
    const bEls = el.querySelectorAll(".vDrop:not(.vDropF)"), fEls = el.querySelectorAll(".vDropF");
    drops.forEach((d, i) => { d.els = [bEls[i], fEls[i]]; });
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
    const gap = 15, n = Math.floor(w / gap), top = 16; // strands start behind the trim
    const lines = [], dots = [[], [], [], []], offd = [], stars = [];
    let maxY = 0;
    for (let i = 0; i < n; i++) {
      const x = (i + 0.5) * (w / n) + (R() - 0.5) * 3;
      // lengths wave gently along the shelf, with every strand a little different
      const L = unit * (0.34 + 0.12 * Math.sin(i * 0.37 + 1.3) + 0.08 * Math.sin(i * 1.71) + R() * 0.1);
      const sway = (R() - 0.5) * 2.2, y1 = top + L;
      maxY = Math.max(maxY, y1);
      lines.push(`<path d="M${f1(x)} ${top} Q${f1(x + sway)} ${f1(top + L / 2)} ${f1(x + sway * 0.4)} ${f1(y1)}"/>`);
      for (let y = top + 6 + R() * 10; y < y1; y += 12 + R() * 4) {
        const t = (y - top) / L, dx = sway * 2 * t * (1 - t) + sway * 0.4 * t * t;
        const c = `<circle cx="${f1(x + dx)}" cy="${f1(y)}" r="${(1.3 + R() * 0.6).toFixed(1)}"/>`;
        dots[Math.floor(R() * 4)].push(c); offd.push(c);
      }
      // a little paper star on some strands, at the end or part way down
      if (R() < 0.22) {
        const sy = R() < 0.6 ? y1 + 5 : top + L * (0.45 + R() * 0.4), sr = 4.5 + R() * 4;
        stars.push(`<polygon points="${starPts(x + sway * 0.3, sy, sr)}"/>`);
        maxY = Math.max(maxY, sy + sr);
      }
    }
    const H = Math.ceil(maxY + 8);
    const el = document.createElement("div");
    el.className = "lights starCurtain" + (cfg.on ? " on" : "");
    el.style.height = H + "px";
    el.innerHTML = `<svg class="scSvg" width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" aria-hidden="true">`
      + `<defs><radialGradient id="scDot"><stop offset="0" stop-color="#fffdf2"/><stop offset=".3" stop-color="#ffeab0"/><stop offset=".5" stop-color="rgba(255,205,120,.35)"/><stop offset="1" stop-color="rgba(255,190,100,0)"/></radialGradient></defs>`
      + `<g class="scWire">${lines.join("")}</g>`
      + `<g class="scOff">${offd.join("")}</g>`
      + `<g class="scStars">${stars.join("")}</g>`
      + `<g class="scLit">${dots.map((g, k) => `<g class="scTw scTw${k}">${g.join("").replace(/r="([\d.]+)"/g, (m, r) => `r="${(r * 2.2).toFixed(1)}"`)}</g>`).join("")}</g>`
      + `</svg><div class="starTrimGlow"></div><div class="starTrim"></div>`;
    return el;
  }

  const baseLights = D.lightsEl;
  D.lightsEl = (w, cfg) => (cfg && cfg.style === "vampDrapes" ? drapesEl(w, cfg) : cfg && cfg.style === "cottageLotus" ? lotusEl(w, cfg) : cfg && cfg.style === "forestCatchers" ? forestEl(w, cfg) : cfg && cfg.style === "starCurtain" ? curtainEl(w, cfg) : baseLights(w, cfg));
  // the vampire room hangs them under every shelf, lit
  if (D.LOOKS && D.LOOKS.vampire) D.LOOKS.vampire.set.lights = { style: "vampDrapes", colour: "warm", on: true };
  // and the cottage hangs its flower lamps under every shelf, lit
  if (D.LOOKS && D.LOOKS.cottage) D.LOOKS.cottage.set.lights = { style: "cottageLotus", colour: "warm", on: true };
  // the enchanted forest's wisteria becomes the painted garland with suncatchers, fireflies still drifting about
  if (D.LOOKS && D.LOOKS.forest) D.LOOKS.forest.set.lights = { style: "forestCatchers", styles: ["forestCatchers", "fireflies"], colour: "warm", on: true };
  // starry night: the light curtain and star trim instead of the old string of stars
  if (D.LOOKS && D.LOOKS.starry) D.LOOKS.starry.set.lights = { style: "starCurtain", colour: "warm", on: true };
  D.LIGHT_SWAP = { forest: { wisteria: "forestCatchers" }, starry: { stars: "starCurtain" } };
})();
