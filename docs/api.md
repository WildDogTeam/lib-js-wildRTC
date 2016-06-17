/*
Title: API文档
Sort: 3
*/

# WildRTC(*Methods*)

## new WildRTC

###### 定义

new WildRTC(ref)

###### 说明

初始化一个 WildRTC 实例。

###### 参数

* ref `Wilddog`
Wilddog 实例，需要经过 auth 认证。

###### 返回值

WildRTC 对象的引用。

###### 示例

```js
ref.authAnonymously(function(err) {
    console.error(err);
});
ref.onAuth(function(auth) {
    if (auth != null) {
        var rtc = new WildRTC(ref);
    }
}
```

<hr>

## join()

###### 定义

join(onComplete)

###### 说明

将 WildRTC 实例加入会话。

###### 参数

* onComplete `function(err)`
如果操作成功`err`为`null`；否则，否则，`err`为错误信息。

###### 示例

```js
var rtc = new WildRTC(ref);

rtc.join(function(err){
	...
});
```

<hr>

## leave()

###### 定义

leave()

###### 说明

离开已加入的会话。

###### 示例

```js
var rtc = new WildRTC(ref);

rtc.join(function (err){
  if(err == null)
  {
    //加入成功，退出会话
    rtc.leave();
  }
});
```

<hr>

## addStream()

###### 定义

addStream(stream,onComplete)

###### 说明

向 WildRTC 实例已加入的会话中添加本地音视频流。

###### 参数

* stream `WildStream`
WildStream 流对象。

* onComplete `function(err)`
如果操作成功`err`为`null`；否则，`err`为错误信息。

###### 示例

```js
var rtc = new WildRTC(ref);

rtc.join(function (err){
  if(err == null)
  {
    //加入成功后，将流加入会话
    rtc.addStream(stream,function(err){
    	...
    });
  }
});
```

<hr>

## removeStream()

###### 定义

removeStream()

###### 说明

将 WildRTC 实例中的本地音视频流移除。

###### 示例

```js
var rtc = new WildRTC(ref);

rtc.join(function (err){
  if(err == null)
  {
    //加入成功后，将流加入会话
    rtc.addStream(stream,function(err){
    	...
    });
    ...
    //移除流
    removeStream();
  }
});
```

<hr>

## on()

###### 定义

on(type, callback, \[cancelCallback\])

###### 说明

监听某个事件,注册回调函数。

###### 参数

* type `String`

>|事件|说明|

|----|----|

|stream_added| 当接收到新的远端流时触发|

|stream_removed|当原有的远端流断开时触发 |

* callback `function(stream)`
`stream`为`WildStream`类型，当监听到`stream_added`事件时，回调函数被触发，`stream`参数为新增加的流；当监听到`stream_removed`事件时，回调函数被触发，`stream`参数为被移除的流。

* cancelCallback `function(err)`
如果操作失败，这个函数会被调用。`err`为错误信息。

###### 示例

```js
var rtc = new WildRTC(ref);

rtc.on('stream_added', function(wildStream) {
  //将流绑定到DOM播放
  wildStream.bindToDOM('remote_view');
},function(err){
	...
});
```

<hr>

## off()

###### 定义

off(type, callback)

###### 说明

取消监听事件。取消之前用on()注册的回调函数。

###### 参数

* type `String`
`stream_added` `stream_removed`之一。

* callback `function(err)`

###### 示例

```js
var rtc = new WildRTC(ref);

rtc.on('stream_added', function(wildStream) {
  //将流绑定到DOM播放
  var remote_view = document.getElementById('remote_view');
  wildStream.bindToDOM(remote_view);
});

rtc.off('stream_added', function(err){

});
```

<hr>

## getLocalStream()

###### 定义

getLocalStream(options, callback, cancelCallback)

###### 说明

获取本地流。

###### 参数

* options JSON 字符串
可以分别对`video`和`audio`进行设置，支持 bool 值，其中 `video` 还可以使用"FrameRate","Width"和"Height"来设置视频的帧率和分辨率。`video`设为 true 则默认使用最高的帧率和分辨率。


* callback `function(stream)`
`stream`为`WildStream`类型。

* cancelCallback `function(err)`
`err`为错误信息。

###### 示例

```js
var rtc = new WildRTC(ref);

rtc.getLocalStream({"video":{"FrameRate":15,"Width":320,"Height":240}, "audio":false}, function(stream){
	...
},function(err){
	...
});
```
<hr>

# WildStream(*Methods*)

## bindToDOM()

###### 定义

bindToDOM(element)

###### 说明

将`WildStream`中的流绑定到一个DOM对象中播放。

###### 参数

* element `DOM`
HTML 页面的某个 DOM 对象，可以为 \<video\> 或 \<audio\>。

###### 示例

```js
<body>
<video id="local_view" class="shadow" autoplay="true" muted></video>
</body>
<script>
var rtc = new WildRTC(ref);

rtc.getLocalStream({"video":true, "audio":false}, function(stream){
  var local_view = document.getElementById('local_view');
  stream.bindToDOM(local_view);
});
</script>
```

<hr>

## getId()

###### 定义

getId()

###### 说明

获取`WildStream`对应的用户 Id。

###### 示例

```js
var rtc = new WildRTC(ref);

rtc.getLocalStream({"video":true, "audio":false}, function(stream){
  var userId = stream.getId();
});

```

<hr>

## getStream()

###### 定义

getStream()

###### 说明

获取`WildStream`中的原始音视频流。

###### 示例

```js
var rtc = new WildRTC(ref);

rtc.getLocalStream({"video":true, "audio":false}, function(stream){
  var originStream = stream.getStream();
});

```
<hr>
