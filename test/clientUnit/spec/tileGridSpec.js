'use strict';

let specHelper = require('../helpers/commonSpecHelper.js');

let tileGridController = require("app/appWeb/views/components/tileGrid/js/tileGrid.js");
let tileGridModel = require('../mockData/trendingCardModel.json');
let BreakpointMap = require('app/appWeb/views/components/tileGrid/js/BreakpointMap.js');


describe('Tile Grid', () => {
	describe('Responsive Breakpoint Detection', () => {

		let $testArea;

		beforeEach(() => {
			$testArea = specHelper.setupTest("tileGrid_es_MX", tileGridModel, "es_MX");
		});

		// this test out until we can  fix the issue:
		// Can't find variable: google in /Volumes/caseSensitive/bolt-2dot0-frontend/test/clientUnit/SpecRunner.js (line 15858)

		fit('should return proper breakpoint for specified browser window width', () => {

			let breakpointMap = new BreakpointMap();
			expect(breakpointMap.nearestBreakpoint(200)).toBe(360);
			expect(breakpointMap.nearestBreakpoint(360)).toBe(360);
			expect(breakpointMap.nearestBreakpoint(361)).toBe(360);

			expect(breakpointMap.nearestBreakpoint(480)).toBe(480);
			expect(breakpointMap.nearestBreakpoint(481)).toBe(480);

			expect(breakpointMap.nearestBreakpoint(600)).toBe(600);
			expect(breakpointMap.nearestBreakpoint(601)).toBe(600);

			expect(breakpointMap.nearestBreakpoint(769)).toBe(769);
			expect(breakpointMap.nearestBreakpoint(770)).toBe(769);

			expect(breakpointMap.nearestBreakpoint(962)).toBe(962);
			expect(breakpointMap.nearestBreakpoint(963)).toBe(962);

			tileGridController.initialize();
			
			expect($testArea.find('.tile-item').length).toBe(4);

			// console.log("done");
		});

	});
});
