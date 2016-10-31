'use strict';
let cwd = process.cwd();

let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
// let AdvertModel = require(cwd + '/app/builders/common/AdvertModel');
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
	mapData(modelData, data) {
		modelData = _.extend(modelData, data);
		modelData.header = data.common.header || {};
		modelData.footer = data.common.footer || {};
		modelData.seo = data['seo'] || {};

		return modelData;
	}

	getPageDataFunctions(modelData) {
		// let advert = new AdvertModel(modelData.bapiHeaders);
		let seo = new SeoModel(modelData.bapiHeaders);

		this.dataPromiseFunctionMap = {};

		this.dataPromiseFunctionMap.advert = () => {
			let data = {
				title: 'Honda Accord EX-L v6',
				adId: this.adId,
				viewSeoUrl: "/a-venta-autos/coyoacan/anuncio-publicado-por-usernameischangedtest" + this.adId,
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
				postedBy: 'Owner'
			};
			//TODO: check to see if userId matches header data's userID to show favorite or edit
			data.isOwnerAd = false;

			//TODO: check to see if additional attributes should be displayed based on specific categories
			data.displayMoreAttributes = true;

			return data;
			// return advert.viewTheAd(this.adId).then((data) => {
			// 	return data;
			// });
		};

		this.dataPromiseFunctionMap.seo = () => {
			return seo.getVIPSeoInfo();
		};
	}
}

module.exports = ViewPageModel;
