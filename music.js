/* Shelf: Spotify turntable.
   A record player that floats over the shelf: sleeve with the album cover, a spinning record with
   the song on its label, and a tonearm that swings on while music plays. Drag it anywhere.
   Spotify sign-in uses the PKCE flow, so no secret is needed; the person brings their own Client ID. */
(() => {
  const { h, esc, toast, showSheet, closeBtn, spineInk } = window.Shelf;
  const KEY = "shelf.music.v1";
  const PKCE = "shelf.music.pkce";
  const REDIRECT = location.origin + location.pathname.replace(/index\.html$/, "");
  const SCOPES = "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private";
  const MOBILE = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  const VINYLS = [
    ["black", "Black"], ["gold", "Gold"], ["white", "White"], ["smoke", "Smoke"],
    ["red", "Red"], ["blue", "Blue"], ["splatter", "Splatter"], ["marble", "Marble"],
  ];
  const LABELS = [["#ecdcae", "Cream"], ["#f4f1ea", "White"], ["#151515", "Black"], ["#b8322a", "Red"], ["#2c4f7c", "Blue"], ["#d9a441", "Mustard"], ["cover", "From cover"]];

  const defaults = { clientId: "280140e0f05746a88873caf6b5183d25", token: null, show: false, pos: null, size: 0, vinyl: "black", label: "#ecdcae", deviceId: null };
  let m = { ...defaults };
  try { m = { ...defaults, ...(JSON.parse(localStorage.getItem(KEY)) || {}) }; } catch (e) { /* first visit */ }
  if (!m.clientId) m.clientId = defaults.clientId; // your Spotify app's Client ID (public, not a secret)
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) { /* storage blocked */ } };

  let now = { title: "", artist: "", cover: "", playing: false, color: null };
  let sdkDevice = null, player = null, pollTimer = 0;

  // ------------------------------------------------------------------ Spotify sign-in (PKCE)
  const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const randomText = (n) => b64url(crypto.getRandomValues(new Uint8Array(n))).slice(0, n);

  async function connect() {
    if (!m.clientId) return toast("Paste your Spotify Client ID first.");
    const verifier = randomText(64), state = randomText(16);
    const challenge = b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
    try { localStorage.setItem(PKCE, JSON.stringify({ verifier, state })); } catch (e) { return toast("Your browser is blocking storage, so Spotify sign-in can't finish."); }
    const q = new URLSearchParams({ response_type: "code", client_id: m.clientId, scope: SCOPES, redirect_uri: REDIRECT, state, code_challenge_method: "S256", code_challenge: challenge });
    location.assign("https://accounts.spotify.com/authorize?" + q);
  }

  async function tokenRequest(params) {
    const r = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: m.clientId, ...params }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error_description || j.error || "Spotify sign-in failed");
    m.token = { access: j.access_token, refresh: j.refresh_token || (m.token && m.token.refresh), expires: Date.now() + j.expires_in * 1000 };
    save();
  }

  async function finishSignIn() {
    const q = new URLSearchParams(location.search);
    if (!q.has("code") && !q.has("error")) return false;
    let stored = {};
    try { stored = JSON.parse(localStorage.getItem(PKCE)) || {}; localStorage.removeItem(PKCE); } catch (e) { /* ignore */ }
    history.replaceState(null, "", REDIRECT);
    if (q.get("error")) { toast(q.get("error") === "access_denied" ? "Spotify sign-in was cancelled." : "Spotify said: " + q.get("error")); return false; }
    if (!stored.verifier || q.get("state") !== stored.state) { toast("Spotify sign-in didn't match. Please try Connect again."); return false; }
    try {
      await tokenRequest({ grant_type: "authorization_code", code: q.get("code"), redirect_uri: REDIRECT, code_verifier: stored.verifier });
      toast("Spotify connected");
      return true;
    } catch (e) { toast(e.message); return false; }
  }

  async function accessToken() {
    if (!m.token) return null;
    if (Date.now() > m.token.expires - 60000) {
      try { await tokenRequest({ grant_type: "refresh_token", refresh_token: m.token.refresh }); }
      catch (e) { m.token = null; save(); toast("Spotify signed you out. Connect again from Music."); return null; }
    }
    return m.token.access;
  }

  async function api(path, opts = {}, retry = true) {
    const t = await accessToken();
    if (!t) throw Object.assign(new Error("Not connected to Spotify"), { status: 401 });
    const r = await fetch("https://api.spotify.com/v1" + path, { ...opts, headers: { Authorization: "Bearer " + t, "Content-Type": "application/json" } });
    if (r.status === 401 && retry) { m.token.expires = 0; return api(path, opts, false); }
    if (r.status === 204 || r.status === 202) return null;
    const text = await r.text();
    const j = text ? (() => { try { return JSON.parse(text); } catch (e) { return null; } })() : null;
    if (!r.ok) {
      const msg = (j && j.error && (j.error.message || j.error)) || "Spotify error " + r.status;
      throw Object.assign(new Error(String(msg)), { status: r.status, reason: j && j.error && j.error.reason });
    }
    return j;
  }
  const explain = (e) => {
    if (e.reason === "PREMIUM_REQUIRED" || /premium/i.test(e.message)) return "Spotify only lets apps play music for Premium accounts.";
    if (e.reason === "NO_ACTIVE_DEVICE" || e.status === 404) return "Open the Spotify app, play any song for a second, then try again.";
    return e.message;
  };

  // ------------------------------------------------------------------ playback
  function loadSdk() {
    if (MOBILE || player || !m.token) return; // Spotify's in-browser player doesn't run on phones
    window.onSpotifyWebPlaybackSDKReady = () => {
      player = new window.Spotify.Player({ name: "Shelf turntable", volume: 0.8, getOAuthToken: (cb) => accessToken().then((t) => t && cb(t)) });
      player.addListener("ready", ({ device_id }) => { sdkDevice = device_id; });
      player.addListener("not_ready", () => { sdkDevice = null; });
      player.addListener("player_state_changed", (st) => {
        if (!st || !st.track_window || !st.track_window.current_track) return;
        setNow(st.track_window.current_track, !st.paused);
      });
      ["initialization_error", "authentication_error", "account_error"].forEach((ev) => player.addListener(ev, ({ message }) => console.warn("Spotify player:", ev, message)));
      player.connect();
    };
    const s = document.createElement("script"); s.src = "https://sdk.scdn.co/spotify-player.js"; document.head.append(s);
  }

  async function chooseDevice() {
    const d = await api("/me/player/devices");
    const list = (d && d.devices) || [];
    if (m.deviceId && list.some((x) => x.id === m.deviceId)) return m.deviceId;
    if (sdkDevice) return sdkDevice;
    const pick = list.find((x) => x.is_active) || list.find((x) => x.type === "Smartphone") || list[0];
    return pick ? pick.id : null;
  }

  // When no device is ready, remember what to play, offer to open the Spotify app, and retry when they come back.
  let pending = null, retryTimer = 0;
  const ANDROID = /Android/i.test(navigator.userAgent);
  const SPOTIFY_APP = ANDROID ? "intent://open.spotify.com/#Intent;scheme=spotify;package=com.spotify.music;end" : "spotify:";
  const prompt = h(`<div class="mPrompt" hidden role="alertdialog"><span>Spotify needs to be open on this phone to play.</span><a class="btn small primary" href="${SPOTIFY_APP}">Open Spotify</a><button class="btn small" aria-label="Dismiss">✕</button></div>`);
  document.body.append(prompt);
  prompt.querySelector("button").onclick = () => { prompt.hidden = true; pending = null; };
  async function retryPending(tries) {
    if (!pending) return;
    const dev = await chooseDevice().catch(() => null);
    if (dev) { const body = pending.body; pending = null; prompt.hidden = true; return play(body, true); }
    if (tries > 0) retryTimer = setTimeout(() => retryPending(tries - 1), 1500);
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden && pending) { clearTimeout(retryTimer); retryPending(6); } });

  async function play(body, isRetry) {
    try {
      const dev = await chooseDevice();
      if (!dev) {
        if (isRetry) return toast("Still can't see Spotify. In the Spotify app, play any song for a second, then come back.");
        pending = { body }; prompt.hidden = false; return;
      }
      await api("/me/player/play?device_id=" + encodeURIComponent(dev), { method: "PUT", body: JSON.stringify(body || {}) });
      if (!m.show) { m.show = true; save(); }
      now.playing = true; render();
      setTimeout(poll, 700);
    } catch (e) {
      if (!isRetry && (e.reason === "NO_ACTIVE_DEVICE" || e.status === 404)) { pending = { body }; prompt.hidden = false; return; }
      toast(explain(e));
    }
  }
  async function command(path, method) {
    try { await api(path, { method }); setTimeout(poll, 500); } catch (e) { toast(explain(e)); }
  }
  const toggle = () => (now.playing ? (now.playing = false, render(), command("/me/player/pause", "PUT")) : play());
  const next = () => command("/me/player/next", "POST");
  const prev = () => command("/me/player/previous", "POST");

  function setNow(track, playing) {
    const cover = (track.album && track.album.images && track.album.images[0] && track.album.images[0].url) || "";
    const changed = cover !== now.cover;
    now = { ...now, title: track.name, artist: (track.artists || []).map((a) => a.name).join(", "), cover, playing };
    if (changed) { now.color = null; if (cover) coverColour(cover).then((c) => { now.color = c; render(); }); }
    render();
  }
  async function poll() {
    clearTimeout(pollTimer);
    if (!m.token) return;
    try {
      const st = await api("/me/player?additional_types=track");
      if (st && st.item) setNow(st.item, !!st.is_playing);
      else if (now.playing) { now.playing = false; render(); }
    } catch (e) { if (e.status === 401) return; }
    pollTimer = setTimeout(poll, document.hidden ? 15000 : 4000);
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden && m.token) poll(); });

  function coverColour(url) {
    return new Promise((resolve) => {
      const img = new Image(); img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const c = document.createElement("canvas"); c.width = c.height = 12;
          const g = c.getContext("2d"); g.drawImage(img, 0, 0, 12, 12);
          const px = g.getImageData(0, 0, 12, 12).data; let r = 0, gg = 0, b = 0;
          for (let i = 0; i < px.length; i += 4) { r += px[i]; gg += px[i + 1]; b += px[i + 2]; }
          const n = px.length / 4;
          resolve("#" + [r, gg, b].map((v) => Math.round(v / n).toString(16).padStart(2, "0")).join(""));
        } catch (e) { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  // ------------------------------------------------------------------ the turntable object
  let ringN = 0;
  const tableMarkup = (cls) => { const id = "ttRing" + ringN++; return `<div class="${cls}" aria-label="Record player">
    <div class="tt-sleeve"><img alt="" draggable="false"><span class="tt-sleeveBlank"></span></div>
    <div class="tt-record">
      <div class="tt-spin">
        <div class="tt-disc"></div>
        <div class="tt-label">
          <svg viewBox="0 0 100 100" class="tt-ring" aria-hidden="true"><defs><path id="${id}" d="M50,50 m-41,0 a41,41 0 1,1 82,0 a41,41 0 1,1 -82,0"/></defs>
            <text><textPath href="#${id}">SIDE A · 33⅓ RPM · SHELF RECORDS · STEREO · SIDE A · 33⅓ RPM ·</textPath></text></svg>
          <span class="tt-title"></span><span class="tt-artist"></span>
        </div>
      </div>
      <div class="tt-sheen"></div><span class="tt-spindle"></span>
    </div>
    <div class="tt-arm"><span class="tt-base"></span><span class="tt-rod"></span><span class="tt-head"></span></div>
    ${cls.includes("tt-inline") ? "" : `<div class="tt-controls" hidden>
      <button data-a="prev" aria-label="Previous">⏮</button><button data-a="toggle" aria-label="Play or pause" class="tt-play">▶</button><button data-a="next" aria-label="Next">⏭</button><button data-a="hide" aria-label="Put the record player away">✕</button>
    </div>`}
  </div>`; };
  const table = h(tableMarkup("turntable"));
  table.hidden = true;
  document.body.append(table);
  let preview = null; // the copy shown in the Music sheet while styling

  /** Put the current song and look onto a record player element. */
  function paint(el) {
    el.dataset.vinyl = m.vinyl;
    el.classList.toggle("playing", !!now.playing);
    const label = m.label === "cover" ? (now.color || "#ecdcae") : m.label;
    el.style.setProperty("--label", label);
    el.style.setProperty("--labelInk", spineInk(label));
    const img = el.querySelector(".tt-sleeve img");
    if (now.cover) { if (img.getAttribute("src") !== now.cover) img.src = now.cover; img.hidden = false; } else img.hidden = true;
    el.querySelector(".tt-title").textContent = now.title || "Shelf";
    el.querySelector(".tt-artist").textContent = now.artist || "Tap to play";
    const pb = el.querySelector(".tt-play"); if (pb) pb.textContent = now.playing ? "⏸" : "▶";
  }

  const MIN_S = 110, MAX_S = 460;
  const recordSize = () => m.size || Math.round(Math.min(240, Math.max(150, innerWidth * 0.46)));
  function place() {
    const s = recordSize();
    table.style.setProperty("--s", s + "px");
    const w = s * 1.7, hgt = s * 1.02;
    let { x, y } = m.pos || { x: (innerWidth - w) / 2, y: innerHeight - hgt - 96 };
    x = Math.max(-w * 0.4, Math.min(innerWidth - w * 0.6, x));
    y = Math.max(-hgt * 0.3, Math.min(innerHeight - hgt * 0.6, y));
    table.style.transform = `translate(${x}px, ${y}px)`;
    return { x, y };
  }
  addEventListener("resize", place);

  function render() {
    if (preview && preview.isConnected) paint(preview);
    table.hidden = !(m.token && m.show);
    if (table.hidden) return;
    place();
    paint(table);
  }

  // Drag with one finger, pinch with two; a tap on the record plays/pauses, a tap on the sleeve opens Music.
  const pts = new Map();
  let drag = null, pinch = null, hideCtl = 0;
  const controls = table.querySelector(".tt-controls");
  const flashControls = () => { controls.hidden = false; clearTimeout(hideCtl); hideCtl = setTimeout(() => (controls.hidden = true), 4000); };
  const startPinch = () => {
    const [a, b] = [...pts.values()];
    const p = place();
    pinch = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, s0: recordSize(), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, x0: p.x, y0: p.y };
    drag = null; table.classList.add("dragging");
  };
  table.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".tt-controls")) return;
    try { table.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) return startPinch();
    if (pts.size > 2) return;
    const p = place();
    drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x: p.x, y: p.y, moved: false, on: e.target };
  });
  table.addEventListener("pointermove", (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pts.size >= 2) {
      const [a, b] = [...pts.values()];
      const k = Math.max(MIN_S / pinch.s0, Math.min(MAX_S / pinch.s0, Math.hypot(a.x - b.x, a.y - b.y) / pinch.d0));
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      m.size = Math.round(pinch.s0 * k);
      // keep the spot between the fingers under the fingers
      m.pos = { x: mx - (pinch.mx - pinch.x0) * k, y: my - (pinch.my - pinch.y0) * k };
      place();
      return;
    }
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    drag.moved = true; table.classList.add("dragging");
    m.pos = { x: drag.x + dx, y: drag.y + dy }; place();
  });
  const end = (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    if (pinch) { if (pts.size === 0) { pinch = null; table.classList.remove("dragging"); m.pos = place(); save(); } return; }
    if (!drag || e.pointerId !== drag.id) return;
    const wasTap = !drag.moved, on = drag.on; drag = null; table.classList.remove("dragging");
    if (!wasTap) { m.pos = place(); save(); return; }
    if (e.type === "pointercancel") return;
    if (on.closest(".tt-sleeve")) openMusic();
    else { flashControls(); if (on.closest(".tt-record")) toggle(); }
  };
  table.addEventListener("pointerup", end);
  table.addEventListener("pointercancel", end);
  // on a computer: scroll over the record player to resize it
  table.addEventListener("wheel", (e) => {
    e.preventDefault();
    m.size = Math.round(Math.max(MIN_S, Math.min(MAX_S, recordSize() * (e.deltaY < 0 ? 1.06 : 1 / 1.06))));
    place(); clearTimeout(hideCtl); save();
  }, { passive: false });
  controls.addEventListener("click", (e) => {
    const a = e.target.closest("button") && e.target.closest("button").dataset.a; if (!a) return;
    flashControls();
    if (a === "toggle") toggle(); else if (a === "next") next(); else if (a === "prev") prev();
    else if (a === "hide") { m.show = false; save(); render(); toast("Record player put away. Open Music to bring it back."); }
  });

  // ------------------------------------------------------------------ the Music sheet
  const firstImg = (imgs) => (imgs && imgs.length ? (imgs[imgs.length > 1 ? imgs.length - 2 : 0] || imgs[0]).url : "");
  /** Fetch every page of a list (Spotify sends 50-100 at a time with a "next" link). */
  async function allPages(path, max = 3000) {
    const out = [];
    let r = await api(path);
    while (r) {
      out.push(...(r.items || []));
      if (!r.next || out.length >= max) break;
      r = await api(r.next.replace("https://api.spotify.com/v1", ""));
    }
    return out;
  }
  async function loadTracks(open) {
    try {
      if (open.type === "album") {
        const items = await allPages(`/albums/${open.id}/tracks?limit=50`);
        return items.map((t) => ({ name: t.name, uri: t.uri, sub: (t.artists || []).map((a) => a.name).join(", "), img: open.img }));
      }
      let items;
      try { items = await allPages(`/playlists/${open.id}/items?limit=100`); }
      catch (e) { if (e.status === 404 || e.status === 403 || e.status === 400) items = await allPages(`/playlists/${open.id}/tracks?limit=100`); else throw e; }
      return items.map((it) => it.item || it.track).filter((t) => t && t.uri)
        .map((t) => ({ name: t.name || "Unknown", uri: t.uri, local: !!t.is_local || t.uri.startsWith("spotify:local"), sub: (t.artists || []).map((a) => a.name).join(", "), img: firstImg(t.album && t.album.images) }));
    } catch (e) { return { error: explain(e) }; }
  }

  function openMusic(startTab) {
    const sheet = document.getElementById("musicSheet");
    let tab = typeof startTab === "string" ? startTab : "music";
    let q = "", results = null, playlists = null, devices = null, searchTimer = 0, open = null, scrollBack = 0;
    const draw = () => {
      const scroll = sheet.scrollTop;
      sheet.replaceChildren(closeBtn());
      const body = h(`<div class="sheetBody padded"><div><h2 class="sheetTitle">Music</h2></div>
        <div class="seg tabsSeg" id="m-tabs"><button data-v="music" aria-pressed="${tab === "music"}">Music</button><button data-v="look" aria-pressed="${tab === "look"}">Record player</button></div></div>`);
      body.querySelectorAll("#m-tabs button").forEach((b) => (b.onclick = () => { tab = b.dataset.v; sheet.scrollTop = 0; draw(); }));
      if (tab === "look") drawLook(body);
      else if (!m.token) drawSetup(body);
      else if (open) drawOpen(body);
      else drawLibrary(body);
      sheet.append(body);
      if (!open) sheet.scrollTop = scroll;
    };

    const row = (img, title, sub, onOpen, onPlay) => {
      const r = h(`<div class="mRow" role="button" tabindex="0">${img ? `<img alt="" loading="lazy" src="${esc(img)}">` : `<span class="mNoImg">♪</span>`}<span class="mText"><b>${esc(title)}</b><span>${esc(sub)}</span></span>${onOpen ? `<span class="mChev">›</span>` : ""}<button class="mPlay" aria-label="Play ${esc(title)}">▶</button></div>`);
      r.onclick = (e) => { if (e.target.closest(".mPlay") || !onOpen) onPlay(); else onOpen(); };
      r.onkeydown = (e) => { if (e.key === "Enter") r.click(); };
      return r;
    };
    const openList = (o) => { scrollBack = sheet.scrollTop; open = { ...o, tracks: null }; draw(); sheet.scrollTop = 0; loadTracks(open).then((t) => { if (open && open.id === o.id) { open.tracks = t; draw(); } }); };

    function drawSetup(body) {
      const setup = h(`<div class="group">
        <h3 class="label">Connect Spotify (one-time setup)</h3>
        <ol class="steps">
          <li>Open <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener">developer.spotify.com/dashboard</a>, sign in with your Spotify account and tap <b>Create app</b>.</li>
          <li>Name it anything (e.g. Shelf). For <b>Redirect URI</b> paste this exactly:
            <span class="row" style="flex-wrap:nowrap;margin-top:6px"><input class="input" readonly value="${esc(REDIRECT)}" id="m-redirect"><button class="btn small" id="m-copy">Copy</button></span></li>
          <li>Tick <b>Web API</b> and <b>Web Playback SDK</b>, agree, and save.</li>
          <li>Open the app's <b>Settings</b>, copy the <b>Client ID</b> and paste it here:
            <input class="input" id="m-client" placeholder="Client ID" autocomplete="off" style="margin-top:6px" value="${esc(m.clientId)}"></li>
        </ol>
        <button class="btn primary" id="m-connect">Connect Spotify</button>
        <p class="hint">Spotify only lets apps play music for <b>Premium</b> accounts. On a phone, the sound comes from your Spotify app and this page controls it.</p>
      </div>`);
      setup.querySelector("#m-copy").onclick = () => { navigator.clipboard && navigator.clipboard.writeText(REDIRECT).then(() => toast("Copied")); };
      setup.querySelector("#m-client").oninput = (e) => { m.clientId = e.target.value.trim(); save(); };
      setup.querySelector("#m-connect").onclick = connect;
      body.append(setup);
    }

    function drawOpen(body) {
      const g = h(`<div class="group"><button class="linkBtn mBack">‹ Back</button>
        <div class="mHeader">${open.img ? `<img alt="" src="${esc(open.img)}">` : `<span class="mNoImg big">♪</span>`}<div><b>${esc(open.name)}</b><span class="hint">${open.type === "album" ? "Album" : "Playlist"}${Array.isArray(open.tracks) ? " · " + open.tracks.length + " songs" : ""}</span>
        <button class="btn small primary" id="m-playAll" style="margin-top:8px">▶ Play all</button></div></div>
        <div class="mResults"></div></div>`);
      g.querySelector(".mBack").onclick = () => { open = null; draw(); sheet.scrollTop = scrollBack; };
      g.querySelector("#m-playAll").onclick = () => play({ context_uri: open.uri });
      const list = g.querySelector(".mResults");
      if (!open.tracks) list.append(h(`<p class="hint">Loading songs…</p>`));
      else if (open.tracks.error) list.append(h(`<p class="hint">Spotify wouldn't share these songs: ${esc(open.tracks.error)} You can still press Play all.</p>`));
      else if (!open.tracks.length) list.append(h(`<p class="hint">No playable songs here.</p>`));
      else open.tracks.forEach((t) => list.append(row(t.img, t.name, t.local ? t.sub + " · on your device only" : t.sub, null, () => (t.local ? toast("That's a local file, so Spotify can only play it from your own phone's Spotify app.") : play({ context_uri: open.uri, offset: { uri: t.uri } })))));
      body.append(g);
    }

    function drawLibrary(body) {
      const find = h(`<div class="group"><h3 class="label">Find music</h3>
        <input class="input" type="search" id="m-q" placeholder="Song, album or playlist" autocomplete="off">
        <div class="mResults"></div></div>`);
      const qIn = find.querySelector("#m-q"); qIn.value = q;
      const list = find.querySelector(".mResults");
      const fill = () => {
        list.replaceChildren();
        if (q && !results) { list.append(h(`<p class="hint">Searching…</p>`)); return; }
        if (q && results) {
          const tracks = (results.tracks && results.tracks.items) || [], albums = ((results.albums && results.albums.items) || []).filter(Boolean), pls = ((results.playlists && results.playlists.items) || []).filter(Boolean);
          if (!tracks.length && !albums.length && !pls.length) list.append(h(`<p class="hint">Nothing found.</p>`));
          if (tracks.length) list.append(h(`<p class="label mHead">Songs</p>`));
          tracks.filter(Boolean).forEach((t) => list.append(row(firstImg(t.album.images), t.name, t.artists.map((a) => a.name).join(", "), null, () => play({ context_uri: t.album.uri, offset: { uri: t.uri } }))));
          if (albums.length) list.append(h(`<p class="label mHead">Albums</p>`));
          albums.forEach((a) => list.append(row(firstImg(a.images), a.name, a.artists.map((x) => x.name).join(", "), () => openList({ type: "album", id: a.id, uri: a.uri, name: a.name, img: firstImg(a.images) }), () => play({ context_uri: a.uri }))));
          if (pls.length) list.append(h(`<p class="label mHead">Playlists</p>`));
          pls.forEach((p) => list.append(row(firstImg(p.images), p.name, "Playlist", () => openList({ type: "playlist", id: p.id, uri: p.uri, name: p.name, img: firstImg(p.images) }), () => play({ context_uri: p.uri }))));
          return;
        }
        if (!playlists) { list.append(h(`<p class="hint">Loading your playlists…</p>`)); return; }
        if (playlists.length) list.append(h(`<p class="label mHead">Your playlists</p>`));
        playlists.forEach((p) => {
          const total = (p.items && p.items.total) ?? (p.tracks && p.tracks.total);
          list.append(row(firstImg(p.images), p.name, total != null ? total + " songs" : "Playlist", () => openList({ type: "playlist", id: p.id, uri: p.uri, name: p.name, img: firstImg(p.images) }), () => play({ context_uri: p.uri })));
        });
      };
      qIn.oninput = () => {
        q = qIn.value.trim(); results = null; fill(); clearTimeout(searchTimer);
        if (!q) return;
        searchTimer = setTimeout(async () => {
          const asked = q;
          try { const r = await api("/search?type=track,album,playlist&limit=6&q=" + encodeURIComponent(asked)); if (asked === q) { results = r || {}; fill(); } }
          catch (e) { if (asked === q) { results = {}; fill(); toast(explain(e)); } }
        }, 350);
      };
      fill();
      if (!playlists) api("/me/playlists?limit=50").then((r) => { playlists = ((r && r.items) || []).filter(Boolean); if (!q && !open) fill(); }).catch(() => { playlists = []; if (!open) fill(); });
      body.append(find);

      const dev = h(`<div class="group"><h3 class="label">Playing on</h3><div class="row" style="flex-wrap:nowrap"><select class="input" id="m-dev"><option value="">Automatic</option></select><button class="btn small" id="m-devRefresh">Refresh</button></div>
        <p class="hint">${MOBILE ? "On a phone the music plays from your Spotify app. If nothing shows here, open Spotify and play any song for a second." : "“Shelf turntable” plays right here in the browser."}</p>
        <button class="btn small danger" id="m-out" style="align-self:flex-start;margin-top:8px">Disconnect Spotify</button></div>`);
      const sel = dev.querySelector("#m-dev");
      (devices || []).forEach((d) => sel.append(h(`<option value="${esc(d.id)}" ${m.deviceId === d.id ? "selected" : ""}>${esc(d.name)}${d.is_active ? " (active)" : ""}</option>`)));
      sel.onchange = () => { m.deviceId = sel.value || null; save(); };
      const loadDevices = () => api("/me/player/devices").then((r) => { devices = (r && r.devices) || []; if (!open && tab === "music") draw(); }).catch((e) => toast(explain(e)));
      dev.querySelector("#m-devRefresh").onclick = loadDevices;
      if (!devices) { devices = []; loadDevices(); }
      dev.querySelector("#m-out").onclick = () => { if (player) player.disconnect(); player = null; sdkDevice = null; m.token = null; m.show = false; save(); render(); draw(); toast("Spotify disconnected"); };
      body.append(dev);
    }

    function drawLook(body) {
      // live preview stays pinned at the top while you pick colours
      const stage = h(`<div class="ttStage"></div>`);
      preview = h(tableMarkup("turntable tt-inline"));
      const fit = Math.min(200, Math.max(120, ((sheet.clientWidth || innerWidth) - 48) / 1.7));
      preview.style.setProperty("--s", fit + "px");
      stage.append(preview); paint(preview);
      const look = h(`<div class="group">
        <label class="check"><input type="checkbox" id="m-show" ${m.show ? "checked" : ""} ${m.token ? "" : "disabled"}> Show it on my shelf</label>
        <p class="hint">On the shelf: drag it with one finger, pinch with two to resize. Tap the record to play or pause, tap the sleeve to open Music.</p>
        <div class="field"><span class="hint">Vinyl</span><div class="vinylDots">${VINYLS.map(([k, l]) => `<button class="vDot" data-vinyl="${k}" aria-pressed="${m.vinyl === k}" title="${l}"><span></span><em>${l}</em></button>`).join("")}</div></div>
        <div class="field"><span class="hint">Label</span><div class="colors">${LABELS.map(([c, l]) => `<button class="dot ${c === "cover" ? "custom" : ""} ${m.label === c ? "on" : ""}" data-label="${c}" title="${l}" aria-label="${l}" style="${c === "cover" ? "" : "background:" + c}"></button>`).join("")}</div></div>
      </div>`);
      look.querySelector("#m-show").onchange = (e) => { m.show = e.target.checked; save(); render(); if (m.show) poll(); };
      look.querySelectorAll(".vDot").forEach((b) => (b.onclick = () => { m.vinyl = b.dataset.vinyl; save(); render(); look.querySelectorAll(".vDot").forEach((x) => x.setAttribute("aria-pressed", x === b)); }));
      look.querySelectorAll("[data-label]").forEach((b) => (b.onclick = () => { m.label = b.dataset.label; save(); render(); look.querySelectorAll("[data-label]").forEach((x) => x.classList.toggle("on", x === b)); }));
      body.append(stage, look);
    }

    draw();
    showSheet(sheet);
  }

  document.getElementById("musicBtn").onclick = () => openMusic();

  (async () => {
    const justConnected = await finishSignIn();
    if (justConnected) { m.show = true; save(); }
    render();
    if (m.token) { loadSdk(); poll(); }
    if (justConnected) openMusic();
  })();
})();
