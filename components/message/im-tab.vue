<template name="im-tab">
	<view class="tab-main im-flex im-justify-content-start im-align-items-center bg-gray" :style="{height:height+'rpx',borderRadius:height/2+'rpx'}">
		<view class="tab-item" :class="active==index ? 'active' : ''" v-for="(item,index) in values" @click="changeItem(item,index)"  :style="{height:itemHeight+'rpx',borderRadius:itemHeight/2+'rpx',lineHeight:itemHeight-8+'rpx'}" :key="index">
			{{item.name}} <text v-if="item.count>0">{{item.count>99 ? '99+' : item.count}}</text>	
		</view>
	</view>
</template>
<script>
export default {
	
	name  : "im-tab",
	components: {
	},
	props : {
		values:{type:Array, default:function(){return [];}},
		height:{type:Number,default:72}
	},
	data() {
		return {
			active:0,
			itemHeight:48
		}
	},
	created : function(){
		this.itemHeight=this.height-16;
	},
	methods:{
		changeItem(item,index){
			this.active=index;
			this.$emit('change',item,index)
		}
	}
}
</script>
<style lang="scss" scoped>
	.tab-main{
		padding:10rpx;
		.tab-item{
			padding: 6rpx 12rpx;
			min-width:150rpx;
			text-align: center;
			vertical-align: middle;
			&.active{
				box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
				background-color: #fff;
				color:#0389fb;
			}
		}
	}
</style>