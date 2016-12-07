# periodicjs.core.data
[![Build Status](https://travis-ci.org/typesettin/periodicjs.core.data.svg?branch=master)](https://travis-ci.org/typesettin/periodicjs.core.responder) [![NPM version](https://badge.fury.io/js/periodicjs.core.responder.svg)](http://badge.fury.io/js/periodicjs.core.responder) [![Coverage Status](https://coveralls.io/repos/github/typesettin/periodicjs.core.responder/badge.svg?branch=master)](https://coveralls.io/github/typesettin/periodicjs.core.responder?branch=master)  [![Join the chat at https://gitter.im/typesettin/periodicjs.core.data](https://badges.gitter.im/typesettin/periodicjs.core.responder.svg)](https://gitter.im/typesettin/periodicjs.core.responder?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


### Description
Core responder is a component of periodicjs.core.controller that provides adapters for different formatting responses across different content types. Each adapter may have options specific to the content type, but after being constructed the same methods are exposed. Depending on content type adapters do everything from wrapping JSON data in a standard way to rendering HTML from templates.

### [Full Documentation](https://github.com/typesettin/periodicjs.core.responder/blob/master/doc/api.md)

### Usage (basic)
```javascript
const AdapterInterface = require('periodicjs.core.responder');
var adapter = AdapterInterface.create({ adapter: 'json' });
//Basic usage (JSON)
//With no callback param returns a Promise
adapter.render({ foo: 'bar' })
    .then(result => {
        /*
          {
              "result": "success",
              "status": 200,
              "data": {
                  "foo": "bar"
              }
          }
        */
    });
//With a callback param
adapter.render({ foo: 'bar' }, (err, result) => {
    /*
      {
          "result": "success",
          "status": 200,
          "data": {
              "foo": "bar"
          }
      }
    */
});
//Second param can also be configurable options sync: true will handle operation synchronously
let result = adapter.render({ foo: 'bar' }, { sync: true });
/*
  {
      "result": "success",
      "status": 200,
      "data": {
          "foo": "bar"
      }
  }
*/
//Formatting can also be customized
let result = adapter.render({ foo: 'bar' }, {
    formatRender: function (data, options) {
        return {
            custom: 'field',
            data
        };
    }
});
/*
  {
    "custom": "field",
    "data": {
        "foo": "bar"
    }
  }
*/
//Basic usage (XML)
adapter = AdapterInterface.create({ adapter: 'xml', xml_root: 'example' });
adapter.render({ foo: 'bar' })
    .then(result => {
        /*
         <?xml version="1.0">
         <example>
            <foo>bar</foo>
         </example>
        */
    });
//configuration for XML rendering can also be passed
adapter.render({ foo: 'bar' }, {
    declaration: { encoding: 'UTF-8' }
}, (err, result) => {
    /*
     <?xml version="1.0" encoding="UTF=8">
     <example>
        <foo>bar</foo>
     </example>
    */
});
//Basic usage (HTML)
//Since template rendering is inherently async the sync option is ignored
adapter = AdapterInterface.create({ adapter: 'html', viewname: 'user.ejs' });
//By default HTML adapter renders EJS templates
adapter.render({ user: 'Jim' })
    .then(result => {
        //Hello <%- user %>! => Hello Jim!
    });
//Custom template engines can also be used as long as they expose a .render method
adapter = AdapterInterface.create({ adapter: 'html', viewname: 'user.pug', engine: require('pug') });
adapter.render({ user: 'Jim' })
    .then(result => {
        //Hello ${user}! => Hello Jim!
    });
```
### Usage (HTML Adapter Advanced)
```javascript
const AdapterInterface = require('periodicjs.core.responder');
const mustache = require('mustache');
const path = require('path');
//Because the adapter uses the .render method of the template engine you can overwite this .render method to further customize behavior
var render = mustache.render.bind(mustache);
mustache.render = function (template, data, options) {
    mustache.parse(template);
    return render(template, data, options);
};
const adapter = AdapterInteraface.create({ adapter: 'html', engine: require('mustache'), viewname: 'user.mustache' });
//You can customize which directories .render will search for the template by passing .dirname. This also optimizes .render because custom directories are searched ahead of the theme/extension directories
adapter.render({ user: 'Jim' }, { dirname: '/some/path/to/dir' })
    .then(result => {
        //Hello {{ user }}! => Hello Jim!
    });

```
### Usage (with custom adapter)
```javascript
const AdapterInterface = require('periodicjs.core.responder');
const template = function (data) {
    return `Hello ${ data }!`;
};
const CustomAdapter = class {
    constructor (options) {
        ...
    },
    render (data, options) {
        return template(data);
    },
    error (err, options) {
        return `There was an error: ${ err.message } :(`;
    }
};
var adapter = AdapterInterface.create({ adapter: CustomAdapter });
adapter.render('Jim'); //Hello Jim!
```

### Development
*Make sure you have grunt installed*
```sh
$ npm install -g grunt-cli jsdoc-to-markdown
```

For generating documentation
```sh
$ grunt doc
$ jsdoc2md adapters/**/*.js index.js > doc/api.md
```
### Notes
* Check out [https://github.com/typesettin/periodicjs](https://github.com/typesettin/periodicjs) for the full Periodic Documentation

### Testing
```sh
$ npm i
$ grunt test
```
### Contributing
License
----

MIT
