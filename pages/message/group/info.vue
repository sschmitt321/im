<template>
	<view>
		<cu-custom bgColor="bg-main-bar" :isBack="true">
			<template #backText></template>
			<template #content>{{ $t('group.meessage') }}</template>
		</cu-custom>
		<view align="center" class="groupInfo">
			<image :src="contact.avatar" mode="widthFix" style="width:120px;height:120px;border-radius: 12rpx;"></image>
			<view class="f-14 mt-10">
				{{contact.name}} ({{contact.groupUserCount}})
			</view>
		</view>
		<view class="padding flex flex-direction mt-10" v-if="!contact.isJoin">
			<button class="cu-btn bg-green lg"  @tap="applyGroup">
				{{ $t('group.join') }}
			</button>
		</view>
		<view class="padding flex flex-direction mt-10" v-else>
			<button class="cu-btn bg-green lg"  @tap="openChat">
				{{ $t('group.goto') }}
			</button>
		</view>
	</view>
</template>
<script>
	import pinia from '@/store/index'
	import { useMsgStore } from '@/store/message';
	const msgStore = useMsgStore(pinia)
	export default {
		data() {
			return {
				contact:{},
				group_id:0
			}
		},
		onLoad(options) {
			this.group_id = options.group_id?options.group_id:''
			this.getGroupInfo()
		},
		methods: {
			getGroupInfo() {
				this.$api.msgApi.groupInfo({
					group_id: this.group_id
				}).then((res) => {
					let data=res.data;
					this.contact=data;
					
				})
			},
			applyGroup() {
				if(this.contact.setting.invite==0){
					return uni.showToast({
						title:this.$t('group.closeJoin'),
						icon:'none'
					})
				}
				uni.showLoading({
					title: this.$t('group.joining')
				});
				try{
					this.$api.msgApi.joinGroup({
						group_id: this.group_id,
						inviteUid:this.contact.inviteUid
					}).then((res) => {
						uni.hideLoading()
						if(res.code==0){
							this.contact.is_group=1;
							msgStore.appendContacts(this.contact);
							this.openChat();
						}
					})
				}catch(e){
					uni.hideLoading()
				}
			},
			openChat(){
				uni.navigateTo({
					url:"/pages/message/chat?id="+this.group_id
				})
			}
		}
	}
</script>
<style scoped>
	.groupInfo{
		margin-top: 100rpx;
	}
</style>
