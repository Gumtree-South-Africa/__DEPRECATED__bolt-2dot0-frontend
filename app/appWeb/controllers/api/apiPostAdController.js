'use strict';

let express = require('express');
let router = express.Router();

let cwd = process.cwd();
let ModelBuilder = require(process.cwd() + '/app/builders/common/ModelBuilder');
let cors = require(cwd + '/modules/cors');

let postAdService = require(cwd + '/server/services/postad');
let userService = require(cwd + '/server/services/user');

let validator = require('is-my-json-valid');
let schemaPostAd = require(cwd + '/app/appWeb/jsonSchemas/postAdRequest-schema.json');
let uuid = require('node-uuid');
let _ = require('underscore');


// front end request structure is different than the back end:
// front end has array of ads, back end only supports one ad
// front end pictures is array of urls, back end is more complex
let mapToBapiRequest = (request) => {
	let result = JSON.parse(JSON.stringify(request));

	result.ads.forEach((ad, index) => {
		ad.pictures = {};
		let pictures = request.ads[index].pictures;
		ad.pictures.sizeUrls = pictures.map((elt) => {
			return {
				pictureUrl: elt,
				size: "LARGE"
			};
		});
	});

	return result.ads[0];	// bapi currently only supports one ad
};

let getNotLoggedInResponse = () => {

	let response = {};

	response.state = 'AD_DEFERRED';

	// todo: store the requestJson ads in backend
	let guid = uuid.v4();		// todo: this guid should be from the backend store
	// if we fail to store it, we should not set responseJson.guid
	response.guid = guid;

	// Note: we don't know the user's identity, so it is possible someone could hijack this deferred ad using the guid

	// generate 3 links for client: login, register, facebook login

	let returnUrl = `/post?guid=${guid}`;

	response.links = {
		emailLogin: `/login.html?return=${returnUrl}`,
		register: `/register.html?return=${returnUrl}`,
		facebookLogin: `/social/facebook/authorize?return=${returnUrl}`
	};

	return response;
};

let getAdPostedResponse = (results) => {

	let response = {};
	// extract only what we need for the response, minimal response
	response.state = "AD_CREATED";

	// unpack the vipUrl
	let vipLink = results._links.find( (elt) => {
		return elt.rel === "vipSeoUrl";
	});
	response.ad = {
		id: results.id,
	};

	if (vipLink) {
		response.ad.vipLink = vipLink.href;
	}
	return response;
};

/**
 * route is /post/api/postad/create
 * request schema, see postAdRequest-schema.json
 * expects geo information to have arrived in the request
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

	let authenticationCookie = req.cookies['bt_auth'];

	if (!authenticationCookie) {
		let responseJson = getNotLoggedInResponse();
		if (!responseJson.guid) {
			console.error('unable to store deferred ad');
			res.status(500).send();
			return;
		}
		res.send(responseJson);
		return;
	}

	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals.config, req.app.locals, req.cookies);

	// validate login cookie is still good
	userService.getUserFromCookie(model.bapiHeaders).then( (result) => {
		// console.log(JSON.stringify(result, null, 4));

		if (_.isEmpty(result)) {	//   not logged in (with cookie)
			let responseJson = getNotLoggedInResponse();
			if (!responseJson.guid) {
				console.error('unable to store deferred ad');
				res.status(500).send();
				return;
			}
			res.send(responseJson);
			return;
		}

		// user cookie checks out fine, go ahead and post the ad...

		let bapiRequestJson = mapToBapiRequest(requestJson);

		//TODO: do not have this as mock
		postAdService.quickpostAdMock(model.bapiHeaders, bapiRequestJson).then( (results) => {

			let responseJson = getAdPostedResponse(results);
			if (!responseJson.ad.vipLink) {
				console.error(`create ad result is missing vipSeoUrl ${JSON.stringify(results, null, 4)}`);
				res.status(500).send();
				return;
			}

			res.send(responseJson);
			return;

		}).fail((error) => {
			// post ad has failed
			console.error(`post ad failure ${error}`);
			res.status(500).send({
				error: "postAd failed, see logs for details"
			});
			return;
		});

	}).fail((error) => {
		// user call has failed
		console.error(`user call failure ${error}`);
		res.status(500).send({
			error: "unable to validate user, see logs for details"
		});
		return;
	});

});


module.exports = router;
