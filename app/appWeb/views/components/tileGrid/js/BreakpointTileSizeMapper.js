'use strict';

let $ = require('jquery');

class BreakpointTileSizeMapper {

	constructor() {

		// breakpoints defined in increasing order
		// 16 tile patterns, logic will repeat the pattern if more tiles (increments of 16 expected)

		this.BREAKPOINT_TO_SIZE_MAP = {
			//	    1234567890123456
			/*
			"360": "CAABADABAAAABAAA",
			"480": "CBAADAABAAABAAAB",
			"600": "CBAAAADBAABACAAA",
			"769": "CBAABDAADABACAAB",
			"962": "CAAAAAAAABAACAAB"
			*/
			"360": "AAA",
			"480": "BBB",
			"600": "CCC",
			"769": "DDD",
			"962": "AAA"

		};

		this.TILE_SIZE_TO_CLASS_NAME_MAP = {
			'A': 'one-by-one',
			'B': 'one-by-two',
			'C': 'two-by-two',
			'D': 'two-by-three'
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
			let className = sizeToClassMap[sizes.charAt(sizeMapIndex)];

			let $tile = $(tiles[index]);
			for (let i = 0; i < sizeClasses.length; i++) {
				if (sizeClasses[i] != className) {
					$tile.toggleClass(sizeClasses[i], false);
				}
			}
			$tile.toggleClass(className, true);
		}
	}

	/**
	 * get size class names from the map (an array of the values)
	 * @returns {Array} of class names
	 */
	getSizeClasses() {
		let keys = Object.getOwnPropertyNames(this.TILE_SIZE_TO_CLASS_NAME_MAP);
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
		return Object.getOwnPropertyNames(this.BREAKPOINT_TO_SIZE_MAP);
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
				// console.log(`nearestBreakpoint for ${width} is ${breakpoint}`);
				return breakpoint;
			}
			min = max;
		}
		// console.log(`nearestBreakpoint is MAX ${breakpoints[breakpoints.length-1]}`);
		return Number(breakpoints[breakpoints.length-1]);
	}
}

module.exports = BreakpointTileSizeMapper;
