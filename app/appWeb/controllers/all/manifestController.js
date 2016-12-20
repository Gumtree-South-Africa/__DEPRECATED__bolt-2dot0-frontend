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
			"gcm_sender_id": "759612781184",
			"gcm_user_visible_only": true,
			"background_color": "#2F3BA2",
			"theme_color": "#512DA8",
			"start_url": "/?v=10122d18",
			"display": "standalone",
			"orientation": "portrait",
			"icons": [
				{
					"src": baseImageUrl + locale + "/icon-16x16.png",
					"type": "image/png",
					"sizes": "16x16",
					"actualSize": "16x16"
				},
				{
					"src": baseImageUrl + locale + "/icon-32x32.png",
					"type": "image/png",
					"sizes": "32x32",
					"actualSize": "32x32"
				},
				{
					"src": baseImageUrl + locale + "/icon-57x57.png",
					"type": "image/png",
					"sizes": "57x57",
					"actualSize": "57x57"
				},
				{
					"src": baseImageUrl + locale + "/icon-72x72.png",
					"type": "image/png",
					"sizes": "72x72",
					"actualSize": "72x72"
				},
				{
					"src": baseImageUrl + locale + "/icon-114x114.png",
					"type": "image/png",
					"sizes": "114x114",
					"actualSize": "114x114"
				},
				{
					"src": baseImageUrl + locale + "/icon-144x144.png",
					"type": "image/png",
					"sizes": "144x144",
					"actualSize": "144x144"
				},
				{
					"src": baseImageUrl + locale + "/icon-192x192.png",
					"type": "image/png",
					"sizes": "192x192",
					"actualSize": "192x192"
				},
				{
					"src": baseImageUrl + locale + "/icon-256x256.png",
					"type": "image/png",
					"sizes": "256x256",
					"actualSize": "256x256"
				},
				{
					"src": baseImageUrl + locale + "/icon-384x384.png",
					"type": "image/png",
					"sizes": "384x384",
					"actualSize": "384x384"
				},
				{
					"src": baseImageUrl + locale + "/icon-512x512.png",
					"type": "image/png",
					"sizes": "512x512",
					"actualSize": "512x512"
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
