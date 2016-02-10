# Handlebar Template Inheritance 

A NodeJS based handlebar inhertance.

### Prerequisities

Make sure package.json got the laterest version of express-handlebar

### Useage
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

### Technological background

Handlebars is a member of the family of "logic-less" template systems born from Mustache. I will not describe the merits of logic-less templates in this post. (If you are unfamiliar with them, then please visit either of the two links at the beginning of this paragraph.) Rather, I want to describe a simple technique for extending Handlebars with template inheritance.
The goal
Consider a simple website with two pages:
Single-column layout with header, content, and footer  Single-column layout with header, content, and footer
Both pages share the same header and footer elements, while providing their own content.
Template composition with inclusion
Every template language I have seen provides some mechanism for one template to include another, thus supporting the reuse of repeated elements like headers and footers. The included templates are called partials in Mustache parlance:

```handlebars
<!-- home.hbs -->
<html>
<body>
  {{> header}}
  <p> HOME </p>
  {{> footer}}
</body>
</html>

<!-- about.hbs -->
<html>
<body>
  {{> header}}
  <p> ABOUT </p>
  {{> footer}}
</body>
</html>

<!-- header.hbs -->
<p> HEADER </p>

<!-- footer.hbs -->
<p> FOOTER </p>
```

This is not the DRYest implementation, however. The <html> and <body> tags are copied on every page. Adding scripts and stylesheets will only aggravate the situation. Larger sections can be abstracted:

```handlebars
<!-- home.hbs -->
{{> top}}
<p> HOME </p>
{{> bottom}}

<!-- about.hbs -->
{{> top}}
<p> ABOUT </p>
{{> bottom}}

<!-- top.hbs -->
<html>
<body>
  {{> header}}

<!-- bottom.hbs -->
  {{> footer}}
</body>
</html>

```

This pattern is recommended when template inheritance is unavailable. It is fragile and rigid, though. Some tags, like <html> and <body> here, are split among the included templates - terrible for maintenance and readability. To customize a portion of an included template for each page, like the <title>, the templates must be divided even further:

```handlebars
<!-- home.hbs -->
{{> top-before-title}}
Home
{{> top-after-title}}
<p> HOME </p>
{{> bottom}}

<!-- about.hbs -->
{{> top-before-title}}
About
{{> top-after-title}}
<p> ABOUT </p>
{{> bottom}}

<!-- top-before-title.hbs -->
<html>
<head>
  <title>

<!-- top-after-title.hbs -->
  </title>
</head>
<body>
  {{> header}}
  
```

This can quickly grow into a mess (and already has by some standards).
Template composition with inheritance (and inclusion)
Template inheritance comes, I believe, from Django. It nicely addresses the above issues with template composition by essentially providing a mechanism for implementing the Dependency Inversion Principle.
With template inheritance, a base template has specially annotated sections of content that can be overwritten by deriving templates. Deriving templates then declare their base template and replacement content:


```handlebars
<!-- base.hbs -->
<html>
<head>
  <title>{{#title}} Default Title {{/title}}</title>
</head>
<body>
  {{> header}}
  {{#content}}
    This will be default content that appears in a
    deriving template if it does not declare a
    replacement for the "content" section.
  {{/content}}
  {{> footer}}
</body>
</html>

<!-- home.hbs -->
{{derives base}}
{{#title}} Home {{/title}}
{{#content}} HOME {{/content}}

<!-- about.hbs -->
{{derives base}}
{{#title}} About {{/title}}
{{#content}} ABOUT {{/content}}

```
Much better. Fewer templates are needed, and no context needs to be split.
Template inheritance in Handlebars Unfortunately, the Mustache specification does not prescribe support for template inheritance. Handlebars, which offers a number of improvements over vanilla Mustache, does not include it either. Dust does, but I prefer the syntax and helper interface of Handlebars. The good news is that Handlebars (perhaps unintentionally) exposes its registry of partials which can be used along with a couple of simple block helpers to implement template inheritance.
Three constructs are needed:
For base templates:
A block of default content
For deriving templates:
A block of replacement content
A declaration of the base template
The block block helper will replace its section with the partial of the same name if it exists:

```handlebars

handlebars.loadPartial = function (name) {
  var partial = handlebars.partials[name];
  if (typeof partial === "string") {
    partial = handlebars.compile(partial);
    handlebars.partials[name] = partial;
  }
  return partial;
};

handlebars.registerHelper("block",
  function (name, options) {
    /* Look for partial by name. */
    var partial
      = handlebars.loadPartial(name) || options.fn;
    return partial(this, { data : options.hash });
  });
  ```

It will be used to specify default content in base templates:

```handlebars
{{#block "name"}}
  Default content
{{/block}}
```

Do not confuse the name (block) of this block helper with the general concept of block helpers. The name is simply an (admittedly potentially confusing) coincidence that was chosen to be consistent with existing systems supporting template inheritance, like Django.
The partial block helper generates no output and instead registers a section of content as a named partial in the Handlebars runtime:

```handlebars
handlebars.registerHelper("partial",
  function (name, options) {
    handlebars.registerPartial(name, options.fn);
  });
  
```

It can be used to declare any inline partial, but in the context of template inheritance, it annotates replacement content in deriving templates:

```handlebars
{{#partial "name"}}
  Replacement content
{{/partial}}

```

For the final piece, declaring a base template, we will resort to normal template inclusion (partials). In contrast to existing template inheritance convention, this declaration will occur at the end of a deriving template rather than the beginning. The reason why becomes apparent when we consider the dataflow:
The partials for the base and deriving templates are registered.
The user requests a rendering of the deriving template.
Handlebars instantiates the partial for the deriving template:
At the beginning of the deriving template, a number of partial blocks will register partials for sections of replacement content.
At the end of the deriving template, the partial for the base template will be included.
Handlebars instantiates the partial for the base template:
Each block block (forgive me) will be replaced by the partial of the given name if one was registered in the deriving template. Otherwise, its given content will be used as the default.
Conclusion
The running example can be rewritten using these helpers:

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


