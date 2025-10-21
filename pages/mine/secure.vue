<template>
	<view>
		<cu-custom bgColor="bg-main-bar" :isBack="true">
			<template #backText></template>
			<template #content>{{ $t('user.secure') }}</template>
		</cu-custom>
		
		<view class="cu-list menu mt-10">
			<view class="cu-item" @tap="editAcc">
				<view class="content">
					<text class="cuIcon-settings text-grey"></text>
					<text>{{ $t('user.myAcount') }}</text>
				</view>
				<view class="action">
					<text>{{userInfo.account}}</text>
					<text class="text-grey cuIcon-right"></text>
				</view>
			</view>
			<view class="cu-item"  @tap="modelName='show';editPass=true">
				<view class="content">
					<text class="cuIcon-lock text-blue"></text>
					<text>{{ $t('user.editPass') }}</text>
				</view>
				<view class="action">
					<text class="text-grey cuIcon-right"></text>
				</view>
			</view>
			<view class="cu-item" v-if='!userInfo.is_auth'  @tap="modelName='show';editPass=false">
				<view class="content padding-tb-sm">
					<view>
						<text class="cuIcon-vip text-orange ml-5"></text> <text class="ml-10">{{ $t('user.doAuth') }}</text></view>
					<view class="text-gray text-sm">
						<text class="cuIcon-infofill  ml-5 mr-10"></text> {{ $t('user.doAuthCorrect') }}</view>
					</view>
				<view class="action">
					<text class="text-grey cuIcon-right"></text>
				</view>
			</view>
			
			<view class="padding flex flex-direction mt-40">
				<button class="cu-btn bg-red lg" @tap="logout()">{{ $t('user.exitLogin') }}</button>
			</view>
		</view>
		<view class="cu-modal bottom-modal" :class="modelName=='show'?'show':''"  @tap="modelName=''">
			<view class="cu-dialog" @tap.stop=''>
				<view class="cu-bar bg-white">
					<view class="action text-gray" @tap="modelName=''">{{ $t('common.cancel') }}</view>
					<view class="action text-blue" @tap="save">{{ $t('common.save') }}</view>
				</view>
				<view class="manage-content mb-20">
					<view class="cu-list menu mt-15 bg-white">
						<view class="cu-form-group text-right" v-if="userInfo.is_auth">
							<view class="title">{{ $t('user.captcha') }}</view>
							<input :placeholder="$t('user.inputCaptcha')" name="input"  v-model="code" />
							<button class='cu-btn bg-green shadow cu-load'  :class="loading?'loading':''" :disabled="loading" @tap="sendCode(true)">{{ $t('user.sendCode') }}</button>
						</view>
						<template v-if="!editPass">
							<view class="text-gray m-15 text-left">
								<text class="cuIcon-infofill  ml-5 mr-10"></text> {{ $t('user.doAuthCorrect') }}
							</view>
							<view class="cu-form-group text-right">
								<view class="title">{{ $t('user.newAccount') }}</view>
								<input :placeholder="$t('user.emailOrPhone')" name="input" v-model="account" />
							</view>
							<view class="cu-form-group text-right">
								<view class="title">{{ $t('user.naCode') }}</view>
								<input :placeholder="$t('user.inputCaptcha')" name="input" v-model="newCode" />
								<button class='cu-btn bg-green shadow cu-load' :class="loading?'loading':''" :disabled="loading" @tap="sendCode(false)">{{ $t('user.sendCode') }}</button>
							</view>
						</template>
						<template v-else>
							<view class="cu-form-group text-right" v-if="!userInfo.is_auth">
								<view class="title">{{ $t('user.originalPass') }}</view>
								<input :placeholder="$t('user.inputOriginalPass')" name="input" v-model="originalPassword" />
							</view>
							<view class="cu-form-group text-right">
								<view class="title">{{ $t('user.newPass') }}</view>
								<input :placeholder="$t('user.inputNewPass')" name="input" v-model="password" />
							</view>
							<view class="cu-form-group text-right">
								<view class="title">{{ $t('user.inputReNewPass') }}</view>
								<input :placeholder="$t('user.inputReNewPass')" name="input" v-model="repass" />
							</view>
						</template>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { useloginStore } from '@/store/login'
	import pinia from '@/store/index'
	const loginStore = useloginStore(pinia)
	export default {
		data() {
			return {
				userInfo:loginStore.userInfo,
				globalConfig:loginStore.globalConfig,
				modelName:'',
				code:'',
				account:'',
				newCode:'',
				password:'',
				originalPassword:'',
				repass:'',
				loading:false,
				editPass:false
			}
		},
		onShow() {
			
		}, 
		methods: {
			logout(){
				let client_id=uni.getStorageSync('client_id');
				this.$api.LoginApi.logout({client_id:client_id}).then(res => {
					if (res.code == 0) {
						loginStore.logout()
					}
				})
			},
			editAcc(){
				if(!this.userInfo.is_auth){
					uni.showToast({
					  title: this.$t('user.beforeAuth'),
					  icon: 'none'
					});
					return false;
				}
				this.modelName='show';
				this.editPass=false;
			},
			save(){
				if(this.code=='' && this.userInfo.is_auth){
					uni.showToast({
					  title:this.$t('user.inputCaptcha'),
					  icon: 'none'
					});
					return false;
				}
				if(this.editPass){
					if(this.password=='' || this.password.length<6 || this.password.length>16){
						uni.showToast({
						  title: this.$t('user.passLimit'),
						  icon: 'none'
						});
						return false;
					}
					if(this.password!=this.repass){
						uni.showToast({
						  title: this.$t('user.samePass'),
						  icon: 'none'
						});
						return false;
					}
					let params = {
						password:this.password,
						code:this.code,
						originalPassword:this.originalPassword
					}
					this.$api.msgApi.editPassword(params).then(res=>{
						if(res.code==0){
							this.modelName = '';
						  this.password = '';
						  this.repass = '';
						  uni.showToast({
						    title: res.msg,
						    icon: 'none'
						  });
						}
					})
				}else{
					if(this.account==''){
						uni.showToast({
						  title: this.$t('user.inputNewAccount'),
						  icon: 'none'
						});
						return false;
					}
					if(this.newCode==''){
						uni.showToast({
						  title: this.$t('user.inputNaCode'),
						  icon: 'none'
						});
						return false;
					}
					let params = {
						account:this.account,
						code:this.code,
						newCode:this.newCode
					}
					this.$api.msgApi.editAccount(params).then(res=>{
						if(res.code==0){
						  this.modelName = '';
						  this.account = '';
						  this.code = '';
						  this.newCode = '';
						  uni.showToast({
						    title: this.$t('user.editOkRelogin'),
						    icon: 'none'
						  });
						  
						}
					})
				}
			},
			sendCode(e){
			  let account=e ? this.userInfo.account : this.account;
			  let type = this.editPass ? 3 : 4;
			  if(account==''){
				uni.showToast({
				  title: this.$t('user.inputNewAccount'),
				  icon: 'none'
				});
				return false;
			  }
			  this.loading = true;
			  this.$api.LoginApi.sendCode({account:account,type:type}).then((res)=>{
				  uni.showToast({
					title: res.msg,
					icon: "none"
				  });
				  this.loading=false;
			  })
			}
		}
	}
</script>

<style>
.cu-load {
    display: block;
    line-height: 68rpx;
    text-align: center;
}
</style>
