'use strict';

var express = require('express'), router = express.Router();


router.get('/status', function(req, res, next) {
	res.send('OK');
});


module.exports = router;
