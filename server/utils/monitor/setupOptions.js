'use strict';

var tooBusy = require('toobusy-js'), path = require('path'), config = require('config'), reportFunctions = require('./reportFunctions'), appRoot = process.cwd();

// Setup all the options needed for Sherlock reporting and a few other
// once only computations like max file descriptors.
exports.setupOptions = function setupOptions(options, callback) {
	options = options || {};
	options = getOptions(config, options);
	callback(null, options);
};

function getOptions(config, options) {
	// Determine application name
	var appName = process.env.APP_NAME;
	if (!options.pool) {
		options.pool = appName;
		if (!appName && appRoot) {
			var pkg = require(path.join(appRoot, 'package.json'));
			options.pool = pkg.name;
		}
	}

	var determineMaxFileDescriptors = reportFunctions.determineMaxFileDescriptors;
	determineMaxFileDescriptors(function(err, maxFd) {
		if (!err) {
			options.maxFileDescriptors = maxFd;
		}
	});

	options.tenant = options.tenant || 'node';

	// To addresses for delivery of crash email
	options.interval = options.interval || config.get('graphite.server.interval');
	options.interval = options.interval || 60; // reporting interval
	options.interval = options.interval * 1000; // make into milliseconds

	return options;
}
