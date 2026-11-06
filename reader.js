/* Shelf: read your own EPUBs inside the app.
   Files are kept in this browser (IndexedDB), never uploaded anywhere. epub.js does the page layout. */
(() => {
  const { h, esc, toast, byId, save, render } = window.Shelf;

  // ------------------------------------------------------------------ storage
  const dbp = new Promise((resolve, reject) => {
    const r = indexedDB.open("shelf-files", 1);
    r.onupgradeneeded = () => { r.result.createObjectStore("epubs"); r.result.createObjectStore("locs"); };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
  async function idb(store, mode, fn) {
    const d = await dbp;
    return new Promise((resolve, reject) => {
      const tx = d.transaction(store, mode); const req = fn(tx.objectStore(store));
      tx.oncomplete = () => resolve(req ? req.result : undefined);
      tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
    });
  }
  const getFile = (id) => idb("epubs", "readonly", (s) => s.get(id));
  async function storeFile(id, file) {
    const data = await file.arrayBuffer();
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    await idb("epubs", "readwrite", (s) => s.put({ data, name: file.name, size: file.size, added: Date.now() }, id));
    await idb("locs", "readwrite", (s) => s.delete(id));
    const b = byId(id);
    if (b) { b.hasEpub = true; b.epubName = file.name; b.readCfi = null; b.readPct = 0; save(); render(); }
  }
  async function removeFile(id) {
    await idb("epubs", "readwrite", (s) => s.delete(id));
    await idb("locs", "readwrite", (s) => s.delete(id));
    const b = byId(id);
    if (b) { b.hasEpub = false; b.epubName = null; save(); render(); }
  }

  // epub.js + JSZip live in /lib and load only when needed
  let libs = null;
  const loadScript = (src) => new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("Couldn't load the reader")); document.head.append(s); });
  const loadLibs = () => (libs = libs || loadScript("lib/jszip.min.js?v=1").then(() => loadScript("lib/epub.min.js?v=1")));

  /** Read title, author and cover from an EPUB so it can become a book on the shelf. */
  async function importEpub(file) {
    await loadLibs();
    const book = window.ePub(await file.arrayBuffer());
    await book.ready;
    const meta = await book.loaded.metadata;
    let cover = null;
    try {
      const url = await book.coverUrl();
      if (url) cover = await shrink(url);
    } catch (e) { /* no cover */ }
    book.destroy();
    return { title: (meta.title || file.name.replace(/\.epub$/i, "")).trim(), author: (meta.creator || "").trim(), coverUrl: cover };
  }
  function shrink(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, 520 / img.naturalWidth);
        const c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.84));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  // ------------------------------------------------------------------ the reading room
  const THEMES = {
    paper: { bg: "#f6f1e7", fg: "#2b2620", label: "Paper" },
    white: { bg: "#ffffff", fg: "#1d1d1f", label: "White" },
    sepia: { bg: "#efe0c2", fg: "#4a3a24", label: "Sepia" },
    dusk: { bg: "#23232a", fg: "#d8d4cb", label: "Dusk" },
    night: { bg: "#000000", fg: "#b9b5ad", label: "Night" },
  };
  const FAMILIES = {
    book: { label: "Book's own", css: null },
    serif: { label: "Serif", css: "Georgia, 'Iowan Old Style', 'Palatino Linotype', serif" },
    sans: { label: "Sans", css: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" },
  };
  const PREF = "shelf.reader.v1";
  let pref = { theme: "look", size: 105, family: "book", spacing: 1.5 };
  try { pref = { ...pref, ...(JSON.parse(localStorage.getItem(PREF)) || {}) }; } catch (e) { /* defaults */ }
  const savePref = () => { try { localStorage.setItem(PREF, JSON.stringify(pref)); } catch (e) { /* ignore */ } };

  const room = h(`<div class="reader" hidden role="dialog" aria-label="Reader">
    <header class="rdTop"><button class="rdBtn" data-a="close" aria-label="Close the book">✕</button><div class="rdTitle"></div>
      <button class="rdBtn rdMusicBtn" data-a="music" aria-label="Music"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg></button><button class="rdBtn rdPenBtn" data-a="pen" aria-label="Highlighter"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="m14.5 4.5 5 5-8.5 8.5H6v-5z"/><path d="M6 13l5 5"/><path d="M3.5 21h7" class="rdPenInk"/></svg></button><button class="rdBtn rdMarkBtn" data-a="bookmark" aria-label="Bookmark this page"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M6.5 3.5h11v17l-5.5-4-5.5 4z"/></svg></button><button class="rdBtn" data-a="toc" aria-label="Chapters, bookmarks and highlights">☰</button><button class="rdBtn" data-a="aa" aria-label="Text settings">Aa</button></header>
    <div class="rdView"></div>
    <footer class="rdBottom"><input type="range" class="rdScrub" min="0" max="100" step="0.1" value="0" aria-label="Jump to a place in the book" disabled><div class="rdInfo"><span class="rdChapter"></span><span class="rdPct">…</span></div></footer>
    <div class="rdPens" hidden></div>
    <div class="rdRibbon" hidden></div>
    <div class="rdPanel" data-p="aa" hidden></div>
    <div class="rdPanel rdTocPanel" data-p="toc" hidden></div>
    <div class="rdPanel rdMusic" data-p="music" hidden></div>
    <div class="rdLoading">Opening…</div>
  </div>`);
  document.body.append(room);

  let cur = null; // { id, book, rendition }
  const view = room.querySelector(".rdView");
  const panels = room.querySelectorAll(".rdPanel");
  const showPanel = (name) => panels.forEach((p) => (p.hidden = p.dataset.p !== name || !p.hidden));
  const hidePanels = () => panels.forEach((p) => (p.hidden = true));
  const toggleChrome = () => room.classList.toggle("bare");

  // each look has its own page colours; they're used unless you picked others while on that look
  const currentLook = () => (window.Shelf.lookKey ? window.Shelf.lookKey() : "") || "minimal";
  const lookPage = () => { const P = (window.Decor && window.Decor.READER_PAGES) || {}; return P[currentLook()] || THEMES.paper; };
  const usingLook = () => !pref.theme || pref.theme === "look" || pref.chosenFor !== currentLook();
  const pageTheme = () => (usingLook() ? { ...lookPage(), label: "Match look" } : THEMES[pref.theme] || THEMES.paper);
  const isDark = (hex) => { const n = parseInt(String(hex).slice(1), 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 110; };
  function applyLook() {
    const t = pageTheme();
    room.style.setProperty("--rd-bg", t.bg); room.style.setProperty("--rd-fg", t.fg);
    room.dataset.dark = isDark(t.bg) ? "1" : "";
    if (!cur) return;
    const r = cur.rendition;
    const fam = FAMILIES[pref.family] && FAMILIES[pref.family].css;
    r.themes.default({
      html: { background: t.bg + " !important" },
      body: { background: t.bg + " !important", color: t.fg + " !important", "line-height": pref.spacing + " !important", ...(fam ? { "font-family": fam + " !important" } : {}) },
      "p, li, blockquote, span, div": { color: "inherit !important", "line-height": "inherit !important", ...(fam ? { "font-family": "inherit !important" } : {}) },
      a: { color: "inherit !important" },
      img: { "max-width": "100% !important" },
    });
    r.themes.fontSize(pref.size + "%");
    setTimeout(() => { paintAll(); schedulePrime(); }, 350);
  }

  // ------------------------------------------------------------------ music remote
  const musicPanel = room.querySelector('[data-p="music"]');
  const musicBtn = room.querySelector(".rdMusicBtn");
  const ICON = {
    prev: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>',
    next: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>',
    play: '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M6 4.5h4.5v15H6zM13.5 4.5H18v15h-4.5z"/></svg>',
  };
  function drawMusic() {
    const M = window.ShelfMusic;
    if (!M || !M.connected()) {
      musicPanel.replaceChildren(h(`<p class="rdHint">Connect Spotify from the Music button on your shelf, then you can control it from here.</p>`));
      return;
    }
    const n = M.now;
    musicPanel.replaceChildren(h(`<div class="rdNow">
      <div class="rdArt">${n.cover ? `<img alt="" src="${esc(n.cover)}" onerror="this.remove()">` : ""}</div>
      <div class="rdSong"><b>${esc(n.title || "Nothing playing")}</b><span>${esc(n.artist || "Pick something from Music on your shelf")}</span></div>
      <div class="rdCtl">
        <button class="rdBtn" data-m="prev" aria-label="Previous song">${ICON.prev}</button>
        <button class="rdBtn rdPlay" data-m="toggle" aria-label="${n.playing ? "Pause" : "Play"}">${n.playing ? ICON.pause : ICON.play}</button>
        <button class="rdBtn" data-m="next" aria-label="Next song">${ICON.next}</button>
      </div></div>`));
  }
  musicPanel.addEventListener("click", (e) => {
    const b = e.target.closest("[data-m]"); const M = window.ShelfMusic; if (!b || !M) return;
    M[b.dataset.m]();
    if (b.dataset.m === "toggle") { M.now.playing = !M.now.playing; drawMusic(); }
  });
  const syncMusic = () => {
    const M = window.ShelfMusic;
    musicBtn.classList.toggle("on", !!(M && M.now.playing));
    if (!musicPanel.hidden) drawMusic();
  };
  if (window.ShelfMusic) window.ShelfMusic.listen(syncMusic);
  else window.addEventListener("load", () => window.ShelfMusic && window.ShelfMusic.listen(syncMusic));

  function drawAa() {
    const p = room.querySelector('[data-p="aa"]');
    p.replaceChildren(h(`<div class="rdSet">
      <div class="rdRow"><span>Text size</span><button class="rdChip" data-s="-">A−</button><b>${pref.size}%</b><button class="rdChip" data-s="+">A+</button></div>
      <div class="rdRow"><span>Font</span>${Object.entries(FAMILIES).map(([k, f]) => `<button class="rdChip" data-f="${k}" aria-pressed="${pref.family === k}">${f.label}</button>`).join("")}</div>
      <div class="rdRow"><span>Spacing</span>${[1.3, 1.5, 1.8].map((v, i) => `<button class="rdChip" data-l="${v}" aria-pressed="${pref.spacing === v}">${["Tight", "Normal", "Airy"][i]}</button>`).join("")}</div>
      <div class="rdRow rdThemes">${[["look", { ...lookPage(), label: "Match look" }], ...Object.entries(THEMES)].map(([k, t]) => `<button class="rdTheme" data-t="${k}" aria-pressed="${k === "look" ? usingLook() : !usingLook() && pref.theme === k}" style="background:${t.bg};color:${t.fg}">${t.label}</button>`).join("")}</div>
    </div>`));
    p.querySelectorAll("[data-s]").forEach((b) => (b.onclick = () => { pref.size = Math.max(70, Math.min(200, pref.size + (b.dataset.s === "+" ? 10 : -10))); savePref(); applyLook(); drawAa(); }));
    p.querySelectorAll("[data-f]").forEach((b) => (b.onclick = () => { pref.family = b.dataset.f; savePref(); applyLook(); drawAa(); }));
    p.querySelectorAll("[data-l]").forEach((b) => (b.onclick = () => { pref.spacing = +b.dataset.l; savePref(); applyLook(); drawAa(); }));
    p.querySelectorAll("[data-t]").forEach((b) => (b.onclick = () => { pref.theme = b.dataset.t; pref.chosenFor = b.dataset.t === "look" ? "" : currentLook(); savePref(); applyLook(); drawAa(); }));
  }

  let tocTab = "chapters";
  function drawToc() {
    const p = room.querySelector('[data-p="toc"]');
    const b = book_() || {};
    const tabs = h(`<div class="rdTabs">${[["chapters", "Chapters"], ["bookmarks", "Bookmarks"], ["highlights", "Highlights"]].map(([k, l]) => `<button class="rdChip" data-tab="${k}" aria-pressed="${tocTab === k}">${l}</button>`).join("")}</div>`);
    tabs.querySelectorAll("[data-tab]").forEach((x) => (x.onclick = () => { tocTab = x.dataset.tab; drawToc(); }));
    const go = (cfi) => { hidePanels(); cur.rendition.display(cfi); };
    if (tocTab === "bookmarks") {
      const list = h(`<div class="rdToc"></div>`);
      const bm = [...(b.bookmarks || [])].sort((x, y) => (x.pct || 0) - (y.pct || 0));
      bm.forEach((m) => {
        const row = h(`<div class="rdMarkRow"><button class="rdTocItem"><b>${esc(m.chapter || "Page")}</b><span>${Math.round((m.pct || 0) * 100)}% · ${new Date(m.at).toLocaleDateString()}</span></button><button class="rdBtn" aria-label="Remove bookmark">✕</button></div>`);
        row.firstElementChild.onclick = () => go(m.cfi);
        row.lastElementChild.onclick = () => { b.bookmarks = b.bookmarks.filter((x) => x !== m); save(); syncBookmark(); drawToc(); };
        list.append(row);
      });
      if (!bm.length) list.append(h(`<p class="rdHint">No bookmarks yet. Tap the ribbon at the top to mark the page you're on.</p>`));
      return p.replaceChildren(tabs, list);
    }
    if (tocTab === "highlights") {
      const list = h(`<div class="rdToc"></div>`);
      const hs = [...(b.highlights || [])];
      try { const c = CFI(); hs.sort((x, y) => c.compare(x.cfi, y.cfi)); } catch (e) { /* keep order */ }
      hs.forEach((hl) => {
        const row = h(`<div class="rdMarkRow"><button class="rdTocItem rdQuote"><span class="rdSwatch" style="background:${penColour(hl.colour)}"></span><q>${esc(hl.text || "")}</q></button><button class="rdBtn" aria-label="Remove highlight">✕</button></div>`);
        row.firstElementChild.onclick = () => go(hl.cfi);
        row.lastElementChild.onclick = () => { b.highlights = b.highlights.filter((x) => x !== hl); save(); paintAll(); drawToc(); };
        list.append(row);
      });
      if (!hs.length) list.append(h(`<p class="rdHint">No highlights yet. Tap the highlighter at the top, pick a colour and run your finger over the words.</p>`));
      return p.replaceChildren(tabs, list);
    }
    const toc = (cur && cur.book.navigation && cur.book.navigation.toc) || [];
    const list = h(`<div class="rdToc"></div>`);
    const add = (items, depth) => items.forEach((it) => {
      const b = h(`<button class="rdTocItem" style="padding-left:${12 + depth * 14}px">${esc((it.label || "").trim() || "Untitled")}</button>`);
      b.onclick = () => { hidePanels(); cur.rendition.display(it.href); };
      list.append(b);
      if (it.subitems && it.subitems.length) add(it.subitems, depth + 1);
    });
    add(toc, 0);
    if (!toc.length) list.append(h(`<p class="rdHint">This book has no chapter list.</p>`));
    p.replaceChildren(tabs, list);
  }

  const chapterName = (href) => {
    if (!cur || !href) return "";
    const flat = []; const walk = (a) => a.forEach((i) => { flat.push(i); if (i.subitems) walk(i.subitems); });
    walk((cur.book.navigation && cur.book.navigation.toc) || []);
    const base = href.split("#")[0];
    const hit = flat.find((i) => (i.href || "").split("#")[0].endsWith(base) || base.endsWith((i.href || "").split("#")[0]));
    return hit ? hit.label.trim() : "";
  };

  // ------------------------------------------------------------------ page turning with a real paper curl
  // The page you are turning is a frozen copy of the current page. While you drag, the real reader has
  // already moved underneath, so the next page is revealed as the paper folds over along a line that
  // follows your finger. The back of the folded part shows the text faintly mirrored, like thin paper.
  const gesture = h(`<div class="rdGesture" aria-hidden="true"></div>`);
  room.append(gesture);
  let turn = null;

  const viewRect = () => view.getBoundingClientRect();
  function layoutGesture() { const r = viewRect(); Object.assign(gesture.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" }); }
  addEventListener("resize", () => { if (!room.hidden) layoutGesture(); });

  function pageFrame() {
    const cont = view.querySelector(".epub-container") || view;
    const cr = cont.getBoundingClientRect();
    let best = null, bestArea = 0;
    cont.querySelectorAll("iframe").forEach((f) => {
      const r = f.getBoundingClientRect();
      const area = Math.max(0, Math.min(r.right, cr.right) - Math.max(r.left, cr.left)) * Math.max(0, Math.min(r.bottom, cr.bottom) - Math.max(r.top, cr.top));
      if (area > bestArea) { best = f; bestArea = area; }
    });
    return best;
  }
  /** A frozen copy of what is on screen right now, loaded straight into `parent`
   *  (an iframe reloads if it is moved, so it is never moved after this). */
  function snapshot(parent, at) {
    return new Promise((resolve) => {
      const vr = viewRect(), frame = pageFrame();
      const wrap = h(`<div class="rdLayer"></div>`);
      Object.assign(wrap.style, { left: (at ? at.left : 0) + "px", top: (at ? at.top : 0) + "px", width: vr.width + "px", height: vr.height + "px" }, at && at.z ? { zIndex: at.z } : {}, at && at.hidden ? { visibility: "hidden" } : {});
      parent.append(wrap);
      if (!frame || !frame.contentDocument) return resolve(wrap);
      const fr = frame.getBoundingClientRect();
      const copy = document.createElement("iframe");
      copy.setAttribute("sandbox", "allow-same-origin");
      copy.setAttribute("tabindex", "-1");
      Object.assign(copy.style, { position: "absolute", border: "0", left: fr.left - vr.left + "px", top: fr.top - vr.top + "px", width: fr.width + "px", height: fr.height + "px", pointerEvents: "none" });
      let done = false; const finish = () => { if (!done) { done = true; resolve(wrap); } };
      copy.onload = () => setTimeout(finish, 30);
      setTimeout(finish, 700);
      // styles the reader adds at run time (page colour, spacing) live only in the CSSOM, so carry them over by hand
      const doc = frame.contentDocument;
      let extra = "";
      for (const sh of doc.styleSheets) { try { extra += [...sh.cssRules].map((r) => r.cssText).join("\n") + "\n"; } catch (e) { /* cross-origin sheet */ } }
      const html = doc.documentElement.outerHTML.replace(/<\/head>/i, `<style>${extra.replace(/<\/style/gi, "<\\/style")}</style></head>`);
      copy.srcdoc = "<!DOCTYPE html>" + html;
      wrap.append(copy);
    });
  }

  // clip a convex polygon to the half-plane where keep(p) >= 0
  function clipPoly(poly, val) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], va = val(a), vb = val(b);
      if (va >= 0) out.push(a);
      if ((va >= 0) !== (vb >= 0)) { const t = va / (va - vb); out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }); }
    }
    return out;
  }
  const polyCss = (pts) => (pts.length < 3 ? "polygon(0 0, 0 0, 0 0)" : `polygon(${pts.map((p) => `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`).join(",")})`);

  /** Draw the curl with the page's free edge at x = f and the finger at height fy (page coordinates). */
  function drawTurn(f, fy) {
    const t = turn, W = t.W, H = t.H;
    const C = { x: W, y: t.y0 }, F = { x: f, y: fy };
    let ux = C.x - F.x, uy = C.y - F.y; const len = Math.hypot(ux, uy);
    const rect = [{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H }, { x: 0, y: H }];
    if (len < 1) {
      t.front.style.clipPath = "none"; t.back.style.display = "none"; t.shUnder.style.display = t.shFlat.style.display = "none"; return;
    }
    ux /= len; uy /= len;
    const M = { x: (C.x + F.x) / 2, y: (C.y + F.y) / 2 };
    const side = (p) => (p.x - M.x) * ux + (p.y - M.y) * uy;
    const flat = clipPoly(rect, (p) => -side(p)), flap = clipPoly(rect, side);
    const angU = Math.atan2(uy, ux) * 180 / Math.PI, angV = angU + 90;
    t.front.style.clipPath = polyCss(flat);
    t.back.style.display = t.shUnder.style.display = t.shFlat.style.display = "";
    // the folded-back part: the page's flap mirrored across the fold line
    t.backInner.style.transformOrigin = `${M.x}px ${M.y}px`;
    t.backInner.style.transform = `rotate(${angV}deg) scaleY(-1) rotate(${-angV}deg)`;
    t.backInner.style.clipPath = polyCss(flap);
    const flapW = len / 2, big = 3 * Math.max(W, H);
    const band = (el, from, width, ang) => Object.assign(el.style, { left: from.x + "px", top: from.y - big / 2 + "px", width: Math.max(1, width) + "px", height: big + "px", transform: `rotate(${ang}deg)` });
    band(t.backShade, M, flapW + 2, angU);
    // shadow the lifted paper throws on the page underneath, and the darkening where the page bends
    t.shUnder.style.clipPath = polyCss(flap);
    band(t.shUnderBand, M, Math.min(flapW, 140) + 2, angU);
    t.shUnderBand.style.opacity = Math.min(1, flapW / 40);
    t.shFlat.style.clipPath = polyCss(flat);
    band(t.shFlatBand, M, Math.min(60, flapW + 10), angU + 180);
  }

  // The copies of the page a turn needs take a moment to build, so they are made ahead of time, right
  // after each page settles. A turn then starts the instant your finger moves.
  let primed = null, primeTimer = 0, primeGen = 0;
  function dropPrime() { primeGen++; if (primed) { primed.front.remove(); primed.back.remove(); primed = null; } }
  function schedulePrime() { clearTimeout(primeTimer); dropPrime(); primeTimer = setTimeout(prime, 260); }
  async function prime() {
    if (!cur || turn || room.hidden) return;
    const gen = ++primeGen;
    const vr = viewRect();
    const paper = getComputedStyle(room).getPropertyValue("--rd-bg").trim() || "#f6f1e7";
    const back = h(`<div class="rdLayer rdBack"></div>`);
    Object.assign(back.style, { left: vr.left + "px", top: vr.top + "px", width: vr.width + "px", height: vr.height + "px", zIndex: 6, display: "none" });
    const backInner = h(`<div class="rdBackInner"></div>`); backInner.style.background = paper; back.append(backInner);
    room.append(back);
    const p = { back, backInner, front: null, ready: false };
    const [front, copy] = await Promise.all([snapshot(room, { left: vr.left, top: vr.top, z: 4, hidden: true }), snapshot(backInner)]);
    front.style.visibility = "hidden"; copy.style.opacity = "0.16"; p.front = front;
    if (gen !== primeGen || turn || !cur || primed) { front.remove(); back.remove(); return; }
    p.ready = true; primed = p;
  }
  addEventListener("resize", () => { if (!room.hidden) schedulePrime(); });

  async function beginTurn(dir, y0) {
    if (turn || !cur) return null;
    const loc = cur.rendition.currentLocation && cur.rendition.currentLocation();
    if (loc && ((dir === "next" && loc.atEnd) || (dir === "prev" && loc.atStart))) return null;
    const vr = viewRect();
    const t = turn = { dir, W: vr.width, H: vr.height, y0, ready: false, f: dir === "next" ? vr.width : -vr.width, fy: y0, layers: [] };
    clearTimeout(primeTimer); primeGen++;
    const p = primed && primed.ready ? primed : null; primed = null;
    const paper = getComputedStyle(room).getPropertyValue("--rd-bg").trim() || "#f6f1e7";
    const at = (z) => ({ left: vr.left, top: vr.top, z });
    const layer = (cls, z) => { const el = h(`<div class="${cls}"></div>`); Object.assign(el.style, { left: vr.left + "px", top: vr.top + "px", width: vr.width + "px", height: vr.height + "px", zIndex: z }); room.append(el); t.layers.push(el); return el; };
    const mk = (cls) => h(`<div class="${cls}"></div>`);
    // the folded-back part and the shadows, hidden until the first frame is drawn
    t.shUnder = layer("rdLayer rdShade", 5); t.shUnderBand = mk("rdBand rdBandUnder"); t.shUnder.append(t.shUnderBand);
    t.shFlat = layer("rdLayer rdShade", 5); t.shFlatBand = mk("rdBand rdBandFlat"); t.shFlat.append(t.shFlatBand);
    if (p && dir === "next") { t.back = p.back; t.backInner = p.backInner; t.layers.push(p.back); }
    else {
      if (p) p.back.remove();
      t.back = layer("rdLayer rdBack", 6);
      t.backInner = mk("rdBackInner"); t.backInner.style.background = paper; t.back.append(t.backInner);
    }
    t.backShade = mk("rdBand rdBandBack");
    [t.shUnder, t.shFlat, t.back].forEach((el) => (el.style.display = "none"));
    const addShade = () => t.backInner.append(t.backShade); // keep the fold shading above the mirrored text
    if (dir === "next") {
      if (p) { t.front = p.front; p.front.style.visibility = ""; }
      else { t.front = await snapshot(room, at(4)); const bc = await snapshot(t.backInner); bc.style.opacity = "0.16"; }
      t.layers.push(t.front);
      // the real page moves on underneath while the paper starts to lift
      t.moving = cur.rendition.next();
      if (!p) await t.moving;
    } else {
      const under = p ? p.front : await snapshot(room, at(1));
      under.style.zIndex = 1; under.style.visibility = ""; t.layers.push(under);
      view.style.zIndex = 2; t.front = view; view.style.clipPath = polyCss([]);
      t.moving = cur.rendition.prev();
      await t.moving;
      snapshot(t.backInner).then((bc) => { bc.style.opacity = "0.16"; addShade(); });
    }
    addShade();
    t.ready = true;
    drawTurn(t.f, t.fy);
    return t;
  }

  function animateTurn(to, fyTo, ms, curve) {
    const t = turn, f0 = t.f, y0 = t.fy, start = performance.now();
    return new Promise((resolve) => {
      const step = (now) => {
        const k = Math.min(1, (now - start) / ms), e = 1 - Math.pow(1 - k, 3);
        t.f = f0 + (to - f0) * e; t.fy = y0 + (fyTo - y0) * e - (curve ? Math.sin(k * Math.PI) * curve : 0);
        drawTurn(t.f, t.fy);
        if (k < 1) requestAnimationFrame(step); else resolve();
      };
      requestAnimationFrame(step);
    });
  }

  async function endTurn(complete) {
    const t = turn; if (!t) return;
    const W = t.W;
    const target = complete ? (t.dir === "next" ? -W : W) : (t.dir === "next" ? W : -W);
    const dist = Math.abs(target - t.f) / (2 * W);
    await animateTurn(target, t.y0, 160 + 340 * dist, 0);
    if (t.moving) await t.moving;
    if (!complete && cur) { if (t.dir === "next") await cur.rendition.prev(); else await cur.rendition.next(); }
    t.layers.forEach((l) => l.remove());
    view.style.clipPath = ""; view.style.zIndex = "";
    turn = null; schedulePrime();
  }

  /** A whole turn without a finger: for taps on the page edges and the arrow keys. */
  async function autoTurn(dir) {
    if (turn || !cur) return;
    hidePanels();
    const H = viewRect().height;
    const t = await beginTurn(dir, H * 0.88); if (!t) return;
    const W = t.W;
    await animateTurn(dir === "next" ? -W : W, H * 0.88, 520, H * 0.06);
    if (t.moving) await t.moving;
    t.layers.forEach((l) => l.remove());
    view.style.clipPath = ""; view.style.zIndex = "";
    turn = null; schedulePrime();
  }

  // ------------------------------------------------------------------ highlighter pens and bookmarks
  // Highlights are stored as CFI ranges on the book (b.highlights) and painted as marker strokes inside the
  // page itself, so they move with the text, show in the page-curl copy, and survive font changes.
  const PENS = [["yellow", "#ffe24a"], ["pink", "#ff86c3"], ["green", "#7ff07a"], ["blue", "#74ccff"], ["orange", "#ffad55"], ["purple", "#c49cff"]];
  const penColour = (k) => (PENS.find((p) => p[0] === k) || PENS[0])[1];
  const pen = { on: false, colour: (pref.pen || "yellow"), erase: false, stroke: null };
  const pensEl = room.querySelector(".rdPens"), ribbon = room.querySelector(".rdRibbon");
  const CFI = () => new window.ePub.CFI();
  const book_ = () => cur && byId(cur.id);

  function contentsFor(doc) { return cur && cur.rendition.getContents().find((c) => c.document === doc); }
  function caretAt(doc, x, y) {
    if (doc.caretRangeFromPoint) return doc.caretRangeFromPoint(x, y);
    const p = doc.caretPositionFromPoint && doc.caretPositionFromPoint(x, y);
    if (!p) return null; const r = doc.createRange(); r.setStart(p.offsetNode, p.offset); return r;
  }
  // grow a caret out to the edges of the word it sits in
  const isWord = (ch) => !!ch && /[\p{L}\p{N}'’\-]/u.test(ch);
  function wordEdge(node, off, dir) {
    if (!node || node.nodeType !== 3) return [node, off];
    const t = node.data;
    if (dir < 0) { while (off > 0 && isWord(t[off - 1])) off--; } else { while (off < t.length && isWord(t[off])) off++; }
    return [node, off];
  }
  function strokeRange(doc, a, b) {
    if (!a || !b) return null;
    const r = doc.createRange();
    let s = [a.startContainer, a.startOffset], e = [b.startContainer, b.startOffset];
    const before = a.compareBoundaryPoints(Range.START_TO_START, b) > 0;
    if (before) [s, e] = [e, s];
    s = wordEdge(s[0], s[1], -1); e = wordEdge(e[0], e[1], 1);
    try { r.setStart(s[0], s[1]); r.setEnd(e[0], e[1]); } catch (err) { return null; }
    return r.collapsed ? null : r;
  }
  // one marker stroke per line of text
  function lineRects(range) {
    const rs = [...range.getClientRects()].filter((r) => r.width > 1 && r.height > 1).sort((a, b) => a.top - b.top || a.left - b.left);
    const lines = [];
    rs.forEach((r) => {
      const l = lines.find((x) => Math.abs((x.top + x.bottom) / 2 - (r.top + r.bottom) / 2) < Math.min(x.bottom - x.top, r.height) * 0.5 && r.left < x.right + 40 && r.right > x.left - 40);
      if (l) { l.left = Math.min(l.left, r.left); l.right = Math.max(l.right, r.right); l.top = Math.min(l.top, r.top); l.bottom = Math.max(l.bottom, r.bottom); }
      else lines.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
    });
    return lines;
  }
  function overlay(doc) {
    let o = doc.getElementById("shelf-ink");
    if (!o) {
      o = doc.createElement("div"); o.id = "shelf-ink";
      o.setAttribute("style", "position:absolute;left:0;top:0;width:0;height:0;overflow:visible;pointer-events:none;z-index:2147483000");
      doc.documentElement.append(o);
    }
    // the whole layer blends with the page so the ink darkens paper but never the words
    o.style.mixBlendMode = room.dataset.dark === "1" ? "screen" : "multiply";
    return o;
  }
  const seed = (str, i) => { let x = i * 9301 + 49297; for (let k = 0; k < str.length; k += 7) x = (x * 31 + str.charCodeAt(k)) % 233280; return x / 233280; };
  function strokeEls(doc, range, colour, key, live) {
    const dark = room.dataset.dark === "1";
    const hr = doc.documentElement.getBoundingClientRect();
    return lineRects(range).map((l, i) => {
      const d = doc.createElement("div");
      const hgt = l.bottom - l.top, rnd = seed(key, i);
      const top = l.top - hr.top + hgt * 0.1, height = hgt * 0.84;
      const tilt = (rnd - 0.5) * 0.9, lift = (rnd - 0.5) * hgt * 0.08;
      const ink = colour;
      d.setAttribute("style", [
        "position:absolute", `left:${(l.left - hr.left - 3).toFixed(1)}px`, `top:${(top + lift).toFixed(1)}px`,
        `width:${(l.right - l.left + 6).toFixed(1)}px`, `height:${height.toFixed(1)}px`,
        // ink pools where the pen lands and lifts, and the chisel tip leaves soft, uneven ends
        `background:linear-gradient(90deg, ${ink}f2 0, ${ink}c4 7px, ${ink}b0 45%, ${ink}bd 85%, ${ink}ee 100%)`,
        `border-radius:${2 + rnd * 3}px ${5 + rnd * 4}px ${3 + rnd * 2}px ${6 - rnd * 3}px / ${45 + rnd * 20}% ${30 + rnd * 25}% ${55 - rnd * 15}% ${40 + rnd * 20}%`,
        `transform:rotate(${tilt.toFixed(2)}deg) skewX(-8deg)`,
        `opacity:${dark ? 0.5 : live ? 0.8 : 0.9}`,
        "box-shadow:0 0 0.6px " + ink,
      ].join(";"));
      return d;
    });
  }
  function paintMarks(contents) {
    const b = book_(); if (!b || !contents || !contents.document) return;
    const doc = contents.document, o = overlay(doc);
    o.replaceChildren();
    (b.highlights || []).forEach((hl) => {
      let r = null; try { r = contents.range(hl.cfi); } catch (e) { r = null; }
      if (!r || r.collapsed) return;
      strokeEls(doc, r, penColour(hl.colour), hl.cfi, false).forEach((el) => { el.dataset.hl = hl.cfi; o.append(el); });
    });
  }
  const paintAll = () => { if (cur) cur.rendition.getContents().forEach(paintMarks); };

  // the pen tray: real highlighters lying side by side
  function drawPens() {
    pensEl.replaceChildren(h(`<div class="rdPenTray"><div class="rdPenTop"><span class="rdPenUndo"></span><span class="rdPenName">${pen.erase ? "Eraser: tap a highlight" : pen.colour[0].toUpperCase() + pen.colour.slice(1) + " highlighter"}</span><button class="rdPenDone">Done</button></div><div class="rdPenRow">
      ${PENS.map(([k, c]) => `<button class="rdPen" data-pen="${k}" aria-label="${k} highlighter" aria-pressed="${!pen.erase && pen.colour === k}" style="--ink:${c}">
        <svg viewBox="0 0 30 96" width="30" height="96"><path class="tip" d="M9 14 L15 2 L21 9 L21 18 L9 18Z"/><rect class="collar" x="7" y="17" width="16" height="9" rx="2"/><rect class="body" x="5" y="25" width="20" height="70" rx="5"/><rect class="shine" x="8" y="30" width="3.5" height="58" rx="1.75"/><rect class="clip" x="12" y="40" width="6" height="34" rx="3"/></svg></button>`).join("")}
      <button class="rdPen rdEraser" data-pen="erase" aria-label="Eraser" aria-pressed="${pen.erase}">
        <svg viewBox="0 0 30 96" width="30" height="96"><rect x="5" y="8" width="20" height="26" rx="4" fill="#f2b8b0"/><rect x="5" y="30" width="20" height="65" rx="4" fill="#3d6fd1"/><rect x="8" y="36" width="3.5" height="52" rx="1.75" fill="#fff" opacity=".35"/></svg></button>
      </div></div>`));
    pensEl.querySelector(".rdPenUndo").replaceWith(window.Shelf.undoPair("penUndo"));
    pensEl.querySelectorAll("[data-pen]").forEach((b) => (b.onclick = () => {
      if (b.dataset.pen === "erase") pen.erase = !pen.erase;
      else { pen.erase = false; pen.colour = b.dataset.pen; pref.pen = pen.colour; savePref(); }
      drawPens();
    }));
    pensEl.querySelector(".rdPenDone").onclick = () => setPen(false);
  }
  function setPen(on) {
    pen.on = on; hidePanels();
    room.classList.toggle("penOn", on);
    pensEl.hidden = !on; if (on) { room.classList.remove("bare"); drawPens(); }
    room.querySelector(".rdPenBtn").setAttribute("aria-pressed", on);
  }

  function penDown(e) {
    const frame = pageFrame(); if (!frame || !frame.contentDocument) return;
    const doc = frame.contentDocument, fr = frame.getBoundingClientRect();
    const x = e.clientX - fr.left, y = e.clientY - fr.top;
    if (pen.erase) return eraseAt(doc, x, y);
    pen.stroke = { doc, fr, a: caretAt(doc, x, y), els: [] };
    try { gesture.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  }
  let penRaf = 0;
  function penMove(e) {
    const st = pen.stroke; if (!st) return;
    st.x = e.clientX; st.y = e.clientY;
    if (!penRaf) penRaf = requestAnimationFrame(() => { penRaf = 0; penDraw(); });
  }
  function penDraw() {
    const st = pen.stroke; if (!st || st.x == null) return;
    const e = { clientX: st.x, clientY: st.y };
    const r = strokeRange(st.doc, st.a, caretAt(st.doc, e.clientX - st.fr.left, e.clientY - st.fr.top));
    st.els.forEach((el) => el.remove()); st.els = []; st.range = r;
    if (!r) return;
    const o = overlay(st.doc);
    st.els = strokeEls(st.doc, r, penColour(pen.colour), "live", true); st.els.forEach((el) => o.append(el));
  }
  function penUp() {
    if (penRaf) { cancelAnimationFrame(penRaf); penRaf = 0; penDraw(); }
    const st = pen.stroke; pen.stroke = null; if (!st) return;
    st.els.forEach((el) => el.remove());
    const b = book_(), c = contentsFor(st.doc);
    if (!st.range || !b || !c) return;
    let cfi = null; try { cfi = c.cfiFromRange(st.range); } catch (err) { cfi = null; }
    if (!cfi) return;
    b.highlights = b.highlights || [];
    b.highlights.push({ cfi, colour: pen.colour, text: st.range.toString().replace(/\s+/g, " ").trim().slice(0, 400), at: Date.now() });
    save(); paintMarks(c); schedulePrime();
  }
  function eraseAt(doc, x, y) {
    const b = book_(); if (!b || !b.highlights) return;
    const hr = doc.documentElement.getBoundingClientRect();
    const hit = [...overlay(doc).children].find((el) => {
      const r = el.getBoundingClientRect();
      return x >= r.left - 4 && x <= r.right + 4 && y >= r.top - 4 && y <= r.bottom + 4;
    });
    if (!hit) return toast("Tap right on a highlight to rub it out");
    b.highlights = b.highlights.filter((hl) => hl.cfi !== hit.dataset.hl);
    save(); paintMarks(contentsFor(doc)); schedulePrime();
  }

  // undo / redo from anywhere: redraw the ink and the ribbon
  window.addEventListener("shelf:restored", () => { if (cur) { paintAll(); syncBookmark(); schedulePrime(); } });

  // bookmarks: the ribbon button marks the page you are on
  function pageMarks() {
    const b = book_(), loc = cur && cur.loc; if (!b || !loc || !loc.start) return [];
    const c = CFI();
    return (b.bookmarks || []).filter((m) => { try { return c.compare(m.cfi, loc.start.cfi) >= 0 && c.compare(m.cfi, loc.end.cfi) <= 0; } catch (e) { return false; } });
  }
  let ribbonT = 0;
  /** Shows the bookmark if this page has one. `animate` (only when you add or remove one) slides it
   *  out from under the top edge of the page, or draws it back up behind it. */
  function syncBookmark(animate) {
    const on = pageMarks().length > 0;
    const kind = (window.Shelf.settings() || {}).bookmark || "ribbon";
    if (ribbon.dataset.kind !== kind && window.Decor) { ribbon.dataset.kind = kind; ribbon.innerHTML = window.Decor.bookmarkSvg(kind, 28); }
    clearTimeout(ribbonT); ribbon.classList.remove("in", "out");
    if (animate && on) { ribbon.hidden = false; void ribbon.offsetWidth; ribbon.classList.add("in"); }
    else if (animate && !on && !ribbon.hidden) { ribbon.classList.add("out"); ribbonT = setTimeout(() => { ribbon.hidden = true; ribbon.classList.remove("out"); }, 380); }
    else ribbon.hidden = !on;
    room.querySelector(".rdMarkBtn").classList.toggle("on", on);
  }
  function toggleBookmark() {
    const b = book_(), loc = cur && cur.loc; if (!b || !loc || !loc.start) return;
    const here = pageMarks();
    if (here.length) { b.bookmarks = b.bookmarks.filter((m) => !here.includes(m)); toast("Bookmark removed"); }
    else {
      b.bookmarks = b.bookmarks || [];
      b.bookmarks.push({ cfi: loc.start.cfi, pct: b.readPct || 0, chapter: chapterName(loc.start.href), at: Date.now() });
      toast("Page bookmarked");
    }
    save(); syncBookmark(true);
  }

  // finger / mouse on the page
  let g = null;
  gesture.addEventListener("pointerdown", (e) => {
    if (turn || !cur) return;
    if (pen.on) return penDown(e);
    const r = gesture.getBoundingClientRect();
    g = { id: e.pointerId, x0: e.clientX - r.left, y0: e.clientY - r.top, cx: e.clientX, cy: e.clientY, t: performance.now(), v: 0, lastX: e.clientX, lastT: performance.now(), mode: null };
    try { gesture.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  });
  gesture.addEventListener("pointermove", (e) => {
    if (pen.on) return penMove(e);
    if (!g || e.pointerId !== g.id) return;
    const r = gesture.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const now = performance.now(); g.v = (e.clientX - g.lastX) / Math.max(1, now - g.lastT); g.lastX = e.clientX; g.lastT = now;
    g.x = x; g.y = y;
    if (!g.mode) {
      const dx = x - g.x0, dy = y - g.y0;
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy)) return;
      g.mode = "turn"; g.dir = dx < 0 ? "next" : "prev";
      hidePanels();
      beginTurn(g.dir, g.y0).then((t) => { if (!t) g && (g.mode = "none"); else if (g && g.x !== undefined) follow(); });
      return;
    }
    if (g.mode === "turn") follow();
  });
  let followRaf = 0;
  function follow() { if (!followRaf) followRaf = requestAnimationFrame(() => { followRaf = 0; followNow(); }); }
  function followNow() {
    if (!turn || !turn.ready || !g) return;
    const W = turn.W;
    turn.f = turn.dir === "next" ? Math.min(W, W + (g.x - g.x0)) : Math.max(-W, Math.min(W, -W + (g.x - g.x0)));
    turn.fy = g.y;
    drawTurn(turn.f, turn.fy);
  }
  const release = async (e) => {
    if (pen.on) return penUp();
    if (!g || e.pointerId !== g.id) return;
    const gg = g; g = null;
    if (performance.now() - gg.lastT > 90) gg.v = 0; // a finger that stopped before letting go isn't a flick
    if (gg.mode === "turn") {
      // wait until the turn is set up, then let go
      while (turn && !turn.ready) await new Promise((r) => setTimeout(r, 16));
      if (!turn) return;
      const W = turn.W;
      const complete = turn.dir === "next" ? (turn.f < W * 0.6 || gg.v < -0.35) : (turn.f > -W * 0.6 || gg.v > 0.35);
      return endTurn(complete && !(turn.dir === "next" && gg.v > 0.35) && !(turn.dir === "prev" && gg.v < -0.35));
    }
    if (gg.mode || e.type === "pointercancel") return;
    // a tap: edges turn the page, links work, the middle shows or hides the bars
    const W = gesture.clientWidth;
    if (gg.x0 < W * 0.22) return autoTurn("prev");
    if (gg.x0 > W * 0.78) return autoTurn("next");
    const frame = pageFrame();
    if (frame && frame.contentDocument) {
      const fr = frame.getBoundingClientRect();
      const el = frame.contentDocument.elementFromPoint(gg.cx - fr.left, gg.cy - fr.top);
      const a = el && el.closest && el.closest("a[href]");
      if (a) { a.click(); return; }
    }
    if (![...panels].every((p) => p.hidden)) return hidePanels();
    toggleChrome();
  };
  gesture.addEventListener("pointerup", release);
  gesture.addEventListener("pointercancel", release);

  /** The book you picked lifts off the shelf towards you, its cover swings open, the room fades to black.
   *  Resolves (with the overlay) once the screen is black, so the reader can appear underneath. */
  /** The book on screen that stands for `b`: its big cover on the open book page, or its slot on the shelf. */
  function bookOnScreen(b) {
    const slots = [...document.querySelectorAll(".slot")].filter((s) => s.getAttribute("aria-label") === b.title);
    const slot = slots.find((s) => s.classList.contains("front")) || slots[0];
    return document.querySelector("#bookSheet:not([hidden]) .heroBook .book") || (slot && slot.querySelector(".book"));
  }
  // ------------------------------------------------------------------ the book lifting off the shelf and opening, as one continuous motion
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const easeIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const easeSine = (x) => -(Math.cos(Math.PI * x) - 1) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const LEAVES = 4, OPEN_END = 2.6; // seconds on the timeline
  /** The overlay with a 3D copy of the book: cover on a hinge, a few loose leaves, the page block with its edge. */
  function bookFx(b) {
    const aspect = Math.max(0.5, Math.min(0.9, b.coverAspect || 2 / 3));
    const H = Math.min(innerHeight * 0.6, 520, (innerWidth * 0.4) / aspect), W = H * aspect;
    // laid out at the biggest size it reaches and scaled down from there, so it never gets blurry as it grows
    const SM = 1.65, W2 = W * SM, H2 = H * SM;
    const cx = innerWidth / 2 - W2 / 2, cy = innerHeight / 2 - H2 / 2, T = Math.max(8, W * 0.09) * SM;
    const cover = b.coverUrl ? `<img alt="" src="${esc(b.coverUrl)}" referrerpolicy="no-referrer">` : `<span class="ofPlain">${esc(b.title)}</span>`;
    const leaves = Array.from({ length: LEAVES }, (_, k) => `<div class="ofLeaf" style="--z:${((0.6 + k * 0.35) * SM).toFixed(2)}px"><i class="lf"></i><i class="lb"></i></div>`).join("");
    const fx = h(`<div class="openFx"><div class="ofDim"></div><div class="ofBook" style="left:${cx}px;top:${cy}px;width:${W2}px;height:${H2}px;--sm:${SM};--T:${T}px;--spine:${b.spineColor || "#334"}">
      <div class="ofEdge"></div><div class="ofPages"><i class="ofGutter"></i></div>${leaves}<div class="ofCover"><div class="ofFront">${cover}<i class="ofShade"></i></div><div class="ofInside"><i class="ofShade"></i></div></div></div><div class="ofBlack"></div></div>`);
    const book = fx.querySelector(".ofBook"), coverEl = fx.querySelector(".ofCover"), leafEls = [...fx.querySelectorAll(".ofLeaf")];
    const dim = fx.querySelector(".ofDim"), black = fx.querySelector(".ofBlack"), edge = fx.querySelector(".ofEdge"), gutter = fx.querySelector(".ofGutter");
    const fShade = fx.querySelector(".ofFront .ofShade"), iShade = fx.querySelector(".ofInside .ofShade");
    // handwriting on every page you see, front and back
    const ar = (H2 * 0.976) / W2, sd = 11 + (b.id || 0) * 7;
    fx.querySelector(".ofPages").style.backgroundImage = scriptPage(sd, ar);
    leafEls.forEach((l, k) => { l.querySelector(".lf").style.backgroundImage = scriptPage(sd + 100 + k * 2, ar); l.querySelector(".lb").style.backgroundImage = scriptPage(sd + 101 + k * 2, ar); });
    let start = { dx: 0, dy: 0, s: 0.25 };
    /** Where the book starts (or ends up): over the copy on the shelf or the book page. */
    const setHome = (src) => {
      const r = src ? src.getBoundingClientRect() : { left: innerWidth / 2 - 30, top: innerHeight / 2 - 45, width: 60, height: 90 };
      start = { dx: r.left + r.width / 2 - (cx + W / 2), dy: r.top + r.height / 2 - (cy + H / 2), s: r.height / H };
    };
    /** Everything at time `p` (seconds) of the opening; closing plays the same timeline backwards. */
    const pose = (p) => {
      const lRaw = clamp01(p / 1.0), L = easeIO(lRaw), arc = Math.sin(Math.PI * lRaw);
      const oRaw = clamp01((p - 0.78) / 1.1), O = easeIO(oRaw);
      const Z = easeIO(clamp01((p - 1.75) / 0.85)), B = easeSine(clamp01((p - 2.15) / 0.45));
      const S = lerp(start.s, 1, L) * (1 + 0.1 * O) * (1 + 0.5 * Z);
      // centred spread while open, then the camera moves onto the right-hand page
      const tx = lerp(start.dx, 0, L) + (S * W / 2) * O * (1 - Z), ty = lerp(start.dy, 0, L) - arc * Math.min(60, innerHeight * 0.06);
      const ry = -14 * arc + 6 * Math.sin(Math.PI * oRaw) * (1 - Z), rx = 7 * arc;
      book.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${(S / SM).toFixed(5)}) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`;
      book.style.setProperty("--lift", (0.35 + 0.65 * arc * (1 - O)).toFixed(3));
      const a = 179 * O;
      coverEl.style.transform = `rotateY(${(-a).toFixed(2)}deg) translateZ(${2 * SM}px)`;
      // a few leaves follow the cover over, each a moment later, and settle on top of each other
      leafEls.forEach((l, k) => {
        const d = 0.1 + k * 0.09, t = easeIO(clamp01((oRaw - d) / (1 - d)));
        const bend = Math.sin(Math.PI * t) * 10;
        l.style.transform = `translateZ(var(--z)) rotateY(${(-(178 - k * 0.6) * t).toFixed(2)}deg) skewY(${(bend * 0.08).toFixed(2)}deg)`;
        l.style.setProperty("--curl", (Math.sin(Math.PI * t) * 0.35).toFixed(3));
      });
      // light: the cover darkens as it turns away, its inside brightens as it lands, the spine shadow fades
      fShade.style.opacity = (0.6 * Math.sin((Math.min(a, 90) * Math.PI) / 180)).toFixed(3);
      iShade.style.opacity = (a > 90 ? 0.6 * Math.cos(((a - 90) * Math.PI) / 180) : 0.6).toFixed(3);
      gutter.style.opacity = (0.25 + 0.75 * O).toFixed(3);
      edge.style.opacity = (1 - O).toFixed(3);
      dim.style.opacity = (0.62 * L).toFixed(3);
      black.style.opacity = B.toFixed(3);
    };
    /** Plays the timeline from `p0` to `p1` seconds at real speed `rate`. */
    const play = (p0, p1, rate = 1, onFrame = null) => new Promise((done) => {
      const t0 = performance.now(), dur = (Math.abs(p1 - p0) * 1000) / rate;
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        if (onFrame) onFrame();
        pose(p0 + (p1 - p0) * k);
        if (k < 1) requestAnimationFrame(step); else done();
      };
      requestAnimationFrame(step);
    });
    return { fx, pose, play, setHome };
  }
  async function openingAnim(b) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
    const src = bookOnScreen(b);
    const A = bookFx(b);
    A.setHome(src); A.pose(0);
    // draw it once, invisibly, so the pages are ready before anything moves
    A.fx.style.opacity = "0.001";
    document.body.append(A.fx);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    A.fx.style.opacity = "";
    if (src) src.style.visibility = "hidden";
    await A.play(0, OPEN_END);
    if (src) src.style.visibility = "";
    return A.fx;
  }
  /** Leaving the book: the page fades to black, the open book comes back into view, closes, and floats back to its place. */
  async function closingAnim(b, hideReader) {
    if (!b || matchMedia("(prefers-reduced-motion: reduce)").matches) { hideReader(); return; }
    const A = bookFx(b);
    A.pose(OPEN_END);
    const black = A.fx.querySelector(".ofBlack");
    black.style.transition = "opacity .45s ease"; black.style.opacity = "0";
    A.fx.classList.add("pre");
    document.body.append(A.fx);
    room.classList.add("leaving");
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    black.style.opacity = "1";
    await new Promise((r) => setTimeout(r, 470));
    black.style.transition = "";
    hideReader(); room.classList.remove("leaving");
    // the shelf may still be settling after it redraws, so keep aiming at wherever the book's place is now
    let src = null;
    const aim = () => {
      const s = bookOnScreen(b);
      if (s !== src) { if (src) src.style.visibility = ""; src = s; if (src) src.style.visibility = "hidden"; }
      A.setHome(src);
    };
    aim(); A.pose(OPEN_END); A.fx.classList.remove("pre");
    await A.play(OPEN_END, 0, 1.08, aim);
    if (src) src.style.visibility = "";
    A.fx.classList.add("gone"); setTimeout(() => A.fx.remove(), 200);
  }
  // ------------------------------------------------------------------ handwriting for the pages: flowing pen strokes made of letter-like shapes that never spell anything
  const GLYPHS = [
    [[0, 0], [0.15, -0.85], [0.42, -1], [0.58, -0.45], [0.66, 0]], // n
    [[0, -1], [0.08, -0.25], [0.32, 0], [0.56, -0.45], [0.62, -1], [0.66, 0]], // u
    [[0, 0], [0.38, -0.45], [0.46, -0.92], [0.22, -0.9], [0.16, -0.3], [0.5, 0]], // e
    [[0, 0], [0.42, -1.5], [0.5, -2.25], [0.26, -2.2], [0.2, -1], [0.36, 0]], // l
    [[0, -0.55], [0.22, -1], [0.5, -0.88], [0.54, -0.3], [0.3, 0], [0.08, -0.4], [0.32, -0.95], [0.66, -0.9]], // o
    [[0, -0.6], [0.3, -1], [0.5, -0.72], [0.42, 0], [0.46, 0.9], [0.3, 1.3], [0.12, 1], [0.42, 0.3], [0.72, 0]], // g
    [[0, 0], [0.18, -0.9], [0.24, -0.2], [0.4, 0]], // i
    [[0, 0], [0.1, -0.9], [0.3, -0.84], [0.36, -1], [0.46, -0.5], [0.56, 0]], // r
    [[0, 0], [0.12, -0.85], [0.3, -1], [0.4, -0.5], [0.42, 0], [0.48, -0.85], [0.66, -1], [0.78, -0.5], [0.86, 0]], // m
    [[0, 0], [0.4, -1.4], [0.46, -2.1], [0.26, -2], [0.22, -0.9], [0.24, 0], [0.5, -0.8], [0.58, -0.1], [0.72, 0]], // h
    [[0, -0.5], [0.3, -1], [0.5, -0.6], [0.48, 0], [0.52, -1.3], [0.56, -2.1], [0.6, -0.4], [0.74, 0]], // d
  ];
  const pageArt = {};
  /** One page of handwriting as an SVG picture (`seed` picks the words, `ar` is height / width). */
  function scriptPage(seed, ar) {
    const key = seed + ":" + ar.toFixed(2);
    if (pageArt[key]) return pageArt[key];
    const R = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const Wp = 200, Hp = Math.round(200 * ar), xh = 3.1, lead = 10.6, left = 20, right = Wp - 18, slant = 0.28;
    let d = "", dots = "";
    let base = 0;
    const pt = (x, yy) => `${(x - (yy - base) * slant).toFixed(2)} ${yy.toFixed(2)}`;
    const curve = (P) => {
      let s = `M${pt(P[0][0], P[0][1])}`;
      for (let i = 0; i < P.length - 1; i++) {
        const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
        s += ` C${pt(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)} ${pt(p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)} ${pt(p2[0], p2[1])}`;
      }
      return s;
    };
    let y = 30, x = left + 14; // first line indented
    const lines = Math.floor((Hp - 44) / lead);
    for (let ln = 0; ln < lines; ln++, y += lead) {
      base = y;
      const endPara = R() < 0.12 && ln > 2, stop = endPara ? left + 50 + R() * 80 : right;
      while (x < stop - 14) {
        const n = 2 + Math.floor(R() * 5), P = [[x - 1.2, y + 0.2]];
        let gx = x;
        for (let k = 0; k < n; k++) {
          const g = GLYPHS[Math.floor(R() * GLYPHS.length)], sc = xh * (0.92 + R() * 0.16);
          for (const [a, b] of g) P.push([gx + a * sc * 1.05 + (R() - 0.5) * 0.25, y + b * sc + (R() - 0.5) * 0.25]);
          if (g === GLYPHS[6] && R() < 0.8) dots += `<circle cx="${(gx + 0.3 * sc + sc * 1.5 * slant).toFixed(2)}" cy="${(y - sc * 1.5).toFixed(2)}" r=".38"/>`;
          gx += g[g.length - 1][0] * sc * 1.05 + 0.35;
        }
        P.push([gx + 1, y - 0.6]);
        if (gx > stop + 4 && x > left + 20) break; // the word would run off the line
        d += curve(P);
        x = gx + 2.6 + R() * 1.8;
        if (R() < 0.05) { dots += `<circle cx="${(x - 1.8).toFixed(2)}" cy="${y.toFixed(2)}" r=".45"/>`; x += 1.5; }
      }
      x = endPara ? left + 14 : left + (R() - 0.5) * 1.2;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Wp} ${Hp}"><g fill="none" stroke="#3a281a" stroke-width=".55" stroke-linecap="round" stroke-linejoin="round" opacity=".88"><path d="${d}"/></g><g fill="#3a281a" opacity=".88">${dots}</g></svg>`;
    pageArt[key] = `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29")}")`;
    return pageArt[key];
  }
  function endOpening(fx) {
    if (!fx || fx._ended) return; fx._ended = true;
    fx.classList.add("reveal"); setTimeout(() => fx.remove(), 650);
  }

  async function open(id) {
    const b = byId(id); if (!b) return;
    const file = await getFile(id).catch(() => null);
    if (!file) { toast("The EPUB for this book isn't on this device. Add it again from the book's page."); return; }
    const fx = await openingAnim(b);
    if (fx) setTimeout(() => endOpening(fx), 3500); // never leave the screen black
    room.hidden = false; room.classList.remove("bare"); hidePanels();
    room.querySelector(".rdTitle").textContent = b.title;
    room.querySelector(".rdLoading").hidden = false;
    room.querySelector(".rdPct").textContent = b.readPct ? Math.round(b.readPct * 100) + "%" : "…";
    document.body.style.overflow = "hidden";
    // starting a book moves it to Reading (only from To read / Did not finish, so Read and your own shelves stay put)
    if (b.status === "to_read" || b.status === "did_not_finish") {
      b.status = "reading";
      if (!b.startedOn) b.startedOn = new Date().toISOString().slice(0, 10);
      save(); render();
      toast("Moved to Reading");
    }
    layoutGesture();
    applyLook();
    try {
      await loadLibs();
      const book = window.ePub(file.data);
      const rendition = book.renderTo(view, { width: "100%", height: "100%", spread: "none", flow: "paginated", allowScriptedContent: false });
      cur = { id, book, rendition };
      applyLook();
      rendition.on("rendered", (section, v) => { if (v && v.contents) paintMarks(v.contents); });
      rendition.hooks.content.register((contents) => {
        const doc = contents.document;
        doc.addEventListener("keydown", keys);
      });
      rendition.on("relocated", (loc) => {
        const bk = byId(id); if (!bk || !loc || !loc.start) return;
        cur.loc = loc; syncBookmark(); paintAll(); if (!turn) schedulePrime();
        bk.readCfi = loc.start.cfi;
        if (book.locations && book.locations.length()) bk.readPct = book.locations.percentageFromCfi(loc.start.cfi) || 0;
        bk.readAt = Date.now();
        // reaching the last page moves it to Read
        if (bk.status === "reading" && (loc.atEnd || bk.readPct >= 0.995)) {
          bk.status = "read";
          if (!bk.finishedOn) bk.finishedOn = new Date().toISOString().slice(0, 10);
          render();
          toast("Finished! Moved to Read");
          save();
        } else save(true);
        room.querySelector(".rdPct").textContent = book.locations && book.locations.length() ? Math.round(bk.readPct * 100) + "%" : "";
        room.querySelector(".rdScrub").value = (bk.readPct || 0) * 100;
        room.querySelector(".rdChapter").textContent = chapterName(loc.start.href);
      });
      await book.ready;
      await rendition.display(b.readCfi || undefined);
      room.querySelector(".rdLoading").hidden = true;
      endOpening(fx);
      layoutGesture();
      // page positions for the percentage: cached per book because working them out takes a few seconds
      const cached = await idb("locs", "readonly", (s) => s.get(id)).catch(() => null);
      if (cached) book.locations.load(cached);
      else { await book.locations.generate(1200); idb("locs", "readwrite", (s) => s.put(book.locations.save(), id)).catch(() => {}); }
      if (!cur || cur.book !== book) return;
      const scrub = room.querySelector(".rdScrub"); scrub.disabled = false;
      const loc = rendition.currentLocation();
      if (loc && loc.start) { const pct = book.locations.percentageFromCfi(loc.start.cfi); scrub.value = pct * 100; room.querySelector(".rdPct").textContent = Math.round(pct * 100) + "%"; }
    } catch (e) {
      console.warn(e); endOpening(fx);
      room.querySelector(".rdLoading").textContent = "This file couldn't be opened. It may not be a valid EPUB, or it may be DRM-protected.";
    }
  }

  function close() {
    if (room.hidden || room.classList.contains("leaving")) return;
    const b = cur && byId(cur.id);
    closingAnim(b, () => {
      if (turn) { turn.layers.forEach((l) => l.remove()); view.style.clipPath = ""; view.style.zIndex = ""; turn = null; }
      if (cur) { try { cur.book.destroy(); } catch (e) { /* ignore */ } }
      setPen(false); ribbon.hidden = true; clearTimeout(primeTimer); dropPrime();
      cur = null; view.replaceChildren(); room.hidden = true; document.body.style.overflow = "";
      room.querySelector(".rdLoading").textContent = "Opening…";
      room.querySelector(".rdScrub").disabled = true;
      render();
    });
  }
  function keys(e) {
    if (room.hidden || !cur) return;
    if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); autoTurn("next"); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); autoTurn("prev"); }
    else if (e.key === "Escape") { if (![...panels].every((p) => p.hidden)) hidePanels(); else close(); }
  }
  document.addEventListener("keydown", keys, true);
  room.addEventListener("click", (e) => {
    const a = e.target.closest("[data-a]") && e.target.closest("[data-a]").dataset.a; if (!a) return;
    if (a === "close") close();
    else if (a === "aa") { drawAa(); showPanel("aa"); }
    else if (a === "toc") { drawToc(); showPanel("toc"); }
    else if (a === "pen") setPen(!pen.on);
    else if (a === "bookmark") toggleBookmark();
    else if (a === "music") { drawMusic(); showPanel("music"); if (window.ShelfMusic) window.ShelfMusic.refresh(); }
  });
  room.querySelector(".rdScrub").onchange = (e) => {
    if (!cur || !cur.book.locations.length()) return;
    cur.rendition.display(cur.book.locations.cfiFromPercentage(+e.target.value / 100));
  };

  // ------------------------------------------------------------------ the "Read" box on a book's page
  /** Fills `box` with read / add-file controls. `stage` keeps the Play Books link in the book's draft. */
  function readBox(box, b, stage) {
    const pct = b.readPct ? Math.round(b.readPct * 100) : 0;
    const playLink = b.playBooksUrl || "";
    box.replaceChildren(h(`<div class="readBox">
      ${b.hasEpub ? `<button class="btn primary readGo">${pct ? `Continue reading · ${pct}%` : "Start reading"}</button>
        <div class="row"><label class="btn small" style="cursor:pointer">Replace EPUB<input type="file" accept=".epub,application/epub+zip" hidden></label><button class="btn small danger readDel">Remove EPUB</button></div>
        <p class="hint">${esc(b.epubName || "EPUB")} · kept on this device only</p>`
      : `<label class="btn primary" style="cursor:pointer;align-self:flex-start">Add the EPUB<input type="file" accept=".epub,application/epub+zip" hidden></label>
        <p class="hint">Pick the .epub file from your phone. It stays on this device and opens right here.</p>`}
      <details ${playLink ? "open" : ""}><summary class="hint" style="cursor:pointer">Or open it in Google Play Books</summary>
        <div class="row" style="flex-wrap:nowrap;margin-top:8px"><input class="input" id="pbLink" placeholder="Paste the book's Play Books link" value="${esc(playLink)}" inputmode="url">${playLink ? `<a class="btn small" href="${esc(playLink)}" target="_blank" rel="noopener">Open</a>` : ""}</div>
        <p class="hint" style="margin-top:6px">In Play Books, open the book's page, tap Share and copy the link.</p></details>
    </div>`));
    const go = box.querySelector(".readGo"); if (go) go.onclick = () => open(b.id);
    const del = box.querySelector(".readDel");
    if (del) del.onclick = async () => {
      if (!del.dataset.armed) { del.dataset.armed = "1"; del.textContent = "Tap again to remove"; return; }
      await removeFile(b.id); toast("EPUB removed from this device"); readBox(box, byId(b.id), stage);
    };
    const inp = box.querySelector('input[type="file"]');
    inp.onchange = async () => {
      const f = inp.files && inp.files[0]; if (!f) return;
      if (!/\.epub$/i.test(f.name) && f.type !== "application/epub+zip") { toast("That isn't an .epub file."); return; }
      try { await storeFile(b.id, f); toast("EPUB added. Tap Start reading."); readBox(box, byId(b.id), stage); }
      catch (e) { toast("Couldn't keep that file. Your browser storage may be full."); }
    };
    const link = box.querySelector("#pbLink");
    link.oninput = () => stage({ playBooksUrl: link.value.trim() || null }, false);
  }

  window.ShelfReader = { open, readBox, importEpub, storeFile };
})();
