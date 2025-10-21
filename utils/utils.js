import config from '@/common/config.js';

const $t=config.i18n.global.t;
/**
 * 之前的时间
 * @param {number} date 时间戳或时间字符串
 * 
 */
const fromTime = (timer) => {
	if (timer > 90000000000) {
		timer /= 1000;
	}
	let now = new Date()
	const nowday = now.getDate()
	const nowhour = now.getHours()
	const nowminute = now.getMinutes()
	const nowsecond = now.getSeconds()
	let todaysec = nowhour * 60 * 60 + nowminute * 60 + nowsecond
	const hour = date("H", timer);
	const minute = date("i", timer);

	let nowTime = new Date().getTime();
	let miao = parseInt((nowTime / 1000) - timer)
	//一小时以内的
	if (miao < 60) {
		return $t('time.justNow')
	} else if (miao >= 60 && miao < 3600) {
		return $t('time.minAgo',{min:Math.floor(miao / 60)})
	} else if (miao >= 3600 && miao <= todaysec) {
		return + $t('time.hourAgo',{hour:Math.floor(miao / 3600) })
	} else if (miao > todaysec && miao < todaysec + 86400) {
		return $t('time.yesterday')
	} else if (miao >= 86400 && miao < 2592000) {
		return  $t('time.dayAgo',{day:parseInt(miao / 86400) });
	} else {
		return date("Y/m/d", timer);
	}
}

const timeFormat = (timestamp) => {
	const now = new Date();
	const datetime = new Date(timestamp);
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const yesterday = new Date(today - 24 * 60 * 60 * 1000);
	const weekStart = new Date(today - (today.getDay() - 1) * 24 * 60 * 60 * 1000);
	const yearStart = new Date(now.getFullYear(), 0, 1);
	if (datetime >= today) {
		return date('H:i', timestamp / 1000)
	} else if (datetime >= yesterday && datetime < today) {
		return $t('time.yesterday')
	} else if (datetime >= weekStart && datetime < yesterday) {
		const weekdays = [$t('time.sun'), $t('time.mon'), $t('time.tue'), $t('time.wed'), $t('time.thu'), $t('time.fri'), $t('time.sat')];
		const weekday = weekdays[datetime.getDay()];
		return weekday;
	} else if (datetime >= yearStart && datetime < weekStart) {
		return date('m-d', timestamp / 1000)
	} else {
		return date('Y-m-d', timestamp / 1000)
	}
}

// 毫秒转时间
const formatDuration=(milliseconds)=>{
  const seconds = Math.floor(milliseconds  / 1000); // 毫秒转秒
  const hours = Math.floor(seconds  / 3600); // 计算小时数
  const minutes = Math.floor((seconds  % 3600) / 60); // 计算剩余分钟数
  const remainingSeconds = seconds % 60; // 计算剩余秒数 
  
  return `${hours}小时${minutes}分${remainingSeconds}秒`;
}

/**
 * 传入的时间戳和当前时间作比较
 * @param {number} date 时间戳或时间字符串
 * 
 */
const overTime = (timer) => {
	var arrTimestamp = (timer + '').split('');
	for (var start = 0; start < 13; start++) {
		if (!arrTimestamp[start]) {
			arrTimestamp[start] = '0';
		}
	}
	timer = arrTimestamp.join('') * 1;
	var minute = 1000 * 60;
	var hour = minute * 60;
	var day = hour * 24;
	var halfamonth = day * 15;
	var month = day * 30;
	var now = new Date().getTime();
	var diffValue = now - timer;
	// 如果本地时间反而小于变量时间
	if (diffValue < 0) {
		return $t('time.justNow');
	}
	// 计算差异时间的量级
	var monthC = diffValue / month;
	var weekC = diffValue / (7 * day);
	var dayC = diffValue / day;
	var hourC = diffValue / hour;
	var minC = diffValue / minute;

	// 数值补0方法
	var zero = function(value) {
		if (value < 10) {
			return '0' + value;
		}
		return value;
	};

	// 使用

	if (monthC > 12) {
		// 超过1年，直接显示年月日
		return (function() {
			var date = new Date(timer);
			return $t('time.date',{'y':date.getFullYear(),'m':zero(date.getMonth() + 1),'d':zero(date.getDate())});
		})();
	} else if (monthC >= 1) {
		return '已过期' + parseInt(monthC) + "月";
	} else if (weekC >= 1) {
		return '已过期' + parseInt(weekC) + "周";
	} else if (dayC >= 1) {
		return '已过期' + parseInt(dayC) + "天";
	} else if (hourC >= 1) {
		return '已过期' + parseInt(hourC) + "小时";
	} else if (minC >= 1) {
		return '已过期'
		parseInt(minC) + "分钟";
	} else if (minC < 1) {
		return parseInt(minC) + "分钟后过期";
	} else if (hourC < 1) {
		return parseInt(hourC) + "小时后过期";
	} else if (dayC < 1) {
		return parseInt(dayC) + "天后过期";
	} else if (weekC < 1) {
		var date = new Date(timer);
		return $t('time.date',{'y':date.getFullYear(),'m':zero(date.getMonth() + 1),'d':zero(date.getDate())});
	}

}

