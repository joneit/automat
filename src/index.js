/* eslint-env browser */

'use strict';

var extract = /\/\*\s+([^]+?)\s+\*\//; // finds the string inside the /* ... */; the group excludes the whitespace

var ENCODERS = /%\{(\d+)\}/g; // double $$ to encode

var REPLACERS = /\$\{(.*?)\}/g; // single $ to replace


/**
 * @summary String/markup formatter.
 *
 * @desc Automatic string or template formatting:
 * * If input is a template, format and return as an `HTMLElement`.
 * * If input is a string:
 *   * Format and return as string; or
 *   * Format and return as an `HTMLElement`.
 *
 * A "template" is a JavaScript function whose body consists entirely of a single multi-line JavaScript comment containing (presumably) HTML -- which is extracted, ignoring any White space surrounding the comment delimiters.
 *
 * String substitution is performed on numbered _replacer_ patterns like `${n}` or _encoder_ patterns like `%{n}` where n is the zero-based `arguments` index. So `${0}` would be replaced with the first argument following `text` (or `element` if given).
 *
 * Encoders are just like replacers except the argument is HTML-encoded before being used.
 *
 * To change the format patterns, assign new `RegExp` patterns to `automat.encoders` and `automat.replacers`.
 *
 * @param {string|function} text - One of:
 * * A simple text string to be formatted and returned as described below.
 * * A "template" (function) as described above. The text is extracted and returned in `HTMLElement` provided in `node` or in a new `<div>...</div>` element if `node` was omitted.
 *
 * @param {HTMLElement} [node]
 *
 * @param {...*} [replacements] - Replacement values for numbered format patterns.
 *
 * @return {string|HTMLElement} Depends on `node`:
 * * If omitted, formatted text is returned as a string.
 * * If an `HTMLElement`, its `innerHTML` is set to the formatted text and this element is returned instead of the text string.
 */
function automat(text, node) {
    var asMarkup = node instanceof HTMLElement,
        repaclementsOffset = asMarkup ? 2 : 1,
        repaclementsLength = arguments.length - repaclementsOffset,
        isTemplate = typeof text === 'function';

    if (isTemplate) {
        text = text.toString().match(extract)[1];
        asMarkup = true;
    }

    if (isTemplate || !asMarkup) {
        node = document.createElement('DIV');
    }

    if (repaclementsLength) {
        var repaclements = Array.prototype.slice.call(arguments, repaclementsOffset);

        text = text.replace(REPLACERS, function(match, key) {
            return repaclements[key];
        });

        text = text.replace(ENCODERS, function(match, key) {
            node.textContent = repaclements[key];
            return node.innerHTML;
        });
    }

    if (isTemplate || asMarkup) {
        node.innerHTML = text;
        return node;
    } else {
        return text;
    }
}

/**
 * Use this wrapper to return the first child described in `html`.
 * @param {string|function} html
 * @returns {HTMLElement}
 */
automat.first = function(html) {
    return automat(html, document.createElement('div')).firstChild;
};

automat.encoders = ENCODERS;
automat.replacers = REPLACERS;


module.exports = automat;
