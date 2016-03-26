var WildRTC = require('./WildRTC.js');

var testRTC = new WildRTC(ref,'proxy');

WildRTC.join(function(err){
	console.log(err);
});