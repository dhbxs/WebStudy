// pages/test/test.js
const app = getApp();
// const util = require('../../utils/util.js');
const db = wx.cloud.database();
const _ = db.command;
Page({
    /**
     * 页面的初始数据
     */
    data: {
        showOrHidden1: false,
        showOrHidden2: false,
        showOrHidden3: false,
        nullHouse: true, //先设置隐藏
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.ctx = wx.createCameraContext();
        wx.getLocation({
            type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
            success: function (res) {
            }
        });
    },

    //踩动画
    caiAnimation() {
        this.setData({
            showOrHidden1: (!this.data.showOrHidden1)
        });
        var animation = wx.createAnimation({
            duration: 2000,
            timingFunction: 'ease',
        });
        animation.opacity(1).step()
        this.setData({
            ani1: animation.export()
        })
        setTimeout(function () {
            animation.opacity(1).step(),
                this.setData({
                    ani1: animation.export(),
                    showOrHidden1: (!this.data.showOrHidden1)
                })
        }.bind(this), 2000)
    },

    //点赞动画
    zanAnimation() {
        this.setData({
            showOrHidden2: (!this.data.showOrHidden2)
        });
        var animation = wx.createAnimation({
            duration: 2000,
            timingFunction: 'ease',
        });
        animation.opacity(1).scale(1.5).step()
        animation.opacity(0).scale(0.5).step({
            duration: 2000
        })
        this.setData({
            ani2: animation.export()
        })
        setTimeout(function () {
            animation.opacity(1).scale(1).step()
            this.setData({
                ani2: animation.export(),
                showOrHidden2: (!this.data.showOrHidden2)
            })
        }.bind(this), 4000)
        console.log('动画结束');
    },

    //举报动画
    jubaoAnimation() {
        this.setData({
            showOrHidden3: (!this.data.showOrHidden3)
        });
        var animation = wx.createAnimation({
            duration: 4000,
            timingFunction: 'ease',
        });
        animation.opacity(1).translate(100, 200).scale(1.5).step()
        this.setData({
            ani3: animation.export()
        })
        setTimeout(function () {
            animation.opacity(1).translate(0, 0).scale(1).step()
            this.setData({
                ani3: animation.export(),
                showOrHidden3: (!this.data.showOrHidden3)
            })
        }.bind(this), 4000)
        console.log('动画结束');
    },

    cai: function () {
        var that = this; //调用this
        this.ctx.takePhoto({
            quality: 'low',
            success: (res) => {
                wx.showLoading({
                    title: '正在识别中',
                    mask: true
                });
                wx.getFileSystemManager().readFile({
                    filePath: res.tempImagePath, //选择图片返回的相对路径
                    encoding: 'base64', //编码格式
                    success: res => { //成功的回调
                        var imgbase64 = res.data;
                        var imgstring = "data:image/jpg;base64," + imgbase64;
                        var cartyp = "";
                        var plate = "";
                        var p_reg = 0;
                        var car_reg = 0;
                        //------------------------地理位置star---------------------------
                        wx.getLocation({
                            type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                            success: function (res) {
                                var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                                var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                                var time = util.formatTime(new Date());
                                wx.request({
                                    url: "https://ocrcp.market.alicloudapi.com/rest/160601/ocr/ocr_vehicle_plate.json",
                                    data: {
                                        "image": imgbase64,
                                        "configure": "{\"multi_crop\":false}"
                                    },
                                    header: {
                                        "Authorization": "APPCODE 83ab2fedcaca48279b61d958721be4eb",
                                        "Content-Type": "application/json",
                                    },
                                    enableCache: false,
                                    enableHttp2: true,
                                    enableQuic: true,
                                    method: "POST",
                                    timeout: 3000,
                                    success: (result) => {
                                        console.log(result);
                                        if (result.data.plates != undefined) {
                                            cartyp = result.data.plates[0].cls_name;
                                            plate = result.data.plates[0].txt;
                                            p_reg = car_reg = result.data.plates[0].prob;
                                            console.log(result.data);
                                            console.log(cartyp, car_reg, p_reg, plate);
                                            db.collection('tgame').add({
                                                data: {
                                                    "member": app.globalData.userInfo.nickName,
                                                    "shtime": time,
                                                    "cox": latitude,
                                                    "coy": longitude,
                                                    "eva": '踩',
                                                    "img": imgstring,
                                                    "cartyp": cartyp,
                                                    "plate": plate,
                                                    "p_reg": p_reg,
                                                    "car_reg": car_reg,
                                                },
                                                success: res => {
                                                    console.log(res);
                                                    app.globalData.pohto_id = res._id;
                                                    console.log(app.globalData.pohto_id);
                                                    wx.hideLoading(); //关闭showLoading
                                                    // that.cai(); //z执行动画
                                                    // that.dan();
                                                    //弹窗
                                                    // that.clickArea();
                                                    var info = "车辆类型:" + cartyp + "\n车牌号:" + plate;
                                                    wx.showModal({
                                                        title: '评价成功',
                                                        content: info,
                                                        showCancel: false,
                                                        confirmText: '确定',
                                                        success: function (res) {
                                                            plate_str = plate.toString;
                                                            // console.log(plate);
                                                            that.caiAnimation();
                                                            db.collection('car').doc(plate).get({
                                                                success: function (res) {
                                                                    db.collection('car').doc(plate_str).update({
                                                                        data: {
                                                                            score: _.inc(-5),
                                                                        }
                                                                    });
                                                                },
                                                                fail: function (err) {
                                                                    console.log("刚开始没有车牌");
                                                                    console.log(plate);
                                                                    db.collection('car').add({
                                                                        data: {
                                                                            "plate": plate,
                                                                            "time": time,
                                                                            "score": -1,
                                                                        },
                                                                    });
                                                                },
                                                            });
                                                            setTimeout(function () {
                                                                //要延时执行的代码
                                                                db.collection('car').doc(plate).get({
                                                                    success: function (res) {
                                                                        var score = res.data.score;
                                                                        var info = "该车辆当前分数为：" + score;
                                                                        wx.showModal({
                                                                            title: plate + '分数',
                                                                            content: info,
                                                                            showCancel: false,
                                                                            confirmText: '确定',
                                                                        });
                                                                    },
                                                                    fail: function (err) {
                                                                        console.log("没找到");
                                                                    },
                                                                });
                                                            }, 1000);
                                                        },
                                                    })
                                                    console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id);
                                                },
                                                fail: err => {
                                                    console.error('[数据库] [新增记录] 失败：', err);
                                                },
                                            });
                                        } else {
                                            wx.hideLoading(); //关闭showLoading
                                            var info = "相片中车牌无法识别，请重试！";
                                            wx.showModal({
                                                title: '评价失败',
                                                content: info,
                                                showCancel: false,
                                                confirmText: '确定',
                                            })
                                            console.log(res);
                                        }
                                    },
                                    fail: (err) => {
                                        wx.hideLoading(); //关闭showLoading
                                        var info = "相片中车牌无法识别，请重试！";
                                        wx.showModal({
                                            title: '评价失败',
                                            content: info,
                                            showCancel: false,
                                            confirmText: '确定',
                                        })
                                        console.log(res);
                                    },
                                });
                            },
                            fail: (err) => {
                                wx.hideLoading(); //关闭showLoading
                                var info = "GPS未打开，请重试！";
                                wx.showModal({
                                    title: '评价失败',
                                    content: info,
                                    showCancel: false,
                                    confirmText: '确定',
                                    success: function (res) {
                                        wx.chooseLocation({
                                            // success: function (res) {
                                            //     var latitude = res.latitude
                                            //     var longitude = res.longitude;
                                            // }
                                        });
                                    }
                                })
                                console.log(err);
                            },
                        });
                    },
                });
            },
        });
    },

    zan: function () {
        var that = this; //调用this
        this.ctx.takePhoto({
            quality: 'low',
            success: (res) => {
                wx.showLoading({
                    title: '正在识别中',
                    mask: true
                });
                wx.getFileSystemManager().readFile({
                    filePath: res.tempImagePath, //选择图片返回的相对路径
                    encoding: 'base64', //编码格式
                    success: res => { //成功的回调
                        var imgbase64 = res.data;
                        var imgstring = "data:image/jpg;base64," + imgbase64;
                        var cartyp = "";
                        var plate = "";
                        var p_reg = 0;
                        var car_reg = 0;
                        //------------------------地理位置star---------------------------
                        wx.getLocation({
                            type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                            success: function (res) {
                                var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                                var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                                var time = util.formatTime(new Date());
                                const db = wx.cloud.database();
                                wx.request({
                                    url: "https://ocrcp.market.alicloudapi.com/rest/160601/ocr/ocr_vehicle_plate.json",
                                    data: {
                                        "image": imgbase64,
                                        "configure": "{\"multi_crop\":false}"
                                    },
                                    header: {
                                        "Authorization": "APPCODE 83ab2fedcaca48279b61d958721be4eb",
                                        "Content-Type": "application/json",
                                    },
                                    enableCache: false,
                                    enableHttp2: true,
                                    enableQuic: true,
                                    method: "POST",
                                    timeout: 3000,
                                    success: (result) => {
                                        console.log(result);
                                        if (result.data.plates != undefined) {
                                            cartyp = result.data.plates[0].cls_name;
                                            plate = result.data.plates[0].txt;
                                            p_reg = car_reg = result.data.plates[0].prob;
                                            console.log(result.data);
                                            console.log(cartyp, car_reg, p_reg, plate);
                                            db.collection('tgame').add({
                                                data: {
                                                    "member": app.globalData.userInfo.nickName,
                                                    "shtime": time,
                                                    "cox": latitude,
                                                    "coy": longitude,
                                                    "eva": '赞',
                                                    "img": imgstring,
                                                    "cartyp": cartyp,
                                                    "plate": plate,
                                                    "p_reg": p_reg,
                                                    "car_reg": car_reg,
                                                },
                                                success: res => {
                                                    console.log(res);
                                                    app.globalData.pohto_id = res._id;
                                                    console.log(app.globalData.pohto_id);
                                                    wx.hideLoading(); //关闭showLoading
                                                    // that.cai(); //z执行动画
                                                    // that.dan();
                                                    //弹窗
                                                    // that.clickArea();
                                                    var info = "车辆类型:" + cartyp + "\n车牌号:" + plate;
                                                    wx.showModal({
                                                        title: '评价成功',
                                                        content: info,
                                                        showCancel: false,
                                                        confirmText: '确定',
                                                        success: function (res) {
                                                            plate_str = plate.toString;
                                                            // console.log(plate);
                                                            that.zanAnimation();
                                                            db.collection('car').doc(plate_str).get({
                                                                success: function (res) {
                                                                    db.collection('car').doc(plate_str).update({
                                                                        data: {
                                                                            score: _.inc(2),
                                                                        }
                                                                    });
                                                                },
                                                                fail: function (err) {
                                                                    console.log("刚开始没有车牌");
                                                                    console.log(plate);
                                                                    db.collection('car').add({
                                                                        data: {
                                                                            "plate": plate,
                                                                            "time": time,
                                                                            "score": 1,
                                                                        },
                                                                    });
                                                                },
                                                            });
                                                            setTimeout(function () {
                                                                //要延时执行的代码
                                                                db.collection('car').doc(plate_str).get({
                                                                    success: function (res) {
                                                                        var score = res.data.score;
                                                                        var info = "该车辆当前分数为：" + score;
                                                                        wx.showModal({
                                                                            title: plate + '分数',
                                                                            content: info,
                                                                            showCancel: false,
                                                                            confirmText: '确定',
                                                                        });
                                                                    },
                                                                    fail: function (err) {
                                                                        console.log("没找到");
                                                                    },
                                                                });
                                                            }, 1000);
                                                        },
                                                    })
                                                    console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id);
                                                },
                                                fail: err => {
                                                    console.error('[数据库] [新增记录] 失败：', err);
                                                },
                                            });
                                        } else {
                                            wx.hideLoading(); //关闭showLoading
                                            var info = "相片中车牌无法识别，请重试！";
                                            wx.showModal({
                                                title: '评价失败',
                                                content: info,
                                                showCancel: false,
                                                confirmText: '确定',
                                            })
                                            console.log(res);
                                        }
                                    },
                                    fail: (err) => {
                                        wx.hideLoading(); //关闭showLoading
                                        var info = "相片中车牌无法识别，请重试！";
                                        wx.showModal({
                                            title: '评价失败',
                                            content: info,
                                            showCancel: false,
                                            confirmText: '确定',
                                        })
                                        console.log(res);
                                    },
                                });
                            },
                            fail: (err) => {
                                wx.hideLoading(); //关闭showLoading
                                var info = "GPS未打开，请重试！";
                                wx.showModal({
                                    title: '评价失败',
                                    content: info,
                                    showCancel: false,
                                    confirmText: '确定',
                                    success: function (res) {
                                        wx.chooseLocation({
                                            // success: function (res) {
                                            //     var latitude = res.latitude
                                            //     var longitude = res.longitude;
                                            // }
                                        });
                                    }
                                })
                                console.log(err);
                            },
                        });
                    },
                });
            },
        });
    },

    jubao: function () {
        var that = this; //调用this
        this.ctx.takePhoto({
            quality: 'low',
            success: (res) => {
                wx.showLoading({
                    title: '正在识别中',
                    mask: true
                });
                wx.getFileSystemManager().readFile({
                    filePath: res.tempImagePath, //选择图片返回的相对路径
                    encoding: 'base64', //编码格式
                    success: res => { //成功的回调
                        var imgbase64 = res.data;
                        var imgstring = "data:image/jpg;base64," + imgbase64;
                        var cartyp = "";
                        var plate = "";
                        var p_reg = 0;
                        var car_reg = 0;
                        //------------------------地理位置star---------------------------
                        wx.getLocation({
                            type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                            success: function (res) {
                                var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                                var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                                var time = util.formatTime(new Date());
                                const db = wx.cloud.database();
                                wx.request({
                                    url: "https://ocrcp.market.alicloudapi.com/rest/160601/ocr/ocr_vehicle_plate.json",
                                    data: {
                                        "image": imgbase64,
                                        "configure": "{\"multi_crop\":false}"
                                    },
                                    header: {
                                        "Authorization": "APPCODE 83ab2fedcaca48279b61d958721be4eb",
                                        "Content-Type": "application/json",
                                    },
                                    enableCache: false,
                                    enableHttp2: true,
                                    enableQuic: true,
                                    method: "POST",
                                    timeout: 3000,
                                    success: (result) => {
                                        console.log(result);
                                        if (result.data.plates != undefined) {
                                            cartyp = result.data.plates[0].cls_name;
                                            plate = result.data.plates[0].txt;
                                            p_reg = car_reg = result.data.plates[0].prob;
                                            console.log(result.data);
                                            console.log(cartyp, car_reg, p_reg, plate);
                                            db.collection('tgame').add({
                                                data: {
                                                    "member": app.globalData.userInfo.nickName,
                                                    "shtime": time,
                                                    "cox": latitude,
                                                    "coy": longitude,
                                                    "eva": '举报',
                                                    "img": imgstring,
                                                    "cartyp": cartyp,
                                                    "plate": plate,
                                                    "p_reg": p_reg,
                                                    "car_reg": car_reg,
                                                },
                                                success: res => {
                                                    console.log(res);
                                                    app.globalData.pohto_id = res._id;
                                                    console.log(app.globalData.pohto_id);
                                                    wx.hideLoading(); //关闭showLoading
                                                    // that.cai(); //z执行动画
                                                    // that.dan();
                                                    //弹窗
                                                    // that.clickArea();
                                                    var info = "车辆类型:" + cartyp + "\n车牌号:" + plate;
                                                    wx.showModal({
                                                        title: '评价成功',
                                                        content: info,
                                                        showCancel: false,
                                                        confirmText: '确定',
                                                        success: function (res) {
                                                            plate_str = plate.toString;
                                                            // console.log(plate);
                                                            that.jubaoAnimation();
                                                            db.collection('car').doc(plate_str).get({
                                                                success: function (res) {
                                                                    db.collection('car').doc(plate_str).update({
                                                                        data: {
                                                                            score: _.inc(-10),
                                                                        }
                                                                    });
                                                                },
                                                                fail: function (err) {
                                                                    console.log("刚开始没有车牌");
                                                                    console.log(plate);
                                                                    db.collection('car').add({
                                                                        data: {
                                                                            "plate": plate,
                                                                            "time": time,
                                                                            "score": -5,
                                                                        },
                                                                    });
                                                                },
                                                            });
                                                            setTimeout(function () {
                                                                //要延时执行的代码
                                                                db.collection('car').doc(plate_str).get({
                                                                    success: function (res) {
                                                                        var score = res.data.score;
                                                                        var info = "该车辆当前分数为：" + score;
                                                                        wx.showModal({
                                                                            title: plate + '分数',
                                                                            content: info,
                                                                            showCancel: false,
                                                                            confirmText: '确定',
                                                                        });
                                                                    },
                                                                    fail: function (err) {
                                                                        console.log("没找到");
                                                                    },
                                                                });
                                                            }, 1000);
                                                        },
                                                    })
                                                    console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id);
                                                },
                                                fail: err => {
                                                    console.error('[数据库] [新增记录] 失败：', err);
                                                },
                                            });
                                        } else {
                                            wx.hideLoading(); //关闭showLoading
                                            var info = "相片中车牌无法识别，请重试！";
                                            wx.showModal({
                                                title: '评价失败',
                                                content: info,
                                                showCancel: false,
                                                confirmText: '确定',
                                            })
                                            console.log(res);
                                        }
                                    },
                                    fail: (err) => {
                                        wx.hideLoading(); //关闭showLoading
                                        var info = "相片中车牌无法识别，请重试！";
                                        wx.showModal({
                                            title: '评价失败',
                                            content: info,
                                            showCancel: false,
                                            confirmText: '确定',
                                        })
                                        console.log(res);
                                    },
                                });
                            },
                            fail: (err) => {
                                wx.hideLoading(); //关闭showLoading
                                var info = "GPS未打开，请重试！";
                                wx.showModal({
                                    title: '评价失败',
                                    content: info,
                                    showCancel: false,
                                    confirmText: '确定',
                                    success: function (res) {
                                        wx.chooseLocation({
                                            // success: function (res) {
                                            //     var latitude = res.latitude
                                            //     var longitude = res.longitude;
                                            // }
                                        });
                                    }
                                })
                                console.log(err);
                            },
                        });
                    },
                });
            },
        });
    },
})