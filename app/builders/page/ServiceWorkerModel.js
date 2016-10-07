'use strict';


let cwd = process.cwd();

let _ = require("underscore");

let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');

let AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');
let cacheConfig = require(cwd + '/app/appWeb/serviceWorkers/swCacheConfig');

class ServiceWorkerModel {
	constructor(req, res) {
		this.req = req;
		this.res = res;
		this.dataPromiseFunctionMap = {};
	}

	populateData() {
		let abstractPageModel = new AbstractPageModel(this.req, this.res);
		let pagetype = pagetypeJson.pagetype.PWA_SERVICEWORKER;
		let pageModelConfig = abstractPageModel.getPageModelConfig(this.res, pagetype);

		let modelBuilder = new ModelBuilder();
		let modelData = modelBuilder.initModelData(this.res.locals, this.req.app.locals, this.req.cookies);

		let arrFunctions = abstractPageModel.getArrFunctionPromises(this.req, this.res, this.dataPromiseFunctionMap, pageModelConfig);

		return modelBuilder.resolveAllPromises(arrFunctions)
			.then((data) => {
				// Converts the data from an array format to a JSON format
				// for easy access from the client/controller
				data = abstractPageModel.convertListToObject(data, arrFunctions, modelData);
				return this.mapData(abstractPageModel.getBaseModelData(data), data);
			}).fail((err) => {
				console.error(err);
				console.error(err.stack);
			});
	}

	mapData(modelData, data) {
		modelData = _.extend(modelData, data);
		modelData.header = data['common'].header || {};
		modelData.footer = data['common'].footer || {};
		modelData.dataLayer = data['common'].dataLayer || {};

		let baseCSSUrl = modelData.footer.baseCSSUrl;
		let baseJSMinUrl = modelData.footer.baseJSMinUrl;
		let baseImageUrl = modelData.footer.baseImageUrl;
		let baseIconUrl = modelData.footer.baseIconUrl;
		let baseFontUrl = modelData.footer.baseFontUrl;
		let isServeMin = modelData.footer.min;

		let epsImageBaseUrl = modelData.footer.epsImageBaseUrl;
		let cropImageBaseUrl = modelData.footer.cropImageBaseUrl;

		let preCache = {};
		let homepageCache = {};

		// start of precache
		preCache.baseImageUrl = baseImageUrl;
		preCache.css = _.reduceRight(cacheConfig.preCachePaths.css, function(a,b) {
			b = baseCSSUrl + b;
			return a.concat(b);
		}, []);

		preCache.cssmin = _.reduceRight(cacheConfig.preCachePaths.cssmin, function(a,b) {
			b = baseCSSUrl + b;
			return a.concat(b);
		}, []);

		preCache.js = _.reduceRight(cacheConfig.preCachePaths.js, function(a,b) {
			b = baseJSMinUrl + b;
			return a.concat(b);
		}, []);

		preCache.jsmin = _.reduceRight(cacheConfig.preCachePaths.jsmin, function(a,b) {
			b = baseJSMinUrl + b;
			return a.concat(b);
		}, []);

		//start of homepage cache
		homepageCache.css = _.reduceRight(cacheConfig.homepageCachePaths.css, function(a,b) {
			b = baseCSSUrl + b;
			return a.concat(b);
		}, []);

		homepageCache.cssmin = _.reduceRight(cacheConfig.homepageCachePaths.cssmin, function(a,b) {
			b = baseCSSUrl + b;
			return a.concat(b);
		}, []);

		homepageCache.icons = _.reduceRight(cacheConfig.homepageCachePaths.icons, function(a,b) {
			b = baseIconUrl + b;
			return a.concat(b);
		}, []);

		homepageCache.images = _.reduceRight(cacheConfig.homepageCachePaths.images, function(a,b) {
			b = baseImageUrl + b;
			return a.concat(b);
		}, []);

		homepageCache.fonts = _.reduceRight(cacheConfig.homepageCachePaths.fonts, function(a,b) {
			b = baseFontUrl + b;
			return a.concat(b);
		}, []);

		homepageCache.js = _.reduceRight(cacheConfig.homepageCachePaths.js, function(a,b) {
			b = baseJSMinUrl + b;
			return a.concat(b);
		}, []);

		homepageCache.jsmin = _.reduceRight(cacheConfig.homepageCachePaths.jsmin, function(a,b) {
			b = baseJSMinUrl + b;
			return a.concat(b);
		}, []);

		modelData.footer.cachePath = {'preCache': preCache, 'homepageCache': homepageCache, 'cropCache': cropImageBaseUrl, 'epsCache': epsImageBaseUrl, 'isServeMin': isServeMin};

		return modelData;
	}
}

module.exports = ServiceWorkerModel;
