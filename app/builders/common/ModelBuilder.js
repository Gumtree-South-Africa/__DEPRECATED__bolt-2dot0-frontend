"use strict";

var async = require("async");
var Q = require("q");
var _ = require("underscore");

/**
 * @description A class that Handles the Page Model
 * @param [{Object}]} arrFunctions List of functions to be executed
 * @constructor
 */
var ModelBuilder = function (listFn, finalFunction) {
	// Logger.log("*** CREATING MODEL....");
	this.data = {};

	if (typeof listFn !== "undefined" && listFn instanceof Array) {
		this.setCallsList(listFn);
	}

	// If there is a final function to be executed, prepare it
	if (typeof finalFunction === "function") {
		if (finalFunction.length >= 2) {
			this.finalFunction = function (origData, promiseObj) {
				finalFunction(origData, promiseObj);
			};
		} else {
			throw "PageModel: The Final function must have at least 2 arguments." +
			" The second one being a premise to be resolved";
		}
	}

};


// *** PUBLIC METHODS ***
ModelBuilder.prototype = {

	/**
	 * @method setCallsList
	 * @description Sets the list (array) of function calls
	 * @param [{Object}]} arrFunctions List of functions to be executed
	 * @public
	 */
	setCallsList: function (arrFunctions) {
		this.arrFunctions = arrFunctions;
	},

	/**
	 * @method convertCallsToList
	 * @description Converts a JSON object with function calls to a list of calls
	 * @param {Object} objFunctions JSON with the key/value pairs, the value
	 *     being the functions to be executed.
	 * @public
	 */
	convertCallsToList: function (objFunctions) {

		if (typeof objFunctions === "object") {
			for (var key in objFunctions) {
				if (objFunctions.hasOwnProperty(key)) {
					this.arrFunctions.push(objFunctions[key]);
				}
			}
		}
	},

	/**
	 * @method processFinalFunction
	 * @description Process a final function to be executed, if any.
	 * @public
	 */
	processFinalFunction: function () {
		var deferredObj = Q.defer();

		if (this.finalFunction) {
			this.finalFunction(this, deferredObj);
		} else {
			deferredObj.resolve(this);
		}

		return deferredObj.promise;
	},

	/**
	 * @method checkForFinalFunction
	 * @description Checks if there is a final function to be executed and resolves
	 *     the corresponding promise.
	 * @param {Object} deferredObj Promise to resolve when executing this method.
	 * @public
	 */
	checkForFinalFunction: function (deferredObj) {
		var _this = this;

		// For the success case, resolve the promise
		function resolvePromise(data) {
			if (typeof data !== "undefined" && data && !_.isEmpty(data)) {
				_this.data = data;
			}

			// Expose this via resolved promise
			deferredObj.resolve(_this.data);
		}

		// For the error case reject the promise
		function rejectPromise(data) {
			// Don't do anything with the data in the final function
			// And resolve the promise with the existing data
			// Expose this via resolved promise
			deferredObj.resolve(_this.data);
		}

		// If there is a final function, execute it.
		if (_this.finalFunction) {
			Q(_this.processFinalFunction())
				.then(resolvePromise)
				.fail(rejectPromise);
		} else {
			resolvePromise();
		}
	},

	/**
	 * @method getDoneFunction
	 * @description Returns a function that is used as a final callback to be
	 *     executed when the list of functions is executed.
	 * @public
	 * @return {Function}
	 */
	getDoneFunction: function (deferred) {
		var _this = this,
			done = function (err, result) {
				if (!deferred) {
					return;
				}
				if (err) {
					// Logger.log("Error found! ==> ", err);

					// Expose this via rejected promise
					deferred.reject(new Error(err));
				} else {
					_this.data = result;
					_this.checkForFinalFunction(deferred);
				}
			};

		return done;
	},

	/**
	 * @method processWaterfall
	 * @description Process functions in a sequencial dependency way
	 * @public
	 */
	processWaterfall: function () {
		var deferred = Q.defer(),
			done = this.getDoneFunction(deferred);
		// Calls the function one after another
		async.waterfall(this.arrFunctions, done);

		// Return a promise
		return deferred.promise;
	},

	/**
	 * @method processParallel
	 * @description Process functions in a parallel way.
	 * @public
	 */
	processParallel: function () {
		var deferred = Q.defer(),
			done = this.getDoneFunction(deferred);
		// Calls the functions in parallel
		async.parallel(this.arrFunctions, done);

		// Return a promise
		return deferred.promise;
	},

	/**
	 * @method processSeries
	 * @description Process functions in sequency.
	 * @public
	 */
	processSeries: function () {
		var deferred = Q.defer(),
			done = this.getDoneFunction(deferred);
		// Calls the function in sequence
		async.series(this.arrFunctions, done);

		// Return a promise
		return deferred.promise;
	}

}; // End prototype


module.exports = ModelBuilder;

