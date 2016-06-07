"use strict";

/**
 * @description A Singleton that logs data
 */
var Logger = {
	log: function () {
		var args = Array.prototype.slice.call(arguments),
			idx;

		for (idx = 0; idx < args.length; ++idx) {
			console.log(args[idx]);
		}
	}
};

module.exports = Logger;
