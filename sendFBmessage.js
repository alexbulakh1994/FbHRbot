var request = require('request');
var MAX_BUTTON_NUMBERS = 3;

var token = "EAAYWxfiazmIBAFv6xNQGeLjBgrLAhDXxfozdrJl2TidZABAiAbm9sRJv1YyTAKMFZCVrjfgiyFSUHxL3H2PEVrp9LHOiDW8RJb3Ji1oJDZCZANDoh22MpKEbAgU8iy4fW203bat3i9FIxslFtKBY3GgsIJztlcTWRaM8ksWnnQZDZD";
// now is DataRoot token

var buttonsConstructor = function(elements) {
    var buttons = [];
    elements.forEach(function(obj) {
        buttons.push({type: 'postback', title: obj, payload: obj.concat('_postback')});
    });
    return buttons;
} 

Number.prototype.mod = function(n) {
    return ((this % n) + n) % n;
}

var payloadObj = function(text, buttons) {
    return {
        attachment: {
            type: "template",
            payload: {
                template_type: "button",
                text: text, 
                buttons: buttons
            }
        }
    };
}

var buttonTemplate = function(objArray, text) {
    var messagePostBack = [];
    for(var i = 0; i < objArray.length; i++){
        if(objArray.length <= MAX_BUTTON_NUMBERS) {
            messagePostBack.push(payloadObj(text, buttonsConstructor(objArray)));
            return messagePostBack;
        }
        if ((i+1) % MAX_BUTTON_NUMBERS === 0) {
            messagePostBack.push(payloadObj(text, buttonsConstructor(objArray.slice(i - 2, i + 1))));  
        } else if(i === objArray.length - 1) {
            messagePostBack.push(payloadObj(text, buttonsConstructor(objArray.slice(i - (objArray.length % MAX_BUTTON_NUMBERS) + 1))));
        }
    }         
    return messagePostBack;
}

var send = function sendMessage(sender, messageData) {
    messageData.forEach(function(item, i, arr) {
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token:token},
            method: 'POST',
            json: {
                recipient: {id:sender},
                message: item,
                }
        }, function(error, response, body) {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }           
        });
    });
}



module.exports.buttonTemplate = buttonTemplate;
module.exports.send = send;


