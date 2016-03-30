"use strict";

var util = require("util");
var BasePageModel = require("./BasePageModel");

/** 
 * @description
 * @constructor
 */
var ExtendModel = function (req, res) {
	BasePageModel.call(this, req, res);
};

util.inherits(ExtendModel, BasePageModel);

ExtendModel.prototype.getFullName = function() {
	return "Anton Ganeshlingam";
};

ExtendModel.prototype.getAddress = function() {
	return "123 Camino de Ceri, Santa Cruz, CA";
};

	
module.exports = ExtendModel;

