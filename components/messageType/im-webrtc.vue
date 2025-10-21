<template name="im-webrtc">
	<view class="im-voice-msg im-flex im-rows im-nowrap im-align-items-center radius-20" :class="[isSelf ? 'im-rows-reverse' : '' , ]">
		<text class="f-16" :class="[item.extends.type == 1 ? 'cuIcon-record' : 'cuIcon-dianhua',isSelf ? 'rotate180' : '']"></text>
		<text class="im-voice-msg-text">{{item.content}}</text> 
	</view>
</template>
<script>
export default {
	name  : "im-webrtc",
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
	}
}
</script>
<style lang="scss" scoped>
.im-voice-msg{height:80rpx; padding:0 20rpx; background-color:#E7F0F3; color:#2B2E3D; min-width:160rpx; max-width:400rpx;}
.im-voice-msg-text{font-size:22rpx; margin:0 5rpx;}
</style>
