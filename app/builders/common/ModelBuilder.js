"use strict";

var async = require("async");
var Q = require("q");
var _ = require("underscore");
// var Logger = require("../models/utils/Logger");

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
	setCallsList : function (arrFunctions) {
		this.arrFunctions = arrFunctions;
	},

	/**
 	 * @method convertCallsToList
 	 * @description Converts a JSON object with function calls to a list of calls
 	 * @param {Object} objFunctions JSON with the key/value pairs, the value
 	 *     being the functions to be executed. 
 	 * @public
 	 */
	convertCallsToList  : function (objFunctions) {
		var self = this;

		if (typeof objFunctions === "object") {
	    	for (var key in objFunctions) {
	        	if (objFunctions.hasOwnProperty(key)){
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
		var self = this,
			deferredObj = Q.defer(),
			finalData = self.data;

		if (self.finalFunction) {
			self.finalFunction(finalData, deferredObj);
		} else {
			deferredObj.resolve(finalData);
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
	checkForFinalFunction : function (deferredObj) {
		var self = this;

		// For the success case, resolve the promise
		function resolvePromise(data) {
			if (typeof data !== "undefined" && data && !_.isEmpty(data)) {
				self.data = data;
			}
			
			// Expose this via resolved promise
			deferredObj.resolve(self.data);
		}

		// For the error case reject the promise
		function rejectPromise(data) {
			// Don't do anything with the data in the final function
			// And resolve the promise with the existing data
			// Expose this via resolved promise
			deferredObj.resolve(self.data);
		}

		// If there is a final function, execute it.
		if (self.finalFunction) {
			Q(self.processFinalFunction())
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
	getDoneFunction : function (deferred) {
		var self = this,
			done = function (err, result) {
				if (!deferred) {
					return;
				}
				if (err) {
					 // Logger.log("Error found! ==> ", err);

					 // Expose this via rejected promise
					 deferred.reject(new Error(err));
				} else {
					self.data = result;
					self.checkForFinalFunction(deferred);
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
		var self = this,
			deferred = Q.defer(),
			done = self.getDoneFunction(deferred);
		// Calls the function one after another
		async.waterfall(self.arrFunctions, done);

		// Return a promise
		return deferred.promise;
	},

	/**
 	 * @method processParallel
 	 * @description Process functions in a parallel way.
 	 * @public
 	 */
	processParallel : function () {
		var self = this,
			deferred = Q.defer(),
			done = self.getDoneFunction(deferred); 
		// Calls the functions in parallel
	    async.parallel(self.arrFunctions, done);

		// Return a promise
		return deferred.promise;
	},

	/**
 	 * @method processSeries
 	 * @description Process functions in sequency.
 	 * @public
 	 */
	processSeries : function () {
		var self = this,
			deferred = Q.defer(),
			done = self.getDoneFunction(deferred);
		// Calls the function in sequence
	    async.series(self.arrFunctions, done);

		// Return a promise
		return deferred.promise;
	}

}; // End prototype


module.exports = ModelBuilder;

