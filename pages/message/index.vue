<template>
	
	<view>
		<z-paging :style="{position:'fixed',top:CustomBar+'px'}"  v-model="msgsIn" ref="paging" use-virtual-list safe-area-inset-bottom :force-close-inner-list="true" :preload-page="5" @query="queryList" @onRefresh="refresh" show-refresher-update-time :refresher-complete-delay="1000" :loading-more-enabled="false">
		<template #top>
			<!-- #ifdef MP -->
			<view class="pr-10 pl-10 text-gray bg-white im-flex im-space-between im-align-items-center cu-bar"  :style="{paddingTop:CustomBar+'px',paddingBottom:'10px'}">
			<!-- #endif -->
			<!-- #ifndef MP -->
			<view class="pr-10 pl-10 text-gray bg-white im-flex im-space-between im-align-items-center cu-bar">
			<!-- #endif -->
			
				<im-tab class="mr-10" :values="values" @change="changeChat"></im-tab>
				<view class="im-flex im-justify-content-start im-align-items-center"  v-if="multiport && socketStatus">
					<view class=" iconfont icon-web f-16 ml-5"></view>
					<view class="f-14 ml-5">{{ $t('chat.pcOnline') }}</view>
				</view>
				<view class="socket-status pd-5 im-flex justify-between im-align-items-center radius-10 im-flex1" v-if="!socketStatus">
					<view class="cuIcon-infofill text-red f-18"></view>
					<view class="c-666 f-12">{{ $t('chat.wsDisconnect') }}</view>
					<view class="cuIcon-refresh" @tap="reconnect()"></view>
				</view>
			</view>
		</template>
		<view  class="im-message-list">
			<uni-notice-bar :speed="60"  color="#F56C6C" background-color="#fde2e2" show-get-more scrollable :text="$t('system.notNotify')" style="margin: 0;" @tap="goToSetting(1)" v-if="!systemNotify"/>
			<uni-notice-bar :speed="60"   color="#F56C6C" background-color="#fde2e2" show-get-more scrollable :text="$t('system.notBattery')" style="margin: 0;" @tap="goToSetting(2)" v-else-if="!systemBattery"/>
			<uni-notice-bar :speed="60" show-icon scrollable  showClose :text="noticeContent.title" style="margin: 0;" @tap="openChat('admin_notice')" v-if="noticeContent.title && (systemNotify && systemBattery)" @close="closeNotice"/>
			
			<!-- #ifdef MP -->
			<view class="cu-list menu-avatar" :style="{paddingBottom: 10+'px'}">
			<!-- #endif -->
			<!-- #ifndef MP -->
			<view class="cu-list menu-avatar" :style="{paddingBottom: paddingB-45+'px'}">
			<!-- #endif -->
			
				<view class="cu-item second" :class="[modalName=='move-box-'+ index?'move-cur':'',item.is_top==1 ? 'top-contacts' : '']" :id="`zp-id-${item.id}`" :key="item.zp_index" v-for="(item,index) in msgsIn"  @touchstart="ListTouchStart" @touchmove="ListTouchMove" @touchend="ListTouchEnd" @tap="openChat(item.id)" :data-target="'move-box-' + index">
					<view class="cu-avatar lg" :class="appSetting.circleAvatar?'round':'radius'" :style="[{backgroundImage:'url('+ item.avatar +')'}]">
						<view class="online-status"  v-if="item.is_online && item.is_group==0 && globalConfig.chatInfo.online==1"></view>
					</view>
					<view class="content">
						<view class="c-333">
							<view class="text-overflow f-16" style="width:80%">
								{{item.displayName}}
							</view>
						</view>
						<view class="im-flex im-justify-content-start im-align-items-start lh-20x" style="height: 50rpx;overflow:hidden">
							<view class="text-red f-14 mr-5" v-if="item.draft">[{{ $t('message.draft') }}] </view>
							<view class="text-red f-14 mr-5" v-if="item.is_at && !item.draft">[{{item.is_at}}{{ $t('message.remindMe') }}] </view>
							<mp-html :content="emojiToHtml(item.draft ? item.draft : item.lastContent)" class="im-flex f-14 text-gray text-overflow no-click"/>
						</view>
						
					</view>
					<view class="action">
						<view class="text-grey text-xs" >{{from_time(item.lastSendTime)}}</view>
						<view class="cu-tag round sm" :class="item.is_notice ? 'bg-red' : 'bg-notremind'" v-if="item.unread>0">{{item.unread}}</view>
						<view class="c-999" v-if="item.is_notice==0 && item.unread==0">
							<text class="cuIcon-musicforbidfill"></text>
						</view>
					</view>
					<view class="move second">
						<view class="bg-grey" v-if="item.is_top==1" @tap="btnTap(0,item)">{{ $t('chat.unTop') }}</view>
						<view class="bg-blue" v-else  @tap="btnTap(0,item)">{{ $t('chat.isTop') }}</view>
						<view class="bg-orange" v-if="item.is_notice==1"  @tap="btnTap(2,item)">{{ $t('chat.noVoice') }}</view>
						<view class="bg-orange" v-else  @tap="btnTap(2,item)">{{ $t('chat.cancelNoVoice') }}</view>
					</view>
				</view>
			</view>
			<view class="safe-verify" :style="[{height:inlineTools+navBarHeight+'px'}]"></view>
		</view>
		</z-paging>
	</view>
