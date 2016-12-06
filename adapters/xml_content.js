'use strict';
const path = require('path');
const convert = require('js2xmlparser').parse;
const JSON_Adapter = require(path.join(__dirname, './json_content'));

/**
 * Creates a formatted success message and converts to XML
 * @param  {*} data    Any data to be included in XML response
 * @param  {Object} options Configurable options for XML response generation
 * @param {Boolean} [options.skip_conversion=this.skip_conversion] If true rendering is skipped and the data argument is immediately returned
 * @param {string} [options.xml_root=this.xml_root] Defines the value of the XML document root tag. If this.xml_root is not set and options.xml_root is not provided a TypeError will be thrown
 * @param {Object} [options.xml_configuration=this.xml_configuration] Options for the convert function see js2xmlparser documentation for full details
 * @return {string}         Returns the rendered XML string or the data argument if options.skip_conversion is true
 */
const _RENDER = function (data, options) {
	let skip_conversion = (typeof options.skip_conversion === 'boolean') ? options.skip_conversion : this.skip_conversion;
	if (skip_conversion) return data;
	let xml_root = options.xml_root || this.xml_root;
	if (typeof xml_root !== 'string') throw new TypeError('xml_root must be a string, please provide options.xml_root or set this.xml_root');
	let xml_configuration = options.xml_configuration || this.xml_configuration;
	let xml_data = {
		result: 'success',
		status: 200,
		data
	};
	return convert(xml_root, xml_data, (xml_configuration && typeof xml_configuration === 'object') ? xml_configuration : undefined);
};

/**
 * Creates a formatted error response message and converts to XML
 * @param  {*} err     Error data to be included in error response. If err is an instanceof Error or has a .message property it is assumed that the .message property is the only thing to include in error response
 * @param  {Object} options Configurable options for error XML formatting
 * @param {Boolean} [options.skip_conversion=this.skip_conversion] If true rendering is skipped and the data argument is immediately returned
 * @param {string} [options.xml_root=this.xml_root] Defines the value of the XML document root tag. If this.xml_root is not set and options.xml_root is not provided a TypeError will be thrown
 * @param {Object} options.xml_configuration Options for the convert function see js2xmlparser documentation for full details
 * @return {string}         Returns the rendered XML string or the err argument if options.skip_conversion is true
 */
const _ERROR = function (err, options) {
	let skip_conversion = (typeof options.skip_conversion === 'boolean') ? options.skip_conversion : this.skip_conversion;
	if (skip_conversion) return err;
	let xml_root = options.xml_root || this.xml_root;
	if (typeof xml_root !== 'string') throw new TypeError('xml_root must be a string, please provide options.xml_root or set this.xml_root');
	let xml_data = {
		result: 'error',
		status: 500,
		data: {
			error: (err instanceof Error || typeof err.message === 'string') ? err.message : err
		}
	};
	return convert(xml_root, xml_data, (options.xml_configuration) ? options.xml_configuration : undefined);
};

/**
 * XML response adapter class which handles wrapping response data in object with status code and result message and converting into XML string.
 * @type {XML_Adapter}
 * @extends {JSON_Adapter}
 */
const XML_ADAPTER = class XML_Adapter extends JSON_Adapter {
	/**
	 * @constructor
	 * @param  {Object} [options={}] Configurable options for XML adapter
	 * @param {Boolean} options.skip_conversion If true render will just return data that is passed to it
	 * @param {string} options.xml_root The value that should be used in generating the root tag of the converted XML document
	 * @param {Object} options.xml_configuration Options that will be passed to the XML conversion function
	 */
	constructor (options = {}) {
		super(options);
		this.skip_conversion = options.skip_conversion;
		this.xml_root = options.xml_root;
		this.xml_configuration = options.xml_configuration;
	}
	/**
	 * Creates a formatted XML response
	 * @param  {*}  data    Any data that should be sent with the success response
	 * @param  {Object}  [options={}] Configurable options for the XML success response formatting see _RENDER for more details
	 * @param {Function} [options.formatRender=_RENDER] Custom formatting function for XML rendering. It is recommended that the default value for this property is used and only custom options for the XML rendering are passed
	 * @param  {Function} [cb=false]      Optional callback function. If argument is not a function it will be ignored
	 * @return {*}          Returns the formatted XML string if options.sync is true or a Promise if cb arugement is not passed
	 */
	render (data, options = {}, cb = false) {
		options.formatRender = (typeof options.formatRender === 'function') ? options.formatRender : _RENDER.bind(this);
		return super.render(data, options, cb);
	}
	/**
	 * Creates a formatted XML error response
	 * @param  {*}  [err={}]    Any data that should be sent with the error response
	 * @param  {Object}  [options={}] Configurable options for the XML error response formatting see _ERROR for more details
	 * @param {Function} [options.formatError=_ERROR] Custom formatting function for XML rendering. It is recommended that the default value for this property is used and only custom options for the XML rendering are passed
	 * @param  {Function} [cb=false]      Optional callback function. If argument is not a function it will be ignored
	 * @return {*}          Returns the formatted XML string if options.sync is true or a Promise if cb arugement is not passed
	 */
	error (err = {}, options = {}, cb = false) {
		options.formatError = (typeof options.formatError === 'function') ? options.formatError : _ERROR.bind(this);
		return super.error(err, options, cb);
	}
};

module.exports = XML_ADAPTER;
