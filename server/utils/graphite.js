'use strict';


var os = require('os');
var graphite = require('graphite-udp');
var net = require('net');

var config = require('config');


/**
 * @description A Graphite related utils class
 * @constructor
 */
var GraphiteService = function() {
	this.udpmetric = graphite.createClient( {
	    host: config.get('graphite.server.host'),
	    port: config.get('graphite.server.port'),
	    type: 'udp4',
	    prefix: '',
	    suffix: '',
	    interval: config.get('graphite.server.interval'),
	    verbose: true,
	    callback: function(error, metricsSent) {
	        if (error) {
	        	console.warn('Graphite Metrics not Sent: ', error);
	        }
	    }
	});
};

/**
 * To post data from HP
 */
GraphiteService.prototype.postForHP = function() {
	var scope = this;
    scope.udpmetric.put('local.random.diceroll6', 2  );
    scope.udpmetric.add('local.random.diceroll6', 2  );
    scope.udpmetric.add('local.random.diceroll6', 2  );
    scope.udpmetric.add('local.random.diceroll6', 2  );
    //udpmetric.close();
}


GraphiteService.prototype.postForHPUsingTCP = function() {
    var socket = net.createConnection(config.get('graphite.server.port'), config.get('graphite.server.host'), function () {
        socket.write("local.random.tcpnine 100000 12352345345555\n");
        socket.end();
    });
}

module.exports = new GraphiteService();
