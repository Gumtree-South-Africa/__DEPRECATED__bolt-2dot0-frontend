'use strict';

let config = require('config');
let proxy = require('http-proxy-middleware');
let stream = require('stream');

function prepareBodyString(req) {
	if (!req.headers) {
		return null;
	}
	let contentType = req.headers['content-type'];
	let rawString = null;
	if (contentType === 'application/x-www-form-urlencoded') {
		let values = [];
		Object.keys(req.body).forEach((key) => {
			values.push(encodeURIComponent(key) + '=' + encodeURIComponent(req.body[key].toString()));
		});
		rawString = values.join('&');
	} else if (contentType === 'application/json') {
		rawString = JSON.stringify(req.body);
	}

	return rawString;
}

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
	let defaultTarget = 'https://' + ruiProxyConfig.domainBase;
	if (!isNaN(ruiProxyConfig.port)) {
		defaultTarget += ':' + ruiProxyConfig.port;
	}
	let proxyMiddlewareConfig = {
		target: defaultTarget,
		changeOrigin: true,
		xfwd: true,
		autoRewrite: true,
		cookieDomainRewrite: '',
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

			let target = ((req.connection && req.connection.encrypted) ? 'https' : 'http') + '://' + ruiDomain + '.'
				+ ruiProxyConfig.domainBase;
			if (!isNaN(ruiProxyConfig.port)) {
				target += ':' + ruiProxyConfig.port;
			}
			return target;
		}
	};
	if (ruiProxyConfig.basePath) {
		proxyMiddlewareConfig.pathRewrite = {
			'^/': ruiProxyConfig.basePath
		};
	}

	let proxyMiddleware = proxy(proxyMiddlewareConfig);

	return (req, res, next) => {
		let originalPipe = null;
		let originalLength = null;
		if (req.method === 'POST') {
			// As stream of request has been consumed by body-parser, we need to reconstruct it
			let bodyString = prepareBodyString(req);
			if (bodyString) {
				originalPipe = req.pipe;
				originalLength = req.headers && req.headers['content-length'];

				let bodyBuffer = new Buffer(bodyString, 'utf-8');
				let bodyStream = new stream.PassThrough();
				bodyStream.end(bodyBuffer);
				req.pipe = (stream) => bodyStream.pipe(stream);
				if (req.headers) {
					req.headers['content-length'] = bodyBuffer.length;
				}
			}
		}
		proxyMiddleware(req, res, () => {
			if (originalPipe) {
				req.pipe = originalPipe;
				if (req.headers) {
					req.headers['content-length'] = originalLength;
				}
			}
			next();
		});
	};
};
