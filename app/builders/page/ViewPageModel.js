'use strict';
let cwd = process.cwd();

let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
let AdvertModel = require(cwd + '/app/builders/common/AdvertModel');
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
		let seo = new SeoModel(modelData.bapiHeaders);

		this.dataPromiseFunctionMap = {};

		this.dataPromiseFunctionMap.advert = () => {
			return advertModel.viewTheAd(this.adId).then((bapiData) => {
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
					}
				};
				//TODO: check if it's real estate category for disclaimer
				data.showAdditionalDisclaimers = true;
				//TODO: check to see if userId matches header data's userID to show favorite or edit
				data.isOwnerAd = false;
				//TODO: check to see if additional attributes should be displayed based on specific categories
				data.displayMoreAttributes = true;

				_.extend(data, bapiData);
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
					if (attribute.name!=='Title' && attribute.name!=='Description' && attribute.name!=='Email' && attribute.name!=='ForRentBy') {
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

				console.log('$$$$$$$ ', data);
				return data;
			});
		};

		this.dataPromiseFunctionMap.seo = () => {
			return seo.getVIPSeoInfo();
		};
	}
}

module.exports = ViewPageModel;
