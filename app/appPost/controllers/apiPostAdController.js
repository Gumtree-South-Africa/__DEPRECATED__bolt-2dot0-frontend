'use strict';

let express = require('express');
let router = express.Router();

let cwd = process.cwd();
let ModelBuilder = require(process.cwd() + '/app/builders/common/ModelBuilder');
let cors = require(cwd + '/modules/cors');

let postAdService = require(cwd + '/server/services/postad');

let validator = require('is-my-json-valid');
let schema = require(cwd + '/app/appPost/jsonSchemas/postAdRequest.json');
let uuid = require('node-uuid');

/**
 * route is /post/api/postad/create
 *
 * 	returns the following JSON:
 * 	{
 *		state: "AD_CREATED" | "AD_DEFERRED"
 *
 *	AD_DEFERRED case:
 *
 *		guid: "string"
 *
 *	AD_CREATED case:
 *
 *		ad: {
 *				id: "string",
 *				vipLink: "string"
 *		}
 *	}
 *
 */
router.get('/create', cors, (req, res) => {

	if (!req.is('application/json')) {
		res.status(406).send();	// we expect only JSON,  406 = "Not Acceptable"
		return;
	}

	//console.log(`schema: ${JSON.stringify(schema)}`);
	//console.log(`json received: ${JSON.stringify(req.body, null, 4)}`);

	// validate the incoming JSON
	let validate = validator(schema);
	let valid = validate(req.body);
	if (!valid) {
		//console.error(`schema errors: ${JSON.stringify(validate.errors, null, 4)}`);
		res.contentType = "application/json";
		res.status(400).send(validate.errors);
	}

	// todo: is there any finer granularity of validation needed that schema doesnt take care of?

	// we're validated
	let requestJson = req.body;

	let responseJson = {	// note: this is the simplest response possible

		state: null			// values are: AD_CREATED or AD_DEFERRED
	};

	let authenticationCookie = req.cookies['bt_auth'];
	// todo: how to we validate login is still good?
	if (!authenticationCookie) {

		// todo: store the requestJson ads in backend
		// todo: add the user's identity and machine id to the requestJson before storing, so no-one else can use this guid
		responseJson.state = 'AD_DEFERRED';
		responseJson.guid = uuid.v4();	// todo: this guid should be from the backend store
		res.send(responseJson);
		return;
	}

	// todo: get geo information, check the geo cookie if we need to, will we need to since location is presumably in the payload?

	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals.config, req.app.locals, req.cookies);

	postAdService.quickpostAd(model.bapiHeaders, requestJson).then( (results) => {

		// extract only what we need for the response
		let vipLink = results._links.find( (elt) => {
			return elt.rel === "vipSeoUrl";
		});
		if (!vipLink) {
			console.error(`create ad result is missing vipSeoUrl ${JSON.stringify(results, null, 4)}`);
			res.status(500).send();
			return;
		}
		responseJson.state = "AD_CREATED";
		responseJson.ad = {
			id: results.id,
			vipLink: vipLink.href
		};
		res.send(responseJson);

	}).fail((error) => {
		console.error(error);
		res.status(500).send();
	});
});

module.exports = router;
