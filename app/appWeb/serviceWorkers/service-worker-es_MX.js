'use strict';

//Initial precaching homepage


self.addEventListener('install', function(e) {
	console.log('[ServiceWorker] Install');
	e.waitUntil(
		toolbox.precache(['/'])
	);
});

//Adding set array to precache
if (cacheObj) {
	toolbox.precache(cacheObj['homepagePreCache']);
}

toolbox.router.get('/', toolbox.networkFirst, {
	cache: {
		name: 'vivanuncios-homepage',
		maxEntries: 100,
		maxAgeSeconds: 86400
	}
});

//Adding set array to cache
if (cacheObj) {
	 for (let cacheIndex = 0; cacheIndex < cacheObj['homepageCache'].length; cacheIndex++) {
	 	toolbox.router.get(cacheObj.homepageCache[cacheIndex], toolbox.networkFirst, {
	 		cache: {
	 			name: 'vivanuncios-homepage',
	 			maxEntries: 100,
	 			maxAgeSeconds: 86400
	 		}
	 	});
	 }
}



