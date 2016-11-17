'use strict';
let cwd = process.cwd();

let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
// let AdvertModel = require(cwd + '/app/builders/common/AdvertModel');
let SeoModel = require(cwd + '/app/builders/common/SeoModel');
let KeywordModel= require(cwd + '/app/builders/common/KeywordModel');
let LocationModel = require(cwd + '/app/builders/common/LocationModel');
let AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');

let _ = require('underscore');

class ViewPageModel {
	constructor(req, res, adId) {
		this.req = req;
		this.res = res;
		this.adId = adId;

		this.fullDomainName = res.locals.config.hostname;
		this.bapiConfigData = this.res.locals.config.bapiConfigData;
		this.baseDomainSuffix = res.locals.config.baseDomainSuffix;
		this.basePort = res.locals.config.basePort;
		this.locale = res.locals.config.locale;
	}

	populateData() {
		let abstractPageModel = new AbstractPageModel(this.req, this.res);
		let pagetype = this.req.app.locals.pagetype || pagetypeJson.pagetype.VIP;
		let pageModelConfig = abstractPageModel.getPageModelConfig(this.res, pagetype);
		let modelBuilder = new ModelBuilder(this.getRegisterPageData());
		let modelData = modelBuilder.initModelData(this.res.locals, this.req.app.locals, this.req.cookies);
		this.getPageDataFunctions(modelData);
		let arrFunctions = abstractPageModel.getArrFunctionPromises(this.req, this.res, this.dataPromiseFunctionMap, pageModelConfig);
		return modelBuilder.resolveAllPromises(arrFunctions).then((data) => {
			data = abstractPageModel.convertListToObject(data, arrFunctions, modelData);
			this.modelData = this.mapData(abstractPageModel.getBaseModelData(data), data);
			return this.modelData;
		});
	}

	getRegisterPageData() {
		return [
			() => {
				return {
					'homePageUrl': this.urlProtocol + 'www.' + this.fullDomainName + this.baseDomainSuffix + this.basePort,
					'languageCode': this.locale
				};
			}
		];
	}
	mapData(modelData, data) {
		modelData = _.extend(modelData, data);
		modelData.header = data.common.header || {};
		modelData.footer = data.common.footer || {};
		modelData.seo = data['seo'] || {};

		// Changing Version of template depending of the cookie
		// Dynamic Data from BAPI
		modelData.categoryList = _.isEmpty(data['catWithLocId']) ? modelData.category : data['catWithLocId'];
		modelData.level2Location = data['level2Loc'] || {};
		modelData.initialGalleryInfo = data['gallery'] || {};

		if (data['adstatistics']) {
			modelData.totalLiveAdCount = data['adstatistics'].totalLiveAds || 0;
		}

		if (data['keyword']) {
			modelData.trendingKeywords = data['keyword'][1].keywords || null;
			modelData.topKeywords = data['keyword'][0].keywords || null;
		}

		// Make the loc level 2 (Popular locations) data null if it comes as an empty
		if (_.isEmpty(modelData.level2Location)) {
			modelData.level2Location = null;
		}

		// Check for top or trending keywords existence
		modelData.topOrTrendingKeywords = false;
		if (modelData.trendingKeywords || modelData.topKeywords) {
			modelData.topOrTrendingKeywords = true;
		}

		// Special Data needed for HomePage in header, footer, content

		// Make the location data null if it comes as an empty object from bapi
		if (_.isEmpty(modelData.location)) {
			modelData.location = null;
		}

		// Determine if we show the Popular locations container
		modelData.showPopularLocations = true;
		if (!modelData.level2Location && !modelData.location) {
			modelData.showPopularLocations = false;
		}

		return modelData;
	}

