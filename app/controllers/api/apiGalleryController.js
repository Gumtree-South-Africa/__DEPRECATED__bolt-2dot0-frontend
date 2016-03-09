'use strict';


var Q = require('q');

var GalleryModel = require(process.cwd() + '/app/builders/common/GalleryModel');


var express = require('express'),
  router = express.Router();

module.exports = function (app) {
  app.use('/', router);
};

router.get('/api/ads/gallery', function (req, res, next) {
	var gallery = new GalleryModel(req.requestId, res.locals.config.locale),
		galleryData = {},
		// Only applicable for SRP Gallery where there is categoryId
		// categoryId = req.query.categoryId;
		offset = req.query.offset, // Start Index
		limit = req.query.limit, // Limit
		ajaxUrls = {},
		galleryDeferred = Q.defer();
	
	Q(gallery.getAjaxGallery(offset, limit))
	.then(function (dataG) {
		// galleryData = dataG;
		dataG = dataG || {};
		galleryData = {
			'ads' : dataG.ads || []
		};

		// Get the prev and next urls
		ajaxUrls = getAjaxsUrlFromBapiJSON(dataG);
		if (ajaxUrls.next) {
			galleryData.nextAjaxUrl = ajaxUrls.next;
		}

		if (ajaxUrls.prev) {
			galleryData.previousAjaxUrl = ajaxUrls.prev;
		}

console.log('***==========>*******');
console.log(galleryData);

		galleryDeferred.resolve(galleryData);
		res.send(galleryData);
	}).fail(function (err) {
		galleryDeferred.reject(new Error(err));
		res.send(galleryData);
	});
});

function getAjaxsUrlFromBapiJSON(dataG) {
	var ajaxUrls = { 'prev' : null , 'next' : null },
		links = dataG.links || null,
		linkObj,
		idx;

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