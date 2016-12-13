'use strict';


var graphiteService = require(process.cwd() + '/server/utils/graphite');

var tooBusy = require('toobusy-js'), async = require('async'), util = require('util'), deepcopy = require('deepcopy'), EventEmitter = require('events').EventEmitter,

// Supporting functions
	metric = require('./metrics'), setupOptions = require('./setupOptions').setupOptions, clusterCheck = require('./clusterCheck'),

	reportFunctions = require('./reportFunctions'), updateMemory = reportFunctions.updateMemory, finalUpdateStats = reportFunctions.finalUpdateStats, checkHeapFull = reportFunctions.checkHeapFull, genLogMsg = reportFunctions.genLogMsg, updateFileDescriptorCount = reportFunctions.updateFileDescriptorCount;

var isRunning = false, stats = {}, prevStats, // stats from previous 60 second cycle so stats can be reset
	intervalId, theEmitter, theOptions, duration, // time from last stats flush to now
	shutdownRequested = false;


function gracefulShutdown(why) {
	// to prevent crashing from other errors when we already existing
	shutdownRequested = true;
	clearInterval(intervalId);
}


function sanitize(num) {
	return +num || 0;
}

// Preserve all the statistics when the interval fires so new counts can start.
function preserveStats(stats) {
	var nowTime = Date.now();
	var durationSeconds = (nowTime - duration) / 1000; // time since last metrics dump

	updateMemory(stats);
	updateFileDescriptorCount(stats);
	stats.eventLoop = tooBusy.lag();
	stats.maxConcurrentRequests = metric.maxConcurrentRequests;
	stats.urlTime = sanitize(metric.urltime.toJSON().median);
	stats.eps = sanitize(metric.eps / durationSeconds);
	stats.http2XX = sanitize(metric.http2XX);
	stats.http3XX = sanitize(metric.http3XX);
	stats.http4XX = sanitize(metric.http4XX);
	stats.http5XX = sanitize(metric.http5XX);
	stats.renderTime = sanitize(metric.renderTime.toJSON().median);
	stats.maxCookieSize = sanitize(metric.cookielen.toJSON().max);
	stats.requestBodySize = sanitize(metric.requestBody.toJSON().median);
	stats.sessionSize = sanitize(metric.sessionSize);
	stats.requestsReceived = metric.requestsReceived;
	stats.tps = sanitize(metric.requestsReceived / durationSeconds);
	stats.uptime = Math.round(process.uptime());

	// Get CPU Usage async and finish up with emitStatistics callback
	duration = nowTime; // reset duration clock
	finalUpdateStats(stats, durationSeconds, emitStatistics);
	return stats;

	// Callback function to handle final emission of statistics
	function emitStatistics(error, stats) {
		if (error) {
			console.log(genLogMsg("ERROR finalizing statistics: " + error));
			return;
		}
		// Send stats to anyone interested in them but don't send metrics if no endpoint
		// console.log(genLogMsg('BOLT NodeJS Monitoring Agent: ' + JSON.stringify(stats)));
		sendMetricsToGraphite(stats);
		// theEmitter.emit('monitorNodeStats', stats);
	}
}

// Reset the statistics that are per reporting interval
function resetStats() {
	stats.gc_count = 0;
	stats.gc_count_incremental = 0;
	stats.gcInterval = 0;

	metric.maxConcurrentRequests = 0;
	metric.urltime.reset();
	metric.eps = 0;
	metric.http2XX = 0;
	metric.http3XX = 0;
	metric.http4XX = 0;
	metric.http5XX = 0;
	metric.renderTime.reset();
	metric.cookielen.reset();
	metric.requestBody.reset();
	metric.sessionSize = 0;
	metric.requestsReceived = 0;
}

