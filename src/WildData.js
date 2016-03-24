var WildData = function(ref) {
    this.ref = ref;

}

WildData.prototype.onUserAdd = function(uid, callback) {
    this.ref.child('users').on('child_added', function(snap) {
        if (snap.key() != uid) {

            callback(snap.key());
        }
    });
};

WildData.prototype.onUserRemoved = function(uid, callback) {
    this.ref.child('users').on('child_removed', function(snap) {
        this.ref.child('users/' + uid + '/send/' + snap.key()).remove();
        this.ref.child('users/' + uid + '/receive/' + snap.key()).remove();
        callback(snap.key());
    });
};

// WildData.prototype.onUserState = function(callback) {
//     ref.child('userStates').on('child_changed', function(snap){
//      callback(snap.key());
//     });
// };

WildData.prototype.join = function(uid, callback) {
    var self = this;
    self.ref.child('users/' + uid + '/state').once('value', function(snap) {
        if (snap.val() == 'created') {
            var errString = 'Error:user uid:' + uid + ' exist!';
            callback(errString);
        } else {
            self.ref.child('users/' + uid).onDisconnect().remove();
            self.ref.child('users/' + uid).update({ 'state': 'created' }, function(err) {
                if (err == null) {
                    callback();
                } else {
                    callback(err);
                }
            })
        }
    })
};

WildData.prototype.leave = function(uid) {
    this.ref.child('users').off('child_added');
    this.ref.child('users').off('child_removed');
    // ref.child('userStates').off('child_changed');
    this.ref.child('users/' + uid).remove();
    // ref.child('userStates/' + uid).remove();
}

WildData.prototype.onceKey = function(remoteid, callback) {
    this.ref.child('keys/' + remoteid).once('value', function(data) {
        callback(data.val());
    })
}

module.exports = WildData;
