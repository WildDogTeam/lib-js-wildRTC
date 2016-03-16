# lib-js-wildRTC
使用Wilddog实现的实时音视频聊天库.可使用test.html来测试。


## 创建引用

要使用 WildRTC，必须先创建 WildDog 引用并登录：

```js
var ref = new Wilddog("https://<appId>.wilddogio.com/");
ref.authAnonymously();
ref.onAuth(function(auth) {
    if (auth != null) {
        var rtc = new WildRTC(ref);
    }
}
```

<hr>

## 加入会话

创建 WildRTC 引用之后，就可以通过`join(callback)` 进入会话：

```js
wildRTC.join(callback(err));
```
<hr>

## 监听远端媒体流

可以使用`on(type,callback,cancelCallback)`的事件监听来获取远端的媒体流。

```js
wildRTC.on("stream_added",function(WildStream){
	console.log(WildStream.getId());	//结果会在 console 中打印出远端WildStream的Id
})
```

回调函数的参数是一个 WildStream 对象类型，调用它的`getStream()`函数得到媒体流。上边这个例子中，`stream_added`这个事件会在每次收到远端 WildStream 时被触发。

同时，我们还提供`stream_removed`事件，用来监听远端停止发送 WildStream事件，并在回调函数中提供停止发送的远端WildStream 。

<hr>

## 获取本地媒体流

我们提供`getLocalStream(options,callback,cancelCallback)`来获取本地媒体流。

```js
wildRTC.getLocalStream(options,function(WildStream){
	console.log(WildStream.getId());	//结果会在 console 中打印出远端WildStream的Id
}, function(err){
	console.log(err);			//打印错误日志。
})
```

options 内容为设置获取媒体流的规格，为JSON 字符串。可以传入`{"video":true|false, "audio":true|false}`来设置`video`和`audio`的开启情况。回调函数中的参数为 WildStream 对象类型。


<hr>

## 向远端发送媒体流

拿到WildStream后，通过`addStream(wildStream)`向远端其他用户发送媒体流。

```js
wildRTC.addStream(wildStream);
```

<hr>

## 媒体流与页面绑定

WildStream对象提供`bindToDOM(elementId)`快速将媒体流与页面绑定。

```js
wildStream.bindToDOM('self_view');
```

更多详细接口见 docs 下的API文档。