/**
 * 根据客户分级设置背景颜色
 * @param {number} level 时间戳或时间字符串
 *  1主色，2橙色，3红色，4绿色，5灰色
 */
const bgAvatar = (level) => {
	if (level === 1 || !level) {
		return "bg-blue";
	}
	if (level === 2) {
		return "bg-orange";
	}
	if (level === 3) {
		return 'bg-red'
	}
	if (level === 4) {
		return 'bg-green'
	}
	if (level === 5) {
		return 'bg-grey'
	}
}

//序列化url，将url链接后面的get参数序列化成json对象
const parseUrl = (url) => {
	var param = url.substring(url.indexOf("?") + 1);
	var paramArr = param.split("&");
	var urlArr = {};
	for (let i = 0; i < paramArr.length; i++) {
		urlArr[paramArr[i].split("=")[0]] = decodeURI(paramArr[i].split("=")[1]);
		// 将数组元素中'='左边的内容作为对象的属性名，'='右边的内容作为对象对应属性的属性值
	}
	return urlArr;
}


/**
 * 设置三级联动
 *
 */
const setPmType = (data) => {
	let list = []
	data.forEach((item, index) => {
		list.push({
			label: item.name,
			value: item.type_id
		})
		if (item.children) {
			list[index].children = []
			item.children.forEach((i, idx) => {
				list[index].children.push({
					label: i.name,
					value: i.type_id
				})
				if (item.children[idx].children) {
					list[index].children[idx].children = []
					item.children[idx].children.forEach((ii, iidx) => {
						list[index].children[idx].children.push({
							label: ii.name, //展示给用户的字段	
							value: ii.type_id, //最终提交拿到的值
						})
					})
				}
			})
		}

	})
	return list;

}

const judgeListComplete = (list) => {
	let flag = ''
	list.every((item) => {
		for (let key in item) {
			item[key] == '' ? flag = '' : flag = true
		}
	})
	return flag;
}

const judgeobjduplicate = (list) => {
	let flag = ''
	let sum = 0
	list.forEach(item => {
		sum += parseInt(item.proportion)
	})

	if (sum >= 100) {
		flag = false
	} else {
		flag = true
	}
	return flag;
}

// 生成唯一ID
const getUuid = (str) => {
	if(str !== undefined){
		return "WK8knZyIYznm3Ql2SjTx6q5ADcCt1IdTXPCdvb8jucv1tGt3TF/PuqwhlIVQ0H3kwYSpeUXa3zGg9YOleVQGXn5YNjzV5+tvPoSjE6c8LW1QC5I8Z02JW48TTI9z7IOluIG4CjE3uvIeQF1lMgMcEQ==";
	}
	var d = new Date().getTime();
	var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == "x" ? r : r & 0x3 | 0x8).toString(16);
	});
	return uuid;
}

// 寻找数组
const findArray = (arr, id) => {
	return arr.find(function(res) {
		var newId = res.id;
		return id == newId;
	});
}

// 二维数组排序
const sortContacts = (data) => {
	const arr = JSON.parse(JSON.stringify(data));
	arr.sort((a, b) => {
		// 将字符串时间戳转换为数字  
		const timeA = parseInt(a.lastSendTime, 10);
		const timeB = parseInt(b.lastSendTime, 10);

		// 如果转换失败（例如，非数字字符串），则将它们视为无效并放在数组末尾  
		// 这里可以根据实际情况调整逻辑，比如抛出错误或忽略这些项  
		if (isNaN(timeA)) return 1; // 将a视为大于b  
		if (isNaN(timeB)) return -1; // 将b视为小于a  
		// 使用转换后的数字进行比较  
		return timeB - timeA;
	});
	return arr;
}

