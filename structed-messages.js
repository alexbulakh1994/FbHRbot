
var request = function(objArray){
    return {
        attachment: {
            type: "template",
            payload: {
                template_type: "button",
                text: "What do you want to do next?",
                buttons: objArray
            }
        }
  }
}
module.exports = request;


