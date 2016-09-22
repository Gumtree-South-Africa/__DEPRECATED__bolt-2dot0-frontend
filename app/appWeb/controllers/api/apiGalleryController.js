'use strict';


let express = require('express'), router = express.Router(), Q = require('q');

let GalleryModel = require(process.cwd() + '/app/builders/common/GalleryModel');
let CardsModel = require(process.cwd() + '/app/builders/common/CardsModel');
let ModelBuilder = require(process.cwd() + '/app/builders/common/ModelBuilder');
let cors = require(process.cwd() + '/modules/cors');
let logger = require(`${cwd}/server/utils/logger`);

//todo: get rid of this route (or replace it with /cards below) once V1 homepage is no longer in use
router.get('/', cors, function(req, res) {
	let bapiHeaders = {};
	bapiHeaders.requestId = req.app.locals.requestId;
	bapiHeaders.ip = req.app.locals.ip;
	bapiHeaders.machineid = req.app.locals.machineid;
	bapiHeaders.useragent = req.app.locals.useragent;
	bapiHeaders.locale = res.locals.config.locale;

	let gallery = new GalleryModel(bapiHeaders), galleryData = {}, offset = req.query.offset, // Start Index
		limit = req.query.limit, // Limit
		ajaxUrls = {};

	// Only applicable for SRP Gallery where there is categoryId
	// categoryId = req.query.categoryId;

	gallery.getAjaxGallery(offset, limit).then(function(dataG) {
		dataG = dataG || {};
		galleryData = {
			'ads': dataG.ads || []
		};

		// Get the prev and next urls
		ajaxUrls = getAjaxsUrlFromBapiJSON(dataG);
		if (ajaxUrls.next) {
			galleryData.nextAjaxUrl = ajaxUrls.next;
		}

		if (ajaxUrls.prev) {
			galleryData.previousAjaxUrl = ajaxUrls.prev;
		}

		res.send(galleryData);
	}).fail(function(err) {
		logger.logError(err);
		res.send(galleryData); // not modifying this to return the status code of bapi because its used for v1
	});
});

function getAjaxsUrlFromBapiJSON(dataG) {
	let ajaxUrls = {'prev': null, 'next': null}, links = dataG.links || null, linkObj, idx;

	if (links) {
		for (idx = 0; idx < links.length; ++idx) {
			linkObj = links[idx];
			if (linkObj.rel.match(/previous/i)) {
				ajaxUrls.prev = ('/api' + linkObj.href) || '';
			} else if (linkObj.rel.match(/next/i)) {
				ajaxUrls.next = ('/api' + linkObj.href) || '';
			}
		}
	}

	return ajaxUrls;
}


/**
 * route is /api/ads/gallery/card
 * this is a new ajax layer that uses the card model
 * it can replace the other gallery ajax endpoint when V1 homepage is no longer in use
 */
router.get('/card', cors, (req, res) => {

	let params;
	// validate the inputs
	if (req.query.offset && req.query.limit) {
		if (Number.isNaN(Number.parseInt(req.query.offset)) || Number.isNaN(Number.parseInt(req.query.limit))) {
			res.status(400);
			res.send({  error: "query params could not be parsed into numbers"});
			return;
		}
		// params are good
		params = {
			offset: req.query.offset,
			limit: req.query.limit
		}
	} else {
		res.status(400);
		res.send({  error: "query params required"});
		return;
	}

	let modelBuilder = new ModelBuilder();

	let model = modelBuilder.initModelData(res.locals, req.app.locals, req.cookies);
	model.cardsModel = new CardsModel(model.bapiHeaders, req.app.locals.prodEpsMode);

	model.cardsModel.getCardItemsData("galleryCard", {
		offset: params.offset,
		limit: params.limit
	}).then( (result) => {
		// augment the API result data with some additional card driven config for templates to use
		result.config = model.cardsModel.getTemplateConfigForCard("galleryCard");
		res.status(200).send(result);
	}).fail((err) => {
		let bapiInfo = logger.logError(err);
		res.status(err.statusCode ? err.statusCode : 500).send({
			error: "unable to get gallery data, see logs for details",
			bapiInfo: bapiInfo
		});
		return;
	});
});

module.exports = router;
