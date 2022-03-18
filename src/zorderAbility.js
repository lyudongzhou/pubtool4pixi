let aDirty = [];
// const PIXI = require('pixi.js');
const ticker = new PIXI.ticker.Ticker();
ticker.stop();
ticker.add((deltaTime) => {
    while(aDirty.length){
        let obj = aDirty.pop();
        let parent = obj.parent;
        if(parent){
            let children = parent.children;
            children.sort((a,b)=>{
                if(!a.zIndex){
                    a.zIndex = 0;
                }
                if(!b.zIndex){
                    b.zIndex = 0;
                }
                if(a.zIndex<b.zIndex){
                    return -1;
                }
                if(a.zIndex>b.zIndex){
                    return 1;
                }
                return 0;
            });
        }
        obj.zIndexDirty = false;
    }
});
ticker.start();
export default function Observable(obj){
    obj._zIndex = 0;
    Object.defineProperty(obj,"zIndex",{
        get(){
            return obj._zIndex;
        },
        set(para){
            if(para===obj._zIndex){
                return;
            }
            obj._zIndex = para;
            if(!obj.zIndexDirty){
                obj.zIndexDirty = true;
                aDirty.push(obj);
            }
        }
    });
    obj.refreshZindex = ()=>{
        let parent = obj.parent;
        if(parent){
            let children = parent.children;
            children.sort((a,b)=>{
                if(a.zIndex===undefined){
                    a.zIndex = 0;
                }
                if(b.zIndex===undefined){
                    b.zIndex = 0;
                }
                if(a.zIndex<b.zIndex){
                    return -1;
                }
                if(a.zIndex>b.zIndex){
                    return 1;
                }
                return 0;
            });
        }
    };
}