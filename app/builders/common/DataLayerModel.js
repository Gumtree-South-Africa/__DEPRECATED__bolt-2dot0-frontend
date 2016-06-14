'use strict';

let  Q = require('q');

let  ModelBuilder = require('./ModelBuilder');
let  config = require('config');

let  Encryptor = require(process.cwd() + '/app/utils/Encryptor');
let  pagetypeJson = require(process.cwd() + '/app/config/pagetype.json');


//Function getPageData
let  getPageData = function(scope) {
	let  pageData = {
		'pageType': scope.pagetype,
		'platform': 'BOLT-RUI',
		'version': config.get('static.server.version'),
		'language': scope.locale,
		'viewType': ''
	};

	return pageData;
};

//Function getUserData
let  getUsereData = function(scope) {
	let  userData = {
		'hashedUserId': (typeof scope.userid === 'undefined' || scope.userid === null) ? '' : Encryptor.hash('' + scope.userid),
		'hashedUserEmail': (typeof scope.useremail === 'undefined' || scope.useremail === null) ? '' : Encryptor.encrypt(scope.useremail),
		'loggedIn': (typeof scope.userid === 'undefined' || scope.userid === null) ? false : true,
		'hashedAccountId': '',
		'accountType': ''
	};

	return userData;
};

//Function getCatData
let  getCatData = function() {
	let  categoryData = {
		'current': '',
		'level0': '',
		'level1': '',
		'level2': '',
		'level3': '',
		'level4': ''
	};

	return categoryData;
};

//Function getLocData
let  getLocData = function() {
	let  locationData = {
		'current': '',
		'level0': '',
		'level1': '',
		'level2': '',
		'level3': '',
		'level4': ''
	};

	return locationData;
};


// commented out because these functions were unused, erroring out ESLINT
// //Function getAdData
// let  getAdData = function() {
// 	let  adData = {
// 		'current': '',
// 		'level0': ''
// 	};
//
// 	return adData;
// };
//
// //Function getReplyData
// let  getReplyData = function() {
// 	let  replyData = {
// 		'current': '',
// 		'level0': ''
// 	};
//
// 	return replyData;
// };
//
// //Function getSearchData
// let  getSearchData = function() {
// 	let  searchData = {
// 		'current': '',
// 		'level0': ''
// 	};
//
// 	return searchData;
// };

// //Function getEcommerceData
// let  getEcommerceData = function() {
// 	let  ecommerceData = {
// 		'current': '',
// 		'level0': ''
// 	};
//
// 	return ecommerceData;
// };


/**
 * @description A class that Handles the DataLayer Model
 * @constructor
 */
let  DataLayerModel = function(req, res) {
	// Local Variables
	this.locale = res.locals.config.locale;
	this.brandName = res.locals.config.name;
	this.country = res.locals.config.country;
	this.pagetype = req.app.locals.pagetype;
};

DataLayerModel.prototype.getModelBuilder = function() {
	return new ModelBuilder(this.getData());
};

DataLayerModel.prototype.setUserId = function(userid) {
	this.userid = userid;
};

DataLayerModel.prototype.setUserEmail = function(useremail) {
	this.useremail = useremail;
};

DataLayerModel.prototype.getData = function() {
	let  _this = this;
	let  pageDeferred = Q.defer();

	let  pageDataFunction = function(callback) {
		let  data = {};
		switch (_this.pagetype) {
			case pagetypeJson.pagetype.HOMEPAGE:
				data = {
					'pageData': getPageData(_this),
					'userData': getUsereData(_this)
				};
				break;
			case pagetypeJson.pagetype.QUICK_POST_AD_FORM:
				data = {
					'pageData': getPageData(_this)
				};
				break;
			case pagetypeJson.pagetype.RESULTS_SEARCH:
				data = {
					'pageData': getPageData(_this),
					'userData': getUsereData(_this),
					'categoryData': getCatData(_this),
					'locationData': getLocData(_this)
				};
				break;
			default:
				break;
		}

		pageDeferred.resolve(data);
		callback(null, data);
	};

	let  arrFunctions = [pageDataFunction];
	return arrFunctions;
};

module.exports = DataLayerModel;

