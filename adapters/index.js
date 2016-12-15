'use strict';
const path = require('path');
const html = require(path.join(__dirname, './html_content'));
const json = require(path.join(__dirname, './json_content'));
const xml = require(path.join(__dirname, './xml_content'));

module.exports = { 
	html: html.HTML_ADAPTER, 
	json, 
	xml, 
	findValidViewFromPaths: html.findValidViewFromPaths
};