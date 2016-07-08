'use strict';

let express = require('express');


// Boot Express App
// ---------------
function BuildBootApp() {
	let app = new express();

	// Configure routes
	app.use('/', require('./routes'));

	this.getApp = () => {
		return app;
	};
}


// Exports
// -------
module.exports = BuildBootApp;
