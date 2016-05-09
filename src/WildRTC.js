var ConfigProvider = require('./ConfigProvider').ConfigProvider;
var Sender = require('./sender');
var Receiver = require('./receiver');
var WildStream = require('./WildStream');
var WildData = require('./WildData');
var events = require('events');

var WildRTC = function(ref, callback) {
    this.wildEmitter = new events.EventEmitter();
    var appidString = ref.toString().split('.').shift();
    this.appid = appidString.split("//").pop();
    this.ref = ref;
    this.uid = ref.getAuth().uid;
    this.localStream = null;
    this.configuration;
    this.isAddStream = false;
    this.hasSendStreamList = {};
    this.noSendStreamList = {};
    this.receivePeerList = {};
    this.receiveStreamList = {};
    this.key = Math.random().toString(16).substr(2);
}

window.WildRTC = WildRTC;
WildRTC.prototype.join = function(callback) {
    var configProvider = new ConfigProvider(this.appid, this.ref);
    var wildData = new WildData(this.ref);
    var self = this;
    wildData.join(self.uid, function(err) {
        if (err != null) {
            callback(err);
        } else {
            configProvider.getConfig(function(configuration) {
                self.configuration = configuration;
                wildData.onUserAdd(self.uid, function(remoteId) {
                    console.log('new user join ,uid:' + remoteId);
                    var localSendRef = self.ref.child('users/' + self.uid + '/' + remoteId);
                    var localReceiveRef = self.ref.child('users/' + remoteId + '/' + self.uid);
                    if (self.isAddStream) {
                        if (self.localStream) {
                            var sendPeerConnection = new Sender(localSendRef, self.localStream.getStream(), configuration);
                            self.hasSendStreamList[remoteId] = sendPeerConnection;
                        } else {
                            callback('ERROR:localStream is null!');
                            return;
                        }
                    } else {
                        self.noSendStreamList[remoteId] = true;
                    }
                    var onStream = function(stream) {
                        self.receiveStreamList[remoteId] = true;
                        var wildStream = new WildStream(remoteId);
                        wildStream.setStream(stream);
                        self.wildEmitter.emit('stream_added', wildStream);

                    }
                    var receivePeerConnection = new Receiver(localReceiveRef, onStream, configuration);
                    self.receivePeerList[remoteId] = receivePeerConnection;
                    wildData.onStreamRemove(localReceiveRef, function() {
                        var wildStream = new WildStream(remoteId);
                        if (self.receiveStreamList[remoteId]) {
                            delete self.receiveStreamList[remoteId];
                            self.wildEmitter.emit('stream_removed', wildStream);
                            wildData.offStreamRemove(localReceiveRef);
                        }
                    });
                })
                wildData.onUserRemoved(self.uid, function(remoteId) {
                    if (self.hasSendStreamList[remoteId]) {
                        self.hasSendStreamList[remoteId].close();
                        delete self.hasSendStreamList[remoteId];
                    } else if (self.noSendStreamList[remoteId]) {
                        delete self.noSendStreamList[remoteId];
                    };
                    self.receivePeerList[remoteId].close();
                });
                callback();
            });
        }
    });
}

WildRTC.prototype.leave = function() {
    for (var remoteId in this.hasSendStreamList) {
        if (this.hasSendStreamList[remoteId].signalingState != 'closed') {
            this.hasSendStreamList[remoteId].close();
            delete this.hasSendStreamList[remoteId];
        }
    }
    for (var remoteId in this.noStreamList) {
        delete this.noStreamList[remoteId];
    }
    for (var remoteId in this.receivePeerList) {
        if (this.receivePeerList[remoteId].signalingState != 'closed') {
            this.receivePeerList[remoteId].close();
            delete this.receivePeerList[remoteId];
        }
    }
    for (var remoteId in this.receiveStreamList) {
        delete this.receiveStreamList[remoteId];
    }
    var wildData = new WildData(this.ref);
    wildData.leave(this.uid);
};

WildRTC.prototype.getLocalStream = function(options, callback, cancelCallback) {
    var self = this;
    if (options != null) {
        getUserMedia(options, function(stream) {
            var wildStream = new WildStream(self.uid);
            wildStream.setStream(stream);
            self.localStream = wildStream;
            callback(wildStream);
        }, function(err) {
            cancelCallback(err);
        })
    } else {
        getUserMedia({
            'audio': true,
            'video': true
        }, function(stream) {
            var wildStream = new WildStream(self.uid);
            wildStream.setStream(stream);
            self.localStream = wildStream;
            callback(wildStream);
        }, function(err) {
            cancelCallback(err);
        })
    }
};

WildRTC.prototype.addStream = function(wildStream) {
    var self = this;
    self.isAddStream = true;
    for (var remoteId in self.noSendStreamList) {
        var localSendRef = self.ref.child('users/' + self.uid + '/' + remoteId);
        var sendPeerConnection = new Sender(localSendRef, wildStream.getStream(), self.configuration);
        self.hasSendStreamList[remoteId] = sendPeerConnection;
        delete self.noSendStreamList[remoteId];
    }
};

WildRTC.prototype.removeStream = function() {
    this.isAddStream = false;
    for (var peer in this.hasSendStreamList) {
        this.hasSendStreamList[peer].close();
        this.noSendStreamList[peer] = true;
        delete this.hasSendStreamList[peer];
    }
};

WildRTC.prototype.on = function(string, callback, cancelCallback) {
    if (string != 'stream_added' && string != 'stream_removed') {
        cancelCallback();
    } else if (string == 'stream_added') {
        this.wildEmitter.on('stream_added', callback);
    } else if (string == 'stream_removed') {
        this.wildEmitter.on('stream_removed', callback);
    }
};

WildRTC.prototype.off = function(string) {

    if (string == 'stream_added' || string == 'stream_removed') {
        this.WildEmitter.off(string);
    }
};
