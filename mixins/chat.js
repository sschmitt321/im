import emoji from '@/utils/emoji.js'
const innerAudioContext = uni.createInnerAudioContext();
export const chat = {
	data() {
		return {
			playIndex : -1,
			emojiMap:[],
			modelStatus:1, //1:at,2quote,3context
			mapList:[],
			quoteList:[],
			atMsgList:[],
			viewMsg:{},
			direction:0,
		}
	},
	components:{
		
	},
	onUnload(){
		// 停止所有声音播放
		innerAudioContext.stop();
	},
	created: function() {
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
		innerAudioContext.onPlay(() => {console.info('play');});
		innerAudioContext.onEnded(() => {
			innerAudioContext.stop();
			this.playIndex = -1;
		});
		innerAudioContext.onError((E)=>{console.info(E);});
	},
	methods: {
		// 播放视频,禁止多个同时播放
		handlePlay (item) {
			uni.navigateTo({
				url: '/pages/message/video?name='+item.fileName+'&src='+encodeURI(item.content),
				animationType:"slide-in-bottom"
			});
		},
		// 文件预览
		previewFile(item){
			if(this.islongPress){
				return;
			}
			this.curMsg=item;
			this.$refs.preview.open('bottom')
		},
		preview(val){
			let item=this.curMsg;
			let audioExt=['mp3','wav','acc'];
			let extension = item.content.split('.').pop().toLowerCase();
			if(audioExt.includes(extension) || val==2){
				uni.navigateTo({
					url: '/pages/mine/webview?title='+this.$t('message.filePreview')+'&src='+encodeURIComponent(item.preview),
					animationType:"slide-in-bottom"
				});
				return;
			}
			// #ifdef APP-PLUS || MP-WEIXIN
			let exts=['doc', 'xls', 'ppt', 'pdf', 'docx', 'xlsx', 'pptx'];
			if(exts.includes(extension)){
				uni.showLoading({title: this.$t('message.fileLoading')});
				uni.downloadFile({
				  url: item.content,
				  success: function (res) {
					uni.hideLoading();
				    var filePath = res.tempFilePath;
				    uni.openDocument({
				      filePath: filePath,
				      showMenu: true,
				      success: function (res) {
				        console.info('打开文档成功');
				      }
				    });
				  },
				  fail() {
				  	uni.hideLoading();
				  }
				});
			}else{
				uni.showToast({
					title:this.$t('message.fileNotSupport'),
					icon:'none'
				})
			}
			// #endif
			
			// #ifdef H5
			const tempLink = document.createElement("a");
			tempLink.style.display = "none";
			tempLink.href = item.download;
			tempLink.setAttribute("download", item.fileName);
			tempLink.setAttribute("target", "_blank");
			document.body.appendChild(tempLink);
			tempLink.click();
			document.body.removeChild(tempLink);
			// #endif
		},
		// 图片预览
		showImgs : function(e){
			var imgs        = [];
			var imgsCurrent = e.currentTarget.dataset.img;
			for (var i = 0; i < this.messageList.length; i++) {
				if (this.messageList[i].type == 'image' || this.messageList[i].type == 'emoji') {
					imgs.unshift(this.messageList[i].content);
				}
			}
			uni.previewImage({urls : imgs, current : imgsCurrent});
		},
		showContextImgs: function(e){
			var imgs        = [];
			var imgsCurrent = e.currentTarget.dataset.img;
			for (var i = 0; i < this.mapList.length; i++) {
				if (this.mapList[i].type == 'image' || this.mapList[i].type == 'emoji') {
					imgs.unshift(this.mapList[i].content);
				}
			}
			uni.previewImage({urls : imgs, current : imgsCurrent});
		},
		openLocation(item){
			uni.openLocation({
				latitude: item.latitude,
				longitude: item.longitude,
				success: function () {
					console.log('success');
				}
			});
		},
		// 打开用户详情
		openContact(item){
			uni.navigateTo({
				url:"/pages/contacts/detail?id="+item.id
			})
		},
		// 自动解析消息中的表情
		emojiToHtml(str){
			let emojiMap=this.emojiMap;
			return str.replace(/\[!(\w+)\]/gi, function (str, match) {
				var file = match;
				return emojiMap[file] ? "<img class='mr-5' style=\"width:18px;height:18px\" emoji-name=\"".concat(match, "\" src=\"").concat(emojiMap[file], "\" />") : "[!".concat(match, "]");
			  });
		},
		fileSize(size){
			return this.$util.getFileSize(size);
		},
		sendTime:function(mstime){
			return this.$util.timeFormat(mstime);
		},
		// 语音播放基础函数
		playNow: function (voicelUrl, index){
			this.playIndex  = index;
			innerAudioContext.autoplay=true;
			innerAudioContext.src = voicelUrl;
			innerAudioContext.play();
			return true;
		},
		// 播放语音
		playVoice: function (e) {
			var voicelUrl = e.currentTarget.dataset.voice;
			var index     = e.currentTarget.dataset.index;
			if (this.playIndex == -1){
				return this.playNow(voicelUrl, index);
			}
			if (this.playIndex == index) {
				innerAudioContext.stop();
				this.playIndex = -1;
			} else {
				innerAudioContext.stop();
				this.playIndex = -1;
				this.playNow(voicelUrl, index);
			}
		},
		// 引用的消息详情
		quoteMsgInfo(item){
			this.$api.msgApi.getMessageInfo({msg_id:item.msg_id}).then(res => {
				if(res.code==0){
					this.mapList=res.data;
					this.quoteList=res.data;
					this.modelStatus=2;
					this.$refs.atmodel.open('bottom');
				}
			})
		},
		// 查看消息上下文
		viewContext(item){
			this.modelStatus=3;
			if(this.direction==0){
				this.viewMsg=item;
				this.mapList=[];
			}
			this.$api.msgApi.getMessageContext({msg_id:item.msg_id,is_group:item.is_group,direction:this.direction}).then(res => {
				if(res.code==0){
					let data=res.data;
					if(data.length<=0){
						return uni.showToast({
							title:this.$t('common.noData'),
							icon:'none'
						})
					}
					data.forEach((item, index) => {
						if(this.direction==1){
							this.mapList.unshift(item);
						}else{
							this.mapList.push(item);
						}
					})
				}
			})
		},
		// 加载更多上下文
		loadContext(val){
			this.direction=val;
			let msg={};
			if(val==1){
				// 获取mapList的第一条数据
				msg=this.mapList[0];
			}else{
				msg=this.mapList[this.mapList.length-1];
			}
			this.viewContext(msg);
		},
		// 返回消息列表
		backToList(){
			if(this.quoteList.length>0){
				this.mapList=this.quoteList;
				this.modelStatus=2;
			}else{
				this.mapList=this.atMsgList;
				this.modelStatus=1;
			}
			this.direction=0
		},
		// 关闭消息详情弹窗
		closeAtModel(){
			this.$refs.atmodel.close();
			this.direction=0;
			this.modelStatus=1;
			this.quoteList=[];
			this.mapList=[];
		}
	}
}