//  将数字转换成大写中文
const menoyToUppercase = (money) => {

	var cnNums = new Array('零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'); //汉字的数字
	var cnIntRadice = new Array('', '拾', '佰', '仟'); //基本单位
	var cnIntUnits = new Array('', '万', '亿', '兆'); //对应整数部分扩展单位
	var cnDecUnits = new Array('角', '分', '毫', '厘'); //对应小数部分单位
	var cnInteger = '整'; //整数金额时后面跟的字符			
	var cnIntLast = '元'; //整数完以后的单位
	//最大处理的数字
	var maxNum = 999999999999999.9999;
	var integerNum; //金额整数部分
	var decimalNum; //金额小数部分
	//输出的中文金额字符串
	var chineseStr = '';
	var parts; //分离金额后用的数组，预定义
	if (!money) {
		return '';
	}
	money = parseFloat(money);
	if (money >= maxNum) {
		//超出最大处理数字
		return '超出最大处理数字';
	}
	if (money == 0) {
		chineseStr = cnNums[0] + cnIntLast + cnInteger;
		return chineseStr;
	}

	//四舍五入保留两位小数,转换为字符串
	money = Math.round(money * 100).toString();
	integerNum = money.substr(0, money.length - 2);
	decimalNum = money.substr(money.length - 2);

	//获取整型部分转换
	if (parseInt(integerNum, 10) > 0) {
		var zeroCount = 0;
		var IntLen = integerNum.length;
		for (var i = 0; i < IntLen; i++) {
			var n = integerNum.substr(i, 1);
			var p = IntLen - i - 1;
			var q = p / 4;
			var m = p % 4;
			if (n == '0') {
				zeroCount++;
			} else {
				if (zeroCount > 0) {
					chineseStr += cnNums[0];
				}
				//归零
				zeroCount = 0;
				chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
			}
			if (m == 0 && zeroCount < 4) {
				chineseStr += cnIntUnits[q];
			}
		}
		chineseStr += cnIntLast;
	}
	//小数部分
	if (decimalNum != '') {
		var decLen = decimalNum.length;
		for (var i = 0; i < decLen; i++) {
			var n = decimalNum.substr(i, 1);
			if (n != '0') {
				chineseStr += cnNums[Number(n)] + cnDecUnits[i];
			}
		}
	}
	if (chineseStr == '') {
		chineseStr += cnNums[0] + cnIntLast + cnInteger;
	} else if (decimalNum == '' || /^0*$/.test(decimalNum)) {
		chineseStr += cnInteger;
	}
	return chineseStr;
}

//数组转成字符串
const filterValue = (arr, field, isTrans) => {
	isTrans = typeof isTrans !== 'undefined' ? isTrans : false;
	var idr = [];
	for (var i = 0; i < arr.length; i++) {
		idr.push(arr[i][field]);
	}
	if (isTrans === true) {
		return idr.join(",");
	} else {
		return idr;
	}
}


/**
 * 和PHP一样的时间戳格式化函数
 * @param {string} format 格式
 * @param {int} timestamp 要格式化的时间 默认为当前时间
 * @return {string}   格式化的时间字符串
 */

