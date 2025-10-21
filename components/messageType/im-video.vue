<template name="im-video">
	<view class='course-video' :style="(item.extends && item.extends.width) ? $util.imageCoverStyle(item.extends.width,item.extends.height) : ''">
		<view class="relative-shadow">
			<view class="cuIcon-video icon-center f-28 c-white"></view>
			<view class="video-duration f-10 c-white" v-if="item.extends && item.extends.duration">{{$util.videoFormatTime(item.extends.duration)}}</view>
		</view>
		<msg-image v-if="item.extends" :src="item.extends.poster" :info="item.extends"></msg-image>
	</view>
</template>
<script>
	import msgImage from '@/components/messageType/im-image.vue';
export default {
	name  : "im-video",
	props : {
		item:{type:Object, default:function(){return {};}},
		isSelf:{type:Boolean, default:false},
	},
	components: {
		msgImage,
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
.course-video{
	overflow: hidden;
	position: relative;
}

.icon-center{
		position: absolute;
	    top: 50%;
	    z-index: 4;
	    transform: translate(-50%, -50%);
	    left: 50%;
		padding: 0 4rpx 0 6rpx;
}
.video-duration{
	position: absolute;
	bottom:5px;
	right:5px;
}
.relative-shadow{
	position: absolute;width:100%;height:100%;background: #8383833d;z-index:1;
}
</style>
