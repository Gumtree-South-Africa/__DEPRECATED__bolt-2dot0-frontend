'use strict';


var onResponse = require('on-response');

var cwd = process.cwd();
var metrics = require(cwd + '/server/utils/monitor/metrics');
var graphiteService = require(cwd + '/server/utils/graphite');
var requestsInProcess = 0;

module.exports = function() {
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
			var pagetype = req.app.locals.pagetype;
			var country = res.locals.config.country;
			var status = parseInt(res.statusCode);

			var responseTime = summary.response.time;
			var requestSize = (typeof summary.request.size !== 'undefined') ? summary.request.size : 0;
			var responseSize = (typeof summary.response.size !== 'undefined') ? summary.response.size : 0;

			// Metrics On Response
			requestsInProcess -= 1;
			if (req.session) {
				var sessSize = JSON.stringify(req.session).length;
				metrics.sessionSize = Math.max(metric.sessionSize, sessSize);
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
	}
};
