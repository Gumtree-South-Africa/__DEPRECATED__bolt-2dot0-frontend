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
 * removes unwanted bapiJson we dont want to log
 * emits elements to the console error log: bapiJson (if present), and stack trace,
 * prepares an object that can be returned to the client
 * @param {Object} err (exception object)
 * @returns	{object} empty object or bapi information that can be sent back to the client
 */
let logError = (err) => {
	console.error(err.message);
	let bapiInfoForClient = {};
	if (err.bapiJson) {
		// strip out what we don't want to log from bapi
		err.bapiJson.details = err.bapiJson.details.map((item) => {
			delete item._links;
			return item;
		});
		console.error(`bapiJson: ${JSON.stringify(err.bapiJson, null, 4)}`);
		// for now, were just passing the message to the client
		// todo: map the bapiJson for best exposure to client
		bapiInfoForClient.message = err.bapiJson.message;
	}
	console.error(err.stack);
	return bapiInfoForClient;
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
			let bapiInfo = logError(err);
			// todo: err.jsonMessage = "unable to favorite ad, see logs for details";
			// todo: return next(err);
			res.status(err.statusCode ? err.statusCode : 500).send({
				error: "unable to favorite ad, see logs for details",
				bapiInfo: bapiInfo
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
			let bapiInfo = logError(err);
			res.status(err.statusCode ? err.statusCode : 500).send({
				error: "unable to unfavorite ad, see logs for details",
				bapiInfo: bapiInfo
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
