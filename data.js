//const FormData = require('form-data')
const fs=require('fs')
var submitdata = ""
fs.readFile('./your_config.json',(err,data)=>{
    if(err){
        console.error(err)
    }else{
        var dataJson=JSON.parse(data.toString())   
        var i=0;
        for(var element in dataJson){
            submitdata+=++i+'$'+dataJson[element]+'}'
        }
        submitdata=submitdata.substring(0,submitdata.length-1)
    }
})
var formData={"submitdata": submitdata}


module.exports=formData
