/* Velvet drapes: the vampire room's lights. osamu's Gemini swag of burgundy velvet and cream lace hangs in loops
   under the shelf, knot to knot, and a ruby crystal drop in a gold cap hangs below the middle of each loop.
   Each drop is a pendulum on its chain: a tap pushes the one under the finger, a finger drawn across the drapes
   brushes every drop it passes and makes the velvet stir. With the shelf's light on, the crystals glow red from
   inside and wash the lace with a warm red light. */
(function () {
  const D = window.Decor;
  if (!D) return;
  const f1 = (n) => Math.round(n * 10) / 10;
  D.LIGHT_STYLES.vampDrapes = "Velvet drapes";

  // the pictures, at the size they are stored: the swag's knot centres, how far its lace and tails reach, and the
  // drop's ring
  const SW = { w: 1066, h: 772, k0: 92.5, k1: 970, top: 6, lace: 558 };
  const DR = { w: 212, h: 877, ring: 106 };
  const reduce = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };

  function drapesEl(w, cfg) {
    const bookH = w < 560 ? 196 : 246, inset = 4;
    // loops about three quarters of a book tall apart, a whole number of them across the shelf
    const n = Math.max(2, Math.round((w - 2 * inset) / (bookH * 0.75)));
    const span = (w - 2 * inset) / n, k = span / (SW.k1 - SW.k0);
    // the knots tuck up under the shelf's front edge
    const lift = SW.top * k + 4;
    const dh = bookH * 0.3, dw = (dh * DR.w) / DR.h;
    const chain = 7; // gold chain from the lace down to the drop's ring
    const parts = [], drops = [];
    for (let i = 0; i < n; i++) {
      const kx = inset + i * span;
      parts.push(`<div class="vSwag" style="left:${f1(kx - SW.k0 * k)}px;top:${f1(-lift)}px;width:${f1(SW.w * k)}px;height:${f1(SW.h * k)}px;z-index:${i % 2 ? 2 : 1}"><img src="obj/vamp-swag.webp" alt="" draggable="false" decoding="async"></div>`);
      // the drop hangs on a fine chain that comes down behind the velvet and out under the lace
      const cx = kx + span / 2, top = SW.lace * k - lift - 6;
      drops.push({ cx, top, len: chain + dh * 0.62, th: 0, om: 0 });
    }
    const dropHtml = drops.map((d, i) => `<div class="vDrop" data-n="${i}" style="left:${f1(d.cx - dw / 2)}px;top:${f1(-lift + 2)}px;width:${f1(dw)}px;height:${f1(d.top + lift - 2 + chain + dh)}px;transform-origin:50% 0;--i:${i}">`
      + `<i class="vChain" style="height:${f1(d.top + lift - 2 + chain + dh * 0.04)}px"></i>`
      + `<i class="vHalo" style="top:${f1(d.top + lift - 2 + chain + dh * 0.58)}px"></i>`
      + `<img src="obj/vamp-drop.webp" alt="" draggable="false" decoding="async" style="top:${f1(d.top + lift - 2 + chain)}px;height:${f1(dh)}px"></div>`).join("");
    const el = document.createElement("div");
    el.className = "lights vampDrapes" + (cfg.on ? " on" : "");
    const bottom = Math.max(SW.h * k - lift, ...drops.map((d) => d.top + chain + dh)) + 6;
    el.style.height = Math.ceil(bottom) + "px";
    el.innerHTML = `<div class="vIn">${dropHtml}${parts.join("")}</div>`;
    const dEls = el.querySelectorAll(".vDrop"), sEls = el.querySelectorAll(".vSwag");
    drops.forEach((d, i) => { d.el = dEls[i]; });
    const swags = [...sEls].map((s) => ({ el: s, b: 0, bv: 0 }));
    touch(el, drops, swags, dh);
    return el;
  }

  // ------------------------------------------------------------------ touching them
  function touch(el, drops, swags, dh) {
    el.style.pointerEvents = "auto";
    el.style.touchAction = "pan-y";
    let raf = 0, last = 0, down = null, lastSound = 0;
    const K = 16, Z = 0.06, MAX = 0.55; // a crystal on a chain swings slowly and keeps going a while
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
        for (const d of drops) { d.om += (-K * Math.sin(d.th) - 2 * Z * Math.sqrt(K) * d.om) * h; d.th += d.om * h; }
        for (const s of swags) { s.bv += (-30 * s.b - 2 * 0.2 * Math.sqrt(30) * s.bv) * h; s.b += s.bv * h; }
      }
      for (const d of drops) {
        const live = Math.abs(d.th) > 1e-3 || Math.abs(d.om) > 5e-3;
        if (live) moving = true; else { d.th = d.om = 0; }
        d.el.style.transform = live ? `rotate(${d.th.toFixed(4)}rad)` : "";
      }
      for (const s of swags) {
        const live = Math.abs(s.b) > 2e-4 || Math.abs(s.bv) > 2e-3;
        if (live) moving = true; else { s.b = s.bv = 0; }
        // the loop of velvet lifts and settles a touch, its tails trailing
        s.el.style.transform = live ? `skewX(${(s.b * 0.6).toFixed(4)}rad) scaleY(${(1 - Math.abs(s.b) * 0.12).toFixed(4)})` : "";
      }
      if (moving && el.isConnected) raf = requestAnimationFrame(frame);
    }
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const k = reduce() ? 0.35 : 1;
    const push = (d, v) => { const dv = Math.max(-MAX, Math.min(MAX, v)) * k; d.om += dv; clink(d, Math.abs(dv) / MAX); kick(); };
    const local = (ev) => { const r = el.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
    const nearDrop = (x, y) => drops.find((d) => Math.abs(x - d.cx) < Math.max(14, dh * 0.2) && y > d.top - 4);
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
