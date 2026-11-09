/* The loft's cat: osamu's Savannah cat, filmed by Gemini Veo over the loft's own windowsill. A little while after the
   loft opens it jumps up onto the sill, walks a few steps, lies down and falls asleep, then sleeps there, breathing,
   for as long as the loft is open. Coming back to the loft later finds it already asleep.
   The film is laid whole over its band of the picture (lined up and colour-matched to the painting, so the empty sill
   in it is the painting's sill), with soft top and bottom edges. bg/loft-cat-in.mp4 is the jump in;
   bg/loft-cat-sleep.mp4 is a seamless sleeping loop that takes over when it ends. */
(() => {
  "use strict";
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const V = "?v=8", IN = "bg/loft-cat-in.mp4" + V, SLEEP = "bg/loft-cat-sleep.mp4" + V;
  // the film covers this band of the loft picture (fractions of the picture's height), full width
  const Y0 = 1702 / 2758, BAND = 658 / 2758, TOP = 0.55;
  let arrived = false, timer = 0, active = null;
  const host = () => document.querySelector("#backdrop .loftCat");
  const rnd = (a, b) => a + Math.random() * (b - a);

  function vid(src, loop) {
    const v = document.createElement("video");
    v.muted = true; v.defaultMuted = true; v.playsInline = true; v.loop = loop; v.preload = "auto";
    for (const a of ["playsinline", "muted", "disablepictureinpicture"]) v.setAttribute(a, "");
    v.setAttribute("aria-hidden", "true"); v.className = "loftCatFilm"; v.src = src;
    return v;
  }
  function place(box, wrap) {
    const bw = box.clientWidth, bh = box.clientHeight / (1 - TOP);
    if (!bw || !bh) return false;
    wrap.style.cssText = `top:${((Y0 - TOP) * bh).toFixed(1)}px;height:${(BAND * bh).toFixed(1)}px`;
    return true;
  }
  function stop() {
    clearTimeout(timer);
    if (active) { for (const v of active.vids) { try { v.pause(); } catch (e) { /* fine */ } v.removeAttribute("src"); v.load(); } active.wrap.remove(); removeEventListener("resize", active.resize); active = null; }
  }
  const play = (v) => { const p = v.play(); if (p && p.catch) p.catch(() => { /* autoplay refused */ }); };

  function show(fromStart) {
    const box = host(); if (!box) return;
    if (document.hidden) { timer = setTimeout(() => show(fromStart), 3000); return; }
    const wrap = document.createElement("div"); wrap.className = "loftCatBand";
    if (!place(box, wrap)) { timer = setTimeout(() => show(fromStart), 3000); return; }
    const sleep = vid(SLEEP, true), first = fromStart ? vid(IN, false) : null;
    const vids = first ? [sleep, first] : [sleep];
    wrap.append(...vids); box.prepend(wrap); // under the room's shadow (box::after)
    const resize = () => { const b = host(); if (b) place(b, wrap); };
    active = { wrap, vids, resize }; addEventListener("resize", resize);
    if (calm) { // no motion: just the sleeping cat, still
      sleep.addEventListener("loadeddata", () => { sleep.classList.add("on"); arrived = true; }, { once: true }); return;
    }
    if (!first) { sleep.addEventListener("playing", () => sleep.classList.add("on"), { once: true }); play(sleep); arrived = true; return; }
    // the jump in, then the sleeping loop takes over where it ends (the loop starts on the very next frame)
    first.addEventListener("playing", () => first.classList.add("on"), { once: true });
    first.addEventListener("ended", () => {
      arrived = true; sleep.currentTime = 0; play(sleep);
      sleep.addEventListener("playing", () => { sleep.classList.add("on", "now"); requestAnimationFrame(() => requestAnimationFrame(() => first.remove())); }, { once: true });
    }, { once: true });
    sleep.load(); play(first);
  }

  // pause while the tab is hidden; carry on when it comes back
  document.addEventListener("visibilitychange", () => {
    if (!active || calm) return;
    for (const v of active.vids) { if (!v.isConnected || (v.ended && !v.loop)) continue; if (document.hidden) v.pause(); else if (v.classList.contains("on")) play(v); }
  });

  window.LoftCat = {
    start() {
      stop();
      // the first time it jumps in a little after the loft opens; after that it is already asleep there
      if (arrived || calm) show(false);
      else timer = setTimeout(() => show(true), rnd(6000, 12000));
    },
    _visit: () => { stop(); show(true); },
  };
})();
