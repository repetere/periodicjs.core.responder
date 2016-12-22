'use strict';
const path = require('path');
const chai = require('chai');
const expect = chai.expect;
const AdapterInterface = require(path.join(__dirname, '../../index'));

chai.use(require('chai-spies'));

var reqFactory = function (jsonp) {
	let req = {
		query: (jsonp) ? { callback: 'fakefn' } : {}
	};
	let res = {
		status: num => res,
		jsonp: data => data,
		send: data => data
	};
	Object.keys(res).forEach(key => {
		res[key] = chai.spy(res[key]);
	});
	return { req, res };
};

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
		it('Should send a response if options.req and options.res are defined', done => {
			let { req, res } = reqFactory();
			jsonAdapter.render({ foo: 'bar' }, { req, res })
				.try(result => {
					expect(res.status).to.have.been.called.with(200);
					expect(result.data).to.deep.equal({ foo: 'bar' });
					done();
				})
				.catch(done);
		});
		it('Should use jsonp if req.query.callback is defined', done => {
			let { req, res } = reqFactory(true);
			jsonAdapter.render({ foo: 'bar' }, { req, res })
				.try(result => {
					expect(result.data).to.deep.equal({ foo: 'bar' });
					expect(res.status).to.have.been.called.with(200);
					expect(res.jsonp).to.have.been.called.with(result);
					done();
				})
				.catch(done);
		});
		it('Should not send a response if options.skip_response is defined', done => {
			let { req, res } = reqFactory();
			jsonAdapter.render({ foo: 'bar' }, { req, res, skip_response: true })
				.try(result => {
					expect(result.data).to.deep.equal({ foo: 'bar' });
					expect(res.status).to.not.have.been.called();
					done();
				})
				.catch(done);
		});
		it('Should call the error handler if there is an error', done => {
			let { req, res } = reqFactory();
			jsonAdapter.formatRender = function () {
				throw Error('Some Random Error');
			};
			let error = jsonAdapter.error.bind(jsonAdapter);
			jsonAdapter.error = chai.spy(error);
			jsonAdapter.render({ foo: 'bar' }, { req, res })
				.try(result => {
					jsonAdapter.formatRender = undefined;
					expect(result.result).to.equal('error');
					expect(result.data.error.message).to.equal('Some Random Error');
					expect(jsonAdapter.error).to.have.been.called();
					jsonAdapter.error = error;
					done();
				})
				.catch(done);
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
		it('Should send an error response if options.req and options.res are defined', done => {
			let { req, res } = reqFactory();
			jsonAdapter.error(new Error('Some Random Error'), { req, res })
				.try(result => {
					expect(res.status).to.have.been.called.with(500);
					expect(result.data.error.message).to.equal('Some Random Error');
					done();
				})
				.catch(done);
		});
		it('Should use jsonp if req.query.callback is defined', done => {
			let { req, res } = reqFactory(true);
			jsonAdapter.error(new Error('Some Random Error'), { req, res })
				.try(result => {
					expect(res.jsonp).to.have.been.called();
					expect(res.send).to.not.have.been.called();
					done();
				})
				.catch(done);
		});
		it('Should not send a response if options.skip_response is defined', done => {
			let { req, res } = reqFactory();
			jsonAdapter.error(new Error('Some Random Error'), { req, res, skip_response: true })
				.try(result => {
					expect(res.status).to.not.have.been.called();
					expect(result.data.error.message).to.equal('Some Random Error');
					done();
				})
				.catch(done);
		});
		it('Should handle an error', done => {
			let { req, res } = reqFactory();
			res.status = false;
			jsonAdapter.error(undefined, { req, res })
				.then(() => {
					done(new Error('Should not execute'));
				}, e => {
					expect(e instanceof Error).to.be.true;
					done();
				});
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
