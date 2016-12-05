'use strict';

let specHelper = require('../helpers/commonSpecHelper.js');

let tileGridController = require("app/appWeb/views/components/tileGrid/js/tileGrid.js");
let trendingCardModel = require('../mockData/trendingCardModel.json');
let galleryCardModel = require('../mockData/galleryCardModel.json');
let galleryCardModelNoMore = require('../mockData/galleryCardModel-noMore.json');
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

	afterEach(() => {
		CookieUtils.setCookie("watchlist", "");	// clear the watchlist cookies
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
			let $testArea = specHelper.setupTest("tileGrid_es_MX", { tileGrid: trendingCardModel }, "es_MX");
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

		beforeEach(() => {
			// all the tileGridControllers will need this ajax
			specHelper.registerMockAjax('/rui-api/synchwatchlist/model/synch/es_MX', { error: 'test error' }, { fail: true } );
		});

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

			let $testArea = specHelper.setupTest("tileGrid_es_MX", { tileGrid: trendingCardModel }, "es_MX");
			CookieUtils.setCookie("watchlist", "200000000");	// using short ad id to be compatible with RUI

			let tiles = $testArea.find('.tile-item');

			tileGridController.initialize(false);		// we init with false because we're handing the onReady

			expect($(tiles[1]).find('.icon-heart-orange').length).toBeTruthy(`favorited cookie tile should have orange icon`);
		});

		it('should get more items visible when clicking on view more (trending)', () => {

			let model = {
				card: trendingCardModel
			};

			specHelper.registerMockAjax('/api/locate/locationlatlong', locResponse);
			spyOn(tileGridController, '_redirectToSearch').and.callFake(() => {
			});

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

			let $viewMoreButtons = $testArea.find('.card-view-more .link');
			expect($viewMoreButtons.length).toBe(1, 'should have a view more link');
			let viewMore = $viewMoreButtons[0];
			viewMore.click();

			shown = tilesShown(tiles);
			expect(shown).toBe(numShownInitially * 2, 'should have more tiles shown after clicking view more');

			// another click throws us into a redirect pattern
			viewMore.click();
			expect(tileGridController._redirectToSearch.calls.count()).toBe(1, 'should have called _redirectToSearch');

		});

		it('should get more items visible when clicking on view more, new ajax items can be favorited by cookie or click (gallery)', () => {


			let model = {
				card: galleryCardModel
			};

			specHelper.registerMockAjax(`/api/ads/gallery/card?offset=2&limit=${model.card.config.viewMorePageSize}`, galleryCardModelNoMore);
			specHelper.registerMockAjax(`/api/ads/gallery/card?offset=1&limit=${model.card.config.viewMorePageSize}`, galleryCardModel);
			specHelper.registerMockAjax('/api/ads/favorite', {} );	// empty object since we're not expecting a result
			// spyOn(tileGridController, '_redirectToSearch').and.callFake(() => {
			// });

			// using the card template so we get the proper card 'state'
			let $testArea = specHelper.setupTest("card_es_MX", model, "es_MX");

			// should be able to favorite the new tiles which are ajax'd when we View More
			// in this test, we're going to have duplicate Ids since we use the same model for the first 16, and the ajax'd 16
			CookieUtils.setCookie("watchlist", "200000000");	// using short ad id to be compatible with RUI


			tileGridController.initialize(false);		// we init with false because we're handing the onReady
			tileGridController.onReady();

			let numShownInitially = model.card.ads.length;

			let tiles = $testArea.find('.tile-item');
			expect(tiles.length).toBe(model.card.ads.length, 'should have all tiles loaded');

			let shown = tilesShown(tiles);
			expect(shown).toBe(numShownInitially, 'should have tiles shown initially');

			let $viewMoreButtons = $testArea.find('.card-view-more .link');
			expect($viewMoreButtons.length).toBe(1, 'should have a view more link');
			let viewMore = $viewMoreButtons[0];
			viewMore.click();

			// pick up the additional tiles (gallery uses ajax)
			tiles = $testArea.find('.tile-item');
			shown = tilesShown(tiles);
			expect(shown).toBe(numShownInitially * 2, 'should have more tiles shown after clicking view more');

			// make sure we have more heart buttons after View More
			let $hearts = $testArea.find('.card-galleryCard .tile-item .favorite-btn');
			expect($hearts.length).toBe(numShownInitially * 2);

			// make sure that a cookied favorite is in the right state after loading tiles via View More ajax
			// this will ensure the cookie sync occurs for the new items
			let $heartAlreadyFavorited = $($hearts[numShownInitially + 1]);	// 2nd tile of the view more
			expect ($heartAlreadyFavorited.hasClass('icon-heart-orange')).toBeTruthy('should show favorited initially because it is cookied');
			CookieUtils.setCookie("watchlist", "");		// clear for next favorite

			// make sure we are in non favorited state (no watchlist cookie for this heart)
			let $heart = $($hearts[numShownInitially]);	// 1st tile of the view more
			expect($heart.hasClass('icon-heart-gray')).toBeTruthy('should show grey heart icon initially');

			// this will ensure the favorite click handlers are loaded for the new item
			$heart.click();
			expect($heart.hasClass('icon-heart-orange')).toBeTruthy('should show orange heart icon class after first click');
			let cookieValue = CookieUtils.getCookie('watchlist');
			expect(cookieValue).toBe(`${model.card.ads[0].id}`);	// use short ad id for compatibility with RUI for the cookie

			// we can also ensure that we got multiple of the same ads favorited when they have the same Ids
			let $favorites = $testArea.find('.icon-heart-orange');
			expect($favorites.length).toBe(4);	// 1 favorite by cookie (but really 2 since duplicate ids), and 1 by click (but really 2 since dup)

			// another click should do the same thing, but since we've set 'moreDataAvailable' to false, we'll hide the button
			viewMore.click();
			expect($(viewMore).hasClass('hidden')).toBeTruthy('should have view more styled as hidden');

		});

		it('should set orange icon on initial load for the tile with its id in the favorite cookie (server sync cookie)', () => {

			let $testArea = specHelper.setupTest("tileGrid_es_MX", { tileGrid: trendingCardModel }, "es_MX");

			spyOn(tileGridController, '_serverSyncFavorites').and.callFake((success, $tiles) => {
				// simulate the side effect of the sync call and the bring down the watchlist cookie

				CookieUtils.setCookie("watchlist", "200000000");	// using short ad id to be compatible with RUI
				success($tiles);

			});

			let tiles = $testArea.find('.tile-item');

			tileGridController.initialize(false);		// we init with false because we're handing the onReady

			expect($(tiles[1]).find('.icon-heart-orange').length).toBeTruthy(`favorited cookie tile should have orange icon`);

		});

	});
});
