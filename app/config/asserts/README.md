# JSMin JSON Config

A JSON file format for Javascripts aggregation and development loading configuration.


### Useage

```javascript

[
  {
      // app: this is for all sites
    "scope" : "app",  // avilable scope values, [ "app", "brand", "site" ]

    "devicetype" : "all",  // aviliable types values ["all", "mobile", "tablet", "desktop"]

      // add locales where the set (src) of javascript files will be loaded
    "locales": ["en_ZA", "en_SG", "en_IE", "es_AR", "es_MX", "es_US", "pl_PL"],

    "dest": "/public/jsmin",

    // name: add a file names that are going to be loaded / aggrecated, for example, main_en_ZA.js etc
    "bundleName": "main",

      // these files will be loaded / aggregated related to the locales
      "src": [
      
      ]
  }
]

```

    

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

***Anton Ganeshalingam** - *Initial work* 



## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments


