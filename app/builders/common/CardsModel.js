'use strict';


// cards are UI elements that can be in pages, they are configuration driven
let cardsConfig = require(process.cwd() + '/app/config/ui/cardsConfig.json');
let cardService = require(process.cwd() + '/server/services/cardService');


class CardsModel {

	constructor(bapiHeaderValues) {
		this.bapiHeaderValues = bapiHeaderValues;

		this.cardsToPageMap = cardsConfig.cardsByPage;
		this.cardToConfigMap = cardsConfig.cards;
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
	 * @param params
	 *    expected key/values: location
	 * @returns {Promise} promise for the data requested
	 */
	getCardItemsData(cardName, params) {
		let cardConfig = this.getCardConfigForCard(cardName);
		let allParams = Object.assign({}, cardConfig.queryParameters);
		// location must be provided
		allParams.location = params.location;
		return cardService.getCardItemsData(this.bapiHeaderValues, cardConfig.queryEndpoint, allParams);
	}

	/**
	 * gets the config for the specified card
	 * @param cardName
	 * @return {Object} one cards config, see app/config/ui/cardsConfig.json
	 */
	getCardConfigForCard(cardName) {
		return this.cardToConfigMap[cardName];
	}
}

module.exports = CardsModel;
