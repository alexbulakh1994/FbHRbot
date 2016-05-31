var postbacks = require('./postbacks');

var request = function(objArray, text, currentListPosition){
    var buttons = [];
    if(currentListPosition !== undefined){
        if(currentListPosition < 0){
            buttons.push(objArray[objArray.length +  currentListPosition]);
        }else{
             buttons.push(objArray[currentListPosition]);
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
                buttons: buttons
            }
        }
  }
}
module.exports = request;


