<template name="im-location">
	<view class="im-location-msg im-flex im-rows im-nowrap im-align-items-center radius-8 pd-10">
		<view class="f-24 cuIcon-location pr-5"></view>
		<view>
			<view class="f-14 mb-5">{{item.content}}</view>
			<view class="c-999 f-12">{{item.extends && item.extends.address}}</view> 
		</view>
		
	</view>
</template>
<script>
export default {
	name  : "im-location",
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
.im-location-msg{ background-color:#E7F0F3; color:#2B2E3D;text-align: left !important;}
</style>
