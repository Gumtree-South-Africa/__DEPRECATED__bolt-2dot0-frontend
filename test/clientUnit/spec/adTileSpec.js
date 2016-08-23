'use strict';

let specHelper = require('../helpers/commonSpecHelper.js');

let adTileController = require("app/appWeb/views/components/adTile/js/adTile.js");
let adTileModel = require('../mockData/adTileModel.json');
let CookieUtils = require("public/js/common/utils/CookieUtils.js");


describe('Ad Tile', () => {
	let $testArea;

	beforeEach(() => {
		$testArea = specHelper.setupTest("adTile_es_MX", adTileModel, "es_MX");
	});

	fdescribe('Ad Tile Controller', () => {

		it('should save and retrieve map from cookie', () => {

			let map = {'bar': '', 'bas': ''};

			let cookieValue = adTileController._setIdMapToCookie("foo", map);
			expect(cookieValue).toBe("bar,bas");

			cookieValue = adTileController._getIdMapFromCookie("foo");
			expect(JSON.stringify(cookieValue, null, 4)).toBe(JSON.stringify(map, null, 4));
		});


		it('should toggle heart icon and set cookie on click', () => {
			let $heart = $testArea.find('.favorite-btn');

			// we're going to call twice, once on each click, one POST and one DELETE
			specHelper.registerMockAjax('/api/ads/favorite', {} );	// empty object since we're not expecting a result
			specHelper.registerMockAjax('/api/ads/favorite', {} );	// empty object since we're not expecting a result
			spyOn(adTileController, '_favoriteAd');//.and.callThrough();
			CookieUtils.setCookie("bt_auth", "dummy");	// this enables the server calls to _favoriteAd

			adTileController.initialize(false);		// we init with false because we're handing the onReady
			adTileController.onReady();

			expect($heart.hasClass('icon-heart-gray')).toBeTruthy('should show grey heart icon initially');

			$heart.click();
			expect($heart.hasClass('icon-heart-white')).toBeTruthy('should show white heart icon class after first click');
			let cookieValue = CookieUtils.getCookie('watchlist');
			expect(cookieValue).toBe(`${adTileModel.adId}`);

			$heart.click();
			expect($heart.hasClass('icon-heart-gray')).toBeTruthy('should show grey heart icon class after second click');
			cookieValue = CookieUtils.getCookie('watchlist');
			expect(cookieValue).toBe('');

			expect(adTileController._favoriteAd.calls.count()).toBe(2, '_favoriteAd should be called twice');

		});


		it('should still toggle heart icon and set cookie on click (mock server fail)', () => {
			let $heart = $testArea.find('.favorite-btn');

			// we're going to call twice, once on each click, one POST and one DELETE
			specHelper.registerMockAjax('/api/ads/favorite', { error: 'test error' }, { fail: true } );
			specHelper.registerMockAjax('/api/ads/favorite', { error: 'test error' }, { fail: true } );
			spyOn(adTileController, '_favoriteAd');//.and.callThrough();
			CookieUtils.setCookie("bt_auth", "dummy");	// this enables the server calls to _favoriteAd

			adTileController.initialize(false);		// we init with false because we're handing the onReady
			adTileController.onReady();

			expect($heart.hasClass('icon-heart-gray')).toBeTruthy('should show grey heart icon initially');

			$heart.click();
			expect($heart.hasClass('icon-heart-white')).toBeTruthy('should show white heart icon class after first click');
			let cookieValue = CookieUtils.getCookie('watchlist');
			expect(cookieValue).toBe(`${adTileModel.adId}`);

			$heart.click();
			expect($heart.hasClass('icon-heart-gray')).toBeTruthy('should show grey heart icon class after second click');
			cookieValue = CookieUtils.getCookie('watchlist');
			expect(cookieValue).toBe('');

	//		expect(adTileController._favoriteAd.calls.count()).toBe(2, '_favoriteAd should be called twice');

		});

		it('should set white heart icons on ads in the cookie when page first loads', () => {
			let $heart = $testArea.find('.favorite-btn');

			specHelper.registerMockAjax('/api/ads/favorite', {} );	// empty object since we're not expecting a result
			spyOn(adTileController, '_favoriteAd').and.callThrough();

			adTileController.initialize(false);		// we init with false because we're handing the onReady
			adTileController.onReady();

			$heart.click();

			expect(adTileController._favoriteAd.calls.count()).toBe(0, 'adjustTileSizes should not be called');


		});
	});
});
