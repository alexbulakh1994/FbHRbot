
var request = function(objArray){
    return {
        attachment: {
            type: "template",
            payload: {
                template_type: "button",
                text: "Choose all skills ? If you want finish print finish.",
                buttons: objArray
            }
        }
  }
}
module.exports = request;


