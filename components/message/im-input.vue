<template name="im-input">
	<view class="im-container bg-gray" :style="[{minHeight:appBox ? footerHeight+'px' : 'auto',paddingBottom:paddingB+'px'}]">
		<view class="im-footer bg-gray">
			<view class="im-menus f-28" v-show="!isFocus || contact.is_group!=1" style="margin-bottom: 8rpx;"  :class="[recShow ? 'cuIcon-keyboard' : 'cuIcon-sound']"  hover-class="tap"  @tap="showRec"></view>
			<view class="im-menus f-24" v-show="isFocus && contact.is_group==1" style="margin-bottom: 13rpx;"  @tap="modelName='userModel';$refs.usermodel.open('bottom')">@</view>
			<view class="im-flex1 im-msgarea">
				<editor id="editor" class="solid-bottom bg-white im-input c-333" :adjust-position="true" maxlength="300" cursor-spacing="10"
				 @focus="InputFocus" @blur="InputBlur" @input="changeMsgText" @ready="onEditorReady" :read-only="readOnly" v-show="recShow==false"> </editor>
				 <view class="toolBox" v-show="recShow==true">
					<view class="recorder" :class="{active:isUseRecorder}" @touchstart.prevent="startRecorder"
						@touchend.prevent="endRecorder" @touchmove.prevent="moveRecorder" @touchcancel="cancelRecorder">
						{{isUseRecorder ? $t('chat.touchEnd') : $t('chat.touchSpeak')}}
					</view>
				</view>
				<view class='im-flex im-space-between message-quote radius-6 im-align-items-center' v-if="quote">
					<view class='text-overflow'>{{quote.content}}</view>
					<view class="cuIcon-close" @tap="closeQuote"></view>
				</view>
				
			</view>
			<mumu-recorder ref='recorderRef' @success='handlerSuccess' @error='handlerError' v-if="isH5"></mumu-recorder>
			 <view class="im-flex im-justify-content-start im-align-items-center"  style="margin-bottom: 8rpx;" >
				 <view class="im-menus cuIcon-emoji f-28 ml-5" hover-class="tap" @tap="showAppBox(1)"></view>
				 <view class="im-menus cuIcon-roundadd f-28 mr-10" hover-class="tap" v-if="!inputMsg" @tap="showAppBox(2)"></view>
				 <view v-if="inputMsg">
					 <button class="cu-btn bg-blue shadow  mr-10" @touchend.prevent="sendTextMsg">{{$t('chat.send')}}</button>
				 </view>
			 </view>
			
			
		</view>
		<!-- 表情窗口 -->
		 <view class="im-flex im-columns im-emoji-box" :style="[{height:boxHeight+'px'}]" v-if="appBox==1">
			 <scroll-view scroll-x class="bg-gray nav im-emoji-header im-flex" scroll-with-animation :scroll-left="scrollLeft">
				<view class="cu-item" :class="index==TabCur?'text-blue':''" v-for="(item,index) in emojiList" :key="index" @tap="tabSelect" :data-id="index" :data-name="item.name">
					<view :class="[item.icon]" class="f-20"></view>
				</view>
			 </scroll-view>
			 <scroll-view scroll-y class="bg-white im-emoji-body">
				 <view class="im-flex im-wrap im-justify-content-start im-align-items-center pd-10" :class="emojiName=='favors'?' cu-list grid col-5':''">
					<view v-if="emojiName=='favors'" class="im-emoji-item">
						<view  class="upload-emoji" @tap="uploadEmoji"><text class="cuIcon-add c-999" style="vertical-align: sub;"></text></view>
					</view>
					<view v-for="(item,index) in currentEmojiList" class="im-emoji-item" :key="index">
						<image :src="item.src" style="width:100rpx;height:100rpx" mode="aspectFit"  :fade-show="false" lazy-load @tap="chooseDiyEmoji(item)" v-if="emojiName=='favors'"></image>
						<image :src="item.src" style="width:44rpx;;height:44rpx" mode="aspectFit" lazy-load @tap="chooseEmoji(item)" v-else></image>
					</view>
				 </view>
			 </scroll-view>
		 </view>
		 
		 <!-- 工具栏窗口 -->
		 <view class="im-flex im-app-box im-flex im-justify-content-start im-wrap im-align-content-start pd-20" :style="[{height:boxHeight+'px'}]" v-if="appBox==2">
				 <view class="im-flex im-columns im-align-items-center mt-10 im-app-item" @tap="chooseImg">
					 <view class="bg-white cuIcon-album f-24 radius-10  im-app-item-icon"></view>
					 <view class="mt-5">{{$t('common.photo')}}</view>
				 </view>
				 <view class="im-flex im-columns im-align-items-center mt-10 im-app-item" @tap="chooseVideo">
					 <view class="bg-white cuIcon-video f-24 radius-10 im-app-item-icon"></view>
					 <view class="mt-5">{{$t('common.video')}}</view>
				 </view>
				 <view class="im-flex im-columns im-align-items-center mt-10 im-app-item" @tap="chooseFile">
					 <view class="bg-white cuIcon-file f-24 radius-10 im-app-item-icon"></view>
					 <view class="mt-5">{{$t('common.file')}}</view>
				 </view>
				 <view class="im-flex im-columns im-align-items-center mt-10 im-app-item" v-if='!contact.is_group && (isH5 || isApp) &&  parseInt(globalConfig.chatInfo.webrtc)' @tap="calling(0)">
					 <view class="bg-white cuIcon-dianhua f-24 radius-10 im-app-item-icon"></view>
					 <view class="mt-5">{{$t('message.voiceCall')}}</view>
				 </view>
				 <view class="im-flex im-columns im-align-items-center mt-10 im-app-item" v-if='!contact.is_group && (isH5 || isApp) && parseInt(globalConfig.chatInfo.webrtc)' @tap="calling(1)">
					 <view class="bg-white cuIcon-record f-24 radius-10 im-app-item-icon"></view>
					 <view class="mt-5">{{$t('message.videoCall')}}</view>
				 </view>
				 <!-- <view class="im-flex im-columns im-align-items-center mt-10 im-app-item" @tap="chooseLocation">
					 <view class="bg-white cuIcon-location f-24 radius-10 im-app-item-icon"></view>
					 <view class="mt-5">{{$t('common.location')}}</view>
				 </view> -->
				 <view class="im-flex im-columns im-align-items-center mt-10 im-app-item" @tap="$refs.contactmodel.open('bottom')">
					 <view class="bg-white cuIcon-addressbook f-24 radius-10 im-app-item-icon"></view>
					 <view class="mt-5">{{$t('common.idcard')}}</view>
				 </view>
		 </view>
				
		<view class="voice-model c-white radius-10 im-flex im-columns im-align-items-center pd-10" v-show="isUseRecorder">
			<view class="cuIcon-voicefill mt-15 mb-5 f-28" :class="[isCancel ? 'c-red' : 'voice-icon']"></view>
			<view :class="[isCancel ? 'c-red' : '']">
				{{isCancel ? $t('chat.touchCancel') : $t('chat.recorded')}}
			</view>
		</view>
		<uni-popup ref="usermodel" background-color="#fff">
			<view class="cu-bar bg-white">
				<view class="action text-gray" @tap="closeModel();">{{$t('common.cancel')}}</view>
				<view class="f-16">{{$t('message.remindTo')}}</view>
				<view class="action text-blue" @tap="at()">{{$t('common.complete')}}</view>
			</view>
			<view class="manage-content" style="height:500px" @tap.stop=''>
				<scroll-view  style="height:500px" scroll-y="true">
					<user-select v-if="contact.is_group==1" :type="4" :contact_id="contact.id" ref="userSelect" @setData="setAtList"></user-select>
				</scroll-view>
			</view>
		</uni-popup>
		<uni-popup ref="contactmodel" background-color="#fff">
			<view class="cu-bar bg-white">
				<view class="action text-gray" @tap="closeModel();$refs.contactmodel.close();">{{$t('common.cancel')}}</view>
				<view class="f-16">{{$t('message.shareTo')}}</view>
				<view class="action text-blue" @tap="sendContactCard()">{{$t('common.complete')}}</view>
			</view>
			<view class="manage-content" style="height:500px" @tap.stop=''>
				<scroll-view  style="height:500px" scroll-y="true">
					<user-select :type="1" :multiple="false" :contact_id="contact.id" ref="contactSelect"></user-select>
				</scroll-view>
			</view>
		</uni-popup>
		
	</view>
