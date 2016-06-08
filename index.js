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

var regExp = new RegExp(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/);

////////////-------------informative message title------------ ///////////////////////////////////////
var specText = "If you choose all skills print finish or you could type prev for continue choosing skill in section (BackEnd, FrontEnd, IOS, Android)";
var devBranch = 'Choose all sphere of developing which you know';
var ITSpeciality = 'Choose sphere of IT which you are interesting'
var saveText = "Do you want save information about you ?";
var chooseLocation = "Choose city where do you live ?";

////////////////---------regex for email and phone------------///////////////////////
var emailExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
var phoneExp = new RegExp(/^(\+38|38|8){0,1}[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/);

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

// -----------------database shema object structure
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
////////////-----connecting to DB
mongoose.connect('mongodb://alexbulakh707:28031994Alex@ds021172.mlab.com:21172/chatdb');
var client = mongoose.model('clients', Schema, 'clients');
// load DB dates to node JS arrays
 postbacks.loadDatabaseInfo();
//----------------------------------------

////////----main itration threw state in witch uset situated--------
var allSenders = {};
app.post('/webhook/', function (req, res) {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i]; 
    var senderId = event.sender.id;
        var attachedObj = find.findAttachObject(req.body.entry[0].messaging);
        if (event.message && event.message.text && !allSenders[senderId]) {
             allSenders[senderId] = true;
        	   greeting(senderId);
             postbacks.gettingClientsDBData(allSenders[senderId]);
        }
        else if(event.message && event.message.text && allSenders[senderId].states === 1){
        	   introducePerson(event, senderId);
        }else if(event.postback && allSenders[senderId].states === 2){
             personLocation(event, senderId);
        }else if(event.postback && allSenders[senderId].states === 3){
             chooseInformationTypeInputing(event,senderId);
             console.log('state in chooseInformationTypeInputing : ' + allSenders[senderId].states);
        }else if(event.message && event.message.text && allSenders[senderId].states === 4){
             emailValidation(event, senderId);
             console.log('state in emailValidation : ' + allSenders[senderId].states);
        }
        else if(event.message && event.message.text && allSenders[senderId].states === 5){
             telephoneValidation(event, senderId);
             console.log('state in telephoneValidation : ' + allSenders[senderId].states);
        }
        else if(event.postback && allSenders[senderId].states === 6){
             professionChosing(event, senderId);
             console.log('state in professionChosing : ' + allSenders[senderId].states);
        }
        else if(event.postback && allSenders[senderId].states === 7 ){
             if(allSenders[senderId].specialization.indexOf(event.postback.payload.split('_')[0]) !== -1 
                                                      || event.postback.payload === 'Next_postback' || event.postback.payload === 'Previous_postback'){
        	       specialization(event, senderId);
             }else{
                 allSenders[senderId].states++;
                 chooseSkills(event, senderId);
             }
             console.log('state in specialization : ' + allSenders[senderId].states);
        }else if(event.postback && allSenders[senderId].states === 8 && event.postback.payload !== 'Yes_postback' 
                                                                    && event.postback.payload !== 'No_postback'){
               chooseSkills(event, senderId);
               console.log('state in chooseSkills : ' + allSenders[senderId].states);
        }else if(event.message && event.message.text === 'prev' && allSenders[senderId].states === 8 ){
              if(allSenders[senderId].testerSpecialization.indexOf(allSenders[senderId].currentSpecialization[0]) === -1 && 
                                        allSenders[senderId].projectSpecialist.indexOf(allSenders[senderId].currentSpecialization[0]) === -1){
                 continueChooseWorkSkills(senderId);
              }else{
                 sendMessage(senderId, {text:"You couldnot go to upper level. What is last place of your work ?"});
              } 
        }else if(event.message && event.message.text === 'finish' && allSenders[senderId].states === 8){
      		     finishChoosingSkills(senderId);     
        }else if(event.postback && allSenders[senderId].states === 8 && (event.postback.payload === 'Yes_postback' || event.postback.payload === 'No_postback')){
              if(event.postback.payload === 'Yes_postback'){
                  continueChooseWorkSkills(senderId);
              }else{
                  finishChoosingSkills(senderId);
              }
        }else if(event.postback  && allSenders[senderId].states === 9){
             skipContinueState(event,senderId);
        }else if(event.message && event.message.text && allSenders[senderId].states === 10){
            personExperience(event, senderId);
        }else if(event.message && event.message.text && allSenders[senderId].states === 11){
            haveCVORNot(event, senderId);
        }else if(event.message && event.message.text && allSenders[senderId].states === 12){
      		  attachedFile(senderId, attachedObj);
        }else if(find.findMessageState(req.body.entry[0].messaging) && allSenders[senderId].states === 13){
      		
      }else if(event.postback && allSenders[senderId].states === 14){
      		saveInformation(event, senderId);	
      } 
  }

  res.sendStatus(200);
});


