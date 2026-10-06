/* Ariadna: funciona sin conexión. Cambia VERSION al publicar una versión nueva. */
const VERSION = "ariadna-20261006-2325";
const FILES = ["./", "index.html", "tesseract.min.js", "zxing.min.js", "jszip.min.js", "ocr-eng.js", "ocr-worker-simd.js", "ocr-worker.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-180.png"];
/* El lector de zona (unos 25 MB) se guarda aparte la primera vez que se usa y no se vuelve a descargar con cada versión. */
const MODELS = "ariadna-modelos-v1";
const BIG = ["ort.wasm.min.js", "ort-wasm-simd-threaded.wasm", "ort-wasm-simd-threaded.mjs", "rec.onnx", "keys.txt"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== MODELS).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  if (BIG.some(f => u.pathname.endsWith("/" + f))) {
    e.respondWith(caches.open(MODELS).then(async c => { const hit = await c.match(e.request, { ignoreSearch:true }); if (hit) return hit; const r = await fetch(e.request); if (r.ok) c.put(e.request, r.clone()); return r; }));
    return;
  }
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch:true });
    const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
