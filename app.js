/* Shelf: a personal virtual bookshelf. Everything is stored in this browser (localStorage). */
(() => {
  "use strict";

  // ---------------------------------------------------------------- appearance
  const THEMES = {
    graphite: { label: "Graphite", t: ["#131318", "#eeedf3", "#1c1c23", "#1f1f27", "#24242c", "#8e8c9c", "#2d2d37", "#2c2c36", "#3a3a46", "dark"] },
    midnight: { label: "Midnight", t: ["#0e1424", "#e8edf8", "#161e33", "#18213a", "#1c2640", "#8592b0", "#26314f", "#253153", "#33405f", "dark"] },
    plum: { label: "Plum", t: ["#1a1220", "#f2e9f4", "#241a2c", "#281d31", "#2c2134", "#a08fa8", "#3a2c44", "#372a42", "#4a3a55", "dark"] },
    forest: { label: "Forest", t: ["#0f1714", "#e7f0ea", "#16211c", "#19251f", "#1d2a24", "#869a8e", "#26362e", "#24352c", "#33463c", "dark"] },
    paper: { label: "Paper", t: ["#f4f0e8", "#22201c", "#ebe5d9", "#faf7f1", "#e6dfd1", "#77705f", "#ddd4c3", "#e1d8c7", "#d3c9b5", "light"] },
    blush: { label: "Blush", t: ["#f7eeee", "#2a1e20", "#efe2e3", "#fcf6f6", "#ead9db", "#85696d", "#e2cfd1", "#e7d4d6", "#d9c2c5", "light"] },
  };
  const D = window.Decor;
  Object.assign(THEMES, D.PALETTES);
  const ACCENTS = ["#f2c76b", "#ef7b6c", "#e889b5", "#a98bf0", "#6fb6f2", "#6fd3b0", "#c7e05d", "#f4f1ea"];
  const SHELVES = [
    ["Slate", "#34343f"], ["Oak", "#b48452"], ["Walnut", "#5b3a24"], ["Birch", "#e4d6bd"],
    ["White", "#eeece8"], ["Black", "#0b0b0d"], ["Sage", "#7d9580"], ["Rose", "#c99aa0"],
  ];
  const FONTS = {
    classic: { cw: 0.5, label: "Classic serif", family: "'Playfair Display', Georgia, serif", weight: 600, upper: false },
    garamond: { cw: 0.45, label: "Garamond", family: "'Cormorant Garamond', Georgia, serif", weight: 600, upper: false },
    baskerville: { cw: 0.56, label: "Baskerville", family: "'Libre Baskerville', Georgia, serif", weight: 400, upper: false },
    display: { cw: 0.5, label: "Display serif", family: "'DM Serif Display', Georgia, serif", weight: 400, upper: false },
    fat: { cw: 0.56, label: "Fat serif", family: "'Abril Fatface', Georgia, serif", weight: 400, upper: false },
    roman: { cw: 0.66, label: "Roman capitals", family: "'Cinzel', Georgia, serif", weight: 600, upper: false },
    modern: { cw: 0.52, label: "Modern sans", family: "'Bricolage Grotesque', 'Inter Tight', sans-serif", weight: 600, upper: false },
    sans: { cw: 0.52, label: "Clean sans", family: "'Inter Tight', system-ui, sans-serif", weight: 500, upper: false },
    geometric: { cw: 0.56, label: "Geometric", family: "'Space Grotesk', system-ui, sans-serif", weight: 500, upper: false },
    condensed: { cw: 0.42, label: "Condensed", family: "'Oswald', 'Inter Tight', sans-serif", weight: 500, upper: false },
    bold: { cw: 0.42, label: "Tall capitals", family: "'Bebas Neue', 'Inter Tight', sans-serif", weight: 400, upper: true },
    script: { cw: 0.4, label: "Handwritten", family: "'Caveat', cursive", weight: 600, upper: false },
    typewriter: { cw: 0.6, label: "Typewriter", family: "'Courier Prime', 'Courier New', monospace", weight: 700, upper: false },
  };
  const SIZES = { small: ["Small", 0.86], regular: ["Regular", 1], large: ["Large", 1.1] };
  const BUILTIN_SHELVES = [["reading", "Reading"], ["to_read", "To read"], ["read", "Read"], ["did_not_finish", "Did not finish"]];
  /** Built-in shelves (they drive started/finished dates) plus the ones you make. Any shelf can be renamed. */
  const shelves = () => [
    ...BUILTIN_SHELVES.map(([k, l]) => [k, (state.settings.shelfNames || {})[k] || l]),
    ...(state.settings.customShelves || []),
  ];
  const shelfLabel = (k) => (shelves().find((x) => x[0] === k) || [k, "Shelf"])[1];

  const hexRe = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
  const lum = (hex) => {
    const m = hexRe.exec(hex); if (!m) return 0.3;
    const [r, g, b] = [m[1], m[2], m[3]].map((h) => { const c = parseInt(h, 16) / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const mix = (hex, to, a) => {
    const m = hexRe.exec(hex), n = hexRe.exec(to); if (!m || !n) return hex;
    return "#" + [1, 2, 3].map((i) => Math.round(parseInt(m[i], 16) * (1 - a) + parseInt(n[i], 16) * a).toString(16).padStart(2, "0")).join("");
  };
  const inkOn = (hex) => (lum(hex) > 0.4 ? "#1b1508" : "#ffffff");
  // Pick whichever ink reads better on this spine (WCAG contrast), not a fixed brightness cut-off.
  const spineInk = (hex) => { const L = lum(hex), dark = (L + 0.05) / (lum("#2a1d14") + 0.05), light = (lum("#f5ead8") + 0.05) / (L + 0.05); return dark >= light ? "#2a1d14" : "#f5ead8"; };

  /** A whole colour scheme worked out from one background colour (for "Your colour"). */
  function derivePalette(bg) {
    const dark = lum(bg) < 0.3, fg = dark ? "#f3ede4" : "#221c16";
    const lift = (a) => mix(bg, dark ? "#ffffff" : "#000000", a);
    return [bg, fg, lift(0.05), dark ? lift(0.07) : mix(bg, "#ffffff", 0.55), lift(0.09), mix(fg, bg, 0.45), lift(0.15), lift(0.13), lift(0.24), dark ? "dark" : "light"];
  }
  const paletteOf = (s) => (s.theme === "custom" && s.customBg ? derivePalette(s.customBg) : (THEMES[s.theme] || THEMES.graphite).t);

  function applyAppearance() {
    const s = state.settings;
    const [bg, fg, surface, popup, muted, mutedFg, border, hover, starEmpty, scheme] = paletteOf(s);
    const r = document.documentElement.style;
    const set = (k, v) => r.setProperty(k, v);
    set("--background", bg); set("--foreground", fg); set("--surface", surface); set("--popup", popup);
    set("--muted", muted); set("--muted-fg", mutedFg); set("--border", border); set("--hover", hover); set("--star-empty", starEmpty);
    set("--primary", s.accent); set("--primary-fg", inkOn(s.accent));
    set("--shelf-color", s.shelf); set("--shelf-top", mix(s.shelf, "#ffffff", 0.14)); set("--shelf-edge", mix(s.shelf, "#000000", 0.3));
    // shelf material: a lit top edge, a darker underside, then the grain over the base colour
    const mat = D.MATERIALS[s.shelfMat] || D.MATERIALS.paint;
    set("--plank-bg", mat.base
      // the board's profile: its top face catching the light, a rounded front edge with a crisp highlight, the front face
      // turning away from the light, and a dark lower arris
      ? ["linear-gradient(180deg, rgba(255,255,255,.2) 0, rgba(255,255,255,.12) 2.5px, rgba(0,0,0,.14) 3px, rgba(255,255,255,.34) 3.6px, rgba(255,255,255,.12) 4.6px, rgba(255,255,255,0) 7px, rgba(0,0,0,0) 45%, rgba(0,0,0,.3) 88%, rgba(0,0,0,.55) 100%)", ...(mat.sheen ? ["linear-gradient(90deg, rgba(255,255,255,0) 8%, rgba(255,245,230,.08) 30%, rgba(255,255,255,0) 46%, rgba(255,245,230,.05) 72%, rgba(255,255,255,0) 90%)"] : []), ...mat.tex(), mat.base].join(",")
      : "linear-gradient(180deg, var(--shelf-top) 0, var(--shelf-top) 3px, var(--shelf-color) 3px, var(--shelf-color) 11px, var(--shelf-edge) 100%)");
    // the shelf's top surface, seen a little from above: things stand on it, a bit back from the front edge
    set("--plank-top", mat.base ? [...mat.tex(), mat.base].join(",") : "var(--shelf-color)");
    document.documentElement.dataset.mat = s.shelfMat || "paint";
    // backdrop: if it fights the colour scheme (a dark wall behind light text…), veil it so words stay readable
    const bd = D.BACKDROPS[s.backdrop] || D.BACKDROPS.none;
    const veil = bd.tone && bd.tone !== scheme ? [`linear-gradient(${bg}cc, ${bg}cc)`] : [];
    const vignette = bd.tone ? ["radial-gradient(ellipse 120% 90% at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,.28))"] : [];
    set("--backdrop", [...veil, ...vignette, bd.css()].join(","));
    document.documentElement.dataset.bd = bd.tone ? "1" : "";
    document.documentElement.dataset.bdk = s.backdrop || "";
    // moving pieces of the backdrop (falling stars, floating lights); only rebuilt when they change, so they never restart
    const bdEl = document.getElementById("backdrop"), fx = bd.fx || "";
    if (bdEl && bdEl.dataset.fx !== fx) { bdEl.dataset.fx = fx; bdEl.innerHTML = fx ? D.backdropFx(fx) : ""; }
    set("--font-display", (D.HEAD_FONTS[s.headFont] || D.HEAD_FONTS.bricolage)[1]);
    r.setProperty("color-scheme", scheme);
    document.querySelector('meta[name="theme-color"]').setAttribute("content", bg);
  }

  // ---------------------------------------------------------------- storage
  const KEY = "shelf.v1";
  const DEFAULT_SETTINGS = { theme: "graphite", accent: "#f2c76b", shelf: "#34343f", finish: "matte", spineFont: "classic", shelfMat: "paint", backdrop: "none", lights: { style: "none", colour: "warm", on: false }, headFont: "bricolage", looks: [] };
  const SEED = [
    { title: "Dracula", author: "Bram Stoker", coverUrl: "https://covers.openlibrary.org/b/id/12216503-L.jpg", olKey: "/works/OL85892W", pageCount: 384, status: "to_read", coverAspect: 0.636 },
    { title: "L'Amant", author: "Marguerite Duras", coverUrl: "https://covers.openlibrary.org/b/id/5401955-L.jpg", olKey: null, pageCount: 128, status: "to_read", coverAspect: 0.637 },
  ];

  function newBook(p) {
    return {
      id: p.id || Date.now() + Math.floor(Math.random() * 1000),
      title: p.title, author: p.author || "", coverUrl: p.coverUrl || null, olKey: p.olKey || null,
      pageCount: p.pageCount || null, year: p.year || null, status: p.status || "to_read",
      rating: null, review: "", summary: p.summary || "", spineColor: p.spineColor || pickColor(p.title),
      coverAspect: p.coverAspect || null, finish: p.finish || state.settings.finish,
      spineText: "", spineFont: null, spineSize: null, size: "regular",
      startedOn: p.status === "reading" ? today() : null, finishedOn: p.status === "read" ? today() : null,
      addedAt: new Date().toISOString(),
    };
  }
  const today = () => new Date().toISOString().slice(0, 10);
  const pickColor = (s) => {
    const palette = ["#7a1d1d", "#2d4a3e", "#2f5d8a", "#5b3a6e", "#b5482a", "#3b4a5c", "#8a6d2f", "#4f2a3a"];
    let h = 0; for (const c of s || "") h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return palette[h % palette.length];
  };

  const state = { books: [], settings: { ...DEFAULT_SETTINGS }, shelf: "all", filter: "" };
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        state.books = Array.isArray(d.books) ? d.books : [];
        state.settings = { ...DEFAULT_SETTINGS, ...(d.settings || {}) };
        return;
      }
    } catch (e) { console.warn("Could not read saved shelf", e); }
    state.books = SEED.map((b, i) => newBook({ ...b, id: i + 1 }));
    save();
  }
  // ---------------------------------------------------------------- undo / redo
  // Every save remembers how things were just before, so any change (a rating, a spine colour, a deleted
  // book, a highlight) can be stepped back. Saves made by the app itself (reading position, cover
  // measuring) pass quiet=true and don't count as steps. Reading position is never rolled back.
  const undoStack = [], redoStack = [];
  let lastSnap = null;
  const snapOf = () => JSON.stringify({ books: state.books, settings: state.settings });
  const KEEP = ["readCfi", "readPct", "readAt"];
  let localUndo = null; // an open book page offers its own unsaved-edit history first
  let redrawOpen = null; // redraws the open sheet after an undo
  function restore(snap) {
    const d = JSON.parse(snap), now = new Map(state.books.map((b) => [b.id, b]));
    d.books.forEach((b) => { const c = now.get(b.id); if (c) KEEP.forEach((k) => { if (k in c) b[k] = c[k]; }); });
    state.books = d.books;
    state.settings = { ...d.settings, recentColors: state.settings.recentColors };
    lastSnap = snapOf();
    write(); render();
    if (redrawOpen) redrawOpen();
    window.dispatchEvent(new Event("shelf:restored"));
  }
  function undo() {
    if (localUndo && localUndo.canUndo()) { localUndo.undo(); return refreshUndo(); }
    if (!undoStack.length) return toast("Nothing to undo");
    redoStack.push(snapOf()); restore(undoStack.pop()); toast("Undone"); refreshUndo();
  }
  function redo() {
    if (localUndo && localUndo.canRedo()) { localUndo.redo(); return refreshUndo(); }
    if (!redoStack.length) return toast("Nothing to redo");
    undoStack.push(snapOf()); restore(redoStack.pop()); toast("Redone"); refreshUndo();
  }
  const canUndo = () => !!((localUndo && localUndo.canUndo()) || undoStack.length);
  const canRedo = () => !!((localUndo && localUndo.canRedo()) || redoStack.length);
  const undoPairs = new Set();
  function refreshUndo() {
    undoPairs.forEach((p) => {
      if (!p.isConnected) return undoPairs.delete(p);
      p.querySelector("[data-u=undo]").disabled = !canUndo();
      p.querySelector("[data-u=redo]").disabled = !canRedo();
    });
  }
  const UNDO_SVG = `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>`;
  /** A pair of undo / redo buttons that stay in step with the history. */
  function undoPair(cls = "") {
    const p = h(`<div class="undoPair ${cls}"><button class="iconBtn" data-u="undo" aria-label="Undo">${UNDO_SVG}</button><button class="iconBtn" data-u="redo" aria-label="Redo" style="transform:scaleX(-1)">${UNDO_SVG}</button></div>`);
    p.querySelector("[data-u=undo]").onclick = undo;
    p.querySelector("[data-u=redo]").onclick = redo;
    undoPairs.add(p); setTimeout(refreshUndo, 0);
    return p;
  }
  document.addEventListener("keydown", (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "z" && e.key.toLowerCase() !== "y") return;
    const t = e.target; if (t && (t.tagName === "INPUT" && t.type !== "range" && t.type !== "color" || t.tagName === "TEXTAREA")) return;
    e.preventDefault();
    if (e.key.toLowerCase() === "y" || e.shiftKey) redo(); else undo();
  });

  function write() {
    try { localStorage.setItem(KEY, JSON.stringify({ version: 1, books: state.books, settings: state.settings })); }
    catch (e) { toast("Couldn't save. Your browser storage may be full or blocked."); }
  }
  function save(quiet) {
    const snap = snapOf();
    if (quiet !== true && lastSnap && snap !== lastSnap) {
      undoStack.push(lastSnap); if (undoStack.length > 60) undoStack.shift();
      redoStack.length = 0;
    }
    lastSnap = snap;
    write(); refreshUndo();
  }

  // ---------------------------------------------------------------- recent colours
  function rememberColor(c) {
    if (!/^#[0-9a-f]{6}$/i.test(c || "")) return;
    c = c.toLowerCase();
    const list = (state.settings.recentColors || []).filter((x) => x !== c);
    state.settings.recentColors = [c, ...list].slice(0, 10);
    save(true);
  }
  // ---------------------------------------------------------------- picking a colour off the screen
  const hex = (r, g, b) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  function cssHex(c) {
    const k = /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/.exec(c || "");
    if (k) return k[4] != null && +k[4] < 0.5 ? null : hex(k[1] * 255, k[2] * 255, k[3] * 255);
    const m = /rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?/.exec(c || "");
    if (!m) return null;
    const a = m[4] == null ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : +m[4];
    return a < 0.5 ? null : hex(+m[1], +m[2], +m[3]);
  }
  const imgCache = new Map();
  /** A readable copy of a picture (null when the picture's site doesn't allow reading it). */
  function readable(src) {
    if (imgCache.has(src)) return imgCache.get(src);
    const p = new Promise((res) => {
      const im = new Image(); im.crossOrigin = "anonymous"; im.referrerPolicy = "no-referrer";
      im.onload = () => {
        try {
          const c = document.createElement("canvas"); c.width = Math.min(600, im.naturalWidth); c.height = Math.round(c.width * im.naturalHeight / im.naturalWidth);
          const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(im, 0, 0, c.width, c.height); x.getImageData(0, 0, 1, 1);
          res(x);
        } catch (e) { res(null); }
      };
      im.onerror = () => res(null); im.src = src;
    });
    imgCache.set(src, p); return p;
  }
  /** The colour of a picture shown in `el` at screen point (x, y), or null if the picture can't be read. */
  async function pictureAt(el, src, fit, x, y) {
    const ctx = await readable(src); if (!ctx) return null;
    const r = el.getBoundingClientRect(), W = ctx.canvas.width, H = ctx.canvas.height;
    let u = (x - r.left) / r.width, v = (y - r.top) / r.height;
    if (fit === "cover") { // the picture is cropped to fill its box
      const s = Math.max(r.width / W, r.height / H), dw = W * s, dh = H * s;
      u = (x - r.left + (dw - r.width) / 2) / dw; v = (y - r.top + (dh - r.height) / 2) / dh;
    }
    const px = Math.min(W - 2, Math.max(1, u * W)), py = Math.min(H - 2, Math.max(1, v * H));
    const d = ctx.getImageData(px - 1, py - 1, 3, 3).data; let R = 0, G = 0, B = 0;
    for (let i = 0; i < 36; i += 4) { R += d[i]; G += d[i + 1]; B += d[i + 2]; }
    return hex(R / 9, G / 9, B / 9);
  }
  /** The colour of whatever is on screen at (x, y): picture pixels where it can, otherwise the colour of the shape or surface. */
  async function colourAt(x, y) {
    for (const el of document.elementsFromPoint(x, y)) {
      if (el.closest(".dropper")) continue;
      const cs = getComputedStyle(el);
      // pictures that ignore touches (like covers) don't show up in the hit list, so look inside what was hit
      const inner = [...el.querySelectorAll("img")].reverse().find((im) => { const r = im.getBoundingClientRect(); return im.complete && im.naturalWidth && getComputedStyle(im).visibility !== "hidden" && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; });
      if (inner) return (await pictureAt(inner, inner.currentSrc || inner.src, getComputedStyle(inner).objectFit, x, y)) || "blocked";
      const bgUrl = /url\("?([^")]+)"?\)/.exec(cs.backgroundImage || "");
      const picSrc = el.tagName === "IMG" && el.complete && el.naturalWidth ? el.currentSrc || el.src : bgUrl ? bgUrl[1] : null;
      if (picSrc) { const c = await pictureAt(el, picSrc, el.tagName === "IMG" ? cs.objectFit : cs.backgroundSize, x, y); if (c) return c; if (el.tagName === "IMG") return "blocked"; }
      if (el instanceof SVGElement && !(el instanceof SVGSVGElement) && el.tagName !== "g") { const f = cssHex(cs.fill); if (f && +cs.opacity > 0.3 && +cs.fillOpacity > 0.3) return f; }
      const bg = cssHex(cs.backgroundColor); if (bg) return bg;
      if (el.matches("p, span, h1, h2, h3, a, label, b, i, em, strong") && el.textContent.trim()) { const c = cssHex(cs.color); if (c) return c; }
    }
    return cssHex(getComputedStyle(document.body).backgroundColor);
  }
  /** Lets you pick a colour from anything you can see. Uses the browser's own eyedropper where there is one. */
  async function pickFromScreen(onPick) {
    if (window.EyeDropper) {
      try { const r = await new EyeDropper().open(); if (r && r.sRGBHex) { const c = cssHex(r.sRGBHex) || r.sRGBHex; rememberColor(c); onPick(c); } } catch (e) { /* cancelled */ }
      return;
    }
    const ov = h(`<div class="dropper"><div class="dropTip">Touch anything to take its colour, slide to fine-tune, let go to use it. <button type="button" class="btn small">Cancel</button></div><div class="loupe" hidden><i></i><b></b></div></div>`);
    document.body.append(ov);
    const loupe = ov.querySelector(".loupe"), sw = loupe.querySelector("i"), label = loupe.querySelector("b");
    let cur = null, seq = 0, down = false;
    const close = () => ov.remove();
    ov.querySelector(".dropTip button").onclick = (e) => { e.stopPropagation(); close(); };
    const at = async (e) => {
      const n = ++seq, x = e.clientX, y = e.clientY;
      loupe.hidden = false; loupe.style.transform = `translate(${x}px, ${y}px)`;
      ov.style.pointerEvents = "none"; const c = await colourAt(x, y); ov.style.pointerEvents = "";
      if (n !== seq || !c) return;
      // some sites don't let pages read their pictures' colours
      if (c === "blocked") { cur = null; sw.style.background = "repeating-linear-gradient(45deg,#444 0 6px,#666 6px 12px)"; label.textContent = "can't read"; return; }
      cur = c; sw.style.background = c; label.textContent = c;
    };
    ov.addEventListener("pointerdown", (e) => { if (e.target.closest(".dropTip")) return; down = true; ov.setPointerCapture(e.pointerId); at(e); });
    ov.addEventListener("pointermove", (e) => { if (down) at(e); });
    ov.addEventListener("pointerup", async (e) => {
      if (!down) return; down = false; await at(e);
      if (cur) { rememberColor(cur); onPick(cur); }
      close();
    });
  }
  /** A row of the colours picked most recently; tapping one uses it again. The dropper picks one from the screen. */
  function recentRow(onPick, current) {
    const list = state.settings.recentColors || [];
    const row = h(`<div class="recentColors"><button type="button" class="dropBtn" aria-label="Pick a colour from the screen" title="Pick a colour from the screen"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4.5l5 5M17 2l5 5-3 3-5-5zM14 7l-9.3 9.3a2 2 0 0 0-.5.9L3 21l3.8-1.2a2 2 0 0 0 .9-.5L17 10"/></svg><span>Pick</span></button>${list.length ? `<span class="hint">Recent</span>` : ""}</div>`);
    row.querySelector(".dropBtn").onclick = () => pickFromScreen(onPick);
    list.forEach((c) => {
      const b = h(`<button type="button" class="recentDot" aria-label="Use ${c}" aria-pressed="${(current || "").toLowerCase() === c}" style="background:${c}"></button>`);
      b.onclick = () => { rememberColor(c); onPick(c); };
      row.append(b);
    });
    return row;
  }
  const byId = (id) => state.books.find((b) => b.id === id);
  function updateBook(id, patch) {
    const b = byId(id); if (!b) return;
    Object.assign(b, patch); save(); render();
  }

  // ---------------------------------------------------------------- online lookups
  const OL = "https://openlibrary.org";
  async function searchBooks(q, signal) {
    const url = `${OL}/search.json?q=${encodeURIComponent(q)}&limit=15&fields=key,title,author_name,cover_i,number_of_pages_median,first_publish_year`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error("Search is unavailable right now");
    const j = await res.json();
    return (j.docs || []).map((d) => ({
      olKey: d.key, title: d.title, author: (d.author_name || []).slice(0, 2).join(", "),
      coverUrl: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : null,
      thumb: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : null,
      pageCount: d.number_of_pages_median || null, year: d.first_publish_year || null,
    }));
  }
  const cleanText = (t) => t.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").split(/\n-{3,}/)[0]
    .replace(/\(\[source\]\[\d+\]\)/gi, "").replace(/\r\n?/g, "\n").replace(/([^\n])\n(?!\n)/g, "$1 ")
    .replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, 4000);
  async function findSummary(book) {
    try {
      let key = book.olKey;
      if (!key) {
        const r = await searchBooks(`${book.title} ${book.author}`);
        key = r[0] && r[0].olKey;
      }
      if (key) {
        const j = await (await fetch(`${OL}${key}.json`)).json();
        const d = typeof j.description === "string" ? j.description : j.description && j.description.value;
        if (d && d.length >= 40) return cleanText(d);
      }
    } catch (e) { console.warn(e); }
    try {
      const q = `intitle:${book.title}` + (book.author ? `+inauthor:${book.author.split(",")[0]}` : "");
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5&printType=books`);
      if (res.ok) {
        const j = await res.json();
        const best = (j.items || []).map((i) => (i.volumeInfo && i.volumeInfo.description) || "").sort((a, b) => b.length - a.length)[0];
        if (best) return cleanText(best);
      }
    } catch (e) { console.warn(e); }
    return "";
  }
  /** Cover shape (width ÷ height) and the spine colour: the main colour of the cover's left edge,
   *  so the spine reads as the same printed wrap as the cover. */
  function sampleEdge(img) {
    const W = 50, H = 75;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(img, 0, 0, W, H);
    // Skip plain white/black scan borders: walk in from the left until a column has real cover in it.
    let x0 = 1;
    for (let x = 0; x < 8; x++) {
      const col = g.getImageData(x, 3, 1, H - 6).data;
      let sum = 0, sq = 0, n = 0;
      for (let i = 0; i < col.length; i += 4) { const l = (col[i] + col[i + 1] + col[i + 2]) / 765; sum += l; sq += l * l; n++; }
      const mean = sum / n, sd = Math.sqrt(Math.max(0, sq / n - mean * mean));
      const border = sd < 0.04 && (mean > 0.9 || mean < 0.07);
      if (!border) { x0 = Math.max(1, x + 1); break; }
      if (x === 7) x0 = 1; // the whole edge is plain: it's a plain cover, not a border
    }
    const px = g.getImageData(x0, 2, 4, H - 4).data;
    const buckets = new Map();
    for (let i = 0; i < px.length; i += 4) {
      const k = (px[i] >> 4) * 256 + (px[i + 1] >> 4) * 16 + (px[i + 2] >> 4);
      const e = buckets.get(k) || { n: 0, r: 0, g: 0, b: 0 };
      e.n++; e.r += px[i]; e.g += px[i + 1]; e.b += px[i + 2]; buckets.set(k, e);
    }
    let best = null;
    for (const e of buckets.values()) if (!best || e.n > best.n) best = e;
    return { color: "#" + [best.r, best.g, best.b].map((v) => Math.round(v / best.n).toString(16).padStart(2, "0")).join(""), inset: x0 / W };
  }
  function loadImg(url, cors) {
    return new Promise((resolve) => {
      const img = new Image();
      if (cors) img.crossOrigin = "anonymous";
      img.onload = () => resolve(img.naturalWidth >= 10 ? img : null);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }
  async function measureCover(url) {
    let img = await loadImg(url, true);
    let color = null, inset = null;
    if (img) { try { ({ color, inset } = sampleEdge(img)); } catch (e) { /* host refused colour reading */ } }
    else img = await loadImg(url, false); // host has no CORS: we still get the shape, not the colour
    if (!img) return { aspect: null, color: null };
    return { aspect: Math.round((img.naturalWidth / img.naturalHeight) * 1000) / 1000, color, inset };
  }

  // ---------------------------------------------------------------- helpers
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const hash = (n) => { let x = (n * 2654435761) >>> 0; x ^= x >>> 13; return x >>> 0; };
  let toastTimer = 0;
  function toast(msg) {
    const t = document.getElementById("toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 2600);
  }

  // ---------------------------------------------------------------- painted spines (v273, osamu's Gemini pictures)
  // Each picture lives in its own IndexedDB store, not in the books list: pictures are far too big for localStorage.
  // A book only keeps b.spineArt = { key, ar } (the picture's id and its width / height).
  const spineUrls = new Map();
  const spineDb = new Promise((res) => {
    try { const r = indexedDB.open("shelf-spines", 1); r.onupgradeneeded = () => r.result.createObjectStore("img"); r.onsuccess = () => res(r.result); r.onerror = () => res(null); }
    catch (e) { res(null); }
  });
  async function spineTx(mode, fn) {
    const d = await spineDb; if (!d) throw new Error("no storage");
    return new Promise((resolve, reject) => {
      const tx = d.transaction("img", mode), req = fn(tx.objectStore("img"));
      tx.oncomplete = () => resolve(req ? req.result : undefined); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
    });
  }
  async function spinePut(key, blob) {
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    await spineTx("readwrite", (s) => s.put(blob, key));
    spineUrls.set(key, URL.createObjectURL(blob));
  }
  const spineUrl = (b) => (b && b.spineArt && spineUrls.get(b.spineArt.key)) || null;
  /** Load every stored picture once at start; pictures no book (or the kept pre-restore shelf) points at are thrown away. */
  async function spineLoadAll() {
    try {
      const keys = await spineTx("readonly", (s) => s.getAllKeys()), vals = await spineTx("readonly", (s) => s.getAll());
      const used = new Set(state.books.map((b) => b.spineArt && b.spineArt.key).filter(Boolean));
      try { (JSON.parse(localStorage.getItem("shelf.v1.beforeRestore") || "null") || { books: [] }).books.forEach((b) => b.spineArt && used.add(b.spineArt.key)); } catch (e) { /* none kept */ }
      let n = 0;
      keys.forEach((k, i) => { if (used.has(k)) { spineUrls.set(k, URL.createObjectURL(vals[i])); n++; } else spineTx("readwrite", (s) => s.delete(k)).catch(() => {}); });
      return n;
    } catch (e) { return 0; }
  }
  const blobToDataUrl = (blob) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => res(null); r.readAsDataURL(blob); });
  function dataUrlToBlob(u) {
    const [head, b64] = u.split(","), type = (head.match(/data:([^;]+)/) || [, "image/png"])[1], bin = atob(b64), a = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
    return new Blob([a], { type });
  }
  /** The painted spines the given books use, as data URLs, for backup files. */
  async function spinesFor(books) {
    const out = {};
    for (const b of books) {
      const k = b.spineArt && b.spineArt.key; if (!k || out[k]) continue;
      try { const blob = await spineTx("readonly", (s) => s.get(k)); if (blob) out[k] = await blobToDataUrl(blob); } catch (e) { /* skip */ }
    }
    return out;
  }
  async function spinesRestore(map) {
    for (const [k, u] of Object.entries(map || {})) { try { await spinePut(k, dataUrlToBlob(u)); } catch (e) { /* skip */ } }
  }
  /** Cut the spine out of Gemini's picture: key out the green, trim to the spine, stand it upright. */
  function spineFromPhoto(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.onload = () => {
        URL.revokeObjectURL(url);
        const sc = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
        const W = Math.round(img.naturalWidth * sc), H = Math.round(img.naturalHeight * sc);
        const c = document.createElement("canvas"); c.width = W; c.height = H;
        const g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(img, 0, 0, W, H);
        const id = g.getImageData(0, 0, W, H), px = id.data;
        // green screen: how far green stands above red and blue. A sage or olive spine stays (small lead);
        // Gemini's bright or shaded green backdrop goes (big lead). Edges are softened and de-greened.
        for (let i = 0; i < px.length; i += 4) {
          const r = px[i], gg = px[i + 1], bl = px[i + 2], m = Math.max(r, bl), lead = gg - m;
          const a = lead <= 28 ? 1 : lead >= 62 ? 0 : 1 - (lead - 28) / 34;
          if (a < 1) { px[i + 1] = Math.min(gg, m + 10); px[i + 3] = Math.round(a * 255); }
        }
        // the spine is the solid upright block: columns mostly opaque, then rows mostly opaque within them
        const colOk = (x) => { let n = 0; for (let y = 0; y < H; y++) if (px[(y * W + x) * 4 + 3] > 200) n++; return n > H * 0.25; };
        const rowOk = (y, x0, x1) => { let n = 0; for (let x = x0; x <= x1; x++) if (px[(y * W + x) * 4 + 3] > 200) n++; return n > (x1 - x0 + 1) * 0.5; };
        let x0 = 0, x1 = W - 1; while (x0 < W && !colOk(x0)) x0++; while (x1 > x0 && !colOk(x1)) x1--;
        let wide = false;
        if (x1 - x0 < 4) {   // nothing upright: maybe the spine was painted lying down
          const rowFull = (y) => { let n = 0; for (let x = 0; x < W; x++) if (px[(y * W + x) * 4 + 3] > 200) n++; return n > W * 0.25; };
          let y0 = 0, y1 = H - 1; while (y0 < H && !rowFull(y0)) y0++; while (y1 > y0 && !rowFull(y1)) y1--;
          if (y1 - y0 < 4) return resolve(null);
          x0 = 0; x1 = W - 1;
          const colIn = (x) => { let n = 0; for (let y = y0; y <= y1; y++) if (px[(y * W + x) * 4 + 3] > 200) n++; return n > (y1 - y0 + 1) * 0.5; };
          while (x0 < W && !colIn(x0)) x0++; while (x1 > x0 && !colIn(x1)) x1--;
          wide = { y0, y1 };
        }
        let y0 = 0, y1 = H - 1;
        if (wide) { y0 = wide.y0; y1 = wide.y1; } else { while (y0 < H && !rowOk(y0, x0, x1)) y0++; while (y1 > y0 && !rowOk(y1, x0, x1)) y1--; }
        g.putImageData(id, 0, 0);
        const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
        if (cw < 4 || ch < 4) return resolve(null);
        // stand it up (a lying spine reads left to right, so it turns clockwise), at most 900px tall
        const upW = wide ? ch : cw, upH = wide ? cw : ch, k = Math.min(1, 900 / upH);
        const o = document.createElement("canvas"); o.width = Math.max(2, Math.round(upW * k)); o.height = Math.max(2, Math.round(upH * k));
        const og = o.getContext("2d");
        if (wide) { og.translate(o.width, 0); og.rotate(Math.PI / 2); og.drawImage(c, x0, y0, cw, ch, 0, 0, o.height, o.width); }
        else og.drawImage(c, x0, y0, cw, ch, 0, 0, o.width, o.height);
        // its main colour, for the top and back of the book
        const mid = og.getImageData(Math.floor(o.width * 0.3), Math.floor(o.height * 0.1), Math.max(1, Math.floor(o.width * 0.4)), Math.floor(o.height * 0.8)).data;
        let R = 0, G = 0, B = 0, n = 0; for (let i = 0; i < mid.length; i += 16) if (mid[i + 3] > 200) { R += mid[i]; G += mid[i + 1]; B += mid[i + 2]; n++; }
        const hex = n ? "#" + [R, G, B].map((v) => Math.round(v / n).toString(16).padStart(2, "0")).join("") : null;
        const done = (blob) => resolve(blob ? { blob, ar: o.width / o.height, color: hex, preview: o.toDataURL("image/png") } : null);
        o.toBlob((bw) => (bw && bw.type === "image/webp" ? done(bw) : o.toBlob(done, "image/png")), "image/webp", 0.9);
      };
      img.src = url;
    });
  }
  /** A fresh Gemini prompt for this one book's spine. */
  function spinePrompt(b) {
    const { h: hh, d } = dims({ ...b, spineArt: null }, 230);
    const ratio = Math.max(3, Math.round(hh / d));
    const pages = b.pageCount ? `about ${b.pageCount} pages` : "a normal novel";
    return `Paint the SPINE of the book "${b.title}"${b.author ? ` by ${b.author}` : ""}, seen perfectly straight on and flat, like a photograph taken head-on of a book standing on a shelf. Use the attached front cover as the reference: same colours, same typefaces, same edition, same era. ${b.binding === "paper" ? "This is a PAPERBACK: a flat, square spine printed on card, with a faint soft fold running down each long edge where it bends onto the covers, and no raised bands." : "This is a HARDCOVER: a cloth or leather case with a slightly rounded back, so the spine turns gently away from the light at both long edges, and the boards stand a hair proud of the head and tail."}

Make it look like a real, gently read copy: realistic photo, soft rubbed edges, a few small creases and scuffs, slightly faded at the top. Not an illustration.

Text on the spine, spelled exactly: the title "${b.title}"${b.author ? ` and the author "${b.author.split(",")[0].trim()}"` : ""}, running from top to bottom the way English spines are printed, plus a small publisher logo near the bottom if the edition has one.

Shape: the spine stands upright in the centre of the image and fills about 90% of the image height. Its width is about 1/${ratio} of its height (${pages}). Show only the spine: no front cover, no back cover, no pages, no shelf, no other books, no hands.

Background: flat pure green #00FF00 everywhere around the spine, evenly lit, no shadow, no gradient, no green reflections on the book. Portrait image, 9:16.`;
  }

  function dims(b, base) {
    const scale = (SIZES[b.size] || SIZES.regular)[1];
    const hh = Math.round(base * scale * (b.height ? b.height / 100 : 0.94 + (hash(b.id) % 4) * 0.02));
    const aspect = Math.max(0.5, Math.min(0.9, b.coverAspect || 2 / 3));
    const w = Math.round(hh * aspect);
    const pages = b.pageCount || 280;
    let d = Math.max(8, Math.round(Math.max(24, Math.min(62, 14 + pages / 14)) * (hh / 230) * (b.thickness || 100) / 100));
    // a painted spine sets the thickness from its own shape
    if (b.spineArt && b.spineArt.ar) d = Math.max(6, Math.round(hh * Math.min(0.45, b.spineArt.ar) * (b.thickness || 100) / 100));
    return { h: hh, w, d };
  }

  /** The automatic spine layout, written as a design so the designer starts from exactly what you see.
   *  Sizes are in "units": pixels on a book 230px tall; they scale with the book. */
  function autoDesign(b) {
    const { h: hh, d } = dims(b, 230);
    const k = 230 / hh;
    const fontKey = FONTS[b.spineFont] ? b.spineFont : FONTS[state.settings.spineFont] ? state.settings.spineFont : "classic";
    const font = FONTS[fontKey];
    const custom = (b.spineText || "").trim();
    const words = custom || b.title;
    const surname = (b.author.split(",")[0].trim().split(" ").pop()) || "";
    const longest = Math.max(...words.split("\n").map((l) => l.trim().length), 1);
    const lines = custom ? words.split("\n").length : 1;
    const withAuthor = !!surname && d >= 18 && !custom;
    const fit = Math.min((d * 0.5) / lines, (hh * (withAuthor ? 0.6 : 0.78)) / (longest * font.cw));
    const size = b.spineSize || Math.round(Math.max(7.5, Math.min(14, fit)) * 2) / 2;
    const aSize = Math.max(6, Math.min(9, size * 0.62, d * 0.3, (hh * 0.17) / (Math.max(surname.length, 1) * 0.95)));
    return {
      dir: "down",
      title: { show: true, text: words, font: fontKey, size: +(size * k).toFixed(1), pos: withAuthor ? 44 : 50, shift: 0, spacing: font.upper ? 8 : 1, tcase: font.upper ? "upper" : "none", bold: false, color: null },
      author: { show: withAuthor, text: surname, font: "sans", size: +(aSize * k).toFixed(1), pos: 88, shift: 0, spacing: 16, tcase: "upper", bold: false, color: null, soft: true },
      extra: { show: false, text: "", font: "sans", size: 7, pos: 8, shift: 0, spacing: 20, tcase: "upper", bold: false, color: null, soft: true },
    };
  }

  function spineTextEl(part, dir, scale) {
    const f = FONTS[part.font] || FONTS.classic;
    const el = document.createElement("span");
    el.className = "sTxt" + (dir === "across" ? " across" : "") + (part.soft ? " soft" : "");
    el.textContent = part.tcase === "upper" ? part.text.toUpperCase() : part.tcase === "lower" ? part.text.toLowerCase() : part.text;
    const rot = dir === "up" ? " rotate(180deg)" : "";
    Object.assign(el.style, {
      fontFamily: f.family, fontWeight: part.bold ? 800 : f.weight, fontSize: (part.size * scale).toFixed(2) + "px",
      letterSpacing: (part.spacing / 100) + "em", top: part.pos + "%", left: `calc(50% + ${part.shift}%)`,
      transform: `translate(-50%, -50%)${rot}`,
    });
    if (part.color) el.style.color = part.color;
    return el;
  }

  function bookEl(b, base, turn) {
    const { h: hh, w, d } = dims(b, base);
    const design = b.spineDesign || autoDesign(b);
    const el = h(`<div class="book ${b.finish === "glossy" ? "glossy" : "matte"}${b.binding === "paper" ? " paper" : " hard"}">
      <div class="body">
        <div class="face front">
          ${b.coverUrl ? `<img class="art" alt="" draggable="false" loading="lazy" referrerpolicy="no-referrer" src="${esc(b.coverUrl)}">` : ""}
          <div class="plain" ${b.coverUrl ? "hidden" : ""}><span class="plainRule"></span><span class="plainTitle">${esc(b.title)}</span><span class="plainAuthor">${esc(b.author)}</span></div>
          <span class="grain"></span><span class="wear"></span><span class="rub"></span><span class="hinge"></span><span class="sheen"></span><span class="fShade"></span>
        </div>
        <div class="face spine"><span class="sForm"></span><span class="grain"></span><span class="wear"></span><span class="rub"></span><span class="sShade"></span></div>
        <div class="face head"></div><div class="face pages"></div><div class="face back"></div><div class="face top"></div><div class="face lid"></div>
      </div><span class="tShade" aria-hidden="true"></span></div>`);
    el.style.cssText = `--w:${w}px;--h:${hh}px;--d:${d}px;--tP:${(w * hh * 1.67 / 5000).toFixed(1)}px;--spine:${b.spineColor};--ink:${spineInk(b.spineColor)}` + (turn !== undefined ? `;--turn:${turn}` : "")
      // every book is worn in its own way: stains, rubbed corners and scratches sit in different places
      + (() => { const r = hash((+b.id || 7) * 31 + 11); return `;--wx:${r % 173}px;--wy:${(r >> 3) % 211}px;--sx:${(r >> 6) % 97}px;--age:${(0.75 + ((r >> 9) % 6) * 0.07).toFixed(2)}`; })();
    const spine = el.querySelector(".spine"), form = spine.querySelector(".sForm");
    const art = spineUrl(b);
    if (art) {
      el.classList.add("painted");
      const im = document.createElement("img"); im.className = "sArt"; im.alt = ""; im.draggable = false; im.src = art;
      spine.prepend(im);
    }
    if (!art) for (const key of ["title", "author", "extra"]) {
      const part = design[key];
      if (part && part.show && part.text && part.text.trim()) form.after(spineTextEl(part, design.dir, hh / 230));
    }
    const img = el.querySelector(".art");
    if (img) img.onerror = () => { img.remove(); el.querySelector(".plain").hidden = false; };
    return el;
  }

  function starsEl(value, onChange, size = 24) {
    const wrap = h(`<div class="stars" role="${onChange ? "radiogroup" : "img"}" aria-label="${value ? value + " out of 5 stars" : "Not rated"}"></div>`);
    const path = "M12 2.6l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.9l-5.8 3.2 1.4-6.4L2.7 9.3l6.5-.7z";
    const draw = (v) => {
      wrap.querySelectorAll(".star").forEach((s, i) => {
        const f = v >= i + 1 ? 1 : v >= i + 0.5 ? 0.5 : 0;
        const full = s.querySelector("path.f");
        full.style.display = f ? "" : "none";
        full.style.clipPath = f === 0.5 ? "inset(0 50% 0 0)" : "";
      });
    };
    for (let i = 1; i <= 5; i++) {
      const s = h(`<span class="star" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 24 24"><path class="e" d="${path}"/><path class="f" d="${path}"/></svg></span>`);
      if (onChange) {
        for (const [cls, v] of [["l", i - 0.5], ["r", i]]) {
          const btn = h(`<button type="button" class="hit ${cls}" aria-label="${v} stars"></button>`);
          btn.onmouseenter = () => draw(v);
          btn.onclick = () => onChange(value === v ? null : v);
          s.append(btn);
        }
      }
      wrap.append(s);
    }
    if (onChange) wrap.onmouseleave = () => draw(value || 0);
    draw(value || 0);
    return wrap;
  }

  // ---------------------------------------------------------------- per-shelf decor switches
  const shelfDecor = (key) => (state.settings.shelfDecor || {})[key] || {};
  function setShelfDecor(key, patch) {
    const all = { ...(state.settings.shelfDecor || {}) };
    all[key] = { ...(all[key] || {}), ...patch };
    state.settings.shelfDecor = all; save();
  }
  // the decorations standing on a shelf. "auto" is the room's own object. Until a shelf is
  // arranged by hand it shows the room's object where the old single-ornament setting put it.
  // each look keeps its own arrangement: objects placed in one room stay in that room
  const lookId = () => state.settings.lookKey || (Object.entries(D.LOOKS).find(([, L]) => L.set.backdrop === state.settings.backdrop && L.set.theme === state.settings.theme) || ["minimal"])[0];
  function decorItems(key) {
    const dz = shelfDecor(key), mine = (dz.byLook || {})[lookId()];
    if (Array.isArray(mine)) return mine;
    // arranged before looks kept their own (v56–57): those belong to the look in use then
    if (Array.isArray(dz.items) && !dz.byLook) {
      const all = { ...(state.settings.shelfDecor || {}) }, { items, ...rest } = dz;
      all[key] = { ...rest, byLook: { [lookId()]: items } };
      state.settings.shelfDecor = all; save(true);
      return items;
    }
    const oc = state.settings.ornament || {};
    if (!oc.kind || oc.kind === "none" || dz.noCandle) return [];
    const pos = oc.pos || "end";
    const first = { id: "d0", kind: "auto", after: pos === "start" ? null : pos === "middle" ? "mid" : "end", on: !dz.out };
    return D.ORNAMENTS[oc.kind] && D.ORNAMENTS[oc.kind].cycle ? [first, { id: "d1", kind: "auto2", after: "mid", on: true }] : [first];
  }
  // a picture of a decoration sized to fill a menu tile
  // Menu pictures are plain images: each drawing is laid out once off screen, the styles the page sheet gives its parts
  // are written onto them, and the result becomes an <img>. A phone draws dozens of images in a scrolling menu easily;
  // dozens of live drawings it could not (the menu broke up into patches on Android Chrome).
  const thumbs = new Map();
  const STYLE_PROPS = ["display", "visibility", "opacity", "fill", "stroke", "fill-opacity", "stroke-opacity", "stroke-width"];
  function thumbUrl(k, H) {
    const id = k + ":" + H; if (thumbs.has(id)) return thumbs.get(id);
    const url = svgUrlOf(D.ornamentEl(k, H, true, true));
    thumbs.set(id, url); return url;
  }
  // v300: an object's silhouette for the 3D light to cast a real shadow from: the object unlit (no flame or glow), its
  // painted pictures copied in, since a picture drawn from an SVG file may not fetch anything else
  const masks = new Map(), pics = new Map();
  const picData = (u) => { if (!pics.has(u)) pics.set(u, fetch(u).then((r) => r.blob()).then((bl) => new Promise((ok) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.onerror = () => ok(u); fr.readAsDataURL(bl); })).catch(() => u)); return pics.get(u); };
  function maskFor(k, H, done) {
    const id = k + ":" + H, m = masks.get(id);
    if (m) return m.img;
    masks.set(id, { img: null });
    const el = D.ornamentEl(k, H, false);
    if (!el) return null;
    el.querySelectorAll(".ornGlow, .ornPool, .ornFlame, .litOnly, .ember, .smoke").forEach((n) => n.remove());
    let url = svgUrlOf(el); if (!url) return null;
    let txt = decodeURIComponent(url.slice(url.indexOf(",") + 1));
    const refs = [...new Set([...txt.matchAll(/href="([^"#][^"]*)"/g)].map((x) => x[1]).filter((u) => !u.startsWith("data:")))];
    Promise.all(refs.map((u) => picData(new URL(u, location.href).href).then((d) => [u, d]))).then((pairs) => {
      for (const [u, d] of pairs) txt = txt.split(`"${u}"`).join(`"${d}"`);
      const img = new Image(); img.onload = () => { masks.get(id).img = img; done(); }; img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(txt);
    });
    return null;
  }
  function svgUrlOf(el) {
    const host = document.createElement("div");
    host.style.cssText = "position:fixed;left:-10000px;top:0;pointer-events:none";
    host.append(el); document.body.append(host);
    const svg = el.querySelector("svg"); let url = "";
    try {
      const fix = (v) => v.replace(/url\("?[^#")]*#([^")]+)"?\)/g, "url(#$1)");
      svg.querySelectorAll("*").forEach((n) => {
        if (n.closest("defs")) return;
        const cs = getComputedStyle(n), st = [];
        STYLE_PROPS.forEach((p) => { const v = cs.getPropertyValue(p); if (v) st.push(p + ":" + fix(v)); });
        if (!n.hasAttribute("transform") && cs.transform && cs.transform !== "none") st.push("transform:" + cs.transform, "transform-origin:" + cs.transformOrigin, "transform-box:" + cs.transformBox);
        n.setAttribute("style", st.join(";"));
      });
      const shared = document.getElementById("ornShared");
      if (shared) { const d = document.createElementNS("http://www.w3.org/2000/svg", "defs"); d.innerHTML = shared.querySelector("defs").innerHTML; svg.prepend(d); }
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
    } catch (e) { url = ""; }
    host.remove();
    return url;
  }
  function ornArt(k, box) {
    const o = D.ORNAMENTS[k], hgt = Math.min(box, (box * 1.15 * 200) / (o.vw || 100)), H = Math.round(hgt / (o.scale || 0.7));
    const url = o.img || thumbUrl(k, H);
    if (!url) return D.ornamentEl(k, H, true, true);
    const w = Math.round(H * (o.scale || 0.7) * o.vw / 200), hh = Math.round(H * (o.scale || 0.7));
    const img = new Image(w, hh); img.className = "ornThumb"; img.alt = ""; img.decoding = "async"; img.draggable = false; img.src = url;
    return img;
  }
  function setDecorItems(key, items) {
    const dz = shelfDecor(key), byLook = { ...(dz.byLook || {}) };
    byLook[lookId()] = items.map(({ id, kind, after, on, top }) => (top === undefined ? { id, kind, after, on } : { id, kind, after, on, top }));
    setShelfDecor(key, { byLook, items: undefined });
  }
  function resolveKind(kind, idx) {
    if (kind !== "auto" && kind !== "auto2") return D.ORNAMENTS[kind] ? kind : null;
    const k = (state.settings.ornament || {}).kind;
    const od = D.ORNAMENTS[k];
    if (!od) return null;
    // a room with a set of objects (the closet) puts two of them on each shelf, taking turns down the room
    if (od.cycle) return od.cycle[(idx * 2 + (kind === "auto2" ? 1 : 0)) % od.cycle.length];
    if (kind === "auto2") return null;
    return od.alt && idx % 2 ? od.alt : k;
  }
  // the bin that shows while a decoration is lifted
  const bin = document.createElement("div");
  bin.className = "decorBin"; bin.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg><span>Tap to remove</span>`;
  document.body.append(bin);
  function showBin(on) { bin.classList.toggle("show", on); document.body.classList.toggle("arrangingDecor", on); if (!on) bin.classList.remove("over"); }
  // after a hold the bin stays, so an object can be removed with a tap; a tap anywhere else puts it away
  const binLabel = bin.querySelector("span");
  let binPending = null;
  function askBin(removeFn) {
    binPending = removeFn; binLabel.textContent = "Tap to remove"; bin.classList.add("ask"); showBin(true);
  }
  function clearBin() {
    if (!binPending) return;
    binPending = null; bin.classList.remove("ask"); showBin(false);
    
  }
  bin.addEventListener("click", (e) => { e.stopPropagation(); const f = binPending; clearBin(); if (f) f(); });
  document.addEventListener("pointerdown", (e) => { if (binPending && !bin.contains(e.target)) clearBin(); }, true);
  function binHit(x, y) { if (!bin.classList.contains("show")) return false; const r = bin.getBoundingClientRect(); return x > r.left - 16 && x < r.right + 16 && y > r.top - 24 && y < r.bottom + 16; }

  // ---------------------------------------------------------------- candle sounds (made on the fly, no files)
  let actx = null;
  function noiseBurst(dur) {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === "suspended") actx.resume();
    const buf = actx.createBuffer(1, Math.ceil(actx.sampleRate * dur), actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = actx.createBufferSource(); src.buffer = buf; return src;
  }
  // candle sounds are small, close-up sounds: kept well under the room sound
  let candleBus = null;
  const candleOut = () => { if (!candleBus || candleBus.context !== actx) { candleBus = actx.createGain(); candleBus.gain.value = 0.08; const hp = actx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 450; candleBus.connect(hp).connect(actx.destination); } return candleBus; }; // soft and light: no low thump
  function env(g, t0, peak, attack, decay) { g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(peak, t0 + attack); g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay); }
  /** Someone blowing a candle out: a long soft "fffooh" of breath, the flame fluttering in it, then quiet. */
  function soundBlow() {
    try {
      const src = noiseBurst(0.95), t = actx.currentTime;
      const hp = actx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 220;
      const lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.Q.value = 0.4;
      lp.frequency.setValueAtTime(3400, t); lp.frequency.exponentialRampToValueAtTime(650, t + 0.7);
      const g = actx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.5, t + 0.07); g.gain.linearRampToValueAtTime(0.38, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
      src.connect(hp).connect(lp).connect(g).connect(candleOut()); src.start(t); src.stop(t + 0.95);
      // the flame flapping in the breath before it goes
      const f = noiseBurst(0.4), bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 150; bp.Q.value = 0.8;
      const fg = actx.createGain(); fg.gain.value = 0;
      const lfo = actx.createOscillator(), lg = actx.createGain(); lfo.frequency.value = 17; lg.gain.value = 0.35;
      lfo.connect(lg).connect(fg.gain);
      const fe = actx.createGain(); fe.gain.setValueAtTime(0.0001, t); fe.gain.linearRampToValueAtTime(1, t + 0.05); fe.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
      f.connect(bp).connect(fg).connect(fe).connect(candleOut()); f.start(t); f.stop(t + 0.4); lfo.start(t); lfo.stop(t + 0.4);
    } catch (e) { /* no sound available */ }
  }
  /** A pull-chain light switch: the beads rattle, the switch clicks at the bottom, then a softer click as it lets go. */
  function soundPullSwitch(on) {
    try {
      noiseBurst(0.01); // wakes the audio context
      const t = actx.currentTime;
      const click = (at, freq, peak, len) => {
        const s = noiseBurst(len + 0.02), bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = freq; bp.Q.value = 2.5;
        const g = actx.createGain(); env(g, at, peak, 0.002, len);
        s.connect(bp).connect(g).connect(actx.destination); s.start(at); s.stop(at + len + 0.02);
      };
      // ball chain sliding through the switch housing
      for (let k = 0; k < 7; k++) click(t + k * 0.017 + Math.random() * 0.006, 5200 + Math.random() * 1800, 0.07, 0.012);
      // the mechanism: a sharp tick with a little body to it
      const at = t + 0.15;
      click(at, 3000, 0.55, 0.035);
      const o = actx.createOscillator(), og = actx.createGain(); o.type = "sine";
      o.frequency.setValueAtTime(on ? 210 : 170, at); o.frequency.exponentialRampToValueAtTime(90, at + 0.06);
      env(og, at, 0.28, 0.003, 0.07); o.connect(og).connect(actx.destination); o.start(at); o.stop(at + 0.1);
      // the chain springing back up
      click(at + 0.13, 2400, 0.16, 0.025);
      for (let k = 0; k < 4; k++) click(at + 0.16 + k * 0.03, 6000, 0.035, 0.01);
    } catch (e) { /* no sound available */ }
  }
  // small handling sounds (books, pages): quiet, close, no boom
  let sfxBus = null;
  const sfxVol = () => { try { return window.ShelfSfxLevel ? window.ShelfSfxLevel() : 1; } catch (e) { return 1; } };
  const sfxOut = () => { if (!sfxBus || sfxBus.context !== actx) { sfxBus = actx.createGain(); sfxBus.gain.value = 0.16 * sfxVol(); const hp = actx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 140; sfxBus.connect(hp).connect(actx.destination); } return sfxBus; };
  let lastSlide = 0;
  /** A book dragged a little along a wooden shelf: a dry, grainy scrape with no knock or click. */
  function soundBookSlide() {
    try {
      const now = performance.now(), gap = now - lastSlide; lastSlide = now;
      if (gap < 70) return;
      const quick = gap < 260 ? 0.6 : 1; // a fast swipe gets lighter, shorter drags
      noiseBurst(0.01);
      const t = actx.currentTime, sr = actx.sampleRate, len = (0.26 + Math.random() * 0.08) * (quick < 1 ? 0.75 : 1);
      // friction noise: hiss broken into tiny stick-slip grains, like cloth board on wood
      const buf = actx.createBuffer(1, Math.ceil(sr * len), sr), d = buf.getChannelData(0);
      let grain = 0, next = 0, lp = 0;
      for (let i = 0; i < d.length; i++) {
        if (i >= next) { grain = 0.35 + Math.random() * 0.65; next = i + Math.floor(sr * (0.006 + Math.random() * 0.014)); }
        grain *= 0.9993;
        lp += ((Math.random() * 2 - 1) - lp) * 0.35; // takes the fizz off the top
        d[i] = lp * grain;
      }
      const src = actx.createBufferSource(); src.buffer = buf;
      const hp = actx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 180;
      const body = actx.createBiquadFilter(); body.type = "peaking"; body.frequency.value = 420; body.Q.value = 0.8; body.gain.value = 5;
      const top = actx.createBiquadFilter(); top.type = "lowpass"; top.frequency.setValueAtTime(2200, t); top.frequency.linearRampToValueAtTime(1300, t + len);
      // eases in, carries, eases out: a push, never a hit
      const g = actx.createGain(); g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.75 * quick, t + len * 0.3); g.gain.linearRampToValueAtTime(0.55 * quick, t + len * 0.7); g.gain.linearRampToValueAtTime(0.0001, t + len);
      src.connect(hp).connect(body).connect(top).connect(g).connect(sfxOut()); src.start(t); src.stop(t + len);
    } catch (e) { /* no sound available */ }
  }
  /** A paper page turning over: a crinkly swish that rises and falls, then the page settling. */
  function soundPageTurn() {
    try {
      noiseBurst(0.01); const t = actx.currentTime, len = 0.42 + Math.random() * 0.08, sr = actx.sampleRate;
      // paper noise: hiss with little crinkles in it
      const buf = actx.createBuffer(1, Math.ceil(sr * len), sr), d = buf.getChannelData(0);
      let crink = 0;
      for (let i = 0; i < d.length; i++) {
        if (Math.random() < 0.0016) crink = 0.6 + Math.random() * 0.8;
        crink *= 0.9975;
        d[i] = (Math.random() * 2 - 1) * (0.45 + crink);
      }
      const src = actx.createBufferSource(); src.buffer = buf;
      const hp = actx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 700;
      const bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 0.55;
      bp.frequency.setValueAtTime(1400, t); bp.frequency.exponentialRampToValueAtTime(3800, t + len * 0.45); bp.frequency.exponentialRampToValueAtTime(1800, t + len);
      const g = actx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + len * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      src.connect(hp).connect(bp).connect(g).connect(sfxOut()); src.start(t); src.stop(t + len);
      // the page landing: a soft papery flap
      const at = t + len * 0.78, n = noiseBurst(0.12), lp = actx.createBiquadFilter(); lp.type = "bandpass"; lp.frequency.value = 900; lp.Q.value = 0.7;
      const fg = actx.createGain(); env(fg, at, 0.4, 0.006, 0.09);
      n.connect(lp).connect(fg).connect(sfxOut()); n.start(at); n.stop(at + 0.12);
    } catch (e) { /* no sound available */ }
  }
  /** Two little glass prisms touching: a bright, short, slightly out-of-tune ring (small glass rings at
   *  inharmonic partials), the higher ones dying first, with a tiny tick of contact. Very soft. */
  let clinks = [];
  function soundClink(freq, hit, pan) {
    try {
      const now = performance.now(); clinks = clinks.filter((t) => now - t < 1000);
      if (clinks.length > 18 || !actx || actx.state !== "running") return; // never a rattle; and only once audio is already up
      clinks.push(now);
      const t = actx.currentTime + Math.random() * 0.004, v = Math.max(0.05, Math.min(1, hit));
      const out = actx.createGain(); out.gain.value = 0.55 * v * v;
      let dest = out; if (actx.createStereoPanner) { const p = actx.createStereoPanner(); p.pan.value = Math.max(-0.6, Math.min(0.6, pan || 0)); out.connect(p); p.connect(sfxOut()); } else out.connect(sfxOut());
      [[1, 0.5, 0.55], [2.32, 0.3, 0.32], [4.25, 0.16, 0.18], [6.63, 0.08, 0.1]].forEach(([r, a, d]) => {
        const f = freq * r * (1 + (Math.random() - 0.5) * 0.004); if (f > 16000) return;
        const o = actx.createOscillator(), g = actx.createGain(); o.type = "sine"; o.frequency.value = f;
        const len = d * (0.6 + v * 0.6); env(g, t, a, 0.0015, len);
        o.connect(g).connect(dest); o.start(t); o.stop(t + len + 0.05);
      });
      const n = noiseBurst(0.012), hp = actx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 6000;
      const ng = actx.createGain(); env(ng, t, 0.12, 0.0008, 0.006); n.connect(hp).connect(ng).connect(dest); n.start(t); n.stop(t + 0.012);
    } catch (e) { /* no sound available */ }
  }
  window.ShelfSfx = { page: soundPageTurn, slide: soundBookSlide, pull: soundPullSwitch, clink: soundClink, setVolume(v) { if (sfxBus) sfxBus.gain.setTargetAtTime(0.16 * v, sfxBus.context.currentTime, 0.05); } };
  /** Turning an hourglass: the sand shifting inside as it tips, a soft wooden knock as it is set down, then the faint
   *  dry trickle of the stream starting again and fading under the room. Kept quiet. */
  function soundHourglass() {
    try {
      noiseBurst(0.01); const t = actx.currentTime;
      const grain = (at, len, freq, peak) => {
        const n = noiseBurst(len + 0.02), f = actx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq; f.Q.value = 1.4;
        const g = actx.createGain(); env(g, at, peak, 0.002, len); n.connect(f).connect(g).connect(sfxOut()); n.start(at); n.stop(at + len + 0.02);
      };
      // the sand sliding over as it tips past level: a soft rush made of many grains
      for (let k = 0; k < 46; k++) { const u = k / 46; grain(t + 0.35 + u * 0.4 + Math.random() * 0.03, 0.02 + Math.random() * 0.03, 2500 + Math.random() * 3500, 0.05 + 0.1 * Math.sin(u * Math.PI)); }
      // set down: a dull wooden knock, low and short
      const at = t + 1.05, n = noiseBurst(0.08), bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 520; bp.Q.value = 1.2;
      const kg = actx.createGain(); env(kg, at, 0.5, 0.002, 0.07); n.connect(bp).connect(kg).connect(sfxOut()); n.start(at); n.stop(at + 0.08);
      const o = actx.createOscillator(), og = actx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(190, at); o.frequency.exponentialRampToValueAtTime(140, at + 0.09);
      env(og, at, 0.28, 0.002, 0.1); o.connect(og).connect(sfxOut()); o.start(at); o.stop(at + 0.12);
      // the stream starting: a fine, dry trickle that fades away over a few seconds
      for (let k = 0; k < 70; k++) { const u = k / 70; grain(at + 0.15 + u * 3.2 + Math.random() * 0.05, 0.008 + Math.random() * 0.01, 5000 + Math.random() * 4000, 0.045 * (1 - u)); }
    } catch (e) { /* no sound available */ }
  }
  /** A soft glassy shimmer, for things that glow rather than burn. */
  function soundChime(up) {
    try {
      noiseBurst(0.01); const t = actx.currentTime;
      (up ? [1318, 1568, 1976, 2637] : [2637, 1976, 1568, 1318]).forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain(); o.type = "sine"; o.frequency.value = f;
        env(g, t + i * 0.07, 0.07, 0.01, 0.9); o.connect(g).connect(actx.destination); o.start(t + i * 0.07); o.stop(t + i * 0.07 + 1);
      });
    } catch (e) { /* no sound available */ }
  }
  /** Striking a match: the rough scratch along the box, the head flaring with a whoosh, a few crackles as it burns. */
  function soundLight() {
    try {
      noiseBurst(0.01); const t = actx.currentTime;
      const burst = (at, len, type, freq, q, peak) => {
        const sN = noiseBurst(len + 0.03), f = actx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
        const g = actx.createGain(); g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(peak, at + Math.min(0.006, len / 3)); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
        sN.connect(f).connect(g).connect(candleOut()); sN.start(at); sN.stop(at + len + 0.03);
      };
      // the scratch: a quick run of rough grains
      for (let k = 0; k < 7; k++) burst(t + k * 0.021 + Math.random() * 0.006, 0.018 + Math.random() * 0.012, "bandpass", 1800 + Math.random() * 1800, 1.1, 0.12 + k * 0.045);
      // the head catching: a bright hiss that opens up and settles into a soft roar
      const at = t + 0.17, n = noiseBurst(0.9), bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 0.6;
      bp.frequency.setValueAtTime(700, at); bp.frequency.exponentialRampToValueAtTime(2600, at + 0.05); bp.frequency.exponentialRampToValueAtTime(800, at + 0.6);
      const g = actx.createGain(); g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.55, at + 0.035); g.gain.exponentialRampToValueAtTime(0.12, at + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.85);
      n.connect(bp).connect(g).connect(candleOut()); n.start(at); n.stop(at + 0.9);
      const o = actx.createOscillator(), og = actx.createGain(); o.type = "sine";
      o.frequency.setValueAtTime(120, at); o.frequency.exponentialRampToValueAtTime(55, at + 0.12);
      og.gain.setValueAtTime(0.0001, at); og.gain.exponentialRampToValueAtTime(0.22, at + 0.01); og.gain.exponentialRampToValueAtTime(0.0001, at + 0.14);
      o.connect(og).connect(candleOut()); o.start(at); o.stop(at + 0.16);
      for (let k = 0; k < 4; k++) burst(at + 0.18 + Math.random() * 0.45, 0.006, "highpass", 3500, 0.7, 0.08 + Math.random() * 0.06);
    } catch (e) { /* no sound available */ }
  }

  /** Blow out or light the candle(s) of one ornament, with smoke rising from the wick. */
  function toggleFlame(el, out) {
    const svg = el.querySelector("svg");
    const od = D.ORNAMENTS[el.dataset.kind];
    if (od && od.toggle) { od.toggle(el, out); return; }
    if (el.classList.contains("soft")) { soundChime(!out); el.classList.toggle("lit", !out); return; }
    if (out) {
      soundBlow();
      el.classList.add("snuffing");
      el.querySelectorAll(".ornFlame").forEach((f, i) => {
        const x = +f.dataset.x, y = +f.dataset.y - 2;
        for (let k = 0; k < 2; k++) {
          const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
          const sw = k ? -1 : 1;
          p.setAttribute("d", `M${x} ${y} c${-5 * sw} -9 ${5 * sw} -16 0 -26 c${-5 * sw} -9 ${6 * sw} -17 ${1 * sw} -28 c${-4 * sw} -8 ${4 * sw} -15 ${-1 * sw} -24`);
          p.setAttribute("pathLength", "1"); p.setAttribute("class", "smoke");
          p.style.animationDelay = (0.18 + k * 0.25 + i * 0.05) + "s";
          svg.append(p); setTimeout(() => p.remove(), 3600);
        }
      });
      setTimeout(() => { el.classList.remove("lit", "snuffing"); el.classList.add("embers"); }, 420);
      setTimeout(() => el.classList.remove("embers"), 2200);
    } else {
      soundLight();
      el.classList.remove("embers", "snuffing");
      // the flame appears when the match flares, just after the scratch
      setTimeout(() => { el.classList.add("lit", "lighting"); setTimeout(() => el.classList.remove("lighting"), 700); }, 170);
    }
  }

  // ---------------------------------------------------------------- lights under each shelf
  const plankWidth = () => Math.min(innerWidth, 1200);
  // which lights hang under a shelf: each shelf picks its own in the ✦ menu (kept per look); until then it shows the look's.
  // several can be on at once, e.g. wisteria with fireflies drifting around it
  const NO_SWITCH = ["fireflies", "closetRod"]; // always alive, no cord needed
  const TALLEST = ["closetRod", "vampDrapes", "cottageLotus", "forestCatchers", "starCurtain", "loftCages", "loftSpider", "cabinSwags", "wisteria", "chinese", "candles", "lanterns", "globe", "stars", "fairy", "fireflies"];
  // the look's own lights; a save made before a look got its lights (cottage, vampire) still says "none"
  function lookLights() {
    const s = state.settings.lights || {}, L = D.LOOKS[lookId()], def = L && L.set && L.set.lights;
    return (!s.style || s.style === "none") && !Array.isArray(s.styles) && def && def.style && def.style !== "none" ? def : s;
  }
  function shelfLights(key) {
    const sd = shelfDecor(key), mine = (sd.lightsBy || {})[lookId()], base = lookLights();
    const pick = mine || base;
    let styles = Array.isArray(pick.styles) ? pick.styles : pick.style && pick.style !== "none" ? [pick.style] : [];
    if (!mine && sd.noLights) styles = [];
    // a look whose lights were redrawn swaps the old style for the new one, in old saves too
    const swap = (D.LIGHT_SWAP || {})[lookId()];
    if (swap) styles = [...new Set(styles.map((k) => swap[k] || k))];
    styles = styles.filter((k) => D.LIGHT_STYLES[k] && k !== "none");
    return { styles, colour: pick.colour || base.colour || "warm" };
  }
  function setShelfLights(key, patch) {
    const sd = shelfDecor(key), cur = shelfLights(key);
    setShelfDecor(key, { lightsBy: { ...(sd.lightsBy || {}), [lookId()]: { ...cur, ...patch } } });
  }
  function addLights(root) {
    const key = root.dataset.key, sd = shelfDecor(key);
    const base = lookLights(), L = shelfLights(key);
    // each shelf has its own switch; until it is pulled it follows the look's "on"
    const on = sd.lightsOn !== undefined ? sd.lightsOn : base.on !== false;
    root.querySelectorAll(".lights, .pullCord").forEach((e) => e.remove());
    const plank = root.querySelector(".plank");
    const els = L.styles.map((st) => D.lightsEl(plankWidth(), { style: st, colour: L.colour, on: NO_SWITCH.includes(st) ? true : on, room: lookId(), seed: key })).filter(Boolean);
    els.forEach((el) => plank.append(el));
    // how far the tallest hanging thing reaches (the closet's clothes), so the shelf's caption sits below it
    root.style.setProperty("--lights-h", Math.max(0, ...els.map((e) => parseFloat(e.style.height) || 0)) + "px");
    root.classList.toggle("hasLights", els.length > 0);
    root.dataset.lights = TALLEST.find((k) => L.styles.includes(k)) || "";
    if (!L.styles.some((k) => !NO_SWITCH.includes(k))) return;
    const cfg = { on };
    const cord = h(`<button class="pullCord" aria-label="Turn this shelf's lights ${cfg.on ? "off" : "on"}" aria-pressed="${!!cfg.on}"><i></i><b></b></button>`);
    cord.onclick = () => {
      if (cord.classList.contains("yank")) return;
      const on = cord.getAttribute("aria-pressed") !== "true";
      cord.classList.add("yank"); setTimeout(() => cord.classList.remove("yank"), 1000);
      soundPullSwitch(on);
      setShelfDecor(key, { lightsOn: on });
      // the switch catches at the bottom of the pull; only this shelf's string follows
      setTimeout(() => {
        root.querySelectorAll(".lights").forEach((l) => {
          if (l.classList.contains("fireflies") || l.classList.contains("closetRod")) return;
          l.classList.remove("switchOn", "switchOff"); void l.offsetWidth;
          l.classList.toggle("on", on); l.classList.add(on ? "switchOn" : "switchOff");
          clearTimeout(l._sw); l._sw = setTimeout(() => l.classList.remove("switchOn", "switchOff"), 1600);
        });
        cord.setAttribute("aria-pressed", on); cord.setAttribute("aria-label", `Turn this shelf's lights ${on ? "off" : "on"}`);
      }, 150);
    };
    plank.append(cord);
  }
  let lightsT = 0, lastW = innerWidth;
  addEventListener("resize", () => { if (innerWidth === lastW) return; lastW = innerWidth; clearTimeout(lightsT); lightsT = setTimeout(() => document.querySelectorAll(".shelf").forEach(addLights), 200); });

  // ---------------------------------------------------------------- the turning shelf
  const scrollMemory = new Map(); // section key -> front index
  function shelfEl(key, books, opts = {}) {
    const root = h(`<div class="shelf">
      <div class="scroller" tabindex="0" role="group" aria-roledescription="shelf"><div class="track"><div class="stage"></div></div></div>
      <div class="plank"></div>
      <div class="caption"></div></div>`);
    const scroller = root.querySelector(".scroller"), track = root.querySelector(".track"), stage = root.querySelector(".stage"), caption = root.querySelector(".caption");
    // things that hang from the shelf's front edge live outside the scroller, so they are not cut off
    const hangLayer = h(`<div class="hangLayer"></div>`); root.append(hangLayer);
    // cobwebs tucked under the shelf sit behind the caption, so its words stay readable and tappable over them
    const webLayer = h(`<div class="hangLayer webLayer"></div>`); root.append(webLayer);
    // v276: one light from the front and upper left, so every book and object throws a soft shadow up and to the right onto
    // the wall behind it. The layer is cut off at the line where the shelf floor meets the wall, so no shadow lies on the floor.
    const wallSh = h(`<div class="wallSh" aria-hidden="true"><div class="wsIn"></div></div>`), wsIn = wallSh.firstChild;
    root.querySelector(".stage").prepend(wallSh);
    const bookSh = [];
    // v288: real 3D books (Customize > Books > 3D); the flat books stay, invisible, as the thing you touch
    let b3d = null, topD = 0;
    // v293 (osamu chose the 3D test shelf's feel): in 3D a tap turns a book to you in place and the others slide aside; a swipe
    // just slides the row along. Each book eases on its own, as on the test shelf.
    const is3dMode = !!(state.settings.books3d && window.Books3D);
    let pick = -1, anim3 = 0, follow3 = false;
    const op3 = [];
    if (is3dMode) root.classList.add("pick3d");
    function step3() {
      let moving = false;
      for (let i = 0; i < count; i++) {
        const target = i === pick ? 1 : 0, v = op3[i] || 0;
        if (v === target) continue;
        let nv = v + (target - v) * 0.14; if (Math.abs(target - nv) < 0.002) nv = target;
        op3[i] = nv; moving = true;
      }
      layout();
      anim3 = moving ? requestAnimationFrame(step3) : 0;
      if (!moving) follow3 = false;
    }
    function pick3(i) {
      if (i >= count || (i >= 0 && !books[i]) || (i >= 0 && lyingAt(i))) return;
      pick = i; userMoved = true; follow3 = true;
      if (!anim3) anim3 = requestAnimationFrame(step3);
    }
    if (state.settings.books3d && window.Books3D) {
      // the flat books only hide once the 3D ones are really there; if 3D can't start on this device, the flat ones stay
      window.Books3D.whenReady(() => {
        try {
          window.Books3D.sweep();
          b3d = window.Books3D.create(stage, { tint: document.documentElement.dataset.bdk === "closet" ? "#1c0010" : "#000000" });
          root.classList.add("is3d");
        } catch (e) { console.warn("3D books could not start", e); b3d = null; root.classList.remove("is3d"); }
        requestAnimationFrame(() => layout());
      });
    }
    let sh3 = null; // v294: in 3D, objects' wall shadows follow the 3D light
    const shOff = () => (sh3 ? { x: sh3.x, y: sh3.y } : { x: H * 0.025, y: 0 }); // v280: osamu's picture: wide, soft, to the right, starting at the book's foot
    root.dataset.key = key;
    addLights(root);
    const count = books.length + (opts.onAdd ? 1 : 0);
    let H = 246, STEP = 103, viewW = 0, PAD = 16, front = -1, raf = 0;
    // one step of empty scroll before the first book and after the last: swiping past either end turns that book back, spine out
    // panX: how far two fingers have slid the row by hand, without turning any book
    let panX = 0, curOffset = 0, twoF = null, panEase = 0;
    const lyingAt = (i) => !!(books[i] && books[i].pose === "lie");
    // the nearest upright book from i, looking in direction dir first (lying books are skipped)
    function uprightNear(i, dir = 1) {
      for (let k = 0; k < count; k++) for (const j of [i + dir * k, i - dir * k]) if (j >= 0 && j < count && !lyingAt(j)) return j;
      return -1;
    }
    const slots = [], bookNodes = [];
    // decorations stand in the row between books and get pushed along when a book turns.
    // hold one to lift it and move it anywhere on the shelf, or onto the bin to take it away.
    const shelfIdx = opts.idx || 0;
    let items = decorItems(key).map((it) => ({ ...it }));
    let orns = []; // { it, el, w, idx, x, t }
    let bookPos = []; // left edge of each slot as last laid out
    let drag = null;
    let pileSpans = [], pileTops = []; // where each pile of lying books is, as last laid out
    let userMoved = false; // books only make a sound when you move them, not when the page lays out
    books.forEach((b, i) => {
      const slot = h(`<button type="button" class="slot" tabindex="-1"></button>`);
      // a lying book is never picked by swiping; a tap just opens it
      slot.onclick = () => (i === front || b.pose === "lie" ? openBook(b.id) : is3dMode ? pick3(i) : goTo(i));
      stage.append(slot); slots.push(slot);
    });
    if (opts.onAdd) {
      const add = h(`<button type="button" class="slot addSlot" tabindex="-1" aria-label="Add a book">+</button>`);
      add.onclick = opts.onAdd; stage.append(add); slots.push(add);
    }

    function build() {
      viewW = scroller.clientWidth;
      PAD = Math.max(8, root.getBoundingClientRect().left - scroller.getBoundingClientRect().left);
      H = viewW < 560 ? 196 : 246;
      STEP = Math.round(H * 0.42);
      root.style.setProperty("--shelf-h", H + "px");
      track.style.width = (count + 1) * STEP + viewW + "px";
      stage.style.width = viewW + "px";
      track.querySelectorAll(".snap").forEach((n) => n.remove());
      for (let i = 0; i <= count + 1 && !is3dMode; i++) { if (lyingAt(i - 1)) continue; const s = h(`<span class="snap"></span>`); s.style.left = i * STEP + "px"; track.prepend(s); }
      books.forEach((b, i) => {
        const node = bookEl(b, H); bookNodes[i] = node;
        slots[i].replaceChildren(node, h(`<span class="nbSh" aria-hidden="true"></span>`), h(`<span class="depSh" aria-hidden="true"></span>`), h(`<span class="ftSh" aria-hidden="true"></span>`));
        slots[i].style.height = dims(b, H).h + "px";
        slots[i].setAttribute("aria-label", b.title);
      });
      if (opts.onAdd) slots[books.length].style.height = Math.round(H * 0.86) + "px";
      wsIn.querySelectorAll(".wsB").forEach((n) => n.remove()); bookSh.length = 0;
      books.forEach((b, i) => { const s = h(`<span class="wsB"></span>`); wsIn.append(s); bookSh[i] = s; });
      const plank = root.querySelector(".plank");
      hangLayer.style.left = scroller.offsetLeft + "px"; hangLayer.style.top = plank.offsetTop + "px"; hangLayer.style.width = viewW + "px";
      webLayer.style.cssText = hangLayer.style.cssText;
      buildOrns();
      buildWebs();
    }

    // the witch's tower gathers cobwebs where nothing is ever moved: tucked up under the shelf in its corners, never on
    // a book or an object. Each one is spun from its own seed, so no two match. A tap brushes one away.
    let webs = [];
    function buildWebs() {
      webs.forEach((w) => w.el.remove()); webs = [];
      if (lookId() !== "witch" || !window.ShelfWebs) return;
      const W = window.ShelfWebs, top = Math.max(0, (root.querySelector(".plank") || {}).offsetHeight - 1 || 0);
      const hk = hash([...key].reduce((s, c) => s * 31 + c.charCodeAt(0), 7) >>> 0);
      // every shelf has at least one corner web; most have both
      const left = hk % 5 !== 3, right = !left || hk % 7 !== 2;
      const put = (el, x) => { if (!el) return; if (x === "right") { el.style.left = "auto"; el.style.right = "0"; } else el.style.left = typeof x === "number" ? Math.round(x) + "px" : x; el.style.top = top + "px"; webLayer.append(el); webs.push({ el, hang: true }); };
      if (left) { const w = 46 + (hk % 23), hh = 38 + ((hk >> 3) % 22); put(W.make(`${key}:cl`, "ceiling", w, hh, false), 0); }
      if (right) { const w = 44 + ((hk >> 5) % 25), hh = 36 + ((hk >> 7) % 24); put(W.make(`${key}:cr`, "ceiling", w, hh, true), "right"); }
    }

    function idxOf(it) {
      if (it.after == null) return 0;
      if (it.after === "end") return books.length;
      if (it.after === "mid") return Math.ceil(books.length / 2);
      const i = books.findIndex((b) => b.id === it.after);
      return i < 0 ? books.length : i + 1;
    }
    function buildOrns() {
      orns.forEach((o) => { o.el.remove(); if (o.sh) o.sh.remove(); });
      orns = [];
      if (!books.length) return;
      items.forEach((it) => { const o = makeOrn(it); if (o) orns.push(o); });
      sortOrns();
    }
    function makeOrn(it) {
        const kind = resolveKind(it.kind, shelfIdx);
        const el = kind && D.ornamentEl(kind, H, (D.ORNAMENTS[kind] || {}).startOff ? it.lit === true : it.on !== false);
        if (!el) return null;
        const hang = !!D.ORNAMENTS[kind].hang, vis = parseFloat(el.style.width);
        // a hanging thing takes no room in the row: it hangs at the gap between two books
        const o = { it, el, hang, vis, w: hang ? 0 : vis + 10, idx: idxOf(it), x: null, t: 0 };
        el.onclick = (e) => {
          if (el._noClick) { el._noClick = false; return; }
          e.stopPropagation();
          const od = D.ORNAMENTS[kind];
          if (od && od.hourglass) { if (D.hourglassFlip(el)) soundHourglass(); return; }
          // an object that does nothing stays still when tapped; only hanging clothes swing
          if (od && od.still) { if (hang) { el.classList.remove("nudge"); void el.offsetWidth; el.classList.add("nudge"); } return; }
          if (el.classList.contains("snuffing")) return;
          it.on = !el.classList.contains("lit"); if (D.ORNAMENTS[kind].startOff) it.lit = it.on;
          toggleFlame(el, !it.on);
          saveItems();
        };
        armDrag(o);
        (hang ? hangLayer : stage).append(el);
        // its wall shadow: the same object, unlit, turned into a soft dark silhouette behind it
        if (!hang) { const sh = D.ornamentEl(kind, H, false); if (sh) { sh.classList.add("wsO"); sh.removeAttribute("id"); wsIn.append(sh); o.sh = sh; } }
        return o;
    }
    // keep the stored order the same as the order on the shelf
    const sortOrns = () => { orns = orns.map((o, k) => [o, k]).sort((a, b) => a[0].idx - b[0].idx || a[1] - b[1]).map((p) => p[0]); root.classList.toggle("hasHang", orns.some((o) => o.hang)); };
    function saveItems() {
      items = orns.map((o) => o.it);
      setDecorItems(key, items);
    }

    // ---- hold to lift, then drag
    function armDrag(o) {
      const el = o.el;
      el.addEventListener("contextmenu", (e) => e.preventDefault());
      el.addEventListener("touchmove", (e) => { if (drag && drag.o === o) e.preventDefault(); }, { passive: false });
      el.addEventListener("pointerdown", (e) => {
        if (drag || (e.pointerType === "mouse" && e.button !== 0)) return;
        const sx = e.clientX, sy = e.clientY, id = e.pointerId;
        let timer = setTimeout(() => start(e), 380);
        const cancel = () => { clearTimeout(timer); timer = 0; off(); };
        const pre = (ev) => { if (ev.pointerId === id && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) cancel(); };
        const off = () => { el.removeEventListener("pointermove", pre); el.removeEventListener("pointerup", cancel); el.removeEventListener("pointercancel", cancel); };
        el.addEventListener("pointermove", pre); el.addEventListener("pointerup", cancel); el.addEventListener("pointercancel", cancel);
        function start(ev) {
          off(); if (!el.isConnected) return;
          try { el.setPointerCapture(id); } catch {}
          const r = el.getBoundingClientRect();
          // a copy follows the finger above everything; the real one keeps its gap in the row
          const ghost = el.cloneNode(true);
          ghost.classList.add("ornGhost"); ghost.onclick = null;
          ghost.style.transform = `translate3d(${r.left}px,${r.top}px,0)`;
          document.body.append(ghost);
          try {
            const oa = el.getAnimations({ subtree: true }), ga = ghost.getAnimations({ subtree: true });
            if (oa.length === ga.length) ga.forEach((a, k) => { if (oa[k].currentTime != null) a.currentTime = oa[k].currentTime; });
          } catch {}
          requestAnimationFrame(() => ghost.classList.add("up"));
          drag = { o, id, ghost, gx: sx - r.left, gy: sy - r.top, cx: sx, cy: sy, raf: 0, over: false };
          root.classList.add("arranging"); el.classList.add("placeholder");
          if (navigator.vibrate) navigator.vibrate(12);
          document.body.classList.add("arrangingDecor");   // no drop-to-remove: the bin only offers "Tap to remove" after letting go
          const move = (m) => { if (m.pointerId !== id) return; drag.cx = m.clientX; drag.cy = m.clientY; dragFrame(); };
          const end = (m) => {
            if (m.pointerId !== id) return;
            el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", end); el.removeEventListener("pointercancel", end);
            el._noClick = true; setTimeout(() => (el._noClick = false), 400);
            drop(m.type === "pointercancel");
          };
          el.addEventListener("pointermove", move); el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
          const tick = () => { if (!drag) return; autoScroll(); drag.raf = requestAnimationFrame(tick); };
          drag.raf = requestAnimationFrame(tick);
          dragFrame();
        }
      });
    }
    function autoScroll() {
      const r = scroller.getBoundingClientRect(), edge = 46;
      let v = 0;
      if (drag.cx < r.left + edge) v = -(r.left + edge - drag.cx) / edge;
      else if (drag.cx > r.right - edge) v = (drag.cx - (r.right - edge)) / edge;
      if (v) { scroller.scrollLeft += Math.max(-1, Math.min(1, v)) * 9; dragFrame(); }
    }
    function dragFrame() {
      const o = drag.o, sr = stage.getBoundingClientRect();
      const left = drag.cx - sr.left - drag.gx, mid = left + o.vis / 2;
      // the gap goes before the first book whose middle is still to the right of the object
      let idx = 0, top = false;
      // held over a pile it goes on top; beside a pile it stands on the shelf
      const pile = o.hang ? null : pileSpans.find((p) => p.L != null && mid > p.L + 3 && mid < p.R - 3);
      if (pile) { idx = pile.e + 1; top = true; }
      else {
        for (let i = 0; i < books.length; i++) if (bookPos[i] != null && bookPos[i].c < mid) idx = i + 1;
        const p = pileSpans.find((p) => idx > p.s && idx <= p.e);
        if (p) idx = mid < (p.L + p.R) / 2 ? p.s : p.e + 1;
      }
      if (idx !== o.idx || top !== o.it.top) { o.idx = idx; o.it.top = top; sortOrns(); }
      layout();
      // it slides along the shelf and never leaves it: only the finger's x moves it, and it stands where it would land
      const y = o.el.getBoundingClientRect().top;
      drag.ghost.style.transform = `translate3d(${drag.cx - drag.gx}px,${y}px,0)`;
    }
    function drop(cancelled) {
      const o = drag.o, ghost = drag.ghost; cancelAnimationFrame(drag.raf);
      const remove = drag.over && !cancelled;
      drag = null; showBin(false);
      ghost.classList.remove("up", "binning");
      if (remove) {
        ghost.classList.add("vanish");
        orns = orns.filter((x) => x !== o); o.el.remove(); if (o.sh) o.sh.remove(); sortOrns();
        setTimeout(() => ghost.remove(), 320);
        if (navigator.vibrate) navigator.vibrate(8);
      } else {
        o.it.after = o.idx === 0 ? null : o.idx >= books.length ? "end" : books[o.idx - 1].id;
        if (!cancelled) askBin(() => {
          if (!orns.includes(o)) return;
          o.el.style.pointerEvents = "none";
          const an = o.el.animate([{ opacity: 1, scale: 1 }, { opacity: 0, scale: 0.6 }], { duration: 260, easing: "ease-in" });
          an.onfinish = () => { orns = orns.filter((x) => x !== o); o.el.remove(); if (o.sh) o.sh.remove(); sortOrns(); saveItems(); layout(); };
          if (navigator.vibrate) navigator.vibrate(8);
        });
      }
      saveItems();
      layout();
      if (!remove) {
        // the copy glides down into its gap, then the real one takes over
        const sr = stage.getBoundingClientRect(), h = parseFloat(o.el.style.height);
        const top = o.el.getBoundingClientRect().top;
        ghost.classList.add("settle");
        ghost.style.transform = `translate3d(${sr.left + o.x}px,${top}px,0)`;
        setTimeout(() => { o.el.classList.remove("placeholder"); ghost.remove(); o.el.classList.add("landed"); setTimeout(() => o.el.classList.remove("landed"), 360); }, 300);
      }
      setTimeout(() => root.classList.remove("arranging"), 320);
    }

    function layout() {
      if (!viewW) return;
      const g = is3dMode ? pick : Math.max(-1, Math.min(count, scroller.scrollLeft / STEP - 1)); // -1 and count: every book spine out
      const f = Math.max(0, Math.min(count - 1, g));
      // each book: how open it is (0 spine out, 1 turned to show its cover), its width as seen, and its pose
      const opens = [], base = [], poses = [], dm = [];
      for (let i = 0; i < count; i++) {
        const b = books[i];
        const o = Math.max(0, Math.min(1, 1 - Math.abs(i - g)));
        // a book lying in a pile stays lying when it is picked; only upright books turn to show their cover
        const open = b && b.pose === "lie" ? 0 : is3dMode ? op3[i] || 0 : o * o * (3 - 2 * o);
        opens.push(open);
        if (!b) { base.push(30); poses.push("stand"); dm.push(null); continue; }
        const D_ = dims(b, H), a = ((1 - open) * Math.PI) / 2;
        dm.push(D_);
        base.push(D_.w * Math.cos(a) + D_.d * Math.sin(a));
        poses.push(b.pose === "lean" || b.pose === "lie" ? b.pose : "stand");
      }
      // an object right after a lying book sits on top of that pile instead of taking room in the row
      // lying books next to each other make one pile; objects never split it
      const groups = []; // {start, end} of piles
      for (let i = 0; i < books.length; i++) {
        if (poses[i] !== "lie") continue;
        const g = groups[groups.length - 1];
        if (g && g.end === i - 1) g.end = i; else groups.push({ start: i, end: i });
      }
      const groupOf = new Map(); groups.forEach((g) => { for (let i = g.start; i <= g.end; i++) groupOf.set(i, g); });
      // an object sits on top of a pile when it was put there (it.top); one placed after a lying book before
      // this choice existed stays on top too. Anything else stands on the shelf beside the pile.
      const onPile = new Set(), pileOrns = new Map(); // group -> objects on it
      for (const o of orns) {
        if (o.hang || o.idx < 1) continue;
        const g = groupOf.get(o.idx - 1);
        if (!g) continue;
        const inside = o.idx - 1 < g.end; // between two books of the pile: it can only be on top
        if (inside || o.it.top === true || (o.it.top === undefined && o.idx - 1 === g.end)) {
          onPile.add(o); if (!pileOrns.has(g)) pileOrns.set(g, []); pileOrns.get(g).push(o);
        }
      }
      const LEAN = (16 * Math.PI) / 180;
      // each leaning book settles at its own angle, between about 11 and 19 degrees
      const leanA = (i) => LEAN * (0.7 + (hash((+books[i].id || i) * 13 + 5) % 6) * 0.1);
      // how much room each book takes in the row
      const widths = [];
      for (const g of groups) {
        g.S = 0; g.extra = 0;
        for (let i = g.start; i <= g.end; i++) { g.S = Math.max(g.S, dm[i].h * (1 - opens[i])); g.extra += opens[i] * (base[i] + 8); }
        g.n = g.end - g.start + 1;
      }
      // a leaning book rests where it really touches its neighbour: against its side if the neighbour is tall enough,
      // otherwise on the neighbour's top corner, so it never hangs in the air or sinks into the next book
      const PILE_GAP = 1 + H * 0.008; // v280: books touch, as in osamu's reference
      // a standing book's spine is nearer to you than its box, so it reaches a little lower on the shelf; lying books
      // are set down by the same amount so the pile stands on the same floor line instead of floating above it
      const SINK = 0; // v280: with the far eye (v279) a standing spine no longer reaches lower than its box, so piles sit on the same line // a lying book looks a little longer than its box (its near face is closer to you)
      // v274 (osamu's mockups): a book leans onto a STANDING neighbour, as on a real shelf: the one on its left if that
      // stands, else the one on its right; only when neither stands does it rest on a pile or another leaning book
      const stands = (j) => j >= 0 && j < count && dm[j] && poses[j] === "stand";
      const leanLeft = [];
      for (let i = 0; i < count; i++) leanLeft[i] = stands(i - 1) ? true : stands(i + 1) ? false : i > 0;
      const leanFoot = (i) => {
        const p = leanA(i) * (1 - opens[i]), h_ = dm[i].h, j = leanLeft[i] ? i - 1 : i + 1;
        let hn = h_;
        if (j >= 0 && j < count && dm[j]) hn = groupOf.has(j) ? groupHeight(groupOf.get(j)) : poses[j] === "lean" ? dm[j].h * Math.cos(leanA(j) * (1 - opens[j])) : dm[j].h;
        return Math.min(h_ * Math.sin(p), Math.max(0, hn - 2) * Math.tan(p));
      };
      function groupHeight(g) { let y = 0; for (let k = g.start; k <= g.end; k++) y += dm[k].d * (1 - opens[k]); return y; }
      const feet = [];
      for (let i = 0; i < count; i++) {
        if (groupOf.has(i)) { const g = groupOf.get(i); widths.push((g.S + PILE_GAP * 2) / g.n + opens[i] * (base[i] + 8)); continue; }
        if (poses[i] === "lean") { const p = leanA(i) * (1 - opens[i]); feet[i] = leanFoot(i); widths.push(base[i] * Math.cos(p) + feet[i] + 1); continue; }
        widths.push(base[i]);
      }
      const ornW = (o) => (onPile.has(o) ? 0 : o.w);
      // the row stays put; it only slides when it is wider than the screen
      const fl = Math.floor(f);
      let openAt = 0; for (let i = 0; i < fl; i++) openAt += widths[i];
      openAt += (f - fl) * (widths[fl] || 0);
      // the open point passes over each decoration gradually, so the row never jumps
      let ornTotal = 0;
      for (const o of orns) { openAt += ornW(o) * Math.max(0, Math.min(1, f - (o.idx - 1))); ornTotal += ornW(o); }
      const total = widths.reduce((s, v) => s + v, 0) + ornTotal;
      const maxOff = Math.max(0, total - (viewW - PAD * 2));
      // over the last step of the scroll the row slides on until the last object is in view, so objects standing after
      // the last book can always be reached without the row scrolling past the end of the shelf
      const endT = Math.max(0, Math.min(1, g - (count - 1)));
      let off0 = Math.max(0, Math.min(maxOff, openAt - viewW * 0.3)); off0 += (maxOff - off0) * endT;
      let offset;
      if (is3dMode) {
        // the row is as wide to scroll as it is long, so a swipe moves it under your finger
        const tw = Math.round(viewW + maxOff); if (Math.abs(parseFloat(track.style.width) - tw) > 1) track.style.width = tw + "px";
        offset = Math.max(0, Math.min(maxOff, scroller.scrollLeft));
      } else offset = Math.max(0, Math.min(maxOff, off0 + panX));
      panX = is3dMode ? 0 : offset - off0; curOffset = offset;
      let x = 0, k = 0;
      const placeOrn = (o, lift = 0, cx = null) => {
        const left = cx != null ? cx - o.vis / 2 : o.hang ? PAD + x - offset - o.vis / 2 : PAD + x - offset + 5;
        if (cx == null) x += o.w;
        o.el.style.transform = `translate3d(${left.toFixed(1)}px,${(-lift).toFixed(1)}px,0)`; o.lift = lift; o.left = left;
        if (o.sh) { const so = shOff(); o.sh.style.transform = `translate3d(${(left + so.x).toFixed(1)}px,${(so.y - lift).toFixed(1)}px,0)`; }
        o.el.classList.toggle("onPile", cx != null);
        // a flame leans away from the way it is being pushed, then settles
        if (o.x !== null && Math.abs(left - o.x) > 0.3 && !root.classList.contains("arranging")) {
          const lean = Math.max(-30, Math.min(30, -(left - o.x) * 6));
          o.el.style.setProperty("--lean", lean.toFixed(1) + "deg");
          clearTimeout(o.t); o.t = setTimeout(() => o.el.style.setProperty("--lean", "0deg"), 140);
        }
        o.x = left;
      };
      const pileAt = new Map(); // group -> { L, top }
      for (let i = 0; i < count; i++) {
        while (k < orns.length && orns[k].idx <= i) { const o = orns[k++]; if (!onPile.has(o)) placeOrn(o); }
        const left = PAD + x - offset; x += widths[i];
        bookPos[i] = { l: left, c: left + widths[i] / 2 };
        const slot = slots[i];
        const vis = left + widths[i] > -120 && left < viewW + 120;
        slot.style.visibility = vis ? "visible" : "hidden";
        const sh = bookSh[i];
        if (sh) sh.style.visibility = slot.style.visibility;
        if (!vis && !groupOf.has(i)) continue;
        slot.style.width = base[i] + "px";
        const pose = poses[i], open = opens[i];
        if (groupOf.has(i)) {
          // in a pile: lying on the books below it; while it is chosen it stands up beside the pile and turns its cover to you
          const g = groupOf.get(i);
          if (i === g.start) { g.L = left; g.y = -SINK; g.ex = 0; }
          const h_ = dm[i].h, d_ = dm[i].d, jit = ((hash(books[i].id) % 7) - 3) * H * 0.01;
          // lying books keep a small gap from the books either side and never stick out past the pile
          const lyX = Math.max(g.L + PILE_GAP, Math.min(g.L + PILE_GAP + g.S - h_, g.L + PILE_GAP + (g.S - h_) / 2 + jit)), lyY = g.y;
          const stX = g.L + g.S + PILE_GAP * 2 + g.ex + 4;
          g.y += d_ * (1 - open); g.ex += open * (base[i] + 8);
          // centre of the book lying down and standing up, then the slot is moved and turned about its centre
          const W = base[i], cxL = lyX + h_ / 2, cyL = lyY + W / 2, cxS = stX + W / 2, cyS = h_ / 2;
          const cx = cxL + (cxS - cxL) * open, cy = cyL + (cyS - cyL) * open;
          slot.style.transformOrigin = "50% 50%";
          slot.style.transform = `translate3d(${(cx - W / 2).toFixed(1)}px,${(h_ / 2 - cy).toFixed(1)}px,0) rotate(${(-90 * (1 - open)).toFixed(2)}deg)`;
          slot.classList.add("lying");
          if (i === g.end) pileAt.set(g, { cx: lyX + h_ / 2, top: g.y, x: lyX, w: h_, c: books[i].spineColor });
        } else if (pose === "lean") {
          // resting on its bottom corner with its top against the neighbour; it straightens up as it turns to you
          // the spine's near face looks a little taller than the box, so a tilted book is lifted by that much: its
          // corner then sits on the shelf instead of sinking into it and being cut off flat
          const p = leanA(i) * (1 - open), W = base[i], toLeft = leanLeft[i], foot = feet[i] || 0, up = 0;
          if (toLeft) { slot.style.transformOrigin = "0 100%"; slot.style.transform = `translate3d(${(left + 1 + foot).toFixed(1)}px,${up}px,0) rotate(${(-p * 180 / Math.PI).toFixed(2)}deg)`; }
          else { slot.style.transformOrigin = "100% 100%"; slot.style.transform = `translate3d(${(left + W * Math.cos(p) - W).toFixed(1)}px,${up}px,0) rotate(${(p * 180 / Math.PI).toFixed(2)}deg)`; }
          slot.classList.remove("lying");
        } else {
          // v280 (osamu's reference): not every book is pushed in to the same depth. A book set further back stands a little higher
          // on the floor (seen from above) and sits in the shade of its neighbours
          const rec = [0, 0, 1, 0, 2, 0, 1][hash((+books[i].id || i) * 7 + 3) % 7] * (1 - open);
          slot.style.setProperty("--rec", (rec / 2).toFixed(2));
          slot.style.transformOrigin = "";
          slot.style.transform = `translate3d(${left}px,0,0)`; // v282: every foot on the same line, as in osamu's picture
          slot.classList.remove("lying");
        }
        // v284: a crevice is only drawn where a book really touches a standing neighbour; at the row's ends, beside a pile or an
        // object it showed as a loose grey strip next to the book
        {
          const lean = poses[i] === "lean" && !groupOf.has(i);
          slot.classList.toggle("lean", lean);
          // a leaning book meets its neighbour only at the top, so neither gets a crevice down that side
          const touch = j => !lean && j >= 0 && j < count && !groupOf.has(j) && poses[j] !== "lean" && !orns.some(o => !o.hang && o.idx === Math.max(i, j));
          slot.style.setProperty("--cl", touch(i - 1) ? 1 : 0); slot.style.setProperty("--cr", touch(i + 1) ? 1 : 0);
          if (bookNodes[i]) slot.style.setProperty("--tP", bookNodes[i].style.getPropertyValue("--tP") || "3px");
          if (dm[i]) slot.style.setProperty("--fsag", (dm[i].d * (books[i].binding === "paper" ? .05 : .13)).toFixed(1) + "px");
        }
        if (bookNodes[i]) bookNodes[i].style.setProperty("--turn", 1 - open);
        // v277: the book on the left throws its shadow onto this one too, on its left side and only below that book's height
        // (a little lower, as the light comes from above); in a pile each book shades the one under it along the seam
        const nb = slot.querySelector(".nbSh");
        if (nb && dm[i]) {
          let a = 0, top = 0, ts = 0;
          if (groupOf.has(i)) { const g = groupOf.get(i); a = i < g.end ? (1 - open) * (1 - opens[i + 1]) : 0; }
          else if (i > 0 && dm[i - 1]) {
            const j = i - 1, hL = groupOf.has(j) ? groupHeight(groupOf.get(j)) : poses[j] === "lean" ? dm[j].h * Math.cos(leanA(j) * (1 - opens[j])) : dm[j].h;
            top = Math.max(0, dm[i].h - (hL - shOff().y));
            a = top < dm[i].h - 4 ? (1 - open) * (1 - opens[j]) : 0;
            // v283: a taller book on the left also shades the near side of this one's top
            ts = hL > dm[i].h + 2 ? Math.min(1, (hL - dm[i].h) / (H * 0.08)) * (1 - open) * (1 - opens[j]) : 0;
          }
          if (bookNodes[i]) bookNodes[i].style.setProperty("--tsh", ts.toFixed(2));
          // v287: shading from the very top reaches up over the visible page top too, so it has no straight edge across the head
          nb.style.top = top < 0.5 && !groupOf.has(i) ? "calc(3px - var(--tP, 3px))" : top.toFixed(1) + "px"; nb.style.opacity = a.toFixed(2);
        }
        if (sh && dm[i]) {
          const so = shOff();
          sh.style.width = base[i] + "px"; sh.style.height = (slot.classList.contains("lying") ? dm[i].h : dm[i].h - H * 0.05) + "px";
          sh.style.transformOrigin = slot.style.transformOrigin;
          sh.style.transform = `translate(${so.x.toFixed(1)}px,${so.y.toFixed(1)}px) ` + slot.style.transform;
          sh.classList.toggle("lying", slot.classList.contains("lying"));
        }
      }
      while (k < orns.length) { const o = orns[k++]; if (!onPile.has(o)) placeOrn(o); }
      // the top cover of each pile, seen a little from above, so things have a surface to stand on
      const TOPF = Math.max(6, Math.round(H * 0.036));
      groups.forEach((g, n) => {
        const p = pileAt.get(g);
        let el = pileTops[n];
        if (!el) { el = h(`<span class="pileTop"></span>`); stage.append(el); pileTops[n] = el; }
        if (!p) { el.hidden = true; return; }
        el.hidden = false;
        el.style.cssText = `width:${p.w.toFixed(1)}px;height:${TOPF}px;--c:${p.c};transform:translate3d(${p.x.toFixed(1)}px,${(-p.top).toFixed(1)}px,0)`;
      });
      pileTops.splice(groups.length).forEach((el) => el.remove());
      // objects on a pile stand on its top cover, side by side if there are several, and never past its edges
      for (const g of groups) {
        const p = pileAt.get(g), list = pileOrns.get(g) || [];
        if (!p) continue;
        const tw = list.reduce((s, o) => s + o.vis + 4, -4);
        let cx = Math.max(p.x, Math.min(p.x + p.w - tw, p.cx - tw / 2));
        for (const o of list) { placeOrn(o, p.top, cx + o.vis / 2); cx += o.vis + 4; }
      }
      pileSpans = groups.map((g) => ({ s: g.start, e: g.end, L: g.L, R: g.L + g.S + PILE_GAP * 2 }));
      // while a book turns, the row slides just enough to keep it in view
      if (is3dMode && follow3 && pick >= 0 && bookPos[pick]) {
        const l = bookPos[pick].l, r = l + widths[pick];
        let dx = 0; if (r > viewW - PAD) dx = r - (viewW - PAD); if (l - dx < PAD) dx = l - PAD;
        if (Math.abs(dx) > 0.5) scroller.scrollLeft = Math.max(0, Math.min(maxOff, offset + dx));
      }
      if (b3d) {
        if (!topD) topD = parseFloat(getComputedStyle(root).getPropertyValue("--top-d")) || 30;
        const items = [];
        for (let i = 0; i < books.length; i++) {
          const b = books[i], slot = slots[i], D_ = dm[i];
          if (!b || !D_) continue;
          const m = new DOMMatrix(slot.style.transform || "none");
          const to = (slot.style.transformOrigin || "50% 50%").split(" ").map((v) => parseFloat(v) / 100);
          const fk = FONTS[b.spineFont] ? b.spineFont : FONTS[state.settings.spineFont] ? state.settings.spineFont : "classic";
          items.push({ id: b.id, h: D_.h, w: D_.w, d: D_.d, base: base[i], open: opens[i], A: [m.a, m.b, m.c, m.d, m.e, m.f],
            ox: base[i] * (isNaN(to[0]) ? 0.5 : to[0]), oy: D_.h * (isNaN(to[1]) ? 0.5 : to[1]),
            rec: parseFloat(slot.style.getPropertyValue("--rec") || 0) * 2, visible: slot.style.visibility !== "hidden",
            color: b.spineColor, spineUrl: spineUrl(b), coverUrl: b.coverUrl || null, ink: spineInk(b.spineColor), font: FONTS[fk],
            title: b.title, author: b.author, hard: b.binding !== "paper", glossy: b.finish === "glossy" });
        }
        try {
          // the objects standing on the shelf cast real shadows too: each one's silhouette, where it stands
          const objs = [];
          for (const o of orns) {
            if (o.hang || o.left == null || !o.el.isConnected) continue;
            const kind = o.el.dataset.kind, img = maskFor(kind, H, () => requestAnimationFrame(() => layout()));
            if (!img) continue;
            if (!o.box || o.box.H !== H) {
              const svg = o.el.querySelector("svg"); if (!svg) continue;
              const r = svg.getBoundingClientRect(), sr = stage.getBoundingClientRect();
              if (!r.width) continue;
              o.box = { H, dx: r.left - sr.left - o.left, db: sr.bottom - r.bottom - (o.lift || 0), w: r.width, h: r.height };
            }
            objs.push({ id: o.it.id, img, x: o.left + o.box.dx, y: o.box.db + (o.lift || 0), w: o.box.w, h: o.box.h, visible: !o.el.classList.contains("placeholder") });
          }
          const fl = b3d.sync(items, { stageH: stage.clientHeight, viewW, H, topD, objs });
          // the painted shelf floor is stretched to the 3D floor's depth, so the real shadows land on it in the right place
          if (fl) {
            const cur = root.style.getPropertyValue("--top-d"), want = fl.depth.toFixed(1) + "px";
            if (cur !== want) { root.style.setProperty("--top-d", want); root.style.setProperty("--b3off", fl.below.toFixed(1) + "px"); topD = fl.depth; }
            const nsh = { x: fl.shX, y: fl.shY };
            if (!sh3 || Math.abs(sh3.x - nsh.x) > 0.5 || Math.abs(sh3.y - nsh.y) > 0.5) { sh3 = nsh; requestAnimationFrame(() => layout()); }
          }
        }
        catch (e) { console.warn("3D books failed", e); b3d.dispose(); b3d = null; root.classList.remove("is3d"); }
      }
      let n = Math.round(g); if (n < 0 || n > count - 1) n = -1; n = Math.min(n, books.length - 1);
      if (n >= 0 && lyingAt(n)) n = front; // passing over a lying book picks nothing and makes no sound
      if (n !== front) { if (front >= 0 && !drag && userMoved) soundBookSlide(); front = n; if (n >= 0) scrollMemory.set(key, n); slots.forEach((s, i) => s.classList.toggle("front", i === n)); drawCaption(); }
    }

    function drawCaption() {
      const b = books[front];
      caption.replaceChildren();
      if (!b && books.length) { caption.append(h(`<span class="hint">${is3dMode ? "Tap a book to turn it to you" : "Swipe to pick a book"}</span>`)); return; }
      if (!b) { caption.append(h(`<span class="hint">${esc(opts.empty || "Add a book to start this shelf.")}</span>`)); return; }
      const main = h(`<button type="button" class="capMain"><span class="capTitle">${esc(b.title)}</span><span class="capMeta"><span>${esc(b.author)}</span></span></button>`);
      if (b.rating) main.querySelector(".capMeta").append(starsEl(b.rating, null, 12));
      main.onclick = () => openBook(b.id);
      caption.append(main);
      if (b.hasEpub && window.ShelfReader) {
        const rd = h(`<button type="button" class="readPill" aria-label="Read ${esc(b.title)}">${b.readPct ? Math.round(b.readPct * 100) + "% · " : ""}Read</button>`);
        rd.onclick = () => window.ShelfReader.open(b.id);
        caption.append(rd);
      }
      if (books.length > 1) {
        const nav = h(`<div class="nav"><span class="counter">${front + 1} / ${books.length}</span>
          <button class="navBtn" aria-label="Previous book" ${front === 0 ? "disabled" : ""}>‹</button>
          <button class="navBtn" aria-label="Next book" ${front >= count - 1 ? "disabled" : ""}>›</button></div>`);
        const [prev, next] = nav.querySelectorAll(".navBtn");
        prev.onclick = () => goTo(front - 1, false, -1); next.onclick = () => goTo(front + 1, false, 1);
        caption.append(nav);
      }
    }

    function goTo(i, instant, dir = 1) {
      if (is3dMode) {
        if (i >= 0 && i < count && lyingAt(i)) { let j = i; while (j >= 0 && j < count && lyingAt(j)) j += dir; i = j; }
        if (i >= 0 && i < books.length) pick3(i);
        return;
      }
      if (i >= 0 && i < count && lyingAt(i)) { let j = i; while (j >= 0 && j < count && lyingAt(j)) j += dir; i = j >= 0 && j < count ? j : uprightNear(i, -dir); }
      if (i < 0 || (i >= count && !count)) { scroller.scrollTo({ left: 0, behavior: instant ? "auto" : "smooth" }); return; }
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!instant) { userMoved = true; easePanHome(); }
      scroller.scrollTo({ left: (Math.max(0, Math.min(count - 1, i)) + 1) * STEP, behavior: instant || reduce ? "auto" : "smooth" });
    }

    ["pointerdown", "wheel", "keydown"].forEach((ev) => scroller.addEventListener(ev, () => (userMoved = true), { passive: true }));
    // freeze the closet glints while a finger is on the shelf so swipes stay smooth
    let swipeT = 0;
    const swipeOn = () => { clearTimeout(swipeT); document.documentElement.classList.add("swiping"); };
    const swipeOff = () => { clearTimeout(swipeT); swipeT = setTimeout(() => document.documentElement.classList.remove("swiping"), 350); };
    scroller.addEventListener("pointerdown", swipeOn, { passive: true });
    ["pointerup", "pointercancel"].forEach((ev) => scroller.addEventListener(ev, swipeOff, { passive: true }));
    scroller.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(layout); }, { passive: true });
    function easePanHome() {
      if (!panX || panEase) return;
      const from = panX, t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / 380), e = 1 - Math.pow(1 - k, 3);
        panX = from * (1 - e); layout();
        panEase = k < 1 ? requestAnimationFrame(step) : 0;
      };
      panEase = requestAnimationFrame(step);
    }
    scroller.addEventListener("wheel", () => { if (panX) easePanHome(); }, { passive: true });
    scroller.addEventListener("keydown", (e) => {
      const at = front >= 0 ? front : scroller.scrollLeft < STEP / 2 ? -1 : count;
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(at + 1, false, 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goTo(at - 1, false, -1); }
      else if (e.key === "Enter" && books[front]) openBook(books[front].id);
    });
    const ro = new ResizeObserver(() => { if (is3dMode) { build(); layout(); return; } const keep = front < 0 ? scrollMemory.get(key) || 0 : front; build(); front = -1; goTo(keep, true); layout(); });
    ro.observe(scroller);
    root._dispose = () => ro.disconnect();
    // the ✦ menu adds a decoration next to the book in front
    root._addDecor = (kind) => {
      const fb = books[front >= 0 ? front : scrollMemory.get(key) || 0];
      items.push({ id: "d" + Date.now().toString(36), kind, after: fb ? fb.id : "end", on: true });
      setDecorItems(key, items);
      // books ease aside to make room while it drops straight into its place
      const o = books.length ? makeOrn(items[items.length - 1]) : null;
      if (o) { orns.push(o); sortOrns(); o.el.classList.add("appear"); setTimeout(() => o.el.classList.remove("appear"), 600); }
      root.classList.add("arranging");
      layout();
      setTimeout(() => { if (!drag) root.classList.remove("arranging"); }, 340);
    };
    if (!books.length) drawCaption();
    return root;
  }

  // ---------------------------------------------------------------- page
  // no page zoom (Safari ignores user-scalable=no, so its pinch gesture is stopped here too)
  ["gesturestart", "gesturechange"].forEach((ev) => document.addEventListener(ev, (e) => e.preventDefault(), { passive: false }));
  const main = document.getElementById("main");
  let reopenDecor = null;
  const keepOpen = () => { const m = document.querySelector(".decorMenu"); const sec = m && m.closest("section"); const sh = sec && sec.querySelector(".shelf"); reopenDecor = sh ? sh.dataset.key : null; };
  function render() {
    applyAppearance();
    if (window.ShelfAmbience) window.ShelfAmbience.update();
    const books = [...state.books];
    const year = String(new Date().getFullYear());
    const readThisYear = books.filter((b) => b.status === "read" && (b.finishedOn || "").startsWith(year)).length;
    document.getElementById("stats").textContent = `${books.length} ${books.length === 1 ? "book" : "books"} · ${readThisYear} read in ${year}`;

    const q = state.filter.trim().toLowerCase();
    const tabs = document.getElementById("tabs");
    tabs.hidden = !!q;
    tabs.replaceChildren(...[["all", "All", books.length], ...shelves().map(([k, l]) => [k, l, books.filter((b) => b.status === k).length])].map(([k, l, n]) => {
      const t = h(`<button type="button" class="tab" aria-pressed="${state.shelf === k}">${esc(l)}<span class="count">${n}</span></button>`);
      t.onclick = () => { state.shelf = k; render(); };
      return t;
    }));

    main.querySelectorAll(".shelf").forEach((s) => s._dispose && s._dispose());
    main.replaceChildren();
    let shelfN = 0;
    const section = (key, title, list, opts = {}) => {
      const sec = h(`<section><div class="sectionHead"><h2 class="sectionTitle">${esc(title)}<span class="count">${list.length}</span></h2></div></section>`);
      if (opts.more) { const m = h(`<button class="linkBtn">Only this shelf</button>`); m.onclick = opts.more; sec.firstElementChild.append(m); }
      const sIdx = shelfN;
      {
        const btn = h(`<button class="decorBtn" aria-label="Decor on this shelf" aria-expanded="false">✦</button>`);
        btn.onclick = (e) => {
          e.stopPropagation();
          // a second tap on the same ✦ closes its menu (check before removing it, or it no longer has a neighbour)
          const was = document.querySelector(".decorMenu"), mine = !!was && was.previousElementSibling === btn;
          document.querySelectorAll(".decorMenu").forEach((m) => m.remove());
          if (mine) { btn.setAttribute("aria-expanded", "false"); return; }
          const menu = h(`<div class="decorMenu" role="dialog" aria-label="Decor on this shelf"></div>`);
          const draw = () => {
            const dz = shelfDecor(key), its = decorItems(key);
            menu.replaceChildren();
            // lights: tap one to hang it, tap it again to take it down; several can hang together
            const L = shelfLights(key);
            menu.append(h(`<span class="subLabel">Lights</span>`));
            const lc = h(`<div class="chips small">${Object.entries(D.LIGHT_STYLES).filter(([k]) => k !== "none").map(([k, l]) => `<button data-v="${k}" aria-pressed="${L.styles.includes(k)}">${esc(l)}</button>`).join("")}</div>`);
            lc.querySelectorAll("button").forEach((b) => (b.onclick = () => {
              const v = b.dataset.v, styles = L.styles.includes(v) ? L.styles.filter((x) => x !== v) : [...L.styles, v];
              setShelfLights(key, { styles }); keepOpen(); render();
            }));
            menu.append(lc);
            if (L.styles.some((k) => !["wisteria", "chinese", "closetRod", "vampDrapes", "cottageLotus", "forestCatchers", "starCurtain", "loftCages", "loftSpider", "cabinSwags"].includes(k))) {
              const cc = h(`<div class="colors small">${Object.entries(D.LIGHT_COLOURS).map(([k, [l, c]]) => `<button class="colorItem" data-v="${k}" aria-pressed="${L.colour === k}"><span class="dot ${L.colour === k ? "on" : ""}" style="background:${c || "conic-gradient(#ff6b6b,#ffd166,#5be3a5,#5cc8f5,#c792ff,#ff6b6b)"};box-shadow:0 0 10px ${c || "#ffd166"}88"></span>${esc(l)}</button>`).join("")}</div>`);
              cc.querySelectorAll("button").forEach((b) => (b.onclick = () => { setShelfLights(key, { colour: b.dataset.v }); keepOpen(); render(); }));
              menu.append(cc);
            }
            menu.append(h(`<span class="subLabel">On this shelf</span>`));
            const cur = h(`<div class="decorNow"></div>`);
            if (!its.length) cur.append(h(`<span class="hint small">Nothing yet. Pick something below.</span>`));
            its.forEach((it) => {
              const kind = resolveKind(it.kind, sIdx);
              if (!kind) return;
              const chip = h(`<span class="decorChip"><span class="ornArt"></span><button aria-label="Remove ${esc(D.ORNAMENTS[kind].label)}">×</button></span>`);
              chip.firstElementChild.append(ornArt(kind, 44));
              chip.querySelector("button").onclick = () => {
                setDecorItems(key, its.filter((x) => x !== it));
                keepOpen(); render();
              };
              cur.append(chip);
            });
            menu.append(cur);
            menu.append(h(`<span class="subLabel">Add to this shelf</span>`));
            const grid = h(`<div class="ornGrid"></div>`);
            Object.entries(D.ORNAMENTS).forEach(([k, o]) => {
              if (!o.draw) return;
              const t = h(`<button class="ornTile" aria-label="Add ${esc(o.label)}"><span class="ornArt"></span><span class="name">${esc(o.label)}</span></button>`);
              t.firstElementChild.append(ornArt(k, 50));
              t.onclick = () => {
                const sh = main.querySelector(`.shelf[data-key="${CSS.escape(key)}"]`);
                // the menu gets out of the way and the new object drops onto the shelf
                menu.remove(); btn.setAttribute("aria-expanded", "false");
                if (sh && sh._addDecor) {
                  const r = sh.getBoundingClientRect();
                  if (r.top < 60 || r.bottom > innerHeight - 40) sh.scrollIntoView({ block: "center", behavior: "smooth" });
                  sh._addDecor(k);
                } else setDecorItems(key, [...its, { id: "d" + Date.now().toString(36), kind: k, after: "end", on: true }]);
              };
              grid.append(t);
            });
            menu.append(grid);
            menu.append(h(`<p class="hint small">Hold a decoration on the shelf to move it between any books. Drag it to the bin to take it off.</p>`));
          };
          draw();
          menu.onclick = (ev) => ev.stopPropagation();
          btn.after(menu); btn.setAttribute("aria-expanded", "true");
          const close = () => { menu.remove(); btn.setAttribute("aria-expanded", "false"); };
          setTimeout(() => document.addEventListener("click", close, { once: true }), 0);
        };
        sec.firstElementChild.append(btn);
      }
      sec.append(shelfEl(key, list, { ...opts, idx: shelfN++ }));
      main.append(sec);
      if (reopenDecor === key) { reopenDecor = null; const b = sec.querySelector(".decorBtn"); setTimeout(() => b && b.isConnected && b.click(), 0); }
    };

    if (!books.length) {
      const e = h(`<div class="empty"><h2>Your shelf is empty</h2><p>Search for the book you're reading now. The cover and summary come with it.</p><button class="btn primary">+ Add your first book</button></div>`);
      e.querySelector("button").onclick = () => openAdd("");
      main.append(e); return;
    }
    if (q) {
      const matches = books.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
      if (matches.length) section("search:" + q, `Matches for “${state.filter.trim()}”`, matches);
      else {
        const e = h(`<div class="empty"><p>Nothing on your shelves matches “${esc(state.filter.trim())}”.</p><button class="btn">Search all books to add it</button></div>`);
        e.querySelector("button").onclick = () => openAdd(state.filter.trim());
        main.append(e);
      }
      return;
    }
    if (state.shelf === "all") {
      for (const [k, l] of shelves()) {
        const list = books.filter((b) => b.status === k);
        if (list.length) section(k, l, list, { more: () => { state.shelf = k; render(); } });
      }
    } else {
      if (!shelves().some((x) => x[0] === state.shelf)) state.shelf = "all";
      section(state.shelf, shelfLabel(state.shelf), books.filter((b) => b.status === state.shelf), { onAdd: () => openAdd(""), empty: "Nothing here yet." });
    }
  }

  // ---------------------------------------------------------------- sheets
  const scrim = document.getElementById("scrim");
  let openSheet = null;
  function showSheet(el) {
    if (openSheet && openSheet !== el) { openSheet.hidden = true; sheetGuard = null; }
    if (el.id !== "bookSheet") localUndo = null;
    if (el.id !== "bookSheet" && el.id !== "customizeSheet") redrawOpen = null;
    el.classList.remove("closing"); scrim.classList.remove("closing");
    openSheet = el; el.hidden = false; scrim.hidden = false; el.scrollTop = 0;
    document.body.style.overflow = "hidden"; document.body.classList.add("sheetOpen");
  }
  let sheetGuard = null; // the book page uses this to stop closing with unsaved changes
  function closeSheet(force) {
    if (!openSheet) return;
    if (force !== true && sheetGuard && !sheetGuard()) return;
    sheetGuard = null; localUndo = null; redrawOpen = null; setTimeout(refreshUndo, 0);
    // slide the sheet away and fade the dimming, then tidy up
    const el = openSheet; openSheet = null;
    el.classList.add("closing"); scrim.classList.add("closing");
    setTimeout(() => {
      el.classList.remove("closing"); scrim.classList.remove("closing");
      if (openSheet === el) return; // opened again meanwhile
      el.hidden = true; el.replaceChildren();
      if (!openSheet) { scrim.hidden = true; document.body.classList.remove("sheetOpen"); }
    }, 270);
    document.body.style.overflow = "";
  }
  scrim.onclick = closeSheet;
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });
  const closeBtn = () => { const b = h(`<button class="sheetClose" aria-label="Close">✕</button>`); b.onclick = closeSheet; return b; };

  /** Turn what people paste into a direct image link: unwrap Google Images / redirect links. */
  function cleanImageLink(v) {
    try {
      const u = new URL(v);
      for (const k of ["imgurl", "mediaurl", "url", "u"]) { const inner = u.searchParams.get(k); if (inner && /^https?:\/\//.test(inner)) return inner; }
    } catch (e) { /* not a URL */ }
    return v;
  }
  /** Shrink a photo from the phone to a small JPEG so it fits in browser storage. */
  function photoToDataUrl(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 520 / img.naturalWidth);
        const c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); resolve(c.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }

  function openBook(id) {
    const sheet = document.getElementById("bookSheet");
    let draft = {};
    let designTab = "title", promptOpen = false, ownOpen = false;
    const dirty = () => Object.keys(draft).length > 0;
    const view = () => { const b = byId(id); return b ? { ...b, ...draft } : null; };
    let bar = null;
    const showBar = (asking) => {
      if (!bar) return;
      bar.hidden = !dirty();
      bar.classList.toggle("asking", !!asking);
      bar.querySelector(".saveMsg").textContent = asking ? "Save your changes before closing?" : "You have unsaved changes";
    };
    /** Keep a change in the draft; redraw unless the person is typing. */
    const past = [], future = []; let lastPush = 0, lastKeys = "";
    const stage = (patch, redraw = true) => {
      // typing and slider drags are grouped so one undo steps back a whole edit, not one letter
      const keys = Object.keys(patch).sort().join(), t = Date.now();
      if (redraw || keys !== lastKeys || t - lastPush > 900) { past.push(JSON.stringify(draft)); if (past.length > 80) past.shift(); }
      lastPush = t; lastKeys = keys; future.length = 0;
      Object.assign(draft, patch); if (redraw) draw(); else showBar();
      refreshUndo();
    };
    localUndo = {
      canUndo: () => past.length > 0, canRedo: () => future.length > 0,
      undo: () => { future.push(JSON.stringify(draft)); draft = JSON.parse(past.pop()); lastKeys = ""; draw(); },
      redo: () => { past.push(JSON.stringify(draft)); draft = JSON.parse(future.pop()); lastKeys = ""; draw(); },
    };

    const saveDraft = () => {
      if (!dirty()) return;
      const p = draft; draft = {}; past.length = 0; future.length = 0;
      if (p.status === "reading" && !p.startedOn && !byId(id).startedOn) p.startedOn = today();
      if (p.status === "read" && !p.finishedOn && !byId(id).finishedOn) p.finishedOn = today();
      updateBook(id, p); toast("Saved"); draw();
    };
    sheetGuard = () => { if (!dirty()) return true; showBar(true); bar.scrollIntoView({ block: "nearest" }); return false; };

    const draw = () => {
      const b = view(); if (!b) return closeSheet(true);
      const scroll = sheet.scrollTop;
      sheet.replaceChildren(closeBtn(), undoPair("sheetUndo"));
      const body = h(`<div class="sheetBody"></div>`);
      const hero = h(`<header class="hero" style="--spine:${b.spineColor}">${b.coverUrl ? `<img class="backdrop" alt="" referrerpolicy="no-referrer" src="${esc(b.coverUrl)}">` : ""}<div class="heroBook"></div><div class="heading">
        <h2 class="bookTitle">${esc(b.title)}</h2><p class="bookAuthor">${esc(b.author)}</p>
        <p class="facts">${[b.year, b.pageCount ? b.pageCount + " pages" : ""].filter(Boolean).join(" · ")}</p><div class="rate"></div></div></header>`);
      const heroBook = bookEl(b, innerWidth < 560 ? 180 : 220, 0.16);
      hero.querySelector(".heroBook").append(heroBook);
      hero.querySelector(".heroBook").onpointermove = (e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        heroBook.style.setProperty("--turn", Math.max(0, Math.min(0.4, ((e.clientX - r.left) / r.width) * 0.4)));
      };
      hero.querySelector(".rate").append(starsEl(b.rating, (rating) => stage({ rating }), 28));
      body.append(hero);

      // shelf + finish
      const quick = h(`<div class="grid2">
        <label class="field"><span class="label">Shelf</span><select class="input" id="f-status">${shelves().map(([k, l]) => `<option value="${k}" ${b.status === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
        <div class="field"><span class="label">Cover</span><div class="seg"><button data-v="matte" aria-pressed="${b.finish !== "glossy"}">Matte</button><button data-v="glossy" aria-pressed="${b.finish === "glossy"}">Glossy</button></div></div>
        <div class="field"><span class="label">Binding</span><div class="seg bind"><button data-b="hard" aria-pressed="${b.binding !== "paper"}">Hardcover</button><button data-b="paper" aria-pressed="${b.binding === "paper"}">Paperback</button></div></div></div>`);
      quick.querySelector("#f-status").onchange = (e) => stage({ status: e.target.value });
      quick.querySelectorAll(".seg button[data-v]").forEach((btn) => (btn.onclick = () => stage({ finish: btn.dataset.v })));
      quick.querySelectorAll(".seg button[data-b]").forEach((btn) => (btn.onclick = () => stage({ binding: btn.dataset.b })));
      body.append(quick);

      // read
      const readG = h(`<div class="group"><h3 class="label">Read</h3><div></div></div>`);
      if (window.ShelfReader) window.ShelfReader.readBox(readG.lastElementChild, b, stage);
      body.append(readG);

      // summary
      const sum = h(`<div class="group"><h3 class="label">Summary</h3></div>`);
      if (b.summary) {
        const p = h(`<p class="summary ${b.summary.length > 420 ? "clamp" : ""}"></p>`); p.textContent = b.summary; sum.append(p);
        if (b.summary.length > 420) { const more = h(`<button class="linkBtn" style="color:var(--primary);align-self:flex-start">Read more</button>`); more.onclick = () => { p.classList.toggle("clamp"); more.textContent = p.classList.contains("clamp") ? "Read more" : "Show less"; }; sum.append(more); }
      } else {
        const row = h(`<div class="row"><p class="hint" style="flex:1">No summary yet.</p><button class="btn small">Find one online</button></div>`);
        const btn = row.querySelector("button");
        btn.onclick = async () => {
          btn.disabled = true; btn.textContent = "Looking…";
          const s = await findSummary(b);
          if (s) stage({ summary: s }); else { btn.disabled = false; btn.textContent = "Find one online"; toast("No summary found online. You can write your own below."); }
        };
        sum.append(row);
      }
      const ownSum = h(`<details><summary class="hint" style="cursor:pointer">Edit the summary</summary><textarea class="input" rows="5" style="margin-top:8px"></textarea></details>`);
      ownSum.querySelector("textarea").value = b.summary;
      ownSum.querySelector("textarea").oninput = (e) => stage({ summary: e.target.value.trim() }, false);
      sum.append(ownSum);
      body.append(sum);

      // review
      const rev = h(`<div class="group"><h3 class="label">Review</h3><textarea class="input review" rows="6" placeholder="What stayed with you?"></textarea></div>`);
      const ta = rev.querySelector("textarea"); ta.value = b.review || "";
      ta.oninput = () => stage({ review: ta.value }, false);
      body.append(rev);

      // look: the spine designer
      const design = b.spineDesign || autoDesign(b);
      const part = design[designTab];
      const fontOpts = Object.entries(FONTS).map(([k, f]) => `<option value="${k}" ${part.font === k ? "selected" : ""} style="font-family:${f.family}">${f.label}</option>`).join("");
      const look = h(`<div class="group"><div class="row"><h3 class="label" style="flex:1">How it looks on the shelf</h3>${b.spineDesign ? `<button class="linkBtn" id="d-reset">Reset to automatic</button>` : ""}</div>
        <div class="lookRow"><div class="lookPreview"></div><div class="lookControls">
          <div class="field paintSpine"><span class="hint">Spine picture</span>
            <div class="row"><button type="button" class="btn small" id="s-gen" aria-expanded="${promptOpen}">Generate with Gemini</button><label class="btn small" for="s-up">${spineUrl(b) ? "Upload a new spine" : "Upload spine"}<input type="file" id="s-up" accept="image/*" hidden></label>${b.spineArt ? `<button type="button" class="linkBtn" id="s-del">Remove</button>` : ""}</div>
            <div id="s-prompt" ${promptOpen ? "" : "hidden"}>
              <p class="hint">In Gemini: attach this book's cover, paste the prompt, then upload the picture Gemini paints here. The green is cut away for you.</p>
              <textarea class="input" id="s-text" rows="7" readonly spellcheck="false"></textarea>
              <div class="row" style="margin-top:6px"><button type="button" class="btn small primary" id="s-copy">Copy prompt</button>${b.coverUrl ? `<a class="btn small" id="s-cover" href="${esc(b.coverUrl)}" target="_blank" rel="noopener" download="${esc((b.title || "cover").replace(/[^\w\- ]+/g, ""))}-cover.jpg">Open the cover to save it</a>` : ""}</div>
            </div>
            <p class="hint" id="s-msg"></p>
          </div>
          <details class="ownDesign" ${ownOpen ? "open" : ""}><summary class="hint">${b.spineArt ? "Design it myself (used only without a spine picture)" : "Design it myself"}</summary>
        <div class="styleCopy" style="margin-bottom:8px"><button type="button" class="btn small" id="d-copy">Copy style</button>${state.settings.copiedStyle ? `<button type="button" class="btn small" id="d-paste"><i class="dot" style="background:${esc(state.settings.copiedStyle.spineColor || "#888")}"></i>Paste style from <em>${esc(state.settings.copiedStyle.from || "another book")}</em></button>` : `<span class="hint">Copy this spine's fonts, colours and layout to use on another book.</span>`}</div>
          <div class="field"><span class="hint">Text runs</span><div class="seg" id="d-dir">
            <button data-v="down" aria-pressed="${design.dir === "down"}">↓ Down</button><button data-v="up" aria-pressed="${design.dir === "up"}">↑ Up</button><button data-v="across" aria-pressed="${design.dir === "across"}">Across</button></div></div>
          <div class="seg tabsSeg" id="d-tab">
            <button data-v="title" aria-pressed="${designTab === "title"}">Title</button><button data-v="author" aria-pressed="${designTab === "author"}">Author</button><button data-v="extra" aria-pressed="${designTab === "extra"}">Extra line</button></div>
          <label class="check"><input type="checkbox" id="d-show" ${part.show ? "checked" : ""}> Show the ${designTab === "extra" ? "extra line" : designTab}</label>
          <label class="field"><span class="hint">Words (a new line starts a new column)</span><textarea class="input" rows="2" id="d-text"></textarea></label>
          <label class="field"><span class="hint">Font</span><select class="input" id="d-font">${fontOpts}</select></label>
          <div class="field"><span class="hint">Style</span><div class="row" style="flex-wrap:nowrap;gap:6px"><div class="seg" id="d-case">
            <button data-v="none" aria-pressed="${part.tcase === "none"}">Aa</button><button data-v="upper" aria-pressed="${part.tcase === "upper"}">AA</button><button data-v="lower" aria-pressed="${part.tcase === "lower"}">aa</button></div>
            <button class="btn small" id="d-bold" aria-pressed="${!!part.bold}" style="font-weight:800">B</button></div></div>
          ${["size|Size|4|40|0.5|", "spacing|Letter spacing|-6|60|1|", "pos|Position along the spine|0|100|1|%", "shift|Move sideways|-40|40|1|"].map((r) => { const [k, l, mn, mx, st] = r.split("|"); return `<div class="field"><span class="hint">${l}: <b data-out="${k}">${part[k]}</b></span><input type="range" data-k="${k}" min="${mn}" max="${mx}" step="${st}" value="${part[k]}"></div>`; }).join("")}
          <div class="field"><span class="hint">Colour</span><div class="row" style="flex-wrap:nowrap"><button class="btn small" id="d-autoColor" aria-pressed="${!part.color}">Automatic</button><input class="input" type="color" id="d-color" value="${part.color || spineInk(b.spineColor)}" style="padding:4px;width:64px"></div></div>
          </details>
          <div class="field"><span class="hint">Thickness: <b id="thickVal">${b.thickness ? b.thickness + "%" : "Auto (from page count)"}</b></span><div class="row" style="flex-wrap:nowrap"><input type="range" id="f-thick" min="40" max="180" step="5" value="${b.thickness || 100}"><button class="btn small" id="f-thickAuto">Auto</button></div></div>
          <div class="field"><span class="hint">How it sits on the shelf</span><div class="seg" id="f-pose">${[["stand", "Standing"], ["lean", "Leaning"], ["lie", "Lying flat"]].map(([k, l]) => `<button data-v="${k}" aria-pressed="${(b.pose || "stand") === k}">${l}</button>`).join("")}</div></div>
          <div class="field"><span class="hint">Height: <b id="tallVal">${b.height ? b.height + "%" : "Auto"}</b></span><div class="row" style="flex-wrap:nowrap"><input type="range" id="f-tall" min="70" max="120" step="2" value="${b.height || 96}"><button class="btn small" id="f-tallAuto">Auto</button></div></div>
          <div class="field"><span class="hint">Book size</span><div class="seg" id="f-bsize">${Object.entries(SIZES).map(([k, [l]]) => `<button data-v="${k}" aria-pressed="${(b.size || "regular") === k}">${l}</button>`).join("")}</div></div>
        </div></div></div>`);
      // painted spine: a prompt for Gemini, and the picture it paints
      const sMsg = look.querySelector("#s-msg"), sText = look.querySelector("#s-text");
      sText.value = spinePrompt(view());
      look.querySelector("#s-gen").onclick = () => { promptOpen = !promptOpen; look.querySelector("#s-prompt").hidden = !promptOpen; look.querySelector("#s-gen").setAttribute("aria-expanded", promptOpen); if (promptOpen) sText.value = spinePrompt(view()); };
      look.querySelector("#s-copy").onclick = async () => {
        let ok = false;
        try { await navigator.clipboard.writeText(sText.value); ok = true; } catch (e) { sText.focus(); sText.select(); try { ok = document.execCommand("copy"); } catch (e2) { /* manual */ } }
        toast(ok ? "Prompt copied. Paste it into Gemini with the cover." : "Select the prompt and copy it");
      };
      look.querySelector(".ownDesign").ontoggle = (e) => { ownOpen = e.target.open; };
      look.querySelector("#s-up").onchange = async (e) => {
        const f = e.target.files && e.target.files[0]; if (!f) return;
        sMsg.textContent = "Cutting out the spine…";
        const got = await spineFromPhoto(f);
        if (!got) { sMsg.textContent = "Couldn't find the spine in that picture. It needs to stand on a plain green background."; return; }
        if (got.ar > 0.5) { sMsg.textContent = "That came out wider than a spine. Check the green background is plain, or try another picture."; return; }
        const key = `sp-${id}-${Date.now().toString(36)}`;
        try { await spinePut(key, got.blob); } catch (err) { sMsg.textContent = "This browser wouldn't store the picture."; return; }
        const patch = { spineArt: { key, ar: +got.ar.toFixed(4) } };
        if (got.color && !view().spineManual) patch.spineColor = got.color;
        promptOpen = false; stage(patch); toast("Spine added. Tap Save to keep it.");
      };
      const sDel = look.querySelector("#s-del");
      if (sDel) sDel.onclick = () => stage({ spineArt: null });
      const preview = look.querySelector(".lookPreview");
      const drawPreview = () => preview.replaceChildren(bookEl(view(), innerWidth < 560 ? 330 : 380, 1));
      drawPreview();
      /** Change the spine design; the first change copies the automatic layout so nothing jumps. */
      const setDesign = (fn, redraw) => {
        const dsn = JSON.parse(JSON.stringify(view().spineDesign || autoDesign(view())));
        fn(dsn); stage({ spineDesign: dsn }, redraw); if (!redraw) drawPreview();
      };
      const setPart = (patch, redraw) => setDesign((dsn) => Object.assign(dsn[designTab], patch), redraw);
      // copy a spine's look (fonts, sizes, placement, colours) and put it on another book; each book keeps its own words
      const STYLE_KEYS = ["show", "font", "size", "pos", "shift", "spacing", "tcase", "bold", "color"];
      look.querySelector("#d-copy").onclick = () => {
        const v = view(), dsn = v.spineDesign || autoDesign(v), parts = {};
        for (const k of ["title", "author", "extra"]) if (dsn[k]) { parts[k] = {}; STYLE_KEYS.forEach((s) => (parts[k][s] = dsn[k][s])); }
        state.settings.copiedStyle = { from: v.title, dir: dsn.dir, parts, spineColor: v.spineColor };
        save(true); toast("Style copied. Open another book and tap Paste style."); draw();
      };
      const pasteBtn = look.querySelector("#d-paste");
      if (pasteBtn) pasteBtn.onclick = () => {
        const cs = state.settings.copiedStyle, v = view();
        const dsn = JSON.parse(JSON.stringify(v.spineDesign || autoDesign(v)));
        dsn.dir = cs.dir || dsn.dir;
        for (const k of Object.keys(cs.parts || {})) { dsn[k] = dsn[k] || { text: "" }; Object.assign(dsn[k], cs.parts[k]); }
        const patch = { spineDesign: dsn };
        if (cs.spineColor) Object.assign(patch, { spineColor: cs.spineColor, spineManual: true });
        stage(patch, true); toast("Style pasted. Tap Save to keep it.");
      };
      const resetBtn = look.querySelector("#d-reset");
      if (resetBtn) resetBtn.onclick = () => stage({ spineDesign: null, spineText: "", spineFont: null, spineSize: null });
      look.querySelectorAll("#d-dir button").forEach((btn) => (btn.onclick = () => setDesign((dsn) => (dsn.dir = btn.dataset.v), true)));
      look.querySelectorAll("#d-tab button").forEach((btn) => (btn.onclick = () => { designTab = btn.dataset.v; draw(); }));
      look.querySelector("#d-show").onchange = (e) => setPart({ show: e.target.checked }, true);
      const dText = look.querySelector("#d-text"); dText.value = part.text;
      dText.oninput = () => { const show = part.show || !!dText.value.trim(); look.querySelector("#d-show").checked = show; setPart({ text: dText.value, show }, false); };
      look.querySelector("#d-font").onchange = (e) => setPart({ font: e.target.value }, true);
      look.querySelectorAll("#d-case button").forEach((btn) => (btn.onclick = () => setPart({ tcase: btn.dataset.v }, true)));
      look.querySelector("#d-bold").onclick = () => setPart({ bold: !part.bold }, true);
      look.querySelectorAll("input[type=range][data-k]").forEach((r) => (r.oninput = () => { look.querySelector(`[data-out="${r.dataset.k}"]`).textContent = r.value; setPart({ [r.dataset.k]: +r.value }, false); }));
      look.querySelector("#d-autoColor").onclick = () => setPart({ color: null }, true);
      look.querySelector("#d-color").oninput = (e) => setPart({ color: e.target.value }, false);
      look.querySelector("#d-color").onchange = (e) => { rememberColor(e.target.value); draw(); };
      look.querySelector("#d-color").closest(".field").append(recentRow((c) => setPart({ color: c }, true), part.color));
      const thick = look.querySelector("#f-thick");
      thick.oninput = () => { look.querySelector("#thickVal").textContent = thick.value + "%"; stage({ thickness: +thick.value }, false); drawPreview(); };
      look.querySelector("#f-thickAuto").onclick = () => stage({ thickness: null });
      look.querySelectorAll("#f-pose button").forEach((btn) => (btn.onclick = () => stage({ pose: btn.dataset.v === "stand" ? null : btn.dataset.v })));
      const tall = look.querySelector("#f-tall");
      tall.oninput = () => { look.querySelector("#tallVal").textContent = tall.value + "%"; stage({ height: +tall.value }, false); drawPreview(); };
      look.querySelector("#f-tallAuto").onclick = () => stage({ height: null });
      look.querySelectorAll("#f-bsize button").forEach((btn) => (btn.onclick = () => stage({ size: btn.dataset.v })));
      body.append(look);

      // details
      const det = h(`<div class="group"><h3 class="label">Details</h3><div class="grid2">
        <label class="field"><span class="hint">Started</span><input class="input" type="date" id="f-start" value="${b.startedOn || ""}"></label>
        <label class="field"><span class="hint">Finished</span><input class="input" type="date" id="f-end" value="${b.finishedOn || ""}"></label>
        <label class="field"><span class="hint">Pages</span><input class="input" type="number" min="1" id="f-pages" value="${b.pageCount || ""}"></label>
        <label class="field"><span class="hint">Spine colour</span><input class="input" type="color" id="f-color" value="${b.spineColor}" style="padding:4px"></label>
      </div>
      <div class="field"><span class="hint">Cover image</span>
        <div class="row" style="flex-wrap:nowrap"><input class="input" id="f-cover" inputmode="url" autocomplete="off" placeholder="Paste an image link" value="${esc(b.coverUrl && !b.coverUrl.startsWith("data:") ? b.coverUrl : "")}"><button class="btn small" id="f-coverUse">Use link</button></div>
        <div class="row"><label class="btn small" style="cursor:pointer">Choose a photo<input type="file" accept="image/*" id="f-photo" hidden></label><span class="hint" id="coverMsg">${b.coverUrl && b.coverUrl.startsWith("data:") ? "Using your own photo." : "Tip: long-press an image online → Copy image address."}</span></div>
      </div></div>`);
      det.querySelector("#f-start").onchange = (e) => stage({ startedOn: e.target.value || null }, false);
      det.querySelector("#f-end").onchange = (e) => stage({ finishedOn: e.target.value || null }, false);
      det.querySelector("#f-pages").oninput = (e) => stage({ pageCount: parseInt(e.target.value, 10) || null }, false);
      det.querySelector("#f-color").oninput = (e) => stage({ spineColor: e.target.value, spineManual: true }, false);
      det.querySelector("#f-color").onchange = (e) => { rememberColor(e.target.value); draw(); };
      det.querySelector("#f-color").closest(".field").after(Object.assign(recentRow((c) => stage({ spineColor: c, spineManual: true }), b.spineColor), { style: "grid-column:1/-1" }));
      const coverMsg = det.querySelector("#coverMsg");
      const useCover = async (src, fromPhoto) => {
        coverMsg.textContent = "Loading the cover…";
        const m = await measureCover(src);
        if (!m.aspect) {
          coverMsg.textContent = fromPhoto ? "That photo couldn't be read." : "That link isn't a picture, or the site blocks it. Copy the image's own address (it usually ends in .jpg or .png).";
          return;
        }
        const patch = { coverUrl: src, coverAspect: m.aspect };
        if (m.color && !byId(id).spineManual) Object.assign(patch, { spineColor: m.color, edgeInset: m.inset, edgeV: 2 });
        stage(patch);
      };
      const coverIn = det.querySelector("#f-cover");
      const fromLink = () => {
        const v = cleanImageLink(coverIn.value.trim());
        if (!v) return;
        if (!/^https?:\/\//.test(v)) { coverMsg.textContent = "Paste a link that starts with https://"; return; }
        useCover(v, false);
      };
      det.querySelector("#f-coverUse").onclick = fromLink;
      coverIn.onkeydown = (e) => { if (e.key === "Enter") fromLink(); };
      coverIn.onpaste = () => setTimeout(fromLink, 0);
      det.querySelector("#f-photo").onchange = async (e) => {
        const f = e.target.files && e.target.files[0]; if (!f) return;
        coverMsg.textContent = "Loading the photo…";
        const data = await photoToDataUrl(f);
        if (data) useCover(data, true); else coverMsg.textContent = "That photo couldn't be read.";
      };
      body.append(det);

      const del = h(`<div class="group"><button class="btn small danger" style="align-self:flex-start">Remove from my shelf</button></div>`);
      const delBtn = del.querySelector("button");
      delBtn.onclick = () => {
        if (delBtn.dataset.armed) { state.books = state.books.filter((x) => x.id !== id); save(); closeSheet(true); render(); toast(`Removed “${b.title}”`); return; }
        delBtn.dataset.armed = "1"; delBtn.textContent = "Tap again to remove";
      };
      body.append(del);

      bar = h(`<div class="saveBar" hidden><span class="saveMsg"></span><button class="btn small" id="discard">Discard</button><button class="btn small primary" id="saveBtn">Save</button></div>`);
      bar.querySelector("#saveBtn").onclick = () => { const wasAsking = bar.classList.contains("asking"); saveDraft(); if (wasAsking) closeSheet(true); };
      bar.querySelector("#discard").onclick = () => { const wasAsking = bar.classList.contains("asking"); draft = {}; past.length = 0; future.length = 0; if (wasAsking) closeSheet(true); else draw(); };
      sheet.append(body, bar);
      showBar();
      sheet.scrollTop = scroll;
    };
    redrawOpen = draw;
    draw();
    showSheet(sheet);
  }

  function openAdd(initial) {
    const sheet = document.getElementById("addSheet");
    sheet.replaceChildren(closeBtn());
    const defStatus = shelves().some(([k]) => k === state.shelf) ? state.shelf : "to_read";
    const body = h(`<div class="sheetBody padded">
      <div><h2 class="sheetTitle">Add a book</h2><p class="hint">Search by title or author. The cover and summary come with it.</p></div>
      <div class="row" style="flex-wrap:nowrap"><input class="input pill" id="q" type="search" placeholder="e.g. The Bell Jar" autocomplete="off"><span class="spinner" hidden></span></div>
      <label class="field"><span class="label">Put it on</span><select class="input" id="addStatus">${shelves().map(([k, l]) => `<option value="${k}" ${k === defStatus ? "selected" : ""}>${l}</option>`).join("")}</select></label>
      <div class="results"></div>
      <label class="btn" style="cursor:pointer;align-self:flex-start">📖 Add from an EPUB file<input type="file" id="epubIn" accept=".epub,application/epub+zip" hidden></label>
      <details><summary class="hint" style="cursor:pointer">Can't find it? Add it by hand</summary>
        <div class="field" style="margin-top:10px"><input class="input" id="mTitle" placeholder="Title"><input class="input" id="mAuthor" placeholder="Author"><button class="btn primary" id="mAdd" style="align-self:flex-end">Add to shelf</button></div>
      </details></div>`);
    sheet.append(body);
    const input = body.querySelector("#q"), results = body.querySelector(".results"), spin = body.querySelector(".spinner");
    let timer = 0, ctrl = null;
    const run = () => {
      const q = input.value.trim();
      if (ctrl) ctrl.abort();
      if (q.length < 2) { results.replaceChildren(); spin.hidden = true; return; }
      ctrl = new AbortController(); spin.hidden = false;
      searchBooks(q, ctrl.signal).then((list) => {
        spin.hidden = true;
        if (!list.length) { results.replaceChildren(h(`<p class="hint">Nothing found for “${esc(q)}”.</p>`)); return; }
        results.replaceChildren(...list.map((r) => {
          const row = h(`<button type="button" class="result">${r.thumb ? `<img class="thumb" alt="" loading="lazy" src="${esc(r.thumb)}">` : `<span class="thumb"></span>`}
            <span class="rMeta"><span class="rTitle">${esc(r.title)}</span><span class="rSub">${esc([r.author, r.year, r.pageCount ? r.pageCount + " pages" : ""].filter(Boolean).join(" · "))}</span></span><span class="rAdd">+</span></button>`);
          row.onclick = () => addBook(r, row);
          return row;
        }));
      }).catch((e) => { if (e.name !== "AbortError") { spin.hidden = true; results.replaceChildren(h(`<p class="hint">Search isn't reachable right now. Check your connection, or add the book by hand below.</p>`)); } });
    };
    input.oninput = () => { clearTimeout(timer); timer = setTimeout(run, 350); };
    input.value = initial || ""; if (initial) run();
    body.querySelector("#mAdd").onclick = () => {
      const title = body.querySelector("#mTitle").value.trim(); if (!title) return;
      addBook({ title, author: body.querySelector("#mAuthor").value.trim() });
    };
    body.querySelector("#epubIn").onchange = async (e) => {
      const f = e.target.files && e.target.files[0]; if (!f || !window.ShelfReader) return;
      toast("Reading the EPUB…");
      try { const meta = await window.ShelfReader.importEpub(f); await addBook(meta, null, f); }
      catch (err) { console.warn(err); toast("That EPUB couldn't be read. It may be DRM-protected."); }
    };
    async function addBook(r, row, epubFile) {
      if (row) { row.disabled = true; row.querySelector(".rAdd").replaceChildren(h(`<span class="spinner"></span>`)); }
      const status = body.querySelector("#addStatus").value;
      const [cover, summary] = await Promise.all([
        r.coverUrl ? measureCover(r.coverUrl) : Promise.resolve({}),
        r.olKey ? findSummary(r) : Promise.resolve(""),
      ]);
      const b = newBook({ ...r, status, summary, coverAspect: cover.aspect, spineColor: cover.color || undefined });
      if (cover.color) { b.edgeV = 2; b.edgeInset = cover.inset; }
      state.books.push(b); save();
      if (epubFile) { try { await window.ShelfReader.storeFile(b.id, epubFile); } catch (e) { toast("The book was added, but the EPUB couldn't be stored."); } }
      state.filter = ""; document.getElementById("filter").value = "";
      if (state.shelf !== "all" && state.shelf !== status) state.shelf = status;
      render();
      toast(`“${b.title}” is on your shelf`);
      openBook(b.id);
    }
    showSheet(sheet);
    setTimeout(() => input.focus(), 50);
  }

  function openShelves() {
    const sheet = document.getElementById("customizeSheet");
    const draw = () => {
      sheet.replaceChildren(closeBtn());
      const body = h(`<div class="sheetBody padded"><div><h2 class="sheetTitle">Shelves</h2><p class="hint">Make your own shelves, rename any of them, or remove ones you made.</p></div>
        <div class="group"><h3 class="label">New shelf</h3><div class="row" style="flex-wrap:nowrap"><input class="input" id="sh-new" placeholder="e.g. Favourites, Fantasy, Book club" maxlength="40"><button class="btn primary" id="sh-add">Add</button></div></div>
        <div class="group"><h3 class="label">Your shelves</h3><div class="shelfList"></div></div></div>`);
      const list = body.querySelector(".shelfList");
      for (const [k, l] of shelves()) {
        const custom = !BUILTIN_SHELVES.some(([b]) => b === k);
        const n = state.books.filter((b) => b.status === k).length;
        const row = h(`<div class="shelfRow"><input class="input" value="${esc(l)}" maxlength="40" aria-label="Shelf name"><span class="hint">${n} ${n === 1 ? "book" : "books"}</span>${custom ? `<button class="btn small danger">Remove</button>` : `<span class="hint" title="Built-in shelf">●</span>`}</div>`);
        row.querySelector("input").onchange = (e) => {
          const name = e.target.value.trim(); if (!name) { e.target.value = l; return; }
          if (custom) state.settings.customShelves = state.settings.customShelves.map(([id, nm]) => [id, id === k ? name : nm]);
          else state.settings.shelfNames = { ...(state.settings.shelfNames || {}), [k]: name };
          save(); render(); toast("Renamed");
        };
        const del = row.querySelector(".danger");
        if (del) del.onclick = () => {
          if (!del.dataset.armed) { del.dataset.armed = "1"; del.textContent = n ? `Move ${n} to To read & remove` : "Tap again"; return; }
          state.books.forEach((b) => { if (b.status === k) b.status = "to_read"; });
          state.settings.customShelves = state.settings.customShelves.filter(([id]) => id !== k);
          if (state.shelf === k) state.shelf = "all";
          save(); render(); draw();
        };
        list.append(row);
      }
      const add = () => {
        const name = body.querySelector("#sh-new").value.trim(); if (!name) return;
        const id = "shelf_" + Date.now().toString(36);
        state.settings.customShelves = [...(state.settings.customShelves || []), [id, name]];
        state.shelf = id; save(); render(); draw(); toast(`Added “${name}”`);
      };
      body.querySelector("#sh-add").onclick = add;
      body.querySelector("#sh-new").onkeydown = (e) => { if (e.key === "Enter") add(); };
      sheet.append(body);
    };
    draw();
    showSheet(sheet);
  }

  function openCustomize() {
    const sheet = document.getElementById("customizeSheet");
    const draw = () => {
      const s = state.settings;
      const scroll = sheet.scrollTop;
      sheet.replaceChildren(closeBtn(), undoPair("sheetUndo"));
      const body = h(`<div class="sheetBody padded"><div><h2 class="sheetTitle">Customize</h2><p class="hint">Changes show on your shelf straight away.</p></div></div>`);
      const set = (patch) => { Object.assign(state.settings, patch); save(); render(); draw(); };

      // drop each shelf's own light switch, so the shelves follow the main setting again
      const clearShelfSwitches = () => Object.fromEntries(Object.entries(s.shelfDecor || {}).map(([k, v]) => { const { lightsOn, ...rest } = v; return [k, rest]; }));
      const lights = { style: "none", colour: "warm", on: false, ...(s.lights || {}) };
      const lookTile = (label, set_) => {
        const t = THEMES[set_.theme] ? THEMES[set_.theme].t : set_.customBg ? derivePalette(set_.customBg) : THEMES.graphite.t;
        const bd = D.BACKDROPS[set_.backdrop] || D.BACKDROPS.none, mat = D.MATERIALS[set_.shelfMat] || D.MATERIALS.paint;
        const plank = mat.base ? [...mat.tex(), mat.base].join(",") : (set_.shelf || "#34343f");
        const lit = set_.lights && set_.lights.style !== "none" && set_.lights.style !== "closetRod" && set_.lights.on;
        return h(`<span class="lookArt" style="background:${bd.tone ? bd.css() : t[0]}"><i class="lookPlank" style="background:${plank}"></i>${lit ? `<i class="lookLights" style="--c:${(D.LIGHT_COLOURS[set_.lights.colour] || D.LIGHT_COLOURS.warm)[1] || "#ffd166"}"></i>` : ""}<b style="color:${bd.tone === "dark" || (!bd.tone && t[9] === "dark") ? "#f3ede4" : "#221c16"};font-family:${(D.HEAD_FONTS[set_.headFont] || D.HEAD_FONTS.bricolage)[1]};background:${set_.accent || "#f2c76b"}33">${esc(label)}</b></span>`);
      };

      // ready-made looks and your own
      const looks = h(`<div class="group"><h3 class="label">Looks</h3><p class="hint">Each look is a whole room: walls, shelf, colours and lettering. Pick lights and objects for each shelf with the ✦ button next to its name.</p><div class="looks"></div></div>`);
      const lookWrap = looks.querySelector(".looks");
      // which look is on (older saves didn't record it, so match by room and colours)
      const current = s.lookKey || (Object.entries(D.LOOKS).find(([, L]) => L.set.backdrop === s.backdrop && L.set.theme === s.theme) || [""])[0];
      const mark = (btn, on) => { btn.setAttribute("aria-pressed", on); if (on) btn.append(h(`<span class="lookNow">✓ Current</span>`)); };
      const applyLook = (key, set_) => {
        const patch = { ...JSON.parse(JSON.stringify(set_)), shelfDecor: clearShelfSwitches(), lookKey: key };
        if (key === "minimal") { set(patch); requestAnimationFrame(() => { const m = sheet.querySelector("#minimalOpts"); if (m) m.scrollIntoView({ behavior: "smooth", block: "start" }); }); return; }
        closeSheet(); setTimeout(() => set(patch), 30);
      };
      for (const [k, L] of Object.entries(D.LOOKS)) {
        const btn = h(`<button class="lookBtn"></button>`); btn.append(lookTile(L.label, { ...DEFAULT_SETTINGS, ...L.set }));
        mark(btn, current === k);
        btn.onclick = () => applyLook(k, L.set);
        lookWrap.append(btn);
      }
      (s.looks || []).forEach((L) => {
        const btn = h(`<div class="lookBtn mine"><button class="lookApply"></button><button class="lookDel" aria-label="Delete ${esc(L.name)}">✕</button></div>`);
        btn.firstElementChild.append(lookTile(L.name, { ...DEFAULT_SETTINGS, ...L.set }));
        mark(btn, current === "mine:" + L.id);
        btn.firstElementChild.onclick = () => applyLook("mine:" + L.id, L.set);
        btn.lastElementChild.onclick = () => set({ looks: s.looks.filter((x) => x !== L) });
        lookWrap.append(btn);
      });
      body.append(looks);

      // v288: real 3D books, on trial next to the flat ones
      const b3g = h(`<div class="group"><h3 class="label">Books</h3><p class="hint">3D books are real shapes with real shadows. They're new, so the flat ones stay here to switch back to.</p>
        <div class="chips" id="b3dPick"><button data-v="0" aria-pressed="${!s.books3d}">Flat</button><button data-v="1" aria-pressed="${!!s.books3d}">3D (new)</button></div></div>`);
      b3g.querySelectorAll("#b3dPick button").forEach((b) => (b.onclick = () => set({ books3d: b.dataset.v === "1" })));
      body.append(b3g);

      // Minimal can be tuned, quietly: a few colours, an accent, the shelf colour and the lettering
      if (current === "minimal") {
        const pal = ["graphite", "midnight", "plum", "forest", "paper", "blush"].filter((k) => THEMES[k]);
        const fonts = ["bricolage", "playfair", "cormorant", "dmserif"].filter((k) => D.HEAD_FONTS[k]);
        const mo = h(`<div class="group minimalOpts" id="minimalOpts"><h3 class="label">Minimal options</h3><p class="hint">Keep it simple: pick a background, an accent colour, the shelf colour and the lettering.</p>
          <div class="field"><span class="subLabel">Background</span><div class="swatchRow" id="m-bg">${pal.map((k) => `<button data-v="${k}" aria-pressed="${s.theme === k}" aria-label="${THEMES[k].label}" title="${THEMES[k].label}"><span style="background:${THEMES[k].t[0]};border-color:${THEMES[k].t[6]}"><i style="background:${THEMES[k].t[1]}"></i></span>${THEMES[k].label}</button>`).join("")}</div></div>
          <div class="field"><span class="subLabel">Accent</span><div class="swatchRow dots" id="m-acc">${ACCENTS.map((c) => `<button data-v="${c}" aria-pressed="${(s.accent || "").toLowerCase() === c}" aria-label="Accent ${c}"><span style="background:${c}"></span></button>`).join("")}</div></div>
          <div class="field"><span class="subLabel">Shelf</span><div class="swatchRow dots" id="m-shelf">${SHELVES.map(([l, c]) => `<button data-v="${c}" aria-pressed="${(s.shelf || "").toLowerCase() === c.toLowerCase()}" aria-label="${l}" title="${l}"><span style="background:${c}"></span></button>`).join("")}</div></div>
          <div class="field"><span class="subLabel">Lettering</span><div class="chips" id="m-font">${fonts.map((k) => `<button data-v="${k}" aria-pressed="${(s.headFont || "bricolage") === k}" style="font-family:${D.HEAD_FONTS[k][1]};font-size:1rem">${D.HEAD_FONTS[k][0]}</button>`).join("")}</div></div></div>`);
        // a pick shows as chosen for a moment, then the menu closes so you see it on the shelves
        const pick = (b, patch) => { b.parentElement.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b)); Object.assign(state.settings, patch); save(); render(); setTimeout(closeSheet, 260); };
        mo.querySelectorAll("#m-bg button").forEach((b) => (b.onclick = () => pick(b, { theme: b.dataset.v })));
        mo.querySelectorAll("#m-acc button").forEach((b) => (b.onclick = () => pick(b, { accent: b.dataset.v })));
        mo.querySelectorAll("#m-shelf button").forEach((b) => (b.onclick = () => pick(b, { shelf: b.dataset.v, shelfMat: "paint" })));
        mo.querySelectorAll("#m-font button").forEach((b) => (b.onclick = () => pick(b, { headFont: b.dataset.v })));
        body.append(mo);
      }

      // the bookmark that marks your page in the reader
      const bmg = h(`<div class="group"><h3 class="label">Bookmark</h3><p class="hint">What marks your page in the reader. Each look picks one to match; choose another any time.</p><div class="bmPick"></div></div>`);
      for (const k of Object.keys(D.BOOKMARKS)) {
        const btn = h(`<button class="bmBtn" aria-pressed="${(s.bookmark || "ribbon") === k}"><span class="bmArt">${D.bookmarkSvg(k, 22)}</span><span class="name">${esc(D.BOOKMARKS[k].label)}</span></button>`);
        btn.onclick = () => set({ bookmark: k });
        bmg.lastElementChild.append(btn);
      }
      body.append(bmg);
      if (window.ShelfAmbience) body.append(window.ShelfAmbience.controls());


      const shelfG = h(`<div class="group"><h3 class="label">Shelves</h3><p class="hint">Add your own shelves, rename them or remove them.</p><button class="btn small" style="align-self:flex-start">Edit shelves</button></div>`);
      shelfG.querySelector("button").onclick = () => openShelves();
      body.append(shelfG);

      const backup = h(`<div class="group"><h3 class="label">Backup</h3>
        <p class="hint">Your books live only in this browser. Save a backup now and then, and before clearing browser data or switching phones.</p><p class="hint versionTag">Version ${esc((document.querySelector('script[src*="app.js"]')?.getAttribute("src").match(/v=(\d+)/) || [, "?"])[1])}</p>
        <div class="row"><button class="btn small" id="exp">Save a backup file</button><label class="btn small" for="imp">Restore from a backup<input type="file" id="imp" accept="application/json,.json" hidden></label></div>
        <div class="row"><label class="btn small" for="impBooks">Restore only the books<input type="file" id="impBooks" accept="application/json,.json" hidden></label></div>
        <p class="hint">"Restore only the books" takes the books from a backup and keeps this copy's looks, lights, objects and other settings.</p>
        ${(() => { try { const pv = JSON.parse(localStorage.getItem("shelf.v1.beforeRestore") || "null"); return pv && Array.isArray(pv.books) ? `<div class="row"><button class="btn small" id="unRestore">Undo the last restore (${pv.books.length} books from ${esc(new Date(pv.at).toLocaleDateString())})</button></div>` : ""; } catch (e) { return ""; } })()}
        <p class="hint">If saving a file doesn't work here, copy the backup as text instead, and paste it into the other copy of the app.</p>
        <div class="row"><button class="btn small" id="expTxt">Copy backup as text</button><button class="btn small" id="impTxt">Paste a backup</button></div>
        <div id="txtBox" hidden><textarea class="input" id="bkTxt" rows="6" spellcheck="false" autocomplete="off" style="width:100%;font:12px/1.35 ui-monospace,monospace;margin-top:8px"></textarea>
        <div class="row" style="margin-top:6px"><button class="btn small primary" id="bkGo" hidden>Restore this backup</button></div></div></div>`);
      backup.querySelector("#exp").onclick = async () => {
        const text = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), books: state.books, settings: state.settings, spines: await spinesFor(state.books) }, null, 2);
        const filename = `shelf-backup-${today()}.json`;
        // on claude.ai the page can't download by itself: it asks the viewer to save the file instead
        if (window.claude && window.claude.use) {
          const dl = await Promise.race([window.claude.use("downloads").catch(() => null), new Promise((r) => setTimeout(() => r(null), 4000))]);
          if (dl) {
            try { await dl.save({ filename, data: text }); toast("Backup saved"); }
            catch (e) { if (e && e.code !== "declined") toast("The backup couldn't be saved here. Use Copy backup as text."); }
            return;
          }
        }
        const blob = new Blob([text], { type: "application/json" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      };
      const restore = (text, booksOnly) => {
        const d = JSON.parse(text);
        if (!Array.isArray(d.books)) throw new Error("not a shelf backup");
        // keep what was here before, so a restore can be taken back even after the page reloads
        try { localStorage.setItem("shelf.v1.beforeRestore", JSON.stringify({ at: new Date().toISOString(), books: state.books, settings: state.settings })); } catch (e) { /* storage full */ }
        state.books = d.books;
        if (d.spines) spinesRestore(d.spines).then(() => render());
        if (booksOnly) {
          // the books come with the shelves they sit on: add the backup's own shelves and names this copy doesn't have
          const ds = d.settings || {}, cur = state.settings.customShelves || [], have = new Set(cur.map(([id]) => id));
          state.settings.customShelves = [...cur, ...(ds.customShelves || []).filter(([id]) => !have.has(id))];
          state.settings.shelfNames = { ...(ds.shelfNames || {}), ...(state.settings.shelfNames || {}) };
        } else state.settings = { ...DEFAULT_SETTINGS, ...(d.settings || {}) };
        save(); render(); draw(); toast(`Restored ${d.books.length} books`);
      };
      const un = backup.querySelector("#unRestore");
      if (un) un.onclick = () => {
        try {
          const pv = JSON.parse(localStorage.getItem("shelf.v1.beforeRestore"));
          const cur = { at: new Date().toISOString(), books: state.books, settings: state.settings };
          state.books = pv.books; state.settings = { ...DEFAULT_SETTINGS, ...(pv.settings || {}) };
          localStorage.setItem("shelf.v1.beforeRestore", JSON.stringify(cur));
          save(); render(); draw(); toast(`Brought back ${pv.books.length} books`);
        } catch (e) { toast("Couldn't undo the restore."); }
      };
      backup.querySelector("#impBooks").onchange = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        try { restore(await file.text(), true); } catch (err) { toast("That file isn't a Shelf backup."); }
      };
      backup.querySelector("#imp").onchange = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        try { restore(await file.text()); } catch (err) { toast("That file isn't a Shelf backup."); }
      };
      // copy-and-paste backup, for places where downloads are blocked (like the copy hosted on claude.ai)
      const box = backup.querySelector("#txtBox"), ta = backup.querySelector("#bkTxt"), go = backup.querySelector("#bkGo");
      backup.querySelector("#expTxt").onclick = async () => {
        box.hidden = false; go.hidden = true;
        ta.value = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), books: state.books, settings: state.settings, spines: await spinesFor(state.books) });
        ta.readOnly = true; ta.focus(); ta.select(); ta.setSelectionRange(0, ta.value.length);
        let ok = false;
        try { await navigator.clipboard.writeText(ta.value); ok = true; } catch (e) { try { ok = document.execCommand("copy"); } catch (e2) { /* manual copy */ } }
        toast(ok ? `Copied a backup of ${state.books.length} books` : "Select all the text in the box and copy it");
      };
      backup.querySelector("#impTxt").onclick = () => {
        box.hidden = false; go.hidden = false; ta.readOnly = false; ta.value = ""; ta.placeholder = "Paste the backup text here"; ta.focus();
      };
      go.onclick = () => { try { restore(ta.value.trim()); } catch (err) { toast("That text isn't a Shelf backup."); } };
      body.append(backup);

      sheet.append(body);
      sheet.scrollTop = scroll;
    };
    redrawOpen = draw;
    draw();
    showSheet(sheet);
  }

  // ---------------------------------------------------------------- wire up
  document.getElementById("fab").onclick = () => openAdd("");
  document.getElementById("addTopBtn").onclick = () => openAdd("");
  document.getElementById("fabShelf").onclick = () => openShelves();
  document.getElementById("addShelfTopBtn").onclick = () => openShelves();
  document.getElementById("customizeBtn").onclick = openCustomize;
  const filter = document.getElementById("filter");
  let ft = 0;
  filter.oninput = () => { clearTimeout(ft); ft = setTimeout(() => { state.filter = filter.value; render(); }, 150); };

  load();
  lastSnap = snapOf();
  render();

  // Fill in summaries for seeded/older books that don't have one yet,
  // and give older books a spine colour taken from their cover's edge.
  (async () => {
    for (const b of state.books.filter((x) => x.coverUrl && (x.edgeV || 0) < 2)) {
      const m = await measureCover(b.coverUrl);
      if (!m.aspect) continue; // cover didn't load (offline?): try again next visit
      b.edgeV = 2;
      if (m.inset != null) b.edgeInset = m.inset;
      if (m.color && !b.spineManual) b.spineColor = m.color;
      render();
      save(true);
    }
    for (const b of state.books.filter((x) => !x.summary && !x.summaryTried)) {
      const s = await findSummary(b);
      b.summaryTried = true;
      if (s) b.summary = s;
      save(true);
    }
  })();

  // Shared helpers for music.js
  window.Shelf = { settings: () => state.settings, books: () => state.books, lookKey: () => state.settings.lookKey || (Object.entries(D.LOOKS).find(([, L]) => L.set.backdrop === state.settings.backdrop && L.set.theme === state.settings.theme) || [""])[0], h, esc, toast, showSheet, closeSheet, closeBtn, spineInk, byId, save, render, undo, redo, undoPair, recentRow, rememberColor };
  document.querySelector(".headerActions").prepend(undoPair("headerUndo"));
  spineLoadAll().then((n) => { if (n) render(); });
})();

