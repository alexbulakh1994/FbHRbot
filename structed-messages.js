var postbacks = require('./postbacks');
var MAX_BUTTON_NUMBERS = 3;

var buttonsConstructor = function(elements){
  var buttons = [];
  elements.forEach(function(obj){
    buttons.push({type: 'postback', title: obj, payload: obj.concat('_postback')});
  });
  console.log('buttons length 1 ' + buttons.length);
  return buttons;
} 

Number.prototype.mod = function(n) {
    return ((this % n) + n) % n;
}

var request = function(objArray, text, currentListPosition){
    var buttons = [];
    if(currentListPosition !== undefined && objArray.length > MAX_BUTTON_NUMBERS){
        if(currentListPosition < 0){
            buttons.push(objArray[Number(currentListPosition).mod(objArray.length)]);
        }else{
             buttons.push(objArray[currentListPosition % objArray.length]);
        }
        buttons = buttons.concat(postbacks.previousNextButton);
        console.log('buttons length 3 ' + buttons.length);
    }else{
        buttons = objArray;
          console.log('buttons length 2 ' + buttons.length + 'objArray length is : ' + objArray.length);
    }

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


