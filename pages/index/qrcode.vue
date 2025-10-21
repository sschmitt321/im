<template>
	<view>
		<cu-custom bgColor="bg-main-bar" :isBack="true">
			<template #backText></template>
			<template #content>{{title}}</template>
		</cu-custom>
		<view  class="mt-20 im-flex im-align-items-center">
			<image :src="canvasUrl" mode="widthFix" style="margin:0 auto"></image>
		</view>
		<view class="padding flex flex-direction mt-10" v-if="canvasUrl">
			<button class="cu-btn bg-green lg"  @tap="saveHeadImgFile">
				 <!-- #ifdef H5 -->
					{{$t('common.downloadImage')}}
				 <!-- #endif -->
				 <!-- #ifndef H5 -->
					{{$t('common.saveToAlbum')}}
				 <!-- #endif -->
				</button>
		</view>
		<mosowe-canvas-image ref="mosoweCanvasComponents" :qrTypeNumber='qrTypeNumber' showLoading  :lists="lists" :height="height" :width="width" @canvasImage="canvasImage" ></mosowe-canvas-image>
	</view>
</template>
<script>
	import pinia from '@/store/index'
	import { useloginStore } from '@/store/login';
	const userStore = useloginStore(pinia);
	
	export default {
		data() {
			return {
				canvasUrl: '',
				group_id:0,
				lists:[],
				width:500,
				height:700,
				title: this.$t('user.myQrcode'),
				contact:{},
				qrTypeNumber:4
			}
		},
		onLoad(options) {
			this.group_id = options.group_id?options.group_id:''
			// 如果有团队ID就生成群聊二维码,没有就生成个人二维码
			if(this.group_id){
				this.title=this.$t('user.groupQrcode');
				this.getGroupInfo()
			}else{
				this.createUserQr();
			}
			
		},
		methods: {
			createUserQr(){
				let userInfo=userStore.userInfo;
				let qrUrl=userInfo.qrUrl ?? '';
				if(!qrUrl){
					uni.showToast({
						title: this.$t('user.qcxdlhzscewm'),
						icon:'none'
					})
					uni.navigateBack();
					return;
				}
				this.lists=[
					{
					    type: 'shape',
					    color: '#ffffff', 
					    width: this.width, 
					    height: this.height, 
					    x: 0, 
					    y: 0
					},
				    {
				        type: 'image',
				        content: userInfo.avatar, 
				        width: 100, 
				        height: 100, 
				        x: 70, 
				        y: 60
				    },
				    {
				        type: 'text',
				        content: userInfo.displayName, 
				        x: 190,
				        y: 96, 
						maxWidth:400,
				        color: '#000',
				        size: 28, 
				    },
					{
					    type: 'text',
					    content: userInfo.account, 
					    x: 190,
					    y: 135, 
						maxWidth:400,
					    color: '#999',
					    size: 20, 
					},
				    {
				        type: 'qr',
				        content: qrUrl,
				        width: 360, 
				        height: 360, 
				        x: 70, 
				        y: 200, 
				    },
					{
					    type: 'text',
					    content: this.$t('user.scanToFriend'),
					    x: 60, 
					    y: 620, 
					    color: '#999',
						maxWidth:400,
					    size: 18, 
					},
				];
				setTimeout(()=>{
					this.$refs.mosoweCanvasComponents.createCanvas();
				},100)
			},
			getGroupInfo() {
				this.userList = []
				this.$api.msgApi.groupInfo({
					group_id: this.group_id
				}).then((res) => {
					let data=res.data;
					this.contact=data;
					let groupName=data.name;
					let length=groupName.length;
					if(length>12){
						groupName=groupName.substring(0,12)+"...";
					}
					this.lists=[
						{
						    type: 'shape',
						    color: '#ffffff', 
						    width: this.width+10, 
						    height: this.height+10, 
						    x: 0, 
						    y: 0
						},
                        {
                            type: 'image',
                            content: data.avatar, 
                            width: 100, 
                            height: 100, 
                            x: 200, 
                            y: 40
                        },
                        {
                            type: 'text',
                            content: this.$t('user.group')+groupName, 
                            x: this.width/2, 
							align:'center',
                            y: 180, 
							maxWidth:400,
                            color: '#000',
                            size: 24, 
                        },
                        {
                            type: 'qr',
                            content: data.qrUrl, 
                            width: 360, 
                            height: 360, 
                            x: 70, 
                            y: 220, 
                        },
						{
						    type: 'text',
						    content: this.$t('user.sevenLimit')+"("+data.qrExpire+this.$t('group.qrExpire')+")",
						    x: 105, 
						    y: 640, 
						    color: '#999',
							maxWidth:400,
						    size: 18, 
						},
                    ];
					setTimeout(()=>{
						this.$refs.mosoweCanvasComponents.createCanvas();
					},100)
				})
			},
			canvasImage (e) {
				this.canvasUrl = e;
			},
			// 将base64 图片保存到本地系统相册
			saveHeadImgFile() {
				// #ifdef H5
					const tempLink = document.createElement("a");
					tempLink.style.display = "none";
					tempLink.href = this.canvasUrl;
					tempLink.setAttribute("download", this.contact.name+".jpg");
					tempLink.setAttribute("target", "_blank");
					document.body.appendChild(tempLink);
					tempLink.click();
					document.body.removeChild(tempLink);
				// #endif
				// #ifndef H5
					uni.saveImageToPhotosAlbum({
						filePath: this.canvasUrl,
						success: () => {
							uni.showToast({title:this.$t('message.saveOk'),icon:'none'})
						}
					})
				// #endif
				
			}
		}
	}
</script>
<style scoped>
	.list-image {
		width: 80rpx;
		height: 80rpx;
		font-size: 0;
	}
</style>
