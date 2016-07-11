'use strict';

let express = require('express'), router = express.Router();

router.get('/status', function(req, res) {
	res.send('OK');
});

module.exports = router;
