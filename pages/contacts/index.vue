<template>
	<view>
		<scroll-view scroll-y class="indexes" :scroll-into-view="'indexes-'+ listCurID" :style="[{height:'calc(100vh - '+ (CustomBar+50) + 'px)'}]"
		 :scroll-with-animation="true" :enable-back-to-top="true" v-if="TabCur==0">
		 <view style="padding-bottom:30rpx">
			 <view class="cu-list menu mt-10">
				<view class="cu-item arrow" @tap="openFriend" v-if="globalConfig.sysInfo.runMode==2">
					<view class='cu-avatar mr-15 invite-bg'  :class="appSetting.circleAvatar?'round':'radius'">
					</view>
					<view class="content">
						<text class="c-333">{{ $t('friend.newApply') }}</text>
					</view>
					<view class="action">
						<view class="cu-tag round bg-red sm" v-if="unread>0">{{unread}}</view>
					</view>
				</view>
				<view class="cu-item arrow" @tap="openGroup">
					<view class='cu-avatar mr-15 group-bg' :class="appSetting.circleAvatar?'round':'radius'">
					</view>
					<view class="content">
						<text class="c-333">{{ $t("user.group") }}</text>
					</view>
				</view>
				<view class="cu-item arrow" @tap="openChat(item.id)" v-for="(item,index) in systemContact" :key="index">
					<view class='cu-avatar mr-15' :style="{background:'url('+item.avatar+')',backgroundSize: 'contain'}" :class="appSetting.circleAvatar?'round':'radius'">
					</view>
					<view class="content">
						<text class="c-333">{{ $t('user.systemNotice') }}</text>
					</view>
				</view>
			</view>
			<block v-for="(item,index) in contacts" :key="index">
				<view :class="'indexItem-' + item.name" :id="'indexes-' + item.name" :data-index="item.name">
					<view class="padding">{{item.name}}</view>
					<view class="cu-list menu no-padding">
						<view class="cu-item" v-for="(items,sub) in item.children" :key="sub" @tap='openDetails(items)'>
							<view class='cu-avatar mr-15'  :class="appSetting.circleAvatar?'round':'radius'"  :style="[{backgroundImage:'url('+items.avatar+')'}]">
								<view class="online-status-small"  v-if="items.is_online && items.is_group==0 && globalConfig.chatInfo.online==1" ></view>
							</view>
							<view class="content">
								<view class="c-333">{{items.displayName}}</view>
							</view>
						</view>
					</view>
				</view>
			</block>
			<view class="text-center m-20 text-grey">{{total}} {{ $t('friend.contactNum') }}</view>
			<Empty v-if="!contacts.length" :noDatatext="$t('common.none')" textcolor="#999" ></Empty>
		 </view>
		</scroll-view>
		
		<view class="indexBar" :style="[{height:'calc(100vh - ' + CustomBar + 'px - 50px)'}]" v-if="TabCur==0">
			<view class="indexBar-box" @touchstart="tStart" @touchend="tEnd" @touchmove.stop="tMove">
				<view class="indexBar-item" v-for="(item,index) in contacts" :key="index" :id="index" @touchstart="getCur" @touchend="setCur"> {{item.name}}</view>
			</view>
		</view>
		
		<!--选择显示-->
		<view v-show="!hidden" class="indexToast">
			{{listCur}}
		</view>
	</view>
</template>

