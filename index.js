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
var specText = 'Choose from a list of all the skills you possess. When you choose all skills type \\finish for going to next section. \n'+
							' If you have skills which does not situated in list, add this skills in Additional Section \n. You could restart working with HR bot typing \\restart \n';
var devBranch = 'Choose sphere of developer specialization which you know. If you choose all skills in this specialization type prev - for choosing 1 more specalization.';
var ITSpeciality = 'Choose sphere of IT which you are interesting.'
var saveText = "Do you want save information about you ?";
var chooseLocation = "Choose city where do you live ? If you do not find it in the list type name of your city into the message box.";

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
	messageData.forEach(function(item, i, arr){
				request({
					url: 'https://graph.facebook.com/v2.6/me/messages',
					qs: {access_token:token},
					method: 'POST',
					json: {
						recipient: {id:sender},
						message: item,
					}
				}, function(error, response, body) {
					if (error) {
						console.log('Error sending message: ', error);
					} else if (response.body.error) {
						console.log('Error: ', response.body.error);
					}
				});
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
				}else if(event.message && event.message.text === '\\restart' ){
						 delete allSenders[senderId];
						 sendMessage(senderId, [{text: 'You stopping chat with HR bot.'}]);
				} 
				else if(event.message && event.message.text && allSenders[senderId].states === 1){
						 introducePerson(event, senderId);
				}else if((event.postback || (event.message && event.message.text)) && allSenders[senderId].states === 2){
						 personLocation(event, senderId);
				}else if(event.postback && allSenders[senderId].states === 3){
						 chooseInformationTypeInputing(event,senderId);
				}else if(event.message && event.message.text && allSenders[senderId].states === 4){
						 emailValidation(event, senderId);
				}
				else if(event.message && event.message.text && allSenders[senderId].states === 5){
						 telephoneValidation(event, senderId);
				}
				else if(event.postback && allSenders[senderId].states === 6){
						 professionChosing(event, senderId);
				}
				else if(event.postback && allSenders[senderId].states === 7 ){
						 if(allSenders[senderId].currentSpecialization === undefined || 
							 (allSenders[senderId].testerSpecialization.indexOf(allSenders[senderId].currentSpecialization[0]) === - 1 && 
																									allSenders[senderId].projectSpecialist.indexOf(allSenders[senderId].currentSpecialization[0]) === - 1)){ //if undefined tan currentSpecialization is Developer (default)
								 specialization(event, senderId);
						 }else{
								 allSenders[senderId].states++;
								 chooseSkills(event, senderId);
						 }
				}else if(event.postback && allSenders[senderId].states === 8){
							 chooseSkills(event, senderId);
				}else if(event.message && event.message.text === 'prev' && allSenders[senderId].states === 8 ){
							if(allSenders[senderId].testerSpecialization.indexOf(allSenders[senderId].currentSpecialization[0]) === -1 && 
																				allSenders[senderId].projectSpecialist.indexOf(allSenders[senderId].currentSpecialization[0]) === -1){
								 continueChooseWorkSkills(senderId);
							}else{
								 sendMessage(senderId, [{text:"You couldnot go to upper level. What is last place of your work ?"}]);
							} 
				}else if(event.message && event.message.text === '\\finish' && allSenders[senderId].states === 8){
							 finishChoosingSkills(senderId);     
				}else if(event.postback && allSenders[senderId].states === 8 && (event.postback.payload === 'Yes_postback' || event.postback.payload === 'No_postback')){
							if(event.postback.payload === 'Yes_postback'){
									continueChooseWorkSkills(senderId);
							}else{
									finishChoosingSkills(senderId);
							}
				}else if(event.postback  && allSenders[senderId].states === 9){
						 yesNoChoosenState(event, senderId, 'Do you have CV ?', 3, {text:"What is last place of your work ?"});
				}else if(event.message && event.message.text && allSenders[senderId].states === 10){
						personExperience(event, senderId);
				}else if(event.message && event.message.text && allSenders[senderId].states === 11){
						yearExperience(event, senderId);
				}else if(event.postback && allSenders[senderId].states === 12){
						yesNoChoosenState(event, senderId, 'Do you want save information about you ?', 2, {text:"Please send CV on doc or pdf format."});
				}else if(event.message && allSenders[senderId].states === 13){
						attachedFile(senderId, attachedObj);
				}else if(event.message && event.message.text && allSenders[senderId].states === 14){
					 additionalInformation(event, senderId);	
				}else if(event.postback && allSenders[senderId].states === 15){
						saveInformation(event, senderId);
				}
	}

	res.sendStatus(200);
});


function greeting(senderId){
	 allSenders[senderId] = new client({states: 1});
	 sendMessage(senderId, [{text: 'Hellow, welcome to DataRoot team. You have started to communicate with our HR-bot.' +
																'He will ask you a few professional questions, gather all the necessary information. We will review it and contact with you. ' +
																'You could stop chatting with bot pressing \\restart. '+
																'Please type your Name and Surname.'}]);
}

