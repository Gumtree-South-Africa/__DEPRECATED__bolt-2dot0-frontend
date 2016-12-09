'use strict';
let initFromConfig = function(config, locale, initDefaults) {
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
	// ruiOptions.host = config.get('RUI.server.host');
	let hostname = '';

	switch (locale) {
		case 'es_MX':
			hostname = "https://www.vivanuncios.com.mx";
			break;
		case 'es_AR':
			hostname = "https://www.alamaula.com";
			break;
		case 'es_US':
			hostname = "https://www.ibazar.com";
			break;
		case 'en_ZA':
			hostname = "https://www.gumtree.co.za";
			break;
		case 'en_IE':
			hostname = "https://www.gumtree.ie";
			break;
		case 'pl_PL':
			hostname = "https://www.gumtree.pl";
			break;
		case 'en_SG':
			hostname = "https://www.gumtree.sg";
			break;
		default:
			break;
	}

	ruiOptions.host = hostname;
	ruiOptions.port = config.get('RUI.server.port');
	ruiOptions.parameters = config.get('RUI.server.parameters');
	ruiOptions.timeout = (initDefaults !== undefined) ? (initDefaults.timeout || config.get('RUI.server.timeout')) : config.get('RUI.server.timeout');

	return ruiOptions;
};

module.exports.initFromConfig = initFromConfig;
