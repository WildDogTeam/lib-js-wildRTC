var WildEmitter = require("wildemitter");
var adapter = require('./adapter.debug');

var Receiver = function(ref, onStream, config) {
    this.ref.onDisconnect().remove();
    this.peerConnection = null;
    this.ref = ref;
    this.onStream = onStream;
    this.offerRef = this.ref.child("offer");
    this.answerRef = this.ref.child("answer");
    this.senderCandiRef = this.ref.child("senderCandi");
    this.receiverCandiRef = this.ref.child("receiverCandi");
    this.config = config || {};
    this.init_();

}
WildEmitter.mixin(Receiver);
module.exports = Receiver;
Receiver.prototype.init_ = function() {
    this.offerRef.on('value', this.offerCb_, this);
}

Receiver.prototype.candidateCb_ = function(snap) {
    var sdp = JSON.parse(snap.val());
    if (sdp != null) {
        var candidate = new RTCIceCandidate(sdp);
        this.peerConnection.addIceCandidate(candidate, function() {}, function(err) {
            if (err)
                console.error(err);
        })
    }
}

Receiver.prototype.sendAnswer_ = function(cb) {
    this.peerConnection.createAnswer(function(desc) {
        this.peerConnection.setLocalDescription(desc, function() {
            this.answerRef.set(JSON.stringify(desc), function(err) {
                if (err) {
                    cb(err);
                } else {
                    cb(null);
                }
            });
        }.bind(this), function(err) {
            cb(err);
        });
    }.bind(this), function(err) {
        cb(err);
    })
}
Receiver.prototype.offerCb_ = function(snapshot) {
    var offer = snapshot.val();
    if (offer == null) {
        return;
    }
    this.peerConnection = new RTCPeerConnection();
    this.iceConnectionState = this.peerConnection.iceConnectionState;
    this.localDescription = this.peerConnection.localDescription
    this.iceGatheringState = this.peerConnection.iceGatheringState;
    this.peerIdentity = this.peerConnection.peerIdentity;
    this.remoteDescription = this.peerConnection.remoteDescription;
    this.signalingState = this.peerConnection.signalingState;
    this.peerConnection.oniceconnectionstatechange = function(ev) {
        this.iceConnectionState = this.peerConnection.iceConnectionState;
        // if (this.iceConnectionState != 'closed') {
        //     this.ref.child("iceConnectionState").set(this.iceConnectionState);
        // }
        if (this.iceConnectionState == 'failed' || this.iceConnectionState == 'disconnected' || this.iceConnectionState == 'closed') {
            this.ref.remove();
            this.offerRef.off('value');
            this.senderCandiRef.off('child_added');
            clearInterval(this.tick);
            this.tick = null;
            this.emit("disconnected");
        }
        if (this.iceConnectionState == 'connected') {
            this.emit('connected');
        }

    }.bind(this);

    this.bufferedNewCandidate = {};
    this.peerConnection.onicecandidate = function(ev) {
        if (ev.candidate == null) {
            return;
        }
        var data = JSON.stringify(ev.candidate);

        var ref = this.receiverCandiRef.push();
        var key = ref.key();
        this.bufferedNewCandidate[key] = data;

    }.bind(this);
    this.tick = setInterval(function() {
        if (Object.keys(this.bufferedNewCandidate).length > 0) {
            this.receiverCandiRef.update(this.bufferedNewCandidate);
            this.bufferedNewCandidate = {};
        }
    }.bind(this), 1000);
    this.peerConnection.onaddstream = function(ev) {
        this.onStream.call(this, ev.stream);
    }.bind(this);

    //回answer 并且set remoteref
    var desc = new RTCSessionDescription(JSON.parse(offer));

    this.peerConnection.setRemoteDescription(desc, function() {
        this.sendAnswer_(function(err) {
            if (err) {
                console.error(err);
            }
        });
        //listen to candidate
        this.senderCandiRef.on("child_added", this.candidateCb_, this);
    }.bind(this), function(err) {
        console.error(err);

    });

    // }
}

Receiver.prototype.close = function() {
    this.peerConnection.close();
}
