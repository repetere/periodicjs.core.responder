'use strict';
const path = require('path');
const chai = require('chai');
const expect = chai.expect;
const AdapterInterface = require(path.join(__dirname, '../../index'));

describe('JSON adapter spec', function () {
	describe('Basic .render functionality', function () {
		let jsonAdapter = AdapterInterface.create({ adapter: 'json' });
		it('Should return a Promise if cb is not passed and .sync is false', done => {
			jsonAdapter.render({ foo: 'bar' })
				.try(result => {
					expect(result).to.have.property('result');
					expect(result.result).to.equal('success');
					expect(result).to.have.property('status');
					expect(result).to.have.property('data');
					expect(result.data).to.have.property('foo');
					done();
				})
				.catch(done);
		});
		it('Should invoke the callback if argument is passed', done => {
			jsonAdapter.render({ foo: 'bar' }, (err, result) => {
				if (err) done(err);
				else {
					expect(result).to.have.property('result');
					expect(result.result).to.equal('success');
					expect(result).to.have.property('status');
					expect(result).to.have.property('data');
					expect(result.data).to.have.property('foo');
					done();
				}
			});
		});
		it('Should be handled synchronously if .sync is true', () => {
			let result = jsonAdapter.render({ foo: 'bar' }, { sync: true });
			expect(result).to.have.property('result');
			expect(result.result).to.equal('success');
			expect(result).to.have.property('status');
			expect(result).to.have.property('data');
			expect(result.data).to.have.property('foo');
		});
	});
	describe('Basic .error functionality', function () {
		let jsonAdapter = AdapterInterface.create({ adapter: 'json' });
		it('Should return a Promise if cb is not passed and .sync is false', done => {
			jsonAdapter.error(new Error('Some Random Error'))
				.try(result => {
					expect(result).to.have.property('result');
					expect(result.result).to.equal('error');
					expect(result).to.have.property('status');
					expect(result).to.have.property('data');
					expect(result.data).to.have.property('error');
					done();
				})
				.catch(done);
		});
		it('Should invoke the callback if argument is passed', done => {
			jsonAdapter.error(new Error('Some Random Error'), (err, result) => {
				expect(result).to.have.property('result');
				expect(result.result).to.equal('error');
				expect(result).to.have.property('status');
				expect(result).to.have.property('data');
				expect(result.data).to.have.property('error');
				done();
			});
		});
		it('Should be handled synchronously if .sync is true', () => {
			let result = jsonAdapter.error(new Error('Some Random Error'), { sync: true });
			expect(result).to.have.property('result');
			expect(result.result).to.equal('error');
			expect(result).to.have.property('status');
			expect(result).to.have.property('data');
			expect(result.data).to.have.property('error');
		});
	});
	describe('Custom rendering function', function () {
		let jsonAdapter = AdapterInterface.create({
			adapter: 'json',
			formatRender: function (data) {
				return JSON.stringify(data);
			}
		});
		it('Should handle a custom rendering function', done => {
			jsonAdapter.render({ foo: 'bar' })
				.try(result => {
					expect(result).to.be.a('string');
					done();
				})
				.catch(done);
		});
		it('Should handle an error in a custom rendering function', done => {
			jsonAdapter.render({ foo: 'bar' }, {
				formatRender: function (data) {
					throw new Error('Some Random Error');
				}
			}, err => {
				expect(err instanceof Error).to.be.true;
				done();
			});
		});
	});
	describe('Custom error function', function () {
		let jsonAdapter = AdapterInterface.create({
			adapter: 'json',
			formatError: function (err) {
				return err.message;
			}
		});
		it('Should handle a custom error function', done => {
			jsonAdapter.error(new Error('Some Random Error'))
				.try(result => {
					expect(result).to.equal('Some Random Error');
					done();
				})
				.catch(done);
		});
		it('Should handle an error in a custom error function', done => {
			jsonAdapter.error({ foo: 'bar' }, {
				formatError: function (data) {
					throw new Error('Some Random Error');
				}
			}, err => {
				expect(err instanceof Error).to.be.true;
				done();
			});
		});
	});
});
