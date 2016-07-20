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
			"background_color": "#ffffff",
			"start_url": "/",
			"display": "standalone",
			"orientation": "portrait",
			"icons": [
				{
					"src": baseImageUrl + locale + "/touch-iphone.png",
					"type": "image/png",
					"sizes": null,
					"actualSize": "57x57"
				},
				{
					"src": baseImageUrl + locale + "/touch-ipad.png",
					"type": "image/png",
					"sizes": "72x72",
					"actualSize": "72x72"
				},
				{
					"src": baseImageUrl + locale + "/touch-iphone-retina.png",
					"type": "image/png",
					"sizes": "114x114",
					"actualSize": "114x114"
				},
				{
					"src": baseImageUrl + locale + "/touch-ipad-retina.png",
					"type": "image/png",
					"sizes": "144x144",
					"actualSize": "144x144"
				}
			]
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
