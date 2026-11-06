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
  const table = h(`<div class="turntable" hidden aria-label="Record player">
    <div class="tt-sleeve"><img alt="" draggable="false"><span class="tt-sleeveBlank"></span></div>
    <div class="tt-record">
      <div class="tt-spin">
        <div class="tt-disc"></div>
        <div class="tt-label">
          <svg viewBox="0 0 100 100" class="tt-ring" aria-hidden="true"><defs><path id="ttRingPath" d="M50,50 m-41,0 a41,41 0 1,1 82,0 a41,41 0 1,1 -82,0"/></defs>
            <text><textPath href="#ttRingPath">SIDE A · 33⅓ RPM · SHELF RECORDS · STEREO · SIDE A · 33⅓ RPM ·</textPath></text></svg>
          <span class="tt-title"></span><span class="tt-artist"></span>
        </div>
      </div>
      <div class="tt-sheen"></div><span class="tt-spindle"></span>
    </div>
    <div class="tt-arm"><span class="tt-base"></span><span class="tt-rod"></span><span class="tt-head"></span></div>
    <div class="tt-controls" hidden>
      <button data-a="prev" aria-label="Previous">⏮</button><button data-a="toggle" aria-label="Play or pause" class="tt-play">▶</button><button data-a="next" aria-label="Next">⏭</button><button data-a="hide" aria-label="Put the record player away">✕</button>
    </div>
  </div>`);
  document.body.append(table);

  const recordSize = () => m.size || Math.round(Math.min(240, Math.max(150, innerWidth * 0.46)));
  function place() {
    const s = recordSize();
    table.style.setProperty("--s", s + "px");
    const w = s * 1.78, hgt = s * 1.02;
    let { x, y } = m.pos || { x: (innerWidth - w) / 2, y: innerHeight - hgt - 96 };
    x = Math.max(-w * 0.35, Math.min(innerWidth - w * 0.65, x));
    y = Math.max(0, Math.min(innerHeight - hgt * 0.6, y));
    table.style.transform = `translate(${x}px, ${y}px)`;
    return { x, y };
  }
  addEventListener("resize", place);

  function render() {
    table.hidden = !(m.token && m.show);
    if (table.hidden) return;
    place();
    table.dataset.vinyl = m.vinyl;
    table.classList.toggle("playing", !!now.playing);
    const label = m.label === "cover" ? (now.color || "#ecdcae") : m.label;
    table.style.setProperty("--label", label);
    table.style.setProperty("--labelInk", spineInk(label));
    const img = table.querySelector(".tt-sleeve img");
    if (now.cover) { if (img.getAttribute("src") !== now.cover) img.src = now.cover; img.hidden = false; } else img.hidden = true;
    table.querySelector(".tt-title").textContent = now.title || "Shelf";
    table.querySelector(".tt-artist").textContent = now.artist || "Tap to play";
    table.querySelector(".tt-play").textContent = now.playing ? "⏸" : "▶";
  }

  // drag anywhere; a tap on the record plays/pauses, a tap on the sleeve opens Music
  let drag = null, hideCtl = 0;
  const controls = table.querySelector(".tt-controls");
  const flashControls = () => { controls.hidden = false; clearTimeout(hideCtl); hideCtl = setTimeout(() => (controls.hidden = true), 4000); };
  table.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".tt-controls")) return;
    const p = place();
    drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x: p.x, y: p.y, moved: false, on: e.target };
    table.setPointerCapture(e.pointerId);
  });
  table.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    drag.moved = true; table.classList.add("dragging");
    m.pos = { x: drag.x + dx, y: drag.y + dy }; place();
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const wasTap = !drag.moved, on = drag.on; drag = null; table.classList.remove("dragging");
    if (!wasTap) { m.pos = place(); save(); return; }
    if (on.closest(".tt-sleeve")) openMusic();
    else { flashControls(); if (on.closest(".tt-record")) toggle(); }
  };
  table.addEventListener("pointerup", end);
  table.addEventListener("pointercancel", (e) => { if (drag && e.pointerId === drag.id) { drag = null; table.classList.remove("dragging"); } });
  controls.addEventListener("click", (e) => {
    const a = e.target.closest("button") && e.target.closest("button").dataset.a; if (!a) return;
    flashControls();
    if (a === "toggle") toggle(); else if (a === "next") next(); else if (a === "prev") prev();
    else if (a === "hide") { m.show = false; save(); render(); toast("Record player put away. Open Music to bring it back."); }
  });

  // ------------------------------------------------------------------ the Music sheet
  function openMusic() {
    const sheet = document.getElementById("musicSheet");
    let q = "", results = null, playlists = null, devices = null, searchTimer = 0;
    const draw = () => {
      const scroll = sheet.scrollTop;
      sheet.replaceChildren(closeBtn());
      const body = h(`<div class="sheetBody padded"><div><h2 class="sheetTitle">Music</h2><p class="hint">Play Spotify on a record player that sits on your shelf.</p></div></div>`);
      if (!m.token) {
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
          <p class="hint">Spotify only lets apps play music for <b>Premium</b> accounts. On a phone, the sound comes from your Spotify app and this page controls it, so keep the Spotify app installed and signed in.</p>
        </div>`);
        setup.querySelector("#m-copy").onclick = () => { navigator.clipboard && navigator.clipboard.writeText(REDIRECT).then(() => toast("Copied")); };
        setup.querySelector("#m-client").oninput = (e) => { m.clientId = e.target.value.trim(); save(); };
        setup.querySelector("#m-connect").onclick = connect;
        body.append(setup);
      } else {
        // search + library
        const find = h(`<div class="group"><h3 class="label">Find music</h3>
          <input class="input" type="search" id="m-q" placeholder="Song, album or playlist" autocomplete="off">
          <div class="mResults"></div></div>`);
        const qIn = find.querySelector("#m-q"); qIn.value = q;
        const list = find.querySelector(".mResults");
        const row = (img, title, sub, onPlay) => {
          const r = h(`<button class="mRow">${img ? `<img alt="" loading="lazy" src="${esc(img)}">` : `<span class="mNoImg">♪</span>`}<span class="mText"><b>${esc(title)}</b><span>${esc(sub)}</span></span><span class="mPlay">▶</span></button>`);
          r.onclick = onPlay; return r;
        };
        const fill = () => {
          list.replaceChildren();
          if (q && !results) { list.append(h(`<p class="hint">Searching…</p>`)); return; }
          if (q && results) {
            const tracks = (results.tracks && results.tracks.items) || [], albums = (results.albums && results.albums.items) || [], pls = ((results.playlists && results.playlists.items) || []).filter(Boolean);
            if (!tracks.length && !albums.length && !pls.length) list.append(h(`<p class="hint">Nothing found.</p>`));
            if (tracks.length) list.append(h(`<p class="label mHead">Songs</p>`));
            tracks.forEach((t) => list.append(row(t.album.images.slice(-1)[0] && t.album.images.slice(-1)[0].url, t.name, t.artists.map((a) => a.name).join(", "), () => play({ context_uri: t.album.uri, offset: { uri: t.uri } }))));
            if (albums.length) list.append(h(`<p class="label mHead">Albums</p>`));
            albums.forEach((a) => list.append(row(a.images.slice(-1)[0] && a.images.slice(-1)[0].url, a.name, a.artists.map((x) => x.name).join(", "), () => play({ context_uri: a.uri }))));
            if (pls.length) list.append(h(`<p class="label mHead">Playlists</p>`));
            pls.forEach((p) => list.append(row(p.images && p.images[0] && p.images[0].url, p.name, "Playlist", () => play({ context_uri: p.uri }))));
            return;
          }
          if (!playlists) { list.append(h(`<p class="hint">Loading your playlists…</p>`)); return; }
          if (playlists.length) list.append(h(`<p class="label mHead">Your playlists</p>`));
          playlists.forEach((p) => list.append(row(p.images && p.images[0] && p.images[0].url, p.name, `${p.tracks ? p.tracks.total + " songs" : "Playlist"}`, () => play({ context_uri: p.uri }))));
        };
        qIn.oninput = () => {
          q = qIn.value.trim(); results = null; fill(); clearTimeout(searchTimer);
          if (!q) return;
          searchTimer = setTimeout(async () => {
            const asked = q;
            try { const r = await api("/search?type=track,album,playlist&limit=6&q=" + encodeURIComponent(asked)); if (asked === q) { results = r; fill(); } }
            catch (e) { if (asked === q) { results = {}; fill(); toast(explain(e)); } }
          }, 350);
        };
        fill();
        if (!playlists) api("/me/playlists?limit=30").then((r) => { playlists = (r && r.items || []).filter(Boolean); if (!q) fill(); }).catch(() => { playlists = []; fill(); });
        body.append(find);

        // where it plays
        const dev = h(`<div class="group"><h3 class="label">Playing on</h3><div class="row" style="flex-wrap:nowrap"><select class="input" id="m-dev"><option value="">Automatic</option></select><button class="btn small" id="m-devRefresh">Refresh</button></div>
          <p class="hint">${MOBILE ? "On a phone the music plays from your Spotify app. If nothing shows here, open Spotify and play any song for a second." : "“Shelf turntable” plays right here in the browser."}</p></div>`);
        const sel = dev.querySelector("#m-dev");
        (devices || []).forEach((d) => sel.append(h(`<option value="${esc(d.id)}" ${m.deviceId === d.id ? "selected" : ""}>${esc(d.name)}${d.is_active ? " (active)" : ""}</option>`)));
        sel.onchange = () => { m.deviceId = sel.value || null; save(); };
        const loadDevices = () => api("/me/player/devices").then((r) => { devices = (r && r.devices) || []; draw(); }).catch((e) => toast(explain(e)));
        dev.querySelector("#m-devRefresh").onclick = loadDevices;
        if (!devices) { devices = []; loadDevices(); }
        body.append(dev);
      }

      // record player look
      const look = h(`<div class="group"><h3 class="label">Record player</h3>
        <label class="check"><input type="checkbox" id="m-show" ${m.show ? "checked" : ""} ${m.token ? "" : "disabled"}> Show it on my shelf</label>
        <p class="hint">Drag it anywhere. Tap the record to play or pause, tap the sleeve to open Music.</p>
        <div class="field"><span class="hint">Size</span><input type="range" id="m-size" min="130" max="340" step="5" value="${recordSize()}"></div>
        <div class="field"><span class="hint">Vinyl</span><div class="vinylDots">${VINYLS.map(([k, l]) => `<button class="vDot" data-vinyl="${k}" aria-pressed="${m.vinyl === k}" title="${l}"><span></span><em>${l}</em></button>`).join("")}</div></div>
        <div class="field"><span class="hint">Label</span><div class="colors">${LABELS.map(([c, l]) => `<button class="dot ${c === "cover" ? "custom" : ""} ${m.label === c ? "on" : ""}" data-label="${c}" title="${l}" aria-label="${l}" style="${c === "cover" ? "" : "background:" + c}"></button>`).join("")}</div></div>
        ${m.token ? `<button class="btn small danger" id="m-out" style="align-self:flex-start">Disconnect Spotify</button>` : ""}
      </div>`);
      look.querySelector("#m-show").onchange = (e) => { m.show = e.target.checked; save(); render(); if (m.show) poll(); };
      look.querySelector("#m-size").oninput = (e) => { m.size = +e.target.value; save(); render(); };
      look.querySelectorAll(".vDot").forEach((b) => (b.onclick = () => { m.vinyl = b.dataset.vinyl; save(); render(); draw(); }));
      look.querySelectorAll("[data-label]").forEach((b) => (b.onclick = () => { m.label = b.dataset.label; save(); render(); draw(); }));
      const out = look.querySelector("#m-out");
      if (out) out.onclick = () => { if (player) player.disconnect(); player = null; sdkDevice = null; m.token = null; m.show = false; save(); render(); draw(); toast("Spotify disconnected"); };
      body.append(look);

      sheet.append(body);
      sheet.scrollTop = scroll;
    };
    draw();
    showSheet(sheet);
  }

  document.getElementById("musicBtn").onclick = openMusic;

  (async () => {
    const justConnected = await finishSignIn();
    if (justConnected) { m.show = true; save(); }
    render();
    if (m.token) { loadSdk(); poll(); }
    if (justConnected) openMusic();
  })();
})();
