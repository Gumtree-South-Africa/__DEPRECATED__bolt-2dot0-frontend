"use strict";


var os = require('os');
var graphite = require('graphite-udp');

//TODO:Read the values from config file
var udpmetric = graphite.createClient({
    host: '10.65.251.146',
    port: 2003,
    type: 'udp4',
    prefix: '',
    suffix: '',
    interval: 30,
    verbose: true,
    callback: function(error, metricsSent) {
        console.log('Metrics sent\n'+ metricsSent);
    }
});
/**
 * @description A Graphite related utils class
 * @constructor
 */
var GraphiteService = function() {};

/**
 * To post data from HP
 */
GraphiteService.prototype.postForHP = function() {
    udpmetric.put('local.random.diceroll6', 2  );
    udpmetric.add('local.random.diceroll6', 2  );
    udpmetric.add('local.random.diceroll6', 2  );
    udpmetric.add('local.random.diceroll6', 2  );
    //udpmetric.close();
}


module.exports = new GraphiteService();
