'use strict';

let specHelper = require('../helpers/commonSpecHelper.js');

let topSearchesController = require('app/appWeb/views/components/topSearches/js/topSearches.js');
let topLocationsController = require('app/appWeb/views/components/topLocations/js/topLocations.js');
let keywordsModel = require('../mockData/keywords.json');
let LocationModel = require('../mockData/locations.json');
//let CookieUtils = require('public/js/common/utils/CookieUtils.js');


describe('Top Searches', () => {

	beforeEach(() => {

	});

	describe('topSearches Controller', () => {
		it('should show topSearches', () => {
			let $testArea = specHelper.setupTest('topSearches', {topSearches: keywordsModel}, 'es_MX');
			let $testAreaLocations = specHelper.setupTest('topLocations', {topLocations: LocationModel}, 'es_MX');
			topSearchesController.initialize();
			topLocationsController.initialize();

			let $tapContent = $testArea.find('.tab-content');
			expect($tapContent.hasClass('searches-wrapper')).toBeTruthy('should display keywords list');

			let $topHeaders = $testArea.find('.top-headers');
			$topHeaders.click();
			expect($topHeaders.hasClass('thick-underline')).toBeTruthy('should choose current tab');

			let $topHeadersLocations = $testAreaLocations.find('.top-headers');
			$topHeadersLocations.click();
			expect($topHeadersLocations.hasClass('thick-underline')).toBeTruthy('should choose current tab Locations');


			let $viewMoreSearches = $testArea.find('.view-more-searches');
			let $showMoreSearches = $testArea.find('.show-more-searches');
			$viewMoreSearches.click();
			expect($showMoreSearches.is(':visible')).toBeTruthy('should display view more');
		});
	});
});
