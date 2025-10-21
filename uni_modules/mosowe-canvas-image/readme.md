## mosowe-canvas-image：一个可以制作多用途图片的插件（海报，二维码，分享图）

#### 平台支持：

| APP | H5  | 微信小程序 | 支付宝小程序 | 百度小程序 | 字节跳动小程序 | QQ 小程序 |
|:---:|:---:|:-----:|:------:|:-----:|:-------:|:------:|
| √   | √   | √     | 未测     | 未测    | 未测      | 未测     |

#### 插件功能

1. 支持多图片绘制，多文本绘制，圆形图片绘制；
2. 支持矩形（线条）绘制；
3. 支持圆形绘制；
4. 支持二维码生成，项目用不上可以去插件内去除，毕竟这个插件携带的比较大，单纯用来生成二维码图片也是阔以的；
5. 支持绘图后预览。

多用于海报图，分享图；

注意 H5 跨域问题及小程序白名单配置；   

#### 属性

| 名称           | 类型             | 默认值          | 说明                                 | 版本    |
| ------------ | -------------- | ------------ | ---------------------------------- | ----- |
| width        | Number \String | 200          | canvas 画布宽度，也是导出图片宽度，单位 px，值中不要带单位 | 1.0.0 |
| height       | Number \String | 200          | canvas 画布高度，也是导出图片高度，单位 px，值中不要带单位 | 1.0.0 |
| showPreview  | Boolean        | false        | 绘制完成后是否打开预览                        | 1.0.0 |
| lists        | Array          | []           | 绘制的元素列表：图片，文字，矩形（线条），圆形，二维码        | 1.0.0 |
| imgType      | String         | jpg          | 生成图片格式，可选：png                      | 1.1.0 |
| compress     | Boolean        | false        | 是否开启图片压缩                           | 1.1.0 |
| compressSize | Number\String  | 2097152 (2M) | 超过多少 M 压缩                          | 1.1.0 |
| showLoading  | Boolean        | false        | 是否显示自带的 loading 动画                 | 2.0.0 |
| qrSize       | Number         | 300          | 二维码 size 属性，即二维码承载数据量              | 2.0.0 |
| qrTypeNumber | Number         | 300          | 二维码 typeNumber 属性，二维码密集度，取值 1~40   | 2.0.0 |

#### lists\<item>属性

注意：图文先后顺序，底层的图片靠前，最上层的在最后，圆形图片放在最后，因为一旦绘制圆形，后续的元素都只在该圆形内显示，而超过圆形范围的将看不见。

| 名称					| 类型																		| 必填	| 说明																																																																								| 版本		|
|:------------	|:-------																|:---	|:-----------------------------------------------------------------------------------------------------------------------														|:-----	|
| type					| String																| 是		| 元素类型：`image`图片，`text`文本，`shape`图形：（圆角）矩形、圆形、椭圆，`qr`二维码																																	| 1.0.0	|
| content				| String																| 否		| image：图片路径（必填），text：文字（必填），qr：转二维码的数据（必填），rect 及 arc：非必填																													| 1.0.0	|
| x							| Number																| 是		| X 轴坐标，绘制圆形图片时：x = arcX - arcR																																																						| 1.0.0	|
| y							| Number																| 是		| Y 轴坐标，绘制圆形图片时：y = arcY - arcR																																																						| 1.0.0	|
| width					| Number																| 否		| 图片、矩形（线条）、二维码宽度																																																											| 1.0.0	|
| height				| Number																| 否		| 图片、矩形（线条）、二维码高度																																																											| 1.0.0	|
| arcX					| Number																| 否		| type=image 时，图片在圆形 canvas 的 X 坐标，多为负数，版本`1.2.0`																																										| 1.2.0	|
| arcY					| Number																| 否		| type=image 时，图片在圆形 canvas 的 Y 坐标，多为负数，版本`1.2.0`																																										| 1.2.0	|
| arcR					| Number																| 否		| type=image、shape时：绘制圆形/圆角的半径，默认0																																																			| 2.0.0	|
| ellipse				| Boolean																| 否		| 是否椭圆形																																																																					| 2.0.0	|
| gradient			| Array																	| 否		| 渐变填充颜色，二维数组，格式：[[0, 'red'],[1, 'purple']]，第一个值取值范围0~1，第二个值为颜色，会覆盖color																						|				|
| gradientType	| String																| 否		| 渐变类型，liner 水平，circular 中心																																																									| 2.0.0	|
| color					| String																| 否		| 绘制文本、矩形（线条）的颜色，默认：#000000																																																					| 1.0.0	|
| size					| Number																| 否		| 绘制文本的字号大小，默认：20																																																												| 1.0.0	|
| align					| String																| 否		| 绘制文本的对齐方式，默认：left，可选：right、center																																																	| 1.0.0	|
| maxWidth			| Number																| 否		| 绘制文本的最大宽度，文字长度超过该值会被压缩																																																					| 1.0.0	|
| file					| file																	| 否		| 选择本地图片的 file 文件																																																														| 1.1.0	|
| globalAlpha		| Number																| 否		| 透明度：0~1，默认 1																																																																| 1.2.0	|
| strokeColor		| String																| 否		| 边框颜色																																																																						| 2.0.0	|
| lineWidth			| Number																| 否		| 边框宽度																																																																						| 2.0.0	|
| font					| string																| 否		| 整合 font-size，font-weight，font-family 等属性，格式：`normal bold 18px arial,sans-serif`，特殊字体需要`uni.loadFontFace`引入后才能使用，会覆盖size	| 2.0.0	|
| imageShapeType| 'cover' / 'width' / 'height' / number	| 否		| 图形裁剪图片中，图片的渲染方式，默认cover铺满，width以100%宽等比缩放，height以100%高等比缩放																													| 2.0.1	|

