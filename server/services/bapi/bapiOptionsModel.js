'use strict';
var initFromConfig = function(config, initDefaults) {
	var bapiOptions = initDefaults;
	if (initDefaults === undefined) {
		// none specified, provide some
		bapiOptions = {
			path: "/",
			method: "",
			headers: {}
		}
	}
	// these picked up from config:
	bapiOptions.host = config.get('BAPI.server.host');
	bapiOptions.port = config.get('BAPI.server.port');
	bapiOptions.parameters = config.get('BAPI.server.parameters');
	bapiOptions.timeout = (bapiOptions.timeout !== undefined) ? bapiOptions.timeout : config.get('BAPI.server.timeout');

	return bapiOptions;
};

module.exports.initFromConfig = initFromConfig;
