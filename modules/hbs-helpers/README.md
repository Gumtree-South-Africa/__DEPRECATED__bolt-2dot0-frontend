# Handlebar Inheritance 

A NodeJS based handlebar inhertance.

### Prerequisities

Make sure package.json got the laterest version of express-handlebar


### Example

```handlebars
<!-- main.hbs -->
<html>
<head>
  <title>
    {{#block "title"}} Default Title {{/block}}
  </title>
</head>
<body>
  {{> (base "header")}}
  {{#block "content"}}
    This will be default content that appears in a
    deriving template if it does not declare a
    replacement for the "content" section.
  {{/block}}
  {{> footer}}
</body>
</html>

<!-- searchbar-en_ZA.hbs -->
<div> ZA search bar </div>

<!-- home.hbs -->
{{#block "title"}} Home {{/block}}
{{#block "sign-in"}} HOME {{/partial}}


<!-- home-en_ZA.hbs -->
{{#partial "title"}} My Home for ZA {{/partial}}
{{#partial "sign-in"}} My Home sign-in {{>> (dynamic "searchbar")}} 

{{> (base "home") }}

```


## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Anton Ganeshalingam** - *Initial work* 



## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments


