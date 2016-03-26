var WildRTCProxy = require('./WildRTCProxy.js');
var WildRTCDirect = require('./WildRTCDirect.js');

var WildRTC = function(ref, type){
    if(type == 'proxy'){
        this.wildRTC = new WildRTCProxy(ref);
    } else{
        this.wildRTC = new WildRTCDirect(ref);
    }
}

WildRTC.prototype.join = function(callback) {
    this.wildRTC.join(callback);
};

window.WildRTC = WildRTC;
