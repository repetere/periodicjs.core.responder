'use strict';
const Promisie = require('promisie');

/**
 * Creates a formatted success response object
 * @param  {*}  data    Any data that should be sent with the success response
 * @param  {Object} options Configurable options for success response formatting
 * @param {Function} [options.formatRender=this.formatRender] Custom formatting function for json success response. This argument will be ignored if not a function
 * @return {Object}         Formatted success response object
 */
const _RENDER = function (data, options) {
	if (typeof this.formatRender === 'function' || typeof options.formatRender === 'function') return (typeof options.formatRender === 'function') ? options.formatRender(data, options) : this.formatRender(data, options);
	else {
		return {
			result: 'success',
			status: 200,
			data
		};
	}
};

/**
 * Creates a formatted error response object
 * @param  {*}  err     Any data to be sent as part of error response
 * @param  {Object} options Configurable options for error response formatting
 * @param {Function} [options.formatError=this.formatError] Custom formatting function for json error response. This argument will be ignored if not a function
 * @return {Object}         Formatted error response object
 */
const _ERROR = function (data, options) {
	if (typeof this.formatError === 'function' || typeof options.formatError === 'function') return (typeof options.formatError === 'function') ? options.formatError(data, options) : this.formatError(data, options);
	else {
		return {
			result: 'error',
			status: 500,
			data: {
				error: data
			}
		};
	}
};

/**
 * Baseline adapter class which handles wrapping response data in an object with a status code and result message. Formatting is configurable both for success and error responses
 * @type {JSON_Adapter}
 */
const JSON_ADAPTER = class JSON_Adapter {
	/**
	 * @constructor
	 * @param  {Object} [options={}] Configurable options for the adapter
	 * @param {Function} options.formatRender Overwrites default formatting behavior for json responses
	 * @param {Function} options.formatError Overwrites default formatting behavior for errors
	 */
	constructor (options = {}) {
		this.formatRender = options.formatRender;
		this.formatError = options.formatError;
	}
	/**
	 * Creates a formatted response
	 * @param  {*}  data    Any data that should be sent with the success response
	 * @param  {Object}  [options={}] Configurable options for success response formatting see _RENDER for more details
	 * @param {Object} [options.req] Express request object. If options.req and options.res are defined the express .render method will be used to render template
	 * @param {Object} [options.res] Express response object. If options.res and options.req are defined the express .render method will be used to render template
	 * @param {Boolean} [options.skip_response] If true function will resolve with the rendered template instead of sending a response
	 * @param {Boolean} options.sync If true execution of render will be handled synchronously
	 * @param  {Function} [cb=false]      An optional callback function. If this argument is not a function it will be ignored
	 * @return {*}          Returns the formatted json object if options.sync is true or a Promise if cb arugement is not passed
	 */
	render (data, options = {}, cb = false) {
		try {
			if (typeof options === 'function') {
				cb = options;
				options = {};
			}
			let rendered = _RENDER.call(this, data, options);
			if (options.req && options.res && !options.skip_response) {
				if (options.req.query && options.req.query.callback) options.res.status(200).jsonp(rendered);
				else options.res.status(200).send(rendered);
			}
			if (options.sync !== true) {
				if (typeof cb === 'function') cb(null, rendered);
				else return Promisie.resolve(rendered);
			}
			else return rendered;
		}
		catch (e) {
			return this.error(e, options, cb);
		}
	}
	/**
	 * Creates a formatted error response
	 * @param  {*}  err     Any data to be sent as part of error response
	 * @param  {Object}  options Configurable options for error response formatting see _ERROR for more details
	 * @param {Boolean} options.sync If ture execution of error will be handled synchronously
	 * @param {Object} [options.req] Express request object. If options.req and options.res are defined the express .render method will be used to render template
	 * @param {Object} [options.res] Express response object. If options.res and options.req are defined the express .render method will be used to render template
	 * @param {Boolean} [options.skip_response] If true function will resolve with the rendered template instead of sending a response
	 * @param  {Function} [cb=false]      An optional callback function. If this argument is not a function it will be ignored
 	 * @return {*}          Returns the formatted json object if options.sync is true or a Promise if cb arugement is not passed
	 */
	error (err, options = {}, cb = false) {
		try {
			if (typeof options === 'function') {
				cb = options;
				options = {};
			}
			let errored = _ERROR.call(this, err, options);
			if (options.req && options.res && !options.skip_response) {
				if (options.req.query && options.req.query.callback) options.res.status(500).jsonp(errored);
				else options.res.status(500).send(errored);
			}
			if (options.sync !== true) {
				if (typeof cb === 'function') cb(null, errored);
				else return Promisie.resolve(errored);
			}
			else return errored;
		}
		catch (e) {
			if (options.sync !== true) {
				if (typeof cb === 'function') cb(e);
				else return Promisie.reject(e);
			}
			else throw e;
		}
	}
};

module.exports = JSON_ADAPTER;
