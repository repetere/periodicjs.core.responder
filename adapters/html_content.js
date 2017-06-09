'use strict';
const path = require('path');
const Promisie = require('promisie');
const ejs = require('ejs');
const fs = Promisie.promisifyAll(require('fs-extra'));
const JSON_Adapter = require(path.join(__dirname, './json_content'));

/**
 * Iterates through an array of file paths resolving after it finds a valid path or resolves with the default value
 * @param  {string} _default A default value to resolve if no provided file path is valid
 * @param  {string[]}  [dirs=[]]    File paths to check for validity (file exists)
 * @return {Object}         Returns a Promise which resolves with a file path or the default value
 */
var findValidViewFromPaths = function (_default, dirs = []) {
  if (!dirs.length) return Promisie.resolve(_default);
  dirs.reverse(); // use the specific routes first, fallback to the default route
  return Promisie.retry(() => {
    let filePath = dirs.shift();
    return fs.statAsync(filePath)
      .then(() => filePath, e => Promise.reject(e));
  }, { times: dirs.length, timeout: 0, })
    .then(fp => fp)
    .catch(() => _default);
};

/**
 * Renders an HTML string from provided data
 * @param  {Object}   data    Template data should conform to EJS template by default or custom templating engine
 * @param  {Object}   options Configurable options for the rendering of HTML string
 * @param {string} [options.themename=this.themename] Specifies a periodic theme folder that will be checked when looking for a matching template
 * @param {string} [options.viewname=this.viewname] Specifies the filename of the template
 * @param {string} [options.extname=this.extname] Specifies a periodicjs extension folder that should be checked when looking for a matching template
 * @param {Boolean} [options.resolve_filepath] If true a valid file path will be returned and rendering of the template file will be skipped
 * @param {string} [options.fileext=this.fileext] Specifies the extension name of the template file
 * @param {string|string[]} [options.dirname] Optional custom directories to be checked for template
 * @param {Object} [options.engine_configuration=this.engine_configuration] Custom configuration object for whichever templating engine being used see EJS documentation for details on options for EJS
 * @param  {Function} cb      Callback function
 */
const _RENDER = function (data, options) {
  try {
    let { themename, viewname, extname, fileext, } = ['themename', 'viewname', 'extname', 'fileext', ].reduce((result, key) => {
      result[key] = options[key] || this[key];
      return result;
    }, {});
    if (typeof viewname !== 'string') throw new TypeError('viewname must be specified in order to render template');
    let dirs = [];
    //fallback view
    dirs.push(path.join(options.dirname, `${viewname.replace(viewname.split('/')[0], 'default')}${(/^\./.test(fileext)) ? fileext : '.' + fileext}`));
    if (options.dirname) {
      if (Array.isArray(options.dirname)) options.dirname.forEach(dir => dirs.push(path.join(dir, `${ viewname }${ (/^\./.test(fileext)) ? fileext : '.' + fileext }`)));
      else dirs.push(path.join(options.dirname, `${ viewname }${ (/^\./.test(fileext)) ? fileext : '.' + fileext }`));
      
    }
    if (typeof themename === 'string' && typeof fileext === 'string') dirs.push(path.join(__dirname, '../../../content/themes', themename, 'views', `${ viewname }${ (/^\./.test(fileext)) ? fileext : '.' + fileext }`));
    if (typeof extname === 'string' && typeof fileext === 'string') dirs.push(path.join(__dirname, '../../', extname, 'views', `${ viewname }${ (/^\./.test(fileext)) ? fileext : '.' + fileext }`));
    dirs.push(path.join(__dirname, '../../../app/views', `${viewname}${(/^\./.test(fileext)) ? fileext : '.' + fileext}`));
    
    if (options.resolve_filepath === true) {
      console.log('resolving paths', { options, viewname, dirs, });
      return findValidViewFromPaths(viewname, dirs);
    } else {
      console.log('not resolving filepath', { options, viewname, fileext, dirs, });
      return findValidViewFromPaths(`${ viewname }${ (/^\./.test(fileext)) ? fileext : '.' + fileext }`, dirs)
        .then(filePath => Promisie.all(fs.readFileAsync(filePath, 'utf8'), filePath))
        .spread((filestr, filename) => {
          filestr = filestr.toString();
          return Promisie.resolve(this.engine.render(filestr, data, Object.assign({ filename, }, options.engine_configuration || this.engine_configuration)));
        })
        .catch(e => Promisie.reject(e));
    }
  }  catch (e) {
    return Promisie.reject(e);
  }
};

/**
 * Renders an HTML error page template
 * @param  {Object}   err     If err is an instanceof Error or has a .message property only the error message will be included
 * @param  {Object}   options Configurable options for error template rendering see _RENDER for further details on options
 * @param {string} [options.viewname="home/error404"] Overrideable view name for the error template
 * @param  {Function} cb      Callback function
 */
const _ERROR = function (err, options) {
  try {
    if (this.custom_error_path) options.viewname = (options.viewname) ? path.join(this.custom_error_path, options.viewname) : path.join(this.custom_error_path, 'home/error404');
    else options.viewname = options.viewname || 'home/error404';
    return _RENDER.call(this, Object.assign({ flash_messages: {}, }, options.locals || {}, {
      pagedata: { title: 'Not Found', error: (err instanceof Error || err.message) ? err.message : err, },
      url: options.viewname,
    }), options);
  }  catch (e) {
    return Promise.reject(e);
  }
};

/**
 * HTML response adapter class which renders templates from provided data and template names
 * @type {HTML_Adapter}
 * @extends {JSON_Adapter}
 */
