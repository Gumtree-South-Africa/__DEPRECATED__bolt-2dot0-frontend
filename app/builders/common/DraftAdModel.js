'use strict';

let draftAdService = require(process.cwd() + '/server/services/draftad');

class DraftAdModel {
	constructor(bapiHeaderValues) {
		this.bapiHeaderValues = bapiHeaderValues;
	}

	saveDraft(machguid, input) {
		// Draft is a combo of structured data (for image-rec, tracking) and unstructured data (to retrieve later)
		let draftJson = {
			ads: [],
			extra: ''
		};
		input.ads.forEach((ad) => {
			let draft = {
				title: ad.title,
				imageURLs: ad.pictures,
				price: {
					currency: ad.price.currency,
					amount: ad.price.amount
				},
				location: {
					"address": ad.location.address,
					"latitude": ad.location.latitude,
					"longitude": ad.location.longitude
				}
			};
			draftJson.ads.push(draft);
		});
		draftJson['extra'] = JSON.stringify(input);

		return draftAdService.saveDraftMock(this.bapiHeaderValues, machguid, draftJson).then((result) => {
			return result.machguid === machguid;
		});
	}

	getDraft(machguid) {
		return draftAdService.getDraftMock(this.bapiHeaderValues, machguid).then((result) => {
			let data = {};
			try {
				data = JSON.parse(result['extra']);
			} catch(ex) {
				console.error(ex);
				console.error(ex.stack);
			}

			return data;
		});
	}
}

module.exports = DraftAdModel;
