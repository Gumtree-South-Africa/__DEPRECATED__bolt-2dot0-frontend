'use strict';
let initFromConfig = function(config, initDefaults) {
	let ruiOptions = initDefaults;
	if (initDefaults === undefined) {
		// none specified, provide some
		ruiOptions = {
			path: "/",
			method: "",
			headers: {}
		};
	}
	// these picked up from config:
	ruiOptions.host = config.get('RUI.server.host');
	ruiOptions.port = config.get('RUI.server.port');
	ruiOptions.parameters = config.get('RUI.server.parameters');
	ruiOptions.timeout = (initDefaults !== undefined) ? (initDefaults.timeout || config.get('RUI.server.timeout')) : config.get('RUI.server.timeout');

	return ruiOptions;
};

module.exports.initFromConfig = initFromConfig;
