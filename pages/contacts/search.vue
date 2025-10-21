<template>
	<view>
		<cu-custom bgColor="bg-main-bar" :isBack="true">
			<template #backText></template>
			<template #content>{{title}}</template>
		</cu-custom>
		<view class="cu-bar bg-white search fixed" :style="[{top:CustomBar + 'px'}]">
			<view class="search-form round">
				<text class="cuIcon-search"></text>
				<input type="text" v-model="keywords" :placeholder="$t('user.seachUser')" confirm-type="search"/>
				
			</view>
			<view class="action">
				<button class="cu-btn round bg-blue" @tap="search()">{{ $t('common.search') }}</button>
			</view>
		</view>
		
		<view style="margin-top:120rpx">
			<view>
				<view class="cu-list menu no-padding">
					<view class="cu-item" v-for="(items,sub) in contacts" :key="sub" @tap='openDetails(items)'>
						<view class='cu-avatar radius mr-15' :style="[{backgroundImage:'url('+items.avatar+')'}]">
						</view>
						<view class="content">
							<view class="c-333">{{items.realname}}</view>
						</view>
						<view class="action ml-10">
							<view class="text-blue" v-if="items.friend" @tap.stop="sendMsg(items.user_id)">{{ $t('message.send') }}</view>
							<view class="text-blue" v-if="!items.friend">{{ $t("common.view") }}</view>
						</view>
					</view>
				</view>
			</view>
			<view v-if="!contacts.length">
				<Empty :noDatatext="noText" textcolor="#999" ></Empty>
			</view>
		</view>
	</view>
</template>

<script>
	/**
	 * 初始的引导页
	 */
	export default {
		name  : "search",
		data() {
			return {
				title:this.$t('friend.seachFriend'),
				keywords:'',
				contacts:[],
				type:1,
				noText:this.$t('common.none')
			};
		},
		methods: {
			search(){
				if(this.keywords==''){
					return uni.showToast({
						title:this.$t('user.seachUser'),
						icon:'none'
					})
				}
				this.noText=this.$t('friend.searchNoData');
				this.$api.msgApi.searchUser({keywords:this.keywords}).then((res)=>{
					if(res.code==0){
						this.contacts=res.data;
					}
				})
			},
			// 打开用户详情
			openDetails(items){
				uni.navigateTo({
					url:"/pages/contacts/detail?id="+items.user_id
				})
			},
			sendMsg(id){
				uni.navigateTo({
					url:"/pages/message/chat?id="+id
				})
			}
		}
	}
</script>

<style scoped>

</style>