function greeting(senderId){
	 allSenders[senderId] = new client({states: 1});
   sendMessage(senderId, {text: 'Hellow, welcome to DataRoot team. You have started to communicate with our HR-bot.' +
                                'He will ask you a few professional questions, gather all the necessary information. We will review it and contact with you. '+
                                 'Please type your Name and Surname.'});
}

function introducePerson(event, senderId){
   	allSenders[senderId].states++;
    var FIO = event.message.text.split(' ');
    allSenders[senderId].name = FIO[0] !== undefined ? FIO[0] : 'anonymous';
    allSenders[senderId].surname = FIO[1] !== undefined ? FIO[1] : 'anonymous';
    sendMessage(senderId, structedRequest(allSenders[senderId].locations, chooseLocation));
}

function personLocation(event, senderId){
    allSenders[senderId].city = event.postback.payload.split('_')[0];
    allSenders[senderId].states++;
    // sendMessage(senderId, {text: 'Please enter your email.'});
    sendMessage(senderId, structedRequest(postbacks.themselvesInformationType, 'Choose type of information which you want tell us about yourthelf.'));
}

function chooseInformationTypeInputing(event, senderId){
    if(event.postback.payload === 'phone number_postback'){
        allSenders[senderId].states += 2;
         sendMessage(senderId, {text: 'Please enter your mobile phone.'});
         allSenders[senderId].typeInformationChoosing = 'phone number';
    }else if(event.postback.payload === 'email_postback'){
        allSenders[senderId].states++;
        allSenders[senderId].typeInformationChoosing = 'email';
        sendMessage(senderId, {text: 'Please enter your email.'});
    }else{
        allSenders[senderId].states++;
        sendMessage(senderId, {text: 'Please enter your email.'});
    }
}

function emailValidation(event, senderId){
    if(emailExp.test(event.message.text)){
      if(allSenders[senderId].typeInformationChoosing === 'email'){
          allSenders[senderId].states += 2;
          sendMessage(senderId, structedRequest(allSenders[senderId].specialistType, ITSpeciality, allSenders[senderId].currentListPosition));
      }else{
          allSenders[senderId].states++;
           sendMessage(senderId, {text: 'Please enter your mobile phone.'});
      }  
      allSenders[senderId].email = event.message.text;
    }else{
      sendMessage(senderId, {text: 'Check input information, your email have incorrect format.'});
    }
}

function telephoneValidation(event, senderId){
    if(phoneExp.test(event.message.text)){  
      allSenders[senderId].states++;
      allSenders[senderId].phone = event.message.text;
      allSenders[senderId].currentListPosition = 0;
      sendMessage(senderId, structedRequest(allSenders[senderId].specialistType, ITSpeciality, allSenders[senderId].currentListPosition));
    }else{
      sendMessage(senderId, {text: 'Your phone must match those patterx XXX-XXX-XXXX or XXXXXXXXXX.'});
    }
}

function  professionChosing(event, senderId){
    if(event.postback && event.postback.payload === 'Developer_postback'){
        allSenders[senderId].states++;
        sendMessage(senderId, structedRequest(allSenders[senderId].specialization, devBranch, 0));
    }else if(event.postback && event.postback.payload === 'QA_postback'){
        allSenders[senderId].states++;
        allSenders[senderId].currentSpecialization = allSenders[senderId].testerSpecialization;
        sendMessage(senderId, structedRequest(allSenders[senderId].testerSpecialization, devBranch,0));
    }else if(event.postback && event.postback.payload === 'PM_postback'){
        allSenders[senderId].states++;
        allSenders[senderId].currentSpecialization = allSenders[senderId].projectSpecialization;
        sendMessage(senderId, structedRequest(allSenders[senderId].projectSpecialization, devBranch, 0));
    }else{
       previousNextButtonNavigation(event, senderId, allSenders[senderId].specialistType);
       return;
    }
       allSenders[senderId].ITSpeciality = event.postback.payload.split('_')[0];

}

function specialization(event, senderId){
    	if(event.postback && event.postback.payload === 'FrontEnd_postback'){
            allSenders[senderId].specialization = find.filter(allSenders[senderId].specialization, 'FrontEnd');
            allSenders[senderId].currentSpecialization = allSenders[senderId].frontEndPostbacks;
        		sendMessage(senderId, structedRequest(allSenders[senderId].frontEndPostbacks, specText, 0));
    	}else if(event.postback && event.postback.payload === 'Android_postback'){
            allSenders[senderId].specialization = find.filter(allSenders[senderId].specialization, 'Android');
            allSenders[senderId].currentSpecialization = allSenders[senderId].Android;
    		    sendMessage(senderId, structedRequest(allSenders[senderId].Android, specText, 0));
    	}else if(event.postback && event.postback.payload === 'BackEnd_postback'){
            allSenders[senderId].specialization = find.filter(allSenders[senderId].specialization, 'BackEnd');
            allSenders[senderId].currentSpecialization = allSenders[senderId].backEndPostbacks;
    		    sendMessage(senderId, structedRequest(allSenders[senderId].backEndPostbacks, specText, 0));
    	}else if(event.postback && event.postback.payload === 'IOS_postback'){
           allSenders[senderId].specialization = find.filter(allSenders[senderId].specialization, 'IOS');
           allSenders[senderId].currentSpecialization = allSenders[senderId].IOS;
           sendMessage(senderId, structedRequest(allSenders[senderId].IOS, specText, 0));
      }else if(event.postback.payload === 'Next_postback' || event.postback.payload === 'Previous_postback'){
           previousNextButtonNavigation(event, senderId, allSenders[senderId].specialization);
        return;
      }
           allSenders[senderId].devSpecialization.push(event.postback.payload.split('_')[0]);
           allSenders[senderId].states++;
           allSenders[senderId].currentListPosition = 0;
}

