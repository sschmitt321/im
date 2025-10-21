<template>
	<view>
		<cu-custom bgColor="bg-main-bar" :isBack="true">
			<template #backText></template>
			<template #content>{{ $t('user.profile') }}</template>
		</cu-custom>
		<form>
			<view class="cu-form-group" style="height:140rpx">
				<view class="title">{{ $t('user.avatar') }}</view>
				<view class="im-flex im-align-items-center">
					<avatar
					       selWidth="240px" selHeight="480upx" expWidth="240px"  expHeight="240px" @upload="uploadAvatar" :avatarSrc="userInfo.avatar"
					       avatarStyle="width: 100rpx; height: 100rpx; border-radius: 100%;" :quality="1">
					   </avatar>
					<text class="cuIcon-right ml-10 f-18 text-grey"></text></view>
			</view>
			<view class="cu-form-group">
				<view class="title">{{ $t('user.account') }}</view>
				<view class="text-gray">{{userInfo.account}}</view>
			</view>
			<view class="cu-form-group">
				<view class="title">{{globalConfig.sysInfo.runMode==1 ? this.$t('user.realname') : this.$t('user.nickname')}}</view>
				<view class="text-gray" v-if="globalConfig.sysInfo.runMode==1 && globalConfig.sysInfo.diyName!=1">{{userInfo.realname}}</view>
				<input class="uni-input" style="text-align: right;" v-if="globalConfig.sysInfo.runMode==2 || globalConfig.sysInfo.diyName==1" v-model="userInfo.realname" :placeholder="$t('user.inputNickname')" />
			</view>
			<view class="cu-form-group">
				<view class="title">e-mail</view>
				<input class="uni-input" style="text-align: right;" v-model="userInfo.email" :placeholder="$t('user.inputEmail')" />
			</view>
			<view class="cu-form-group">
				<view class="title">{{ $t('user.gender') }}</view>
				<view>
					<radio-group @change="changeSex">
					<label class="radio mr-10" v-for="x in sexList"><radio name="sex" :value="x.id" :checked="userInfo.sex==x.id" /> {{x.name}}</label>
					</radio-group>
				</view>
			</view>
			<view class="cu-form-group align-start">
				<view class="title">{{ $t('user.motto') }}</view>
				<textarea maxlength="-1" v-model="userInfo.motto" :placeholder="$t('user.inputMotto')"></textarea>
			</view>
		</form>
		<view class="padding flex flex-direction">
			<button class="cu-btn bg-green lg" :style="saved ? 'border: solid 1px #dbdada;' : ''" :disabled="saved" @tap="saveInfo()" >{{ $t('common.save') }}</button>
		</view>
		<view class="padding flex flex-direction" style="position: fixed;bottom: 0;width:100%;align-items: center;">
			<text class="text-red" @tap="logout()">{{ $t('user.exitLogin') }}</text>
		</view>
	</view>
</template>

<script>
	import { useloginStore } from '@/store/login'
	import pinia from '@/store/index'
	import avatar from "@/components/yq-avatar/yq-avatar.vue";
	const loginStore = useloginStore(pinia)
	export default {
		components: {
			avatar
		},
		data() {
			return {
				loginStore:loginStore,
				globalConfig:loginStore.globalConfig,
				userInfo:{},
				sexList:[
					{
						id:'1',
						name:this.$t('common.man')
					},
					{
						id:'0',
						name:this.$t('common.women')
					},
				],
				saved:false
			}
		},
		mounted() {
			this.userInfo=JSON.parse(JSON.stringify(loginStore.userInfo));
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
			textareaBInput(e) {
				this.userInfo.motto = e.detail.value
			},
			changeSex(evt){
				this.userInfo.sex=parseInt(evt.detail.value);
			},
			saveInfo(){
				if(this.userInfo.realname == ''){
					uni.showToast({
						title:this.$t('user.inputNickname'),
						icon:'none'
					})
					return false
				  }
				  let pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				  if(this.userInfo.email!='' && !pattern.test(this.userInfo.email)){
					  uni.showToast({
					  	title:this.$t('common.correctEmail'),
					  	icon:'none'
					  })
					  return false
				  }
				  // 防止无限次点击
				  this.saved=true;
				  let params={
					realname:this.userInfo.realname,
					email:this.userInfo.email,
					sex:this.userInfo.sex,
					motto:this.userInfo.motto
				  }
				  this.$api.msgApi.updateUserInfo(params).then(res=>{
					if(res.code == 0){
					  uni.showToast({
					  	title:this.$t('common.saveOk'),
					  	icon:'none'
					  })
					  let data=JSON.parse(JSON.stringify(this.userInfo))
					  loginStore.login(data)
					}
				  })
				  // 8秒后可以重新保存
				  setTimeout(()=>{
				  	this.saved=false;
				  },8000)
			},
			setAvatar(){
				uni.navigateTo({
					url:"/pages/mine/avatar"
				})
			},
			uploadAvatar(res){
				uni.showLoading({
					title:this.$t('common.uploading')
				})
				uni.uploadFile({
					url: this.$api.msgApi.uploadAvatar,
					filePath: res.path,
					name: 'file',
					header: {
						'Authorization': uni.getStorageSync('authToken'),
					},
					formData: {
						ext: 'png'
					},
					success: (e) => {
						uni.hideLoading();
						let res=JSON.parse(e.data);
						if(res.code==0){
							uni.showToast({
								title:res.msg,
								icon:'none'
							})
							this.userInfo.avatar=res.data
							let data=JSON.parse(JSON.stringify(this.userInfo));
							loginStore.login(data);
						}
					},
					fail: (res) => {
						uni.hideLoading();
					}
				})
			}
		}
	}
</script>

<style>

</style>
