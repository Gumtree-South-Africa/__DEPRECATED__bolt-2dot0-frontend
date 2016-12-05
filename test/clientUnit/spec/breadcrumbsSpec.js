'use strict';

let model = require('../mockData/breadcrumbsModel.json');
let specHelper = require('../helpers/commonSpecHelper.js');

describe('Breadcrumbs', () => {
	it('should find breadcrumbs', () => {
		specHelper.setupTest("breadcrumbsV2_es_MX", model.empty, "es_MX");

		expect($('.breadcrumbs').length).toBe(1);
	});

	it('should not find breadcrumbs', () => {
		specHelper.setupTest("breadcrumbsV2_es_MX", { }, "es_MX");

		expect($('.breadcrumbs').length).toBe(0);
	});

	it('should have the proper number of elements', () => {
		specHelper.setupTest("breadcrumbsV2_es_MX", model.filledUp, "es_MX");

		expect($('.breadcrumbs li').length).toBe(model.filledUp.breadcrumbs.categories.length + model.filledUp.breadcrumbs.locations.length);
		expect($('.breadcrumb-category').length).toBe(model.filledUp.breadcrumbs.categories.length);
		expect($('.breadcrumb-location').length).toBe(model.filledUp.breadcrumbs.locations.length);
	});

	it('should render all item properties', () => {
		specHelper.setupTest("breadcrumbsV2_es_MX", model.filledUp, "es_MX");

		let $item = $('.breadcrumbs li').last();

		expect($item.find('[itemprop=url]').attr('content')).toBeTruthy('should have a META tag pointing to the item URL');
		expect($item.find('[itemprop=item]').attr('href')).toBeTruthy('should render the link URL by itself');
		expect(parseInt($item.find('[itemprop=position]').attr('content'), 10)).toBeTruthy('should have an item position greater than or equal to 1');
	});
});
