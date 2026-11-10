/* Velvet drapes: the vampire room's lights. osamu's Gemini velvet drape, red with gold rope, fringe and tassels,
   hangs in two halves under each shelf that meet in the middle under a gold knot, and between them hang ruby crystal
   drops in gold caps, each on its own gold chain that runs up behind the velvet to the shelf's underside. Each drop is
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
    // the chains go behind the velvet, the crystals in front of it
    const back = drops.map((d, i) => box(d, i, "vDrop") + `<i class="vChain" style="height:${f1(d.top + d.dh * 0.03)}px"></i></div>`).join("");
    const front = drops.map((d, i) => box(d, i, "vDrop vDropF")
      + `<i class="vHalo" style="top:${f1(d.top + d.dh * 0.6)}px;width:${f1(d.dh * 1.3)}px;height:${f1(d.dh * 1.3)}px"></i>`
      + `<img src="obj/vamp-drop.webp" alt="" draggable="false" decoding="async" style="top:${f1(d.top)}px;height:${f1(d.dh)}px"></div>`).join("");
    const el = document.createElement("div");
    el.className = "lights vampDrapes" + (cfg.on ? " on" : "");
    const bottom = Math.max(ch - lift, ...drops.map((d) => d.top + d.dh)) + 8;
    el.style.height = Math.ceil(bottom) + "px";
    el.innerHTML = `<div class="vIn">${back}${parts.join("")}${knots.join("")}${front}</div>`;
    const bEls = el.querySelectorAll(".vDrop:not(.vDropF)"), fEls = el.querySelectorAll(".vDropF");
    drops.forEach((d, i) => { d.els = [bEls[i], fEls[i]]; });
    const swags = [...el.querySelectorAll(".vSwag")].map((s) => ({ el: s, b: 0, bv: 0 }));
    touch(el, drops, swags);
    return el;
  }

  // ------------------------------------------------------------------ touching them
  function touch(el, drops, swags) {
    el.style.pointerEvents = "auto";
    el.style.touchAction = "pan-y";
    let raf = 0, last = 0, down = null, lastSound = 0;
    const KL = 1500, Z = 0.06, MAX = 0.55; // a crystal on a long chain swings slowly and keeps going a while
    const clink = (d, v) => {
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
        for (const s of swags) { s.bv += (-30 * s.b - 2 * 0.2 * Math.sqrt(30) * s.bv) * h; s.b += s.bv * h; }
      }
      for (const d of drops) {
        const live = Math.abs(d.th) > 1e-3 || Math.abs(d.om) > 5e-3;
        if (live) moving = true; else { d.th = d.om = 0; }
        const tf = live ? `rotate(${d.th.toFixed(4)}rad)` : ""; d.els.forEach((e) => { e.style.transform = tf; });
      }
      for (const s of swags) {
        const live = Math.abs(s.b) > 2e-4 || Math.abs(s.bv) > 2e-3;
        if (live) moving = true; else { s.b = s.bv = 0; }
        // the loop of velvet lifts and settles a touch, its tails trailing
        s.el.style.transform = live ? `skewX(${(s.b * 0.35).toFixed(4)}rad) scaleY(${(1 - Math.abs(s.b) * 0.08).toFixed(4)})` : "";
      }
      if (moving && el.isConnected) raf = requestAnimationFrame(frame);
    }
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const k = reduce() ? 0.35 : 1;
    const push = (d, v) => { const dv = Math.max(-MAX, Math.min(MAX, v)) * k * Math.min(1, 90 / d.len); d.om += dv; clink(d, Math.abs(dv) / MAX); kick(); };
    const local = (ev) => { const r = el.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
    const nearDrop = (x, y) => drops.find((d) => Math.abs(x - d.cx) < Math.max(14, d.dh * 0.16) && y > d.top - 6 && y < d.top + d.dh + 4);
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
      swags.forEach((s) => { const r = s.el.getBoundingClientRect(), er = el.getBoundingClientRect(); const sx = r.left - er.left; if (x > sx && x < sx + r.width) { s.bv += vx * 0.25 * k; kick(); } });
      down.lx = x; down.lt = now;
    });
    const up = (ev) => {
      if (!down) return;
      const [x, y] = local(ev);
      if (!down.moved) {
        const d = nearDrop(x, y);
        // a tap pushes the crystal away from the side it was touched on
        if (d) push(d, (x < d.cx ? 1 : -1) * 0.42);
        else swags.forEach((s) => { const r = s.el.getBoundingClientRect(), er = el.getBoundingClientRect(); const sx = r.left - er.left; if (x > sx && x < sx + r.width) { s.bv += (x < sx + r.width / 2 ? 1 : -1) * 0.4 * k; kick(); } });
      }
      down = null;
    };
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", () => { down = null; });
  }

  const baseLights = D.lightsEl;
  D.lightsEl = (w, cfg) => (cfg && cfg.style === "vampDrapes" ? drapesEl(w, cfg) : baseLights(w, cfg));
  // the vampire room hangs them under every shelf, lit
  if (D.LOOKS && D.LOOKS.vampire) D.LOOKS.vampire.set.lights = { style: "vampDrapes", colour: "warm", on: true };
})();
