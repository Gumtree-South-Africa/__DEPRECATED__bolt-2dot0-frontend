'use strict';

let _ = require('underscore');
let ErrorPageModel = require(process.cwd() +  '/app/builders/page/ErrorPageModel');
let deviceDetection = require(process.cwd() + '/modules/device-detection');
let pagetypeJson = require(process.cwd() + '/app/config/pagetype.json');


let error = {
	/**
	 * Special header data for HomePage
	 */
	extendHeaderData : function(modelData, b2dot0Version) {
		// SEO
		modelData.header.pageType = modelData.pagename;
		modelData.header.canonical = modelData.header.homePageUrl;
		modelData.header.pageUrl = modelData.header.homePageUrl;
		if (modelData.header.seoDeepLinkingBaseUrlAndroid) {
			modelData.header.seoDeeplinkingUrlAndroid = modelData.header.seoDeepLinkingBaseUrlAndroid + 'home';
		}

		// CSS
		modelData.header.pageCSSUrl = modelData.header.baseCSSUrl + 'HomePage.css';
		if (modelData.header.min) {
			if (deviceDetection.isHomePageDevice() && !b2dot0Version) {
				modelData.header.containerCSS.push(modelData.header.localeCSSPathHack + '/HomePageHack.min.css');
			} else {
				modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/HomePage.min.css');
			}
		} else {
			if (deviceDetection.isHomePageDevice() && !b2dot0Version) {
				modelData.header.containerCSS.push(modelData.header.localeCSSPathHack + '/HomePageHack.css');
			} else {
				modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/HomePage.css');
			}
		}
	},

	/**
	 * Special footer data for HomePage
	 */
	extendFooterData : function(modelData, b2dot0Version) {
		if (b2dot0Version) {
			modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + 'HomePageV2Legacy.min.js');
			if (!modelData.footer.min) {
				if (modelData.header.enableLighterVersionForMobile) {
					modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + `HomePage_mobile_${modelData.locale}.js`);
				} else {
					modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + `HomePage_desktop_${modelData.locale}.js`);
				}
			} else {
				if (modelData.header.enableLighterVersionForMobile) {
					modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + `HomePage_mobile_${modelData.locale}.js`);
				} else {
					modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + `HomePage_desktop_${modelData.locale}.js`);
				}
			}
		} else {
			modelData.footer.pageJSUrl = modelData.footer.baseJSUrl + 'HomePage.js';
			if (!modelData.footer.min) {
				modelData.footer.javascripts.push(modelData.footer.baseJSUrl + 'common/CategoryList.js');
				if (! modelData.header.enableLighterVersionForMobile) {
					modelData.footer.javascripts.push(modelData.footer.baseJSUrl + 'HomePage/Map.js');
					modelData.footer.javascripts.push(modelData.footer.baseJSUrl + 'HomePage/CarouselExt/modernizr.js');
					modelData.footer.javascripts.push(modelData.footer.baseJSUrl + 'HomePage/CarouselExt/owl.carousel.js');
					modelData.footer.javascripts.push(modelData.footer.baseJSUrl + 'HomePage/CarouselExt/carouselExt.js');
				}
				let availableAdFeatures = modelData.footer.availableAdFeatures;
				if (typeof availableAdFeatures !== 'undefined') {
					for (let i=0; i<availableAdFeatures.length; i++) {
						if (availableAdFeatures[i] === 'HOME_PAGE_GALLERY') {
							modelData.footer.javascripts.push(modelData.footer.baseJSUrl + 'widgets/carousel.js');
						}
					}
				}
			} else {
				if (modelData.header.enableLighterVersionForMobile) {
					modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + 'HomePage_' + modelData.locale + '_light.min.js');
				} else {
					modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + 'HomePage_' + modelData.locale + '.min.js');
				}
			}
		}
	}
};


/**
 * Build ErrorPage Model Data and Render
 */
module.exports.message = function(req, res) {
    // get the error status number
    let errNum = res.locals.err.status,
        errMsg;
    if (errNum === 404 || errNum === 500  || errNum === 410) {
        errMsg = 'error' + parseInt(errNum, 10) + '.message';
    } else {
        errMsg = '';
    }

 	// Set pagetype in request
	if (errNum === 404) {
		req.pagetype = pagetypeJson.pagetype.ERROR_404;
	} else if (errNum === 410) {
		req.pagetype = pagetypeJson.pagetype.ERROR_410;
	} else if (errNum === 500) {
		req.pagetype = pagetypeJson.pagetype.ERROR_505;
	}

    // Build Model Data
	if (typeof res.locals.config !== 'undefined') {
		let modelData =
		{
			env: 'public',
			locale: res.locals.config.locale,
			country: res.locals.config.country,
			site: res.locals.config.name,
			pagename: req.pagetype,
			err: errMsg
		};

		// Retrieve Data from Model Builders
		let model = new ErrorPageModel(req, res);
		model.populateData().then(function(result) {
			// Data from BAPI
			//  Device data for handlebars
			_.extend(modelData, result);
			modelData.device = req.app.locals.deviceInfo;

			// Special Data needed for HomePage in header, footer, content
			error.extendHeaderData(modelData, res.locals.b2dot0PageVersion);
			error.extendFooterData(modelData, res.locals.b2dot0PageVersion);

			// Render
			// res.statusCode = errNum;
			res.render('error/views/hbs/error_' + res.locals.config.locale, modelData);
		});
	} else {
		let modelData =
		{
			env: 'public',
			pagename: req.pagetype,
			err: errMsg
		};
		res.send('We\u2019re sorry, this page does not exist. Please add the domain in the Host Header.');
	}
};

