'use strict';

let _ = require('underscore');

let ModelBuilder = require('./ModelBuilder');

let cwd = process.cwd();
let deviceDetection = require(`${cwd}/modules/device-detection`);
let pageurlJson = require(`${cwd}/app/config/pageurl.json`);
let config = require('config');
let userService = require(`${cwd}/server/services/user`);

/**
 * @description A class that Handles the Header Model
 * @constructor
 */

class HeaderModel {
	constructor(secure, req, res) {
		// Cookie variables
		let authCookieName = 'bt_auth';
		this.authCookie = req.cookies[authCookieName];

		let searchLocIdCookieName = 'searchLocId';
		this.searchLocIdCookie = req.cookies[searchLocIdCookieName];
		this.locationIdNameMap = res.locals.config.locationIdNameMap;
		// Local variables
		this.secure = secure;
		//this.urlProtocol = this.secure ? 'https://' : 'http://';
		this.urlProtocol = 'https://';

		this.locale = res.locals.config.locale;
		this.brandName = res.locals.config.name;
		this.country = res.locals.config.country;
		this.fullDomainName = res.locals.config.hostname;
		this.baseDomainSuffix = res.locals.config.baseDomainSuffix;
		this.basePort = res.locals.config.basePort;
		this.headerConfigData = res.locals.config.bapiConfigData.header;
		this.isIphone = req.app.locals.useragent.match(/iPhone/i) || req.app.locals.useragent.match(/iPod/i);

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
	}

