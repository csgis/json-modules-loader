debugger; // eslint-disable-line no-debugger

import loader from '../src/main.js';
import { load } from '../src/main.js';
import assert from 'assert';
import sinon from 'sinon';
import fs from 'fs';

const SOURCE = {
  'modules': {
    'map': './map',
    'layers': 'layers-dependency'
  },
  'deps': {
    'layers': ['map']
  }
};

let map = (opts) => opts;
let layers = (opts, mymap) => { mymap.ten = 10; };
let app = { deps: { layers: ['map'] } };

describe('module', function () {
  let cb;
  let context;
  let read;

  beforeEach(function () {
    context = {
      async: () => cb,
      resolve: (ctx, module, callback) => callback(null, '')
    };
  });

  afterEach(function () {
    read.restore();
  });

  function stubRead(value) {
    read = sinon.stub(fs, 'readFileSync').callsFake(() => value);
  }

  it('imports modules', function (done) {
    stubRead('module.exports = function gl(opts, a){}');
    cb = function (e, ret) {
      assert(ret.match(/import { gl as map } from '.\/map'/));
      assert(ret.match(/import { gl as layers } from 'layers-dependency'/));
      done();
    };

    loader.call(context, JSON.stringify(SOURCE));
  });

  it('adds load function', function (done) {
    stubRead('module.exports = function gl(opts, a){}');
    cb = function (e, ret) {
      assert(ret.match(/function\s*load\s*\(.*\)/));
      done();
    };

    loader.call(context, JSON.stringify(SOURCE));
  });

  it('exports function', function (done) {
    stubRead('module.exports = function gl(opts, a){}');
    cb = function (e, ret) {
      assert(ret.match(/export default config => load\(.*, config, { map,layers }, DEPS\);/));
      done();
    };

    loader.call(context, JSON.stringify(SOURCE));
  });

  it('exports DEPS', function (done) {
    stubRead('module.exports = function gl(opts, dependency){}');
    cb = function (e, ret) {
      assert(ret.match(/const DEPS = {"map":\["dependency"\],"layers":\["dependency"\]};/));
      done();
    };

    loader.call(context, JSON.stringify(SOURCE));
  });

  it('handles errors', function (done) {
    context = {
      async: () => function (e) {
        assert(e);
        done();
      },
      resolve: (ctx, module, callback) => callback('error')
    };

    loader.call(context, JSON.stringify(SOURCE));
  });

  it('loads modules', function (done) {
    let config = {
      map: { boo: 2 }
    };
    let test = () => assert.equal(10, config.map.ten);
    load(app, [config], { map, layers }, app.deps).then(test).then(done, done);
  });

  it('disables modules', function (done) {
    let config = {
      map: { boo: 2 },
      layers: { enabled: false }
    };
    let test = () => assert(!config.map.ten);
    load(app, [config], { map, layers }, app.deps).then(test).then(done, done);
  });

  it('ignores unnamed functions', function (done) {
    stubRead('module.exports = function(opts, dependency){}');
    cb = function (e, ret) {
      assert(ret.match(/const DEPS = {};/));
      done();
    };

    loader.call(context, JSON.stringify(SOURCE));
  });
});
