/* The loft's cat. Now and then a black cat jumps up onto the windowsill, settles down, dozes off with its eyes shut,
   wakes, gets up, has a long stretch and drops back down. It is seen against the window, so it is a dark shape with
   the window's light along its back. Its body is a little skeleton: shoulders, hips, head, legs bent by IK, a tail;
   each moment of the visit is a pose, and the cat moves smoothly from pose to pose. */
(() => {
  "use strict";
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TOP = 0.55, GROUND = 0.8125; // the canvas starts at 55% down the picture; the sill's top is at 81%
  let timer = 0, running = false, first = true;
  const host = () => document.querySelector("#backdrop .loftCat");

  // ---------------------------------------------------------------- poses (units: shoulder-to-hip ≈ 1, +x forward, -y up)
  const STAND = { x: 0, y: 0, rot: 0, sh: [0.48, -0.8], hp: [-0.48, -0.82], rc: 0.3, rh: 0.28, hd: [0.82, -1.12], ht: 0,
    ff: [0.5, 0], ff2: [0.38, 0], hf: [-0.46, 0], hf2: [-0.6, 0], tl: [[-0.95, -0.7], [-1.22, -0.36], [-1.4, -0.5]], eye: 1, flick: 1 };
  const P = (base, o) => Object.assign(JSON.parse(JSON.stringify(base)), o);
  const CROUCH = P(STAND, { sh: [0.5, -0.6], hp: [-0.46, -0.55], hd: [0.84, -0.9], ht: 0.1, ff: [0.55, 0], ff2: [0.45, 0], hf: [-0.4, 0], hf2: [-0.5, 0] });
  const LOOK = P(STAND, { hd: [0.86, -1.16], ht: -0.18 });
  const AIR_UP = P(STAND, { rot: -0.4, sh: [0.55, -0.86], hp: [-0.55, -0.8], hd: [0.92, -1.12], ht: -0.1,
    ff: [1.05, -0.72], ff2: [0.98, -0.62], hf: [-1.12, -0.4], hf2: [-1.02, -0.3], tl: [[-1.0, -0.86], [-1.36, -0.74], [-1.62, -0.8]], flick: 0 });
  const LIE = P(STAND, { sh: [0.45, -0.44], hp: [-0.42, -0.38], rc: 0.31, rh: 0.34, hd: [0.8, -0.82], ht: 0,
    ff: [0.95, -0.03], ff2: [0.84, -0.03], hf: [-0.05, -0.04], hf2: [-0.14, -0.04], tl: [[-0.86, -0.1], [-0.3, -0.03], [0.22, -0.05]] });
  const SLEEP = P(LIE, { hd: [0.8, -0.6], ht: 0.42, eye: 0, flick: 0.25, sh: [0.43, -0.4], tl: [[-0.86, -0.1], [-0.25, -0.02], [0.35, -0.06]] });
  const STRETCH = P(STAND, { sh: [0.62, -0.38], hp: [-0.42, -0.88], rc: 0.28, rh: 0.27, hd: [1.0, -0.52], ht: 0.12,
    ff: [1.26, -0.02], ff2: [1.14, -0.02], hf: [-0.42, 0], hf2: [-0.54, 0], tl: [[-0.72, -1.2], [-0.64, -1.55], [-0.5, -1.72]], eye: 0.35, flick: 0 });
  const AIR_DOWN = P(AIR_UP, { rot: 0.45, ff: [1.0, -0.2], ff2: [0.92, -0.12], hf: [-1.0, -0.7], hf2: [-0.92, -0.62], hd: [0.92, -1.02], ht: 0.15 });

  const mix = (a, b, t) => Array.isArray(a) ? a.map((v, i) => mix(v, b[i], t)) : typeof a === "number" ? a + (b - a) * t : a;
  const blend = (A, B, t) => { const o = {}; for (const k in A) o[k] = mix(A[k], B[k], t); return o; };
  const inout = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const out = (t) => 1 - Math.pow(1 - t, 2.4);
  const inq = (t) => t * t;
  const rnd = (a, b) => a + Math.random() * (b - a);

  // the visit: [pose, seconds to get there, easing, where it stands, arc height]
  function plan() {
    const at = (pose, x, y) => P(pose, { x, y });
    return [
      [at(CROUCH, -2.3, 4.6), 0, inout],
      [at(AIR_UP, -0.9, -0.35), 0.4, out, 0.4],
      [at(CROUCH, 0, 0), 0.26, inq],
      [at(STAND, 0, 0), 0.55, inout],
      [at(LOOK, 0, 0), 0.9, inout], [at(LOOK, 0, 0), rnd(0.8, 1.6), inout],
      [at(STAND, 0, 0), 0.8, inout],
      [at(LIE, 0, 0), 1.7, inout], [at(LIE, 0, 0), rnd(3, 5), inout],
      [at(SLEEP, 0, 0), 2.2, inout], [at(SLEEP, 0, 0), rnd(14, 22), inout],
      [at(LIE, 0, 0), 1.1, inout], [at(LIE, 0, 0), rnd(1.5, 2.5), inout],
      [at(STAND, 0, 0), 1.1, inout], [at(STAND, 0, 0), 0.3, inout],
      [at(STRETCH, 0.06, 0), 1.5, inout], [at(STRETCH, 0.06, 0), rnd(1.4, 2), inout],
      [at(STAND, 0, 0), 1.2, inout], [at(STAND, 0, 0), rnd(0.6, 1.2), inout],
      [at(CROUCH, 0, 0), 0.4, inout],
      [at(AIR_DOWN, 1.3, -0.3), 0.3, out, 0.25],
      [at(AIR_DOWN, 2.7, 4.8), 0.5, inq],
    ];
  }

  // ---------------------------------------------------------------- drawing
  function ik(a, b, L1, L2, bend) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const d = Math.max(Math.abs(L1 - L2) + 1e-3, Math.min(L1 + L2 - 1e-3, Math.hypot(dx, dy)));
    const th = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
    const k = [a[0] + L1 * Math.cos(th + bend * al), a[1] + L1 * Math.sin(th + bend * al)];
    const e = [k[0] + L2 * Math.cos(Math.atan2(b[1] - k[1], b[0] - k[0])), k[1] + L2 * Math.sin(Math.atan2(b[1] - k[1], b[0] - k[0]))];
    return [k, e];
  }
  const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];

  function shape(c, Q, t) {
    const breathe = 1 + (1 - Q.eye) * 0.035 * Math.sin(t * 2 * Math.PI / 3.4);
    const rc = Q.rc * breathe, rh = Q.rh * breathe;
    const line = (pts, w) => { c.lineWidth = w; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.stroke(); };
    const dot = (p, rx, ry = rx, a = 0) => { c.beginPath(); c.ellipse(p[0], p[1], rx, ry, a, 0, 7); c.fill(); };
    // legs: the far pair first (a little in from the near pair), then the body over them, then the near pair
    const leg = (root, paw, front) => {
      const [L1, L2] = front ? [0.42, 0.41] : [0.45, 0.47];
      const [k, e] = ik(root, paw, L1, L2, front ? 1 : -1);
      line([root, k], front ? 0.2 : 0.28); line([k, e], front ? 0.13 : 0.14);
      dot([e[0] + (front ? 0.035 : 0.025), e[1] - 0.045], 0.09, 0.055);
    };
    const shR = [Q.sh[0] - 0.02, Q.sh[1] + 0.06], hpR = [Q.hp[0] + 0.05, Q.hp[1] + 0.05];
    leg(shR, Q.ff2, true); leg(hpR, Q.hf2, false);
    // tail: tapering from a thick root to a rounded tip, the tip flicks now and then
    const base = [Q.hp[0] - rh * 0.85, Q.hp[1] - rh * 0.25];
    const tip = Q.tl[2], fl = Q.flick * (0.07 * Math.sin(t * 2.1) + 0.05 * Math.sin(t * 5.3) * Math.max(0, Math.sin(t * 0.7)));
    const pts = [base, Q.tl[0], Q.tl[1], [tip[0] + fl * 0.4, tip[1] + fl]];
    for (let i = 0; i <= 40; i++) {
      const u = i / 40, s = u * 3, j = Math.min(2, Math.floor(s)), f = s - j;
      const p0 = pts[Math.max(0, j - 1)], p1 = pts[j], p2 = pts[j + 1], p3 = pts[Math.min(3, j + 2)];
      const q = [0, 1].map((m) => 0.5 * (2 * p1[m] + (-p0[m] + p2[m]) * f + (2 * p0[m] - 5 * p1[m] + 4 * p2[m] - p3[m]) * f * f + (-p0[m] + 3 * p1[m] - 3 * p2[m] + p3[m]) * f * f * f));
      dot(q, 0.085 - u * 0.035);
    }
    // body: chest and haunch joined along the back, the belly hanging a little
    const ax = Q.sh[0] - Q.hp[0], ay = Q.sh[1] - Q.hp[1], al = Math.hypot(ax, ay) || 1, nx = ay / al, ny = -ax / al; // n points up
    const a0 = Math.atan2(-ny, -nx);
    c.beginPath();
    c.arc(Q.hp[0], Q.hp[1], rh, a0, a0 + Math.PI, false);
    c.quadraticCurveTo((Q.hp[0] + Q.sh[0]) / 2 + nx * (Math.max(rc, rh) + 0.02), (Q.hp[1] + Q.sh[1]) / 2 + ny * (Math.max(rc, rh) + 0.02) + 0.03, Q.sh[0] + nx * rc, Q.sh[1] + ny * rc);
    c.arc(Q.sh[0], Q.sh[1], rc, a0 + Math.PI, a0 + 2 * Math.PI, false);
    c.quadraticCurveTo((Q.hp[0] + Q.sh[0]) / 2 - nx * (Math.max(rc, rh) + 0.07), (Q.hp[1] + Q.sh[1]) / 2 - ny * (Math.max(rc, rh) + 0.07), Q.hp[0] - nx * rh, Q.hp[1] - ny * rh);
    c.fill();
    dot([Q.hp[0] + 0.04, Q.hp[1] + 0.06], rh * 1.02, rh * 0.95); // the haunch
    // neck and head
    line([[Q.sh[0] + 0.02, Q.sh[1] - 0.04], Q.hd], 0.38);
    const H = (x, y) => { const r = rot(x, y, Q.ht); return [Q.hd[0] + r[0], Q.hd[1] + r[1]]; };
    dot(Q.hd, 0.24, 0.215, Q.ht);
    dot(H(0.16, 0.07), 0.115, 0.09, Q.ht);
    c.lineJoin = "round"; c.lineWidth = 0.05;
    for (const ear of [[[-0.18, -0.07], [-0.12, -0.33], [0.0, -0.18]], [[0.03, -0.18], [0.13, -0.31], [0.18, -0.08]]]) {
      const e = ear.map(([x, y]) => H(x, y)); c.beginPath(); c.moveTo(e[0][0], e[0][1]); c.lineTo(e[1][0], e[1][1]); c.lineTo(e[2][0], e[2][1]); c.closePath(); c.fill(); c.stroke();
    }
    leg(Q.sh, Q.ff, true); leg(Q.hp, Q.hf, false);
  }

  function draw(cv, c, off, oc, Q, t, sp) {
    const W = cv.width, Hc = cv.height;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, Hc);
    oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, W, Hc);
    const U = sp.U * DPR, gx = sp.x * DPR, gy = sp.g * DPR;
    const place = (k, dx = 0, dy = 0) => {
      k.setTransform(U * sp.dir, 0, 0, U, gx + Q.x * U * sp.dir + dx, gy + Q.y * U + dy);
      k.translate(0, -0.6); k.rotate(Q.rot); k.translate(0, 0.6);
    };
    // the shadow on the sill, softer and smaller as it leaves the ground
    const lift = Math.max(0, -Q.y), onSill = Q.y < 1 ? Math.max(0, 1 - lift * 1.6) : 0;
    if (onSill > 0.02) {
      c.setTransform(1, 0, 0, 1, 0, 0);
      const cx = gx + Q.x * U * sp.dir, g = c.createRadialGradient(cx, gy, 0, cx, gy, U * 1.3);
      g.addColorStop(0, `rgba(0,0,0,${0.5 * onSill})`); g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g; c.beginPath(); c.ellipse(cx, gy, U * 1.3, U * 0.16, 0, 0, 7); c.fill();
    }
    // the cat: a dark shape with soft fur edges
    place(c);
    c.fillStyle = c.strokeStyle = "#0b0a10"; c.lineCap = "round";
    c.shadowColor = "rgba(11,10,16,.85)"; c.shadowBlur = 2.2 * DPR;
    shape(c, Q, t);
    c.shadowBlur = 0;
    // the window's light along its back: the shape, minus itself moved down a touch
    place(oc); oc.fillStyle = oc.strokeStyle = "#fff"; oc.lineCap = "round"; shape(oc, Q, t);
    oc.globalCompositeOperation = "destination-out"; place(oc, -0.8 * DPR * sp.dir, 2.4 * DPR); shape(oc, Q, t);
    oc.globalCompositeOperation = "source-in"; oc.setTransform(1, 0, 0, 1, 0, 0); oc.fillStyle = "rgba(150,140,205,.5)"; oc.fillRect(0, 0, W, Hc);
    oc.globalCompositeOperation = "source-over";
    c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(off, 0, 0);
    // eyes catching the light
    if (Q.eye > 0.04) {
      place(c);
      const e = rot(0.12, -0.03, Q.ht), ex = Q.hd[0] + e[0], ey = Q.hd[1] + e[1];
      c.globalCompositeOperation = "lighter";
      const g = c.createRadialGradient(ex, ey, 0, ex, ey, 0.06);
      g.addColorStop(0, `rgba(215,225,140,${0.75 * Q.eye})`); g.addColorStop(0.5, `rgba(170,190,90,${0.35 * Q.eye})`); g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g; c.beginPath(); c.ellipse(ex, ey, 0.05, 0.034 * Q.eye, Q.ht - 0.15, 0, 7); c.fill();
      c.globalCompositeOperation = "source-over";
    }
  }

  // ---------------------------------------------------------------- a visit
  function visit() {
    const box = host(); if (!box || running) return;
    if (document.hidden) { timer = setTimeout(visit, 5000); return; }
    const bw = box.clientWidth, bh = box.clientHeight;
    if (!bw || !bh) { timer = setTimeout(visit, 5000); return; }
    const cv = document.createElement("canvas"); cv.width = Math.round(bw * DPR); cv.height = Math.round(bh * DPR);
    cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
    box.append(cv); running = true;
    const off = document.createElement("canvas"); off.width = cv.width; off.height = cv.height;
    const c = cv.getContext("2d"), oc = off.getContext("2d");
    // where on the sill (the box is as wide as the picture; the sill runs from 9% to 91%)
    const dir = Math.random() < 0.5 ? 1 : -1;
    const sp = { U: bw * 0.125, x: bw * (0.5 + rnd(-0.08, 0.08)) - dir * bw * 0.03, g: ((GROUND - TOP) / (1 - TOP)) * bh, dir };
    const keys = plan();
    const times = [0]; for (let i = 1; i < keys.length; i++) times.push(times[i - 1] + keys[i][1]);
    const t0 = performance.now();
    const frame = (now) => {
      if (!cv.isConnected) { running = false; schedule(); return; }
      const T = (now - t0) / 1000;
      if (T >= times[times.length - 1]) { cv.remove(); running = false; schedule(); return; }
      let i = 1; while (times[i] < T) i++;
      const k = keys[i], f = k[2]((T - times[i - 1]) / k[1]);
      const Q = blend(keys[i - 1][0], k[0], f);
      if (k[3]) Q.y -= k[3] * 4 * f * (1 - f); // a jump goes up before it comes down
      draw(cv, c, off, oc, Q, T, sp);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
  function schedule() {
    clearTimeout(timer);
    if (calm) return;
    timer = setTimeout(visit, first ? rnd(12000, 22000) : rnd(150000, 300000));
    first = false;
  }
  window.LoftCat = { start: () => { if (!running) schedule(); }, _visit: visit };
})();
