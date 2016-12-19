'use strict';

let Q = require('q');

let attributeService = require(process.cwd() + '/server/services/attributeService');
let BapiError = require(`${process.cwd()}/server/services/bapi/BapiError`);
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
		let isPriceExcluded = true;
		let commonAttributesToExclude = [
			"Description",
			"Price",
			"UserName",
			"Address",
			"Phone",
			"Title",
			"Email"
		];

		let customAttributes = attributes.map((attr) => {
			let toReturn = attr;
			if (attr.dependencies && attr.dependencies.length > 0) {
				let depAttrValObj;
				if (adData) {
					depAttrValObj = _.findWhere(adData.attributes, {
						name: attr.dependencies[0]
					});
				}

				// Attr is the one in cache, so we can't change any of its property value.
				toReturn = _.extend({}, attr);
				if (depAttrValObj && depAttrValObj.value && depAttrValObj.value.attributeValue) {
					toReturn.allowedValues = toReturn.allowedValues.filter((val) => {
						return val.dependencyValue === depAttrValObj.value.attributeValue;
					});
				} else {
					toReturn.allowedValues = [];
				}
			}

			if (toReturn.name === "Price") {
				isPriceExcluded = false;
			}

			return toReturn;
		}).filter((attr) => {
			return !_.contains(commonAttributesToExclude, attr.name);
		});

		return {
			customAttributes,
			isPriceExcluded
		};
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
					return Q.reject(new BapiError('Unable to retrieve AllAtrributes info from BAPI for categoryId: ' + categoryId + `, result ${bapiResult}`));
				}
				return attributeService.setAllAttributesInCache(this.bapiHeaders, categoryId, bapiResult).then(() => {
					return bapiResult;
				});
			});
		});
	}

//Function getAttributeDependents
	getAttributeDependents(categoryId, attributeName, attributeValue) {
		if (typeof this.bapiHeaders.locale !== 'undefined') {
			return attributeService.peekAttributeInfoCached(this.bapiHeaders, categoryId, attributeName).then(() => {
				return this.getAttributeDependentsInternal(categoryId, attributeName, attributeValue);
			}).fail((cacheErr) => {
				console.warn(`getAttributeDependents Peek Cache failed in AttributeModel ${cacheErr}. Lets try to retrieve from BAPI`);
				return this.getAllAttributes(categoryId).then(() => {
					console.warn('Cache reloaded in AttributeModel, Lets try to retrieve from Cache');
					return this.getAttributeDependentsInternal(categoryId, attributeName, attributeValue);
				});
			});
		}
	}

	getAttributeDependentsInternal(categoryId ,attributeName, attributeValue) {
		return attributeService.getAttributeInfoCached(this.bapiHeaders, categoryId, attributeName).then((attribute) => {
			let dependents = attribute.dependents;

			let dependentsPromises = dependents.map((dependent) => {
				return attributeService.getAttributeDependencyInfoCached(this.bapiHeaders, categoryId, dependent).then((dep) => {
					return {
						name: dependent,
						values: dep[attributeValue]
					};
				});
			});

			return Q.all(dependentsPromises);
		});
	}
}
module.exports = AttributeModel;

