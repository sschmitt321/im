
<template>
	<view>
		<z-paging :class="bgInfo.image ? 'blur-background' : ''" :style="{backgroundImage:'url('+bgInfo.image+')'}" v-model="messageList" ref="paging" use-chat-record-mode use-virtual-list cell-height-mode="dynamic" safe-area-inset-bottom :force-close-inner-list="true" @virtualListChange="virtualListChange" @query="queryList" auto-show-back-to-top  @scrolltolower="scrollToB" @scroll="scrollChat" :auto-to-bottom-when-chat="true" :auto-adjust-position-when-chat="false" :preload-page="3" :default-page-size="20" @backToTopClick="backToTopClick">
		    <template #top>
				<cu-custom bgColor="bg-white" :isBack="true" class="cu-header">
					<template #backText>
						<view class="back-unread" v-if="unread>0 && unread<100">{{unread}}</view>
						<view class="back-unread" v-if="unread>100">99+</view>
					</template>
					<template #content>
						<view class="im-flex im-justify-content-center im-align-items-center">
							<statusPoint v-if="is_group==0 && contact.is_online==1 && globalConfig.chatInfo.online==1"></statusPoint><text class="text-overflow">{{contact.displayName}}</text>
							<text v-if="is_group==1">({{groupInfo.groupUserCount ?? 0}})</text>
						</view>
					</template>
					<template #right>
						<view class="cuIcon-more mr-10 f-16" v-if="is_group!=2" @tap="openDetails"></view>
					</template>
				</cu-custom>
			</template>
			<view :class="bgInfo.filter ? 'filter-blur' : ''" class="cu-chat im-flex"  @click="closeInput" >
				<view :id="`zp-id-${item.zp_index}`" :key="item.zp_index" style="transform: scaleY(-1);" v-for="(item,index) in virtualList">
					<view class="im-flex" v-if="item.type=='event'">
						<view class="cu-info" >{{item.content}} <text class="c-primary" v-if="item.is_undo==1 && (getTime() - item.sendTime) < globalConfig.chatInfo.redoTime*1000" @tap="reEdit(item.oldContent ?? '')">{{ $t("common.reedit") }}</text></view>
					</view>
					<template v-else>
						<view class="cu-item" :class="[item.fromUser.id==user.user_id ? 'im-rows-reverse self im-justify-content-start' : '' ]">
						<im-user :info="item.fromUser" :profile="isProfile" @longpress="at(item.fromUser)"></im-user>
						<view class="main im-wrap" :class="[item.fromUser.id==user.user_id ? 'im-rows-reverse' : '' ]" @touchstart="moreOption($event,item,index)"  @touchmove="ListTouchMove" @touchend="endTimer($event,item)">
							<view class="message-head f-12 c-666" v-if="item.fromUser.id!=user.user_id">
								<uni-tag class="mr-5 manage-tag"  v-if="item.role<3" :type="item.role==1 ? 'warning' : 'primary'" size="mini" :text="item.role==1 ? this.$t('group.owner') : this.$t('group.manage')"></uni-tag>
									<text :class="bgInfo.image ? 'c-white' : ''">{{item.fromUser.realname}} &nbsp;&nbsp;</text>
									<text class="f-11" :class="bgInfo.image ? 'c-white' : 'c-999'">{{sendTime(item.sendTime)}}</text>
								
							</view>
							<view class="im-flex im-rows-reverse self im-align-items-end" :id="'msg_id_'+item.msg_id">
								<!-- 文字消息 -->
								<im-text v-if="item.type=='text'" :item="item" :emojiMap="emojiMap" :isSelf="item.fromUser.id==user.user_id" @quoteMsg="quoteMsgInfo"></im-text>
								<!-- 图片消息 -->
								<im-image v-else-if="item.type=='image'" :src="item.content" :info="item.extends" @showImgs="showImgs"></im-image>
								<!-- 语音消息 -->
								<im-voice v-else-if="item.type=='voice'" :item="item" :playIndex="playIndex" :dataIndex="item.zp_index" :isSelf="item.fromUser.id==user.user_id" @tap="playVoice" ></im-voice>
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
								<imItem v-else :item="item" :index="item.zp_index" :isSelf="true"></imItem>
								<view class="mt-10 mr-5 f-20" v-if="item.fromUser.id==user.user_id">
									<view class="cuIcon-icloading icon-spin c-999" v-if="item.status=='going'"></view>
									<view class="cuIcon-infofill c-red" v-if="item.status=='failed'" @tap="reSend(item)"></view>
									<view class="f-16" v-if="item.is_group==0 && item.status!='going'" :class="item.is_read ? 'text-blue cuIcon-roundcheckfill' : 'c-999 cuIcon-roundcheck'"></view>
								</view>
							</view>
						</view>
					</view>
				</template>
				</view>
			</view>
			
			<template #bottom>
				<view id="im-input" v-if="is_group!=2">
					<imInput @send="sendMessage" :boxStatus="boxStatus"  @setPad="setPad" :contact="contact" ref="imInput"></imInput>	
				</view>
			</template>
			<template #backToTop>
				<view class="fixed-item radius-round" :style="{bottom:sbp+'px'}" v-show="!atCount">
					<view class="sbp f-20">
						<text class="cuIcon-refresharrow" v-if="!newMsgCount"></text>
						<text v-if="newMsgCount>0" class="f-16">{{newMsgCount}}</text>
					</view>
					
				</view>
			</template>
		</z-paging>
		<view class="add-modal" :class="modelName=='moreOpt'?'show':'none'" @tap="modelName=''">
			<view class="add-dialog" :style="popStyle" v-if="curMsg">
				<view class="add-dialog-tail" :style="tailStyle"></view>
				<view class="add-item" @tap="undoMsg()" v-if="( (getTime() - curMsg.sendTime < globalConfig.chatInfo.redoTime*1000 && curMsg.fromUser.id==user.user_id) || contact.role<3 ) 
						&& curMsg.type!=='webrtc'">
					<text class="cuIcon-repeal"></text>
					<view>{{ $t("message.undo") }}</view>
				</view>
				<view class="add-item" @tap="copyMsg()" v-if="['text','image','video','file'].includes(curMsg.type)">
					<text class="cuIcon-copy"></text>
					<view>{{ $t('message.copy') }}{{copyTxt}}</view>
				</view>
				<view class="add-item" @tap="colEmoji()" v-if="curMsg.type=='emoji'">
					<text class="cuIcon-emoji"></text>
					<view>{{ $t('message.saveEmoji') }}</view>
				</view>
				<view class="add-item" @tap="forwardMsg()" v-if="curMsg.type!=='voice' && curMsg.type!=='webrtc' && curMsg.type!=='money' ">
					<text class="cuIcon-forward"></text>
					<view>{{ $t('message.forward') }}</view>
				</view>
				<view class="add-item" @tap="quoteMsg()"  v-if="curMsg.type!=='webrtc' && curMsg.type!=='money' ">
					<text class="cuIcon-tag"></text>
					<view>{{ $t('message.quote') }}</view>
				</view>
				<view class="add-item" @tap="delMsg()" v-if="globalConfig.chatInfo.dbDelMsg && curMsg.fromUser.id==user.user_id">
					<text class="cuIcon-delete"></text>
					<view>{{ $t("common.del") }}</view>
				</view>
			</view>
		</view>
		<uni-popup ref="copymodel" background-color="#fff">
			<view class="cu-bar bg-white">
				<view class="action text-gray" @tap="$refs.copymodel.close()">{{ $t("user.cancel") }}</view>
				<view class="action text-blue" @tap="copyMsg()">{{ $t('message.copy') }}</view>
			</view>
			<scroll-view scroll-y="true" :style="{height:'calc(100vh - 180px)'}">
				<view class="pd-20 text-container">
					<mp-html :content="curMsg.content"></mp-html>
				</view>
			</scroll-view>
		</uni-popup>
		<view class="fixed-item" v-if="atCount" @tap="openAtModel"  :style="{bottom:sbp+'px'}">
			{{atCount}}{{ $t('message.remindMe') }}
		</view>
		<uni-popup ref="atmodel" background-color="#f5f5f5">
			<view class="popup-content">
				<view class="cu-bar bg-white">
					<view class="action" v-if="modelStatus==3" @tap="backToList()"> <text class="cuIcon-back"></text> {{ $t('common.back') }}</view>
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
				<view class="cu-item" @tap="preview(1)" >
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
	import imInput from '@/components/message/im-input.vue';
	import statusPoint from '@/components/status.vue';
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
	
	import { chat } from '@/mixins/chat.js'
	import { useloginStore } from '@/store/login';
	import { useMsgStore } from '@/store/message';
	import { storeToRefs } from 'pinia';
	import pinia from '@/store/index'
	const msgStore = useMsgStore(pinia)
	const {newMessage,msgList,getContact,appendMsg,checkMsg,unread} = storeToRefs(msgStore);
	const userStore = useloginStore(pinia)
	const getTime = () => {
	  return new Date().getTime();
	};
	export default {
		mixins:[chat],
		components: {
			statusPoint,
			imInput,
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
		data() {
			return {
				user:userStore.userInfo,
				contact:{},
				is_group:0,
				boxStatus:0,
				paddingT:0,
				video:'',
				videoUrl: '',
				InputBottom: 0,
				player    : null,
				fileExt:[],
				page:1,
				limit:20,
				last_id:0,
				moreData:true, //是否有更多数据
				newMessage:newMessage,
				messageList:msgList,
				virtualList:[],
				loading:'more',
				loadLock:false,
				paddingB:0,
				contact_id:0,
				bottomHeight:50,
				globalConfig:userStore.globalConfig,
				modelName:'',
				curMsg:'',
				curIndex:0,
				isSending:false,
				copyTxt:'',
				wsData:null,
				timer:null,
				lastTapDiffTime: 0,
				isProfile:false,
				islongPress:false,
				listTouchStart:0,
				groupInfo:{
					groupUserCount:0
				},
				atCount:0,
				newMsgCount:0,
				unread:unread,
				isBottom:true,
				bgInfo:{
					image:'',
					filter:0
				},
				tailStyle: { // 小尾巴的样式
					left: '0px',
					top: '0px',
				},
				popStyle:{ //长按消息菜单
					left: '0px',
					top: '0px',
					width:'0px',
					height:'0px'
				},
				sbp:70
			};
		},
		watch:{
			newMessage(val){
				if(val.toContactId==this.contact.id && val.fromUser.id!=this.user.user_id){
					this.$api.msgApi.setMsgIsRead({
						toContactId: this.contact.id,
						is_group: this.contact.is_group,
						messages: val,
						fromUser: val.fromUser.id,
					});
				}
			}
		},
		onLoad(options){
			// 清空消息列表,避免串台
			msgStore.msgList=[];
			let bgInfo=uni.getStorageSync('chat-bg-info'+options.id);
			if(bgInfo){
				this.bgInfo=bgInfo;
			}
			// 获取当前联系人信息
			let data=msgStore.getContact(options.id);
			if(!data){
				uni.showToast({
					title:this.$t('group.noContact'),
					icon:'none',
					duration:1500,
					complete:(res)=>{
						uni.reLaunch({
							url: '/pages/index/index'
						})
					}
				})
				return;
			}
			if(data.is_group==1 && (data.role<3 || data.setting.profile=='1')){
				this.isProfile=true;
			}
			this.contact = data;
			this.contact_id=options.id;
			this.is_group = data.is_group;
			if(data.is_group==1){
				this.getGroupInfo();
			}
			let unread=msgStore.unread;
			// 如果有未读,就将未读的角标置为0
			if(data.unread>0){
				let contacts=msgStore.updateContacts({
					id:options.id,
					unread:0
				});
				msgStore.unread = unread - data.unread;
			}
			// 监听消息更新请求
			uni.$on('getPositonsOrder',(res) => {
				let message=res.data;
				switch (res['type']) {
					//处理消息已读,将本地的未读消息修改为已读状态
					case "isRead":
						for (let i = 0; message.length > i; i++) {
					        const data = {
					          id: message[i]["id"],
					          is_read: 1
					        };
					        this.updateMessage(data);
					     }
						break;
					case "readAll":
						// 如果某人阅读了消息，全部置为已读
						if(message.toContactId==this.contact.id && this.is_group==0){
							this.messageList.forEach((item)=>{
								item.is_read=1;
							})
						}
						break;
					//上线、下线通知
					case "isOnline":
						if(message.id==this.contact.id){
							this.contact.is_online=message.is_online;
						}
						break;
					// 撤回消息
					case "undoMessage":
						if(message.from_user==this.user.user_id && message.isMobile==1 && getTime()-message.sendTime<this.globalConfig.chatInfo.redoTime*1000){
							return false;
						}
					    this.updateMessage(message);
					    break;
					// 删除消息
					case "delMessage":
						this.messageList = this.messageList.filter((item)=>{
							return item.id!=message.id;
						})
					    break;
					// 更新消息
					case "updateMessage":
					    this.updateMessage(message);
					    break;
					case "atMsgList":
					case "simple":
					case "group":
					case "webrtc":
					case "removeUser":
					case "clearMessage":
					case "delMessage":
						let routes = getCurrentPages();
						let curParam ={};
						let routePages = routes[routes.length - 1].route;
						let pages = 1;
						// 如果是音视频聊天页面的话就需要上一个页面的参数
						if(routePages=='pages/message/call'){
							pages = 2;
						}
						// #ifdef MP-WEIXIN
						curParam = routes[routes.length - pages].options ?? '';
						// #endif
						// #ifdef APP-PLUS
						curParam = routes[routes.length - pages].$page.options ?? '';
						// #endif
						// 如果是h5需要单独去获取url的参数
						// #ifdef H5
						let url = location.href;
						// 如果是音视频聊天页面的话就不要写入消息
						if(url.indexOf('pages/message/call')!==-1){
							return;
						}
						curParam=this.$util.parseUrl(url);
						// #endif
						if(res['type']=='atMsgList'){
							if(message.toContactId==curParam.id){
								this.atMsgList=message.list;
								this.atCount=message.count;
							}
							return;
						}
					    
						// 如果是删除的本人和当前群聊,返回到列表页
						if(res['type']=='removeUser'){
							if(message.group_id==curParam.id && message.user_id == this.user.user_id){
								uni.showToast({
									title:this.$t('group.removedGroup'),
									icon:'none',
									complete: () => {
										uni.reLaunch({
											url: '/pages/index/index'
										})
									}
								})
								
							}
							return;
						}
						
						if(res['type']=='clearMessage'){
							if(message.group_id==curParam.id){
								this.messageList=[];
								msgStore.updateContacts({
									id:message.group_id,
									lastContent:''
								})
							}
							return;
						}
						if(res['type']=='delMessage'){
							if(message.group_id==curParam.id){
								this.messageList = this.messageList.filter(item => item.id != message.id)
							}
							return;
						}
						if(message.type=='webrtc'){
							if(!['calling','hangup','otherOpt'].includes(message.extends.event)){
								return false;
							}
							if(message.extends.event=='calling'){
								this.wsData=message;
							}
							let code=parseInt(message.extends.code);
								if([902,903,904,905,906,907].includes(code)){
								let wsData=this.wsData || message;
								wsData.content=message.content;
								message=wsData;
							}
						}
						let isAppend=false;
						if(message.is_group==1){
							if(message.toUser==curParam.id){
								isAppend=true;
							}
						}else{
							// 如果是当前的聊天房间，才可以进行消息新增
							if(message.toContactId==curParam.id || (message.fromUser.id==this.user.user_id && message.toUser==curParam.id)){
								isAppend=true;
							}
						}
						if(isAppend){
							let msgList=this.messageList;
							let hasMsg=false;
							msgList.forEach((item, index) => {
								if (item.id==message.id) {
								  hasMsg=true;
								}
							})
							if(!hasMsg){
								this.appendTime(message);
								this.$refs?.paging?.addChatRecordData(message,this.isBottom ? true : false);
								if(!this.isBottom){
									this.newMsgCount++;
								}
							}
							msgStore.appendMsg(message);
							let contact=msgStore.getContact(this.contact_id,message);
							let at=contact.is_at;
							if(message.fromUser.id!=this.user.user_id){
								// 将姓名显示为备注信息的新名称
								let fromContact=msgStore.getContact(message.fromUser.id,message);
								// 个人才显示备注
								if(fromContact && fromContact.is_group==0){
									message.fromUser.realname=fromContact.displayName;
								}
							}
							// 检查当前聊天的新消息是否有@数据,有的话直接清楚列表中的提醒
							if(message.at.includes(this.user.user_id)){
								msgStore.msgAt-=1;
								at= contact.is_at-1;
							}
							msgStore.updateContacts({
								id:curParam.id,
								unread:0,
								is_at:at
							});
						}
						break;
				}
			})
		},
		onUnload(){
			// 聊天记录置为空
			msgStore.msgList=[];
			uni.$off("socketStatus");
		},
		beforeDestroy(){
			uni.$off("socketStatus");
		},
		// 所有聊天页面都返回首页，避免层级过深
		onBackPress(options) {
			this.InputBottom=0;
			uni.switchTab({
				url: '/pages/index/index'
			})
			return true;
		},
		onShow(){
			// 检测ws是否还在线
			this.socketIo.send({type:'ping'});
			// #ifdef APP-PLUS
			let webview = this.$scope.$getAppWebview()
			webview.setSoftinputTemporary({mode:'adjustResize'})
			// #endif
		},
		created: function(){
			
		},
		mounted () {
			// 重新链接就更新消息列表
			uni.$on('socketStatus',(e)=>{
				if(e){
					this.page=1;
					if(this.is_group==1){
						this.getGroupInfo();
					}
				}
			})
			this.sbp=50+this.inlineTools+20;
		},
		methods: {
			appendTime(message){
				let prev=this.messageList[0];
				// 如果是新的消息,要增加新的时间
				if(prev && message.sendTime - prev.sendTime >180000){
					this.$refs.paging.addChatRecordData({
						id:'time_'+message.sendTime,
						type:'event',
						is_undo:0,
						content:this.$util.hoursTimeFormat(message.sendTime)
					})
				}
			},
			scrollToB(){
				this.isBottom=true;
				this.newMsgCount=0;
			},
			scrollChat(){
				this.isBottom=false;
			},
			// 长按头像@人
			at(item){
				if(this.contact.is_group==0 || this.user.user_id==item.id){
					return;
				}
				item.user_id=item.id;
				this.$refs.imInput.setAtList(item);
			},
			openAtModel(){
				this.$refs.atmodel.open('bottom');
				this.mapList=JSON.parse(JSON.stringify(this.atMsgList));
				this.modelStatus=1;
				let msgAt=msgStore.msgAt;
				let curAt=this.atCount;
				this.$api.msgApi.readAtMsg({toContactId:this.contact_id}).then(res => {
					if(res.code==0){
						msgStore.msgAt=msgAt-curAt;
						msgStore.updateContacts({
							id:this.contact_id,
							is_at:0
						})
						this.atCount=0;
					}
				})
			},
			calling(type){
				this.$refs.imInput.calling(parseInt(type));
			},
			endTimer(e,item) {
			    clearTimeout(this.timer);
				setTimeout(() => {
					this.islongPress = false
				}, 200)
				this.dblclick(item)
			},
			setPad(padding){ //设置聊天内容的地步边距
				this.sbp=padding+this.inlineTools+20;
			},
			 // 双击
			dblclick(item) {
				const _this = this;
				// 当前时间
				const curTime = new Date().getTime();
				// 上次点击时间
				const lastTime = _this.lastTapDiffTime;
				// 更新上次点击时间
				_this.lastTapDiffTime = curTime;
				// 两次点击间隔小于300ms, 认为是双击
				const diff = curTime - lastTime;
				if (diff < 300) {
					this.curMsg=item;
					this.$refs.copymodel.open('bottom');
				}  
			},
			getTime(){
			  return new Date().getTime();
			},
			// 获取群聊信息
			getGroupInfo(){
				this.$api.msgApi.groupInfo({
					group_id: this.contact_id,
				}).then(res => {
					if(res.code==0){
						this.groupInfo=res.data;
					}
				})
			},
			virtualListChange(vList) {
				this.virtualList = vList;
			},
			updateMessage(message){
				let msgList = this.messageList;
				// 更新联系人
				msgList.forEach((item, index) => {
					let msg = msgList[index];
					if (item.id == message.id) {
						msgList[index] = Object.assign(msg, message);
					}
				})
				this.messageList=msgList;
			},
			// 获取消息列表
			queryList(pageNo, pageSize) {
				let params={
					is_group: this.is_group,
					toContactId: this.contact.id,
					last_id:this.last_id,
					page: pageNo,
					limit: pageSize
				};
				this.$api.msgApi.getMessageList(params).then(res => {
					// 获取当前页最小的ID值
					if(res.data.length>0){
						this.last_id=res.data[0]?.msg_id;
					}
					// 将请求的结果数组传递给z-paging
					let list=res.data.slice().reverse();
					let data=[];
					list.map((item, index) => {
						let prev = list[index - 1];
						if(prev && prev.sendTime - item.sendTime>180000){
							data.push({
								id:'time_'+prev.sendTime,
								type:'event',
								is_undo:0,
								content:this.$util.hoursTimeFormat(prev.sendTime)
							})
						}
						data.push(item);
						// 最后一个消息要加入时间
						if(list.length==index+1 && list.length<pageSize){
							data.push({
								id:'time_'+item.sendTime,
								type:'event',
								is_undo:0,
								content:this.$util.hoursTimeFormat(item.sendTime)
							})
						}
					})
					this.$refs.paging.complete(data);
				}).catch(res => {
					console.error(res);
					uni.showToast({
						title:res.message,
						icon:'none'
					})
					this.$refs.paging.complete(false);
				})
			},
			//长按事件
			moreOption(e,item,index){
				this.timer = setTimeout(() => {
					this.curMsg = item;
					this.curIndex = index;
					let count = 0;
					let isMe = item.fromUser.id == this.user.user_id
					let isRecall = ( (this.getTime() - this.curMsg.sendTime < this.globalConfig.chatInfo.redoTime*1000 && this.curMsg.fromUser.id==this.user.user_id) || this.contact.role<3 )  && this.curMsg.type!=='webrtc';
					let isDelete = parseInt(this.globalConfig.chatInfo.dbDelMsg) && isMe;
					if(item.type=="text" || item.type=="emoji"){
						count = 3 //转发  引用
					}if(['image','file','video'].includes(item.type)){
						this.copyTxt=this.$t('message.link');
						count = 3
					}else if(item.type=="location" || item.type=="contact"){
						count = 2 //转发  引用
					}else if(item.type=="voice"){
						count = 1;//引用
					}
					if(isRecall){
						++count
					}
					if(isDelete){
						++count
					}
					if(count==0) return false;
					// 如果长按后没有移动才是长按事件
					if(this.islongPress!='move'){
						this.islongPress=true;
						this.modelName='moreOpt';
						this.showMenu(item.msg_id,count,isMe)
					}
				}, 800); // 设置为 1 秒
			},
			showMenu(msg_id,count,isMe) {
				
			    const query = this.$util.getQuery(this).select(`#msg_id_${msg_id}`).boundingClientRect();
			    query.exec((res) => {
			        if (res && res[0]) {
			            const element = res[0];
			            const windowWidth = this.width; // 获取窗口宽度
			            const windowHeight = this.height; // 获取窗口高度
			            const menuWidth = 62 * count; // 动态计算菜单宽度
			            const menuHeight = 60; // 动态计算菜单高度，按每行最多 4 个菜单项布局
						let isBottom =  false;
			
			            // 默认菜单显示在元素上方
			            let left = isMe?element.left + (element.width / 2) - (menuWidth / 1.3):element.left + (element.width / 2)- (menuWidth / 2);
			            let top = element.top - menuHeight - 10;
			
			            // 如果菜单超出左侧边界，将菜单固定到左侧边距
			            if (left < 10) {
			                left = 40; // 保留 10px 边距
			            }
			
			            // 如果菜单超出顶部边界，将菜单显示在元素下方
			            if (top < 10) {
							isBottom =  true;
			                top = element.top + element.height + 20;
			            }
			
			            // 更新菜单样式
			            this.popStyle = {
			                left: `${left}px`,
			                top: `${top}px`,
			                // width: `${menuWidth}px`,
			                height: `${menuHeight}px`,
			            };
			
			            // 计算小尾巴的样式
			            const tailLeft = element.left+ (element.width / 2)  - 10; // 小尾巴居中
						
			            const tailTop = isBottom?top-8:top+menuHeight-15; // 根据菜单显示位置调整
			
			            this.tailStyle = {
			                left: `${tailLeft}px`,
			                top: `${tailTop}px`,
			            };
			        }
			    });
			},
			ListTouchMove(e){
				this.islongPress='move';
			},
			undoMsg(){
				let message=this.curMsg;
				this.modelName='';
				this.$api.msgApi.undoMessage({ id: message.id })
				  .then(res => {
					const data = {
					  id: message.id,
					  type: "event",
					  is_undo:1,
					  content: this.$t('message.undoMsged'),
					  oldContent:message.content,
					  toContactId: message.toContactId,
					};
					this.updateMessage(data);
				  })
				  
			},
			delMsg(){
				let message=this.curMsg;
				this.modelName='';
				uni.showModal({
					title: this.$t('message.delMsgConfirm'),
					success: e => {
						if (e.confirm) {
							this.$api.msgApi.delMessage({ id: message.id })
							  .then(res => {
								if(res.code==0){
									this.messageList.splice(this.curIndex, 1);
								}
							  }) 
						}
					}
				});
				
			},
			copyMsg(){
				let content=this.$util.htmlToLines(this.curMsg.content);
				uni.setClipboardData({
					data:content,
					showToast:true
				});
				this.$refs.copymodel.close();
				this.curMsg='';
			},
			colEmoji(){
				let msg=this.curMsg;
				this.$api.emojiApi.addEmoji({ file_id: msg.file_id })
				  .then(res => {
					if(res.code==0){
						// 添加后更新表情列表
						this.$refs.imInput.getEmojiList();
					}
				  }) 
			},
			// 转发消息
			forwardMsg(){
				uni.navigateTo({
					url:'/pages/index/userSelection?contact_id='+this.contact_id+'&type=3'
				})
			},
			// 引用消息
			quoteMsg(){
				let msg=this.curMsg;
				let regex = /<[^>]+>/g; // 定义正则表达式，匹配所有的HTML标签
				let content=msg.content.replace(regex, '');
				if(!['text','event','location','contact'].includes(msg.type)){
					content = this.$util.getMsgType(msg.type);
				}
				let quote={
					msg_id:msg.msg_id,
					content:msg.fromUser.displayName+'：'+content,
					user_id:msg.fromUser.id,
					realname:msg.fromUser.displayName
				};
				this.$refs.imInput.quoteMessage(quote);
			},
			reEdit(text){
				this.$refs.imInput.inputMsg=text;
				this.$refs.imInput.editorCtx.setContents({
					html:text
				})
				this.$refs.imInput.isFocus=true;
			},
			backToTopClick(e){
				this.newMsgCount=0;
			},
			// 打开聊天详情
			openDetails(){
				uni.navigateTo({
					url:"/pages/message/detail?id=" + this.contact.id+"&is_group=" + this.contact.is_group
				})
			},
			// 重新发送
			reSend(message){
				message.status='going';
				this.sendMessage(JSON.parse(JSON.stringify(message)),'',true);
			},
			// 发送消息
			sendMessage(message,file,isReSend=false){
				// 如果开启了群聊禁言或者关闭了单聊权限，就不允许发送消息
				if(!this.nospeak()){
					//已开启禁言
					uni.showToast({
						title:this.$t('group.noSpeakNoSend'),
						icon: "none"
					})
					return;
				}
				let user=this.user;
				user.id=user.user_id;
				message.fromUser=user;
				message.from_user=this.user.user_id;
				message.toContactId=this.contact.id;
				message.is_group=this.contact.is_group;
				if(!isReSend){
					this.appendTime(message);
					this.$refs.paging.addChatRecordData(message);
				}
				let fileTypes = ["image", "file", "video",'voice'];   
				let simpleType=['text','location','contact','emoji'];
				if(simpleType.includes(message.type)){
					this.$api.msgApi.sendMessage(message)
						.then((res) => {
							if(res.code==0){
								this.updateMessage(res.data);
							}else if(res.code==401){
								// 删除最后一条信息
								this.messageList.pop();
								//已开启禁言
								uni.showToast({
									title: res.msg,
									icon: "none"
								})
							}else{
								this.sendFailed(message);
							}
						})
						.catch((error) => {
							this.sendFailed(message);
						});
				}else if (fileTypes.includes(message.type)) {
					var self=this;
					let maxSize=this.globalConfig.fileUpload.size ?? 10;
					if(message.fileSize>maxSize*1024*1024){
						return uni.showToast({
							title: this.$t('message.fileLimit')+maxSize+'M',
							icon:'error'
						})
					}
					uni.uploadFile({
						url: this.$api.msgApi.uploadUrl,
						filePath: message.content,
						name: 'file',
						header: {
							'Authorization': uni.getStorageSync('authToken'),
						},
						formData: {
							message: JSON.stringify(message)
						},
						success: (e) => {
							let res=JSON.parse(e.data);
							
							if(res.code==0){
								this.updateMessage(res.data);
							}else if(res.code==401){
								// 删除最后一条信息
								this.messageList.pop();
								//已开启禁言
								uni.showToast({
									title: res.msg,
									icon: "none"
								})
							}else{
								this.sendFailed(message);
							}
						},
						fail: (res) => {
							this.sendFailed(message);
						}
					})
				}
				
			},
			sendFailed(message){
				message.status='failed';
				this.updateMessage(JSON.parse(JSON.stringify(message)));
			},
			
			// 如果点击了聊天记录列表页,需要收起表情面板或者其他的面板
			closeInput(e){
				this.boxStatus++;
			},
			// 禁言时禁止发送消息
			nospeak(){
			  if(this.is_group==1 && this.contact.setting.nospeak>0){
				if(this.contact.setting.nospeak==1 && this.contact.role<3){
				  return true;
				}else if(this.contact.setting.nospeak==2 && this.contact.role==1){
				  return true;
				}else{
				  return false;
				}
			  }else{
				return true;
			  }
			}
		}
	}
</script>
<style lang="scss">

#more-oprate{
	min-height:100%;
	justify-content: flex-end;
	flex-direction: column;
}
.cu-chat{
	padding:30rpx 0;
}
.cu-chat .cu-item.self {
    justify-content: flex-start;
    text-align: right;
}

