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

var request = function(objArray, text, currentListPosition){
    var buttons = [];
    if(currentListPosition !== undefined && objArray >= MAX_BUTTON_NUMBERS){
        if(currentListPosition < 0){
            buttons.push(objArray[Number(currentListPosition).mod(objArray.length)]);
        }else{
             buttons.push(objArray[currentListPosition % objArray.length]);
        }
        buttons = buttons.concat(postbacks.previousNextButton);
    }else
        buttons = objArray;

    return {
        attachment: {
            type: "template",
            payload: {
                template_type: "button",
                text: text, 
                buttons: buttonsConstructor(buttons)
            }
        }
  }
}
module.exports = request;


