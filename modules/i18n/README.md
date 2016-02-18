# I18n

Front-end and backend support for I18n.

### Prerequisities

Add the following for backend, var i18n = require('./modules/i18n');

### Useage

#### For front-end
```handlebars
//block
{{i18n "SFO"}} {{/block}}

 // if there are 3 param values in {{i18n "my.name is %s. i'm %s old. I live in, %s" "anton" "20" "santa cruz"}}
 
 // if there are 2 param values in {{i18n "my.name is %s. i'm %s old." "anton" "20" }}
 
 // if there are 1 param values in {{i18n "my.name is %s." "anton"  }}
 
  // if there are 2 param values in {{i18n "my.name" }}

```

#### For back-end
```javascript
var i18n = require('./modules/i18n');

// must provide a locale
i18n.init(res.config.locale);
// returns tranlated message
var message = i18n.msg("greeting");
```

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Anton Ganeshalingam** - *Initial work* 



## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments


