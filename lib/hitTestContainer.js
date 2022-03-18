"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// import { Container, Point } from "pixi.js";
var Container = PIXI.Container;
var Point = PIXI.Point;
function defineProperty(name, defaultValue) {
    var getter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (value) {
        return value;
    };
    var setter = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function (value) {
        return value;
    };

    var value = defaultValue;
    var o = {};
    o[name] = {
        get: function get() {
            return getter(value);
        },
        set: function set(para) {
            value = setter(para);
        }
    };
    Object.defineProperties(this, o);
}
/**
 * @class HitContainer
 * @extends PIXI.Container
 * @classdesc Hit test container
 * @property {Number}  ssampleCount - 采样个数，如360代表每隔一度采样一次 - 默认：360
 * @property {Number}  sampleMinAlpha - 采样像素点阈值，采样的数据为RGBA中的A 范围在0-255 - 默认：0
 * @property {Number}  sampleDist - 采样衰减距离 - 默认：1像素
 * @example
 * var local = new HitContainer();
 * local.sampleCount = 720;
 * local.sampleMinAlpha = 10;
 * var localSprite = new PIXI.Sprite(res["image_example1"].texture);
 * localSprite.anchor.set(0.5);
 * local.addChild(localSprite);
 * var target = new HitContainer();
 * var targetSprite = new PIXI.Sprite(res["image_example2"].texture);
 * targetSprite.anchor.set(0.5);
 * target.addChild(targetSprite);
 * local.initBound();
 * target.initBound();
 * local.position.set(10,10);
 * console.log(local.hitTest(target));
 * */

