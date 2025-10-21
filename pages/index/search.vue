<template>
	<view>
		<cu-custom bgColor="bg-main-bar" :isBack="true">
			<template #backText></template>
			<template #content>{{title}}</template>
		</cu-custom>
		<view class="cu-bar bg-white search fixed" :style="[{top:CustomBar + 'px'}]">
			<view class="search-form round">
				<text class="cuIcon-search"></text>
				<input type="text" v-model="keywords" :placeholder="$t('common.keywords')" confirm-type="search"/>
			</view>
		</view>
		
		<view style="margin-top:120rpx">
			<view v-if="type<3 && contacts.length>0">
				<view class="padding">{{ $t('user.friend') }}</view>
				<view class="cu-list menu-avatar no-padding">
					<view class="cu-item" v-for="(items,sub) in contacts" :key="sub" @tap='openDetails(items)'>
						<view class='cu-avatar lg radius mr-15' :style="[{backgroundImage:'url('+items.avatar+')'}]">
						</view>
						<view class="content">
							<view class="c-333">{{items.displayName}}</view>
						</view>
					</view>
				</view>
			</view>
			<view v-if="groupList.length>0">
				<view class="padding">{{ $t("user.group") }}</view>
				<view class="cu-list menu-avatar no-padding">
					<view class="cu-item" v-for="(items,sub) in groupList" :key="sub" @tap='openDetails(items)'>
						<view class='cu-avatar lg radius mr-15' :style="[{backgroundImage:'url('+items.avatar+')'}]">
						</view>
						<view class="content">
							<view class="c-333">{{items.displayName}}</view>
						</view>
					</view>
				</view>
			</view>
			<view v-if="!groupList.length && !contacts.length">
				<Empty :noDatatext="$t('common.none')" textcolor="#999" ></Empty>
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
				title:this.$t('common.search'),
				keywords:'',
				allContacts:[],
				contacts:[],
				groupList:[],
				type:1
			};
		},
		watch:{
			keywords(val){
				this.search();
			}
		},
		onLoad(options){
			this.type=options.type;
			if(this.type==2){
				this.title=this.$t('common.searchContacts');
			}else if(this.type==3){
				this.title=this.$t('common.searchGroup');
			}else{
				this.title=this.$t('common.search');
			}
		},
		mounted(){
			this.allContacts=uni.getStorageSync('allContacts');
		},
		methods: {
			search(){
				const arr=this.$util.searchObject(this.allContacts,['displayName','name_py','account'],this.keywords);
				const contacts=[];
				const groupList=[];
				arr.forEach((item)=>{
					if(item.is_group==1){
						groupList.push(item);
					}else{
						contacts.push(item);
					}
				})
				this.groupList=groupList;
				this.contacts=contacts;
			},
			// 打开聊天
			openDetails(items){
				if(this.type==2 && items.is_gourp==0){
					uni.navigateTo({
						url:"/pages/contacts/detail?id="+items.id
					})
				}
				uni.navigateTo({
					url:"/pages/message/chat?id="+items.id
				})
			}
		}
	}
</script>

<style scoped>

</style>