<template name="im-file">
	<view class="file-card bg-white radius-10 im-flex im-justify-content-start pd-10 im-align-items-center">
		<image :src="item.extUrl" style="width:64rpx;height:80rpx"></image>
		<view class="im-flex im-columns ml-10">
			<view class="text-overflow file-name">{{item.fileName}}</view>
			<view class="text-gray file-size f-12">{{fileSize(item.fileSize)}}</view>
		</view>
	</view>
</template>
<script>
export default {
	name  : "im-file",
	props : {
		item:{type:Object, default:function(){return {};}},
		isSelf:{type:Boolean, default:false},
	},
	data() {
		return {
		}
	},
	created : function(){
	},
	methods:{
		fileSize(size){
			return this.$util.getFileSize(size);
		},
	}
}
</script>
<style lang="scss" scoped>
.file-card{
	width:420rpx;
	height:120rpx;
	.file-icon{
		width:60rpx;
		height:80rpx;
	}
	.file-name{
		text-align: left !important;
		width:300rpx;
	}
	.file-size{
		text-align: left !important;
		margin-top:8rpx;
	}
}
</style>
