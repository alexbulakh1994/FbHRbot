var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var mongoose = require('mongoose');
var structedRequest = require('./structed-messages');
var postbacks = require('./postbacks');
var app = express();

var token = "EAAYwwZCxDjikBAH8t9FPj17mZB3cB6l2j4k5tXFM0O0XHV5FcqG0ZCLRXiNEIN6XICUrjqo99sdWjqbXL9ytycJLjDTPIOb50vXhZCoFnvbW45ZAl1opG3ny2OdhXo5RxAoaqwNcoMu7pzHY9WrEQtSjC7XMZBhuxzUpyZBmzGQuwZDZD";
var technick_payloads = ['ruby_dev', 'python_dev', 'node_dev', 'html_dev', 'javaScript_dev', 'angular', 'python_net', 'apache', 'finish'];
var spec_payloads = ['frontEndDev', 'science', 'backEnd_dev'];

//--------------------------------------------------------------------------
app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//-------------------------------------------------------------------

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
function sendMessage(sender, messageData) {

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

// ------------------------------
var Schema = new mongoose.Schema({
	surname : String,
	name: String,
	patronymic: String,
	specialization: String,
	skills: [String],
	states: Number
});
mongoose.connect('mongodb://alexbulakh707:28031994Alex@ds021172.mlab.com:21172/chatdb');
var client = mongoose.model('clients', Schema, 'clients');
//----------------------------------------


var allSenders = {};
app.post('/webhook/', function (req, res) {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i]; 
    var senderId = event.sender.id;

    if (event.message && event.message.text && !allSenders[senderId]) {

       allSenders[senderId] = new client({states: 1});
       sendMessage(senderId, {text: 'Hi. Write Surname Name and Patronymic.'});

    }
    else if(event.message && event.message.text && allSenders[senderId].states === 1){
    	 sendMessage(senderId, structedRequest(postbacks.specialization));
    	 allSenders[senderId].states++;
    	 // allSenders[senderId].name = 'Ivan';
    	 // allSenders[senderId].surname = 'Didur';
    	 // allSenders[senderId].patronymic = 'Romanovich';
    }
    else if((allSenders[senderId].states === 2) && (spec_payloads.indexOf(event.postback.payload) !== -1) ){
    	console.log(event.postback.payload);
    	if(event.postback && event.postback.payload === 'frontEnd_dev'){
    		allSenders[senderId].specialization = 'frontEndDev';
    		sendMessage(senderId, structedRequest(postbacks.frontEnd));
    	}else
    	if(event.postback && event.postback.payload === 'science'){
    		allSenders[senderId].specialization = 'Science Reseacher';
    		sendMessage(senderId, structedRequest(postbacks.science));
    	}else
    	if(event.postback && event.postback.payload === 'backEnd_dev'){
    		allSenders[senderId].specialization = 'Back End developer';
    		sendMessage(senderId, structedRequest(postbacks.backEnd));
    	}
    	
    }else if((allSenders[senderId].states === 2) && (technick_payloads.indexOf(event.postback.payload)!== -1)){
    	console.log(event.postback.payload);
    	switch(event.postback.payload){
    		case 'python_dev': 
    				filter(postbacks.backEndPostbacks, 'python_dev');
    				sendMessage(senderId, structedRequest(postbacks.backEndPostbacks)); 
    				break;
    		case 'ruby_dev': 
    				filter(postbacks.backEndPostbacks, 'ruby_dev');
    				sendMessage(senderId, structedRequest(postbacks.backEndPostbacks)); 
    				break;
    		case 'node_dev': 
    				filter(postbacks.backEndPostbacks, 'node_dev');
    				sendMessage(senderId, structedRequest(postbacks.backEndPostbacks)); 
    				break;
    		case 'python_net': 
    				filter(postbacks.scienceReseachPostbacks, 'python_net');
    				sendMessage(senderId, structedRequest(postbacks.scienceReseachPostbacks)); 
    				break;
    		case 'apache': 
    				filter(postbacks.scienceReseachPostbacks, 'apache'); 
    				sendMessage(senderId, structedRequest(postbacks.scienceReseachPostbacks)); 
    				break;
    		case 'html_dev': 
    				filter(postbacks.frontEndPostbacks, 'html_dev'); 
    				sendMessage(senderId, structedRequest(postbacks.frontEndPostbacks)); 
    				break;
    		case 'javaScript_dev': 
    				filter(postbacks.frontEndPostbacks, 'javaScript_dev'); 
    				sendMessage(senderId, structedRequest(postbacks.frontEndPostbacks)); 
    				break;
    		case 'angular': 
    				filter(postbacks.frontEndPostbacks, 'angular');
    				sendMessage(senderId, structedRequest(postbacks.frontEndPostbacks));  
    				break; 
    		case 'finish': 
    				allSenders[senderId].states++;
    				break;		   										
    	}
    	if(postbacks.frontEndPostbacks.length === 1 || postbacks.backEndPostbacks.length === 1 || postbacks.scienceReseachPostbacks === 1){
    		if(allSenders[senderId].states === 2)
    			allSenders[senderId].states++;
    	}
    }else if(allSenders[senderId].states === 3){
    	sendMessage(senderId, {text:"What is last place of your work"});
    	insertData(allSenders[senderId]);
    } 
}

  res.sendStatus(200);
});

function insertData(obj){
		obj.save(function(err, doc){
			if(err) console.log(err);
		});
}

function filter(arr, payloadDel){
	var result = arr.filter(function (el) {
                      return el.payload !== payloadDel;
                 });
    return result;             
}

