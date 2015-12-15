"use strict";

var url = require("url");
var parse = require("url-parse");

var BAPIUrl = {};

(function () {
	/**
	 * @method isURLFormat
	 * @description Determines if a string has a valid URL format
	 * @public
	 * @return {Boolean}
	 */
	function isURLFormat(str) {
	  return /^((https?|s?ftp):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(str);
	}

	function isPathFormat(str) {
		return true;
	  // return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(/[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i.test(str);
	}

	/** 
	 * @description A class that Handles Page Model
	 * @param [{Object}]} arrFunctions List of functions to be executed
	 * @constructor
	 */
	BAPIUrl = function(req) {
		var scope = this;

		this.fullUrl = {};

		this.parsedObj = {};

		this.req = req || {};

		try {
			if (typeof req === "undefined" || !req) {
				throw "BAPIUrl: Need to specify a request object";
			}

			if (typeof req === "string") {
				this.fullUrl = req;
			}

			if (typeof req === "object") {
				this.fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
			}

			if (isURLFormat(this.fullUrl)) {
				this.parsedObj = parse(this.fullUrl);
			} else if (isPathFormat(this.fullUrl)) {
				scope.parsedObj = {
					query : scope.fullUrl
				};
				scope.req = {
					url: scope.fullUrl
				};
			}

			/*
			console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
			console.log("url: " + this.getUrl());

			console.log("fullurl : " + this.getFullURL());

			console.log("query string: " + this.getQueryString());

			console.log("host name: " + this.getHostName());

			console.log("protocol: " + this.getProtocol());

			console.log("path levels:");
			console.log(this.getPathComponentLevelList());
			console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
			*/
		} catch (e) {
			console.log("Invalid call to BAPIUrl!");
			console.log(e);
		}
	};

	// *** PUBLIC METHODS ***
	BAPIUrl.prototype = {
		/**
	 	 * @method getUrl
	 	 * @description
	 	 * @public
	 	 * @return {String}
	 	 */
		getUrl : function () {
			return this.req.url || "";
		},

		/**
	 	 * @method getFullURL
	 	 * @description
	 	 * @public
	 	 * @return {String}
	 	 */
		getFullURL : function () {
			return this.fullUrl;
		},

		/**
	 	 * @method getQueryString
	 	 * @description
	 	 * @public
	 	 * @return {String}
	 	 */
		getQueryString : function () {
			return this.parsedObj.query || "";
		},

		/**
	 	 * @method getHostName
	 	 * @description
	 	 * @public
	 	 * @return {String}
	 	 */
		getHostName : function () {
			return this.parsedObj.hostname || "";
		},

		/**
	 	 * @method getProtocol
	 	 * @description
	 	 * @public
	 	 * @return {String}
	 	 */
		getProtocol : function () { 
			return this.parsedObj.protocol || "";
		},


		/**
	 	 * @method getPathComponentLevelList
	 	 * @description Gets an array with all the path component level list, e.g.,
	 	 *     if the input is: http://www.gumtree.co.za/s-all-the-ads/v1b0p1
	 	 *     then the returned list is: ["s-all-the-ads", "v1b0p1"]
	 	 * @public
	 	 * @return [{String}]
	 	 */
		getPathComponentLevelList : function () {
			var queryStr = this.parsedObj.query,
				compList = [];

			if (queryStr === "" || /^\s+$/.test(queryStr)) {
				return [];
			}

			compList = queryStr.split("/") || [];

			// Remove the first element in the array if empty
			if (compList.length &&  compList[0] === "") {
				compList.shift();
			}

			return compList;
		}

	}; // End prototype

})();

module.exports = BAPIUrl;

