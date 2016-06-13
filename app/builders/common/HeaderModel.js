//jshint ignore: start
'use strict';

var http = require('http');
var Q = require('q');
var _ = require('underscore');

var ModelBuilder = require('./ModelBuilder');

var deviceDetection = require(process.cwd() + '/modules/device-detection');
var pageurlJson = require(process.cwd() + '/app/config/pageurl.json');
var config = require('config');

var userService = require(process.cwd() + '/server/services/user');

/**
 * @description A class that Handles the Header Model
 * @constructor
 */

var HeaderModel = function (secure, req, res) {
	// Cookie variables
	var authCookieName = 'bt_auth';
	this.authCookie = req.cookies[authCookieName];

	var searchLocIdCookieName = 'searchLocId';
	this.searchLocIdCookie = req.cookies[searchLocIdCookieName];
	this.locationIdNameMap = res.locals.config.locationIdNameMap;
	this.b2dot0Version = req.cookies.b2dot0Version;
	// Local variables
	this.secure = secure;
	this.urlProtocol = this.secure ? 'https://' : 'http://';

	this.locale = res.locals.config.locale;
	this.brandName = res.locals.config.name;
	this.country = res.locals.config.country;
	this.fullDomainName = res.locals.config.hostname;
	this.baseDomainSuffix = res.locals.config.baseDomainSuffix;
	this.basePort = res.locals.config.basePort;
	this.headerConfigData = res.locals.config.bapiConfigData.header;

	this.userCookieData = req.app.locals.userCookieData;

	this.bapiHeaders = {
		'requestId': req.app.locals.requestId,
		'ip': req.app.locals.ip,
		'machineid': req.app.locals.machineid,
		'useragent': req.app.locals.useragent,
		'locale': this.locale,
		'authTokenValue': this.authCookie
	};

	this.i18n = req.i18n;

};

HeaderModel.prototype.getModelBuilder = function () {
	return new ModelBuilder(this.getHeaderData());
};

// Function getHeaderData
HeaderModel.prototype.getHeaderData = function () {

	var _this = this;
	var arrFunctions = [
		function (callback) {
			if (typeof callback !== 'function') {
				return;
			}

			// initialize
			var data = {
				'homePageUrl': _this.urlProtocol + 'www.' + _this.fullDomainName + _this.baseDomainSuffix + _this.basePort,
				'languageCode': _this.locale
			};

			// merge pageurl data
			_.extend(data, pageurlJson.header);

			// merge header config data from BAPI
			_.extend(data, _this.headerConfigData);

			// build data
			var urlProtocol = _this.secure ? 'https://' : 'http://';
			var urlHost = config.get('static.server.host') !== null ? urlProtocol + config.get('static.server.host') : '';
			var urlPort = config.get('static.server.port') !== null ? ':' + config.get('static.server.port') : '';
			var urlVersion = config.get('static.server.version') !== null ? '/' + config.get('static.server.version') : '';
			data.baseImageUrl = urlHost + urlPort + urlVersion + config.get('static.baseImageUrl');
			data.baseSVGDataUrl = (urlHost !== null) ? urlHost + urlPort + urlVersion + config.get('static.baseSVGDataUrl') : config.get('static.baseSVGDataUrl');
			data.baseCSSUrl = (urlHost !== null) ? urlHost + urlPort + urlVersion + config.get('static.baseCSSUrl') : config.get('static.baseCSSUrl');
			data.min = config.get('static.min');

			// add complex data to header
			_this.buildUrl(data);
			_this.buildCss(data);
			_this.buildOpengraph(data);

			// manipulate data
			data.enableLighterVersionForMobile = data.enableLighterVersionForMobile && deviceDetection.isMobile();

			// If locationCookie present, set id and name in model
			if (typeof _this.searchLocIdCookie !== 'undefined') {
				data.cookieLocationId = _this.searchLocIdCookie;

				if (typeof _this.locationIdNameMap[data.cookieLocationId] === 'object') {
					data.cookieLocationName = _this.i18n.__('searchbar.locationDisplayname.prefix', _this.locationIdNameMap[data.cookieLocationId].value);
				} else {
					data.cookieLocationName = _this.locationIdNameMap[data.cookieLocationId] || '';
				}
			}

			// If authCookie present, make a call to user BAPI to retrieve user info and set in model
			if (typeof _this.authCookie !== 'undefined') {
				if (typeof _this.userCookieData !== 'undefined') {
					// merge user cookie data
					_.extend(data, _this.userCookieData);

					// build user profile

					_this.buildProfile(data);
				} else {
					Q(userService.getUserFromCookie(_this.bapiHeaders))
						.then(function (dataReturned) {
							if (!_.isEmpty(dataReturned)) {
								// merge user cookie data
								_.extend(data, dataReturned);

								// build user profile
								_this.buildProfile(data);
							}
						}).fail(function (err) {
						console.error('HeaderModel data failed as bapi failed with provided cookie', new Error(err));
					});

				}
			}

			callback(null, data);
		}
	];

	return arrFunctions;
};

