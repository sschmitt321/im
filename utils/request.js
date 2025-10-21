import ajax from '@/uni_modules/u-ajax/js_sdk'
import config from '@/common/config.js'
import { popup } from './native_popup.js'

const $t=config.i18n.global.t;
// 创建请求实例
const axios = ajax.create({
	// 默认配置
	baseURL: config.apiUrl,
	timeout: 10000
})
// 注册请求拦截器
axios.interceptors.request.use(
	config => {
		// 在发送请求前做些什么
		let network = null
		uni.getNetworkType({//首次判断网络状态
			success: (res) => {
				const networkType = res.networkType;
				if (networkType === 'none') {//none是没有网络
					network = false
				}else{
					network = true
				}
				if(!network){
					uni.showToast({
						title:$t('network.disconnect'),
						icon: "none",
						duration: 2500
					});
					return false;
				}
			},
		})
		return config
	},
	error => {
		uni.showToast({
			title: $t('network.expire'),
			icon: "none"
		})
		return error
	}
)

// 注册响应拦截器
axios.interceptors.response.use(
	response => {
		const res = response.data
		let msg = res.msg
		if (msg) {
			if ([400, 401,402, 403, 404, 405, 502, 500].includes(res.code)) {
				uni.showToast({
					title: msg,
					icon: "none",
					duration: 2500
				})
			} else if (res.code == 0) {
				uni.showToast({
					title: msg,
					icon: "none",
					duration: 2500
				})
			} else if (res.code == -1) {
				uni.showToast({
					title: msg,
					icon: "none",
					duration: 2500,
					success() {
						setTimeout(() => {
							uni.reLaunch({
								url: "/pages/login/index"
							})
						}, 1000)
					}
				})
			}
		}
		return res
	},
	error => {
		// 对响应错误做点什么 
		let code = error.statusCode
		switch (code) {
			case 401:
				// #ifdef APP-PLUS
				popup.show({
					title: $t('common.tips'),
					purpose: $t('network.authExpire'),
					cancelText: $t('common.exitApp'), // “不允许”按钮的自定义文本
					cancelBtnColor: '#666', // 不允许按钮颜色
					confirmText: $t('user.login') ,
					confirmBtnColor : '#0389fb', // 允许按钮颜色
					showDescription:false,
					showTip:false,
					onCancel: () => {
						const platform = plus.os.name.toLowerCase(); // 获取平台名称
						if (platform === 'ios') {
							// iOS设备退出
							const UIApplication = plus.ios.import('UIApplication');
							UIApplication.sharedApplication().performSelector('exit');
						} else if (platform === 'android') {
							// 安卓设备退出
							const mainActivity = plus.android.runtimeMainActivity();
							mainActivity.finish();
							// 确保完全退出应用
							plus.runtime.quit();
						}
					},
					onConfirm:() => {
						uni.reLaunch({
							url: "/pages/login/index"
						})
					}
				});
				// #endif
				//#ifndef APP-PLUS
					uni.showModal({
						title: $t('common.tips'),
						content: $t('network.authExpire'),
						success: (res) => {
							if (res.confirm) {
								uni.reLaunch({
									url: "/pages/login/index"
								})
							}
						},
						fail: (res) => {
							console.info('fail')
						}
					});
				// #endif
				break
			case 500:
				uni.showToast({
					title: $t('network.serverError'),
					icon: "none",
					duration: 2500
				})
				break;
			default:
				uni.showToast({
					title:$t('network.noNetwork'),
					icon: "none",
					duration: 2500
				});
				break;
		}
		return error
	}
)

//****** 带 Json 的函数 请求头统一是application/json else formData
export const apiUrl = config.apiUrl;
export const getRequest = (url, params) => {
	let Authorization = uni.getStorageSync("authToken");
	// 获取语言包设置
	let lang = uni.getStorageSync("language");
	return axios({
		method: 'get',
		url: `${url}`,
		params: params,
		header: {
			'Authorization': Authorization,
			'accept-language':lang.value
		}
	});
};
export const postRequest = (url, params) => {
	// 获取语言包设置
	let lang = uni.getStorageSync("language");
	return axios({
		method: 'post',
		url: `${url}`,
		header: {
			'Content-Type': 'application/x-www-form-urlencoded', //formdata 格式
			'Authorization':uni.getStorageSync("authToken"),
			"clientId": uni.getStorageSync('client_id'),
			"cid": uni.getStorageSync('cid'),
			'accept-language':lang.value
		},
		data: params,
	});
};
export const postJsonRequest = (url, params) => {
	// 获取语言包设置
	let lang = uni.getStorageSync("language");
	return axios({
		method: 'post',
		url: `${url}`,
		data: params,
		header: {
			'Content-Type': 'application/json', //json 格式
			'Authorization': uni.getStorageSync("authToken"),
			"clientId": uni.getStorageSync('client_id'),
			"cid": uni.getStorageSync('cid'),
			'accept-language':lang.value
		}
	});
};
export default axios
