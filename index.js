let admin = require('firebase-admin');

let defaultApp = admin.initializeApp({
    credential: admin.credential.cert({
        projectId: "tinko-64673",
        clientEmail: 'firebase-adminsdk-yya1u@tinko-64673.iam.gserviceaccount.com',
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC3JEPhyeiweWkS\nWk5nAJoQHCYzYrBh6kQe0vJqx/4dMz3f3PYyV6Ar6CCuog5htUTlGfpICly9Ehqy\nUC26NdZyXBbop1xFfr3FBqVLdPqBjKXhD+YGW7VBe8hn0xwxiIdLaSsk2W7SVKQ6\nYmeOLbLPoxuHSIgQogsxP/C9omfhxJvaOqGJ9OshhfNYA47VOxwO3hELotwTuHEs\nqUZnEmHG0XXy+BEeI/ZN9kEqncOgN7nhEQsvAJTqJQiSrlg87ACGGBjAEpUJ2SHq\nM54txG18u0YMxcbt4rGrD9CcO96C8yrp6mDsVYzGLge+JcijU7KkmPPxEWdq/+v0\necuKPfp3AgMBAAECggEACY6AZlCuw5Vfo2qyoFMFNxBTo/x4iht7ONqMINX/z3lE\nN3bPIrsKK3sI8uPs+THy1DusoO69fnY/42HQs7X/KJI1SyhUkHcieEdg/7+Cb5kt\nx2vuIRMkXF7qYGnr6jUezj4WLMLrMq7iWlOWkMeXXENoJSvmlxZFnD54awTbA9+z\nwfneGfRIM20R/fTMtFwoEMdAJEctptHBH+yp0kDSzf5pg0pFAJwLvwCOwh43NwYJ\nEIcMsDDNYM66EcjYzZTr08xzEf77ty2wbYkYawxcDw9H4g69d7JZvFv1qRmy56fD\nu0/yaqBLRWlI5SLtHXA6zCRIriIB6FPDcayI/jpx9QKBgQDm3+Ac/soHI/EtB7XT\nfe3SH5PR0ugvS6pYLW/rQwvc8OiTKayEcTcX7+UeJdUQwGLg6pRxXzf0LXRsMoak\nNaWHKMZ4DEI0isU948jhiCy6gOTXoWZvJfVGrC00tGkY3UctVhF3IjNMYrn7dhvs\n4zp6oK/WgmUMrRJCPjwMAS761QKBgQDLEo+C0qCxLydmzlquvZR/DQwSRH7LUs91\naFb7LgISsRBJDSg+q6yNSxFd5+dHLIqlC2Nri1PIYNtdGGKyYwvUf96rQumWizlm\nGReWEnCA1dWjGzDd9If3WaKd7BaXruEMSADbhhXIcGMR4GyZ/Fuf6iDsC4xGZ9Eo\nzLABbXpuGwKBgBtwbiVkDsTMe8R7TxvkspgvkpT0eQ3t8z/pnoyaelV2+F1NLajL\n/91DcLqlim4kP1w15RCYXYESyex2ENSBX7vxl6z63/94orqZUO2lDpPX79rE3vTE\n0SLmIbVK39bJrcTwnsDG+svQTARb5DPCSdf7MwrOko3wH+Rpmx9eIKRFAoGAJ2xk\nBf7ECYHhAVlgS3osgPnUdRttDiX2dpGaCUtmRaCwS65NONV1Ozzuky95O90O0XnD\nhFZZHpaHH6yjRIRsAIYOgWsNFBfVPdfzN0Q/KRPaVL7rnrthRgjVxBjYTfw6XnsA\nB54hTndbFFZgXwiZ9RKr74dSZTy0Y1pRdQV+9i8CgYAuYdTOv629Xg0D9DbUnsSQ\n6JgxfgZqlxYm+mnXudhxQSjpDuKg7vlMDEPrndqv6AJV2mOs5le1kC77rS5PGDyH\nofCZN/2SKcF3qJaVe3lEwSya1FkA74Q2b79PCuMEsz/5e0EggXmJdSAzmcEmi8b3\nlSsnbbeYRV9GAGoUsFgbMQ==\n-----END PRIVATE KEY-----\n"
    }),
    databaseURL: 'https://tinko-64673.firebaseio.com'
});
//firestore
let firebaseDb = defaultApp.firestore();