<script>
	import breadcurm from "@/components/breadcrum.vue"
	import statusPoint from '@/components/status.vue'
	import { storeToRefs } from 'pinia';
	import { useMsgStore } from '@/store/message';
	import { useloginStore } from '@/store/login';
	import pinia from '@/store/index'
	const msgStore = useMsgStore(pinia)
	const userStore = useloginStore(pinia)
	const {contacts,sysUnread} = storeToRefs(msgStore);
	/**
	 * 初始的引导页
	 */
	export default {
		components: {
			breadcurm,
			statusPoint
		},
		name  : "contacts",
		props:{
			TabCur:{type:Number, default:0}	
		},
		data() {
			return {
				//#ifdef H5
				tabbarH:50,
				//#endif
				//#ifndef H5
				tabbarH: 100,
				//#endif
				hidden: true,
				listCurID: '',
				list: [],
				systemContact:[],
				listCur: '',
				total:0,
				scrollLeft: 0,
				msgs: contacts,
				unread:sysUnread,
				globalConfig:userStore.globalConfig,
				appSetting:userStore.appSetting,
				contacts:[]
			};
		},
		watch:{
			msgs(val){
				this.initContacts(val);
			}
		},
		created() {
			this.listCur = this.contacts[0];
		},
		mounted(){
			this.initContacts(this.msgs);
		},
		methods: {
			initContacts(arr){
				const allContacts=JSON.parse(JSON.stringify(arr));
				const contacts=allContacts.filter((item)=>{
					return item.is_group==0;
				})
				this.systemContact=allContacts.filter((item)=>{
					return item.is_group==2;
				})
				this.total=contacts.length;
				// 将联系人进行排序
				const sorted = contacts.sort((a, b) => {
				  if (a.index === '#') {
				    return 1;
				  }
				  if (b.index === '#') {
				    return -1;
				  }
				  return a.index.localeCompare(b.index, 'zh');
				});
				// 重组联系人
				const result = sorted.reduce((acc, cur) => {
				  const index = cur.index;
				  const existingIndex = acc.findIndex(item => item.name === index);
				  if (existingIndex === -1) {
				    acc.push({ name: index, children: [cur] });
				  } else {
				    acc[existingIndex].children.push(cur);
				  }
				  return acc;
				}, []);
				this.contacts=result;
			},
			openDep(item){
				
			},
			openChat(id){
				uni.navigateTo({
					url:"/pages/message/chat?id=" + id,
					animationType:"slide-in-right"
				})
			},
			// 打开聊天详情
			openDetails(items){
				uni.navigateTo({
					url:"/pages/contacts/detail?id="+items.id
				})
			},
			openGroup(){
				uni.navigateTo({
					url:"/pages/contacts/group"
				})
			},
			openFriend(){
				uni.navigateTo({
					url:"/pages/contacts/friend"
				})
			},
			tabSelect(e) {
				this.TabCur = e.currentTarget.dataset.id;
				this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60
			},
			//获取文字信息
			getCur(e) {
				this.hidden = false;
				this.listCur = this.contacts[e.target.id].name;
			},
			setCur(e) {
				this.hidden = true;
				this.listCur = this.listCur
			},
			//滑动选择Item
			tMove(e) {
				
				let y = e.touches[0].clientY,
					offsettop = this.boxTop,
					that = this;
				//判断选择区域,只有在选择区才会生效
				if (y > offsettop) {
					let num = parseInt((y - offsettop) / 20);
					this.listCur = that.contacts[num].name
				};
				
			},
			//触发全部开始选择
			tStart() {
				this.hidden = false
			},
			//触发结束选择
			tEnd() {
				this.hidden = true;
				this.listCurID = this.listCur
			},
			indexSelect(e) {
				let that = this;
				let barHeight = this.barHeight;
				let list = this.contacts;
				let scrollY = Math.ceil(list.length * e.detail.y / barHeight);
				for (let i = 0; i < list.length; i++) {
					if (scrollY < i + 1) {
						that.listCur = list[i].name;
						that.movableY = i * 20
						return false
					}
				}
			}
		}
	}
</script>

<style scoped>
	page {
		padding-top: 100upx;
	}
	.indexes {
		position: relative;
		margin-bottom:20rpx
	}
	.indexBar {
		position: fixed;
		right: 0px;
		bottom: 0px;
		padding: 20upx 20upx 20upx 60upx;
		display: flex;
		align-items: center;
	}
	.indexBar .indexBar-box {
		width: 40upx;
		height: auto;
		background: #fff;
		display: flex;
		flex-direction: column;
		box-shadow: 0 0 20upx rgba(0, 0, 0, 0.1);
		border-radius: 10upx;
	}
	.indexBar-item {
		flex: 1;
		width: 40upx;
		height: 40upx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24upx;
		color: #888;
	}
	movable-view.indexBar-item {
		width: 40upx;
		height: 40upx;
		z-index: 9;
		position: relative;
	}
	movable-view.indexBar-item::before {
		content: "";
		display: block;
		position: absolute;
		left: 0;
		top: 10upx;
		height: 20upx;
		width: 4upx;
		background-color: #f37b1d;
	}
	.indexToast {
		position: fixed;
		top: 0;
		right: 80upx;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		width: 100upx;
		height: 100upx;
		border-radius: 10upx;
		margin: auto;
		color: #fff;
		line-height: 100upx;
		text-align: center;
		font-size: 48upx;
	}
	
	.gui-list-image {
		width: 70rpx !important;
		height: 70rpx !important;
		border-radius: 8rpx;
		object-fit: cover
	}
	
	.im-department-list {
		padding: 0 20rpx 40rpx
	}
	
	.im-folder-bar {
		background-color: #aaccff52;
		border-radius: 8rpx;
		width: 70rpx;
		height: 70rpx;
		text-align: center;
		line-height: 70rpx;
		overflow: hidden;
	}
	
	.im-image {
		
	}
	
	.im-folder-bar .iconfont {
		font-size: 44rpx !important;
	}
	
	.group-bg{
		background-image: url(@/static/image/group.png);
	}
	.invite-bg{
		background-image: url(@/static/image/invite.png);
	}
</style>