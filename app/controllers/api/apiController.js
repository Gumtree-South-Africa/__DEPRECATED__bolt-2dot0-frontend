'use strict';


var Q = require('q');

var GalleryModel = require(process.cwd() + '/app/builders/common/GalleryModel');


var express = require('express'),
  router = express.Router();

module.exports = function (app) {
  app.use('/', router);
};

router.get('/api/gallery', function (req, res, next) {
	var gallery = new GalleryModel(req.requestId, res.locals.config.locale),
		galleryData = {};
	
	// Only applicable for SRP Gallery where there is categoryId
	// var categoryId = req.query.categoryId;
	
	var offset = req.query.offset; // Start Index
	var limit = req.query.limit; // Limit
	
	var galleryDeferred = Q.defer();
	
	Q(gallery.getAjaxGallery(offset, limit))
	.then(function (dataG) {
		galleryData = dataG;
		galleryDeferred.resolve(galleryData);
		res.send(galleryData);
	}).fail(function (err) {
		galleryDeferred.reject(new Error(err));
		res.send(galleryData);
	});
});
