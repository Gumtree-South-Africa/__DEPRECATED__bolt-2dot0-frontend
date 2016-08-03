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
				imageURL: ad.pictures,
				title: ad.title,
				price: {
					currency: ad.priceCurrency,
					amount: ad.priceAmount
				}
			};
			draftJson.push(draft);
		});

		return draftAdService.saveDraftMock(this.bapiHeaderValues, machguid, draftJson).then((result) => {
			return result.machguid === machguid;
		});
	}

	getDraft(machguid) {
		return draftAdService.getDraftMock(this.bapiHeaderValues, machguid).then((data) => {
			return data;
		});
	}
}

module.exports = DraftAdModel;
