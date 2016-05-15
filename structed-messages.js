
var request = function(objArray, text){
    return {
        attachment: {
            type: "template",
            payload: {
                template_type: "button",
                text: text, 
                buttons: objArray
            }
        }
  }
}
module.exports = request;


