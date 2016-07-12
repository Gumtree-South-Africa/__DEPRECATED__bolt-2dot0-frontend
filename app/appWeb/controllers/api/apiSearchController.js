'use strict';

let express = require('express'), router = express.Router();

let SearchModel = require(process.cwd() + '/app/builders/common/SearchModel');
let cors = require(process.cwd() + '/modules/cors');

router.get('/typeahead', cors, function(req, res) {
	let bapiHeaders = {};
	bapiHeaders.requestId = req.app.locals.requestId;
	bapiHeaders.ip = req.app.locals.ip;
	bapiHeaders.machineid = req.app.locals.machineid;
	bapiHeaders.useragent = req.app.locals.useragent;
	bapiHeaders.locale = res.locals.config.locale;

	let searchModel = new SearchModel(bapiHeaders); // Start Index

	searchModel.getAjaxTypeAhead(req.query.searchTerm, req.query.location).then(function(typeAheadResults) {
		res.send(typeAheadResults);
	}).fail(function() {
		res.send({
			error: true
		});
	});

});

module.exports = router;
