'use strict';

let express = require('express'),
    router = express.Router();

let cwd = process.cwd();

let pageControllerUtil = require(cwd + '/app/controllers/page/PageControllerUtil'),
	pagetypeJson = require(cwd + '/app/config/pagetype.json');

module.exports = (app) => {
    app.use('/', router);
};

router.get('/isotopePrototype', (req, res, next) => {
	console.time('Instrument-Prototype-Controller');
	req.app.locals.pagetype = pagetypeJson.pagetype.ISOTOPE_PROTOTYPE;

	let modelData = pageControllerUtil.preController(req, res);
	pageControllerUtil.postController(req, res, next, 'isotopePrototype/views/hbs/isotopePrototype_', modelData);
	console.timeEnd('Instrument-Prototype-Controller');
});
