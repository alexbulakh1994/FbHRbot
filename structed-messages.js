module.exports = {
request: require('request'),
sendSpecializationMessage: function (sender, payloadSpec){

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: payloadSpec,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
 });
},

backEndPayload: { 
        attachment: 
            {
                type: "template",
                payload: {
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
            }
        }
    },

FrontEndPayload: {
        attachment: 
            {
                type: "template",
                payload: {
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
            }
        }
    },

};

