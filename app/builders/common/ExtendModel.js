'use strict';

let  util = require('util');
let  BasePageModel = require('./BasePageModel');

/**
 * @description
 * @constructor
 */
let  ExtendModel = function(req, res) {
	BasePageModel.call(this, req, res);
};

util.inherits(ExtendModel, BasePageModel);

ExtendModel.prototype.getFullName = function() {
	return 'Anton Ganeshlingam';
};

ExtendModel.prototype.getAddress = function() {
	return '123 Camino de Ceri, Santa Cruz, CA';
};


module.exports = ExtendModel;

