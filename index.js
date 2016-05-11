var cool = require('cool-ascii-faces');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var structuredMessage = require('./structed-messages');

var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index')
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// To verify
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === 'super_secret_code') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

var token = "EAAYwwZCxDjikBAH8t9FPj17mZB3cB6l2j4k5tXFM0O0XHV5FcqG0ZCLRXiNEIN6XICUrjqo99sdWjqbXL9ytycJLjDTPIOb50vXhZCoFnvbW45ZAl1opG3ny2OdhXo5RxAoaqwNcoMu7pzHY9WrEQtSjC7XMZBhuxzUpyZBmzGQuwZDZD";

//send message
function sendTextMessage(sender, text) {
  messageData = {
    text:text
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

function sendStructuredMessage(sender){
	messageData = {
    	attachment: {
    		type: "template",
    		payload: {
    			template_type: "button",
    			text: "What do you want to do next?",
    			buttons: [{
    				type: "postback",
    				title: "Back-End Developer",
    				payload: "backEnd_dev"
    			},
    			{
    				type: "postback",
    				title: "Science Reseacher",
    				payload: "science"
    			},
    			{
    				type: "postback",
    				title: "Front-End Developer",
    				payload: "frontEnd_dev"
    			}]
    		}
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


// receive message
var allSenders = {};

app.post('/webhook/', function (req, res) {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    
    var senderId = event.sender.id;

    if (event.message && event.message.text && !allSenders[senderId]) {
      text = event.message.text;
      // Handle a text message from this sender
      console.log(text);
      console.log(Object.keys(allSenders));
      

      sendTextMessage(senderId, 'Привіт. Заповніть шаблон Прізвище Імя Побатькові. Приклад заповнення шаблону Імя: Олексій Прізвище: Булах Побатькові: Романович');
      allSenders[senderId] = 1;
     //
    
    }else
    if(event.message && event.message.text && allSenders[senderId] === 1){
    	 sendStructuredMessage(senderId);
    	 allSenders[senderId]++;
    }
    else {
    	if(event.postback && event.postback.payload === 'frontEnd_dev'){
    		sendTextMessage(senderId, "Hi frontEnd developer");
    		structuredMessage.sendSpecializationMessage(senderId, structuredMessage.FrontEndPayload);
    	}
    	if(event.postback && event.postback.payload === 'science'){
    		sendTextMessage(senderId, "Hi Science Reseacher");
    	}
    	if(event.postback && event.postback.payload === 'backEnd_dev'){
    		sendTextMessage(senderId, "Hi backEnd_dev");
    		structuredMessage.sendSpecializationMessage(senderId, structuredMessage.backEndPayload);
    	}
    	}

    }
     
  res.sendStatus(200);
});