#### slots

| 名称      | 说明                |
|:------- |:----------------- |
| default | 自定义插槽，点击此区会触发绘图事件 |

#### 事件

| 名称          | 回调参数 | 说明                       |
| ----------- | ---- | ------------------------ |
| canvasImage | url  | 绘制成功后返回的本地地址，H5 为 base64 |

#### 使用方式

若`page.json`中配置了`"easycom": true`，则无需`script`引入就可以使用，没有则需要引入。

1. 无 slot：组件标签添加`ref`属性，采用父级调用子组件`createCanvas()`方法使用，见后文示例；
2. 有 slot：slot 区点击就会执行

#### 示例

```html
<template>
  <view class="">
    <button
      type="warn"
      @click="_createImage('png')">
      生成图片.png
    </button>
    <button
      type="primary"
      @click="_createImage('jpg')">
      生成图片.jpg
    </button>
    处理时间：{{ dealTime }}

    <button
      type="primary"
      @click="chooseImage">
      本地图片选择
    </button>
  </view>

  <!-- canvas绘图 -->
  <mosowe-canvas-image
    ref="mosoweCanvasImageRef"
    :lists="poster1"
    :height="canvasHeight"
    :width="canvasWidth"
    :imgType="imgType"
    showLoading
    showPreview
    @canvasImage="_canvasImage"></mosowe-canvas-image>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MosoweCanvasListItem } from '@/components/mosowe-canvas-image/typing.d';

const image =
  'https://**************.png';
const canvasWidth = 750;
const canvasHeight = 1330;
const imgType = ref('png');

const poster1 = ref<MosoweCanvasListItem[]>([
  // 图片
  {
    type: 'text',
    content: '基础图片',
    x: 20,
    y: 30,
    color: '#ff0000'
  },
  {
    type: 'image',
    content: image,
    x: 10,
    y: 50,
    width: 100,
    height: 200
  },
  {
    type: 'text',
    content: '圆形图片',
    x: 150,
    y: 30,
    color: '#ff0000'
  },
  {
    type: 'image',
    content: image,
    x: 140,
    y: 50,
    width: 100,
    height: 100,
    arcR: 50,
    arcX: 0,
    arcY: 0
  },
  {
    type: 'text',
    content: '圆角矩形图片',
    x: 270,
    y: 30,
    color: '#ff0000'
  },
  {
    type: 'image',
    content: image,
    x: 260,
    y: 50,
    width: 120,
    height: 120,
    imageShapeType: 'width',
    arcR: 20
  },
  {
    type: 'text',
    content: '椭圆图片',
    x: 410,
    y: 30,
    color: '#ff0000'
  },
  {
    type: 'image',
    content: image,
    color: '#000000',
    x: 410,
    y: 50,
    width: 200,
    height: 100,
    ellipse: true
  },
  // 矩形
  {
    type: 'text',
    content: '矩形',
    x: 20,
    y: 280,
    color: 'green'
  },
  {
    type: 'shape',
    color: '#ff0000',
    x: 20,
    y: 300,
    width: 100,
    height: 100
  },
  {
    type: 'text',
    content: '圆角矩形+边框',
    x: 150,
    y: 280,
    color: 'green'
  },
  {
    type: 'shape',
    color: '#ff0000',
    x: 150,
    y: 300,
    width: 100,
    height: 100,
    arcR: 20,
    strokeColor: '#000000',
    lineWidth: 5
  },
  {
    type: 'text',
    content: '渐变',
    x: 300,
    y: 280,
    color: 'green'
  },
  {
    type: 'shape',
    color: '#ff0000',
    x: 300,
    y: 300,
    width: 100,
    height: 100,
    gradient: [
      [0, 'red'],
      [1, 'purple']
    ]
  },
  {
    type: 'text',
    content: '长方形',
    x: 420,
    y: 280,
    color: 'green'
  },
  {
    type: 'shape',
    color: '#ff0000',
    x: 420,
    y: 300,
    width: 200,
    height: 100
  },
  // 圆形
  {
    type: 'text',
    content: '圆形',
    x: 20,
    y: 450
  },
  {
    type: 'shape',
    color: 'green',
    x: 20,
    y: 470,
    width: 100,
    height: 100,
    arcR: 50
  },
  {
    type: 'text',
    content: '圆形+边框',
    x: 150,
    y: 450
  },
  {
    type: 'shape',
    color: 'green',
    x: 150,
    y: 470,
    width: 100,
    height: 100,
    arcR: 50,
    strokeColor: '#000000',
    lineWidth: 5
  },
  {
    type: 'text',
    content: '渐变',
    x: 300,
    y: 450
  },
  {
    type: 'shape',
    color: 'green',
    x: 300,
    y: 470,
    width: 100,
    height: 100,
    arcR: 50,
    strokeColor: '#000000',
    lineWidth: 5,
    gradientType: 'circular',
    gradient: [
      [0, 'red'],
      [1, 'purple']
    ]
  },
  {
    type: 'text',
    content: '椭圆',
    x: 420,
    y: 450
  },
  {
    type: 'shape',
    color: 'green',
    x: 420,
    y: 470,
    width: 200,
    height: 100,
    ellipse: true,
    strokeColor: '#000000',
    lineWidth: 5
  },
  // 二维码
  {
    type: 'text',
    content: '二维码',
    x: 20,
    y: 600,
    color: 'blue'
  },
  {
    type: 'qr',
    content:
      'https://blog.csdn.net/skyblacktoday/article/details/131551057?spm=1001.2014.3001.5501',
    x: 20,
    y: 630,
    width: 200,
    height: 200
  },
  {
    type: 'text',
    content: '二维码+中心图',
    x: 250,
    y: 600,
    color: 'blue'
  },
  {
    type: 'qr',
    content:
      'https://blog.csdn.net/skyblacktoday/article/details/131551057?spm=1001.2014.3001.5501',
    x: 280,
    y: 630,
    width: 200,
    height: 200
  },
  {
    type: 'image',
    content: image,
    x: 360,
    y: 710,
    width: 40,
    height: 40,
    arcR: 10
  },
  // 文本
  {
    type: 'text',
    content: '文本加粗',
    x: 20,
    y: 900,
    color: '#E6A23C',
    font: 'normal bold 50px 微软雅黑'
  },
  {
    type: 'text',
    content: '数字特殊字体',
    x: 20,
    y: 980,
    color: '#E6A23C',
    size: 50
  },
  {
    type: 'text',
    content: '1234567890',
    x: 20,
    y: 1050,
    color: '#E6A23C',
    font: 'normal bold 50px din-number'
  }
]);

const mosoweCanvasImageRef = ref<any>(null);
const imageData = ref('');
let createTime = 0;
let endTime = 0;
const dealTime = ref(0);

// 选择照片
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      poster1.value[3].content = res.tempFilePaths[0];
    }
  });
};

// 创建图片
const _createImage = (type: 'png' | 'jpg') => {
  imgType.value = type;
  setTimeout(() => {
    createTime = Date.now();
    mosoweCanvasImageRef.value.createCanvas();
  }, 300);
};
// 获取图片
const _canvasImage = (image: string) => {
  endTime = Date.now();
  dealTime.value = (endTime - createTime) / 1000;
  imageData.value = image;
};
</script>
```



