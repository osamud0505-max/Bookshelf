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
      ? ["linear-gradient(180deg, rgba(255,255,255,.28) 0 1.5px, rgba(255,255,255,.1) 1.5px 4px, rgba(255,255,255,0) 4px 55%, rgba(0,0,0,.38) 100%)", ...mat.tex(), mat.base].join(",")
      : "linear-gradient(180deg, var(--shelf-top) 0, var(--shelf-top) 3px, var(--shelf-color) 3px, var(--shelf-color) 11px, var(--shelf-edge) 100%)");
    document.documentElement.dataset.mat = s.shelfMat || "paint";
    // backdrop: if it fights the colour scheme (a dark wall behind light text…), veil it so words stay readable
    const bd = D.BACKDROPS[s.backdrop] || D.BACKDROPS.none;
    const veil = bd.tone && bd.tone !== scheme ? [`linear-gradient(${bg}cc, ${bg}cc)`] : [];
    const vignette = bd.tone ? ["radial-gradient(ellipse 120% 90% at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,.28))"] : [];
    set("--backdrop", [...veil, ...vignette, bd.css()].join(","));
    document.documentElement.dataset.bd = bd.tone ? "1" : "";
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

  function dims(b, base) {
    const scale = (SIZES[b.size] || SIZES.regular)[1];
    const hh = Math.round(base * scale * (0.94 + (hash(b.id) % 4) * 0.02));
    const aspect = Math.max(0.5, Math.min(0.9, b.coverAspect || 2 / 3));
    const w = Math.round(hh * aspect);
    const pages = b.pageCount || 280;
    const d = Math.max(8, Math.round(Math.max(24, Math.min(62, 14 + pages / 14)) * (hh / 230) * (b.thickness || 100) / 100));
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
    const el = h(`<div class="book ${b.finish === "glossy" ? "glossy" : "matte"}">
      <div class="body">
        <div class="face front">
          ${b.coverUrl ? `<img class="art" alt="" draggable="false" loading="lazy" referrerpolicy="no-referrer" src="${esc(b.coverUrl)}">` : ""}
          <div class="plain" ${b.coverUrl ? "hidden" : ""}><span class="plainRule"></span><span class="plainTitle">${esc(b.title)}</span><span class="plainAuthor">${esc(b.author)}</span></div>
          <span class="grain"></span><span class="hinge"></span><span class="sheen"></span><span class="fShade"></span>
        </div>
        <div class="face spine"><span class="sForm"></span><span class="grain"></span><span class="sShade"></span></div>
        <div class="face pages"></div><div class="face back"></div>
      </div></div>`);
    el.style.cssText = `--w:${w}px;--h:${hh}px;--d:${d}px;--spine:${b.spineColor};--ink:${spineInk(b.spineColor)}` + (turn !== undefined ? `;--turn:${turn}` : "");
    const spine = el.querySelector(".spine"), form = spine.querySelector(".sForm");
    for (const key of ["title", "author", "extra"]) {
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
  const candleOut = () => { if (!candleBus || candleBus.context !== actx) { candleBus = actx.createGain(); candleBus.gain.value = 0.2; candleBus.connect(actx.destination); } return candleBus; };
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
  function addLights(root) {
    const key = root.dataset.key, sd = shelfDecor(key);
    const base = state.settings.lights || {};
    // each shelf has its own switch; until it is pulled it follows the "Lights on" setting
    const cfg = sd.noLights ? { style: "none" } : { ...base, on: sd.lightsOn !== undefined ? sd.lightsOn : !!base.on };
    root.querySelectorAll(".lights, .pullCord").forEach((e) => e.remove());
    const el = D.lightsEl(plankWidth(), cfg);
    root.classList.toggle("hasLights", !!el);
    root.dataset.lights = el ? cfg.style : "";
    if (!el) return;
    const plank = root.querySelector(".plank");
    plank.append(el);
    if (cfg.style === "wisteria") return;
    const cord = h(`<button class="pullCord" aria-label="Turn this shelf's lights ${cfg.on ? "off" : "on"}" aria-pressed="${!!cfg.on}"><i></i><b></b></button>`);
    cord.onclick = () => {
      if (cord.classList.contains("yank")) return;
      const on = cord.getAttribute("aria-pressed") !== "true";
      cord.classList.add("yank"); setTimeout(() => cord.classList.remove("yank"), 1000);
      soundPullSwitch(on);
      setShelfDecor(key, { lightsOn: on });
      // the switch catches at the bottom of the pull; only this shelf's string follows
      setTimeout(() => {
        const l = root.querySelector(".lights");
        if (l) {
          l.classList.remove("switchOn", "switchOff"); void l.offsetWidth;
          l.classList.toggle("on", on); l.classList.add(on ? "switchOn" : "switchOff");
          clearTimeout(l._sw); l._sw = setTimeout(() => l.classList.remove("switchOn", "switchOff"), 1600);
        }
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
    root.dataset.key = key;
    addLights(root);
    const count = books.length + (opts.onAdd ? 1 : 0);
    let H = 246, STEP = 103, viewW = 0, PAD = 16, front = -1, raf = 0;
    const slots = [], bookNodes = [];
    // an ornament (a candlestick…) stands in the row and gets pushed along when a book turns
    const ornCfg = { kind: "none", pos: "end", ...(state.settings.ornament || {}) };
    // some objects take turns with a partner from shelf to shelf (potions, then a skull)
    const od = D.ORNAMENTS[ornCfg.kind];
    if (od && od.alt && (opts.idx || 0) % 2) ornCfg.kind = od.alt;
    if (shelfDecor(key).noCandle) ornCfg.kind = "none";
    ornCfg.on = !shelfDecor(key).out;
    let orn = null, ornW = 0, ornIdx = -1, ornX = null, ornT = 0;

    books.forEach((b, i) => {
      const slot = h(`<button type="button" class="slot" tabindex="-1"></button>`);
      slot.onclick = () => (i === front ? openBook(b.id) : goTo(i));
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
      track.style.width = (count - 1) * STEP + viewW + "px";
      stage.style.width = viewW + "px";
      track.querySelectorAll(".snap").forEach((n) => n.remove());
      for (let i = 0; i < count; i++) { const s = h(`<span class="snap"></span>`); s.style.left = i * STEP + "px"; track.prepend(s); }
      books.forEach((b, i) => {
        const node = bookEl(b, H); bookNodes[i] = node;
        slots[i].replaceChildren(node);
        slots[i].style.height = dims(b, H).h + "px";
        slots[i].setAttribute("aria-label", b.title);
      });
      if (opts.onAdd) slots[books.length].style.height = Math.round(H * 0.86) + "px";
      if (orn) orn.remove();
      orn = books.length ? D.ornamentEl(ornCfg.kind, H, ornCfg.on) : null;
      ornW = 0;
      if (orn) {
        ornW = parseFloat(orn.style.width) + 10;
        ornIdx = ornCfg.pos === "start" ? 0 : ornCfg.pos === "middle" ? Math.ceil(books.length / 2) : books.length;
        orn.onclick = () => {
          if (orn.classList.contains("snuffing")) return;
          ornCfg.on = !ornCfg.on;
          toggleFlame(orn, !ornCfg.on);
          setShelfDecor(key, { out: !ornCfg.on });
        };
        stage.append(orn);
      }
    }

    function layout() {
      if (!viewW) return;
      const f = Math.max(0, Math.min(count - 1, scroller.scrollLeft / STEP));
      const widths = [], turns = [];
      for (let i = 0; i < count; i++) {
        const b = books[i];
        const o = Math.max(0, Math.min(1, 1 - Math.abs(i - f)));
        const open = o * o * (3 - 2 * o);
        turns.push(1 - open);
        if (!b) { widths.push(30); continue; }
        const { w, d } = dims(b, H);
        const a = ((1 - open) * Math.PI) / 2;
        widths.push(w * Math.cos(a) + d * Math.sin(a) + open * 2);
      }
      // the row stays put; it only slides when it is wider than the screen
      const fl = Math.floor(f);
      let openAt = 0; for (let i = 0; i < fl; i++) openAt += widths[i];
      openAt += (f - fl) * (widths[fl] || 0);
      // the open point passes over the ornament gradually, so the row never jumps
      if (orn) openAt += ornW * Math.max(0, Math.min(1, f - (ornIdx - 1)));
      const total = widths.reduce((s, v) => s + v, 0) + ornW;
      const offset = Math.max(0, Math.min(Math.max(0, total - (viewW - PAD * 2)), openAt - viewW * 0.3));
      let x = 0;
      const placeOrn = () => {
        const left = PAD + x - offset + 5; x += ornW;
        orn.style.transform = `translate3d(${left}px,0,0)`;
        // the flame leans away from the way it is being pushed, then settles
        if (ornX !== null && Math.abs(left - ornX) > 0.3) {
          const lean = Math.max(-30, Math.min(30, -(left - ornX) * 6));
          orn.style.setProperty("--lean", lean.toFixed(1) + "deg");
          clearTimeout(ornT); ornT = setTimeout(() => orn && orn.style.setProperty("--lean", "0deg"), 140);
        }
        ornX = left;
      };
      for (let i = 0; i < count; i++) {
        if (orn && i === ornIdx) placeOrn();
        const left = PAD + x - offset; x += widths[i];
        const slot = slots[i];
        const vis = left + widths[i] > -80 && left < viewW + 80;
        slot.style.visibility = vis ? "visible" : "hidden";
        if (!vis) continue;
        slot.style.width = widths[i] + "px";
        slot.style.transform = `translate3d(${left}px,0,0)`;
        if (bookNodes[i]) bookNodes[i].style.setProperty("--turn", turns[i]);
      }
      if (orn && ornIdx >= count) placeOrn();
      const n = Math.min(Math.round(f), books.length - 1);
      if (n !== front) { front = n; scrollMemory.set(key, n); slots.forEach((s, i) => s.classList.toggle("front", i === n)); drawCaption(); }
    }

    function drawCaption() {
      const b = books[front];
      caption.replaceChildren();
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
        prev.onclick = () => goTo(front - 1); next.onclick = () => goTo(front + 1);
        caption.append(nav);
      }
    }

    function goTo(i, instant) {
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      scroller.scrollTo({ left: Math.max(0, Math.min(count - 1, i)) * STEP, behavior: instant || reduce ? "auto" : "smooth" });
    }

    scroller.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(layout); }, { passive: true });
    scroller.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(front + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goTo(front - 1); }
      else if (e.key === "Enter" && books[front]) openBook(books[front].id);
    });
    const ro = new ResizeObserver(() => { const keep = front < 0 ? scrollMemory.get(key) || 0 : front; build(); front = -1; goTo(keep, true); layout(); });
    ro.observe(scroller);
    root._dispose = () => ro.disconnect();
    if (!books.length) drawCaption();
    return root;
  }

  // ---------------------------------------------------------------- page
  const main = document.getElementById("main");
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
      const hasLights = (state.settings.lights || {}).style && state.settings.lights.style !== "none";
      const hasCandle = (state.settings.ornament || {}).kind && state.settings.ornament.kind !== "none";
      if (hasLights || hasCandle) {
        const dz = shelfDecor(key);
        const btn = h(`<button class="decorBtn" aria-label="Decor on this shelf" aria-expanded="false">✦</button>`);
        btn.onclick = (e) => {
          e.stopPropagation();
          document.querySelectorAll(".decorMenu").forEach((m) => m.remove());
          const menu = h(`<div class="decorMenu" role="menu">
            ${hasLights ? `<label class="check"><input type="checkbox" data-k="noLights" ${dz.noLights ? "" : "checked"}> Lights on this shelf</label>` : ""}
            ${hasCandle ? `<label class="check"><input type="checkbox" data-k="noCandle" ${dz.noCandle ? "" : "checked"}> ${esc(D.ORNAMENTS[state.settings.ornament.kind].label)} on this shelf</label>` : ""}</div>`);
          menu.querySelectorAll("input").forEach((i) => (i.onchange = () => { setShelfDecor(key, { [i.dataset.k]: !i.checked }); render(); }));
          menu.onclick = (ev) => ev.stopPropagation();
          btn.after(menu);
          setTimeout(() => document.addEventListener("click", () => menu.remove(), { once: true }), 0);
        };
        sec.firstElementChild.append(btn);
      }
      sec.append(shelfEl(key, list, { ...opts, idx: shelfN++ }));
      main.append(sec);
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
    document.body.style.overflow = "hidden";
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
      if (!openSheet) scrim.hidden = true;
    }, 340);
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
    let designTab = "title";
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
        <div class="field"><span class="label">Cover</span><div class="seg"><button data-v="matte" aria-pressed="${b.finish !== "glossy"}">Matte</button><button data-v="glossy" aria-pressed="${b.finish === "glossy"}">Glossy</button></div></div></div>`);
      quick.querySelector("#f-status").onchange = (e) => stage({ status: e.target.value });
      quick.querySelectorAll(".seg button").forEach((btn) => (btn.onclick = () => stage({ finish: btn.dataset.v })));
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
        <div class="styleCopy"><button type="button" class="btn small" id="d-copy">Copy style</button>${state.settings.copiedStyle ? `<button type="button" class="btn small" id="d-paste"><i class="dot" style="background:${esc(state.settings.copiedStyle.spineColor || "#888")}"></i>Paste style from <em>${esc(state.settings.copiedStyle.from || "another book")}</em></button>` : `<span class="hint">Copy this spine's fonts, colours and layout to use on another book.</span>`}</div>
        <div class="lookRow"><div class="lookPreview"></div><div class="lookControls">
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
          <div class="field"><span class="hint">Thickness: <b id="thickVal">${b.thickness ? b.thickness + "%" : "Auto (from page count)"}</b></span><div class="row" style="flex-wrap:nowrap"><input type="range" id="f-thick" min="40" max="180" step="5" value="${b.thickness || 100}"><button class="btn small" id="f-thickAuto">Auto</button></div></div>
          <div class="field"><span class="hint">Book size</span><div class="seg" id="f-bsize">${Object.entries(SIZES).map(([k, [l]]) => `<button data-v="${k}" aria-pressed="${(b.size || "regular") === k}">${l}</button>`).join("")}</div></div>
        </div></div></div>`);
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
        const lit = set_.lights && set_.lights.style !== "none" && set_.lights.on;
        return h(`<span class="lookArt" style="background:${bd.tone ? bd.css() : t[0]}"><i class="lookPlank" style="background:${plank}"></i>${lit ? `<i class="lookLights" style="--c:${(D.LIGHT_COLOURS[set_.lights.colour] || D.LIGHT_COLOURS.warm)[1] || "#ffd166"}"></i>` : ""}<b style="color:${bd.tone === "dark" || (!bd.tone && t[9] === "dark") ? "#f3ede4" : "#221c16"};font-family:${(D.HEAD_FONTS[set_.headFont] || D.HEAD_FONTS.bricolage)[1]};background:${set_.accent || "#f2c76b"}33">${esc(label)}</b></span>`);
      };

      // ready-made looks and your own
      const looks = h(`<div class="group"><h3 class="label">Looks</h3><p class="hint">Each look is a whole room: walls, shelf, colours and lettering. Below you can change the lights, the object on the shelf and your bookmark.</p><div class="looks"></div></div>`);
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

      // Minimal can be tuned, quietly: a few colours, an accent, the shelf colour and the lettering
      if (current === "minimal") {
        const pal = ["graphite", "midnight", "plum", "forest", "paper", "blush"].filter((k) => THEMES[k]);
        const fonts = ["bricolage", "playfair", "cormorant", "dmserif"].filter((k) => D.HEAD_FONTS[k]);
        const mo = h(`<div class="group minimalOpts" id="minimalOpts"><h3 class="label">Minimal options</h3><p class="hint">Keep it simple: pick a background, an accent colour, the shelf colour and the lettering.</p>
          <div class="field"><span class="subLabel">Background</span><div class="swatchRow" id="m-bg">${pal.map((k) => `<button data-v="${k}" aria-pressed="${s.theme === k}" aria-label="${THEMES[k].label}" title="${THEMES[k].label}"><span style="background:${THEMES[k].t[0]};border-color:${THEMES[k].t[6]}"><i style="background:${THEMES[k].t[1]}"></i></span>${THEMES[k].label}</button>`).join("")}</div></div>
          <div class="field"><span class="subLabel">Accent</span><div class="swatchRow dots" id="m-acc">${ACCENTS.map((c) => `<button data-v="${c}" aria-pressed="${(s.accent || "").toLowerCase() === c}" aria-label="Accent ${c}"><span style="background:${c}"></span></button>`).join("")}</div></div>
          <div class="field"><span class="subLabel">Shelf</span><div class="swatchRow dots" id="m-shelf">${SHELVES.map(([l, c]) => `<button data-v="${c}" aria-pressed="${(s.shelf || "").toLowerCase() === c.toLowerCase()}" aria-label="${l}" title="${l}"><span style="background:${c}"></span></button>`).join("")}</div></div>
          <div class="field"><span class="subLabel">Lettering</span><div class="chips" id="m-font">${fonts.map((k) => `<button data-v="${k}" aria-pressed="${(s.headFont || "bricolage") === k}" style="font-family:${D.HEAD_FONTS[k][1]};font-size:1rem">${D.HEAD_FONTS[k][0]}</button>`).join("")}</div></div></div>`);
        mo.querySelectorAll("#m-bg button").forEach((b) => (b.onclick = () => set({ theme: b.dataset.v })));
        mo.querySelectorAll("#m-acc button").forEach((b) => (b.onclick = () => set({ accent: b.dataset.v })));
        mo.querySelectorAll("#m-shelf button").forEach((b) => (b.onclick = () => set({ shelf: b.dataset.v, shelfMat: "paint" })));
        mo.querySelectorAll("#m-font button").forEach((b) => (b.onclick = () => set({ headFont: b.dataset.v })));
        body.append(mo);
      }

      // hanging lights
      const lg = h(`<div class="group"><h3 class="label">Lights</h3><p class="hint">Hang a string of lights under every shelf. Pull the little cord under a shelf to switch just that shelf on or off.</p>
        <div class="field"><span class="subLabel">Style</span><div class="chips" id="l-style">${Object.entries(D.LIGHT_STYLES).map(([k, l]) => `<button data-v="${k}" aria-pressed="${lights.style === k}">${l}</button>`).join("")}</div></div>
        <div class="field" id="l-colF"><span class="subLabel">Colour</span><div class="colors" id="l-col">${Object.entries(D.LIGHT_COLOURS).map(([k, [l, c]]) => `<button class="colorItem" data-v="${k}" aria-pressed="${lights.colour === k}"><span class="dot ${lights.colour === k ? "on" : ""}" style="background:${c || "conic-gradient(#ff6b6b,#ffd166,#5be3a5,#5cc8f5,#c792ff,#ff6b6b)"};box-shadow:0 0 12px ${c || "#ffd166"}88"></span>${l}</button>`).join("")}</div></div>
        <div class="field" id="l-onF"><span class="subLabel">All shelves</span><label class="check"><input type="checkbox" id="l-on" ${lights.on ? "checked" : ""}> Lights on</label></div></div>`);
      lg.querySelectorAll("#l-style button").forEach((b) => (b.onclick = () => set({ lights: { ...lights, style: b.dataset.v, on: b.dataset.v === "none" ? lights.on : true } })));
      lg.querySelectorAll("#l-col button").forEach((b) => (b.onclick = () => set({ lights: { ...lights, colour: b.dataset.v, on: true } })));
      lg.querySelector("#l-on").onchange = (e) => set({ lights: { ...lights, on: e.target.checked }, shelfDecor: clearShelfSwitches() });
      if (lights.style === "none") { lg.querySelector("#l-colF").hidden = true; lg.querySelector("#l-onF").hidden = true; }
      body.append(lg);

      // something standing on the shelf
      const ornCfg = { kind: "none", on: true, pos: "end", ...(s.ornament || {}) };
      const og = h(`<div class="group"><h3 class="label">On the shelf</h3><p class="hint">Something that stands among your books and gets nudged along as they turn. Tap it on the shelf to light it or put it out.</p>
        <div class="field"><span class="subLabel">What stands there</span><div class="chips" id="o-kind">${Object.entries(D.ORNAMENTS).map(([k, o]) => `<button data-v="${k}" aria-pressed="${ornCfg.kind === k}">${o.label}</button>`).join("")}</div></div>
        <div class="field" id="o-posF"><span class="subLabel">Where</span><div class="chips" id="o-pos">${[["start", "At the start"], ["middle", "In the middle"], ["end", "At the end"]].map(([k, l]) => `<button data-v="${k}" aria-pressed="${ornCfg.pos === k}">${l}</button>`).join("")}</div></div>
        <p class="hint small">Tip: use ✦ next to a shelf's name to remove the lights or the candle from just that shelf.</p></div>`);
      og.querySelectorAll("#o-kind button").forEach((b) => (b.onclick = () => set({ ornament: { ...ornCfg, kind: b.dataset.v, on: true } })));
      og.querySelectorAll("#o-pos button").forEach((b) => (b.onclick = () => set({ ornament: { ...ornCfg, pos: b.dataset.v } })));
      if (ornCfg.kind === "none") og.querySelector("#o-posF").hidden = true;
      body.append(og);

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
        <div class="row"><button class="btn small" id="exp">Save a backup file</button><label class="btn small" for="imp">Restore from a backup<input type="file" id="imp" accept="application/json,.json" hidden></label></div></div>`);
      backup.querySelector("#exp").onclick = () => {
        const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), books: state.books, settings: state.settings }, null, 2)], { type: "application/json" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `shelf-backup-${today()}.json`; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      };
      backup.querySelector("#imp").onchange = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        try {
          const d = JSON.parse(await file.text());
          if (!Array.isArray(d.books)) throw new Error("not a shelf backup");
          state.books = d.books; state.settings = { ...DEFAULT_SETTINGS, ...(d.settings || {}) };
          save(); render(); draw(); toast(`Restored ${d.books.length} books`);
        } catch (err) { toast("That file isn't a Shelf backup."); }
      };
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
})();
