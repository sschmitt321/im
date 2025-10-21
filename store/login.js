import {
	defineStore
} from 'pinia'
import LoginApi from '@/api/login.js'
let defaultConfig={
    sysInfo: {
        logo: "",
        name: "Im",
        diyName: 0, //企业模式是否可以自定义名字
        regauth: 0, //注册权限
        regtype: 2, //注册方式
        runMode: 2, //运行模式
        ipregion: 1, //是否显示ip
        multipleLogin: 0 //是否都设备登录
    },
    chatInfo: {
        online: 1,  //是否展示在线状态
        webrtc: 1,   //是否开启音视频通话
        dbDelMsg: 1,  //是否允许删除消息
        redoTime: 86400,  //允许撤回的时间s
        groupChat: 1,   //是否开启群聊
        simpleChat: 1   //是否开单聊
    },
    compass: {
        mode: 2,
        status: 0   //发现页面状态
    },
    demon_mode: false
};

export const useloginStore = defineStore({
	id: 'login', // id必填，且需要唯一
	state: () => {
		return {
			userInfo: uni.getStorageSync('userInfo') ? uni.getStorageSync('userInfo') : {},
			globalConfig: uni.getStorageSync('globalConfig') ? uni.getStorageSync('globalConfig') : defaultConfig,
			appSetting: uni.getStorageSync('appSetting') ? uni.getStorageSync('appSetting') : [],
			multiport: false,
			systemNotify:true,
			systemBattery:true
		}
	},
	// actions 用来修改 state
	actions: {
		login(userInfo) {
			// 登陆后本地保存登录信息
			uni.setStorageSync('userInfo', userInfo)
			this.userInfo = userInfo;
			// 登陆后需要触发一次更新联系人
			uni.$emit('socketStatus', true);

		},
		logout() {
			uni.removeStorageSync('userInfo');
			uni.removeStorageSync("authToken");
			this.userInfo = {};
			uni.reLaunch({
				url: "/pages/login/index"
			})
		},
		getGlobalConfig() {
			// #ifdef APP-PLUS
			let network = null
			if (plus.os.name === "iOS") {
				uni.getNetworkType({ //首次判断网络状态
					success: (res) => {
						const networkType = res.networkType;
						if (networkType === 'none') { //none是没有网络
							network = false
						} else {
							network = true
						}
					},
				})
				if (!network) {
					const isNetWork = uni.getStorageSync("isNetWork");
					if (!isNetWork) {
						uni.reLaunch({
							url: "/pages/index/index"
						})
						setTimeout(() => {
							this.getGlobalConfig();
						}, 1000); // 1秒后递归重试
						return false;
					}
				} else {
					uni.setStorageSync('isNetWork', true);
				}
			}
			// #endif
			LoginApi.getSystemInfo().then((res) => {
				this.globalConfig = res.data;
				uni.setStorageSync('globalConfig', res.data)
			})
		},
		setAppSetting(setting) {
			uni.setStorageSync('appSetting', setting)
			this.appSetting = setting
		}
	}
})