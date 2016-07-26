'use strict';


let express = require('express');
let router = express.Router();
let path = require('path');


/**
 * Build Service worker registration
 */
router.get('/', (req, res) => {
	console.time('Instrument-ServiceWorker-Controller');

	let locale = res.locals.config.locale;

	res.set('Content-Type', 'application/javascript');
	res.sendFile(path.join(process.cwd() + '/app/appWeb/serviceWorkers/service-worker-' + locale + '.js'));

	console.timeEnd('Instrument-ServiceWorker-Controller');
});

module.exports = router;
