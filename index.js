var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var mongoose = require('mongoose');
var util = require('util');
var structedRequest = require('./structed-messages');
var find = require('./find');
var postbacks = require('./postbacks');
var app = express();

var token = "EAAYwwZCxDjikBAH8t9FPj17mZB3cB6l2j4k5tXFM0O0XHV5FcqG0ZCLRXiNEIN6XICUrjqo99sdWjqbXL9ytycJLjDTPIOb50vXhZCoFnvbW45ZAl1opG3ny2OdhXo5RxAoaqwNcoMu7pzHY9WrEQtSjC7XMZBhuxzUpyZBmzGQuwZDZD";
//var regExp = new RegExp(/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/);
var regExp = new RegExp(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/);
var specText = "Choose all skills ? If you choose all skills print finish.";
var saveText = "Do you want save information about you ?";
var chooseLocation = "Choose city where do you live ?";
var emailExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

var phoneExp = new RegExp(/^(\+38|38|8){0,1}[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/);
var currentListPosition = 0;
var currentSpecialization;

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
  email: String,
  phone: String,
	cv_url: String,
  city: String,
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
    var attachedObj = find.findAttachObject(req.body.entry[0].messaging);

    if (event.message && event.message.text && !allSenders[senderId]) {
    	
    	greeting(senderId);
    }
    else if(event.message && event.message.text && allSenders[senderId].states === 1){
    	
    	introducePerson(event, senderId);
    }else if(event.postback && allSenders[senderId].states === 2){

        personLocation(event, senderId);
    }
    else if(event.message && event.message.text && allSenders[senderId].states === 3){
      
      emailValidation(event, senderId);
    }
    else if(event.message && event.message.text && allSenders[senderId].states === 4){
      
      telephoneValidation(event, senderId);
    }
    else if(event.postback && allSenders[senderId].states === 5){
      professionChosing(event, senderId);
    }
    else if(event.postback && allSenders[senderId].states === 6 ){
    	
    	specialization(event, senderId);
    }else if(event.postback && allSenders[senderId].states === 7 ){
      chooseSkills(event, senderId);
    }else if(event.message && event.message.text === 'finish' && allSenders[senderId].states === 7 ){
  		
  		allSenders[senderId].states++;
  		sendMessage(senderId, {text:"What is last place of your work ?"});
    }else if(event.message && event.message.text && allSenders[senderId].states === 8){
  		
  		personExperience(event, senderId);
    }else if(find.findMessageState(req.body.entry[0].messaging) && allSenders[senderId].states === 9){
  		
  		attachedFile(senderId, attachedObj);
  }else if(event.postback && allSenders[senderId].states === 10){
  		saveInformation(event, senderId);	
  } 
}

  res.sendStatus(200);
});


function greeting(senderId){
	 allSenders[senderId] = new client({states: 1});
   sendMessage(senderId, {text: 'Hi. Write Surname and Name'});
}

function introducePerson(event, senderId){
   	allSenders[senderId].states++;
    var FIO = event.message.text.split(' ');
    allSenders[senderId].name = FIO[0] !== undefined ? FIO[0] : 'anonymous';
    allSenders[senderId].surname = FIO[1] !== undefined ? FIO[1] : 'anonymous';
    //sendMessage(senderId, structedRequest(postbacks.specialization, specText));
    sendMessage(senderId, structedRequest(postbacks.locations, chooseLocation));
}

function personLocation(event, senderId){
    switch(event.postback.payload){
        case 'Kiev_postback': 
            allSenders[senderId].city = "Kiev";
            break;
        case 'Kharkiv_postback': 
             allSenders[senderId].city = "Kharkiv";
            break;
        case 'Lviv_postback': 
              allSenders[senderId].city = "Lviv";
            break;
    }

    allSenders[senderId].states++;
    sendMessage(senderId, {text: 'Please enter your email.'});
}

function emailValidation(event, senderId){
    if(emailExp.test(event.message.text)){
      allSenders[senderId].states++;
      allSenders[senderId].email = event.message.text;
      sendMessage(senderId, {text: 'Please enter your mobile phone.'});
    }else{
      sendMessage(senderId, {text: 'Check input information, your email have incorrect format.'});
    }
}

function telephoneValidation(event, senderId){
    if(phoneExp.test(event.message.text)){  
      allSenders[senderId].states++;
      console.log('current state  is ' + allSenders[senderId].states);
      allSenders[senderId].phone = event.message.text;
      sendMessage(senderId, structedRequest(postbacks.specialistType, specText, currentListPosition));
    }else{
      sendMessage(senderId, {text: 'Your phone must match those patterx XXX-XXX-XXXX or XXXXXXXXXX.'});
    }
}

function  professionChosing(event, senderId){
    if(event.postback && event.postback.payload === 'Developer_postback'){
        allSenders[senderId].states++;
        sendMessage(senderId, structedRequest(postbacks.specialization, specText, 0));
    }else if(event.postback && event.postback.payload === 'QA_postback'){
        allSenders[senderId].states++;
        sendMessage(senderId, structedRequest(postbacks.testerSpecialization, specText));
    }else if(event.postback && event.postback.payload === 'PM_postback'){
        allSenders[senderId].states++;
        sendMessage(senderId, structedRequest(postbacks.projectSpecialization, specText));
    }else if(event.postback && event.postback.payload === 'Analyst_postback'){

    }else{
       previousNextButtonNavigation(event, senderId, postbacks.specialistType);
    }
}

