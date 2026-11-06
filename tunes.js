/* Room music: a soft piece for each look, played live by small synthesised instruments (Web Audio, no files).
   Each piece is written bar by bar with a little chance in it, so it never loops exactly.
   ShelfTunes.play(ctx, dest, name) starts one and returns { stop() }. */
(() => {
  "use strict";
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const E = 0.0001;

  // ------------------------------------------------------------------ shared bits per audio context
  const per = new WeakMap();
  function kit(ctx) {
    let k = per.get(ctx);
    if (k) return k;
    const n = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    k = { noise: n, irs: {} };
    per.set(ctx, k);
    return k;
  }
  /** A room's echo: stereo noise that dies away over `secs`. */
  function impulse(ctx, secs) {
    const k = kit(ctx);
    if (k.irs[secs]) return k.irs[secs];
    const len = Math.floor(ctx.sampleRate * secs), b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    return (k.irs[secs] = b);
  }

  // ------------------------------------------------------------------ instruments: each plays one note at time t
  const env = (ctx, t, a, peak, decayTo, decayT, end) => {
    const g = ctx.createGain(); g.gain.setValueAtTime(E, t); g.gain.exponentialRampToValueAtTime(peak, t + a);
    if (decayTo != null) g.gain.exponentialRampToValueAtTime(Math.max(E, decayTo), t + a + decayT);
    g.gain.exponentialRampToValueAtTime(E, end); return g;
  };
  const osc = (ctx, type, f, t, end, detune = 0) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.detune.value = detune; o.start(t); o.stop(end + 0.05); return o; };
  const lp = (ctx, f, q = 0.7, type = "lowpass") => { const x = ctx.createBiquadFilter(); x.type = type; x.frequency.value = f; x.Q.value = q; return x; };
  const noiseSrc = (ctx, t, len) => { const s = ctx.createBufferSource(); s.buffer = kit(ctx).noise; s.start(t, Math.random() * 0.5); s.stop(t + len); return s; };
  const vib = (ctx, param, t, end, rate, depth) => { const o = osc(ctx, "sine", rate, t, end), g = ctx.createGain(); g.gain.value = depth; o.connect(g).connect(param); };

  const V = {
    piano(ctx, out, t, m, dur, v) {
      const f = mtof(m), ring = Math.max(1.2, 4.2 - (m - 48) * 0.06), end = t + Math.min(dur + 0.9, ring);
      const g = env(ctx, t, 0.005, v, v * 0.32, 0.45, end), filt = lp(ctx, Math.min(9000, 900 + f * 4));
      filt.frequency.setValueAtTime(Math.min(9000, 1400 + f * 5), t); filt.frequency.exponentialRampToValueAtTime(Math.max(400, f * 1.6), end);
      const a = osc(ctx, "triangle", f, t, end), b = osc(ctx, "sine", f * 2, t, end, 3), c = osc(ctx, "sine", f * 3, t, end, -4);
      const gb = ctx.createGain(); gb.gain.value = 0.35; const gc = ctx.createGain(); gc.gain.setValueAtTime(0.18, t); gc.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
      a.connect(filt); b.connect(gb).connect(filt); c.connect(gc).connect(filt); filt.connect(g).connect(out);
      // the felt hammer: a tiny soft knock
      const hn = noiseSrc(ctx, t, 0.03), hf = lp(ctx, 1800), hg = env(ctx, t, 0.002, v * 0.12, null, 0, t + 0.03); hn.connect(hf).connect(hg).connect(out);
    },
    keys(ctx, out, t, m, dur, v) { // electric piano: round tone with a gentle wobble and a little bell on the attack
      const f = mtof(m), end = t + dur + 0.6, g = env(ctx, t, 0.006, v, v * 0.55, 0.8, end);
      const trem = ctx.createGain(); trem.gain.value = 0.85; vib(ctx, trem.gain, t, end, 4.2, 0.15);
      const a = osc(ctx, "sine", f, t, end), b = osc(ctx, "sine", f * 2, t, end, 2), bg = ctx.createGain(); bg.gain.value = 0.12;
      const bell = osc(ctx, "sine", f * 7, t, t + 0.4), bel = ctx.createGain(); bel.gain.setValueAtTime(0.09, t); bel.gain.exponentialRampToValueAtTime(E, t + 0.35);
      a.connect(trem); b.connect(bg).connect(trem); bell.connect(bel).connect(trem); trem.connect(g).connect(out);
    },
    guitar(ctx, out, t, m, dur, v, bright = 0) { // plucked string: bright attack that mellows; bright=1 for steel strings
      const f = mtof(m), ring = bright ? 3.2 : 2.4, end = t + Math.min(Math.max(dur, 0.6) + 1.2, ring);
      const g = env(ctx, t, 0.003, v, v * 0.4, 0.25, end), filt = lp(ctx, 2000, bright ? 1.2 : 0.8);
      filt.frequency.setValueAtTime(bright ? 5200 : 2800, t); filt.frequency.exponentialRampToValueAtTime(Math.max(300, f * (bright ? 2.4 : 1.5)), t + 0.9);
      const a = osc(ctx, "sawtooth", f, t, end), b = osc(ctx, "triangle", f, t, end, bright ? 7 : 3), ag = ctx.createGain(); ag.gain.value = bright ? 0.5 : 0.28;
      a.connect(ag).connect(filt); b.connect(filt); filt.connect(g).connect(out);
      const pn = noiseSrc(ctx, t, 0.02), pf = lp(ctx, bright ? 3500 : 2200, 1.5, "bandpass"), pg = env(ctx, t, 0.001, v * 0.25, null, 0, t + 0.02); pn.connect(pf).connect(pg).connect(out);
    },
    lute(ctx, out, t, m, dur, v) { V.guitar(ctx, out, t, m, Math.min(dur, 0.5), v * 0.9, 0.6); },
    harp(ctx, out, t, m, dur, v) {
      const f = mtof(m), end = t + 2.8, g = env(ctx, t, 0.004, v, v * 0.3, 0.7, end);
      const a = osc(ctx, "triangle", f, t, end), b = osc(ctx, "sine", f * 2, t, end), bg = ctx.createGain(); bg.gain.value = 0.22;
      const filt = lp(ctx, Math.min(8000, f * 6)); a.connect(filt); b.connect(bg).connect(filt); filt.connect(g).connect(out);
    },
    musicbox(ctx, out, t, m, dur, v) { // tuned steel teeth: bright ping, inharmonic shimmer, long ring
      const f = mtof(m), end = t + 2.4, g = env(ctx, t, 0.002, v, v * 0.25, 0.5, end);
      const a = osc(ctx, "sine", f, t, end); a.connect(g);
      for (const [r, lvl, len] of [[2.76, 0.28, 0.5], [5.4, 0.12, 0.18], [8.9, 0.05, 0.08]]) { const o = osc(ctx, "sine", f * r, t, t + len), og = ctx.createGain(); og.gain.setValueAtTime(lvl, t); og.gain.exponentialRampToValueAtTime(E, t + len); o.connect(og).connect(g); }
      g.connect(out);
    },
    celesta(ctx, out, t, m, dur, v) {
      const f = mtof(m), end = t + 1.8, g = env(ctx, t, 0.003, v, v * 0.3, 0.3, end);
      osc(ctx, "sine", f, t, end).connect(g); const o = osc(ctx, "sine", f * 4, t, t + 0.3), og = ctx.createGain(); og.gain.setValueAtTime(0.2, t); og.gain.exponentialRampToValueAtTime(E, t + 0.3); o.connect(og).connect(g); g.connect(out);
    },
    harpsichord(ctx, out, t, m, dur, v) { // quill pluck: buzzy, bright, quick to fade
      const f = mtof(m), end = t + Math.max(0.5, 1.6 - (m - 48) * 0.02), g = env(ctx, t, 0.002, v, v * 0.3, 0.12, end);
      const a = osc(ctx, "sawtooth", f, t, end), b = osc(ctx, "square", f * 2, t, end, 4), bg = ctx.createGain(); bg.gain.value = 0.18;
      const hp = lp(ctx, 220, 0.7, "highpass"), filt = lp(ctx, 5200); a.connect(hp); b.connect(bg).connect(hp); hp.connect(filt).connect(g).connect(out);
    },
    organ(ctx, out, t, m, dur, v) { // pipe organ: stacked pipes, slow speech, held while the key is down
      const f = mtof(m), end = t + dur + 0.45, g = ctx.createGain();
      g.gain.setValueAtTime(E, t); g.gain.exponentialRampToValueAtTime(v, t + 0.08); g.gain.setValueAtTime(v, t + dur); g.gain.exponentialRampToValueAtTime(E, end);
      const filt = lp(ctx, 4200);
      for (const [r, lvl, det] of [[0.5, 0.5, 0], [1, 1, 0], [1, 0.5, 6], [2, 0.6, 0], [3, 0.3, 0], [4, 0.28, 0], [6, 0.12, 0], [8, 0.08, 0]]) { const o = osc(ctx, "sine", f * r, t, end, det), og = ctx.createGain(); og.gain.value = lvl * 0.3; o.connect(og).connect(filt); }
      const ch = noiseSrc(ctx, t, 0.12), cf = lp(ctx, f * 3, 2, "bandpass"), cg = env(ctx, t, 0.01, v * 0.08, null, 0, t + 0.12); ch.connect(cf).connect(cg).connect(out); // the wind as a pipe speaks
      filt.connect(g).connect(out);
    },
    strings(ctx, out, t, m, dur, v, kind = "pad") { // bowed: violin, cello or a soft section pad
      const f = mtof(m), att = kind === "pad" ? 0.6 : kind === "violin" ? 0.14 : 0.2, end = t + dur + (kind === "pad" ? 1 : 0.45);
      const g = ctx.createGain(); g.gain.setValueAtTime(E, t); g.gain.exponentialRampToValueAtTime(v, t + att); g.gain.setValueAtTime(v, t + Math.max(att, dur)); g.gain.exponentialRampToValueAtTime(E, end);
      const filt = lp(ctx, kind === "cello" ? 1100 : kind === "violin" ? 3000 : 1500, 0.9);
      const dets = kind === "pad" ? [-9, 0, 9] : [-4, 4];
      for (const d of dets) { const o = osc(ctx, "sawtooth", f, t, end, d); if (kind !== "pad") vib(ctx, o.frequency, t + 0.25, end, 5.3, f * 0.005); o.connect(filt); }
      const gg = ctx.createGain(); gg.gain.value = 0.5; filt.connect(gg).connect(g).connect(out);
    },
    flute(ctx, out, t, m, dur, v, slide = 0) { // breathy wooden flute (recorder, shakuhachi, a theremin-ish glide with slide)
      const f = mtof(m), end = t + dur + 0.3, g = ctx.createGain();
      g.gain.setValueAtTime(E, t); g.gain.exponentialRampToValueAtTime(v, t + 0.1); g.gain.setValueAtTime(v, t + Math.max(0.1, dur)); g.gain.exponentialRampToValueAtTime(E, end);
      const a = osc(ctx, "sine", f, t, end), b = osc(ctx, "triangle", f * 2, t, end), bg = ctx.createGain(); bg.gain.value = 0.06;
      if (slide) { a.frequency.setValueAtTime(f * Math.pow(2, slide / 12), t); a.frequency.exponentialRampToValueAtTime(f, t + Math.min(0.6, dur * 0.5)); b.frequency.setValueAtTime(f * 2 * Math.pow(2, slide / 12), t); b.frequency.exponentialRampToValueAtTime(f * 2, t + Math.min(0.6, dur * 0.5)); }
      vib(ctx, a.frequency, t + 0.3, end, 5, f * 0.006);
      const br = noiseSrc(ctx, t, dur + 0.3), bf = lp(ctx, f * 2, 2.5, "bandpass"), bgn = ctx.createGain(); bgn.gain.value = 0.18;
      a.connect(g); b.connect(bg).connect(g); br.connect(bf).connect(bgn).connect(g); g.connect(out);
    },
    koto(ctx, out, t, m, dur, v) { // plucked silk: a tiny upward bend into the note, then a long dry fade
      const f = mtof(m), end = t + 2.2, g = env(ctx, t, 0.002, v, v * 0.35, 0.3, end);
      const a = osc(ctx, "triangle", f, t, end), b = osc(ctx, "sawtooth", f, t, end), bg = ctx.createGain(); bg.gain.value = 0.25;
      for (const o of [a, b]) { o.frequency.setValueAtTime(f * 0.982, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.05); }
      const filt = lp(ctx, 3600); filt.frequency.setValueAtTime(4200, t); filt.frequency.exponentialRampToValueAtTime(Math.max(500, f * 2), t + 1);
      a.connect(filt); b.connect(bg).connect(filt); filt.connect(g).connect(out);
    },
    bass(ctx, out, t, m, dur, v) {
      const f = mtof(m), end = t + dur + 0.15, g = env(ctx, t, 0.01, v, v * 0.6, 0.3, end);
      const a = osc(ctx, "sine", f, t, end), b = osc(ctx, "triangle", f, t, end), bg = ctx.createGain(); bg.gain.value = 0.25; a.connect(g); b.connect(bg).connect(g); g.connect(out);
    },
    drone(ctx, out, t, m, dur, v) { // a low reedy hum on the root and fifth, slowly breathing
      const f = mtof(m), end = t + dur, g = ctx.createGain();
      g.gain.setValueAtTime(E, t); g.gain.exponentialRampToValueAtTime(v, t + Math.min(2.5, dur / 3)); g.gain.setValueAtTime(v, end - Math.min(2.5, dur / 3)); g.gain.exponentialRampToValueAtTime(E, end);
      const filt = lp(ctx, 520, 1.2); vib(ctx, filt.frequency, t, end, 0.11, 160);
      for (const [r, d] of [[1, -4], [1, 4], [1.5, 0]]) osc(ctx, "sawtooth", f * r, t, end, d).connect(filt);
      const gg = ctx.createGain(); gg.gain.value = 0.35; filt.connect(gg).connect(g).connect(out);
    },
    kick(ctx, out, t, v) { const o = osc(ctx, "sine", 110, t, t + 0.4); o.frequency.exponentialRampToValueAtTime(42, t + 0.14); const g = env(ctx, t, 0.003, v, null, 0, t + 0.38); o.connect(g).connect(out); },
    snap(ctx, out, t, v) { const n = noiseSrc(ctx, t, 0.16), f = lp(ctx, 1900, 0.9, "bandpass"), g = env(ctx, t, 0.002, v, v * 0.2, 0.03, t + 0.15); n.connect(f).connect(g).connect(out); },
    hat(ctx, out, t, v) { const n = noiseSrc(ctx, t, 0.05), f = lp(ctx, 7500, 0.7, "highpass"), g = env(ctx, t, 0.001, v, null, 0, t + 0.045); n.connect(f).connect(g).connect(out); },
  };

  // ------------------------------------------------------------------ scales and little helpers for writing melodies
  const SC = (root, steps, lo, hi) => { const out = []; for (let m = lo; m <= hi; m++) if (steps.includes(((m - root) % 12 + 12) % 12)) out.push(m); return out; };
  const MAJ = [0, 2, 4, 5, 7, 9, 11], MIN = [0, 2, 3, 5, 7, 8, 10], HMIN = [0, 2, 3, 5, 7, 8, 11], DOR = [0, 2, 3, 5, 7, 9, 10];
  /** A melody that wanders by small steps, leaning on the chord's notes on strong beats. */
  function walker(scale, start) {
    let i = scale.indexOf(start); if (i < 0) i = Math.floor(scale.length / 2);
    return (chord, strong) => {
      if (strong && chord) { // land on the nearest chord tone
        let best = i, bd = 99; scale.forEach((m, j) => { if (chord.some((c) => (m - c) % 12 === 0) && Math.abs(j - i) < bd && Math.abs(j - i) <= 3) { bd = Math.abs(j - i); best = j; } }); i = best;
      } else i += pick([-2, -1, -1, 1, 1, 2, 0]);
      if (i < 1) i = 2; if (i > scale.length - 2) i = scale.length - 3;
      return scale[i];
    };
  }

  // ------------------------------------------------------------------ the pieces
  // bar(n, at, beat, S) writes one bar starting at `at` (seconds); beat = seconds per beat; S = the piece's own memory
  const P = {
    cottage: { // a soft, simple piano song
      bpm: 70, beats: 4, wet: 0.3, ir: 2.6,
      init: (S) => { S.mel = walker(SC(60, MAJ, 67, 84), 72); },
      prog: [[48, 55, 64], [45, 52, 60], [41, 48, 57], [43, 50, 59]],
      bar(n, at, b, S, play) {
        const ch = this.prog[n % 4];
        [0, 1, 2, 1, 0, 1, 2, 1].forEach((k, i) => play("piano", at + i * b / 2 + rnd(0, 0.012), ch[k] + (k === 2 ? 12 : 0), b / 2, i % 4 ? 0.13 : 0.18));
        const slots = pick([[0, 2], [0, 1.5, 2, 3], [0, 1, 2], [0, 3]]);
        slots.forEach((s, i) => play("piano", at + s * b + rnd(0, 0.02), S.mel(ch, s % 2 === 0), (slots[i + 1] ?? 4) - s, 0.24));
      },
    },
    cabin: { // easy fingerpicked guitar by the fire
      bpm: 84, beats: 4, wet: 0.22, ir: 1.8,
      init: (S) => { S.mel = walker(SC(60, MAJ, 64, 76), 67); },
      prog: [[48, 55, 59, 64], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 52, 59]],
      bar(n, at, b, S, play) {
        const ch = this.prog[n % 4];
        for (let i = 0; i < 8; i++) {
          const t = at + i * b / 2 + (i % 2 ? b * 0.06 : 0); // a lazy swing on the offbeats
          if (i % 2 === 0) play("guitar", t, i % 4 === 0 ? ch[0] - 12 : ch[1] - 12, b, 0.2);
          else play("guitar", t, ch[i % 4 === 1 ? 2 : 3], b, 0.13);
        }
        if (Math.random() < 0.5) play("guitar", at + 2.5 * b, S.mel(ch, false), b, 0.14);
      },
    },
    starry: { // ringing steel-string arpeggios under the sky, lots of space
      bpm: 108, beats: 6, wet: 0.45, ir: 3.6,
      prog: [[50, 57, 62, 64, 66], [43, 50, 55, 59, 66], [47, 54, 57, 62, 66], [45, 52, 57, 62, 64]],
      bar(n, at, b, S, play) {
        const ch = this.prog[n % 4];
        if (n % 4 === 3) { ch.forEach((m, i) => play("guitar", at + i * 0.03, m, b * 6, 0.11, 1)); return; } // a slow strum
        [0, 1, 2, 3, 4, 3].forEach((k, i) => play("guitar", at + i * b, ch[k], b * 3, i ? 0.11 : 0.15, 1));
      },
    },
    nook: { // a little music box waltz
      bpm: 92, beats: 3, wet: 0.28, ir: 2,
      init: (S) => { S.mel = walker(SC(65, MAJ, 77, 93), 84); },
      prog: [[53, 69, 72], [50, 65, 69], [46, 65, 70], [48, 64, 67]],
      bar(n, at, b, S, play) {
        const ch = this.prog[n % 4], j = () => rnd(-0.012, 0.012);
        play("musicbox", at + j(), ch[0] + 12, b, 0.16);
        play("musicbox", at + b + j(), ch[1], b, 0.1); play("musicbox", at + 2 * b + j(), ch[2], b, 0.1);
        const r = pick([[0, 1, 2], [0, 2], [0, 1.5, 2], [0, 1, 1.5, 2]]);
        r.forEach((s) => play("musicbox", at + s * b + j(), S.mel(ch, s === 0), b, 0.18));
      },
    },
    library: { // slow, spacious piano in the manner of a gymnopédie, a soft string bed underneath
      bpm: 66, beats: 3, wet: 0.35, ir: 3,
      init: (S) => { S.mel = walker(SC(62, MAJ, 66, 81), 74); },
      prog: [[43, 59, 62, 66], [38, 57, 61, 66]],
      bar(n, at, b, S, play) {
        const ch = this.prog[n % 2];
        play("piano", at, ch[0], b, 0.2); play("piano", at + b, ch[1], b * 2, 0.11); play("piano", at + b, ch[2], b * 2, 0.11); play("piano", at + b, ch[3], b * 2, 0.1);
        if (n % 4 === 0) play("strings", at, ch[1] - 12, b * 12, 0.04, "pad");
        if (Math.random() < 0.7) { const two = Math.random() < 0.4; play("piano", at + (two ? 0 : b), S.mel(ch, true), two ? b : b * 2, 0.2); if (two) play("piano", at + b, S.mel(ch, false), b * 2, 0.18); }
      },
    },
    candle: { // a slow cello song over hushed strings
      bpm: 56, beats: 4, wet: 0.38, ir: 3.2,
      init: (S) => { S.mel = walker(SC(55, HMIN, 43, 62), 50); },
      prog: [[43, 55, 58, 62], [39, 55, 58, 63], [36, 55, 60, 63], [38, 54, 57, 62]],
      bar(n, at, b, S, play) {
        const ch = this.prog[n % 4];
        ch.slice(1).forEach((m) => play("strings", at, m, b * 4, 0.035, "pad"));
        play("strings", at, ch[0], b * 4, 0.05, "cello");
        const r = pick([[0, 2], [0, 3], [0, 1, 2], [1, 2]]);
        r.forEach((s, i) => play("strings", at + s * b, S.mel(ch, s === 0) + 12, ((r[i + 1] ?? 4) - s) * b * 0.95, 0.12, "cello"));
      },
    },
    vampire: { // a dramatic church organ in D minor, with a toccata flourish now and then
      bpm: 52, beats: 4, wet: 0.55, ir: 4.5,
      prog: [[50, 57, 62, 65], [46, 53, 58, 62], [43, 50, 55, 58], [45, 52, 57, 61]],
      bar(n, at, b, S, play) {
        const ch = this.prog[n % 4];
        if (n % 8 === 7) { // the flourish: a falling run, then the chord crashes in
          const run = SC(62, HMIN, 62, 86).reverse().slice(0, 12);
          run.forEach((m, i) => play("organ", at + i * b / 6, m, b / 6, 0.07));
          play("organ", at + 2 * b, ch[0] - 24, b * 2, 0.11); ch.forEach((m) => play("organ", at + 2 * b, m + 12, b * 2, 0.07));
          return;
        }
        play("organ", at, ch[0] - 24, b * 4, 0.11);
        ch.forEach((m) => play("organ", at, m, b * 4, 0.065));
        if (n % 8 === 0) [81, 79, 81].forEach((m, i) => play("organ", at + i * b * 0.25, m, i === 2 ? b * 3 : b * 0.25, 0.06)); // the famous mordent shape
      },
    },
    victorian: { // a parlour waltz on the piano with a violin singing over it
      bpm: 100, beats: 3, wet: 0.3, ir: 2.4,
      init: (S) => { S.mel = walker(SC(58, MAJ, 70, 86), 77); },
      prog: [[46, 62, 65, 70], [43, 62, 67, 70], [39, 63, 67, 70], [41, 63, 65, 69]],
      bar(n, at, b, S, play) {
        const ch = this.prog[n % 4];
        play("piano", at, ch[0], b, 0.2);
        for (const k of [1, 2]) ch.slice(1).forEach((m) => play("piano", at + k * b, m - 12, b * 0.8, 0.08));
        const r = n % 2 ? [0, 2] : pick([[0], [0, 2], [0, 1, 2]]);
        r.forEach((s, i) => play("strings", at + s * b, S.mel(ch, s === 0), ((r[i + 1] ?? 3) - s) * b * 0.92, 0.07, "violin"));
      },
    },
    bordello: { // gothic harpsichord: running Bach-like arpeggios in A minor over low strings
      bpm: 72, beats: 4, wet: 0.3, ir: 2.6,
      prog: [[45, 57, 60, 64], [41, 57, 62, 65], [40, 56, 59, 64], [45, 57, 60, 64], [38, 57, 62, 65], [40, 56, 59, 62], [45, 52, 57, 60], [40, 56, 59, 64]],
      bar(n, at, b, S, play) {
        const ch = this.prog[n % 8];
        play("strings", at, ch[0], b * 4, 0.04, "cello");
        const pat = [0, 1, 2, 3, 2, 1, 2, 3];
        for (let h = 0; h < 2; h++) pat.forEach((k, i) => play("harpsichord", at + (h * 8 + i) * b / 4, k === 0 ? ch[0] + 12 : ch[k] + (h && k === 3 ? 12 : 0), b / 4, i === 0 ? 0.13 : 0.09));
      },
    },
    castle: { // medieval: a lute and a recorder over a hurdy-gurdy hum, in D dorian
      bpm: 132, beats: 6, wet: 0.42, ir: 3.4,
      init: (S) => { S.mel = walker(SC(62, DOR, 62, 79), 69); },
      prog: [[38, 50, 57], [36, 48, 55], [38, 50, 57], [41, 48, 53]],
      bar(n, at, b, S, play) {
        const ch = this.prog[n % 4];
        if (n % 8 === 0) play("drone", at, 38, b * 6 * 8, 0.05);
        play("lute", at, ch[1], b * 3, 0.16); play("lute", at + b, ch[2], b, 0.1); play("lute", at + 2 * b, ch[1] + 12, b, 0.09);
        play("lute", at + 3 * b, ch[1], b * 3, 0.13); play("lute", at + 4 * b, ch[2], b, 0.09); play("lute", at + 5 * b, ch[2] + 5, b, 0.08);
        if (n % 4 < 3 || Math.random() < 0.5) { const r = pick([[3, 1, 2], [2, 1, 3], [1, 1, 1, 3], [3, 3]]); let s = 0; r.forEach((d) => { play("flute", at + s * b, S.mel(ch, s === 0), d * b * 0.9, 0.06); s += d; }); }
      },
    },
    forest: { // fairytale: harp arpeggios, a celesta melody, a soft dreamy pad
      bpm: 72, beats: 3, wet: 0.48, ir: 3.8,
      init: (S) => { S.mel = walker(SC(64, [0, 2, 4, 6, 7, 9, 11], 76, 93), 83); },
      prog: [[52, 59, 63, 66, 68], [49, 56, 61, 64, 68], [45, 52, 57, 63, 64], [47, 54, 59, 63, 66]],
      bar(n, at, b, S, play) {
        const ch = this.prog[n % 4];
        if (n % 2 === 0) play("strings", at, ch[1], b * 6, 0.03, "pad");
        [0, 1, 2, 3, 4, 3].forEach((k, i) => play("harp", at + i * b / 2, ch[k], b, i ? 0.1 : 0.14));
        if (n % 4 === 3) [0, 1, 2, 3, 4].forEach((i) => play("celesta", at + 1.5 * b + i * 0.09, ch[i] + 24, 0.3, 0.06)); // a sparkle
        else if (Math.random() < 0.75) play("celesta", at + pick([0, 1]) * b, S.mel(ch, true), b * 2, 0.1);
      },
    },
    academia: { // a minor-key nocturne: wide rolling left hand, a singing right hand
      bpm: 60, beats: 3, wet: 0.36, ir: 3,
      init: (S) => { S.mel = walker(SC(64, HMIN, 67, 84), 76); },
      prog: [[40, 47, 55], [45, 52, 60], [47, 54, 63], [40, 47, 55], [36, 43, 52], [45, 52, 60], [47, 51, 57], [40, 47, 55]],
      bar(n, at, b, S, play) {
        const ch = this.prog[n % 8];
        [ch[0], ch[1], ch[2], ch[1] + 12, ch[2], ch[1]].forEach((m, i) => play("piano", at + i * b / 2, m, b, i ? 0.1 : 0.17));
        const r = pick([[0, 2], [0, 1, 2], [0, 1.5, 2], [0]]);
        r.forEach((s, i) => play("piano", at + s * b + 0.02, S.mel(ch, s === 0), ((r[i + 1] ?? 3) - s) * b, 0.21));
      },
    },
    teahouse: { // koto and shakuhachi in the old "in" scale
      bpm: 66, beats: 4, wet: 0.4, ir: 3,
      init: (S) => { S.scale = SC(62, [0, 1, 5, 7, 8], 62, 86); S.mel = walker(SC(62, [0, 1, 5, 7, 8], 69, 86), 74); },
      bar(n, at, b, S, play) {
        play("koto", at, n % 4 === 2 ? 45 : 50, b * 2, 0.15);
        const sc = S.scale, start = Math.floor(Math.random() * (sc.length - 5));
        if (Math.random() < 0.3) { const m = sc[start + 3]; for (let i = 0; i < 5; i++) play("koto", at + b + i * 0.075, m, 0.1, 0.07); } // a tremolo on one string
        else [0, 1, 2, 4].forEach((k, i) => play("koto", at + b + i * b / 2, sc[start + k], b, 0.11));
        if (n % 2 === 0) play("flute", at + 2.5 * b, S.mel(null, false), b * 3.2, 0.06, -1.2);
      },
    },
    witch: { // a hypnotic, circling spell: the same eight notes turning over a low drone
      bpm: 104, beats: 4, wet: 0.45, ir: 3.6,
      init: (S) => { S.shift = 0; },
      bar(n, at, b, S, play) {
        if (n % 8 === 0) { play("drone", at, 38, b * 32, 0.05); S.shift = pick([0, 0, 1, 3]); }
        const cyc = [50, 57, 58, 57, 50, 57, 63, 57].map((m, i) => (i === 6 && S.shift ? m + S.shift : m));
        cyc.forEach((m, i) => play("harp", at + i * b / 2, m + 12, b / 2, i % 4 ? 0.07 : 0.1));
        if (n % 4 === 2) play("flute", at, pick([74, 75, 78, 81]), b * 3.6, 0.045, pick([-5, 7, -3])); // an eerie gliding voice
      },
    },
    loft: { // late-night R&B: warm keys, round bass, soft swung drums
      bpm: 74, beats: 4, wet: 0.2, ir: 1.6,
      init: (S) => { S.mel = walker(SC(65, [0, 2, 4, 7, 9], 72, 86), 77); },
      prog: [[41, 57, 60, 64, 67], [40, 55, 59, 62, 67], [38, 53, 57, 60, 64], [43, 53, 57, 59, 64]],
      bar(n, at, b, S, play, hit) {
        const ch = this.prog[n % 4], sw = b * 0.12;
        ch.slice(1).forEach((m) => { play("keys", at, m, b * 1.5, 0.055); play("keys", at + 2.5 * b + sw, m, b * 0.7, 0.04); });
        play("bass", at, ch[0], b * 1.4, 0.2); play("bass", at + 1.5 * b + sw, ch[0] + 7, b * 0.4, 0.13); play("bass", at + 2.5 * b + sw, ch[0], b, 0.17);
        hit("kick", at, 0.22); hit("kick", at + 2.5 * b + sw, 0.17); hit("snap", at + b, 0.07); hit("snap", at + 3 * b, 0.07);
        for (let i = 0; i < 8; i++) hit("hat", at + i * b / 2 + (i % 2 ? sw : 0), i % 2 ? 0.02 : 0.032);
        if (Math.random() < 0.45) play("keys", at + 3.5 * b + sw, S.mel(ch, false), b * 0.5, 0.05);
      },
    },
  };
  // loudness of each piece, measured offline so every room's music sits at the same quiet level
  // measured offline so every piece sits at about the same loudness (RMS ~0.035)
  const CAL = { cottage: 0.38, cabin: 0.48, starry: 0.81, nook: 0.43, library: 0.55, candle: 0.75, vampire: 0.52, victorian: 0.56, bordello: 1.15, castle: 0.60, forest: 0.55, academia: 0.50, teahouse: 0.76, witch: 0.65, loft: 0.47 };

  /** Start a piece. With `offlineUntil` (seconds) every bar up to then is written at once (for measuring). */
  function play(ctx, dest, name, { offlineUntil = 0, level = 1 } = {}) {
    const piece = P[name]; if (!piece) return { stop() {} };
    const out = ctx.createGain(), bus = ctx.createGain(), conv = ctx.createConvolver(), wet = ctx.createGain();
    conv.buffer = impulse(ctx, piece.ir); wet.gain.value = piece.wet; bus.gain.value = 1;
    bus.connect(out); bus.connect(conv).connect(wet).connect(out); out.connect(dest);
    const target = level * (CAL[name] || 1), t0 = ctx.currentTime;
    out.gain.setValueAtTime(E, t0); out.gain.exponentialRampToValueAtTime(target, t0 + 4);
    const S = {}; if (piece.init) piece.init(S);
    const beat = 60 / piece.bpm, barLen = beat * piece.beats;
    const note = (v, t, m, d, vel, extra) => { try { V[v](ctx, bus, t, m, d, vel, extra); } catch (e) { /* skip a note rather than stop the song */ } };
    const hit = (v, t, vel) => { try { V[v](ctx, bus, t, vel); } catch (e) { /* skip */ } };
    let n = 0, at = t0 + 0.4;
    const write = (until) => { if (!offlineUntil && at < ctx.currentTime) { const skip = Math.ceil((ctx.currentTime - at) / barLen); n += skip; at += skip * barLen; } while (at < until) { piece.bar.call(piece, n, at, beat, S, note, hit); n++; at += barLen; } };
    if (offlineUntil) { write(offlineUntil); return { stop() {} }; }
    write(ctx.currentTime + 1.6);
    const timer = setInterval(() => { if (ctx.state === "running") write(ctx.currentTime + 1.6); }, 300);
    return {
      stop() {
        clearInterval(timer);
        const t = ctx.currentTime; out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(Math.max(E, out.gain.value), t); out.gain.exponentialRampToValueAtTime(E, t + 1.2);
        setTimeout(() => { try { out.disconnect(); } catch (e) { /* gone */ } }, 1600);
      },
    };
  }

  window.ShelfTunes = { play, pieces: Object.keys(P), CAL };
})();
