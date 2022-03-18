"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function getRadius(x, y) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}
function getTheta(x, y) {
  if (x === 0 && y === 0) {
    return 0;
  }
  if (x === 0) {
    if (y > 0) {
      return Math.PI / 2;
    } else {
      return -Math.PI / 2;
    }
  }
  return Math.atan(target.y / target.x);
}
function bindPolarProperty(obj, target) {
  Object.defineProperty(obj, "theta", {
    get: function get() {
      return obj._theta;
    },
    set: function set(theta) {
      target.y = -obj.radius * Math.sin(theta);
      target.x = obj.radius * Math.cos(theta);
      obj._theta = theta;
    }
  }); //极坐标角度
  Object.defineProperty(obj, "radius", {
    get: function get() {
      return obj._radius;
    },
    set: function set(radius) {
      target.y = -radius * Math.sin(obj.theta);
      target.x = radius * Math.cos(obj.theta);
      obj._radius = radius;
    }
  }); //极坐标半径
  obj._theta = getTheta(target.x, target.y);
  obj._radius = getRadius(target.x, target.y);
}
exports.default = bindPolarProperty;