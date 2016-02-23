# Error

A middleware to capture client request errors (404 etc) and server errors (500 etc)

### Pre-requisities
        
[url-pattern](https://www.npmjs.com/package/url-pattern)


### Useage

#### Adding and order of middleware

Adding 404 middleware at the bottom of all middlewares is very important! Specially after controller middlewares are 
very important! And following it should be the 'Error' middleware.

```javascript
<!-- app.js: Please it is only added to app.js -->
//Setup controllers
controllers.forEach(function (controller) {
    require(controller)(app);
});

//warning: do not reorder this middleware. Order of
// this should always appear after controller middlewares
// are setup.
app.use(error.four_o_four(app));

// overwriting the express's default error handler
// should always appear after 404 middleware
app.use(error(app));
```

#### Capture hbs rendering or template errors

```handlebars
    // Render
    res.render('homepage/views/hbs/homepage_' + res.config.locale, modelData, function(err, html) {
    if (err) {
      res.redirect('/error/500'); // File doesn't exist
    } else {
      res.send(html);
    }
    });	  
```

#### to capture backend errors
```javascript

if (something wrong) {
    
    var err = new Error();
    err.status = 500;
    next(err);
}
```
    

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

***Anton Ganeshalingam** - *Initial work* 



## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments


