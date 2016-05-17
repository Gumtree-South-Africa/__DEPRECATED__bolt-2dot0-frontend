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






'use strict';

var tooBusy = require('toobusy-js'),
    gcstats,
    async = require('async'),
    util = require('util'),
    express = require('express'),
    deepcopy = require('deepcopy'),
    deployEnv = require('environment-ebay'),
    tryRequire = require('try-require'),
    Cluster = require('cluster'),
    cal = require('cal'),
    appContext = require('app-context-ebay'),
    EventEmitter = require('events').EventEmitter,

// Supporting functions
    setupOptions = require('./setupOptions').setupOptions,
    clusterCheck = require('./clusterCheck'),
    reportFunctions = require('./reportFunctions'),
    updateMemory = reportFunctions.updateMemory,
    finalUpdateStats = reportFunctions.finalUpdateStats,
    checkHeapFull = reportFunctions.checkHeapFull,
    genLogMsg = reportFunctions.genLogMsg,
    initOutOfMemoryError = reportFunctions.initOutOfMemoryError,
    updateFileDescriptorCount = reportFunctions.updateFileDescriptorCount,
    metric = require('./metrics'),
    tooBusyHandler,
    maxOpenRequests = 0,
    reportMetrics = require('./reportMetrics');

var isRunning = false,
    stats = {},
    prevStats, // stats from previous 60 second cycle so stats can be reset
    intervalId,
    theEmitter,
    theOptions,
    gotFirstRequest,
    duration, // time from last stats flush to now
    shutdownRequested = false,
    requestsInProcess = 0;


