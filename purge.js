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
