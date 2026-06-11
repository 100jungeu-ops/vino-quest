const C='vino-quest-v2';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'])));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  const isHTML=req.mode==='navigate'||(req.headers.get('accept')||'').includes('text/html');
  if(isHTML){
    // 네트워크 우선: 항상 최신 버전, 오프라인일 때만 캐시
    e.respondWith(
      fetch(req).then(res=>{
        const cl=res.clone();caches.open(C).then(c=>c.put(req,cl));return res;
      }).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html')))
    );
  }else{
    e.respondWith(
      caches.match(req).then(r=>r||fetch(req).then(res=>{
        const cl=res.clone();caches.open(C).then(c=>c.put(req,cl));return res;
      }))
    );
  }
});