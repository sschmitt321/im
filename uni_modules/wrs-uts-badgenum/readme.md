# 设置桌面应用角标消息数量

手机类型     | 是否支持 | 是否已测试
--------    | -----  |      -----
苹果         |  支持   |  已测试(iPhone X、iPhone 16)
纯血鸿蒙next  |  支持   |  已测试
华为         |  支持   |  已测试(P40 Pro+ 鸿蒙 4.0.0)  
荣耀         |  支持   |  已测试(Magic OS8.0 android 14)
小米         |  支持   |  已测试(MIUI 12.5.1 android 10、Redmi Note 13 MIUI 14.0.8 android 13)
VIVO        |  支持   |  已测试(Funtouch OS vivo Y30 android 10)
魅族         |  支持   |  已测试(Flyme10以上才有)
OPPO        |  支持   |  已测试(需要向官网申请角标权限，目前由于OPPO平台运营策略调整暂停数字角标申请，具体恢复时间待定)
三星         |  支持   |  未测试
其他         |  支持   |  未测试  

如果有其他机型未适配，请联系作者[https://www.cnblogs.com/wenrisheng/p/18323027](https://www.cnblogs.com/wenrisheng/p/18323027)

## 集成步骤
1. 拷贝demo示例的AndroidManifest.xml、nativeResources文件夹到项目下
2. 集成插件步骤请参考[https://www.cnblogs.com/wenrisheng/p/18323027](https://www.cnblogs.com/wenrisheng/p/18323027)

## 接口

```javascript

import {
	UTSBadgeNum, setBadgeNum, isNotificationEnabled, requestEnableNotification
} from '@/uni_modules/wrs-uts-badgenum'

```


- ios请求角标权限

```javascript

let params = {}
params.types = ["badge", "sound", "alert"]
UTSBadgeNum.requestAuthorization(params, (resp) => {
	this.showMsg("requestAuthorization:" +JSON.stringify(resp))
})

```

- 纯血鸿蒙next请求角标权限

```javascript

// 通知权限是否已经开启
isNotificationEnabled((resp)=>{
	let flag = resp.flag
	if(!flag) {
		// 开启通知权限
		requestEnableNotification((result)=>{
			let enable = result.flag
			if(!enable) {
				this.showMsg(JSON.stringify(result))
			}
		})
	}
})

```

- 统一接口设置角标


```javascript

let platform = uni.getSystemInfoSync().platform
switch (platform) {
	case "android": {
		// Android可以调用同一个设置接口（setBadgeNum），也可以通过判断手机型号判断调用不同型号的接口(参考setBadgeNumAndroid)
		// this.setBadgeNumAndroid(num)
		// 华为、荣耀、小米需要打开打开通知权限里的角标权限
		var manufacturer = UTSBadgeNum.getManufacturer().toLowerCase()
		this.showMsg("manufacturer:" + manufacturer)
		if (manufacturer.includes("xiaomi")) { // 小米需要在app后台运行时设置
			this.isXiaoMi = true
		} else {
			//entryClass为app启动activity的类，uniapp默认的是io.dcloud.PandoraEntry
			var cls = "io.dcloud.PandoraEntry" 
			// 华为、荣耀、vivo、魅族参数：num、cls
			// oppo参数：num
			var params = {}
			params.num = num
			params.cls = cls
			setBadgeNum(params, (resp)=>{
				this.showMsg(JSON.stringify(resp))
			})
		}
	}
	break;
	case "ios": {
		let params = {}
		params.num = num
		setBadgeNum(params, (resp)=>{
			this.showMsg(JSON.stringify(resp))
		})
	}
	break
	case "harmonyos": {
		let params = {}
		params.num = num
		setBadgeNum(params, (resp)=>{
			let flag = resp.flag
			if(!flag) {
				this.showMsg(JSON.stringify(resp))
			}
		})
	}
	break
	default:
		break;
}

```

- 获取手机型号(仅支持Android)

```

let manufacturer = UTSBadgeNum.getManufacturer()

```

- 设置角标消息数

##### iOS

```

let num = 8
UTSBadgeNum.setBadgeNum({
	num: num
}, (resp)=>{
	
})

```

##### Android通过getManufacturer接口来判断手机型号，不同型号调用不同接口，参考demo示例
有些机型需要打开app里通知权限里面的“桌面图标角标”权限

##### 华为

```

var entryClass = "io.dcloud.PandoraEntry" // 固定这个就好
let num = 8
let params = {
	num: num,
	cls: entryClass
}
UTSBadgeNum.setBadgeNumHuawei(params, (resp)=>{})

```

##### 荣耀
需要开启通知-角标权限

```

var entryClass = "io.dcloud.PandoraEntry" // 固定这个就好
let num = 8
let params = {
	num: num,
	cls: entryClass
}
UTSBadgeNum.setBadgeNumHonor(params, (resp)=>{})

```


##### 小米
小米是通过设置消息通知的方式来设置角标的，需要开启通知角标权限，而且app要在后台运行时调用才有效，参考demo示例

```javascript

let num = 8
var channelId = "badgeChannel"
var notification = {
	number: num,
	channelId: channelId,
	contentTitle: "消息",
	contentText: "消息数",
	smallIcon: { // 小图标，必传
		type: "resource", // 固定
		defType: "drawable", // 固定
		name: "logo" // 文件名，不要带文件后缀，对应nativeResources/android/res/drawable文件夹下的图片
	},
	autoCancel: false
}
var params = {}
params.num = num
params.notification = notification
params.channel = {
	channelId: channelId,
	showBadge: true,
	channelName: "消息通知",
	importance: 4, // 3: default 4: high 2: low 5: max 1: min 0: none
	lockscreenVisibility: 1, //1: public 0: private -1: secret
	description: "消息"
}
params.id = this.notificationId
UTSBadgeNum.setBadgeNumXiaomi(params, (resp)=>{})

```

##### VIVO

```

var entryClass = "io.dcloud.PandoraEntry" // 固定这个就好
let num = 8
let params = {
	num: num,
	cls: entryClass
}
UTSBadgeNum.setBadgeNumVivo(params, (resp)=>{})

```

##### OPPO
需要向官网申请角标权限，目前由于平台运营策略调整暂停数字角标申请，具体恢复时间待定

```

let num = 8
let params = {
	num: num
}
UTSBadgeNum.setBadgeNumOPPO(params, (resp)=>{})

```

##### 魅族

```

var entryClass = "io.dcloud.PandoraEntry" // 固定这个就好
let num = 8
let params = {
	num: num,
	cls: entryClass
}
UTSBadgeNum.setBadgeNumMeiZu(params, (resp)=>{})

```

##### 其他Android机型

```

let num = 8
let params = {
	num: num
}
UTSBadgeNum.setBadgeNumOther(params, (resp)=>{})

```