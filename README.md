# FuChat for uniapp

技术栈：`vue3` + `pinia` + `color-UI`

#### 目录结构
```
FuChat
├─api                   接口目录
│  ├─index.js           总的接口文件
│  └─message.js         消息接口
│
├─common                公共目录
│  ├─socket.js          websocket配置
│  └─config.js          服务器地址配置
│ 
│─components            符合vue组件规范的uni-app组件目录
│  └─comp-a.vue         可复用的a组件
│
├─pages                 业务页面文件存放的目录
│  ├─index
│  │  └─index.vue       index页面
│  ├─message
│  │   └─index.vue      消息列表页面
│  ├─ ...               更多目录
│  └─contact
│     └─index.vue       联系人列表页面
│
├─static                存放应用引用的本地静态资源（如图片、视频等）的目录，注意：静态资源只能存放于此
│
├─uni_modules           存放[uni_module](/uni_modules)。
│
├─hybrid                App端存放本地html文件的目录，详见
│
├─nativeplugins         远程插件目录
│
├─uniCloud              云函数目录，里面有unipush的推送功能，如果不需要可以删除（已删除）
│
├─unpackage             非工程代码，一般存放运行或发行的编译结果
│
├─main.js               Vue初始化入口文件
├─App.vue               应用配置，用来配置App全局样式以及监听 应用生命周期
├─manifest.json         配置应用名称、appid、logo、版本等打包信息，详见
├─pages.json            配置页面路由、导航条、选项卡等页面类信息，详见
└─uni.scss              这里是uni-app内置的常用样式变量
```

#### 5.3+ 重要更新
修改接口的时候，为了避免自己打包的H5被盗用，我们加入了域名加密认证。
- 在 `/common/config.js` 中需要添加一个加密信息：hostToken，可以搜索定位到该字符串
- hostToken信息需要将自己的域名md5加密 两次（域名md5加密一次后得到的值再md5加密一次）在拼接两个字符串，得到我们的Token。不会加密的去百度搜索md5在线加密，将域名输入后加密得到第一次加密后的Token，把加密后的值再重复加密一次即可。

加密格式如下：

> "sha"+域名加密两次后的md5 + "bi"

假如我们的域名是 `im.xxxxx.com` ，那么加密后就应该是：sha   f9cb4d7d77719f068e7233e81690f39a   bi

加密好了把该token填写到hostToken中，这样就可以避免别人下载我们的h5页面，修改域名来使用我们的源码，如果不影响可以将相应的代码屏蔽掉或者使用其他更先进的算法。

#### 安装打包请直接参考文档
文档全部迁移至以下地址：
所有文档地址: [接口文档地址](https://apifox.com/apidoc/shared-e563aed5-7578-4620-913f-f6746ece6067)