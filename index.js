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
var specText = "If you want  all skills print finish or prev to return on upper level";
var devBranch = 'Choose all sphere of developing witch you know';
var ITSpeciality = 'Choose sphere of IT witch you are interesting'
var saveText = "Do you want save information about you ?";
var chooseLocation = "Choose city where do you live ?";
var emailExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

var phoneExp = new RegExp(/^(\+38|38|8){0,1}[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/);
var currentListPosition = 0;
var currentSpecialization = null;

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
  ITSpeciality: String,
	devSpecialization: [String],
	skills: [String],
  email: String,
  phone: String,
	cv_url: String,
  city: String,
  experience: String,
	states: Number
});
mongoose.connect('mongodb://alexbulakh707:28031994Alex@ds021172.mlab.com:21172/chatdb');
var client = mongoose.model('clients', Schema, 'clients');
// load DB dates to node JS arrays
postbacks.loadDatabaseInfo();
//----------------------------------------


var allSenders = {};
app.post('/webhook/', function (req, res) {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i]; 
    var senderId = event.sender.id;
    var attachedObj = find.findAttachObject(req.body.entry[0].messaging);
    console.log(req.body.entry[0]);

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
         if(postbacks.specialization.indexOf(event.postback.payload.split('_')[0]) !== -1 
                                                  || event.postback.payload === 'Next_postback' || event.postback.payload === 'Previous_postback'){
    	       specialization(event, senderId);
         }else{
             allSenders[senderId].states++;
             chooseSkills(event, senderId);
         }
    }else if(event.postback && allSenders[senderId].states === 7 && event.postback.payload !== 'Yes_postback' 
                                                                && event.postback.payload !== 'No_postback'){
           chooseSkills(event, senderId);
    }else if(event.message && event.message.text === 'prev' && allSenders[senderId].states === 7 ){
          if(postbacks.testerSpecialization.indexOf(currentSpecialization[0]) === -1 && postbacks.projectSpecialization.indexOf(currentSpecialization[0]) === -1){
             continueChooseWorkSkills(senderId);
          }else{
             sendMessage(senderId, {text:"You couldnot go to upper level. What is last place of your work ?"});
          } 
    }else if(event.message && event.message.text === 'finish' && allSenders[senderId].states === 7){
  		     finishChoosingSkills(senderId);     
    }else if(event.postback && allSenders[senderId].states === 7 &&
                            (event.postback.payload === 'Yes_postback' || event.postback.payload === 'No_postback')){
          if(event.postback.payload === 'Yes_postback'){
              continueChooseWorkSkills(senderId);
          }else{
              finishChoosingSkills(senderId);
          }
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
      allSenders[senderId].phone = event.message.text;
      sendMessage(senderId, structedRequest(postbacks.specialistType, ITSpeciality, currentListPosition));
    }else{
      sendMessage(senderId, {text: 'Your phone must match those patterx XXX-XXX-XXXX or XXXXXXXXXX.'});
    }
}

function  professionChosing(event, senderId){
    if(event.postback && event.postback.payload === 'Developer_postback'){
        allSenders[senderId].states++;
        sendMessage(senderId, structedRequest(postbacks.specialization, devBranch, 0));
    }else if(event.postback && event.postback.payload === 'QA_postback'){
        allSenders[senderId].states++;
        currentSpecialization = postbacks.testerSpecialization;
        sendMessage(senderId, structedRequest(postbacks.testerSpecialization, devBranch));
    }else if(event.postback && event.postback.payload === 'PM_postback'){
        allSenders[senderId].states++;
        currentSpecialization = postbacks.projectSpecialization;
        sendMessage(senderId, structedRequest(postbacks.projectSpecialization, devBranch));
    }else{
       previousNextButtonNavigation(event, senderId, postbacks.specialistType);
       return;
    }
       allSenders[senderId].ITSpeciality = event.postback.payload.split('_')[0];

}

