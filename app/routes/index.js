'use strict';

module.exports = function (router) {
    router.get('/', function (req, res) {
        res.render('templates/pages/homepage/views/hbs/index', {});  
    });
};
