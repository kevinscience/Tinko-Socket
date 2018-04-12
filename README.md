## Tinko Socket Usage



- Login:

  - Login with socket
  - `socket.emit("userLogin",uid);`

- AttendActivity:

  - `socket.emit("attendActivity",uid,[activityIds]);`

- Listen to your chat:

  - ```javascript
    socket.on("connect"+uid,function(msg){
        console.log(msg);
    })
    ```

- Listen to the System:

  - ```javascript
    socket.on("systemListener",function(msg){
        console.log(msg);
    });
    ```

- Send private chat:

  - `socket.emit("privateChat",fromId,toId,msg);`



- Mysql Table Info

  -  privateChat

    - ````
      CREATE TABLE `privateChat` (
        `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
        `fromId` varchar(30) NOT NULL DEFAULT '',
        `toId` varchar(30) NOT NULL DEFAULT '',
        `msg` varchar(300) NOT NULL DEFAULT '',
        `status` tinyint(1) NOT NULL DEFAULT '0',
        `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
      ) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;
      ````

  -  meetingChat

    - ````
      CREATE TABLE `meetingChat` (
        `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
        `fromId` varchar(30) NOT NULL DEFAULT '',
        `msg` text NOT NULL,
        `status` tinyint(1) NOT NULL DEFAULT '0',
        `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
      ````

