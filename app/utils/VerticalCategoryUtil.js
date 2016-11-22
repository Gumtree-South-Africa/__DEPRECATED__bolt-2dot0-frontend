'use strict';
let Q = require('q');
let cwd = process.cwd();
let AttributeModel = require(cwd + '/app/builders/common/AttributeModel.js');

/**
 * Get a path from root to node
 * @param root The root to fetch category
 * @param id The target to find
 * @returns {Array<node>} Path from root to node
 */
function fetchCategoryHierarchy(root, id) {
	if (root.id === id) {
		return [root];
	}
	for (let i = 0; i < root.children.length; i++) {
		let path = fetchCategoryHierarchy(root.children[i], id);
		if (path) {
			return [root].concat(path);
		}
	}
	return null;
}

/**
 * Get related vertical category
 * @param categoryId
 * @param categoryAllData
 * @param verticalCategories
 * @returns {*} Verfical category if any
 */
function getVerticalCategory(categoryId, categoryAllData, verticalCategories) {
	let categoryHierarchy = fetchCategoryHierarchy(categoryAllData, categoryId);
	if (!categoryHierarchy) {
		return null;
	}
	for(let index = 0; index < categoryHierarchy.length; index++) {
		let category = categoryHierarchy[index];
		let candidate = verticalCategories.find(cat => cat.id === category.id);
		if (candidate) {
			return candidate;
		}
	}
	return null;
}

/**
 * Using vertical validation (if any) to validate the ad. It will return an error array compatible with
 * format of bapi error.
 * @param ad The target to be validated
 * @param categoryAllData
 * @param verticalCategories
 * @params bapiHeaders The headers to get attribute
 * @returns {*} Null or a promise for error array which simulates the errors from bapi
 */
function verticalCategoryValidate(ad, categoryAllData, verticalCategories, bapiHeaders) {
	let categoryId = ad.categoryId;
	if (categoryId === null || categoryId === undefined) {
		// This error will be handled by other validators
		return Q.resolve(null);
	}
	let categoryHierarchy = fetchCategoryHierarchy(categoryAllData, categoryId);
	if (!categoryHierarchy) {
		// This error will be handled by other validators
		return Q.resolve(null);
	}
	let verticalCategory = null;
	for(let index = 0; index < categoryHierarchy.length; index++) {
		let category = categoryHierarchy[index];
		verticalCategory = verticalCategories.find(cat => cat.id === category.id);
		if (verticalCategory) {
			break;
		}
	}
	if (!verticalCategory) {
		// It's not vertical
		return Q.resolve(null);
	}
	let errors = [];
	if (categoryHierarchy[categoryHierarchy.length - 1].children &&
		categoryHierarchy[categoryHierarchy.length - 1].children.length) {
		// Not leaf category
		errors.push({
			code: 'INVALID_PARAM_CATEGORY_NOT_A_LEAF_NODE',
			message: `Param: Category, Value: ${categoryId}, Message: Please choose a sub-category`
		});
	}
	if (!ad.title || !ad.title.trim().length) {
		errors.push({
			code: 'MISSING_PARAM',
			message: 'Param: Title'
		});
	}
	if (!ad.description || !ad.description.trim().length) {
		errors.push({
			code: 'MISSING_PARAM',
			message: 'Param: description'
		});
	}
	let requiredAttributes = verticalCategory.requiredCustomAttributes;
	if (!requiredAttributes || !requiredAttributes.length) {
		// No required attributes
		return Q.resolve(errors);
	}

	let attributeModel = new AttributeModel(bapiHeaders);
	return attributeModel.getAllAttributes(categoryId).then(attributeData => {
		// Don't check not-exist attribute
		requiredAttributes = requiredAttributes.filter(
			requiredAttr => attributeData.find(attr => attr.name === requiredAttr));
		requiredAttributes.forEach(requiredAttr => {
			let postedAttribute = null;
			if (ad.categoryAttributes) {
				postedAttribute = ad.categoryAttributes.find(attr => attr.name === requiredAttr);
			}
			if (!postedAttribute || postedAttribute.value === null || postedAttribute.value === undefined ||
				(typeof postedAttribute.value === 'string' && !postedAttribute.value.trim().length)) {
				errors.push({
					code: 'MISSING_PARAM',
					message: `Param: categoryAttribute-${requiredAttr}`
				});
			}
		});
		return Q.resolve(errors);
	});
}

module.exports = {
	getVerticalCategory,
	verticalCategoryValidate
};