var HitContainer = function (_Container) {
    _inherits(HitContainer, _Container);

    function HitContainer() {
        _classCallCheck(this, HitContainer);

        var _this = _possibleConstructorReturn(this, (HitContainer.__proto__ || Object.getPrototypeOf(HitContainer)).call(this));

        defineProperty.call(_this, "sampleCount", 360, undefined, function (value) {
            return parseInt(value);
        });
        defineProperty.call(_this, "sampleMinAlpha", 0);
        defineProperty.call(_this, "sampleDist", 1);
        return _this;
    }

    _createClass(HitContainer, [{
        key: "_toRad",
        value: function _toRad(deg) {
            return deg * Math.PI / 180;
        }
        /**
         * @function _polarToPixel
         * @memberOf HitContainer
         * @description Caculate the position in Cartesian coordinate with given point in polar coordinate.
         * @param {Number} amplitude Amplitude of polar coordinate point.
         * @param {Number} phase Phase of polar coordinate point.
         * @return {Point} Point in Cartesian coordinate 
         */

    }, {
        key: "_polarToPixel",
        value: function _polarToPixel(amplitude, phase) {
            return {
                x: amplitude * Math.cos(phase),
                y: amplitude * Math.sin(phase)
            };
        }
        /**
         * @function _caculateBoundMatrix
         * @memberOf HitContainer
         * @description Caculate the matrix base on visible pixel in this container.
         * @return {Array} Two-dimensional array contains binnary numbers. 1 means visible and 0 means transparent.  
         */

    }, {
        key: "_caculateBoundMatrix",
        value: function _caculateBoundMatrix() {
            var buffer = app.renderer.extract.pixels(this);
            var width = Math.floor(this.width);
            var count = width;
            var arr = [];
            var length = buffer.length;
            for (var i = 0; i < length; i += 4) {
                if (count === width) {
                    arr.push([]);
                    count = 0;
                }
                var alpha = buffer[i + 3];
                arr[arr.length - 1].push(alpha > this.sampleMinAlpha ? 1 : 0);
                count++;
            }
            return arr;
        }
        /**
         * @function _caculateBound
         * @memberOf HitContainer
         * @description Caculate bound area for this in polor coordinate.
         * @param {Number} Two-dimensional array contains binnary numbers.
         * @return {Array} An array contains polor coordinate points.  
         */

    }, {
        key: "_caculateBound",
        value: function _caculateBound(buffer) {
            var bound = this.getBounds();
            var globalP = this.getGlobalPosition();
            var dx = bound.x - globalP.x;
            var dy = bound.y - globalP.y;
            var sampleAmplitudeMax = Math.floor(Math.sqrt(this.width * this.width + this.height * this.height, 2) / 2);
            var arr = [];
            var me = this;
            var width = me.width;
            var height = me.height;
            var step = 360 / this.sampleCount;
            var dist = me.sampleDist;
            for (var j = 0; j < 360; j += step) {
                for (var i = sampleAmplitudeMax; i > 0; i -= dist) {
                    var p = me._polarToPixel(i, me._toRad(j));
                    p.x -= dx;
                    p.y -= dy;
                    if (p.x > width || p.y > height || p.x < 0 || p.y < 0) {
                        continue;
                    }
                    var indexX = Math.floor(p.x);
                    var indexY = Math.floor(p.y);
                    if (buffer[indexY] === undefined || buffer[indexY][indexX] === undefined || buffer[indexY][indexX] === 0) {
                        continue;
                    } else {
                        arr.push({
                            amplitude: i,
                            phase: j
                        });
                        break;
                    }
                }
            }
            return arr;
        }
        /**
         * @function _getBoundaryGraphics
         * @memberOf HitContainer
         * @description Draw a polygon based on given points in polor coordinate.
         * @para {Array} points in polor coordinate.
         * @return {PIXI.Graphics} Polygon graphic.  
         */

    }, {
        key: "_getBoundaryGraphics",
        value: function _getBoundaryGraphics(bound) {
            var _this2 = this;

            var gra = new PIXI.Graphics();
            gra.lineStyle(1, 0xff0000, 0);
            gra.beginFill(0xff00ff, 0);
            bound.forEach(function (element, index) {
                var relP = _this2._polarToPixel(element.amplitude, _this2._toRad(element.phase));
                if (index === 0) {
                    gra.moveTo(relP.x, relP.y);
                } else {
                    gra.lineTo(relP.x, relP.y);
                }
            });
            gra.endFill();
            return gra;
        }
        /**
         * @function initBound
         * @memberOf HitContainer
         * @description Prepare for hit test. This method must be done before hit test. If the boundary of container is changed. You must do it again.
         * @description 预处理碰撞检测，这个方法必须在碰撞检测前调用。如果容器的边界发生了变化，需要再次调用 
         */

    }, {
        key: "initBound",
        value: function initBound(boundMatrix, bound) {
            this._BoundMatrix = boundMatrix || this._caculateBoundMatrix();
            this._Bound = bound || this._caculateBound(this._BoundMatrix);
            this._BoundGraphics && this._BoundGraphics.destroy();
            this._BoundGraphics = this._getBoundaryGraphics(this._Bound);
            this.addChild(this._BoundGraphics);
        }
        /**
         * @function isInBound
         * @memberOf HitContainer
         * @para {Object}A point.
         * @description Determine whether a point which defined in global is in the boundary.
         * @description 检测一个全局点是否在边界内
         */

    }, {
        key: "isInBound",
        value: function isInBound(point) {
            return this._BoundGraphics.containsPoint(point);
        }
        /**
         * @function hitTest
         * @memberOf HitContainer
         * @para {HitContainer}Target object.
         * @description Detect whether the container collides with the target area
         * @description 检测容器是否碰撞了目标区域
         * @return {Boolean} Collision with target area or not
         */

    }, {
        key: "hitTest",
        value: function hitTest(target) {
            var _this3 = this;

            var isHit = false;
            var p1 = this.getGlobalPosition();
            var targetTestFun = target.isInBound || target.containsPoint;
            this._Bound.some(function (element, index) {
                var relP = _this3._polarToPixel(element.amplitude, element.phase * Math.PI / 180);
                relP.x += p1.x;
                relP.y += p1.y;
                isHit = targetTestFun.call(target, relP);
                if (isHit) {
                    return true;
                }
            });
            if (!isHit) {
                p1 = target.getGlobalPosition();
                target._Bound.some(function (element, index) {
                    var relP = target._polarToPixel(element.amplitude, element.phase * Math.PI / 180);
                    relP.x += p1.x;
                    relP.y += p1.y;
                    isHit = targetTestFun.call(_this3, relP);
                    if (isHit) {
                        return true;
                    }
                });
            }
            return isHit;
        }
        /**
         * @function testHitArea
         * @memberOf HitContainer
         * @para {HitContainer}Target object.
         * @description Detect the proportion of hit area.
         * @description 检测碰撞面积比例
         * @return {Number}The proportion of hit area.
         */

    }, {
        key: "testHitArea",
        value: function testHitArea(target) {
            if (!this.hitTest(target)) {
                return 0;
            }
            var targetBound = target.getBounds();
            var localBound = this.getBounds();
            var maxEmptyMatrix = this._generateMaxEmptyMatrix(targetBound, localBound);
            maxEmptyMatrix = this._addBoundToMatrix(maxEmptyMatrix, localBound);
            var maxEmptyMatrixTarget = this._generateMaxEmptyMatrix(targetBound, localBound);
            maxEmptyMatrixTarget = target._addBoundToMatrix(maxEmptyMatrixTarget, targetBound);
            var hitMatrix = this._multiplyMatrix(maxEmptyMatrix, maxEmptyMatrixTarget);
            var totalSurfaceArea = this._caculateSuerfaceArea(hitMatrix);
            var localSurfaceArea = this._caculateSuerfaceArea(this._BoundMatrix);
            return totalSurfaceArea / localSurfaceArea;
        }
        /**
         * @function _caculateSuerfaceArea
         * @memberOf HitContainer
         * @para {Array}A matrix which want to be measured.
         * @description Caculate the area based on pixel.
         * @return {Number} Area.
         */

    }, {
        key: "_caculateSuerfaceArea",
        value: function _caculateSuerfaceArea(matrix) {
            var s = 0;
            for (var i = 0; i < matrix.length; i++) {
                for (var j = 0; j < matrix[i].length; j++) {
                    if (matrix[i][j] !== 0 && matrix[i][j] !== undefined) {
                        s++;
                    }
                }
            }
            return s;
        }
        /**
         * @function _multiplyMatrix
         * @memberOf HitContainer
         * @para {Array} Matrix 1.
         * @para {Array} Matrix 2.
         * @description Matrix 1 and Matrix 2 must have same shape. The method will multiply every item in matrix 1 and 2. This is not Matrix multiplication.
         * @return {Array} A new matrix which have a same shape with given matrix contains resault.
         */

    }, {
        key: "_multiplyMatrix",
        value: function _multiplyMatrix(Matrix1, Matrix2) {
            var newMatrix = [];
            for (var i = 0; i < Matrix1.length; i++) {
                newMatrix.push([]);
                for (var j = 0; j < Matrix1[i].length; j++) {
                    newMatrix[i][j] = Matrix1[i][j] * Matrix2[i][j];
                }
            }
            return newMatrix;
        }
        /**
         * @function _addBoundToMatrix
         * @memberOf HitContainer
         * @para {Array} Matrix 1.
         * @para {PIXI.Rectangle} localBound.
         * @description Add local pixel in to a Matrix.
         * @return {Array} The matrix after add the local pixel.
         */

    }, {
        key: "_addBoundToMatrix",
        value: function _addBoundToMatrix(emptyMatrix, localBound) {
            var dx = Math.floor(localBound.x - emptyMatrix.bound.x);
            var dy = Math.floor(localBound.y - emptyMatrix.bound.y);
            var localX = 0;
            var localY = 0;
            for (var i = dy; i < emptyMatrix.bound.height; i++) {
                for (var j = dx; j < emptyMatrix.bound.width; j++) {
                    if (this._BoundMatrix[localY] === undefined || this._BoundMatrix[localY][localX] === undefined) {
                        continue;
                    }
                    emptyMatrix[i][j] += this._BoundMatrix[localY][localX];
                    localX++;
                }
                localX = 0;
                localY++;
            }
            return emptyMatrix;
        }
        /**
         * @function _generateMaxEmptyMatrix
         * @memberOf HitContainer
         * @para {Array} Matrix 1.
         * @para {Array} Matrix 2.
         * @description Caculate the smallest matrix which can contains both given matrix.
         * @return {Array} An empty matrix.
         */

    }, {
        key: "_generateMaxEmptyMatrix",
        value: function _generateMaxEmptyMatrix(bound1, bound2) {
            var x = Math.min(bound1.x, bound2.x);
            var y = Math.min(bound1.y, bound2.y);
            var MaxX = Math.max(bound1.x + bound1.width, bound2.x + bound2.width);
            var MaxY = Math.max(bound1.y + bound1.height, bound2.y + bound2.height);
            var totalWidth = Math.floor(MaxX - x);
            var totalHeight = Math.floor(MaxY - y);
            var totalMatrix = [];
            for (var i = 0; i < totalHeight; i++) {
                var aRow = [];
                for (var j = 0; j < totalWidth; j++) {
                    aRow.push(0);
                }
                totalMatrix.push(aRow);
            }
            var maxBound = new PIXI.Rectangle(x, y, totalWidth, totalHeight);
            totalMatrix.bound = maxBound;
            return totalMatrix;
        }
    }]);

    return HitContainer;
}(Container);

exports.default = HitContainer;