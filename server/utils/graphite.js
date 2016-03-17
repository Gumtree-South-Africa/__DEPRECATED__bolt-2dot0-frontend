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
};


GraphiteService.prototype.postForHPUsingTCP = function(key, value) {
    var socket = net.createConnection(config.get('graphite.server.port'), config.get('graphite.server.host'), function () {
		var data = key + ' ' + value + ' ' + new Date().getTime()/1000 + '\n';
        socket.write(data);
        socket.end();
    });
}

module.exports = new GraphiteService();