let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let mysql      = require('mysql');
let moment = require('moment');
let request = require('request');
let connection = mysql.createPool({
    host     : '47.89.187.42',
    user     : 'root',
    password : 'password',
    database : 'tinko',
    useConnectionPooling: true,
    charset : 'utf8mb4'
});
let https = require("https");
// connection.connect();
let bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
//变量区域
//用来存储好友之间关系
let UserFriendList =  {

};

//用来存储活动信息
let MeetsInfo = {

};

//用来存储用户信息
let UserInformation = {

};

let dismissedGroup = [];


//重启服务器时候才会这么操作！！！
//获取所有的用户列表
//除非有用户新注册 否则全部信息都在这里
function getUserInformationWhenReload() {
    let Ref = firebaseDb.collection("Users");
    let allUser = Ref.get().then(
        snapshot => {
            snapshot.forEach( doc => {
                let uid = doc.data().uid;
                UserInformation[uid] = doc.data();
            })
        }
    ).catch(
        err =>{
            console.log(err);
        }
    )
}
//每次开启服务都需要这样reload一下
getUserInformationWhenReload();

//获取用户数据 这个是用来更新信息用的 假如不需要更新的话不要调用
function getUserDetailInfo(uid) {
    let docRef = firebaseDb.collection("Users").doc(uid);
    let getDoc = docRef.get().then(
        doc =>{
            if (!doc.exists){
                console.log("no data");
            }else{
                UserInformation[uid] = doc.data();
            }
        }
    ).catch(err => {
        console.log("ERROR: ",err);
    })
}


//获取用户的好友列表
function getFriend(uid) {
    let docRef = firebaseDb.collection("Users").doc(uid).collection("Friends_List");
    docRef.get().then((querySnapshot)=>{
        if (UserFriendList[uid] === undefined){
            UserFriendList[uid] = [];
        }
        querySnapshot.forEach((doc)=>{
            let userId =  doc.data().uid;
            if (UserFriendList[uid].indexOf(userId)===-1){
                UserFriendList[uid].push(userId);
            }
        });
        console.log("用户好友注册完成")
    }).catch((error) => {
        console.log("Error getting documents: ", error);
    });
}

//获取用户参与的活动
function getParticipatedMeets(uid) {
    console.log("开始获取用户参与的活动");
    let meetRef = firebaseDb.collection("Users").doc(uid).collection("ParticipatingMeets");
    meetRef.get().then((querySnapshot)=>{
        querySnapshot.forEach((doc)=>{
            let meetId = doc.data().meetId;
            if (MeetsInfo[meetId] === undefined){
                MeetsInfo[meetId] = [uid];
            }else{
                if (MeetsInfo[meetId].indexOf(uid)===-1){
                    MeetsInfo[meetId].push(uid)
                }
            }
        });
        console.log("用户的活动已经注册完成");
    }).catch((error) => {
        console.log("Error getting documents: ", error);
    });
}

//同步数据活动《-》用户 数据 方便查询
function participateInMeets(uid,MeetId) {
    let data = {
        meetId:MeetId
    };
    let setDoc = firebaseDb.collection("Users").doc(uid).collection("ParticipatingMeets").doc(MeetId).set(data);
}

//用户离开活动
function leaveMeets(uid,MeetId) {
    let user = MeetsInfo[MeetId];
    if (user){
        let num = user.indexOf(uid);
        if (num !== -1){
            //从活动事件里删除
            MeetsInfo[MeetId].splice(num, 1);
            return true;
        }
    }
    return false;
}

