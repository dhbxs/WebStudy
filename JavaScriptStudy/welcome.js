window.onload = function () {
    let date = new Date();
    setInterval(function () {
        let myDate = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hours: date.getHours(),
            minutes: date.getMinutes(),
            seconds: date.getSeconds()
        };
        let div = document.querySelector("div");
        div.innerHTML = "欢迎，现在是" + myDate.year + "年" + myDate.month + "月" + myDate.day + "日" + myDate.hours + "时" + myDate.minutes + "分" + myDate.seconds + "秒";
    }, 1000);
};

