debugger; // eslint-disable-line no-debugger

import module from '../src/main.js';
import assert from 'assert';

describe('module',  function () {
  it('is 42', function () {
    assert.equal(42, module);
  });
});
