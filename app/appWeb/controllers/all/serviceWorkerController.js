'use strict';


let express = require('express');
let router = express.Router();
let path = require('path');


/**
 * Build Service worker registration
 */
router.get('/', (req, res) => {
	console.time('Instrument-ServiceWorker-Controller');

	res.set('Content-Type', 'application/javascript');
	res.sendFile(path.join(process.cwd() + '/service-worker.js'));

	console.timeEnd('Instrument-ServiceWorker-Controller');
});

module.exports = router;
