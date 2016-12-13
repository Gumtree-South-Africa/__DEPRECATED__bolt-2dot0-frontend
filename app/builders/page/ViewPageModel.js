'use strict';
let cwd = process.cwd();

let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let cardsConfig = require(cwd + '/app/config/ui/cardsConfig.json');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
let AdvertModel = require(cwd + '/app/builders/common/AdvertModel');
let AttributeModel = require(cwd + '/app/builders/common/AttributeModel.js');
let KeywordModel= require(cwd + '/app/builders/common/KeywordModel');
let SeoModel = require(cwd + '/app/builders/common/SeoModel');
let SafetyTipsModel = require(cwd + '/app/builders/common/SafetyTipsModel');
let AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');
let StringUtils = require(cwd + '/app/utils/StringUtils');
let _ = require('underscore');
let displayAttributesConfig = require(cwd + '/app/config/ui/displayAttributesConfig.json');

class ViewPageModel {
	constructor(req, res, adId) {
		this.req = req;
		this.res = res;
		this.adId = adId;

		this.prodEpsMode = this.req.app.locals.prodEpsMode;
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
			this.modelData.header.postAdHeader = true;
  		this.modelData.backUrl = modelData.advert.categoryPath[parseInt(modelData.advert.categoryPath.length) - 1].href;
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
	 * Map Data
	 * @param signedMapUrl
	 * @returns {{defaultRadius: number, passedRadius: number}}
	 */
	getMapFromSignedUrl(signedMapUrl) {
		let map = {
			defaultRadius: 2000, //2.0km default kilometers
			passedRadius: 2000
		};

		if (typeof signedMapUrl !== 'undefined') {
			let findStr = "center=";
			let endOf = -1;
			endOf = signedMapUrl.lastIndexOf(findStr) > 0 ? signedMapUrl.lastIndexOf(findStr) + findStr.length : endOf;
			let center = signedMapUrl.slice(endOf, signedMapUrl.indexOf('&')).split(',');

			map.locationLat = center[0];
			map.locationLong = center[1];

			if (map.passedRadius === 0) {
				map.showPin = true;
				map.showCircle = false;
			} else if (map.passedRadius === null || map.passedRadius === undefined) {
				map.showCircle = true;
				map.finalRadius = map.defaultRadius;
				map.showPin = false;
			} else {
				map.finalRadius = map.passedRadius;
				map.showCircle = true;
				map.showPin = false;
			}
		}

		return map;
	}

	/**
	 * a function to walkdown the tree and return a path array
	 * @param tree
	 * @returns {Array}
	 */
	getPathFromTree(tree) {
		let path = [];
		let level = 0;
		while(tree !== 'undefined') {
			path[level] = {
				id: tree.id,
				localizedName: tree.localizedName,
				localizedMobileName: tree.localizedMobileName,
				lat: tree.latitude,
				long: tree.longitude
			};
			let searchElt = tree._links.find( (elt) => {
				return elt.rel === "search";
			});
			path[level++].href = searchElt.href;
			tree = tree['children'];
			if (typeof tree === 'undefined' || _.isEmpty(tree)) break;
			tree = tree[0];
		}
		return path;
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

	/**
	 * Prepare the display of attributes
	 * @param data
	 */
	prepareDisplayAttributes(data) {
		data.displayAttributes = [];
		_.each(data.attributes, (attribute) => {
			let customAttributeObj = _.find(data.customAttributes, (customAttribute) => {
				return customAttribute.name === attribute.name;
			});
			if (typeof customAttributeObj !== 'undefined') {
				let attr = {};
				// name
				attr ['name'] = customAttributeObj.localizedName;
				// attrName
				attr ['attrName'] = customAttributeObj.name;
				// attrValue
				switch (customAttributeObj.allowedValueType) {
					case 'NUMBER':
						attr ['value'] = attribute.value.attributeValue;
						break;
					case 'LIST':
						_.each(customAttributeObj.allowedValues, (allowedValues) => {
							if (allowedValues.value == attribute.value.attributeValue) {
								attr ['value'] = allowedValues.localizedValue;
							}
						});
						break;
					case 'DATE':
						attr ['value'] = StringUtils.formatDate(attribute.value.attributeValue);
						break;
					default:
						attr ['value'] = '';
				}
				data.displayAttributes.push(attr);
			}
		});
	}

	/**
	 * Order Ad Attributes
	 * @param inputArr
	 * @param locale
	 * @param categoryId
	 * @returns {*}
	 */
	orderAndLinkAttributes(inputArr, locale, categoryId, seoUrls) {
		let inputLocaleObj = displayAttributesConfig[locale];
		let inputCategoryIdArr = inputLocaleObj[categoryId] || [];
		let newArr = [];

		if (inputCategoryIdArr.length > 0) {
			for (let i = 0; i < inputCategoryIdArr.length; i++) {
				let arrIndex = _.findIndex(inputArr, {
					attrName: inputCategoryIdArr[i]
				});
				if(arrIndex !== -1) {
					let attr = JSON.parse(JSON.stringify(inputArr[arrIndex]));
					// capsName
					attr.capsName = attr.name.toUpperCase();
					// seoUrl link
					if (typeof seoUrls !== 'undefined') {
						_.each(seoUrls.makeModel, (makeModel) => {
							if (makeModel.text === attr.value) {
								if (attr.attrName === 'AlmVehicleBrand') {
									let makeModelElt = makeModel._links.find( (elt) => {
										return elt.rel === "search";
									});
									attr.seoUrl = makeModelElt.href;
								}
								if (attr.attrName === 'AlmVehicleModel') {
									let makeModelElt = makeModel._links.find( (elt) => {
										return elt.rel === "search";
									});
									attr.seoUrl = makeModelElt.href;
								}
							}
						});
					}
					newArr.push(attr);
				} else {
					continue;
				}
			}
			return newArr;
		} else {
			return inputArr;
		}
	}

	/**
	 * Similar / Seller Other Ads Data
	 * @param data
	 * @returns {*}
	 */
	getOtherAdsCard(data) {
		data.similars.config = cardsConfig.cards.similarCardTab.templateConfig;
		data.sellerOtherAds.config = cardsConfig.cards.sellerOtherCardTab.templateConfig;
		data.similars.moreDataAvailable = false;
		data.sellerOtherAds.moreDataAvailable = false;

		if (typeof data.similars.ads !== 'undefined') {
			if (data.similars.ads.length > cardsConfig.cards.similarCardTab.templateConfig.viewMorePageSize) {
				data.similars.moreDataAvailable = true;
				data.similars.viemMoreLink = data.breadcrumbs.categories.slice(-1);
			}
			data.similars.ads = data.similars.ads.slice(0, cardsConfig.cards.similarCardTab.templateConfig.viewMorePageSize);
			if (!this.req.app.locals.prodEpsMode) {
				data.similars.ads = JSON.parse(JSON.stringify(data.similars.ads).replace(/i\.ebayimg\.sandbox\.ebay\.com/g, 'i.sandbox.ebayimg.com'));
			}
		}

		if (typeof data.sellerOtherAds.ads !== 'undefined') {
			if (data.sellerOtherAds.ads.length > cardsConfig.cards.sellerOtherCardTab.templateConfig.viewMorePageSize) {
				data.sellerOtherAds.moreDataAvailable = true;
			}
			data.sellerOtherAds.ads = data.sellerOtherAds.ads.slice(0, cardsConfig.cards.sellerOtherCardTab.templateConfig.viewMorePageSize);
			if (!this.req.app.locals.prodEpsMode) {
				data.sellerOtherAds.ads = JSON.parse(JSON.stringify(data.sellerOtherAds.ads).replace(/i\.ebayimg\.sandbox\.ebay\.com/g, 'i.sandbox.ebayimg.com'));
			}
		}

		return data;
	}

	mapData(modelData, data) {
		modelData = _.extend(modelData, data);
		modelData.header = data.common.header || {};
		modelData.footer = data.common.footer || {};
		modelData.safetyTips.safetyLink = this.bapiConfigData.content.homepageV2.safetyLink;
		modelData.seo = data['seo'] || {};
		modelData.dataLayer = data['common'].dataLayer || {};
		modelData.header.viewPageUrl = modelData.header.homePageUrl + this.req.originalUrl;

		modelData.vip = {};
		modelData.vip.showSellerStuff = false;
		if ((typeof modelData.header.id!=='undefined') && (typeof modelData.advert.sellerDetails.id!=='undefined') && (modelData.header.id === modelData.advert.sellerDetails.id)) {
			modelData.vip.showSellerStuff = true;
		}
		modelData.vip.payWithShepherd = this.bapiConfigData.content.vip.payWithShepherd;

		return modelData;
	}

	getPageDataFunctions(modelData) {
		let advertModel = new AdvertModel(modelData.bapiHeaders);
		let advertModelBuilder = advertModel.getModelBuilder(this.adId);
		let attributeModel = new AttributeModel(modelData.bapiHeaders);
		let keywordModel = (new KeywordModel(modelData.bapiHeaders, this.bapiConfigData.content.vip.defaultKeywordsCount)).getModelBuilder(this.adId);
		let safetyTipsModel = new SafetyTipsModel(this.req, this.res);
		let seo = new SeoModel(modelData.bapiHeaders);

		this.dataPromiseFunctionMap = {};

		this.dataPromiseFunctionMap.advert = () => {
			return advertModelBuilder.resolveAllSettledPromises().then((results) => {
				let advertPromiseArray = ['ad', 'adFeatures', 'adStatistics', 'adSellerDetails', 'adSimilars', 'adSellerOthers', 'adSeoUrls', 'adFlags'];
				let advertData = {};
				let advertIndex = 0;
				_.each(results, (result) => {
					if (result.state === "fulfilled") {
						let value = result.value;
						advertData[advertPromiseArray[advertIndex]] = value;
					} else {
						let reason = result.reason;
						console.error('Error in Ad Service : ', reason);
						advertData[advertPromiseArray[advertIndex]] = {};
					}
					++advertIndex;
				});

				// Basic Data for Ad Display
				let data = {
					adId: this.adId,
					editUrl: "/edit/" + this.adId,
					seoGroupName: 'Automobiles',
					postedBy: 'Owner',
					features: advertData.adFeatures,
					sellerDetails: advertData.adSellerDetails,
					statistics: advertData.adStatistics,
					similars: advertData.adSimilars,
					sellerOtherAds: advertData.adSellerOthers,
					seoUrls: advertData.adSeoUrls,
					flags: advertData.adFlags
				};

				// Merge Bapi Ad data
				_.extend(data, advertData.ad);

				// Manipulate Ad Data

				// seoVipUrl
				let seoVipElt = data._links.find((elt) => {
					return elt.rel === "seoVipUrl";
				});
				let dataSeoVipUrl = seoVipElt.href;
				data.seoVipUrl = dataSeoVipUrl;

				// Date
				data.postedDate = Math.round((new Date().getTime() - new Date(data.postedDate).getTime())/(24*3600*1000));
				data.updatedDate = Math.round((new Date().getTime() - new Date(data.lastUserEditDate).getTime())/(24*3600*1000));

				// Pictures
				data.hasMultiplePictures = false;
				data.picturesToDisplay = { thumbnails: [], images: [], largestPictures: [], testPictures: []};
				if (typeof data.pictures!=='undefined' && typeof data.pictures.sizeUrls!=='undefined') {
					data.hasMultiplePictures = data.pictures.sizeUrls.length>1;
					_.each(data.pictures.sizeUrls, (picture) => {
						let picUrl = picture['LARGE'];
						if (!this.prodEpsMode) {
							picUrl = JSON.parse(JSON.stringify(picUrl).replace(/i\.ebayimg\.sandbox\.ebay\.com/g, 'i.sandbox.ebayimg.com'));
						}

						data.picturesToDisplay.thumbnails.push(picUrl.replace('$_19.JPG', '$_14.JPG'));
						data.picturesToDisplay.images.push(picUrl.replace('$_19.JPG', '$_25.JPG'));
						data.picturesToDisplay.largestPictures.push(picUrl.replace('$_19.JPG', '$_20.JPG'));
						data.picturesToDisplay.testPictures.push(picUrl.replace('$_19.JPG', '$_20.JPG'));
					});
				}

				// Seller Picture
				if (typeof data.sellerDetails!=='undefined' && typeof data.sellerDetails.publicDetails!=='undefined' && typeof data.sellerDetails.publicDetails.picture!=='undefined') {
					_.each(data.sellerDetails.publicDetails.picture, (profilePicture) => {
						if (profilePicture.size === 'LARGE') {
							let picUrl = profilePicture.url;
							if (!this.prodEpsMode) {
								picUrl = JSON.parse(JSON.stringify(picUrl).replace(/i\.ebayimg\.sandbox\.ebay\.com/g, 'i.sandbox.ebayimg.com'));
							}
							picUrl = picUrl.replace('$_20.JPG', '$_14.JPG');
							data.sellerDetails.publicDetails.displayPicture = picUrl;
						}
					});
				}

				// Seller Contact
				if (typeof data.sellerDetails.contactInfo !== 'undefined' && typeof data.sellerDetails.contactInfo.phone !== 'undefined') {
					data.sellerDetails.contactInfo.phoneHiddenNumber = data.sellerDetails.contactInfo.phone.split('-')[0] + '*******';
				}

				// Map
				data.map = this.getMapFromSignedUrl(data.signedMapUrl);

				// Breadcrumbs
				data.breadcrumbs = {};
				data.breadcrumbs.locations = _.sortBy(data.seoUrls.locations, 'level');
				data.breadcrumbs.leafLocation = data.breadcrumbs.locations.pop();
				data.breadcrumbs.locations.forEach((location, index) => {
				  location.position = index + 1;
				});
				data.breadcrumbs.categories = _.sortBy(data.seoUrls.categoryLocation, 'level');
				data.breadcrumbs.categories.forEach((category, index) => {
				  category.position = data.breadcrumbs.locations.length + index + 1;
				  category.locationInText = data.breadcrumbs.leafLocation.text;
				});

				// Location
				let locationElt = data._links.find( (elt) => {
					return elt.rel === "location";
				});
				data.locationId = locationElt.href.substring(locationElt.href.lastIndexOf('/') + 1);
				data.locationPath = this.getPathFromTree(data._embedded.location);
				if (!_.isEmpty(data.locationPath)) {
					data.locationDisplayName = data.locationPath[data.locationPath.length-1].localizedName;
					data.locationDisplayHref = data.locationPath[data.locationPath.length-1].href;
				}

				// Category
				let categoryElt = data._links.find( (elt) => {
					return elt.rel === "category";
				});
				data.categoryId = categoryElt.href.substring(categoryElt.href.lastIndexOf('/') + 1);
				data.categoryPath = this.getPathFromTree(data._embedded.category);

				// Category Attributes
				data.categoryCurrentHierarchy = [];
				this.getCategoryHierarchy(modelData.categoryAll, data.categoryId, data.categoryCurrentHierarchy);

				// Similar-Ads/Seller-Other-Ads configuration
				this.getOtherAdsCard(data);

				return attributeModel.getAllAttributes(data.categoryId).then((attributes) => {
					_.extend(data, attributeModel.processCustomAttributesList(attributes, data));
					this.prepareDisplayAttributes(data);
					data.orderedAttributes = this.orderAndLinkAttributes(data.displayAttributes, this.locale, data.categoryId, data.seoUrls);
					return data;
				});
			});
		};

		this.dataPromiseFunctionMap.keywords = () => {
			return keywordModel.resolveAllSettledPromises().then((results) => {
				let keywordPromiseArray = ['top', 'trending', 'suggested'];
				let keywordTitles = ['home.popular.searches', 'home.trending-searches', 'home.suggested-searches'];
				let keywordData = {};
				let keywordIndex = 0;
				_.each(results, (result) => {
					if (result.state === "fulfilled") {
						result.value.menuTitles = keywordTitles;
						result.value.total = results.length;
						let value = result.value;
						keywordData[keywordPromiseArray[keywordIndex]] = value;
					} else {
						let reason = result.reason;
						console.error('Error in Keyword Service : ', reason);
						keywordData[keywordPromiseArray[keywordIndex]] = {};
					}
					++keywordIndex;
				});
				return keywordData;
			}).fail((err) => {
				console.warn(`error getting keywords data ${err}`);
				return {};
			});
		};

		this.dataPromiseFunctionMap.safetyTips = () => {
			return safetyTipsModel.getSafetyTips();
		};

		this.dataPromiseFunctionMap.seo = () => {
			return seo.getVIPSeoInfo();
		};

		this.dataPromiseFunctionMap.flagAd = () => "flagAd";
	}
}

module.exports = ViewPageModel;
