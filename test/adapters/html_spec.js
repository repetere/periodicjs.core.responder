'use strict';
const Promisie = require('promisie');
const fs = Promisie.promisifyAll(require('fs-extra'));
const path = require('path');
const chai = require('chai');
const expect = chai.expect;
const AdapterInterface = require(path.join(__dirname, '../../index'));
const pug = require('pug');
const mustache = require('mustache');

describe('HTML adapter spec', function () {
	describe('.render functionality', function () {
		let templateData = {
			name: 'OG Bobby Johnson'
		};
		describe('using default ejs template engine', function () {
			let ejsAdapter = AdapterInterface.create({ adapter: 'html', viewname: 'example' });
			it('Should find a view from a set of file paths and render if it is found', done => {
				ejsAdapter.render(templateData, {
					dirname: [path.join(__dirname, '../examples'), path.join(__dirname, '../adapters')]
				})
					.try(result => {
						expect(result).to.be.a('string');
						expect(/OG Bobby Johnson/.test(result)).to.be.true;
						done();
					})
					.catch(done);
			});
			it('Should resolve with a valid file path if options.resolve_filepath is true', done => {
				ejsAdapter.render({}, {
					dirname: [path.join(__dirname, '../examples'), path.join(__dirname, '../adapters')],
					resolve_filepath: true
				})
					.try(result => {
						expect(result).to.equal(path.join(__dirname, '../examples', 'example.ejs'));
						done();
					})
					.catch(done);
			});
			it('Should render default view if no valid template is found', done => {
				ejsAdapter.render(templateData, {
					viewname: path.join(__dirname, '../examples/example')
				})
					.try(result => {
						expect(result).to.be.a('string');
						expect(/OG Bobby Johnson/.test(result)).to.be.true;
						done();
					})
					.catch(done);
			});
			it('Should reject with an error if no valid template is found and default file path is incorrect', done => {
				ejsAdapter.render(templateData, (err) => {
					expect(err instanceof Error).to.be.true;
					done();
				});
			});
		});
		describe('using custom template engine that exposes a .render function', function () {
			let pugAdapter = AdapterInterface.create({ adapter: 'html', viewname: 'example', engine: pug, fileext: '.pug' });
			it('Should find a view from a set of file paths and render if it is found', done => {
				pugAdapter.render(templateData, {
					dirname: [path.join(__dirname, '../examples'), path.join(__dirname, '../adapters')]
				})
					.try(result => {
						expect(result).to.be.a('string');
						expect(/OG Bobby Johnson/.test(result)).to.be.true;
						done();
					})
					.catch(done);
			});
			it('Should render default view if no valid template is found', done => {
				pugAdapter.render(templateData, {
					viewname: path.join(__dirname, '../examples/example'),
					fileext: '.pug'
				})
					.try(result => {
						expect(result).to.be.a('string');
						expect(/OG Bobby Johnson/.test(result)).to.be.true;
						done();
					})
					.catch(done);
			});
			it('Should reject with an error if no valid template is found and default file path is incorrect', done => {
				pugAdapter.render(templateData, (err) => {
					expect(err instanceof Error).to.be.true;
					done();
				});
			});
		});
		describe('using custom template engine with custom .render function', function () {
			let render = mustache.render.bind(mustache);
			let mustacheRender = function (template, data) {
				mustache.parse(template);
				return render(template, data);
			};
			mustache.render = mustacheRender;
			let mustacheAdapter = AdapterInterface.create({ adapter: 'html', viewname: 'example', engine: mustache, fileext: '.mustache' });
			it('Should find a view from a set of file paths and render if it is found', done => {
				mustacheAdapter.render(templateData, {
					dirname: [path.join(__dirname, '../examples'), path.join(__dirname, '../adapters')]
				})
					.try(result => {
						expect(result).to.be.a('string');
						expect(/OG Bobby Johnson/.test(result)).to.be.true;
						done();
					})
					.catch(done);
			});
			it('Should render default view if no valid template is found', done => {
				mustacheAdapter.render(templateData, {
					viewname: path.join(__dirname, '../examples/example'),
					fileext: '.mustache'
				})
					.try(result => {
						expect(result).to.be.a('string');
						expect(/OG Bobby Johnson/.test(result)).to.be.true;
						done();
					})
					.catch(done);
			});
			it('Should reject with an error if no valid template is found and default file path is incorrect', done => {
				mustacheAdapter.render(templateData, (err) => {
					expect(err instanceof Error).to.be.true;
					done();
				});
			});
		});
	});
	describe('.error functionality', function () {
		let error = new Error('Some Random Error');
		let htmlAdapter = AdapterInterface.create({ adapter: 'html' });
		it('Should be able to render an error template', done => {
			htmlAdapter.error(error, { viewname: 'error', dirname: path.join(__dirname, '../examples') })
				.try(result => {
					expect(result).to.be.a('string');
					expect(/Some Random Error/m.test(result)).to.be.true;
					done();
				})
				.catch(done);
		});
		it('Should handle an error', done => {
			htmlAdapter.error(error, (err) => {
				expect(err instanceof Error).to.be.true;
				done();
			});
		});
	});
});
