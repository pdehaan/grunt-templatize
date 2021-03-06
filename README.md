grunt-templatize
================

Super simple grunt task to convert one or more handlebars-like template files into a Javascript module. Supports AMD, commonjs, and namespaced module formats.

# Simple Usage Example

First, make sure you have node.js and npm properly installed and working. You will also need to have `grunt-cli` installed globally:

```
npm install grunt-cli -g
```

Create a new project folder with `package.json` file and install dependencies from npm:

```
mkdir example
cd example
npm init
npm install grunt grunt-templatize --save-dev
mkdir templates
```

Create `Gruntfile.js` in the project folder root:

```javascript
module.exports = function (grunt) {

  'use strict';

  grunt.loadNpmTasks('grunt-templatize');

  grunt.initConfig({
    templatize: {
      app: {
        src: 'templates/*.tmplz',
        dest: 'dist/templates.js'
      }
    }
  });

  grunt.registerTask('default', ['templatize']);

};
```

Create the following template files:

`templates/header.tmplz`

```html
<header>
<h1>{{title}}</h1>
<div>{{body}}</div>
</header>
```

`templates/footer.tmplz`

```html
<footer>
<a src="{{url}}">{{text}}</a>
</footer>
```

Run the following command:

```
grunt templatize
```

This will generate `dist/templates.js` using the AMD module format with the following content:

```javascript
define({footer:function(model){return '<footer><a src="'+model.url+'">'+model.text+'</a></footer>';},
header:function(model){return '<header><h1>'+model.title+'</h1><div>'+model.body+'</div></header>';}});
```

Here is a beautified version of `dist/templates.js`:

```javascript
define({
  footer: function (model) {
    return '<footer><a src="' + model.url + '">' + model.text + '</a></footer>';
  },
  header: function (model) {
    return '<header><h1>' + model.title + '</h1><div>' + model.body + '</div></header>';
  }
});
```

This AMD module can be imported into your application and the template can be compiled with code similar to this:

```javascript
define(['templates'],function(templates) {
  'use strict';

  var headerModel = {
    title: 'Hello',
    body: 'World'
  };
  var header = templates.header(headerModel);

  var footerModel = {
    text: 'Privacy Policy',
    url: '/privacy.html'
  };
  var footer = templates.footer(footerModel);

});
```

The module format of the destination file can be changed using a `format` of `amd`, `commonjs`, or `namesapce`. This is configured like this:

```javascript
templatize: {
  app: {
    options: {
      format: 'commonjs'
    },
    src: 'templates/*.tmplz',
    dest: 'dist/templates.js'
  }
}
```

Results using `commonjs` format:

```javascript
module.exports={footer:function(model){return '<footer><a src="'+model.url+'">'+model.text+'</a></footer>';},
header:function(model){return '<header><h1>'+model.title+'</h1><div>'+model.body+'</div></header>';}};
```

```javascript
module.exports = {
  footer: function (model) {
    return '<footer><a src="' + model.url + '">' + model.text + '</a></footer>';
  },
  header: function (model) {
    return '<header><h1>' + model.title + '</h1><div>' + model.body + '</div></header>';
  }
};
```

Results using `namespace` format:

```javascript
!function(root){root.templatize.footer=function(model){return '<footer><a src="'+model.url+'">'+model.text+'</a></footer>';}
root.templatize.header=function(model){return '<header><h1>'+model.title+'</h1><div>'+model.body+'</div></header>';}}(this);
```

```javascript
!function (root) {
  root.templatize.footer = function (model) {
    return '<footer><a src="' + model.url + '">' + model.text + '</a></footer>';
  }
  root.templatize.header = function (model) {
    return '<header><h1>' + model.title + '</h1><div>' + model.body + '</div></header>';
  }
}(this);
```

Support for multiple output target destination files:

```javascript
grunt.initConfig({
  templatize: {
    app: {
      src: 'templates/app/*.tmplz',
      dest: 'dist/js/app-templates.js'
    },
    components: {
      src: 'templates/components/*.tmplz',
      dest: 'dist/js/components-templates.js'
    }
  }
});
```

Full configuration including default values:

