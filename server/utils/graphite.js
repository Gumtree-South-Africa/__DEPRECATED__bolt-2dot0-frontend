'use strict';


var os = require('os');
var Graphite = require('graphite-client');

var config = require('config');


/**
 * @description A Graphite Service class
 * @constructor
 */
var GraphiteService = function() {
	this.graphite = new Graphite(config.get('graphite.server.host'), config.get('graphite.server.port'), 'UTF-8');
	this.graphite.connect(function() { //'connect' listener
		console.log('Connected to Graphite server');
	});

	this.graphite.on('end', function() {
		console.error('Graphite client disconnected');
	});

	this.graphite.on('error', function(error) {
		console.error('Graphite connection failure. ' + error);
		this.graphite.connect(function() { //'connect' listener
			console.log('Re-connected to Graphite server');
		});
	});
};


GraphiteService.prototype.sendMetricsForPage = function(country, pagetype, key, value) {
	var scope = this;

	// Can add any other server metrics we need for every metric sent to graphite
	var serverObj = {};
	serverObj['uptime'] = os.uptime();
	serverObj['load-avg'] = os.loadavg();
	serverObj['free-memory'] = os.freemem();
	serverObj['used-memory'] = os.totalmem() - os.freemem();
	serverObj['heap-total'] = process.memoryUsage().heapTotal;
	serverObj['heap-used'] = process.memoryUsage().heapUsed;

	var keyObj = {};
	var preKey = country + '.pages.' + pagetype + '.' + key;
	keyObj[preKey] = value;
	var serverKey = 'server';
	keyObj[serverKey] = serverObj;

	var nodeObj = {};
	var nodeKey = 'nodejs';
	nodeObj[nodeKey] = keyObj;

	var metrics = {};
	var hostname = os.hostname();
	metrics[hostname] = nodeObj;

	scope.graphite.write(metrics, Date.now(), function(err) {
		console.error("Failed to write Page metrics to Graphite server. err: " + err);
	});
}


GraphiteService.prototype.sendMetricsForApi = function(country, apipath, key, value) {
	var scope = this;

	// Can add any other server metrics we need for every metric sent to graphite
	var serverObj = {};
	serverObj['uptime'] = os.uptime();
	serverObj['load-avg'] = os.loadavg();
	serverObj['free-memory'] = os.freemem();
	serverObj['used-memory'] = os.totalmem() - os.freemem();
	serverObj['heap-total'] = process.memoryUsage().heapTotal;
	serverObj['heap-used'] = process.memoryUsage().heapUsed;

	var keyObj = {};
	var preKey = country + '.api.' + apipath + '.' + key;
	keyObj[preKey] = value;
	var serverKey = 'server';
	keyObj[serverKey] = serverObj;

	var nodeObj = {};
	var nodeKey = 'nodejs';
	nodeObj[nodeKey] = keyObj;

	var metrics = {};
	var hostname = os.hostname();
	metrics[hostname] = nodeObj;

	scope.graphite.write(metrics, Date.now(), function(err) {
		console.error("Failed to write API metrics to Graphite server. err: " + err);
	});
}

GraphiteService.prototype.sendNodeMetrics = function(key, value) {
	var scope = this;

	// Can add any other server metrics we need for every metric sent to graphite
	var serverObj = {};
	serverObj[key] = value;
	serverObj['uptime'] = os.uptime();
	serverObj['load-avg'] = os.loadavg();
	serverObj['free-memory'] = os.freemem();
	serverObj['used-memory'] = os.totalmem() - os.freemem();
	serverObj['heap-total'] = process.memoryUsage().heapTotal;
	serverObj['heap-used'] = process.memoryUsage().heapUsed;

	var keyObj = {};
	var serverKey = 'server';
	keyObj[serverKey] = serverObj;

	var nodeObj = {};
	var nodeKey = 'nodejs';
	nodeObj[nodeKey] = keyObj;

	var metrics = {};
	var hostname = os.hostname();
	metrics[hostname] = nodeObj;

	scope.graphite.write(metrics, Date.now(), function(err) {
		console.error("Failed to write NodeJS metrics to Graphite server. err: " + err);
	});
}

module.exports = new GraphiteService();
