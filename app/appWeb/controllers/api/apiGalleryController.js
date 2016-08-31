'use strict';


let express = require('express'), router = express.Router(), Q = require('q');

let GalleryModel = require(process.cwd() + '/app/builders/common/GalleryModel');
let cors = require(process.cwd() + '/modules/cors');


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
		err.logError();
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


module.exports = router;
