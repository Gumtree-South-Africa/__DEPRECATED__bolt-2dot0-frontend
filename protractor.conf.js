'use strict';

let jasmineReporters = require("jasmine-console-reporter");

exports.config = {
	allScriptsTimeout: 60000,
	getPageTimeout: 30000,

	framework: 'jasmine2',

	// run the protractor tests in chrome
	capabilities: {
		browserName: 'chrome',
		chromeOptions: {
			'args': ['no-sandbox']
		}
	},

	specs: ['./test/integration/**/*Spec.js'],

	onPrepare: function () {
		browser.driver.manage().window().setSize(375, 667);

		// ignore angular synchronization as we are not working with angular
		browser.ignoreSynchronization = true;

		// pretty print out results to console so they are readable
		jasmine.getEnv().addReporter(new jasmineReporters({
			colors: 1,
			cleanStack: 1,
			verbosity: 4,
			listStyle: 'indent',
			activity: false
		}))
	},

	jasmineNodeOpts: {
		showColors: true,
		defaultTimeoutInterval: 60000
	}
};
