'use strict';


var onResponse = require('on-response');

var cwd = process.cwd();
var graphiteService = require(cwd + '/server/utils/graphite');


module.exports = function() {
	return function(req, res, next) {
		onResponse(req, res, function(err, summary) {
			var country = res.locals.config.country;
			var pagetype = req.app.locals.pagetype;

			var responseTime = summary.response.time;
			var requestSize = (typeof summary.request.size !== 'undefined') ? summary.request.size : 0;
			var responseSize = (typeof summary.response.size !== 'undefined') ? summary.response.size : 0;

			// Send Response Metrics to Graphite Server
			graphiteService.sendMetricsForPage(country, pagetype, 'request.requestSize', requestSize);
			graphiteService.sendMetricsForPage(country, pagetype, 'response.responseTime', responseTime);
			graphiteService.sendMetricsForPage(country, pagetype, 'response.responseSize', responseSize);
			graphiteService.sendMetricsForPage(country, pagetype, 'response.statusCode', res.statusCode);
		});

		next();
	}
};
