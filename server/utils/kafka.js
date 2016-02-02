"use strict";

var config = require('config');
var kafka = require('kafka-node');
var producer, topic;

/**
 * @description A Kafka producer service class
 * @constructor
 */
var KafkaService = function() {
	var Producer = kafka.Producer,
		KeyedMessage = kafka.KeyedMessage,
		Client = kafka.Client,
		client = new kafka.Client(config.get('kafka.server.host') + ":" + config.get('kafka.server.port'));
	
	this.producer = new Producer(client),
	this.topic = config.get('kafka.server.topic');
};

/**
 * Gets User Info given a token from the cookie
 */
KafkaService.prototype.logInfo = function(locale, msg) {
	console.log('Inside KafkaService');
	
	var message = 'Logging: ' + msg + ', date: ' + new Date().toString();
	
	var payloads = [
	    { topic: this.topic, messages: [message] }
	];
	
	this.producer.send(payloads, 
					function (err, data) {
						if (err) {
							console.log('Error during Kafka send :- ', err);
						}
						else {
							console.log('Kafka sent message :- ', message);
						}
					});
}

module.exports = new KafkaService();
