
var request = function(objArray){
    return {
        attachment: {
            type: "template",
            payload: {
                template_type: "button",
                text: "What do you want to do next?",
                buttons: [{
                    type: "postback",
                    title: objArray[0].title,//"Back-End Developer",
                    payload: objArray[0].payload//"backEnd_dev"
                },
                {
                    type: "postback",
                    title: objArray[1].title,//"Science Reseacher",
                    payload: objArray[0].payload//"science"
                },
                {
                    type: "postback",
                    title: objArray[2].title,//"Front-End Developer",
                    payload: objArray[0].payload//"frontEnd_dev"
                }]
            }
        }
  }
}
module.exports = request;


