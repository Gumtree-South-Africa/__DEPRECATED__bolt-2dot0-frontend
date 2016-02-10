# Handlebar Inheritance 

A NodeJS based handlebar inhertance.

### Prerequisities

Make sure package.json got the laterest version of express-handlebar


### Usage

```handlebars
<!-- base.hbs -->
<html>
<head>
  <title>
    {{#block "title"}} Default Title {{/block}}
  </title>
</head>
<body>
  {{> header}}
  {{#block "content"}}
    This will be default content that appears in a
    deriving template if it does not declare a
    replacement for the "content" section.
  {{/block}}
  {{> footer}}
</body>
</html>

<!-- home.hbs -->
{{#partial "title"}} Home {{/partial}}
{{#partial "content"}} HOME {{/partial}}
{{> base}}

<!-- about.hbs -->
{{#partial "title"}} About {{/partial}}
{{#partial "content"}} ABOUT {{/partial}}
{{> base}}
```


## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Anton Ganeshalingam** - *Initial work* 



## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments


