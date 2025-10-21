<template>
	<view>
		<cu-custom bgColor="bg-main-bar" :isBack="true">
			<template #backText></template>
			<template #content>{{ $t('user.setting') }}</template>
		</cu-custom>
		
		<view class="cu-bar bg-white solid-bottom margin-top">
			<view class="action">{{ $t('user.newMessage') }}</view>
		</view>
		
		<view class="cu-list menu">
			<view class="cu-item">
				<view class="content">
					<text>{{ $t('user.voice') }}</text>
				</view>
				<view class="action">
					<switch class="switch" @change="setVoice" :class="setting.voiceStatus?'checked':''" :checked="setting.voiceStatus"></switch>
				</view>
			</view>
			<view class="cu-item">
				<view class="content">
					<text>{{ $t('user.vibration') }}</text>
				</view>
				<view class="action">
					<switch class="switch" @change="setVibrate" :class="setting.vibrateStatus?'checked':''" :checked="setting.vibrateStatus"></switch>
				</view>
			</view>
		</view>
		
		<view class="cu-bar bg-white solid-bottom margin-top">
			<view class="action">{{ $t('user.otherSetting') }}</view>
		</view>
		
		<view class="cu-list menu">
			<view class="cu-item">
				<view class="content">
					<text>{{ $t('user.circleAvatar') }}</text>
				</view>
				<view class="action">
					<switch class="switch" @change="setAvatar" :class="setting.circleAvatar?'checked':''" :checked="setting.circleAvatar"></switch>
				</view>
			</view>
			<view class="cu-item">
				<view class="content">
					<text>{{ $t('user.language') }}</text>
				</view>
				<view class="action">
					<picker mode="selector" :range="langList" @change="changeLanguage" range-key="key">
						<view class="uni-input">{{selectedLang.key}} <text class="cuIcon-right"></text></view>
					</picker>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { useloginStore } from '@/store/login'
	import config from "@/common/config"
	import pinia from '@/store/index'
	const loginStore = useloginStore(pinia)
	export default {
		data() {
			return {
				loginStore:loginStore,
				globalConfig:loginStore.globalConfig,
				setting:{
					voiceStatus:true,
					vibrateStatus:false,
					circleAvatar:false
				},
				selectedLang:'',
				langList:config.langList()
			}
		},
		onLoad(options){
			var lang=uni.getStorageSync('language');
			if(lang){
				this.selectedLang=lang;
				this.$i18n.locale = lang.value;
				uni.setLocale(lang.value);
			}
		},
		created() {
			let setting=uni.getStorageSync('appSetting') ?? '';
			if(setting){
				this.setting=setting;
			}
		},
		methods: {
			// 更换语言
			 changeLanguage(e) {
				let lang=this.langList[e.detail.value];
				this.selectedLang=lang;
			    this.$i18n.locale = lang.value;
				uni.setLocale(lang.value);
				uni.setStorageSync('language',lang);
				if(this.selectedLang.value!=lang.value){
					uni.reLaunch({
						url: '/pages/index/index'
					});
				}
				
			},
			setVoice(e){
				this.setting.voiceStatus=e.detail.value
				this.saveSet();
			},
			setVibrate(e){
				this.setting.vibrateStatus=e.detail.value
				this.saveSet();
			},
			setAvatar(e){
				this.setting.circleAvatar=e.detail.value
				this.saveSet();
			},
			saveSet(){
				loginStore.setAppSetting(this.setting)
			}
		}
	}
</script>

<style>

</style>
