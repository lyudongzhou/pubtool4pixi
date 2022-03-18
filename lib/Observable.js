"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = Observable;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Event = function () {
    function Event() {
        _classCallCheck(this, Event);
    }

    _createClass(Event, [{
        key: "init",
        value: function init(fn, scope) {
            var isOnce = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            this.fn = fn;
            this.scope = scope;
            this.isOnce = isOnce;
        }
    }, {
        key: "fire",
        value: function fire(arg) {
            this.fn.apply(this.scope, arg);
        }
    }]);

    return Event;
}();

function Observable(obj) {
    obj["_Myevent"] = {};
    obj.addEvent = function (EventName, fn, scope, isOnce) {
        if (!obj["_Myevent"][EventName]) {
            obj["_Myevent"][EventName] = [];
        }
        var event = new Event();
        event.init(fn, scope || obj, isOnce);
        obj["_Myevent"][EventName].push(event);
        event.cancel = function () {
            obj.removeEvent(EventName, fn);
        };
        return event;
    };
    obj.fireEvent = function (EventName, arg) {
        var Events = obj["_Myevent"][EventName];
        if (!Events) {
            return;
        }
        var arrRemove = [];
        var eventCopy = [];
        for (var i = 0; i < Events.length; i++) {
            eventCopy.push(Events[i]);
        }
        for (var _i = 0; _i < eventCopy.length; _i++) {
            if (eventCopy[_i].isOnce) {
                arrRemove.push(eventCopy[_i]);
            }
            eventCopy[_i].fire(arg);
        }
        for (var _i2 = 0; _i2 < arrRemove.length; _i2++) {
            obj.removeEvent(EventName, arrRemove[_i2].fn);
        }
    };
    obj.removeEvent = function (EventName, fn) {
        var Events = obj["_Myevent"][EventName];
        if (!Events) {
            return;
        }
        for (var i = 0; i < Events.length; i++) {
            if (Events[i].fn === fn) {
                Events.splice(i, 1);
                break;
            }
        }
    };
    obj.addEventOnce = function (EventName, fn, scope) {
        return obj.addEvent(EventName, fn, scope, true);
    };
    obj.removeAllEvent = function () {
        obj["_Myevent"] = {};
    };
}