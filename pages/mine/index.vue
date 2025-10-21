<template>
	<view class="mine-bg">
	  <!-- 顶部信息区 -->
	  <view class="mine-header">
		<view class="mine-header-row"  @tap="editInfo()">
		  <view class='cu-avatar lg mr-15'  
			  :class="appSetting.circleAvatar?'round':'radius'" 
			  :style="[{backgroundImage:'url('+loginStore.userInfo.avatar+')'}]">
		  </view>
		  <view class="mine-header-info">
			<view class="mb-5 f-18 mb-10 im-flex im-align-items-center">
				<view class="mine-nickname">{{loginStore.userInfo.realname}}</view>
				 <view class='cu-tag ml-10  round light' :class="loginStore.userInfo.is_auth ? 'bg-orange' : 'bg-grey'">{{loginStore.userInfo.is_auth ? $t('user.isAuth') : $t('user.notAuth')}}</view>
			</view>
			<view class="mine-register">{{loginStore.userInfo.account}}</view>
		  </view>
		  <view class="f-24 text-white cuIcon-qrcode" @tap.stop="openQr"></view>
		</view>
	  </view>
	  <view class="mine-header-arc"></view>
  
	  <!-- 卡片1：扫一扫 -->
	  <view class="mine-card mine-card-top">
		<view class="mine-list-item" @tap="scan">
		  <view class="mine-list-icon" style="background:linear-gradient(135deg,#ff9966,#ff5e62);">
			<text class="cuIcon-scan"></text>
		  </view>
		  <view class="mine-list-title">{{ $t('user.scan') }}</view>
		  <view class="mine-list-arrow cuIcon-right"></view>
		</view>
	  </view>
	  <!-- 卡片2：功能列表 -->
	  <view class="mine-card">
		<view class="mine-list-item" @tap="showSetting">
		  <view class="mine-list-icon" style="background:linear-gradient(135deg,#a18cd1,#fbc2eb);">
			<text class="cuIcon-settings"></text>
		  </view>
		  <view class="mine-list-title">{{ $t('user.setting') }}</view>
		  <view class="mine-list-arrow cuIcon-right"></view>
		</view>
		<view class="mine-list-item" @tap="showsecure">
		  <view class="mine-list-icon" style="background:linear-gradient(135deg,#43cea2,#185a9d);">
			<text class="cuIcon-safe"></text>
		  </view>
		  <view class="mine-list-title">{{ $t('user.secure') }}</view>
		  <view class="mine-list-arrow cuIcon-right"></view>
		</view>
		<view class="mine-list-item" @tap="showDoc">
		  <view class="mine-list-icon" style="background:linear-gradient(135deg,#36d1c4,#1e90ff);">
			<text class="cuIcon-question"></text>
		  </view>
		  <view class="mine-list-title">{{ $t('user.help') }}</view>
		  <view class="mine-list-arrow cuIcon-right"></view>
		</view>
		
		<!-- #ifdef APP-PLUS -->
		<view class="mine-list-item" @tap="checkVersion">
		<!-- #endif -->
		<!-- #ifndef APP-PLUS -->
		<view class="mine-list-item">
		<!-- #endif -->
		<view class="mine-list-icon"  @click.stop="ts()" style="background:linear-gradient(135deg,#f7971e,#ffd200);">
			<text class="cuIcon-hot"></text>
		  </view>
		  <view class="mine-list-title">{{ $t('common.checkVersion') }}</view>
		   <view class="mine-list-desc text-grey">{{verisonName}}</view>
		  <view class="mine-list-arrow cuIcon-right"></view>
		</view>
		
		<view class="mine-list-item" @tap="about"  v-if="globalConfig.demon_mode">
		  <view class="mine-list-icon" style="background:linear-gradient(135deg,#43e97b,#38f9d7);">
			<text class="cuIcon-link"></text>
		  </view>
		  <view class="mine-list-title">{{ $t('common.aboutUs') }}</view>
		  <view class="mine-list-arrow cuIcon-right"></view>
		</view>
	  </view>
	</view>
  </template>
  
  <script>
  import { useloginStore } from '@/store/login'
  import pinia from '@/store/index'
  import scan from '@/common/scan.js'
  // #ifdef APP-PLUS
  import appUpdate from '@/common/appUpdate.js';
  // #endif
  const loginStore = useloginStore(pinia)
  export default {
	data() {
	  return {
		loginStore: loginStore,
		globalConfig: loginStore.globalConfig,
		appSetting: loginStore.appSetting,
		versionCode: '',
		verisonName: '',
		num: 0,
	  }
	},
	mounted() {
	  // #ifdef APP-PLUS
	  plus.runtime.getProperty(plus.runtime.appid, (inf) => {
		this.versionCode = inf.versionCode
		this.verisonName = inf.version
	  });
	  // #endif
	},
	methods: {
	  logout() {
		let client_id = uni.getStorageSync('client_id');
		this.$api.LoginApi.logout({ client_id: client_id }).then(res => {
		  if (res.code == 0) {
			loginStore.logout()
		  }
		})
	  },
	  ts() {
		if (this.num == 0) { setTimeout(() => { this.num = 0; }, 20000) }
		this.num++;
		if (this.num > 15) {
		  uni.setClipboardData({ data: this.$util.getUuid('id'), success: function () { console.info('success'); } });
		}
	  },
	  about() {
		if (this.globalConfig && this.globalConfig.demon_mode) {
		  uni.navigateTo({
			url: "/pages/mine/about"
		  })
		} else {
		  uni.navigateTo({
			url: "/pages/mine/about"
		  })
		}
	  },
	  showSetting() {
		uni.navigateTo({
		  url: "/pages/mine/setting"
		})
	  },
	  showsecure() {
		uni.navigateTo({
		  url: "/pages/mine/secure"
		})
	  },
	  showDuoyy() {
		uni.navigateTo({
		  url: "/pages/mine/duoyy"
		})
	  },
	  showDoc() {
		uni.navigateTo({
		  url: "/pages/mine/doc"
		})
	  },
	  editInfo() {
		uni.navigateTo({
		  url: "/pages/mine/profile"
		})
	  },
	  scan() {
		scan.scanQr();
	  },
	  openQr() {
		uni.navigateTo({
		  url: "/pages/index/qrcode"
		})
	  },
	  checkVersion() {
		appUpdate(true);
	  }
	}
  }
  </script>
  
  <style lang="scss">
  .mine-bg {
	min-height: calc(100vh - 100px);
	background: #f3f8fc;
	padding-bottom: 10rpx;
	position: relative;
  }
  .mine-header {
	position: relative;
	/* background: linear-gradient(135deg, #0389fb 0%, #0389fb 100%); */
	background-color: #0389fb;
	padding: 20rpx 30rpx 5rpx 30rpx;
	margin-bottom: 0;
	overflow: visible;
  }
  .mine-header-arc {
    position: relative;
    width: 100%;
    height: 100rpx;
    margin-top: -40rpx;
    left: 0;
    z-index: 2;
    overflow: hidden;
    pointer-events: none;
  }
  .mine-header-arc::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 100rpx;
    /* background: linear-gradient(135deg, #0389fb 0%, #0389fb 100%); */
	background-color: #0389fb;
    border-radius: 0 0 80% 80%/0 0 100% 100%;
    transform: scaleY(1.4);
  }
  .mine-header-row {
	display: flex;
	align-items: center;
	position: relative;
	margin-bottom: 50rpx;
  }
  .mine-header-info {
	flex: 1;
  }
  .mine-nickname {
	font-size: 36rpx;
	font-weight: bold;
	color: #fff;
	margin-bottom: 8rpx;
  }
  .mine-register, .mine-count {
	font-size: 24rpx;
	color: #e0f7fa;
	margin-bottom: 4rpx;
  }
  .mine-feedback-btn {
	position: absolute;
	right: 0;
	top: 0;
	background: rgba(255,255,255,0.2);
	color: #fff;
	font-size: 24rpx;
	padding: 8rpx 24rpx;
	border-radius: 32rpx;
	border: 1rpx solid #fff;
  }
  .mine-card {
	background: #fff;
	border-radius: 24rpx;
	margin: 0 24rpx 32rpx 24rpx;
	box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.06);
	padding: 0 0 0 0;
  }
  .mine-card-top {
	margin-top: -80rpx;
	z-index: 3;
	position: relative;
	margin-left: 32rpx;
	margin-right: 32rpx;
	border-radius: 32rpx;
	box-shadow: 0 12rpx 32rpx rgba(3,137,251,0.15), 0 4rpx 24rpx rgba(0,0,0,0.08);
  }
  .mine-list-item {
	display: flex;
	align-items: center;
	padding: 32rpx 32rpx 32rpx 32rpx;
	border-bottom: 1rpx solid #f3f8fc;
	position: relative;
  }
  .mine-list-item:last-child {
	border-bottom: none;
  }
  .mine-list-icon {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 24rpx;
	font-size: 36rpx;
	color: #fff;
  }
  .mine-list-title {
	font-size: 30rpx;
	color: #222;
	flex: 1;
  }
  .mine-list-desc {
	font-size: 26rpx;
	margin-right: 16rpx;
  }
  .mine-list-arrow {
	font-size: 32rpx;
	color: #bbb;
  }
  </style>