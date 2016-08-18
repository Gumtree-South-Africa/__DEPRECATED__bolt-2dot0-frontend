'use strict';

let cwd = process.cwd();
let _ = require('underscore');
let Q = require('q');
let config = require('config');

let bapiOptionsModel = require(cwd + "/server/services/bapi/bapiOptionsModel");
let bapiService      = require(cwd + "/server/services/bapi/bapiService");

let cacheConfig  = require(cwd + '/server/config/site/cacheConfig.json');
let cacheService = require(cwd + "/server/services/cache/cacheService");


class AttributeService {

	// BAPI
	getAllAttributesForCategory(bapiHeaderValues, categoryId) {
		let queryEndpoint = config.get('BAPI.endpoints.categoryAttributes');

		queryEndpoint.replace('{catId}', categoryId);

		let bapiOptions = bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: queryEndpoint
		});

		return bapiService.bapiPromiseGet(bapiOptions, bapiHeaderValues, 'categoryAttributes');
	}

	// Cache: categoryAllAtributes
	getAllAttributesForCategoryCached(bapiHeaderValues, categoryId) {
		let cacheKey = bapiHeaderValues.locale + ':' + categoryId;
		return cacheService.getValue(cacheConfig.cache.categoryAllAttributes.name, cacheKey);
	}

	// Cache: categoryAllAtributes
	setAllAttributesInCache(bapiHeaderValues, categoryId, data) {
		return Q.fcall(() => {
			let cacheKey = bapiHeaderValues.locale + ':' + categoryId;
			cacheService.setValue(cacheConfig.cache.categoryAllAttributes.name, cacheKey, data);
			data.forEach((attributeData) => {
				this.setAttributeInfoInCache(bapiHeaderValues, categoryId, attributeData.name, attributeData);
				if ((attributeData !== undefined) && !_.isEmpty(attributeData.dependencies) && !_.isEmpty(attributeData.allowedValues)) {
					// creating dependency valueMap
					// acura: [ dependent1, dependent2, dependent3]
					// dependent1: {"dependencyValue": "acura","value": "integra","canonicalValue": "integra","localizedValue": "Integra"}
					let valueMap = {};
					_.each(attributeData.allowedValues, (valueSet) => {
						if (_.isEmpty(valueMap[valueSet.dependencyValue])) {
							let dependents = [];
							dependents.push(valueSet);
							valueMap[valueSet.dependencyValue] = dependents;
						} else {
							valueMap[valueSet.dependencyValue].push(valueSet);
						}
					});
					this.setAttributeDependencyInfoInCache(bapiHeaderValues, categoryId, attributeData.name, valueMap);
				}
			});
		});
	}

	// Cache: categoryAttributeInfo
	getAttributeInfoCached(bapiHeaderValues, categoryId, attributeName) {
		let cacheKey = bapiHeaderValues.locale + ':' + categoryId + ':' + attributeName;
		return cacheService.getValue(cacheConfig.cache.categoryAttributeInfo.name, cacheKey);
	}

	// Cache: categoryAttributeInfo
	setAttributeInfoInCache(bapiHeaderValues, categoryId, attributeName, data) {
		let cacheKey = bapiHeaderValues.locale + ':' + categoryId + ':' + attributeName;
		return cacheService.setValue(cacheConfig.cache.categoryAttributeInfo.name, cacheKey, data);
	}

	// Cache: categoryAttributeDependencyInfo
	getAttributeDependencyInfoCached(bapiHeaderValues, categoryId, attributeName) {
		let cacheKey = bapiHeaderValues.locale + ':' + categoryId + ':' + attributeName;
		return cacheService.getValue(cacheConfig.cache.categoryAttributeDependencyInfo.name, cacheKey);
	}

	// Cache: categoryAttributeDependencyInfo
	setAttributeDependencyInfoInCache(bapiHeaderValues, categoryId, attributeName, data) {
		let cacheKey = bapiHeaderValues.locale + ':' + categoryId + ':' + attributeName;
		return cacheService.setValue(cacheConfig.cache.categoryAttributeDependencyInfo.name, cacheKey, data);
	}
}


module.exports = new AttributeService();
