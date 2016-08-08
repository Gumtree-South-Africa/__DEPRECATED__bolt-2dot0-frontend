'use strict';

let express = require('express');
let router = express.Router();
let config = require('config');
let path = require('path');
let cwd = process.cwd();
let fs = require('fs');

let ServiceWorkerModel = require(cwd + '/app/builders/page/ServiceWorkerModel');

/**
 * Build Service worker registration
 */
router.get('/', (req, res, next) => {
	let locale = res.locals.config.locale;
	let serviceWorker = new ServiceWorkerModel(req, res);
	let modelPromise = serviceWorker.populateData();

	modelPromise.then((modelData) => {
		let urlHost = config.get('static.server.host');
		let baseJSDir = (urlHost!==null) ? '' : '/public';
		let cacheObj = 'let cacheObj =' + JSON.stringify({'homepagePreCache': modelData.homepagePreCache, 'homepageCache': modelData.homepageCache}) + ';';
		let cacheFilePath = process.cwd() + baseJSDir + '/js/swCacheConfig.js';
		fs.access(cacheFilePath, fs.F_OK, function(err) {
			if (err) {
				fs.writeFile(cacheFilePath, cacheObj, function(writeErr) {
					if(err) {
						return writeErr;
					}
					res.set('Content-Type', 'application/javascript');
					res.sendFile(path.join(process.cwd() + '/app/appWeb/serviceWorkers/service-worker-' + locale + '.js'));
				});
			} else {
				res.set('Content-Type', 'application/javascript');
				res.sendFile(path.join(process.cwd() + '/app/appWeb/serviceWorkers/service-worker-' + locale + '.js'));
			}
		});
	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
		next(err);
	});
});

module.exports = router;