function introducePerson(event, senderId){
		allSenders[senderId].states++;
		var FIO = event.message.text.split(' ');
		allSenders[senderId].name = FIO[0] !== undefined ? FIO[0] : 'anonymous';
		allSenders[senderId].surname = FIO[1] !== undefined ? FIO[1] : 'anonymous';
		sendMessage(senderId, structedRequest(allSenders[senderId].locations, chooseLocation));
		console.log('I am in introducePerson method ');
}

function personLocation(event, senderId){
		if(event.postback !== undefined ){
				allSenders[senderId].city = event.postback.payload.split('_')[0];
		}else{
				allSenders[senderId].city = event.message.text;
		}
		allSenders[senderId].states++;
		sendMessage(senderId, structedRequest(postbacks.themselvesInformationType, 'Select the method by which you would be comfortable to contact with us.'));
}

function chooseInformationTypeInputing(event, senderId){
		if(event.postback.payload === 'phone number_postback'){
				allSenders[senderId].states += 2;
				 sendMessage(senderId, [{text: 'Please enter your mobile phone.'}]);
				 allSenders[senderId].typeInformationChoosing = 'phone number';
		}else if(event.postback.payload === 'email_postback'){
				allSenders[senderId].states++;
				allSenders[senderId].typeInformationChoosing = 'email';
				sendMessage(senderId, [{text: 'Please enter your email.'}]);
		}else{
				allSenders[senderId].states++;
				sendMessage(senderId, [{text: 'Please enter your email.'}]);
		}
}

function emailValidation(event, senderId){
		if(emailExp.test(event.message.text)){
			if(allSenders[senderId].typeInformationChoosing === 'email'){
					allSenders[senderId].states += 2;
					sendMessage(senderId, structedRequest(allSenders[senderId].specialistType, ITSpeciality));
			}else{
					allSenders[senderId].states++;
					 sendMessage(senderId, [{text: 'Please enter your mobile phone.'}]);
			}  
			allSenders[senderId].email = event.message.text;
		}else{
			sendMessage(senderId, [{text: 'Check input information, your email have incorrect format.'}]);
		}
}

function telephoneValidation(event, senderId){
		if(phoneExp.test(event.message.text)){  
			allSenders[senderId].states++;
			allSenders[senderId].phone = event.message.text;
			sendMessage(senderId, structedRequest(allSenders[senderId].specialistType, ITSpeciality));
		}else{
			sendMessage(senderId, [{text: 'Your phone must match those patterx XXX-XXX-XXXX or XXXXXXXXXX.'}]);
		}
}

function  professionChosing(event, senderId){
		if(event.postback && event.postback.payload === 'Developer_postback'){
				allSenders[senderId].states++;
				sendMessage(senderId, [{text: devBranch}]);
				sendMessage(senderId, structedRequest(allSenders[senderId].specialization, 'Developer Specialization'));
		}else if(event.postback && event.postback.payload === 'QA_postback'){
				allSenders[senderId].states++;
				allSenders[senderId].currentSpecialization = allSenders[senderId].testerSpecialization;
				sendMessage(senderId, [{ text: postbacks.printSkillList(allSenders[senderId].currentSpecialization, specText)}]);
				sendMessage(senderId, structedRequest(allSenders[senderId].testerSpecialization, 'tester skills'));
		}else if(event.postback && event.postback.payload === 'PM_postback'){
				allSenders[senderId].states++;
				allSenders[senderId].currentSpecialization = allSenders[senderId].projectSpecialist;
				sendMessage(senderId, [{ text: postbacks.printSkillList(allSenders[senderId].currentSpecialization, specText)}]);
				sendMessage(senderId, structedRequest(allSenders[senderId].projectSpecialist, 'project manager skills', 0));
		}
			 allSenders[senderId].ITSpeciality = event.postback.payload.split('_')[0];
}

function specialization(event, senderId){
		var spec =  event.postback.payload.split('_')[0];
		
		allSenders[senderId].specialization = find.filter(allSenders[senderId].specialization, spec);
		allSenders[senderId].currentSpecialization = postbacks.choosedDevSpecialization(allSenders[senderId], spec);;
		sendMessage(senderId, [{ text : postbacks.printSkillList(allSenders[senderId].currentSpecialization, specText)}]);
		sendMessage(senderId, structedRequest(allSenders[senderId].currentSpecialization, 'skills'));

		allSenders[senderId].devSpecialization.push(spec);
		allSenders[senderId].states++;
}

function continueChooseWorkSkills(senderId){
		allSenders[senderId].states = 7;
		sendMessage(senderId, structedRequest(allSenders[senderId].specialization, specText));
}

function finishChoosingSkills(senderId){
		 console.log('finishChoosingSkills calling ' + allSenders[senderId].states);
		 allSenders[senderId].states++;
		 sendMessage(senderId, structedRequest(allSenders[senderId].savePostback, 'Do you have work experience ?'));
}

function lastWorkExperience(senderId){
		 sendMessage(senderId, structedRequest(allSenders[senderId].savePostback, 'If you dont choose all skills press YES to continue, else NO'));   
}

