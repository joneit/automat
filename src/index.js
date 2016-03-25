/* eslint-env browser */

'use strict';

var FUNCTION_CONSISTING_ENTIRELY_SINGLE_MULTILINE_COMMENT = /^function\s*\w*\(\)\s*\{\s*\/\*\s*([^]+?)\s*\*\/\s*\s*}$/;

/**
 * @summary Finds string substitution lexemes that require HTML encoding.
 * @desc Modify to suit.
 * @default %{n}
 * @type {RegExp}
 * @name encodersRegex
 */
var ENCODERS = /%\{(\d+)\}/g; // double $$ to encode

/**
 * @summary Finds string substitution lexemes.
 * @desc Modify to suit.
 * @default ${n}
 * @type {RegExp}
 * @name replacersRegex
 */
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
 * @param {string|function} template - A template to be formatted as described above. Overloads:
 * * A string primitive containing the template.
 * * A "template" function, which is a function consisting entirely of a single multi-line comment containing the template. The template is extracted from the comment.
 * * A (non-template) function to be called with `this` as the calling context. The template is the value returned from this call.
 *
 * @param {...*} [replacements] - Replacement values for numbered format patterns.
 *
 * @return {string} The formatted text.
 */
function automat(template, replacements/*...*/) {
    var hasReplacements = arguments.length > 1;

    // if `template` is a function, convert it to text
    if (typeof template === 'function') {
        var format = template.toString().match(FUNCTION_CONSISTING_ENTIRELY_SINGLE_MULTILINE_COMMENT);
        template = format
            ? format[1] // template function: extract text from comment
            : template.call(this); // non-template function: call it with context and use return value
    }

    if (hasReplacements) {
        var args = arguments;
        template = template.replace(automat.replacersRegex, function(match, key) {
            key -= -1; // convert to number and increment
            return args.length > key ? args[key] : '';
        });

        template = template.replace(automat.encodersRegex, function(match, key) {
            key -= -1; // convert to number and increment
            if (args.length > key) {
                var htmlEncoderNode = document.createElement('DIV');
                htmlEncoderNode.textContent = args[key];
                return htmlEncoderNode.innerHTML;
            } else {
                return '';
            }
        });
    }

    return template;
}

/**
 * @summary Replace contents of `el` with `Nodes` generated from formatted template.
 *
 * @param {string|function} template - See `template` parameter of {@link automat}.
 *
 * @param {HTMLElement} [el] - Node in which to return markup generated from template. If omitted, a new `<div>...</div>` element will be created and returned.
 *
 * @param {...*} [replacements] - Replacement values for numbered format patterns.
 *
 * @return {HTMLElement} The `el` provided or a new `<div>...</div>` element, its `innerHTML` set to the formatted text.
 */
function replace(template, el, replacements/*...*/) {
    var elOmitted = typeof el !== 'object',
        args = Array.prototype.slice.call(arguments, 1);

    if (elOmitted) {
        el = document.createElement('DIV');
        args.unshift(template);
    } else {
        args[0] = template;
    }

    el.innerHTML = automat.apply(null, args);

    return el;
}

/**
 * @summary Append or insert `Node`s generated from formatted template into given `el`.
 *
 * @param {string|function} template - See `template` parameter of {@link automat}.
 *
 * @param {HTMLElement} el
 *
 * @param {Node} [referenceNode=null] Inserts before this element within `el` or at end of `el` if `null`.
 *
 * @param {...*} [replacements] - Replacement values for numbered format patterns.
 *
 * @returns {HTMLElement}
 */
function append(template, el, referenceNode, replacements/*...*/) {
    var replacementsStartAt = 3,
        referenceNodeOmitted = typeof referenceNode !== 'object',  // replacements are never objects
        childNodes;

    if (referenceNodeOmitted) {
        referenceNode = null;
        replacementsStartAt = 2;
    }

    replacements = Array.prototype.slice.call(arguments, replacementsStartAt);
    childNodes = replace.apply(null, [template].concat(replacements)).childNodes;

    for (var i = 0; i < childNodes.length; ++i) {
        el.insertBefore(childNodes[i], referenceNode);
    }

    return el;
}

/**
 * Use this convenience wrapper to return the first child described in `html`.
 *
 * @param {string|function} template - If a function, extract template from comment within.
 *
 * @returns {HTMLElement} A new `<div>...</div>` element, its `innerHTML` set to the formatted text.
 */
function firstChild(template, replacements/*...*/) {
    return replace.apply(null, arguments).firstChild;
}

// properties:
automat.encodersRegex = ENCODERS;
automat.replacersRegex = REPLACERS;

// methods:
automat.format = automat; // if you find using just `automat()` confusing
automat.replace = replace;
automat.append = append;
automat.firstChild = firstChild;

module.exports = automat;
