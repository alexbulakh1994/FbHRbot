module.exports = {
function sendSpecializationMessage(sender, payloadSpec){
	messageData = {
    	attachment: {
    		type: "template",
    		payload = payloadSpec
    	}
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
 });
}

backEndPayload = {
                template_type: "Specialization Backend",
                text: "С какой технологией вы б хотели работать в бекенд разработке",
                buttons: [{
                    type: "postback",
                    title: "Node JS",
                    payload: "nodeJS"
                },
                {
                    type: "postback",
                    title: "Ruby",
                    payload: "ruby"
                },
                {
                    type: "postback",
                    title: "Python",
                    payload: "python"
                }]
            };

FrontEndPayload = {
                template_type: "Specialization Backend",
                text: "С какой технологией вы б хотели работать в фронтенд разработке",
                buttons: [{
                    type: "postback",
                    title: "Html, CSS",
                    payload: "Html"
                },
                {
                    type: "postback",
                    title: "JS",
                    payload: "js"
                },
                {
                    type: "postback",
                    title: "Angular JS",
                    payload: "angular"
                }]
            };

};
