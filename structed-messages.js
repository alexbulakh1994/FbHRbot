var postbacks = require('./postbacks');
var MAX_BUTTON_NUMBERS = 3;

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

var request = function(objArray, text) {
    var messagePostBack = [];
    for(var i = 0; i < objArray.length; i++){
        if(objArray.length <= MAX_BUTTON_NUMBERS) {
            messagePostBack.push(payloadObj(text, buttonsConstructor(objArray)));
            return messagePostBack;
        }
        if ((i+1) % MAX_BUTTON_NUMBERS === 0) {
            messagePostBack.push(payloadObj(text, buttonsConstructor(objArray.slice(i - 2, i + 1))));  
        } else if(i === objArray.length - 1) {
            messagePostBack.push(payloadObj(text, buttonsConstructor(objArray.slice(i - (objArray.length % 3) + 1))));
        }
    }         
    return messagePostBack;
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

module.exports = request;


