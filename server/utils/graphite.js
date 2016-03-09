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


GraphiteService.prototype.postForHPUsingTCP = function(key,value) {
    var socket = net.createConnection(config.get('graphite.server.port'), config.get('graphite.server.host'), function () {
		var data=key+' '+ value+' ' + new Date().getTime()/1000 + '\n';
		console.log('DATA TO BE WRITTEN INTO GRAPHITE IS ',data);
        socket.write(data);
		console.log('DATA sent to Graphite');
        socket.end();
    });
}

module.exports = new GraphiteService();
