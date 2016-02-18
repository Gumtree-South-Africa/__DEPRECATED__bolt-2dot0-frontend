# Device Detection

Device detection helpers for handlebars and backend support.

### Prerequisities

Pleass add the following in the controller for back-end rendering

```javascript

var deviceDetection = require(process.cwd() + "/modules/device-detection");
```

Initalize deviceDetection with request object
```javascript

deviceDetection.check(req)

```

### Useage


#### Front-end
Add req.app.locals.deviceInfo in the controllers

```javascript
res.render('....', {});
```

```handlebars
{{#ifDesktop this.device}}  {{/ifDesktop}}
{{#ifMobile this.device}}  {{/ifMobile}}
{{#ifTablet this.device}}  {{/ifTablet}}

// if not mobile
{{#unlessMobile this.device}}  {{/unlessMobile}}
```

#### Back-end

```handlebars
isDesktop();

isMobile();
isTablet();
isTv();
isHomePageDevice(); // only for backend

```

### Example



#### Front-end

<!-- homepageController.js -->

```javascript
.
.
extraData.device = req.app.locals.deviceInfo;
.
.
```

In handlebars add the following:

```handlebars
{{#ifDesktop this.device}}desktop-------{{/ifDesktop}}
{{#ifMobile this.device}}mobile-------{{/ifMobile}}
{{#ifTablet this.device}}tablet-------{{/ifTablet}}
```


#### Back-end

```handlebars

<!-- homepage controller -->
deviceDetection.check(req);


deviceDetection.isDesktop();
deviceDetection.isMobile();
deviceDetection.isTablet();
deviceDetection.isTv();

```



## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Anton Ganeshalingam** - *Initial work* 



## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments


