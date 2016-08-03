'use strict';

let draftAdService = require(process.cwd() + '/server/services/draftad');

class DraftAdModel {
	constructor(bapiHeaderValues) {
		this.bapiHeaderValues = bapiHeaderValues;
	}

	saveDraft(machguid, ads) {
		let draftJson = [];
		ads.forEach((ad) => {
			let draft = {
				imageURL: ad.pictures[0],
				title: ad.title,
				price: {
					currency: ad.priceCurrency,
					amount: ad.priceAmount
				}
			};
			draftJson.push(draft);
		});

		return draftAdService.saveDraftMock(this.bapiHeaderValues, machguid, draftJson).then((result) => {
			if (result.machguid === machguid) {
				return true;
			} else {
				return false;
			}
		});
	}

	getDraft(machguid) {
		return draftAdService.getDraftMock(this.bapiHeaderValues, machguid).then((data) => {
			return data;
		});
	}
}

module.exports = DraftAdModel;
