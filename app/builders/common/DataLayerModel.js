'use strict';

let ModelBuilder = require('./ModelBuilder');
let config = require('config');

let Encryptor = require(process.cwd() + '/app/utils/Encryptor');
let pagetypeJson = require(process.cwd() + '/app/config/pagetype.json');


//Function getPageData
let getPageData = function(scope) {
	return {
		'pageType': scope.pagetype,
		'platform': 'BOLT-RUI',
		'version': config.get('static.server.version'),
		'language': scope.locale,
		'viewType': ''
	};
};


//Function getUserData
let getUsereData = function(scope) {
	return {
		'hashedUserId': (typeof scope.userid === 'undefined' || scope.userid === null) ? '' : Encryptor.hash('' + scope.userid),
		'hashedUserEmail': (typeof scope.useremail === 'undefined' || scope.useremail === null) ? '' : Encryptor.encrypt(scope.useremail),
		'loggedIn': (!(typeof scope.userid === 'undefined' || scope.userid === null)),
		'hashedAccountId': '',
		'accountType': '',
	    'accountCreationDate': (typeof scope.usercreationdate === 'undefined' || scope.usercreationdate === null) ? '' : (scope.usercreationdate),
        'daysSinceRegistration': '',
		'sessionLvTstGrp': scope.sessionLvTstGrp
	};
};


//Function getCatData
let getCatData = function(scope) {
	return {
		//TODO: this is just for testing, don't be serious about this :)
		'current': scope.categoryData,
		'level0': '',
		'level1': '',
		'level2': '',
		'level3': '',
		'level4': ''
	};
};

//Function getLocData
let getLocData = function(scope) {
	return {
		//TODO: this is just for testing, don't be serious about this :)
		'current': scope.adResult,
		'level0': '',
		'level1': '',
		'level2': '',
		'level3': '',
		'level4': ''
	};
};

/**
 * @description A class that Handles the DataLayer Model
 * @constructor
 */
class DataLayerModel {
	constructor(req, res) {
		// Local Variables
		this.locale = res.locals.config.locale;
		this.brandName = res.locals.config.name;
		this.country = res.locals.config.country;
		this.pagetype = req.app.locals.pagetype;
		this.sessionLvTstGrp = res.locals.b2dot0Version ? "V2" : "V1";
	}

	getModelBuilder() {
		return new ModelBuilder(this.getData());
	}

	setUserId(userid) {
		this.userid = userid;
	}

	setUserEmail(useremail) {
		this.useremail = useremail;
	}

	setUserCreationDate(usercreationdate) {
		this.usercreationdate = usercreationdate;
	}

	setCategoryData(categorydata) {
		this.categoryData = categorydata;
	}

	setAdResult(adresult) {
		this.adResult = adresult;
	}

	getData() {
		return [
			() => {
				let data = {};
				switch (this.pagetype) {
					case pagetypeJson.pagetype.HOMEPAGE:
					case pagetypeJson.pagetype.HOMEPAGEV2:
					case pagetypeJson.pagetype.POST_AD:
						data = {
							'pageData': getPageData(this),
							'userData': getUsereData(this),
						};
						break;
					case pagetypeJson.pagetype.EDIT_AD:
						data = {
							'pageData': getPageData(this),
							'userData': getUsereData(this),
							'categoryData': getCatData(this),
							'locationData': getLocData(this),
							 'adResult'   : this.adResult
						};
						break;
					case pagetypeJson.pagetype.QUICK_POST_AD_FORM:
						data = {
							'pageData': getPageData(this)
						};
						break;
					case pagetypeJson.pagetype.RESULTS_SEARCH:
						data = {
							'pageData': getPageData(this),
							'userData': getUsereData(this),
							'categoryData': getCatData(this),
							'locationData': getLocData(this)
						};
						break;
					default:
						break;
				}

				return data;
			}
		];
	}

}

module.exports = DataLayerModel;

