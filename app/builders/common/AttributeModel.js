'use strict';

let Q = require('q');

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
		let deferred = Q.defer();
		if (typeof this.bapiHeaders.locale !== 'undefined') {
			return attributeService.getAllAttributesForCategoryCached(this.bapiHeaders, categoryId).then((cachedResult) => {
				if (cachedResult === undefined) {
					return attributeService.getAllAttributesForCategory(this.bapiHeaders, categoryId).then((bapiResult) => {
						if (bapiResult === undefined) {
							deferred.resolve({});
						} else {
							attributeService.setAllAttributesInCache(this.bapiHeaders, categoryId, bapiResult);
							deferred.resolve(bapiResult);
						}
					});
				} else {
					deferred.resolve(cachedResult);
				}
			}).fail(() => {
				deferred.resolve({});
			});
		} else {
			deferred.reject(new Error('locale is undefined'));
		}
		return deferred.promise;
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