</template>

<script>
	import statusPoint from '@/components/status.vue'
	import imTab from '@/components/message/im-tab.vue'
	import emoji from '@/utils/emoji.js'
	// #ifdef APP
	// import { KeepLive } from '@/uni_modules/android-keeplive' // 放在页面导入的地方
	// let keepAlive=new KeepLive();
	// #endif
	import { storeToRefs } from 'pinia';
	import { useMsgStore } from '@/store/message';
	import { useloginStore } from '@/store/login'
	import pinia from '@/store/index'
	const msgStore = useMsgStore(pinia)
	const {contacts,unread,msgAt} = storeToRefs(msgStore);
	const userStore = useloginStore(pinia);
	const {multiport,systemBattery,systemNotify} = storeToRefs(userStore);
	export default {
		components: {
			statusPoint,imTab
		},
		data() {
			return {
				navCurrent: 0,
				msgs: contacts,
				virtualList:[],
				pageLoading: true,
				multiport:multiport,
				socketStatus:true,
				damping   : 0.29,
				moveIndex : -1,
				touchStart:false,
				modalName: null,
				listTouchStart: 0,
				listTouchDirection: null,
				emojiMap:[],
				chatStatus:true,
				paddingB:0,
				msgAt:msgStore.msgAt,
				appSetting:userStore.appSetting,
				globalConfig:userStore.globalConfig,
				active:0,
				triggered:true,
				noticeContent:{},
				systemNotify:systemNotify,
				systemBattery:systemBattery,
				curScrollChat:'',
				values:[
					{
						id:1,
						name:this.$t('chat.all'),
						count:0
					},
					{
						id:2,
						name:this.$t('chat.unread'),
						count:unread
					},
					{
						id:3,
						name:'@'+this.$t('chat.me'),
						count:msgAt
					}
				]
			}
		},
		computed:{
			msgsIn(){
				let index=this.active;
				let contactList = [];
				if(index==1){
					contactList = this.msgs.filter(obj => obj.unread>0);
				}else if(index==2){
					contactList = this.msgs.filter(obj => obj.is_at>0);
				}else{
					contactList = this.msgs.filter(obj => obj.lastContent);
				}
				return contactList;
			}
		},
		mounted(){
			this.moveIndex = -1;
			this.getNotice();
			// 监听ws网路连接状况
			uni.$on('socketStatus',(e)=>{
				if(!e){
					this.multiport=false;
				}
				this.socketStatus=e;
			})
			
			// 监听草稿
			uni.$on('draftChange',(e)=>{
				this.msgsIn;
			})
		},
		created:function(){
			let emojiMap=[];
			// 解析所有表情
			emoji.forEach(function (item) {
				let child=item.children;
			  if(child.length>0){
				  child.forEach(function (val) {
					  let name=val.name;
					  let src=val.src;
					  emojiMap[name]=src;
				  })
			  }
			});
			this.emojiMap=emojiMap;
			// #ifdef H5
			this.paddingB=this.inlineTools;
			// #endif
			
			// #ifndef H5
			this.paddingB=this.navBarHeight+this.inlineTools;
			// #endif
		},
		methods: {
			goToSetting(val){
				if(val==1){
					keepAlive.onOpenNotificationSetting(function(res){
						// keep.register();
					})
				}else{
					keepAlive.requestIgnoreBatteryOptimizations();
				}
			},
			refresh(){
				uni.$emit('initContacts')
			},
			queryList(pageNo, pageSize) {
				this.$refs.paging.setLocalPaging(this.msgsIn);
			},
			getNotice(){
				this.$api.msgApi.getAdminNotice().then(res => {
					  if (res.code == 0) {
						  let data=res.data;
						  let oldNotice=uni.getStorageSync('notice_'+data.create_time);
						  if(!oldNotice){
							  this.noticeContent=res.data;
						  }
						
					  }
					});
			},
			closeNotice(){
				// 缓存公告内容
				uni.setStorageSync('notice_'+this.noticeContent.create_time,this.noticeContent);
			},
			changeChat(item,index){
				this.active=index;
			},
			btnTap: function(index, contact) {
				// 第一个按钮被点击 置顶、取消置顶消息
				if (index == 0) {
					contact.is_top=contact.is_top==0 ? 1 : 0;
					this.$api.msgApi.setChatTopAPI({
						  id: contact.id,
						  is_top:contact.is_top,
						  is_group: contact.is_group
						}).then(res => {
						  if (res.code == 0) {
							msgStore.updateContacts(contact);
						  }
						});
				}
				// 第三个按钮被打开 [ 删除消息 ]
				else if (index == 1) {
					uni.showModal({
						title: this.$t('chat.confirmDel'),
						success: e => {
							if (e.confirm) {
								// this.$api.msgApi.delChatAPI({
								// 	  id: contact.id,
								// 	  is_group: contact.is_group
								// 	}).then(res => {
								// 	  if (res.code == 0) {
								// 		msgStore.deleteContacts(contact);
								// 	  }
								// 	});
							}
						}
					});
				}
				// 消息免打扰
				else if (index == 2) {
					contact.is_notice=contact.is_notice==0 ? 1 : 0;
					this.$api.msgApi.isNoticeAPI({
						  id: contact.id,
						  is_notice:contact.is_notice,
						  is_group: contact.is_group
						}).then(res => {
						  if (res.code == 0) {
							msgStore.updateContacts(contact);
						  }
						});
				}
			},
			reconnect(){
				uni.showLoading({
					title:this.$t('chat.reConnected')
				})
				this.socketIo.connectSocketInit({type:'ping'});
				setTimeout(()=>{
					uni.hideLoading()
				},1500)
			},
			// 自动解析消息中的表情
			emojiToHtml(str){
				if(!str){
					return;
				}
				let emojiMap=this.emojiMap;
				return str.replace(/\[!(\w+)\]/gi, function (str, match) {
					var file = match;
					return emojiMap[file] ? "<img class='mr-5' style=\"width:18px;height:18px\" emoji-name=\"".concat(match, "\" src=\"").concat(emojiMap[file], "\" />") : "[!".concat(match, "]");
				  });
			},
			// ListTouch触摸开始
			ListTouchStart(e) {
				this.listTouchStart = e.touches[0].pageX
			},
			// ListTouch计算方向
			ListTouchMove(e) {
				let cux=e.touches[0].pageX;
				let direction=cux- this.listTouchStart;
				// 左滑的距离需要达到100才能滑动出菜单,否则在页面自然滚动的时候就会吧菜单给拖出来了
				if(Math.abs(direction)>100 && direction<0){
					this.listTouchDirection='left';
				}else{
					this.listTouchDirection='right';
				}
			},
			// ListTouch计算滚动
			ListTouchEnd(e) {
				if (this.listTouchDirection == 'left') {
					this.modalName = e.currentTarget.dataset.target
					this.chatStatus=false;
				} else {
					this.modalName = null
				}
				this.listTouchDirection = null
			},
			openChat(id){
				// 如果左滑工具栏在开启的情况下不能够点击进入聊天
				if(this.chatStatus){
					this.curScrollChat='';
					uni.navigateTo({
						url:"/pages/message/chat?id=" + id,
						animationType:"slide-in-right"
					})
				}else{
					this.chatStatus=true;
				}
			},
			from_time(time){
				return this.$util.timeFormat(time);
			},
			// 滚动到最近阅读的消息
			scrollToChat(){
				let scrollChat=this.$util.getNextValue(msgStore.unreadIds,this.curScrollChat);
				this.curScrollChat=scrollChat;
				if(scrollChat){
					this.$refs.paging.scrollIntoViewById('zp-id-'+scrollChat,this.CustomBar+50,true);
				}
			}
		}
	}
</script>

<style lang="scss">
	.container {
		padding: 20px;
		font-size: 14px;
		line-height: 24px;
	}
	.border-b{
		border-bottom: 1px solid #eee;
	}
	.socket-status{
		background-color: #fde0de;
		height:72rpx;
		border-radius: 36rpx;
		padding:10rpx 16rpx;
	}
	.text-overflow ::v-deep uni-text , .text-overflow ::v-deep uni-text span{
		overflow: hidden !important;
		text-overflow: ellipsis;
		white-space: nowrap !important;
		width:300rpx;
	}
	.top-contacts{
		background-color: #f5f5f5 !important;
	}
	.cu-list.menu-avatar>.cu-item{
		padding-right:30rpx;
		.content{
			line-height: unset;
		}
	}
	.no-click{
		pointer-events:none;
		height:50rpx;
		flex:1;
	}
	.text-overflow ::v-deep ._block ._a{
		color: #aaaaaa !important;
	}
	.bg-notremind{
		background-color: #d1d1d1;
		color: #ffffff;
	}
	.cu-bar.fixed, .nav.fixed{
		z-index:900;
	}
</style>
