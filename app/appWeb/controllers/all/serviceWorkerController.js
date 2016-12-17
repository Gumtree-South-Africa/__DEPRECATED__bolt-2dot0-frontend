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
	let country = res.locals.config.country;
	let brand = res.locals.config.name;

	let serviceWorker = new ServiceWorkerModel(req, res);
	let modelPromise = serviceWorker.populateData();

	modelPromise.then((modelData) => {
		let initialContent = '\'use strict\';\n\n';

		let swCacheContent = JSON.stringify(modelData.footer.cachePath);
		swCacheContent = swCacheContent.replace(/{brand}/g, brand);
		swCacheContent = swCacheContent.replace(/{country}/g, country);
		swCacheContent = swCacheContent.replace(/{locale}/g, locale);
		let swCacheConfigContent = 'var cacheObj=' + swCacheContent + ';\n\n';

		let swtoolboxPath = process.cwd() + '/node_modules/sw-toolbox/sw-toolbox.js';
		let swtoolboxContent = fs.readFileSync(swtoolboxPath, "utf8");

		let serviceWorkerPath = process.cwd() + '/app/appWeb/serviceWorkers/service-worker.js';
		let serviceWorkerContent = fs.readFileSync(serviceWorkerPath, "utf8");
		serviceWorkerContent = serviceWorkerContent.replace(/{brand}/g, brand);
		serviceWorkerContent = serviceWorkerContent.replace(/{country}/g, country);

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
