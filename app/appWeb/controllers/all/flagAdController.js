'use strict';

const express 					= require('express'),
		  router 						= express.Router(),
		  // form 							= require('express-form'),
		  querystring 			= require('querystring'),
		  // field 						= form.field,
		  cwd 							= process.cwd(),
		  // RecaptchaModel 		= require(cwd +'/app/builders/common/RecaptchaModel.js'),
		  bapiCall    	  = require(cwd +'/server/services/bapi/BAPICall');

// const SITE_KEY = '6LdPxgwUAAAAAPsz0LEG3ehKFWC6lJPkw1aNak0D';
const SECRET_KEY = '6LdPxgwUAAAAAHKBHEloU4L4t_Bho6_YFDG1rnFR';

router.post('/', (req, res) => {
	
	let adId = req.body.adId;
	let captchaToken = req.body.captchaToken;
	let flagAdType = req.body.flagAdType;
	let email = req.body.email;
	// let comments = req.body.comments;

	if(!!adId && !!captchaToken && !!flagAdType && !!email) {
		let postData = querystring.stringify({
			secret: SECRET_KEY,
			response: captchaToken
		});
		bapiCall.doPost(postData, {
			hostname: 'www.google.com',
			protocol: 'https:',
			method: 'POST',
			path: '/recaptcha/api/siteverify',
			timeout: 2000,
			headers: {
		    'Content-Type': 'application/x-www-form-urlencoded',
		    'Content-Length': Buffer.byteLength(postData)
		  }
		}, null)
			.then(resp => {
				res.send(resp);
			})
			.fail(() => {
				res.status(500).send({});
			});
	} else {
		res.status(400).send({error: 'missing parameters'});
	}

	// let model = new RecaptchaModel(req, res);
	// model.populateData().then(function(modelData) {
	// 	let adJson = req.body;
	// 	let ad = JSON.stringify(adJson);
	// 	Q(postAdService.flagAd(modelData.bapiHeaders, ad))
	// 		.then(function(dataReturned) {
	// 			let response = dataReturned;
				
	// 		}).fail((err) => {
	// 			console.error(err);
	// 			console.error(err.stack);
	// 			//Throw a 404 page for 404 or 401 (unauthorized). otherwise 500
	// 			return (err.statusCode === 404 || err.statusCode === 400 || err.statusCode === 401) ? next() : next(err);
	// 	});		
	// });
});

module.exports = router;
