'use strict';

let express = require('express');
let router = express.Router();

let cwd = process.cwd();
let ModelBuilder = require(process.cwd() + '/app/builders/common/ModelBuilder');
let cors = require(cwd + '/modules/cors');

let userService = require(cwd + '/server/services/user');

let validator = require('is-my-json-valid');
let schemaPostAd = require(cwd + '/app/appWeb/jsonSchemas/postAdRequest-schema.json');
let uuid = require('node-uuid');
let DraftAdModel = require(cwd + '/app/builders/common/DraftAdModel.js');
let PostAdModel = require(cwd + '/app/builders/common/PostAdModel.js');




let getNotLoggedInResponsePromise = (model, requestJson) => {

	let response = {};

	response.state = 'AD_DEFERRED';

	let guid = uuid.v4();		// todo: this guid should be from the backend store

	// store the requestJson ads in backend (deferred ad creation)
	let draftAdModel = new DraftAdModel(model.bapiHeaders);

	return draftAdModel.saveDraft(guid, requestJson).then(() => {
		// the result is unused, it contains the guid we passed in
		// Note: we don't know the user's identity, so it is possible someone could hijack this deferred ad using the guid

		//response.guid = guid;	// client currently checks for success this way <-- response.guid to be deprecated

		// generate 3 links for client: login, register, facebook login

		let returnUrl = `/post?guid=${guid}`;

		response.links = {
			emailLogin: `/login.html?redirect=${returnUrl}`,
			register: `/register.html?return=${returnUrl}`,
			facebookLogin: `/social/facebook/authorize?return=${returnUrl}`
		};
		return response;
	});
};

let getAdPostedResponse = (results) => {

	let response = {};
	// extract only what we need for the response, minimal response
	response.state = "AD_CREATED";

	response.ad = {
		id: results.id,
	};

	response.ad.vipLink = results.vipLink;

	return response;
};

/**
 * route is /api/post/create
 * request schema, see postAdRequest-schema.json
 * expects geo information to have arrived in the request
 *
 * 	returns the following JSON:
 * 	{
 *		state: "AD_CREATED" | "AD_DEFERRED"
 *
 *	AD_DEFERRED case:
 *
 *		links: {
 *			emailLogin: `/login.html?return=${returnUrl}`,
 *			register: `/register.html?return=${returnUrl}`,
 *			facebookLogin: `/social/facebook/authorize?return=${returnUrl}`
 *		}
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
router.post('/create', cors, (req, res) => {


	if (!req.is('application/json')) {
		res.status(406).send();	// we expect only JSON,  406 = "Not Acceptable"
		return;
	}

	// validate the incoming JSON
	let validate = validator(schemaPostAd);
	let valid = validate(req.body);
	if (!valid) {
		//console.error(`schema errors: ${JSON.stringify(validate.errors, null, 4)}`);
		res.contentType = "application/json";
		res.status(400).send({
			schemaErrors: validate.errors
		});
		return;
	}
	// is there any finer granularity of validation needed that schema doesnt take care of?
	// there doesnt appear to be any so far

	// we're validated
	let requestJson = req.body;


	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals.config, req.app.locals, req.cookies);
	let postAdModel = new PostAdModel(model.bapiHeaders);

	let authenticationCookie = req.cookies['bt_auth'];

	if (!authenticationCookie) {
		getNotLoggedInResponsePromise(model, requestJson).then((response) => {
			res.send(response);
			return;
		}).fail((error) => {
			console.error(`getNotLoggedInResponsePromise failure ${error.message}`);
			res.status(500).send();
			return;
		});
		return;
	}

	// validate login cookie is still good
	userService.getUserFromCookie(model.bapiHeaders).then( () => {
		// console.log(JSON.stringify(result, null, 4));

		// user cookie checks out fine, go ahead and post the ad...

		postAdModel.postAd(requestJson).then((adResults) => {
			let responseJson = getAdPostedResponse(adResults);

			res.send(responseJson);
			return;
		}).fail((error) => {
			// post ad has failed
			console.error(`postAdModel.postAd failure ${error}`);
			res.status(500).send({
				error: "postAd failed, see logs for details"
			});
			return;
		});

	}).fail((error) => {
		if (error.statusCode && error.statusCode === 404) {
			getNotLoggedInResponsePromise(model, requestJson).then((response) => {
				res.send(response);
				return;
			}).fail((e) => {
				console.error(`getNotLoggedInResponsePromise failure ${e.message}`);
				res.status(500).send();
				return;
			});
			return;
		}

		// user call has failed
		console.error(`userService.getUserFromCookie failure ${error}`);
		res.status(500).send({
			error: "unable to validate user, see logs for details"
		});
		return;
	});

});


module.exports = router;