function chooseSkills(event, senderId){
	var skill = event.postback.payload.toString().split('_')[0]; 

	if(allSenders[senderId].skills.indexOf(skill) !== -1){
		sendMessage(senderId, [{text: "Hey \u263A. You already choose this skill earlier, please choose another."}]);
		return;
	}

	var skillsSpecialization = postbacks.findSpecs(allSenders[senderId], skill);
	if(skillsSpecialization === null){
			 console.log('find null in chooseSkills ');
			 return;
	}else if(skillsSpecialization.length !== 0){
			allSenders[senderId].currentSpecialization = skillsSpecialization;
	}else if(allSenders[senderId].testerSpecialization.length === 0 || allSenders[senderId].projectSpecialist.length === 0){
			finishChoosingSkills(senderId);      
	}else{
			lastWorkExperience(senderId);
	}
	allSenders[senderId].skills.push(skill);
}

function yesNoChoosenState(event, senderId, informativeMessage, stepChangeState, botQuestion){
		if(event.postback.payload === 'Yes_postback'){
				 allSenders[senderId].states++; 
				 sendMessage(senderId, [botQuestion]);
		}else{
				 if(allSenders[senderId].states === 12){
						sendMessage(senderId, [{text: 'Please send some additional information about you.'}]);
				 }else{
						sendMessage(senderId, structedRequest(allSenders[senderId].savePostback, informativeMessage)); //informativeMessage  
				 }   
				 allSenders[senderId].states += stepChangeState;
		}
}

function personExperience(event, senderId){
		 allSenders[senderId].states++;
		 sendMessage(senderId,  [{text:'PLease type period when you work in the last place? Use those pattern YEAR/MM/DAY YEAR/MM/DAY.'}]);
}

function yearExperience(event, senderId){
			var dateTimes = event.message.text.split(' ');
			var startWorking = new Date(dateTimes[0]);
			var finishWorking = new Date(dateTimes[1]);
	
			if(regExp.test(dateTimes[0]) && regExp.test(dateTimes[1]) ){
				
				if(finishWorking > new Date()){
					 sendMessage(senderId, [{text:"You finish working date is greater current date. Please check inputing date."}]);
					 return;
				}

				if(startWorking < finishWorking){ 
					allSenders[senderId].states++;
					allSenders[senderId].exrerience = (finishWorking - startWorking).toString();
					sendMessage(senderId, structedRequest(allSenders[senderId].savePostback, 'Do you have CV ?')); 
				}else{
					sendMessage(senderId, [{text:"What is your exrerience? First date must be smaller than second."}]);
				}
			}else{
				sendMessage(senderId, [{text:"What is your exrerience? Input correct data in format YEAR/MM/DAY YEAR/MM/DAY."}]);
			} 
}

function attachedFile(senderId, attachedObj){
	console.log('hi I am in attachedFile !!!');
	console.log(attachedObj);
			
	if(attachedObj !== null && attachedObj.type === 'file'){
			allSenders[senderId].cv_url = attachedObj.payload.url;
			allSenders[senderId].states++;
			sendMessage(senderId, [{text: 'Please send some additional information about you.'}]);
	}else{
		sendMessage(senderId, [{text:"Hey \u263A . You send file in incorect type, we check it. We need CV in doc or pdf format."}]);  
	}
}

function additionalInformation(event, senderId){
		allSenders[senderId].states++;
		sendMessage(senderId, structedRequest(allSenders[senderId].savePostback, saveText));    
}

function saveInformation(event, senderId){
 // console.log(allSenders[senderId]);
	if(event.postback.payload === 'Yes_postback'){
				insertData(senderId);
				sendMessage(senderId, [{text:'Thank you for information, ' + allSenders[senderId].name + ' \u263A . All information about you was saved. Within 3  days you will be contacted by our real HR manager.'}]);
			}else{
				sendMessage(senderId, [{text:'Information about you was not saved.'}]);
			}
			delete allSenders[senderId]; // delete information about client for loop working
}

function insertData(senderId){
		 console.log(allSenders[senderId]);
		 var dbProperties = ['surname', 'name', 'ITSpeciality', 'devSpecialization', 'skills', 'email', 'phone', 'cv_url', 'city', 'experience', 'states'];
		 var dbObject = new client();
		 
		 for(var property in allSenders[senderId]){
		     console.log('property is :' + property);
		 }

		 for(var i = 0; i < dbProperties.length; i++){
				if(dbProperties[i] in allSenders[senderId]){
						console.log('we find property !');
						dbObject[dbProperties[i]] = allSenders[senderId][dbProperties[i]]; 
				}else{
						dbObject[dbProperties[i]] = null;
				}        
		 }



		// dbObject.surname = 'sfsd';
		// dbObject.name = null;
		// dbObject.ITSpeciality = 'Developer';
		// dbObject.devSpecialization = null;
		// dbObject.skills = ['sdsd', 'ssd'];
		// dbObject.email = null;
		// dbObject.phone = null;
		// dbObject.cv_url = null;
		// dbObject.city = 'fsfs';
		// dbObject.experience = 'sdfsd';
		// dbObject.states = 15;     

		dbObject.save(function(err, doc){
			if(err) console.log(err);
		});
}



