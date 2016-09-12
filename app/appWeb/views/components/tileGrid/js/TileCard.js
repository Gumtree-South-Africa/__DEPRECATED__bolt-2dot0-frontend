'use strict';

/**
 * this is a card specific object used by the tile grid to hold state
 */
class TileCard {

	constructor(cardElement) {
		this.cardName = $(cardElement).data("card-name");
		this.cardElement = cardElement;	// can be used to find elements within this card
	}

	getName() {
		return this.cardName;
	}
}

module.exports = TileCard;
