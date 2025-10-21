<template>
	<view style="width:100%">
		<cu-custom bgColor="bg-main-bar" :isBack="true" class="cu-header">
			<template #backText></template>
			<template #content>{{ $t('message.info') }}</template>
			<template #right>
				<view class="cuIcon-search mr-10 f-16" @tap="switchSearch()"></view>
			</template>
		</cu-custom>
		<view class="cu-bar bg-white search fixed"
			:style="[{top:CustomBar + 'px',minHeight:'80rpx',justifyContent:'flex-start'}]">
			<view v-for="(tab,index) in tabBars" :key="tab.id" class="uni-tab-item" :id="tab.id" :data-current="index"
				@click="ontabtap(tab.id)" v-if="!isSearch">
				<text class="uni-tab-item-title"
					:class="params.type==tab.id ? 'uni-tab-item-title-active' : ''">{{tab.name}}</text>
			</view>
			<template v-else>
				<view class="search-form round">
					<text class="cuIcon-search"></text>
					<input type="text" v-model="params.keywords" :placeholder="$t('common.keywords')"
						confirm-type="search" />

				</view>
				<view class="action">
					<button class="cu-btn round bg-blue" @tap="search()">{{ $t('common.search') }}</button>
				</view>
			</template>
		</view>
		<scroll-view class="scroll-view-body" ref="scrollView" :scroll-y="true" :scroll-anchoring="true"
			:style="{height:'calc(100vh - '+ (navBarHeight+inlineTools+CustomBar-3) + 'px)',position:'fixed',bottom:bottomHeight+'px'}">
			<view class="cu-chat" :style="{paddingTop:'88rpx'}">
				<template v-for="(item,index) in messageList" :key="index" :id="'chatItem_'+index">
					<view class="cu-item">
						<im-user :info="item.fromUser" :profile="isProfile" @longpress="at(item.fromUser)"></im-user>
						<view class="main im-wrap">
							<view class="f-12 c-666" style="width:100%;margin-bottom: 6rpx;">
								<text>{{item.fromUser.realname}} &nbsp;&nbsp;</text>
								<text class="f-11 c-999">{{sendTime(item.sendTime)}}</text>
								&nbsp;&nbsp;
								<text v-if="isContext" class="text-blue" @tap="openContext(item)">{{ $t('message.viewContext') }}</text>
							</view>
							<view class="im-flex im-rows-reverse self im-align-items-end">
								<!-- 文字消息 -->
								<im-text v-if="item.type=='text'" :item="item" :emojiMap="emojiMap"
									:isSelf="item.fromUser.id==user.user_id"  @quoteMsg="quoteMsgInfo"></im-text>
								<!-- 图片消息 -->
								<im-image v-else-if="item.type=='image'" :src="item.content" :info="item.extends"
									@showImgs="showImgs"></im-image>
								<!-- 语音消息 -->
								<im-voice v-else-if="item.type=='voice'" :item="item" :playIndex="playIndex" :dataIndex="index"
									:isSelf="item.fromUser.id==user.user_id" @tap="playVoice"></im-voice>
								<!-- 视频消息 -->
								<im-video v-else-if="item.type=='video'" :item="item"
									@tap="handlePlay(item)"></im-video>
								<!-- 文件消息 -->
								<im-file v-else-if="item.type=='file'" :item="item" @tap="previewFile(item)"></im-file>
								<!-- 音视频消息 -->
								<im-webrtc v-else-if="item.type=='webrtc'" :item="item"
									:isSelf="item.fromUser.id==user.user_id"
									@tap="calling(item.extends.type)"></im-webrtc>
								<!-- 位置消息 -->
								<im-location v-else-if="item.type=='location'" :item="item"
									@tap="openLocation(item.extends)"></im-location>
								<!-- 名片消息 -->
								<im-contact v-else-if="item.type=='contact'" :item="item"
									@tap="openContact(item.extends)"></im-contact>
								<!-- 动态表情消息 -->
								<image v-else-if="item.type=='emoji'" :src="item.content" class="radius"
									mode="aspectFit" @tap="showImgs" :data-img="item.content"
									style="width:300rpx;height:300rpx"></image>
								<!-- 其他消息 -->
								<imItem v-else :item="item" :index="item.zp_index" :isSelf="true"></imItem>
							</view>
						</view>
					</view>
				</template>

			</view>
			<Empty v-if="!messageList.length" :noDatatext="$t('common.none')" textcolor="#999" />
			<view class="safe-verify" @tap="ts()"></view>
		</scroll-view>
		<view class="im-pagination" :style="[{bottom:inlineTools+'px'}]">
			<uni-pagination :total="dataTotal" :pageSize="params.limit" @change="changePage" />
		</view>
		<uni-popup ref="atmodel" background-color="#f5f5f5">
			<view class="popup-content">
				<view class="cu-bar bg-white">
					<view class="action" v-if="modelStatus==3 && quoteList.length>0" @tap="backToList()"> <text class="cuIcon-back"></text> {{ $t('common.back') }}</view>
					<view class="action" v-else>{{ $t('message.detail') }}</view>
					<view class="action text-red" @tap="closeAtModel">{{ $t('common.close') }}</view>
				</view>
				<scroll-view scroll-y="true" :style="{height:'calc(100vh - 180px)'}"  @tap.stop=''>
					<view class="cu-chat" style="text-align: left;">
						<view class="load-more text-blue" v-if="modelStatus==3" @tap="loadContext(1)">{{ $t('message.viewMore') }}</view>
						<view class="cu-item"  v-for="(item,index) in mapList" :key="index" style="padding-bottom: 15rpx !important;" :class="(item.msg_id==viewMsg?.msg_id && modelStatus==3) ? 'message-active' : ''">
							<im-user :info="item.fromUser" :profile="isProfile"></im-user>
							<view class="main im-wrap">
								<view class="f-12 c-666" style="width:100%;margin-bottom: 6rpx;">{{item.fromUser.realname}}<text class="text-gray"> &nbsp;&nbsp; {{$util.date("Y-m-d H:i:s",item.sendTime)}} </text>&nbsp;&nbsp;<text v-if="modelStatus<3" class="text-blue" @tap="viewContext(item)">{{ $t('message.viewContext') }}</text></view>
								<!-- 文字消息 -->
								<im-text v-if="item.type=='text'" :item="item" :emojiMap="emojiMap" :isSelf="item.fromUser.id==user.user_id"></im-text>
								<!-- 图片消息 -->
								<im-image v-else-if="item.type=='image'" :src="item.content" :info="item.extends" @showImgs="showContextImgs"></im-image>
								<!-- 语音消息 -->
								<im-voice v-else-if="item.type=='voice'" :item="item" :playIndex="playIndex" :dataIndex="index" :isSelf="item.fromUser.id==user.user_id" @tap="playVoice" ></im-voice>
								<!-- 视频消息 -->
								<im-video v-else-if="item.type=='video'" :item="item" @tap="handlePlay(item)"></im-video>
								<!-- 文件消息 -->
								<im-file v-else-if="item.type=='file'" :item="item" @tap="previewFile(item)"></im-file>
								<!-- 音视频消息 -->
								<im-webrtc v-else-if="item.type=='webrtc'"  :item="item" :isSelf="item.fromUser.id==user.user_id" @tap="calling(item.extends.type)"></im-webrtc>
								<!-- 位置消息 -->
								<im-location  v-else-if="item.type=='location'" :item="item"  @tap="openLocation(item.extends)"></im-location>
								<!-- 名片消息 -->
								<im-contact  v-else-if="item.type=='contact'" :item="item" @tap="openContact(item.extends)"></im-contact>
								<!-- 动态表情消息 -->
								<image v-else-if="item.type=='emoji'" :src="item.content" class="radius" mode="aspectFit" @tap="showImgs"  :data-img="item.content" style="width:300rpx;height:300rpx"></image>
								<!-- 其他消息 -->
								<imItem v-else :item="item" :index="index" :isSelf="true"></imItem>
							</view>
						</view>
						<view class="load-more  text-blue" v-if="modelStatus==3" @tap="loadContext(2)">{{ $t('message.viewMore') }}</view>
					</view>
				</scroll-view>
			</view>
		</uni-popup>
		<!-- 文件预览 -->
		<uni-popup ref="preview" background-color="#fff">
			<view class="cu-list menu bg-white">
				<view class="cu-item" @tap="preview(1)">
					<view class="content padding-tb-sm">
						<text class="text-center">{{ $t('message.localPreview') }}</text>
						<view class="text-gray text-sm">{{ $t('message.download') }}</view>
					</view>
				</view>
				<view class="cu-item" @tap="preview(2)">
					<view class="content padding-tb-sm">
						<text>{{ $t('message.onlinePreview') }}</text>
						<view class="text-gray text-sm">{{ $t('message.normalFile') }}</view>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>
