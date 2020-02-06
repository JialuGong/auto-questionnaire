const superagent = require('superagent');
//const moment = require('moment')
const cheerio = require('cheerio')
const getSubmitdata = require('./data')

var getUrl = "https://www.wjx.cn/jq/55701614.aspx"
var url = "https://www.wjx.cn/joinnew/processjq.ashx"


//随机ip
var randomIP = `47.${63 + Math.ceil(Math.random() * 4)}.${Math.ceil(Math.random() * 255)}.${Math.ceil(Math.random() * 255)}`

console.log(getUrl.replace(/[^0-9]/ig, ""));
var params = {
    'curID': getUrl.replace(/[^0-9]/ig, ""),
    'source': 'directphone',
    'submittype': 1,
    'hlv': 1,
    'rname': "testname",
    'jpm': 15
}

//获取starttime,jqnonce,rn
const getConfig = () => {
    return new Promise((resolve, reject) => {
        superagent.get(getUrl).end((err,res) => {
            if (res.status=== 200) {
                superagent.get('/cookied-page');
                let data = res.text
                let $ = cheerio.load(data)
                let script = $('script')
                params.starttime = $("#starttime").val()
                script.each(function (i, elem) {
                    let text = $(this).html()
                    if (text.match('jqnonce')) {
                        let reg = 'var jqnonce="(.*?)"';
                        params.jqnonce = text.match(reg)[1]
                    }
                    if (text.match('rndnum')) {
                        let reg = 'var rndnum="(.*?)"';
                        params.rn = text.match(reg)[1]
                    }
                    if (text.match('starttime')) {
                        let reg = 'var starttime="(.*?)"';
                        params.starttime = text.match(reg)[1]
                    }
                })
                resolve(true)
            } else {
                console.log("fetch website error,please check the network")
                reject(false)
            }
        })
    })
}

getConfig().then(res => {
    //随机生成ktimes
    params.ktimes = Math.ceil(Math.random() * 40)
    //生成jpsign
    function jqsignGenerator(ktimes, jqnonce) {
        var b = ktimes % 10
        b == 0 && (b = 1)
        console.log(jqnonce)
        for (var d = [], i = 0; i < jqnonce.length; i++) {
            var f = jqnonce.charCodeAt(i) ^ b;
            d.push(String.fromCharCode(f))
        }
        return d.join("")
    }
    params.jqsign = jqsignGenerator(params.ktimes, params.jqnonce)
    params.t = Date.now().toString() 

    var newParams = {
        submittype: params.submittype,
        curid: params.curid,
        t: params.t,
        starttime: params.starttime,
        ktimes: params.ktimes,
        rn: params.rn,
        rname: 'test',
       // source:params.source,
        hlv: params.hlv,
        jqnonce: params.jqnonce,
        jqsign: params.jqsign
    }

    getSubmitdata().then(data=>{
       console.log(`==========params are`)
       console.log(params)
       console.log(`==========formdata is`)
       console.log(data)
        superagent.post(url)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .set('Sec-Fetch-Mode', 'cors')
            .query(params)
            .send(data)
            .then(res => {
                console.log(res.text)
            })
    })
   
})

