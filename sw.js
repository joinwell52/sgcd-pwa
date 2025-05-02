// 定义缓存名称
const CACHE_NAME = 'vehicle-management-cache-v1';

// 需要缓存的资源列表
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js',
  'https://cdn.jsdelivr.net/npm/echarts-gl@2.0.9/dist/echarts-gl.min.js'
];

// 安装事件 - 缓存资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        return cache.addAll(urlsToCache);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});

// 请求事件 - 从缓存或网络提供资源
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果找到缓存的响应，则返回
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          response => {
            // 检查是否收到有效响应
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 克隆响应
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// 处理离线回退
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate' || 
      (event.request.method === 'GET' && 
       event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('./index.html');
      })
    );
  }
});