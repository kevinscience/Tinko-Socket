var request = require('request');

//Custom Header pass
var headersOpt = {
    "content-type": "application/json",
};
request(
    {
        method:'post',
        url:'https://expo.io/--/api/v2/push/send',
        form: {
            "to":"ExponentPushToken[T_sV6kFOeJWOKYrpJgqpkv]",
            "sound":"default",
            "data":{
                "hello":"hello"
            },
            "title":"小薛",
            "body":"薛栋华你好"
        },
        headers: headersOpt,
        json: true,
    }, function (error, response, body) {
        //Print the Response
        console.log(body);
    }); 