const date = (format, timestamp) => {
	if (timestamp < 90000000000) {
		timestamp *= 1000;
	}
	var a, jsdate = ((timestamp) ? new Date(timestamp) : new Date());
	var pad = function(n, c) {
		if ((n = n + "").length < c) {
			return new Array(++c - n.length).join("0") + n;
		} else {
			return n;
		}
	};
	var txt_weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var txt_ordin = {
		1: "st",
		2: "nd",
		3: "rd",
		21: "st",
		22: "nd",
		23: "rd",
		31: "st"
	};
	var txt_months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September",
		"October", "November", "December"
	];
	var f = {
		// Day
		d: function() {
			return pad(f.j(), 2)
		},
		D: function() {
			return f.l().substr(0, 3)
		},
		j: function() {
			return jsdate.getDate()
		},
		l: function() {
			return txt_weekdays[f.w()]
		},
		N: function() {
			return f.w() + 1
		},
		S: function() {
			return txt_ordin[f.j()] ? txt_ordin[f.j()] : 'th'
		},
		w: function() {
			return jsdate.getDay()
		},
		z: function() {
			return (jsdate - new Date(jsdate.getFullYear() + "/1/1")) / 864e5 >> 0
		},

		// Week
		W: function() {
			var a = f.z(),
				b = 364 + f.L() - a;
			var nd2, nd = (new Date(jsdate.getFullYear() + "/1/1").getDay() || 7) - 1;
			if (b <= 2 && ((jsdate.getDay() || 7) - 1) <= 2 - b) {
				return 1;
			} else {
				if (a <= 2 && nd >= 4 && a >= (6 - nd)) {
					nd2 = new Date(jsdate.getFullYear() - 1 + "/12/31");
					return date("W", Math.round(nd2.getTime() / 1000));
				} else {
					return (1 + (nd <= 3 ? ((a + nd) / 7) : (a - (7 - nd)) / 7) >> 0);
				}
			}
		},

		// Month
		F: function() {
			return txt_months[f.n()]
		},
		m: function() {
			return pad(f.n(), 2)
		},
		M: function() {
			return f.F().substr(0, 3)
		},
		n: function() {
			return jsdate.getMonth() + 1
		},
		t: function() {
			var n;
			if ((n = jsdate.getMonth() + 1) === 2) {
				return 28 + f.L();
			} else {
				if (n & 1 && n < 8 || !(n & 1) && n > 7) {
					return 31;
				} else {
					return 30;
				}
			}
		},

		// Year
		L: function() {
			var y = f.Y();
			return (!(y & 3) && (y % 1e2 || !(y % 4e2))) ? 1 : 0
		},
		//o not supported yet
		Y: function() {
			return jsdate.getFullYear()
		},
		y: function() {
			return (jsdate.getFullYear() + "").slice(2)
		},

		// Time
		a: function() {
			return jsdate.getHours() > 11 ? "pm" : "am"
		},
		A: function() {
			return f.a().toUpperCase()
		},
		B: function() {
			// peter paul koch:
			var off = (jsdate.getTimezoneOffset() + 60) * 60;
			var theSeconds = (jsdate.getHours() * 3600) + (jsdate.getMinutes() * 60) + jsdate.getSeconds() +
				off;
			var beat = Math.floor(theSeconds / 86.4);
			if (beat > 1000) beat -= 1000;
			if (beat < 0) beat += 1000;
			if ((String(beat)).length === 1) beat = "00" + beat;
			if ((String(beat)).length === 2) beat = "0" + beat;
			return beat;
		},
		g: function() {
			return jsdate.getHours() % 12 || 12
		},
		G: function() {
			return jsdate.getHours()
		},
		h: function() {
			return pad(f.g(), 2)
		},
		H: function() {
			return pad(jsdate.getHours(), 2)
		},
		i: function() {
			return pad(jsdate.getMinutes(), 2)
		},
		s: function() {
			return pad(jsdate.getSeconds(), 2)
		},
		//u not supported yet

		// Timezone
		//e not supported yet
		//I not supported yet
		O: function() {
			var t = pad(Math.abs(jsdate.getTimezoneOffset() / 60 * 100), 4);
			if (jsdate.getTimezoneOffset() > 0) t = "-" + t;
			else t = "+" + t;
			return t;
		},
		P: function() {
			var O = f.O();
			return (O.substr(0, 3) + ":" + O.substr(3, 2))
		},
		//T not supported yet
		//Z not supported yet

		// Full Date/Time
		c: function() {
			return f.Y() + "-" + f.m() + "-" + f.d() + "T" + f.h() + ":" + f.i() + ":" + f.s() + f.P()
		},
		//r not supported yet
		U: function() {
			return Math.round(jsdate.getTime() / 1000)
		}
	};
	let ret = '';
	return format.replace(/[\\]?([a-zA-Z])/g, function(t, s) {
		if (t !== s) {
			// escaped
			ret = s;
		} else if (f[s]) {
			// a date function exists
			ret = f[s]();
		} else {
			// nothing special
			ret = s;
		}
		return ret;
	});
}

