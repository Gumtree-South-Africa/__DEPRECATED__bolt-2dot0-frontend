'use strict';

let cwd = process.cwd();
let editAdService = require(cwd + '/server/services/editad');
let _ = require("underscore");

let VIP_URL_SUFFIX = "?activateStatus=adActivateSuccess";

let commonAttributesToExclude = [
	"Description",
	"Price",
	"UserName",
	"Address",
	"Phone",
	"Title",
	"Email"
];

class EditAdModel {
	constructor(bapiHeaders) {
		this.bapiHeaders = bapiHeaders;
	}

	getAd(adId) {
		if (typeof adId === undefined || adId === null) {
			return {};
		}
		return editAdService.getAd(this.bapiHeaders, adId).then((data) => {
			let postDate = new Date(data.postedDate);
			let currentDate = new Date();
			let timeDiff = Math.abs(currentDate.getTime() - postDate.getTime());
			data.daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));

			return data;
		});
	}

	editAd(editAdRequest) {
		return editAdService.editAd(this.bapiHeaders, editAdRequest.adId, editAdRequest).then( (results) => {
			let vipLink = results._links.find( (elt) => {
				return elt.rel === "seoVipUrl";
			});
			if (vipLink) {
				results.vipLink = vipLink.href;
			} else {
				throw new Error(`post ad result is missing seoVipUrl ${JSON.stringify(results, null, 4)}`);
			}
			return results;
		});
	}

	translateCustomAttributes() {
		let exclusionIndexArray = [], calMap = {}, customAttrList = require(`${cwd}/server/services/mockData/CustomAttributesEx.json`);

		customAttrList.forEach((customAttr, index) => {
			let tempAllowedValues = {};
			if (_.contains(commonAttributesToExclude, customAttr.name)) {
				exclusionIndexArray.push(index);
			}

			if (customAttr.allowedValues && customAttr.allowedValues.length > 0 && customAttr.dependencies && customAttr.dependencies.length > 0) {
				customAttr.allowedValues.forEach((allowedVal) => {
					if (tempAllowedValues[allowedVal.dependencyValue]) {
						tempAllowedValues[allowedVal.dependencyValue].push(allowedVal);
					} else {
						tempAllowedValues[allowedVal.dependencyValue] = [allowedVal];
					}

					delete customAttr.allowedValues;

					customAttr.allowedValuesDep = tempAllowedValues;
				});
			}
			calMap[customAttr.name] = customAttr;
		});

		// remove common attributes already displayed without
		// creating cavities in the array.
		customAttrList = _.filter(customAttrList, (val, i) => {
			return !_.contains(exclusionIndexArray, i);
		});

		return {
			customAttributes: customAttrList,
			calMap: calMap
		};
	}

	getFullAttributeArray() {

	}

	getAttrDependencyUpdateJson(catId, dependency, depValue) {
		// check if we have the category cached already
		// if (customAttributesService) {
		// 	return ;// lookup
		// } else {
		let map = this.translateCustomAttributes().calMap;

		let dependents = map[dependency].dependents;

		let returnMap = {};

		dependents.forEach((dep) => {
			return returnMap[dep] = map[dep].allowedValuesDep[depValue];
		});

		return returnMap;

		// }
	}

	fixupVipUrl(redirectUrl) {
		return redirectUrl + VIP_URL_SUFFIX;
	}
}

module.exports = EditAdModel;