// Starts monitoring processes (node-gcstats, interval to report metrics)
function start(options, emitter) {

    theEmitter = emitter;
    theOptions = options;

    // Establish setInterval to collect stats every n seconds
    intervalId = setInterval(function () {
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

    process.on('SIGTERM', function () {
        gracefulShutdown('TERM');
    });
    process.on('SIGINT', function () {
        gracefulShutdown('INT');
    });
    process.on('SIGQUIT', function () {
        gracefulShutdown('QUIT');
    });

    return;
}

var shutdownRequestCount = 0;
function gracefulShutdown(why) {
    // to prevent crashing from other errors when we already existing
    shutdownRequested = true;
    clearInterval(intervalId);
    // if it is not cluster-pm2 mode, i.e. dev environment, then control exit
    // or when kraken is not yet engaged which happens after first request
    if (deployEnv.isDev() || !gotFirstRequest || Cluster.isMaster && shutdownRequestCount++ > 1) {
        process.exit(1); // Make sure we stop running after KILL/TERM
    }
}

// Preserve all the statistics when the interval fires so new counts can start.
function preserveStats(stats) {
    var nowTime = Date.now();
    var durationSeconds = (nowTime - duration) / 1000; // time since last metrics dump
    stats.eventLoop = tooBusy.lag();
    updateMemory(stats);
    updateFileDescriptorCount(stats);
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
    stats.tps = sanitize(metric.requestsReceived / durationSeconds);
    stats.oomError = stats.oomError || 0;
    duration = nowTime; // reset duration clock
    stats.uptime = Math.round(process.uptime());
    // Get CPU Usage async and finish up with emitStatistics callback
    finalUpdateStats(stats, durationSeconds, emitStatistics);
    return stats;

    // Callback function to handle final emission of statistics
    function emitStatistics(error, stats) {
        if (error) {
            console.log(genLogMsg("ERROR finalizing statistics: " + error));
            return;
        }
        // console.log(genLogMsg(JSON.stringify(stats)));
        // Send stats to anyone interested in them but don't send metrics if no endpoint
        theEmitter.emit('monitorStats', stats);
        if (theOptions.clientEndPoint) {
            reportMetrics.sendWorker(stats, function (err) {
                if (err) {
                    console.log(genLogMsg("Error reporting metrics:" + err));
                }
            });
        }
    }
}

// Reset the statistics that are per reporting interval
function resetStats() {
    stats.gc_count = 0;
    stats.gc_count_incremental = 0;
    stats.gcInterval = 0,
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

function sanitize(num) {
    return +num || 0;
}

// Define Monitor to provide event emitting.
// monitorStats is the primary event emitted and has the collected metrics
// for the current interval
var Monitor = function Monitor() {
    // Extend from EventEmitter
    EventEmitter.call(this);
    this.init = setup.bind(this);
    this.testTooBusyHandler = testTooBusyHandler.bind(this);
};

util.inherits(Monitor, EventEmitter);

// Only needed for tests to trigger tooBusy event and test loading handler
function testTooBusyHandler(maxOpen, rip, handler, mockTooBusy) {
    maxOpenRequests = maxOpen;
    requestsInProcess = rip;
    tooBusyHandler = handler || tooBusyHandler;
    tooBusy = mockTooBusy || tooBusy;
}

Monitor.prototype.reset = function reset() {
    isRunning = false;
    clearInterval(intervalId);
    intervalId = undefined;
};

// Configuration would normally be set by config but options is offered
// for testing
function setup(options) {
    /*jshint validthis:true */
    var self = this;
    var app = express();
    options = options || {};

    // Don't do anything in dev mode
    if (deployEnv.isDev()) {
        return noop;
    }

    // Don't start monitoring interval timer twice.
    if (!isRunning) {
        isRunning = true;

        var setOptions = setupOptions.bind(self, options);
        tooBusyHandler = options.tooBusyHandler;
        maxOpenRequests = options.maxOpenRequests;
        stats.oomError = initOutOfMemoryError();
        options.metricsId = clusterCheck.getClusterId();
        var clChk = clusterCheck.getRestarts.bind(self, options);
        // Obtain a metricsId for reporting node instances if we are clustered
        async.series([
                setOptions,
                clChk
            ],
            // results callback
            function (err, results) {
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

                // Setup reporting config and start repeat interval for sending metrics
                reportMetrics.setConfig(options);

                // Don't send metrics from dev unless user has explicitly specified
                // an endpoint indicating we should do so
                if ((!options.environment || options.environment === 'development') &&
                    !options.clientEndPoint) {
                    return; // dev mode and no endpoint. Don't collect metrics
                }

                // Start the repeating interval for sending collected metrics
                duration = Date.now();
                intervalId = start(options, self);
            });

    }

    // Cost/req < 1 microsec for tooBusy check
    // Don't send tooBusy to ECV/admin requests or LB may mark us down.
    app.use(tooBusyMiddleware);
    // Middleware so we can report metrics associated with a request.
    app.use(function taniwha(req, res, next) {
        if (deployEnv.isDev()) {
            return next();
        }

        gotFirstRequest = true;

        var  _renderOrig;
        var isReqFinished = false;

        // Check if heap is too full and we need to exit
        checkHeapFull(req, intervalId);

        // Consider replacing this with making wherever we log CAL RENDER add
        // res.renderTime to the res object where we can pick it rather than
        // do the work twice.
        _renderOrig = res.render;
        res.render = function () {
            var start = Date.now();
            _renderOrig.apply(res, arguments);
            metric.renderTime.update(Date.now() - start);
        };

        // Establish request start time for URL timing. Increment # of requests in process.
        // Bump meter for requests/second.
        res.startingTime = Date.now();
        metric.requestsReceived += 1;
        requestsInProcess += 1;

        // Get size of cookie and body
        if (req.headers.cookie) {
            metric.cookielen.update(req.headers.cookie.length);
        }
        var bodysize = req.headers['content-length'];
        if (bodysize) {
            metric.requestBody.update(parseInt(bodysize, 10));
        }

        // When response is done, collect session size, decrement # of requests in process.
        // Stop URL timing and report time to run URL.
        res.once('finish', finishResponse);
        res.once('close', finishResponse);
        res.once('error', finishResponse);

        // Update max # of requests in process at one time
        metric.maxConcurrentRequests = Math.max(metric.maxConcurrentRequests, requestsInProcess);

        next();

        // Determine urltime, count response type and decrement requests in process
        function finishResponse () {
            if (isReqFinished) {
                return; // Run this only once per request
            }
            isReqFinished = true;

            if (req.session) {
                var sessSize = JSON.stringify(req.session).length;
                metric.sessionSize = Math.max(metric.sessionSize, sessSize);
            }
            metric.urltime.update(Date.now() - res.startingTime);
            if (res.statusCode >= 200 && res.statusCode <= 299) {
                metric.http2XX += 1;
            } else if (res.statusCode >= 300 && res.statusCode <= 399) {
                metric.http3XX += 1;
            } else if (res.statusCode >= 400 && res.statusCode <= 499) {
                metric.eps += 1;
                metric.http4XX += 1;
            } else if (res.statusCode >= 500 && res.statusCode <= 599) {
                metric.eps += 1;
                metric.http5XX += 1;
            }
            requestsInProcess -= 1;
            return;
        }
    });

    return app;

}


// If the user has a tooBusyHandler, call it. If not, just return and accept
// the tooBusy condition and live with it.
function tooBusyMiddleware(req, res, next) {
    var handler;
    var adminCmd = req.url && req.url.indexOf('/admin/v3console') === 0;
    if (adminCmd || !tooBusyHandler) {
        return next();
    }

    // If event loop taking too long send an HTTP 503 response
    // to exert backpressure.
    // On startup, tooBusy reports a large event loop time causing a
    // false rejected request. This is annoying when in dev mode so
    // fudge things to avoid denying first reauest by making sure
    // we are actually taking traffic, e.g more than two requests
    // running at once. If we have less than this, it seems unlikely
    // a tooBusy condition would exist  so this saves the call to
    // check at low traffic loads.
    if (requestsInProcess > 2 && tooBusy() ||
            // If too many requests in flight, send an HTTP 503
            // response to exert backpressure.
        maxOpenRequests && requestsInProcess > maxOpenRequests) {

        metric.eps += 1;
        tooBusyHandler = typeof tooBusyHandler === 'function' ?
            tooBusyHandler :
            tryRequire(tooBusyHandler);

        if (tooBusyHandler) {
            return tooBusyHandler(req, res, next);
        }
    }

    next();
}

// When we need to do nothing in middleware chain, dev environment
var noop = function noop(req, res, next) {
    return next();
};

//Default Handler for tooBusy
var defaultTooBusyHandler = function defaultTooBusyHandler(req, res, next) {
    cal.createEvent('Error', 'Error_TooBusy', 1, 'Server Too Busy to Handle Request, shedding load').complete();
    if(appContext.type === 'service') {
        res.send(503);
    } else {
        // Express response has the bad habit of adding a body to a
        // redirect response when the accepts headers say that html
        // is OK. This messes up our load balancer as it expects
        // redirects to end with crlf crlf and it does not when the
        // body is added. Make accepts look empty so the response.redirect
        // will not add a body
        req.accepts = function() {
            return '';
        };
        res.redirect("http://pages.ebay.com/messages/page_not_responding.html");
    }

};
if (deployEnv.isDev()) {
    process.on('SIGINT', function () {
        process.exit();
    });
}


module.exports = new Monitor();