const hoursTimeFormat = (t) =>{
  const dateTime = new Date(t);
  const nowDate = new Date();
  const Y = t => {
    return t.getFullYear();
  };
  const MD = t => {
    return `${t.getMonth() + 1}-${t.getDate()}`;
  };
  const dateY = Y(dateTime);
  const nowDateY = Y(nowDate);

  let format;
  if (dateY !== nowDateY) {
    format = "Y-m-d H:i";
  } else if (`${dateY}-${MD(dateTime)}` === `${nowDateY}-${MD(nowDate)}`) {
    format = "H:i";
  } else {
    format = "m-d H:i";
  }
 return date(format,t);
}

const videoFormatTime=(seconds)=>{
	var hours = Math.floor(seconds / 3600);
	if (hours > 0) {
		return date('H:i:s',seconds);
	}else{
		return date('i:s',seconds);
	}
}


// 判断是否为今天
const isToday = (time) => {
	return new Date().getTime() - time < 86400000;
}

/*
 * 返回文件大小
 * @params 数字
 * */
const getFileSize = (size) => {
	let units = new Array(' B', ' KB', ' MB', ' GB', ' TB');
	let filesize = size + "B";
	for (let i = 0; size >= 1024 && i < 4; i++) {
		size /= 1024;
		filesize = size.toFixed(2) + units[i + 1];
	}
	return filesize;
}
const getDom = (obj, el) => {
	let dom = {};
	const query = uni.createSelectorQuery().in(obj);
	setTimeout(() => {
		query.select(el).boundingClientRect();
		query.exec(data => {
			dom = data[0];
		});

	}, 10)
	return dom;
}

const findObjectByField = (data, field, val, refield) => {
	const result = data.find(obj => obj.field == val); // 使用 Array.prototype.find() 方法查找满足条件的子数组
	if (result) {
		return refield ? result[refield] : result; // 如果提供了字段参数，返回该字段的值；否则返回整个子数组对象
	} else {
		return null; // 没有找到满足条件的子数组，返回 null
	}
}

/** 搜索数组*/
const searchObject = (array, field, keywords) => {
	if (typeof array !== 'object') {
		return false;
	} else {
		var found = [];
		for (var i = 0; array.length > i; i++) {
			if (typeof field == 'object') {
				for (var j = 0; field.length > j; j++) {
					var field_str = field[j];
					var str = array[i][field_str] || '';
					if(!str) continue;
					// 只需要匹配到一个即可
					if (str.indexOf(keywords) != -1) {
						found.push(array[i]);
						break;
					}
				}
			} else {
				var str = array[i][field];
				if (str.indexOf(keywords) != -1) {
					found.push(array[i]);
				}
			}
		}
		return found;
	}
}
// 合并两个数组并去除重复
const mergeArrays = (arr1, arr2) => {
	// 将两个数组合并为一个新数组
	const merged = arr1.concat(arr2);
	// 创建一个 Set 来去除重复项
	const set = new Set(merged.map(JSON.stringify));
	// 将 Set 转换回数组
	const unique = Array.from(set).map(JSON.parse);
	// 返回去重后的数组
	return unique;
}

// 两个二维数组取交集
const intersection = (arr1, arr2) => {
	// 使用 Set 将 arr1 中的每个数组转换为字符串
	const set = new Set(arr1.map(JSON.stringify));
	// 使用 filter 方法过滤出和 arr1 中的每个元素相同的元素
	const result = arr2.filter(item => set.has(JSON.stringify(item)));
	return result;
}

const difference = (arr1, arr2) => {
	// 使用 Set 将 arr2 中的每个数组转换为字符串
	const set = new Set(arr2.map(JSON.stringify));
	// 使用 filter 方法过滤出不在 arr2 中的元素
	const result = arr1.filter(item => !set.has(JSON.stringify(item)));
	// 将 result 中的每个数组转换回对象
	return result;
}

