console.log("Hello from service worker!")

//serviceWorker install
const cacheName = "myOfflineCache";
//list all static files in your project
const staticAssets = ["/", "/index.html", "/manifest.webmanifest", "/styles.css", "/index.js", "/service-worker.js", "/icons/icon-192x192.png", "/icons/icon-512x512.png"];

self.addEventListener("install", async (event) => {
//”caches” is an instance of the CacheStorage
//the method “open” returns a promise that resolves to 
//the cache object matching the cache name
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
  //allow the newly installed service worker to move on to activation
  return self.skipWaiting();
});




//serviceWorker activate
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== cacheName) {
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );


    self.clients.claim();
});




//serviceWorker fetch
self.addEventListener("fetch", async event => {
  // cache successful requests to the API
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(cacheName).then(cache => {
        return fetch(event.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }

            toDoListStore.add({ listID: "1", status: event.request });
            return response || cache.match(event.request);
          })
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(event.request);
          });
      }).catch(err => console.log(err))
    );

    return;



    //     const req = event.request;
//     const url = new URL(req.url);
//   //check if the request is requiring data from our own application(location)
//     if (url.origin === location.origin) {
//   //check our cache
//       event.respondWith(checkCache(req));
//     } 
//   //else, fetch from the network and cache that result
//     else {
//       event.respondWith(checkNetwork(req));
//     }
//   });
  
//   async function checkCache(req) {
//   //open our cache
//     const cache = await caches.open(cacheName);
//   //check if there’s data there that match with what the request requires
//     const cachedData = await cache.match(req);
//   //if there’s data cached, return it, else fetch from the network
//     return cachedData || fetch(req);
//   }
  
//   async function checkNetwork(req) {
//   //open our cache
//     const cache = await caches.open(cacheName);
//   //try to fetch data from the network
//     try {
//   //save the fetched data
//       const freshData = await fetch(req);
//   //save a copy of the response to your cache
//       await cache.put(req, freshData.clone());
//   //send the response back (returned the fetched data)
//       return freshData;
//     } 
//   //if we are unable to fetch from the network (offline)
//     catch (err) {
//   //match the request with data from the cache
//       const cachedData = await cache.match(req);
//   //return the cached data
//       return cachedData;
//     }
  }
});