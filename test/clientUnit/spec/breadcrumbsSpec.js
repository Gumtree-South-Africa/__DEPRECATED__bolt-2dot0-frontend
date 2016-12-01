'use strict';

let model = require('../mockData/breadcrumbsModel.json');
let specHelper = require('../helpers/commonSpecHelper.js');

describe('Breadcrumbs', () => {
	it('should find breadcrumbs', () => {
		specHelper.setupTest("breadcrumbsV2_es_MX", { }, "es_MX");

		expect($('.breadcrumbs').length).toBe(1);
	});

	it('should have the proper number of elements', () => {
		specHelper.setupTest("breadcrumbsV2_es_MX", model.locationsAndAd, "es_MX");

		expect($('.breadcrumbs li').length).toBe(model.locationsAndAd.breadcrumbs.locations.length + 1);
		expect($('.breadcrumb-location').length).toBe(model.locationsAndAd.breadcrumbs.locations.length);
		expect($('.breadcrumb-ad').length).toBe(1);
	});

	it('should render all item properties', () => {
		specHelper.setupTest("breadcrumbsV2_es_MX", model.locationsOnly, "es_MX");

		let $item = $('.breadcrumbs li').last();

		expect($item.find('[itemprop=url]').attr('content')).toBeTruthy('should have a META tag pointing to the item URL');
		expect($item.find('[itemprop=item]').attr('href')).toBeTruthy('should render the link URL by itself');
		expect(parseInt($item.find('[itemprop=position]').attr('content'), 10)).toBeTruthy('should have an item position greater than or equal to 1');
	});
});