</template>
<script>
import MumuRecorder from '@/uni_modules/mumu-recorder/components/mumu-recorder/mumu-recorder.vue'
import userSelect from '@/components/message/user-select.vue';
import Edit from '@/utils/edit.js'
import emoji from '@/utils/emoji.js'
import { useMsgStore } from '@/store/message';
import { useloginStore } from '@/store/login';
import pinia from '@/store/index'
const msgStore = useMsgStore(pinia);
const userStore = useloginStore(pinia);
export default {
	name  : "im-input",
	components: { MumuRecorder,userSelect },
	props : { 
		boxStatus:{type:Number, default:0},
		contact:{type:Object, default:{}}
	},
	data() {
		return {
			editorCtx:null,
			InputBottom     : 0,
			paddingB        : 0,
			footerHeight    : 50,
			boxHeight       : 300,
			uploading       : false,
			recShow         : false,
			inputMsg        : "",
			recorderManager : null,
			recing          : false,
			recLength       : 1,
			recTimer        : null,
			tmpVoice        : '',
			isUseRecorder: false,
			playItemIndex: -1,
			currentAudio: '',
			mainHeight:0,
			isCancel:false,
			isH5:false,
			isApp:false,
			appBox:0,
			TabCur: 0,
			emojiName:'',
			scrollLeft: 0,
			emojiList:[],
			currentEmojiList:[],
			isFocus:false,
			globalConfig:userStore.globalConfig,
			userInfo:userStore.userInfo,
			readOnly:false,
			edit: null,
			modelName:false,
			isAt:false,
			quote:'',
			boardHeight:0,
		}
	},
	watch:{
		boxStatus(val){
			// #ifdef APP-PLUS
			this.editorCtx.blur();
			uni.hideKeyboard()
			// #endif
			this.appBox=0;
		},
		footerHeight(val){
			this.$emit('setPad',val);
		},
		appBox(val){
			
			if(val==0){
				
				this.footerHeight=50;
			}
		},
		inputMsg(val){
			if(val=='<p><br></p>'){
				this.inputMsg='';
			}
		}
	},
	beforeUnmount(){
		if(this.inputMsg){
			uni.setStorageSync('draft_'+this.contact.id,this.inputMsg);
		}else{
			uni.removeStorageSync('draft_'+this.contact.id);
		}
		msgStore.updateContacts({
			id:this.contact.id,
			draft:this.inputMsg
		})
	},
	mounted(){
		// #ifndef H5
		// 监听键盘高度
		uni.onKeyboardHeightChange(res => {
			if(this.appBox==0 || res.height>0){
				this.boardHeight=res.height;
			}
			if(res.height>0){
				this.paddingB=0;
				this.footerHeight=50;
			}
		})
		// #endif
	},
	created : function(){
		uni.$on('updateEmoji',(res) => {
			this.getEmojiList()
		})
		this.currentEmojiList=emoji[0]['children'];
		this.getEmojiList();
		uni.getSystemInfo({
			success: res => {
				let windowHeight = res.windowHeight;
				this.mainHeight=windowHeight;
			}
		});
		// #ifdef H5
		this.isH5=true;
		// this.paddingB=15;
		// this.footerHeight=65;
		// #endif
		// #ifdef APP-PLUS
		this.isApp=true;
		// #endif
		// #ifndef H5
		this.isH5=false;
		this.recorderManager = uni.getRecorderManager();
		this.recorderManager.onStop((res) => {
			this.tmpVoice    = res.tempFilePath;
			this.recing      = false;
			if(this.recLengt<1){
				// 检测录音是否大于1秒
				return this.checkRecorder(this.recLength);
			}else{
				// 发送语音消息
				this.sendVoiceMsg();
			}
		});
		this.recorderManager.onError(() => {
			uni.showToast({ title: this.$t('chat.recordFailed'), icon: 'none' });
			this.recing = false;
		});
		// #endif
		this.paddingB =this.inlineTools;
	},
	methods:{
		msgItem(){
			return {
				id:this.$util.getUuid(),
				sendTime:new Date().getTime(),
				status: "going",
				type: "text",
				content: "",
				is_read: 0,
				is_group: 0,
				file_id: 0,
				file_cate: 0,
				fileName: "",
				fileSize: 0,
				extends: null
			}
		},
		// 设置@提醒的人
		at(){
			this.isAt=true;
			let data=this.$refs.userSelect.selectUser;
			this.closeModel();
			this.edit.addLink({
				prefix: '@',
				data:data
			})
			setTimeout(()=>{
				this.getFocus();
			},100)
		},
		// 发送名片消息
		sendContactCard(){
			let data=this.$refs.contactSelect.selectUser;
			if(data.length!=1){
				return uni.showToast({
					icon:'none',
					title:this.$t('chat.chooseOne')
				})
			}
			this.$refs.contactmodel.close();
			this.closeModel();
			let contact=data[0];
			let message={
				type:'contact',
				status:'going',
				content:'['+this.$t('chat.userIDcard')+'] '+contact.displayName,
				extends:{
					avatar:contact.avatar,
					displayName:contact.displayName,
					id:contact.id
				}
			};
			this.$emit('send',Object.assign(this.msgItem(), message),false);
		},
		// 关闭弹窗
		closeModel(){
			if(this.modelName=="userModel"){
				this.$refs.userSelect.selectUser=[];
				this.$refs.userSelect.changeUser=[];
				this.$refs.usermodel.close();
			}
			this.modelName='';
		},
		setAtList(item){
			this.isAt=true;
			this.closeModel();
			this.edit.addLink({
				prefix: '@',
				data: item
			})
		},
		// 编辑器获得焦点
		getFocus(){
			this.editorCtx.format('fontFamily', 'inherit');
			this.isFocus=true;
		},
		chooseDiyEmoji(item){
			let message={
				type:'emoji',
				content:item.src,
				file_id:item.file_id,
				status:'going'
			}
			this.$emit('send',Object.assign(this.msgItem(), message),false);
		},
		// 选择表情
		chooseEmoji(item){
			// #ifdef H5
				this.editorCtx.insertImage({
					src: item.src,
					alt: item.title,
					width: 18,
					height: 18,
					nowrap:true, 
					extClass:'emoji-image',
					success: ()=>{
					},
					complete: ()=> {
						this.editorCtx.blur();
						this.showAppBox(1)
					},
				});
			// #endif
			// #ifndef H5
				this.readOnly= true
				setTimeout(()=>{
					this.editorCtx.insertImage({
						src: item.src,
						alt: item.title,
						width: 18,
						height: 18,
						nowrap:true, 
						extClass:'emoji-image',
						success: function() {
						},
						complete: ()=> {
							this.readOnly= false
						},
					});
				},10);
			// #endif
		},
		tabSelect(e) {
			this.TabCur = e.currentTarget.dataset.id;
			this.emojiName = e.currentTarget.dataset.name;
			this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60;
			this.currentEmojiList=this.emojiList[this.TabCur]['children'];
		},
		showAppBox(val){
			if(this.appBox==val){
				this.footerHeight=50;
				this.appBox=0;
				uni.hideKeyboard();
			}else{
				this.footerHeight=this.boxHeight+50;
				this.appBox=val;
				this.recShow  = false;
			}
		},
		// 展示录音界面
		showRec : function(){
			this.appBox=0;
			this.recShow  == true ? this.recShow  = false : this.recShow  = true
		},
		// 发送录音
		sendVoiceMsg: function(){
			if (this.tmpVoice == '') {
				uni.showToast({ title: this.$t('chat.recordCancel'), icon: "none" });
				return;
			}
			let res={
				localUrl:this.tmpVoice,
				duration:this.recLength
			}
			this.handlerSuccess(res);
			this.tmpVoice  = '';
			this.recLength = 0;
		},
		// 发送文本消息
		sendTextMsg: function () {
			if(this.appBox!=1){
				this.isFocus=true;
			}
			this.editorCtx.getContents({
				success:(e)=>{
					let msg=e.html;
					if (msg == '<p><br></p>') {return false;}
					// 获取@的所有人
					this.edit.getLink().then((e)=>{
						let message={
							type:'text',
							content:msg,
							extends:this.quote
						}
						// 如果有qute就是引用消息
						if(this.quote.msg_id){
							message.pid=this.quote.msg_id;
							message.extends=this.quote;
						}
						const userList = Array.from(new Set(e)); 
						message.at=userList;
						this.inputMsg = '';
						this.closeQuote();
						this.editorCtx.clear();
						if(this.appBox!=1){
							this.getFocus();
							setTimeout(()=>{
								this.isFocus=true;
							},10)
						}
						// 判断是否有草稿缓存
						let draft=uni.getStorageSync('draft_'+this.contact.id);
						if(draft){
							uni.removeStorageSync('draft_'+this.contact.id);
							msgStore.updateContacts({
								id:this.contact.id,
								draft:''
							})
						}
						this.$emit('send',Object.assign(this.msgItem(), message),'');
					});
					
				},
				fail:(e)=>{
					this.inputMsg = '';
					this.editorCtx.clear();
					this.editorCtx.format('fontFamily', 'inherit');
					console.info('错误');
				}
			})
			
		},
		uploadEmoji(){
			uni.navigateTo({
			  url: '/pages/message/emoji'
			})
			return;
		},
		// 选择图片
		chooseImg(){
			let message={
				type:'image',
				status:'going'
			};
			uni.chooseImage({
				count      : 9,
				sizeType   : ['compressed'],
				sourceType : ['album', 'camera'],
				success    : (res)=>{
					const tempFiles = res.tempFiles;
					tempFiles.forEach((item) => {
					    message.content=item.path;
					    message.fileName=item.name;
					    message.fileSize=item.size;
						this.$emit('send',Object.assign(this.msgItem(), message),item.path);
				    })
					
				}
			});
		},
		// 选择视频
		chooseVideo: function () {
			let message={
				type:'video',
				status:'going'
			};
			uni.chooseVideo({
				sourceType: ['camera', 'album'],
				success: (res) => {
					if(res.duration>60){
						return uni.showToast({
							title: this.$t('chat.videoLimit'),
							icon:'error'
						})
					}
					const tempFilePaths = res.tempFilePath;
					let fixMode=(res.width > res.height) ? 1 : 2;
					let arr={
						duration:Math.ceil(res.duration),
						width:res.width,
						height:res.height,
						fixMode:fixMode,
						poster:''
					};
					message.fileName=res.name;
					message.fileSize=res.size;
					message.extends=arr;
					message.content=tempFilePaths;
					this.$emit('send',Object.assign(this.msgItem(), message),tempFilePaths);
				}
			});
		},
		// 选择文件
		chooseFile:function(){
			let self=this;
			// #ifdef H5
				uni.chooseFile({
				    count: 5, //默认100
				    success: function (res) {
						self.appendFile(res);
				    }
				});
			// #endif
			// #ifdef MP
				wx.chooseMessageFile({
				    count: 5, //默认100
					success: function (res) {
						self.appendFile(res);
					}
				});
			// #endif
			
			// #ifdef APP-PLUS
				const lemonjkFileSelect = uni.requireNativePlugin('lemonjk-FileSelect');
				lemonjkFileSelect.showPicker({
				    pathScope: "/Download",  // 各属性配置见下方【showPicker可配置参数说明】
				    mimeType: "*/*",
				    utisType:"public.data",
				    multi:'yes',
				    }, result => {
				    // 未授权文件读取权限,可以提示用户未打开读取文件权限（仅安卓）
				    if(result.code==1001){
				        uni.showModal({
				            title:this.$t('common.allowFileAuthfangemn'),
				            content:this.$t('chat.fileAuth'),
				            confirmText:this.$t('common.gotoAuth'),
				            cancelText:this.$t('common.cancel'),
				            success(e) {
				                if(e.confirm){
				                    // 跳转到应用设置页
				                    lemonjkFileSelect.gotoSetting();        
				                }
				            }
				        })
				    }
					let type='file';
					let imageExts=['jpg','jpeg','png','bmp','gif'];
					let videoExts=['mp4','3gp','avi','m2v','mkv','mov'];
					result.files.forEach((item)=>{
						if(imageExts.includes(item.fileExtension)){
							type='image';
						}else if(videoExts.includes(item.fileExtension)){
							type='video';
						}else{
							type='file';
						}
						let filePath='file://'+item.filePath;
						const message={
							type:type,
							status:'going',
							fileName:item.FileName,
							fileSize:item.fileSize,
							content:filePath
						};
						this.$emit('send',Object.assign(this.msgItem(), message),filePath);
					})
				})
			// #endif
			
		},
		// 写入文件
		appendFile(res){
			const tempFiles=res.tempFiles;
			tempFiles.forEach((item) => {
				let path=item.path;
				// #ifdef APP-PLUS
					path='file://'+ item.path;
				// #endif
				let message={
					type:'file',
					status:'going',
					fileName:item.name,
					fileSize:item.size,
					content:path
				};
				// #ifdef H5
				let type=item.type;
				if(type.indexOf("image/")!=-1){
					message.type="image";
				}
				if(type.indexOf("video/")!=-1){
					message.type="video";
				}
				// #endif
				this.$emit('send',Object.assign(this.msgItem(), message),path);
			})
			
		},
		// 选择定位
		chooseLocation(){
			uni.chooseLocation({
				success: (res) => {
						console.info('位置名称：' + res.name);
						console.info('详细地址：' + res.address);
						console.info('纬度：' + res.latitude);
						console.info('经度：' + res.longitude);
						let message={
							type:'location',
							status:'going',
							content:'['+this.$t('common.location')+'] '+res.name,
							extends:res
						};
						this.$emit('send',Object.assign(this.msgItem(), message),false);
					}
			})
		},
		calling(is_video){
			// #ifdef MP
				return uni.showToast({
					title:this.$t('message.miniAppNotSupport'),
					icon:'none'
				})
			// #endif
			if(!parseInt(this.globalConfig.chatInfo.webrtc)){
				return uni.showToast({
					title:this.$t('chat.closeWebrtc'),
					icon:'none'
				})
			}
			if(!parseInt(this.globalConfig.chatInfo.simpleChat)){
				return uni.showToast({
					title:this.$t('chat.notTalk'),
					icon:'none'
				})
			}
			if(msgStore.webrtcLock){
				return uni.showToast({
					title:this.$t('message.otherCalling'),
					icon:'none'
				})
			}
			let msg_id=this.$util.getUuid();
			uni.navigateTo({
			  url: '/pages/message/call?msg_id='+msg_id+'&type='+is_video+'&status=1&id='+this.contact.id+'&name='+this.contact.displayName+'&avatar='+encodeURI(this.contact.avatar)
			})
			
		},
		changeMsgText(e){
			// 只有设置过@后才回去检查@时间
			if(this.isAt){
				this.edit.eventLink(e.detail);
				if(this.edit.isSetContents){
					setTimeout(()=>{
						this.getFocus()
					},200);
				}
			}
			const txt=e.detail.text.replace(/\n/g, '');
			if(txt=='' && e.detail.html=='<p><br></p>'){
				this.inputMsg='';
			}else{
				setTimeout(()=>{
					this.editorCtx.getContents({
						success:(e)=>{
							this.inputMsg=e.html;
						}
					})
				},100)
			}
		},
		onEditorReady() {
			// #ifdef MP-BAIDU
			this.editorCtx = requireDynamicLib('editorLib').createEditorContext('editor');
			// #endif

			// #ifdef APP-PLUS || MP-WEIXIN || H5
			const query = uni.createSelectorQuery().in(this);
			query.select('#editor').context((res) => {
				this.edit = new Edit({context: res.context,maxCount: 300});
				this.editorCtx = res.context
			}).exec()
			// #endif
			let draft=uni.getStorageSync('draft_'+this.contact.id);
			if(draft){
				setTimeout(()=>{
					this.editorCtx.setContents({
						html:draft
					})
				},200)
				
				this.inputMsg=draft;
			}else{
				this.inputMsg='';
			}
		},
		InputFocus(e) {
			this.isFocus=true;
			if(this.appBox>0){
				// 关闭表情盒子和更多盒子
				this.appBox=0;
				this.getFocus()
			}
			
		},
		InputBlur(e) {
			this.paddingB=this.inlineTools;
			setTimeout(()=>{
				this.isFocus=false;
			},10)
			
		},
		// 开始录音
		startRecorder() {
			console.info('录音开始...')
			// #ifdef H5
			this.$refs.recorderRef.start()
			// #endif
			
			// #ifndef H5
			this.recorderManager.start({duration:60000, format:'mp3' });
			this.recLength  = 0;
			this.recTimer   = setInterval(()=>{this.recLength++;}, 1000);
			// #endif
			
			this.isUseRecorder = true
		},
		// 结束录音
		endRecorder() {
			console.info('录音结束')
			// #ifdef H5
			this.$refs.recorderRef.stop()
			// #endif
			
			// #ifndef H5
			this.recorderManager.stop();
			clearInterval(this.recTimer);
			// #endif
			
			this.isUseRecorder = false
		},
		//中断录音
		cancelRecorder(){
			this.endRecorder();
			this.isCancel=true;
		},
		// 移除录音按钮
		moveRecorder(e){
			let touch=e.touches[0];
			if(touch.clientY<this.mainHeight-80){
				this.isCancel=true;
			}else{
				this.isCancel=false;
			}
		},
		handlerSuccess(res) {
			this.checkRecorder(res.duration);
			if(this.isCancel){
				this.isCancel=false;
				return console.info('录音已取消');
			}
			let message={
				type:'voice',
				content:res.localUrl,
				fileName:this.$util.getUuid()+'.mp3',
				extends:{
					duration: res.duration
				}
			}
			this.$emit('send',Object.assign(this.msgItem(), message));
		},
		// 检测录音是否合格
		checkRecorder(duration){
			if(duration<1 || isNaN(duration) || !duration){
				this.recLength  = 0;
				this.tmpVoice  = '';
				this.recing  = false;
				this.isCancel=true;
				return uni.showToast({
					title: this.$t('chat.recordToLow'),
					icon: 'error'
				})
			}
		},
		handlerError(code) {
			switch (code) {
				case '201':
					uni.showModal({
						content: this.$t('chat.revordNotAuth')
					})
					break
				default:
					console.info('录音功能受限，请知晓！')
					break
			}
		},
		closeQuote(){
			this.quote='';
		},
		// 引用消息
		quoteMessage(quote){
			this.quote=quote;
			// 如果是群聊.需要@人员
			if(this.contact.is_group==1 && quote.user_id!=this.userInfo.user_id){
				this.setAtList({
					user_id:quote.user_id,
					realname:quote.realname,
				})
			}
		},
		getEmojiList(){
			this.$api.emojiApi.emojiList({}).then((res)=>{
				if(res.code==0){
					emoji[1]['children']=res.data;
					if(this.TabCur==1){
						this.currentEmojiList=res.data;
					}
				}
				this.emojiList=emoji;
			})
			
		}
	}
}
</script>
<style lang="scss" scoped>
.im-container{width:100%; min-height:100rpx; box-shadow:1px 1px 6px #999999; z-index:1001;border-top: solid 1px #e6e6e6;}
.im-footer{padding:6rpx; width:100%; min-height:100rpx;display:flex; flex-wrap:nowrap; overflow:hidden; align-items:flex-end;z-index:1001}
.im-footer .items{width:auto; line-height:88rpx; flex-shrink:0; font-size:28rpx; color:#2B2E3D;}
.im-menus{width:80rpx; height:80rpx; flex-shrink:0; line-height:80rpx; text-align:center;}
.im-input{padding:14rpx 14rpx; border-radius:10rpx;margin:0 8rpx !important;height:100%;min-height:44rpx;max-height: 300rpx;font-size: 28rpx;word-break: break-all;}
.im-msgarea{padding:12rpx 10rpx 12rpx 0;}
.im-record{width:100%; position:fixed; left:0; bottom:0; background:#FFFFFF; padding:30px 0; padding-bottom:100rpx; z-index:11; box-shadow:1px 1px 6px #999999;}
.im-record-close{width:100rpx; height:100rpx; position:absolute; top:0px; right:0px; z-index:100; text-align:center; line-height:100rpx; color:#888888; font-size:38rpx !important;}
.im-record-txt{text-align:center; font-size:26rpx; line-height:30px; padding-bottom:10px; color:#CCCCCC;}
.im-record-btn{width:60px; height:60px; margin:0 auto; border:5px solid #F1F2F3; border-radius:100%; background:#00B26A;}
.im-recording{background:#FF0000; animation:fade linear 2s infinite;}
@keyframes fade{from{opacity:0.1;} 50%{opacity:1;} to{opacity:0.1;}}
.im-record-txt text{color:#00B26A; padding:0 12px;}
.im-send-voice{margin-top:12px; font-size:28rpx; color:#00BA62; text-align:center;}
.im-send-voice text{margin:0 15px; color:#00BA62;}
.toolBox {
	height:72rpx;
	margin-bottom:3rpx;
	.recorder{
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #fff;
	padding: 14rpx;
	border-radius: 10rpx;
	font-size: 28rpx;
	box-shadow: 2rpx 2rpx 6rpx rgba(0, 0, 0, 0.2);
	position: relative;
	margin: 0 6rpx !important;
	height:100%;
	&.active {
		background-color: #0389fb;;
		color:#fff;
	}
}
}
.voice-model{
	width:240rpx;
	height:180rpx;
	position: fixed;
	top: 50%;
	z-index: 2;
	transform: translate(-50%, -50%);
	left: 50%;
	padding: 0 4rpx 0 6rpx;
	background-color: #363636b3;
}
.im-emoji-box{
	width:100%;background-color: #F1F2F3;z-index:3;
	.im-emoji-header{
		height:90rpx;
	}
	.im-emoji-body{
		height:100%;padding-bottom: 100rpx;
		.im-emoji-item{
			padding:22rpx;
		}
	}
}
.im-app-box{
	width:100%;background-color: #F1F2F3;z-index:3;
	.im-app-item{
		width:160rpx;height:160rpx;
		.im-app-item-icon{
			padding:20rpx 25rpx;
		}
	}
}

.message-quote{
	padding:8rpx;
	font-size:24rpx;
	margin:16rpx -10rpx 0 10rpx;
	background-color: #e3e3e3;
	.text-overflow{
		overflow: hidden !important;
		text-overflow: ellipsis;
		white-space: nowrap !important;
		width:380rpx;
	}
}
.voice-icon{
  animation: twinkle 0.5s infinite alternate;
}
@keyframes twinkle {
      0%{
          opacity:0.9;
      }
      100%{
          opacity:0.3;
      }
}

.upload-emoji{
	width:90rpx;
	height:90rpx;
	border:dashed 1px #999;
	font-size:50rpx;
	text-align: center;
	border-radius: 6rpx;
}
</style>
<style>
	.im-input /deep/ .ql-editor{
		max-height:300rpx;
		line-height: 1.5;
		font-size: 30rpx !important;
		word-break: break-all;
		word-wrap: break-word;
		padding-left: 3px;
	}

	
	.im-input /deep/ .ql-editor p img{
		vertical-align: text-top;
	}
</style>