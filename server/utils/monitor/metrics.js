'use strict';

// Define metrics to be collected.

var measured = require('measured');

// TODO Think about how to make this more data-driven.
module.exports = {

	urltime: new measured.Histogram(),
	hdrlen: new measured.Histogram(),
	cookielen: new measured.Histogram(),
	requestBody: new measured.Histogram(),
	renderTime: new measured.Histogram(),
	gcInterval: 0,
	sessionSize: 0,
	maxConcurrentRequests: 0,
	eps: 0,
	http2XX: 0,
	http3XX: 0,
	http4XX: 0,
	http5XX: 0,
	requestsReceived: 0,
	restarts: 0

};
