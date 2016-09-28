'use strict';

let urlPattern = require("url-pattern");
let onResponse = require('on-response');

let cwd = process.cwd();
let metrics = require(cwd + '/server/utils/monitor/metrics');
let graphiteService = require(cwd + '/server/utils/graphite');
let requestsInProcess = 0;


// check if it is an App resource request
let isResourceReq = (req) => {
	// set url pattern object
	let urlPttrn = new urlPattern(/\.(gif|jpg|jpeg|tiff|png|svg|js|css|txt)$/i, ['ext']);

	// match the url pattern
	let matchedImageExt = urlPttrn.match(req.originalUrl);
	if(matchedImageExt) {
		return true;
	}
	return false;
};


module.exports = function(loggingEnabled) {
	return function(req, res, next) {
		res.startingTime = Date.now();

		// Metrics On Request
		requestsInProcess += 1;
		metrics.requestsReceived += 1;
		if (req.headers.cookie) {
			metrics.cookielen.update(req.headers.cookie.length);
		}
		if (req.headers['content-length']) {
			metrics.requestBody.update(parseInt(req.headers['content-length'], 10));
		}
		metrics.maxConcurrentRequests = Math.max(metrics.maxConcurrentRequests, requestsInProcess);

		onResponse(req, res, function(err, summary) {
			if (loggingEnabled === false) {
				return;
			}
			if (isResourceReq(req)) {
				return;
			}

			let pagetype = req.app.locals.pagetype;
			let country = res.locals.config.country;
			let status = parseInt(res.statusCode);

			let responseTime = summary.response.time;
			let requestSize = (typeof summary.request.size !== 'undefined') ? summary.request.size : 0;
			let responseSize = (typeof summary.response.size !== 'undefined') ? summary.response.size : 0;

			// Metrics On Response
			requestsInProcess -= 1;
			if (req.session) {
				let sessSize = JSON.stringify(req.session).length;
				metrics.sessionSize = Math.max(metrics.sessionSize, sessSize);
			}
			metrics.urltime.update(Date.now() - res.startingTime);
			if (status >= 200 && status <= 299) {
				metrics.http2XX += 1;
			} else if (status >= 300 && status <= 399) {
				metrics.http3XX += 1;
			} else if (status >= 400 && status <= 499) {
				metrics.eps += 1;
				metrics.http4XX += 1;
			} else if (status >= 500 && status <= 599) {
				metrics.eps += 1;
				metrics.http5XX += 1;
			} else {
				metrics.eps += 1;
			}

			// Send Response Metrics to Graphite Server
			graphiteService.sendMetricsForPage(country, pagetype, 'request.requestSize', requestSize);
			graphiteService.sendMetricsForPage(country, pagetype, 'response.responseTime', responseTime);
			graphiteService.sendMetricsForPage(country, pagetype, 'response.responseSize', responseSize);
			graphiteService.sendMetricsForPage(country, pagetype, 'response.statusCode', res.statusCode);
		});

		next();
	};
};
