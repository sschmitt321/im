<!-- mosowe-canvas-image -->
<template>
  <view class="mosowe-canvas-image">
    <view
      class="slot-view"
      @click="createCanvas">
      <slot></slot>
    </view>
    <view class="canvas-wrap-box">
      <!-- 主面板绘制 -->
      <canvas
        class="canvas-wrap"
        canvas-id="canvas"
        :style="'width: ' + width + 'px; height: ' + height + 'px;'"></canvas>
      <!-- 这个是用来绘制圆形/矩形图片的 -->
      <canvas
        class="canvas-wrap"
        canvas-id="canvas-arc"
        :style="'width: ' + canvasArcWidth + 'px; height: ' + canvasArcHeight + 'px;'"></canvas>
    </view>
  </view>
</template>

<script>
import QR from './wxqrcode.js';
export default {
  name: 'mosowe-canvas-image',
  props: {
    imgType: {
      // 图片类型
      type: String,
      default: 'jpg',
      validator: () => {
        return ['jpg', 'png'];
      }
    },
    showLoading: {
      // 是否开启加载中
      type: Boolean,
      default: false
    },
    compress: {
      // 是否开启压缩
      type: Boolean,
      default: false
    },
    compressSize: {
      // 压缩界限，超过界限压缩，默认2M
      type: [Number, String],
      default: 1024 * 1024 * 2
    },
    showPreview: {
      // 生成图像后是否预览
      type: Boolean,
      default: false
    },
    height: {
      // canvas高度
      type: [String, Number],
      default: 200
    },
    width: {
      // canvas宽度
      type: [String, Number],
      default: 200
    },
    lists: {
      type: Array,
      default: () => {
        return [];
      }
    },
    qrSize: {
      // 二维码size
      type: Number,
      default: 300
    },
    qrTypeNumber: {
      // 二维码typeNumber
      type: Number,
      default: 10
    }
  },
  data() {
    return {
      canvas: null,
      listsIndex: 0,
      listsLength: 0,
      canvasArc: null,
      canvasArcWidth: 100,
      canvasArcHeight: 100,
      compressQuality: 20,
      compressQualityH5: 5,
      qrCacheFileList: []
    };
  },
  // 组件创建完成
  created() {
    this.canvas = uni.createCanvasContext('canvas', this);
    this.canvasArc = uni.createCanvasContext('canvas-arc', this);
  },
  // 页面方法
  methods: {
    // 开始绘制
    createCanvas() {
      this.clearCanvas();
      if (this.lists.length === 0) {
        uni.showToast({
          title: 'lists不能为空',
          icon: 'none'
        });
        return;
      }
      this.listsIndex = 0;
      this.listsLength = this.lists.length - 1;
      if (this.showLoading) {
        uni.showLoading({
          title: this.$t('common.createImage'),
          mask: true
        });
      }
      this.dataDrawCanvas();
    },
    // 数据绘制
    dataDrawCanvas() {
      let item = { ...this.lists[this.listsIndex] };
      if (item.type === 'image') {
        item.content = item.localImage || item.content;
        // 图片
        if (item.content.indexOf('https://') > -1) {
          // https://网络图片
          this.downloadImageNotH5(item);
        } else {
          // 本地选择图片
          this.drawMethodsImage(item);
        }
      } else if (item.type === 'text') {
        // 文本
        this.drawText(item);
      } else if (item.type === 'shape') {
        // 矩形/圆角矩形/圆心/椭圆形
        this.drawShapeMain(item);
      } else if (item.type === 'qr') {
        // 二维码
        this.drawQR(item);
      }
    },
    // https图片下载本地并绘制
    downloadImageNotH5(item) {
      uni.downloadFile({
        url: item.content,
        header: {
          'Access-Control-Allow-Origin': '*'
        },
        success: (res) => {
          item.content = res.tempFilePath;
          this.lists[this.listsIndex].localImage = res.tempFilePath;
          this.drawMethodsImage(item);
        },
        fail: (res) => {
          console.log(res);
        }
      });
    },
    // 图片渲染方式
    async drawMethodsImage(item) {
      await this.checkImageShapeType(item);
      if (Object.keys(item).includes('arcR') || item?.ellipse) {
        this.drawShapeImage(item);
      } else {
        this.drawImage(item);
      }
    },
    checkImageShapeType(item) {
      return new Promise((resolve) => {
        if (item.imageShapeType) {
          uni.getImageInfo({
            src: item.content,
            success: (r) => {
              item.imageWidth = r.width;
              item.imageHeight = r.height;
              item.whScale = r.width / r.height;
              this.lists[this.listsIndex].whScale = item.whScale;
              resolve(true);
            }
          });
        } else {
          resolve(true);
        }
      });
    },
    // 图片绘制
    drawImage(item) {
      this.canvas.globalAlpha = item.hasOwnProperty('globalAlpha') ? item.globalAlpha : 1;
      this.canvas.drawImage(
        item.content,
        item.x,
        item.y,
        item.hasOwnProperty('width') ? item.width : this.width,
        item.hasOwnProperty('height') ? item.height : this.height
      );

      this.checkDrawOver();
    },
    // 文本绘制
    drawText(item) {
      this.canvas.setFillStyle(item.hasOwnProperty('color') ? item.color : '#000000');
      if (item?.font) {
        this.canvas.font = item?.font;
      } else {
        this.canvas.font = '10px sans-serif';
        this.canvas.setFontSize(item.hasOwnProperty('size') ? item.size : 20);
      }

      this.canvas.setTextAlign(item.hasOwnProperty('align') ? item.align : 'left');
      this.canvas.globalAlpha = item.hasOwnProperty('globalAlpha') ? item.globalAlpha : 1;

      if (item.maxWidth) {
        this.canvas.fillText(item.content, item.x, item.y, item.maxWidth);
      } else {
        this.canvas.fillText(item.content, item.x, item.y);
      }
      this.checkDrawOver();
    },
    // 矩形，圆角矩形，圆形，椭圆绘制主函数
    async drawShapeMain(item) {
      await this.shapeDraw(this.canvas, item);
      if (item?.gradient?.length) {
        // 渐变颜色填充
        let grd = null;
        if (item?.gradientType === 'circular') {
          const r = item.arcR || item.width / 2;
          grd = this.canvas.createCircularGradient(item.x + r, item.y + r, r);
        } else {
          grd = this.canvas.createLinearGradient(item.x, item.y, item.width + item.x, item.height + item.y);
        }
        item.gradient.forEach((item) => {
          grd.addColorStop(item[0], item[1]);
        });

        this.canvas.setFillStyle(grd);
      } else {
        // 一般颜色填充
        const color = item.color || '#000000';
        this.canvas.setFillStyle(color);
      }
      this.canvas.fill();
      this.checkDrawOver();
    },
    // 绘制矩形/圆形，校验是否绘制椭圆
    shapeDraw(ctx, item, arcImage = false) {
      return new Promise(async (resolve) => {
        const x = arcImage ? 0 : item.x;
        const y = arcImage ? 0 : item.y;
        const w = item.width;
        const h = item.height;
        const r = item?.arcR || 0;
        const strokeColor = item?.strokeColor;
        const lineWidth = item?.lineWidth;

        if (item.ellipse) {
          await this.BezierEllipse2(ctx, x + w / 2, y + h / 2, w / 2, h / 2);
        } else {
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + w, y, x + w, y + h, r);
          ctx.arcTo(x + w, y + h, x, y + h, r);
          ctx.arcTo(x, y + h, x, y, r);
          ctx.arcTo(x, y, x + w, y, r);
          ctx.closePath();
        }

        // 边框线宽度
        if (lineWidth) {
          ctx.setLineWidth(lineWidth);
        }
        // 边框线颜色
        if (strokeColor) {
          ctx.setStrokeStyle(strokeColor);
          ctx.stroke();
        }
        resolve(true);
      });
    },
    // 绘制椭圆
    BezierEllipse2(ctx, x, y, a, b) {
      return new Promise((resolve) => {
        const k = 0.5522848,
          ox = a * k, // 水平控制点偏移量
          oy = b * k; // 垂直控制点偏移量
        //从椭圆的左端点开始顺时针绘制四条三次贝塞尔曲线
        ctx.beginPath();
        ctx.moveTo(x - a, y);
        ctx.bezierCurveTo(x - a, y - oy, x - ox, y - b, x, y - b);
        ctx.bezierCurveTo(x + ox, y - b, x + a, y - oy, x + a, y);
        ctx.bezierCurveTo(x + a, y + oy, x + ox, y + b, x, y + b);
        ctx.bezierCurveTo(x - ox, y + b, x - a, y + oy, x - a, y);
        ctx.closePath();
        resolve(true);
      });
    },

    // 圆形/圆角矩形/椭圆【图片】绘制主函数
    async drawShapeImage(item) {
      this.canvasArc.clearRect(0, 0, this.canvasArcWidth, this.canvasArcHeight);
      await this.timeSleep();
      this.canvasArcWidth = item.width;
      this.canvasArcHeight = item.height;
      this.canvasArc.save();

      await this.timeSleep();

      await this.shapeDraw(this.canvasArc, item, true);

      this.canvasArc.clip();

      let w = item.width;
      let h = item.height;
      if (item.imageShapeType) {
        switch (item.imageShapeType) {
          case 'width':
            h = item.width / item.whScale;
            break;
          case 'height':
            w = item.height * item.whScale;
            break;

          default:
            if (typeof item.imageShapeType === 'number') {
              w = item.imageShapeType;
              h = w / item.whScale;
            }
            break;
        }
      }
      this.canvasArc.drawImage(item.content, item.arcX || 0, item.arcY || 0, w, h);
      this.canvasArc.draw(false, async () => {
        await this.timeSleep();
        uni.canvasToTempFilePath(
          {
            x: 0,
            y: 0,
            width: item.width,
            height: item.height,
            fileType: 'png',
            canvasId: 'canvas-arc',
            success: (res) => {
              item.content = res.tempFilePath;
              this.drawImage(item);
            },
            fail: (res) => {
              console.log(res);
            },
            complete: () => {
              this.canvasArc.restore();
              this.canvasArc.fillRect(0, 0, 0, 0);
            }
          },
          this
        );
      });
    },

    // 二维码绘制
    async drawQR(item) {
		let num =  item.content.length/16;
		if(num<4){
			num=4;
		}else if(num>40){
			num=40
		}
      const base64 = QR.createQrCodeImg(item.content, {
        size: parseInt(this.qrSize),
        typeNumber: Math.ceil(num)
      });
      // #ifdef MP-WEIXIN
      item['qr'] = await this.base64ToSave(base64, Date.now().toString());
      // #endif
      // #ifndef MP-WEIXIN
      item['qr'] = base64;
      // #endif
      this.canvas.globalAlpha = item.hasOwnProperty('globalAlpha') ? item.globalAlpha : 1;
      this.canvas.drawImage(
        item.qr,
        item.x,
        item.y,
        item.hasOwnProperty('width') ? item.width : this.width,
        item.hasOwnProperty('height') ? item.height : this.height
      );

      this.checkDrawOver();
    },
    //base64转本地图片，将数据存储在本地,小程序端兼容处理
    base64ToSave(base64data, FILE_BASE_NAME = 'tmp_base64src') {
      const fsm = uni.getFileSystemManager();
      return new Promise((resolve, reject) => {
        //format这个跟base64数据的开头对应
        const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
        if (!format) {
          reject(new Error('ERROR_BASE64SRC_PARSE'));
        }
        const filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME}.${format}`;
        this.qrCacheFileList.push(filePath);
        const buffer = wx.base64ToArrayBuffer(bodyData);
        fsm.writeFile({
          filePath,
          data: buffer,
          encoding: 'binary',
          success() {
            resolve(filePath);
          },
          fail() {
            reject(new Error('ERROR_BASE64SRC_WRITE'));
          }
        });
      });
    },
    // 制作完海报后删除本地数据,小程序端兼容处理
    removeSave(filePath) {
      // 把文件删除后再写进，防止超过最大范围而无法写入
      const fsm = uni.getFileSystemManager(); //文件管理器
      fsm.unlink({
        filePath: filePath,
        success(res) {},
        fail(e) {
          console.log('readdir文件删除失败：', e);
        }
      });
      if (this.qrCacheFileList.length) {
        this.removeSave(this.qrCacheFileList.shift());
      }
    },
    // 判断是否绘制完
    checkDrawOver() {
      if (this.listsIndex < this.listsLength) {
        // lists未画完
        this.listsIndex++;
        this.dataDrawCanvas();
      } else {
        this.canvasImage();
      }
    },

    // 绘制到画布并生成图片
    canvasImage() {
      this.listsIndex = 0;
      this.canvas.draw(false, async () => {
        await this.timeSleep(500);
        uni.canvasToTempFilePath(
          {
            x: 0,
            y: 0,
            width: Number(this.width),
            height: Number(this.height),
            fileType: this.imgType,
            canvasId: 'canvas',
            success: (res) => {
              this.$emit('canvasImage', res.tempFilePath);
              if (this.showPreview) {
                this.showPreviewFn(res.tempFilePath);
              }
            },
            fail: (res) => {
              console.log(res);
            },
            complete: () => {
              if (this.showLoading) {
                uni.hideLoading();
              }

              // #ifdef MP-WEIXIN

              if (this.qrCacheFileList.length) {
                this.removeSave(this.qrCacheFileList.shift());
              }

              // #endif
            }
          },
          this
        );
      });
    },
    // 预览图
    showPreviewFn(img) {
      uni.previewImage({
        current: 0,
        urls: [img]
      });
    },
    // 清空画布
    clearCanvas() {
      this.canvas.clearRect(0, 0, this.width, this.height);
    },
    // 延时
    timeSleep(time = 100) {
      return new Promise((resolve) => {
        let t = setTimeout(() => {
          clearTimeout(t);
          t = null;
          resolve(true);
        }, time);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.mosowe-canvas-image {
  overflow: hidden;
  .canvas-wrap-box {
    overflow: hidden;
    height: 0;
    width: 0;
    position: fixed;
    left: 200%;
    top: 0;
  }
  .canvas-wrap {
    overflow: hidden;
    height: 0;
    width: 0;
  }
}
</style>
