# Handlebar Helpers

Handlebars Helpers

### Prerequisities

Make sure package.json got the laterest version of express-handlebar

### Useage

#### i18n
```handlebars

{{i18n "my.name is %s. i'm %s old. I live in, %s" "anton" "20" "santa cruz"}}
 
{{i18n "my.name is %s. i'm %s old." "anton" "20" }}
 
{{i18n "my.name is %s." "anton"  }}
 
 {{i18n "my.name" }}
```

#### DigitalGrouping  {{digitalGrouping number ","}}
```handlebars
{{digitalGrouping 12433 ","}} 
```
output --> 12,433

```handlebars
{{! for sub expressions }}
{{{i18n "home.page.live.ad.count.label" (digitGrouping this.totalLiveAdCount ",") }}}
```


## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Anton Ganeshalingam** - *Initial work* 



## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments


