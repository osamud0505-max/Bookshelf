/* v343 (osamu, 2026-11-12: "delete all the objects that were created in the very beginning"): the 45 original hand-drawn
   objects are taken out of the app. They leave the Add menu, any shelf that had one shows nothing in its place, and the
   looks that used one as their built-in light (cottage, candle, castle, vampire, witch, forest, library, academia,
   victorian, bordello, nook) start with no object. Only osamu's painted objects remain. */
(() => {
  const D = window.Decor; if (!D) return;
  const OLD = ["candlestick", "candelabra", "twist", "chamber", "squareBrass", "pinkLamp", "bracketLantern", "oilLamp", "pillars",
    "mushrooms", "plant", "succulent", "hourglass", "globe", "crystal", "fairyJar", "clock", "bust", "gothicCandelabra", "bunny",
    "teddy", "catLamp", "tulips", "instax", "heartMirror", "candleJar", "oldCamera", "snowGlobe", "apothecary", "mortar", "scales",
    "ballet", "perfume", "topiary", "wineBottle", "tulipCandle", "specimenJar", "beetles", "heartPotion", "grimoire", "crystalBall",
    "skull", "potions", "quillInk", "rumBottles"];
  for (const k of OLD) delete D.ORNAMENTS[k];
  for (const L of Object.values(D.LOOKS)) if (L.set && L.set.ornament && !D.ORNAMENTS[L.set.ornament.kind]) L.set.ornament = { kind: "none", pos: "end" };
})();

/* v436 (osamu, 2026-11-19): the old code-drawn hanging lights from before each look got its own painted lights are gone
   (fireflies stay). They leave the ✦ menu, and a shelf that had one shows nothing in its place. A look that redrew its
   lights still swaps an old save's style for the new one first (app.js shelfLights runs LIGHT_SWAP before this filter). */
(() => {
  const D = window.Decor; if (!D) return;
  for (const k of ["fairy", "globe", "stars", "candles", "lanterns", "chinese", "wisteria", "loftCages"]) delete D.LIGHT_STYLES[k];
})();

/* v438: the reader's bookmarks are osamu's Gemini paintings, one per look (obj/bm-<look>.webp, keyed, top edge = the
   picture's top so it tucks under the page). They replace every old drawn bookmark; a save that still names an old one
   gets the current look's painting. Each fits the old 28 x 84 box (height-limited, centred), so nothing grew. */
(() => {
  const D = window.Decor; if (!D || !D.BOOKMARKS) return;
  const P = { minimal: ["Charcoal ribbon", 62], cabin: ["Leather & plaid", 57], library: ["Wax seal", 64], loft: ["Steel strip", 33], starry: ["Starry velvet", 49], cottage: ["Lace & rose", 61], candle: ["Gilded filigree", 51], vampire: ["Velvet & lace", 54], victorian: ["Gold acanthus", 52], castle: ["Old key", 53], bordello: ["Gothic arch", 47], forest: ["Pressed fern", 75], academia: ["Damask velvet", 57], teahouse: ["Lacquer & tassel", 69], witch: ["Raven feather", 48], closet: ["Pink hearts", 46] };
  for (const k of Object.keys(D.BOOKMARKS)) delete D.BOOKMARKS[k];
  for (const [k, [label, w]] of Object.entries(P)) {
    const bw = Math.min(28, (w / 270) * 84), bh = (bw / w) * 270;
    D.BOOKMARKS["pic_" + k] = { label, img: `obj/bm-${k}.webp?v=1`, draw: () => `<image href="obj/bm-${k}.webp?v=1" x="${(28 - bw) / 2}" y="-3" width="${bw}" height="${bh}"/>` };
    if (D.LOOKS[k]) D.LOOKS[k].set.bookmark = "pic_" + k;
  }
  const lookBm = () => { const lk = window.Shelf && window.Shelf.lookKey ? window.Shelf.lookKey() : ""; return D.BOOKMARKS["pic_" + lk] ? "pic_" + lk : "pic_minimal"; };
  D.bookmarkKind = (kind) => (D.BOOKMARKS[kind] ? kind : lookBm());
  D.bookmarkSvg = (kind, w = 28) => `<svg viewBox="0 -3 28 87" width="${w}" height="${(w * 87) / 28}" aria-hidden="true" overflow="visible">${D.BOOKMARKS[D.bookmarkKind(kind)].draw()}</svg>`;
})();
