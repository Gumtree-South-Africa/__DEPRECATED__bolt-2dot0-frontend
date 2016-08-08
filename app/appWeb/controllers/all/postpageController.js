'use strict';

let express = require('express');
let router = express.Router();
let cwd = process.cwd();
let pageControllerUtil = require(cwd + '/app/appWeb/controllers/all/PageControllerUtil');
let PostAdPageModel = require(cwd + '/app/builders/page/PostAdPageModel');
let EpsModel = require(cwd + '/app/builders/common/EpsModel');
let Q = require('q');

// todo: temporary until these can be absracted out into a model
let ModelBuilder = require(process.cwd() + '/app/builders/common/ModelBuilder');
let DraftAdModel = require(cwd + '/app/builders/common/DraftAdModel.js');
let PostAdModel = require(cwd + '/app/builders/common/PostAdModel.js');

let postAdData = {
	extendModelData: (req, modelData) => {
		// CSS
		if (modelData.header.min) {
			modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/PostAdPage.min.css');
		} else {
			modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/PostAdPage.css');
		}
		modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + "PostAd_desktop_es_MX.js");
		modelData.footer.javascripts.push('https://www.google.com/jsapi');
	}
};

router.use('/', (req, res, next) => {

	let deferredAdPromise = Q.fcall(() => {
		if (req.query.guid) {
			// we've got a query string
			let guid = req.query.guid;
			// now we need to get the draft
			let modelBuilder = new ModelBuilder();
			let model = modelBuilder.initModelData(res.locals.config, req.app.locals, req.cookies);
			let draftAdModel = new DraftAdModel(model.bapiHeaders);
			let postAdModel = new PostAdModel(model.bapiHeaders);

			let draftAd = {};	// going to try and preserve the draftAd even if we can't post it

			return draftAdModel.getDraft(guid).then((results) => {
					draftAd = results;	// we'll need this later when postAd attempt fails
				// console.log(JSON.stringify(results, null, 4));

				return postAdModel.postAd(draftAd).then((adResult) => {
					// deferred ad resolved, redirect to vip
					return Q.reject({ redirect: postAdModel.fixupVipUrl(adResult.vipLink) });
				});
			}).fail((error) => {
				// all errors specific to deferred ad processing land here
				// check to see if its a redirect, the only case where a specific object (not Error) is expected
				if (error.redirect) {
					return Q.reject(error);	// reject to skip the page render and just redirect
				}

				// all other errors are logged but will allow the page to render as normal
				console.error(`error posting deferred ad ${error}, ad: ${JSON.stringify(draftAd, null, 4)}`);
				return draftAd;	// resolve so user can get their deferred ad on the page despite any error posting it
			});
		}
		return {};	// resolve right away, no deferred Ad
	});

	deferredAdPromise.then((deferredAd) => {
		//console.log(`deferred ad ${JSON.stringify(deferredAd, null, 4)}`);

		let postAdPageModel = new PostAdPageModel(req, res);
		// pass the deferred ad into the model so it can render in the page
		let modelPromise = postAdPageModel.populateData(deferredAd);

		return modelPromise;
	}).then((modelData) => {

		postAdData.extendModelData(req, modelData);
		modelData.header.distractionFree = true;
		modelData.footer.distractionFree = true;
		modelData.eps = EpsModel();

		pageControllerUtil.postController(req, res, next, 'postAd/views/hbs/postAd_', modelData);
	}).fail((err) => {

		// check to see if its a redirect, the only case where a specific object (not Error) is expected
		if (err.redirect) {
			// want this to go all the way out
			res.redirect(err.redirect);
			return;
		}
		console.error(err.message);
		console.error(err.stack);
		next(err);
	});
});

module.exports = router;
