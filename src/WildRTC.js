var ConfigProvider = require('./ConfigProvider').ConfigProvider;
var PeerConnection = require('wild-peerconnection');
var WildStream = require('./WildStream');
var WildData = require('./WildData');
var events = require('events');

var WildRTC = function(ref) {
    this.wildEmitter = new events.EventEmitter();
    var appidString = ref.toString().split('.').shift();
    this.appid = appidString.split("//").pop();
    this.ref = ref;
    this.uid = ref.getAuth().uid;
    this.localStream = null;
    this.isAddStream = false;
    this.hasStreamList = {};
    this.noStreamList = {};
    this.receivePeerList = {};
    this.receiveStreamList = {};
    this.sendPeerConnection = null;
    this.receivePeerConnection = null;
    this.key = Math.random().toString(16).substr(2);
}

module.exports = WildRTC;
if (window)
    window.WildRTC = WildRTC;

WildRTC.prototype.join = function(callback) {
    var myBrowser = function() {
        //判断是否Safari浏览器
        if ( /*@cc_on!@*/ false || !!document.documentMode) {
            return "IE";
        }; //判断是否IE浏览器
        if (navigator.mediaDevices && navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
            return "Edge";
        } else {
            return "others"
        }
    }();
    if (myBrowser != 'others' || typeof window.getUserMedia != 'function' || typeof window.RTCPeerConnection != 'function') {
        callback('ERROR: the Browser is not support wildrtc!');
        return;
    }
    var configProvider = new ConfigProvider(this.appid, this.ref);
    var wildData = new WildData(this.ref);
    var self = this;
    var cancelCallback = function(err) {
        if (err != null) {
            callback(err);
        }
    }
    var onUserJoin = function(configuration) {
        wildData.onUserAdd(self.uid, function(remoteId) {
            console.log('new user join ,uid:' + remoteId);
            wildData.onceKey(remoteId, function(remotekey) {
                var localSendRef = self.ref.child('users/' + self.uid + '/send/' + remotekey + '/' + remoteId);
                var remoteReceiveRef = self.ref.child('users/' + remoteId + '/receive/' + self.key + '/' + self.uid);
                var localReceiveRef = self.ref.child('users/' + self.uid + '/receive/' + remotekey + '/' + remoteId);
                var remoteSendRef = self.ref.child('users/' + remoteId + '/send/' + self.key + '/' + self.uid);
                self.sendPeerConnection = new PeerConnection(localSendRef, remoteReceiveRef, configuration);
                self.receivePeerConnection = new PeerConnection(localReceiveRef, remoteSendRef, configuration);
                self.receivePeerConnection.on('addstream', function(stream) {
                    self.receiveStreamList[remoteId] = true;
                    var wildStream = new WildStream(remoteId);
                    wildStream.setStream(stream);
                    self.wildEmitter.emit('stream_added', wildStream);
                    // emit 'stream_removed'
                    wildData.onStreamRemove(remoteSendRef, function() {
                        var wildStream = new WildStream(remoteId);
                        wildStream.setStream(null);
                        if (self.receiveStreamList[remoteId]) {
                            delete self.receiveStreamList[remoteId];
                            self.wildEmitter.emit('stream_removed', wildStream);
                            wildData.offStreamRemove(remoteSendRef);
                        }
                    }, cancelCallback);
                });
                self.receivePeerConnection.on('removestream', function() {
                    if (self.receiveStreamList[remoteId])
                        delete self.receiveStreamList[remoteId];
                    var wildStream = new WildStream(remoteId);
                    wildStream.setStream(null);
                    self.wildEmitter.emit('stream_removed', wildStream);
                });
                self.receivePeerList[remoteId] = self.receivePeerConnection;
                if (self.isAddStream && self.localStream) {
                    self.sendPeerConnection.addStream(self.localStream.getStream(), function(err) {
                        console.log('addstream');
                    })
                    self.hasStreamList[remoteId] = self.sendPeerConnection;
                } else {
                    self.noStreamList[remoteId] = self.sendPeerConnection;
                }
            }, cancelCallback)
        }, cancelCallback);
    }
    var onUserLeave = function() {
        wildData.onUserRemoved(self.uid, function(remoteId) {
            if (self.hasStreamList[remoteId]) {
                self.hasStreamList[remoteId].close();
                delete self.hasStreamList[remoteId];
            }
            if (self.noStreamList[remoteId]) {
                self.noStreamList[remoteId].close();
                delete self.noStreamList[remoteId];
            };
            self.receivePeerList[remoteId].close();
        }, cancelCallback);
    }

    self.ref.child('keys/' + self.uid).set(this.key, function(err) {
        if (err != null) {
            callback(err);
            return;
        }
        self.ref.child('keys/' + self.uid).onDisconnect().remove();
        wildData.join(self.uid, function(err) {
            if (err != null) {
                callback(err);
                return;
            }
            configProvider.getConfig(function(configuration) {
                onUserJoin(configuration);
                onUserLeave();
                callback();
            });

        });
    });
}

WildRTC.prototype.leave = function() {
    this.ref.child('keys/' + this.uid).remove();
    for (var peer in this.hasStreamList) {
        if (this.hasStreamList[peer].signalingState != 'closed') {
            this.hasStreamList[peer].close();
            delete this.hasStreamList[peer];
        }
    }
    for (var peer in this.noStreamList) {
        if (this.noStreamList[peer].signalingState != 'closed') {
            this.noStreamList[peer].close();
            delete this.noStreamList[peer];
        }
    }
    for (var peer in this.receivePeerList) {
        if (this.receivePeerList[peer].signalingState != 'closed') {
            this.receivePeerList[peer].close();
            delete this.receivePeerList[peer];
        }
    }
    var wildData = new WildData(this.ref);
    wildData.leave(this.uid);
};

WildRTC.prototype.getLocalStream = function(options, callback, cancelCallback) {
    var self = this;
    var audioParam;
    var videoParam = {};
    if (options && options.audio) {
        audioParam = options.audio;
    } else {
        audioParam = true;
    };
    if (options && options.video) {
        if (options.video.FrameRate)
            videoParam.FrameRate = options.video.FrameRate;
        if (options.video.Width)
            videoParam.Width = options.video.Width;
        if (options.video.Height)
            videoParam.Height = options.video.Height;
    } else {
        videoParam = true;
    }
    var config = {
        audio: audioParam,
        video: videoParam
    };
    navigator.getUserMedia(config, function(stream) {
        var wildStream = new WildStream(self.uid);
        wildStream.setStream(stream);
        self.localStream = wildStream;
        callback(wildStream);
    }, function(err) {
        cancelCallback(err);
    })
};

WildRTC.prototype.addStream = function(wildStream, cancelCallback) {
    var self = this;
    self.isAddStream = true;
    for (var peer in self.noStreamList) {
        self.noStreamList[peer].addStream(wildStream.getStream(), function(err) {
            if (err != null) {
                var error = new Error("Error:addStream:" + err.message);
                cancelCallback(error);
            }
        })
    }
};

WildRTC.prototype.removeStream = function() {
    this.isAddStream = false;
    for (var peer in this.hasStreamList) {
        this.hasStreamList[peer].close();
        this.noStreamList[peer] = this.hasStreamList[peer];
        delete this.hasStreamList[peer];
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
