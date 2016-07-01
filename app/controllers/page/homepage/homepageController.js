'use strict';

var express = require('express'),
	router = express.Router();

let cwd = process.cwd();
let homepageControllerV1 = require(`${cwd}/app/controllers/page/homepage/homepageControllerV1`);
let homepageControllerV2 = require(`${cwd}/app/controllers/page/homepage/homepageControllerV2`);


module.exports = function(app) {
	app.use('/', router);
};

/**
 * Build HomePage Model Data and Render
 */
router.get('/', (req, res, next) => {
	console.time('Instrument-Homepage-Controller');
	if (res.locals.b2dot0Version) {
		homepageControllerV2(req, res, next);
	} else {
		homepageControllerV1(req, res, next);
	}

	console.timeEnd('Instrument-Homepage-Controller');
});