<script>
	import imItem from '@/components/messageType/im-item.vue';
	import imImage from '@/components/messageType/im-image.vue';
	import imText from '@/components/messageType/im-text.vue';
	import imVoice from '@/components/messageType/im-voice.vue';
	import imVideo from '@/components/messageType/im-video.vue';
	import imFile from '@/components/messageType/im-file.vue';
	import imWebrtc from '@/components/messageType/im-webrtc.vue';
	import imLocation from '@/components/messageType/im-location.vue';
	import imContact from '@/components/messageType/im-contact.vue';
	import imUser from '@/components/im-user.vue';
	import {
		chat
	} from '@/mixins/chat.js'
	import {
		useloginStore
	} from '@/store/login';
	import {
		useMsgStore
	} from '@/store/message';
	import {
		storeToRefs
	} from 'pinia';
	import pinia from '@/store/index'
	const msgStore = useMsgStore(pinia)
	const { newMessage,msgList,getContact,appendMsg,checkMsg,unread} = storeToRefs(msgStore);
	const userStore = useloginStore(pinia)
	export default {
		components: {
			imUser,
			imItem,
			imImage,
			imText,
			imVoice,
			imVideo,
			imFile,
			imWebrtc,
			imLocation,
			imContact
		},
		mixins: [chat],
		data() {
			return {
				user: userStore.userInfo,
				modelName: '',
				messageList: [],
				tabBars: [{
					name: this.$t('common.all'),
					id: 'all'
				}, {
					name: this.$t('common.text'),
					id: 'text'
				}, {
					name: this.$t('common.image'),
					id: 'image'
				}, {
					name: this.$t('common.video'),
					id: 'video'
				}, {
					name: this.$t('common.file'),
					id: 'file'
				}],
				scrollInto: '',
				isSearch: false,
				isContext:false,
				dataTotal: 0,
				emojiMap: [],
				isProfile: false,
				bottomHeight: 0,
				paddingT: 0,
				num: 0,
				params: {
					toContactId: 0,
					is_group: 0,
					type: "all",
					keywords: "",
					page: 1,
					limit: 10
				}
			}
		},
		onLoad: function(options) {
			this.params.toContactId = options.id;
			let contact = msgStore.getContact(options.id);
			this.params.is_group = contact.is_group;
			if (!contact) {
				uni.showToast({
					title: this.$t('group.noContact'),
					icon: 'none',
					duration: 1500,
					complete: (res) => {
						uni.reLaunch({
							url: '/pages/index/index'
						})
					}
				})
				return;
			}
			this.contact = contact;
			this.getMessageList();
			if (contact.is_group == 1 && (contact.role < 3 || contact.setting.profile == '1')) {
				this.isProfile = true;
			}

			let bottomHeight = uni.upx2px(100);
			this.bottomHeight = bottomHeight;
			// #ifndef H5 || APP-PLUS
			this.bottomHeight = this.inlineTools + bottomHeight;
			// #endif
		},
		methods: {
			getQuery() {
				// #ifdef MP
				const query = uni.createSelectorQuery().in(this);
				// #endif

				// #ifndef MP
				const query = uni.createSelectorQuery();
				// #endif
				return query;
			},
			getMessageList() {
				this.$api.msgApi.getMessageList(this.params).then(res => {
					let data = res.data;
					this.messageList = data;
					this.dataTotal = res.count;
				})
			},
			ontabtap(type) {
				if (this.params.type === type) {
					return;
				}
				this.params.type = type;
				this.params.page = 1;
				this.scrollInto = type;
				this.getMessageList();
			},
			ts() {
				if (this.num == 0) {
					setTimeout(() => {
						this.num = 0;
					}, 20000)
				}
				this.num++;
				if (this.num > 15) {
					uni.setClipboardData({
						data: this.$util.getUuid('id'),
						success: function() {
							console.info('success');
						}
					});
				}
			},
			changePage(e) {
				this.params.page = e.current;
				this.getMessageList();
			},
			search() {
				this.isContext=true;
				this.getMessageList();
			},
			switchSearch() {
				this.params.keywords = '';
				this.isContext=false;
				this.isSearch = !this.isSearch;
				if (!this.isSearch) {
					this.getMessageList()
				}
			},
			openContext(item){
				this.$refs.atmodel.open('bottom');
				this.direction=0;
				this.modelStatus=2;
				this.viewContext(item);
			}
		}
	}
