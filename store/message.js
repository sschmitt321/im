import { defineStore } from 'pinia'
import utils from '@/utils/utils.js';
import msgApi from '@/api/message.js';
export const useMsgStore = defineStore({
  id: 'message', // id必填，且需要唯一
  state: () => {
    return {
      pushSocket: '',
      chatSocket: '',
      instantSocket: '',
	  webrtc:'',
	  topContacts:[],
      contacts: [], //所有联系人
	  chatList:[], //聊天列表
      wsSendData: '',
      unread: 0,
	  sysUnread:0,
	  msgAt:0,
	  newMessage:{},
	  msgList:[],
	  unreadIds:[],
	  webrtcLock:false
    }
  },
  // actions 用来修改 state
    actions: {
		catchSocketAction(data){
			this.chatSocket = data;
			if (data.is_group == 2) {
				this.unread += 1;
			}
		},
		updateUnread (data) {
			this.unread = parseInt(data);
		},
		//初始化联系人
		initContacts (data) {
			let contacts=utils.sortContacts(data);
			let topContacts=[];
			let otherContacts=[];
			let unread=0;
			let msgAt=0;
			let mainContacts={};
			let unreadIds=[];
			contacts.forEach((item, index) => {
				if (item.lastContent && item.is_notice==1) {
					unread += item.unread;
				}
				if (item.is_at) {
					msgAt += item.is_at;
				}
				if(item.lastContent && !['text','event','location','contact'].includes(item.type)){
					item.lastContent=utils.getMsgType(item.type);
				}
				if(item.index=='群聊'){
					item.index="#";
				}
				item.draft='';
				let draft=uni.getStorageSync('draft_'+item.id);
				if(draft){
					item.draft=draft;
				}
				if((item.unread>0 || item.is_at>0) && item.is_notice==1){
					unreadIds.push(item.id);
				}
				mainContacts[item.id] =item;
				if (item.is_top == 1) {
					topContacts.push(item)
				}else{
					otherContacts.push(item)
				}
			})
			this.unread=unread;
			this.msgAt=msgAt;
			this.contacts =topContacts.concat(otherContacts);
			this.unreadIds=unreadIds;
			uni.setStorageSync('allContacts',this.contacts);
			uni.setStorageSync('mainContacts',mainContacts);
		},
		//更新联系人
		updateContacts (data) {
			const contacts = uni.getStorageSync('allContacts');
			// 更新联系人
			contacts.forEach((item, index) => {
				let contact = contacts[index];
				if (item.id == data.id) {
					contacts[index] = Object.assign(contact, data);
				}
			})
			this.initContacts(contacts);
		},
		//添加联系人
		appendContacts (data) {
			// 检查是否有该联系人,有就更新,没有就增加
			const mainContacts = uni.getStorageSync('mainContacts');
			if(mainContacts[data.id]){
				return this.updateContacts(data);
			}
			const contacts = uni.getStorageSync('allContacts');
			contacts.push(data);
			this.initContacts(contacts);
		},
		//删除联系人
		deleteContacts (data) {
			const contacts = JSON.parse(JSON.stringify(this.contacts));
			const newContacts = contacts.filter(obj => obj.id != data.id);
			this.contacts=newContacts;
			const mainContacts=uni.getStorageSync('mainContacts');
			delete mainContacts[data.id];
			uni.setStorageSync('allContacts',this.contacts);
			uni.setStorageSync('mainContacts',mainContacts);
		},
		// 初始化当前页面的消息列表
		initMsg(data){
			this.msgList=data;
		},
		// 检查是否存在此消息,有的则跳过,没有就更新
		checkMsg(msg){
			let msgList=this.msgList;
			let hasMsg=false;
			msgList.forEach((item, index) => {
				if (item.id==msg.id) {
				  hasMsg=true;
				}
			})
			// if(!hasMsg){
			// 	this.msgList.push(msg);
			// }
			return hasMsg;
		},
		getContact(id,message){
			if(!id){
				let contacts=uni.getStorageSync('allContacts');
				return contacts;
			}else{
				let contacts=uni.getStorageSync('mainContacts');
				let contact = contacts[id];
				if(!contact && message && message.contactInfo){
					contact = message.contactInfo;
					this.appendContacts(contact);
				}
				return contact;
			}
		},
		getChatList(){
			let contacts=uni.getStorageSync('allContacts');
			this.chatList =contacts.filter(obj => obj.lastContent);
			return this.chatList;
		},
		// 新消息推送
		appendMsg(message){
			this.newMessage=message;
		},
		wsSend (data) {
			this.wsSendData = data;
		}
    }
})
