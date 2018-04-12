var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '13817011678zxc',
    database : 'tinko'
});
connection.connect();

var insertPrivateChat = 'INSERT INTO privateChat(fromId,toId,msg) VALUES(?,?,?)',
    insertActivityChat = 'INSERT INTO meetingChat(fromId,msg) VALUES(?,?)';
var unReadPrivateChat = 'INSERT INTO privateChat(fromId,toId,msg,status) VALUES(?,?,?,?)';

function insertSql(sqlStr,addSqlParams) {
    connection.query(sqlStr,addSqlParams,function (err, result) {
        if(err){
            console.log('[INSERT ERROR] - ',err.message);
            return;
        }
    });
}

app.get('/', function(req, res){
    res.sendFile(__dirname + '/socket2.html');
});
app.get('/README', function(req, res){
    res.sendFile(__dirname + '/README.html');
});
app.get('/test', function(req, res){
    res.sendFile(__dirname + '/test.html');
});

// system = 0
// privateChat = 1
// activityChat = 2

var currentTime = Date.parse( new Date());
setTimeout(function(){
    currentTime = Date.parse( new Date());
},1000);

var activityList = {},
    currentUser = {};

var onlineUser = {};

io.on('connection', function(socket){

    var userId;

    //在线用户
    socket.on('userLogin',function (uid) {
        userId = uid;
        var uidStatus = onlineUser[uid];
        if (uidStatus===undefined){
            //说明没有重复登录
            onlineUser[uid] = 1;
        }else{
            onlineUser[uid] = (uidStatus+1);
        }
        console.log(uid+" is login");
        if (!(uid in currentUser)){
            currentUser[uid] = [];
            //未读消息
            connection.query("SELECT * FROM privateChat WHERE status = 1 and toId = "+uid, function (err, result, fields) {
                console.log(result);
            });
            connection.query("UPDATE privateChat SET privateChat.status = 0 WHERE privateChat.toId = '"+uid+"' and privateChat.status = 1", function (err, result) {
                if (err) throw err;
                console.log(result.affectedRows + " record(s) updated");
            });
        }
    });

    socket.on('createNewActivity',function (activityId,fromId) {
        activityList[activityId] = [fromId];
        currentUser[fromId].push(activityId);
        io.emit("connect"+fromId,generateData(2,fromId,"新活动创建好啦",activityId))
    });

    //私聊接口
    socket.on('privateChat',function(fromId,toId,msg){
        console.log("fromId " + fromId);
        if (toId in currentUser){
            insertSql(insertPrivateChat,[fromId,toId,msg]);
        }else{
            insertSql(unReadPrivateChat,[fromId,toId,msg,1]);
        }
        io.emit("connect"+toId,generateData(1,fromId,msg));
        io.emit("mySendBox"+fromId,generateData(1,toId,msg));
    });

    //活动聊天接口
    socket.on('activityChat',function(activityId,fromId,msg){
        var activity = activityList[activityId];
        insertSql(insertActivityChat,[fromId,msg]);
        //给所有这个活动里的在线用户推送消息
        for (var i = 0; i <activity.length;i++){
            console.log("push to " + activity[i]);
            io.emit("connect"+activity[i],generateData(2,fromId,msg,activityId));
        }
        io.emit("connect"+fromId,generateData(2,fromId,"新活动创建好啦",activityId));
    });

    socket.on('joinANewMeet',function (activityId,id) {
        console.log(activityId);
        console.log(id);
        console.log(id + "建立了" + activityId);
        io.emit("connect"+id,generateData(2,"system","欢迎来到这个活动",activityId));
    });

    //登陆后立刻操作，给服务器目前参加的活动的id
    socket.on('attendActivity',function (uid,myActivity) {
        for(var i = 0;i<myActivity.length;i++ ){
            var activity = myActivity[i];
            //判断是否活跃活动列表有这个活动，有的话把这个在线用户插入。没有的话创建这个新的活动列表
            if (activity in activityList){
                if (activityList[activity].indexOf(uid)===-1){
                    activityList[activity].push(uid);
                }
            }else{
                activityList[activity] = [uid];
            }
            //在个人事务里插入活动key
            currentUser[uid].push(activity);
        }
    });
    //这里是系统消息 需要判断用户
    socket.on('system',function(uid,token,msg){
        io.emit("systemListener",generateData(0,"system",msg));
    });
    socket.on('disconnect', function() {
        //从活动序列里删除自己
        if (userId!==""){
            var uidStatus = onlineUser[userId];
            if (uidStatus!==1){
                onlineUser[userId] = (uidStatus-1);
            }else{
                delete onlineUser[userId];
            }
        }
    });
});

Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

function generateData(type,from,message,activityId){
    var response;
    if (activityId === undefined){
        response = {
            type:type,
            from:from,
            message:message,
            time:currentTime
        };
    }else{
        response = {
            type:type,
            from:from,
            message:message,
            time:currentTime,
            activityId:activityId
        };
    }
    return JSON.stringify(response);
}

http.listen(3000, function(){
    console.log('listening on *:3000');
});
