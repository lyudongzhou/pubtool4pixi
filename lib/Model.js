"use strict";

var _Timmer = require("./Timmer");

var _easy = require("./easy");

var _easy2 = _interopRequireDefault(_easy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Container = PIXI.Container;
var Sprite = PIXI.Sprite;
var Text = PIXI.Text;

var Easy = _easy2.default;
Easy.define("Timer", {
    timeSprite: "image-gameScene_timer",
    textPosition: {
        x: 205.45745125612848,
        y: 67.41621621621623
    },
    init: function init() {
        this.bg && this.bg.destroy({
            children: true
        });
        this.bg = new Sprite(this.res[this.timeSprite].texture);
        this.text = new Text("", {
            fontSize: 55,
            fill: 0x204931,
            fontFamily: "Microsoft Yahei",
            fontWeight: "bold",
            breakWords: true,
            wordWrap: true,
            wordWrapWidth: 1120
        });
        this.text.anchor.set(0.5);
        this.text.position.set(this.textPosition.x, this.textPosition.y);
        this.addChild(this.bg, this.text);
    },
    setText: function setText(text) {
        if (text === "") {
            this.text.text = "";
            return;
        }
        text = parseInt(text);
        var second = text % 60;
        var min = parseInt(parseInt(text) / 60);
        if (second < 10) {
            second = "0" + second;
        }
        if (min < 10) {
            min = "0" + min;
        }
        this.text.text = min + ":" + second;
    },
    start: function start(time) {
        var _this = this;

        var date = new Date().getTime();
        this.setText(time);
        var Time = time * 1000;
        var isPlay = false;
        this.interval = (0, _Timmer.setInterval)(function () {
            var dt = new Date().getTime() - date;
            _this.setText(parseInt((Time - dt) / 1000));
            if (Time - dt <= 5000 && !isPlay) {
                isPlay = true;
                // this.playSound("timeup");
            }
            _this.fireEvent("onTimeRun", [parseInt((Time - dt) / 1000)]);
            if (dt >= Time) {
                _this.setText("");
                (0, _Timmer.clearInterval)(_this.interval);
                _this.fireEvent("timeup");
            }
        }, 16);
    },
    stop: function stop() {
        (0, _Timmer.clearInterval)(this.interval);
        this.setText("");
    }
});
Easy.define("AniBtn", {
    imgBtnName: "image_startGame",
    aniBtnName: "animation_btn",
    aniBtnAniName: "animation",
    init: function init() {
        var _this2 = this;

        this.addEventOnce("Destroyed", function () {
            Btn1.Destroy();
            _this2.Btn = null;
        });
        var Btn1 = Easy.create("normalBtn", {
            parentContainer: this,
            ClickSprite: { name: this.imgBtnName }
        });
        Btn1.addEventOnce("onClick", function () {
            _this2.fireEvent("onClick");
        });
        Btn1.show();
        Btn1.position.set(-0.5 * Btn1.Width, -0.5 * Btn1.Height);
        Btn1.on("pointermove", function (e) {
            if (Btn1.range.containsPoint(e.data.global)) {
                _this2.Btn.renderable = false;
                Btn1.range.Sprite.renderable = true;
            } else {
                _this2.Btn.renderable = true;
                Btn1.range.Sprite.renderable = false;
            }
        });
        this.Btn = new PIXI.spine.Spine(this.res[this.aniBtnName].spineData);
        this.Btn.setAniLoop(this.aniBtnAniName);
        // Easy.moveInterface(this.Btn);
        this.addChild(this.Btn);
        this.Btn.renderable = true;
        Btn1.range.Sprite.renderable = false;
    }
});
Easy.define("DragContainer", {
    addDragItems: function addDragItems(aItem) {
        this.items.push.apply(this.items, aItem);
    },
    addTargetItems: function addTargetItems(aItem) {
        this.aTarget.push.apply(this.aTarget, aItem);
    },
    removeDragItems: function removeDragItems() {
        while (this.items.length) {
            this.items.pop();
        }
    },
    removeTargetItems: function removeTargetItems() {
        while (this.aTarget.length) {
            this.aTarget.pop();
        }
    },
    getDistance: function getDistance(a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    },
    init: function init() {
        var _this3 = this;

        this.items = [];
        this.aTarget = [];
        this.graphics1 && this.graphics1.destroy({
            children: true
        });
        this.addEventOnce("Destroyed", function () {
            graphics1.destroy();
        });
        var graphics1 = this.graphics1 = new PIXI.Graphics();
        graphics1.beginFill(0x000000, 0);
        graphics1.drawRect(0, 0, 1920, 1080);
        graphics1.interactive = true;
        var dragItem = null;
        var startPoint = null;
        var minDist = 1920;
        this.addEvent("beforeDrag", function () {
            stage.addChild(_this3);
        });
        this.addEvent("afterDrag", function () {
            _this3.parentContainer.addChild(_this3);
        });
        graphics1.on("pointerdown", function (e) {
            if (dragItem) {
                dragItem.fireEvent("DragCancel");
                dragItem.fireEvent("afterDrag");
                dragItem = null;
                startPoint = null;
            }
            minDist = 1920;
            for (var i = 0; i < _this3.items.length; i++) {
                var item = _this3.items[i];
                if (item.allowDrag === false) {
                    continue;
                }
                if (item.containsPoint(e.data.global)) {
                    var d = _this3.getDistance(item.getGlobalPosition(), e.data.global);
                    if (d < minDist) {
                        minDist = d;
                        dragItem = _this3.items[i];
                        startPoint = dragItem.toLocal(e.data.global, stage);
                        dragItem.fireEvent("beforeDrag", [e.data.global]);
                    }
                }
            }
            minDist = 1920;
        });
        var currentoverTarget = null;
        graphics1.on("pointermove", function (e) {
            var TargetItem = null;
            if (dragItem) {
                var p = dragItem.parent.toLocal(e.data.global, stage);
                dragItem.position.set(p.x - startPoint.x, p.y - startPoint.y);
                dragItem.fireEvent("Dragging", [e.data.global]);

                minDist = 1920;
                for (var i = 0; i < _this3.aTarget.length; i++) {
                    var item = _this3.aTarget[i];
                    if (item.containsPoint(e.data.global)) {
                        var d = _this3.getDistance(item.getGlobalPosition(), e.data.global);
                        if (d < minDist) {
                            TargetItem = item;
                            minDist = d;
                        }
                    }
                }
                if (TargetItem) {
                    TargetItem.fireEvent("DragOver");
                }
            }
            if (TargetItem !== currentoverTarget) {
                if (currentoverTarget) {
                    currentoverTarget.fireEvent("dragOverCancel");
                }
                currentoverTarget = TargetItem;
            }
        });
        graphics1.on("pointerup", function (e) {
            if (!dragItem) {
                return;
            }
            var TragetItem = null;
            minDist = 1920;
            for (var i = 0; i < _this3.aTarget.length; i++) {
                var item = _this3.aTarget[i];
                if (item.containsPoint(e.data.global)) {
                    var d = _this3.getDistance(item.getGlobalPosition(), e.data.global);
                    if (d < minDist) {
                        TragetItem = item;
                        minDist = d;
                    }
                }
            }
            if (TragetItem) {
                TragetItem.fireEvent("DragIn", [dragItem]);
                dragItem.fireEvent("DragTo", [TragetItem]);
            } else {
                dragItem.fireEvent("DragCancel");
            }
            dragItem.fireEvent("afterDrag", [e.data.global]);
            dragItem = null;
            startPoint = null;
        });
        graphics1.on("pointerupoutside", function () {
            if (!dragItem) {
                return;
            }
            dragItem.fireEvent("DragCancel");
            dragItem.fireEvent("afterDrag");
            dragItem = null;
            startPoint = null;
        });
        this.addChild(graphics1);
    }
});
Easy.define("DragItem", {
    init: function init() {
        var gra = this.gra = new PIXI.Graphics();
        gra.beginFill(0x888888);
        gra.drawCircle(0, 0, 100);
        this.addChild(gra);
    },
    containsPoint: function containsPoint(point) {
        return this.gra.containsPoint(point);
    }
});
Easy.define("Hand", {
    type: "",
    init: function init() {
        var _this4 = this;

        this._direction = "left";
        this.aDirection = ["left", "right", "middle"];
        Object.defineProperties(this, {
            direction: {
                get: function get() {
                    return this._direction;
                },
                set: function set(para) {
                    if (this.aDirection.indexOf(para) !== -1) {
                        this._direction = para;
                    } else {
                        this._direction = "left";
                        console.log("typeErr");
                    }
                    this.fireEvent("directionChange", [para]);
                }
            }
        });
        this.addEvent("directionChange", function (para) {
            _this4.textureName = "pub_hand" + para;
            _this4.bg.texture = _this4.res[_this4.textureName].texture;
            if (para === "left") {
                _this4.bg.anchor.set(0, 1);
            } else if (para === "right") {
                _this4.bg.anchor.set(1, 1);
            } else {
                _this4.bg.anchor.set(0.5, 0);
            }
        });
        this.bg && this.bg.destroy({
            children: true
        });
        this.bg = new Sprite(this.res["pub_handleft"].texture);
        this.addChild(this.bg);
        this.addEvent("onShow", function () {
            switch (_this4.type) {
                case "twinkle":
                    _this4.twinkle();
                    break;
            }
        });
        this.addEvent("onHide", function () {
            switch (_this4.type) {
                case "twinkle":
                    _this4.stopTwinkle();
                    break;
            }
        });
    },
    moveTo: function moveTo(x, y) {
        var _this5 = this;

        this.release();
        this.timeout = (0, _Timmer.setTimeout)(function () {
            _this5.click();
            var dist = Math.sqrt(Math.pow(_this5.x, 2) + Math.pow(_this5.y, 2));
            var time = dist / (_this5.speed || 0.5);
            var oldX = _this5.oldX = _this5.x;
            var oldY = _this5.oldY = _this5.y;
            var fnX = _this5.getAniFun("linear", _this5.x, x, time);
            var fnY = _this5.getAniFun("linear", _this5.y, y, time);
            _this5.timeout = (0, _Timmer.setTimeout)(function () {
                var starttime = new Date().getTime();
                _this5.interval = (0, _Timmer.setInterval)(function () {
                    var dt = new Date().getTime() - starttime;
                    _this5.x = fnX(dt);
                    _this5.y = fnY(dt);
                    if (dt >= time) {
                        (0, _Timmer.clearInterval)(_this5.interval);
                        _this5.release();
                        _this5.timeout = (0, _Timmer.setTimeout)(function () {
                            _this5.x = oldX;
                            _this5.y = oldY;
                            _this5.moveTo(x, y);
                        }, 500);
                    }
                });
            }, 300);
        }, 1000);
    },
    stopMoveTo: function stopMoveTo() {
        this.x = this.oldX;
        this.y = this.oldY;
        (0, _Timmer.clearInterval)(this.interval);
        clearTimeout(this.timeout);
    },
    click: function click() {
        this.bg.texture = this.res[this.textureName + 'click'].texture;
    },
    release: function release() {
        this.bg.texture = this.res[this.textureName].texture;
    },
    stopTwinkle: function stopTwinkle() {
        (0, _Timmer.clearInterval)(this.interval);
        this.release();
    },
    twinkle: function twinkle() {
        var _this6 = this;

        var order = true;
        this.interval = (0, _Timmer.setInterval)(function () {
            if (order) {
                _this6.click();
            } else {
                _this6.release();
            }
            order = !order;
        }, 1000);
    }
});
Easy.define("IntroduceWord", {
    type: 1,
    isSlow: true,
    init: function init() {
        this.bg && this.bg.destroy({
            children: true
        });
        this.bg = new Sprite(this.res["image-gameScene_introduce" + this.type].texture);
        this.addChild(this.bg);
    }
});
Easy.define("IntroduceContainer", {
    init: function init() {
        var _this7 = this;

        this.item = [];
        this.graphics1 && this.graphics1.destroy({
            children: true
        });
        var graphics1 = this.graphics1 = new PIXI.Graphics();
        graphics1.beginFill(0x000000, 0.5);
        graphics1.drawRect(0, 0, 1920, 1080);
        if (this.MaskEvent === false) {
            graphics1.interactive = false;
        } else {
            graphics1.interactive = true;
        }
        graphics1.on("pointermove", function (e) {
            e.stopped = true;
        });
        graphics1.on("pointertap", function () {
            _this7.fireEvent("onClick");
        });
        this.addChild(graphics1);
        // this.addEvent("beforeShow", () => {
        //     this.zIndex = MaskIndex + 1;
        //     Easy.getCmp("Mask").show();
        // });
        // this.addEvent("beforeHide", () => {
        //     this.zIndex = MaskIndex + 1;
        //     Easy.getCmp("Mask").hide();
        // });
        this.handContiner = new Container();
        this.itemContainer = new Container();
        this.addChild(this.itemContainer, this.handContiner);
    },
    allowClick: function allowClick() {
        this.children[0].interactive = true;
    },
    forbidClick: function forbidClick() {
        this.children[0].interactive = false;
    },
    addHand: function addHand() {
        var o = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var hand = Easy.create("Hand", {
            parentContainer: this.handContiner,
            x: o.x,
            y: o.y
        });
        hand.direction = o.direction || "middle";
        hand.speed = o.speed;
        return hand;
    },
    addWord: function addWord(type) {
        return Easy.create("IntroduceWord", {
            type: type,
            parentContainer: this
        });
    },
    copyOriginalPara: function copyOriginalPara(o) {
        o._oldPara = {
            container: o.parent,
            x: o.x,
            y: o.y
        };
    },
    caculatePosition: function caculatePosition(o) {
        return o.parent.toGlobal(o.position);
    },
    addItem: function addItem() {
        var aItem = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        for (var i = 0; i < aItem.length; i++) {
            this.copyOriginalPara(aItem[i]);
            var p = this.caculatePosition(aItem[i]);
            aItem[i].position.set(p.x, p.y);
            this.itemContainer.addChild(aItem[i]);
            this.item.push(aItem[i]);
        }
    },
    releaseAllItem: function releaseAllItem() {
        while (this.item.length) {
            var item = this.item.shift();
            item._oldPara.container.addChild(item);
            item.x = item._oldPara.x;
            item.y = item._oldPara.y;
            delete item._oldPara;
        }
    },
    releaseItem: function releaseItem(item) {
        item._oldPara.container.addChild(item);
        item.x = item._oldPara.x;
        item.y = item._oldPara.y;
        delete item._oldPara;
        this.item.splice(this.item.indexOf(item), 1);
    }
});
Easy.define("ClockSprite", {
    init: function init() {
        var TextMask = new PIXI.Graphics();
        TextMask.beginFill(0x00ff00, 0.5);
        TextMask.drawRect(-5, -5, 10, 10);
        this.bg = new PIXI.Sprite(this.res["gameScene_biao"].texture);
        this.bg.anchor.set(0.5);
        this.clock1 = Easy.create("Min", {
            parentContainer: this
        });
        this.hour = Easy.create("Hour", {
            parentContainer: this
        });
        this.addChild(this.bg);
        this.clock1.show();
        this.hour.show();
        // this.hour.setTime();
        // this.container.addChild(TextMask);
    },
    setTime: function setTime(t, cb, AniTime) {
        var i = 2;
        var setEnd = function setEnd() {
            if (--i == 0) {
                cb && cb();
            }
        };
        this.clock1.setTime(t, setEnd, AniTime);
        this.hour.setTime(t, setEnd, AniTime);
    }
});
Easy.define("Clock", {
    init: function init() {
        this.stack = [];
        this.correntTime = 480;
        this.text = new PIXI.Text(this.fmtTime(this.correntTime), { fontWeight: "bold", fontFamily: 'Arial', fontSize: 48, fill: 0xff6700 });
        this.ClockSprite = Easy.create("ClockSprite", {
            parentContainer: this
        });
        this.ClockSprite.x = -70;
        this.ClockSprite.y = 28;
        this.addChild(this.text, this.ClockSprite);
    },
    fmtTime: function fmtTime(Time) {
        var Hour = parseInt(Time / 60);
        var Min = parseInt(Time % 60);
        if (Hour < 10) {
            Hour = "0" + Hour;
        }
        if (Min < 10) {
            Min = "0" + Min;
        }
        return Hour + ":" + Min;
    },
    setText: function setText(Time, cb) {
        var _this8 = this;

        var totalTime = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3000;

        var dt = Time - this.correntTime;
        var fn = this.getAniFun("easeInOutQuad", 0, dt, totalTime);
        var time = new Date().getTime();
        var interval = (0, _Timmer.setInterval)(function () {
            var t = new Date().getTime() - time;
            _this8.text.text = _this8.fmtTime(_this8.correntTime + fn(t));
            if (t >= totalTime) {
                _this8.text.text = _this8.fmtTime(_this8.correntTime + fn(totalTime));
                _this8.correntTime = Time;
                (0, _Timmer.clearInterval)(interval);
                cb && cb();
            }
        }, 16);
    },
    setTime: function setTime(Time, AniTime) {
        var _this9 = this;

        console.log("setTime:", Time);
        var setAllEnd = function setAllEnd() {
            _this9.stopPlay("clock");
            _this9.isSetting = false;
            if (_this9.stack.length) _this9.stack.pop()();
        };
        var i = 2;
        var setEnd = function setEnd() {
            if (--i === 0) {
                setAllEnd();
            }
        };
        var setFn = function setFn() {
            console.log("play");
            _this9.playSound("clock", true);
            _this9.isSetting = true;
            _this9.ClockSprite.setTime(Time + 480, function () {
                setEnd && setEnd();_this9.stopPlay("clock");
            }, AniTime);
            _this9.setText(Time + 480, setEnd, AniTime);
        };
        if (this.isSetting) {
            this.stack.push(setFn);
        } else {
            setFn();
        }
    }
});
Easy.define("Min", {
    getMoveSprite: function getMoveSprite() {
        for (var i = 0; i < this.aMoveSprite.length; i++) {
            if (!this.aMoveSprite[i].isPlay) {
                return this.aMoveSprite[i];
            }
        }
        this.aMoveSprite.push(new Test(this.res, this.parentContainer, true));
        this.aMoveSprite[this.aMoveSprite.length - 1].setColor(0x606060);
        return this.aMoveSprite[this.aMoveSprite.length - 1];
    },
    init: function init() {
        this.aMoveSprite = [];
        this.bg = new PIXI.Sprite(this.res["gameScene_biao2"].texture);
        this.bg.anchor.set(0, 0.5);
        this.bg.x = -9;
        this.correntTime = 480;
        this.rotation = -0.5 * Math.PI + this.correntTime * Math.PI / 30.0;
        this.addChild(this.bg);
    },
    setTime: function setTime() {
        var dt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 180;

        var _this10 = this;

        var setEnd = arguments[1];
        var AniTime = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 30000;

        var TotalAngle = (dt - this.correntTime) * Math.PI / 30.0;
        this.correntTime = dt;
        var fn = this.getAniFun("easeInOutQuad", 0, TotalAngle, AniTime);
        var baseAngle = this.container.rotation;
        var Time = new Date().getTime();
        var interval = (0, _Timmer.setInterval)(function () {
            var dt = new Date().getTime() - Time;
            if (dt > AniTime) {
                _this10.container.rotation = baseAngle + fn(AniTime);
                (0, _Timmer.clearInterval)(interval);
                setEnd && setEnd();
                return;
            }
            _this10.container.rotation = baseAngle + fn(dt);
            var a = _this10.getMoveSprite();
            a.theta = 2 * Math.PI - _this10.container.rotation;
            a.radius = 30;
            // a.radius = fnR(-a.theta);
            a.show();
        }, 16);
        // let dist =
        // this.container.rotation = Math.PI;
    }
});
Easy.define("Hour", {
    getMoveSprite: function getMoveSprite() {
        for (var i = 0; i < this.aMoveSprite.length; i++) {
            if (!this.aMoveSprite[i].isPlay) {
                return this.aMoveSprite[i];
            }
        }
        this.aMoveSprite.push(new Test(this.res, this.parentContainer, true));
        return this.aMoveSprite[this.aMoveSprite.length - 1];
    },
    init: function init() {
        this.aMoveSprite = [];
        this.bg = new PIXI.Sprite(this.res["gameScene_biao2"].texture);
        this.bg.anchor.set(0, 0.5);
        this.bg.x = -9;
        this.correntTime = 480;
        this.rotation = -0.5 * Math.PI + this.correntTime * Math.PI / 360.0;
        this.addChild(this.bg);
    },
    setTime: function setTime() {
        var dt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 180;

        var _this11 = this;

        var setEnd = arguments[1];
        var AniTime = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3000;

        var TotalAngle = (dt - this.correntTime) * Math.PI / 360.0;
        this.correntTime = dt;
        var fn = this.getAniFun("easeInOutQuad", 0, TotalAngle, AniTime);
        var baseAngle = this.container.rotation;
        var Time = new Date().getTime();
        var interval = (0, _Timmer.setInterval)(function () {
            var dt = new Date().getTime() - Time;
            if (dt > AniTime) {
                _this11.container.rotation = baseAngle + fn(AniTime);
                (0, _Timmer.clearInterval)(interval);
                setEnd && setEnd();
                return;
            }
            _this11.container.rotation = baseAngle + fn(dt);
            var a = _this11.getMoveSprite();
            a.radius = 30;
            a.theta = -_this11.container.rotation;
            a.show();
        }, 16);
    }
});

/*
* @class infantStart 幼教开始页
* @param bgConfig { - 背景动效的配置
*   name - 动画Json名称 （animation_starscreen）
*   AniName - 默认状态动画名称（idle）
*   AniName2 - 切换状态动画名称 （touch）
*   x - 动画x轴所在位置 （961）
*   y - 动画y轴所在位置 （541）
* }
* @param btnConfig { - 按钮动效的配置
*   name - 动画Json名称 （animation_btn）
*   AniName - 默认状态动画名称（idle）
*   AniName2 - 切换状态动画名称 （touch）
*   x - 动画x轴所在位置 （950）
*   y - 动画y轴所在位置 （860）
* }
* @castPort - 抛出的接口名称（"startGame"）
* */
Easy.define('infantStart', {
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
    init: function init() {
        var _this12 = this;

        var startBg = new PIXI.spine.Spine(res[this.bgConfig.name].spineData);
        startBg.state.setAnimation(0, this.bgConfig.AniName, true);
        startBg.position.set(this.bgConfig.x, this.bgConfig.y);
        var startBtn = new PIXI.spine.Spine(res[this.btnConfig.name].spineData);
        startBtn.state.setAnimation(0, this.btnConfig.AniName, true);
        startBtn.interactive = true;
        startBtn.buttonMode = true;
        startBtn.position.set(this.btnConfig.x, this.btnConfig.y);
        this.addChild(startBg, startBtn);
        startBtn.on('pointerdown', function () {
            startBtn.state.setAnimation(0, _this12.this.bgConfig.AniName2, false);
            startBg.state.setAnimation(0, _this12.btnConfig.AniName2, false);
            startBg.state.addListener({ complete: function complete() {
                    (0, _Timmer.setTimeout)(function () {
                        _this12.destroy({
                            children: true
                        });
                        stage.removeChildren();
                        _this12.fireEvent('startGame');
                    });
                } });
        });
    }
});