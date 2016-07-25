'use strict';

let express = require('express');
let router = express.Router();

let SearchModel = require(process.cwd() + '/app/builders/common/SearchModel');
let ModelBuilder = require(process.cwd() + '/app/builders/common/ModelBuilder');
let cors = require(process.cwd() + '/modules/cors');

// route is /api/search/autocomplete
router.get('/autocomplete', cors, (req, res) => {
	let modelBuilder = new ModelBuilder();

	let model = modelBuilder.initModelData(res.locals.config, req.app.locals, req.cookies);
	model.searchModel = new SearchModel(model.country, model.bapiHeaders);

	model.searchModel.autoComplete(req.query.searchterm, req.query.location, req.query.category).then((autoCompleteResults) => {
		let results = {
			totalCount:	autoCompleteResults.response.numFound,
			items: []
		};
		for(let i=0; i<autoCompleteResults.response.docs.length; i++) {
			let element = autoCompleteResults.response.docs[i];
			let content = {
				keyword:	element.keywords_g110,
				category:	element.categoryId_l110,
				location:	element.locationId_l110
			};
			results.items.push(content);
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