	getPageDataFunctions(modelData) {
		// let advert = new AdvertModel(modelData.bapiHeaders);

		let seo = new SeoModel(modelData.bapiHeaders);
		let locationModel = new LocationModel(modelData.bapiHeaders, 1);
		let keywordModel = (new KeywordModel(modelData.bapiHeaders, this.bapiConfigData.content.homepage.defaultKeywordsCount)).getModelBuilder();

		this.dataPromiseFunctionMap = {};

		this.dataPromiseFunctionMap.advert = () => {
			let data = {
				title: 'Honda Accord EX-L v6',
				adId: this.adId,
				editUrl: "/edit/" + this.adId,
				hasMultiplePictures: true,
				pictures: {
					thumbnails: [
						'https://i.ebayimg.com/00/s/NjQ1WDgwMA==/z/aw4AAOSwPCVX~XeE/$_14.JPG',
						'https://i.ebayimg.com/00/s/MjgwWDgwMA==/z/NMgAAOSwZJBX~XeN/$_14.JPG',
						'https://i.ebayimg.com/00/s/NDE2WDgwMA==/z/tOcAAOSwxKtX~Xeb/$_14.JPG',
						'https://i.ebayimg.com/00/s/NTY0WDgwMA==/z/k0YAAOSwmLlX~XfE/$_14.JPG',
						'https://i.ebayimg.com/00/s/NjQ1WDgwMA==/z/aw4AAOSwPCVX~XeE/$_14.JPG'
					],
					images: [
						'https://i.ebayimg.com/00/s/NjQ1WDgwMA==/z/aw4AAOSwPCVX~XeE/$_25.JPG',
						'https://i.ebayimg.com/00/s/MjgwWDgwMA==/z/NMgAAOSwZJBX~XeN/$_25.JPG',
						'https://i.ebayimg.com/00/s/NDE2WDgwMA==/z/tOcAAOSwxKtX~Xeb/$_25.JPG',
						'https://i.ebayimg.com/00/s/NTY0WDgwMA==/z/k0YAAOSwmLlX~XfE/$_25.JPG',
						'https://i.ebayimg.com/00/s/NjQ1WDgwMA==/z/aw4AAOSwPCVX~XeE/$_25.JPG'
					],
					largestPictures: [
						'https://i.ebayimg.com/00/s/NjQ1WDgwMA==/z/aw4AAOSwPCVX~XeE/$_20.JPG',
						'https://i.ebayimg.com/00/s/MjgwWDgwMA==/z/NMgAAOSwZJBX~XeN/$_20.JPG',
						'https://i.ebayimg.com/00/s/NDE2WDgwMA==/z/tOcAAOSwxKtX~Xeb/$_20.JPG',
						'https://i.ebayimg.com/00/s/NTY0WDgwMA==/z/k0YAAOSwmLlX~XfE/$_20.JPG',
						'https://i.ebayimg.com/00/s/NjQ1WDgwMA==/z/aw4AAOSwPCVX~XeE/$_20.JPG'
					],
					testPictures: [
						'https://i.ebayimg.com/00/s/NDMwWDY0MA==/z/qvAAAOSwmLlX6QqV/$_20.JPG',
						'https://i.ebayimg.com/00/s/NTMzWDgwMA==/z/gnUAAOSwPCVX6Qqk/$_20.JPG',
						'https://i.ebayimg.com/00/s/NTM0WDgwMA==/z/E0gAAOSwNRdX6Qqz/$_20.JPG',
						'https://i.ebayimg.com/00/s/NDUwWDgwMA==/z/KvAAAOSwAuZX6Qrv/$_20.JPG',
						'https://i.ebayimg.com/00/s/MzAyWDY0MA==/z/JicAAOSwTA9X6QsN/$_20.JPG',
						'https://i.ebayimg.com/00/s/MzIwWDYzMA==/z/ZIAAAOSw4shX6QtA/$_20.JPG',
						'https://i.ebayimg.com/00/s/NjAwWDgwMA==/z/kJIAAOSw8w1X6QtR/$_20.JPG',
						'https://i.ebayimg.com/00/s/MjUwWDUwMA==/z/73YAAOSw8gVX6Qts/$_20.JPG',
						'https://i.ebayimg.com/00/s/NDAwWDY0MA==/z/8m8AAOSw8gVX6Qt9/$_20.JPG',
						'https://i.ebayimg.com/00/s/NDAwWDY2MA==/z/GYEAAOSwzaJX6Qus/$_20.JPG'
					]

				},
				seoGroupName: 'Automobiles',
				seoVipUrl: '/a-venta+camionetas/canitas-de-felipe-pescador/anuncio-publicado-por-lenny-test-test-etst-test-test/1001102366130910000020009',
				userId: 'testUser123',
				adTitle: 'Cozy 3 Bedroom Apartment',
				price: '$150',
				posted: '3 days ago',
				priAttributes: {
					BEDROOM: '3',
					SIZE: '700 m',
					GARAGE: '2',
					BATHROOMS: '2',
					PETS: 'OK'
				},
				description: 'Cozy 3 bedroom apartment in the heart of downtown Mexico City. A quick 15 minute walked to the lively downtown scene where you can find shopping, food and all night music and dancing. First Months rent and $1500 security deposit due upon signing lease.',
				phone: '808-555-5555',
				viewCount: '44',
				repliesCount: '3',
				category: 'T1 Category Goes Here / T2 Category Goes Here / T3 Category Goes Here',
				categoryT1: 'T1 Category',
				categoryT2: 'T2 Category',
				categoryT3: 'T3 Category',
				location: 'Mexico City',
				lastUpdated: '1 Day Ago',
				postedBy: 'Owner',
				seller: {
					fname: "Diego",
					sellerAdsUrl: "https://www.vivanuncios.com.mx/u-anuncios-del-vendedor/jason-san-luis-potosi/v1u100019200p1",
					profilePicUrl: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQ8eND74terXyRmZXfyZRa6MgOSSQp55h0-69WTVQn4ab087Rwy",
					adsPosted: "14",
					adsActive: "10",
					emailVerified: true
				}
			};
			//TODO: check if it's real estate category for disclaimer
			data.showAdditionalDisclaimers = true;

			//TODO: check to see if userId matches header data's userID to show favorite or edit
			data.isOwnerAd = false;

			//TODO: check to see if additional attributes should be displayed based on specific categories
			data.displayMoreAttributes = true;

			return data;
			// return advert.viewTheAd(this.adId).then((data) => {
			// 	return data;
			// });
		};

		this.dataPromiseFunctionMap.topLocations = () => {
			return locationModel.getTopL2Locations().then((data) => {
				return data;
			}).fail((err) => {
				console.warn(`error getting topLocations data ${err}`);
				return {};
			});
		};

		this.dataPromiseFunctionMap.topSearches = () => {
			return keywordModel.resolveAllPromises().then((data) => {
				return data[0].keywords || {};
			}).fail((err) => {
				console.warn(`error getting topSearches data ${err}`);
				return {};
			});
		};

		this.dataPromiseFunctionMap.seo = () => {
			return seo.getVIPSeoInfo();
		};
	}
}

module.exports = ViewPageModel;
