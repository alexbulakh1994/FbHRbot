var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var mongoose = require('mongoose');
var util = require('util');
var structedRequest = require('./structed-messages');
var postbacks = require('./postbacks');
var app = express();

var token = "EAAYwwZCxDjikBAH8t9FPj17mZB3cB6l2j4k5tXFM0O0XHV5FcqG0ZCLRXiNEIN6XICUrjqo99sdWjqbXL9ytycJLjDTPIOb50vXhZCoFnvbW45ZAl1opG3ny2OdhXo5RxAoaqwNcoMu7pzHY9WrEQtSjC7XMZBhuxzUpyZBmzGQuwZDZD";
// var technick_payloads = ['ruby_dev', 'python_dev', 'node_dev', 'html_dev', 'javaScript_dev', 'angular', 'python_net', 'apache', 'finish'];
// var spec_payloads = ['frontEnd_dev', 'science', 'backEnd_dev'];
var regExp = new RegExp(/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/);
var specText = "Choose all skills ? If you choose all skills print finish.";
var saveText = "Do you want save information about you ?";

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
  }else
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
	specialization: String,
	skills: [String],
	cv_url: String,
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
       sendMessage(senderId, {text: 'Hi. Write Surname and Name'});

    }
    else if(event.message && event.message.text && allSenders[senderId].states === 1){
    	 sendMessage(senderId, structedRequest(postbacks.specialization, specText));
    	 allSenders[senderId].states++;
    	 var FIO = event.message.text.split(' ');
    	 allSenders[senderId].name = FIO[0] !== undefined ? FIO[0] : 'anonymous';
    	 allSenders[senderId].surname = FIO[1] !== undefined ? FIO[1] : 'anonymous';
    	
    }
    else if(event.postback && allSenders[senderId].states === 2 ){
    	console.log(event.postback.payload);
    	if(event.postback && event.postback.payload === 'frontEnd_dev'){
    		allSenders[senderId].specialization = 'frontEndDev';
    		sendMessage(senderId, structedRequest(postbacks.frontEnd, specText));
    	}else
    	if(event.postback && event.postback.payload === 'science'){
    		allSenders[senderId].specialization = 'Science Reseacher';
    		sendMessage(senderId, structedRequest(postbacks.science, specText));
    	}else
    		if(event.postback && event.postback.payload === 'backEnd_dev'){
    		allSenders[senderId].specialization = 'Back End developer';
    		sendMessage(senderId, structedRequest(postbacks.backEnd, specText));
  
    	}else 
    		if(postbacks.frontEnd.length === 1 || postbacks.backEnd.length === 1 || postbacks.science.length === 1){
    			allSenders[senderId].states++;
    			sendMessage(senderId, {text:"What is last place of your work"});
    	}else{
    	switch(event.postback.payload){
    		case 'python_dev': 
    				postbacks.backEnd = filter(postbacks.backEnd, 'python_dev');
    				allSenders[senderId].skills.push('python_dev');
    				sendMessage(senderId, structedRequest(postbacks.backEnd, specText)); 
    				break;
    		case 'ruby_dev': 
    				postbacks.backEnd = filter(postbacks.backEnd, 'ruby_dev');
    				allSenders[senderId].skills.push('ruby_dev');
    				sendMessage(senderId, structedRequest(postbacks.backEnd, specText)); 
    				break;
    		case 'node_dev': 
    				postbacks.backEnd = filter(postbacks.backEnd, 'node_dev');
    				allSenders[senderId].skills.push('node_dev');
    				sendMessage(senderId, structedRequest(postbacks.backEnd, specText)); 
    				break;
    		case 'python_net': 
    				postbacks.science = filter(postbacks.science, 'python_net');
    				allSenders[senderId].skills.push('python_net');
    				sendMessage(senderId, structedRequest(postbacks.science, specText)); 
    				break;
    		case 'apache': 
    				postbacks.science = filter(postbacks.science, 'apache');
    				allSenders[senderId].skills.push('apache');
    				sendMessage(senderId, structedRequest(postbacks.science, specText)); 
    				break;
    		case 'html_dev': 
    				postbacks.frontEnd = filter(postbacks.frontEnd, 'html_dev');
    				allSenders[senderId].skills.push('html_dev');
    				sendMessage(senderId, structedRequest(postbacks.frontEnd, specText)); 
    				break;
    		case 'javaScript_dev': 
    				postbacks.frontEnd = filter(postbacks.frontEnd, 'javaScript_dev');
    				allSenders[senderId].skills.push('javaScript_dev'); 
    				sendMessage(senderId, structedRequest(postbacks.frontEnd, specText)); 
    				break;
    		case 'angular': 
    				postbacks.frontEnd = filter(postbacks.frontEnd, 'angular');
    				allSenders[senderId].skills.push('angular');
    				sendMessage(senderId, structedRequest(postbacks.frontEnd, specText));  
    				break; 		   										
    	}	
    }
  }else if(event.message && event.message.text === 'finish' && allSenders[senderId].states === 2 ){
  			allSenders[senderId].states++;
  			sendMessage(senderId, {text:"What is last place of your work"});
  }else if(event.message && event.message.text && allSenders[senderId].states === 3){
  		
  		var dateTimes = event.message.text.split(' ');
  		var startWorking = new Date(dateTimes[0]);
  		var finishWorking = new Date(dateTimes[1]);
  
  		if(regExp.test(dateTimes[0]) && regExp.test(dateTimes[1]) ){
  			if(startWorking < finishWorking){	
  				console.log('states is' + allSenders[senderId].states);
    			allSenders[senderId].states++;
    			sendMessage(senderId, {text:"Upload CV in doc or pdf format"});
    		}else{
    			sendMessage(senderId, {text:"What is your exrerience? First date must be smaller than second."});
    		}
    	}else{
    		sendMessage(senderId, {text:"What is your exrerience? Input correct data in format DAY/MM/YEAR DAY/MM/YEAR."});
    	}	
  }else if(allSenders[senderId].states === 4){
  		console.log(util.inspect(req.body, {showHidden: false, depth: null}));
  		console.log('Obj attach is:');
  		console.log(util.inspect(attachObj(req.body.entry[0].messaging), {showHidden: false, depth: null}));
  			// if(attachObj(req.body.entry[0].messaging).type === 'file'){
  			// 	allSenders[senderId].cv_url = attachObj(req.body.entry[0].messaging).payload.url;
  			// 	allSenders[senderId].states++;
  			// 	sendMessage(senderId, structedRequest(postbacks.save, saveText)); 
  			// }else{
  			// 	sendMessage(senderId, {text:"Please send CV in doc or pdf format"}); 
  			// }
  }else if(event.postback && allSenders[senderId].states === 5){
  		if(event.postback.payload === 'yes_save'){
  			insertData(allSenders[senderId]);
  			sendMessage(senderId, {text:"All information about you was saved."});
  		}else{
  			sendMessage(senderId, {text:"Good by? we dont savev information about you."});
  		}
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

var attachObj = function(messageArray){
	for(var i = 0; i < messageArray.length; i++){
		if(messageArray[i].hasOwnProperty('message'))
			if(messageArray[i].message.hasOwnProperty('attachments'))
				return messageArray[i].message.attachments[0];
			
	}
}