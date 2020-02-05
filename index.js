const superagent = require('superagent');
const moment = require('moment')
const cheerio = require('cheerio')
const formData = require('./data')

var getUrl = "https://www.wjx.cn/jq/55701614.aspx"
var url = "https://www.wjx.cn/joinnew/processjq.ashx"


//随机ip
var randomIP = `47.${63 + Math.ceil(Math.random() * 4)}.${Math.ceil(Math.random() * 255)}.${Math.ceil(Math.random() * 255)}`

console.log(getUrl.replace(/[^0-9]/ig, ""));
var params = {
    'curid': getUrl.replace(/[^0-9]/ig, ""),
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
                let data = res.text
                let $ = cheerio.load(data)
                let script = $('script')
                console.log(`html is ${script.length}`)
                params.starttime = $("#starttime").val()
                console.log(`start time is ${params.starttime}`)
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
    params.ktimes = Math.ceil(Math.random() * 20)
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
        curid: params.curid,
        submittype: params.submittype,
        source:params.source,
        t: params.t,
        starttime: params.starttime,
        ktimes: params.ktimes,
        rn: params.rn,
        rname: params.rname,
        hlv: params.hlv,
        jqnonce: params.jqnonce,
        jqsign: params.jqsign
    }


    console.log(newParams)
    
    superagent.post(url)
    .set('Content-Type','application/x-www-form-urlencoded')
    .set('Sec-Fetch-Mode','cors')
    .query(params)
    .send(formData)
    .then(res=>{
        console.log(res.text)
    })
})

