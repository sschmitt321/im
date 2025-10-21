export interface MosoweCanvasListItem {
  type: 'image' | 'text' | 'shape' | 'qr';
  x: number;
  y: number;
  content?: string;
  width?: number;
  height?: number;
  ellipse?: boolean; // 是否椭圆，宽高来定椭圆大小
  gradient?: any[]; // 渐变，二维数组，格式：[[0, 'red'],[1, 'purple']]，第一个值取值范围0~1，第二个值为颜色
  gradientType?: 'liner' | 'circular'; // 渐变类型，liner水平，circular中心
  imageShapeType?: 'cover' | 'width' | 'height' | number; // 图形裁剪图片中，图片的渲染方式，默认cover铺满，width以100%宽等比缩放，height以100%高等比缩放
  arcX?: number; // 圆形/(圆角)矩形图片时，图片在裁剪区域定位X
  arcY?: number; // 圆形/(圆角)矩形图片时，图片在裁剪区域定位Y
  arcR?: number; // 圆形/圆角半径，默认0
  color?: string; // 图形填充颜色，文本文字颜色
  size?: number; // 文本大小
  align?: 'left' | 'right' | 'center'; // 文本对其方式
  maxWidth?: number; // 文本内容最大宽度，文本超出会被压缩
  file?: any; // 本地选择的file文件
  globalAlpha?: number; // 透明度
  strokeColor?: string; // 边框颜色
  lineWidth?: number; // 边框宽度
  font?: string; // 文本属性综合，会覆盖size
}
