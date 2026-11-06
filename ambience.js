/* Room sound: quiet background sound for each look (fire in the cabin, rain in the study, crickets in the forest…).
   Everything is generated in the browser with Web Audio, so there are no sound files to download.
   Browsers only allow sound after a tap, so it starts on the first tap and fades between rooms. */
(() => {
  "use strict";
  const KEY = "shelf.ambience.v1";
  let pref = { on: true, vol: 0.5 };
  try { pref = { ...pref, ...(JSON.parse(localStorage.getItem(KEY)) || {}) }; } catch (e) { /* first visit */ }
  const savePref = () => { try { localStorage.setItem(KEY, JSON.stringify(pref)); } catch (e) { /* private mode */ } };

  let ctx = null, master = null, room = null, roomKey = "", ducked = false, reading = false;
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ------------------------------------------------------------------ building blocks
  const bufs = {};
  /** A few seconds of noise that loops without a seam. white = hiss, pink = softer, brown = deep rumble. */
  function noise(kind) {
    if (bufs[kind]) return bufs[kind];
    const n = ctx.sampleRate * 6, buf = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
      for (let i = 0; i < n; i++) {
        const w = Math.random() * 2 - 1;
        if (kind === "white") d[i] = w * 0.5;
        else if (kind === "pink") {
          b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
          d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
        } else { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      }
      // cross-fade the ends so the loop is seamless
      const f = Math.floor(ctx.sampleRate * 0.05);
      for (let i = 0; i < f; i++) { const k = i / f; d[n - f + i] = d[n - f + i] * (1 - k) + d[i] * k; }
    }
    return (bufs[kind] = buf);
  }
  /** A room: everything it makes goes into `out`; `later` schedules repeating events; stop() tears it all down. */
  function makeRoom(dest = master, shared = { nodes: [], timers: [], cleanups: [] }) {
    const out = ctx.createGain(); out.gain.value = dest === master ? 0 : 1; out.connect(dest);
    const { nodes, timers, cleanups } = shared;
    const R = {
      out,
      /** A part of the room heard from further away: muffled (lowpass) and quieter, e.g. through a wall or window. */
      far(cutoff, level) { const lp = R.filter("lowpass", cutoff, 0.5), g = ctx.createGain(); g.gain.value = level; lp.connect(g).connect(out); return makeRoom(lp, shared); },
      onStop(fn) { cleanups.push(fn); },
      loop(kind, chain, level) {
        const s = ctx.createBufferSource(); s.buffer = noise(kind); s.loop = true; s.loopStart = 0.05; s.loopEnd = 5.9;
        const g = ctx.createGain(); g.gain.value = level;
        let n = s; for (const f of chain) { n.connect(f); n = f; }
        n.connect(g); g.connect(out); s.start(ctx.currentTime, Math.random() * 5);
        nodes.push(s); return g;
      },
      filter(type, freq, q = 0.7) { const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; return f; },
      lfo(param, rate, depth) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = rate; g.gain.value = depth; o.connect(g).connect(param); o.start(); nodes.push(o); },
      pan(v) { if (!ctx.createStereoPanner) return null; const p = ctx.createStereoPanner(); p.pan.value = v; p.connect(out); return p; },
      /** Run fn every few moments (min..max ms), only while the sound is actually playing. */
      every(min, max, fn) {
        const tick = () => { if (ctx.state === "running" && !document.hidden) { try { fn(ctx.currentTime + 0.02); } catch (e) { /* skip one */ } } timers.push(setTimeout(tick, rnd(min, max))); };
        timers.push(setTimeout(tick, rnd(0, max)));
      },
      /** A short burst of filtered noise (crackles, clicks, drops). */
      burst(at, len, type, freq, q, peak, dest = out) {
        const s = ctx.createBufferSource(); s.buffer = noise("white");
        const f = R.filter(type, freq, q), g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(peak, at + Math.min(0.004, len / 3)); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
        s.connect(f).connect(g).connect(dest); s.start(at, Math.random() * 5); s.stop(at + len + 0.02);
      },
      /** A pure tone that glides from f0 to f1 (birds, drips, bubbles, chimes). */
      tone(at, f0, f1, len, peak, type = "sine", dest = out, attack = 0.005) {
        const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type;
        o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), at + len);
        g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(peak, at + attack); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
        o.connect(g).connect(dest); o.start(at); o.stop(at + len + 0.02);
      },
      stop() { cleanups.forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } }); timers.forEach(clearTimeout); nodes.forEach((n) => { try { n.stop(); } catch (e) { /* already stopped */ } }); setTimeout(() => out.disconnect(), 100); },
    };
    return R;
  }

  // ------------------------------------------------------------------ the sounds
  const S = {
    fire(R, size = 1) {
      const roar = R.loop("brown", [R.filter("lowpass", 380)], 0.32 * size);
      R.lfo(roar.gain, 0.23, 0.08 * size);
      R.loop("pink", [R.filter("bandpass", 2600, 0.5)], 0.025 * size);
      // crackles and pops: mostly tiny, now and then a loud one
      R.every(25, 170, (t) => { const loud = Math.random() < 0.06; R.burst(t, loud ? rnd(0.02, 0.05) : rnd(0.003, 0.012), "bandpass", rnd(1200, 6000), rnd(0.8, 2), (loud ? rnd(0.25, 0.5) : rnd(0.03, 0.14)) * size); });
      R.every(1500, 5000, (t) => { for (let k = 0; k < 6; k++) R.burst(t + k * rnd(0.02, 0.06), rnd(0.004, 0.01), "highpass", 2500, 0.7, rnd(0.05, 0.12) * size); });
    },
    rain(R, level = 1) {
      R.loop("pink", [R.filter("highpass", 500), R.filter("lowpass", 7000)], 0.22 * level);
      R.loop("brown", [R.filter("lowpass", 700)], 0.12 * level);
      // drops tapping the glass
      R.every(12, 60, (t) => R.tone(t, rnd(2500, 5500), rnd(1800, 3000), rnd(0.006, 0.015), rnd(0.01, 0.045) * level));
      // the odd heavier drip from the gutter
      R.every(900, 2600, (t) => R.tone(t, rnd(700, 1100), rnd(400, 600), 0.05, 0.05 * level));
    },
    thunder(R) {
      R.every(18000, 42000, (t) => {
        const s = ctx.createBufferSource(); s.buffer = noise("brown");
        const f = R.filter("lowpass", 160), g = ctx.createGain(), len = rnd(3.5, 6);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(rnd(0.4, 0.8), t + rnd(0.3, 0.9)); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
        f.frequency.setValueAtTime(260, t); f.frequency.exponentialRampToValueAtTime(90, t + len);
        s.connect(f).connect(g).connect(R.out); s.start(t, Math.random() * 2); s.stop(t + len);
      });
    },
    wind(R, howl = 0, level = 1) {
      const bp = R.filter("bandpass", howl ? 520 : 700, howl ? 5 : 0.6);
      const g = R.loop("pink", [bp], (howl ? 0.18 : 0.12) * level);
      R.lfo(bp.frequency, howl ? 0.09 : 0.05, howl ? 260 : 300);
      R.lfo(g.gain, 0.07, (howl ? 0.1 : 0.06) * level);
    },
    crickets(R, level = 1) {
      [[4300, -0.6], [4650, 0.5], [3900, 0.1]].forEach(([f, p]) => {
        const dest = R.pan(p) || R.out;
        R.every(500, 1300, (t) => { for (let k = 0; k < 3 + Math.floor(Math.random() * 2); k++) R.tone(t + k * 0.045, f, f * 0.98, 0.022, 0.018 * level, "sine", dest, 0.003); });
      });
    },
    birds(R, level = 1) {
      R.every(1800, 6500, (t) => {
        const dest = R.pan(rnd(-0.8, 0.8)) || R.out, kind = Math.random(), base = rnd(2200, 3600);
        if (kind < 0.45) for (let k = 0; k < 2 + Math.floor(Math.random() * 4); k++) R.tone(t + k * rnd(0.09, 0.14), base * rnd(1.1, 1.3), base * rnd(0.8, 0.95), rnd(0.06, 0.1), 0.035 * level, "sine", dest, 0.01);
        else if (kind < 0.8) { R.tone(t, base, base * 1.6, 0.12, 0.04 * level, "sine", dest, 0.02); R.tone(t + 0.16, base * 1.5, base * 0.9, 0.18, 0.035 * level, "sine", dest, 0.02); }
        else for (let k = 0; k < 10; k++) R.tone(t + k * 0.035, base * 1.4, base * 1.2, 0.03, 0.02 * level, "sine", dest, 0.004);
      });
    },
    clock(R, deep = false, level = 1) {
      let tock = false;
      R.every(1000, 1000, (t) => {
        tock = !tock;
        R.burst(t, 0.025, "bandpass", deep ? (tock ? 1400 : 1700) : (tock ? 2600 : 3200), 6, (deep ? 0.12 : 0.06) * level);
        if (deep) R.tone(t, tock ? 520 : 600, tock ? 480 : 560, 0.12, 0.03 * level);
        else R.tone(t, tock ? 1900 : 2300, tock ? 1800 : 2200, 0.035, 0.018 * level);
      });
    },
    sirens(R) {
      // far-off emergency vehicles and car horns, heard over the rooftops: quiet, muffled,
      // and mostly heard as echoes bouncing between buildings
      const echo = ctx.createGain(); echo.gain.value = 1;
      [[0.17, 0.5, 620], [0.29, 0.4, 520], [0.47, 0.3, 450]].forEach(([dt, fbv, cut]) => {
        const d = ctx.createDelay(1), fb = ctx.createGain(), lp = R.filter("lowpass", cut), w = ctx.createGain();
        d.delayTime.value = dt; fb.gain.value = fbv; w.gain.value = 0.5;
        echo.connect(d); d.connect(lp); lp.connect(fb).connect(d); lp.connect(w).connect(R.out);
        R.onStop(() => setTimeout(() => [d, lp, fb, w].forEach((n) => n.disconnect()), 3000));
      });
      const voice = (src, panTo) => { const dry = ctx.createGain(); dry.gain.value = 0.45; src.connect(dry).connect(R.pan(panTo) || R.out); src.connect(echo); };
      const siren = (t) => {
        const police = Math.random() < 0.5, len = rnd(9, 14), o = ctx.createOscillator();
        const g = ctx.createGain(), lp = R.filter("lowpass", 950);
        o.type = "triangle";
        const lo = police ? 700 : 600, hi = police ? 1500 : 1350, per = police ? rnd(0.28, 0.36) : rnd(3, 4.2);
        const shift = rnd(0.93, 0.97); // pitch drops a little as it drives away
        let x = t, up = true;
        o.frequency.setValueAtTime(lo, t);
        while (x < t + len) {
          const k = 1 - (1 - shift) * ((x - t) / len);
          if (police) { o.frequency.linearRampToValueAtTime(hi * k, x + per * 0.7); o.frequency.linearRampToValueAtTime(lo * k, x + per); x += per; }
          else { o.frequency.linearRampToValueAtTime((up ? hi : lo) * k, x + per); x += per; up = !up; }
        }
        o.connect(g);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.05, t + len * 0.35);
        g.gain.linearRampToValueAtTime(0.045, t + len * 0.55);
        g.gain.exponentialRampToValueAtTime(0.0001, t + len);
        g.connect(lp); voice(lp, rnd(-0.8, 0.8)); o.start(t); o.stop(t + len + 0.1);
      };
      const horn = (t) => {
        const f = rnd(340, 470), n = Math.random() < 0.35 ? 2 : 1, lp = R.filter("lowpass", 800);
        voice(lp, rnd(-0.8, 0.8));
        for (let i = 0; i < n; i++) {
          const at = t + i * rnd(0.22, 0.3), len = n > 1 ? rnd(0.14, 0.2) : rnd(0.3, 0.6);
          R.tone(at, f, f * 0.995, len, 0.022, "square", lp, 0.03);
          R.tone(at, f * 1.25, f * 1.245, len, 0.016, "square", lp, 0.03);
        }
      };
      R.every(6000, 14000, horn);
      R.every(30000, 60000, siren);
      let first = true; // a siren and a horn right away, so the street is obvious from the start
      R.every(1000, 1000, (t) => { if (first) { first = false; siren(t + 0.5); horn(t + 3); } });
    },
    hum(R, level = 1) { R.loop("brown", [R.filter("lowpass", 140)], 0.12 * level); },
    city(R) {
      // the city behind the glass: a low rumble, cars passing now and then, a far-off horn
      R.loop("brown", [R.filter("lowpass", 160)], 0.14);
      R.loop("pink", [R.filter("bandpass", 600, 0.4), R.filter("lowpass", 900)], 0.012);
      R.every(6000, 14000, (t) => {
        const s = ctx.createBufferSource(); s.buffer = noise("pink");
        const f = R.filter("bandpass", 400, 0.8), g = ctx.createGain(), len = rnd(2.5, 4.5), dest = R.pan(rnd(-0.7, 0.7)) || R.out;
        f.frequency.setValueAtTime(300, t); f.frequency.linearRampToValueAtTime(rnd(700, 1100), t + len * 0.5); f.frequency.linearRampToValueAtTime(260, t + len);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(rnd(0.03, 0.06), t + len * 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
        s.connect(f).connect(g).connect(dest); s.start(t, Math.random() * 4); s.stop(t + len);
      });
      R.every(20000, 50000, (t) => { const lp = R.filter("lowpass", 900); lp.connect(R.out); const f = rnd(330, 420); R.tone(t, f, f, 0.35, 0.012, "sawtooth", lp, 0.03); R.tone(t, f * 1.26, f * 1.26, 0.35, 0.01, "sawtooth", lp, 0.03); });
    },
    water(R) {
      R.loop("pink", [R.filter("bandpass", 1600, 0.9)], 0.05);
      R.every(25, 110, (t) => R.tone(t, rnd(500, 900), rnd(1200, 2200), rnd(0.015, 0.035), rnd(0.008, 0.03)));
      // the bamboo knocker tipping over
      R.every(14000, 24000, (t) => { R.tone(t, 340, 260, 0.16, 0.12); R.burst(t, 0.05, "bandpass", 900, 2, 0.12); });
    },
    chimes(R, level = 1) {
      const notes = [1046.5, 1174.7, 1396.9, 1568, 1760, 2093];
      R.every(1800, 6000, (t) => {
        for (let k = 0; k < 1 + Math.floor(Math.random() * 3); k++) {
          const f = notes[Math.floor(Math.random() * notes.length)], at = t + k * rnd(0.12, 0.35), dest = R.pan(rnd(-0.5, 0.5)) || R.out;
          R.tone(at, f, f * 0.999, rnd(2, 3), 0.025 * level, "sine", dest, 0.003);
          R.tone(at, f * 2.76, f * 2.75, 1.2, 0.006 * level, "sine", dest, 0.003);
        }
      });
    },
    sparkle(R) { R.every(4000, 11000, (t) => { for (let k = 0; k < 4; k++) R.tone(t + k * 0.09, rnd(3200, 5200), rnd(3000, 5000), 0.9, 0.007, "sine", R.out, 0.004); }); },
    owl(R) {
      R.every(16000, 34000, (t) => {
        const lp = R.filter("lowpass", 700); const dest = R.pan(rnd(-0.6, 0.6)) || R.out; lp.connect(dest);
        [[0, 0.32], [0.55, 0.18], [0.8, 0.42]].forEach(([d, len]) => R.tone(t + d, 410, 360, len, 0.045, "sine", lp, 0.07));
      });
    },
    drone(R) {
      const lp = R.filter("lowpass", 220); lp.connect(R.out);
      const oscs = [55, 55.4, 82.4].map((f) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sawtooth"; o.frequency.value = f; g.gain.value = 0.02; o.connect(g).connect(lp); o.start(); return o; });
      R.lfo(lp.frequency, 0.05, 80);
      R.onStop(() => oscs.forEach((o) => { try { o.stop(); } catch (e) { /* stopped */ } }));
    },
    drips(R) {
      const d = ctx.createDelay(1), fb = ctx.createGain(); d.delayTime.value = 0.28; fb.gain.value = 0.35; d.connect(fb).connect(d); d.connect(R.out);
      R.every(900, 3200, (t) => { const f = rnd(1000, 1600), f2 = f * rnd(0.6, 0.72), pk = rnd(0.06, 0.11); R.tone(t, f, f2, 0.045, pk); R.tone(t, f, f2, 0.045, pk * 0.5, "sine", d); });
    },
    /** Distant fireworks: each burst you see is heard a moment later as a soft boom, glittery ones crackle after. */
    fireworks(R) {
      const on = (e) => {
        if (!ctx || ctx.state !== "running" || document.hidden) return;
        const t = ctx.currentTime + rnd(0.35, 0.7), d = e.detail || {}, dest = R.pan(((d.x || 0.5) - 0.5) * 0.8) || R.out;
        const s = ctx.createBufferSource(); s.buffer = noise("brown");
        const f = R.filter("lowpass", 180), g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(rnd(0.35, 0.55), t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
        s.connect(f).connect(g).connect(dest); s.start(t, Math.random() * 4); s.stop(t + 1.5);
        R.tone(t, 70, 38, 0.5, 0.12, "sine", dest, 0.01);
        if (d.kind === "glitter" || d.kind === "willow") for (let k = 0; k < 22; k++) R.burst(t + 0.5 + Math.random() * 1.3, 0.006, "highpass", 3000, 0.7, rnd(0.01, 0.035), dest);
      };
      addEventListener("shelf:firework", on);
      R.onStop(() => removeEventListener("shelf:firework", on));
    },
    /** Light, far-off birdsong: a few short tweets now and then. */
    birdsFar(R) {
      const F = R.far(4200, 0.55);
      F.every(2500, 8000, (t) => {
        const dest = F.pan(rnd(-0.8, 0.8)) || F.out, base = rnd(2600, 3800), n = 1 + Math.floor(Math.random() * 3);
        for (let k = 0; k < n; k++) F.tone(t + k * rnd(0.11, 0.18), base * rnd(1.05, 1.25), base * rnd(0.85, 0.95), rnd(0.05, 0.08), rnd(0.015, 0.028), "sine", dest, 0.01);
      });
    },
    /** A pen or quill writing on paper: little scratchy strokes in words and lines, a page settling now and then. */
    writing(R) {
      R.every(2500, 6500, (t) => {
        let at = t;
        for (let w = 0; w < 3 + Math.floor(Math.random() * 6); w++) {
          for (let k = 0; k < 3 + Math.floor(Math.random() * 5); k++) {
            const len = rnd(0.04, 0.13), s = ctx.createBufferSource(); s.buffer = noise("white");
            const f = R.filter("bandpass", rnd(2800, 4600), 1.4), g = ctx.createGain(), pk = rnd(0.012, 0.03);
            g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(pk, at + len * 0.3); g.gain.linearRampToValueAtTime(pk * 0.6, at + len * 0.7); g.gain.linearRampToValueAtTime(0.0001, at + len);
            s.connect(f).connect(g).connect(R.out); s.start(at, Math.random() * 5); s.stop(at + len + 0.02);
            at += len + rnd(0.02, 0.07);
          }
          at += rnd(0.14, 0.32);
        }
        if (Math.random() < 0.25) R.burst(at + 0.4, 0.3, "lowpass", 1800, 0.5, 0.025);
      });
    },
    /** A witch's pot: a thick simmer, small bubbles and the occasional deep glug. */
    cauldron(R) {
      const sim = R.loop("brown", [R.filter("lowpass", 420)], 0.1);
      R.lfo(sim.gain, 2.7, 0.04);
      R.every(70, 240, (t) => { const f = rnd(180, 420); R.tone(t, f, f * rnd(1.5, 2.1), rnd(0.03, 0.06), rnd(0.02, 0.05), "sine", R.out, 0.006); });
      R.every(500, 1600, (t) => {
        for (let k = 0; k < 1 + Math.floor(Math.random() * 3); k++) {
          const at = t + k * rnd(0.12, 0.25), f = rnd(80, 120);
          R.tone(at, f, f * rnd(2, 2.6), rnd(0.1, 0.16), rnd(0.07, 0.12), "sine", R.out, 0.012);
          R.burst(at + 0.05, 0.07, "lowpass", 700, 0.8, rnd(0.04, 0.08));
        }
      });
    },
    bubbles(R) {
      R.loop("brown", [R.filter("lowpass", 300)], 0.08);
      R.every(60, 260, (t) => { const f = rnd(160, 320); R.tone(t, f, f * rnd(1.6, 2.4), rnd(0.03, 0.07), rnd(0.03, 0.08), "sine", R.out, 0.006); });
    },
  };
  const ROOMS = {
    // wind is only outdoors (forest, starry night); in the castle and the witch's tower it is faint and far off
    cabin: (R) => S.fire(R),
    loft: (R) => { S.city(R.far(520, 0.45)); S.sirens(R.far(1100, 0.7)); },
    academia: (R) => { S.rain(R.far(1000, 0.5), 0.8); S.clock(R, false, 0.5); },
    nook: (R) => S.birdsFar(R),
    library: (R) => { S.clock(R, false, 0.8); S.hum(R); },
    starry: (R) => { S.crickets(R); S.wind(R, 0, 0.6); },
    cottage: (R) => S.birdsFar(R),
    candle: (R) => S.writing(R),
    vampire: (R) => S.drone(R),
    victorian: (R) => S.clock(R, true, 0.8),
    castle: (R) => { S.wind(R.far(380, 0.35), 1); S.drips(R); },
    bordello: (R) => S.clock(R, false, 1),
    forest: (R) => { S.crickets(R, 0.8); S.owl(R); S.wind(R, 0, 0.55); S.sparkle(R); },
    teahouse: (R) => { S.water(R); S.chimes(R); S.crickets(R, 0.4); S.fireworks(R); },
    witch: (R) => { S.cauldron(R); S.wind(R.far(420, 0.3), 1, 0.6); },
  };

  // evens out how loud the rooms are against each other
  const ROOM_GAIN = { nook: 3, cottage: 3, starry: 2.8, forest: 2.8, castle: 1.6, library: 1.5, candle: 2.5, vampire: 1.5, victorian: 1.8, bordello: 3, academia: 1.4, loft: 1.2, teahouse: 0.8 };
  // ------------------------------------------------------------------ playing the right room
  const look = () => { try { return (window.Shelf && window.Shelf.lookKey && window.Shelf.lookKey()) || ""; } catch (e) { return ""; } };
  const level = () => (pref.on && !reading ? pref.vol * (ducked ? 0.3 : 1) : 0);
  function setLevel(sec = 1.2) { if (!master) return; const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(level(), t + sec); }
  function update() {
    paintBtn();
    if (!ctx) return;
    const key = pref.on && ROOMS[look()] ? look() : "";
    if (key === roomKey) return;
    const t = ctx.currentTime;
    if (room) { const old = room; old.out.gain.cancelScheduledValues(t); old.out.gain.setValueAtTime(old.out.gain.value, t); old.out.gain.linearRampToValueAtTime(0, t + 1.5); setTimeout(() => old.stop(), 1700); room = null; }
    roomKey = key;
    if (!key) return;
    room = makeRoom();
    ROOMS[key](room);
    room.out.gain.setValueAtTime(0, t); room.out.gain.linearRampToValueAtTime(ROOM_GAIN[key] || 1, t + 2.5);
  }
  function start() {
    if (!pref.on) return;
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
      master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    setLevel(1.5); update();
  }
  // sound may only start from a tap or key press
  const kick = () => { if (pref.on && (!ctx || ctx.state !== "running")) start(); };
  addEventListener("pointerdown", kick, true);
  addEventListener("keydown", kick, true);
  document.addEventListener("visibilitychange", () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else if (pref.on) ctx.resume(); });
  // softer while your music plays
  const watchMusic = () => { if (!window.ShelfMusic) return; window.ShelfMusic.listen((now) => { const d = !!(now && now.playing); if (d !== ducked) { ducked = d; setLevel(1.5); } }); };
  if (window.ShelfMusic) watchMusic(); else addEventListener("load", watchMusic);
  // the room dies down while a book is open, and comes back when you close it
  addEventListener("shelf:reading", (e) => { reading = !!e.detail; setLevel(reading ? 2.5 : 2); });

  function setOn(on) { pref.on = !!on; savePref(); if (on) start(); else { setLevel(0.6); setTimeout(() => { if (!pref.on) update(); }, 700); } paintBtn(); }
  const btn = document.getElementById("soundBtn");
  function paintBtn() {
    if (!btn) return;
    const has = !!ROOMS[look()];
    btn.hidden = !has;
    btn.classList.toggle("off", !pref.on);
    btn.setAttribute("aria-pressed", pref.on);
    btn.setAttribute("aria-label", pref.on ? "Room sound on. Tap to mute." : "Room sound off. Tap to play.");
  }
  if (btn) btn.onclick = () => setOn(!pref.on);

  /** The "Room sound" box in Customize. */
  function controls() {
    const el = document.createElement("div");
    el.className = "group";
    el.innerHTML = `<h3 class="label">Room sound</h3><p class="hint">Each look has its own quiet background sound: the fire in the cabin, rain in the study, crickets in the forest. It gets softer while your music plays.</p>
      <label class="check"><input type="checkbox" id="amb-on" ${pref.on ? "checked" : ""}> Play room sound</label>
      <label class="field"><span class="hint">Volume</span><input type="range" id="amb-vol" min="0" max="1" step="0.05" value="${pref.vol}"></label>`;
    el.querySelector("#amb-on").onchange = (e) => setOn(e.target.checked);
    el.querySelector("#amb-vol").oninput = (e) => { pref.vol = +e.target.value; savePref(); if (pref.on) start(); setLevel(0.3); };
    return el;
  }

  window.ShelfAmbience = { update, controls, rooms: Object.keys(ROOMS), get state() { return { room: roomKey, running: !!ctx && ctx.state === "running", ctx, master }; } };
  update();
})();
