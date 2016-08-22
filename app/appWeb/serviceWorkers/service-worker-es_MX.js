'use strict';


var idbDatabase;
var IDB_VERSION = 1;
var STOP_RETRYING_AFTER = 86400000; // One day, in milliseconds.
var STORE_NAME = 'urls';

var GA_ORIGIN = /https?:\/\/((www|ssl)\.)?google-analytics\.com/;

var CACHE_VERSION = 1;
var CURRENT_CACHES = {
	'homepage': 'vivanuncios-homepage-v' + CACHE_VERSION,
	'offline-analytics': 'offline-analytics-v' + CACHE_VERSION
};
var PRECACHE = '$$$toolbox-cache$$$';

/**
 * Event Handlers
 */
self.addEventListener('activate', function(event) {
	// Delete all caches that aren't named in CURRENT_CACHES.
	var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
		return CURRENT_CACHES[key];
	});

	event.waitUntil(
		caches.keys().then(function(cacheNames) {
			return Promise.all(
				cacheNames.map(function(cacheName) {
					if (cacheName.indexOf(PRECACHE) === -1) {
						// Skip toolbox precache
						if (expectedCacheNames.indexOf(cacheName) === -1) {
							// If this cache name isn't present in the array of "expected" cache names, then delete it.
							console.log('Deleting out of date cache:', cacheName);
							return caches.delete(cacheName);
						}
					}
				})
			);
		})
	);
});


/**
 * PRE-CACHE
 **/
// Precaching homepage
toolbox.precache(['/']);

// Precaching homepage assets
if (cacheObj) {
	toolbox.precache(cacheObj['homepagePreCache']);
}


/**
 * CACHE
 */
// Add homepage
toolbox.router.get('/', toolbox.cacheFirst, {
	cache: {
		name: CURRENT_CACHES['homepage'],
		maxEntries: 100,
		maxAgeSeconds: 86400
	}
});

// Adding homepage CSS cache
if (cacheObj) {
	 for (let cacheIndex = 0; cacheIndex < cacheObj.homepageCache.css.length; cacheIndex++) {
	 	toolbox.router.get(cacheObj.homepageCache.css[cacheIndex], toolbox.cacheFirst, {
	 		cache: {
	 			name: CURRENT_CACHES['homepage'],
	 			maxEntries: 100,
	 			maxAgeSeconds: 86400
	 		}
	 	});
	 }
}

// Adding homepage icons cache
if (cacheObj) {
	for (let cacheIndex = 0; cacheIndex < cacheObj.homepageCache.icons.length; cacheIndex++) {
		toolbox.router.get(cacheObj.homepageCache.icons[cacheIndex], toolbox.cacheFirst, {
			cache: {
				name: CURRENT_CACHES['homepage'],
				maxEntries: 100,
				maxAgeSeconds: 86400
			}
		});
	}
}

// Adding homepage images cache
if (cacheObj) {
	for (let cacheIndex = 0; cacheIndex < cacheObj.homepageCache.images.length; cacheIndex++) {
		toolbox.router.get(cacheObj.homepageCache.images[cacheIndex], toolbox.cacheFirst, {
			cache: {
				name: CURRENT_CACHES['homepage'],
				maxEntries: 100,
				maxAgeSeconds: 86400
			}
		});
	}
}

// Adding homepage fonts
if (cacheObj) {
	for (let cacheIndex = 0; cacheIndex < cacheObj.homepageCache.fonts.length; cacheIndex++) {
		toolbox.router.get(cacheObj.homepageCache.fonts[cacheIndex], toolbox.cacheFirst, {
			cache: {
				name: CURRENT_CACHES['homepage'],
				maxEntries: 100,
				maxAgeSeconds: 86400
			}
		});
	}
}

// Adding homepage JS cache
if (cacheObj) {
	for (let cacheIndex = 0; cacheIndex < cacheObj.homepageCache.js.length; cacheIndex++) {
		toolbox.router.get(cacheObj.homepageCache.js[cacheIndex], toolbox.cacheFirst, {
			cache: {
				name: CURRENT_CACHES['homepage'],
				maxEntries: 100,
				maxAgeSeconds: 86400
			}
		});
	}
}

