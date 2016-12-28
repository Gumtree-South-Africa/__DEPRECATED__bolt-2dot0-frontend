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

	let configHost = config.get('RUI.server.host');
	let configUseBasedomainsuffix = config.get('RUI.server.useBasedomainsuffix');
	if (configUseBasedomainsuffix === true) {
		ruiOptions.hostname = ruiOptions.hostname + ruiOptions.replyBasedomainSuffix;
	} else {
		if (configHost !== '') {
			ruiOptions.hostname = ruiOptions.hostname + '.' + configHost;
		}
	}

	ruiOptions.protocol = config.get('RUI.server.protocol');
	ruiOptions.port = config.get('RUI.server.port');
	ruiOptions.parameters = config.get('RUI.server.parameters');
	ruiOptions.timeout = (ruiOptions.timeout !== undefined) ? ruiOptions.timeout : config.get('RUI.server.timeout');
	ruiOptions.useProxy = config.get('RUI.server.useProxy');

	ruiOptions.rejectUnauthorized = false;

	return ruiOptions;
};

module.exports.initFromConfig = initFromConfig;
