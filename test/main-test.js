debugger; // eslint-disable-line no-debugger

import loader from '../src/main.js';
import assert from 'assert';

const SOURCE = JSON.stringify({
  'modules': {
    'map': './map',
    'layers': 'layers-dependency'
  }
});

describe('module', function () {
  it('imports modules', function () {
    let ret = loader.call({}, SOURCE);
    assert(ret.match(/import map from '.\/map'/));
    assert(ret.match(/import layers from 'layers-dependency'/));
  });

  it('imports modules from given importName', function () {
    let ret = loader.call({ query: { importName: 'f' } }, SOURCE);
    assert(ret.match(/import { f as map } from '.\/map'/));
    assert(ret.match(/import { f as layers } from 'layers-dependency'/));
  });

  it('exports json', function () {
    assert(loader.call({}, SOURCE).match(/export default json;/));
  });

  it('sets json from source', function () {
    assert(loader.call({}, SOURCE).match(/let json = {};/));
  });

  it('sets json modules', function () {
    assert(loader.call({}, SOURCE).match(/json\['modules'\] = { map, layers };/));
  });

  it('sets json modules in specified key', function () {
    const src = JSON.stringify({
      'm': {
        'map': './map',
        'layers': 'layers-dependency'
      },
      'deps': {
        'layers': ['map']
      }
    });
    let ret = loader.call({ query: { key: 'm' } }, src);
    assert(ret.match(/json\['m'\] = { map, layers };/));
  });
});