.cu-chat .cu-item{
		padding:20rpx 20rpx 0 20rpx !important;
	}

.fixed-item{
	position:fixed;
	right:20rpx;
	bottom:120rpx;
	background-color: #fff;
	border-radius:30rpx;
	color:#0389fb;
	padding:14rpx 18rpx;
	.sbp{
		font-weight: bold;
		width:20px;
		height:20px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
}

.im{padding:30rpx;}
.im-system-msg{color:#FFFFFF; font-size:26rpx; line-height:38rpx; padding:5px 10px; display:block; border-radius:6rpx;}
.im-msg{margin-bottom:28px; display:flex; flex-direction:row; flex-wrap:nowrap;}
.cu-chat .cu-item>.main {
    max-width: calc(100% - 230rpx);
    margin: 0 0.8rem;
    display: flex;
    align-items: center;
	}
.icon-spin{
	animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.main .content ::v-deep uni-text , 
.main .content ::v-deep uni-text span,
 .main .content ::v-deep text,
  .main .content ::v-deep uni-rich-text{
	word-wrap: break-word !important;
	word-break: break-all !important;
}

.main .content ::v-deep ._block ._a{
	pointer-events: none !important;
}

.text-container{
	-webkit-user-select:text !important;
	user-select:text !important;
	font-size:48rpx;
	word-wrap: break-word !important;
	text-align: left;
	line-height: 1.5;
	letter-spacing: 1.2px;
	color:#333;
}
::v-deep .checklist-group{
	display: grid !important;
	.checklist-box{
		padding:20rpx;
		.checkbox__inner{
			width:40rpx !important;
			height:40rpx !important;
			overflow:hidden;
			.checkbox__inner-icon{
				position: absolute;
				top: -8px !important;
				left: -4px !important;
				height: 20px !important;
				width: 20px !important;
				border-right-width: 2px !important;
				border-bottom-width: 2px !important;
			}
		}
		.checklist-content{
			margin-left:20rpx;
			.checklist-text{
				font-size:36rpx !important;
			}
			
		}
	}
	// .is-checked{
	// 	.checkbox__inner{
	// 		background-color: #18bc37 !important;
	// 		border-color: #18bc37 !important;
	// 	}
	// 	.checklist-content{
	// 		.checklist-text{
	// 			color: #18bc37 !important;
	// 		}
			
	// 	}
	// }
}
.read-status{
	font-weight: 600;
}
#im-input{
	z-index:999999999;
}


</style>

<style lang="scss" scoped>

	// 设置表情图片居中
	::v-deep .emoji-image{
		vertical-align: text-top !important;
	}
	
	.cu-chat ::v-deep .cu-item {
	    padding: 20rpx;
	}
	.back-unread{
		background-color: #e3e3e3;
		padding:4rpx 10rpx;
		border-radius: 50%;
		font-size: 22rpx;
	}

.add-modal {
	.add-dialog {
		display: flex;
		flex-wrap: wrap;
		height: 100rpx; /* 与菜单高度一致 */
		background-color: #4f4f4f;
		color: #fff;
		border-radius: 10rpx;
		justify-content: space-between;
		align-items: center;
		position: absolute;
		padding: 10rpx;

		.add-item {
			width: 90rpx; /* 每个菜单项的宽度 */
			height: 70rpx; /* 每个菜单项的高度 */
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			margin: 6rpx;
			line-height: 1.5;
			view{
				font-size: 22rpx;
			}
		}

		.add-dialog-tail {
			width: 20px;
			height: 20px;
			position: fixed;
			transform: rotate(45deg);
			background: #4f4f4f;
			z-index: -1;
		}
	}
}
.show{
	position: fixed;
	top: 0;
	z-index: 9999;
	height: 100vh;
	width: 100vw;
}
.none{
	position: fixed;
	top: 0;
	right: 0;
	z-index: -10;
	opacity: 0;
}
  .blur-background {
    position: absolute;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background-size: cover;
    background-position: center;
  }

  .filter-blur::before {
    content: " ";
    position: absolute;
	top:0;
	left:0;
	right:0;
    bottom: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(6px); /* 应用10px的背景模糊效果 */
    z-index: 0;
  }
  
  .message-head{
	width:100%;
	margin-bottom: 6rpx;
	display: flex;
	align-items: flex-end;
  }
  
  .im-rows-reverse .message-head{
	  justify-content: flex-end;
  }
  .manage-tag{
	  padding:1px !important;
	  font-size:10px !important;
  }
  .message-active{
	  background-color: #e3e3e3;
  }
  .load-more{
	  text-align: center;
  }
</style>
