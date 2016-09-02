'use strict';

let specHelper = require('../helpers/commonSpecHelper.js');

let tileGridController = require("app/appWeb/views/components/tileGrid/js/tileGrid.js");
let trendingCardModel = require('../mockData/trendingCardModel.json');
let locResponse = require('../../serverUnit/mockData/geo/geoLocation.json');
let BreakpointTileSizeMapper = require('app/appWeb/views/components/tileGrid/js/BreakpointTileSizeMapper.js');
let $ = require('jquery');
let CookieUtils = require("public/js/common/utils/CookieUtils.js");

let tileHasAnyClasses = (tile, classes) => {
	let hasAny = false;
	for (let classIndex = 0; classIndex < classes.length; classIndex++) {
		if (tile.hasClass(classes[classIndex])) {
			hasAny = true;
		}
	}
	return hasAny;
};

describe('Card/Tile Grid', () => {

	beforeEach(() => {
	});

	describe('Breakpoint Tile Size Mapper', () => {

		// this test out until we can  fix the issue:
		// Can't find variable: google in /Volumes/caseSensitive/bolt-2dot0-frontend/test/clientUnit/SpecRunner.js (line 15858)

		it('should return proper breakpoint for specified browser window width', () => {

			let mapper = new BreakpointTileSizeMapper();

			expect(mapper.nearestBreakpoint(200)).toBe(250);
			expect(mapper.nearestBreakpoint(250)).toBe(250);
			expect(mapper.nearestBreakpoint(251)).toBe(250);

			expect(mapper.nearestBreakpoint(360)).toBe(360);
			expect(mapper.nearestBreakpoint(361)).toBe(360);

			expect(mapper.nearestBreakpoint(480)).toBe(480);
			expect(mapper.nearestBreakpoint(481)).toBe(480);

			expect(mapper.nearestBreakpoint(600)).toBe(600);
			expect(mapper.nearestBreakpoint(601)).toBe(600);

			expect(mapper.nearestBreakpoint(768)).toBe(768);
			expect(mapper.nearestBreakpoint(769)).toBe(768);

			expect(mapper.nearestBreakpoint(962)).toBe(962);
			expect(mapper.nearestBreakpoint(963)).toBe(962);
		});

		it('should adjust tile size css styles according to map', () => {

			// we have to put the entire card under test in order to have proper card 'state'
			let $testArea = specHelper.setupTest("tileGrid_es_MX", trendingCardModel, "es_MX");
			let mapper = new BreakpointTileSizeMapper();

			let tiles = $testArea.find('.tile-item');
			expect(tiles.length).toBe(4);

			// validate the tiles have no pre-defined size styles
			let sizeClasses = mapper.getSizeClasses();
			for (let tileIndex = 0; tileIndex < 4; tileIndex++) {
				let $tile = $(tiles[tileIndex]);
				expect(tileHasAnyClasses($tile, sizeClasses)).toBeFalsy(`tile ${tileIndex} should not have any size classes`);
			}

			mapper.BREAKPOINT_TO_SIZE_MAP = {
				"360": "AB",
			};
			mapper.adjustTileSizes(360, tiles);

			// now see if our mapper is adjusting sizes the way we expect

			expect($(tiles[0]).hasClass('one-by-one')).toBeTruthy('tile should have 1x1 after adjustment');
			expect($(tiles[1]).hasClass('two-by-one')).toBeTruthy('tile should have 2x1 after adjustment');

			// since there were only two sizes in the size map, it should repeat for additional tiles

			expect($(tiles[2]).hasClass('one-by-one')).toBeTruthy('tile should have 1x1 after adjustment');
			expect($(tiles[3]).hasClass('two-by-one')).toBeTruthy('tile should have 2x1 after adjustment');

		});

		it('should return size classes and breakpoints', () => {

			let mapper = new BreakpointTileSizeMapper();

			let sizes = mapper.getSizeClasses();
			let testSizes = ['one-by-one', 'two-by-one', 'two-by-two', 'three-by-two'];

			expect(JSON.stringify(sizes, null, 4)).toBe(JSON.stringify(testSizes, null, 4), 'size classes should match');

			let breakpoints = mapper.getBreakpoints();
			let testBreakpoints = ['250', '360', '480', '600', '768', '962'];

			expect(JSON.stringify(breakpoints, null, 4)).toBe(JSON.stringify(testBreakpoints, null, 4), 'breakpoints should match');

		});
	});

	describe('Card/Tile Grid Controller', () => {

		it('should adjust tiles sizes and container width (trending)', () => {

			// using the card template so we get the proper card 'state'
			let $testArea = specHelper.setupTest("card_es_MX", { card: trendingCardModel }, "es_MX");
			tileGridController.initialize(false);		// we init with false because we're handing the onReady

			let mapper = tileGridController.getMapper();
			spyOn(mapper, 'adjustTileSizes').and.callThrough();

			let tiles = $testArea.find('.tile-item');

			// validate the tiles have no pre-defined size styles
			let sizeClasses = mapper.getSizeClasses();
			expect(tileHasAnyClasses($(tiles[0]), sizeClasses)).toBeFalsy(`tile should not have any size classes`);

			tileGridController.onReady();

			let breakpoint = tileGridController.getCurrentBreakpoint();
			let sizes = mapper.BREAKPOINT_TO_SIZE_MAP[breakpoint];
			let size = sizes.charAt(0);
			let className = mapper.TILE_SIZE_TO_CLASS_NAME_MAP[size];

			expect(mapper.adjustTileSizes.calls.count()).toBe(1, 'adjustTileSizes should be called once');

			// validate the sizes as defined by the mock file (baseline)
			expect($(tiles[0]).hasClass(className)).toBeTruthy(`first tile should have ${className} as defined by mapper`);

			let $outerContainer = $testArea.find('.tile-grid-width-container');
			expect($outerContainer.width()).toBe(breakpoint, 'width should be breakpoint');

		});

		it('should set orange icon on initial load for the tile with its id in the favorite cookie', () => {

			let $testArea = specHelper.setupTest("tileGrid_es_MX", trendingCardModel, "es_MX");
			CookieUtils.setCookie("watchlist", "200000000");	// using short ad id to be compatible with RUI

			let tiles = $testArea.find('.tile-item');

			tileGridController.initialize(false);		// we init with false because we're handing the onReady

			expect($(tiles[1]).find('.icon-heart-orange').length).toBeTruthy(`favorited cookie tile should have orange icon`);

		});

		it('should get more items visible when clicking on view more (trending)', () => {

			let tilesShown = ($tiles) => {
				let shown = 0;
				for (let i = 0; i < $tiles.length; i++) {
					let $tile = $($tiles[i]);
					if ($tile.css('display') === 'block') {
						shown++;
					}
				}
				return shown;
			};

			let model = {
				card: trendingCardModel
			};

			specHelper.registerMockAjax('/api/locate/locationlatlong', locResponse);
			// spyOn(tileGridController, '_redirectToSearch').and.callStub();

			// using the card template so we get the proper card 'state'
			let $testArea = specHelper.setupTest("card_es_MX", model, "es_MX");

			tileGridController.initialize(false);		// we init with false because we're handing the onReady
			tileGridController.onReady();

			let numShownInitially = model.card.config.viewMoreFilterIncrement;
			expect(numShownInitially).toBe(2, 'should have config.viewMoreFilterIncrement value');

			let tiles = $testArea.find('.tile-item');
			expect(tiles.length).toBe(model.card.ads.length, 'should have all tiles loaded');

			let shown = tilesShown(tiles);
			expect(shown).toBe(numShownInitially, 'should have tiles shown initially');

			let $viewMore = $testArea.find('.card-view-more .link');
			expect($viewMore.length).toBe(1, 'should have a view more link');
			$viewMore[0].click();

			shown = tilesShown(tiles);
			expect(shown).toBe(numShownInitially * 2, 'should have more tiles shown after clicking view more');

			// another click throws us into a redirect pattern
			$viewMore[0].click();
			// expect(tileGridController._redirectToSearch.calls.count()).toBe(1, 'should have called _redirectToSearch');

		});


	});
});
