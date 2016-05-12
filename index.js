var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var structuredMessage = require('./structed-messages');

var token = "EAAYwwZCxDjikBAH8t9FPj17mZB3cB6l2j4k5tXFM0O0XHV5FcqG0ZCLRXiNEIN6XICUrjqo99sdWjqbXL9ytycJLjDTPIOb50vXhZCoFnvbW45ZAl1opG3ny2OdhXo5RxAoaqwNcoMu7pzHY9WrEQtSjC7XMZBhuxzUpyZBmzGQuwZDZD";
var global_payloads = ['ruby_dev', 'python_dev', 'node_dev', 'html_dev', 'javaScript_dev', 'angular', 'python_net', 'apache'];

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


function sendStructuredMessage(sender, message){
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: message,
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
   
      console.log(text);
      console.log(Object.keys(allSenders));
      
      sendTextMessage(senderId, 'Привіт. Заповніть шаблон Прізвище Імя Побатькові.');
      allSenders[senderId] = 1;
  
    }else
    if(event.message && event.message.text && allSenders[senderId] === 1){
    	 sendStructuredMessage(senderId, structuredMessage.chooose_spec);
    	 allSenders[senderId]++;
    }
    else {
    	if(event.postback && event.postback.payload === 'frontEnd_dev'){
    		sendTextMessage(senderId, "Hi frontEnd developer");
    		sendStructuredMessage(senderId, structuredMessage.messageFrontDataBack);
    	}else
    	if(event.postback && event.postback.payload === 'science'){
    		sendTextMessage(senderId, "Hi Science Reseacher");
    		sendStructuredMessage(senderId, structuredMessage.messageScienceResearch);
    	}else
    	if(event.postback && event.postback.payload === 'backEnd_dev'){
    		sendTextMessage(senderId, "Hi backEnd_dev");
    		sendStructuredMessage(senderId, structuredMessage.messageDataBack);
    	}else
    	if(event.postback && global_payloads.indexOf(event.postback.payload) !== -1 ){
    		sendTextMessage(senderId, "Чи у вас є досвід роботи ? Якщо так, вкажіть період роботи та місце роботи ?");
    	}

    }
}

  res.sendStatus(200);
});



