'use strict';

let express = require('express');
let router = express.Router();

let SearchModel = require(process.cwd() + '/app/builders/common/SearchModel');
let ModelBuilder = require(process.cwd() + '/app/builders/common/ModelBuilder');
let cors = require(process.cwd() + '/modules/cors');

// route is /api/search/autocomplete
router.post('/autocomplete', cors, (req, res) => {
	let modelBuilder = new ModelBuilder();

	let model = modelBuilder.initModelData(res.locals, req.app.locals, req.cookies);
	model.searchModel = new SearchModel(model.country, model.bapiHeaders);

	model.searchModel.autoComplete(req.body.searchterm, req.body.location, req.body.category).then((autoCompleteResults) => {
		let results = {
			totalCount: 0,
			items: []
		};

		if (typeof autoCompleteResults !== 'undefined') {
			results['totalCount'] = autoCompleteResults.response.numFound;

			for (let i = 0; i < autoCompleteResults.response.docs.length; i++) {
				let element = autoCompleteResults.response.docs[i];
				let content = {
					keyword: element.keywords_g110,
					category: element.categoryId_l110,
					location: element.locationId_l110
				};
				results.items.push(content);
			}
		}

		res.status(200);
		res.send(results);
	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
		res.status(500);
		res.send({
			error: true
		});
	});

});

module.exports = router;
