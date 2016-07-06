'use strict';

let BasePageModel = require('./BasePageModel');

/**
 * @description
 * @constructor
 */
class ExtendModel extends BasePageModel {
	constructor(req, res) {
		super(this, req, res);
	}

	getFullName() {
		return 'Anton Ganeshlingam';
	}

	getAddress() {
		return '123 Camino de Ceri, Santa Cruz, CA';
	}

}


module.exports = ExtendModel;

