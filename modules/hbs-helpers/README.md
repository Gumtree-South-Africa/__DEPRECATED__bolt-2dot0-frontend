# Handlebar Inheritance 

A NodeJS based handlebar inhertance.

### Prerequisities

Make sure package.json got the laterest version of express-handlebar


### Usage

```
Give the example
```

```handlebars
//block
{{block "SFO"}} {{/block}}

// static parital
{{> "SFO" }}

// dynamic partial
{{> (dynamic "SFO") }}

// base partial 
{{> (base "SFO")}}
```


## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Anton Ganeshalingam** - *Initial work* 



## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments


