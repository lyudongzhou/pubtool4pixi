// import { Container, Point } from "pixi.js";
const Container = PIXI.Container;
const Point = PIXI.Point;
function defineProperty(name, defaultValue, getter = function (value) { return value; }, setter = function (value) { return value; }) {
    let value = defaultValue;
    let o = {};
    o[name] = {
        get() {
            return getter(value);
        },
        set(para) {
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
class HitContainer extends Container {
    constructor() {
        super();
        defineProperty.call(this, "sampleCount", 360, undefined, function (value) {
            return parseInt(value);
        });
        defineProperty.call(this, "sampleMinAlpha", 0);
        defineProperty.call(this, "sampleDist", 1);
    }
    _toRad(deg) {
        return (deg * Math.PI) / 180;
    }
    /**
     * @function _polarToPixel
     * @memberOf HitContainer
     * @description Caculate the position in Cartesian coordinate with given point in polar coordinate.
     * @param {Number} amplitude Amplitude of polar coordinate point.
     * @param {Number} phase Phase of polar coordinate point.
     * @return {Point} Point in Cartesian coordinate 
     */
    _polarToPixel(amplitude, phase) {
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
    _caculateBoundMatrix() {
        var buffer = app.renderer.extract.pixels(this);
        let width = Math.floor(this.width);
        let count = width;
        let arr = [];
        let length = buffer.length;
        for (let i = 0; i < length; i += 4) {
            if (count === width) {
                arr.push([]);
                count = 0;
            }
            let alpha = buffer[i + 3];
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
    _caculateBound(buffer) {
        let bound = this.getBounds();
        let globalP = this.getGlobalPosition();
        let dx = bound.x - globalP.x;
        let dy = bound.y - globalP.y;
        let sampleAmplitudeMax = Math.floor(
            Math.sqrt(this.width * this.width + this.height * this.height, 2)/2
        );
        let arr = [];
        let me = this;
        let width = me.width;
        let height = me.height;
        let step = 360 / this.sampleCount;
        let dist = me.sampleDist;
        for (let j = 0; j < 360; j += step) {
            for (let i = sampleAmplitudeMax; i > 0; i -= dist) {
                let p = me._polarToPixel(i, me._toRad(j));
                p.x -= dx;
                p.y -= dy;
                if (p.x > width || p.y > height || p.x < 0 || p.y < 0) {
                    continue;
                }
                let indexX = Math.floor(p.x);
                let indexY = Math.floor(p.y);
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
    _getBoundaryGraphics(bound) {
        let gra = new PIXI.Graphics();
        gra.lineStyle(1, 0xff0000, 0);
        gra.beginFill(0xff00ff, 0);
        bound.forEach((element, index) => {
            let relP = this._polarToPixel(element.amplitude, this._toRad(element.phase));
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
    initBound(boundMatrix,bound) {
        this._BoundMatrix = boundMatrix||this._caculateBoundMatrix();
        this._Bound = bound||this._caculateBound(this._BoundMatrix);
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
    isInBound(point) {
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
    hitTest(target) {
        let isHit = false;
        let p1 = this.getGlobalPosition();
        let targetTestFun = target.isInBound || target.containsPoint;
        this._Bound.some((element, index) => {
            let relP = this._polarToPixel(element.amplitude, (element.phase * Math.PI) / 180);
            relP.x += p1.x;
            relP.y += p1.y;
            isHit = targetTestFun.call(target, relP);
            if (isHit) {
                return true;
            }
        });
        if(!isHit){
            p1 = target.getGlobalPosition();
            target._Bound.some((element, index) => {
                let relP = target._polarToPixel(element.amplitude, (element.phase * Math.PI) / 180);
                relP.x += p1.x;
                relP.y += p1.y;
                isHit = targetTestFun.call(this, relP);
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
    testHitArea(target) {
        if (!this.hitTest(target)) {
            return 0;
        }
        let targetBound = target.getBounds();
        let localBound = this.getBounds();
        let maxEmptyMatrix = this._generateMaxEmptyMatrix(targetBound, localBound);
        maxEmptyMatrix = this._addBoundToMatrix(maxEmptyMatrix, localBound);
        let maxEmptyMatrixTarget = this._generateMaxEmptyMatrix(targetBound, localBound);
        maxEmptyMatrixTarget = target._addBoundToMatrix(maxEmptyMatrixTarget, targetBound);
        let hitMatrix = this._multiplyMatrix(maxEmptyMatrix, maxEmptyMatrixTarget);
        let totalSurfaceArea = this._caculateSuerfaceArea(hitMatrix);
        let localSurfaceArea = this._caculateSuerfaceArea(this._BoundMatrix);
        return totalSurfaceArea / localSurfaceArea;
    }
    /**
     * @function _caculateSuerfaceArea
     * @memberOf HitContainer
     * @para {Array}A matrix which want to be measured.
     * @description Caculate the area based on pixel.
     * @return {Number} Area.
     */
    _caculateSuerfaceArea(matrix) {
        let s = 0;
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
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
    _multiplyMatrix(Matrix1, Matrix2) {
        let newMatrix = [];
        for (let i = 0; i < Matrix1.length; i++) {
            newMatrix.push([]);
            for (let j = 0; j < Matrix1[i].length; j++) {
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
    _addBoundToMatrix(emptyMatrix, localBound) {
        let dx = Math.floor(localBound.x - emptyMatrix.bound.x);
        let dy = Math.floor(localBound.y - emptyMatrix.bound.y);
        let localX = 0;
        let localY = 0;
        for (let i = dy; i < emptyMatrix.bound.height; i++) {
            for (let j = dx; j < emptyMatrix.bound.width; j++) {
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
    _generateMaxEmptyMatrix(bound1, bound2) {
        let x = Math.min(bound1.x, bound2.x);
        let y = Math.min(bound1.y, bound2.y);
        let MaxX = Math.max(bound1.x + bound1.width, bound2.x + bound2.width);
        let MaxY = Math.max(bound1.y + bound1.height, bound2.y + bound2.height);
        let totalWidth = Math.floor(MaxX - x);
        let totalHeight = Math.floor(MaxY - y);
        let totalMatrix = [];
        for (let i = 0; i < totalHeight; i++) {
            let aRow = [];
            for (let j = 0; j < totalWidth; j++) {
                aRow.push(0);
            }
            totalMatrix.push(aRow);
        }
        let maxBound = new PIXI.Rectangle(x, y, totalWidth, totalHeight);
        totalMatrix.bound = maxBound;
        return totalMatrix;
    }
}
export default HitContainer;