// on-screen keyboard: lift the open sheet so the field being typed in stays above the keyboard (v207).
// Some in-app viewers lay the keyboard over the page without telling it, so on touch screens we assume it
// covers the lower 45% when neither the window nor the visual viewport shrank.
(function () {
  const coarse = matchMedia("(pointer: coarse)").matches;
  const vv = window.visualViewport;
  let baseH = innerHeight, sheet = null, t = 0, vvSeen = false, rsSeen = false;   // has this viewer ever told us about the keyboard?
  const isField = (el) => el && el.matches && el.matches("input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]):not([type=color]), textarea, [contenteditable=true]");
  function apply() {
    if (!sheet) return;
    let kb = 0;
    const vk = vv ? innerHeight - (vv.height + vv.offsetTop) : 0;
    if (baseH - innerHeight > 80) { kb = 0; rsSeen = true; }     // the window itself shrank: the sheet already sits above the keyboard
    else if (vk > 80) { kb = vk; vvSeen = true; }
    else if (coarse && !vvSeen && !rsSeen) kb = Math.round(innerHeight * 0.42);   // only guess when the viewer never reports the keyboard

    document.documentElement.style.setProperty("--kb", kb + "px");
    const was = sheet.classList.contains("kb"), top0 = sheet.getBoundingClientRect().top;
    sheet.classList.toggle("kb", kb > 0);
    if (!was && kb > 0 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const dy = top0 - sheet.getBoundingClientRect().top;
      if (dy > 4) sheet.animate([{ transform: `translate3d(0,${dy}px,0)`, borderRadius: "18px 18px 0 0" }, { transform: "none", borderRadius: "0" }], { duration: 300, easing: "cubic-bezier(.22,1,.36,1)" });
    }
    const f = document.activeElement;
    if (isField(f) && sheet.contains(f)) requestAnimationFrame(() => { const r = (f.closest(".field") || f).getBoundingClientRect(), room = innerHeight - kb; if (r.bottom > room - 12) sheet.scrollTop += r.bottom - (room - 12) + 8; });
  }
  function drop() { if (sheet) sheet.classList.remove("kb"); sheet = null; document.documentElement.style.removeProperty("--kb"); }
  document.addEventListener("focusin", (e) => {
    const s = e.target.closest && e.target.closest(".sheet");
    if (!s || !isField(e.target) || innerWidth >= 768) return;
    clearTimeout(t); if (sheet && sheet !== s) drop(); sheet = s; apply(); setTimeout(apply, 350);
  });
  document.addEventListener("focusout", () => {
    clearTimeout(t);
    t = setTimeout(() => { const f = document.activeElement; if (!(isField(f) && sheet && sheet.contains(f))) drop(); }, 80);
  });
  addEventListener("resize", () => { if (!sheet) baseH = innerHeight; else apply(); });
  if (vv) vv.addEventListener("resize", apply);
})();
