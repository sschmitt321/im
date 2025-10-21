<template>
	<!-- HTML -->
	    <get-qrcode @success='qrcodeSucess' @error="qrcodeError" ></get-qrcode>
</template>

<script>
	import scan from '@/common/scan.js'
	import getQrcode from '@/components/get-qrcode.vue'
	// 嫌路径长的话可以单独复制出来
	export default {
	        components: {
	            getQrcode
	        },
	        methods: {
	            qrcodeSucess(data) {
					scan.checkQr(data);
					uni.navigateBack({})
	            },
				qrcodeError(err) {
					console.info(err)
					uni.showModal({
					    title:this.$t('message.cameraError'),
					    content:this.$t('message.cameraErrorCheck'),
					    success: () => {
							uni.navigateBack()
					    }
					})
				}
	        }
	    }
</script>

<style>
</style>