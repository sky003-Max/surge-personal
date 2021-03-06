/*
Check in for Surge by Neurogram
使用说明：https://www.notion.so/neurogram/Check-in-0797ec9f9f3f445aae241d7762cf9d8b
*/

const accounts = [
    ["N3RO", "https://n3ro.best/auth/login", "", ""]
]

async function launch() {
    for (var i in accounts) {
        let title = accounts[i][0]
        let url = accounts[i][1]
        let email = accounts[i][2]
        let password = accounts[i][3]
        await login(url, email, password, title)
    }
    $done();
}

launch()

function login(url, email, password, title) {
    let loginPath = url.indexOf("auth/login") != -1 ? "auth/login" : "user/_login.php"
    let table = {
        url: url.replace(/(auth|user)\/login(.php)*/g, "") + loginPath,
        header: {

        },
        body: {
            "email": email,
            "passwd": password,
            "rumber-me": "week"
        }
    }
    $httpClient.post(table, async function (error, response, data) {
        if (error) {
            console.log(error);
            $notification.post(title + '登录失败', error, "");
        } else {
            await checkin(url, title)
        }
    }
    );
}

function checkin(url, title) {
    let checkinPath = url.indexOf("auth/login") != -1 ? "user/checkin" : "user/_checkin.php"
    $httpClient.post(url.replace(/(auth|user)\/login(.php)*/g, "") + checkinPath, async function (error, response, data) {
        if (error) {
            console.log(error);
            $notification.post(title + '签到失败', error, "");
        } else {
            await dataResults(url, JSON.parse(data).msg, title)
        }
    });
}

function dataResults(url, checkinMsg, title) {
    let userPath = url.indexOf("auth/login") != -1 ? "user" : "user/index.php"
    $httpClient.get(url.replace(/(auth|user)\/login(.php)*/g, "") + userPath, function (error, response, data) {
        var usedData = data.match(/[0-9\.]*? CNY/) 
        if (usedData) {
            var restData = data.match(/"card-tag tag-green" id="remain">(.*)<\/code>/)
            var usrvip = data.match(/<dd>VIP ([0-9])<\/dd>/)
            var device = data.match(/([0-9\.]*?) \/ 不限制/)
            var nextdata = data.match(/等级到期时间 (.*)<\/div>/)
            var todayuse = data.match(/card-tag tag-red">(.*)<\/code>/)
            var totaluse = data.match(/"card-tag tag-orange">(.*)<\/code>/)
            $notification.post("尊敬的"+title+"VIP"+usrvip[1]+"会员", checkinMsg, "账户余额：" + usedData +"\n今日已用："+ todayuse[1]+"\n总共使用:"+totaluse[1]+"\n剩余流量：" + restData[1] +"\n在线设备："+device[1]+"\n等级到期："+nextdata[1]);
        } else {
            $notification.post(title + '获取流量信息失败', "", "");
        }
    });
}