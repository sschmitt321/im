<template name="im-contact">
	<view class="im-contact-msg radius-8 pt-10 pr-10 pl-10 pb-5">
		<view class="im-flex im-rows im-nowrap im-align-items-center">
			<view class='cu-avatar mr-10 radius'  :style="[{backgroundImage:'url('+item.extends.avatar+')'}]">
			</view>
			<view class="c-333">{{item.extends.displayName}}</view>
		</view>
		<hr class="mt-10 c-999">
		<view class="c-666 f-10">
			{{ $t('chat.userIDcard') }}
		</view>
	</view>
</template>
<script>
export default {
	name  : "im-contact",
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
.im-contact-msg{ width:360rpx; background-color:#E7F0F3; color:#2B2E3D;text-align: left !important;}
</style>
