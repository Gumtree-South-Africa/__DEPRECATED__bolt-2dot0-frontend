'use strict';

let Q = require('q'),
	config = require('config');

let cwd = process.cwd();
let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
let AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');
let SeoModel = require(cwd + '/app/builders/common/SeoModel');


let IsotopePrototypeModel = function (req, res, modelData) {
	let functionMap = {};
	let abstractPageModel = new AbstractPageModel(req, res);
	let pageType = req.app.locals.pageType || pagetypeJson.pagetype.ISOTOPE_PROTOTYPE;
	let pageModelConfig = abstractPageModel.getPageModelConfig(res, pageType);
	let arrFunctions = abstractPageModel.getArrFunctions(req, res, functionMap, pageModelConfig);
	var isoProtoModel = new ModelBuilder(arrFunctions);

	return Q(isoProtoModel.processParallel())
		.then(function (data) {
			return abstractPageModel.convertListToObject(data, arrFunctions);
		});

};

module.exports = IsotopePrototypeModel;
