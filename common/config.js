import CryptoJS from "crypto-js";
import { createI18n } from 'vue-i18n';
// 导入语言包
import zhCN from '@/locales/zh-Hans.json';
import enUS from '@/locales/en';

// 如果为开启ssl证书,请修改为http协议
let scheme ="https";  //协议头

// 请将下面的域名替换成自己的服务器域名，如果有端口要把端口加上
let host = 'im.mwah.meme';

// 下面的HostToken非常重要！！！！！！！！！！！！！！！！！！！

// 为了避免h5页面被其他人盗用,可以自由选择加密方式，详细教程查看readme.md文件
let hostToken="sha20401982a6fdf2ad3999e373cc9a513fbi";

// 是否开启H5的调试模式
let isVConsole = false

const langList = ()=>{
	return [
		{
			key:"简体中文",
			value:'zh-Hans'
		},
		{
			key:"English",
			value:'en'
		},
	];
}

// 创建 i18n 实例并配置语言
const i18n = createI18n({
  locale: 'zh-Hans', // 默认语言
  fallbackLocale: 'en', // 备用语言
  messages: {
    'zh-Hans': zhCN,
    'en': enUS
  }
});

// 以下内容请勿修改
// 以下内容请勿修改
// 以下内容请勿修改
// 以下内容请勿修改

// #ifdef  MP-WEIXIN
let env = wx.getAccountInfoSync()

if (env.miniProgram.envVersion == 'develop') {
	isVConsole = true
}
// #endif
//  #ifdef APP-PLUS || H5
if (process.env.NODE_ENV === 'development') {
	isVConsole = true
}
// #endif

let apiUrl = scheme + '://' + host;
let wssUrl = (scheme == 'https' ? 'wss' :'ws') + '://' + host + '/wss';

let hostMd5=CryptoJS.MD5(CryptoJS.MD5(host).toString()).toString();
if('sha'+hostMd5+'bi'!=hostToken){
	apiUrl = 'false';
	wssUrl = 'false';
}

// app更新的配置
const updateConfig = {
	url:apiUrl+'/common/pub/checkVersion',  //检查版本的接口
	bgColor:'#0389fb',  //升级主色，按钮背景颜色
	iconUrl:'' //升级小图标
}

/* 检查版本需要返回的数据说明
 * | 参数名称        | 一定返回     | 类型        | 描述
 * | -------------|--------- | --------- | ------------- |
 * | versionCode     | y        | int       | 版本号 ：20240331       |
 * | versionName     | y        | String    | 版本名称 :4.0.1     |
 * | versionInfo     | y        | String    | 版本信息 ： 修复了bug     |
 * | updateType      | y        | String    | forcibly = 强制更新, solicit = 弹窗确认更新, silent = 静默更新 |
 * | downloadUrl     | y        | String    | 版本下载链接（IOS安装包更新请放跳转store应用商店链接,安卓apk和wgt文件放文件下载链接）  |
 */


export default {
	apiUrl,
	wssUrl,
	isVConsole,
	updateConfig,
	langList,
	i18n
}