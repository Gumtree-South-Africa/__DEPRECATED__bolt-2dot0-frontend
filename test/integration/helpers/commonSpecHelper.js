'use strict';

const baseUrl = browser.params.baseUrl;

module.exports.getBaseUrl = () => {
	return baseUrl;
};

module.exports.loadApp = () => {
	return browser.get(baseUrl);
};

