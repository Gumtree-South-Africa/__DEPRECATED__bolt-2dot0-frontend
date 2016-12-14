'use strict';

// Express Middlewares
let express = require('express');
let bodyParser = require('body-parser');
let compress = require('compression');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let methodOverride = require('method-override');
let minifyHTML = require('express-minify-html');

let fs = require('fs');

let  config = {
	root: process.cwd()
};

// BOLT Custom Middlewares
let legacyDeviceRedirection = require(config.root + '/modules/legacy-mobile-redirection');
let guardians = require(config.root + '/modules/guardians');
let deviceDetection = require(config.root + '/modules/device-detection');
let boltExpressHbs = require(config.root + '/modules/handlebars');
let assets = require(config.root + '/modules/assets');
let checkIp = require(config.root + '/server/middlewares/check-ip');
let checkMachineId = require(config.root + '/server/middlewares/check-machineid');
let checkUserAgent = require(config.root + '/server/middlewares/check-useragent');
// let checkAuthentication = require(config.root + '/server/middlewares/check-authentication');
let requestId = require(config.root + '/server/middlewares/request-id');
let writeHeader = require(config.root + '/server/middlewares/write-header');
let responseMetrics = require(config.root + '/server/middlewares/response-metrics');

let middlewareloader = require(config.root + '/modules/environment-middleware-loader');

// Access Logging
let accessLog = (process.env.LOG_DIR || config.root) + '/access.log';
let accessLogStream = fs.createWriteStream(accessLog, {flags: 'a'});
// morgan custom logging format
let accessLogFormat = ':client-ip - :remote-user [:date[clf]] :cuid :hostname ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time-sec';

let i18nOr = require(config.root + '/modules/bolt-i18n');


function BuildApp(siteObj, loggingEnabled) {
	let app = new express();

	this.getApp = function() {
		this.setLoggerTokens();
		return app;
	};

	// morgan custom logging tokens
	this.setLoggerTokens = function() {
		logger.token('hostname', function getHostname(req) {
			return req.hostname;
		});
		logger.token('client-ip', function getClientIp(req) {
			return req.app.locals.ip;
		});
		logger.token('cuid', function getCuid(req) {
			return req.app.locals.requestId;
		});
		logger.token('response-time-sec', function getResponseTimeToken(req, res) {
			if (!req._startAt || !res._startAt) {
				return;
			}
			// calculate diff
			let ms = (res._startAt[0] - req._startAt[0]) * 1e3 + (res._startAt[1] - req._startAt[1]) * 1e-6;
			let sec = ms / 1000;
			return sec.toFixed(3);
		});
	};


	// Only for Site Specific App
	if (typeof siteObj !== 'undefined') {

		/*
		 * Bolt 2.0 Redirect
		 */
		// Check if we need to redirect to mweb - for legacy devices
		app.use(legacyDeviceRedirection());

		/*
		 * Bolt 2.0 Security
		 */
		app.use(guardians(app));

		/*
		 * Bolt 2.0 Site-App Locals
		 */
		app.locals.config = {};
		app.locals.config.name = siteObj.name;
		app.locals.config.locale = siteObj.locale;
		app.locals.config.country = siteObj.country;
		app.locals.config.hostname = siteObj.hostname;
		app.locals.config.hostnameRegex = '[\.-\w]*' + siteObj.hostname + '[\.-\w-]*';

		/*
		 * Bolt 2.0 I18n initialization
		 */
		i18nOr.init(app, siteObj.locale);

		/*
		 * Development based middlewares
		 */
		middlewareloader()(['dev', 'mock', 'vm', 'vmdeploy', 'dockerdeploy'], function() {
			app.locals.devMode = true;
			app.locals.prodEpsMode = false;

			if (app.locals.config) {
				app.locals.config.basePort = typeof process.env.SSL_PORT !== 'undefined' ? ':' + process.env.SSL_PORT : '';
			}

			// assets for local developments and populates  app.locals.jsAssets
			app.use(assets(app, typeof siteObj !== 'undefined' ? siteObj.locale : ''));

			// for dev purpose lets make all static none cacheable
			// http://evanhahn.com/express-dot-static-deep-dive/
			app.use('/public', express.static(config.root + '/public', {
				root: '/public', etag: false, maxage: 0, index: false
			}));

			// Only for Specific Apps within a Site App
			if ((typeof loggingEnabled === 'undefined') || loggingEnabled===true) {
				app.use(logger('dev'));
			}
		});

		/*
		 * Pre-Production based middlewares
		 */
		middlewareloader()(['pp_phx_deploy', 'lnp_phx_deploy'], function() {
			app.locals.devMode = false;
			app.locals.prodEpsMode = false;

			if (app.locals.config) {
				app.locals.config.basePort = '';
			}

			// Only for Specific Apps within a Site App
			if ((typeof loggingEnabled === 'undefined') || loggingEnabled===true) {
				app.use(logger('short'));
			}
		});

		/*
		 * Production based middlewares
		 */
		middlewareloader()(['prod_ix5_deploy', 'prod_phx_deploy'], function() {
			app.locals.devMode = false;
			app.locals.prodEpsMode = true;

			if (app.locals.config) {
				app.locals.config.basePort = '';
			}

			// Only for Specific Apps within a Site App
			if ((typeof loggingEnabled === 'undefined') || loggingEnabled===true) {
				app.use(logger('short'));
			}
		});

		/*
		 * Bolt 2.0 Express middlewares
		 */
		app.use('/', compress());
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({extended: true}));
		app.use(cookieParser());
		app.use(methodOverride());
		app.use(minifyHTML({
			override: false,
			htmlMinifier: {
				removeComments: true,
				collapseWhitespace: true,
				collapseBooleanAttributes: true,
				removeAttributeQuotes: true,
				removeEmptyAttributes: true,
				minifyJS: true
			}
		}));

		// Only for Specific Apps within a Site App
		if ((typeof loggingEnabled === 'undefined') || loggingEnabled===true) {
			app.use(logger(accessLogFormat, {stream: accessLogStream}));
		}

		/*
		 * Bolt 2.0 Rendering middlewares
		 */
		app.use(boltExpressHbs.create(app));

		/*
		 * Bolt 2.0 Device Detection
		 */
		app.use(deviceDetection.init());

		/*
		 * Bolt 2.0 Custom middlewares to add to request
		 */
		app.use(checkIp());
		app.use(checkMachineId());
		app.use(checkUserAgent());
		app.use(requestId());
		app.use(writeHeader('X-Powered-By', 'Bolt 2.0'));
		app.use(writeHeader('Vary', 'User-Agent'));

		/*
		 * Bolt 2.0 Authentication
		 */
		// app.use(checkAuthentication(siteObj.locale));

		// Template hbs caching.
		if (process.env.NODE_ENV) {
			app.enable('view cache');
		}

		// Bolt Response Metrics
		app.use(responseMetrics(loggingEnabled));
	}
}

module.exports = BuildApp;