function specialization(event, senderId){

    	if(event.postback && event.postback.payload === 'FrontEnd_postback'){
        postbacks.specialization = find.filter(postbacks.specialization, 'FrontEnd');
        currentSpecialization = postbacks.frontEnd;
    		sendMessage(senderId, structedRequest(postbacks.frontEnd, specText, 0));
    	}else if(event.postback && event.postback.payload === 'Android_postback'){
            postbacks.specialization = find.filter(postbacks.specialization, 'Android');
            currentSpecialization = postbacks.Android;
    		    sendMessage(senderId, structedRequest(postbacks.Android, specText, 0));
    	}else if(event.postback && event.postback.payload === 'BackEnd_postback'){
            postbacks.specialization = find.filter(postbacks.specialization, 'Backend');
            currentSpecialization = postbacks.backEnd;
    		    sendMessage(senderId, structedRequest(postbacks.backEnd, specText, 0));
    	}else if(event.postback && event.postback.payload === 'IOS_postback'){
           postbacks.specialization = find.filter(postbacks.specialization, 'IOS');
           currentSpecialization = postbacks.IOS;
           sendMessage(senderId, structedRequest(postbacks.IOS, specText, 0));
      }else if(event.postback.payload === 'Next_postback' || event.postback.payload === 'Previous_postback'){
           previousNextButtonNavigation(event, senderId, postbacks.specialization);
        return;
      }
           allSenders[senderId].devSpecialization.push(event.postback.payload.split('_')[0]);
           allSenders[senderId].states++;
           currentListPosition = 0;
}

function continueChooseWorkSkills(senderId){
    allSenders[senderId].states = 6;
    sendMessage(senderId, structedRequest(postbacks.specialization, specText, 0));
}

function finishChoosingSkills(senderId){
     allSenders[senderId].states++;
     sendMessage(senderId, {text:"What is last place of your work ?"});
}

function lastWorkExperience(senderId){
     sendMessage(senderId, structedRequest(postbacks.save, 'If you dont choose all skills press YES to continue, else NO'));   
}

function chooseSkills(event, senderId){
  var skill = event.postback.payload.toString().split('_')[0];
  var skillsSpecialization = postbacks.findSpecs(skill);
  if(skillsSpecialization === null){
       previousNextButtonNavigation(event, senderId, currentSpecialization);
       return;
  }else if(skillsSpecialization.length !== 0){
      currentSpecialization = skillsSpecialization;
      sendMessage(senderId, structedRequest(skillsSpecialization, specText, currentListPosition));
  }else if(postbacks.testerSpecialization.length === 0 || postbacks.projectSpecialization.length === 0){
      finishChoosingSkills(senderId);      
  }else{
      lastWorkExperience(senderId);
  }
  allSenders[senderId].skills.push(skill);
}

function personExperience(event, senderId){
	var dateTimes = event.message.text.split(' ');
  		var startWorking = new Date(dateTimes[0]);
  		var finishWorking = new Date(dateTimes[1]);
  
  		if(regExp.test(dateTimes[0]) && regExp.test(dateTimes[1]) ){
  			if(startWorking < finishWorking){	
    			allSenders[senderId].states++;
          allSenders[senderId].exrerience = (finishWorking - startWorking).toString();
    			sendMessage(senderId, {text:"Upload CV in doc or pdf format"});
    		}else{
    			sendMessage(senderId, {text:"What is your exrerience? First date must be smaller than second."});
    		}
    	}else{
    		sendMessage(senderId, {text:"What is your exrerience? Input correct data in format YEAR/MM/DAY YEAR/MM/DAY."});
    	}	
}

function attachedFile(senderId, attachedObj){
	if(attachedObj === null){
      sendMessage(senderId, {text:"Please send CV in doc or pdf"});  
  }else if(attachedObj.type === 'file'){
  		allSenders[senderId].cv_url = attachedObj.payload.url;
      allSenders[senderId].states++;
      sendMessage(senderId, structedRequest(postbacks.save, saveText));
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
        sendMessage(senderId, structedRequest(buttons, 'List variants using Next and Previous button', ++currentListPosition));
  }else if(event.postback && event.postback.payload === 'Previous_postback'){
        sendMessage(senderId, structedRequest(buttons, 'List variants using Next and Previous button', --currentListPosition));
  }
}

function insertData(obj){
    obj.save(function(err, doc){
      if(err) console.log(err);
    });
}

