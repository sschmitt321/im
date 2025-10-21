// Version 3.1
export class NativePopup {
    constructor(options = {}) {
        this.sysInfo = uni.getSystemInfoSync();
        const {
            bgColor = '#fff',
            titleColor = '#000',
            contentColor = "#272727",
            maskColor = 'rgba(0, 0, 0, 0.5)', // 遮罩颜色
            radius = '10px', // 圆角
            buttonSpacing = 20 // 按钮距离底部的间距
        } = options;

        this.bgColor = bgColor;
        this.titleColor = titleColor;
        this.contentColor = contentColor;
        this.maskColor = maskColor;
        this.radius = radius;
        this.buttonSpacing = buttonSpacing;
    }

    createPopup = ({
        title,
        purpose,
        description,
        tip = ['notice'],
        onCancel,
        onConfirm,
        cancelBtnColor = '#666', // 不允许按钮颜色
        confirmBtnColor = '#0389fb', // 允许按钮颜色
        showCancel = true, // 是否显示“不允许”按钮，默认显示
        showConfirm = true, // 是否显示“允许并设置”按钮，默认显示
        cancelText = '不允许', // “不允许”按钮的自定义文本
        confirmText = '允许并设置', // “允许并设置”按钮的自定义文本
        showDescription = true,
        showTip = true,
    }) => {
        const { screenWidth, screenHeight } = this.sysInfo;

        // 最大弹窗高度
        const maxPopupHeight = screenHeight * 0.8;
        const padding = 15; // 内边距
        const buttonHeight = 40; // 按钮高度
        const buttonSpacing = this.buttonSpacing;

        let contentHeight = 30; // 初始高度包含标题
        if (Array.isArray(purpose)) {
            if (purpose.length > 0) contentHeight += purpose.length * 30 + padding; // 用途说明
        } else if (purpose) {
            contentHeight += 30 + padding;
        }
        if (showDescription && Array.isArray(description)) {
            if (description.length > 0) contentHeight += description.length * 30 + padding; // 权限说明
        } else if (showDescription && description) {
            contentHeight += 30 + padding;
        }
        if (showTip && Array.isArray(tip)) {
            if (tip.length > 0) contentHeight += tip.length * 30 + padding; // 提示信息
        } else if (showTip && tip && !Array.isArray(tip)) {
            contentHeight += 50 + padding;
        }

        const popupHeight = Math.min(contentHeight + buttonHeight + buttonSpacing + padding * 2, maxPopupHeight);
        const scrollable = popupHeight === maxPopupHeight; // 是否需要滚动

        // 遮罩层
        const maskView = new plus.nativeObj.View('maskView', {
            top: 0,
            left: 0,
            width: screenWidth + 'px',
            height: screenHeight + 'px',
            backgroundColor: this.maskColor,
        });

        // 主弹窗
        const popupView = new plus.nativeObj.View('popupView', {
            top: screenHeight / 2 - popupHeight / 2 + 'px',
            left: '10%',
            width: '80%',
            height: popupHeight + 'px',
        });

        popupView.drawRect({
            color: this.bgColor,
            radius: this.radius,
        }, {
            top: '0px',
            left: '0px',
            width: '100%',
            height: '100%',
        });

        // 标题
        popupView.drawText(title || '系统权限申请', {
            top: padding + 'px',
            left: padding + 'px',
            width: screenWidth * 0.8 - padding * 2 + 'px',
            height: '30px',
        }, {
            size: "18px",
            weight: "bold",
            align: "center",
            color: this.titleColor,
        });

        // 用途说明
        let currentTop = padding + 40;
        if (Array.isArray(purpose)) {
            purpose.forEach((line) => {
                popupView.drawText(line, {
                    top: currentTop + 'px',
                    left: padding + 'px',
                    width: screenWidth * 0.8 - padding * 2 + 'px',
                    height: '25px',
                }, {
                    size: "15px",
                    align: "center",
					weight: "bold",
                    color: this.contentColor,
                });
                currentTop += 20;
            });
            if (purpose.length > 0) currentTop += padding;
        } else if (purpose) {
            popupView.drawText(purpose, {
                top: currentTop + 'px',
                left: padding + 'px',
                width: screenWidth * 0.8 - padding * 2 + 'px',
                height: '25px',
            }, {
                size: "15px",
                align: "center",
                color: this.contentColor,
            });
            currentTop += 20 + padding;
        }

        // 权限说明
        if (showDescription) {
            if (Array.isArray(description)) {
                description.forEach((line) => {
                    popupView.drawText(line, {
                        top: currentTop + 'px',
                        left: padding + 'px',
                        width: screenWidth * 0.8 - padding * 2 + 'px',
                        height: '30px',
                    }, {
                        size: "12px",
                        align: "left",
						weight: "bold",
                        color: this.contentColor,
                    });
                    currentTop += 30;
                });
                if (description.length > 0) currentTop += padding;
            } else if (description) {
                popupView.drawText(description, {
                    top: currentTop + 'px',
                    left: padding + 'px',
                    width: screenWidth * 0.8 - padding * 2 + 'px',
                    height: '30px',
                }, {
                    size: "12px",
                    align: "left",
					weight: "bold",
                    color: this.contentColor,
                });
                currentTop += 30 + padding;
            }
        }

        // 提示信息
        if (showTip) {
            if (Array.isArray(tip)) {
                tip.forEach((line) => {
                    popupView.drawText(line, {
                        top: currentTop + 'px',
                        left: padding + 'px',
                        width: screenWidth * 0.8 - padding * 2 + 'px',
                        height: '50px',
                    }, {
                        size: "12px",
                        align: "left",
						weight: "bold",
                        color: this.contentColor,
                    });
                    currentTop += 30;
                });
                if (tip.length > 0) currentTop += padding;
            } else if (tip) {
                popupView.drawText(tip, {
                    top: currentTop + 'px',
                    left: padding + 'px',
                    width: screenWidth * 0.8 - padding * 2 + 'px',
                    height: '50px',
                }, {
                    size: "12px",
                    align: "left",
					weight: "bold",
                    color: this.contentColor,
                });
                currentTop += 50 + padding;
            }
        }

        // 滚动内容区域
        if (scrollable) {
            popupView.drawRect({
                color: this.bgColor,
            }, {
                top: padding + 'px',
                left: padding + 'px',
                width: screenWidth * 0.8 - padding * 2 + 'px',
                height: maxPopupHeight - buttonHeight - buttonSpacing - padding * 2 + 'px',
            });
        }

        // 按钮布局
        const cancelBtnLeft = padding;
        const cancelBtnWidth = (screenWidth * 0.8 - padding * 3) / 2;
        const cancelBtnTop = popupHeight - buttonHeight - buttonSpacing;
        const confirmBtnLeft = cancelBtnLeft + cancelBtnWidth + padding;

        if (showCancel && !showConfirm) {
            popupView.drawRect({
                color: cancelBtnColor,
                radius: this.radius,
            }, {
                top: cancelBtnTop + 'px',
                left: (screenWidth * 0.8 - cancelBtnWidth) / 2 + 'px',
                width: cancelBtnWidth + 'px',
                height: buttonHeight + 'px',
            });

            popupView.drawText(cancelText, {
                top: cancelBtnTop + 'px',
                left: (screenWidth * 0.8 - cancelBtnWidth) / 2 + 'px',
                width: cancelBtnWidth + 'px',
                height: buttonHeight + 'px',
            }, {
                size: "14px",
                align: "center",
                color: '#fff',
            });
        } else if (showCancel) {
            popupView.drawRect({
                color: cancelBtnColor,
                radius: this.radius,
            }, {
                top: cancelBtnTop + 'px',
                left: cancelBtnLeft + 'px',
                width: cancelBtnWidth + 'px',
                height: buttonHeight + 'px',
            });

            popupView.drawText(cancelText, {
                top: cancelBtnTop + 'px',
                left: cancelBtnLeft + 'px',
                width: cancelBtnWidth + 'px',
                height: buttonHeight + 'px',
            }, {
                size: "14px",
                align: "center",
                color: '#fff',
            });
        }

        if (showConfirm && !showCancel) {
            popupView.drawRect({
                color: confirmBtnColor,
                radius: this.radius,
            }, {
                top: cancelBtnTop + 'px',
                left: (screenWidth * 0.8 - cancelBtnWidth) / 2 + 'px',
                width: cancelBtnWidth + 'px',
                height: buttonHeight + 'px',
            });

            popupView.drawText(confirmText, {
                top: cancelBtnTop + 'px',
                left: (screenWidth * 0.8 - cancelBtnWidth) / 2 + 'px',
                width: cancelBtnWidth + 'px',
                height: buttonHeight + 'px',
            }, {
                size: "14px",
                align: "center",
                color: '#fff',
            });
        } else if (showConfirm) {
            popupView.drawRect({
                color: confirmBtnColor,
                radius: this.radius,
            }, {
                top: cancelBtnTop + 'px',
                left: confirmBtnLeft + 'px',
                width: cancelBtnWidth + 'px',
                height: buttonHeight + 'px',
            });

            popupView.drawText(confirmText, {
                top: cancelBtnTop + 'px',
                left: confirmBtnLeft + 'px',
                width: cancelBtnWidth + 'px',
                height: buttonHeight + 'px',
            }, {
                size: "14px",
                align: "center",
                color: '#fff',
            });
        }

        popupView.addEventListener('touchstart', (e) => {
            const { clientX: x, clientY: y } = e;

            if (
                showCancel &&
                x >= cancelBtnLeft &&
                x <= cancelBtnLeft + cancelBtnWidth &&
                y >= cancelBtnTop &&
                y <= cancelBtnTop + buttonHeight
            ) {
                onCancel && onCancel();
                this.close();
                return;
            }

            if (
                showConfirm &&
                x >= confirmBtnLeft &&
                x <= confirmBtnLeft + cancelBtnWidth &&
                y >= cancelBtnTop &&
                y <= cancelBtnTop + buttonHeight
            ) {
                onConfirm && onConfirm();
                this.close();
                return;
            }
        });

        this.maskView = maskView;
        this.popupView = popupView;

        return { maskView, popupView };
    };

    show = (options = {}) => {
        this.close(); // 关闭已有弹窗
		// const platform = plus.os.name.toLowerCase(); // 获取平台名称
		// if (platform === 'ios') {
		// 	const isPrivacy = uni.getStorageSync("isPrivacy");
		// 	if(!isPrivacy){
		// 		uni.reLaunch({
		// 			url:"/pages/login/privacy"
		// 		})
		// 		return false;
		// 	}
		// }
        // 动态生成弹窗
        const { maskView, popupView } = this.createPopup(options);

        // 显示遮罩和弹窗
        maskView.show();
        popupView.show();
    };

    close = () => {
        if (this.popupView) {
            this.popupView.close();
            this.popupView = null;
        }
        if (this.maskView) {
            this.maskView.close();
            this.maskView = null;
        }
    };
}

export const popup = new NativePopup();
