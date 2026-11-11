/* Real 3D books (v288, osamu's 3D test shelf, approved 2026-11-11).
   Each shelf gets one WebGL canvas behind its row. The flat CSS books stay in place, invisible, so tapping, swiping, turning,
   dragging and piles all keep working exactly as before; every time the row is laid out, each 3D book is moved to where its
   flat twin is. One light from the front and upper left throws real soft shadows onto see-through floor and wall planes, so
   they fall on whatever room is painted behind. */
(function () {
  let THREE = null;
  const waiting = [];
  window.addEventListener("three-ready", () => { THREE = window.THREE; waiting.splice(0).forEach((f) => f()); });
  if (window.THREE) THREE = window.THREE;

  const D = 5000;          // eye distance, the same as the flat books' perspective
  const live = new Set();

  // ---------- shared textures ----------
  let clothTex = null;
  function cloth() {
    if (clothTex) return clothTex;
    const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d");
    g.fillStyle = "#fff"; g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.07})`; g.fillRect(Math.random() * 128, Math.random() * 128, 1, 1 + Math.random() * 2); }
    for (let y = 0; y < 128; y += 2) { g.fillStyle = "rgba(0,0,0,.025)"; g.fillRect(0, y, 128, 1); }
    clothTex = new THREE.CanvasTexture(c); clothTex.colorSpace = THREE.SRGBColorSpace; clothTex.wrapS = clothTex.wrapT = THREE.RepeatWrapping;
    clothTex.repeat.set(1 / 60, 1 / 60);
    return clothTex;
  }
  const texCache = new Map(); // url -> texture (covers and painted spines)
  function urlTex(url, onload) {
    if (!url) return null;
    if (texCache.has(url)) return texCache.get(url);
    const t = new THREE.Texture(); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    const img = new Image(); img.crossOrigin = "anonymous"; img.referrerPolicy = "no-referrer";
    img.onload = () => { t.image = img; t.needsUpdate = true; t.userData.ok = true; onload && onload(); };
    img.onerror = () => { t.userData.failed = true; onload && onload(); };
    img.src = url; texCache.set(url, t);
    return t;
  }

  // ---------- one book, built to its own size (px) ----------
  function buildBook(o) {
    const { h, w, d, hard } = o;
    const t = hard ? Math.max(1.5, h * 0.009) : 0.7;        // board thickness
    const bulge = hard ? Math.min(d * 0.24, w * 0.2) : d * 0.07;
    const sq = hard ? Math.max(1.8, h * 0.012) : 0.4;        // the boards stand this much above and below the pages
    const g = new THREE.Group();
    const mats = [];

    // the case: front board, round spine, back board, as one U seen from above, raised to the book's height
    const s = new THREE.Shape();
    s.moveTo(-d / 2, 0); s.lineTo(-d / 2, w - bulge);
    s.absellipse(0, w - bulge, d / 2, bulge, Math.PI, 0, true);
    s.lineTo(d / 2, 0); s.lineTo(d / 2 - t, 0); s.lineTo(d / 2 - t, w - bulge);
    s.absellipse(0, w - bulge, d / 2 - t, Math.max(0.3, bulge - t * 0.8), 0, Math.PI, false);
    s.lineTo(-d / 2 + t, 0); s.closePath();
    const bev = hard ? 0.35 : 0.15;
    const caseGeo = new THREE.ExtrudeGeometry(s, { depth: h - bev * 2, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 2, curveSegments: 20 });
    caseGeo.rotateX(Math.PI / 2); caseGeo.translate(0, h - bev, -w / 2);
    const clothMat = new THREE.MeshStandardMaterial({ color: o.color, roughness: o.glossy ? 0.38 : 0.8, metalness: 0, map: cloth() });
    mats.push(clothMat);
    const caseMesh = new THREE.Mesh(caseGeo, clothMat); caseMesh.castShadow = caseMesh.receiveShadow = true; g.add(caseMesh);

    // the page block, inside the U, shorter than the boards and set back a little from the fore-edge
    const gap = 0.25, back = hard ? 1.2 : 0.3;
    const p = new THREE.Shape();
    p.moveTo(-d / 2 + t + gap, back); p.lineTo(-d / 2 + t + gap, w - bulge);
    p.absellipse(0, w - bulge, d / 2 - t - gap, Math.max(0.3, bulge - t - gap), Math.PI, 0, true);
    p.lineTo(d / 2 - t - gap, back); p.closePath();
    const PH = h - sq * 2;
    const pagesGeo = new THREE.ExtrudeGeometry(p, { depth: PH, bevelEnabled: false, curveSegments: 16 });
    { const pos = pagesGeo.attributes.position, uv = pagesGeo.attributes.uv;
      for (let k = 0; k < pos.count; k++) { const z = pos.getZ(k); if (Math.abs(z) < 1e-3 || Math.abs(z - PH) < 1e-3) uv.setXY(k, (pos.getX(k) + d / 2) / d, 1 - pos.getY(k) / w); }
      uv.needsUpdate = true; }
    pagesGeo.rotateX(Math.PI / 2); pagesGeo.translate(0, h - sq, -w / 2);
    // the page top, painted for this book: leaf lines, and the shade the raised covers throw on it, shaped like the spine's curve
    const tc = document.createElement("canvas"); tc.width = 96; tc.height = 256; const c = tc.getContext("2d"), W = 96, Hh = 256;
    c.fillStyle = "#f1e8d5"; c.fillRect(0, 0, W, Hh);
    for (let x = 0; x < W; x += 2) { c.fillStyle = `rgba(110,90,60,${0.05 + Math.random() * 0.1})`; c.fillRect(x, 0, 1, Hh); }
    if (hard) {
      const edge = W * 0.3;
      let gr = c.createLinearGradient(0, 0, edge, 0); gr.addColorStop(0, "rgba(40,25,10,.6)"); gr.addColorStop(0.35, "rgba(40,25,10,.22)"); gr.addColorStop(1, "rgba(40,25,10,0)");
      c.fillStyle = gr; c.fillRect(0, 0, edge, Hh);
      gr = c.createLinearGradient(W, 0, W - edge, 0); gr.addColorStop(0, "rgba(40,25,10,.5)"); gr.addColorStop(0.35, "rgba(40,25,10,.18)"); gr.addColorStop(1, "rgba(40,25,10,0)");
      c.fillStyle = gr; c.fillRect(W - edge, 0, edge, Hh);
      const bv = (bulge / w) * Hh, k = Math.min(Hh * 0.5, (Math.max(12, h * 0.12) / w) * Hh);
      for (let x = 0; x < W; x++) {
        const tt = ((x + 0.5) / W) * 2 - 1, e = bv * (1 - Math.sqrt(Math.max(0, 1 - tt * tt)));
        const g2 = c.createLinearGradient(0, e, 0, e + bv + k);
        g2.addColorStop(0, "rgba(40,25,10,.75)"); g2.addColorStop(0.4, "rgba(40,25,10,.45)"); g2.addColorStop(1, "rgba(40,25,10,0)");
        c.fillStyle = g2; c.fillRect(x, 0, 1, e + bv + k);
      }
    }
    const topTex = new THREE.CanvasTexture(tc); topTex.colorSpace = THREE.SRGBColorSpace; topTex.flipY = false;
    const pageTop = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.95, map: topTex });
    const pageSide = new THREE.MeshStandardMaterial({ color: "#ece2cc", roughness: 0.95 });
    mats.push(pageTop, pageSide);
    const pages = new THREE.Mesh(pagesGeo, [pageTop, pageSide]); pages.castShadow = pages.receiveShadow = true; g.add(pages);

    // the spine's face: a thin skin on the curve, carrying the painted spine or the title
    const N = 18, R = bev + 0.45, pos = [], uvs = [], idx = []; // just outside the case and its rounded edge, so the two never flicker through each other
    for (let j = 0; j <= N; j++) {
      const a = Math.PI - (j / N) * Math.PI;                  // left to right across the spine
      const x = Math.cos(a) * (d / 2 + R), z = w / 2 - bulge + Math.sin(a) * (bulge + R);
      pos.push(x, 0, z, x, h, z); uvs.push(j / N, 0, j / N, 1);
      if (j < N) { const q = j * 2; idx.push(q, q + 2, q + 1, q + 1, q + 2, q + 3); }
    }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); sg.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2)); sg.setIndex(idx); sg.computeVertexNormals();
    let spineMap = null;
    if (o.spineUrl) spineMap = urlTex(o.spineUrl, o.onTex);
    else spineMap = titleTex(o);
    const spineMat = new THREE.MeshStandardMaterial({ map: spineMap, roughness: o.glossy ? 0.4 : 0.8, color: "#ffffff" });
    mats.push(spineMat);
    const spineMesh = new THREE.Mesh(sg, spineMat); spineMesh.receiveShadow = true; g.add(spineMesh);

    // the front cover, on the board that turns towards you: the cover picture, or until it loads (or if its site won't share it)
    // a plain cloth cover with the title, like the flat books
    {
      const plain = plainCover(o);
      const ct = o.coverUrl ? urlTex(o.coverUrl, o.onTex) : null;
      const cw = w - bulge - 0.5;
      const cm = new THREE.MeshStandardMaterial({ map: plain, roughness: o.glossy ? 0.35 : 0.75 });
      cm.userData = { plain, ct }; mats.push(cm);
      const cover = new THREE.Mesh(new THREE.PlaneGeometry(cw, h - 0.6), cm);
      cover.rotation.y = Math.PI / 2; cover.position.set(d / 2 + bev + 0.45, h / 2, -w / 2 + cw / 2);
      cover.receiveShadow = true; g.add(cover);
      g.userData.cover = cover; g.userData.geos_extra = cover.geometry;
    }
    g.userData.mats = mats; g.userData.geos = [caseGeo, pagesGeo, sg];
    return g;
  }
  function plainCover(o) {
    const W = 256, H = Math.round((256 * o.h) / o.w);
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    g.fillStyle = o.color || "#555"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < W * H / 30; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.07})`; g.fillRect(Math.random() * W, Math.random() * H, 1, 1 + Math.random() * 2); }
    const fam = (o.font && o.font.family) || "Georgia, serif", wt = (o.font && o.font.weight) || 600;
    g.fillStyle = o.ink || "#efe3c4"; g.globalAlpha = 0.55; g.fillRect(W * 0.16, H * 0.12, W * 0.24, 2.5); g.globalAlpha = 1;
    g.textAlign = "center"; let fs = 26; g.font = `${wt} ${fs}px ${fam}`;
    const t = o.title || ""; while (fs > 12 && g.measureText(t).width > W * 0.78) { fs--; g.font = `${wt} ${fs}px ${fam}`; }
    g.fillText(t, W / 2, H * 0.24);
    if (o.author) { g.font = `500 ${Math.max(10, fs * 0.55)}px ${fam}`; g.globalAlpha = 0.85; g.fillText(o.author.toUpperCase(), W / 2, H * 0.9); }
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4;
    return tx;
  }
  function titleTex(o) {
    const H = 512, W = Math.max(24, Math.round((H * o.d) / o.h) * 2);
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    // painted on the book's own cloth colour (dark letters on a see-through canvas came out speckled)
    g.fillStyle = o.color || "#555"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < W * H / 40; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.07})`; g.fillRect(Math.random() * W, Math.random() * H, 1, 1 + Math.random() * 2); }
    g.save(); g.translate(W / 2, H / 2); g.rotate(Math.PI / 2);
    g.fillStyle = o.ink || "#efe3c4"; g.textAlign = "center"; g.textBaseline = "middle";
    const fam = (o.font && o.font.family) || "Georgia, serif", wt = (o.font && o.font.weight) || 600;
    let fs = Math.min(W * 0.42, 40);
    const title = (o.font && o.font.upper ? (o.title || "").toUpperCase() : o.title || "").slice(0, 60);
    g.font = `${wt} ${fs}px ${fam}`;
    while (fs > 10 && g.measureText(title).width > H * 0.62) { fs -= 1; g.font = `${wt} ${fs}px ${fam}`; }
    g.fillText(title, -H * 0.06, 0);
    if (o.author) { const af = Math.max(8, fs * 0.55); g.font = `${wt} ${af}px ${fam}`; g.globalAlpha = 0.8; g.fillText(o.author.split(" ").slice(-1)[0], H * 0.37, 0); }
    g.restore();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    return t;
  }

  // a soft-edged dark patch: solid in the middle, fading out over the outer `edge` of each side
  const softCache = new Map();
  function softTex(edge) {
    if (softCache.has(edge)) return softCache.get(edge);
    const N = 128, c = document.createElement("canvas"); c.width = c.height = N; const g = c.getContext("2d"), img = g.createImageData(N, N);
    const f = (u) => { const t = Math.min(u, 1 - u) / edge; return t >= 1 ? 1 : t <= 0 ? 0 : t * t * (3 - 2 * t); };
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const a = f((x + 0.5) / N) * f((y + 0.5) / N); const k = (y * N + x) * 4; img.data[k] = img.data[k + 1] = img.data[k + 2] = 255; img.data[k + 3] = Math.round(a * 255); }
    g.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c); softCache.set(edge, t); return t;
  }
  let sharedR = null;
  function shared() {
    if (sharedR && !sharedR.getContext().isContextLost()) return sharedR;
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false, powerPreference: "high-performance" });
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.VSMShadowMap;
    r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
    r.setClearColor(0x000000, 0);
    sharedR = r; return r;
  }

  // ---------- one shelf ----------
  function create(stage, opts = {}) {
    // every shelf draws through ONE shared WebGL renderer and copies the picture into its own plain canvas: phones only allow a
    // few WebGL canvases, and with one per shelf the extra shelves went blank
    const renderer = shared();
    const cv = document.createElement("canvas"); cv.className = "b3d"; cv.setAttribute("aria-hidden", "true");
    const ctx = cv.getContext("2d");
    stage.prepend(cv);
    const pr = Math.min(2, window.devicePixelRatio || 1);
    let onScreen = true;
    const io = new IntersectionObserver((es) => { onScreen = es[es.length - 1].isIntersecting; if (onScreen) inst.render(); }, { rootMargin: "200px" });
    io.observe(cv);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const key = new THREE.DirectionalLight("#fff4e6", 1.8); key.castShadow = true;
    key.shadow.mapSize.set(1024, 512); key.shadow.radius = 11; key.shadow.blurSamples = 24; key.shadow.bias = -0.0005;
    scene.add(key, key.target);
    const hemi = new THREE.HemisphereLight("#fffaf2", "#8f8577", 1.25); scene.add(hemi);
    const tint = opts.tint || "#000000";
    const floorMat = new THREE.ShadowMaterial({ color: tint, opacity: 0.42 });
    const wallMat = new THREE.ShadowMaterial({ color: tint, opacity: 0.3 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), floorMat); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.visible = false; // v292: off. The painted floors are steeper than the 3D view, so the books' real floor shadow showed as a dark strip along the back of the shelf (osamu); the soft contact shadows ground the books instead
    scene.add(floor);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), wallMat); wall.receiveShadow = true; scene.add(wall);
    const unitPlane = new THREE.PlaneGeometry(1, 1);
    const contactMat = new THREE.MeshBasicMaterial({ color: tint, map: softTex(0.3), transparent: true, opacity: 0.8, depthWrite: false, toneMapped: false });
    const haloMat = new THREE.MeshBasicMaterial({ color: tint, map: softTex(0.2), transparent: true, opacity: 0.3, depthWrite: false, toneMapped: false });
    const books = new Map(); // id -> { node, sig }
    let dead = false, W = 0, Hc = 0, top = 0, bottom = 0, frameDirty = false;
    const inst = {
      // items: [{ id, b, h, w, d, A: [a,b,c,d,e,f], ox, oy, base, open, rec, visible, spineUrl, coverUrl, ink, font, hard, glossy }]
      sync(items, geom) {
        if (dead) return;
        const { stageH, viewW, H, topD } = geom;
        // the canvas covers the row, a bit above the tallest book for the tops and wall shadows, and the floor in front
        top = Math.round(H * 0.6); bottom = Math.round(topD * 0.5 + 6);
        const cw = viewW, ch = stageH + top + bottom;
        if (cw !== W || ch !== Hc) {
          W = cw; Hc = ch; cv.width = Math.round(cw * pr); cv.height = Math.round(ch * pr);
          cv.style.cssText = `position:absolute;left:0;top:${-top}px;width:${cw}px;height:${ch}px;pointer-events:none`;
        }
        // eye above the row, as far away as the flat books' perspective; world units are css px, y up from the shelf floor
        const eyeY = H + D * 0.17, cx = viewW / 2; // looking down about 10 degrees, as on the test shelf osamu approved
        camera.position.set(cx, eyeY, D); camera.up.set(0, 1, 0); camera.lookAt(cx, eyeY, 0);
        const n = 50, f = D + 2000, k = n / D;
        const yTop = stageH + top, yBot = -bottom; // world y of the canvas's top and bottom edges at z = 0
        camera.projectionMatrix.makePerspective((0 - cx) * k, (viewW - cx) * k, (yTop - eyeY) * k, (yBot - eyeY) * k, n, f);
        camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
        let maxW = 40;
        const seen = new Set();
        for (const it of items) {
          seen.add(it.id);
          const sig = [it.h, it.w, it.d, it.hard, it.glossy, it.color, it.spineUrl, it.coverUrl, it.title, it.ink].join("|");
          let rec = books.get(it.id);
          if (!rec || rec.sig !== sig) {
            if (rec) { scene.remove(rec.outer); disposeBook(rec.node); }
            const node = buildBook({ ...it, onTex: () => { frameDirty = true; inst.render(); } });
            const outer = new THREE.Group(); outer.matrixAutoUpdate = false; outer.add(node); scene.add(outer);
            rec = { node, outer, sig }; books.set(it.id, rec);
          }
          maxW = Math.max(maxW, it.w);
          rec.outer.visible = it.visible;
          if (!it.visible) continue;
          const [a, b, c, d2, e, f2] = it.A, ox = it.ox, oy = it.oy, h = it.h;
          const X0 = -a * ox + c * (h - oy) + e + ox, Y0 = h - oy - (-b * ox + d2 * (h - oy) + f2);
          rec.outer.matrix.set(a, -c, 0, X0, -b, d2, 0, Y0, 0, 0, 1, 0, 0, 0, 0, 1);
          rec.outer.matrixWorldNeedsUpdate = true;
          const turn = 1 - it.open, q = (turn * Math.PI) / 2;
          rec.node.rotation.set(0, -it.open * Math.PI / 2, 0);
          rec.node.position.set(it.base / 2, 0, -(it.w / 2 * Math.sin(q) + it.d / 2 * Math.cos(q)) - (it.rec || 0) * H * 0.03 * turn);
          // where the book is, flat on the screen: the box its four corners make, for the contact shadow and the wall halo
          { const xs = [], ys = [];
            for (const [px, pu] of [[0, 0], [it.base, 0], [0, h], [it.base, h]]) { xs.push(a * px - c * pu + X0); ys.push(-b * px + d2 * pu + Y0); }
            const lean = Math.abs(b) > 0.02 && Math.abs(b) < 0.98;
            rec.box = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), lean, foot: xs[ys.indexOf(Math.min(...ys))],
              depth: it.w * Math.sin(q) + it.d * Math.cos(q), zc: rec.node.position.z, lying: Math.abs(b) >= 0.98 }; }
          const cover = rec.node.userData.cover;
          if (cover) {
            const m = cover.material, want = m.userData.ct && m.userData.ct.userData.ok ? m.userData.ct : m.userData.plain;
            if (m.map !== want) { m.map = want; m.needsUpdate = true; }
            cover.visible = it.open > 0.02;
          }
        }
        for (const [id, rec] of books) if (!seen.has(id)) { scene.remove(rec.outer); disposeBook(rec.node); if (rec.soft) rec.soft.forEach((m) => scene.remove(m)); books.delete(id); }
        // shadow catchers: the shelf floor and the wall just behind the deepest book
        const zw = -(maxW + 6);
        floor.scale.set(viewW + 400, -zw + 400, 1); floor.position.set(viewW / 2, 0, zw + (-zw + 400) / 2);
        wall.scale.set(viewW + 400, stageH + top + 200, 1); wall.position.set(viewW / 2, (stageH + top + 200) / 2, zw);
        // soft grounding the single light can't give: a dark contact shadow on the floor right round each book's foot, and a
        // soft halo on the wall close round its silhouette (osamu's white-shelf reference), a little to the right
        for (const rec of books.values()) {
          if (!rec.soft) { rec.soft = [new THREE.Mesh(unitPlane, contactMat), new THREE.Mesh(unitPlane, haloMat)]; rec.soft[0].renderOrder = 1; rec.soft[1].renderOrder = 1; scene.add(...rec.soft); }
          const [ct, hl] = rec.soft, bx = rec.box, vis = rec.outer.visible && bx;
          ct.visible = hl.visible = !!vis;
          if (!vis) continue;
          const wx = bx.x1 - bx.x0, blur = H * 0.05;
          if (bx.y0 < 4) {
            const cw = bx.lean ? Math.max(8, wx * 0.35) : wx, cx = bx.lean ? bx.foot : (bx.x0 + bx.x1) / 2;
            const dz = bx.lying ? Math.max(8, bx.depth) : bx.depth;
            ct.visible = true; ct.rotation.set(-Math.PI / 2, 0, 0);
            ct.scale.set(cw + blur * 1.4, dz + H * 0.3, 1); ct.position.set(cx + H * 0.008, 0.4, (bx.lying ? -dz / 2 : bx.zc) + H * 0.1); // reaching out in front of the foot, where you can see it
          } else ct.visible = false;
          hl.scale.set(wx + blur * 2.4, bx.y1 - bx.y0 + blur * 2.4, 1);
          hl.position.set((bx.x0 + bx.x1) / 2 + H * 0.025, (bx.y0 + bx.y1) / 2 - blur * 0.2, zw + 0.5);
        }
        // the light: from the front and upper left
        key.position.set(viewW / 2 - H * 1.5, H * 3, H * 2.6); key.target.position.set(viewW / 2, H * 0.4, zw / 2); key.target.updateMatrixWorld();
        const sc = key.shadow.camera, span = viewW / 2 + H * 1.2;
        sc.left = -span; sc.right = span; sc.top = H * 1.6; sc.bottom = -H * 1.6; sc.near = 10; sc.far = H * 8; sc.updateProjectionMatrix();
        frameDirty = true;
        inst.render();
      },
      render() {
        if (dead || !frameDirty || !W || !onScreen) return;
        frameDirty = false;
        if (renderer.getContext().isContextLost()) return;
        renderer.setSize(W, Hc, false);
        renderer.render(scene, camera);
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.drawImage(renderer.domElement, 0, 0, cv.width, cv.height);
      },
      dispose() {
        if (dead) return; dead = true; live.delete(inst);
        for (const rec of books.values()) disposeBook(rec.node);
        io.disconnect();
        scene.traverse((o) => { if (o.isLight && o.shadow && o.shadow.map) o.shadow.map.dispose(); });
        cv.remove();
      },
      canvas: cv,
    };
    live.add(inst);
    return inst;
  }
  function disposeBook(node) {
    (node.userData.geos || []).forEach((g) => g.dispose());
    if (node.userData.geos_extra) node.userData.geos_extra.dispose();
    (node.userData.mats || []).forEach((m) => { if (m.userData && m.userData.plain) m.userData.plain.dispose(); });
    (node.userData.mats || []).forEach((m) => { if (m.map && !texCache.has(m.map.image && m.map.image.src) && m.map !== clothTex) m.map.dispose(); m.dispose(); });
  }

  window.Books3D = {
    ready: () => !!THREE,
    whenReady(f) { if (THREE) f(); else waiting.push(f); },
    create: (stage, opts) => create(stage, opts),
    // shelves rebuilt by the app: drop the ones whose canvas has left the page, so phones don't run out of WebGL slots
    sweep() { for (const s of [...live]) if (!s.canvas.isConnected) s.dispose(); },
  };
})();