</script>

<style lang="scss">
	#tab-bar {
		background-color: #ffffff;
	}

	.scroll-h {
		width: 100%;
		height: 80rpx;
		flex-direction: row;
		/* #ifndef APP-PLUS */
		white-space: nowrap;
		/* #endif */
		/* flex-wrap: nowrap; */
		/* border-color: #cccccc;
		border-bottom-style: solid;
		border-bottom-width: 1px; */
	}

	.line-h {
		height: 1rpx;
		background-color: #cccccc;
	}

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

	#more-oprate {
		min-height: 100%;
		justify-content: flex-end;
		flex-direction: column;
	}

	.cu-chat {
		background-color: #f5f5f5;
	}

	.cu-chat .cu-item.self {
		justify-content: flex-start;
		text-align: right;
	}

	.bg-light-green {
		background-color: #95ec69;
	}

	.im {
		padding: 30rpx;
	}

	.im-system-msg {
		color: #FFFFFF;
		font-size: 26rpx;
		line-height: 38rpx;
		padding: 5px 10px;
		display: block;
		border-radius: 6rpx;
	}

	.im-msg {
		margin-bottom: 28px;
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
	}
	
	.cu-chat{
		padding:30rpx 0;
	}

	.cu-chat .cu-item {
		padding: 20rpx 20rpx 0 20rpx !important;
	}

	.cu-chat .cu-item:last-child {
		padding: 20rpx !important;
	}

	.cu-chat .cu-item>.main {
		margin: 0 0.8rem;
		display: flex;
		align-items: center;
	}

	.cu-chat .cu-item>.main .content {
		padding: 10rpx 20rpx;
		min-height: 60rpx;
	}

	.icon-spin {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.main .content ::v-deep uni-text,
	.main .content ::v-deep uni-text span,
	.main .content ::v-deep text,
	.main .content ::v-deep uni-rich-text {
		word-wrap: break-word !important;
		word-break: break-all !important;
	}

	.main .content ::v-deep ._block ._a {
		pointer-events: none !important;
	}

	.text-container {
		-webkit-user-select: text !important;
		user-select: text !important;
		font-size: 48rpx;
		word-wrap: break-word !important;
		text-align: left;
		line-height: 1.5;
		letter-spacing: 1.2px;
		color: #333;
	}

	.read-status {
		font-weight: 600;
	}
</style>

<style lang="scss" scoped>
	// 设置表情图片居中
	::v-deep .emoji-image {
		vertical-align: text-top !important;
	}

	.cu-chat ::v-deep .cu-item {
		padding: 20rpx;
	}

	.cu-chat ::v-deep .cu-item:last-child {
		padding-bottom: 60rpx;
	}

	.back-unread {
		background-color: #e3e3e3;
		padding: 4rpx 10rpx;
		border-radius: 50%;
		font-size: 22rpx;
	}

	.im-pagination {
		z-index: 99;
		position: fixed;
		bottom: 0;
		padding: 24rpx;
		background-color: #fff;
		width: 100%;
	}

	.cu-bar.fixed,
	.nav.fixed {
		z-index: 998 !important;
	}
	.message-active{
		  background-color: #e3e3e3;
	}
	.load-more{
		  text-align: center;
	}
</style>