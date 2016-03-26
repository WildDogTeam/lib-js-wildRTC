var KurentoRoom = require('./kurento/KurentoRoom.js');

var WildRTCProxy = function(ref){

}

WildRTCProxy.prototype.join = function(callback) {
	var wsUri = 'wss://10.18.2.206:8443/room';
	var kurento = KurentoRoom(wsUri ,function(err,kurento){
		if(err){
			console.log(err);
		};
		var room = kurento.Room({room:'132',user:'asd'});
		room.connect();
	})

};

WildRTCProxy.prototype.leave = function(){

};

WildRTCProxy.prototype.getLocalStream = function(options,callback,cancelCallback){

};

WildRTCProxy.prototype.addStream = function(wildStream){

};

WildRTCProxy.prototype.removeStream = function(){

};

WildRTCProxy.prototype.on = function(string, callback, cancelCallback){

};

WildRTCProxy.prototype.off = function(string){

};

module.exports = WildRTCProxy;