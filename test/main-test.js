debugger; // eslint-disable-line no-debugger

import loader from '../src/main.js';
import assert from 'assert';

const SOURCE = JSON.stringify({
  'modules': {
    'map': './map',
    'layers': 'layers-dependency'
  },
  'deps': {
    'layers': ['map']
  }
});

describe('module', function () {
  it('imports modules', function () {
    let ret = loader(SOURCE);
    assert(ret.match(/import { bricjs as map } from '.\/map'/));
    assert(ret.match(/import { bricjs as layers } from 'layers-dependency'/));
  });

  it('exports json', function () {
    assert(loader(SOURCE).match(/export default json;/));
  });

  it('sets json from source', function () {
    assert(loader(SOURCE).match(/let json = {};/));
  });

  it('sets json modules', function () {
    assert(loader(SOURCE).match(/json\['modules'\] = { map, layers };/));
  });

  it('sets json modules in specified key', function () {
    let ret = loader.call({
      options: { key: 'm' }
    }, SOURCE);
    assert(ret.match(/json\['m'\] = { map, layers };/));
  });
});