function sendMetricsToGraphite(stats) {
	graphiteService.sendNodeMetrics('agent.stats.eventLoop', stats.eventLoop);
	graphiteService.sendNodeMetrics('agent.stats.maxConcurrentRequests', stats.maxConcurrentRequests);
	graphiteService.sendNodeMetrics('agent.stats.urlTime', stats.urlTime);
	graphiteService.sendNodeMetrics('agent.stats.errorsPerSecond', stats.eps);
	graphiteService.sendNodeMetrics('agent.stats.renderTime', stats.renderTime);
	graphiteService.sendNodeMetrics('agent.stats.maxCookieSize', stats.maxCookieSize);
	graphiteService.sendNodeMetrics('agent.stats.requestBodySize', stats.requestBodySize);
	graphiteService.sendNodeMetrics('agent.stats.requestCount', stats.requestsReceived);
	graphiteService.sendNodeMetrics('agent.stats.transactionsPerSecond', stats.tps);
	graphiteService.sendNodeMetrics('agent.stats.count2xx', stats.http2XX);
	graphiteService.sendNodeMetrics('agent.stats.count3xx', stats.http3XX);
	graphiteService.sendNodeMetrics('agent.stats.count4xx', stats.http4XX);
	graphiteService.sendNodeMetrics('agent.stats.count5xx', stats.http5XX);
	graphiteService.sendNodeMetrics('agent.stats.uptime', stats.uptime);
	graphiteService.sendNodeMetrics('agent.stats.heap_used', stats.heap_used);
	graphiteService.sendNodeMetrics('agent.stats.heap_max', stats.heap_max);
	graphiteService.sendNodeMetrics('agent.stats.availableFileDescriptors', stats.availableFileDescriptors);
	graphiteService.sendNodeMetrics('agent.stats.gcInterval', stats.gcInterval);
	graphiteService.sendNodeMetrics('agent.stats.cpu', stats.cpu);
}


// Starts monitoring processes (node-gcstats, interval to report metrics)
function start(options, emitter) {
	theEmitter = emitter;
	theOptions = options;

	// Establish setInterval to collect stats every n seconds
	intervalId = setInterval(function() {
		if (shutdownRequested) {
			clearInterval(intervalId);
			return;
		}
		checkHeapFull(null, intervalId);
		// Reset stats to collect for the next interval. Preserve the
		// stats accumulated in the prior interval and send.
		prevStats = preserveStats(deepcopy(stats));
		resetStats();
	}, options.interval);
	intervalId.unref(); // Make sure our interval does not keep node from exiting

	process.on('SIGTERM', function() {
		gracefulShutdown('TERM');
	});
	process.on('SIGINT', function() {
		gracefulShutdown('INT');
	});
	process.on('SIGQUIT', function() {
		gracefulShutdown('QUIT');
	});

	return;
}


// Configuration would normally be set by config but options is offered for testing
function setup(options) {
	var self = this;
	options = options || {};

	// Don't start monitoring interval timer twice.
	if (!isRunning) {
		isRunning = true;

		var setOptions = setupOptions.bind(self, options);
		var clChk = clusterCheck.getRestarts.bind(self, options);

		async.series([
				setOptions, clChk
			], // results callback
			function(err, results) {
				if (err) {
					console.error(genLogMsg("Can't start monitor-inc middleware. " + err.message));
					return; // Don't start monitoring if something bad happened.
				}
				if (results[0]) {
					options = results[0];
				}
				if (results[1]) {
					stats.noWorkers = results[1].noWorkers;
					if (results[1].restarts) {
						stats.restarts = results[1].restarts;
					}
				}

				// Start the repeating interval for sending collected metrics
				duration = Date.now();
				intervalId = start(options, self);
			});
	}
}


// Define Monitor to provide event emitting.
// monitorStats is the primary event emitted and has the collected metrics
// for the current interval
var Monitor = function Monitor() {
	// Extend from EventEmitter
	EventEmitter.call(this);
	this.init = setup.bind(this);
};
util.inherits(Monitor, EventEmitter);


Monitor.prototype.reset = function reset() {
	isRunning = false;
	clearInterval(intervalId);
	intervalId = undefined;
};

Monitor.prototype.startMonitoring = function startMonitoring() {
	setup();
}


module.exports = new Monitor();
