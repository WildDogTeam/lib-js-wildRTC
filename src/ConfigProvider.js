var ConfigProvider = function(appid, ref) {
    this.ref = ref;
    this.appid = appid;
    this.configuration = {};
};

ConfigProvider.prototype.getConfig = function(callback) {
    var token = this.ref.getAuth().token;
    console.log(token);
    var req = new XMLHttpRequest();
    var url = 'https://auth.wilddog.com/v1/' + this.appid + '/users/webrtc/secret?token=';
    req.onreadystatechange = function() {
        if (callback && req.readyState === 4) {
            var res = null;
            if (req.status == 200) {
                var message = JSON.parse(req.responseText);
                this.configuration = {};
                this.configuration.iceServers = message.iceServers;
                callback(this.configuration);
            }
        }
    };
    req.open('GET', url + token, true);
    req.send(null);
}

exports.ConfigProvider = ConfigProvider;
