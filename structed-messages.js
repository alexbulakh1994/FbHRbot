var postbacks = require('./postbacks');
var MAX_BUTTON_NUMBERS = 3;

var buttonsConstructor = function(elements){
  var buttons = [];
  elements.forEach(function(obj){
    buttons.push({type: 'postback', title: obj, payload: obj.concat('_postback')});
  });
  return buttons;
} 

Number.prototype.mod = function(n) {
    return ((this % n) + n) % n;
}

var request = function(objArray, text){
    var buttons = [];
    var messagePostBack = [];
    // if(currentListPosition !== undefined && objArray.length > MAX_BUTTON_NUMBERS){
    //     if(currentListPosition < 0){
    //         buttons.push(objArray[Number(currentListPosition).mod(objArray.length)]);
    //     }else{
    //          buttons.push(objArray[currentListPosition % objArray.length]);
    //     }
    //     buttons = buttons.concat(postbacks.previousNextButton);
    // }else
    //     buttons = objArray;

    for(var i = 0; i < objArray.length; i++){
        if((i+1) % MAX_BUTTON_NUMBERS === 0){
            messagePostBack.push( {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: 'Continue', 
                        buttons: buttonsConstructor(objArray.slice(i - 2, i + 1))
                    }
                }
            });
  
        }else if(i === objArray.length - 1){
            messagePostBack.push( {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: text, 
                        buttons: buttonsConstructor(objArray.slice(i - (objArray.length % 3) + 1))
                    }
                }
            });
           
        }

    }
          
    return messagePostBack;
}
module.exports = request;


