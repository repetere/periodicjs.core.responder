'use strict';
const Promisie = require('promisie');
const fs = Promisie.promisifyAll(require('fs-extra'));
const path = require('path');
const chai = require('chai');
const expect = chai.expect;
const AdapterInterface = require(path.join(__dirname, '../../index'));
const pug = require('pug');
const mustache = require('mustache');
const ejs = require('ejs');

chai.use(require('chai-spies'));

var reqFactory = function(includeFlash) {
  let req = {
    flash: (includeFlash) ? chai.spy(() => true) : false
  };
  let res = {
    status: num => res,
    render: function(filepath, data, cb) {
      fs.readFileAsync(filepath, 'utf8')
        .then(result => ejs.render(result, data, { filename: filepath }))
        .then(cb.bind(null, null))
        .catch(cb);
    },
    send: data => data
  };
  Object.keys(res).forEach(key => {
    res[key] = chai.spy(res[key]);
  });
  return { req, res };
};

describe('HTML adapter spec', function() {
  describe('.render functionality', function() {
    let templateData = {
      name: 'OG Bobby Johnson'
    };
    describe('using default ejs template engine', function() {
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
      it('Should load locals onto the view', done => {
        ejsAdapter.locals = { name: 'OG Bobby Johnson' };
        ejsAdapter.render({}, {
          dirname: [path.join(__dirname, '../examples'), path.join(__dirname, '../adapters')]
        })
          .try(result => {
            expect(result).to.be.a('string');
            expect(/OG Bobby Johnson/.test(result)).to.be.true;
            ejsAdapter.locals = {};
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
    describe('rendering templates with a req and res object', function() {
      let ejsAdapter = AdapterInterface.create({ adapter: 'html', viewname: 'example' });
      it('Should render data and send response', done => {
        let { req, res } = reqFactory();
        ejsAdapter.render(templateData, { req, res, dirname: [path.join(__dirname, '../examples'), path.join(__dirname, '../adapters')] })
          .try(() => {
            expect(res.render).to.have.been.called.with(templateData);
            expect(res.status).to.have.been.called.with(200);
            done();
          })
          .catch(done);
      });
      it('Should include flash message if req.flash is a function', done => {
        let { req, res } = reqFactory(true);
        ejsAdapter.render(templateData, { req, res, dirname: [path.join(__dirname, '../examples'), path.join(__dirname, '../adapters')] })
          .try(() => {
            expect(req.flash).to.have.been.called();
            done();
          })
          .catch(done);
      });
      it('Should call callback function if cb argument is passed', done => {
        let { req, res } = reqFactory();
        ejsAdapter.render(templateData, { req, res, dirname: [path.join(__dirname, '../examples'), path.join(__dirname, '../adapters')] }, (err, data) => {
          if (err) done(err);
          else {
            expect(res.render).to.have.been.called.with(templateData);
            expect(data).to.be.a('string');
            expect(/OG Bobby Johnson/.test(data)).to.be.true;
            done();
          }
        });
      });
      it('Should return the rendered file if cb is not passed and options.skip_response is true', done => {
        let { req, res } = reqFactory();
        ejsAdapter.render(templateData, { req, res, dirname: [path.join(__dirname, '../examples'), path.join(__dirname, '../adapters')], skip_response: true })
          .try(result => {
            expect(res.render).to.have.been.called.with(templateData);
            expect(result).to.be.a('string');
            expect(/OG Bobby Johnson/.test(result)).to.be.true;
            done();
          })
          .catch(done);
      });
      it('Should pass error to error handler', done => {
        let { req, res } = reqFactory();
        ejsAdapter.custom_error_path = path.join(__dirname, '../examples');
        ejsAdapter.error = chai.spy(ejsAdapter.error.bind(ejsAdapter));
        ejsAdapter.render(templateData, { req, res, viewname: 'error' })
          .try(result => {
            expect(ejsAdapter.error).to.have.been.called();
            expect(res.render).to.have.been.called.twice;
            expect(res.status).to.have.been.called.with(500);
            done();
          })
          .catch(err => {
            console.log('got in this handler')
            done(err);
          });
      });
    });
    describe('using custom template engine that exposes a .render function', function() {
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
    describe('using custom template engine with custom .render function', function() {
      let render = mustache.render.bind(mustache);
      let mustacheRender = function(template, data) {
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
  describe('.error functionality', function() {
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
    it('Should render error and send response if req and res are defined', done => {
      let { req, res } = reqFactory();
      htmlAdapter.error(error, { req, res, dirname: path.join(__dirname, '../examples'), viewname: 'error' })
        .try(() => {
          expect(res.render).to.have.been.called.with(path.join(__dirname, '../examples/error.ejs'));
          expect(res.status).to.have.been.called.with(500);
          done();
        })
        .catch(done);
    });
    it('Should include flash messages if req.flash is a function', done => {
      let { req, res } = reqFactory(true);
      htmlAdapter.error(error, { req, res, dirname: path.join(__dirname, '../examples'), viewname: 'error' })
        .try(() => {
          expect(req.flash).to.have.been.called();
          done();
        })
        .catch(done);
    });
    it('Should call the callback if the cb argument is passed', done => {
      let { req, res } = reqFactory();
      htmlAdapter.error(error, { req, res, dirname: path.join(__dirname, '../examples'), viewname: 'error' }, (err, data) => {
        if (err) done(err);
        else {
          expect(res.render).to.have.been.called.with(path.join(__dirname, '../examples/error.ejs'));
          expect(data).to.be.a('string');
          done();
        }
      });
    });
    it('Should return the rendered template if options.skip_response is true', done => {
      let { req, res } = reqFactory();
      htmlAdapter.error(error, { req, res, dirname: path.join(__dirname, '../examples'), viewname: 'error', skip_response: true })
        .try(result => {
          expect(res.render).to.have.been.called.with(path.join(__dirname, '../examples/error.ejs'));
          expect(result).to.be.a('string');
          done();
        })
        .catch(done);
    });
    it('Should reject with an error if rendering fails', done => {
      let { req, res } = reqFactory();
      htmlAdapter.error(error, { req, res })
        .then(() => {
          done(new Error('Should not execute'));
        })
        .catch(err => {
          expect(err instanceof Error).to.be.true;
          done();
        });
    });
  });
});