function specialization(event, senderId){
  
	console.log(event.postback.payload);
    	if(event.postback && event.postback.payload === 'Frontend_postback'){
        currentSpecialization = postbacks.frontEnd;
    		allSenders[senderId].specialization = 'frontEndDev';
    		sendMessage(senderId, structedRequest(postbacks.frontEnd, specText, 0));
    	}else
    	  if(event.postback && event.postback.payload === 'Android_postback'){
            currentSpecialization = postbacks.Android;
    		    allSenders[senderId].specialization = 'Android';
    		    sendMessage(senderId, structedRequest(postbacks.Android, specText));
    	}else
    		if(event.postback && event.postback.payload === 'Backend_postback'){
            currentSpecialization = postbacks.backEnd;
    		    allSenders[senderId].specialization = 'BackEnd developer';
    		    sendMessage(senderId, structedRequest(postbacks.backEnd, specText, 0));
  
    	}else if(event.postback && event.postback.payload === 'IOS_postback'){
           currentSpecialization = postbacks.IOS;
           allSenders[senderId].specialization = 'IOS developer';
           sendMessage(senderId, structedRequest(postbacks.IOS, specText, 0));
      }
     //  else 
    	// 	if(postbacks.frontEnd.length === 1 || postbacks.backEnd.length === 1){
    	// 		if(postbacks.frontEnd.length === 1) allSenders[senderId].skills.push(postbacks.frontEnd[0].title);
     //      if(postbacks.backEnd.length === 1) allSenders[senderId].skills.push(postbacks.backEnd[0].title);
     //      if(postbacks.science.length === 1) allSenders[senderId].skills.push(postbacks.science[0].title);

     //      allSenders[senderId].states++;
    	// 		sendMessage(senderId, {text:"What is last place of your work"});
    	// }else{
        allSenders[senderId].states++;
        currentListPosition = 0;
  		//	chooseSkills(event, senderId);
}

function chooseSkills(event, senderId){

  var skill = event.postback.payload.toString().split('_')[0];
  console.log(skill);
  console.log(currentSpecialization);
  if(postbacks.backEnd.indexOf(skill) !== -1 ){
        console.log('Choose backEnd language');
        postbacks.backEnd = find.filter(postbacks.backEnd, skill);
        currentSpecialization = postbacks.backEnd;
        sendMessage(senderId, structedRequest(postbacks.backEnd, specText, 0));
  }else if(postbacks.frontEnd.indexOf(skill) !== -1 ){
        postbacks.frontEnd = find.filter(postbacks.frontEnd, skill);
        currentSpecialization = postbacks.frontEnd; 
        sendMessage(senderId, structedRequest(postbacks.frontEnd, specText, 0));
  }else if(postbacks.Android.indexOf(skill) !== -1 ){ 
        postbacks.Android = find.filter(postbacks.Android, skill);
        currentSpecialization = postbacks.Android; 
        sendMessage(senderId, structedRequest(postbacks.Android, specText, 0));
  }else if(postbacks.IOS.indexOf(skill) !== -1 ){ 
        postbacks.IOS = find.filter(postbacks.IOS, skill);
        currentSpecialization = postbacks.IOS; 
        sendMessage(senderId, structedRequest(postbacks.IOS, specText, 0));
  }else{
    previousNextButtonNavigation(event, senderId, currentSpecialization);
  }
  console.log(currentListPosition);
  allSenders[senderId].skills.push(skill);
}

function personExperience(event, senderId){
	var dateTimes = event.message.text.split(' ');
  		var startWorking = new Date(dateTimes[0]);
  		var finishWorking = new Date(dateTimes[1]);

      console.log(dateTimes);
      console.log('timeFirst : ' + startWorking + 'finishWorking : ' + finishWorking);
  
  		if(regExp.test(dateTimes[0]) && regExp.test(dateTimes[1]) ){
  			if(startWorking < finishWorking){	
    			allSenders[senderId].states++;
    			sendMessage(senderId, {text:"Upload CV in doc or pdf format"});
    		}else{
    			sendMessage(senderId, {text:"What is your exrerience? First date must be smaller than second."});
    		}
    	}else{
    		sendMessage(senderId, {text:"What is your exrerience? Input correct data in format YEAR/MM/DAY YEAR/MM/DAY."});
    	}	
}

function attachedFile(senderId, attachedObj){
	if(attachedObj.type === 'file'){
  				allSenders[senderId].cv_url = attachedObj.payload.url;
  				allSenders[senderId].states++;
  				sendMessage(senderId, structedRequest(postbacks.save, saveText)); 
  			}else{
  				sendMessage(senderId, {text:"Please send CV in doc or pdf format"}); 
  			}
}

function saveInformation(event, senderId){
	if(event.postback.payload === 'yes_save'){
  			insertData(allSenders[senderId]);
  			sendMessage(senderId, {text:"All information about you was saved."});
  		}else{
  			sendMessage(senderId, {text:"Good by? we dont savev information about you."});
  		}
}

function previousNextButtonNavigation(event, senderId, buttons){
  if(event.postback && event.postback.payload === 'Next_postback'){
        sendMessage(senderId, structedRequest(buttons, specText, ++currentListPosition));
  }else if(event.postback && event.postback.payload === 'Previous_postback'){
        sendMessage(senderId, structedRequest(buttons, specText, --currentListPosition));
  }
}

function insertData(obj){
    obj.save(function(err, doc){
      if(err) console.log(err);
    });
}

