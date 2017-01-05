'use strict';
let initFromConfig = function(config, initDefaults) {
	let ruiOptions = initDefaults;
	if (initDefaults === undefined) {
		// none specified, provide some
		ruiOptions = {
			path: '/',
			method: '',
			headers: {},
			replyHost: '',
			replyBasedomainSuffix: ''
		};
	}

	ruiOptions.hostname = 'www.' + ruiOptions.replyHost;

	let configServer = config.get('RUI.server');
	if (typeof configServer !== 'undefined') {
		let configHost = configServer.host;
		let configUseBasedomainsuffix = configServer.useBasedomainsuffix;
		if (configUseBasedomainsuffix === true) {
			ruiOptions.hostname = ruiOptions.hostname + ruiOptions.replyBasedomainSuffix;
		} else {
			if (configHost !== '') {
				ruiOptions.hostname = ruiOptions.hostname + '.' + configHost;
			}
		}

		ruiOptions.protocol = configServer.protocol;
		ruiOptions.port = configServer.port;
		ruiOptions.parameters = configServer.parameters;
		ruiOptions.timeout = ruiOptions.timeout !== undefined ? ruiOptions.timeout : configServer.timeout;
		ruiOptions.useProxy = typeof configServer.useProxy !== 'undefined' ? config.get('RUI.server.useProxy') : false;

		ruiOptions.rejectUnauthorized = false;
	}

	return ruiOptions;
};

module.exports.initFromConfig = initFromConfig;
