'use strict';

class BreakpointMap {

	constructor() {
		this.breakpointToSizeMap = {};
		// breakpoints defined in increasing order
		// 16 tile patterns, logic will repeat the pattern if more tiles (increments of 16 expected)

		this.breakpointToSizeMap = {
			//	    1234567890123456
			"360": "AAAAADABAAAABAAA",
			"480": "BBBBDAABAAABAAAB",
			"600": "CCCCAADBAABACAAA",
			"769": "DDDDBDAADABACAAB",
			"962": "AAAAAAAAABAACAAB"
		};

		this.TILE_SIZE_CLASSES_MAP = {
			'A': 'one-by-one',
			'B': 'one-by-two',
			'C': 'two-by-two',
			'D': 'two-by-three'
		};

		this.breakpoints = Object.getOwnPropertyNames(this.breakpointToSizeMap);
	}

	/**
	 * get size class names from the map
	 * @returns {Array} of class names
	 */
	getSizeClasses() {
		let keys = Object.getOwnPropertyNames(this.TILE_SIZE_CLASSES_MAP);
		let values = [];
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			values.push(this.TILE_SIZE_CLASSES_MAP[key]);
		}
		return values;
	}

	/**
	 * get current breakpoint from list based on width passed
	 * @param width
	 * @returns {number} the breakpoint value
	 */
	nearestBreakpoint(width) {
		let min = 0;
		// run thru the breakpoints (assumed to be in increasing order), pick of the best match to width specified
		for (let i = 0; i < this.breakpoints.length; i++) {
			let max = Number(this.breakpoints[i]);
			let breakpoint = min === 0 ? max : min;	// if we're between zero and the max, use max, otherwise use min
			if (width >= min && width < max) {
				// console.log(`nearestBreakpoint for ${width} is ${breakpoint}`);
				return breakpoint;
			}
			min = max;
		}
		// console.log(`nearestBreakpoint is MAX ${this.breakpoints[this.breakpoints.length-1]}`);
		return Number(this.breakpoints[this.breakpoints.length-1]);
	}
}

module.exports = BreakpointMap;
