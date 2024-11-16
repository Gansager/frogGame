// Устанавливаем Service Worker и кэшируем необходимые файлы
self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('frog-jump-cache').then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/js/game.js',
          '/css/style.css',
          '/img/frog.png',
          '/img/lilyPad.png',
          '/manifest.json'
        ]);
      })
    );
  });
  
  // Отдача кэшированных файлов при оффлайн-доступе
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
  