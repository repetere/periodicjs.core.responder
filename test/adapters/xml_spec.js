'use strict';
const path = require('path');
const chai = require('chai');
const expect = chai.expect;
const AdapterInterface = require(path.join(__dirname, '../../index'));

describe('XML adapter spec', function () {
	describe('.render functionality', function () {
		let xmlAdapter = AdapterInterface.create({ adapter: 'xml', xml_root: 'example' });
		it('Should resolve with rendered XML if .sync is not true and no cb is passed', done => {
			xmlAdapter.render({
				person: [{
					firstname: 'Fake',
					lastname: 'Guy'
				}]
			})
				.try(result => {
					expect(result).to.be.a('string');
					expect(/\<status\>200\<\/status\>/.test(result)).to.be.true;
					done();
				})
				.catch(done);
		});
		it('Should invoke the callback if cb argument is passed', done => {
			xmlAdapter.render({
				person: [{
					firstname: 'Fake',
					lastname: 'Guy'
				}]
			}, (err, result) => {
				if (err) done(err);
				else {
					expect(result).to.be.a('string');
					expect(/\<status\>200\<\/status\>/.test(result)).to.be.true;
					done();
				}
			});
		});
		it('Should be handled synchronously if .sync is true', () => {
			let result = xmlAdapter.render({
				person: [{
					firstname: 'Fake',
					lastname: 'Guy'
				}]
			}, { sync: true });
			expect(result).to.be.a('string');
			expect(/\<status\>200\<\/status\>/.test(result)).to.be.true;
		});
		it('Should respect custom XML generation options', done => {
			let xmlAdapter = AdapterInterface.create({
				adapter: 'xml',
				xml_root: 'example',
				xml_configuration: {
					declaration: { encoding: 'UTF-8' }
				}
			});
			xmlAdapter.render({
				person: [{
					firstname: 'Fake',
					lastname: 'Guy'
				}]
			})
				.try(result => {
					expect(result).to.be.a('string');
					expect(/UTF-8/.test(result)).to.be.true;
					done();
				})
				.catch(done);
		});
		it('Should skip conversion if .skip_conversion is true', () => {
			let result = xmlAdapter.render({
				person: [{
					firstname: 'Fake',
					lastname: 'Guy'
				}]
			}, { sync: true, skip_conversion: true });
			expect(result).to.be.an('object');
			expect(result).to.be.ok;
		});
	});
	describe('.error functionality', function () {
		let xmlAdapter = AdapterInterface.create({ adapter: 'xml', xml_root: 'example' });
		it('Should resolve with rendered XML if .sync is not true and no cb is passed', done => {
			xmlAdapter.error({
				message: 'Some Random Error'
			})
				.try(result => {
					expect(result).to.be.a('string');
					expect(/\<status\>500\<\/status\>/.test(result)).to.be.true;
					done();
				})
				.catch(done);
		});
		it('Should invoke the callback if cb argument is passed', done => {
			xmlAdapter.error({
				message: 'Some Random Error'
			}, (err, result) => {
				if (err) done(err);
				else {
					expect(result).to.be.a('string');
					expect(/\<status\>500\<\/status\>/.test(result)).to.be.true;
					done();
				}
			});
		});
		it('Should be handled synchronously if .sync is true', () => {
			let result = xmlAdapter.error({
				message: 'Some Random Error'
			}, { sync: true });
			expect(result).to.be.a('string');
			expect(/\<status\>500\<\/status\>/.test(result)).to.be.true;
		});
		it('Should respect custom XML generation options', done => {
			let xmlAdapter = AdapterInterface.create({
				adapter: 'xml',
				xml_root: 'example',
				xml_configuration: {
					declaration: { encoding: 'UTF-8' }
				}
			});
			xmlAdapter.error({
				message: 'Some Random Error'
			})
				.try(result => {
					expect(result).to.be.a('string');
					expect(/UTF-8/.test(result)).to.be.true;
					done();
				})
				.catch(done);
		});
		it('Should skip conversion if .skip_conversion is true', () => {
			let result = xmlAdapter.error({
				message: 'Some Random Error'
			}, { sync: true, skip_conversion: true });
			expect(result).to.be.an('object');
			expect(result).to.be.ok;
		});
	});
});
