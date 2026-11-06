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
  const STATUS = [["reading", "Reading"], ["to_read", "To read"], ["read", "Read"], ["did_not_finish", "Did not finish"]];
  const statusLabel = Object.fromEntries(STATUS);

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

  function applyAppearance() {
    const s = state.settings;
    const [bg, fg, surface, popup, muted, mutedFg, border, hover, starEmpty, scheme] = (THEMES[s.theme] || THEMES.graphite).t;
    const r = document.documentElement.style;
    const set = (k, v) => r.setProperty(k, v);
    set("--background", bg); set("--foreground", fg); set("--surface", surface); set("--popup", popup);
    set("--muted", muted); set("--muted-fg", mutedFg); set("--border", border); set("--hover", hover); set("--star-empty", starEmpty);
    set("--primary", s.accent); set("--primary-fg", inkOn(s.accent));
    set("--shelf-color", s.shelf); set("--shelf-top", mix(s.shelf, "#ffffff", 0.14)); set("--shelf-edge", mix(s.shelf, "#000000", 0.3));
    r.setProperty("color-scheme", scheme);
    document.querySelector('meta[name="theme-color"]').setAttribute("content", bg);
  }

  // ---------------------------------------------------------------- storage
  const KEY = "shelf.v1";
  const DEFAULT_SETTINGS = { theme: "graphite", accent: "#f2c76b", shelf: "#34343f", finish: "matte", spineFont: "classic" };
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
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ version: 1, books: state.books, settings: state.settings })); }
    catch (e) { toast("Couldn't save. Your browser storage may be full or blocked."); }
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

  // ---------------------------------------------------------------- the turning shelf
  const scrollMemory = new Map(); // section key -> front index
  function shelfEl(key, books, opts = {}) {
    const root = h(`<div class="shelf">
      <div class="scroller" tabindex="0" role="group" aria-roledescription="shelf"><div class="track"><div class="stage"></div></div></div>
      <div class="plank"></div>
      <div class="caption"></div></div>`);
    const scroller = root.querySelector(".scroller"), track = root.querySelector(".track"), stage = root.querySelector(".stage"), caption = root.querySelector(".caption");
    const count = books.length + (opts.onAdd ? 1 : 0);
    let H = 246, STEP = 103, viewW = 0, PAD = 16, front = -1, raf = 0;
    const slots = [], bookNodes = [];

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
        widths.push(w * Math.cos(a) + d * Math.sin(a) + 4 + open * 10);
      }
      // the row stays put; it only slides when it is wider than the screen
      const fl = Math.floor(f);
      let openAt = 0; for (let i = 0; i < fl; i++) openAt += widths[i];
      openAt += (f - fl) * (widths[fl] || 0);
      const total = widths.reduce((s, v) => s + v, 0);
      const offset = Math.max(0, Math.min(Math.max(0, total - (viewW - PAD * 2)), openAt - viewW * 0.3));
      let x = 0;
      for (let i = 0; i < count; i++) {
        const left = PAD + x - offset; x += widths[i];
        const slot = slots[i];
        const vis = left + widths[i] > -80 && left < viewW + 80;
        slot.style.visibility = vis ? "visible" : "hidden";
        if (!vis) continue;
        slot.style.width = widths[i] - 4 + "px";
        slot.style.transform = `translate3d(${left}px,0,0)`;
        if (bookNodes[i]) bookNodes[i].style.setProperty("--turn", turns[i]);
      }
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
    const books = [...state.books];
    const year = String(new Date().getFullYear());
    const readThisYear = books.filter((b) => b.status === "read" && (b.finishedOn || "").startsWith(year)).length;
    document.getElementById("stats").textContent = `${books.length} ${books.length === 1 ? "book" : "books"} · ${readThisYear} read in ${year}`;

    const q = state.filter.trim().toLowerCase();
    const tabs = document.getElementById("tabs");
    tabs.hidden = !!q;
    tabs.replaceChildren(...[["all", "All", books.length], ...STATUS.map(([k, l]) => [k, l, books.filter((b) => b.status === k).length])].map(([k, l, n]) => {
      const t = h(`<button type="button" class="tab" aria-pressed="${state.shelf === k}">${esc(l)}<span class="count">${n}</span></button>`);
      t.onclick = () => { state.shelf = k; render(); };
      return t;
    }));

    main.querySelectorAll(".shelf").forEach((s) => s._dispose && s._dispose());
    main.replaceChildren();
    const section = (key, title, list, opts = {}) => {
      const sec = h(`<section><div class="sectionHead"><h2 class="sectionTitle">${esc(title)}<span class="count">${list.length}</span></h2></div></section>`);
      if (opts.more) { const m = h(`<button class="linkBtn">Only this shelf</button>`); m.onclick = opts.more; sec.firstElementChild.append(m); }
      sec.append(shelfEl(key, list, opts));
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
      for (const [k, l] of STATUS) {
        const list = books.filter((b) => b.status === k);
        if (list.length) section(k, l, list, { more: () => { state.shelf = k; render(); } });
      }
    } else {
      section(state.shelf, statusLabel[state.shelf], books.filter((b) => b.status === state.shelf), { onAdd: () => openAdd(""), empty: "Nothing here yet." });
    }
  }

  // ---------------------------------------------------------------- sheets
  const scrim = document.getElementById("scrim");
  let openSheet = null;
  function showSheet(el) {
    if (openSheet && openSheet !== el) { openSheet.hidden = true; sheetGuard = null; }
    openSheet = el; el.hidden = false; scrim.hidden = false; el.scrollTop = 0;
    document.body.style.overflow = "hidden";
  }
  let sheetGuard = null; // the book page uses this to stop closing with unsaved changes
  function closeSheet(force) {
    if (!openSheet) return;
    if (force !== true && sheetGuard && !sheetGuard()) return;
    sheetGuard = null;
    openSheet.hidden = true; openSheet.replaceChildren(); openSheet = null; scrim.hidden = true;
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
    const stage = (patch, redraw = true) => { Object.assign(draft, patch); if (redraw) draw(); else showBar(); };
    const saveDraft = () => {
      if (!dirty()) return;
      const p = draft; draft = {};
      if (p.status === "reading" && !p.startedOn && !byId(id).startedOn) p.startedOn = today();
      if (p.status === "read" && !p.finishedOn && !byId(id).finishedOn) p.finishedOn = today();
      updateBook(id, p); toast("Saved"); draw();
    };
    sheetGuard = () => { if (!dirty()) return true; showBar(true); bar.scrollIntoView({ block: "nearest" }); return false; };

    const draw = () => {
      const b = view(); if (!b) return closeSheet(true);
      const scroll = sheet.scrollTop;
      sheet.replaceChildren(closeBtn());
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
        <label class="field"><span class="label">Shelf</span><select class="input" id="f-status">${STATUS.map(([k, l]) => `<option value="${k}" ${b.status === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
        <div class="field"><span class="label">Cover</span><div class="seg"><button data-v="matte" aria-pressed="${b.finish !== "glossy"}">Matte</button><button data-v="glossy" aria-pressed="${b.finish === "glossy"}">Glossy</button></div></div></div>`);
      quick.querySelector("#f-status").onchange = (e) => stage({ status: e.target.value });
      quick.querySelectorAll(".seg button").forEach((btn) => (btn.onclick = () => stage({ finish: btn.dataset.v })));
      body.append(quick);

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
      const ta = rev.querySelector("textarea"); ta.value = b.review;
      ta.oninput = () => stage({ review: ta.value }, false);
      body.append(rev);

      // look: the spine designer
      const design = b.spineDesign || autoDesign(b);
      const part = design[designTab];
      const fontOpts = Object.entries(FONTS).map(([k, f]) => `<option value="${k}" ${part.font === k ? "selected" : ""} style="font-family:${f.family}">${f.label}</option>`).join("");
      const look = h(`<div class="group"><div class="row"><h3 class="label" style="flex:1">How it looks on the shelf</h3>${b.spineDesign ? `<button class="linkBtn" id="d-reset">Reset to automatic</button>` : ""}</div>
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
      look.querySelector("#d-color").onchange = () => draw();
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
      det.querySelector("#f-color").onchange = () => draw();
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
      bar.querySelector("#discard").onclick = () => { const wasAsking = bar.classList.contains("asking"); draft = {}; if (wasAsking) closeSheet(true); else draw(); };
      sheet.append(body, bar);
      showBar();
      sheet.scrollTop = scroll;
    };
    draw();
    showSheet(sheet);
  }

  function openAdd(initial) {
    const sheet = document.getElementById("addSheet");
    sheet.replaceChildren(closeBtn());
    const defStatus = STATUS.some(([k]) => k === state.shelf) ? state.shelf : "to_read";
    const body = h(`<div class="sheetBody padded">
      <div><h2 class="sheetTitle">Add a book</h2><p class="hint">Search by title or author. The cover and summary come with it.</p></div>
      <div class="row" style="flex-wrap:nowrap"><input class="input pill" id="q" type="search" placeholder="e.g. The Bell Jar" autocomplete="off"><span class="spinner" hidden></span></div>
      <label class="field"><span class="label">Put it on</span><select class="input" id="addStatus">${STATUS.map(([k, l]) => `<option value="${k}" ${k === defStatus ? "selected" : ""}>${l}</option>`).join("")}</select></label>
      <div class="results"></div>
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
    async function addBook(r, row) {
      if (row) { row.disabled = true; row.querySelector(".rAdd").replaceChildren(h(`<span class="spinner"></span>`)); }
      const status = body.querySelector("#addStatus").value;
      const [cover, summary] = await Promise.all([
        r.coverUrl ? measureCover(r.coverUrl) : Promise.resolve({}),
        r.olKey ? findSummary(r) : Promise.resolve(""),
      ]);
      const b = newBook({ ...r, status, summary, coverAspect: cover.aspect, spineColor: cover.color || undefined });
      if (cover.color) { b.edgeV = 2; b.edgeInset = cover.inset; }
      state.books.push(b); save();
      state.filter = ""; document.getElementById("filter").value = "";
      if (state.shelf !== "all" && state.shelf !== status) state.shelf = status;
      render();
      toast(`“${b.title}” is on your shelf`);
      openBook(b.id);
    }
    showSheet(sheet);
    setTimeout(() => input.focus(), 50);
  }

  function openCustomize() {
    const sheet = document.getElementById("customizeSheet");
    const draw = () => {
      const s = state.settings;
      const scroll = sheet.scrollTop;
      sheet.replaceChildren(closeBtn());
      const body = h(`<div class="sheetBody padded"><div><h2 class="sheetTitle">Customize</h2><p class="hint">Changes show on your shelf straight away.</p></div></div>`);
      const set = (patch) => { Object.assign(state.settings, patch); save(); render(); draw(); };

      const themes = h(`<div class="group"><h3 class="label">Theme</h3><div class="themes"></div></div>`);
      for (const [k, { label, t }] of Object.entries(THEMES)) {
        const btn = h(`<button class="themeBtn" aria-pressed="${s.theme === k}"><span class="swatch" style="background:${t[0]};border-color:${t[6]}"><i style="left:10%;right:10%;bottom:0;height:45%;background:${t[2]};border-radius:3px 3px 0 0"></i><i style="left:10%;top:22%;width:40%;height:4px;border-radius:2px;background:${t[1]}"></i></span>${label}</button>`);
        btn.onclick = () => set({ theme: k });
        themes.lastElementChild.append(btn);
      }
      body.append(themes);

      const colorRow = (title, hint, value, options, onPick, id, labels) => {
        const g = h(`<div class="group"><h3 class="label">${title}</h3>${hint ? `<p class="hint">${hint}</p>` : ""}<div class="colors"></div></div>`);
        const wrap = g.querySelector(".colors");
        const isPreset = options.some(([, c]) => c.toLowerCase() === value.toLowerCase());
        for (const [label, c] of options) {
          const on = c.toLowerCase() === value.toLowerCase();
          const b = h(`<button class="colorItem" aria-label="${label}" aria-pressed="${on}"><span class="dot ${on ? "on" : ""}" style="background:${c};color:${inkOn(c)}">${on ? "✓" : ""}</span>${labels ? label : ""}</button>`);
          b.onclick = () => onPick(c); wrap.append(b);
        }
        const custom = h(`<label class="colorItem" for="${id}"><span class="dot custom ${!isPreset ? "on" : ""}" ${!isPreset ? `style="background:${value}"` : ""}><input type="color" id="${id}" value="${value}"></span>${labels ? "Custom" : ""}</label>`);
        custom.querySelector("input").onchange = (e) => onPick(e.target.value);
        wrap.append(custom);
        return g;
      };
      body.append(colorRow("Accent colour", "Stars, buttons and highlights.", s.accent, ACCENTS.map((c) => [c, c]), (accent) => set({ accent }), "c-accent", false));
      body.append(colorRow("Shelf colour", "", s.shelf, SHELVES, (shelf) => set({ shelf }), "c-shelf", true));

      const fin = h(`<div class="group"><h3 class="label">Cover finish</h3><p class="hint">New books get this finish. You can still change any single book from its page.</p>
        <div class="row"><div class="seg"><button data-v="matte" aria-pressed="${s.finish === "matte"}">Matte</button><button data-v="glossy" aria-pressed="${s.finish === "glossy"}">Glossy</button></div>
        <button class="btn small" id="allFinish">Make every book ${s.finish}</button></div></div>`);
      fin.querySelectorAll(".seg button").forEach((b) => (b.onclick = () => set({ finish: b.dataset.v })));
      fin.querySelector("#allFinish").onclick = () => { state.books.forEach((b) => (b.finish = s.finish)); save(); render(); toast(`Every book is now ${s.finish}`); };
      body.append(fin);

      const fonts = h(`<div class="group"><h3 class="label">Spine font</h3><p class="hint">Used on every spine unless a book has its own font.</p><div class="fonts"></div>
        <button class="btn small" id="allFonts" style="align-self:flex-start">Use it on every book</button></div>`);
      for (const [k, f] of Object.entries(FONTS)) {
        const b = h(`<button class="fontBtn" aria-pressed="${s.spineFont === k}"><span class="sample" style="font-family:${f.family};font-weight:${f.weight};${f.upper ? "text-transform:uppercase" : ""}">The Bell Jar</span><span class="name">${f.label}</span></button>`);
        b.onclick = () => set({ spineFont: k });
        fonts.querySelector(".fonts").append(b);
      }
      fonts.querySelector("#allFonts").onclick = () => { state.books.forEach((b) => { b.spineFont = null; if (b.spineDesign) b.spineDesign.title.font = s.spineFont; }); save(); render(); toast("Every spine title now uses this font"); };
      body.append(fonts);

      const backup = h(`<div class="group"><h3 class="label">Backup</h3>
        <p class="hint">Your books live only in this browser. Save a backup now and then, and before clearing browser data or switching phones.</p>
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
    draw();
    showSheet(sheet);
  }

  // ---------------------------------------------------------------- wire up
  document.getElementById("fab").onclick = () => openAdd("");
  document.getElementById("addTopBtn").onclick = () => openAdd("");
  document.getElementById("customizeBtn").onclick = openCustomize;
  const filter = document.getElementById("filter");
  let ft = 0;
  filter.oninput = () => { clearTimeout(ft); ft = setTimeout(() => { state.filter = filter.value; render(); }, 150); };

  load();
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
      save();
    }
    for (const b of state.books.filter((x) => !x.summary && !x.summaryTried)) {
      const s = await findSummary(b);
      b.summaryTried = true;
      if (s) b.summary = s;
      save();
    }
  })();
})();
