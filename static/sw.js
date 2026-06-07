const CACHE_NAME = 'commission-v2';
const STATIC_ASSETS = [
  '/static/css/style.css',
  '/static/js/main.js',
  '/manifest.json',
  '/static/icon-192.png'   // تأكد من وجود الأيقونة
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', event => {
  // لا تخزّن طلبات API أو صفحات التطبيق
  if (event.request.url.includes('/api/') || event.request.url.endsWith('/')) {
    return fetch(event.request);
  }
  // للملفات الثابتة: جرب الكاش أولاً، ثم الشبكة
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(response => {
        // خزّن النسخة الجديدة للمستقبل
        if (response.ok && STATIC_ASSETS.some(url => event.request.url.endsWith(url))) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      });
    })
  );
});
