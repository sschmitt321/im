<template>
	<view>
		<cu-custom bgColor="bg-white"  :isBack="true">
			<template #backText></template>
			<template #content>{{ $t('user.profile') }}</template>
		</cu-custom>
		<view class="padding flex justify-start align-center">
			<view class='cu-avatar lg radius mr-15' @tap="showAvatar(detail)" :style="'background-image:url('+detail.avatar+')'">
			</view>
			<view class='im-flex im-justify-content-start im-columns'>
				<view class="mb-5">{{detail.realname}}</view>
				<view class="text-gray">{{detail.account}}</view>
			</view>
		</view>
		<view class="cu-list menu">
			<view class="cu-item"  v-if="globalConfig.sysInfo.runMode==2 && detail.friend && userInfo.user_id!=detail.user_id" @tap="setNickname">
				<view class="content">
					<text class="cuIcon-edit"></text>
					<text>{{ $t('user.remark') }}</text>
				</view>
				<view class="action">
					<text class="text-grey text-sm">{{detail.friend.nickname || '未设置'}}</text>
					<text class="text-grey text-sm ml-5 cuIcon-write"></text>
				</view>
			</view>
			<view class="cu-item">
				<view class="content">
					<text class="cuIcon-mail"></text>
					<text>{{ $t('user.email') }}</text>
				</view>
				<view class="action">
					<text class="text-grey text-sm">{{detail.email ?? ''}}</text>
				</view>
			</view>
			<view class="cu-item">
				<view class="content">
					<text class="cuIcon-friendfamous"></text>
					<text>{{ $t('user.gender') }}</text>
				</view>
				<view class="action">
					<text class="text-grey text-sm">{{ sex(detail.sex)}}</text>
				</view>
			</view>
			<view class="cu-item" v-if="parseInt(globalConfig.sysInfo.ipregion)">
				<view class="content">
					<text class="cuIcon-location"></text>
					<text>IP</text>
				</view>
				<view class="action">
					<text class="text-grey text-sm" v-if="detail.last_login_ip">{{ detail.last_login_ip || "未知"}} （{{detail.location || "未知"}}）</text>
					<text class="text-grey text-sm" v-else>未知</text>
				</view>
			</view>
		</view>
		
		<template class="" v-if="userInfo.user_id!=detail.user_id">
			<view class="padding flex flex-direction" v-if="globalConfig.sysInfo.runMode==1 || detail.friend">
				<button class="cu-btn bg-blue mt-10 lg" @tap="sendMsg(detail)">{{ $t('message.send') }}</button>
				<button class="cu-btn bg-green mt-10 lg" v-if="validatePhone" @tap="callPhone()">{{ $t('message.call') }}</button>
				<!-- #ifdef APP | H5 -->
				<button class="cu-btn bg-grey mt-10 lg" @tap="modelName='callRtc'" v-if="parseInt(globalConfig.chatInfo.webrtc) && parseInt(globalConfig.chatInfo.simpleChat)">{{ $t('common.webrtc') }}</button>
				<!-- #endif -->
				
				<button class="cu-btn bg-red  mt-10 lg" @tap="delFriend()" v-if="globalConfig.sysInfo.runMode==2">{{ $t('user.delFriend') }}</button>
			</view>
			<view class="padding flex flex-direction" v-if="globalConfig.sysInfo.runMode==2 && !detail.friend">
				<button class="cu-btn bg-blue lg" @tap="addFriend()">{{ $t('user.addFriend') }}</button>
			</view>
		</template>
		<view class="cu-modal bottom-modal" :class="modelName=='callRtc'?'show':''"  @tap="modelName=''">
			<view class="cu-dialog">
				<view class="manage-content">
					<view class="cu-list menu bg-white">
						<view class="cu-item" @tap="calling(0)">
							<view class="content padding-tb-sm">
								<text class="cuIcon-dianhua"></text>
								<text>{{ $t('message.voiceCall') }}</text>
							</view>
						</view>
						<view class="cu-item" @tap="calling(1)">
							<view class="content padding-tb-sm">
								<text class=" cuIcon-record"></text>
								<text>{{ $t('message.videoCall') }}</text>
							</view>
						</view>
						<view class="parting-line-5"></view>
						<view class="cu-item" @tap="modelName=''">
							<view class="content padding-tb-sm">
								<text class="c-red">{{ $t("user.cancel") }}</text>
							</view>
						</view>

					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { useMsgStore } from '@/store/message';
	import { useloginStore } from '@/store/login';
	import pinia from '@/store/index'
	const msgStore = useMsgStore(pinia)
	const userStore = useloginStore(pinia)
	export default {
		data() {
			return {
				modelName:'',
				detail:{},
				userInfo:userStore.userInfo,
				globalConfig:userStore.globalConfig
			}
		},
		computed: {
		    validatePhone(){
				let reg = /^1[3456789]\d{9}$/;
				return reg.test(this.detail.account);
			}
		},
		onLoad(options) {
			this.$api.msgApi.getUserInfo({user_id:options.id}).then((res)=>{
				if(res.code==0){
					this.detail=res.data;
				}
			})
		}, 
		methods: {
			showAvatar(detail){
				let imgs=[];
				imgs.push(detail.avatar);
				uni.previewImage({urls : imgs})
			},
			sendMsg(info){
				uni.reLaunch({
					url:"/pages/message/chat?id="+info.user_id
				})
			},
			sex(value) {
						let arr = [this.$t('common.women'), this.$t("common.man"),this.$t("common.unknown")]
						return arr[value] || this.$t("common.unknown");
			},
			callPhone(){
				uni.makePhoneCall({
					phoneNumber: this.detail.account
				});
			},
			calling(is_video){
				if(msgStore.webrtcLock){
					return uni.showToast({
						title:this.$t('message.otherCalling'),
						icon:'none'
					})
				}
				this.modelName='';
				let msg_id=this.$util.getUuid();
				uni.navigateTo({
				  url: '/pages/message/call?msg_id='+msg_id+'&type='+is_video+'&status=1&id='+this.detail.user_id+'&name='+this.detail.realname+'&avatar='+encodeURI(this.detail.avatar)
				})
			},
			delFriend(){
				uni.showModal({
					title: this.$t('friend.comfirmDel'),
					success: (res)=>{
						if (res.confirm) {
							let data={ id: this.detail.user_id};
							this.$api.friendApi.delFriend(data).then((res)=>{
								if(res.code==0){
									msgStore.deleteContacts(data);
									uni.reLaunch({
										url: '/pages/index/index'
									})
								}
							})
						}
					},
				})
				
			},
			addFriend(){
				uni.showModal({
					title: this.$t('friend.inputVerify'),
					editable:true,
					success: (res)=>{
						if (res.confirm) {
							if(res.content==''){
								return uni.showToast({
									title:this.$t('friend.inputRemark'),
									icon:'error'
								})
							}
							this.$api.friendApi.addFriend({user_id:this.detail.user_id,remark:res.content}).then((e)=>{
								if(e.code==0){
									uni.showToast({
										title:e.msg,
										icon:'none'
									})
								}
							})
						}
					}
				});
			},
			setNickname(){
				let friend_id=this.detail.friend.friend_id ?? '';
				if(!this.detail.friend){
					return uni.showToast({
						title:this.$t('friend.dontSet'),
						icon:'error'
					})
				}
				uni.showModal({
					title: this.$t('friend.inputRemark'),
					editable:true,
					success: (res)=>{
						if (res.confirm) {
							if(res.content==''){
								return uni.showToast({
									title:this.$t('friend.inputRemark'),
									icon:'error'
								})
							}
							this.$api.friendApi.setNickname({friend_id:friend_id,nickname:res.content}).then((e)=>{
								if(e.code==0){
									this.detail.friend.nickname=res.content;
									// 修改备注后修改联系人
									msgStore.updateContacts({
										id:this.detaild.user_id,
										displayName:res.content
									})
									uni.showToast({
										title:e.msg,
										icon:'none'
									})
								}
							})
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>

</style>
