'use strict';

let Q = require('q'),
	config = require('config');

let cwd = process.cwd();
let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
let AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');
let SeoModel = require(cwd + '/app/builders/common/SeoModel');


let IsotopePrototypeModel = function (req, res, modelData) {
	let seo = new SeoModel(modelData.bapiHeaders);
	return Q.defer().resolve();
};

module.exports = IsotopePrototypeModel;
