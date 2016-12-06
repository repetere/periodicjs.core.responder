'use strict';
const path = require('path');
const chai = require('chai');
const expect = chai.expect;
const AdapterInterface = require(path.join(__dirname, '../index'));
const JSONAdapter = require(path.join(__dirname, '../adapters/json_content'));

describe('Content Adapter Interface', function () {
	describe('basic assumptions and methods', function () {
		it('Should be an object with specified required properties and types', () => {
			let interfaceFields = ['render','error'];
			interfaceFields.forEach(field => {
				expect(AdapterInterface.interface[field]).to.equal('function');
			});
		});
		it('Should have a create method', () => {
			expect(AdapterInterface.create).to.be.a('function');
		});
	});
	describe('generating a pre-loaded adapter by adapter name', function () {
		it('Should throw an error if adapter name does not exist in list', done => {
			try {
				let adapter = AdapterInterface.create({ adapter: 'some-non-existant-adapter' });
				done(new Error('Should not evaluate this line'));
			}
			catch (e) {
				expect(e instanceof Error).to.be.true;
				done();
			}
		});
		it('Should return a constructed adapter given a valid adapter name', () => {
			let adapter = AdapterInterface.create({ adapter: 'json' });
			expect(adapter instanceof JSONAdapter).to.be.true;
		});
	});
	describe('generating an adapter from a provided constructor', function () {
		it('Should throw an error if custom adapter class is missing required methods', done => {
			try {
				let Invalid_Adapter = class Invalid_Adapter {
					constructor () {
						this.method = false;
					}
				};
				let adapter = AdapterInterface.create({ adapter: Invalid_Adapter });
			}
			catch (e) {
				expect(e instanceof Error).to.be.true;
				done();
			}
		});
		it('Should return a constructed adapter given a valid custom class', () => {
			let Valid_Adapter = class Valid_Adapter {
				constructor () {
					this.error = () => true;
					this.render = () => true;
				}
			};
			let adapter = AdapterInterface.create({ adapter: Valid_Adapter });
			expect(adapter instanceof Valid_Adapter).to.be.true;
		});
	});
});