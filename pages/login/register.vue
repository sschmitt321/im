<template>
	<view>
		<cu-custom bgColor="bg-gradual-blue" :isBack="true">
			<template #backText></template>
			<template #content>{{ $t('user.register') }}</template>
		</cu-custom>
		<view style="height:100rpx;"></view>
		<view class="padding im-flex im-rows im-justify-content-center mb-10">
			<view class="im-flex im-rows im-justify-content-center">
				<image class="login-logo " :src="globalConfig.sysInfo.logo ?? packData.logo" mode="fixWidth"></image>
				
			</view>
		</view>
		<view class="im-flex im-rows im-justify-content-center">{{globalConfig.sysInfo.name ?? packData.name}}</view>
		<form>
			<view class="cu-form-group margin-top">
				<view class="title">{{ $t('user.account') }}</view>
				<input :placeholder="placeholder"  class="uni-input" maxlength="32" name="input" v-model="regForm.account" @input="handleInput"/>
			</view>
			<view class="cu-form-group margin-top">
				<view class="title">{{ $t('user.nickname') }}</view>
				<input :placeholder="$t('user.inputNickname')"  maxlength="32" name="input" v-model="regForm.realname"/>
			</view>
			<view class="cu-form-group" v-if="parseInt(globalConfig.sysInfo.regauth)">
				<view class="title">{{ $t('user.captcha') }}</view>
				<input :placeholder="$t('user.inputCaptcha')" maxlength="6" name="input" v-model="regForm.code"/>
				<button class='cu-btn bg-blue shadow' @tap="sendCode">{{ $t('user.sendCode') }}</button>
			</view>
			<view class="cu-form-group">
				<view class="title">{{ $t('user.password') }}</view>
				<input :placeholder="$t('user.inputPass')" maxlength="32" type="password" name="input" v-model="regForm.password"/>
			</view>
			<view class="cu-form-group">
				<view class="title">{{ $t("user.repass") }}</view>
				<input :placeholder="$t('user.inputRepass')" maxlength="32" type="password" name="input" v-model="regForm.repass"/>
			</view>
		</form>
		<view class="flex flex-direction im-login-btn">
			<button class="cu-btn lg bg-blue" @tap="login()">{{ $t('user.register') }}</button>
		</view>
		<view class="footer-version c-999">
			{{globalConfig.sysInfo.name ?? packData.name}} for {{packData.version}}
		</view>
	</view>
</template>

<script>
	import { useloginStore } from '@/store/login'
	import pinia from '@/store/index'
	import packageData from "../../package.json"
	const loginStore = useloginStore(pinia)
	export default {
		data() {
			return {
				regForm:{
					account:'',
					realname:'',
					password:'',
					repass:'',
					code:''
				},
				placeholder:this.$t('user.inputAccountLimit'),
				forget:false,
				packData:packageData,
				globalConfig:loginStore.globalConfig
			}
		},
		watch:{
			forget(val){
			  if(val){
				this.regForm.password='123456';
			  }
			}
		},
		mounted() {
			let regauth=this.globalConfig.sysInfo.regauth ?? 0;
		    if(regauth==1){
				this.placeholder=this.$t('user.inputPhone');
		    }else if(regauth==2){
				this.placeholder=this.$t('user.inputEmail');
		    }else if(regauth==3){
				this.placeholder=this.$t('user.inputEmailOrPhone');
		    }
		},
		methods: {
			handleInput(event) {
			  let value = event.detail.value;
			  let filteredValue = value.replace(/[\u4e00-\u9fa5]/g, '');
			  this.regForm.account = filteredValue;
			},
			sendCode(){
			  if(!this.regForm.account){
				uni.showToast({
					title: this.$t('user.inputAccount'),
					icon: "none"
				});
				return false;
			  }
			  let data={
				account:this.regForm.account,
				type:2
			  }
			  this.$api.LoginApi.sendCode(data).then((res)=>{
				  uni.showToast({
				  	title: res.msg,
				  	icon: "none"
				  });
			  })
			},
			login(){
				if(this.regForm.account==""){
					uni.showToast({
						title: this.$t('user.inputAccount'),
						icon: "none"
					});
					return false;
				}
				if(this.regForm.realname==""){
					uni.showToast({
						title: this.$t('user.inputNickName'),
						icon: "none"
					});
					return false;
				}
				if(this.regForm.password=="" && this.regForm.password.length<6 && this.regForm.password>16){
					uni.showToast({
						title: this.$t('user.passLimit'),
						icon: "none"
					});
					return false;
				}
				if(this.regForm.password!=this.regForm.repass){
					uni.showToast({
						title: this.$t('user.samePass'),
						icon: "none"
					});
					return false;
				}
				this.$api.LoginApi.register(this.regForm).then(res => {
					if (res.code == 0) {
						setTimeout(()=>{
							uni.reLaunch({
								url: '/pages/login/index'
							})
						},2000)
					}
				})
				
			},
		}
	}
</script>

<style scoped>
	.login-logo {
		width: 180rpx;
		height: 180rpx;
		font-size: 80rpx;
		text-align: center;
		line-height: 120rpx;
		border-radius: 18rpx;
	}
	.footer-version{
		width:100%;
		text-align: center;
		position: fixed;
		bottom: 40rpx;
	}
	.remark-title{
		font-weight: 600;
	}
	.im-reg-btn{
		padding:30rpx;
	}
	.im-login-btn{
		padding:30rpx;
	}
	.forget{
		padding:30rpx;
		text-align: right;
	}
</style>
