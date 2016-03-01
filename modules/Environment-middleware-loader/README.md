# Environment Middleware Loader

Environment based loading of middleware / Environment based bootstraping middleware. Better performance. 
 
### pre requirement

var midlewareloader = require(process.cwd() + '/modules/environment-middleware-loader');

### Useage

```javascript

// add all development based middleware stuff here
    midlewareloader()('dev', function() {
        // asserts for local developments and populates  app.locals.jsAsserts
        app.use(asserts(app, locale)); //console.log( app.locals.jsAsserts);
        app.use(logger('dev'));
        // for dev purpose lets make all static none cacheable
        // http://evanhahn.com/express-dot-static-deep-dive/
        app.use("/public", express.static(config.root + '/public', {
            root: "/public",
            etag:false,
            maxage:0,
            index:false
        }));
        app.use("/views", express.static(config.root + '/app/views'));

        // app.use(ignoreAssertReq());
    });

    // vm based middlewares
    midlewareloader('vm', function() {
        // https://www.npmjs.com/package/morgan#common
        // apche style loggin
        app.use(logger('common'));
        app.use(compress());
    });
    // production based middleware
    midlewareloader('production', function() {
        // https://www.npmjs.com/package/morgan#common
        // apche style loggin
        app.use(logger('common'));
        app.use(compress());
    });

```

    

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

***Anton Ganeshalingam** - *Initial work* 



## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments


