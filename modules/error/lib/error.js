
module.exports = function(app) {
    return function(err, req, res, next) {
        if(err.status !== 404) {
            return next();
        } else if (err.status === 404) {
            res.redirect("/error/404");
        } else if (err.status === 500) {
            console.error(err.stack);
            res.redirect("/error/500");
        }
        res.redirect("/error");
    };
};



module.exports.four_or_four = function(app) {

    return function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    }
};