```javascript
grunt.initConfig({
  templatize: {
    app: {
      // Glob of all source template files
      src: 'templates/app/*.tmplz',
      // Location of generated output file
      dest: 'dist/js/app-templates.js',
      // Options to pass to grunt-templatize
      options: {
        // Module format for output file. Possible values include
        // 'amd', 'commonjs', 'namespace'
        format: 'amd',
        // Prefix at top of each output file 
        prefix: 'define({',
        // Suffix at end of each output file
        suffix: '});',
        // Prefix before first source file 
        firstPrefix: '',
        // Prefix before each source file except the first
        eachPrefix: '',
        // Output between key (source filename) and function 
        eachMiddle: ':',
        // Suffix after each source file except the last
        eachSuffix: ',',
        // Suffix after last source file
        lastSuffix: '',
        // Options to pass to the templatize library
        templatize: {
          // Options to use with the HTML Minifier
          htmlmin: {
            removeComments: true,
            removeCommentsFromCDATA: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: false,
            removeRedundantAttributes: false,
            useShortDoctype: true,
            removeEmptyAttributes: false,
            removeOptionalTags: false    
          },
          // Set htmlminEnable to true to always minify html
          htmlminEnable: false,
          // Set htmlminMultiLines to true to minify files with more than one line
          htmlminMultiLines: false          
        }
      }
    }
  }
});
```

## HTML Fragments

By default, grunt-templatize will minify all of your HTML templates.

If you have templates that contain ill-formed HTML, as is often the case, then using the HTML Minifier feature will break your templates. This is because the minifier also makes the HTML well-formed by adding missing closing tags and removing extraneous closing tags.

To turn off the HTML minifier, set `htmlminEnable: false`. Note that the option can be set differently for each target, as in this example:

```javascript
grunt.initConfig({
  templatize: {
    app: {
      src: 'templates/app/*.tmplz',
      dest: 'dist/js/app-templates.js'
    },
    components: {
      options: {
        templatize: {
          htmlminEnable: false
        }
      },
      src: 'templates/components/*.tmplz',
      dest: 'dist/js/components-templates.js'
    }
  }
});
```

In many cases, HTML fragment templates are very short and can live on a single line. By setting `htmlminMultiLines: true`, any single-line templates will not be minified, but any templates that contain more than one line will be minified.

```javascript
grunt.initConfig({
  templatize: {
    components: {
      options: {
        templatize: {
          htmlminEnable: false,
          htmlminMultiLines: true
        }
      },
      src: 'templates/components/*.tmplz',
      dest: 'dist/js/components-templates.js'
    }
  }
});
```

Any option can also be set for all targets using this style of options configuration:

```javascript
templatize: {
  options: {
    templatize: {
      htmlminEnable: false
    }
  },
  app: {
    src: 'templates/*.tmplz',
    dest: 'dist/templates.js'
  }
}
```

## Iteration in Templates

Iteration is supported using `{{#each item}}` and `{{/each}}` tags in your templates.  When these tags are used, the templatized output includes calls to the `_.map()` function. If you are using Underscore or Lodash, this is available out of the box. If not, any implementation that is API compatible with the Underscore version should work.

Note that you may need to provide a custom `prefix` and `suffix` to use iteration effectively. For instance, to use this in an AMD module, you could use this configuration:

```javascript
templatize: {
  options: {
    prefix: 'define(["lodash"],function(_){return {',
    suffix: '};});'
  }
}
```

Here is an example of using the `{{#each}}` iterator:

```
<h1>{{title}}</h1>
<ul>
  {{#each items}}
  <li>
    <span>{{name}}</span>
    <span>{{../foo}}</span>
  </li>
  {{/each}}
</ul>
```

This template should be given an object with this structure:

```javascript
{
  title: 'This is the title',
  foo: 'FOO',
  items: [
    { name: 'Item A' },
    { name: 'Item B' }
  ]
}
```

Note that templatize supports nested `{{#each}}`'s, and within an inner scope, you can reference properties in the outer scope. This is done by using `../foo` notation. You can step up multiple scope levels by repeating the dots, i.e. `../../../foo`. 
