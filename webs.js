/* Cobwebs for the witch's tower and the spider on its wall.
   Webs are real thread nets: every crossing is a point held together by its threads and pinned where the web is stuck to
   a book or the shelf. A faint draught pushes the free middle about while the pinned edges stay put, light slides along
   the threads as they move, and loose strands swing. Brushed away, the threads cling to the finger and stretch, the anchor
   threads let go one by one, broken threads spring back and the whole thing shrinks into a stringy wad that drops. */
(() => {
  "use strict";
  const KEY = "shelf.webs.gone";
  let gone; try { gone = new Set(JSON.parse(sessionStorage.getItem(KEY) || "[]")); } catch (e) { gone = new Set(); }
  const remember = (id) => { gone.add(id); try { sessionStorage.setItem(KEY, JSON.stringify([...gone])); } catch (e) { /* private mode */ } };
  const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const PAD = 24, FALL = 90; // room around the web to move and to fall into

  // ---------------------------------------------------------------- building a net
  function net() { return { n: [], s: [] }; }
  const node = (N, x, y, pin = false, hang = false) => (N.n.push({ x, y, px: x, py: y, pin, hang, gx: null }), N.n.length - 1);
  const seg = (N, a, b, kind, k = 1) => { const A = N.n[a], B = N.n[b]; N.s.push({ a, b, kind, len: Math.hypot(A.x - B.x, A.y - B.y) * k }); };

  /** A corner web, corner at bottom left: one surface runs along the bottom, the other up the left side. */
  function cornerNet(w, h, R) {
    const N = net(), nr = 6 + Math.floor(R() * 3), rings = [0.16, 0.29, 0.42, 0.56, 0.7, 0.84, 1];
    const hub = node(N, 0, h, true), rad = [];
    for (let k = 0; k <= nr; k++) {
      const a = (k / nr) * (Math.PI / 2) + (k && k < nr ? (R() - 0.5) * 0.14 : 0), len = k === 0 || k === nr ? 1 : 0.84 + R() * 0.16;
      const row = [];
      rings.forEach((r) => {
        const x = Math.cos(a) * w * r * len, y = h - Math.sin(a) * h * r * len;
        row.push(node(N, x, y, k === 0 || k === nr)); // the two outer spokes lie on the surfaces: stuck along their length
      });
      rad.push(row);
      seg(N, hub, row[0], "spoke", 0.98);
      for (let j = 1; j < row.length; j++) seg(N, row[j - 1], row[j], "spoke", 0.98);
    }
    // the spiral: between neighbouring spokes, each thread sags a little towards the hub; a few are broken
    rings.forEach((r, j) => {
      const frame = j === rings.length - 1;
      for (let k = 0; k < nr; k++) {
        if (!frame && R() < 0.09) continue;
        const a = rad[k][j], b = rad[k + 1][j], A = N.n[a], B = N.n[b];
        const sag = frame ? 0.9 : 0.93, mx = ((A.x + B.x) / 2) * sag, my = h - (h - (A.y + B.y) / 2) * sag;
        const m = node(N, mx, my);
        seg(N, a, m, frame ? "frame" : "ring", 0.995); seg(N, m, b, frame ? "frame" : "ring", 0.995);
      }
    });
    // a loose strand hanging off the outer edge
    const from = rad[Math.floor(nr / 2)][rings.length - 2];
    let prev = from; const L = 2 + R() * 1.5;
    for (let q = 1; q <= 3; q++) { const P = N.n[from], c = node(N, P.x + q * 0.6, P.y + q * L, false, true); seg(N, prev, c, "strand"); prev = c; }
    N.speck = rad[2][2];
    return N;
  }

  /** A drape: a tattered sheet hanging from the underside of the shelf edge, stuck along the top. */
  function drapeNet(w, h, R) {
    // under a shelf a cobweb is a tangle, not a net: loose threads sag between points stuck along the underside,
    // a few threads run between those, and wisps hang from the lowest ones
    const N = net(), na = 6 + Math.floor(R() * 3), anchors = [];
    for (let k = 0; k < na; k++) anchors.push(node(N, (k / (na - 1)) * w * (0.92 + R() * 0.08) + (R() - 0.5) * 6, 0, true));
    const chains = [];
    const chain = (a, b, sag) => {
      const A = N.n[a], B = N.n[b], span = Math.hypot(B.x - A.x, B.y - A.y), n = Math.max(6, Math.round(span / 4)), pts = [a];
      for (let q = 1; q < n; q++) { const t = q / n; pts.push(node(N, A.x + (B.x - A.x) * t, A.y + (B.y - A.y) * t + Math.sin(t * Math.PI) * sag)); }
      pts.push(b);
      for (let q = 1; q < pts.length; q++) seg(N, pts[q - 1], pts[q], "frame", 1.0);
      chains.push(pts); return pts;
    };
    // sagging threads between near and far anchors
    for (let k = 0; k < na - 1; k++) chain(anchors[k], anchors[k + 1], h * (0.25 + R() * 0.35));
    for (let q = 0; q < 3; q++) { const a = Math.floor(R() * (na - 2)), b = Math.min(na - 1, a + 2 + Math.floor(R() * 2)); chain(anchors[a], anchors[b], h * (0.55 + R() * 0.45)); }
    // threads tying the sagging ones together
    for (let q = 0; q < 9; q++) {
      const c1 = chains[Math.floor(R() * chains.length)], c2 = chains[Math.floor(R() * chains.length)];
      if (c1 === c2) continue;
      const p1 = c1[1 + Math.floor(R() * (c1.length - 2))], p2 = c2[1 + Math.floor(R() * (c2.length - 2))];
      const A = N.n[p1], B = N.n[p2]; if (Math.hypot(A.x - B.x, A.y - B.y) > w * 0.35) continue;
      seg(N, p1, p2, "ring", 1.1 + R() * 0.12);
    }
    // wisps hanging from the lowest points
    const low = chains.slice(-3);
    for (const c of low) {
      const base = c[Math.floor(c.length / 2)], P = N.n[base], L = 2.5 + R() * 2.5, n = 3 + Math.floor(R() * 4);
      let prev = base; for (let k = 1; k <= n; k++) { const m = node(N, P.x + (R() - 0.5), P.y + k * L, false, true); seg(N, prev, m, "strand"); prev = m; }
    }
    N.speck = chains[chains.length - 1][2];
    return N;
  }

  // ---------------------------------------------------------------- moving and drawing
  const live = new Set();
  let raf = 0, T = 0;
  function loop(now) {
    raf = 0; T = now / 1000;
    for (const W of live) {
      if (!W.el.isConnected && !W.tearing) { live.delete(W); continue; }
      step(W); draw(W);
      if (W.done) { live.delete(W); W.el.remove(); }
    }
    if (live.size && !document.hidden) raf = requestAnimationFrame(loop);
  }
  const kick = () => { if (!raf && live.size) raf = requestAnimationFrame(loop); };
  document.addEventListener("visibilitychange", kick);

  function step(W) {
    const N = W.N, t = T + W.ph;
    const wind = calm ? 0 : W.tearing ? 0 : 0.0042 * W.gust(t);
    const grav = W.tearing ? 0.075 : 0;
    const drag = W.tearing ? 0.94 : 0.9;
    for (const p of N.n) {
      if (p.pin) continue;
      if (p.gx != null) { p.px = p.x; p.py = p.y; p.x += (p.gx - p.x) * 0.5; p.y += (p.gy - p.y) * 0.5; continue; }
      const vx = (p.x - p.px) * drag, vy = (p.y - p.py) * drag;
      p.px = p.x; p.py = p.y;
      // a draught that rolls across the web, stronger where the web is far from its anchors
      const fx = wind * (Math.sin(t * 0.9 + p.y * 0.07) + 0.6 * Math.sin(t * 2.3 + p.x * 0.11));
      const fy = wind * 0.6 * Math.sin(t * 1.3 + p.x * 0.05 + 1.7);
      p.x += vx + fx; p.y += vy + fy + grav + (p.hang && !W.tearing ? 0.03 : 0);
      // a corner web cannot pass through the book or shelf it is stuck to
      if (W.corner) { if (p.y > W.h) p.y = W.h; if (p.x < 0 && !W.tearing) p.x = 0; }
    }
    if (W.tearing) {
      W.age++;
      // the torn web gathers into a wad: every thread slowly shortens
      if (W.age > W.hold) for (const S of N.s) S.len *= W.quick ? 0.94 : 0.965;
      // the finger lets go
      if (W.age === W.hold) for (const p of N.n) p.gx = null;
      if (W.finger && W.age < W.hold) { const f = Math.min(1, W.age / W.hold), e = f * f * (3 - 2 * f); for (const p of N.n) if (p.gx != null) { p.gx = p.ox + W.pull[0] * e; p.gy = p.oy + W.pull[1] * e; } }
      if (W.age > W.hold + W.life) W.done = true;
    }
    for (let it = 0; it < 4; it++) {
      for (let i = N.s.length - 1; i >= 0; i--) {
        const S = N.s[i], A = N.n[S.a], B = N.n[S.b];
        const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 0.001;
        if (W.tearing) {
          // a thread pulled far past its length snaps; a stuck end pulled hard comes unstuck
          if (d > S.len * 2.4 && S.kind !== "strand") { N.s.splice(i, 1); continue; }
          if (d > S.len * 1.45) { if (A.pin && Math.random() < 0.25) A.pin = false; if (B.pin && Math.random() < 0.25) B.pin = false; }
        }
        const k = (d - S.len) / d * (S.kind === "strand" ? 0.5 : 0.45);
        const aw = A.pin || A.gx != null ? 0 : 1, bw = B.pin || B.gx != null ? 0 : 1, sum = aw + bw;
        if (!sum) continue;
        A.x += dx * k * (aw / sum) * 2 * 0.5; A.y += dy * k * (aw / sum) * 2 * 0.5;
        B.x -= dx * k * (bw / sum) * 2 * 0.5; B.y -= dy * k * (bw / sum) * 2 * 0.5;
      }
    }
  }

  function draw(W) {
    const c = W.ctx, N = W.N, t = T + W.ph;
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    c.clearRect(0, 0, W.cw, W.ch);
    c.translate(PAD, PAD);
    if (W.flip) { c.translate(W.w, 0); c.scale(-1, 1); }
    const fade = W.tearing ? Math.max(0, Math.min(1, (W.hold + W.life - W.age) / (W.life * 0.6))) : 1;
    c.lineCap = "round";
    // the light: a band of sheen that drifts across the web and catches threads at the right angle
    const sx = Math.cos(t * 0.23) * 0.5 + 0.5;
    for (const S of N.s) {
      const A = N.n[S.a], B = N.n[S.b];
      const ang = Math.atan2(B.y - A.y, B.x - A.x), mx = (A.x + B.x) / 2 / (W.w || 1);
      const catchA = Math.pow(Math.max(0, Math.cos(ang * 2 - t * 0.35 + W.ph)), 14);
      const near = Math.max(0, 1 - Math.abs(mx - sx) * 3);
      const glint = calm ? 0 : catchA * near;
      const base = (S.kind === "ring" ? 0.24 : S.kind === "strand" ? 0.3 : 0.4) * (W.corner ? 1 : 0.7);
      c.strokeStyle = `rgba(${228 + glint * 27},${230 + glint * 25},${238 + glint * 17},${((base + glint * 0.55) * fade).toFixed(3)})`;
      c.lineWidth = (S.kind === "ring" ? 0.45 : 0.6) + glint * 0.25;
      c.beginPath(); c.moveTo(A.x, A.y); c.lineTo(B.x, B.y); c.stroke();
    }
    // dust caught in it
    const sp = N.n[N.speck];
    if (sp) { c.fillStyle = `rgba(200,192,176,${0.55 * fade})`; c.beginPath(); c.arc(sp.x, sp.y, 0.9, 0, 7); c.fill(); }
  }

  /** Make a web element. kind: "corner" (corner at bottom left; flip for bottom right) or "drape". */
  function make(id, kind, w, h, flip) {
    if (gone.has(id)) return null;
    const seed = [...id].reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7);
    const R = rng(seed);
    const N = kind === "drape" ? drapeNet(w, h, R) : cornerNet(w, h, R);
    const el = document.createElement("div");
    el.className = `web ${kind}${flip ? " flip" : ""}`; el.dataset.web = id;
    el.style.width = w + "px"; el.style.height = h + "px";
    const cv = document.createElement("canvas"), cw = w + PAD * 2, ch = h * (kind === "drape" ? 1.6 : 1) + PAD + FALL;
    cv.width = Math.ceil(cw * DPR); cv.height = Math.ceil(ch * DPR);
    cv.style.cssText = `position:absolute;left:${-PAD}px;top:${-PAD}px;width:${cw}px;height:${ch}px;pointer-events:none`;
    el.append(cv);
    const g1 = 0.7 + R() * 0.6, g2 = 1.7 + R();
    const W = { el, N, w, h, flip, corner: kind !== "drape", cw, ch, ctx: cv.getContext("2d"), ph: R() * 50, tearing: false, age: 0, hold: 22, life: 45,
      // gusts come and go: mostly still, now and then a breath of air
      gust: (t) => 0.25 + 0.75 * Math.pow(Math.max(0, Math.sin(t * 0.21 * g1) * Math.sin(t * 0.13 * g2 + 1)), 2) * 3 };
    el._web = W;
    el.addEventListener("pointerdown", (e) => e.stopPropagation());
    el.addEventListener("click", (e) => { e.stopPropagation(); tear(el, e.clientX, e.clientY); });
    // settle it before it is seen, so it does not start by sagging into place
    for (let k = 0; k < 30; k++) step(W);
    live.add(W); requestAnimationFrame(() => { draw(W); kick(); });
    return el;
  }

  /** Brush a web away. (px, py): where it was touched, or nothing when a moving book tore it. */
  function tear(el, px, py) {
    if (!el || el._torn) return; el._torn = true;
    remember(el.dataset.web);
    const W = el._web; if (!W) { el.remove(); return; }
    el.classList.add("tearing");
    W.tearing = true; W.age = 0; live.add(W);
    const drp = el.classList.contains("drape");
    if (px != null) {
      // the threads near the finger stick to it and are dragged away from where the web is anchored
      const r = el.getBoundingClientRect();
      let lx = px - r.left, ly = py - r.top; if (W.flip) lx = W.w - lx;
      W.finger = true;
      W.pull = drp ? [(Math.random() - 0.5) * 20, W.h * 0.9 + 20] : [W.w * 0.7, -W.h * 0.35];
      let any = false;
      for (const p of W.N.n) if (Math.hypot(p.x - lx, p.y - ly) < Math.max(10, W.w * 0.22)) { p.gx = p.x; p.gy = p.y; p.ox = p.x; p.oy = p.y; any = true; }
      if (!any) { let best = null, bd = 1e9; for (const p of W.N.n) { const d = Math.hypot(p.x - lx, p.y - ly); if (d < bd && !p.pin) { bd = d; best = p; } } if (best) { best.gx = best.x; best.gy = best.y; best.ox = best.x; best.oy = best.y; } }
    } else {
      // a book slid against it: the side stuck to that book comes away and the web collapses and drops
      W.hold = 4; W.life = 28; W.quick = true;
      for (const p of W.N.n) { if (p.pin && (drp || p.x < 1.5)) p.pin = false; p.px = p.x - (drp ? 0 : 0.8 + Math.random() * 0.6); }
    }
    kick();
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
  // It comes in from off screen now and then and leaves by another edge; the next visit starts from the edge it last left
  // by, so its trips join into one loop. It keeps to the stone: never across the window glass or the hanging herbs.
  // It moves the way spiders do: a quick dash, a dead stop, a few slow steps, a turn. Its eight legs step in two
  // alternating sets of four; each foot stays planted on the wall until the body has moved past it, then swings forward.
  const EDGES = ["left", "right", "bottom"];
  // places on the witch's tower picture it must keep off, as fractions of the picture: the glass and its arch, the herbs
  const AVOID = [[0.29, 0.185, 0.72, 0.525], [0.05, 0.02, 0.95, 0.215]];
  let lastExit = null, nextT = 0, running = null;
  function host() { return document.querySelector("#backdrop .wallSpider"); }
  function startSpider() {
    if (running) return;
    clearTimeout(nextT);
    nextT = setTimeout(visit, lastExit ? 30000 + Math.random() * 40000 : 7000 + Math.random() * 9000);
  }
  function edgePoint(edge, W, H, pad = 40) {
    const r = edge === "bottom" ? 0.08 + Math.random() * 0.84 : 0.25 + Math.random() * 0.7;
    return edge === "left" ? [-pad, H * r] : edge === "right" ? [W + pad, H * r] : [W * r, H + pad];
  }
  const blocked = (x, y, W, H, m) => AVOID.some(([a, b, c, d]) => x > a * W - m && x < c * W + m && y > b * H - m && y < d * H + m);
  function spline(pts) {
    const path = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let t = 0; t < 1; t += 0.02) {
        const t2 = t * t, t3 = t2 * t;
        path.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
      }
    }
    path.push(pts[pts.length - 1]);
    return path;
  }
  function route(entry, exit, W, H) {
    for (let tries = 0; tries < 60; tries++) {
      const a = edgePoint(entry, W, H), b = edgePoint(exit, W, H), pts = [a];
      const turns = 2 + Math.floor(Math.random() * 2);
      let ok = true;
      for (let k = 1; k <= turns && ok; k++) {
        const t = k / (turns + 1);
        let p = null;
        for (let q = 0; q < 20 && !p; q++) {
          const c = [a[0] + (b[0] - a[0]) * t + (Math.random() - 0.5) * W * 0.5, a[1] + (b[1] - a[1]) * t + (Math.random() - 0.5) * H * 0.35];
          if (c[0] > W * 0.1 && c[0] < W * 0.9 && c[1] > H * 0.08 && c[1] < H * 0.95 && !blocked(c[0], c[1], W, H, 26)) p = c;
        }
        if (p) pts.push(p); else ok = false;
      }
      if (!ok) continue;
      pts.push(b);
      const path = spline(pts);
      if (path.every(([x, y]) => !blocked(x, y, W, H, 16))) return path;
    }
    // along the lower wall, well clear of everything
    const y = H * (0.68 + Math.random() * 0.2);
    return spline([edgePoint(entry, W, H), [W * 0.3, y], [W * 0.7, y + (Math.random() - 0.5) * 40], edgePoint(exit, W, H)]);
  }

  // the spider's body plan, in pixels, x pointing forward: hips round the front body, and where each foot rests
  const HIPS = [[3.6, 1.7], [2.4, 2.3], [1.0, 2.4], [-0.3, 2.0]];
  const REST = [[19.5, 10.5], [8, 17.5], [-5, 17.5], [-16.5, 12]];
  const LEGS = [];
  for (let k = 0; k < 4; k++) for (const side of [1, -1]) {
    const hip = [HIPS[k][0], HIPS[k][1] * side], rest = [REST[k][0], REST[k][1] * side];
    const reach = Math.hypot(rest[0] - hip[0], rest[1] - hip[1]);
    LEGS.push({ k, side, hip, rest, L1: reach * 0.52, L2: reach * 0.7, group: (k + (side > 0 ? 0 : 1)) % 2, foot: null, sw: null });
  }
  const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  const SZ = 112; // the spider's own little canvas, which travels with it

  function visit() {
    const box = host(); if (!box) return;
    if (document.hidden) { nextT = setTimeout(visit, 5000); return; }
    const W = box.clientWidth || innerWidth, H = box.clientHeight || innerHeight;
    const entry = lastExit || EDGES[Math.floor(Math.random() * EDGES.length)];
    const exits = EDGES.filter((e) => e !== entry), exit = exits[Math.floor(Math.random() * exits.length)];
    const path = route(entry, exit, W, H);
    const len = [0]; for (let i = 1; i < path.length; i++) len.push(len[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
    const cv = document.createElement("canvas"); cv.className = "spider";
    cv.width = SZ * DPR; cv.height = SZ * DPR; cv.style.width = cv.style.height = SZ + "px";
    box.append(cv); running = cv;
    const c = cv.getContext("2d");
    const legs = LEGS.map((l) => ({ ...l, foot: null, sw: null }));
    // how it moves: dashes and stops
    let s = 0, last = performance.now(), speed = 0, target = 0, until = last + 300, ang = null, angV = 0, bob = 0;
    const plan = (now) => {
      const r = Math.random();
      if (target > 0 || r < 0.25) { target = 0; until = now + 350 + Math.random() * (r < 0.1 ? 2600 : 1200); }
      else if (r < 0.45) { target = 22 + Math.random() * 18; until = now + 500 + Math.random() * 700; } // a few careful steps
      else { target = 75 + Math.random() * 40; until = now + 300 + Math.random() * 650; } // a dash
    };
    const frame = (now) => {
      if (!cv.isConnected) { running = null; return; }
      const dt = Math.min(0.04, (now - last) / 1000); last = now;
      if (now > until) plan(now);
      // spiders start and stop almost at once
      speed += (target - speed) * Math.min(1, dt * (target > speed ? 14 : 22));
      s += speed * dt;
      if (s >= len[len.length - 1]) { cv.remove(); running = null; lastExit = exit; startSpider(); return; }
      let i = 1; while (i < len.length - 1 && len[i] < s) i++;
      const f = (s - len[i - 1]) / Math.max(0.001, len[i] - len[i - 1]);
      const x = path[i - 1][0] + (path[i][0] - path[i - 1][0]) * f, y = path[i - 1][1] + (path[i][1] - path[i - 1][1]) * f;
      const want = Math.atan2(path[Math.min(path.length - 1, i + 2)][1] - path[i - 1][1], path[Math.min(path.length - 1, i + 2)][0] - path[i - 1][0]);
      if (ang === null) ang = want;
      else { let d = want - ang; d = Math.atan2(Math.sin(d), Math.cos(d)); const na = ang + d * Math.min(1, dt * (speed > 30 ? 9 : 4)); angV = (na - ang) / Math.max(dt, 0.001); ang = na; }
      const vx = Math.cos(ang) * speed, vy = Math.sin(ang) * speed;
      // legs: a planted foot stays where it is on the wall; when it trails too far behind, its set of four steps
      const stride = 7 + Math.min(1, speed / 110) * 7, swingT = Math.max(0.05, 0.12 - speed * 0.0006);
      const restW = (l) => { const [rx, ry] = rot(l.rest[0], l.rest[1], ang); return [x + rx, y + ry]; };
      let swinging = -1;
      for (const l of legs) {
        if (!l.foot) l.foot = restW(l);
        if (l.sw) {
          l.sw.t += dt / swingT;
          const e = Math.min(1, l.sw.t), ee = e * e * (3 - 2 * e);
          l.foot = [l.sw.a[0] + (l.sw.b[0] - l.sw.a[0]) * ee, l.sw.a[1] + (l.sw.b[1] - l.sw.a[1]) * ee];
          l.lift = Math.sin(e * Math.PI);
          if (e >= 1) { l.sw = null; l.lift = 0; } else swinging = l.group;
        }
      }
      for (const l of legs) if (!l.sw) { const r = restW(l), e = Math.hypot(l.foot[0] - r[0], l.foot[1] - r[1]); if (e > stride * 1.3) { const lead = stride * 0.45; l.sw = { t: 0, a: l.foot, b: [r[0] + Math.cos(ang) * lead, r[1] + Math.sin(ang) * lead] }; } }
      if (swinging < 0) {
        let worst = -1, wErr = 0;
        for (const l of legs) { const r = restW(l), e = Math.hypot(l.foot[0] - r[0], l.foot[1] - r[1]); if (e > wErr) { wErr = e; worst = l.group; } }
        if (wErr > (speed > 3 ? stride * 0.55 : 2.2)) {
          for (const l of legs) if (l.group === worst) {
            const r = restW(l), lead = speed > 3 ? stride * 0.45 : 0;
            l.sw = { t: 0, a: l.foot, b: [r[0] + Math.cos(ang) * lead, r[1] + Math.sin(ang) * lead] };
          }
          bob = 1;
        }
      }
      bob *= Math.pow(0.02, dt);
      drawSpider(c, x, y, ang, angV, legs, bob, now);
      cv.style.transform = `translate3d(${(x - SZ / 2).toFixed(1)}px,${(y - SZ / 2).toFixed(1)}px,0)`;
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  function drawSpider(c, x, y, ang, angV, legs, bob, now) {
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    c.clearRect(0, 0, SZ, SZ);
    c.translate(SZ / 2 - x, SZ / 2 - y); // world coordinates
    // its shadow falls on the stone a little below and to the right
    c.shadowColor = "rgba(0,0,0,.5)"; c.shadowBlur = 2.5 * DPR; c.shadowOffsetX = 1.6 * DPR; c.shadowOffsetY = 2.4 * DPR;
    c.lineCap = "round"; c.lineJoin = "round";
    for (const l of legs) {
      const [hx, hy] = rot(l.hip[0], l.hip[1], ang), H = [x + hx, y + hy], F = l.foot;
      let dx = F[0] - H[0], dy = F[1] - H[1], d = Math.hypot(dx, dy);
      const L1 = l.L1, L2 = l.L2 * (1 - (l.lift || 0) * 0.12); // a lifted leg looks shorter from above
      d = Math.max(Math.abs(L1 - L2) + 0.2, Math.min(L1 + L2 - 0.2, d));
      const base = Math.atan2(dy, dx), a = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
      // the knee bends up and out, away from the body
      const k1 = [H[0] + Math.cos(base + a) * L1, H[1] + Math.sin(base + a) * L1], k2 = [H[0] + Math.cos(base - a) * L1, H[1] + Math.sin(base - a) * L1];
      const side = (p) => { const [, ly] = rot(p[0] - x, p[1] - y, -ang); return ly * l.side; };
      const K = side(k1) > side(k2) ? k1 : k2;
      const tip = [K[0] + (F[0] - K[0]) * 0.72, K[1] + (F[1] - K[1]) * 0.72];
      c.strokeStyle = "#160f0d"; c.lineWidth = 1.3; c.beginPath(); c.moveTo(H[0], H[1]); c.lineTo(K[0], K[1]); c.stroke();
      c.lineWidth = 0.9; c.beginPath(); c.moveTo(K[0], K[1]); c.lineTo(tip[0], tip[1]); c.stroke();
      c.lineWidth = 0.55; c.beginPath(); c.moveTo(tip[0], tip[1]); c.lineTo(F[0], F[1]); c.stroke();
      // a little sheen on the upper leg and a pale joint
      c.shadowColor = "transparent";
      c.strokeStyle = "rgba(150,120,105,.35)"; c.lineWidth = 0.45; c.beginPath(); c.moveTo(H[0], H[1]); c.lineTo(K[0], K[1]); c.stroke();
      c.fillStyle = "rgba(120,95,85,.6)"; c.beginPath(); c.arc(K[0], K[1], 0.55, 0, 7); c.fill();
      c.shadowColor = "rgba(0,0,0,.5)";
    }
    // body: the front body, then the abdomen, which swings a little behind when it turns and rises with each step
    c.save(); c.translate(x, y); c.rotate(ang);
    c.save(); c.translate(-1.2, 0); c.rotate(Math.max(-0.35, Math.min(0.35, -angV * 0.05)));
    const s = 1 + bob * 0.03;
    const ab = c.createRadialGradient(-6.4, -1.8, 0.5, -5.8, 0, 6.4);
    ab.addColorStop(0, "#3e302b"); ab.addColorStop(0.35, "#211714"); ab.addColorStop(1, "#0a0706");
    c.fillStyle = ab; c.beginPath(); c.ellipse(-5.6, 0, 5.8 * s, 4.5 * s, 0, 0, 7); c.fill();
    c.shadowColor = "transparent";
    // markings and hairs on the abdomen
    c.strokeStyle = "rgba(150,122,100,.2)"; c.lineWidth = 0.45;
    for (let q = 0; q < 3; q++) { const px = -3.2 - q * 2.1, w = 2.2 - q * 0.5; c.beginPath(); c.moveTo(px - 0.8, -w); c.lineTo(px, 0); c.lineTo(px - 0.8, w); c.stroke(); }
    // a fuzz of fine hairs: short, uneven, lying back along the body
    c.strokeStyle = "rgba(95,78,70,.35)"; c.lineWidth = 0.25;
    for (let q = 0; q < 34; q++) { const t = q * 2.39996, r = 0.55 + ((q * 37) % 11) / 24, ex = -5.6 + Math.cos(t) * 5.4 * r, ey = Math.sin(t) * 4.1 * r; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex - 0.9, ey + Math.sin(t) * 0.25); c.stroke(); }
    c.restore();
    c.shadowColor = "rgba(0,0,0,.5)";
    const ce = c.createRadialGradient(1.6, -1.2, 0.3, 2, 0, 4);
    ce.addColorStop(0, "#3a2c27"); ce.addColorStop(0.6, "#1a1214"); ce.addColorStop(1, "#090606");
    c.fillStyle = ce; c.beginPath(); c.ellipse(1.8, 0, 3.7, 3.1, 0, 0, 7); c.fill();
    c.shadowColor = "transparent";
    // palps, which twitch now and then, fangs and eyes
    const tw = Math.sin(now / 90) * (Math.sin(now / 1300) > 0.7 ? 0.5 : 0);
    c.strokeStyle = "#1a1210"; c.lineWidth = 0.8;
    for (const sd of [1, -1]) { c.beginPath(); c.moveTo(5, sd * 1); c.lineTo(6.6, sd * (1.8 + tw)); c.lineTo(7.6, sd * (1.3 + tw)); c.stroke(); }
    c.fillStyle = "#120c0b"; c.beginPath(); c.ellipse(5.4, 0, 0.9, 1.1, 0, 0, 7); c.fill();
    c.fillStyle = "rgba(200,185,175,.55)";
    for (const [ex, ey] of [[4.4, 0.7], [4.4, -0.7], [3.7, 1.3], [3.7, -1.3]]) { c.beginPath(); c.arc(ex, ey, 0.32, 0, 7); c.fill(); }
    c.restore();
  }
  window.ShelfWebs = { make, tear, isGone: (id) => gone.has(id) };
  window.ShelfSpider = { start: startSpider, _visit: visit };
})();
