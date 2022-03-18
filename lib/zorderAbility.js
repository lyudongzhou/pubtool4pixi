"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = Observable;
var aDirty = [];
// const PIXI = require('pixi.js');
var ticker = new PIXI.ticker.Ticker();
ticker.stop();
ticker.add(function (deltaTime) {
    while (aDirty.length) {
        var obj = aDirty.pop();
        var parent = obj.parent;
        if (parent) {
            var children = parent.children;
            children.sort(function (a, b) {
                if (!a.zIndex) {
                    a.zIndex = 0;
                }
                if (!b.zIndex) {
                    b.zIndex = 0;
                }
                if (a.zIndex < b.zIndex) {
                    return -1;
                }
                if (a.zIndex > b.zIndex) {
                    return 1;
                }
                return 0;
            });
        }
        obj.zIndexDirty = false;
    }
});
ticker.start();
function Observable(obj) {
    obj._zIndex = 0;
    Object.defineProperty(obj, "zIndex", {
        get: function get() {
            return obj._zIndex;
        },
        set: function set(para) {
            if (para === obj._zIndex) {
                return;
            }
            obj._zIndex = para;
            if (!obj.zIndexDirty) {
                obj.zIndexDirty = true;
                aDirty.push(obj);
            }
        }
    });
    obj.refreshZindex = function () {
        var parent = obj.parent;
        if (parent) {
            var children = parent.children;
            children.sort(function (a, b) {
                if (a.zIndex === undefined) {
                    a.zIndex = 0;
                }
                if (b.zIndex === undefined) {
                    b.zIndex = 0;
                }
                if (a.zIndex < b.zIndex) {
                    return -1;
                }
                if (a.zIndex > b.zIndex) {
                    return 1;
                }
                return 0;
            });
        }
    };
}