'use strict';


var express = require('express'), bodyParser = require('body-parser'), compress = require('compression'), cookieParser = require('cookie-parser'), expressUncapitalize = require('express-uncapitalize'), logger = require('morgan'), methodOverride = require('method-override'), path = require('path'), fs = require('fs');

var config = {
	root: process.cwd()
};
var legacyDeviceRedirection = require(config.root + '/modules/legacy-mobile-redirection'),
	guardians = require(config.root + '/modules/guardians'),
	deviceDetection = require(config.root + '/modules/device-detection'),
	checkAuthentication = require(config.root + '/server/middlewares/check-authentication'),
	boltExpressHbs = require(config.root + '/modules/handlebars'),
	assets = require(config.root + '/modules/assets'),
	checkIp = require(config.root + '/server/middlewares/check-ip'),
	checkMachineId = require(config.root + '/server/middlewares/check-machineid'),
	checkUserAgent = require(config.root + '/server/middlewares/check-useragent'),
	requestId = require(config.root + '/server/middlewares/request-id'),
	writeHeader = require(config.root + '/server/middlewares/write-header');

var middlewareloader = require(config.root + '/modules/environment-middleware-loader');

// create a write stream (in append mode)
var accessLog = (process.env.LOG_DIR || config.root) + '/access.log';
var accessLogStream = fs.createWriteStream(accessLog, {flags: 'a'});
// morgan custom logging format
var accessLogFormat = ':client-ip - :remote-user [:date[clf]] :cuid :hostname ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time-sec';

var i18nOr = require(config.root + '/modules/bolt-i18n');

function BuildApp(siteObj) {
	var app = new express();

	this.getApp = function() {
		this.setLoggerTokens();
		return app;
	};

	// morgan custom logging tokens
	this.setLoggerTokens = function() {
		logger.token('hostname', function getHostname(req, res) {
			return req.hostname;
		});
		logger.token('client-ip', function getClientIp(req, res) {
			return req.app.locals.ip;
		});
		logger.token('cuid', function getCuid(req, res) {
			return req.app.locals.requestId;
		});
		logger.token('response-time-sec', function getResponseTimeToken(req, res) {
			if (!req._startAt || !res._startAt) {return;}
			// calculate diff
			var ms = (res._startAt[0] - req._startAt[0]) * 1e3 + (res._startAt[1] - req._startAt[1]) * 1e-6
			var sec = ms / 1000;
			return sec.toFixed(3);
		});
	}


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
			app.locals.prodMode = false;
			app.use(logger('dev'));

			// assets for local developments and populates  app.locals.jsAssets
			app.use(assets(app, typeof siteObj !== 'undefined' ? siteObj.locale : ''));

			// for dev purpose lets make all static none cacheable
			// http://evanhahn.com/express-dot-static-deep-dive/
			app.use('/public', express.static(config.root + '/public', {
				root: '/public', etag: false, maxage: 0, index: false
			}));

			if (app.locals.config) {
				app.locals.config.basePort = typeof process.env.PORT !== 'undefined' ? ':' + process.env.PORT : '';
			}

			// register eps sandbox image url middleware
		});

		/*
		 * Pre-Production based middlewares
		 */
		middlewareloader()(['pp_phx_deploy', 'lnp_phx_deploy'], function() {
			app.locals.devMode = false;
			app.locals.prodMode = false;
			app.use(logger('short'));

			if (app.locals.config) {
				app.locals.config.basePort = '';
			}

			// register eps sandbox image url middleware
		});

		/*
		 * Production based middlewares
		 */
		middlewareloader()(['prod_ix5_deploy', 'prod_phx_deploy'], function() {
			app.locals.devMode = false;
			app.locals.prodMode = true;
			app.use(logger('short'));

			if (app.locals.config) {
				app.locals.config.basePort = '';
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
		app.use(expressUncapitalize());
		app.use(logger(accessLogFormat, {stream: accessLogStream}));

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
	}
}

module.exports = BuildApp;
