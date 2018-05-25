"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var product = exports.product = function product(_ref) {
    var title = _ref.title,
        price = _ref.price,
        id = _ref.id,
        description = _ref.description,
        image = _ref.image;

    _classCallCheck(this, product);

    this.id = id;
    this.title = title;
    this.price = price;
    this.description = description;
    this.image = image;
};