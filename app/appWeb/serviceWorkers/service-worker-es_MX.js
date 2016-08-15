'use strict';


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
toolbox.router.get('/', toolbox.networkFirst, {
	cache: {
		name: 'vivanuncios-homepage',
		maxEntries: 100,
		maxAgeSeconds: 86400
	}
});

// Adding homepage assets
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


/**
 * Offline Google Analytics
 */
var DB_NAME = 'offline-analytics';
var EXPIRATION_TIME_DELTA = 86400000;
var ORIGIN = /https?:\/\/((www|ssl)\.)?google-analytics\.com/;

function replayQueuedAnalyticsRequests() {
	simpleDB.open(DB_NAME).then(function(db) {
		db.forEach(function(url, originalTimestamp) {
			var timeDelta = Date.now() - originalTimestamp;
			var replayUrl = url + '&qt=' + timeDelta;
			fetch(replayUrl).then(function(response) {
				if (response.status >= 500) {
					return Response.error();
				}
				db.delete(url);
			}).catch(function(error) {
				if (timeDelta > EXPIRATION_TIME_DELTA) {
					db.delete(url);
				}
			});
		});
	});
}

function queueFailedAnalyticsRequest(request) {
	simpleDB.open(DB_NAME).then(function(db) {
		db.set(request.url, Date.now());
	});
}

function handleAnalyticsCollectionRequest(request) {
	return global.fetch(request).then(function(response) {
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
	{origin: ORIGIN}
);
toolbox.router.get('/analytics.js',
	toolbox.networkFirst,
	{origin: ORIGIN}
);

replayQueuedAnalyticsRequests();
