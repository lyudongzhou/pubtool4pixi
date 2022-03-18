class TimeGenerate{
  constructor(){
    this.map = {};
    this.count = 0;
  }
    getNewTime(cb,time=1){
        this.count++;
        this.map[this.count] = {
            fn:cb,
            time:time,
            repeatTime:false
        };
        return this.count;
    }
    getNewInterval(cb,time=1){
        this.count++;
        this.map[this.count] = {
            fn:cb,
            time:time,
            repeatTime:time
        };
        return this.count;
    }
    clear(id){
        delete this.map[id];
    }
    getMap(){
        return this.map;
    }
}
let timeGenerate = new TimeGenerate();
// const PIXI = require('pixi.js');
const ticker = new PIXI.ticker.Ticker();
ticker.stop();
ticker.add((deltaTime) => {
  let map = timeGenerate.getMap();
  for(let i in map){
    if(!map[i]){
      continue;
    }
    map[i].time -= deltaTime*16;
    if(map[i].time<=0){
      // try{
      if(map[i]&&typeof map[i].fn==="function")
      map[i].fn();
      if(!map[i]){
        continue;
      }
        if(map[i].repeatTime){
          map[i].time = map[i].repeatTime;
        }else{
          delete map[i];
        }
    }
  }
});
ticker.start();
function setTimeout(cb,time){
 return timeGenerate.getNewTime(cb,time);
}
function clearTimeout(id){
  timeGenerate.clear(id);
}
function setInterval(cb,time){
  return timeGenerate.getNewInterval(cb,time);
}
function clearInterval(id){
  timeGenerate.clear(id);
}
let o = {
  setTimeout:setTimeout,
  clearTimeout:clearTimeout,
  setInterval:setInterval,
  clearInterval:clearInterval
};
export {
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval
};
export default o;
