'use strict';

let express = require('express');
let router = express.Router();

/**
 * Build Manifest Model
 */
router.get('/', (req, res) => {
	console.time('Instrument-Manifest-Controller');

	let locale = res.locals.config.locale;
	let localeSplit = locale.split('_');
	let lang = localeSplit[0];

	let manifestJson = {
		"lang": lang,
		"short_name": res.locals.config.name,
		"name": res.locals.config.name,
		"icons": [
			{
				"src": "img/launcher-icon-2x.png",
				"sizes": "96x96",
				"type": "image/png"
			},
			{
				"src": "img/launcher-icon-3x.png",
				"sizes": "144x144",
				"type": "image/png"
			},
			{
				"src": "img/launcher-icon-4x.png",
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

	console.timeEnd('Instrument-Manifest-Controller');
});


module.exports = router;
