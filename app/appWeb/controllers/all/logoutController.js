'use strict';

let express = require('express');
let router = express.Router();

router.get('/', (req, res) => {
	res.clearCookie('bt_auth');
	res.redirect('/');
});

module.exports = router;