//每次用户点击群聊这个组以后立刻更新
function getListWhoParticipatedInMeetsByMeetId(MeetId) {
    let meetRef = firebaseDb.collection("Meets").doc(MeetId);
    let meetDoc = meetRef.get().then(
        doc => {
            if (doc.exists){
                let data = doc.data().participatingUsersList;
                //Array
                for (uid in data) {
                    if (data[uid].status === true){
                        if (MeetsInfo[MeetId] === undefined){
                            MeetsInfo[MeetId] = [uid];
                        }else{
                            if (MeetsInfo[MeetId].indexOf(uid)===-1){
                                MeetsInfo[MeetId].push(uid)
                            }
                        }
                    }
                }
                console.log("MeetId 数据更新完成");
            }
        }
    ).catch(
        err => {
            console.log("Error :" ,err);
        }
    )
}


//创建活动
function createMeets(uid,MeetId) {
    participateInMeets(uid,MeetId);
}

//获取用户未读消息
function changeUnReadPrivateChatMessageMark(uid) {
    // connection.query("SELECT * FROM privateChat WHERE status = 1 and toId = '"+uid+"'", function (err, result, fields) {
    //     console.log(result);
    // });
    connection.query("UPDATE privateChat SET privateChat.status = 0 WHERE privateChat.toId = '"+uid+"' and privateChat.status = 1", function (err, result) {
        //connection.release();
        if (err) { console.log(err);return;}
        console.log(result.affectedRows + " record(s) updated");
    });
}
//获取用户未读的群聊消息
function changeUnReadMeetsChatInfoMark(uid) {
    connection.query("UPDATE userUnReadMeetingChat SET userUnReadMeetingChat.status = 0 WHERE userUnReadMeetingChat.userId = '"+uid+"' and userUnReadMeetingChat.status = 1", function (err, result) {
        //connection.release();
        if (err) { console.log("未读消息更新错误",err);return;}
        console.log(result.affectedRows + " record(s) updated");
    });
}


//用户登陆后启动用户
function initUserWhenUserLogin(uid) {
    // getFriend(uid);
    getParticipatedMeets(uid);
    getUserDetailInfo(uid);
}

//不用array因为防止重复登录
let currentOnlineUserForChat = {};

//判断好友是否在线
function checkUserStatus(uid) {
    return (currentOnlineUserForChat[uid] === true)
}