slot 插槽触发：

```html
<mosowe-canvas-image
    :lists="poster1"
    :height="canvasHeight"
    :width="canvasWidth"
    :imgType="imgType"
    showLoading
    showPreview
    @canvasImage="_canvasImage">
  <view class="in_btn">slot按钮的</view>
</mosowe-canvas-image>
```

### v2.0.0

1. 组件新增`showLoading`，`qrSize`，`qrTypeNumber`属性
2. 新增`typing.d.ts`文件，ts 使用引入定义`MosoweCanvasListItem[]`自动提示
3. 小程序端二维码不显示问题处理
4. 原 lists属性：新增元素`strokeColor`边框颜色，`lineWidth`边框宽度，`font`文本属性
5. 原list属性：type值的`rect`矩形（线条），`arc`圆 删除，改为`shape`图形
6. 原list属性：去掉`arc`属性
7. 组件处理优化：网络图片首次渲染下载，后续取缓存。
8. 支持：矩形，长方形，圆角矩形，圆形，椭圆及相关图片裁剪绘制
9. 支持：渐变颜色填充，横向渐变，中心渐变
   
   

### v1.2.0：

1. 添加透明度`globalAlpha`,值 0-1；
2. 修改只能画一个圆形图片问题，画圆形图片时耗时较多，因为额外增加了一个 canvas 处理圆形图片，请注意`arcX`与`arcY`的说明；

### v1.1.0：

1. 添加本地图片渲染，已支持本地相册/相机 + https 的网络图片，建议画布宽高：750*1330
2. 添加导出图片的类型：`imgType`，可选值，jpg、png
3. 添加本地图片压缩功能：`compress`是否开启压缩,`compressSize`：压缩程度，默认 2M，lists 列表图片项需增加传参`file`，
4. 解决 H5 网络图片“canvasToTempFilePath:fail SecurityError: Failed to execute 'toDataURL' on 'HTMLCanvasElement': Tainted canvases may not be exported”错误问题，图片服务器需支持“Access-Control-Allow-Origin: *”
5. 使用非 solt 插槽触发事件时，请确认`$ref`是否正确
6. 示例增加参数编辑，使用前体验插件
