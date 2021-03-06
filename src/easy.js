'use strict';
import { setTimeout, setInterval, clearInterval } from './Timmer'
import bindPolarProperty from './polar'
// import { Container, Sprite, Text } from 'pixi.js';

import $ from 'jquery';
import Observable from './Observable';
import zorderAbility from "./zorderAbility"
const Container = PIXI.Container;
const Sprite = PIXI.Sprite;
const Text = PIXI.Text;
function moveInterface(obj) {
    let fn = obj.scale.set;
    obj.scale.set = function (x, y) {
        fn.call(obj, x, y);
        graphics1.clear();
        graphics1.drawRect(-0.5 * obj.width || -100, -0.5 * obj.height || -100, obj.width || 200, obj.height || 200);
    };
    let graphics1 = new PIXI.Graphics();
    graphics1.beginFill(0x000000, 0.2);
    graphics1.drawRect(-0.5 * obj.width || -100, -0.5 * obj.height || -100, obj.width || 200, obj.height || 200);
    graphics1.interactive = true;
    let graphics2 = new PIXI.Graphics();
    graphics2.beginFill(0xff0000, 0.2);
    graphics2.drawRect(-10, -10, 20, 20);
    graphics2.position.set(0.5 * obj.width || -100, -0.5 * obj.height || -100);
    graphics2.interactive = true;
    graphics2.on("pointerdown", function (e) {
        this.basePosition = {};
        this.basePosition.x = e.data.global.x;
        this.basePosition.y = e.data.global.y;
    });
    graphics2.on("pointermove", function (e) {
        if (this.basePosition) {
            let dx = e.data.global.x - this.basePosition.x;
            let dy = e.data.global.y - this.basePosition.y;
            let p = obj.toLocal(e.data.global, stage);
            graphics2.position.set(p.x, p.y);
            this.parent.scale.set(this.parent.scale.x + dx * 0.001, this.parent.scale.y - dy * 0.001);
        }
    });
    graphics2.on("pointerup", function (e) {
        console.log("scale:", this.parent.scale.x, ",", this.parent.scale.y);
        delete this.basePosition;
    });
    graphics2.on("pointerout", function (e) {
        console.log("scale:", this.parent.scale.x, ",", this.parent.scale.y);
        delete this.basePosition;
    });
    graphics1.on("pointerup", function () {
        this.allowMove = false;
        console.log("Position:", this.parent.x, ",", this.parent.y);
    });
    obj.addChild(graphics1, graphics2);
    let startPoint;
    graphics1.on("pointerdown", function (e) {
        this.allowMove = true;
        startPoint = obj.toLocal(e.data.global, stage);
    });
    graphics1.on("pointermove", function (e) {
        if (this.allowMove) {
            let p = obj.parent.toLocal(e.data.global, stage);
            this.parent.position.set(p.x - startPoint.x, p.y - startPoint.y);
        }
    });
    graphics1.on("pointerup", function () {
        this.allowMove = false;
        console.log("Position:", this.parent.x, ",", this.parent.y);
    });
}
function getPoint(p1, p2, a) {
    return {
        x: p1.x + a * (p2.x - p1.x),
        y: p1.y + a * (p2.y - p1.y)
    };
}
function FN(aPoint, a) {
    let arrLine = [];
    for (let i = 1; i < aPoint.length; i++) {
        let p1 = aPoint[i - 1];
        let p2 = aPoint[i]
        arrLine.push([p1, p2]);
    }
    let Point = [];
    for (let i = 0; i < arrLine.length; i++) {
        let p1 = arrLine[i][0];
        let p2 = arrLine[i][1];
        Point.push(getPoint(p1, p2, a));
    }
    if (Point.length > 1) {
        return FN(Point, a);
    }
    return Point[0];
}
function Fn1(star, end, aBezierPoint, TotalTime) {
    let arr = [{ x: 0, y: star }];
    arr.push.apply(arr, aBezierPoint);
    arr.push({ x: TotalTime, y: end });
    return function (time) {
        return FN(arr, time / TotalTime);
    };
}
let AniFun = {
    linear: function (t, b, c, d) {
        return (c - b) / d * t + b;
    },
    easeInQuad: function (t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    easeOutQuad: function (t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutQuad: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    easeInCubic: function (t, b, c, d) {
        return c * (t /= d) * t * t + b;
    },
    easeOutCubic: function (t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    easeInOutCubic: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    },
    easeInQuart: function (t, b, c, d) {
        return c * (t /= d) * t * t * t + b;
    },
    easeOutQuart: function (t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    easeInOutQuart: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    },
    easeInQuint: function (t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    },
    easeOutQuint: function (t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    easeInOutQuint: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    easeInSine: function (t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },
    easeOutSine: function (t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },
    easeInOutSine: function (t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },
    easeInExpo: function (t, b, c, d) {
        return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },
    easeOutExpo: function (t, b, c, d) {
        return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },
    easeInOutExpo: function (t, b, c, d) {
        if (t == 0) return b;
        if (t == d) return b + c;
        if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function (t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeOutCirc: function (t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInOutCirc: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },
    easeInElastic: function (t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        }
        else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    easeOutElastic: function (t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        }
        else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    },
    easeInOutElastic: function (t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d / 2) == 2) return b + c;
        if (!p) p = d * (.3 * 1.5);
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        }
        else var s = p / (2 * Math.PI) * Math.asin(c / a);
        if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
    },
    easeInBack: function (t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    easeOutBack: function (t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    easeInOutBack: function (t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    easeInBounce: function (t, b, c, d) {
        return c - AniFun.easeOutBounce(d - t, 0, c, d) + b;
    },
    easeOutBounce: function (t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
        }
    },
    easeInOutBounce: function (t, b, c, d) {
        if (t < d / 2) return AniFun.easeInBounce(t * 2, 0, c, d) * .5 + b;
        return AniFun.easeOutBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
    }
};
//t:?????????b:???????????????c:???????????????d:?????????
function getAniFun(name, b, c, d) {
    let dist = c - b;
    return function (t) {
        return b + AniFun[name](t, 0, dist, d);
    };
}

function playSound(type, isLoop, opt) {
    try {
        if (type == "bg" || isLoop) {
            return PIXI.sound.play("audio_" + type, { loop: true });
        } else {
            return PIXI.sound.play("audio_" + type, opt);
        }
    } catch (e) {
        try {
            return PIXI.sound.play("pub_" + type, opt);
        } catch (e) {


        }
    }
}

function stopPlay(type) {
    try {
        if (type == "bg") {
            PIXI.sound.stop("audio_" + type);
        } else {
            PIXI.sound.stop("audio_" + type);
        }
    } catch (e) {
        try {
            PIXI.sound.stop("pub_" + type);
        } catch (e) {


        }
    }
}

function getAni(name) {
    return new PIXI.spine.Spine(this.res["animation_" + name].spineData);
}

let AniObj = {
    getAni: getAni,
    getAniFun: getAniFun,
    playSound: playSound,
    stopPlay: stopPlay,
    getBezier: Fn1
};

function clickInterface() {
    let x = 0;
    let y = 0;
    let name = this.ClickSprite.name;
    let isPlaySound = !(this.ClickSprite.isPlaySound === false);
    let container = this;
    let sprite = new PIXI.Sprite(this.res[name].texture);
    let graphics1 = new PIXI.Graphics();
    container.allowClick = () => {
        return true;
    };
    graphics1.Sprite = sprite;
    graphics1.textureUnClick = this.res[name].texture;
    graphics1.textureClick = this.res[name + 'click'] && this.res[name + 'click'].texture || graphics1.textureUnClick;
    graphics1.textureOver = this.res[name + 'over'] && this.res[name + 'over'].texture || graphics1.textureUnClick;
    sprite.buttonMode = true;
    sprite.interactive = true;
    graphics1.on("pointerdown", function () {
        if (container.allowClick()) {
            this.Sprite.texture = this.textureClick;
            this._isClick = true;
        }
    });
    graphics1.on("touchend", function () {
        this.Sprite.texture = this.textureUnClick;
        this._isClick = false;
    });
    graphics1.on("mouseup", function () {
        this.Sprite.texture = this.textureUnClick;
        this._isClick = false;
    });
    graphics1.on("pointermove", function (e) {
        if (!container.allowClick()) {
            return;
        }
        if (this._isClick && !graphics1.containsPoint(e.data.global)) {
            this.Sprite.texture = this.textureUnClick;
            this._isClick = false;
        } else if (this._isClick) {
            this.Sprite.texture = this.textureClick;
        } else if (!this._isClick && graphics1.containsPoint(e.data.global)) {
            this.Sprite.texture = this.textureOver
        } else {
            this.Sprite.texture = this.textureUnClick;
        }
    });
    if (isPlaySound === true) {
        graphics1.on("pointertap", () => {
            this.playSound("click");
        });
    }
    sprite.anchor.set(0, 1);
    sprite.x = x;
    sprite.y = y + sprite.height;
    graphics1.beginFill(0x000000, 0);
    graphics1.drawRect(sprite.x, sprite.y - sprite.height, sprite.width, sprite.height);
    graphics1.alpha = 1;
    graphics1.interactive = true;
    graphics1.buttonMode = true;
    graphics1.on("pointertap", () => {
        this.fireEvent("onClick");
    });
    container.on = (event, fn, context) => {
        graphics1.on(event, fn, context);
    };
    container.once = (event, fn, context) => {
        graphics1.once(event, fn, context);
    };
    container.removeListener = (event, fn, context, once) => {
        graphics1.removeListener(event, fn, context, once);
    };
    container._events = graphics1._events;
    container.range = graphics1;
    container.addChild(sprite, graphics1);
    container.Width = sprite.width;
    container.Height = sprite.height;
    container.resetTexture = function () {
        sprite.texture = graphics1.textureUnClick;
        graphics1._isClick = false;
    }
    return container;
}
/**

 * @class BaseContainer

 * @classdesc ????????????.

 * @param {object} res ????????????.

 * @param {boolean} isPolar  ???????????????????????????.
 *
 * @property {object} parentContainer ???????????????

 */
class BaseContainer extends Container {
    constructor(res, isPolar = false) {
        super();
        Observable(this);
        zorderAbility(this);
        $.extend(true, this, AniObj);
        this.res = res;
        Object.defineProperty(this, "parentContainer", {
            get: () => {
                return this["_parentContainer"];
            },
            set: (para) => {
                this["_parentContainer"] = para;
                /**
                 * Parent Change Event.
                 * @memberOf BaseContainer
                 * @event ParentChange
                 */
                this.fireEvent("ParentChange");
            }
        });
        this.addEvent("parentChange", () => {
            this.isAdd2Parent = false;
        });
        if (isPolar) {
            bindPolarProperty(this, this);
        }
        this.addEvent("created", this.BindTool);
    }
    BindTool() {
        if (this.ClickSprite) {
            clickInterface.call(this);
        }
        if (this.TrackMode) {
            this.addEventOnce("onShow", () => {
                moveInterface(this);
            });
        }
    }
    setParent(parent) {
        this.parentContainer = parent;
    }
    getSprite() {
        return this;
    }

    getParentContainer() {
        return this.parentContainer;
    }

    add2Parent(hasMask) {
        if (this.isAdd2Parent) {
            return;
        }
        this.isAdd2Parent = true;
        if (hasMask) {
            if (!this.mask) {
                this.mask = new PIXI.Sprite(this.res['mask'].texture);
                this.mask.interactive = true;
            }
            this.parentContainer && this.parentContainer.addChild(this.mask);
        }
        this.parentContainer && this.parentContainer.addChild(this.getSprite());
    }

    remove2Parent() {
        if (!this.isAdd2Parent) {
            return;
        }
        this.isAdd2Parent = false;
        if (this.mask) {
            this.parentContainer && this.parentContainer.removeChild(this.mask);
        }
        this.parentContainer && this.parentContainer.removeChild(this.getSprite());
    }
    /**
     * show function.
     * @function show
     * @memberOf BaseContainer
     * @param {boolean} Is the container displayed immediately
     */
    show(isNow) {
        if (this.isSlow && !isNow) {
            /**
             * beforeShow Event.
             * @memberOf BaseContainer
             * @event beforeShow
             * @description Fired before the instance show
             */
            this.fireEvent("beforeShow");
            this.add2Parent();
            this.alpha = 0;
            this.showItem(this.getSprite(), () => {
                /**
                 * onShow Event.
                 * @memberOf BaseContainer
                 * @event onShow
                 * @description Fired after the instance show
                 */
                this.fireEvent("onShow");
            });
        } else {
            this.fireEvent("beforeShow");
            this.add2Parent();
            this.alpha = 1;
            this.fireEvent("onShow");
        }
        this._isShow = true;
        return this;
    }
    /**
     * hide function.
     * @function hide
     * @memberOf BaseContainer
     * @param {boolean} Is the container hided immediately
     */
    hide(isNow) {
        if (this.isSlow && !isNow) {
            /**
             * beforeHide Event.
             * @memberOf BaseContainer
             * @event beforeHide
             * @description Fired before the instance hide
             */
            this.fireEvent("beforeHide");
            this.hideItem(this.getSprite(), () => {
                this.remove2Parent();
                /**
                 * onHide Event.
                 * @memberOf BaseContainer
                 * @event onHide
                 * @description Fired after the instance hide
                 */
                this.fireEvent("onHide");
            });
        } else {
            this.fireEvent("beforeHide");
            this.remove2Parent();
            this.fireEvent("onHide");
        }
        this._isShow = false;
        return this;
    }

    hideItem(item, cb) {
        let TotalTime = this.AniTime || 800;
        let fn = getAniFun("linear", item.alpha, 0, TotalTime);
        let time = new Date().getTime();
        if (item.Iteminterval) {
            clearInterval(item.Iteminterval);
        }
        let interval = setInterval(() => {
            let dt = new Date().getTime() - time;
            item.alpha = fn(dt);
            if (dt >= TotalTime) {
                clearInterval(interval);
                item.alpha = 0;
                item.Iteminterval = null;
                cb && cb();
            }
        });
        item.Iteminterval = interval;
    }

    showItem(item, cb) {
        let TotalTime = this.AniTime || 800;
        let fn = getAniFun("linear", item.alpha, 1, TotalTime);
        let time = new Date().getTime();
        if (item.Iteminterval) {
            clearInterval(item.Iteminterval);
        }
        let interval = setInterval(() => {
            let dt = new Date().getTime() - time;
            item.alpha = fn(dt);
            if (dt >= TotalTime) {
                item.alpha = 1;
                clearInterval(interval);
                item.Iteminterval = null;
                cb && cb();
            }
        });
        item.Iteminterval = interval;
    }
    /**
     * @function reset
     * @memberOf BaseContainer
     * @description remove all event and redo init function
     */
    reset() {
        this.removeChildren();
        this.removeAllListeners();
        this.removeAllEvent();
        this.init();
    }
    /**
     * @function Destroy
     * @memberOf BaseContainer
     * @description Destroy the instance
     */
    Destroy() {
        this.parent && this.parent.removeChild(this);
        this.destroy && this.destroy();
        delete this._Easy.InstanceMap[this.id];
        /**
         * Destroyed Event.
         * @memberOf BaseContainer
         * @event Destroyed
         * @description Fired when the instance destroyed
         */
        this.fireEvent("Destroyed");
    }
}
let oldSpine = PIXI.spine.Spine;
let stateUpdate = function (delta) {
    delta *= this.timeScale;
    var tracks = this.tracks;
    for (var i = 0, n = tracks.length; i < n; i++) {
        var current = tracks[i];
        if (current == null)
            continue;
        current.animationLast = current.nextAnimationLast;
        current.trackLast = current.nextTrackLast;
        var currentDelta = delta * current.timeScale;
        if (current.delay > 0) {
            current.delay -= currentDelta;
            if (current.delay > 0)
                continue;
            currentDelta = -current.delay;
            current.delay = 0;
        }
        var next = current.next;
        if (next != null) {
            var nextTime = current.trackLast - next.delay;
            if (nextTime >= 0) {
                next.delay = 0;
                next.trackTime = nextTime + delta * next.timeScale;
                current.trackTime += currentDelta;
                this.setCurrent(i, next, true);
                while (next.mixingFrom != null) {
                    next.mixTime += currentDelta;
                    next = next.mixingFrom;
                }
                continue;
            }
        } else if (current.trackLast >= current.trackEnd && current.mixingFrom == null) {
            tracks[i] = null;
            this.queue.end(current);
            this.disposeNext(current);
            continue;
        }
        if (current.mixingFrom != null && this.updateMixingFrom(current, delta)) {
            var from = current.mixingFrom;
            current.mixingFrom = null;
            while (from != null) {
                this.queue.end(from);
                from = from.mixingFrom;
            }
        }
        if (this.isStop) {
            if (this.stopTime !== undefined) {
                current.trackTime = this.stopTime;
            }
            continue;
        }
        current.trackTime += currentDelta;
    }
    this.queue.drain();
};
let stateReverseUpdate = function (delta) {
    if (this.isStop) {
        return;
    }
    delta *= this.timeScale;
    var tracks = this.tracks;
    for (var i = 0, n = tracks.length; i < n; i++) {
        var current = tracks[i];
        if (current == null)
            continue;
        current.animationLast = current.nextAnimationLast;
        current.trackLast = current.nextTrackLast;
        var currentDelta = delta * current.timeScale;
        if (current.delay > 0) {
            current.delay -= currentDelta;
            if (current.delay > 0)
                continue;
            currentDelta = -current.delay;
            current.delay = 0;
        }
        var next = current.next;
        if (next != null) {
            var nextTime = current.trackLast - next.delay;
            if (nextTime >= 0) {
                next.delay = 0;
                next.trackTime = nextTime + delta * next.timeScale;
                current.trackTime += currentDelta;
                this.setCurrent(i, next, true);
                while (next.mixingFrom != null) {
                    next.mixTime += currentDelta;
                    next = next.mixingFrom;
                }
                continue;
            }
        } else if (current.trackLast >= current.trackEnd && current.mixingFrom == null) {
            tracks[i] = null;
            this.queue.end(current);
            this.disposeNext(current);
            continue;
        }
        if (current.mixingFrom != null && this.updateMixingFrom(current, delta)) {
            var from = current.mixingFrom;
            current.mixingFrom = null;
            while (from != null) {
                this.queue.end(from);
                from = from.mixingFrom;
            }
        }
        if (this.isStop) {
            if (this.stopTime) {
                current.trackTime = this.stopTime;
            }
            continue;
        }
        current.trackTime -= currentDelta;
        if (current.trackTime <= 0) {
            current.trackTime = 0;
        }
    }
    this.queue.drain();
};
function animation(item, bool, x, y, B, s) {
    this.state.setAnimation(0, item, bool);
    this.x = x;
    this.y = y;
    this.interactive = B;
    this.buttonMode = B;
    this.state.timeScale = Math.random() * 0.3 + 1.0;
    if (s) {
        this.width = this.width / s;
        this.height = this.height / s
    }
    return this
}
function addSpine(itemFS1, itemFS2, x, y, t, s, cb) {
    this.state.setAnimation(0, itemFS1, false);
    this.x = x;
    this.y = y;
    if (s) {
        this.width = this.width / s;
        this.height = this.height / s
    }
    setTimeout(() => {
        if (this.state) {
            this.state.setAnimation(0, itemFS2, true);
            cb && cb();
        }

    }, this.skeleton.data.animations[t].duration * 1000);
    return this
}
let spineFn = {
    setAni: function (name) {
        this.continueAni();
        this.state.update = stateUpdate;
        this.fireEvent("beforeAni");
        let track = this.state.setAnimation(0, name, false);
        let interval = setInterval(() => {
            me.fireEvent("onAni", [track]);
        });
        let me = this;
        let listeners = {
            complete: function (track, event) {
                clearInterval(interval);
                me.state.removeListener(listeners);
                setTimeout(()=>{
                    me.fireEvent("onAniEnd", [track]);
                });
            }
        };
        this.state.addListener(listeners);
        return track;
    },
    setAniLoop: function (name) {
        this.continueAni();
        this.state.update = stateUpdate;
        return this.state.setAnimation(0, name, true);
    },
    setAniReverse: function (name) {
        this.continueAni();
        this.state.update = stateReverseUpdate;
        this.fireEvent("beforeAni");
        let track = this.state.setAnimation(0, name, false);
        let interval = setInterval(() => {
            me.fireEvent("onAni");
        });
        let me = this;
        let listeners = {
            complete: function (track, event) {
                clearInterval(interval);
                me.state.removeListener(listeners);
                me.fireEvent("onAniEnd", [track]);
            }
        };
        this.state.addListener(listeners);
        return track;
    },
    stopAt: function (time) {
        this.state.isStop = true;
        this.state.stopTime = time;
        this.state.update = stateUpdate;
    },
    continueAni: function () {
        this.state.isStop = false;
        this.state.stopTime = 0;
    }
};
PIXI.spine.Spine = function (SpineData) {
    let obj = new oldSpine(SpineData);
    Observable(obj);
    // for(let i in spineFn){
    //     obj[i] = spineFn[i];
    // }
    obj.setAni = function (name) {
        this.state.continueAni();
        this.state.update = stateUpdate;
        this.fireEvent("beforeAni");
        let track = this.state.setAnimation(0, name, false);
        track.trackTime = 0;
        let duration = track.animation.duration;
        let interval = setInterval(() => {
            obj.fireEvent("onAni", [track]);
            if (!track.animation) {
                clearInterval(interval);
                track.animation = { duration: 9999 };
                obj.fireEvent("onAniEnd", [track]);
            }
            if (duration - track.trackTime <= 0.01 || !obj.parent) {
                clearInterval(interval);
                obj.fireEvent("onAniEnd", [track]);
            }
        });
        return track;
    };
    obj.setAniLoop = (name) => {
        obj.state.continueAni();
        obj.state.update = stateUpdate;
        return obj.state.setAnimation(0, name, true);
    };
    obj.setAniReverse = (name) => {
        obj.state.continueAni();
        obj.state.update = stateReverseUpdate;
        let track = obj.state.setAnimation(0, name, false);
        track.trackTime = track.animation.duration;
        let interval = setInterval(() => {
            obj.fireEvent("onAni", track);
            if (track.trackTime === 0) {
                clearInterval(interval);
                obj.fireEvent("onAniEnd", track);
            }
        });
    };
    obj.state.stopAt = (time) => {
        obj.state.isStop = true;
        obj.state.stopTime = time;
        obj.state.update = stateUpdate;
    };
    obj.state.continueAni = () => {
        obj.state.isStop = false;
        obj.state.stopTime = 0;
    };
    obj.animation = animation;
    obj.addspine = addSpine;
    $.extend(obj, spineFn);
    return obj;
};
/**

 * @class Base
 * @classdesc Easy?????????.
 * @property {object} Map ?????????????????????
 * @property {object} InstanceMap ???????????????
 * @property {object} randomId ??????ID?????????

 */
class Base {
    constructor() {
        this.Map = {};
        this.InstanceMap = {};
        this.randomId = 0;
    }
    /**
     * @function define
     * @memberOf Base
     * @description Define a model
     * @param {string} className model's name
     * @param {object} prop model's prop
     */
    define(className, prop = {}) {
        if (this.Map[className]) {
            throw new TypeError("This class has been defined");
        }
        this.Map[className] = prop;
    }
    /**
     * @function create
     * @memberOf Base
     * @description Create a instance from model
     * @param {string} className model's name
     * @param {object} extraProp instance's prop
     * @return {BaseContainer} Return a instance which designed by model
     */
    create(className, extraProp = {}, isBase) {
        let prop = $.extend(true, {}, this.Map[className], extraProp);
        let instance;
        if (prop.extend && (prop.extend !== className)) {
            let extendClassName = prop.extend;
            delete prop.extend;
            instance = easy.create(extendClassName, prop,true);
            delete instance.id;
        } else {
            instance = new BaseContainer(res, prop.isPolar);
        }
        $.extend(true, instance, prop, extraProp, { _className: className });
        instance._ClassName = className;
        this.Map[className].init&&this.Map[className].init.call(instance)
        // prop.init && prop.init.call(instance);
        if (!isBase) {
            if (!instance.id) {
                instance.id = className;
                if (this.InstanceMap[instance.id]) {
                    instance.id = className + this.randomId;
                    this.randomId++;
                }
            } else if (this.InstanceMap[instance.id]) {
                throw new Error(instance.id + " has already been declared");
            }
            this.InstanceMap[instance.id] = instance;
            instance.fireEvent("created");
            instance._Easy = this;
        }
        return instance;
    }
    /**
     * @function getCmp
     * @memberOf Base
     * @description get a created instance
     * @param {string} id className or ID
     * @return {BaseContainer} A instance
     */
    getCmp(id) {
        return this.InstanceMap[id];
    }
    getClickSprite(name, x = 0, y = 0, isPlaySound = true) {
        let container = new PIXI.Container();
        let sprite = new PIXI.Sprite(this.res[name].texture);
        let graphics1 = new PIXI.Graphics();
        graphics1.Sprite = sprite;
        graphics1.textureUnClick = this.res[name].texture;
        graphics1.textureClick = this.res[name + 'click'] && this.res[name + 'click'].texture || graphics1.textureUnClick;
        sprite.buttonMode = true;
        sprite.interactive = true;
        graphics1.on("pointerdown", function () {
            this.Sprite.texture = this.textureClick;
            this._isClick = true;
        });
        graphics1.on("pointerup", function () {
            this.Sprite.texture = this.textureUnClick;
            this._isClick = false;
        });
        graphics1.on("pointermove", function (e) {
            if (this._isClick && !graphics1.containsPoint(e.data.global)) {
                console.log("out");
                this.Sprite.texture = this.textureUnClick;
                this._isClick = false;
            } else if (this._isClick) {
                this.Sprite.texture = this.textureClick;
            }
        });
        if (isPlaySound === true) {
            graphics1.on("pointertap", () => {
                this.playSound("click");
            });
        }
        sprite.anchor.set(0, 1);
        sprite.x = x;
        sprite.y = y + sprite.height;
        graphics1.beginFill(0x000000, 0);
        graphics1.drawRect(sprite.x, sprite.y - sprite.height, sprite.width, sprite.height);
        graphics1.alpha = 1;
        graphics1.interactive = true;
        graphics1.buttonMode = true;
        container.on = (event, fn, context) => {
            graphics1.on(event, fn, context);
        };
        container.once = (event, fn, context) => {
            graphics1.once(event, fn, context);
        };
        container.removeListener = (event, fn, context, once) => {
            graphics1.removeListener(event, fn, context, once);
        };
        container._events = graphics1._events;
        container.range = graphics1;
        container.addChild(sprite, graphics1);
        container.Width = sprite.width;
        container.Height = sprite.height;
        return container;
    }
    /**
     * @function removeAll
     * @memberOf Base
     * @description remove all instance except static instance
     */
    removeAll() {
        for (let i in this.InstanceMap) {
            if (this.InstanceMap[i].isStatic) {
                continue;
            }
            this.InstanceMap[i].Destroy();
            delete this.InstanceMap[i];
        }
    }
    /**
     * @function removeAllAndStaitic
     * @memberOf Base
     * @description remove all instance
     */
    removeAllAndStaitic() {
        for (let i in this.InstanceMap) {
            this.InstanceMap[i].Destroy();
            delete this.InstanceMap[i];
        }
    }
    /**
     * @function destroy
     * @memberOf Base
     * @description remove instance which has been given
     * @param {BaseContainer} instance the instance want to destroy;
     */
    destroy(instance) {
        this.InstanceMap[instance.id].Destroy();
        delete this.InstanceMap[instance.id];
    }
    /**
     * @function moveInterface
     * @memberOf Base
     * @description create a movable display object
     * @param {PIXI.DisplayObject}
     */
    moveInterface(obj) {
        moveInterface(obj);
    }
    /**
     * @function observable
     * @memberOf Base
     * @description create a observable object
     * @param {object}
     */
    observable(obj) {
        Observable(obj);
    }
    /**
     * @function shakeContainer
     * @memberOf Base
     * @description a shake container animate
     * @param stage {object} ???????????????
     * @param Num {number} ??????????????????3
     * @param dist {number} ????????????
     * @param useTime {number} ??????????????????
     * @return {Promise}
     */
    shakeContainer(stage, Num = 3, dist = 10, useTime = 100) {
        return new Promise((resolve) => {

            if (stage._shakeEvent) {
                stage._shakeEvent.cancel();
            }
            stage._shakeEvent = {};
            let fn = getAniFun("linear", 0, dist, useTime / 4);
            let positive = true;
            let isReverse = false;
            let time = new Date().getTime();
            let count = 0;
            let base = stage.x;
            stage._shakeEvent.cancel = function () {
                clearInterval(this.twinkleInterval);
                stage.x = base;
                delete stage._shakeEvent;
            };
            stage._shakeEvent.twinkleInterval = setInterval(() => {
                let dt = new Date().getTime() - time;
                if (dt > useTime / 4) {
                    isReverse = !isReverse;
                    count++;
                    dt = dt % useTime / 4;
                    positive = parseInt(count % 4 / 2) === 0;
                    if (count > Num * 4 - 1) {
                        stage._shakeEvent.cancel();
                        resolve();
                        return;
                    }
                    time = new Date().getTime();
                }

                if (isReverse) {
                    dt = useTime / 4 - dt;
                }
                if (positive) {
                    stage.x = base + fn(dt);
                } else {
                    stage.x = base - fn(dt);
                }
            });
        });
    };
}
let easy = new Base();
easy.define("normalBtn", {
});
easy.define("muteBtn", {
    init() {
        let btn = new PIXI.Sprite(this.res["pub_playsound"].texture);
        btn.position.set(1920 - 40 - btn.width, 40);
        btn.interactive = true;
        btn.buttonMode = true;
        this.isMute = false;
        let allowMove = true;
        btn.on("pointertap", () => {
            allowMove = false;
            if (this.isMute) {
                btn.texture = this.res["pub_playsound"].texture;
                PIXI.sound.unmuteAll();
            } else {
                btn.texture = this.res["pub_muteclick"].texture;
                PIXI.sound.muteAll();
            }
            this.isMute = !this.isMute;
        });
        // btn.on("pointermove",(e)=>{
        //     if(btn.containsPoint(e.data.global)){
        //         if(!allowMove){
        //             return;
        //         }
        //         btn.texture = this.res["pub_muteover"].texture;
        //     }else{
        //         allowMove = true;
        //         if(this.isMute){
        //             btn.texture = this.res["pub_muteclick"].texture;
        //         }else{
        //             btn.texture = this.res["pub_playsound"].texture;
        //         }
        //     }
        // });
        // btn.on("pointerupoutside", ()=>{
        //     if(this.isMute){
        //         if(allowMove){
        //             btn.texture = this.res["pub_muteclick"].texture
        //         }else{
        //             btn.texture = this.res["pub_playsound"].texture
        //         }
        //     }else{
        //         btn.texture = this.res["pub_playsound"].texture
        //     }
        // });
        // btn.on("pointercancel",()=>{
        //     if(this.isMute){
        //         if(allowMove){
        //             btn.texture = this.res["pub_muteclick"].texture
        //         }else{
        //             btn.texture = this.res["pub_playsound"].texture
        //         }
        //     }else{
        //         btn.texture = this.res["pub_playsound"].texture
        //     }
        // });
        // btn.on("pointerup", ()=>{
        //     if(this.isMute){
        //         if(allowMove){
        //             btn.texture = this.res["pub_muteclick"].texture
        //         }else{
        //             btn.texture = this.res["pub_playsound"].texture
        //         }
        //     }else{
        //         btn.texture = this.res["pub_playsound"].texture
        //     }
        // });
        this.addChild(btn);
        this.show();
    }
});
easy.define("container", {});
function getEasy() {
    let easy = new Base();
    easy.define("normalBtn", {});
    easy.define("muteBtn", {
        init() {
            let btn = new PIXI.Sprite(this.res["pub_playsound"].texture);
            btn.position.set(1920 - 40 - btn.width, 40);
            btn.interactive = true;
            btn.buttonMode = true;
            this.isMute = false;
            let allowMove = true;
            btn.on("pointertap", () => {
                allowMove = false;
                if (this.isMute) {
                    btn.texture = this.res["pub_playsound"].texture;
                    PIXI.sound.unmuteAll();
                } else {
                    btn.texture = this.res["pub_muteclick"].texture;
                    PIXI.sound.muteAll();
                }
                this.isMute = !this.isMute;
            });
            btn.on("pointermove", (e) => {
                if (btn.containsPoint(e.data.global)) {
                    if (!allowMove) {
                        return;
                    }
                    btn.texture = this.res["pub_muteover"].texture;
                } else {
                    allowMove = true;
                    if (this.isMute) {
                        btn.texture = this.res["pub_muteclick"].texture;
                    } else {
                        btn.texture = this.res["pub_playsound"].texture;
                    }
                }
            });
            btn.on("pointerupoutside", () => {
                if (this.isMute) {
                    if (allowMove) {
                        btn.texture = this.res["pub_muteclick"].texture
                    } else {
                        btn.texture = this.res["pub_playsound"].texture
                    }
                } else {
                    btn.texture = this.res["pub_playsound"].texture
                }
            });
            btn.on("pointercancel", () => {
                if (this.isMute) {
                    if (allowMove) {
                        btn.texture = this.res["pub_muteclick"].texture
                    } else {
                        btn.texture = this.res["pub_playsound"].texture
                    }
                } else {
                    btn.texture = this.res["pub_playsound"].texture
                }
            });
            btn.on("pointerup", () => {
                if (this.isMute) {
                    if (allowMove) {
                        btn.texture = this.res["pub_muteclick"].texture
                    } else {
                        btn.texture = this.res["pub_playsound"].texture
                    }
                } else {
                    btn.texture = this.res["pub_playsound"].texture
                }
            });

            this.addChild(btn);
            this.show();
        }
    });
    easy.define("container", {});
    return easy;
}
easy.getNewInstance = getEasy;
let Easy = easy;

/**
 * @class BigMath_StarScoreBoard
 * @extends BaseContainer
 * @classdesc ???????????????????????????????????????
 * @property {Number} topicNumber - ?????????????????? - ????????????3
 * @property {Number} marginDistance - ??????????????? - ????????????80
 * @property {Object} starBgLocation - ???????????? - ????????????{x:34,y:36}
 * @property {String} StarScoreBoard - ????????? - ????????????"image_StarScoreBoard"
 * @property {Object} starLocation - ????????????????????? - ????????????{x:63,y:55}
 * @property {String} bgIcon - ????????????????????? - ????????????"image_starIdle"
 * @property {String} loseIcon - ????????????????????? - ????????????"image_starLose"
 * @property {String} lightSpineName - ????????????????????????????????? - ????????????"animation_star"
 * @property {String} lightAniName - ?????????????????????????????????????????? - ????????????"star_in"
 * @property {String} starPathSpineName - ?????????????????????????????? - ????????????"animation_starflash"
 * @property {String} starPathAniName - ??????????????????????????????????????? - ????????????"starflash_in"
 * @property {String} starSound - ??????????????????????????? - ?????????:"audio_starSound"

 *
 * @example
 * import {Easy} from "pubtool4pixi"
 * Easy.create("BigMath_StarScoreBoard",{
 * topicNumber : 3,
 * marginDistance:80,
 * starBgLocation:{
 *   x:34,y:36
 * },
 *}).show();
 * */
Easy.define("BigMath_StarScoreBoard", {
    topicNumber: 3,
    marginDistance: 80,
    starSound: "audio_starSound",
    bgIcon: "image_starIdle",
    lightSpineName: "animation_star",
    starPathSpineName: "animation_starflash",
    lightAniName: "star_in",
    starPathAniName: "starflash_in",
    loseIcon: "image_starLose",
    StarScoreBoard: "image_StarScoreBoard",
    starBgLocation: {
        x: 34, y: 36
    },
    starLocation: {
        x: 63, y: 55
    },
    init() {
        let topicNumber = this.topicNumber;
        this.starBg = new PIXI.Sprite(res[this.StarScoreBoard].texture);
        this.starBg.position.set(this.starBgLocation.x, this.starBgLocation.y);
        this.addChild(this.starBg);
        this.aStar = [];
        for (let i = 0; i < topicNumber; i++) {
            let star = Easy.create("BigMath_Star", {
                bgIcon: this.bgIcon,
                lightSpineName: this.lightSpineName,
                lightAniName: this.lightAniName,
                loseIcon: this.loseIcon,
                parentContainer: this,
                x: this.starLocation.x + i * this.marginDistance, y: this.starLocation.y
            });
            star.show();
            this.aStar.push(star);
        }
    },
    /**
     * @function addWinStar
     * @memberOf BigMath_StarScoreBoard
     * @param  {Number} presentTopicNumber ?????????????????????
     * @description ??????????????????
     * @return {Promise} ?????????????????????????????????
     * */
    addWinStar(presentTopicNumber) {
        return new Promise((resolve) => {
            let starPath = this.starPath();
            let sound = this.playAudio();
            let light = this.aStar[presentTopicNumber].light();
            Promise.all([sound, light, starPath]).then(() => {
                resolve();
            });
        });
    },
    /**
     * @function addLoseStar
     * @memberOf BigMath_StarScoreBoard
     * @param  {Number} presentTopicNumber ?????????????????????
     * @description ??????????????????
     * @return {Promise} ???????????????
     * */
    addLoseStar(presentTopicNumber) {
        return new Promise((resolve) => {
            this.aStar[presentTopicNumber].dark().then(() => {
                resolve();
            });
        });
    },
    /**
     * @function reset
     * @memberOf BigMath_StarScoreBoard
     * @description ??????????????????
     * */
    reset() {
        this.aStar.forEach(item => {
            item.reset();
        });
    },
    /**
     * @function starPath
     * @memberOf BigMath_StarScoreBoard
     * @description ????????????????????????
     * @return {Promise} ????????????????????????
     * */
    starPath() {
        return new Promise((resolve) => {

            let starPath = new PIXI.spine.Spine(this.res[this.starPathSpineName].spineData);
            starPath.setAni(this.starPathAniName);
            starPath.addEventOnce("onAniEnd", () => {
                resolve();
            });
            this.addChild(starPath);
        });
    },
    /**
     * @function playAudio
     * @memberOf BigMath_StarScoreBoard
     * @description ??????????????????
     * @return {Promise} ??????????????????
     * */
    playAudio() {
        return new Promise((resolve) => {
            try {
                PIXI.sound.play(this.starSound, {
                    complete: () => {
                        resolve();
                    }
                });
            } catch (e) {
                resolve();
            }
        });

    }
});
Easy.define("BigMath_Star", {
    bgIcon: "image_starIdle",
    lightSpineName: "animation_star",
    lightAniName: "star_in",
    loseIcon: "image_starLose",
    init() {
        this.bg = new PIXI.Sprite(this.res[this.bgIcon].texture);
        this.addChild(this.bg);
        if (this.res[this.loseIcon]) {
            this.loseBg = new PIXI.Sprite(this.res[this.loseIcon].texture);
        } else {
            this.loseBg = new PIXI.Sprite(this.res[this.bgIcon].texture);
        }
        this.loseBg.position.set(-2.0801850104436426, -0.2934630807666849);
        this.addEventOnce("Destroyed", () => {
            this.bg = null;
            this.loseBg = null;
            this.lightStar = null;
        });
    },
    /**
     * @function light
     * @memberOf BigMath_Star
     * @description ??????????????????????????????
     * @return {Promise} ???????????????????????????
     * */
    light() {
        return new Promise((resolve) => {
            this.removeChildren();
            this.getNewAni();
            this.addChild(this.bg, this.lightStar);
            this.lightStar.setAni(this.lightAniName);
            this.lightStar.addEventOnce("onAniEnd", () => {

                resolve();
            });
        });
    },
    /**
     * @function dark
     * @memberOf BigMath_Star
     * @description ????????????????????????????????????
     * @return {Promise} ????????????
     * */
    dark() {
        return new Promise((resolve) => {
            this.addChild(this.loseBg);
            resolve();
        });
    },
    /**
     * @function reset
     * @memberOf BigMath_Star
     * @description ??????????????????
     * */
    reset() {
        this.removeChildren();
        this.addChild(this.bg);
    },
    getNewAni() {
        this.lightStar && this.lightStar.destroy();
        this.lightStar = new PIXI.spine.Spine(this.res[this.lightSpineName].spineData);
        this.lightStar.position.set(37.80634360986528, 37.550228996097076);
    }
});
/**
 * @class BigMath_GuideHand
 * @extends BaseContainer
 * @classdesc ???????????????????????????
 * @property {Object} origin - ???????????????????????? - ????????????{x:500,y:960}
 * @property {Object} destination - ???????????????????????? - ????????????{x:1400,y:500}
 * @property {Boolean} isDrag - ????????????????????? - ????????????true ??????????????????
 * @property {String} spineName - ?????????????????? - ????????????"animation_hand_guide"
 * @property {String} clickAniName - ???????????????????????? - ????????????"zhiyin"
 * @property {String} dragAniName1 - ?????????????????????????????? - ????????????"start"
 * @property {String} dragAniName2 - ?????????????????????????????? - ????????????"end"

 *
 * @example
 * import {Easy} from "pubtool4pixi"
 * Easy.create("BigMath_GuideHand",{
 *origin : {
 *     x : 500,
 *     y : 960
 *},
 *}).show();
 * */
Easy.define("BigMath_GuideHand", {
    spineName: "animation_hand_guide",
    clickAniName: "click",
    dragAniName1: "start",
    dragAniName2: "end",
    origin: {
        x: 500,
        y: 960
    },
    destination: {
        x: 1400,
        y: 500
    },
    isDrag: true,
    /**
     * @function init
     * @memberOf BigMath_GuideHand
     * @description ????????????????????????
     * */
    init() {
        this.hand = new PIXI.spine.Spine(this.res[this.spineName].spineData);
        this.addChild(this.hand);
        this.isDrag === true ? this.Start() : this.Click();
    },
    /**
     * @function Click
     * @memberOf BigMath_GuideHand
     * @description ??????????????????
     * */
    Click() {
        this.hand.setAniLoop(this.clickAniName);
    },
    /**
     * @function Start
     * @memberOf BigMath_GuideHand
     * @description ????????????????????????
     * */
    Start() {
        this.hand.position.set(this.origin.x, this.origin.y);
        this.hand.setAni(this.dragAniName1);
        this.hand.addEventOnce("onAniEnd", () => {
            this.Move();
        });
    },
    /**
     * @function Move
     * @memberOf BigMath_GuideHand
     * @description ????????????????????????
     * */
    Move() {
        this.Tw = TweenMax.to(this.hand, 1, {
            delay: 0.3,
            x: this.destination.x,
            y: this.destination.y,
            onComplete: () => {
                if (this.hand.x === this.destination.x && this.hand.y === this.destination.y) {
                    this.End();
                }
            }
        });
    },
    /**
     * @function End
     * @memberOf BigMath_GuideHand
     * @description ????????????????????????
     * */
    End() {
        this.hand.setAni(this.dragAniName2);
        this.hand.addEventOnce("onAniEnd", () => {
            this.Start();
        });
    },
    /**
     * @function deleteHand
     * @memberOf BigMath_GuideHand
     * @description ??????????????????????????????????????????TweenMax
     * */
    deleteHand() {
        this.removeChildren();
        this.Tw && this.Tw.pause(0);
    }
});
/**
 * @class BigMath_Timer
 * @extends BaseContainer
 * @classdesc ???????????????????????????.
 * @property {string} timerEndSound ???????????????????????????????????????~????????????????????????audio_ ??????timerEndSound
 * @property {number} endSoundPercentage ????????????????????????????????????????????????~??? ??????0.3
 * @property {boolean} playEndSound ???????????????????????????????????????????????????~???
 * @property {string}  timeSprite - ??????????????????????????? - ?????????image-gameScene_timer
 * @property {object}  textConfig - ?????????????????????
 * @property {string}  timeCountSound -???????????????
 * @property {number}  textConfig.x - ????????????x - ?????????205.45745125612848
 * @property {number}  textConfig.y - ????????????y - ?????????67.41621621621623
 * @property {object}  textConfig.textStyle - ???????????? - ?????????{
            fontSize: 55,
            fill: 0x204931,
            fontFamily: "Microsoft Yahei",
            fontWeight: "bold",
            breakWords: true,
            wordWrap: true,
            wordWrapWidth: 1120
        }

 * @example
 * import {Easy} from "pubtool4pixi"
 * let timer = Easy.create("BigMath_Timer",{
 *   parentContainer:stage
 * });
 * timer.show();
 * timer.start(800);
 * timer.addEventOnce("timeup",()=>{
 *     console.log("timeup");
 * });
 * setTimeout(()=>{
 *     timer.stop();
 * },1000);
 *
 * */
Easy.define("BigMath_Timer", {
    timeSprite: "image-gameScene_timer",
    timeCountSound: null,
    timerEndSound: "timerEndSound",
    endSoundPercentage: 0.3,
    playEndSound: true,
    textConfig: {
        x: 205.45745125612848,
        y: 67.41621621621623,
        textStyle: {
            fontSize: 55,
            fill: 0x204931,
            fontFamily: "Microsoft Yahei",
            fontWeight: "bold",
            breakWords: true,
            wordWrap: true,
            wordWrapWidth: 1120
        }
    },
    init() {
        this.bg && this.bg.destroy({
            children: true
        });
        this.bg = new Sprite(this.res[this.timeSprite].texture);
        this.text = new Text("", this.textConfig.textStyle);
        this.text.anchor.set(0.5);
        this.text.position.set(this.textConfig.x, this.textConfig.y);
        this.addChild(this.bg, this.text);
    },
    setText(text) {
        if (text === "") {
            this.text.text = "";
            return;
        }
        text = parseInt(text);
        let second = text % 60;
        let min = parseInt(parseInt(text) / 60);
        if (second < 10) {
            second = "0" + second;
        }
        if (min < 10) {
            min = "0" + min;
        }
        this.text.text = min + ":" + second;
    },
    _setWarningTextStyle() {
        this.text.style.fill = 0xFF0000;
    },
    _setNormalTextStyle() {
        this.text.style.fill = this.textConfig.textStyle.fill;
    },
    textTwinkle() {
        clearInterval(this.twinkleInterval);
        let fn = this.getAniFun("linear", 0, 1, 500);
        let isReverse = false;
        let time = new Date().getTime();
        let count = 0;
        this.twinkleInterval = setInterval(() => {
            let dt = new Date().getTime() - time;
            if (dt > 500) {
                isReverse = !isReverse;
                count++;
                dt = dt % 500;
                if (count > 6) {
                    clearInterval(this.twinkleInterval);
                    this._setWarningTextStyle();
                }
                time = new Date().getTime();
            }

            if (isReverse) {
                dt = 500 - dt;
                this.text.alpha = fn(dt);
            } else {
                this.text.alpha = fn(dt);
            }
        });
    },
    _setDefaultPara() {
        clearInterval(this.interval);
        this.setText("");
        this._setNormalTextStyle();
        this.interval = null;
        this.startTime = null;
        this.currentTimeLength = null;
        this.aPauseTime = [];
        this.aRewindTime = [];
        this.isPause = false;
        this.isPlay = false;
        this.isEndPlay = false;
        this.pauseBeginTime = null;
    },
    _onTimeRun() {
        if (this.isPause) {
            return;
        }
        let dt = new Date().getTime() - this.startTime;
        let pauseTime = 0;
        this.aPauseTime.forEach(item => { pauseTime += item; });
        this.aRewindTime.forEach(item => { pauseTime -= item; });
        dt -= pauseTime;
        this.setText(parseInt((this.currentTimeLength - dt) / 1000));
        if (dt >= this.currentTimeLength) {
            this.setText("");
            this._setDefaultPara();
            /**
             * fired after timer stop.
             * @memberOf BigMath_Timer
             * @event timeup
             */
            this.fireEvent("timeup");
            return;
        }
        if (this.currentTimeLength - dt <= 5000 && !this.isPlay) {
            this.isPlay = true;
            if (this.timeCountSound) {
                this.playSound(this.timeCountSound);
            }
        }
        if (this.playEndSound && 1 - dt / this.currentTimeLength < this.endSoundPercentage && !this.isEndPlay) {
            this.isEndPlay = true;
            this.playSound(this.timerEndSound);
            this.textTwinkle();
        }
        /**
         * fired while timer run.
         * @memberOf BigMath_Timer
         * @event onTimeRun
         * @property {number} timeleft
         */
        this.fireEvent("onTimeRun", [parseInt((this.currentTimeLength - dt) / 1000)]);
    },
    /**
     * ????????????
     * @function start
     * @memberOf BigMath_Timer
     * @param {number} ????????????????????????
     */
    start(time) {
        this._setDefaultPara();
        this.startTime = new Date().getTime();
        this.currentTimeLength = time * 1000;
        this.interval = setInterval(this._onTimeRun.bind(this), 16);
    },
    /**
     * ????????????
     * @function stop
     * @memberOf BigMath_Timer
     */
    stop() {
        this._setDefaultPara();
    },
    /**
     * ????????????
     * @function pause
     * @memberOf BigMath_Timer
     */
    pause() {
        if (this.pauseBeginTime === null) {
            this.pauseBeginTime = new Date().getTime();
            this.isPause = true;
        }
    },
    /**
     * ????????????
     * @function continue
     * @memberOf BigMath_Timer
     */
    continue() {
        if (this.isPause) {
            this.isPause = false;
            this.aPauseTime.push(new Date().getTime() - this.pauseBeginTime);
            this.pauseBeginTime = null;
        }
    },
    /**
     * ??????
     * @function rewind
     * @memberOf BigMath_Timer
     * @param {number} ??????????????????????????????
     */
    rewind(time) {
        this.aPauseTime.push(time * 1000);
    },
    /**
     * ??????
     * @function rewind
     * @memberOf BigMath_Timer
     * @param {number} ??????????????????????????????
     */
    forward(time) {
        this.aRewindTime.push(time * 1000);
    }
});
/**
 * @class BigMath_AniBtn
 * @extends BaseContainer
 * @classdesc ?????????????????????????????????????????????.
 * @property {string}  imgBtnName - ???????????????????????? - ?????????image_startGame
 * @property {string}  aniBtnName - ?????????????????? - ?????????animation_btn
 * @property {string}  aniBtnAniName - ??????????????????????????? - ?????????animation
 * @example
 * import {Easy} from "pubtool4pixi"
 * let aniBtn = Easy.create("BigMath_AniBtn",{
 *     parentContainer:stage
 * });
 * aniBtn.show();
 *
 * */
Easy.define("BigMath_AniBtn", {
    imgBtnName: "image_startGame",
    aniBtnName: "animation_btn",
    aniBtnAniName: "animation",
    init() {
        this.addEventOnce("Destroyed", () => {
            Btn1.Destroy();
            this.Btn = null;
        });
        let Btn1 = Easy.create("normalBtn", {
            parentContainer: this,
            ClickSprite: { name: this.imgBtnName },
        });
        Btn1.addEventOnce("onClick", () => {
            /**
             * Fire when btn clicked.
             * @memberOf BigMath_AniBtn
             * @event onClick
             */
            this.fireEvent("onClick");
        });
        Btn1.show();
        Btn1.position.set(-0.5 * Btn1.Width, -0.5 * Btn1.Height);
        Btn1.on("pointermove", (e) => {
            if (Btn1.range.containsPoint(e.data.global)) {
                this.Btn.renderable = false;
                Btn1.range.Sprite.renderable = true;
            } else {
                this.Btn.renderable = true;
                Btn1.range.Sprite.renderable = false;
            }
        });
        Btn1.on("pointerupoutside", () => {
            this.Btn.renderable = true;
            Btn1.range.Sprite.renderable = false;
        });
        Btn1.on("pointercancel", () => {
            this.Btn.renderable = true;
            Btn1.range.Sprite.renderable = false;
        });
        Btn1.on("pointerup", () => {
            this.Btn.renderable = true;
            Btn1.range.Sprite.renderable = false;
        });
        this.Btn = new PIXI.spine.Spine(this.res[this.aniBtnName].spineData);
        this.Btn.setAniLoop(this.aniBtnAniName);
        // Easy.moveInterface(this.Btn);
        this.addChild(this.Btn);
        this.Btn.renderable = true;
        Btn1.range.Sprite.renderable = false;
    }
});

/**

 * @class PUB_Mask
 *
 * @extends BaseContainer

 * @classdesc ????????????.

 * @example
 * import {Easy} from "pubtool4pixi"
 * Easy.create("PUB_Mask",{
 *     parentContainer:stage
 * }).show();

 */
Easy.define("PUB_Mask", {
    isSlow: true,
    init() {
        this.graphics1 && this.graphics1.destroy({
            children: true
        });
        let graphics1 = this.graphics1 = new PIXI.Graphics();
        graphics1.beginFill(0x000000, 0.5);
        graphics1.drawRect(0, 0, 1920, 1080);
        graphics1.interactive = true;
        graphics1.on("pointermove", (e) => {
            e.stopped = true;
        });
        this.addChild(graphics1);
    }
});

/**
 * @class Preschool_HintBtn

 * @extends BaseContainer

 * @classdesc ??????????????????,???????????????????????????.

 * @property {boolean} updateBool - ????????????????????? ???????????????- ?????????true
 * @property {boolean} soundOne   - true????????????false????????? ??????????????? - ?????????true
 * @property {string}  name       - ???????????? - ?????????animation_aniu
 * @property {string}  AniName    - ???????????????????????? - ?????????wenhao
 * @property {string}  AniName2   - ???????????????????????????????????? - ?????????yinyue
 * @property {string}  audio      - ?????????????????? - ?????????audio_hint
 * @property {number}  x1         - ??????x????????? - ?????????1778.6915887850466
 * @property {number}  y1         - ??????y????????? - ?????????24.672897196261676

 * @example
 * import {Easy} from "pubtool4pixi"
 * Easy.create("Preschool_HintBtn",{
 *   parentContainer:this,
 *   name:'animation_aniu',
 *   AniName:'wenhao',
 *   AniName2:'yinyue',
 *   audio:'audio_hint',
 *   x1:1778.6915887850466,
 *   y1:24.672897196261676,
 * }).show();
 *
 * */
Easy.define('Preschool_HintBtn', {
    updateBool: true,
    soundOne: true,
    name: 'animation_aniu',
    AniName: 'wenhao',
    AniName2: 'yinyue',
    audio: 'audio_hint',
    x1: 1778.6915887850466,
    y1: 24.672897196261676,
    init() {
        this.music = new PIXI.spine.Spine(res[this.name].spineData);
        this.music.state.setAnimation(0, this.AniName, true);
        this.music.position.set(this.x1, this.y1);
        this.music.buttonMode = true;
        this.music.interactive = true;
        this.music.on('pointerdown', () => {
            this.update();
        });
        this.addChild(this.music)
    },
    update() {
        if (this.updateBool) {
            this.updateBool = false;
            this.music.state.setAnimation(0, this.AniName2, true);
            if (this.soundOne === true) {
                this.soundOne = false;
                PIXI.sound.play(this.audio, {
                    loop: false, complete: () => {
                        this.soundOne = true;
                        this.updateBool = true;
                        this.music.state.setAnimation(0, this.AniName, true);
                    }
                });
            } else {
                PIXI.sound.resume(this.audio);
                this.music.state.timeScale = 1;
            }
        } else {
            this.music.state.timeScale = 0;
            this.updateBool = true;
            PIXI.sound.pause(this.audio);
        }
    },
    stop() {
        this.music.state.setAnimation(0, this.AniName, true);
        this.music.state.timeScale = 0;
        PIXI.sound.stop(this.audio);
    }
});

/**

 * @class Preschool_Start
 *
 * @extends BaseContainer

 * @classdesc ???????????????????????????.

 * @property {object} bgConfig ?????????????????????
 * @property {string} bgConfig.name ??????Json?????? ?????????animation_starscreen
 * @property {string} bgConfig.AniName ???????????????????????? ?????????idle
 * @property {string} bgConfig.AniName2 ???????????????????????? ?????????touch
 * @property {number} bgConfig.x ??????x??????????????? ?????????961
 * @property {number} bgConfig.y ??????y??????????????? ?????????860
 * @property {string} audioClick ???????????? ?????????aodio_click

 * @property {object} btnConfig ?????????????????????
 * @property {string} btnConfig.name ??????Json?????? ?????????animation_starscreen
 * @property {string} btnConfig.AniName ???????????????????????? ?????????idle
 * @property {string} btnConfig.AniName2 ???????????????????????? ?????????touch
 * @property {number} btnConfig.x ??????x??????????????? ?????????950
 * @property {number} btnConfig.y ??????y??????????????? ?????????860

 * @example
 * import {Easy} from "pubtool4pixi"
 * Easy.create("Preschool_Start",{
 *     parentContainer:stage,
 *     bgConfig:{
 *         name:"animation_start",
 *         AniName:"idle",
 *         AniName2:"touch",
 *         x:500,
 *         y:600
 *     }
 * }).show();
 *  Easy.create("Preschool_Start",{
 *     parentContainer:stage,
 *     btnConfig:{
 *         name:"animation_start",
 *         AniName:"idle",
 *         AniName2:"touch",
 *         x:500,
 *         y:600
 *     }
 * }).show();

 */
Easy.define('Preschool_Start', {
    audioClick: 'audio_click',
    bgConfig: {
        name: "animation_starscreen",
        AniName: "idle",
        AniName2: "touch",
        x: 961.7943925233644,
        y: 541.9065420560748
    },
    btnConfig: {
        name: "animation_btn",
        AniName: "idle",
        AniName2: "touch",
        x: 950,
        y: 860
    },
    init() {
        let startBg = new PIXI.spine.Spine(res[this.bgConfig.name].spineData);
        startBg.state.setAnimation(0, this.bgConfig.AniName, true);
        startBg.position.set(this.bgConfig.x, this.bgConfig.y)
        let startBtn = new PIXI.spine.Spine(res[this.btnConfig.name].spineData);
        startBtn.state.setAnimation(0, this.btnConfig.AniName, true);
        startBtn.interactive = true;
        startBtn.buttonMode = true;
        startBtn.position.set(this.btnConfig.x, this.btnConfig.y)
        this.addChild(startBg, startBtn)
        startBtn.on('pointerdown', () => {
            startBtn.interactive = false;
            PIXI.sound.play(this.audioClick, { loop: false })
            startBtn.state.setAnimation(0, this.bgConfig.AniName2, false);
            startBg.state.setAnimation(0, this.btnConfig.AniName2, false);
            let listeners = {
                complete: () => {
                    startBg.state.removeListener(listeners);
                    setTimeout(() => {
                        this.destroy({
                            children: true
                        });
                        /**
                         * Fire when game started.
                         * @memberOf Preschool_Start
                         * @event startGame
                         */
                        this.fireEvent('startGame')
                    });
                }
            };
            startBg.state.addListener(listeners);
        })
    }
});

/**
 * @class Preschool_End
 *
 * @extends BaseContainer

 * @classdesc ???????????????????????????.

 * @property {object} bgConfig ?????????????????????
 * @property {string} bgConfig.name ??????Json?????? ?????????animation_starscreen
 * @property {string} bgConfig.AniName ???????????????????????? ?????????idle
 * @property {string} bgConfig.AniName2 ???????????????????????? ?????????touch
 * @property {number} bgConfig.x ??????x??????????????? ?????????961
 * @property {number} bgConfig.y ??????y??????????????? ?????????860

 * @property {object} soundConfig ?????????????????????
 * @property {string} soundConfig.name1 ????????????????????? ?????????come_high_five
 * @property {string} soundConfig.name2 ????????????????????? ?????????high_five



 * @example
 * import {Easy} from "pubtool4pixi"
 * Easy.create("Preschool_End",{
 *      parentContainer:Game,
        bgConfig:{
            name:"animation_give_me_five",
            AniName:"talk",
            AniName2:"idle",
            AniName3:"touch",
            x:960,
            y:540
        },
    soundConfig:{
        name1  : "come_high_five",
        name2:"high_five",
    },
 * }).show();
 *
 *
 *  Easy.getCmp("Preschool_End").addEventOnce("gameOver,()=>{
 *      //????????????
 *  }")
 *
 */
Easy.define("Preschool_End", {
    bgConfig: {
        name: "animation_give_me_five",
        AniName: "talk",
        AniName2: "idle",
        AniName3: "touch",
        x: 960,
        y: 540
    },
    soundConfig: {
        name1: "come_high_five",
        name2: "high_five",
    },
    isSlow: true,
    init() {
        this.addEvent("beforeShow", () => {
            PIXI.sound.stopAll();
            // PIXI.sound.pause();
            // PIXI.sound.resume()
            this.playSound(this.soundConfig.name1);
        });
        let graphics1 = this.graphics1 = new PIXI.Graphics();
        graphics1.beginFill(0x000000, 0.5);
        graphics1.drawRect(0, 0, 1920, 1080);
        graphics1.interactive = true;
        graphics1.on("pointermove", (e) => {
            e.stopped = true;
        });
        this.addChild(graphics1);
        let High_five_doll = new PIXI.spine.Spine(this.res[this.bgConfig.name].spineData);
        High_five_doll.position.set(960, 540);
        High_five_doll.interactive = true;
        High_five_doll.buttonMode = true;
        this.addChild(High_five_doll);
        High_five_doll.setAni(this.bgConfig.AniName);
        // High_five_doll.state.setAnimation(0, this.bgConfig.AniName, false);


        let mmm = High_five_doll.addEventOnce("onAniEnd", () => {
            High_five_doll.setAniLoop(this.bgConfig.AniName2);
        });

        High_five_doll.on("pointerup", () => {

            High_five_doll.interactive = false;
            High_five_doll.buttonMode = false;
            mmm && mmm.cancel();
            // console.log(PIXI.sound.find("audio_"+this.come_high_five));
            this.stopPlay(this.soundConfig.name1);
            this.playSound(this.soundConfig.name2, false, {
                complete: () => {
                    /**
                     * Fire when gameOver.
                     * @memberOf Preschool_End
                     * @event gameOver
                     */
                    this.fireEvent("gameOver");
                }
            });
            High_five_doll.setAni(this.bgConfig.AniName3);
        });
    },

});

/**
 * @class Preschool_aqiu

 * @extends BaseContainer

 * @classdesc ???????????????????????????.

 * @property {string}   name        - ???????????? - ?????????animation_aqiu
 * @property {string}  AniTalk      - ???????????????????????? - ?????????talk
 * @property {string}  AniIdle      - ???????????????????????? - ?????????idle
 * @property {string}  AniWrong     - ???????????????????????? - ?????????wrong
 * @property {string}  AniQtWin     - ???????????????????????? - ?????????right_1
 * @property {string}  AniWin       - ???????????????????????? - ?????????right_2
 * @property {array}  audioRead    - ?????????????????? - ?????????[audio_readTopic]
 * @property {array}  audioQtWin   - ???????????????????????? - ?????????[audio_questionsWin]
 * @property {array}  audioQtLose  - ???????????????????????? - ?????????[audio_questionsLose]
 * @property {array}  audiowin     - ???????????????????????? - ?????????[audio_Win]
 * @property {number}  x1           - ??????x????????? - ?????????262.4299065420561
 * @property {number}  y1           - ??????y????????? - ?????????677.3831775700934


 * @example
 * import {Easy} from "pubtool4pixi"
 * Easy.create("Preschool_aqiu",{
 *   parentContainer:this,
 *   name:'animation_aqiu',
 *   AniTalk:'talk',
 *   AniIdle:'idle',
 *   audioLose:'audio_questionsLose',
 *   x1:262.4299065420561,
 *   y1:677.3831775700934,
 * }).show();
 *
 * */
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}
Easy.define('Preschool_aqiu', {
    name: 'animation_aqiu',
    AniTalk: 'talk',
    AniIdle: 'idle',
    AniWrong: 'wrong',
    AniQtWin: "right_1",
    AniWin: "right_2",
    audioRead: ['audio_readTopic'],
    audioQtWin: ['audio_questionsWin'],
    audioQtLose: ['audio_questionsLose'],
    audioWin: ['audio_win'],
    x1: 262.4299065420561,
    y1: 677.3831775700934,
    getRandomName(arr) {
        return arr[parseInt(arr.length * Math.random())];
    },
    init() {
        if (!isArray(this.audioRead)) {
            let item = this.audioRead;
            this.audioRead = [item];
        }
        if (!isArray(this.audioQtWin)) {
            let item = this.audioQtWin;
            this.audioQtWin = [item];
        }
        if (!isArray(this.audioQtLose)) {
            let item = this.audioQtLose;
            this.audioQtLose = [item];
        }
        if (!isArray(this.audioWin)) {
            let item = this.audioWin;
            this.audioWin = [item];
        }
        this.aqiu = new PIXI.spine.Spine(res[this.name].spineData);
        this.aqiu.state.setAnimation(0, this.AniTalk, true);
        this.aqiu.position.set(this.x1, this.y1);
        this.addChild(this.aqiu);
        PIXI.sound.play(this.getRandomName(this.audioRead), {
            loop: false, complete: () => {
                this.aqiu.state.setAnimation(0, this.AniIdle, true);
                this.aqiu.buttonMode = true;
                this.aqiu.interactive = true;
            }
        });
        this.aqiu.on('pointerdown', () => {
            this.talk();
            this.aqiu.interactive = false;
        })
    },
    /**
     * @function talk
     * @memberOf Preschool_aqiu
     * @description ??????????????????
     * @return {Promise} ??????????????????resolve
     */
    talk() {
        return new Promise((resolve) => {
            this.aqiu.state.clearListeners();
            this.aqiu.state.setAnimation(0, this.AniTalk, true);
            PIXI.sound.play(this.getRandomName(this.audioRead), {
                loop: false, complete: () => {
                    this.aqiu.state.setAnimation(0, this.AniIdle, true);
                    this.aqiu.interactive = true;
                    resolve();
                }
            });
        });
    },
    stop() {
        this.aqiu.interactive = true;
        this.audioRead.forEach((item) => {
            PIXI.sound.stop(item);
        });
        this.audioQtWin.forEach((item) => {
            PIXI.sound.stop(item);
        });
        this.audioQtLose.forEach((item) => {
            PIXI.sound.stop(item);
        });
    },
    /**
     * @function questionsWin
     * @memberOf Preschool_aqiu
     * @description ????????????????????????????????????
     * @return {Promise} ??????????????????resolve
     */
    questionsWin() {
        return new Promise((resolve) => {
            this.aqiu.state.clearListeners();
            this.stop();
            this.aqiu.interactive = false;
            this.aqiu.state.setAnimation(0, this.AniQtWin, false);
            let listeners = {
                complete: () => {
                    this.aqiu.state.removeListener(listeners);
                    this.aqiu.state.setAnimation(0, this.AniIdle, true)
                }
            };
            this.aqiu.state.addListener(listeners)
            PIXI.sound.play(this.getRandomName(this.audioQtWin), {
                loop: false, complete: () => {
                    this.aqiu.interactive = true;
                    resolve();
                }
            })
        });
    },
    /**
     * @function questionsLose
     * @memberOf Preschool_aqiu
     * @description ????????????????????????????????????
     * @return {Promise} ??????????????????resolve
     */
    questionsLose() {
        return new Promise((resolve) => {
            this.aqiu.state.clearListeners();
            this.stop();
            this.aqiu.interactive = false;
            this.aqiu.state.setAnimation(0, this.AniWrong, false);
            let listeners = {
                complete: () => {
                    this.aqiu.state.removeListener(listeners);
                    this.aqiu.state.setAnimation(0, this.AniIdle, true);
                }
            };
            this.aqiu.state.addListener(listeners);
            PIXI.sound.play(this.getRandomName(this.audioQtLose), {
                loop: false, complete: () => {
                    this.aqiu.interactive = true;
                    resolve();
                }
            })
        })
    },
    /**
     * @function win
     * @memberOf Preschool_aqiu
     * @description ????????????????????????????????????
     * @return {Promise} ??????????????????resolve
     */
    win() {
        return new Promise((resolve) => {
            this.stop();
            this.aqiu.state.clearListeners();
            this.aqiu.setAni(this.AniWin)
            this.aqiu.state.setAnimation(0, this.AniWin, false);
            this.aqiu.state.addListener({
                complete: () => {
                    this.aqiu.state.setAnimation(0, this.AniTalk, true);
                }
            })
            PIXI.sound.play(this.getRandomName(this.audioWin), {
                loop: false, complete: () => {
                    this.aqiu.state.setAnimation(0, this.AniIdle, true);
                    this.aqiu.state.timeScale = 0;
                    resolve();
                }
            })
        })
    }
});
Easy.define("PUB_Spine", {
    animationName: "",
    init() {
        this.spine = new PIXI.spine.Spine(this.res[this.animationName].spineData);
        this.addChild(this.spine);
        this.isPlaying = false;
        this.currentPlaying = null;
    },
    playAni(name) {
        return new Promise((resolve) => {
            this.spine.state.setAnimation(0, name, false);
            this.interval = setInterval(() => {
                this.fireEvent("onAni");
            });
            let me = this;
            let listeners = {
                complete: function (track, event) {
                    setTimeout(() => {
                        me.currentPlaying.cancel();
                        me.currentPlaying = null;
                        setTimeout()
                        me.fireEvent("onAniEnd", [track]);
                        resolve();
                    });
                }
            };
            this.state.addListener(listeners);
            this.currentPlaying = {
                cancel() {
                    clearInterval(me.interval);
                    me.state.removeListener(listeners);
                }
            };
        });
    },
    playAniList(aList) {
        this.isPlaying = true;
        let count = -1;
        let me = this;
        function play() {
            if (me.isPlaying) {

            }
        }
    },
});
Easy.define("BigMath_Welcome", {
    bgName: "image-welcome_bg",
    titleConfig: {
        name: "animation_welcome_title",
        idleName: "idle",
        inName: "in",
        x: 0,
        y: 0
    },
    AniBtnConfig: {
        imgBtnName: "image_startGame",
        aniBtnName: "animation_welcome_btn",
        aniBtnAniName: "idle",
        x: 0,
        y: 0
    },
    init() {
        this.bg = new Sprite(this.res[this.bgName].texture);
        this.addChild(this.bg);
        Easy.create("muteBtn", {
            parentContainer: this
        }).show();
        this.title = new PIXI.spine.Spine(this.res[this.titleConfig.name].spineData);
        this.addChild(this.title);
        this.title.position.set(this.titleConfig.x, this.titleConfig.y);
        this.addEvent("beforeShow", () => {
            this.beforeShow();
        });
    },
    beforeShow() {
        this.title.setAni(this.titleConfig.inName);
        this.title.addEventOnce("onAniEnd", () => {
            this.title.setAniLoop(this.titleConfig.idleName);
        });
    }
});
export default easy;