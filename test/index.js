'use strict';

/* global describe, it, beforeEach, afterEach */

require('should'); // extends Object with `should`

var automat = require('../src');

describe('`automat` that', function() {
    it('is a function', function() {
        automat.should.be.an.Function();
    });
    it('more tests needed');
});
