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
  let pref = { theme: "paper", size: 105, family: "book", spacing: 1.5 };
  try { pref = { ...pref, ...(JSON.parse(localStorage.getItem(PREF)) || {}) }; } catch (e) { /* defaults */ }
  const savePref = () => { try { localStorage.setItem(PREF, JSON.stringify(pref)); } catch (e) { /* ignore */ } };

  const room = h(`<div class="reader" hidden role="dialog" aria-label="Reader">
    <header class="rdTop"><button class="rdBtn" data-a="close" aria-label="Close the book">✕</button><div class="rdTitle"></div>
      <button class="rdBtn" data-a="toc" aria-label="Chapters">☰</button><button class="rdBtn" data-a="aa" aria-label="Text settings">Aa</button></header>
    <div class="rdView"></div>
    <button class="rdZone rdPrev" data-a="prev" aria-label="Previous page"></button><button class="rdZone rdNext" data-a="next" aria-label="Next page"></button>
    <footer class="rdBottom"><input type="range" class="rdScrub" min="0" max="100" step="0.1" value="0" aria-label="Jump to a place in the book" disabled><div class="rdInfo"><span class="rdChapter"></span><span class="rdPct">…</span></div></footer>
    <div class="rdPanel" data-p="aa" hidden></div>
    <div class="rdPanel rdTocPanel" data-p="toc" hidden></div>
    <div class="rdLoading">Opening…</div>
  </div>`);
  document.body.append(room);

  let cur = null; // { id, book, rendition }
  const view = room.querySelector(".rdView");
  const panels = room.querySelectorAll(".rdPanel");
  const showPanel = (name) => panels.forEach((p) => (p.hidden = p.dataset.p !== name || !p.hidden));
  const hidePanels = () => panels.forEach((p) => (p.hidden = true));
  const toggleChrome = () => room.classList.toggle("bare");

  function applyLook() {
    const t = THEMES[pref.theme] || THEMES.paper;
    room.style.setProperty("--rd-bg", t.bg); room.style.setProperty("--rd-fg", t.fg);
    room.dataset.dark = ["dusk", "night"].includes(pref.theme) ? "1" : "";
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
  }

  function drawAa() {
    const p = room.querySelector('[data-p="aa"]');
    p.replaceChildren(h(`<div class="rdSet">
      <div class="rdRow"><span>Text size</span><button class="rdChip" data-s="-">A−</button><b>${pref.size}%</b><button class="rdChip" data-s="+">A+</button></div>
      <div class="rdRow"><span>Font</span>${Object.entries(FAMILIES).map(([k, f]) => `<button class="rdChip" data-f="${k}" aria-pressed="${pref.family === k}">${f.label}</button>`).join("")}</div>
      <div class="rdRow"><span>Spacing</span>${[1.3, 1.5, 1.8].map((v, i) => `<button class="rdChip" data-l="${v}" aria-pressed="${pref.spacing === v}">${["Tight", "Normal", "Airy"][i]}</button>`).join("")}</div>
      <div class="rdRow rdThemes">${Object.entries(THEMES).map(([k, t]) => `<button class="rdTheme" data-t="${k}" aria-pressed="${pref.theme === k}" style="background:${t.bg};color:${t.fg}">${t.label}</button>`).join("")}</div>
    </div>`));
    p.querySelectorAll("[data-s]").forEach((b) => (b.onclick = () => { pref.size = Math.max(70, Math.min(200, pref.size + (b.dataset.s === "+" ? 10 : -10))); savePref(); applyLook(); drawAa(); }));
    p.querySelectorAll("[data-f]").forEach((b) => (b.onclick = () => { pref.family = b.dataset.f; savePref(); applyLook(); drawAa(); }));
    p.querySelectorAll("[data-l]").forEach((b) => (b.onclick = () => { pref.spacing = +b.dataset.l; savePref(); applyLook(); drawAa(); }));
    p.querySelectorAll("[data-t]").forEach((b) => (b.onclick = () => { pref.theme = b.dataset.t; savePref(); applyLook(); drawAa(); }));
  }

  function drawToc() {
    const p = room.querySelector('[data-p="toc"]');
    const toc = (cur && cur.book.navigation && cur.book.navigation.toc) || [];
    const list = h(`<div class="rdToc"><h3>Chapters</h3></div>`);
    const add = (items, depth) => items.forEach((it) => {
      const b = h(`<button class="rdTocItem" style="padding-left:${12 + depth * 14}px">${esc((it.label || "").trim() || "Untitled")}</button>`);
      b.onclick = () => { hidePanels(); cur.rendition.display(it.href); };
      list.append(b);
      if (it.subitems && it.subitems.length) add(it.subitems, depth + 1);
    });
    add(toc, 0);
    if (!toc.length) list.append(h(`<p class="rdHint">This book has no chapter list.</p>`));
    p.replaceChildren(list);
  }

  const chapterName = (href) => {
    if (!cur || !href) return "";
    const flat = []; const walk = (a) => a.forEach((i) => { flat.push(i); if (i.subitems) walk(i.subitems); });
    walk((cur.book.navigation && cur.book.navigation.toc) || []);
    const base = href.split("#")[0];
    const hit = flat.find((i) => (i.href || "").split("#")[0].endsWith(base) || base.endsWith((i.href || "").split("#")[0]));
    return hit ? hit.label.trim() : "";
  };

  async function open(id) {
    const b = byId(id); if (!b) return;
    const file = await getFile(id).catch(() => null);
    if (!file) { toast("The EPUB for this book isn't on this device. Add it again from the book's page."); return; }
    room.hidden = false; room.classList.remove("bare"); hidePanels();
    room.querySelector(".rdTitle").textContent = b.title;
    room.querySelector(".rdLoading").hidden = false;
    room.querySelector(".rdPct").textContent = b.readPct ? Math.round(b.readPct * 100) + "%" : "…";
    document.body.style.overflow = "hidden";
    applyLook();
    try {
      await loadLibs();
      const book = window.ePub(file.data);
      const rendition = book.renderTo(view, { width: "100%", height: "100%", spread: "none", flow: "paginated", allowScriptedContent: false });
      cur = { id, book, rendition };
      applyLook();
      // swipes and taps inside the page
      rendition.hooks.content.register((contents) => {
        const doc = contents.document; let sx = 0, sy = 0, st = 0;
        doc.addEventListener("touchstart", (e) => { const t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); }, { passive: true });
        doc.addEventListener("touchend", (e) => {
          const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) && Date.now() - st < 700) { dx < 0 ? rendition.next() : rendition.prev(); }
        }, { passive: true });
        doc.addEventListener("click", (e) => {
          if (e.target.closest && e.target.closest("a")) return;
          const sel = doc.getSelection && doc.getSelection(); if (sel && String(sel).trim()) return;
          if (!panels[0].hidden || !panels[1].hidden) return hidePanels();
          toggleChrome();
        });
        doc.addEventListener("keydown", keys);
      });
      rendition.on("relocated", (loc) => {
        const bk = byId(id); if (!bk || !loc || !loc.start) return;
        bk.readCfi = loc.start.cfi;
        if (book.locations && book.locations.length()) bk.readPct = book.locations.percentageFromCfi(loc.start.cfi) || 0;
        bk.readAt = Date.now();
        save();
        room.querySelector(".rdPct").textContent = book.locations && book.locations.length() ? Math.round(bk.readPct * 100) + "%" : "";
        room.querySelector(".rdScrub").value = (bk.readPct || 0) * 100;
        room.querySelector(".rdChapter").textContent = chapterName(loc.start.href);
      });
      await book.ready;
      await rendition.display(b.readCfi || undefined);
      room.querySelector(".rdLoading").hidden = true;
      // page positions for the percentage: cached per book because working them out takes a few seconds
      const cached = await idb("locs", "readonly", (s) => s.get(id)).catch(() => null);
      if (cached) book.locations.load(cached);
      else { await book.locations.generate(1200); idb("locs", "readwrite", (s) => s.put(book.locations.save(), id)).catch(() => {}); }
      if (!cur || cur.book !== book) return;
      const scrub = room.querySelector(".rdScrub"); scrub.disabled = false;
      const loc = rendition.currentLocation();
      if (loc && loc.start) { const pct = book.locations.percentageFromCfi(loc.start.cfi); scrub.value = pct * 100; room.querySelector(".rdPct").textContent = Math.round(pct * 100) + "%"; }
    } catch (e) {
      console.warn(e);
      room.querySelector(".rdLoading").textContent = "This file couldn't be opened. It may not be a valid EPUB, or it may be DRM-protected.";
    }
  }

  function close() {
    if (cur) { try { cur.book.destroy(); } catch (e) { /* ignore */ } }
    cur = null; view.replaceChildren(); room.hidden = true; document.body.style.overflow = "";
    room.querySelector(".rdLoading").textContent = "Opening…";
    room.querySelector(".rdScrub").disabled = true;
    render();
  }
  function keys(e) {
    if (room.hidden || !cur) return;
    if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); cur.rendition.next(); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); cur.rendition.prev(); }
    else if (e.key === "Escape") { if (![...panels].every((p) => p.hidden)) hidePanels(); else close(); }
  }
  document.addEventListener("keydown", keys, true);
  room.addEventListener("click", (e) => {
    const a = e.target.closest("[data-a]") && e.target.closest("[data-a]").dataset.a; if (!a) return;
    if (a === "close") close();
    else if (a === "next" && cur) { hidePanels(); cur.rendition.next(); }
    else if (a === "prev" && cur) { hidePanels(); cur.rendition.prev(); }
    else if (a === "aa") { drawAa(); showPanel("aa"); }
    else if (a === "toc") { drawToc(); showPanel("toc"); }
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
