'use strict';

let express = require('express');
let router = express.Router();
let validator = require('is-my-json-valid');

let cwd = process.cwd();
let favoriteSchema = require(cwd + '/app/appWeb/jsonSchemas/favoriteRequest-schema.json');
let AdvertModel = require(cwd + '/app/builders/common/AdvertModel');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
let cors = require(cwd + '/modules/cors');

// route is /api/ads/favorite
router.post('/', cors, (req, res) => {
	// Validate the incoming JSON
	let validate = validator(favoriteSchema);
	let valid = validate(req.body);
	if (!valid) {
		//console.error(`schema errors: ${JSON.stringify(validate.errors, null, 4)}`);
		res.contentType = "application/json";
		res.status(400).send({
			schemaErrors: validate.errors
		});
		return;
	}

	// Validate the body
	if (req.body.adId) {
		let modelBuilder = new ModelBuilder();

		let model = modelBuilder.initModelData(res.locals.config, req.app.locals, req.cookies);
		model.advertModel = new AdvertModel(model.bapiHeaders);

		model.advertModel.favoriteTheAd(req.body.adId).then(() => {
			res.send();
			return;
		}).fail((err) => {
			console.error(err);
			console.error(err.stack);
			res.status(500).send({
				error: true
			});
			return;
		});
	} else {
		res.status(400).send({
			error: "adId not found in the request"
		});
		return;
	}
});

router.delete('/', cors, (req, res) => {
	// Validate the body
	if (! req.body.adId) {
		let modelBuilder = new ModelBuilder();

		let model = modelBuilder.initModelData(res.locals.config, req.app.locals, req.cookies);
		model.advertModel = new AdvertModel(model.bapiHeaders);

		model.advertModel.unfavoriteTheAd(req.body.adId).then(() => {
			res.send();
			return;
		}).fail((err) => {
			console.error(err);
			console.error(err.stack);
			res.status(500).send({
				error: true
			});
			return;
		});
	} else {
		res.status(400).send({
			error: "adId not found in the request"
		});
		return;
	}
});

module.exports = router;
