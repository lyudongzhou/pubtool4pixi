const Container = PIXI.Container;
const Sprite = PIXI.Sprite;
const Text = PIXI.Text;
import {setTimeout, setInterval, clearInterval} from './Timmer'
import easy from "./easy";
let Easy = easy;
Easy.define("Timer", {
    timeSprite:"image-gameScene_timer",
    textPosition:{
        x:205.45745125612848,
        y:67.41621621621623
    },
    init() {
        this.bg&&this.bg.destroy({
            children:true
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
        this.text.position.set(this.textPosition.x,this.textPosition.y);
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
    start(time) {
        let date = new Date().getTime();
        this.setText(time);
        let Time = time * 1000;
        let isPlay = false;
        this.interval = setInterval(() => {
            let dt = new Date().getTime() - date;
            this.setText(parseInt((Time - dt) / 1000));
            if (Time - dt <= 5000 && !isPlay) {
                isPlay = true;
                // this.playSound("timeup");
            }
            this.fireEvent("onTimeRun",[parseInt((Time - dt) / 1000)]);
            if (dt >= Time) {
                this.setText("");
                clearInterval(this.interval);
                this.fireEvent("timeup");
            }
        }, 16);
    },
    stop() {
        clearInterval(this.interval);
        this.setText("");
    }
});
Easy.define("AniBtn",{
    imgBtnName:"image_startGame",
    aniBtnName:"animation_btn",
    aniBtnAniName:"animation",
    init(){
        this.addEventOnce("Destroyed",()=>{
            Btn1.Destroy();
            this.Btn = null;
        });
        let Btn1 = Easy.create("normalBtn",{
            parentContainer:this,
            ClickSprite: {name: this.imgBtnName},
        });
        Btn1.addEventOnce("onClick",()=>{
            this.fireEvent("onClick");
        });
        Btn1.show();
        Btn1.position.set(-0.5*Btn1.Width,-0.5*Btn1.Height);
        Btn1.on("pointermove",(e)=>{
            if(Btn1.range.containsPoint(e.data.global)){
                this.Btn.renderable = false;
                Btn1.range.Sprite.renderable = true;
            }else{
                this.Btn.renderable = true;
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
Easy.define("DragContainer",{
    addDragItems(aItem){
        this.items.push.apply(this.items,aItem);
    },
    addTargetItems(aItem){
        this.aTarget.push.apply(this.aTarget,aItem);
    },
    removeDragItems(){
        while(this.items.length){
            this.items.pop();
        }
    },
    removeTargetItems(){
        while(this.aTarget.length){
            this.aTarget.pop();
        }
    },
    getDistance(a,b){
        return Math.sqrt(Math.pow(a.x-b.x,2)+Math.pow(a.y-b.y,2));
    },
    init(){
        this.items = [];
        this.aTarget = [];
        this.graphics1&&this.graphics1.destroy({
            children:true
        });
        this.addEventOnce("Destroyed",()=>{
            graphics1.destroy();
        });
        let graphics1 = this.graphics1 = new PIXI.Graphics();
        graphics1.beginFill(0x000000, 0);
        graphics1.drawRect(0, 0, 1920, 1080);
        graphics1.interactive = true;
        let dragItem = null;
        let startPoint = null;
        let minDist = 1920;
        this.addEvent("beforeDrag",()=>{
            stage.addChild(this);
        });
        this.addEvent("afterDrag",()=>{
            this.parentContainer.addChild(this);
        });
        graphics1.on("pointerdown", (e) => {
            if(dragItem){
                dragItem.fireEvent("DragCancel");
                dragItem.fireEvent("afterDrag");
                dragItem = null;
                startPoint = null;
            }
            minDist = 1920;
            for(let i = 0 ; i < this.items.length ; i ++){
                let item = this.items[i];
                if(item.allowDrag===false){
                    continue;
                }
                if(item.containsPoint(e.data.global)){
                    let d = this.getDistance(item.getGlobalPosition(),e.data.global);
                    if(d < minDist){
                        minDist = d;
                        dragItem = this.items[i];
                        startPoint = dragItem.toLocal(e.data.global, stage);
                        dragItem.fireEvent("beforeDrag",[e.data.global]);
                    }
                }
            }
            minDist = 1920
        });
        let currentoverTarget = null;
        graphics1.on("pointermove", (e) => {
            let TargetItem = null;
            if(dragItem){
                var p = dragItem.parent.toLocal(e.data.global, stage);
                dragItem.position.set(p.x-startPoint.x, p.y-startPoint.y);
                dragItem.fireEvent("Dragging",[e.data.global]);

                minDist = 1920;
                for(let i = 0 ; i < this.aTarget.length ; i++){
                    let item = this.aTarget[i];
                    if(item.containsPoint(e.data.global)){
                        let d = this.getDistance(item.getGlobalPosition(),e.data.global);
                        if(d<minDist){
                            TargetItem = item;
                            minDist = d;
                        }
                    }
                }
                if(TargetItem){
                    TargetItem.fireEvent("DragOver");
                }
            }
            if(TargetItem!==currentoverTarget){
                if(currentoverTarget){
                    currentoverTarget.fireEvent("dragOverCancel");
                }
                currentoverTarget = TargetItem;
            }
        });
        graphics1.on("pointerup",(e)=>{
            if(!dragItem){
                return;
            }
            let TragetItem = null;
            minDist = 1920;
            for(let i = 0 ; i < this.aTarget.length ; i++){
                let item = this.aTarget[i];
                if(item.containsPoint(e.data.global)){
                    let d = this.getDistance(item.getGlobalPosition(),e.data.global);
                    if(d<minDist){
                        TragetItem = item;
                        minDist = d;
                    }
                }
            }
            if(TragetItem){
                TragetItem.fireEvent("DragIn",[dragItem]);
                dragItem.fireEvent("DragTo",[TragetItem]);
            }else{
                dragItem.fireEvent("DragCancel");
            }
            dragItem.fireEvent("afterDrag",[e.data.global]);
            dragItem = null;
            startPoint = null;
        });
        graphics1.on("pointerupoutside", () => {
            if(!dragItem){
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
Easy.define("DragItem",{
    init(){
        let gra = this.gra = new PIXI.Graphics();
        gra.beginFill(0x888888);
        gra.drawCircle(0,0,100);
        this.addChild(gra);
    },
    containsPoint(point){
        return this.gra.containsPoint(point);
    }
});
Easy.define("Hand",{
    type:"",
    init(){
        this._direction = "left";
        this.aDirection = ["left","right","middle"];
        Object.defineProperties(this,{
            direction:{
                get(){
                    return this._direction;
                },
                set(para){
                    if(this.aDirection.indexOf(para)!==-1){
                        this._direction = para;
                    }else{
                        this._direction = "left";
                        console.log("typeErr");
                    }
                    this.fireEvent("directionChange",[para]);

                }
            }
        });
        this.addEvent("directionChange",(para)=>{
            this.textureName = "pub_hand"+para;
            this.bg.texture = this.res[this.textureName].texture;
            if(para==="left"){
                this.bg.anchor.set(0,1);
            }else if(para === "right"){
                this.bg.anchor.set(1,1);
            }else{
                this.bg.anchor.set(0.5,0);
            }
        });
        this.bg&&this.bg.destroy({
            children:true
        });
        this.bg = new Sprite(this.res["pub_handleft"].texture);
        this.addChild(this.bg);
        this.addEvent("onShow",()=>{
            switch (this.type){
                case "twinkle":
                    this.twinkle();
                    break;
            }
        });
        this.addEvent("onHide",()=>{
            switch (this.type){
                case "twinkle":
                    this.stopTwinkle();
                    break;
            }
        });

    },
    moveTo(x,y){
        this.release();
        this.timeout = setTimeout(()=>{
            this.click();
            let dist = Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2));
            let time = dist/(this.speed||0.5);
            let oldX = this.oldX =this.x;
            let oldY = this.oldY = this.y;
            let fnX = this.getAniFun("linear",this.x,x,time);
            let fnY = this.getAniFun("linear",this.y,y,time);
            this.timeout = setTimeout(()=>{
                let starttime = new Date().getTime();
                this.interval = setInterval(()=>{
                    let dt = new Date().getTime()-starttime;
                    this.x = fnX(dt);
                    this.y = fnY(dt);
                    if(dt>=time){
                        clearInterval(this.interval);
                        this.release();
                        this.timeout = setTimeout(()=>{
                            this.x = oldX;
                            this.y = oldY;
                            this.moveTo(x,y);
                        },500);
                    }
                });
            },300);
        },1000);
    },
    stopMoveTo(){
        this.x = this.oldX;
        this.y = this.oldY;
        clearInterval(this.interval);
        clearTimeout(this.timeout);
    },
    click(){
        this.bg.texture = this.res[this.textureName+'click'].texture;
    },
    release(){
        this.bg.texture = this.res[this.textureName].texture;
    },
    stopTwinkle(){
        clearInterval(this.interval);
        this.release();
    },
    twinkle(){
        let order = true;
        this.interval = setInterval(()=>{
            if(order){
                this.click();
            }else{
                this.release();
            }
            order = !order;
        },1000);
    }
});
Easy.define("IntroduceWord",{
    type:1,
    isSlow:true,
    init(){
        this.bg&&this.bg.destroy({
            children:true
        });
        this.bg = new Sprite(this.res["image-gameScene_introduce"+this.type].texture);
        this.addChild(this.bg);
    }
});
Easy.define("IntroduceContainer",{
    init(){
        this.item = [];
        this.graphics1&&this.graphics1.destroy({
            children:true
        });
        let graphics1 = this.graphics1 = new PIXI.Graphics();
        graphics1.beginFill(0x000000, 0.5);
        graphics1.drawRect(0, 0, 1920, 1080);
        if(this.MaskEvent === false){
            graphics1.interactive = false;
        }else{
            graphics1.interactive = true;
        }
        graphics1.on("pointermove", (e) => {
            e.stopped = true;
        });
        graphics1.on("pointertap",()=>{
            this.fireEvent("onClick");
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
        this.addChild(this.itemContainer,this.handContiner);
    },
    allowClick(){
        this.children[0].interactive = true;
    },
    forbidClick(){
        this.children[0].interactive = false;
    },
    addHand(o = {}){
        let hand = Easy.create("Hand",{
            parentContainer:this.handContiner,
            x:o.x,
            y:o.y
        });
        hand.direction = o.direction||"middle";
        hand.speed = o.speed;
        return hand;
    },
    addWord(type){
        return Easy.create("IntroduceWord",{
            type:type,
            parentContainer:this
        });
    },
    copyOriginalPara(o){
        o._oldPara = {
            container:o.parent,
            x:o.x,
            y:o.y
        };
    },
    caculatePosition(o){
        return o.parent.toGlobal(o.position);
    },
    addItem(aItem = []){
        for(let i = 0 ; i < aItem.length ; i++){
            this.copyOriginalPara(aItem[i]);
            let p = this.caculatePosition(aItem[i]);
            aItem[i].position.set(p.x,p.y);
            this.itemContainer.addChild(aItem[i]);
            this.item.push(aItem[i]);
        }
    },
    releaseAllItem(){
        while(this.item.length){
            let item = this.item.shift();
            item._oldPara.container.addChild(item);
            item.x = item._oldPara.x;
            item.y = item._oldPara.y;
            delete item._oldPara;
        }
    },
    releaseItem(item){
        item._oldPara.container.addChild(item);
        item.x = item._oldPara.x;
        item.y = item._oldPara.y;
        delete item._oldPara;
        this.item.splice(this.item.indexOf(item), 1);
    }
});
Easy.define("ClockSprite",{
    init(){
        let TextMask = new PIXI.Graphics();
        TextMask.beginFill(0x00ff00, 0.5);
        TextMask.drawRect(-5, -5 , 10,10);
        this.bg = new PIXI.Sprite(this.res["gameScene_biao"].texture);
        this.bg.anchor.set(0.5);
        this.clock1 = Easy.create("Min",{
            parentContainer:this
        });
        this.hour = Easy.create("Hour",{
            parentContainer:this
        });
        this.addChild(this.bg);
        this.clock1.show();
        this.hour.show();
        // this.hour.setTime();
        // this.container.addChild(TextMask);
    },
    setTime(t,cb,AniTime){
        let i = 2;
        let setEnd = ()=>{
            if(--i==0){
                cb&&cb();
            }
        };
        this.clock1.setTime(t,setEnd,AniTime);
        this.hour.setTime(t,setEnd,AniTime);
    }
});
Easy.define("Clock",{
    init(){
        this.stack = [];
        this.correntTime = 480;
        this.text = new PIXI.Text(this.fmtTime(this.correntTime),{fontWeight:"bold",fontFamily : 'Arial', fontSize: 48, fill : 0xff6700});
        this.ClockSprite = Easy.create("ClockSprite",{
            parentContainer:this
        });
        this.ClockSprite.x = -70;
        this.ClockSprite.y = 28;
        this.addChild(this.text,this.ClockSprite);
    },
    fmtTime(Time){
        let Hour = parseInt(Time/60);
        let Min = parseInt(Time%60);
        if(Hour<10){
            Hour = "0"+Hour;
        }
        if(Min<10){
            Min = "0"+Min;
        }
        return Hour+":"+Min;
    },
    setText(Time,cb,totalTime = 3000){
        let dt = Time - this.correntTime;
        let fn = this.getAniFun("easeInOutQuad",0,dt,totalTime);
        let time = new Date().getTime();
        let interval = setInterval(()=>{
            let t = new Date().getTime()-time;
            this.text.text = this.fmtTime(this.correntTime+fn(t));
            if(t>=totalTime){
                this.text.text = this.fmtTime(this.correntTime+fn(totalTime));
                this.correntTime = Time;
                clearInterval(interval);
                cb&&cb();
            }
        },16);
    },
    setTime(Time,AniTime){
        console.log("setTime:",Time);
        let setAllEnd = ()=>{
            this.stopPlay("clock");
            this.isSetting = false;
            if(this.stack.length)
                this.stack.pop()();
        };
        let i = 2;
        let setEnd = ()=>{
            if(--i===0){
                setAllEnd();
            }
        };
        let setFn = ()=>{
            console.log("play");
            this.playSound("clock",true);
            this.isSetting = true;
            this.ClockSprite.setTime(Time+480,()=>{setEnd&&setEnd();this.stopPlay("clock")},AniTime);
            this.setText(Time+480,setEnd,AniTime);
        };
        if(this.isSetting){
            this.stack.push(setFn);
        }else{
            setFn();
        }
    }
});
Easy.define("Min",{

    getMoveSprite(){
        for(let i = 0 ; i<this.aMoveSprite.length;i++){
            if(!this.aMoveSprite[i].isPlay){
                return this.aMoveSprite[i];
            }
        }
        this.aMoveSprite.push(new Test(this.res,this.parentContainer,true));
        this.aMoveSprite[this.aMoveSprite.length-1].setColor(0x606060);
        return this.aMoveSprite[this.aMoveSprite.length-1];
    },
    init(){
        this.aMoveSprite = [];
        this.bg = new PIXI.Sprite(this.res["gameScene_biao2"].texture);
        this.bg.anchor.set(0,0.5);
        this.bg.x = -9;
        this.correntTime = 480;
        this.rotation = -0.5*Math.PI+(this.correntTime*Math.PI)/30.0;
        this.addChild(this.bg);
    },
    setTime(dt=180,setEnd,AniTime = 30000){
        let TotalAngle = (dt-this.correntTime)*Math.PI/30.0;
        this.correntTime=dt;
        let fn = this.getAniFun("easeInOutQuad",0,TotalAngle,AniTime);
        let baseAngle = this.container.rotation;
        let Time = new Date().getTime();
        let interval = setInterval(()=>{
            let dt = new Date().getTime()-Time;
            if(dt>AniTime){
                this.container.rotation = baseAngle+fn(AniTime);
                clearInterval(interval);
                setEnd&&setEnd();
                return;
            }
            this.container.rotation = baseAngle+fn(dt);
            let a = this.getMoveSprite();
            a.theta = 2*Math.PI-this.container.rotation;
            a.radius = 30;
            // a.radius = fnR(-a.theta);
            a.show();
        },16);
        // let dist =
        // this.container.rotation = Math.PI;
    }
});
Easy.define("Hour",{
    getMoveSprite(){
        for(let i = 0 ; i<this.aMoveSprite.length;i++){
            if(!this.aMoveSprite[i].isPlay){
                return this.aMoveSprite[i];
            }
        }
        this.aMoveSprite.push(new Test(this.res,this.parentContainer,true));
        return this.aMoveSprite[this.aMoveSprite.length-1];
    },
    init(){
        this.aMoveSprite = [];
        this.bg = new PIXI.Sprite(this.res["gameScene_biao2"].texture);
        this.bg.anchor.set(0,0.5);
        this.bg.x = -9;
        this.correntTime = 480;
        this.rotation = -0.5*Math.PI+(this.correntTime*Math.PI)/360.0;
        this.addChild(this.bg);
    },
    setTime(dt=180,setEnd,AniTime = 3000){
        let TotalAngle = (dt-this.correntTime)*Math.PI/360.0;
        this.correntTime=dt;
        let fn = this.getAniFun("easeInOutQuad",0,TotalAngle,AniTime);
        let baseAngle = this.container.rotation;
        let Time = new Date().getTime();
        let interval = setInterval(()=>{
            let dt = new Date().getTime()-Time;
            if(dt>AniTime){
                this.container.rotation = baseAngle+fn(AniTime);
                clearInterval(interval);
                setEnd&&setEnd();
                return;
            }
            this.container.rotation = baseAngle+fn(dt);
            let a = this.getMoveSprite();
            a.radius = 30;
            a.theta = -this.container.rotation;
            a.show();
        },16);
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
Easy.define('infantStart',{
    bgConfig:{
        name:"animation_starscreen",
        AniName:"idle",
        AniName2:"touch",
        x:961.7943925233644,
        y:541.9065420560748
    },
    btnConfig:{
        name:"animation_btn",
        AniName:"idle",
        AniName2:"touch",
        x:950,
        y:860
    },
    init(){
        let startBg = new PIXI.spine.Spine(res[this.bgConfig.name].spineData);
        startBg.state.setAnimation(0,this.bgConfig.AniName, true);
        startBg.position.set(this.bgConfig.x,this.bgConfig.y)
        let startBtn = new PIXI.spine.Spine(res[this.btnConfig.name].spineData);
        startBtn.state.setAnimation(0,this.btnConfig.AniName,true);
        startBtn.interactive = true;
        startBtn.buttonMode = true;
        startBtn.position.set(this.btnConfig.x, this.btnConfig.y)
        this.addChild(startBg,startBtn)
        startBtn.on('pointerdown',()=>{
            startBtn.state.setAnimation(0,this.this.bgConfig.AniName2,false);
            startBg.state.setAnimation(0,this.btnConfig.AniName2,false);
            startBg.state.addListener({complete:()=>{
                    setTimeout(()=>{
                        this.destroy({
                            children: true
                        });
                        stage.removeChildren();
                        this.fireEvent('startGame')
                    });
                }});
        })
    }
})