function continueChooseWorkSkills(senderId){
    allSenders[senderId].states = 6;
    sendMessage(senderId, structedRequest(allSenders[senderId].specialization, specText, 0));
}

function finishChoosingSkills(senderId){
     console.log('finishChoosingSkills calling ' + allSenders[senderId].states);
     allSenders[senderId].states++;
     sendMessage(senderId, structedRequest(allSenders[senderId].savePostback, 'Please choose variant to continue'));
}

function lastWorkExperience(senderId){
     sendMessage(senderId, structedRequest(allSenders[senderId].savePostback, 'If you dont choose all skills press YES to continue, else NO'));   
}

function chooseSkills(event, senderId){
  var skill = event.postback.payload.toString().split('_')[0];
  var skillsSpecialization = postbacks.findSpecs(allSenders[senderId], skill);
  if(skillsSpecialization === null){
       previousNextButtonNavigation(event, senderId, allSenders[senderId].currentSpecialization);
       return;
  }else if(skillsSpecialization.length !== 0){
      allSenders[senderId].currentSpecialization = skillsSpecialization;
      sendMessage(senderId, structedRequest(skillsSpecialization, 'Press finish - for going choosing year experience', allSenders[senderId].currentListPosition));
  }else if(allSenders[senderId].testerSpecialization.length === 0 || allSenders[senderId].projectSpecialization.length === 0){
      finishChoosingSkills(senderId);      
  }else{
      lastWorkExperience(senderId);
  }
  allSenders[senderId].skills.push(skill);
}

function skipContinueState(event, senderId){
    console.log('finishChoosingSkills calling ' + allSenders[senderId].states);
    if(event.postback.payload === 'Yes_postback'){
         allSenders[senderId].states++; 
         sendMessage(senderId, {text:"What is last place of your work ?"});  
    }else{
         allSenders[senderId].states += 2;
         sendMessage(senderId, structedRequest(allSenders[senderId].savePostback, 'Do you have CV ?'));   
    }
}

function haveCVORNot(event, senderId){
        if(event.postback.payload === 'Yes_postback'){
         allSenders[senderId].states++; 
         sendMessage(senderId, {text:"PLese send CV on doc or pdf format."});  
    }else{
         allSenders[senderId].states +=2;
         sendMessage(senderId, structedRequest(allSenders[senderId].savePostback, saveText));   
    }
}

function personExperience(event, senderId){
	var dateTimes = event.message.text.split(' ');
  		var startWorking = new Date(dateTimes[0]);
  		var finishWorking = new Date(dateTimes[1]);
  
  		if(regExp.test(dateTimes[0]) && regExp.test(dateTimes[1]) ){
  			if(startWorking < finishWorking){	
    			allSenders[senderId].states++;
          allSenders[senderId].exrerience = (finishWorking - startWorking).toString();
    			sendMessage(senderId, structedRequest(allSenders[senderId].savePostback, 'Do you have CV ?')); 
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
      sendMessage(senderId, structedRequest(allSenders[senderId].savePostback, saveText));
  }
}

function saveInformation(event, senderId){
 // console.log(allSenders[senderId]);
	if(event.postback.payload === 'Yes_postback'){
  			insertData(allSenders[senderId]);
  			sendMessage(senderId, {text:"All information about you was saved."});
  		}else{
  			sendMessage(senderId, {text:"Goodbye! We dont save information about you."});
  		}
      allSenders[senderId] = {};
}

function previousNextButtonNavigation(event, senderId, buttons){
  if(event.postback && event.postback.payload === 'Next_postback'){
        sendMessage(senderId, structedRequest(buttons, 'List variants using Next and Previous button', ++allSenders[senderId].currentListPosition));
  }else if(event.postback && event.postback.payload === 'Previous_postback'){
        sendMessage(senderId, structedRequest(buttons, 'List variants using Next and Previous button', --allSenders[senderId].currentListPosition));
  }
}

function insertData(obj){
    obj.save(function(err, doc){
      if(err) console.log(err);
    });
}



