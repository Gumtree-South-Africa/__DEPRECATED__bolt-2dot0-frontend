'use strict';

let specHelper = require('../helpers/commonSpecHelper.js');

let adTileController = require("app/appWeb/views/components/adTile/js/adTile.js");
let adTileModel = require('../mockData/adTileModel.json');


describe('Ad Tile', () => {
	let $testArea;

	beforeEach(() => {
		$testArea = specHelper.setupTest("adTile_es_MX", adTileModel, "es_MX");
	});

	describe('Ad Tile Controller', () => {
		it('should toggle heart icon classes on click', () => {
			let $heart = $testArea.find('.favorite-btn');

			adTileController.initialize(false);		// we init with false because we're handing the onReady
			adTileController.onReady();

			expect($heart.hasClass('icon-heart-gray')).toBeTruthy('Grey heart icon class should show initially');
			$heart.click();
			expect($heart.hasClass('icon-heart-white')).toBeTruthy('White heart icon class should show after first click');
			$heart.click();
			expect($heart.hasClass('icon-heart-gray')).toBeTruthy('Grey heart icon class should show after second click');
		});
	});
});
