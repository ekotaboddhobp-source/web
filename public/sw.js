const CACHE_NAME = 'ekotaboddho-cache-v2'; // ✅ ভার্সন বাড়ানো হলো

self.addEventListener('install', event => {
  self.skipWaiting(); // নতুন সার্ভিস ওয়ার্কার সাথে সাথে অ্যাক্টিভ হবে
});

self.addEventListener('fetch', event => {
  // API কলগুলো ক্যাশ করা যাবে না
  if (event.request.url.includes('/api/') || event.request.method !== 'GET') return;
  
  // HTML পেজের জন্য Network-First (যাতে লেটেস্ট কোড লোড হয়)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // বাকি ফাইলগুলোর জন্য Cache-First
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // পুরনো ক্যাশ ডিলিট
          }
        })
      );
    })
  );
});
