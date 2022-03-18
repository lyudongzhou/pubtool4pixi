"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HitContainer = exports.clearTimeout = exports.clearInterval = exports.setTimeout = exports.setInterval = exports.Easy = undefined;

var _easy = require("./easy");

var _easy2 = _interopRequireDefault(_easy);

var _Timmer = require("./Timmer");

var _hitTestContainer = require("./hitTestContainer");

var _hitTestContainer2 = _interopRequireDefault(_hitTestContainer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Easy = _easy2.default;
exports.setInterval = _Timmer.setInterval;
exports.setTimeout = _Timmer.setTimeout;
exports.clearInterval = _Timmer.clearInterval;
exports.clearTimeout = _Timmer.clearTimeout;
exports.HitContainer = _hitTestContainer2.default;