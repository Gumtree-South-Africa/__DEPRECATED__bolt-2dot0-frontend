'use strict';


// cards are UI elements that can be in pages, they are configuration driven
let cardsConfig = require(process.cwd() + '/app/config/ui/cardsConfig.json');
let cardService = require(process.cwd() + '/server/services/cardService');
let Q = require("q");

// size mapping is now done on client via javascript, responsively



class CardsModel {

	constructor(bapiHeaderValues, prodEpsMode) {
		this.bapiHeaderValues = bapiHeaderValues;

		this.cardsToPageMap = cardsConfig.cardsByPage;
		this.cardToConfigMap = cardsConfig.cards;
		this.prodEpsMode = prodEpsMode;
		// todo: validate card config:
		// todo: validate the number of items requested is numeric
	}

	/**
	 * Gets card names for the page specified
	 * @param pageName
	 * @returns {Array} array of card names
	 */
	getCardNamesForPage(pageName) {
		return this.cardsToPageMap[pageName];
	}

	/**
	 * gets the data for the specified card, given the params
	 * @param cardName
	 * @param paramsMap Map of key/values provided by the user for the cards's queries
	 *    expected key/values: location
	 * @returns {Promise} promise for the data requested
	 */
	getCardItemsData(cardName, paramsMap) {
		let cardConfig = this.getCardConfigForCard(cardName);
		let apiParams = Object.assign({}, cardConfig.queryParameters);

		// walk configured parameters looking for values that indicate ${UserProvided}
		// extract values for those from paramsMap

		let parameters = cardConfig.queryParameters;
		for (let paramName in parameters) {
			if (parameters.hasOwnProperty(paramName)) {
				if (parameters[paramName] === '${UserProvided}') {

					// parameters tagged this way are pulled from the params supplied by the caller
					if (paramsMap[paramName] === undefined) {
						console.error(`card ${cardName} expected user provided parameter ${paramName} but no parameter value found`);
					} else {
						apiParams[paramName] = paramsMap[paramName];
					}
				}
			}
		}

		// now walk the paramsMap and apply any overrides that may have been passed, ex: galleryApi will supply its own offset & limit
		let keys = Object.getOwnPropertyNames(paramsMap);
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			apiParams[key] = paramsMap[key];
		}

		return cardService.getCardItemsData(this.bapiHeaderValues, cardConfig.queryEndpoint, apiParams, cardConfig.cardName).then((bapiResult) => {
			return this.transformData(cardConfig, bapiResult);
		}).fail((bapiErr) => {
			// NOTE: cache is only wired for trendingSearch endpoint, but card service can invoke different endpoints
			if (cardConfig.queryEndpoint === "BAPI.endpoints.trendingSearch") {
				console.warn(`Error getting BAPI card data ${bapiErr}, going to try to get it from cache`);

				return cardService.getCachedTrendingCard(this.bapiHeaderValues).then((cachedResult) => {
					cachedResult = (cachedResult !== undefined) ? cachedResult : {};
					return this.transformData(cardConfig, cachedResult);
				}).fail((cacheErr) => {
					if (cacheErr.status) {
						console.warn(cacheErr.message);
					} else {
						console.warn(`Error getting Cache card data ${cacheErr}`);
					}
					return Q.reject(bapiErr);
				});
			} else {
				return Q.reject(bapiErr);
			}
		});
	}

	transformData(cardConfig, dataItems) {

		if (!dataItems.ads) {
			console.warn(`no ads found for card ${cardConfig.cardName}`);
			return dataItems;
		}
		// moreDataAvailable is set true for trending card (adds shown are pre-loaded), and conditional for gallery (which uses ajax)
		dataItems.moreDataAvailable = true;
		if (cardConfig.cardName === "galleryCard") {
			dataItems.moreDataAvailable = false;	// will set to true below
			if (dataItems.links) {
				for (let i = 0; i < dataItems.links.length; i++) {
					if (dataItems.links[i].rel === "next slice") {
						dataItems.moreDataAvailable = true;	// flag that we have more
					}
				}
			}

			dataItems.ads = dataItems.ads.map((ad) => {
				return {
					id: ad.id,		// short id
					adId: ad.adId,	// long id
					title: ad.title,
					price: {
						priceType: ad.priceType,
						currency: ad.currency,
						amount: ad.amount
					},
					viewSeoUrl: ad.viewPageUrl,
					pictures : [{
						size: "NORMAL",
						url: ad.primaryImgUrl
					}],
					// no special styling for gallery tiles for now
					// isGalleryTile:  true	// hbs generates a class that can be used for styling
				};
			});
		}

		dataItems.ads.forEach((ad) => {
			// todo: featured mapping algorithm, for now just a placeholder
			if (ad.id === 1234567890) {
				ad.isFeaturedTile = true;	// hbs generates a class that can be used for styling
			}
		});

		if (!this.prodEpsMode) {
			dataItems = JSON.parse(JSON.stringify(dataItems).replace(/i\.ebayimg\.sandbox\.ebay\.com/g, 'i.sandbox.ebayimg.com'));
		}

		return dataItems;
	}

	/**
	 * gets the config for the specified card
	 * @param cardName
	 * @return {Object} one cards config, see app/config/ui/cardsConfig.json
	 */
	getCardConfigForCard(cardName) {
		let config = this.cardToConfigMap[cardName];
		// add the cardName in case server consumers need it
		config.cardName = cardName;
		return config;
	}

	/**
	 * gets the template config for the specified card (this will be passed into the model)
	 * @param cardName
	 * @return {Object} one cards config, see app/config/ui/cardsConfig.json
	 */
	getTemplateConfigForCard(cardName) {
		let config = this.cardToConfigMap[cardName].templateConfig;
		// add the card name in case client consumers need it
		config.cardName = cardName;
		return config;
	}
}

module.exports = CardsModel;
