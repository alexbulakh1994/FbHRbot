var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var async = require('async');
var mongoose = require('mongoose');
var util = require('util');
var structedRequest = require('./structed-messages');
var find = require('./find');
var postbacks = require('./postbacks');
var nodemailer = require('nodemailer');
var bugsnag = require("bugsnag");

var app = express();
bugsnag.register("c26af732ef73170768bbe6990776aa9e");

// old token var token = "EAAYWxfiazmIBAGUEU5ZATRvI17Q2EjcOkjQ4Hb6kXd2XJvVGiCsYM7opWMYjjVbMaDSltGZBZCXWlscjuQ3PExb2DJFjGEVXvTpUojFpuKA9whniVZANH7zuLoi8hAbZC4klt1yHheha2zTmMMvszzHmvHel6CG956ZAwVZBRO6VQZDZD";
var token = "EAAXCaafsfqMBAFuSMrrX5e03VQkQ5mTShTa2KcZC3hZCfFOm8etD3fMixApzOyctswMqK4WN6Qh4x8TRc0GIYZBrj0ZA0lXCNDvwhSZCPJnsEmNGKpCmoCDgB6XHeDK3dBm4qtqXwMAPeQkiCUF2rDs3hz31z6Qc0mioGJwgISAZDZD";
var transporter = nodemailer.createTransport('smtps://alexbulakh707%40gmail.com:34212328031994@smtp.gmail.com');

var regExp = new RegExp(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/);

////////////-------------informative message title------------ ///////////////////////////////////////
var specText = 'Select the skills that are relevant for you. Don\’t worry if you can\’t find necessary skill in the list. Mention it when chat bot asks you to write about yourself.\n';
var pharaseFinishChooseSkill = 'You can always finish choosing skills by typing the \\finish command.';
var devBranch = 'Select your specialization. If you have the skills in several specializations select the skills for the first one, type the command \\prev and select the next specialization.';
var ITSpeciality = 'What position are you looking for?';
var saveText = " Thank you, I have no more questions. Can I send your answers to our HR-manager?";
var chooseLocation = "Where do you live? If you can\’t find the city in our list, please just type it in the message\’s field.";

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
	}else res.send('Error, wrong validation token');
});


