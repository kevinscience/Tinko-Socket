let app = require('express')();
let http = require('http').Server(app);
let mysql      = require('mysql');
let connection = mysql.createConnection({
    host     : '47.89.187.42',
    user     : 'root',
    password : 'password',
    database : 'tinko'
});
connection.connect();
let bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

//获取群聊天记录
app.post('/getChatHistory',function (req, res) {
    let meetId = (req.body.meetId)?req.body.meetId:-1,
        lastId = (req.body.lastId)?req.body.lastId:-1,
        limit = (req.body.limit)?req.body.limit:15;
    if (meetId!==-1){
        let checkSql = "";
        if (parseInt(lastId)===-1){
            checkSql = "select * from meetingChat WHERE meetId = '"+meetId+"' order by id desc LIMIT "+limit
        }else{
            checkSql = "select * from meetingChat WHERE meetId = '"+meetId+"' and id < "+lastId+" order by id desc LIMIT "+limit
        }
        connection.query(checkSql, function (err, result, fields) {
            if (err) { console.log(err);return;}
            console.log("发送请求:",(new Date()));
            res.send(JSON.stringify({
                status:0,
                data:result
            }))
        });
    }else{
        console.log("发送请求:",(new Date()));
        res.send(JSON.stringify({
            status:1
        }))
    }
});

app.get('/test',function (req, res) {
    res.send("hello");
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
