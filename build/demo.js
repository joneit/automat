/* eslint-env browser */
/* globals automat, template */

'use strict';

window.onload = function() {
    var list = document.querySelector('ul');

    list.appendChild(automat(template.question, 'C.R.', 'Oh Tigger, where are your manners'));
    list.appendChild(automat(template.answer, 'Tigger', 'I don’t know, but I bet they’re having more fun than I am', 'red'));
};
