debugger; // eslint-disable-line no-debugger

import loader from '../src/main.js';
import { load } from '../src/main.js';
import assert from 'assert';

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
  it('imports modules', function () {
    let ret = loader(JSON.stringify(SOURCE));
    assert(ret.match(/import { gl as map } from '.\/map'/));
    assert(ret.match(/import { gl as layers } from 'layers-dependency'/));
  });

  it('adds load function', function () {
    let ret = loader(JSON.stringify(SOURCE));
    assert(ret.match(/function\s*load\s*\(.*\)/));
  });

  it('exports function', function () {
    let ret = loader(JSON.stringify(SOURCE));
    assert(ret.match(/export default config => load\(.*, config, { map,layers }\);/));
  });

  it('loads modules', function (done) {
    let config = {
      map: { boo: 2 }
    };
    let test = () => assert.equal(10, config.map.ten);
    load(app, [config], { map, layers }).then(test).then(done, done);
  });

  it('disables modules', function (done) {
    let config = {
      map: { boo: 2 },
      layers: { enabled: false }
    };
    let test = () => assert(!config.map.ten);
    load(app, [config], { map, layers }).then(test).then(done, done);
  });
});
