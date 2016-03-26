# lib-js-wildRTC - Wilddog 实现实时音视频聊天

使用 [Wilddog](https://www.wilddog.com) 实现的实时音视频聊天库。

## 在线示例
我们提供了一个实例，登录到同一个房间的用户之间能够进行实时音视频聊天。

[![演示截图](./docs/screenshot.jpg)](https://wildrtc.wilddogapp.com/)

## 本地运行

下载代码到本地，并进入`lib-js-wildRTC`目录

	git clone https://github.com/WildDogTeam/lib-js-wildRTC.git
	cd lib-js-wildRTC

安装 gulp，在ubuntu下使用命令

	sudo npm install gulp

安装依赖

	sudo npm install 

其中，依赖中的 wild-peerconnection 为连接层代码，项目位于https://github.com/WildDogTeam/lib-js-wildPeerConnection 。

打包成一个 js。打包后会在 lib 下生成 WildRTC.js。

	gulp build

运行测试

	gulp test

这会在本地 https://localhost:8080 建立一个 webserver，可以访问 test.html 进入聊天。

## 下载

要在你的工程中使用 WildRTC，你需要将 lib 目录下的 WildRTC.js 拷贝到本地，并在你的HTML页面中引入以下文件：

```html
<!-- Wilddog -->
<script src="https://cdn.wilddog.com/js/client/current/wilddog.js"></script>

<!-- WildRTC -->
<script src="WildRTC.js"></script>
```

你也可以通过 npm 安装 WildRTC, 他们会自动下载依赖。

```bash
$ npm install wildrtc --save
```

## API 文档

### 创建引用

要使用 WildRTC，必须先创建 Wilddog 引用并登录：

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

### 加入会话

创建 WildRTC 引用之后，就可以通过`join(callback)` 进入会话：

```js
wildRTC.join(callback(err));
```
<hr>

### 监听远端媒体流

可以使用`on(type,callback,cancelCallback)`的事件监听来获取远端的媒体流。

```js
wildRTC.on("stream_added",function(WildStream){
	console.log(WildStream.getId());	//结果会在 console 中打印出远端 WildStream 的 Id
})
```

回调函数的参数是一个 WildStream 对象类型，调用它的`getStream()`函数得到媒体流。上边这个例子中，`stream_added`这个事件会在每次收到远端 WildStream 时被触发。

同时，我们还提供`stream_removed`事件，用来监听远端停止发送 WildStream 的事件，并在回调函数中提供停止发送的远端WildStream 。

<hr>

### 获取本地媒体流

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

### 向远端发送媒体流

拿到WildStream后，通过`addStream(wildStream)`向远端其他用户发送媒体流。

```js
wildRTC.addStream(wildStream);
```

<hr>

### 媒体流与页面绑定

WildStream对象提供`bindToDOM(elementId)`快速将媒体流与页面绑定。

```js
wildStream.bindToDOM('self_view');
```

[更多API文档](./docs/api.md)

## 注册Wilddog

WildRTC 需要使用 Wilddog 数据库，你可以在此[注册](https://www.wilddog.com/my-account/signup) Wilddog 账户。

## TODO

- getLocalStream 支持更详细的配置 ： 进行中
- 多浏览器支持 ： 进行中

## 支持
如果在使用过程中有任何问题，请提 [issue](https://github.com/WildDogTeam/lib-js-wildRTC/issues) ，我会在 Github 上给予帮助。

## 相关文档

* [Wilddog 概览](https://z.wilddog.com/overview/introduction)
* [JavaScript SDK快速入门](https://z.wilddog.com/web/quickstart)
* [JavaScript SDK API](https://z.wilddog.com/web/api)
* [下载页面](https://www.wilddog.com/download/)
* [Wilddog FAQ](https://z.wilddog.com/questions)

## License
MIT
http://wilddog.mit-license.org/

## 感谢 Thanks

lib-js-wildRTC is built on and with the aid of several projects. We would like to thank the following projects for helping us achieve our goals:

Open Source:

* [JQuery](http://jquery.com) The Write Less, Do More, JavaScript Library
* [OpenWebRTC](http://www.openwebrtc.org/) A mobile-first WebRTC client framework for building native apps
* [WebRTC](https://webrtc.org/) WebRTC is a free, open project that provides browsers and mobile applications with Real-Time Communications (RTC) capabilities via simple APIs

