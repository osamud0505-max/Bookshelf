/* The loft's cat: osamu's Savannah cat, filmed by Gemini Veo over the loft's own windowsill. A little while after the
   loft opens it jumps up onto the sill, walks a few steps, lies down and falls asleep, and then sleeps there, breathing,
   for as long as the loft is open. Coming back to the loft later finds it already asleep.
   bg/loft-cat.mp4 holds only what the cat adds to the picture (itself, its shadow on the sill, its reflection in the
   glass): the top half of each frame is the colour, the bottom half how solid it is. A small WebGL pass puts the two
   together, so it works on every phone (iPhones cannot play video that is see-through by itself). */
(() => {
  "use strict";
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SRC = "bg/loft-cat.mp4?v=5";
  // the film covers this band of the loft picture (fractions of the picture's height), full width
  const Y0 = (1702 - 3) / 2758, BAND = 658 / 2758, TOP = 0.55;
  const LOOP0 = 171 / 24, LOOP1 = 235 / 24; // the sleeping breath: at LOOP1 it carries on from LOOP0 without a seam
  let video = null, arrived = false, timer = 0, raf = 0, active = null;
  const host = () => document.querySelector("#backdrop .loftCat");
  const rnd = (a, b) => a + Math.random() * (b - a);

  function getVideo() {
    if (video) return video;
    video = document.createElement("video");
    video.muted = true; video.defaultMuted = true; video.playsInline = true; video.setAttribute("playsinline", ""); video.setAttribute("muted", "");
    video.preload = "auto"; video.crossOrigin = "anonymous"; video.src = SRC;
    return video;
  }

  function gl(cv) {
    const g = cv.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!g) return null;
    const sh = (type, src) => { const s = g.createShader(type); g.shaderSource(s, src); g.compileShader(s); return s; };
    const p = g.createProgram();
    g.attachShader(p, sh(g.VERTEX_SHADER, "attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}"));
    g.attachShader(p, sh(g.FRAGMENT_SHADER, "precision mediump float;varying vec2 v;uniform sampler2D t;" +
      "void main(){vec3 c=texture2D(t,vec2(v.x,v.y*.5)).rgb;float a=texture2D(t,vec2(v.x,v.y*.5+.5)).r;" +
      "a=smoothstep(.03,.97,a);gl_FragColor=vec4(c*a,a);}"));
    g.linkProgram(p); g.useProgram(p);
    const b = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, b);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(p, "p"); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const tex = g.createTexture(); g.bindTexture(g.TEXTURE_2D, tex);
    for (const [k, v] of [[g.TEXTURE_MIN_FILTER, g.LINEAR], [g.TEXTURE_MAG_FILTER, g.LINEAR], [g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE], [g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE]]) g.texParameteri(g.TEXTURE_2D, k, v);
    return {
      draw(vid) {
        g.viewport(0, 0, cv.width, cv.height); g.clearColor(0, 0, 0, 0); g.clear(g.COLOR_BUFFER_BIT);
        try { g.texImage2D(g.TEXTURE_2D, 0, g.RGB, g.RGB, g.UNSIGNED_BYTE, vid); } catch (e) { return false; }
        g.drawArrays(g.TRIANGLE_STRIP, 0, 4); return true;
      },
    };
  }

  // lay the film's canvas over its band of the picture
  function place(box, cv) {
    const bw = box.clientWidth, bh = box.clientHeight / (1 - TOP);
    if (!bw || !bh) return false;
    const h = bh * BAND, top = (Y0 - TOP) * bh, dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(bw * dpr); cv.height = Math.round(h * dpr);
    cv.style.cssText = `position:absolute;left:0;top:${top}px;width:${bw}px;height:${h}px`;
    return true;
  }

  function stop() {
    cancelAnimationFrame(raf); clearTimeout(timer);
    if (active) { active.cv.remove(); removeEventListener("resize", active.resize); active = null; }
    if (video) try { video.pause(); } catch (e) { /* fine */ }
  }

  function show(fromStart) {
    const box = host(); if (!box) return;
    if (document.hidden) { timer = setTimeout(() => show(fromStart), 3000); return; }
    const cv = document.createElement("canvas");
    if (!place(box, cv)) { timer = setTimeout(() => show(fromStart), 3000); return; }
    const G = gl(cv); if (!G) return;
    const vid = getVideo();
    const resize = () => { const b = host(); if (b && active) place(b, cv); };
    active = { cv, resize }; addEventListener("resize", resize);
    box.append(cv);
    const go = () => {
      if (!active || active.cv !== cv) return;
      vid.currentTime = fromStart ? 0 : LOOP0;
      if (calm) { // no motion: just the sleeping cat, still
        const once = () => { vid.removeEventListener("seeked", once); G.draw(vid); };
        vid.addEventListener("seeked", once); return;
      }
      const pr = vid.play(); if (pr && pr.catch) pr.catch(() => { /* autoplay refused: try again on the next look change */ });
      const frame = () => {
        if (!cv.isConnected) { stop(); return; }
        if (vid.currentTime >= LOOP0) arrived = true;
        // the breath loop: from its end straight back to its start (the film crossfades into it)
        // (jumps a few frames before the end, keeping the breath's phase, so the film never reaches its end and stops)
        if (vid.currentTime >= LOOP1 - 0.12 && !vid.seeking) vid.currentTime = vid.currentTime - (LOOP1 - LOOP0);
        else if (vid.ended) { vid.currentTime = LOOP0; vid.addEventListener("seeked", () => vid.play().catch(() => {}), { once: true }); }
        if (vid.readyState >= 2) G.draw(vid);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };
    if (vid.readyState >= 3) go();
    else { const ok = () => { vid.removeEventListener("canplaythrough", ok); go(); }; vid.addEventListener("canplaythrough", ok); vid.load(); }
  }

  // pause while the tab is hidden; carry on when it comes back
  document.addEventListener("visibilitychange", () => {
    if (!video || !active || calm) return;
    if (document.hidden) video.pause(); else video.play().catch(() => {});
  });

  window.LoftCat = {
    start() {
      stop(); getVideo();
      // the first time it jumps in a little after the loft opens; after that it is already asleep there
      if (arrived || calm) show(false);
      else timer = setTimeout(() => show(true), rnd(6000, 12000));
    },
    _visit: () => { stop(); show(true); }, _video: () => video,
  };
})();