const HTML_ADAPTER = class HTML_Adapter extends JSON_Adapter {
  /**
   * @constructor
   * @param  {Object} options Configurable options for HTML adapter
   * @param {Object} [options.engine=ejs] Defines which templating engine to use when rendering template files
   * @param {Function} options.engine.render If providing a custom rendering engine module must include a .render function which is synchronous or returns a Promise. Render function should also expect the following arguments in this order: (template_string, template_data, options)
   * @param {Object} [options.engine_configuration] Defines a default set of configuration options that are passed to the rendering function
   * @param {string} [options.extname] Name of a periodicjs extension. Used in finding valid template
   * @param {string} [options.themename="periodicjs.theme.default"] Name of a periodicjs theme. Used in finding valid template
   * @param {Object} [options.locals={}] Shared local values for rendering. Only used when express rendering is not available.
   * @param {string} [options.viewname] Defines a default view name that should be used in rendering
   * @param {string} [options.fileext=".ejs"] Defines the default extension name of the template file
   */
  constructor (options = {}) {
    super(options);
    this.engine = (options.engine && typeof options.engine.render === 'function') ? options.engine : ejs;
    this.engine_configuration = options.engine_configuration;
    this.extname = options.extname;
    this.themename = options.themename || 'periodicjs.theme.default';
    this.viewname = options.viewname;
    this.fileext = options.fileext || '.ejs';
    this.locals = (options.locals && typeof options.locals === 'object') ? options.locals : {};
    this.custom_error_path = options.custom_error_path;
  }
  /**
   * Renders HTML from provided data and template
   * @param  {Object}  data    Data that is passed to render template
   * @param  {Object}  [options={}] Configurable options for rendering see _RENDER for full details
   * @param {Function} [options.formatRender=_RENDER] Custom rendering function. It is not recommended to override the default value of this property and may no longer work properly
   * @param {Object} [options.req] Express request object. If options.req and options.res are defined the express .render method will be used to render template
   * @param {Object} [options.res] Express response object. If options.res and options.req are defined the express .render method will be used to render template
   * @param {Boolean} [options.skip_response] If true function will resolve with the rendered template instead of sending a response
   * @param  {Function} cb      Optional callback function. If arugment is not passed function will 
   * @return {Object}          Returns a Promise if cb arguement is not provided
   */
  render (data, options = {}, cb = false) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }
    if (options.req && options.res) {
      data.flash_messages = (typeof options.req.flash === 'function') ? options.req.flash() : {};
      return _RENDER.call(this, {}, Object.assign(options, { resolve_filepath: true, }))
        .then(filepath => Promisie.promisify(options.res.render, options.res)(filepath, data))
        .then(rendered => {
          if (typeof cb === 'function') cb(null, rendered);
          else if (options.skip_response && typeof cb !== 'function') return Promisie.resolve(rendered);
          else {
            options.res.status(200).send(rendered);
            return Promisie.resolve(rendered);
          }
        })
        .catch(err => this.error(err, options, cb));
    }    else {
      options.formatRender = (typeof options.formatRender === 'function') ? options.formatRender : _RENDER.bind(this);
      options.sync = true;
      return super.render(Object.assign({ flash_messages: {}, }, this.locals, data), options)
        .then(result => {
          if (typeof cb === 'function') cb(null, result);
          else return result;
        }, e => {
          if (typeof cb === 'function') cb(e);
          else return Promisie.reject(e);
        });
    }
  }
  /**
   * Renders error view from template
   * @param  {*}  err    Any error data that should be passed to template
   * @param  {Object}  [options={}] Configurable options for rendering see _ERROR for full details
   * @param {Function} [options.formatError=_RENDER] Custom rendering function. It is not recommended to override the default value of this property and may no longer work properly
   * @param {Object} [options.req] Express request object. If options.req and options.res are defined the express .render method will be used to render template
   * @param {Object} [options.res] Express response object. If options.res and options.req are defined the express .render method will be used to render template
   * @param {Boolean} [options.skip_response] If true function will resolve with the rendered 
   * @param  {Function} cb      Optional callback function. If arugment is not passed function will 
   * @return {Object}          Returns a Promise if cb arguement is not provided
   */
  error (err, options = {}, cb = false) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }
    if (options.req && options.res) {
      let flash_messages = (typeof options.req.flash === 'function') ? options.req.flash() : {};
      if (options.dirname && this.custom_error_path) options.dirname = (Array.isArray(options.dirname)) ? options.dirname.concat(this.custom_error_path) : [options.dirname, ].concat(this.custom_error_path);
      else if (!options.dirname && this.custom_error_path) options.dirname = this.custom_error_path;
      return _RENDER.call(this, {}, Object.assign(options, { resolve_filepath: true, }))
        .then(filepath => Promisie.promisify(options.res.render, options.res)(filepath, Object.assign({
          pagedata: { title: 'Not Found', error: (err instanceof Error || err.message) ? err.message : err, },
          url: options.viewname,
        }, { flash_messages, error: err, message: err.message, })))
        .then(rendered => {
          if (typeof cb === 'function') cb(null, rendered);
          else if (options.skip_response && typeof cb !== 'function') return Promisie.resolve(rendered);
          else {
            options.res.status(500).send(rendered);
            return Promisie.resolve(rendered);
          }
        })
        .catch(err => {
          if (typeof cb === 'function') cb(err);
          else return Promisie.reject(err);
        });
    }    else {
      options.formatError = (typeof options.formatError === 'function') ? options.formatError : _ERROR.bind(this);
      options.sync = true;
      options.locals = this.locals;
      return super.error(err, options)
        .then(result => {
          if (typeof cb === 'function') cb(null, result);
          else return result;
        }, e => {
          if (typeof cb === 'function') cb(e);
          else return Promisie.reject(e);
        });
    }
  }
};

module.exports = { HTML_ADAPTER, findValidViewFromPaths, };
