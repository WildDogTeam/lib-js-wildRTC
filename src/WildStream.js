var WildStream = function(uId) {
    this.uId = uId;
    this.stream;
};

WildStream.prototype.getId = function() {
    return this.uId;
};

WildStream.prototype.getStream = function() {
    return this.stream;
}

WildStream.prototype.setStream = function(stream) {
    this.stream = stream;
};

WildStream.prototype.bindToDOM = function(elementId) {
    attachMediaStream(document.getElementById(elementId), this.stream);
}

module.exports = WildStream;
