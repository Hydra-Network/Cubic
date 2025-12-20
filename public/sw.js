// stolen from https://developer.chrome.com/docs/workbox/caching-strategies-overview#cache_first_falling_back_to_network

const cacheName = "MyFancyCacheName_v1";

self.addEventListener("fetch", (event) => {
  if (event.request.destination === "image") {
    event.respondWith(
      caches.open(cacheName).then((cache) => {
        return cache.match(event.request.url).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;

          return fetch(event.request).then((fetchedResponse) => {
            cache.put(event.request, fetchedResponse.clone());

            return fetchedResponse;
          });
        });
      }),
    );
  } else {
    return;
  }
});
