'use strict';
let cwd = process.cwd();

let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
let AdvertModel = require(cwd + '/app/builders/common/AdvertModel');
let KeywordModel= require(cwd + '/app/builders/common/KeywordModel');
let SeoModel = require(cwd + '/app/builders/common/SeoModel');
let AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');

let _ = require('underscore');

class ViewPageModel {
	constructor(req, res, adId) {
		this.req = req;
		this.res = res;
		this.adId = adId;

		this.fullDomainName = res.locals.config.hostname;
		this.baseDomainSuffix = res.locals.config.baseDomainSuffix;
		this.basePort = res.locals.config.basePort;
		this.locale = res.locals.config.locale;
		this.bapiConfigData = this.res.locals.config.bapiConfigData;
	}

	populateData() {
		let abstractPageModel = new AbstractPageModel(this.req, this.res);
		let pagetype = this.req.app.locals.pagetype || pagetypeJson.pagetype.VIP;
		let pageModelConfig = abstractPageModel.getPageModelConfig(this.res, pagetype);

		let modelBuilder = new ModelBuilder(this.getViewPageData());
		let modelData = modelBuilder.initModelData(this.res.locals, this.req.app.locals, this.req.cookies);

		this.getPageDataFunctions(modelData);
		let arrFunctions = abstractPageModel.getArrFunctionPromises(this.req, this.res, this.dataPromiseFunctionMap, pageModelConfig);

		return modelBuilder.resolveAllPromises(arrFunctions).then((data) => {
			data = abstractPageModel.convertListToObject(data, arrFunctions, modelData);
			this.modelData = this.mapData(abstractPageModel.getBaseModelData(data), data);
			return this.modelData;
		});
	}

	getViewPageData() {
		return [
			() => {
				return {
					'homePageUrl': this.urlProtocol + 'www.' + this.fullDomainName + this.baseDomainSuffix + this.basePort,
					'languageCode': this.locale
				};
			}
		];
	}

	/**
	 * a recursive function to return an array of breadcrumb category ids. (eg. [0, 30, 1110])
	 * usage:
	 * let result = []
	 * this.getCategoryHierarchy(modelData.category, 1110, result);
	 * console.log(result)
	 * @param node starts with the whole category tree
	 * @param leafId the leaf you are looking for
	 * @param stack passed by reference array ([0, 30, 1110]), this is your result
	 * @returns {*}
	 */
	getCategoryHierarchy(node, leafId, stack) {
		if (node.id === leafId) {
			stack.unshift(node.id);
			return node.parentId;
		} else {
			for (let i = 0; i < node.children.length; i++) {
				if (node.id === this.getCategoryHierarchy(node.children[i], leafId, stack)) {
					stack.unshift(node.id);
					return node.parentId;
				}
			}
		}
	}

	mapData(modelData, data) {
		modelData = _.extend(modelData, data);
		modelData.header = data.common.header || {};
		modelData.footer = data.common.footer || {};
		modelData.seo = data['seo'] || {};

		return modelData;
	}