// Adding homepage JSmin cache
if (cacheObj) {
	for (let cacheIndex = 0; cacheIndex < cacheObj.homepageCache.jsmin.length; cacheIndex++) {
		toolbox.router.get(cacheObj.homepageCache.jsmin[cacheIndex], toolbox.cacheFirst, {
			cache: {
				name: CURRENT_CACHES['homepage'],
				maxEntries: 100,
				maxAgeSeconds: 86400
			}
		});
	}
}


/**
 * Offline Google Analytics
 */
// This is basic boilerplate for interacting with IndexedDB. Adapted from
function openDatabaseAndReplayRequests() {
	var indexedDBOpenRequest = indexedDB.open('offline-analytics', IDB_VERSION);

	// This top-level error handler will be invoked any time there's an IndexedDB-related error.
	indexedDBOpenRequest.onerror = function(error) {
		console.error('IndexedDB error:', error);
	};

	// This should only execute if there's a need to create a new database for the given IDB_VERSION.
	indexedDBOpenRequest.onupgradeneeded = function() {
		this.result.createObjectStore(STORE_NAME, {keyPath: 'url'});
	};

	// This will execute each time the database is opened.
	indexedDBOpenRequest.onsuccess = function() {
		idbDatabase = this.result;
		replayAnalyticsRequests();
	};
}

function getObjectStore(storeName, mode) {
	return idbDatabase.transaction(storeName, mode).objectStore(storeName);
}

function replayAnalyticsRequests() {
	var savedRequests = [];

	getObjectStore(STORE_NAME).openCursor().onsuccess = function(event) {
		// See https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#Using_a_cursor
		var cursor = event.target.result;

		if (cursor) {
			// Keep moving the cursor forward and collecting saved requests.
			savedRequests.push(cursor.value);
			cursor.continue();
		} else {
			// At this point, we have all the saved requests.
			console.log('About to replay %d saved Google Analytics requests...',
				savedRequests.length);

			savedRequests.forEach(function(savedRequest) {
				var queueTime = Date.now() - savedRequest.timestamp;
				if (queueTime > STOP_RETRYING_AFTER) {
					getObjectStore(STORE_NAME, 'readwrite').delete(savedRequest.url);
					console.log(' Request has been queued for %d milliseconds. ' +
						'No longer attempting to replay.', queueTime);
				} else {
					// The qt= URL parameter specifies the time delta in between right now, and when the
					// /collect request was initially intended to be sent. See
					// https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#qt
					var requestUrl = savedRequest.url + '&qt=' + queueTime;

					console.log(' Replaying', requestUrl);

					fetch(requestUrl).then(function(response) {
						if (response.status < 400) {
							// If sending the /collect request was successful, then remove it from the IndexedDB.
							getObjectStore(STORE_NAME, 'readwrite').delete(savedRequest.url);
							console.log(' Replaying succeeded.');
						} else {
							// This will be triggered if, e.g., Google Analytics returns a HTTP 50x response.
							// The request will be replayed the next time the service worker starts up.
							console.error(' Replaying failed:', response);
						}
					}).catch(function(error) {
						// This will be triggered if the network is still down. The request will be replayed again
						// the next time the service worker starts up.
						console.error(' Replaying failed:', error);
					});
				}
			});
		}
	};
}

function queueFailedAnalyticsRequest(request) {
	getObjectStore(STORE_NAME, 'readwrite').add({
		url: request.url,
		timestamp: Date.now()
	});
}

function handleAnalyticsCollectionRequest(request) {
	return fetch(request).then(function(response) {
		if (response.status >= 500) {
			return Response.error();
		}
		return response;
	}).catch(function() {
		queueFailedAnalyticsRequest(request);
	});
}

toolbox.router.get('/collect',
	handleAnalyticsCollectionRequest,
	{origin: GA_ORIGIN}
);
toolbox.router.get('/analytics.js',
	toolbox.networkFirst,
	{origin: GA_ORIGIN}
);

// Open the IndexedDB and check for requests to replay each time the service worker starts up.
// Since the service worker is terminated fairly frequently, it should start up again for most
// page navigations. It also might start up if it's used in a background sync or a push
// notification context.
openDatabaseAndReplayRequests();