//聊天的全部服务器信息
io.on('connection', function(socket){

    let userId;
    //用户登录  只有RootNavigator才做这个操作
    socket.on('createMeets',function (uid,MeetId) {
        participateInMeets(uid,MeetId);
        io.emit("mySendBox"+uid,generateData(0,uid,"the Meet has been created",MeetId));
    });

    //type = 1 为创建
    //type = 2 为加入
    //type = -1 为退出
    //type = -2 剔人
    //type = 3 dismiss group
    socket.on("Meets",function (uid,MeetId,type) {
        console.log(UserInformation);
        console.log(uid);
        let userName = UserInformation[uid].username;
        if (type === 1){
            participateInMeets(uid,MeetId);
            io.emit("mySendBox"+uid,generateData(0,uid,"You have create the group",MeetId));
        }else if (type === -1||type === -2){
            //判断是否本来就在活动里
            let status = leaveMeets(uid,MeetId);
            if (status){
                if (type === -1){
                    io.emit("mySendBox"+uid,generateData(0,uid,"You have left the group",MeetId));
                }else{
                    io.emit("mySendBox"+uid,generateData(0,uid,"You have been removed",MeetId));
                }
            }
        }else if(type === 2){
            let user = MeetsInfo[MeetId];
            participateInMeets(uid,MeetId);
            if (user){
                for (let i = 0;i<user.length;i++){
                    if (userName){
                        io.emit("mySendBox"+user[i],generateData(0,user[i],userName + " has joined the group",MeetId));
                    }else{
                        io.emit("mySendBox"+user[i],generateData(0,user[i],"Someone has joined the group",MeetId));
                    }
                    console.log(userName + " have joined the group")
                }
                if (MeetsInfo[MeetId].indexOf(uid) === -1){
                    MeetsInfo[MeetId].push(uid);
                }
            }
            io.emit("mySendBox"+uid,generateData(0,uid,"You have joined the group",MeetId));
        }else if (type === 3){
            let user = MeetsInfo[MeetId];
            updateDismissedGroup(MeetId);
            if (user){
                for (let i = 0;i<user.length;i++){
                    io.emit("mySendBox"+user[i],generateData(0,user[i],"The Group has been dismissed",MeetId));
                }
            }
        }
    });

    socket.on('userLogin',function (uid) {
        console.log("userLogin");
        userId = uid;
        initUserWhenUserLogin(uid);
        currentOnlineUserForChat[userId] = true;
        // 寻找未读消息发送
        //未读群聊写成4
        connection.query("SELECT * FROM meetingChat WHERE id IN (SELECT chatId FROM userUnReadMeetingChat WHERE userId = '"+uid+"' AND status = 1)", function (err, result, fields) {
            //connection.release();
            if (err){console.log("群聊获取err:"+err);return;}
            console.log("群聊获取成功:",result);
            if (result){
                io.emit("connect"+uid,generateData(4,uid,result));
                //修改他们的状态
                changeUnReadPrivateChatMessageMark(uid);
            }
        });
        //未读私聊写成3
        connection.query("SELECT * FROM privateChat WHERE status = 1 and toId = '"+uid+"'", function (err, result, fields) {
            //connection.release();
            if (err){console.log("私聊获取err:"+err);return;}
            console.log("私聊获取成功:",result);
            if (result){
                io.emit("connect"+uid,generateData(3,uid,result));
                //修改他们的状态
                changeUnReadMeetsChatInfoMark(uid);
            }
        });
    });

    //私聊接口
    socket.on('privateChat',function(fromId,toId,msg,code){
        if (msg!==""){
            if (checkUserStatus(toId)){
                insertSql(insertPrivateChat,[fromId,toId,msg]);
            }else{
                insertSql(unReadPrivateChat,[fromId,toId,msg,1]);
            }
            //currentUserPushToken
            if (currentUserPushToken[toId]){
                sendPushMessage("未读消息",UserInformation[fromId].username + ":" + msg,currentUserPushToken[toId]);
            }
            io.emit("connect"+toId,generateData(1,fromId,msg));
            io.emit("mySendBox"+fromId,JSON.stringify({
                type:1,
                code:code,
                toId:toId,
                msg:msg
            }));
        }
    });

    socket.on('groupChat',function (fromId,groupId,msg) {
        console.log("现在的在线状态时",currentOnlineUserForChat);
        if (msg!==""&&dismissedGroup.indexOf(groupId)=== -1){
            let user = MeetsInfo[groupId];
            io.emit("mySendBox"+fromId,generateData(2,fromId,msg,groupId));
            connection.query('INSERT INTO meetingChat(fromId,meetId,msg) VALUES(?,?,?)',[fromId,groupId,msg], function(err, result) {
                //connection.release();
                console.log('INSERT INTO meetingChat(fromId,meetId,msg) VALUES(?,?,?)',[fromId,groupId,msg]);
                if (err) { console.log(err);return;}
                let id = result.insertId;
                for (let i = 0;i<user.length;i++){
                    if (user[i]!==fromId){
                        if (currentOnlineUserForChat[user[i]]===true){
                            //在线
                            io.emit("connect"+user[i],generateData(2,fromId,msg,groupId));
                        }else{
                            //不在线的话我就把这条消息的id存入userUnReadMeetingChat的数据库里面            
                            if (currentUserPushToken[user[i]]){
                                sendPushMessage("未读群聊消息",UserInformation[fromId].username + ":" + msg,currentUserPushToken[user[i]]);
                            }
                            insertSql("INSERT INTO userUnReadMeetingChat (chatId,userId) VALUES(?,?)",[id,user[i]]);
                        }
                    }
                }
            });
            //给旁观者发送
            io.emit("activity"+groupId,JSON.stringify({
                fromId:fromId,
                msg:msg
            }))
        }
    });
    socket.on("byStander",function (fromId,groupId,msg) {
        let user = MeetsInfo[groupId];
        getListWhoParticipatedInMeetsByMeetId(groupId);
        connection.query('INSERT INTO meetingChat(fromId,meetId,msg) VALUES(?,?,?)',[fromId,groupId,msg], function(err, result) {
            //connection.release();
            if (err) { console.log(err);return;}
            let id = result.insertId;
            console.log("byStander:",user);
            if (user){
                for (let i = 0;i<user.length;i++){
                    if (user[i]!==fromId){
                        if (currentOnlineUserForChat[user[i]] === true){
                            //在线
                            io.emit("connect"+user[i],generateData(2,fromId,msg,groupId));
                        }else{
                            //不在线的话我就把这条消息的id存入userUnReadMeetingChat的数据库里面
                            insertSql("INSERT INTO userUnReadMeetingChat (chatId,userId) VALUES(?,?)",[id,user[i]]);
                        }
                    }else{
                        io.emit("mySendBox"+user[i],generateData(2,fromId,msg,groupId));
                    }
                }
            }
        });
        //给旁观者发送
        io.emit("activity"+groupId,JSON.stringify({
            fromId:fromId,
            msg:msg
        }))
    });

    socket.on('NewFriendRequest',function (requestData) {
        let data = JSON.parse(requestData),
            requester = (data.requester !== undefined)?data.requester:"",
            responser = (data.responser !== undefined)?data.responser:"",
            type = (data.type !== undefined)?data.type:"",
            msg = (data.msg !== undefined)?data.msg:"";
        //type 0 = "发送好友请求"
        //     2 = "facebook好友确认"
        //     1 = "普通的好友确认" 比如a给b发送了请求 b确认了 就发送这个
        //     -1 = "确认了这个请求" 比如a给b发送了请求 b拒绝了 就发送这个
        //      999 = 系统消息
        if (requester!==""&&responser!==""&&msg!==""&&type!==""){
            io.emit("systemListener"+responser,JSON.stringify({
                type:type,
                requester:requester,
                msg:msg,
                timestamp: currentTime
            }));
            //这时候确认好友了
            if (type === 1){
                io.emit("mySendBox"+responser,JSON.stringify({
                    type:999,
                    requester:requester,
                    msg:"你们已经是朋友拉 快开启聊天吧",
                    timestamp: currentTime
                }));
                io.emit("mySendBox"+requester,JSON.stringify({
                    type:999,
                    requester:responser,
                    msg:"你们已经是朋友拉 快开启聊天吧",
                    timestamp: currentTime
                }));
            }
        }
    });

    socket.on('disconnect', function() {
        //从活动序列里删除自己
        console.log("disconnect from client");
        if (userId !== undefined){
            currentOnlineUserForChat[userId] = false;
        }
    });

});
function insertSql(sqlStr,addSqlParams) {
    connection.query(sqlStr,addSqlParams,function (err, result) {
        //connection.release();
        if(err){
            console.log('[INSERT ERROR] - ',err.message);
            return;
        }
    });
}

