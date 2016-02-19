##Comparison

##{{isnt}}

Conditionally render a block if the condition is false. Opposite of is. 
Parameters: value string|int - the value to test against.

Data:

```javascript
number = 5 
```

Template:

```handlebars 
{{#isnt number 5}}
    Kiss my shiny metal ass!
{{else}}
    Never mind :(
{{/isnt}}
```

Renders to:

Never mind :(


###{{and}}

Conditionally render a block if both values are truthy.

Parameters: values string|int - the values to test against.

Data:
```javascript
great = true 
magnificent = true 

```
Template:

```handlebars
{{#and great magnificent}}
    Kiss my shiny metal ass!
{{else}}
    Never mind :(
{{/and}}
```
Renders to:

Kiss my shiny metal ass!

###{{contains}}

Searches a string for the given value, and conditionally renders one block of content or another based on the result.

Parameters: String (the value to test against) Default: undefined

```javascript
Data:
```

```handlebars
---
truth: Assemble is the best static site generator for node.js!
---
```

Template:

```handlebars
{{#contains truth "best"}}
    Absolutely true.
{{else}}
    This is a lie.
{{/contains}}
```

Renders to:

Absolutely true.


###{{gt}}

Conditionally render a block if the value is greater than a given number (If x > y). 
Parameters: value string|int - the value to test against.

Data:

```javascript
number = 5 
```

Template:

```handlebars
{{#gt number 8}}
    Kiss my shiny metal ass!
{{else}}
    Never mind :(
{{/gt}}
```
Renders to:

Never mind :(

###{{gte}}

Conditionally render a block if the value is greater or equal than a given number (If x >= y). 
Parameters: value string|int - the value to test against.

Data:

```javascript
number = 5 
```

Template:

```handlebars
{{#gte number 5}}
  Kiss my shiny metal ass!
{{else}}
  Never mind :(
{{/gte}}
```

Renders to:

Kiss my shiny metal ass!


###{{if_gt}}

Conditionally render a block if the value is greater than a given number (If x > y). Parameters: none

```handlebars
{{#if_gt x compare=y}} ... {{/if_gt}}
```

Author: Dan Harper http://github.com/danharper

###{{if_gteq}}

Conditionally render a block if the value is greater or equal than a given number (If x >= y). Parameters: none

```handlebars
{{#if_gteq x compare=y}} ... {{/if_gteq}}
```

Author: Dan Harper http://github.com/danharper

###{{is}}

Conditionally render a block if the condition is true (if x = y).

Parameters: string|int (the value to test against) Default: undefined

Example #1:

Data:
```javascript
---
number = 5 
---
```

Template:

```handlebars
{{#is number 5}}
    Kiss my shiny metal ass!
{{else}}
    Never mind :(
{{/is}}
```

Renders to:

Kiss my shiny metal ass!

Example #2:

If you are using data from YAML front matter or any specified JSON and/or YAML source files will get passed through to the context in your templates.

Data and Templates:
```javascript
---
page:
  title: About Us
---
```

```handlebars
{{#is page.title "Home"}}
    <h1> About Us </h1>
{{else}}
    <h1> My Blog </h1>
{{/is}}
```

Renders to:

<h1> About Us </h1>

###{{ifeq}}

Alias for is. Considering consolidating

Conditionally render a block if the condition is true (If x = y).

Parameters: none

```handlebars
{{#ifeq x compare=y}} ... {{/ifeq}}
{{#compare}}...{{/compare}}
```

Credit: OOCSS

Compare the "left value" to the "right value" using any of the allowed operators.

Allowed operators

```javascript
==
===
!=
!==
<
>
<=
>=
```

typeof
Parameters:

Left: value to compare against
Operator: The operator to use for the comparison. Must be between quotes ">", "=", "<=" and so on.
Right: value to
Options: Options object for Handlebars.
Syntax:

```handlebars
{{#compare  [leftvalue ] [operator ] [rightvalue ]}} 
  foo
{{else  }} 
  bar
{{/compare }} 
```

Examples:

```handlebars
{{#compare unicorns  "<"  ponies }} 
  I knew it, unicorns are just low-quality ponies!
{{/compare }} 
{{#compare value  ">="  10}} 
  The value is greater or equal than 10
  {{else  }} 
  The value is lower than 10
{{/compare }} 
{{lt}}
```

Conditionally render a block if the value is less than a given number. Opposite of gt. 
Parameters: value string|int - the value to test against.

Data:
```javascript
number = 5 
```
Template:

```handlebars
{{#lt number 3}}
    Kiss my shiny metal ass!
{{else}}
    Never mind :(
{{/lt}}
```

Renders to:

Never mind :(

###{{lte}}

Conditionally render a block if the value is less or equal than a given number. Opposite of gte. 
Parameters: value string|int - the value to test against.

Data:

```javascript
number = 5 
```

Template:

```handlebars
{{#lte number 5}}
    Kiss my shiny metal ass!
{{else}}
    Never mind :(
{{/lte}}
```

Renders to:

Kiss my shiny metal ass!

###{{or}}

Conditionally render a block if one of the values is truthy.

Parameters: values string|int - the values to test against.

Data:

```javascript
great = no
magnificent = true 
```

Template:

```handlebars
{{#or great magnificent}}
    Kiss my shiny metal ass!
{{else}}
    Never mind :(
{{/or}}
```

Renders to:

Kiss my shiny metal ass!

###{{unless_eq}}

Alias for isnt

Conditionally render a block if the condition is false (Unless x = y). Opposite of is.

Parameters: none

```handlebars
{{#unless_eq x compare=y}} ... {{/unless_eq}}
```
Author: Dan Harper http://github.com/danharper

###{{unless_gt}}

Unless greater than (Unless x > y) Parameters: none

```handlebars
{{#unless_gt x compare=y}} ... {{/unless_gt}}
```

Author: Dan Harper http://github.com/danharper

###{{unless_gteq}}

"Unless x >= y". Render block, unless given value is greater than or equal to.

Parameters: none

###{{#unless_gteq x compare=y}} ... {{/unless_gteq}}
Author: Dan Harper http://github.com/danharper

###{{unless_lt}}

Render block, unless value is less than a given number (Unless x < y).

Parameters: none

###{{#unless_lt x compare=y}} ... {{/unless_lt}}
Author: Dan Harper http://github.com/danharper

###{{unless_lteq}}

Render block, unless value is less than or equal to a given number (Unless x <= y).

Parameters: none

###{{#unless_lteq x compare=y}} ... {{/unless_lteq}}
