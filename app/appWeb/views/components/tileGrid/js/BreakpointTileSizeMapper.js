'use strict';

let $ = require('jquery');

class BreakpointTileSizeMapper {

	constructor() {

		// breakpoints defined in increasing order
		// 16 tile patterns, logic will repeat the pattern if more tiles (increments of 16 expected)

		this.BREAKPOINT_TO_SIZE_MAP = {
			//	    1234567890123456
			"250": "CAABAACAABAABAAB",	// breakpoint added because less than 360 we cannot have any D's (they are too wide)
			"360": "CAABABAABBACAABA",
			"480": "AAAABAABAABBCBAA",
			"600": "BACAAABACABCBAAB",
			"768": "CBAABCBBBCAABCBB",
			"962": "CAAAABAACAAABAAA"
			//	    1234567890123456
		/*
			// use these for visual testing of breakpoints
			"360": "AAA",
			"480": "BBB",
			"600": "CCC",
			"769": "DDD",
			"962": "AAA"
		*/
		};

		this.TILE_SIZE_TO_CLASS_NAME_MAP = {
			'A': 'one-by-one',
			'B': 'two-by-one',
			'C': 'two-by-two',
			'D': 'three-by-two'
		};

	}

	adjustTileSizes(breakpoint, tiles) {
		// ex: sizeClasses = ['one-by-one', ...
		let sizeClasses = this.getSizeClasses();
		// ex: sizes = 'ABCDABCD...'
		let sizes = this.BREAKPOINT_TO_SIZE_MAP[breakpoint];
		// ex: sizeToClassMap = { 'A': 'one-by-one', ...
		let sizeToClassMap = this.TILE_SIZE_TO_CLASS_NAME_MAP;

		for (let index = 0; index < tiles.length; index++) {

			// lookup our size in terms of A,B,C,D - wrap index to repeat the pattern for more tiles than we have in the map
			let  sizeMapIndex = index % sizes.length;
			let sizeChar = sizes.charAt(sizeMapIndex);
			let className = sizeToClassMap[sizeChar];

			let $tile = $(tiles[index]);
			for (let i = 0; i < sizeClasses.length; i++) {
				if (sizeClasses[i] !== className) {
					$tile.toggleClass(sizeClasses[i], false);
				}
			}
			$tile.toggleClass(className, true);

			// for debugging, add a label with index and size
			if (location.hash === "#debug-label") {
				$tile.find('.debug-label').remove();
				$tile.prepend(`<div class="debug-label" style="position: absolute;font-size: 30px;font-weight: bold;color: white; z-index: 9999; left:40px">${sizeMapIndex+1} ${sizeChar}</div>`);
			}
		}
	}

	/**
	 * get size class names from the map (an array of the values)
	 * @returns {Array} of class names
	 */
	getSizeClasses() {
		let keys = Object.keys(this.TILE_SIZE_TO_CLASS_NAME_MAP);
		let values = [];
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			values.push(this.TILE_SIZE_TO_CLASS_NAME_MAP[key]);
		}
		return values;
	}

	/**
	 * get breakpoints from the map (an array of the keys)
	 * @returns {Array} of breakpoints
	 */
	getBreakpoints() {
		return Object.keys(this.BREAKPOINT_TO_SIZE_MAP);
	}

	/**
	 * get current breakpoint from list based on width passed
	 * @param width
	 * @returns {number} the breakpoint value
	 */
	nearestBreakpoint(width) {
		let min = 0;
		let breakpoints = this.getBreakpoints();
		// run thru the breakpoints (assumed to be in increasing order), pick of the best match to width specified
		for (let i = 0; i < breakpoints.length; i++) {
			let max = Number(breakpoints[i]);
			let breakpoint = min === 0 ? max : min;	// if we're between zero and the max, use max, otherwise use min
			if (width >= min && width < max) {
				return breakpoint;
			}
			min = max;
		}
		return Number(breakpoints[breakpoints.length-1]);
	}
}

module.exports = BreakpointTileSizeMapper;