//数据整合器
let currentTime = moment(Date.now()).format('YYYY-MM-DD hh:mm:ss');
setInterval(function(){
    currentTime =moment(Date.now()).format('YYYY-MM-DD hh:mm:ss');
},1000);
//generateData(0,uid,"You have been removed",MeetId,"")
function generateData(type,from,message,activityId){
    let response;
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


let insertPrivateChat = 'INSERT INTO privateChat(fromId,toId,msg) VALUES(?,?,?)',
    insertActivityChat = 'INSERT INTO meetingChat(fromId,msg) VALUES(?,?)';
let unReadPrivateChat = 'INSERT INTO privateChat(fromId,toId,msg,status) VALUES(?,?,?,?)';

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

//整套推送体系
let currentUserPushToken = {};
app.post('/login',function (req, res) {
    let data = req.body;
    let uid = data.uid,
        token = data.token,
        updateSql = "INSERT INTO userPushToken(uid,pushToken) VALUES(?,?) ON DUPLICATE KEY UPDATE pushToken = ?";
    //每次会更新接收的接口 方便下次使用
    currentUserPushToken[uid] = token;
    connection.query(updateSql,[uid,token,token],function (err, result) {
        //connection.release();
        if(err){
            console.log('Login [UPDATE ERROR] - ',err.message);
            res.end();
            return;
        }
    });
    res.end();
});
app.post('/getListWhoParticipatedInMeetsByMeetId',function (req,res) {
    let meetId = req.body.meetId;
    getListWhoParticipatedInMeetsByMeetId(meetId);
    res.end(JSON.stringify({
        status:0
    }));
});
app.post('/logout',function (req, res) {
    let uid = req.body.uid,
        updateSql = "UPDATE userPushToken set status = 0 WHERE uid = ?";
    currentUserPushToken[uid] = "";
    connection.query(updateSql,[uid],function (err, result) {
        //connection.release();
        if(err){
            console.log('logout [UPDATE ERROR] - ',err.message);
            res.end(JSON.stringify({
                status:1
            }));
            return;
        }
    });
    res.end(JSON.stringify({
        status:0
    }));
});
function getUserPushToken(){
    connection.query("SELECT * FROM userPushToken WHERE status = 1", function (err, result, fields) {
        //connection.release();
        if (err) { console.log(err);return;}
        for (let i = 0;i<result.length;i++){
            let data = result[i];
            currentUserPushToken[data.uid] = data.pushToken;
        }
    });
}

function getDismissedGroup() {
    connection.query("SELECT * FROM dismissedGroup", function (err, result, fields) {
        //connection.release();
        if (err) { console.log(err);return;}
        for (let i = 0;i<result.length;i++){
            let data = result[i];
            dismissedGroup.push(data.meetId);
        }
    });
}

function updateDismissedGroup(meetId) {
    let updateSql = "INSERT INTO dismissedGroup(meetId) VALUES(?)";
    connection.query(updateSql,[meetId],function (err, result) {
        //connection.release();
        dismissedGroup.push(meetId);
        if(err){
            console.log('[UPDATE ERROR] - ',err.message);
            return;
        }
    });
}

//发送push消息
function sendPushMessage(title,body,token){
    let headersOpt = {
        "content-type": "application/json",
    };
    request(
        {
            method:'post',
            url:'https://expo.io/--/api/v2/push/send',
            form: {
                "to":token,
                "sound":"default",
                "data":{
                    "hello":"hello"
                },
                "title":title,
                "body":body
            },
            headers: headersOpt,
            json: true,
        }, function (error, response, body) {
            console.log(body);
        });
}

//开机就调用
getUserPushToken();
getDismissedGroup();


//获取群聊天记录
app.post('/getChatHistory',function (req, res) {
    console.log("收到请求:",(new Date()));
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
            //connection.release();
            if (err) {
                console.log("getChatHistory:",err);
                res.end(JSON.stringify({
                    status:0,
                    data:result
                }));
                return;}
            console.log("发送请求:",(new Date()));
            res.end(JSON.stringify({
                status:0,
                data:result
            }))
        });
    }else{
        console.log("发送请求:",(new Date()));
        res.end(JSON.stringify({
            status:1
        }))
    }
});

setInterval(function () {
    https.get('https://us-central1-tinko-64673.cloudfunctions.net/checkAllMeetsStatus', (resp) => {
        console.log("call cloundfunction success");
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
},60*60*1000*12);

// https.get('https://us-central1-tinko-64673.cloudfunctions.net/checkAllMeetsStatus', (resp) => {
//     console.log("call cloundfunction success");
// }).on("error", (err) => {
//     console.log("Error: " + err.message);
// });

app.get('*', function(req, res){
    res.sendFile(__dirname+"/404.html");
});

http.listen(4000, function(){
    console.log('listening on *:4000');
});
