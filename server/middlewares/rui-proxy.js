'use strict';

let config = require('config');
let proxy = require('http-proxy-middleware');

/**
 * A proxy to access RUI server, which will help developer to access BOLT 1.0 and 2.0 under same site.
 * THIS MIDDLEWARE SHOULD ONLY BE ADDED WHEN IN DEV MODE!
 *
 * To use that, a piece of configuration should be set in xxx.json in server/config
 * Here is a sample:
 * "devFeatures": {
 *     "ruiProxy": {
 *         "domainBase": "sharon-fp003-4464.slc01.dev.ebayc3.com",
 *         "port": 443
 *     }
 * }
 */
module.exports = function(app) {
	if (!app.locals.devMode) {
		// A guard from misuse
		return null;
	}

	let ruiProxyConfig = null;
	try {
		ruiProxyConfig = config.get('devFeatures.ruiProxy');
	} catch(e) {
		// It's OK to not having this config
	}

	if (!ruiProxyConfig || !ruiProxyConfig.domainBase) {
		return null;
	}

	// By default, we will use HTTPS no matter what protocol for current site
	let ruiPort = ruiProxyConfig.port || 443;
	let defaultTarget = `https://${ruiProxyConfig.domainBase}:${ruiPort}`;
	let proxyMiddlewareConfig = {
		target: defaultTarget,
		changeOrigin: true,
		xfwd: true,
		autoRewrite: true,
		// Don't verify SSL as it's develop mode
		secure: false,
		router: (req) => {
			let hostname = req.vhost && req.vhost.hostname;
			if (!hostname) {
				return defaultTarget;
			}
			let configHostname = app.locals.config.hostname;
			let hostnameIndex = hostname.indexOf(configHostname);
			if (hostnameIndex < 0) {
				return defaultTarget;
			}
			let ruiDomain = hostname.substring(0, hostnameIndex + configHostname.length);
			return `https://${ruiDomain}.${ruiProxyConfig.domainBase}:${ruiPort}`;
		}
	};
	if (ruiProxyConfig.basePath) {
		proxyMiddlewareConfig.pathRewrite = {
			'^/': ruiProxyConfig.basePath
		};
	}
	return proxy(proxyMiddlewareConfig);
};
