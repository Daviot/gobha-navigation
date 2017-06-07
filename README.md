# gobha-navigation

A [Metalsmith](www.metalsmith.io) plugin to generate navigations in metalsmith from meta informations

## Installation

	$ npm install gobha-navigation

## Javascript Usage

```js
let navigation = require('gobha-navigation')

metalsmith.use(navigation())
```

## Options

```js
{
	extension: "html|php|md|hbs"
}
```
#### extension

The plugin checks every file extension and when the extension matches the regex it will process the file and change the file extension

## Create new navigation

Just add a new meta information into the file itself to create a new navigation

```md
---
nav: main
---
```

The text "main" is the name of the navigaton

Now you can access the navigation main in your templates

``` hbs
{{#if navigation.main}}
	<ul>
	{{#each navigation.main}}
		<li><a href="{{file}}">{{title}}</a></li>
	{{/each}}
	</ul>
{{/if}}
```

Inside the loop you can access the url of the file via`{{file}}` and the title via `{{title}}`

## Change order of the files in the navigation

To set an order for the files in the navigation add the sign `=` followed by a index(number) to the meta informationen in the file. 

```md
---
nav: main=10
---
```

1 is the first file, 2 the second and so on...  
If you add a number twice it uses the order in which the files are processed


## License
MIT