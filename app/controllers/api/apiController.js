'use strict';


var Q = require('q');

var GalleryModel = require(process.cwd() + '/app/builders/common/GalleryModel');


var express = require('express'),
  router = express.Router();

module.exports = function (app) {
  app.use('/', router);
};

router.get('/api/gallery/:offset/:limit', function (req, res, next) {
	var gallery = new GalleryModel(req.requestId, res.locals.config.locale),
		galleryData = {};
	
	// Only applicable for SRP Gallery where there is categoryId
	// var categoryId = req.query.categoryId;
	
	var offset = req.params.offset; // Start Index
	var limit = req.params.limit; // Limit
	
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
