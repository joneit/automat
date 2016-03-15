/* eslint-env browser */

'use strict';

var extract = /\/\*\s+([^]+?)\s+\*\//; // finds the string inside the /* ... */; the group excludes the whitespace

var ENCODERS = /%\{(\d+)\}/g; // double $$ to encode

var REPLACERS = /\$\{(.*?)\}/g; // single $ to replace


/**
 * @summary String formatter.
 *
 * @desc String substitution is performed on numbered _replacer_ patterns like `${n}` or _encoder_ patterns like `%{n}` where n is the zero-based `arguments` index. So `${0}` would be replaced with the first argument following `text`.
 *
 * Encoders are just like replacers except the argument is HTML-encoded before being used.
 *
 * To change the format patterns, assign new `RegExp` patterns to `automat.encoders` and `automat.replacers`.
 *
 * @param {string} text - A simple text string to be formatted and returned as described above.
 * * A "template" (function) as described above. The text is extracted and returned in `HTMLElement` provided in `node` or in a new `<div>...</div>` element if `node` was omitted.
 *
 * @param {...*} [replacements] - Replacement values for numbered format patterns.
 *
 * @return {string|HTMLElement} Depends on `node`:
 * * If omitted, formatted text is returned as a string.
 * * If an `HTMLElement`, its `innerHTML` is set to the formatted text and this element is returned instead of the text string.
 */
function automat(format, replacements/*...*/) {
    var args = arguments;

    if (typeof format === 'function') {
        format = format.toString().match(extract)[1];
    }

    if (args.length > 1) {
        format = format.replace(automat.replacersRegex, function(match, key) {
            key -= -1; // convert to number and increment
            return args.length > key ? args[key] : '';
        });

        format = format.replace(automat.encodersRegex, function(match, key) {
            key -= -1; // convert to number and increment
            if (args.length > key) {
                var htmlEncoderNode = htmlEncoderNode || document.createElement('DIV');
                htmlEncoderNode.textContent = args[key];
                return htmlEncoderNode.innerHTML;
            } else {
                return '';
            }
        });
    }

    return format;
}

/**
 * @summary Replace contents of `el` with `Nodes` generated from formatted template.
 *
 * A "template" is a JavaScript function whose body consists entirely of a single multi-line JavaScript comment containing (presumably) HTML -- which is extracted, ignoring any White space surrounding the comment delimiters.
 *
 * String substitution is performed on numbered _replacer_ patterns like `${n}` or _encoder_ patterns like `%{n}` where n is the zero-based `arguments` index. So `${0}` would be replaced with the first argument following `text` (or `element` if given).
 *
 * Encoders are just like replacers except the argument is HTML-encoded before being used.
 *
 * To change the format patterns, assign new `RegExp` patterns to `automat.encoders` and `automat.replacers`.
 *
 * @param {HTMLElement} [el] - Node in which to return markup generated from template. If omitted, a new `<div>...</div>` element will be created and returned.
 *
 * @param {string|function} template - If a function, extract template from comment within.
 *
 * @param {...*} [replacements] - Replacement values for numbered format patterns.
 *
 * @return {HTMLElement} The `HTMLElement` provided or a new `<div>...</div>` element, its `innerHTML` set to the formatted text.
 */
function replace(el, template, replacements/*...*/) {
    var asMarkup = el instanceof HTMLElement,
        args = asMarkup ? Array.prototype.slice.call(arguments, 1) : arguments;

    if (!asMarkup) {
        el = document.createElement('DIV');
    }

    el.innerHTML = automat.apply(null, args);
    return el;
}

/**
 * @summary Append or insert `Node`s generated from formatted template into given `el`.
 * @param {Node} [referenceNode=null] Inserts before this element within `el` or at end of `el` if `null`.
 * @param {HTMLElement} el
 * @param {string|function} template - If a function, extract template from comment within.
 * @param {...*} [replacements] - Replacement values for numbered format patterns.
 * @returns {HTMLElement}
 */
function append(referenceNode, el, template, replacements/*...*/) {
    var referenceNodeOmitted = !(el instanceof HTMLElement),
        args = Array.prototype.slice.call(arguments, referenceNodeOmitted ? 1 : 2),
        childNodes = replace.apply(null, args).childNodes;

    if (referenceNodeOmitted) {
        el = referenceNode;
        referenceNode = null;
    }

    for (var i = 0; i < childNodes.length; ++i) {
        el.insertBefore(childNodes[i], referenceNode);
    }

    return el;
}

/**
 * Use this convenience wrapper to return the first child described in `html`.
 * @param {string|function} template - If a function, extract template from comment within.
 * @returns {HTMLElement} A new `<div>...</div>` element, its `innerHTML` set to the formatted text.
 */
function firstChild(html, replacements/*...*/) {
    return replace.apply(null, arguments).firstChild;
}

automat.encodersRegex = ENCODERS;
automat.replacersRegex = REPLACERS;

automat.format = automat; // if you find using just automat() confusing
automat.replace = replace;
automat.append = append;
automat.firstChild = firstChild;

module.exports = automat;
