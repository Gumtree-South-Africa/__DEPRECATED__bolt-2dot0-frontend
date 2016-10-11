'use strict';

// let bapiService      = require("./bapi/bapiService");
let Q = require('q');

class ActivateEmailService {
	sendActivationEmail(activationParams) {
		//TODO: wire this up to SMTP service
		//TODO: loginhack
		return Q.fcall(() => {
			console.warn(`/activate/${activationParams.emailAddress}?activationCode=${activationParams.activationCode}&redirect=${activationParams.redirectUrl}`);
			return;
		});
	}
}

module.exports = new ActivateEmailService();
