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
	model.searchModel = new SearchModel(model.bapiHeaders);

	model.searchModel.getAjaxTypeAhead(req.query.searchTerm, req.query.location).then((typeAheadResults) => {
		res.send(typeAheadResults);
	}).fail(() => {
		res.send({
			error: true
		});
	});

});

module.exports = router;
