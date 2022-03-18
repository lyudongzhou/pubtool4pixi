"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TimeGenerate = function () {
  function TimeGenerate() {
    _classCallCheck(this, TimeGenerate);

    this.map = {};
    this.count = 0;
  }

  _createClass(TimeGenerate, [{
    key: "getNewTime",
    value: function getNewTime(cb) {
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      this.count++;
      this.map[this.count] = {
        fn: cb,
        time: time,
        repeatTime: false
      };
      return this.count;
    }
  }, {
    key: "getNewInterval",
    value: function getNewInterval(cb) {
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      this.count++;
      this.map[this.count] = {
        fn: cb,
        time: time,
        repeatTime: time
      };
      return this.count;
    }
  }, {
    key: "clear",
    value: function clear(id) {
      delete this.map[id];
    }
  }, {
    key: "getMap",
    value: function getMap() {
      return this.map;
    }
  }]);

  return TimeGenerate;
}();

var timeGenerate = new TimeGenerate();
// const PIXI = require('pixi.js');
var ticker = new PIXI.ticker.Ticker();
ticker.stop();
ticker.add(function (deltaTime) {
  var map = timeGenerate.getMap();
  for (var i in map) {
    if (!map[i]) {
      continue;
    }
    map[i].time -= deltaTime * 16;
    if (map[i].time <= 0) {
      // try{
      if (map[i] && typeof map[i].fn === "function") map[i].fn();
      if (!map[i]) {
        continue;
      }
      if (map[i].repeatTime) {
        map[i].time = map[i].repeatTime;
      } else {
        delete map[i];
      }
    }
  }
});
ticker.start();
function setTimeout(cb, time) {
  return timeGenerate.getNewTime(cb, time);
}
function clearTimeout(id) {
  timeGenerate.clear(id);
}
function setInterval(cb, time) {
  return timeGenerate.getNewInterval(cb, time);
}
function clearInterval(id) {
  timeGenerate.clear(id);
}
var o = {
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval
};
exports.setTimeout = setTimeout;
exports.clearTimeout = clearTimeout;
exports.setInterval = setInterval;
exports.clearInterval = clearInterval;
exports.default = o;