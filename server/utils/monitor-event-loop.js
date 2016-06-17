'use strict';


var monitor = require('event-loop-monitor');

var cwd = process.cwd();
var graphiteService = require(cwd + '/server/utils/graphite');


/**
 * @description An Event Loop Monitor class
 * @constructor
 */
var EventLoopMonitor = function() {
	// data event will fire every 4 seconds
	monitor.on('data', function(latency) {
		// Send Event Loop Latency Metrics to Graphite Server
		graphiteService.sendNodeMetrics('eventloop.latency.p50', latency.p50);
		graphiteService.sendNodeMetrics('eventloop.latency.p90', latency.p90);
		graphiteService.sendNodeMetrics('eventloop.latency.p95', latency.p95);
		graphiteService.sendNodeMetrics('eventloop.latency.p99', latency.p99);
		graphiteService.sendNodeMetrics('eventloop.latency.p100', latency.p100);
	});

	monitor.resume(); // to start measuring
};

module.exports = EventLoopMonitor;
