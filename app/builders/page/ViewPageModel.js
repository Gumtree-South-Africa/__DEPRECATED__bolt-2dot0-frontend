'use strict';
let cwd = process.cwd();

let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
let AdvertModel = require(cwd + '/app/builders/common/AdvertModel');
let AttributeModel = require(cwd + '/app/builders/common/AttributeModel.js');
let KeywordModel= require(cwd + '/app/builders/common/KeywordModel');
let SeoModel = require(cwd + '/app/builders/common/SeoModel');
let SafetyTipsModel = require(cwd + '/app/builders/common/SafetyTipsModel');
let AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');
let StringUtils = require(cwd + '/app/utils/StringUtils');

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
				attr ['name'] = customAttributeObj.localizedName;
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

	mapData(modelData, data) {
		modelData = _.extend(modelData, data);
		modelData.header = data.common.header || {};
		modelData.footer = data.common.footer || {};
		modelData.safetyTips.safetyLink = this.bapiConfigData.content.homepageV2.safetyLink;
		modelData.seo = data['seo'] || {};

		modelData.header.viewPageUrl = modelData.header.homePageUrl + this.req.originalUrl;
		modelData.vip = {};
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
					flags: advertData.adFlags,
					map: {
						defaultRadius: 2000, //2.0km default kilometers
						passedRadius: 2000
					}
				};

				// Merge Bapi Ad data
				_.extend(data, advertData.ad);

				// // TODO: Check if seoVipUrl matches the originalUrl if the seoURL came in. If it doesnt, redirect to the correct seoVipUrl
				// if (this.req.app.locals.isSeoUrl === true) {
				// 	let originalSeoUrl = this.req.originalUrl;
				// 	let seoVipElt = data._links.find((elt) => {
				// 		return elt.rel === "seoVipUrl";
				// 	});
				// 	let dataSeoVipUrl = seoVipElt.href;
				// 	if (originalSeoUrl !== dataSeoVipUrl) {
				// 		res.redirect(dataSeoVipUrl);
				// 		return;
				// 	}
				// 	data.seoVipUrl = dataSeoVipUrl;
				// }

				// Manipulate Ad Data

				// Date
				data.postedDate = Math.round((new Date().getTime() - new Date(data.postedDate).getTime())/(24*3600*1000));
				data.updatedDate = Math.round((new Date().getTime() - new Date(data.lastUserEditDate).getTime())/(24*3600*1000));

				// Pictures
				data.hasMultiplePictures = false;
				data.picturesToDisplay = { thumbnails: [], images: [], largestPictures: [], testPictures: []};
				if (typeof data.pictures!=='undefined' && typeof data.pictures.sizeUrls!=='undefined') {
					data.hasMultiplePictures = data.pictures.sizeUrls.length>1;
					_.each(data.pictures.sizeUrls, (picture) => {
						let pic = picture['LARGE'];
						data.picturesToDisplay.thumbnails.push(pic.replace('$_19.JPG', '$_14.JPG'));
						data.picturesToDisplay.images.push(pic.replace('$_19.JPG', '$_25.JPG'));
						data.picturesToDisplay.largestPictures.push(pic.replace('$_19.JPG', '$_20.JPG'));
						data.picturesToDisplay.testPictures.push(pic.replace('$_19.JPG', '$_20.JPG'));
					});
				}

				// Seller Picture
				if (typeof data.sellerDetails!=='undefined' && typeof data.sellerDetails.publicDetails!=='undefined' && typeof data.sellerDetails.publicDetails.picture!=='undefined') {
					_.each(data.sellerDetails.publicDetails.picture, (profilePicture) => {
						if (profilePicture.size === 'LARGE') {
							let picUrl = profilePicture.url;
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
				data.ogSignedUrl = "https://maps.googleapis.com/maps/api/staticmap?center=-32.707145,26.295239&zoom=13&size=300x300&sensor=false&markers=color:orange%7C-32.707145,26.295239&client=gme-marktplaats&channel=bt_za&signature=uC2V76Pe_CI5VmRtRXxmdgkO0YQ=";
				data.siteLanguage = this.locale.split('_')[0];

				var findStr = "center=";
				var searchString = data.ogSignedUrl;
				var endOf = -1;
				endOf = searchString.lastIndexOf(findStr) > 0 ? searchString.lastIndexOf(findStr) + findStr.length : endOf;
				var center = searchString.slice(endOf, searchString.indexOf('&')).split(',');
				data.map.locationLat = center[0];
				data.map.locationLong = center[1];

				data.map.finalRadius;
				if(data.map.passedRadius === 0){
					data.map.showPin = true;
					data.map.showCircle = false;
				} else if(data.map.passedRadius === null || data.map.passedRadius === undefined) {
					data.map.showCircle = true;
					data.map.finalRadius = data.map.defaultRadius;
					data.map.showPin = false;
				} else {
					data.map.finalRadius = data.map.passedRadius;
					data.map.showCircle = true;
					data.map.showPin = false;
				}

				// Location
				let locationElt = data._links.find( (elt) => {
					return elt.rel === "location";
				});
				data.locationId = locationElt.href.substring(locationElt.href.lastIndexOf('/') + 1);

				// Category
				let categoryElt = data._links.find( (elt) => {
					return elt.rel === "category";
				});
				data.categoryId = categoryElt.href.substring(categoryElt.href.lastIndexOf('/') + 1);

				// Category Attributes
				data.categoryCurrentHierarchy = [];
				// this.getCategoryHierarchy(modelData.categoryAll, data.categoryId, data.categoryCurrentHierarchy);
				return attributeModel.getAllAttributes(data.categoryId).then((attributes) => {
					_.extend(data, attributeModel.processCustomAttributesList(attributes, data));
					this.prepareDisplayAttributes(data);
					return data;
				});
			});
		};

		this.dataPromiseFunctionMap.keywords = () => {
			return keywordModel.resolveAllSettledPromises().then((results) => {
				let keywordPromiseArray = ['top', 'trending', 'suggested'];
				let keywordData = {};
				let keywordIndex = 0;
				_.each(results, (result) => {
					if (result.state === "fulfilled") {
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
	}
}

module.exports = ViewPageModel;
