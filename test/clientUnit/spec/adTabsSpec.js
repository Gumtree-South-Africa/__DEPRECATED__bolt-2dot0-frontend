'use strict';

let specHelper = require('../helpers/commonSpecHelper.js');

let adTabsController = require('app/appWeb/views/components/adTabs/js/adTabs.js');
//let topLocationsController = require('app/appWeb/views/components/titleGrid/js/titleGrid.js');
let advertModel = require('../mockData/adTabModel.json');
//let CookieUtils = require('public/js/common/utils/CookieUtils.js');


describe('Ad Tabs', () => {

	beforeEach(() => {

	});

	describe('adTabs Controller', () => {
		it('should show adTabs', () => {
			let $testArea = specHelper.setupTest('adTabs', {advert: advertModel}, 'es_MX');
		//	let $testAreaLocations = specHelper.setupTest('tileGrid', {topLocations: LocationModel}, 'es_MX');
			adTabsController.initialize();

			let $adTapContent = $testArea.find('.content-ad-tabs .adTabs ul li').eq(0);
			let $contentAds = $testArea.find('.content-ads').eq(0);
			expect($adTapContent.hasClass('active')).toBeTruthy('should display ad tabs and the first it has an active class');

			$adTapContent.click();
			expect($contentAds.hasClass('ad-display')).toBeTruthy('should display cards according to menu tab');
		});
	});
});
