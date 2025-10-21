// #ifdef H5
import quill from "quill";
window.Quill = quill;
// #endif

// #ifndef VUE3
import Vue from 'vue'
import App from './App'



Vue.config.productionTip = false

import cuCustom from './components/cu-custom'
Vue.component('cu-custom', cuCustom)


App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()
// #endif



// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
import App from './App.vue'
import cuCustom from './components/cu-custom'
import util from '@/utils/utils.js'
import store from './store'
import '@/utils/request'
import api from '@/api/index.js';
import socketIO from '@/common/socket.js';
import config from '@/common/config.js';
import Empty from "@/components/Empty.vue" //通用空状态
import Tags from "@/components/Tags.vue" //通用标签

const i18n = config.i18n;

export function createApp() {
	const app = createSSRApp(App)
	app.config.globalProperties.appStatus = true;
	app.config.globalProperties.$util = util;
	app.config.globalProperties.$api = api;
	app.config.globalProperties.$store = store;
	app.config.globalProperties.socketIo = new socketIO()
	app.component('cu-custom', cuCustom)
	app.component('Empty', Empty)
	app.component('Tags', Tags)
	app.use(store);
	// 使用 i18n
	app.use(i18n);
	// #ifdef H5
	window.mainApp = app;
	// #endif
	return {
		app
	}
}
// #endif