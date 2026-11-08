/* Cobwebs for the witch's tower: corner webs between books and on the shelf, and webs draped under the shelf edge.
   They sway a little in the draught. Brushed away (a tap, or a book moving), a web catches, stretches, its anchor threads
   snap and it balls up into a stringy wad that drops away, the way a web really comes off on a finger or a broom. */
(() => {
  "use strict";
  const KEY = "shelf.webs.gone";
  let gone; try { gone = new Set(JSON.parse(sessionStorage.getItem(KEY) || "[]")); } catch (e) { gone = new Set(); }
  const remember = (id) => { gone.add(id); try { sessionStorage.setItem(KEY, JSON.stringify([...gone])); } catch (e) { /* private mode */ } };
  const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
  const f1 = (n) => n.toFixed(1);
  const TH = `stroke="rgba(228,230,238,.55)" stroke-width=".55" fill="none" stroke-linecap="round"`;
  const THIN = `stroke="rgba(228,230,238,.32)" stroke-width=".4" fill="none"`;

  /** A corner web: threads fan out of the corner where two surfaces meet (drawn with the corner at bottom left). */
  function corner(w, h, seed) {
    const R = rng(seed), n = 6 + Math.floor(R() * 3), rad = [];
    for (let k = 0; k <= n; k++) {
      const a = (k / n) * (Math.PI / 2) + (R() - 0.5) * 0.12, len = 0.82 + R() * 0.18;
      rad.push([Math.cos(a) * w * len, h - Math.sin(a) * h * len]);
    }
    let anchors = "", body = "", glint = "";
    rad.forEach(([x, y], k) => {
      const line = `<path d="M0 ${h} L${f1(x)} ${f1(y)}" ${TH}/>`;
      if (k === 0 || k === n) anchors += line; else body += line;
    });
    // the spiral: rings of sagging threads between neighbouring spokes, with a few broken ones
    const rings = [0.18, 0.31, 0.45, 0.6, 0.75, 0.9];
    rings.forEach((r, ri) => {
      let d = "";
      for (let k = 0; k < n; k++) {
        if (R() < 0.1) continue;
        const [x1, y1] = rad[k], [x2, y2] = rad[k + 1];
        const ax = x1 * r, ay = h - (h - y1) * r, bx = x2 * r, by = h - (h - y2) * r;
        const sag = 0.82 + R() * 0.06, cx = ((ax + bx) / 2) * sag, cy = h - (h - (ay + by) / 2) * sag;
        d += `M${f1(ax)} ${f1(ay)} Q${f1(cx)} ${f1(cy)} ${f1(bx)} ${f1(by)} `;
      }
      (ri === 3 ? (glint += `<path class="glint" d="${d}" stroke="rgba(255,255,255,.9)" stroke-width=".6" fill="none"/>`) : 0);
      body += `<path d="${d}" ${ri % 2 ? THIN : TH}/>`;
    });
    // a loose strand hanging off the edge and a speck of dust caught in it
    const [lx, ly] = rad[Math.floor(n / 2)];
    body += `<path d="M${f1(lx * 0.9)} ${f1(h - (h - ly) * 0.9)} q${f1(4 + R() * 6)} ${f1(6 + R() * 6)} ${f1(2 + R() * 4)} ${f1(14 + R() * 10)}" ${THIN}/>`;
    body += `<circle cx="${f1(rad[2][0] * 0.5)}" cy="${f1(h - (h - rad[2][1]) * 0.5)}" r=".9" fill="rgba(200,195,180,.6)"/>`;
    return { anchors, body: body + glint };
  }

  /** A drape: a tattered sheet of web hanging from the underside of the shelf edge. */
  function drape(w, h, seed) {
    const R = rng(seed), pts = [];
    for (let x = 0; x <= w; x += w / (4 + Math.floor(R() * 2))) pts.push(Math.min(w, x + (R() - 0.5) * 6));
    let anchors = "", body = "";
    pts.forEach((x) => (anchors += `<path d="M${f1(x)} 0 l${f1((R() - 0.5) * 3)} 3" ${TH}/>`));
    // layered sagging threads between the anchor points, deeper towards the middle, with a few tears
    for (let layer = 1; layer <= 4; layer++) {
      let d = "";
      for (let k = 0; k < pts.length - 1; k++) {
        if (R() < 0.12 * layer) continue;
        const a = pts[k], b = pts[k + 1], mid = (a + b) / 2, dip = (h * layer) / 4.4 * (0.75 + R() * 0.5);
        d += `M${f1(a)} ${f1(layer * 2)} Q${f1(mid)} ${f1(dip * 1.6)} ${f1(b)} ${f1(layer * 2)} `;
      }
      body += `<path d="${d}" ${layer % 2 ? TH : THIN}/>`;
    }
    // strands dangling down, some with a speck at the end
    for (let k = 0; k < 4; k++) {
      const x = w * (0.15 + R() * 0.7), len = h * (0.6 + R() * 0.5);
      body += `<path class="dangle" style="--d:-${f1(R() * 4)}s" d="M${f1(x)} ${f1(h * 0.3)} q${f1((R() - 0.5) * 6)} ${f1(len / 2)} ${f1((R() - 0.5) * 4)} ${f1(len)}" ${THIN}/>`;
      if (R() < 0.5) body += `<circle cx="${f1(x)}" cy="${f1(h * 0.3 + len)}" r=".8" fill="rgba(200,195,180,.55)"/>`;
    }
    body += `<path class="glint" d="M${f1(pts[1])} 4 Q${f1((pts[1] + pts[2]) / 2)} ${f1(h * 0.45)} ${f1(pts[2])} 4" stroke="rgba(255,255,255,.9)" stroke-width=".6" fill="none"/>`;
    return { anchors, body };
  }

  /** Make a web element. kind: "corner" (corner at bottom left; flip for bottom right) or "drape". */
  function make(id, kind, w, h, flip) {
    if (gone.has(id)) return null;
    const seed = [...id].reduce((s, c) => s * 31 + c.charCodeAt(0), 7);
    const { anchors, body } = kind === "drape" ? drape(w, h, seed) : corner(w, h, seed);
    const el = document.createElement("div");
    el.className = `web ${kind}${flip ? " flip" : ""}`; el.dataset.web = id;
    el.style.width = w + "px"; el.style.height = h + "px";
    el.style.setProperty("--t", (5 + (seed % 5) * 0.8).toFixed(1) + "s");
    el.innerHTML = `<svg width="${w}" height="${h + (kind === "drape" ? h * 0.6 : 0)}" viewBox="0 0 ${w} ${h + (kind === "drape" ? h * 0.6 : 0)}" aria-hidden="true"><g class="wSway"><g class="wAnch">${anchors}</g><g class="wBody">${body}</g></g></svg>`;
    el.addEventListener("pointerdown", (e) => e.stopPropagation());
    el.addEventListener("click", (e) => { e.stopPropagation(); tear(el, e.clientX, e.clientY); });
    return el;
  }

  /** Brush a web away. (px, py): where it was touched, or nothing when a moving book tore it. */
  function tear(el, px, py) {
    if (!el || el._torn) return; el._torn = true;
    remember(el.dataset.web);
    const r = el.getBoundingClientRect(), flip = el.classList.contains("flip"), drp = el.classList.contains("drape");
    // it is pulled away from where it hangs: corners come out of their corner, drapes come down
    const dx = drp ? 0 : flip ? -r.width * 0.6 : r.width * 0.6, dy = drp ? r.height * 0.9 : -r.height * 0.2;
    const ox = px != null ? ((px - r.left) / r.width) * 100 : 50, oy = py != null ? ((py - r.top) / r.height) * 100 : 50;
    const svg = el.querySelector("svg"), anch = el.querySelector(".wAnch");
    el.classList.add("tearing");
    svg.style.transformOrigin = `${ox.toFixed(0)}% ${oy.toFixed(0)}%`;
    const spin = (Math.random() - 0.5) * 70;
    const a = svg.animate([
      { transform: "none", opacity: 1 },
      // it catches and stretches with the pull, still held at its anchors
      { transform: `translate(${dx * 0.18}px, ${dy * 0.18}px) scale(${drp ? 1.02 : 1.14}, ${drp ? 1.18 : 0.92})`, opacity: 1, offset: 0.3 },
      // the anchor threads snap, it springs back a touch and starts to gather
      { transform: `translate(${dx * 0.3}px, ${dy * 0.35}px) scale(.7) rotate(${spin * 0.3}deg)`, opacity: 0.95, offset: 0.5 },
      // balled up into a wad that drops away
      { transform: `translate(${dx * 0.55}px, ${dy * 0.6 + 26}px) scale(.16) rotate(${spin}deg)`, opacity: 0.85, offset: 0.82 },
      { transform: `translate(${dx * 0.6}px, ${dy * 0.6 + 60}px) scale(.12) rotate(${spin * 1.2}deg)`, opacity: 0 },
    ], { duration: 1050, easing: "cubic-bezier(.35,0,.4,1)", fill: "forwards" });
    anch.animate([{ opacity: 1 }, { opacity: 1, offset: 0.36 }, { opacity: 0, offset: 0.44 }, { opacity: 0 }], { duration: 1050, fill: "forwards" });
    a.onfinish = () => el.remove();
    soundTear();
  }

  // the faint tick-and-hiss of threads giving way
  let actx = null;
  function soundTear() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime, lvl = 0.16 * (window.ShelfSfxLevel ? window.ShelfSfxLevel() : 1);
      const buf = actx.createBuffer(1, actx.sampleRate * 0.5, actx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
      const s = actx.createBufferSource(); s.buffer = buf;
      const f = actx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 5000;
      const g = actx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25 * lvl, t + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      s.connect(f).connect(g).connect(actx.destination); s.start(t);
      for (let k = 0; k < 3; k++) { const o = actx.createOscillator(), og = actx.createGain(), at = t + 0.3 + k * 0.05; o.frequency.value = 6000 + Math.random() * 2000; og.gain.setValueAtTime(0.0001, at); og.gain.exponentialRampToValueAtTime(0.05 * lvl, at + 0.002); og.gain.exponentialRampToValueAtTime(0.0001, at + 0.02); o.connect(og).connect(actx.destination); o.start(at); o.stop(at + 0.03); }
    } catch (e) { /* no sound */ }
  }


  // ------------------------------------------------------------------ a spider crossing the wall behind the shelves
  // It comes in from off screen now and then, wanders across in stop-start bursts like a real spider and leaves by
  // another edge. Its next visit starts from the edge it last left by, so its trips join up into one long loop.
  const EDGES = ["left", "top", "right", "bottom"];
  let lastExit = null, nextT = 0, running = null;
  const LEG = (side, k) => {
    // a leg in two segments: up and out from the body, then bending down and back to its foot
    const ax = 2.5 - k * 1.8, sy = side, fx = ax + [7, 3, -2, -6][k], fy = sy * (9 + [1, 3, 3, 1][k]), tx = ax + [12, 4, -6, -13][k], ty = sy * (13 + [0, 4, 4, 0][k]);
    return `<path d="M${ax} ${sy * 2} L${fx} ${fy} L${tx} ${ty}" stroke="#140d0e" stroke-width="1.15" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
  };
  const SPIDER = `<svg viewBox="-16 -16 32 32" width="34" height="34" aria-hidden="true">`
    + `<g class="legsA">${LEG(1, 0)}${LEG(-1, 1)}${LEG(1, 2)}${LEG(-1, 3)}</g><g class="legsB">${LEG(-1, 0)}${LEG(1, 1)}${LEG(-1, 2)}${LEG(1, 3)}</g>`
    + `<ellipse cx="-6.5" cy="0" rx="6.6" ry="5.2" fill="#1b1214"/><ellipse cx="-7.5" cy="-1.6" rx="3.2" ry="1.6" fill="#5a4448" opacity=".45"/><path d="M-10 0 h6 M-9 -1.8 l2 1.8 -2 1.8" stroke="#3a2a2c" stroke-width=".6" fill="none"/>`
    + `<ellipse cx="2.2" cy="0" rx="4.2" ry="3.5" fill="#20171a"/><ellipse cx="6.2" cy="0" rx="1.9" ry="1.7" fill="#191113"/><circle cx="7" cy="-.7" r=".45" fill="#8a6a6a"/><circle cx="7" cy=".7" r=".45" fill="#8a6a6a"/>`
    + `<path d="M7.6 -1 l1.6 -.6 M7.6 1 l1.6 .6" stroke="#140d0e" stroke-width=".8"/></svg>`;
  function host() { return document.querySelector("#backdrop .wallSpider"); }
  function startSpider() {
    if (running) return;
    clearTimeout(nextT);
    nextT = setTimeout(visit, lastExit ? 30000 + Math.random() * 40000 : 7000 + Math.random() * 9000);
  }
  function edgePoint(edge, W, H, pad = 40) {
    const r = 0.12 + Math.random() * 0.76;
    return edge === "left" ? [-pad, H * r] : edge === "right" ? [W + pad, H * r] : edge === "top" ? [W * r, -pad] : [W * r, H + pad];
  }
  function visit() {
    const box = host(); if (!box) return;
    if (document.hidden) { nextT = setTimeout(visit, 5000); return; }
    const W = box.clientWidth || innerWidth, H = box.clientHeight || innerHeight;
    const entry = lastExit || EDGES[Math.floor(Math.random() * 4)];
    const exits = EDGES.filter((e) => e !== entry), exit = exits[Math.floor(Math.random() * exits.length)];
    // its route: in from the entry edge, two or three wandering turns on the wall, out by the exit edge
    const pts = [edgePoint(entry, W, H)];
    const turns = 2 + Math.floor(Math.random() * 2);
    for (let k = 1; k <= turns; k++) { const [ax, ay] = pts[0], [bx, by] = edgePoint(exit, W, H); const t = k / (turns + 1); pts.push([ax + (bx - ax) * t + (Math.random() - 0.5) * W * 0.35, ay + (by - ay) * t + (Math.random() - 0.5) * H * 0.25]); }
    pts.push(edgePoint(exit, W, H));
    // a smooth path through the turns (Catmull-Rom), sampled finely so it can walk at an even pace
    const path = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let t = 0; t < 1; t += 0.02) {
        const t2 = t * t, t3 = t2 * t;
        path.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
      }
    }
    path.push(pts[pts.length - 1]);
    const len = [0]; for (let i = 1; i < path.length; i++) len.push(len[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
    const el = document.createElement("div"); el.className = "spider"; el.innerHTML = SPIDER; box.append(el);
    running = el;
    let s = 0, last = performance.now(), speed = 0, pauseUntil = 0, nextPause = last + 1200 + Math.random() * 2500, ang = null;
    const step = (now) => {
      if (!el.isConnected) { running = null; return; }
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      // stop-start: it scuttles, freezes for a moment, then goes on
      if (now < pauseUntil) speed = Math.max(0, speed - 400 * dt);
      else { speed = Math.min(62, speed + 260 * dt); if (now > nextPause) { pauseUntil = now + 400 + Math.random() * 1500; nextPause = pauseUntil + 1500 + Math.random() * 3000; } }
      el.classList.toggle("walking", speed > 8);
      s += speed * dt;
      if (s >= len[len.length - 1]) { el.remove(); running = null; lastExit = exit; startSpider(); return; }
      let i = 1; while (i < len.length - 1 && len[i] < s) i++;
      const f = (s - len[i - 1]) / Math.max(0.001, len[i] - len[i - 1]);
      const x = path[i - 1][0] + (path[i][0] - path[i - 1][0]) * f, y = path[i - 1][1] + (path[i][1] - path[i - 1][1]) * f;
      const target = Math.atan2(path[i][1] - path[i - 1][1], path[i][0] - path[i - 1][0]);
      if (ang === null) ang = target; else { let d = target - ang; d = Math.atan2(Math.sin(d), Math.cos(d)); ang += d * Math.min(1, dt * 8); }
      el.style.transform = `translate3d(${(x - 17).toFixed(1)}px,${(y - 17).toFixed(1)}px,0) rotate(${(ang * 180 / Math.PI).toFixed(1)}deg)`;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  window.ShelfWebs = { make, tear, isGone: (id) => gone.has(id) };
  window.ShelfSpider = { start: startSpider, _visit: visit };
})();
