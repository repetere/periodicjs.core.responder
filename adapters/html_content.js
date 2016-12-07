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
	if (!dirs.length) return Promise.resolve(_default);
	return Promisie.retry(() => {
		let filePath = dirs.shift();
		return fs.statAsync(filePath)
			.then(() => filePath, e => Promise.reject(e));
	}, { times: dirs.length, timeout: 0 })
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
 * @param {string} [options.fileext=this.fileext] Specifies the extension name of the template file
 * @param {string|string[]} [options.dirname] Optional custom directories to be checked for template
 * @param {Object} [options.engine_configuration=this.engine_configuration] Custom configuration object for whichever templating engine being used see EJS documentation for details on options for EJS
 * @param  {Function} cb      Callback function
 */
const _RENDER = function (data, options) {
	try {
		let { themename, viewname, extname, fileext } = ['themename','viewname','extname','fileext'].reduce((result, key) => {
	    result[key] = options[key] || this[key];
	    return result;
	  }, {});
	  if (typeof viewname !== 'string') throw new TypeError('viewname must be specified in order to render template');
	  let dirs = [];
	  if (options.dirname) {
	  	if (Array.isArray(options.dirname)) options.dirname.forEach(dir => dirs.push(path.join(dir, viewname)));
	  	else dirs.push(path.join(options.dirname, viewname));
	  }
	  if (typeof themename == 'string' && typeof fileext === 'string') dirs.push(path.join(__dirname, '../../../content/themes', themename, 'views', `${ viewname }${ (/^\./.test(fileext)) ? fileext : '.' + fileext }`));
	  if (typeof extname === 'string' && typeof fileext === 'string') dirs.push(path.join(__dirname, '../../', extname, 'views', `${ viewname }${ (/^\./.test(fileext)) ? fileext : '.' + fileext }`));
	  return findValidViewFromPaths(viewname, dirs)
	  	.then(filePath => Promisie.all([fs.readFileAsync(filePath, 'utf8'), filePath]))
	  	.spread((filestr, filename) => {
	  		filestr = filestr.toString();
	  		return Promise.resolve(this.engine.render(filestr, data, Object.assign({ filename }, options.engine_configuration || this.engine_configuration)));
	  	});
	}
	catch (e) {
		return Promise.reject(e);
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
		options.viewname = options.viewname || 'home/error404';
		return _RENDER.call(this, {
			pagedata: { title: 'Not Found', error: (err instanceof Error || err.message) ? err.message : err },
			url: options.viewname
		}, options);
	}
	catch (e) {
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
	}
	/**
	 * Renders HTML from provided data and template
	 * @param  {Object}  data    Data that is passed to render template
	 * @param  {Object}  [options={}] Configurable options for rendering see _RENDER for full details
	 * @param {Function} [options.formatRender=_RENDER] Custom rendering function. It is not recommended to override the default value of this property and may no longer work properly
	 * @param  {Function} cb      Optional callback function. If arugment is not passed function will 
	 * @return {Object}          Returns a Promise if cb arguement is not provided
	 */
	render (data, options = {}, cb = false) {
		if (typeof options === 'function') {
			cb = options;
			options = {};
		}
		options.formatRender = (typeof options.formatRender === 'function') ? options.formatRender : _RENDER.bind(this);
		options.sync = true;
		return super.render(data, options)
			.then(result => {
				if (typeof cb === 'function') cb(null, result);
				else return result;
			}, e => {
				if (typeof cb === 'function') cb(e);
				else return Promise.reject(e);
			});
	}
	/**
	 * Renders error view from template
	 * @param  {*}  err    Any error data that should be passed to template
	 * @param  {Object}  [options={}] Configurable options for rendering see _ERROR for full details
	 * @param {Function} [options.formatError=_RENDER] Custom rendering function. It is not recommended to override the default value of this property and may no longer work properly
	 * @param  {Function} cb      Optional callback function. If arugment is not passed function will 
	 * @return {Object}          Returns a Promise if cb arguement is not provided
	 */
	error (err, options = {}, cb = false) {
		if (typeof options === 'function') {
			cb = options;
			options = {};
		}
		options.formatError = (typeof options.formatError === 'function') ? options.formatError : _ERROR.bind(this);
		options.sync = true;
		return super.error(err, options)
			.then(result => {
				if (typeof cb === 'function') cb(null, result);
				else return result;
			}, e => {
				if (typeof cb === 'function') cb(e);
				else return Promise.reject(e);
			});
	}
};

module.exports = HTML_ADAPTER;
