'use strict';

let Q = require('q');

let ModelBuilder = require('./ModelBuilder');
let HeaderModel = require('./HeaderModel');
let FooterModel = require('./FooterModel');
let DataLayerModel = require('./DataLayerModel');

/**
 * @description A class that Handles the common models in every page
 * @constructor
 */
let BasePageModel = function(req, res) {
	this.header = new HeaderModel(req.secure, req, res);
	this.headerBuilder = this.header.getModelBuilder();
	this.footer = new FooterModel(req.secure, req, res);
	this.footerBuilder = this.footer.getModelBuilder();
	this.dataLayer = new DataLayerModel(req, res);
	this.dataLayerBuilder = this.dataLayer.getModelBuilder();
};

BasePageModel.prototype.getModelBuilder = function() {
	return new ModelBuilder(this.getCommonData());
};

BasePageModel.prototype.getCommonData = function() {
	let _this = this;
	let headerFunction = function(callback) {
		let headerDeferred = Q.defer();
		Q(_this.headerBuilder.processParallel())
			.then(function(dataH) {
				headerDeferred.resolve(dataH[0]);
				callback(null, dataH[0]);
			}).fail(function(err) {
			headerDeferred.reject(new Error(err));
			callback(null, {});
		});
	};

	let footerFunction = function(headerData, callback) {
		let footerDeferred = Q.defer();
		Q(_this.footerBuilder.processParallel())
			.then(function(dataF) {
				// Resolve promise with necessary data for the callee
				footerDeferred.resolve(dataF[0]);

				// Merge data and send the comibned data to the next function in waterfall
				let headerFooterData = {
					'header': headerData, 'footer': dataF[0]
				};
				callback(null, headerFooterData);
			}).fail(function(err) {
			footerDeferred.reject(new Error(err));
			callback(null, {});
		});
	};

	let dataLayerFunction = function(headerFooterData, callback) {
		// use data from headerFooterData
		_this.dataLayer.setUserId(headerFooterData.header.id);
		_this.dataLayer.setUserEmail(headerFooterData.header.userEmail);

		let dataLayerDeferred = Q.defer();
		Q(_this.dataLayerBuilder.processParallel())
			.then(function(dataD) {
				dataLayerDeferred.resolve(dataD[0]);

				let combinedData = headerFooterData;
				combinedData.dataLayer = dataD[0];
				callback(null, combinedData);
			}).fail(function(err) {
			dataLayerDeferred.reject(new Error(err));
			callback(null, {});
		});
	};

	let arrFunctions = [headerFunction, footerFunction, dataLayerFunction];
	return arrFunctions;
};

module.exports = BasePageModel;

