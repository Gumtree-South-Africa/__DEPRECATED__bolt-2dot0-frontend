// 'use strict';
//
// var express = require('express'),
//     router = express.Router();
//
// var cwd = process.cwd();
//
// var pageControllerUtil = require(cwd + '/app/controllers/page/PageControllerUtil'),
// 	pagetypeJson = require(cwd + '/app/config/pagetype.json');
//
//
// module.exports = (app) => {
// 	app.use('/', router);
// };
//
//
// router.get('/hp', (req, res, next) => {
// 	console.time('Instrument-Prototype-Controller');
// 	req.app.locals.pagetype = pagetypeJson.pagetype.HOMEPAGE;
//
//   var newPath = 'homepagePlaceholder/views/hbs/homepagePlaceholder_';
//
//   var modelData = pageControllerUtil.preController(req, res);
// 	var model = new IsotopePrototypeModel(req, res, modelData);
// 	model.then((result) => {
// 		modelData.header = result.common.header || {};
// 		modelData.footer = result.common.footer || {};
//
// 		modelData.dataLayer = result.common.dataLayer || {};
// 		modelData.seo = result.seo || {};
//
// 		pageControllerUtil.postController(req, res, next, newPath, modelData);
// 	});
//
// 	console.timeEnd('Instrument-Prototype-Controller');
// });
