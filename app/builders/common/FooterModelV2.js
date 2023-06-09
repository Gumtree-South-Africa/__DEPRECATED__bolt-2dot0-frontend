'use strict';

let config = require('config');
let _ = require('underscore');
let ModelBuilder = require('./ModelBuilder');
let StringUtils = require(process.cwd() + '/app/utils/StringUtils');
let pageurlJson = require(process.cwd() + '/app/config/pageurl.json');

class FooterV2Model {
	constructor(secure, req, res) {
		this.req = req;
		this.res = res;
		this.secure = secure;
		this.locale = res.locals.config.locale;

		this.brandName = res.locals.config.name;
		this.country = res.locals.config.country;
		this.footerConfigData = res.locals.config.bapiConfigData.footer;
		this.jsAssets = res.locals.jsAssets;
	}

	getModelBuilder() {
		return new ModelBuilder(this.getFooterData());
	}

	getFooterData() {
		return [
			() => {
				let data = {};

				// merge pageurl data
				_.extend(data, pageurlJson.footer);

				// merge footer config data from BAPI
				_.extend(data, this.footerConfigData);

				// build data
				//let urlProtocol = this.secure ? 'https://' : 'http://';
				let urlProtocol = 'https://';
				let urlHost = config.get('static.server.host') !== null ? urlProtocol + config.get('static.server.host') : '';
				let urlPort = config.get('static.server.port') !== null ? ':' + config.get('static.server.port') : '';
				let urlVersion = config.get('static.server.version') !== null ? '/' + config.get('static.server.version') : '';
				data.mainJSUrl = urlHost + urlPort + urlVersion + config.get('static.mainJSUrl');
				data.baseJSUrl = urlHost + urlPort + urlVersion + config.get('static.baseJSUrl');
				data.baseJSMinUrl = urlHost + urlPort + urlVersion + config.get('static.baseJSMinUrl');
				data.baseSVGDataUrl = urlHost + urlPort + urlVersion + config.get('static.baseSVGDataUrl');
				data.baseCSSUrl = urlHost + urlPort + urlVersion + config.get('static.baseCSSUrl');
				data.baseImageUrl = urlHost + urlPort + urlVersion + config.get('static.baseImageUrl');
				data.baseUrl = urlHost + urlPort + urlVersion + config.get('static.baseUrl');
				data.baseFontUrl = urlHost + urlPort + urlVersion + config.get('static.baseFontUrl');
				data.baseIconUrl = urlHost + urlPort + urlVersion + config.get('static.baseIconUrl');
				data.min = config.get('static.min');
				data.epsImageBaseUrl = config.get('cdn.server.eps.host');
				data.cropImageBaseUrl = config.get('cdn.server.crop.host');

				// add complex data to footer
				this.buildJs(data);
				this.buildUrl(data);

				return data;
			}
		];
	}

//Build JS
	buildJs(data) {
		data.javascripts = [
			data.baseJSMinUrl + "jQuery.min.js",
			data.baseJSMinUrl + "MainV2.min.js"
		];
	}

//Build URL
	buildUrl(data) {

		data.brandName = this.brandName;
		data.localeJSPath = '/' + this.brandName + '/' + this.country + '/' + this.locale + '/', data.countryJSPath = '/' + this.brandName + '/' + this.country + '/', data.brandJSPath = '/' + this.brandName + '/';
		data.obfuscatedCookieRightsURL = StringUtils.obfuscate(data.cookieNotice);
		data.obfuscatedPrivacyPolicyURL = StringUtils.obfuscate(data.privacyPolicy);
		data.obfuscatedTermsAndConditionsURL = StringUtils.obfuscate(data.termOfUse);
		data.locationSitemapLandingPageUrl = '/l-' + '/all-locs/v1b0';
		data.localizeApiRootUrl = '/rui-api/localize/rui/';
	}
}

module.exports = FooterV2Model;
