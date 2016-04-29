var WildData = function(ref) {
    this.ref = ref;

}

WildData.prototype.onUserAdd = function(uid, callback) {
    this.ref.child('userList').on('child_added', function(snap) {
        if (snap.key() != uid) {
            callback(snap.key());
        }
    });
};

WildData.prototype.onUserRemoved = function(uid, callback) {
    this.ref.child('userList').on('child_removed', function(snap) {
        callback(snap.key());
    });
};

WildData.prototype.join = function(uid, callback) {
    var self = this;
    // self.ref.child('userList/' + uid + '/state').once('value', function(snap) {
    //     if (snap.val() == 'created') {
    //         var errString = 'Error:user uid:' + uid + ' exist!';
    //         callback(errString);
    //     } else {
    //         self.ref.child('userList/' + uid).onDisconnect().remove();
    //         self.ref.child('users/' + uid).onDisconnect().remove();
    //         self.ref.child('userList/' + uid).update({ 'state': 'created' }, function(err) {
    //             if (err == null) {
    //                 callback();
    //             } else {
    //                 callback(err);
    //             }
    //         })
    //     }
    // })
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
    // ref.child('userStates').off('child_changed');
    this.ref.child('users/' + uid).remove();
    this.ref.child('userList/' + uid).remove();
    // ref.child('userStates/' + uid).remove();
}

WildData.prototype.onceKey = function(remoteid, callback) {
    this.ref.child('keys/' + remoteid).once('value', function(data) {
        callback(data.val());
    })
}

WildData.prototype.onStreamRemove = function(ref, callback) {
    ref.on('value', function(data) {
        if (data.val() == null) {
            callback();
        }
    })
}

WildData.prototype.offStreamRemove = function(ref, callback) {
    ref.off('value');
}

module.exports = WildData;
