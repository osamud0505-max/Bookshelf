/* The loft's cat: osamu's Savannah cat, filmed (Gemini Veo) in one take on a green screen. Now and then it jumps up
   onto the windowsill from the left, lies down, dozes off, gets up, stretches and leaps off to the right. Its
   shadow on the sill is baked into the film. bg/loft-cat.mp4 holds the cat already cut out
   and graded to the loft's dusk: the top half of each frame is the colour, the bottom half how solid it is (white =
   cat, black = nothing). A small WebGL pass puts the two together, so it works on every phone (iPhones cannot play
   video that is see-through by itself). */
(() => {
  "use strict";
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SRC = "bg/loft-cat.mp4?v=4";
  // where the film sits in the loft picture (fractions of the picture): a little wider than the picture, so the cat
  // comes in and goes out past its edges, with its paw line on the sill's top
  const LEFT = -0.02, WIDTH = 1.04, ASPECT = 552 / 720, PAW = 533 / 980, SILL = 0.8125, TOP = 0.55;
  let timer = 0, running = false, first = true, video = null;
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
    g.attachShader(p, sh(g.FRAGMENT_SHADER, "precision mediump float;varying vec2 v;uniform sampler2D t;uniform float o;" +
      "void main(){vec3 c=texture2D(t,vec2(v.x,v.y*.5)).rgb;float a=texture2D(t,vec2(v.x,v.y*.5+.5)).r;" +
      "a=smoothstep(.06,.94,a)*o;gl_FragColor=vec4(c*a,a);}"));
    g.linkProgram(p); g.useProgram(p);
    const b = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, b);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(p, "p"); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const tex = g.createTexture(); g.bindTexture(g.TEXTURE_2D, tex);
    for (const [k, v] of [[g.TEXTURE_MIN_FILTER, g.LINEAR], [g.TEXTURE_MAG_FILTER, g.LINEAR], [g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE], [g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE]]) g.texParameteri(g.TEXTURE_2D, k, v);
    const uo = g.getUniformLocation(p, "o");
    return {
      draw(vid, o) {
        g.viewport(0, 0, cv.width, cv.height); g.clearColor(0, 0, 0, 0); g.clear(g.COLOR_BUFFER_BIT);
        try { g.texImage2D(g.TEXTURE_2D, 0, g.RGB, g.RGB, g.UNSIGNED_BYTE, vid); } catch (e) { return false; }
        g.uniform1f(uo, o); g.drawArrays(g.TRIANGLE_STRIP, 0, 4); return true;
      },
    };
  }

  function visit() {
    const box = host(); if (!box || running) return;
    if (document.hidden) { timer = setTimeout(visit, 5000); return; }
    const bw = box.clientWidth, bh = box.clientHeight / (1 - TOP); // the host starts 55% down the picture
    if (!bw || !bh) { timer = setTimeout(visit, 5000); return; }
    const vid = getVideo();
    const w = bw * WIDTH, h = w * ASPECT, top = SILL * bh - PAW * h - TOP * bh, left = LEFT * bw;
    const cv = document.createElement("canvas"), dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    cv.style.cssText = `position:absolute;left:${left}px;top:${top}px;width:${w}px;height:${h}px`;
    const G = gl(cv); if (!G) { schedule(); return; }
    box.append(cv); running = true;
    const done = () => { cv.remove(); running = false; try { vid.pause(); } catch (e) { /* fine */ } schedule(); };
    const go = () => {
      vid.currentTime = 0;
      const pr = vid.play(); if (pr && pr.catch) pr.catch(() => done());
      const frame = () => {
        if (!cv.isConnected) { done(); return; }
        if (vid.ended || (vid.duration && vid.currentTime >= vid.duration - 0.03)) { done(); return; }
        if (vid.readyState >= 2) G.draw(vid, 1);
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    if (vid.readyState >= 3) go();
    else { const ok = () => { vid.removeEventListener("canplaythrough", ok); go(); }; vid.addEventListener("canplaythrough", ok); vid.load(); }
  }
  function schedule() {
    clearTimeout(timer);
    if (calm) return;
    timer = setTimeout(visit, first ? rnd(10000, 18000) : rnd(150000, 300000));
    first = false;
  }
  window.LoftCat = { start: () => { if (!running) { getVideo(); schedule(); } }, _visit: visit };
})();
