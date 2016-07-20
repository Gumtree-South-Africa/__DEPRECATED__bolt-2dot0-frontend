'use strict';


let express = require('express');
let router = express.Router();

let MainfestModel = require(process.cwd() + '/app/builders/page/ManifestModel');


/**
 * Build Manifest Model
 */
router.get('/', (req, res, next) => {
	console.time('Instrument-Manifest-Controller');

	let manifest = new MainfestModel(req, res);
	let modelPromise = manifest.populateData();

	modelPromise.then((modelData) => {
		let baseImageUrl = modelData.footer.baseImageUrl;

		let locale = res.locals.config.locale;
		let localeSplit = locale.split('_');
		let lang = localeSplit[0];

		let manifestJson = {
			"lang": lang,
			"short_name": res.locals.config.name,
			"name": res.locals.config.name,
			"icons": [
				{
					"src": baseImageUrl + locale + "/launcher-icon-2x.png",
					"sizes": "96x96",
					"type": "image/png"
				},
				{
					"src": baseImageUrl + locale + "/launcher-icon-3x.png",
					"sizes": "144x144",
					"type": "image/png"
				},
				{
					"src": baseImageUrl + locale + "/launcher-icon-4x.png",
					"sizes": "192x192",
					"type": "image/png"
				}
			],
			"start_url": "/?utm_source=homescreen",
			"display": "standalone",
			"orientation": "portrait",
			"background_color": "black"
		};

		res.json(manifestJson);

	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
		next(err);
	});

	console.timeEnd('Instrument-Manifest-Controller');
});

module.exports = router;
