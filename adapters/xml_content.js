'use strict';
const path = require('path');
const convert = require('js2xmlparser');
const JSON_Adapter = require(path.join(__dirname, './json_content'));

const _RENDER = function (data, options) {
	let skip_conversion = (typeof options.xml_root === 'boolean') ? options.xml_root : this.xml_root;
	if (skip_conversion) return data;
	let xml_root = options.xml_root || this.xml_root;
	if (typeof xml_root !== 'string') throw new TypeError('xml_root must be a string, please provide options.xml_root or set this.xml_root');
	let xml_configuration = options.xml_configuration || this.xml_configuration;
	return convert(xml_root, data, (xml_configuration && typeof xml_configuration === 'object') ? xml_configuration : undefined);
};

const XML_ADAPTER = class XML_Adapter extends JSON_Adapter {
	constructor (options = {}) {
		options.formatRender = _RENDER.bind(this);
		super(options);
		this.skip_conversion = options.skip_conversion;
		this.xml_root = options.xml_root;
		this.xml_configuration = options.xml_configuration;
	}
	render (data, options = {}, cb = false) {
		return super.render(data, options, cb);
	}
	error (data, options = {}, cb = false) {
		return super.error(data, options, cb);
	}
};

module.exports = XML_ADAPTER;
