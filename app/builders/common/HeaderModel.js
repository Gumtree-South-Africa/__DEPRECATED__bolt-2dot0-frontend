//jshint ignore: start
'use strict';

var http = require('http');
var Q = require('q');
var _ = require('underscore');

var ModelBuilder = require('./ModelBuilder');

var deviceDetection = require(process.cwd() + '/modules/device-detection');
var userService = require(process.cwd() + '/server/services/user');
var pageurlJson = require(process.cwd() + '/app/config/pageurl.json');
var pagetypeJson = require(process.cwd() + '/app/config/pagetype.json');
var config = require('config');

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

	this.requestId = req.requestId;
	this.i18n = res.locals.i18n;
};

HeaderModel.prototype.getModelBuilder = function() {
	return new ModelBuilder(this.getHeaderData());
};

// Function getHeaderData
HeaderModel.prototype.getHeaderData = function() {
	var scope = this;
	var arrFunctions = [
		function (callback) {
			if (typeof callback !== 'function') {
				return;
			}

			console.log('$$$$$$$$$$$$', scope.basePort);
			var headerDeferred,
				data = {
		    		'homePageUrl' : scope.urlProtocol + 'www.' + scope.fullDomainName + scope.baseDomainSuffix + scope.basePort,
		    		'languageCode' : scope.locale
				};

			// merge pageurl data
    		_.extend(data, pageurlJson.header);

    		// merge header config data from BAPI
    		_.extend(data, scope.headerConfigData);

    		// build data
    		var urlProtocol = scope.secure ? 'https://' : 'http://';
    		var urlHost = config.get('static.server.host')!==null ? urlProtocol + config.get('static.server.host') : '';
    		var urlPort = config.get('static.server.port')!==null ? ':' + config.get('static.server.port') : '';
    		var urlVersion = config.get('static.server.version')!==null ? '/' + config.get('static.server.version') : '';
    		data.baseImageUrl = urlHost + urlPort + urlVersion + config.get('static.baseImageUrl');
    		data.baseCSSUrl = (urlHost !== null) ? urlHost + urlPort + urlVersion + config.get('static.baseCSSUrl') : config.get('static.baseCSSUrl');
    		data.min = config.get('static.min');

    		// add complex data to header
    		scope.buildUrl(data);
    		scope.buildCss(data);
    		scope.buildOpengraph(data);
				
    		// manipulate data
    		data.enableLighterVersionForMobile = data.enableLighterVersionForMobile && deviceDetection.isMobile();

    		// If locationCookie present, set id and name in model
    		if (typeof scope.searchLocIdCookie !== 'undefined') {
    			data.cookieLocationId = scope.searchLocIdCookie;
    			
    			if (typeof scope.locationIdNameMap[data.cookieLocationId] === 'object') {
    				data.cookieLocationName = scope.i18n.__('searchbar.locationDisplayname.prefix', scope.locationIdNameMap[data.cookieLocationId].value);
    			} else {
    				data.cookieLocationName = scope.locationIdNameMap[data.cookieLocationId] || '';
    			}
    		}
    		
    		// If authCookie present, make a call to user BAPI to retrieve user info and set in model
		    if (typeof scope.authCookie !== 'undefined') {
		    	headerDeferred = Q.defer();
				Q(userService.getUserFromCookie(scope.requestId, scope.authCookie, scope.locale))
			    	.then(function (dataReturned) {
			    		// merge returned data
			    		_.extend(data, dataReturned);

			    		// build user profile
			    		scope.buildProfile(data);

			    		headerDeferred.resolve(data);
					    callback(null, data);
					}).fail(function (err) {
						headerDeferred.reject(new Error(err));
					    callback(null, data);
					});
				return headerDeferred.promise;
			} else {
			    callback(null, data);
			}
		}
	];

	return arrFunctions;
};

// Build URL
HeaderModel.prototype.buildUrl = function(data) {
	var scope = this;

	data.touchIconIphoneUrl = data.baseImageUrl + scope.locale + '/touch-iphone.png';
	data.touchIconIpadUrl = data.baseImageUrl + scope.locale + '/touch-ipad.png';
	data.touchIconIphoneRetinaUrl = data.baseImageUrl + scope.locale + '/touch-iphone-retina.png';
	data.touchIconIpadRetinaUrl = data.baseImageUrl + scope.locale + '/touch-ipad-retina.png';
	data.shortcutIconUrl = data.baseImageUrl + scope.locale + '/shortcut.png';
	data.autoCompleteUrl = data.homePageUrl + data.autoCompleteUrl + scope.locale + '/{catId}/{locId}/{value}';
	data.geoLocatorUrl = data.homePageUrl + data.geoLocatorUrl + scope.locale + '/{lat}/{lng}';
	data.rootGeoLocatorUrl = data.homePageUrl + data.rootGeoLocatorUrl + scope.locale + '/0/category/0';
};

//Build CSS
HeaderModel.prototype.buildCss = function(data) {
	var scope = this;

	data.iconsCSSURLs = [];
	data.iconsCSSURLs.push(data.baseCSSUrl + 'icons.data.svg' + '_' + scope.locale + '.css');
	data.iconsCSSURLs.push(data.baseCSSUrl + 'icons.data.png' + '_' + scope.locale + '.css');
	data.iconsCSSURLs.push(data.baseCSSUrl + 'icons.fallback' + '_' + scope.locale + '.css');
	data.iconsCSSFallbackUrl = data.baseCSSUrl + 'icons.fallback' + '_' + scope.locale + '.css';

	if (deviceDetection.isMobile()) {
		data.localeCSSPath = data.baseCSSUrl + 'mobile/' + scope.brandName + '/' + scope.country + '/' + scope.locale;
	} else {
		data.localeCSSPath = data.baseCSSUrl + 'all/' + scope.brandName + '/' + scope.country + '/' + scope.locale;
	}
	data.localeCSSPathHack = data.baseCSSUrl + 'all/' + scope.brandName + '/' + scope.country + '/' + scope.locale;

	data.containerCSS = [];
	if (data.min) {
		data.containerCSS.push(data.localeCSSPath + '/Main.min.css');
	} else {
		data.containerCSS.push(data.localeCSSPath + '/Main.css');
	}
};

//Build opengraph
HeaderModel.prototype.buildOpengraph = function(data) {
	var scope = this;

	data.brandName = scope.brandName;
	data.countryName = scope.country;
	data.logoUrl = data.baseImageUrl + scope.locale + '/logo.png';
	data.logoUrlOpenGraph = data.baseImageUrl + scope.locale + '/logoOpenGraph.png';
};

//Build Profile
HeaderModel.prototype.buildProfile = function(data) {
	var scope = this;

	if (data.username) {
		data.profileName = data.username;
	}

	if (data.socialMedia) {
		if (data.socialMedia.profileName && data.socialMedia.profileName.length>0) {
			data.profileName = data.socialMedia.profileName;
		}
		if (data.socialMedia.type === 'FACEBOOK') {
			data.fbProfileImageUrl = 'https://graph.facebook.com/' + data.socialMedia.id + '/picture?width=36&height=36';
		}
	}

	if (data.userProfileImageUrl) {
		data.profilePictureCropUrl = 'https://img.classistatic.com/crop/50x50/' + data.userProfileImageUrl.replace('http://www','').replace('http://','').replace('www','');
	}
};

module.exports = HeaderModel;
