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

	ruiOptions.host = 'www.' + ruiOptions.replyHost;

	let configHost = config.get('RUI.server.host');
	let configUseBasedomainsuffix = config.get('RUI.server.useBasedomainsuffix');
	if (configUseBasedomainsuffix === true) {
		ruiOptions.host = ruiOptions.host + ruiOptions.replyBasedomainSuffix;
	} else {
		if (configHost !== '') {
			ruiOptions.host = ruiOptions.host + '.' + configHost;
		}
	}

	ruiOptions.protocol = config.get('RUI.server.protocol');
	ruiOptions.port = config.get('RUI.server.port');
	ruiOptions.parameters = config.get('RUI.server.parameters');
	ruiOptions.timeout = (ruiOptions !== undefined) ? (ruiOptions.timeout || config.get('RUI.server.timeout')) : config.get('RUI.server.timeout');

	ruiOptions.rejectUnauthorized = false;

	console.log('RUIOPTIONS!!!!!!!!!!!!!----------', ruiOptions);
	return ruiOptions;
};

module.exports.initFromConfig = initFromConfig;
