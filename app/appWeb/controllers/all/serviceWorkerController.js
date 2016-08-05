'use strict';

let express = require('express');
let router = express.Router();
let path = require('path');
let fs = require('fs');

if (process.env.NODE_ENV !== undefined) {
	// let cwd = process.cwd();
	// let env = process.env.NODE_ENV || 'dev';

	// let envHost = require(cwd + '/server/config/' + env + '.json').static.server.host;
	// let envVersion = require(cwd + '/server/config/' + env + '.json').static.server.version;
	// let baseJSUrl = require(cwd + '/server/config/' + env + '.json').static.baseJSUrl;
}



/**
 * Build Service worker registration
 */
router.get('/', (req, res) => {

	console.time('Instrument-ServiceWorker-Controller');

	let locale = res.locals.config.locale;

	fs.readFile(process.cwd() + '/app/appWeb/serviceWorkers/service-worker-' + locale + '.js', 'utf8', function(err, data) {
		if (err) {
			return err;
		} else {
			return data;
		}
	});

	res.set('Content-Type', 'application/javascript');

	res.sendFile(path.join(process.cwd() + '/app/appWeb/serviceWorkers/service-worker-' + locale + '.js'));

	console.timeEnd('Instrument-ServiceWorker-Controller');
});

module.exports = router;
