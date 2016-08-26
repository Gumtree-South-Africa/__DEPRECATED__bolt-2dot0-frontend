'use strict';

let express = require('express');
let router = express.Router();
let validator = require('is-my-json-valid');

let cwd = process.cwd();
let favoriteSchema = require(cwd + '/app/appWeb/jsonSchemas/favoriteRequest-schema.json');
let AdvertModel = require(cwd + '/app/builders/common/AdvertModel');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
let cors = require(cwd + '/modules/cors');

/**
 * emits the message, bapiJson (if present), and stack trace
 * @param {Object} err (exception object)
 */
let logError = (err) => {
	console.error(err.message);
	if (err.bapiJson) {
		console.error(`bapiJson: ${JSON.stringify(err.bapiJson, null, 4)}`);
	}
	console.error(err.stack);
};

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
		if (!model.bapiHeaders.authTokenValue) {
			res.status(401).send({
				error: "no authorization"
			});
			return;
		}
		model.advertModel = new AdvertModel(model.bapiHeaders);

		model.advertModel.favoriteTheAd(req.body.adId).then(() => {
			res.status(200).send({});	// returning {} since consumer will expect json
			return;
		}).fail((err) => {
			logError(err);
			res.status(500).send({
				error: "unable to favorite ad, see logs for details",
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
		if (!model.bapiHeaders.authTokenValue) {
			res.status(401).send({
				error: "no authorization"
			});
			return;
		}
		model.advertModel = new AdvertModel(model.bapiHeaders);

		model.advertModel.unfavoriteTheAd(req.body.adId).then(() => {
			res.status(200).send({});	// returning {} since consumer will expect json;
			return;
		}).fail((err) => {
			logError(err);
			res.status(500).send({
				error: "unable to unfavorite ad, see logs for details",
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
