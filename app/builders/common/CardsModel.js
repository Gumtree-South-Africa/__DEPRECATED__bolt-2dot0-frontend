'use strict';


// cards are UI elements that can be in pages, they are configuration driven
let cardsConfig = require(process.cwd() + '/app/config/ui/cardsConfig.json');
let cardService = require(process.cwd() + '/server/services/cardService');

// size mapping is now done on client via javascript, responsively



class CardsModel {

	constructor(bapiHeaderValues) {
		this.bapiHeaderValues = bapiHeaderValues;

		this.cardsToPageMap = cardsConfig.cardsByPage;
		this.cardToConfigMap = cardsConfig.cards;
		// todo: validate stuff:
		// todo: validate the number of items requested, that we have size map of appropriate length
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

		return cardService.getCardItemsData(this.bapiHeaderValues, cardConfig.queryEndpoint, apiParams).then((bapiResult) => {
			return this.transformData(cardConfig, bapiResult);
		}).fail((bapiErr) => {
			console.warn(`Error getting BAPI card data ${bapiErr}`);
			return cardService.getCachedTrendingCard(this.bapiHeaderValues).then((cachedResult) => {
				cachedResult = (cachedResult !== undefined) ? cachedResult : {};
				return this.transformData(cardConfig, cachedResult);
			}).fail((cacheErr) => {
				if (cacheErr.status) {
					console.warn(cacheErr.message);
				} else {
					console.warn(`Error getting Cache card data ${cacheErr}`);
				}
				return {};
			});
		});
	}

	transformData(cardConfig, dataItems) {

		dataItems.ads.forEach((ad, index) => {
			// todo: featured mapping algorithm, for now just a placeholder
			if (ad.id === 1234567890) {
				ad.featured = true;
			}
		});

		return dataItems;
	}

	/**
	 * gets the config for the specified card
	 * @param cardName
	 * @return {Object} one cards config, see app/config/ui/cardsConfig.json
	 */
	getCardConfigForCard(cardName) {
		return this.cardToConfigMap[cardName];
	}

	/**
	 * gets the template config for the specified card
	 * @param cardName
	 * @return {Object} one cards config, see app/config/ui/cardsConfig.json
	 */
	getTemplateConfigForCard(cardName) {
		return this.cardToConfigMap[cardName].templateConfig;
	}
}

module.exports = CardsModel;
