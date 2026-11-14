/* DJSG demo app service worker.
   14 Nov 2026, 19:40 (owner: "app is very slow"): the app opens at once from the copy on the phone,
   and the newest app.html is fetched quietly in the background (the "New version" strip then appears).
   Other pages: newest from GitHub first; if the internet is slow (4 s) or off, the saved copy. */
var C='djsg-demo-v3';
var FILES=['app.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(FILES.map(function(f){return new Request(f,{cache:'no-store'})}))}));self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C}).map(function(x){return caches.delete(x)}))}));self.clients.claim()});
function key(u){return u.origin+u.pathname}
function save(k,res){if(res&&res.ok&&res.status===200){var cp=res.clone();caches.open(C).then(function(c){c.put(k,cp)})}return res}
function net(r,k){return fetch(r,{cache:'no-store'}).then(function(res){return save(k,res)})}
self.addEventListener('fetch',function(e){var r=e.request;if(r.method!=='GET')return;var u=new URL(r.url);if(u.origin!==location.origin)return;
 if(u.searchParams.has('v'))return;                       /* version check: straight to GitHub */
 var k=key(u),isApp=/\/app\.html$/.test(u.pathname)||/\/$/.test(u.pathname)&&r.mode==='navigate';
 if(u.searchParams.has('fresh')){e.respondWith(fetch(k,{cache:'no-store'}).then(function(res){return save(k,res)}));return}
 if(isApp){e.respondWith(caches.match(k).then(function(m){var n=net(new Request(k),k).catch(function(){return m});if(m){e.waitUntil(n.catch(function(){}));return m}return n}));return}
 e.respondWith(new Promise(function(ok){var done=false;
  var t=setTimeout(function(){caches.match(k).then(function(m){if(m&&!done){done=true;ok(m)}})},4000);
  net(r,k).then(function(res){clearTimeout(t);if(!done){done=true;ok(res)}}).catch(function(){clearTimeout(t);caches.match(k).then(function(m){if(!done){done=true;ok(m||caches.match(key(new URL('app.html',location.href))))}})})}))});
