/* Velvet drapes: the vampire room's lights. osamu's Gemini velvet drapes, red with gold rope, fringe and tassels,
   are tied up in the two corners under each shelf, and between them hang ruby crystal drops in gold caps, each on its
   own gold chain that runs up behind the velvet to the shelf's underside. Each drop is a pendulum on its chain: a tap
   pushes the one under the finger, a finger drawn across brushes every drop it passes and stirs the velvet. With the
   shelf's light on, the crystals glow red from inside. */
(function () {
  const D = window.Decor;
  if (!D) return;
  const f1 = (n) => Math.round(n * 10) / 10;
  D.LIGHT_STYLES.vampDrapes = "Velvet drapes";

  // the corner drapes as stored (the right one is the left one's mirror), and the ruby drop
  const CO = { w: 706, h: 1148, tuck: 0.03 };
  const DR = { w: 212, h: 877 };
  // the left drape's lowest edge across its width, every 2.5% (fraction of its height): the tail at the outer side,
  // the swag rising toward the knot and tassel at the inner corner
  const EDGE = [0.999, 0.991, 0.975, 0.96, 0.943, 0.924, 0.892, 0.818, 0.801, 0.782, 0.64, 0.612, 0.567, 0.546, 0.506,
    0.435, 0.426, 0.423, 0.42, 0.415, 0.408, 0.399, 0.386, 0.373, 0.365, 0.354, 0.339, 0.322, 0.301, 0.29, 0.277,
    0.263, 0.247, 0.227, 0.205, 0.18, 0.152, 0.196, 0.2, 0.199, 0.193];
  const edgeAt = (u) => { if (u <= 0 || u >= 1) return 0; const t = u * 40, i = Math.floor(t); return EDGE[i] + (EDGE[i + 1] - EDGE[i]) * (t - i); };
  const reduce = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };

  // osamu's corner drapes (2026-11-10): a velvet drape tied up in each corner under the shelf, and between them ruby
  // drops, every one on a gold chain that runs up behind the velvet to somewhere under the shelf nobody can see.
  function drapesEl(w, cfg) {
    const cw = Math.min(0.4 * w, 175), ch = cw * CO.h / CO.w, lift = CO.tuck * ch;
    // how low the velvet reaches at x (px below the shelf)
    const under = (x) => Math.max(edgeAt(x / cw), edgeAt((w - x) / cw)) * ch - lift;
    const parts = [
      `<div class="vSwag" style="left:0;top:${f1(-lift)}px;width:${f1(cw)}px;height:${f1(ch)}px;transform-origin:0 0"><img src="obj/vamp-cornerL.webp" alt="" draggable="false" decoding="async"></div>`,
      `<div class="vSwag" style="left:${f1(w - cw)}px;top:${f1(-lift)}px;width:${f1(cw)}px;height:${f1(ch)}px;transform-origin:100% 0"><img src="obj/vamp-cornerR.webp" alt="" draggable="false" decoding="async"></div>`];
    // the drops run from just inside one tail to just inside the other, about one every 50px on a phone, wider apart on a big screen
    const x0 = 0.3 * cw, x1 = w - 0.3 * cw, n = Math.max(5, Math.round((x1 - x0) / (w < 600 ? 50 : 72)) + 1);
    const dh = Math.min(w, 430) * 0.19, dw = dh * DR.w / DR.h;
    const drops = [];
    for (let i = 0; i < n; i++) {
      const cx = x0 + (x1 - x0) * i / (n - 1), m = Math.abs(i / (n - 1) - 0.5) * 2; // m: 0 middle, 1 ends
      // each crystal hangs clear below the velvet, alternating long and short, the middle one longest
      const top = Math.max(under(cx) + 4, 0) + 10 + (1 - m) * dh * 0.55 + (i % 2) * dh * 0.22;
      drops.push({ cx, top, dh, len: top + dh, th: 0, om: 0, els: [] });
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
    el.innerHTML = `<div class="vIn">${back}${parts.join("")}${front}</div>`;
    const bEls = el.querySelectorAll(".vDrop:not(.vDropF)"), fEls = el.querySelectorAll(".vDropF");
    drops.forEach((d, i) => { d.els = [bEls[i], fEls[i]]; });
    const swags = [...el.querySelectorAll(".vSwag")].map((s, i) => ({ el: s, b: 0, bv: 0, side: i ? -1 : 1 }));
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
