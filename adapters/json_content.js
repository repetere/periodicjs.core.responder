'use strict';
const Promisie = require('promisie');

const _RENDER = function (data, options) {
	if (typeof this.formatResponse === 'function' || typeof options.formatResponse === 'function') return (typeof options.formatRender === 'function') ? options.formatRender(data, options) : this.formatRender(data, options);
	else {
		return {
			result: 'success',
			status: 'success',
			data
		};
	}
};

const _ERROR = function (data, options) {
	if (typeof this.formatError === 'function' || typeof options.formatError === 'function') return (typeof options.formatError === 'function') ? options.formatError(data, options) : this.formatError(data, options);
	else {
		return {
			result: 'error',
			status: 'error',
			data: {
				error: data
			}
		};
	}
};

const JSON_ADAPTER = class JSON_Adapter {
	constructor (options = {}) {
		this.formatRender = options.formatRender;
		this.formatError = options.formatError;
	}
	render (data, options = {}, cb = false) {
		try {
			let rendered = _RENDER.call(this, data, options);
			if (options.sync !== true) {
				if (typeof cb === 'function') cb(null, rendered);
				else return Promisie.resolve(rendered);
			}
			else return rendered;
		}
		catch (e) {
			if (options.sync !== true) {
				if (typeof cb === 'function') cb(e);
				else return Promise.reject(e);
			}
			else throw e;
		}
	}
	error (data, options = {}, cb = false) {
		try {
			let errored = _ERROR.call(this, data, options);
			if (options.sync !== true) {
				if (typeof cb === 'function') cb(null, errored);
				else return Promisie.resolve(errored);
			}
			else return errored;
		}
		catch (e) {
			if (options.sync !== true) {
				if (typeof cb === 'function') cb(e);
				else return Promise.reject(e);
			}
			else throw e;
		}
	}
};

module.exports = JSON_ADAPTER;
