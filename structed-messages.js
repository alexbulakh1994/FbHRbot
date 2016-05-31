var postbacks = require('./postbacks');

var buttonsConstructor = function(elements){
  var buttons = [];
  elements.forEach(function(obj){
    buttons.push({type: 'postback', title: obj, payload: obj.split(' ')[0].toLowerCase().concat('_postback')});
  });
  return buttons;
} 

var request = function(objArray, text, currentListPosition){
    var buttons = [];
    if(currentListPosition !== undefined){
        if(currentListPosition < 0){
            buttons.push(objArray[objArray.length +  currentListPosition]);
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


