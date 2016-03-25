'use strict';

/* global describe, it, beforeEach, afterEach */

require('should'); // extends Object with `should`

var automat = require('../src');

global.document = { // mock the DOM ...todo: better to use Jasmine for this!
    createElement: function(tagName) { return {
        tagName: tagName,
        childNodes: ['x'],
        get innerHTML() { return this._innerHTML; },
        set innerHTML(x) { return this._innerHTML = this.childNodes[0] = x; }
    }; }
};

describe('`automat`', function() {
    it('is a function', function() {
        automat.should.be.an.Function();
    });
    describe('extracts strings from', function() {
        it('template functions', function() {
            automat(function(){/*Hello, ${0}!*/}, '<world>').should.equal('Hello, <world>!');
            automat(function(){ /* Hello, ${0}! */ }, '<world>').should.equal('Hello, <world>!');
        });
        it('non-template functions', function() {
            automat(function(){return'Hello, ${0}!'}, '<world>').should.equal('Hello, <world>!');
        });
    });
    describe('formats strings with text substitutions', function() {
        it('without encoding', function() {
            automat('Hello, ${0}!', '<world>').should.equal('Hello, <world>!');
        });
        xit('with encoding', function() {
            automat('Hello, %{0}!', '<world>').should.equal('Hello, &lt;world&gt;!');
        });
    });
    describe('manipulates provided DOM element when', function() {
        describe('parameter `el` omitted by', function() {
            it('creating and returning a new div with formatted text as its contents', function() {
                var node = automat.replace('Hello, ${0}!', 'World');
                node.tagName.should.equal('DIV');
                node.innerHTML.should.equal('Hello, World!');
            });
        });
        describe('parameter `el` provided by', function() {
            var el;
            beforeEach(function() {
                el = { // mock the DOM ...todo: better to use Jasmine for this!
                    innerHTML: ':abc:',
                    insertBefore: function(node, refNode) {
                        var n = refNode ? this.innerHTML.indexOf(refNode.innerHTML) : -1;
                        if (n < 0) {
                            this.innerHTML += node;
                        } else {
                            this.innerHTML = this.innerHTML.substr(0,n) + node + this.innerHTML.substr(n);
                        }
                    }
                };
            });
            it('replacing contents of given element with formatted text', function() {
                var node = automat.replace('Hello, ${0}!', el, 'World');
                node.should.equal(el);
                node.innerHTML.should.equal('Hello, World!');
            });
            it('appending contents of given element with formatted text', function() {
                var node = automat.append('Hello, ${0}!', el, 'World');
                node.should.equal(el);
                node.innerHTML.should.equal(':abc:Hello, World!');
            });
            it('inserting contents of given element with formatted text', function() {
                var refNode = { innerHTML: ':' };
                var node = automat.append('Hello, ${0}!', el, refNode, 'World');
                node.should.equal(el);
                node.innerHTML.should.equal('Hello, World!:abc:');
            });
        });
    });
});
