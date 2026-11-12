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
  // ---- the 3D lipstick lamp, measured off osamu's painting (units: the painting's 95.3 x 200 box, y up from the case's foot)
  const LIP_VW = 95.3, LIP_CX = 36.7, LIP_BASE_R = 34.4, LIP_REST = 38.5;
  let lipShared = null;
  function lipParts() {
    if (lipShared) return lipShared;
    // brushed gold: bright and dark bands running round the tube, like the painted highlights
    const c = document.createElement("canvas"); c.width = 256; c.height = 4; const g = c.getContext("2d"), gr = g.createLinearGradient(0, 0, 256, 0);
    [[0, "#6b4a1c"], [0.12, "#b88a3e"], [0.24, "#f4dc98"], [0.3, "#fff4cc"], [0.37, "#e2b866"], [0.5, "#9b7030"], [0.62, "#c79a4c"], [0.72, "#f0d48a"], [0.82, "#a87b36"], [1, "#6b4a1c"]].forEach(([o, col]) => gr.addColorStop(o, col));
    g.fillStyle = gr; g.fillRect(0, 0, 256, 4);
    const goldTex = new THREE.CanvasTexture(c); goldTex.colorSpace = THREE.SRGBColorSpace; goldTex.wrapS = THREE.RepeatWrapping;
    // the case: a ridged foot, then the tube with a rolled lip, open at the top so the bullet sits inside it
    const P = (r, y) => new THREE.Vector2(r, y), prof = [P(0, 0), P(31.5, 0), P(33.6, 1.6), P(34.2, 6)];
    for (let i = 0; i < 5; i++) { const y = 6 + i * 9.2; prof.push(P(34.4, y + 1.2), P(34.4, y + 6.6), P(32.6, y + 7.8), P(32.6, y + 8.4), P(34.4, y + 9.2)); }
    prof.push(P(33.2, 54.5), P(29, 57), P(27.7, 60), P(28.7, 61), P(28.7, 64.6), P(27.7, 65.6), P(27.7, 135.5), P(27.1, 136.4), P(27.7, 137.3), P(27.7, 140.5), P(27.1, 141.4), P(27.7, 142.3), P(27.7, 150), P(28.4, 151.4), P(28.2, 153.4), P(26.6, 154.2), P(25.4, 152.6), P(25.4, 110));
    const caseGeo = new THREE.LatheGeometry(prof, 72);
    // the bullet: a round stick with a rounded tip, tilted so it's high at the back left like the painting. v308: it had a flat,
    // sharp-edged cut that looked like the bullet was sliced in half (osamu)
    const R = 24.6, bp = [new THREE.Vector2(0, -40), new THREE.Vector2(R, -40)]; // v310: fills the tube like the real lamp
    for (let i = 0; i <= 8; i++) bp.push(new THREE.Vector2(R, -40 + i * 7.5));
    for (let i = 1; i <= 16; i++) { const t = (i / 16) * Math.PI / 2; bp.push(new THREE.Vector2(Math.max(0.001, R * Math.cos(t)), 20 + 20 * Math.sin(t))); }
    const bulletGeo = new THREE.LatheGeometry(bp, 56), pos = bulletGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i), y = pos.getY(i), u = Math.min(1, Math.max(0, (y + 6) / 46)), w = u * u * (3 - 2 * u);
      pos.setY(i, y - w * (((x + R) / (2 * R)) * 24 + ((z + R) / (2 * R)) * 3)); }
    bulletGeo.translate(0, 155, 0); bulletGeo.computeVertexNormals();
    // a soft room to reflect, so the gold shines like metal instead of going brown: bright ceiling, pink walls, a few light strips
    const ev = document.createElement("canvas"); ev.width = 256; ev.height = 128; const e = ev.getContext("2d"), eg = e.createLinearGradient(0, 0, 0, 128);
    [[0, "#fffdf6"], [0.35, "#fff3ec"], [0.55, "#e9c4cc"], [0.8, "#a07882"], [1, "#4e3a40"]].forEach(([o, col]) => eg.addColorStop(o, col));
    e.fillStyle = eg; e.fillRect(0, 0, 256, 128);
    e.fillStyle = "rgba(255,255,250,.95)"; [[30, 14], [96, 8], [150, 18], [214, 10], [118, 3], [180, 4]].forEach(([x, w]) => e.fillRect(x, 16, w, 58));
    e.fillStyle = "rgba(60,30,30,.55)"; [[60, 12], [130, 10], [235, 9]].forEach(([x, w]) => e.fillRect(x, 10, w, 80));
    const envTex = new THREE.CanvasTexture(ev); envTex.colorSpace = THREE.SRGBColorSpace; envTex.mapping = THREE.EquirectangularReflectionMapping;
    lipShared = { goldTex, caseGeo, bulletGeo, envTex };
    return lipShared;
  }
  function buildLipstick() {
    const S = lipParts(), group = new THREE.Group();
    const gold = new THREE.MeshStandardMaterial({ color: "#fff6dc", map: S.goldTex, metalness: 0.9, roughness: 0.2, envMap: S.envTex, envMapIntensity: 1.6, side: THREE.DoubleSide });
    const cs = new THREE.Mesh(S.caseGeo, gold); cs.castShadow = true; cs.receiveShadow = true; group.add(cs);
    // v309: the glitter is IN the bullet (osamu: "the small glitters in it to shine, not sparkles around it"). Each fleck is a
    // tiny tilted mirror fixed in the lipstick: some catch the light and glint as it turns and twinkles, most stay a soft shimmer
    const U = { uTime: { value: 0 }, uGlow: { value: 0 } };
    const redMat = new THREE.MeshStandardMaterial({ color: "#8e0f22", roughness: 0.26, metalness: 0.05, envMap: S.envTex, envMapIntensity: 0.55 });
    redMat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vGP;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvGP = position;");
      // the lamp's own light shines out of the bullet, so it must not light the bullet's outside
      sh.fragmentShader = sh.fragmentShader.replace("#include <lights_fragment_begin>", THREE.ShaderChunk.lights_fragment_begin.replace("#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )", "#if 0"));
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", `#include <common>
varying vec3 vGP; uniform float uTime; uniform float uGlow;
vec3 gH(vec3 p) { p = fract(p * vec3(.1031, .1030, .0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx); }
vec2 gLayer(vec3 p, float d, float sz) {
  vec3 q = p * d, c = floor(q), f = fract(q), h = gH(c);
  float m = smoothstep(sz, sz * .35, length(f - (.2 + .6 * h)));
  float tw = pow(max(0., sin(uTime * (1.2 + 2.6 * h.x) + h.y * 40.)), 14.);
  float st = step(.55, h.z);
  return vec2(m, m * tw * st);
}`).replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
{ vec2 a = gLayer(vGP, .42, .24), b = gLayer(vGP + 17.3, 1.0, .2);
  float mica = a.x * .7 + b.x * .35, glint = max(a.y, b.y * .6);
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1., .42, .46), mica * .1);
  totalEmissiveRadiance += uGlow * (vec3(.17, .012, .03) + mica * vec3(.3, .07, .1) + glint * vec3(4.5, 3.6, 3.8));
  float inner = 1. - smoothstep(118., 192., vGP.y);
  totalEmissiveRadiance += uGlow * inner * vec3(.75, .07, .1);
  totalEmissiveRadiance += (1. - uGlow) * glint * vec3(.35, .25, .28); }`);
    };
    const bullet = new THREE.Group(), bm = new THREE.Mesh(S.bulletGeo, redMat); bm.castShadow = true; bullet.add(bm);
    group.add(bullet);
    // v311: real light from the bullet (osamu): a warm red lamp that lights the books and objects round it, and a soft pool of
    // its colour on the shelf floor under it
    const light = new THREE.PointLight("#ff5a64", 0, 0, 2); light.visible = false; bullet.add(light);
    light.position.set(0, 176, 40); // just in front of the bullet (which ignores it), so it falls on the books and the case
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: "#ff7684", map: poolTex(), transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
    pool.rotation.x = -Math.PI / 2; pool.renderOrder = 2; pool.visible = false;
    const cable = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: "#f3eee8", roughness: 0.75, metalness: 0, clippingPlanes: [new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)] }));
    cable.castShadow = true; cable.receiveShadow = true;
    return { group, bullet, redMat, U, light, pool, cable, cableKey: "", rise: { v: 0, tr: null }, glow: { v: 0, tr: null }, on: undefined };
  }

  // a round pool of light, brightest in the middle, fading smoothly to nothing at the rim
  let poolT = null;
  function poolTex() {
    if (poolT) return poolT;
    const N = 128, c = document.createElement("canvas"); c.width = c.height = N; const g = c.getContext("2d");
    const gr = g.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
    [[0, 1], [0.2, 0.75], [0.45, 0.38], [0.7, 0.12], [1, 0]].forEach(([o, a]) => gr.addColorStop(o, `rgba(255,255,255,${a})`));
    g.fillStyle = gr; g.fillRect(0, 0, N, N);
    poolT = new THREE.CanvasTexture(c); return poolT;
  }
  let sharedR = null;
  // v299: three's PCF takes 17 on/off samples spread 4 texels apart, which drew the soft edge as visible steps (osamu: "a bit
  // pixelated"). This swaps it for a smooth 6x6-texel box: 49 neighbouring samples, the outer ring weighted by where the
  // point falls between texels, so the edge fades evenly however the shadow map's grid lines up with the screen.
  let pcfPatched = false;
  function smoothPCF() {
    if (pcfPatched) return; pcfPatched = true;
    const C = THREE.ShaderChunk, src = C.shadowmap_pars_fragment, a = src.indexOf("#if defined( SHADOWMAP_TYPE_PCF )"), b = src.indexOf("#elif defined( SHADOWMAP_TYPE_PCF_SOFT )");
    if (a < 0 || b < a) return;
    C.shadowmap_pars_fragment = src.slice(0, a) + `#if defined( SHADOWMAP_TYPE_PCF )
			vec2 ts = max( shadowRadius, 1.0 ) / shadowMapSize, tc = shadowCoord.xy / ts + 0.5;
			vec2 f = fract( tc ), base = ( floor( tc ) - 0.5 ) * ts;
			float sum = 0.0;
			for ( int j = -3; j <= 3; j ++ ) {
				float wy = j == -3 ? 1.0 - f.y : ( j == 3 ? f.y : 1.0 );
				for ( int i = -3; i <= 3; i ++ ) {
					float wx = i == -3 ? 1.0 - f.x : ( i == 3 ? f.x : 1.0 );
					sum += wx * wy * texture2DCompare( shadowMap, base + vec2( float( i ), float( j ) ) * ts, shadowCoord.z );
				}
			}
			shadow = sum / 36.0;
		` + src.slice(b);
  }
  function shared() {
    if (sharedR && !sharedR.getContext().isContextLost()) return sharedR;
    smoothPCF();
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false, powerPreference: "high-performance" });
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    r.localClippingEnabled = true; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFShadowMap;
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
    key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 2; // v305: finer map, same softness (osamu: stepped edges on the floor shadows) key.shadow.blurSamples = 24; key.shadow.bias = -0.0005;
    scene.add(key, key.target);
    const hemi = new THREE.HemisphereLight("#fffaf2", "#8f8577", 1.25); scene.add(hemi);
    const tint = opts.tint || "#000000";
    const floorMat = new THREE.ShadowMaterial({ color: tint, opacity: 0.55 });
    const wallMat = new THREE.ShadowMaterial({ color: tint, opacity: 0.6 }); // v294: as dark as the test shelf's
    // v297: floor and wall are one bent surface that shares its corner edge; as two separate planes their soft shadows met in a
    // dark line along the back of the shelf (osamu)
    const roomGeo = new THREE.BufferGeometry();
    roomGeo.setAttribute("position", new THREE.Float32BufferAttribute(new Array(18).fill(0), 3));
    roomGeo.setAttribute("normal", new THREE.Float32BufferAttribute([0,1,0, 0,1,0, 0,1,0, 0,0,1, 0,0,1, 0,0,1], 3));
    roomGeo.setIndex([0, 1, 2, 0, 2, 3]); // v301: osamu: shadows on the shelf floor only, never on the backdrop (the wall part is left out)
    const room = new THREE.Mesh(roomGeo, wallMat); room.receiveShadow = true; scene.add(room);
    const floor = { scale: { set() {} }, position: { set() {} } }, wall = floor;
    const unitPlane = new THREE.PlaneGeometry(1, 1);
    const contactMat = new THREE.MeshBasicMaterial({ color: tint, map: softTex(0.3), transparent: true, opacity: 0.45, depthWrite: false, toneMapped: false });
    const haloMat = new THREE.MeshBasicMaterial({ color: tint, map: softTex(0.2), transparent: true, opacity: 0.3, depthWrite: false, toneMapped: false });
    const books = new Map(); // id -> { node, sig }
    // v307: the lipstick lamp is a real 3D model (osamu chose it as the first object to make 3D). The bullet twists up out of the
    // case on the same timing as the painted one; once up it glows, with sparkles twinkling round its tip and no light thrown
    // round the shelf (osamu: light only on the bullet, magical and sparkly, not spread out)
    const bez = (x1, y1, x2, y2) => (t) => { const c = (u, a, b) => 3 * a * u * (1 - u) ** 2 + 3 * b * u * u * (1 - u) + u ** 3; let lo = 0, hi = 1; for (let i = 0; i < 22; i++) { const m = (lo + hi) / 2; if (c(m, x1, x2) < t) lo = m; else hi = m; } return c((lo + hi) / 2, y1, y2); };
    const EASE = bez(0.25, 0.1, 0.25, 1), STROKE = bez(0.42, 0, 0.4, 1);
    // three twists of the hand, each easing in and out with a short pause to re-grip between them
    const twists = (t) => { const i = Math.min(2, Math.floor(t * 3)), u = Math.min(1, (t * 3 - i) / 0.82); return (i + STROKE(u)) / 3; };
    const UP = twists, DOWN = twists;
    const tween = (o, now) => { if (!o.tr) return; const k = (now - o.tr.t0) / o.tr.dur; if (k >= 1) { o.v = o.tr.to; o.tr = null; } else if (k > 0) o.v = o.tr.from + (o.tr.to - o.tr.from) * o.tr.fn(k); };
    function applyLip(rec, now) {
      const L = rec.lip; tween(L.rise, now); tween(L.glow, now);
      // v310: it twists open like a real lipstick (osamu's videos): the bullet turns as it rides up, one full turn in all,
      // in three hand twists, and comes to rest facing the way the painting does
      L.bullet.position.y = -LIP_REST * (1 - L.rise.v); L.bullet.rotation.y = -Math.PI * 2 * (1 - L.rise.v);
      const g = L.glow.v;
      L.U.uTime.value = (now / 1000) % 1000; L.U.uGlow.value = L.glow.v;
      L.light.visible = g > 0.01; L.light.intensity = L.lightMax * g;
      L.pool.visible = g > 0.01; L.pool.material.opacity = 0.9 * g;
    }
    let lampRaf = 0, lampLast = 0;
    function lampTick() {
      if (lampRaf || dead) return;
      lampRaf = requestAnimationFrame((ts) => {
        lampRaf = 0; let moving = false, twinkling = false; const now = performance.now();
        for (const rec of objs.values()) if (rec.lip) { applyLip(rec, now); if (rec.lip.rise.tr || rec.lip.glow.tr) moving = true; if (rec.lip.glow.v > 0.01) twinkling = true; }
        // the twinkle alone runs at about 30 frames a second and reuses the shadows already drawn
        if (moving || ts - lampLast > 32) { lampLast = ts; frameDirty = true; skipShadows = !moving; inst.render(); skipShadows = false; }
        if ((moving || twinkling) && onScreen) lampTick();
      });
    }
    let skipShadows = false;
    const objs = new Map(); // object id -> { mesh, tex, depth, img }
    let dead = false, W = 0, Hc = 0, top = 0, bottom = 0, frameDirty = false;
    const inst = {
      // items: [{ id, b, h, w, d, A: [a,b,c,d,e,f], ox, oy, base, open, rec, visible, spineUrl, coverUrl, ink, font, hard, glossy }]
      sync(items, geom) {
        if (dead) return;
        const { stageH, viewW, H, topD } = geom;
        // the canvas covers the row, a bit above the tallest book for the tops and wall shadows, and the floor in front
        // v293, as on osamu's test shelf: a near eye (about a 26 degree view across the screen), a little above the books
        // (about 1.85 times a book's height), the books' fronts a short way back from the shelf's front edge (F) and their backs
        // against the wall (zw). Where the floor's front edge and the wall line land on screen is handed back, so the painted
        // floor can be stretched to fit
        const Dc = viewW / 2 / Math.tan((13 * Math.PI) / 180);
        const eyeY = H + Dc * 0.2, F = H * 0.2;
        let wMax = 40; for (const it of items) wMax = Math.max(wMax, it.w);
        const zw = -(wMax + H * 0.22); // a gap behind the books, as on the test shelf, so their shadows show on the wall
        const sOf = (z) => (eyeY * -z) / (Dc - z);
        const below = -sOf(F), depth = sOf(zw) + below;
        top = Math.round(H * 0.6); bottom = Math.round(below + 4);
        const cw = viewW, ch = stageH + top + bottom;
        if (cw !== W || ch !== Hc) {
          W = cw; Hc = ch; cv.width = Math.round(cw * pr); cv.height = Math.round(ch * pr);
          cv.style.cssText = `position:absolute;left:0;top:${-top}px;width:${cw}px;height:${ch}px;pointer-events:none`;
        }
        // eye above the row, as far away as the flat books' perspective; world units are css px, y up from the shelf floor
        const cx = viewW / 2;
        camera.position.set(cx, eyeY, Dc); camera.up.set(0, 1, 0); camera.lookAt(cx, eyeY, 0);
        const n = 20, f = Dc + 3000, k = n / Dc;
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
        // objects: an unseen cut-out of each one's silhouette, standing a little back from the front of the shelf. Only the light
        // sees it, so it throws the object's real shadow onto the floor and the wall alongside the books'
        { const live = new Set();
          for (const ob of geom.objs || []) {
            live.add(ob.id);
            let rec = objs.get(ob.id);
            if (!rec || rec.img !== ob.img) {
              if (rec) { scene.remove(rec.mesh); if (rec.lip) scene.remove(rec.lip.group, rec.lip.pool, rec.lip.cable); rec.tex.dispose(); rec.depth.dispose(); rec.mesh.geometry.dispose(); }
              const c2 = document.createElement("canvas"); c2.width = Math.max(2, Math.round(ob.w * 2)); c2.height = Math.max(2, Math.round(ob.h * 2)); c2.getContext("2d").drawImage(ob.img, 0, 0, c2.width, c2.height);
              const tex = new THREE.CanvasTexture(c2);
              // three's shadow pass takes the cut-out's picture and alpha test from the object's own material
              const depth = new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, colorWrite: false, depthWrite: false, side: THREE.DoubleSide });
              // v306 (osamu: the bag at the back looked like it floats): a picture can hold several things one behind the other,
              // the ones further back standing higher up the picture. So the cut-out is split into thin upright strips, and each
              // strip stands on the shelf floor as far back as its own lowest solid point shows it standing
              const NC = Math.max(8, Math.min(64, Math.round(ob.w / 4))), a = c2.getContext("2d").getImageData(0, 0, c2.width, c2.height).data;
              const foot = []; // per strip: how far up from the picture's bottom its lowest solid point is (0..1)
              for (let k = 0; k < NC; k++) {
                const x0 = Math.floor((k / NC) * c2.width), x1 = Math.max(x0 + 1, Math.floor(((k + 1) / NC) * c2.width));
                let low = -1;
                for (let y = c2.height - 1; y >= 0 && low < 0; y--) for (let x = x0; x < x1; x++) if (a[(y * c2.width + x) * 4 + 3] > 128) { low = y; break; }
                foot.push(low < 0 ? null : (c2.height - 1 - low) / c2.height);
              }
              // empty strips take their neighbour's footing; a strip never stands further back than the lower of its neighbours
              // plus a little, so one stray pixel doesn't tear the shadow
              for (let k = 0; k < NC; k++) if (foot[k] == null) { let d = 1; while (d < NC && foot[k - d] == null && foot[k + d] == null) d++; foot[k] = foot[k - d] ?? foot[k + d] ?? 0; }
              const pos = new Float32Array(NC * 4 * 3), uv = new Float32Array(NC * 4 * 2), idx = [];
              for (let k = 0; k < NC; k++) {
                const u0 = Math.max(0, (k - 0.6) / NC), u1 = Math.min(1, (k + 1.6) / NC), v0 = foot[k]; // strips overlap so no light slips between them
                uv.set([u0, v0, u1, v0, u0, 1, u1, 1], k * 8);
                const q = k * 4; idx.push(q, q + 1, q + 3, q, q + 3, q + 2);
              }
              const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx);
              const mesh = new THREE.Mesh(geo, depth); mesh.castShadow = true; mesh.frustumCulled = false;
              scene.add(mesh); rec = { mesh, tex, depth, img: ob.img, foot, NC }; objs.set(ob.id, rec);
            }
            rec.mesh.visible = ob.visible !== false;
            { // place each strip: its foot on the floor where the floor shows at that height on screen, scaled for being further back
              const P = rec.mesh.geometry.attributes.position, onPile = ob.y > 1;
              for (let k = 0; k < rec.NC; k++) {
                const sB = onPile ? 0 : rec.foot[k] * ob.h; // screen px above the floor's front line
                const z = onPile ? -1 : Math.max(zw + 2, Math.min(-1, (sB * Dc) / (sB - eyeY))), sc = (Dc - z) / Dc;
                const yb = onPile ? ob.y : 0, yt = yb + (ob.h - sB) * sc, xa = ob.x + Math.max(0, (k - 0.6) / rec.NC) * ob.w, xb = ob.x + Math.min(1, (k + 1.6) / rec.NC) * ob.w;
                const X = (x) => cx + (x - cx) * sc;
                P.array.set([X(xa), yb, z, X(xb), yb, z, X(xa), yt, z, X(xb), yt, z], k * 12);
              }
              P.needsUpdate = true; rec.mesh.geometry.computeBoundingSphere();
            }
            if (ob.hasLamp) {
              if (!rec.lip) { rec.lip = buildLipstick(); scene.add(rec.lip.group); }
              const L = rec.lip, k = ob.w / LIP_VW, on = !!ob.lamp && ob.visible !== false, now = performance.now();
              rec.mesh.visible = false; // the model casts its own shadow
              L.group.visible = ob.visible !== false;
              L.group.scale.setScalar(k); L.group.position.set(ob.x + LIP_CX * k, ob.y, -LIP_BASE_R * k - 1);
              if (!L.pool.parent) scene.add(L.pool, L.cable);
              const lx = ob.x + LIP_CX * k, lz = -LIP_BASE_R * k - 1, Rb = LIP_BASE_R * k;
              L.lightMax = 26000 * (H / 100) ** 2; L.light.distance = H * 1.8;
              L.pool.scale.set(H * 2.2, (F - zw) * 1.3, 1); L.pool.position.set(lx, 0.4, (F + zw) / 2);
              // v311: the lamp's cable (osamu): out of the back of the base, along the shelf floor to the back, and down behind it
              const ck = [lx, lz, zw, k, ob.y].map((v) => v.toFixed(1)).join();
              if (L.cableKey !== ck) {
                L.cableKey = ck; const r = Math.max(1.1, 2.2 * k), y0 = ob.y + r, V3 = (x, y, z) => new THREE.Vector3(x, y, z);
                const pts = [V3(lx + Rb * 0.35, y0 + 2 * k, lz - Rb * 0.7), V3(lx + Rb * 0.6, y0, lz - Rb * 1.15), V3(lx + Rb * 0.95, r, lz - Rb * 1.6),
                  V3(lx + Rb * 1.25, r, (lz - Rb * 1.6 + zw) / 2), V3(lx + Rb * 1.4, r, zw + r * 2.5), V3(lx + Rb * 1.45, r * 0.4, zw + r * 0.3),
                  V3(lx + Rb * 1.45, -r * 3, zw - r * 0.6), V3(lx + Rb * 1.45, -H * 0.6, zw - r * 0.9)];
                L.cable.geometry.dispose(); L.cable.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "centripetal"), 90, r, 10, false);
              }
              L.cable.visible = L.group.visible;
              if (L.on === undefined) { L.on = on; L.rise.v = L.glow.v = on ? 1 : 0; }
              else if (on !== L.on) {
                L.on = on;
                L.rise.tr = { from: L.rise.v, to: on ? 1 : 0, t0: now, dur: on ? 2300 : 1500, fn: on ? UP : DOWN };
                L.glow.tr = { from: L.glow.v, to: on ? 1 : 0, t0: now + (on ? 1700 : 0), dur: on ? 1100 : 600, fn: EASE };
              }
              applyLip(rec, now); if (L.rise.tr || L.glow.tr || L.glow.v > 0.01) lampTick();
            }
          }
          for (const [id, rec] of objs) if (!live.has(id)) { scene.remove(rec.mesh); if (rec.lip) scene.remove(rec.lip.group, rec.lip.pool, rec.lip.cable); rec.tex.dispose(); rec.depth.dispose(); rec.mesh.geometry.dispose(); objs.delete(id); } }
        for (const [id, rec] of books) if (!seen.has(id)) { scene.remove(rec.outer); disposeBook(rec.node); if (rec.soft) rec.soft.forEach((m) => scene.remove(m)); books.delete(id); }
        // shadow catchers: the shelf floor and the wall just behind the deepest book
        { const x0 = -400, x1 = viewW + 400, yt = stageH + top + 400, P = roomGeo.attributes.position;
          // 0,1: floor front edge; 3,2: the corner; 4,5: top of the wall
          [[x0, 0, F], [x1, 0, F], [x1, 0, zw], [x0, 0, zw], [x1, yt, zw], [x0, yt, zw]].forEach((v, k) => P.setXYZ(k, ...v));
          P.needsUpdate = true; roomGeo.computeBoundingSphere(); }
        wall.scale.set(viewW + 800, stageH + top + 400, 1); wall.position.set(viewW / 2, (stageH + top + 400) / 2, zw);
        // soft grounding the single light can't give: a dark contact shadow on the floor right round each book's foot, and a
        // soft halo on the wall close round its silhouette (osamu's white-shelf reference), a little to the right
        for (const rec of books.values()) {
          if (!rec.soft) { rec.soft = [new THREE.Mesh(unitPlane, contactMat), new THREE.Mesh(unitPlane, haloMat)]; rec.soft[0].renderOrder = 1; rec.soft[1].renderOrder = 1; scene.add(...rec.soft); }
          const [ct, hl] = rec.soft, bx = rec.box, vis = rec.outer.visible && bx;
          ct.visible = !!vis; hl.visible = false; // the real light now draws the wall shadow
          if (!vis) continue;
          const wx = bx.x1 - bx.x0, blur = H * 0.05;
          if (bx.y0 < 4) {
            const cw = bx.lean ? Math.max(8, wx * 0.35) : wx, cx = bx.lean ? bx.foot : (bx.x0 + bx.x1) / 2;
            const dz = bx.lying ? Math.max(8, bx.depth) : bx.depth;
            ct.visible = true; ct.rotation.set(-Math.PI / 2, 0, 0);
            ct.scale.set(cw + blur * 0.7, dz + blur * 0.7, 1); ct.position.set(cx, 0.3, bx.lying ? -dz / 2 : bx.zc); // a tight dark contact right round the foot
          } else ct.visible = false;
          hl.scale.set(wx + blur * 2.4, bx.y1 - bx.y0 + blur * 2.4, 1);
          hl.position.set((bx.x0 + bx.x1) / 2 + H * 0.025, (bx.y0 + bx.y1) / 2 - blur * 0.2, zw + 0.5);
        }
        // the light: from the front and upper left
        key.position.set(viewW / 2 - H * 1.6, H * 3.6, H * 4.1); key.target.position.set(viewW / 2, 0, zw / 2); key.target.updateMatrixWorld();
        const sc = key.shadow.camera, span = viewW / 2 + H * 1.2;
        sc.left = -span; sc.right = span; sc.top = H * 2.2; sc.bottom = -H * 2.2; sc.near = 10; sc.far = H * 12; sc.updateProjectionMatrix();
        frameDirty = true;
        inst.render();
        // where an object's shadow lands on the wall, flat on the screen: the same light, from the shelf front to the wall
        const L = new THREE.Vector3(-1.6, 3.6, 4.1), g = -zw, sc2 = Dc / (Dc + g);
        return { below, depth, shX: ((-L.x / L.z) * g) * sc2, shY: ((L.y / L.z) * g) * sc2 };
      },
      render() {
        if (dead || !frameDirty || !W || !onScreen) return;
        frameDirty = false;
        if (renderer.getContext().isContextLost()) return;
        renderer.setSize(W, Hc, false);
        renderer.shadowMap.autoUpdate = !skipShadows; renderer.shadowMap.needsUpdate = !skipShadows;
        renderer.render(scene, camera);
        renderer.shadowMap.autoUpdate = true;
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
