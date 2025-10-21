<template>
	<view>
		<cu-custom bgColor="bg-main-bar" :isBack="true">
			<template #backText></template>
			<template #content>{{ $t('group.groupList') }}</template>
			<template #right>
				<view class="f-20 ml-10 mr-10" @tap="switchSearch()">
					<text class="cuIcon-search"></text>
				</view>
			</template>
		</cu-custom>
		<view class="cu-bar bg-white search fixed" :style="[{top:CustomBar + 'px',minHeight:'80rpx',justifyContent:'flex-start'}]">
			<view v-for="(tab,index) in tabBars" :key="tab.id" class="uni-tab-item" :id="tab.id" :data-current="index" @click="ontabtap(tab.id)"  v-if="!isSearch">
				<text class="uni-tab-item-title" :class="type==tab.id ? 'uni-tab-item-title-active' : ''">{{tab.name}}</text>
			</view>
			<template v-else>
					<view class="search-form round">
						<text class="cuIcon-search"></text>
						<input type="text" v-model="keywords" :placeholder="$t('common.keywords')" confirm-type="search"/>
						
					</view>
					<view class="action">
						<button class="cu-btn round bg-blue" @tap="filterGroup()">{{ $t('common.search') }}</button>
					</view>
				</template>
			</view>
		<view class="cu-list menu-avatar no-padding" style="padding-top: 88rpx;">
			<view class="cu-item" v-for="(items,sub) in groupList" :key="sub" @tap='openDetails(items)'>
				<view class='cu-avatar lg radius mr-15' :style="[{backgroundImage:'url('+items.avatar+')'}]">
				</view>
				<view class="content">
					<view class="c-333">{{items.displayName}}</view>
				</view>
				<view class="action">
					 <text class="c-999 cuIcon-peoplefill" v-if="items.owner_id==userInfo.user_id"></text>
				</view>
				
			</view>
			<Empty v-if="!groupList.length" :noDatatext="$t('common.none')" textcolor="#999" ></Empty>
		</view>

	</view>
</template>

<script>
	import { storeToRefs } from 'pinia';
	import { useMsgStore } from '@/store/message';
	import { useloginStore } from '@/store/login'
	import pinia from '@/store/index'
	const userStore = useloginStore(pinia);
	const msgStore = useMsgStore(pinia)
	const {contacts} = storeToRefs(msgStore);
	/**
	 * 初始的引导页
	 */
	export default {
		name  : "group",
		data() {
			return {
				groupList:[],
				allList:[],
				userInfo:userStore.userInfo,
				tabBars: [{
				    name: this.$t('common.all'),
				    id: 'all'
				}, {
				    name: this.$t('group.iCreated'),
				    id: 1
				}, {
				    name: this.$t('group.iManaged'),
				    id: 2
				}, {
				    name: this.$t('group.iJoined'),
				    id: 3
				}],
				scrollInto:'',
				isSearch:false,
				keywords:'',
				type:'all'
			};
		},
		watch:{
			keywords(val){
				if(val==''){
					let groupList=this.allList;
					this.type='all';
					this.groupList=groupList;
				}
				
			}
		},
		mounted(){
			this.initContacts(this.msgs);
		},
		methods: {
			initContacts(arr){
				const allContacts=uni.getStorageSync('allContacts');
				const contacts=allContacts.filter((item)=>{
					return item.is_group==1;
				})
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
				this.groupList=sorted;
				this.allList=sorted;
			},
			filterGroup(){
				let groupList=this.allList;
				if(this.keywords){
					this.type='all';
					this.groupList=this.$util.searchObject(groupList,['displayName','name_py','account'],this.keywords);
					return;
				}
				switch(this.type){
					case 1: //我创建的
						this.groupList=groupList.filter((item)=>{
							return item.owner_id==this.userInfo.user_id;
						});
						break;
					case 2: //我管理的
						this.groupList=groupList.filter((item)=>{
							return item.role==2;
						});
						break;
					case 3: //我加入的
						this.groupList=groupList.filter((item)=>{
							return item.role==3;
						});
						break;
					default:
						this.groupList=groupList;
						break;
				}
			},
			// 打开聊天
			openDetails(items){
				uni.navigateTo({
					url:"/pages/message/chat?id="+items.id
				})
			},
			search(){
				uni.navigateTo({
					url:"/pages/index/search?type=3"
				})
			},
			switchSearch(){
				this.keywords='';
				this.isSearch=!this.isSearch;
				if(!this.isSearch){
					this.filterGroup()
				}
			},
			ontabtap(type) {
				if (this.type === type) {
				    return;
				}
				this.type=type;
				this.scrollInto = type;
				this.filterGroup();
			},
		}
	}
</script>

<style scoped>
    .uni-tab-item {
        /* #ifndef APP-PLUS */
        display: inline-block;
        /* #endif */
        flex-wrap: nowrap;
        padding-left: 34rpx;
        padding-right: 34rpx;
    }

    .uni-tab-item-title {
        color: #555;
        font-size: 30rpx;
        height: 80rpx;
        line-height: 80rpx;
        flex-wrap: nowrap;
        /* #ifndef APP-PLUS */
        white-space: nowrap;
        /* #endif */
    }

    .uni-tab-item-title-active {
        color: #007AFF;
    }
</style>