	getModelBuilder() {
		return new ModelBuilder(this.getHeaderData());
	}

// Function getHeaderData
	getHeaderData() {

		return [
			() => {
				// initialize
				let data = {
					'homePageUrl': this.urlProtocol + 'www.' + this.fullDomainName + this.baseDomainSuffix + this.basePort,
					'languageCode': this.locale
				};

				// merge pageurl data
				_.extend(data, pageurlJson.header);

				// merge header config data from BAPI
				_.extend(data, this.headerConfigData);

				// build data
				//let urlProtocol = this.secure ? 'https://' : 'http://';
				let urlProtocol = 'https://';
				let urlHost = config.get('static.server.host') !== null ? urlProtocol + config.get('static.server.host') : '';
				let urlPort = config.get('static.server.port') !== null ? ':' + config.get('static.server.port') : '';
				let urlVersion = config.get('static.server.version') !== null ? '/' + config.get('static.server.version') : '';
				data.baseImageUrl = urlHost + urlPort + urlVersion + config.get('static.baseImageUrl');
				data.baseSVGDataUrl = (urlHost !== null) ? urlHost + urlPort + urlVersion + config.get('static.baseSVGDataUrl') : config.get('static.baseSVGDataUrl');
				data.baseCSSUrl = (urlHost !== null) ? urlHost + urlPort + urlVersion + config.get('static.baseCSSUrl') : config.get('static.baseCSSUrl');
				data.min = config.get('static.min');
				//Used for top right icon on mobile layout for app download. Icon change only.
				data.isIphone = this.isIphone;

				// add complex data to header
				this.buildUrl(data);
				this.buildCss(data);
				this.buildOpengraph(data);

				// manipulate data
				data.enableLighterVersionForMobile = data.enableLighterVersionForMobile && deviceDetection.isMobile();

				// AB Test Experiment Code
				let abtestExperimentId = config.get('abTest.experimentId');
				if (typeof abtestExperimentId === 'undefined' || abtestExperimentId === null) {
					data.abtestExperimentId = '';
				} else {
					data.abtestExperimentId = abtestExperimentId;
				}

				// If locationCookie present, set id and name in model
				if (typeof this.searchLocIdCookie !== 'undefined') {
					data.cookieLocationId = this.searchLocIdCookie;

					if (typeof this.locationIdNameMap[data.cookieLocationId] === 'object') {
						data.cookieLocationName = this.i18n.__('searchbar.locationDisplayname.prefix', this.locationIdNameMap[data.cookieLocationId].value);
					} else {
						data.cookieLocationName = this.locationIdNameMap[data.cookieLocationId] || '';
					}
				}

				// If authCookie present, make a call to user BAPI to retrieve user info and set in model
				if (typeof this.authCookie !== 'undefined') {
					if (typeof this.userCookieData !== 'undefined') {
						// merge user cookie data
						_.extend(data, this.userCookieData);

						// build user profile
						this.buildProfile(data);
						return data;
					} else {
						return userService.getUserFromCookie(this.bapiHeaders)
							.then((dataReturned) => {
								if (!_.isEmpty(dataReturned)) {
									// merge user cookie data
									_.extend(data, dataReturned);

									// build user profile
									this.buildProfile(data);
									return data;
								}
							})
							.fail((err) => {
								console.error(`Failed to get user from cookie ${this.authCookie}`, err);
								//TODO: make sure the error is an expected error (404).
								//fall through without error, we don't care
								return data;
							});
					}
				} else {
					return data;
				}
			}
		];
	}

// Build URL
	buildUrl(data) {

		data.touchIconIphoneUrl = data.baseImageUrl + this.locale + '/touch-iphone.png';
		data.touchIconIpadUrl = data.baseImageUrl + this.locale + '/touch-ipad.png';
		data.touchIconIphoneRetinaUrl = data.baseImageUrl + this.locale + '/touch-iphone-retina.png';
		data.touchIconIpadRetinaUrl = data.baseImageUrl + this.locale + '/touch-ipad-retina.png';
		data.shortcutIconUrl = data.baseImageUrl + this.locale + '/shortcut.png';

		// Temporary Hack to call rui-api from 1.0
		let modifiedLocale = this.locale;
		if (this.country === 'MX') {
			modifiedLocale = this.locale + '_VNS';
		}
		data.autoCompleteUrl = data.homePageUrl + data.autoCompleteUrl + modifiedLocale + '/{catId}/{locId}/{value}';
		data.geoLocatorUrl = data.homePageUrl + data.geoLocatorUrl + modifiedLocale + '/{lat}/{lng}';
		data.rootGeoLocatorUrl = data.homePageUrl + data.rootGeoLocatorUrl + modifiedLocale + '/0/category/0';
	}

//Build CSS
	buildCss(data) {

		let b2dot0Ver = 'v1'; //by default

		data.iconsCSSURLs = [];
		data.iconsCSSFallbackUrl = [];
		data.iconsCSSURLs.push(`${data.baseCSSUrl}${this.locale}/icons.css`);
		data.iconsCSSFallbackUrl.push(`${data.baseCSSUrl}${this.locale}/fallback.css`);

		if (b2dot0Ver === 'v1') {
			//TODO: remove this when v1 will not exist in our platform
			if (deviceDetection.isMobile()) {
				data.localeCSSPath = data.baseCSSUrl + 'mobile/' + b2dot0Ver + '/' + this.brandName + '/' + this.country + '/' + this.locale;
			} else {
				data.localeCSSPath = data.baseCSSUrl + 'all/' + b2dot0Ver + '/' + this.brandName + '/' + this.country + '/' + this.locale;
			}
			data.localeCSSPathHack = data.baseCSSUrl + 'all/' + b2dot0Ver + '/' + this.brandName + '/' + this.country + '/' + this.locale;
		} else {
			if (deviceDetection.isMobile()) {
				data.localeCSSPath = data.baseCSSUrl + b2dot0Ver + '/' + this.brandName + '/' + this.country + '/' + this.locale;
			} else {
				data.localeCSSPath = data.baseCSSUrl + b2dot0Ver + '/' + this.brandName + '/' + this.country + '/' + this.locale;
			}
			data.localeCSSPathHack = data.baseCSSUrl + b2dot0Ver + '/' + this.brandName + '/' + this.country + '/' + this.locale;
		}

		data.containerCSS = [];
		if (data.min) {
			data.containerCSS.push(data.localeCSSPath + '/Main.min.css');
		} else {
			data.containerCSS.push(data.localeCSSPath + '/Main.css');
		}
	}

//Build opengraph
	buildOpengraph(data) {

		data.brandName = this.brandName;
		data.countryName = this.country;
		data.logoUrl = data.baseImageUrl + this.locale + '/logo.png';
		data.logoUrlOpenGraph = data.baseImageUrl + this.locale + '/logoOpenGraph.png';
	}

//Build Profile
	buildProfile(data) {

		if (data.username) {
			data.profileName = data.username;
		}

		if (data.socialMedia) {
			if (data.socialMedia.profileName && data.socialMedia.profileName.length > 0) {
				data.profileName = data.socialMedia.profileName;
			}
			if (data.socialMedia.type === 'FACEBOOK') {
				data.smallFbProfileImageUrl = 'https://graph.facebook.com/' + data.socialMedia.id + '/picture?width=36&height=36';
				data.publishPostUrl = 'https://graph.facebook.com/' + data.socialMedia.id + '/feed?access_token=' + data.socialMedia.accessToken;
			}
		}

		if (data.userProfileImageUrl) {
			data.profilePictureCropUrl = 'https://img.classistatic.com/crop/50x50/' + data.userProfileImageUrl.replace('https://www', '').replace('https://', '').replace('www', '').replace('http://www', '').replace('http://', '').replace('www', '');
		}
	}
}

module.exports = HeaderModel;
