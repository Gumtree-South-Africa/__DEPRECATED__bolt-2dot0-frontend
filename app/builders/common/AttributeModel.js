'use strict';

let Q = require('q');

let attributeService = require(process.cwd() + '/server/services/attributeService');

let _ = require("underscore");

/**
 * @description A class that Handles the Attribute Model
 * @constructor
 */
class AttributeModel {
	constructor(bapiHeaders) {
		this.bapiHeaders = bapiHeaders;
	}

	// this function processes the custom attribute list for displaying an already existing ad
	processCustomAttributesList(attributes, adData) {
		let commonAttributesToExclude = [
			"Description",
			"Price",
			"UserName",
			"Address",
			"Phone",
			"Title",
			"Email"
		];

		return attributes.filter((attr) => {
			if (attr.dependencies && attr.dependencies.length > 0) {
				let depAttrValObj;
				if (adData) {
					depAttrValObj = _.findWhere(adData.attributes, {
						name: attr.dependencies[0]
					});
				}

				if (depAttrValObj && depAttrValObj.value && depAttrValObj.value.attributeValue) {
					attr.allowedValues.filter((val) => {
						return val.dependencyValue === depAttrValObj.value.attributeValue;
					});
				} else {
					attr.allowedValues = [];
				}
			}

			return !_.contains(commonAttributesToExclude, attr.name);
		});
	}

//Function getAllAttributes
//Check in cache, if not available retrieve from BAPI and preemptively cache it
	getAllAttributes(categoryId) {
		return attributeService.getAllAttributesForCategoryCached(this.bapiHeaders, categoryId).then((cachedResult) => {
			return cachedResult;
		}).fail((cacheErr) => {
			console.warn('Unable to retrieve AllAtrributes info from Cache for categoryId: ' + categoryId + `, going to try BAPI ${cacheErr}`);
			return attributeService.getAllAttributesForCategory(this.bapiHeaders, categoryId).then((bapiResult) => {
				if (bapiResult.status) {
					return Q.reject('Unable to retrieve AllAtrributes info from BAPI for categoryId: ' + categoryId + `, result ${bapiResult}`);
				}
				return attributeService.setAllAttributesInCache(this.bapiHeaders, categoryId, bapiResult).then(() => {
					return bapiResult;
				});
			});
		});
	}

//Function getAttribute
	getAttribute(categoryId, attributeName) {
		if (typeof this.bapiHeaders.locale !== 'undefined') {
			return attributeService.getAttributeInfoCached(this.bapiHeaders, categoryId, attributeName);
		}
	}

//Function getAttributeDependency
	getAttributeDependency(categoryId, attributeName) {
		if (typeof this.bapiHeaders.locale !== 'undefined') {
			return attributeService.getAttributeDependencyInfoCached(this.bapiHeaders, categoryId, attributeName);
		}
	}
}
module.exports = AttributeModel;

