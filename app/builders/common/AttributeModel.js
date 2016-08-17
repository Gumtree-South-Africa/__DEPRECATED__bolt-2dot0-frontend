'use strict';

let attributeService = require(process.cwd() + '/server/services/attributeService');


/**
 * @description A class that Handles the Attribute Model
 * @constructor
 */
class AttributeModel {
	constructor(bapiHeaders) {
		this.bapiHeaders = bapiHeaders;
	}

//Function getAllAttributes
//Check in cache, if not available retrieve from BAPI and preemptively cache it
	getAllAttributes(categoryId) {
		return attributeService.getAllAttributesForCategoryCached(this.bapiHeaders, categoryId).then((cachedResult) => {
			return cachedResult;
		}).fail((cacheErr) => {
			if (cacheErr.status === 404) {
				console.warn('Unable to retrieve AllAtrributes info from Cache for categoryId: ' + categoryId);
				console.warn(cacheErr);
				return attributeService.getAllAttributesForCategory(this.bapiHeaders, categoryId).then((bapiResult) => {
					if (bapiResult.status) {
						console.warn('Unable to retrieve AllAtrributes info from BAPI for categoryId: ' + categoryId);
						console.warn(bapiResult);
						return {};
					}
					return attributeService.setAllAttributesInCache(this.bapiHeaders, categoryId, bapiResult).then(() => {
						return bapiResult;
					}).fail((cacheSaveErr) => {
						console.warn('Unable to cache AllAttributes info for categoryId: ' + categoryId);
						console.warn(cacheSaveErr);
						return {};
					});
				}).fail((bapiErr) => {
					console.warn('Unable to retrieve AllAtrributes info from BAPI for categoryId: ' + categoryId);
					console.warn(bapiErr);
					return {};
				});
			}
			return {};
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

