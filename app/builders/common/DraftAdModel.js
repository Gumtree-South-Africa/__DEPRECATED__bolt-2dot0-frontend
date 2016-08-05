'use strict';

let draftAdService = require(process.cwd() + '/server/services/draftad');

class DraftAdModel {
	constructor(bapiHeaderValues) {
		this.bapiHeaderValues = bapiHeaderValues;
	}

	// postAdRequest is object format specified by the front end request json schema
	// see /app/appWeb/jsonSchemas/postAdRequest-schema.json
	// this puts it into temporary storage for retrieval after the login process
	saveDraft(machGuid, postAdRequest) {

		return draftAdService.saveDraft(this.bapiHeaderValues, machGuid, postAdRequest).then((result) => {
			return result;
		});
	}

	getDraft(machGuid) {
		return draftAdService.getDraftMock(this.bapiHeaderValues, machGuid).then((result) => {
			let data = {};
			try {
				data = JSON.parse(result);
			} catch(ex) {
				console.error(ex);
				console.error(ex.stack);
			}

			return data;
		});
	}
}

module.exports = DraftAdModel;
