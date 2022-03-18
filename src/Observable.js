class Event {
    init(fn, scope, isOnce = false) {
        this.fn = fn;
        this.scope = scope;
        this.isOnce = isOnce;
    }

    fire(arg) {
        this.fn.apply(this.scope, arg);
    };
}
export default function Observable(obj){
    obj["_Myevent"] = {};
    obj.addEvent = (EventName,fn,scope,isOnce)=>{
        if(!obj["_Myevent"][EventName]){
            obj["_Myevent"][EventName] = [];
        }
        let event = new Event();
        event.init(fn,scope||obj,isOnce)
        obj["_Myevent"][EventName].push(event);
        event.cancel = ()=>{
            obj.removeEvent(EventName,fn);
        };
        return event;
    };
    obj.fireEvent = (EventName,arg)=>{
        let Events = obj["_Myevent"][EventName];
        if(!Events){
            return;
        }
        let arrRemove = [];
        let eventCopy = [];
        for(let i = 0 ; i < Events.length;i++){
            eventCopy.push(Events[i]);
        }
        for(let i = 0 ; i < eventCopy.length;i++){
            if(eventCopy[i].isOnce){
                arrRemove.push(eventCopy[i]);
            }
            eventCopy[i].fire(arg);
        }
        for(let i = 0 ; i<arrRemove.length;i++){
            obj.removeEvent(EventName,arrRemove[i].fn);
        }
    };
    obj.removeEvent = (EventName,fn)=>{
        let Events = obj["_Myevent"][EventName];
        if(!Events){
            return;
        }
        for(let i = 0 ; i < Events.length;i++){
            if(Events[i].fn === fn){
                Events.splice(i,1);
                break;
            }
        }
    };
    obj.addEventOnce = (EventName,fn,scope)=>{
        return obj.addEvent(EventName,fn,scope,true);
    };
    obj.removeAllEvent = ()=>{
        obj["_Myevent"] = {};
    };
}