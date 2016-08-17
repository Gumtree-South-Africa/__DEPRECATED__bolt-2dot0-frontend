'use strict';

let express = require('express');
let router = express.Router();
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
		let initialContent = '\'use strict\';\n\n';
		let swCacheConfigContent = 'var cacheObj=' + JSON.stringify(modelData.footer.cachePath) + ';\n\n';

		let swtoolboxPath = process.cwd() + '/node_modules/sw-toolbox/sw-toolbox.js';
		let swtoolboxContent = fs.readFileSync(swtoolboxPath);

		let serviceWorkerPath = process.cwd() + '/app/appWeb/serviceWorkers/service-worker-' + locale + '.js';
		let serviceWorkerContent = fs.readFileSync(serviceWorkerPath);

		let finalContent = initialContent + swCacheConfigContent + swtoolboxContent  + serviceWorkerContent;

		res.set('Content-Type', 'application/javascript');
		res.send(finalContent);
	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
		next(err);
	});
});

module.exports = router;
