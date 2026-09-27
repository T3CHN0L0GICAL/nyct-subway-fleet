const CACHE_NAME = "fleet-identifier-5-3h-a";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./favicon.png",
  "./mta-logo.png",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
  "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"
];
self.addEventListener("install", event => {
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await Promise.allSettled(APP_SHELL.map(url=>cache.add(url)));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE_NAME && k.startsWith("fleet-identifier-")).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  if(event.request.method!=="GET") return;
  const url=new URL(event.request.url);
  if(url.hostname.includes("supabase.co")) return; // never cache account/database API traffic
  if(event.request.mode==="navigate"){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(event.request);
        const cache=await caches.open(CACHE_NAME); cache.put("./index.html",fresh.clone());
        return fresh;
      }catch(_){
        return (await caches.match("./index.html")) || (await caches.match("./"));
      }
    })()); return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    if(cached) return cached;
    try{
      const fresh=await fetch(event.request);
      if(fresh && (fresh.ok || fresh.type==="opaque")){
        const cache=await caches.open(CACHE_NAME); cache.put(event.request,fresh.clone());
      }
      return fresh;
    }catch(err){ throw err; }
  })());
});
