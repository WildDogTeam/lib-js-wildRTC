var WildEmitter = require("wildemitter");
var adapter = require('./adapter.debug');

var Sender = function(ref, stream, config) {
    this.ref.onDisconnect().remove();
    this.peerConnection = null;
    this.ref = ref;
    this.stream = stream;
    this.offerRef = this.ref.child("offer");
    this.answerRef = this.ref.child("answer");
    this.senderCandiRef = this.ref.child("senderCandi");
    this.receiverCandiRef = this.ref.child("receiverCandi");
    this.config = config || {};
    this.init_();

}
WildEmitter.mixin(Sender);
module.exports = Sender;
Sender.prototype.init_ = function() {
    this.peerConnection = new RTCPeerConnection();
    this.iceConnectionState = this.peerConnection.iceConnectionState;
    this.localDescription = this.peerConnection.localDescription
    this.iceGatheringState = this.peerConnection.iceGatheringState;
    this.peerIdentity = this.peerConnection.peerIdentity;
    this.remoteDescription = this.peerConnection.remoteDescription;
    this.signalingState = this.peerConnection.signalingState;
    this.peerConnection.addStream(this.stream);
    this.peerConnection.oniceconnectionstatechange = function(ev) {
        this.iceConnectionState = this.peerConnection.iceConnectionState;
        // if (this.iceConnectionState != 'closed') {
        //     this.ref.child("iceConnectionState").set(this.iceConnectionState);
        // }
        if (this.iceConnectionState == 'failed' || this.iceConnectionState == 'disconnected' || this.iceConnectionState == 'closed') {
            this.ref.remove();
            this.answerRef.off('value');
            this.receiverCandiRef.off('child_added');
            clearInterval(this.tick);
            this.tick = null;
            this.emit("disconnected");
        }
        if (this.iceConnectionState == 'connected') {
            this.emit('connected');
        }

    }.bind(this);
    this.peerConnection.onnegotiationneeded = function(ev) {
        this.sendOffer_(function(err) {
            this.answerRef.on('value', this.answerCb_, this);
        }.bind(this));
    }.bind(this);
    this.bufferedNewCandidate = {};
    this.peerConnection.onicecandidate = function(ev) {
        if (ev.candidate == null) {
            return;
        }
        var data = JSON.stringify(ev.candidate);

        var ref = this.senderCandiRef.push();
        var key = ref.key();
        this.bufferedNewCandidate[key] = data;

    }.bind(this);
    this.tick = setInterval(function() {
        if (Object.keys(this.bufferedNewCandidate).length > 0) {
            this.senderCandiRef.update(this.bufferedNewCandidate);
            this.bufferedNewCandidate = {};
        }
    }.bind(this), 1000);

}

Sender.prototype.answerCb_ = function(snapshot) {
    var answer = snapshot.val();
    if (answer != null) {
        this.lastAnswer = answer;
        var desc = new RTCSessionDescription(JSON.parse(answer));
        this.peerConnection.setRemoteDescription(desc, function() {
            //listen to candidate
            this.receiverCandiRef.on("child_added", this.candidateCb_, this);
        }.bind(this), function(err) {
            console.error(err);
        });
    }
}
Sender.prototype.candidateCb_ = function(snap) {
    var sdp = JSON.parse(snap.val());
    if (sdp != null) {
        var candidate = new RTCIceCandidate(sdp);
        this.peerConnection.addIceCandidate(candidate, function() {}, function(err) {
            if (err)
                console.error(err);
        })
    }
}
Sender.prototype.sendOffer_ = function(cb) {
    this.peerConnection.createOffer(function(desc) {
        this.peerConnection.setLocalDescription(desc, function() {
            this.offerRef
                .set(JSON.stringify(desc), function(err) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null);
                    }
                }.bind(this));
        }.bind(this), function(err) {
            cb(err)
        });
    }.bind(this), function(err) {
        cb(err);
    })
}

Sender.prototype.close = function() {
    this.peerConnection.close();
}