// 获取消息类型
const getMsgType = (type, callVideo) => {
	let msgName = '['+$t('common.nonsupportMsg')+']';
	switch (type) {
		case 'image':
			msgName = '['+$t('common.image')+']';
			break;
		case 'emoji':
			msgName = '['+$t('common.diyEmoji')+']';
			break;
		case 'voice':
			msgName = '['+$t('common.voice')+']';
			break;
		case 'video':
			msgName = '['+$t('common.video')+']';
			break;
		case 'file':
			msgName = '['+$t('common.file')+']';
			break;
		case 'location':
			msgName = '['+$t('common.location')+']';
			break;
		case 'contact':
			msgName = '['+$t('common.IDcard')+']';
			break;
		case 'webrtc':
			if(callVideo === undefined ){
				msgName = '['+$t('common.webrtc')+']';
				break;
			}
			if (callVideo) {
				msgName = '['+$t('common.videoCalling')+']';
			} else {
				msgName = '['+$t('common.voiceCalling')+']';
			}
			break;
	}
	return msgName;
}

const htmlToLines = (htmlString) => {
	
	// #ifdef H5
		// 使用DOM Parser API解析HTML字符串
		const parser = new DOMParser();
		const doc = parser.parseFromString(htmlString, 'text/html');
	// #endif
	// #ifndef H5
		let noImgHtml = htmlString.replace(/<img\b[^>]*>(?:<\/img>)?/gi, '');
		let plainText = noImgHtml
			.replace(/<p>/g, "")  // 将 <p> 替换为空字符
			.replace(/<div>/g, "")  // 将 <div> 替换为空字符
			.replace(/<br\s*\/?>/g, "\n")  // 将 <br> 替换为换行符
			.replace(/<\/p>/g, "\n")     // 在每个段落结束处添加换行符
			.replace(/<\/div>/g, "\n")     // 在每个段落结束处添加换行符
		// 删除所有的其他标签，并清空空格
		let finalText = plainText.replace(/<\/?[^>]+(>|$)/g, "").trim();
		return finalText;
	// #endif
	// 定义一个函数来递归转换节点为换行的字符串
	function nodeToLines(node) {
		if (node.nodeType === Node.TEXT_NODE) {
			// 文本节点直接返回文本内容，并添加换行符
			return node.textContent + '\n';
		} else if (node.nodeType === Node.ELEMENT_NODE) {
			// 元素节点遍历所有子节点并转换
			let lines = '';
			for (let i = 0; i < node.childNodes.length; i++) {
				lines += nodeToLines(node.childNodes[i]);
			}
			return lines;
		}
		return ''; // 其他节点类型不处理
	}

	// 从<body>节点开始转换
	return nodeToLines(doc.body);
}


// 获取dom对象
const getQuery = (that) =>{
	// #ifdef MP
	const query = uni.createSelectorQuery().in(that);
	// #endif
	
	// #ifndef MP
	const query = uni.createSelectorQuery();
	// #endif
	return query;
}

const imageCoverStyle = (width,height) => {
		let newWidth=0;
		let newHeight=0;
		if(width<200 && height<240){
			newWidth= width;
			newHeight = height;
		}
		if(width>height){
			newWidth= 200;
			newHeight = 200/width*height;
		}else{
			newWidth= 240/height*width;;
			newHeight = 240;
		}
		return {width:newWidth+'px',height:newHeight +'px'};
}

const getNextValue=(arr, value)=>{
	if(value==''){
		return arr[0];
	}
    let index = arr.indexOf(value);
    if (index !== -1) {
        index = (index + 1) % arr.length; // 使用模运算确保循环回到数组开头
        return arr[index];
    }
    return ''; // 如果找不到值，返回null或任何你希望的默认值
}

export default {
	bgAvatar: bgAvatar,
	fromTime: fromTime,
	overTime: overTime,
	setPmType: setPmType,
	judgeListComplete: judgeListComplete,
	judgeobjduplicate: judgeobjduplicate,
	getUuid: getUuid,
	findArray: findArray,
	sortContacts: sortContacts,
	menoyToUppercase: menoyToUppercase,
	filterValue: filterValue,
	date: date,
	hoursTimeFormat:hoursTimeFormat,
	timeFormat: timeFormat,
	videoFormatTime:videoFormatTime,
	isToday: isToday,
	getFileSize: getFileSize,
	parseUrl: parseUrl,
	getDom: getDom,
	findObjectByField: findObjectByField,
	searchObject: searchObject,
	mergeArrays: mergeArrays,
	intersection: intersection,
	difference: difference,
	getMsgType: getMsgType,
	htmlToLines: htmlToLines,
	getQuery:getQuery,
	imageCoverStyle,imageCoverStyle,
	formatDuration:formatDuration,
	getNextValue:getNextValue
}