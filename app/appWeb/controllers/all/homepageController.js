'use strict';

var express = require('express'),
	router = express.Router();

let abTestPagesJson = require(process.cwd() + '/app/config/abtestpages.json');
let pageControllerUtil = require(process.cwd() + '/app/appWeb/controllers/all/PageControllerUtil');
let homepageControllerV1 = require('./homepageControllerV1');
let homepageControllerV2 = require('./homepageControllerV2');


/**
 * Build HomePage Model Data and Render
 */
router.get('/', (req, res, next) => {
	console.time('Instrument-Homepage-Controller');

	req.app.locals.abtestpage = abTestPagesJson.pages.H;

	if (pageControllerUtil.is2dot0Version(res, req.app.locals.abtestpage)) {
		homepageControllerV2(req, res, next);
	} else {
		homepageControllerV1(req, res, next);
	}
	console.timeEnd('Instrument-Homepage-Controller');
});


module.exports = router;
