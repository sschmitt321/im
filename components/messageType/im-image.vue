<template name="im-image">
	<template v-if="src && info && info.fixMode">
		<image v-if="info.fixMode<=2" :src="src" class="radius" :mode="info.fixMode==1 ? 'widthFix' : 'heightFix' "  :style="info.fixMode==1 ? 'width:200px' : 'height:240px'" @tap="showImgs"  :data-img="src" ></image>
		<image v-if="info.fixMode==3" :src="src" class="radius" mode="scaleToFill"  :style="[{width:info.width+'px',height:info.height+'px'}]" @tap="showImgs"  :data-img="src" ></image>
	</template>
	<template v-else-if="!src && info && info.width">
		<image  :src="src" class="radius" mode="scaleToFill"  :style="$util.imageCoverStyle(info.width,info.height)" @tap="showImgs"  :data-img="src" ></image>
	</template>
	<template v-else>
		<image :src="src" style="width:120px" class="radius" mode="widthFix" @tap="showImgs"  :data-img="src" ></image>
	</template>
</template>
<script>
export default {
	name  : "im-image",
	props : {
		info:{type:Object, default:function(){return {};}},
		src:{type:String, default:''},
	},
	emits:['showImgs'],
	data() {
		return {
		}
	},
	created : function(){
	},
	methods:{
		showImgs(e){
			this.$emit('showImgs',e);
		},
	}
}
</script>