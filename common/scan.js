import {
	apiUrl,
	postJsonRequest,
} from '@/utils/request.js';

const verifyQr=(url)=>{
	let pathinfo=url.replace(apiUrl,'');
	let pathParts = pathinfo.split('/'); // 使用斜杠字符分割字符串
	let lastPart = pathParts[pathParts.length - 1]; // 获取最后一组数据
	postJsonRequest(pathinfo,{realToken:lastPart}).then((res)=>{
		if(res.code==0){
			switch(res.data.action){
				case 'groupInfo':
					uni.navigateTo({
						url: '/pages/message/group/info?group_id='+ res.data.id
					})
				break;
				case 'userInfo':
					uni.navigateTo({
						url:"/pages/contacts/detail?id="+res.data.id
					})
				break;
			}
		}
	})
}

const scanQr=()=>{
	// #ifndef H5
	uni.scanCode({
		success: function (res) {
			checkQr(res.result);
		}
	});
	// #endif
	// #ifdef H5
	 uni.navigateTo({
	 	url:'/pages/index/scan'
	 })
	// #endif	
}

const checkQr=(data)=>{
	// 如果识别出二维码是跟服务器的地址一样,就请求该接口
	if(data.includes(apiUrl)){
		verifyQr(data);
	}else{
		uni.showModal({
			title: '已识别内容',
			content: data,
			confirmText:'复制内容',
			success: function (e) {
				if (e.confirm) {
					uni.setClipboardData({
						data: data,
						success: function () {
							uni.showToast({
								title:'复制成功',
								icon:'none'
							})
						}
					});
				} 
			}
		});
	}
}

export default {
	scanQr,
	checkQr
}