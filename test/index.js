'use strict';

/* global describe, it, beforeEach, afterEach */

require('should'); // extends Object with `should`

var automat = require('../src');

var El;
function Element(tagName) {
    this.tagName = tagName;
    this.childNodes = [];
}
Element.prototype = {
    constructor: Element,
    get firstChild() { return this.childNodes[0]; },
    get innerHTML() { return this.childNodes.join(''); },
    set innerHTML(x) { this.childNodes.push(x); },
    insertBefore: function(node, refNode) {
        var n = refNode ? this.innerHTML.indexOf(refNode.innerHTML) : -1;
        if (n < 0) {
            this.innerHTML += node;
        } else {
            this.innerHTML = this.innerHTML.substr(0,n) + node + this.innerHTML.substr(n);
        }
        El.length = 0;
    }
};
global.document = { // mock the DOM ...todo: better to use Jasmine for this!
    createElement: function(tagName) { return El = new Element(tagName); }
};

describe('`automat`', function() {
    it('is a function', function() {
        automat.should.be.an.Function();
    });
    describe('extracts strings from', function() {
        it('template functions', function() {
            automat('Hello, ${0}!', '<world>').should.equal('Hello, <world>!');
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
        xdescribe('parameter `el` provided by', function() {
            var el;
            beforeEach(function() {
                el = document.createElement('DIV');
                el.innerHTML = ':abc:';
            });
            it('replacing contents of given element with formatted text', function() {
                var node = automat.replace('Hello, ${0}!', el, 'World');
                node.should.equal(el);
                node.innerHTML.should.equal('Hello, World!');
            });
            it('appending contents of given element with formatted text', function() {
                automat.append('Hello, ${0}!', el, 'World');
                el.innerHTML.should.equal(':abc:Hello, World!');
            });
            it('inserting contents of given element with formatted text', function() {
                var refNode = { innerHTML: ':' };
                automat.append('Hello, ${0}!', el, refNode, 'World');
                el.innerHTML.should.equal('Hello, World!:abc:');
            });
        });
    });
});
