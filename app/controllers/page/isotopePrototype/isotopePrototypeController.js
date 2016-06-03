'use strict';

let express = require('express'),
    _ = require('underscore'),
    router = express.Router(),
    cuid = require('cuid');

let cwd = process.cwd();

let StringUtils = require(cwd + '/app/utils/StringUtils'),
	pageControllerUtil = require(cwd + '/app/controllers/page/PageControllerUtil'),
	IsotopePrototypeModel = require(cwd + '/app/builders/page/IsotopePrototypeModel'),
	pagetypeJson = require(cwd + '/app/config/pagetype.json');

module.exports = (app) => {
    app.use('/', router);
};

router.get('/isotopePrototype', (req, res, next) => {
	console.time('Instrument-Prototype-Controller');
	req.app.locals.pagetype = pagetypeJson.pagetype.ISOTOPE_PROTOTYPE;
	let bapiConfigData = res.locals.config.bapiConfigData;
	let modelData = pageControllerUtil.preController(req, res);
	pageControllerUtil.postController(req, res, next, 'isotopePrototype/views/hbs/isotopePrototype_', modelData);
	console.timeEnd('Instrument-Prototype-Controller');
});
