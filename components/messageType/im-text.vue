<template name="im-text">
	<view>
		<view class="content shadow"  :class="[isSelf ? 'bg-light-blue' : '' ]">
			<mp-html container-style="overflow: hidden;display:inline;white-space: pre-wrap" :content="emojiToHtml(item.content)"/>
		</view>
		<view class="message-quote radius-6" v-if="item.extends && item.extends.content" @tap.stop="quoteMsg(item.extends)">
			{{item.extends.content}}
		</view>
	</view>
</template>
<script>
export default {
	name  : "im-text",
	props : {
		item:{type:Object, default:function(){return {};}},
		emojiMap:{type:Array, default:function(){return [];}},
		isSelf:{type:Boolean, default:false},
	},
	emits:['quoteMsg'],
	data() {
		return {
		}
	},
	created : function(){
	},
	methods:{
		emojiToHtml(str){
			let emojiMap=this.emojiMap;
			return str.replace(/\[!(\w+)\]/gi, function (str, match) {
				var file = match;
				return emojiMap[file] ? "<img class='mr-5' style=\"width:18px;height:18px\" emoji-name=\"".concat(match, "\" src=\"").concat(emojiMap[file], "\" />") : "[!".concat(match, "]");
			  });
		},
		quoteMsg(item){
			this.$emit('quoteMsg',item);
		}
	}
}
</script>
<style lang="scss" scoped>
	.main .bg-light-blue ::v-deep ._block ._a{
		color:#fff !important;
	}
	.message-quote{
		padding:8rpx;
		font-size:24rpx;
		margin-top:16rpx;
		background-color: #e3e3e3;
		overflow: hidden !important;
		text-overflow: ellipsis;
		white-space: nowrap !important;
		max-width:380rpx;
		text-align: left;
	}
	.bg-light-blue{
		background-color: #0389fb;
		color:#fff;
	}
</style>