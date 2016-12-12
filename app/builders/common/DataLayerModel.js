'use strict';

let ModelBuilder = require('./ModelBuilder');
let config = require('config');

let Encryptor = require(process.cwd() + '/app/utils/Encryptor');
let pagetypeJson = require(process.cwd() + '/app/config/pagetype.json');


//Function getPageData
let getPageData = function(scope) {
	return {
		// For AB Testing no matter which home page landed, the p.t will always be Homepage
		'pageType': (pagetypeJson.pagetype.HOMEPAGEV2 === scope.pagetype) ? pagetypeJson.pagetype.HOMEPAGE : scope.pagetype,
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
		'hideSessionLvTstGrp': scope.hideSessionLvTstGrp,
		'sessionLvTstGrp': scope.sessionLvTstGrp
	};
};


///Function getCatData
let getCatData = function(scope) {
	return {
		'current': scope.currentCategory,
		'level0': scope.L0Category,
		'level1': scope.L1Category,
		'level2': scope.L2Category,
		'level3': scope.L3Category,
		'level4': scope.L4Category
	};
};

//Function getLocData
let getLocData = function(scope) {
	return {
		'current': scope.currentLocation,
		'level0': scope.L0Location,
		'level1': scope.L1Location,
		'level2': scope.L2Location,
		'level3': scope.L3Location,
		'level4': scope.L4Location
	};
};

let getCategoryHierarchy = function(scope, parent, id) {
	for (let i=0 ; parent.children !=='undefined' && i < parent.children.length; i++ ) {
		let item = parent.children[i];
		if (id === item.id) {
			scope[item.level + 'Category'] = {'id': item.id, 'name': item.localizedName};
			return true;
		} else {
			if (getCategoryHierarchy(scope, item, id)) {
				scope[item.level + 'Category'] = {'id': item.id, 'name': item.localizedName};
				return true;
			}
		}
	}
};

let getLocationHierarchy = function(scope, parent, id) {
	if (parent.isLeaf === true) {
		return false;
	}
	for (let i=0 ; parent.children !=='undefined' && i < parent.children.length; i++ ) {
		let item = parent.children[i];
		if (id === item.id) {
			scope[item.level + 'Location'] = {'id': item.id, 'name': item.localizedName};
			return true;
		} else {
			if (getLocationHierarchy(scope, item, id)) {
				scope[item.level + 'Location'] = {'id': item.id, 'name': item.localizedName};
				return true;
			}
		}
	}
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
		// Temp fix for BOLT-25001. As discussed with defect creator, we'll not send CD25 for homepage in MX.
		// TODO remove this when we have a final solution for BOLT-25001
		this.hideSessionLvTstGrp = this.locale === 'es_MX' && this.pagetype === pagetypeJson.pagetype.HOMEPAGEV2;
		this.sessionLvTstGrp = res.locals.b2dot0PageVersion ? "V2" : "V1";
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

	setAdResult(adresult) {
		this.adResult = adresult;
	}

	setCategoryData(categorydata) {
		let currentId = this.adResult.categoryId;
		this.currentCategory = {'id': currentId, 'name': this.adResult.categoryName};
		if (categorydata.id !== currentId) {
			this.L0Category = {'id': categorydata.id, 'name': categorydata.localizedName};
			getCategoryHierarchy(this, categorydata, currentId);
		}
	}

	setLocationData(locationdata) {
		let currentId = this.adResult.location.id;
		this.currentLocation = {'id': currentId, 'name': this.adResult.location.name};
		if (locationdata.id !== currentId) {
			this.L0Location = {'id': locationdata.id, 'name': locationdata.localizedName};
			getLocationHierarchy(this, locationdata, currentId);
		}
	}

	getData() {
		return [
			() => {
				let data = {};
				switch (this.pagetype) {
					case pagetypeJson.pagetype.HOMEPAGE:
					case pagetypeJson.pagetype.HOMEPAGEV2:
					case pagetypeJson.pagetype.POST_AD:
					case pagetypeJson.pagetype.VIP:
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