// Build URL
HeaderModel.prototype.buildUrl = function (data) {

	data.touchIconIphoneUrl = data.baseImageUrl + this.locale + '/touch-iphone.png';
	data.touchIconIpadUrl = data.baseImageUrl + this.locale + '/touch-ipad.png';
	data.touchIconIphoneRetinaUrl = data.baseImageUrl + this.locale + '/touch-iphone-retina.png';
	data.touchIconIpadRetinaUrl = data.baseImageUrl + this.locale + '/touch-ipad-retina.png';
	data.shortcutIconUrl = data.baseImageUrl + this.locale + '/shortcut.png';

	// Temporary Hack to call rui-api from 1.0
	var modifiedLocale = this.locale;
	if (this.country === 'MX') {
		modifiedLocale = this.locale + '_VNS';
	}
	data.autoCompleteUrl = data.homePageUrl + data.autoCompleteUrl + modifiedLocale + '/{catId}/{locId}/{value}';
	data.geoLocatorUrl = data.homePageUrl + data.geoLocatorUrl + modifiedLocale + '/{lat}/{lng}';
	data.rootGeoLocatorUrl = data.homePageUrl + data.rootGeoLocatorUrl + modifiedLocale + '/0/category/0';
};

//Build CSS
HeaderModel.prototype.buildCss = function (data) {

	var b2dot0Ver = 'v1' //by default
	if ((typeof this.b2dot0Version !== 'undefined') && this.b2dot0Version == '2.0') {
		b2dot0Ver = 'v2';
	}

	data.iconsCSSURLs = [];
	data.iconsCSSURLs.push(data.baseSVGDataUrl + 'icons.data.svg' + '_' + this.locale + '.css');
	data.iconsCSSURLs.push(data.baseCSSUrl + 'icons.data.png' + '_' + this.locale + '.css');
	data.iconsCSSURLs.push(data.baseCSSUrl + 'icons.fallback' + '_' + this.locale + '.css');
	data.iconsCSSFallbackUrl = data.baseCSSUrl + 'icons.fallback' + '_' + this.locale + '.css';


	if (deviceDetection.isMobile()) {
		data.localeCSSPath = data.baseCSSUrl + 'mobile/' + b2dot0Ver + '/' + this.brandName + '/' + this.country + '/' + this.locale;
	}
	else {
		data.localeCSSPath = data.baseCSSUrl + 'all/' + b2dot0Ver + '/' + this.brandName + '/' + this.country + '/' + this.locale;
	}
	data.localeCSSPathHack = data.baseCSSUrl + 'all/' + b2dot0Ver + '/' + this.brandName + '/' + this.country + '/' + this.locale;


	data.containerCSS = [];
	if (data.min) {
		data.containerCSS.push(data.localeCSSPath + '/Main.min.css');
	}
	else {
		data.containerCSS.push(data.localeCSSPath + '/Main.css');
	}
};

//Build opengraph
HeaderModel.prototype.buildOpengraph = function (data) {

	data.brandName = this.brandName;
	data.countryName = this.country;
	data.logoUrl = data.baseImageUrl + this.locale + '/logo.png';
	data.logoUrlOpenGraph = data.baseImageUrl + this.locale + '/logoOpenGraph.png';
};

//Build Profile
HeaderModel.prototype.buildProfile = function (data) {

	if (data.username) {
		data.profileName = data.username;
	}

	if (data.socialMedia) {
		if (data.socialMedia.profileName && data.socialMedia.profileName.length > 0) {
			data.profileName = data.socialMedia.profileName;
		}
		if (data.socialMedia.type === 'FACEBOOK') {
			data.smallFbProfileImageUrl = 'https://graph.facebook.com/' + data.socialMedia.id +
				'/picture?width=36&height=36';
			data.publishPostUrl = 'https://graph.facebook.com/' + data.socialMedia.id +
				'/feed?access_token=' + data.socialMedia.accessToken;
		}
	}

	if (data.userProfileImageUrl) {
		data.profilePictureCropUrl = 'https://img.classistatic.com/crop/50x50/' + data.userProfileImageUrl.replace('http://www', '').replace('http://', '').replace('www', '');
	}
};

module.exports = HeaderModel;