	getPageDataFunctions(modelData) {
		let advertModel = new AdvertModel(modelData.bapiHeaders);
		let advertModelBuilder = advertModel.getModelBuilder(this.adId);
		let keywordModel = (new KeywordModel(modelData.bapiHeaders, this.bapiConfigData.content.vip.defaultKeywordsCount)).getModelBuilder(this.adId);
		let seo = new SeoModel(modelData.bapiHeaders);

		let adIdElements = advertModel.decodeLongAdId(this.adId);
		console.log('******** ', adIdElements);

		this.dataPromiseFunctionMap = {};

		this.dataPromiseFunctionMap.advert = () => {
			return advertModelBuilder.resolveAllPromises().then((bapiData) => {
				let advertData = {};
				advertData.ad = bapiData[0];
				advertData.adFeatures = bapiData[1];
				advertData.adStatistics = bapiData[2];
				advertData.adSimilars = bapiData[3];
				advertData.adSellerOthers = bapiData[4];
				advertData.adSeoUrls = bapiData[5];

				// Basic Data for Ad Display
				let data = {
					editUrl: "/edit/" + this.adId,
					seoGroupName: 'Automobiles',
					userId: 'testUser123',
					phone: '808-555-5555',
					viewCount: '44',
					repliesCount: '3',
					postedBy: 'Owner',
					seller: {
						fname: "Diego",
						sellerAdsUrl: "https://www.vivanuncios.com.mx/u-anuncios-del-vendedor/jason-san-luis-potosi/v1u100019200p1",
						profilePicUrl: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQ8eND74terXyRmZXfyZRa6MgOSSQp55h0-69WTVQn4ab087Rwy",
						adsPosted: "14",
						adsActive: "10",
						emailVerified: true
					},
					features: {},
					statistics: {},
					similars: {},
					sellerOtherAds: {},
					seoUrls: {}
				};
				//TODO: check if it's real estate category for disclaimer
				data.showAdditionalDisclaimers = true;
				//TODO: check to see if userId matches header data's userID to show favorite or edit
				data.isOwnerAd = false;
				//TODO: check to see if additional attributes should be displayed based on specific categories
				data.displayMoreAttributes = true;

				// Merge Bapi Ad data
				_.extend(data, advertData.ad);
				data.postedDate = Math.round((new Date().getTime() - new Date(data.postedDate).getTime())/(24*3600*1000));
				data.updatedDate = Math.round((new Date().getTime() - new Date(data.lastUserEditDate).getTime())/(24*3600*1000));

				data.hasMultiplePictures = (data.pictures!=='undefined' && data.pictures.sizeUrls!=='undefined' && data.pictures.sizeUrls.length>1);
				data.picturesToDisplay = { thumbnails: [], images: [], largestPictures: [], testPictures: []};
				if (data.pictures!=='undefined' && data.pictures.sizeUrls!=='undefined') {
					_.each(data.pictures.sizeUrls, (picture) => {
						let pic = picture['LARGE'];
						data.picturesToDisplay.thumbnails.push(pic.replace('$_19.JPG', '$_14.JPG'));
						data.picturesToDisplay.images.push(pic.replace('$_19.JPG', '$_25.JPG'));
						data.picturesToDisplay.largestPictures.push(pic.replace('$_19.JPG', '$_20.JPG'));
						data.picturesToDisplay.testPictures.push(pic.replace('$_19.JPG', '$_20.JPG'));
					});
				}

				data.priAttributes = [];
				_.each(data.attributes, (attribute) => {
					if (attribute.name!=='Title' && attribute.name!=='Description' && attribute.name!=='Email' && attribute.name!=='ForRentBy' && attribute.name!=='Price') {
						let attr = {};
						attr ['name'] = attribute.name;
						attr ['value'] = attribute.value.attributeValue;
						data.priAttributes.push(attr);
					}
				});

				let seoVipElt = data._links.find( (elt) => {
					return elt.rel === "seoVipUrl";
				});
				data.seoVipUrl = seoVipElt.href;
				// let categoryCurrentHierarchy = [];
				// this.getCategoryHierarchy(modelData.categoryAll, data.categoryId, categoryCurrentHierarchy);

				// Merge Bapi Ad Features data
				_.extend(data.features, advertData.adFeatures);

				// Merge Bapi Ad Statistics data
				_.extend(data.statistics, advertData.adStatistics);

				// Merge Bapi Ad Similars data
				_.extend(data.similars, advertData.adSimilars);

				// Merge Bapi Ad Seller Other Ads data
				_.extend(data.sellerOtherAds, advertData.adSellerOthers);

				// Merge Bapi Ad SEO Urls data
				_.extend(data.seoUrls, advertData.adSeoUrls);

				console.log('$$$$$$$ ', data);
				return data;
			});
		};

		this.dataPromiseFunctionMap.keywords = () => {
			return keywordModel.resolveAllPromises().then((data) => {
				let keywordsData = {};
				keywordsData.top = data[0].keywords || {};
				keywordsData.trending = data[1].keywords || {};
				keywordsData.suggested = data[2].keywords || {};
				console.log('$$$$$$$ ', keywordsData);
				return keywordsData;
			}).fail((err) => {
				console.warn(`error getting keywords data ${err}`);
				return {};
			});
		};

		this.dataPromiseFunctionMap.seo = () => {
			return seo.getVIPSeoInfo();
		};
	}
}

module.exports = ViewPageModel;
