/* Shelf objects drawn from osamu's photos: the pink melon lamp with crystal prisms and a pull chain,
   the quill and ink on a brass stand (the quill floats and dips itself), and a crowd of old rum bottles. */
(() => {
  "use strict";
  const D = window.Decor;
  const grad = (id, stops, x2 = 1, y2 = 0) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ""}/>`).join("")}</linearGradient>`;
  const BRONZE = [[0, "#2a2112"], [0.22, "#5d4a2a"], [0.42, "#a08654"], [0.55, "#c9ad74"], [0.7, "#6d5730"], [1, "#221a0d"]];
  const BRASS = [[0, "#4e3814"], [0.25, "#b18b45"], [0.45, "#f2d891"], [0.6, "#c09a52"], [1, "#3e2c10"]];

  // a little sound for these objects: soft clicks and drips, through the same quiet level as the other shelf sounds
  let actx = null;
  const out = () => {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === "suspended") actx.resume();
    const g = actx.createGain(); g.gain.value = 0.16 * (window.ShelfSfxLevel ? window.ShelfSfxLevel() : 1); g.connect(actx.destination); return g;
  };
  function plip(delay = 0) {
    try {
      const o = out(), t = actx.currentTime + delay, s = actx.createOscillator(), g = actx.createGain();
      s.type = "sine"; s.frequency.setValueAtTime(900, t); s.frequency.exponentialRampToValueAtTime(1900, t + 0.05);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      s.connect(g).connect(o); s.start(t); s.stop(t + 0.1);
    } catch (e) { /* no sound */ }
  }
  function clink() {
    try {
      const o = out(), t = actx.currentTime;
      [[2350, 0], [3120, 0.07], [2760, 0.16]].forEach(([f, d]) => {
        const s = actx.createOscillator(), g = actx.createGain(); s.type = "sine"; s.frequency.value = f * (0.97 + Math.random() * 0.06);
        g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.18, t + d + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.5);
        s.connect(g).connect(o); s.start(t + d); s.stop(t + d + 0.55);
      });
    } catch (e) { /* no sound */ }
  }

  // ------------------------------------------------------------------ the pink melon lamp
  // ribbed pink milk-glass dome, brass rim hung with crystal prisms, a slim bronze stem with art nouveau relief,
  // and a bead pull chain with a brass ball. Tapping pulls the chain; the light warms up like a real bulb.
  D.ORNAMENTS.pinkLamp = {
    label: "Pink melon lamp", scale: 0.86, vw: 118, flat: true, glow: "rgba(255,170,200,.42)",
    draw: (g) => {
      const cx = 59, top = 6, rimY = 64, R = 53;
      // the shade: a dome with scalloped lobes along the bottom
      const N = 7, lobes = [];
      for (let i = 0; i <= N; i++) { const a = -1 + (2 * i) / N; lobes.push(cx + Math.sin(a * 1.35) * R); }
      let edge = "";
      for (let i = 0; i < N; i++) edge += ` Q${((lobes[i] + lobes[i + 1]) / 2).toFixed(1)} ${rimY + 5} ${lobes[i + 1].toFixed(1)} ${rimY}`;
      const shade = `M${lobes[0].toFixed(1)} ${rimY} C${cx - R - 4} ${rimY - 34} ${cx - 34} ${top} ${cx} ${top} C${cx + 34} ${top} ${cx + R + 4} ${rimY - 34} ${lobes[N].toFixed(1)} ${rimY}${edge.split(" Q").reverse().slice(0, -1).length ? "" : ""}`;
      // close along the scallops, from right to left
      let back = ""; for (let i = N; i > 0; i--) back += ` Q${((lobes[i] + lobes[i - 1]) / 2).toFixed(1)} ${rimY + 5} ${lobes[i - 1].toFixed(1)} ${rimY}`;
      const shadePath = shade + back + "Z";
      // ribs: each lobe gets a soft highlight down its middle and a shadow at its seam
      let ribs = "";
      for (let i = 0; i < N; i++) {
        const mid = (lobes[i] + lobes[i + 1]) / 2, k = (mid - cx) / R;
        ribs += `<path d="M${mid.toFixed(1)} ${rimY + 3} C${(mid + k * 4).toFixed(1)} ${rimY - 26} ${(cx + k * 30).toFixed(1)} ${top + 12} ${(cx + k * 6).toFixed(1)} ${top + 3}" stroke="#fff" stroke-opacity="${(0.26 - Math.abs(k) * 0.18).toFixed(2)}" stroke-width="${(7 - Math.abs(k) * 3.5).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
        if (i > 0) ribs += `<path d="M${lobes[i].toFixed(1)} ${rimY} C${(lobes[i] + k * 3).toFixed(1)} ${rimY - 28} ${(cx + ((lobes[i] - cx) / R) * 28).toFixed(1)} ${top + 12} ${cx} ${top + 2}" stroke="#a8466e" stroke-opacity=".5" stroke-width="1.1" fill="none"/>`;
      }
      // crystal prisms: a bead, then a long faceted drop, hanging from the rim all round
      let prisms = "", arms = "";
      const PX = [9, 17, 25, 33, 41, 49, 59, 69, 77, 85, 93, 101, 109];
      PX.forEach((x, i) => {
        const len = 26 + ((i * 7) % 3) * 5 + (i % 2 ? 0 : 4), y0 = rimY + 7, w = 2.6;
        prisms += `<g class="prism" data-x="${x}" data-y="${y0 - 3}" data-l="${len}" style="--i:${i}"><line x1="${x}" y1="${y0 - 3}" x2="${x}" y2="${y0}" stroke="#9c8a62" stroke-width=".5"/><circle cx="${x}" cy="${y0 + 1.6}" r="1.8" fill="url(#${g}cr)" stroke="#fff" stroke-opacity=".5" stroke-width=".3"/>`
          + `<path d="M${x} ${y0 + 4} L${x + w} ${y0 + 10} L${x + w * 0.7} ${y0 + len - 6} L${x} ${y0 + len} L${x - w * 0.7} ${y0 + len - 6} L${x - w} ${y0 + 10}Z" fill="url(#${g}cr)" stroke="#e8eef4" stroke-opacity=".6" stroke-width=".35"/>`
          + `<path d="M${x} ${y0 + 4} L${x} ${y0 + len}" stroke="#fff" stroke-opacity=".55" stroke-width=".5"/><path d="M${x - w * 0.6} ${y0 + 12} L${x - w * 0.4} ${y0 + len - 8}" stroke="#7d8a99" stroke-opacity=".45" stroke-width=".5"/>`
          + `<circle class="spark" cx="${x + 0.6}" cy="${y0 + 12 + (i % 3) * 4}" r=".9" fill="#fff"/>`
          + `<path class="glint" d="M${x - 0.3} ${y0 + 8 + (i % 4) * 3} l.3 -2.2 .3 2.2 2.2 .3 -2.2 .3 -.3 2.2 -.3 -2.2 -2.2 -.3Z" fill="#fff" opacity="0"/></g>`;
        if (i % 3 === 0) arms += `<path d="M${cx} ${rimY + 13} Q${(cx + x) / 2} ${rimY + 9} ${x} ${rimY + 3}" stroke="#4a3818" stroke-width="1.1" fill="none"/>`;
      });
      // the stem: baluster with relief, a collar, and a domed foot with leafy scallops
      const stem = `M55 78 C54 88 52 96 52 104 C50 116 48 126 50 136 C51 146 54 152 54 160 L64 160 C64 152 67 146 68 136 C70 126 68 116 66 104 C66 96 64 88 63 78Z`;
      const relief = `<path d="M55 108 C51 116 57 120 54 128 C52 134 56 138 55 144" stroke="#2a2010" stroke-width="1" fill="none" opacity=".7"/><path d="M63 108 C67 116 61 120 64 128 C66 134 62 138 63 144" stroke="#2a2010" stroke-width="1" fill="none" opacity=".7"/>`
        + `<path d="M56 110 C53 116 58 120 55 127" stroke="#e6cf96" stroke-width=".6" fill="none" opacity=".55"/><path d="M57 92 q2 6 0 10 M61 92 q-2 6 0 10" stroke="#2a2010" stroke-width=".8" fill="none" opacity=".6"/>`;
      const foot = `M20 196 C20 186 30 178 46 174 C52 172 54 166 54 162 L64 162 C64 166 66 172 72 174 C88 178 98 186 98 196Z`;
      let petals = ""; for (let k = -3; k <= 3; k++) { const x = cx + k * 11; petals += `<path d="M${cx + k * 2} 168 C${x - 6} 176 ${x - 7} 188 ${x} 194 C${x + 7} 188 ${x + 6} 176 ${cx + k * 2} 168" stroke="#2a2010" stroke-width=".9" fill="none" opacity=".6"/><path d="M${cx + k * 2 - 1} 170 C${x - 5} 177 ${x - 5} 186 ${x - 1} 191" stroke="#e6cf96" stroke-width=".5" fill="none" opacity=".45"/>`; }
      // the pull chain: tiny beads down to a brass ball
      let chain = ""; for (let y = 76; y < 128; y += 2.4) chain += `<circle cx="74" cy="${y.toFixed(1)}" r=".85" fill="#b89a5a"/>`;
      return `<defs>${grad(g, BRONZE)}${grad(g + "b", BRASS)}`
        + `<radialGradient id="${g}p" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#ffd6e6"/><stop offset=".5" stop-color="#f29bbd"/><stop offset=".85" stop-color="#d06a95"/><stop offset="1" stop-color="#b4567d"/></radialGradient>`
        + `<radialGradient id="${g}l" cx=".5" cy=".9" r=".85"><stop offset="0" stop-color="#fffaf0"/><stop offset=".35" stop-color="#ffe0ea"/><stop offset=".75" stop-color="#ffaacb" stop-opacity=".75"/><stop offset="1" stop-color="#ff8db8" stop-opacity=".35"/></radialGradient>`
        + `<linearGradient id="${g}cr" x1="0" x2="1"><stop offset="0" stop-color="#cfd8e2"/><stop offset=".35" stop-color="#ffffff"/><stop offset=".55" stop-color="#9aa8b8"/><stop offset=".8" stop-color="#eef3f8"/><stop offset="1" stop-color="#8794a3"/></linearGradient></defs>`
        // foot, stem and socket
        + `<path d="${foot}" fill="url(#${g})"/>${petals}<ellipse cx="${cx}" cy="196" rx="39" ry="2.6" fill="#1c150a"/>`
        + `<rect x="52" y="158" width="14" height="5" rx="2" fill="url(#${g})"/>`
        + `<path d="${stem}" fill="url(#${g})"/>${relief}`
        + `<rect x="54" y="74" width="10" height="6" rx="1.5" fill="url(#${g}b)"/>`
        // the pull chain hangs in front of the stem
        + `<g class="lampChain">${chain}<circle cx="74" cy="130" r="2.6" fill="url(#${g}b)"/><circle cx="73.2" cy="129.2" r=".8" fill="#fff" opacity=".6"/></g>`
        // the shade with its warm inner light, the brass rim, arms and prisms
        + `<path d="${shadePath}" fill="url(#${g}p)"/><path class="litOnly lampLight" d="${shadePath}" fill="url(#${g}l)"/>${ribs}`
        + `<path d="M${cx - 30} ${top + 12} C${cx - 18} ${top + 4} ${cx - 6} ${top + 2} ${cx} ${top + 2}" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none" stroke-linecap="round"/>`
        + `<rect x="5" y="${rimY + 2}" width="108" height="4" rx="2" fill="url(#${g}b)"/>${arms}${prisms}`
        + `<ellipse class="litOnly underGlow" cx="${cx}" cy="${rimY + 16}" rx="44" ry="18" fill="#ffe6c8" opacity=".0"/>`;
    },
    // tap: the chain is pulled down and springs back, the switch clicks, then the bulb glows up (or dies down)
    toggle: (el, off) => {
      el.classList.remove("chainPull"); void el.offsetWidth; el.classList.add("chainPull");
      if (window.ShelfSfx && window.ShelfSfx.pull) window.ShelfSfx.pull(!off);
      setTimeout(() => {
        el.classList.remove("warming", "cooling"); void el.offsetWidth;
        el.classList.toggle("lit", !off); el.classList.add(off ? "cooling" : "warming");
        setTimeout(() => el.classList.remove("warming", "cooling"), 1200);
      }, 170);
      setTimeout(() => el.classList.remove("chainPull"), 900);
    },
  };

  // ------------------------------------------------------------------ the lamp's crystals swing when the shelf is swiped
  // Each prism is a little pendulum hung from its hook (real ones are a few centimetres long, so they swing about twice
  // a second, longer ones a touch slower). Sliding the books along jolts the shelf: every change in the scroll's speed
  // nudges the pivots, the prisms swing, fall out of step, knock against their neighbours (a soft glass clink, glints
  // as they turn in the light) and settle again over a couple of seconds.
  const SWING = new WeakMap();
  const swingOf = (lamp) => {
    let s = SWING.get(lamp); if (s) return s;
    const ps = [...lamp.querySelectorAll(".prism")].map((el, i) => {
      const x = +el.dataset.x, y = +el.dataset.y, len = +el.dataset.l, L = 4 + len * 0.55; // pivot to centre of mass, in drawing units
      return { el, glint: el.querySelector(".glint"), x, y, len, L, w0: Math.sqrt(9810 / (L * 2.5)), th: 0, om: 0, k: 0.85 + Math.random() * 0.3,
        f: 5600 - len * 70 + (i % 3) * 140, lastHit: 0 };
    });
    s = { lamp, ps, run: false, last: 0, sv: null, st: 0 }; SWING.set(lamp, s); return s;
  };
  const step = (s, dt) => {
    const ps = s.ps;
    for (const p of ps) { p.om += (-p.w0 * p.w0 * Math.sin(p.th) - 1.4 * p.om) * dt; p.th += p.om * dt; }
    // neighbours knock together: compare where their bodies are, a little below the middle of each drop
    for (let i = 0; i + 1 < ps.length; i++) {
      const a = ps[i], b = ps[i + 1], ra = 4 + a.len * 0.6, rb = 4 + b.len * 0.6;
      const gap = (b.x + rb * Math.sin(b.th)) - (a.x + ra * Math.sin(a.th)) - 6.6;
      const va = ra * a.om * Math.cos(a.th), vb = rb * b.om * Math.cos(b.th), rel = va - vb; // > 0: closing
      if (gap < 0 && rel > 0) {
        const e = 0.55, J = (1 + e) * rel / 2; a.om -= J / (ra * Math.cos(a.th)); b.om += J / (rb * Math.cos(b.th));
        const now = performance.now(), hit = Math.min(1, rel / 140);
        if (hit > 0.03 && now - a.lastHit > 60 && window.ShelfSfx && window.ShelfSfx.clink) {
          a.lastHit = b.lastHit = now; const r = s.lamp.getBoundingClientRect();
          window.ShelfSfx.clink(Math.random() < 0.5 ? a.f : b.f, hit, ((r.left + r.width / 2) / innerWidth - 0.5) * 1.2);
          a.flash = b.flash = Math.max(a.flash || 0, hit);
        }
      }
    }
  };
  const draw = (s) => {
    const lit = s.lamp.classList.contains("lit");
    for (const p of s.ps) {
      p.el.setAttribute("transform", `rotate(${(p.th * 57.2958).toFixed(2)} ${p.x} ${p.y})`);
      // a turning crystal throws a glint now and then; a knock always does
      const g = Math.min(1, Math.abs(p.om) / 3) * (Math.random() < 0.18 ? 1 : 0), f = p.flash || 0;
      p.glint.setAttribute("opacity", (Math.max(g * 0.7, f) * (lit ? 1 : 0.55)).toFixed(2)); p.flash = f * 0.8;
    }
  };
  const run = (s) => {
    if (s.run) return; s.run = true; s.last = performance.now();
    const tick = (now) => {
      if (!s.lamp.isConnected) { s.run = false; return; }
      let dt = Math.min(0.05, (now - s.last) / 1000); s.last = now;
      while (dt > 0) { const h = Math.min(dt, 1 / 240); step(s, h); dt -= h; }
      draw(s);
      const e = s.ps.reduce((m, p) => Math.max(m, Math.abs(p.th) + Math.abs(p.om) / p.w0), 0);
      if (e < 0.002) { for (const p of s.ps) { p.th = p.om = 0; p.el.removeAttribute("transform"); p.glint.setAttribute("opacity", "0"); } s.run = false; return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  // the swipe: watch every shelf's scroller; a change in its speed jolts the lamps standing on that shelf
  const rowSpeed = new WeakMap();
  addEventListener("scroll", (ev) => {
    const sc = ev.target; if (!sc || !sc.classList || !sc.classList.contains("scroller")) return;
    const row = sc.parentElement; if (!row) return;
    const lamps = row.querySelectorAll('.ornament[data-kind="pinkLamp"]'); if (!lamps.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const now = performance.now(), prev = rowSpeed.get(sc) || { x: sc.scrollLeft, t: now, v: 0 };
    const dt = Math.max(8, now - prev.t), v = (sc.scrollLeft - prev.x) / dt * 1000; // px per second
    const sv = prev.v + (v - prev.v) * 0.5, dv = sv - prev.v;
    rowSpeed.set(sc, { x: sc.scrollLeft, t: now, v: sv });
    // when the scrolling stops (no event for a moment) that sudden stop is a jolt too (scrollend is not on every phone)
    clearTimeout(prev.end);
    const end = setTimeout(() => { const q = rowSpeed.get(sc); if (!q) return; rowSpeed.set(sc, { x: sc.scrollLeft, t: performance.now(), v: 0 }); jolt(lamps, -q.v); }, 110);
    rowSpeed.get(sc).end = end;
    if (Math.abs(dv) > 2) jolt(lamps, dv);
  }, { capture: true, passive: true });
  function jolt(lamps, dv) {
    lamps.forEach((lamp) => {
      if (!lamp.isConnected) return;
      const s = swingOf(lamp);
      // the pivots are pushed with the books; the crystals lag behind (so they swing against the push)
      for (const p of s.ps) p.om = Math.max(-4.5, Math.min(4.5, p.om - 0.0011 * dv * p.k * (20 / p.L) * p.w0 / 14));
      run(s);
    });
  }

  // ------------------------------------------------------------------ the quill and ink stand
  // brass tray with scrolls and little feet, a pen cup, a square ink bottle with a cream label,
  // and a red quill with an ornate brass grip floating over the open bottle.
  let firstDip = true;
  D.ORNAMENTS.quillInk = {
    label: "Quill and ink", scale: 0.86, vw: 130,
    draw: (g) => {
      const nx = 70, ny = 107; // where the nib hangs while it floats
      // the quill, drawn pointing straight down from its nib at 0,0 and then tilted
      let barbs = ""; for (let y = -46; y > -104; y -= 3) { const f = (y + 46) / -58; barbs += `<path d="M0 ${y} q${(-8 - f * 6).toFixed(1)} ${(-3).toFixed(1)} ${(-12 - f * 2 + f * f * 8).toFixed(1)} ${(-2 - f * 3).toFixed(1)}" stroke="#3a0a08" stroke-opacity=".45" stroke-width=".55" fill="none"/>`; if (y > -96) barbs += `<path d="M0 ${y} q${(4 + f * 2).toFixed(1)} -2 ${(6 - f * 2).toFixed(1)} -3" stroke="#3a0a08" stroke-opacity=".4" stroke-width=".5" fill="none"/>`; }
      const quill = `<g transform="translate(${nx} ${ny}) rotate(-26) scale(1.1)">`
        // the feather: wide on one side of the shaft, narrow on the other, curling a little at the tip
        + `<path d="M0 -40 C-10 -48 -17 -66 -16 -82 C-15 -94 -8 -104 -1 -108 C2 -98 5 -86 6 -72 C7 -60 5 -48 1 -40Z" fill="url(#${g}f)"/>${barbs}`
        + `<path d="M-15 -70 l-3 -2 M-14 -84 l-3 -1 M3 -60 l3 1" stroke="#6e1a12" stroke-width="1.2"/>`
        + `<path d="M0 -38 C0 -60 -1 -86 -1 -106" stroke="#e8c9a4" stroke-width=".9" fill="none" opacity=".85"/>`
        // the ornate brass grip and the gold nib with its slit
        + `<path d="M-2.4 -10 C-3.6 -16 -2.6 -20 -3.4 -26 C-4.2 -30 -2.6 -34 -3.4 -40 L3.4 -40 C2.6 -34 4.2 -30 3.4 -26 C2.6 -20 3.6 -16 2.4 -10Z" fill="url(#${g}b)"/>`
        + `<path d="M-3 -24 c2 -2 4 0 6 -2 M-3 -31 c2 2 4 0 6 2 M-2.6 -16 h5.2" stroke="#4a3412" stroke-width=".7" fill="none"/><path d="M-1.4 -38 v24" stroke="#fff3c8" stroke-opacity=".55" stroke-width=".7"/>`
        + `<path d="M0 0 L-2.4 -10 L2.4 -10Z" fill="url(#${g}n)"/><path d="M0 0 L0 -6" stroke="#3a2808" stroke-width=".4"/><circle cx="0" cy="-6.5" r=".6" fill="#3a2808"/></g>`;
      return `<defs>${grad(g + "b", BRASS)}${grad(g + "n", [[0, "#7a5418"], [0.5, "#f5d78a"], [1, "#8a6420"]])}`
        + `<linearGradient id="${g}f" x1="0" x2="1"><stop offset="0" stop-color="#4e0f0b"/><stop offset=".35" stop-color="#8e2a1c"/><stop offset=".6" stop-color="#a5402a"/><stop offset="1" stop-color="#5a150e"/></linearGradient>`
        + `<linearGradient id="${g}g" x1="0" x2="1"><stop offset="0" stop-color="#0d0a10"/><stop offset=".18" stop-color="#2c2630"/><stop offset=".3" stop-color="#0f0b12"/><stop offset=".85" stop-color="#18131c"/><stop offset="1" stop-color="#0a080c"/></linearGradient>`
        + `<clipPath id="${g}c"><path d="M-60 -80 H200 V260 H-60Z M57.5 121 H82.5 V260 H57.5Z" clip-rule="evenodd"/></clipPath></defs>`
        // the tray: scrolled rim, little ball feet, and the pen cup on the left
        + `<circle cx="16" cy="196" r="3.6" fill="url(#${g}b)"/><circle cx="114" cy="196" r="3.6" fill="url(#${g}b)"/>`
        + `<path d="M6 186 C2 178 10 172 18 175 C26 170 40 172 48 176 L84 176 C92 172 106 170 114 175 C122 172 128 178 124 186 C120 192 108 194 98 192 L32 192 C22 194 10 192 6 186Z" fill="url(#${g}b)"/>`
        + `<path d="M12 184 C10 179 16 177 20 180 M118 184 C120 179 114 177 110 180 M36 188 C44 184 52 186 58 184 M72 184 C78 186 86 184 94 188" stroke="#4a3412" stroke-width="1" fill="none"/>`
        + `<path d="M10 182 C14 186 26 188 36 186" stroke="#fff3c8" stroke-opacity=".45" stroke-width=".8" fill="none"/>`
        + `<rect x="13" y="156" width="16" height="22" rx="2" fill="url(#${g}b)"/><ellipse cx="21" cy="156" rx="8" ry="2.6" fill="#2a1d08"/><ellipse cx="21" cy="156" rx="8" ry="2.6" fill="none" stroke="#e8cf8a" stroke-width="1"/>`
        // the ink bottle: dark square glass with rounded shoulders, a cream label, and an open neck full of ink
        + `<path d="M46 178 L46 140 Q46 132 54 131 L57 131 L57 121 L83 121 L83 131 L86 131 Q94 132 94 140 L94 178Z" fill="url(#${g}g)"/>`
        + `<path d="M49 140 Q49 135 54 134 L54 176 L49 176Z" fill="#fff" opacity=".12"/><path d="M89 138 L89 176" stroke="#fff" stroke-opacity=".08" stroke-width="2"/>`
        + `<rect x="52" y="152" width="36" height="21" rx="1" fill="#e9dfc6"/><rect x="52" y="152" width="36" height="21" rx="1" fill="none" stroke="#9a8a64" stroke-width=".6"/>`
        + `<path d="M56 157 h28 M58 160 h24 M60 166 h20 M62 169 h16" stroke="#5a4a32" stroke-width=".7"/><path d="M68 161 q2 -3 4 0 q-2 3 -4 0" fill="#7a2a1e"/>`
        + `<ellipse cx="70" cy="121" rx="13" ry="3.6" fill="#0a070c"/><ellipse cx="70" cy="121" rx="13" ry="3.6" fill="none" stroke="#3a3440" stroke-width="1.2"/>`
        + `<ellipse class="qRipple" cx="70" cy="121.4" rx="3" ry=".9" fill="none" stroke="#8a8094" stroke-width=".5"/>`
        // the quill: floats, and dips its nib into the bottle (the part inside the bottle is hidden by the clip)
        + `<g clip-path="url(#${g}c)"><g class="qFloat"><g class="qDip">${quill}</g></g></g>`
        + `<circle class="qDrop" cx="${nx}" cy="${ny + 1.4}" r="1.4" fill="#0a070c"/>`
        + `<path d="M57 122.6 Q70 126 83 122.6" stroke="#4a4450" stroke-width="1" fill="none"/>`;
    },
    mount: (el) => { if (firstDip) { firstDip = false; dip(el); } },
    // a tap: the quill dips again, comes out, and a drop of ink falls back into the bottle
    toggle: (el) => { el.classList.add("lit"); dip(el); },
  };
  function dip(el) {
    el.classList.remove("dipNow"); void el.offsetWidth; el.classList.add("dipNow");
    plip(2.45);
    clearTimeout(el._dip); el._dip = setTimeout(() => el.classList.remove("dipNow"), 3000);
  }

  // ------------------------------------------------------------------ a crowd of old rum bottles
  D.ORNAMENTS.rumBottles = {
    label: "Old bottles", scale: 0.66, vw: 230, still: true,
    draw: (g) => {
      const dust = (x0, y0, w, h, n, seed) => { let o = "", r = seed; const R = () => (r = (r * 9301 + 49297) % 233280) / 233280; for (let i = 0; i < n; i++) o += `<circle cx="${(x0 + R() * w).toFixed(1)}" cy="${(y0 + R() * h).toFixed(1)}" r="${(0.3 + R() * 0.8).toFixed(2)}" fill="#e8dcc0" opacity="${(0.15 + R() * 0.25).toFixed(2)}"/>`; return o; };
      const glassHi = (x, y1, y2, w = 2.4) => `<rect x="${x}" y="${y1}" width="${w}" height="${y2 - y1}" rx="${w / 2}" fill="#fff" opacity=".22"/>`;
      const label = (x, y, w, h, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.2" fill="url(#${g}pa)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.2" fill="none" stroke="#6e5530" stroke-width=".6" opacity=".7"/>${extra}`;
      // B: wicker-wrapped demijohn (behind), with dried leaves and an orange ribbon at the neck
      let weave = ""; for (let y = 110; y < 194; y += 4.2) for (let x = 42 + ((y / 4.2) % 2) * 3; x < 104; x += 6) weave += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} q3 2.6 6 0" stroke="${(x + y) % 3 < 1.5 ? "#8a6228" : "#a77c38"}" stroke-width="2.2" fill="none"/>`;
      const B = `<path d="M70 70 L70 100 Q42 106 40 128 L40 188 Q40 196 50 196 L96 196 Q106 196 106 188 L106 128 Q104 106 76 100 L76 70Z" fill="#c99a4a"/>${weave}`
        + `<rect x="66" y="74" width="14" height="30" rx="3" fill="#4d6a3a" opacity=".9"/>${glassHi(68, 76, 100, 2)}<rect x="66.5" y="60" width="13" height="15" rx="2" fill="#9a7346"/><rect x="66.5" y="60" width="13" height="3" rx="1.5" fill="#c49a66"/>`
        + `<path d="M79 92 C96 78 112 76 124 82 M78 90 C92 70 104 62 116 58 M70 92 C58 76 54 64 56 52" stroke="#5f6a3a" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M80 91 C94 80 108 79 118 82" stroke="#87914f" stroke-width=".8" fill="none"/>`
        + `<path d="M70 94 C64 100 62 108 66 116 C70 110 72 102 76 98 C80 104 84 110 90 112 C88 104 82 96 76 94Z" fill="#c8562a"/><path d="M70 96 C68 102 68 108 68 112" stroke="#8a3214" stroke-width=".8" fill="none"/>`
        + label(54, 128, 38, 50, `<text x="73" y="141" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="10" fill="#a2241a">RUM</text><ellipse cx="73" cy="156" rx="9" ry="8" fill="#e8dcc0" stroke="#6e5530" stroke-width=".5"/><path d="M70 160 C68 152 72 148 76 150 C78 154 77 160 73 163Z" fill="#c42a1c"/><circle cx="74.5" cy="151.5" r=".9" fill="#222"/><path d="M76 150 l2 1 -2 1Z" fill="#e8c24a"/><path d="M70 160 l-2 4 M72 162 l0 4" stroke="#2f7a3a" stroke-width="1.4"/><path d="M58 170 h30" stroke="#a2241a" stroke-width="2.4"/>`)
        + dust(42, 110, 62, 84, 40, 3);
      // D: round flask of amber rum with herbs inside and an oval pig label
      let herbs = ""; for (let k = 0; k < 9; k++) herbs += `<path d="M${150 + k * 3} 192 C${146 + k * 4} 170 ${158 + k * 2} 150 ${152 + k * 3} 128" stroke="#e9d39a" stroke-opacity=".45" stroke-width="1.1" fill="none"/>`;
      const Dfl = `<rect x="155" y="88" width="14" height="13" rx="2" fill="#9a7346"/><rect x="155" y="88" width="14" height="3" rx="1.5" fill="#c49a66"/>`
        + `<path d="M156 100 L156 122 C134 128 126 146 128 166 C130 186 146 196 162 196 C178 196 194 186 196 166 C198 146 190 128 168 122 L168 100Z" fill="#b97a22" opacity=".88"/>`
        + `<path d="M156 100 L156 122 C134 128 126 146 128 166 C130 186 146 196 162 196 C178 196 194 186 196 166 C198 146 190 128 168 122 L168 100Z" fill="url(#${g}am)"/>${herbs}`
        + `<path d="M156 100 L156 122 C140 126 133 136 131 150" stroke="#fff" stroke-opacity=".3" stroke-width="2" fill="none"/>`
        + `<ellipse cx="163" cy="164" rx="16" ry="20" fill="url(#${g}pa)" stroke="#6e5530" stroke-width=".7"/><ellipse cx="163" cy="164" rx="13.5" ry="17.5" fill="none" stroke="#8a6a3a" stroke-width=".4"/>`
        + `<path d="M156 160 C156 152 170 152 170 160 C171 166 166 170 163 170 C160 170 155 166 156 160Z" fill="#d99a9a"/><path d="M157 154 l-2 -4 4 2Z M169 154 l2 -4 -4 2Z" fill="#c78484"/><ellipse cx="163" cy="164" rx="3" ry="2.2" fill="#c47a7a"/><circle cx="160" cy="159" r=".7" fill="#2a1a1a"/><circle cx="166" cy="159" r=".7" fill="#2a1a1a"/>`
        + `<path d="M150 172 L176 172 L178 178 L148 178Z" fill="#efe3c4" stroke="#6e5530" stroke-width=".5"/><text x="163" y="177" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="5.4" fill="#3a2a16">RHUM</text>`
        + dust(130, 124, 64, 70, 30, 7);
      // A: tall olive bottle wrapped in a rope net, a star on the neck, a worn yellow label
      let net = ""; for (let k = -3; k <= 5; k++) net += `<path d="M${14 + k * 8} 196 L${30 + k * 8} 100" stroke="#c9a76a" stroke-width="1" opacity=".85"/><path d="M${46 - k * 8} 196 L${30 - k * 8} 100" stroke="#b08e52" stroke-width="1" opacity=".85"/>`;
      const A = `<clipPath id="${g}ac"><path d="M14 196 L14 116 C14 104 24 100 26 86 L26 52 L34 52 L34 86 C36 100 46 104 46 116 L46 196Z"/></clipPath>`
        + `<path d="M14 196 L14 116 C14 104 24 100 26 86 L26 52 L34 52 L34 86 C36 100 46 104 46 116 L46 196Z" fill="url(#${g}ol)"/>`
        + `<g clip-path="url(#${g}ac)">${net}</g>${glassHi(17, 112, 190)}<rect x="25" y="40" width="10" height="13" rx="2" fill="#b08a5a"/><rect x="24" y="50" width="12" height="4" rx="1" fill="#6e5530"/>`
        + `<path d="M30 64 l1.4 3 3.2 .3 -2.4 2.1 .8 3.1 -3 -1.6 -3 1.6 .8 -3.1 -2.4 -2.1 3.2 -.3Z" fill="#f2cf3a"/>`
        + label(16, 136, 28, 42, `<path d="M18 168 C22 150 34 146 42 150" stroke="#8a2a1a" stroke-width="1.6" fill="none"/><text x="30" y="160" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="6" fill="#5a3a1a" transform="rotate(-18 30 160)">Tonique</text><circle cx="36" cy="170" r="4" fill="#7a5a30" opacity=".6"/>`)
        + dust(14, 100, 32, 96, 26, 11);
      // E: tall dark bottle of red-brown rum, grimy, with a ship on its label
      const E = `<path d="M186 196 L186 104 C186 92 196 88 198 80 L198 44 L210 44 L210 80 C212 88 222 92 222 104 L222 196Z" fill="url(#${g}rd)"/>`
        + `<path d="M186 140 L222 140 L222 196 L186 196Z" fill="#3a0c08" opacity=".35"/>${glassHi(189, 100, 192, 2.6)}`
        + `<rect x="197" y="32" width="14" height="14" rx="2.5" fill="#5a4630"/><rect x="196" y="40" width="16" height="6" rx="1.5" fill="#3e3020"/><circle cx="204" cy="36" r="5" fill="#6e5a40" opacity=".6"/>`
        + label(188, 150, 32, 36, `<path d="M194 172 L214 172 L211 177 L197 177Z" fill="#3a2a16"/><path d="M204 156 L204 172 M198 158 L198 171 M210 159 L210 171" stroke="#3a2a16" stroke-width=".7"/><path d="M199 158 Q204 162 203 168 L199 168Z M205 157 Q211 161 209 168 L205 168Z" fill="#6e5530" opacity=".7"/><text x="204" y="183" text-anchor="middle" font-family="Georgia,serif" font-size="3.4" fill="#3a2a16">SPICED GOLDEN RUM</text>`)
        + `<path d="M188 120 C196 126 210 118 220 124" stroke="#2a1a10" stroke-opacity=".4" stroke-width="3" fill="none"/>` + dust(186, 46, 36, 150, 50, 5);
      // C: squat dark-green jug with a handle, its top bound in old cloth, a torn label with a pirate
      const C = `<path d="M128 132 C140 132 144 142 140 152" stroke="#14281a" stroke-width="4" fill="none"/>`
        + `<path d="M96 196 L96 162 C96 152 106 150 112 148 L112 132 L126 132 L126 148 C132 150 142 152 142 162 L142 196Z" fill="url(#${g}dg)"/>${glassHi(99, 160, 192, 2.2)}`
        + `<path d="M110 134 C108 124 112 116 119 114 C126 116 130 124 128 134Z" fill="#2a2420"/><path d="M110 132 l-4 4 M128 130 l5 3 M112 126 l-5 -2 M126 122 l5 -2 M114 134 l-1 5 M124 134 l2 5" stroke="#2a2420" stroke-width="1.6" stroke-linecap="round"/><path d="M111 128 h17" stroke="#4a3e34" stroke-width="1.2"/>`
        + `<path d="M98 168 L140 166 L141 190 L132 189 L126 192 L118 189 L106 191 L99 188Z" fill="url(#${g}pa)" stroke="#6e5530" stroke-width=".5"/>`
        + `<circle cx="119" cy="176" r="4.4" fill="#2a2016"/><circle cx="117.6" cy="175.4" r="1" fill="#e8dcc0"/><circle cx="120.6" cy="175.4" r="1" fill="#e8dcc0"/><path d="M113 182 L125 172 M113 172 L125 182" stroke="#2a2016" stroke-width="1"/><path d="M104 186 C110 184 128 184 136 186" stroke="#3a2a16" stroke-width=".6" fill="none"/>`
        + dust(96, 140, 46, 56, 28, 13);
      return `<defs><linearGradient id="${g}pa" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9dcb8"/><stop offset=".5" stop-color="#d6c294"/><stop offset="1" stop-color="#b59d6a"/></linearGradient>`
        + grad(g + "ol", [[0, "#2e3416"], [0.3, "#6a6a2e"], [0.5, "#9a8a3e"], [0.8, "#4a4a20"], [1, "#22260e"]])
        + grad(g + "rd", [[0, "#1e0805"], [0.25, "#4e1a10"], [0.5, "#6a2614"], [0.8, "#3a120a"], [1, "#160604"]])
        + grad(g + "dg", [[0, "#0c1a10"], [0.3, "#1e3a26"], [0.5, "#2e4e34"], [0.85, "#142a1a"], [1, "#08120a"]])
        + `<radialGradient id="${g}am" cx=".4" cy=".55" r=".6"><stop offset="0" stop-color="#ffe0a0" stop-opacity=".55"/><stop offset=".6" stop-color="#d8962e" stop-opacity=".1"/><stop offset="1" stop-color="#5a3008" stop-opacity=".5"/></radialGradient></defs>`
        + B + Dfl + A + E + C
        + `<ellipse cx="118" cy="197" rx="112" ry="3" fill="#000" opacity=".35"/>`;
    },
    // a tap makes them clink against each other
    onTap: () => clink(),
  };
  D.ORNAMENTS.rumBottles.toggle = (el) => { el.classList.remove("nudge"); void el.offsetWidth; el.classList.add("nudge"); clink(); };
  delete D.ORNAMENTS.rumBottles.still;
})();
