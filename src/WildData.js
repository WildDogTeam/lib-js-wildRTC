var WildData = function(ref) {
    this.ref = ref;

}

WildData.prototype.onUserAdd = function(uid, callback, cancelCallback) {
    this.ref.child('userList').on('child_added', function(snap) {
        if (snap.key() != uid) {
            callback(snap.key());
        }
    }, function(err) {
        var error = new Error("Error:onUserAdd:" + err.message);
        cancelCallback(error);
    });
};

WildData.prototype.onUserRemoved = function(uid, callback, cancelCallback) {
    this.ref.child('userList').on('child_removed', function(snap) {
        this.ref.child('userList/' + snap.key()).remove();
        this.ref.child('users/' + uid + '/send/' + snap.key()).remove();
        this.ref.child('users/' + uid + '/receive/' + snap.key()).remove();
        callback(snap.key());
    }, function(err) {
        var error = new Error("Error:onUserRemoved:" + err.message);
        cancelCallback(error);
    });
};

WildData.prototype.join = function(uid, callback) {
    var self = this;
    self.ref.child('userList/' + uid).onDisconnect().remove();
    self.ref.child('users/' + uid).onDisconnect().remove();
    self.ref.child('userList/' + uid).update({ 'state': 'created' }, function(err) {
        if (err == null) {
            callback();
        } else {
            callback(err);
        }
    })
};

WildData.prototype.leave = function(uid) {
    this.ref.child('userList').off('child_added');
    this.ref.child('userList').off('child_removed');
    this.ref.child('users/' + uid).remove();
    this.ref.child('userList/' + uid).remove();
}

WildData.prototype.onceKey = function(remoteid, callback, cancelCallback) {
    this.ref.child('keys/' + remoteid).once('value', function(data) {
        callback(data.val());
    }, function(err) {
        var error = new Error("Error:onceKey:" + err.message);
        cancelCallback(error);
    })
}

WildData.prototype.onStreamRemove = function(ref, callback, cancelCallback) {
    ref.on('value', function(data) {
        if (data.val() == null) {
            callback();
        }
    }, function(err) {
        var error = new Error("Error:onStreamRemove:" + err.message);
        cancelCallback(error);
    })
}

WildData.prototype.offStreamRemove = function(ref) {
    ref.off('value');
}

module.exports = WildData;
