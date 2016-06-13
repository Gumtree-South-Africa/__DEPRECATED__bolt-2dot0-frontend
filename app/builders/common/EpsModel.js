"use strict";


var config = require("config");


module.exports = function () {

	return {
		"epsUploadExternalURL": config.get("eps.epsUploadExternalURL"),

		"epsToken": config.get("eps.epsToken"),

		"isEbayDirectUploadEnabled": config.get("eps.IsEbayDirectUL")
	};
};