//send message
function sendMessage(sender, messageData) {
	messageData.forEach(function(item, i, arr) {
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
var Schema = new mongoose.Schema ({
	senderId : String,
	surname : String,
	name: String,
	ITSpeciality: String,
	devSpecialization: [String],
	skills: [String],
	email: String,
	phone: String,
	cv_url: String,
	city: String,
	experience: Number,
	lastWorkPosition: String,
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
	//test bagsng
	// bugsnag.notify(new Error("Non-fatal"));

	var messaging_events = req.body.entry[0].messaging;
	for (i = 0; i < messaging_events.length; i++) {
		var event = req.body.entry[0].messaging[i],
			senderId = event.sender.id,
			attachedObj = find.findAttachObject(req.body.entry[0].messaging);
		if (event.message && event.message.text && !allSenders[senderId]) {
			allSenders[senderId] = true;
			allSenders[senderId] = new client({states: 1});
			greeting(senderId);
			postbacks.gettingClientsDBData(allSenders[senderId]);
		} else if (event.message && event.message.text === '\\restart' ) {
			delete allSenders[senderId];
			sendMessage(senderId, [{text: 'You stopping chat with HR bot.'}]);
		} else if(event.message && event.message.text && allSenders[senderId].states === 1) {
			introducePerson(event, senderId);
		} else if ((event.postback || (event.message && event.message.text)) && allSenders[senderId].states === 2) {
			personLocation(event, senderId);
		} else if (event.postback && allSenders[senderId].states === 3) {
			chooseInformationTypeInputing(event,senderId);
		} else if (event.message && event.message.text && allSenders[senderId].states === 4) {
			emailValidation(event, senderId);
		} else if (event.message && event.message.text && allSenders[senderId].states === 5) { 
			telephoneValidation(event, senderId);
		} else if (event.postback && allSenders[senderId].states === 6) {
						 professionChosing(event, senderId);
		} else if (event.postback && allSenders[senderId].states === 7 ) {
			if (allSenders[senderId].currentSpecialization === undefined || 
					(allSenders[senderId].testerSpecialization.indexOf(allSenders[senderId].currentSpecialization[0]) === - 1 && 
					allSenders[senderId].projectSpecialist.indexOf(allSenders[senderId].currentSpecialization[0]) === - 1)) { //if undefined tan currentSpecialization is Developer (default)
				specialization(event, senderId);
			} else {
				allSenders[senderId].states++;
				chooseSkills(event, senderId);
			}
		} else if (event.postback && allSenders[senderId].states === 8) {
			chooseSkills(event, senderId);
		} else if (event.message && event.message.text === '\\prev' && allSenders[senderId].states === 8 ) {
			if (allSenders[senderId].testerSpecialization.indexOf(allSenders[senderId].currentSpecialization[0]) === -1 && 
					allSenders[senderId].projectSpecialist.indexOf(allSenders[senderId].currentSpecialization[0]) === -1) {
				continueChooseWorkSkills(senderId);
			} else {
				sendMessage(senderId, [{text:"You couldnot go to upper level. What is last place of your work ?"}]);
			} 
		} else if (event.message && event.message.text === '\\finish' && allSenders[senderId].states === 8) {
			finishChoosingSkills(senderId);     
		} else if (event.postback && allSenders[senderId].states === 8 && (event.postback.payload === 'Yes_postback' || event.postback.payload === 'No_postback')) {
			if (event.postback.payload === 'Yes_postback') {
				continueChooseWorkSkills(senderId);
			} else{
				finishChoosingSkills(senderId);
			}
		} else if (event.postback  && allSenders[senderId].states === 9) { 
			yesNoChoosenState(event, senderId, 'Do you have a CV in pdf or doc format?', 2, {text:"What was your previous position?"});
		}
				// else if(event.message && event.message.text && allSenders[senderId].states === 10){
				// 		personExperience(event, senderId);
				// }
		else if (event.message && event.message.text && allSenders[senderId].states === 10) {
			//yearExperience(event, senderId);
			personExperience(event, senderId);
		} else if (event.postback && allSenders[senderId].states === 11) {
			yesNoChoosenState(event, senderId, 'Do you want save information about you ?', 2, {text:"Please send CV in pdf or doc format."}); //\ud83d\udcce use this button.
		} else if (event.message && event.message.text && allSenders[senderId].states === 12) {
			attachedFile(senderId, attachedObj);
		} else if (event.message && event.message.text && allSenders[senderId].states === 13) {
			additionalInformation(event, senderId);	
		} else if (event.postback && allSenders[senderId].states === 14) {
			saveInformation(event, senderId);
		}
	}

	res.sendStatus(200);
});


function greeting(senderId){
	async.series([
		function(callback){
	    	sendMessage(senderId, [{text: 'Hey, I\’m HR-bot of “DataRoot”. If you want to work in our company, answer a few questions, I\’ll collect all information and will send it to our HR-manager.'}]);
	 		callback();
	 	},function(callback) {
      		setTimeout(callback, 1000);
   		},function(callback){
	    	sendMessage(senderId, [{text: 'To restart the chat - type the command \\restart.'}]);
	    	callback();
	 	},function(callback) {
      		setTimeout(callback, 1000);
   		},function(callback){
	    	sendMessage(senderId, [{text: 'Let\’s begin. What is your full name?'}]);
	    	callback();
	 	},
	]);
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
	sendMessage(senderId, structedRequest(postbacks.themselvesInformationType, 'Select the preferable way to contact you.'));
}

function chooseInformationTypeInputing(event, senderId) {
	if (event.postback.payload === 'by phone_postback') {
		allSenders[senderId].states += 2;
		sendMessage(senderId, [{text: 'Please enter your mobile phone (0XXXXXXXXX or 0XX XXX XX XX).'}]);
		allSenders[senderId].typeInformationChoosing = 'phone number';
	} else if(event.postback.payload === 'by email_postback') {
		allSenders[senderId].states++;
		allSenders[senderId].typeInformationChoosing = 'email';
		sendMessage(senderId, [{text: 'Please enter your email.'}]);
	} else {
		allSenders[senderId].states++;
		sendMessage(senderId, [{text: 'Please enter your email.'}]);
	}
}

function emailValidation(event, senderId) {
	if (emailExp.test(event.message.text)) {
		if (allSenders[senderId].typeInformationChoosing === 'email') {
			allSenders[senderId].states += 2;
			sendMessage(senderId, structedRequest(allSenders[senderId].specialistType, ITSpeciality));
		} else {
			allSenders[senderId].states++;
			sendMessage(senderId, [{text: 'Please enter your mobile phone (0XXXXXXXXX or 0XX XXX XX XX).'}]);
		}  
			allSenders[senderId].email = event.message.text;
	} else {
		sendMessage(senderId, [{text: 'Please confirm the email address.'}]);
	}
}

function telephoneValidation(event, senderId) {
	if(phoneExp.test(event.message.text)) {  
		allSenders[senderId].states++;
		allSenders[senderId].phone = event.message.text;
		sendMessage(senderId, structedRequest(allSenders[senderId].specialistType, ITSpeciality));
	} else {
		sendMessage(senderId, [{text: 'Please enter mobile number in format XXX-XXX-XXXX or XXXXXXXXXX.'}]);
	}
}

function skillChoosingSendMessages(senderId, obj, titleMessage) {
	async.series([
		function(callback){
	    	sendMessage(senderId, [{ text: specText}]);
	    	callback();
		},function(callback){
        	setTimeout(callback, 500); 
		},function(callback){
		    sendMessage(senderId, [{ text: pharaseFinishChooseSkill}]);
		    callback();
		},function(callback){
        	setTimeout(callback, 500); 
		},function(callback){
			sendMessage(senderId, structedRequest(obj, titleMessage));
			callback();
		},
	]);
}

function professionChosing(event, senderId) {
	if (event.postback && event.postback.payload === 'Developer_postback') {
		allSenders[senderId].states++;
		sendMessage(senderId, [{text: devBranch}]);
		sendMessage(senderId, structedRequest(allSenders[senderId].specialization, 'Developer Specialization'));
	} else if (event.postback && event.postback.payload === 'QA_postback') {
		allSenders[senderId].states++;
		allSenders[senderId].currentSpecialization = allSenders[senderId].testerSpecialization;
		skillChoosingSendMessages(senderId, allSenders[senderId].testerSpecialization, 'skills');
	} else if (event.postback && event.postback.payload === 'Project Manager_postback') {
		allSenders[senderId].states++;
		allSenders[senderId].currentSpecialization = allSenders[senderId].projectSpecialist;
		skillChoosingSendMessages(senderId, allSenders[senderId].projectSpecialist, 'skills');
	}
	allSenders[senderId].ITSpeciality = event.postback.payload.split('_')[0];
}

function specialization(event, senderId) {
	var spec =  event.postback.payload.split('_')[0];
		
	allSenders[senderId].specialization = find.filter(allSenders[senderId].specialization, spec);
	allSenders[senderId].currentSpecialization = postbacks.choosedDevSpecialization(allSenders[senderId], spec);
	skillChoosingSendMessages(senderId, allSenders[senderId].currentSpecialization, 'skills'); //postbacks.printSkillList(allSenders[senderId].currentSpecialization, specText)
		
	allSenders[senderId].devSpecialization.push(spec);
	allSenders[senderId].states++;
}

function continueChooseWorkSkills(senderId) {
	allSenders[senderId].states = 7;
	sendMessage(senderId, structedRequest(allSenders[senderId].specialization, specText));
	sendMessage(senderId, [{ text: pharaseFinishChooseSkill}]);
}

function finishChoosingSkills(senderId) {
	allSenders[senderId].states++;
	sendMessage(senderId, structedRequest(allSenders[senderId].savePostback, 'Do you have experience?'));
}

function lastWorkExperience(senderId) {
	sendMessage(senderId, structedRequest(allSenders[senderId].savePostback, 'If you dont choose all skills press YES to continue, else NO'));   
}

function chooseSkills(event, senderId) {
	var skill = event.postback.payload.toString().split('_')[0]; 

	if(allSenders[senderId].skills.indexOf(skill) !== -1){
		sendMessage(senderId, [{text: "You’ve already chosen this skill \u263A"}]);
		return;
	}

	var skillsSpecialization = postbacks.findSpecs(allSenders[senderId], skill);
	if(skillsSpecialization === null){
		console.log('find null in chooseSkills ');
		return;
	} else if (skillsSpecialization.length !== 0) {
		allSenders[senderId].currentSpecialization = skillsSpecialization;
	} else if (allSenders[senderId].testerSpecialization.length === 0 || allSenders[senderId].projectSpecialist.length === 0) {
		finishChoosingSkills(senderId);      
	} else {
		lastWorkExperience(senderId);
	}
	allSenders[senderId].skills.push(skill);
}

function yesNoChoosenState(event, senderId, informativeMessage, stepChangeState, botQuestion) {
	if(event.postback.payload === 'Yes_postback') {
		allSenders[senderId].states++; 
		sendMessage(senderId, [botQuestion]);
	} else {
		if (allSenders[senderId].states === 11) {
			sendMessage(senderId, [{text: 'Write about yourself (personal qualities, professional skills, experience, interests, and passions). You can add a review about the chatbot \u263A'}]);
		} else {
			sendMessage(senderId, structedRequest(allSenders[senderId].savePostback, informativeMessage)); //informativeMessage  
		}   
		allSenders[senderId].states += stepChangeState;
	}
}

function personExperience(event, senderId) {
	allSenders[senderId].states++;
	allSenders[senderId].lastWorkPosition = event.message.text;
	//sendMessage(senderId,  [{text:'How long did you work as ' +  allSenders[senderId].lastWorkPosition +'? Enter the date in the following format - 2015/02/31 2016/12/22.'}]);
	sendMessage(senderId, structedRequest(allSenders[senderId].savePostback, 'Do you have a CV in pdf or doc?')); 
}

function yearExperience(event, senderId){
			var dateTimes = event.message.text.split(/-| /);
			var startWorking = new Date(dateTimes[0]);
			var finishWorking = new Date(dateTimes[1]);
	
			if(regExp.test(dateTimes[0]) && regExp.test(dateTimes[1]) ){
				
				if(finishWorking > new Date()){
					 sendMessage(senderId, [{text:"You finish working date is greater current date. Please check inputing date."}]);
					 return;
				}
					allSenders[senderId].states++;
					allSenders[senderId].experience = Math.floor(Math.abs(finishWorking - startWorking)/86400000);
					sendMessage(senderId, structedRequest(allSenders[senderId].savePostback, 'Do you have a CV in pdf or doc?')); 
			}else{
				sendMessage(senderId, [{text:"Please check the date format - YEAR/MM/DAY YEAR/MM/DAY."}]);
			} 
}

function attachedFile(senderId, attachedObj){
	if(attachedObj !== null && attachedObj.type === 'file'){
			allSenders[senderId].cv_url = attachedObj.payload.url;
			allSenders[senderId].states++;
			sendMessage(senderId, [{text: 'Write about yourself (personal qualities, professional skills, experience, interests, and passions). You can write a review about the bot \u263A.'}]);
	}else{
		sendMessage(senderId, [{text:"Ouch \u263A It doesn’t look like pdf or doc, we accept only CV in pdf or doc."}]);  
	}
}

function additionalInformation(event, senderId) {
	allSenders[senderId].states++;
	sendMessage(senderId, structedRequest(allSenders[senderId].savePostback, saveText));    
}

function saveInformation(event, senderId) {
	if(event.postback.payload === 'Yes_postback') {
		insertData(senderId);
		sendMessage(senderId, [{text:'Thank you, ' + allSenders[senderId].name + ' \u263A \nOur HR-manager will contact you within 3 days.'}]);
	} else {
		sendMessage(senderId, [{text:'Information about you was not saved.'}]);
	}
	delete allSenders[senderId]; // delete information about client for loop working
}

function insertData(senderId) {
	var dbProperties = ['surname', 'name', 'ITSpeciality', 'devSpecialization', 'skills', 'email', 'phone', 'cv_url', 'city', 'experience', 'lastWorkPosition','states'];
	var dbObject = {};//new client()
	for(var i = 0; i < dbProperties.length; i++) {
		if(dbProperties[i] in allSenders[senderId]) {
			dbObject[dbProperties[i]] = allSenders[senderId][dbProperties[i]]; 
		} else {
			dbObject[dbProperties[i]] = null;
		}        
	}
	dbObject.senderId = senderId;    
	client.update({senderId: senderId}, dbObject, {upsert: true, setDefaultsOnInsert: true}, function(err, doc) {
		if(err) console.log(err);
	});
	sendMail(postbacks.printUserProperties(allSenders[senderId], dbProperties));
}

function sendMail(text) {
	var mailOptions = {
		from: '"Fred Foo 👥" <foo@blurdybloop.com>', // sender address
    	to: 'alexbulakh707@gmail.com', // list of receivers
    	subject: 'HR bot', // Subject line
    	text: text, // plaintext body
    	html: '<b>' + text + '</b>' // html body
  	};

// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        return console.log(error);
	    }
	    console.log('Message sent: ' + info.response);
	});
}

// 7620c4cb-3260-4280-ac68-1c4718f664a6



