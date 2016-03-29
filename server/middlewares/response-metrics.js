'use strict';


var onResponse = require('on-response');

var cwd = process.cwd();
var graphiteService = require(cwd + '/server/utils/graphite');


module.exports = function() {
    return function (req, res, next) {
        onResponse(req, res, function (err, summary) {
            var responseTime = summary.response.time;
            var requestSize = (typeof summary.request.size !== 'undefined') ? summary.request.size : 0;
            var responseSize = (typeof summary.response.size !== 'undefined') ? summary.response.size : 0;

            // Send Response Metrics to Graphite Server
            graphiteService.sendMetricsForPage(res.locals.config.country, req.app.locals.pagetype, 'response.responseTime', responseTime);
            graphiteService.sendMetricsForPage(res.locals.config.country, req.app.locals.pagetype, 'response.requestSize', requestSize);
            graphiteService.sendMetricsForPage(res.locals.config.country, req.app.locals.pagetype, 'response.responseSize', responseSize);
            graphiteService.sendMetricsForPage(res.locals.config.country, req.app.locals.pagetype, 'response.statusCode', res.statusCode);
        });

        next();
    }
};
