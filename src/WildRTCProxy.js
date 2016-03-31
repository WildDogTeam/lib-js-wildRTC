var KurentoRoom = require('./kurento/KurentoRoom.js').KurentoRoom;
var Participant = require('./kurento/KurentoRoom.js').Participant;
var KurentoStream = require('./kurento/KurentoRoom.js').KurentoStream;
var EventEmitter = require('./kurento/EventEmitter.js');
var WildStream = require('./WildStream');

var WildRTCProxy = function(ref) {
    this.wildEmitter = new EventEmitter();
    this.wsUri;
    this.kurento;
    this.roomId = ref.toString().split('/').pop();
    this.uid = ref.getAuth().uid;
    this.room;
    // this.participantList = {};
    this.localParticipant;
    this.localStream;
    this.kurentoStream;
}

WildRTCProxy.prototype.join = function(callback) {
    var self = this;
    this.wsUri = 'wss://proxy.wilddog.com/room';
    this.kurento = KurentoRoom(self.wsUri, function(err, kurento) {
        if (err) {
            console.error(err);
        };
        self.room = kurento.Room({ room: self.roomId, user: self.uid });
        self.room.connect();
        self.room.addEventListener('room-connected', function(roomEvent) {
            var streams = roomEvent.streams;
            for (var i = 0; i < streams.length; i++) {
                var remoteId = streams[i].getGlobalID();
                streams[i].addEventListener("stream-recive", function(data) {
                    var wildStream = new WildStream(remoteId);
                    wildStream.setStream(data.stream);
                    self.wildEmitter.emit('stream_added', wildStream);
                });
            }
        });
        self.room.addEventListener("stream-added", function(data) {
            data.stream.addEventListener("stream-recive", function(stream) {
                var wildStream = new WildStream(data.stream.getGlobalID());
                wildStream.setStream(stream.stream);
                self.wildEmitter.emit('stream_added', wildStream);
            });
        });
        self.room.addEventListener("stream-published", function(data) {
            console.log('publish success ' + data.stream.getWrStream());
        });
        self.room.addEventListener('stream-removed', function(data) {
            var wildStream = new WildStream(data.stream.getGlobalID());
            wildStream.setStream(null);
            self.wildEmitter.emit('stream_removed', wildStream);
        });
        callback();
    })
};

WildRTCProxy.prototype.leave = function() {
    this.kurento.close();
};

WildRTCProxy.prototype.getLocalStream = function(options, callback, cancelCallback) {
    var self = this;
    if (options != null) {
        if (options['video'] == true) {
            options['video'] = {
                "mandatory": {
                    frameRate: 15,
                    "width": 320,
                    "height": 240
                }
            }
        }
        navigator.getUserMedia(options, function(stream) {
            var wildStream = new WildStream(self.uid);
            wildStream.setStream(stream);
            self.localStream = wildStream;
            callback(wildStream);
        }, function(err) {
            cancelCallback(err);
        })
    } else {
        navigator.getUserMedia({
            'audio': true,
            'video': {
                frameRate: 15,
                "width": 320,
                "height": 240
            }
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

WildRTCProxy.prototype.addStream = function(wildStream) {
    var self = this;
    self.localParticipant = new Participant(self.kurento, 'local', self.room, { id: self.uid });
    self.kurentoStream = new KurentoStream(self.kurento, true, self.room, { id: self.uid, participant: self.localParticipant });
    console.log(self.localParticipant.getStreams());
    self.localParticipant.addStream(self.kurentoStream);
    console.log(self.localParticipant.getStreams());
    self.kurentoStream.mirrorLocalStream(wildStream.getStream());
    self.kurentoStream.publish();
};

WildRTCProxy.prototype.removeStream = function() {
    this.kurentoStream.unpublish();
};

WildRTCProxy.prototype.on = function(string, callback, cancelCallback) {
    if (string != 'stream_added' && string != 'stream_removed') {
        cancelCallback();
    } else if (string == 'stream_added') {
        this.wildEmitter.on('stream_added', callback);
    } else if (string == 'stream_removed') {
        this.wildEmitter.on('stream_removed', callback);
    }
};

WildRTCProxy.prototype.off = function(string) {
    if (string == 'stream_added' || string == 'stream_removed') {
        this.WildEmitter.off(string);
    }
};

module.exports = WildRTCProxy;
