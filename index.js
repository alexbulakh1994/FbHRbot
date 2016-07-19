var express = require('express'),
	bodyParser = require('body-parser'),
	bugsnag = require("bugsnag");

var sendFBmessage = require('./sendFBmessage'),
	find = require('./find'),
	skillQuestions = require('./skillQuestions'),
	model = require('./modelDB'),
	greeting = require('./greeting'),
	generalQuestion = require('./generalBotQuestion'),
	specQuestion = require('./specializationQuestion'),
	additionalQuestion = require('./additionalBotQuestions');

var app = express();
bugsnag.register("f4307bdedd5f50a789df6a72310efc4b");

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
	}else res.send('Error, wrong validation token');
});

//init DB records into program collections
model.loadDatabaseInfo();

////////----main itration threw state in witch uset situated--------
var allSenders = {};
app.post('/webhook/', function (req, res) {

var messaging_events = req.body.entry[0].messaging;
for (i = 0; i < messaging_events.length; i++) {
	try{	
		//bugsnag.notify(new Error("Non-fatal"));
		//console.log(req.body.entry[0].messaging);
		var event = req.body.entry[0].messaging[i],
			senderId = event.sender.id,
			attachedObj = find.findAttachObject(req.body.entry[0].messaging);
		if (event.message && event.message.text && !allSenders[senderId]) {
			startBot(senderId);
		} else if (event.message && event.message.text === '\/restart' ) {
			delete allSenders[senderId];
			sendFBmessage.send(senderId, [{text: 'You stopping chat with HR bot.'}]);
		} else if(event.message && event.message.text && allSenders[senderId].states === 1) {
			generalQuestion.introducePerson(event, senderId, allSenders[senderId]);
			checkUserActivityStatus(senderId, allSenders[senderId].states); 
		} else if ((event.postback || (event.message && event.message.text)) && allSenders[senderId].states === 2) {
			generalQuestion.personLocation(event, senderId,allSenders[senderId]);
			checkUserActivityStatus(senderId, allSenders[senderId].states); 
		} else if (event.postback && allSenders[senderId].states === 3) {
			generalQuestion.chooseInformationTypeInputing(event, senderId, allSenders[senderId]);
			checkUserActivityStatus(senderId, allSenders[senderId].states); 
		} else if (event.message && event.message.text && allSenders[senderId].states === 4) {
			generalQuestion.emailValidation(event, senderId, allSenders[senderId]);
			checkUserActivityStatus(senderId, allSenders[senderId].states); 
		} else if (event.message && event.message.text && allSenders[senderId].states === 5) { 
			generalQuestion.telephoneValidation(event, senderId, allSenders[senderId]);
			checkUserActivityStatus(senderId, allSenders[senderId].states); 
		} else if (event.postback && allSenders[senderId].states === 6) {
			specQuestion.professionChosing(event, senderId, allSenders[senderId]);
			checkUserActivityStatus(senderId, allSenders[senderId].states); 
		} else if (event.postback && allSenders[senderId].states === 7 ) {
			if (allSenders[senderId].currentSpecialization === undefined || 
				(model.answerVariants.testerSpecialization.indexOf(allSenders[senderId].currentSpecialization[0]) === - 1 && 
						model.answerVariants.projectSpecialist.indexOf(allSenders[senderId].currentSpecialization[0]) === - 1)) { //if undefined tan currentSpecialization is Developer (default)
				specQuestion.specialization(event, senderId, allSenders[senderId]);
				checkUserActivityStatus(senderId, allSenders[senderId].states); 
			} else {
				allSenders[senderId].states++;
				skillQuestions.chooseSkills(event, senderId, allSenders[senderId]);
				checkUserActivityStatus(senderId, allSenders[senderId].states); 
			}
		} else if (event.postback && allSenders[senderId].states === 8) {
			skillQuestions.chooseSkills(event, senderId, allSenders[senderId]);
			checkUserActivityStatus(senderId, allSenders[senderId].states); 
		} else if (event.message && event.message.text === '\/prev' && allSenders[senderId].states === 8 ) {
			if (model.answerVariants.testerSpecialization.indexOf(allSenders[senderId].currentSpecialization[0]) === -1 && 
					model.answerVariants.projectSpecialist.indexOf(allSenders[senderId].currentSpecialization[0]) === -1) {
				specQuestion.continueChooseWorkSkills(senderId, allSenders[senderId]);
				checkUserActivityStatus(senderId, allSenders[senderId].states); 
			} else {
				//sendFBmessage.send(senderId, [{text:"You couldnot go to upper level. What is last place of your work ?"}]);
				skillQuestions.finishChoosingSkills(senderId, allSenders[senderId]);
				checkUserActivityStatus(senderId, allSenders[senderId].states); 
			} 
		} else if (event.message && event.message.text === '\/finish' && allSenders[senderId].states === 8) {
			skillQuestions.finishChoosingSkills(senderId, allSenders[senderId]);
			checkUserActivityStatus(senderId, allSenders[senderId].states);      
		} else if (event.postback && allSenders[senderId].states === 8 && (event.postback.payload === 'Yes_postback' || event.postback.payload === 'No_postback')) {
			if (event.postback.payload === 'Yes_postback') {
				specQuestion.continueChooseWorkSkills(senderId, allSenders[senderId]);
				checkUserActivityStatus(senderId, allSenders[senderId].states); 
			} else{
				skillQuestions.finishChoosingSkills(senderId, allSenders[senderId]);
				checkUserActivityStatus(senderId, allSenders[senderId].states); 
			}
		} else if (event.postback  && allSenders[senderId].states === 9) { 
			additionalQuestion.yesNoChoosenState(event, senderId, 'Do you have a CV in pdf or doc format?', 2, 
																{text:"What was your previous position?"}, allSenders[senderId]);
			checkUserActivityStatus(senderId, allSenders[senderId].states); 
		}
			// else if(event.message && event.message.text && allSenders[senderId].states === 10){
			// 		personExperience(event, senderId);
			// }
		else if (event.message && event.message.text && allSenders[senderId].states === 10) {
			//yearExperience(event, senderId);
			additionalQuestion.personExperience(event, senderId, allSenders[senderId]);
			checkUserActivityStatus(senderId, allSenders[senderId].states); 
		} else if (event.postback && allSenders[senderId].states === 11) {
			additionalQuestion.yesNoChoosenState(event, senderId, 'Do you want save information about you ?', 2, 
																{text:"Please send CV in pdf or doc format."}, allSenders[senderId]); //\ud83d\udcce use this button.
			checkUserActivityStatus(senderId, allSenders[senderId].states); 
		} else if (event.message && allSenders[senderId].states === 12) {
			additionalQuestion.attachedFile(senderId, attachedObj, allSenders[senderId]);
			checkUserActivityStatus(senderId, allSenders[senderId].states); 
		} else if (event.message && event.message.text && allSenders[senderId].states === 13) {
			additionalQuestion.additionalInformation(event, senderId, allSenders[senderId]);
			checkUserActivityStatus(senderId, allSenders[senderId].states); 	
		} else if (event.postback && allSenders[senderId].states === 14) {
			additionalQuestion.saveInformation(event, senderId, allSenders[senderId]);
			delete allSenders[senderId]; // delete information about client for loop working
		}
	}catch(ex){
		console.log(ex);
		startBot(senderId);	
	}
}
	res.sendStatus(200);
});

function checkUserActivityStatus(senderId, states) {
    setTimeout(
        function(){
	        if(allSenders[senderId]){	
	            if (states === allSenders[senderId].states) {
	                console.log('senderId of cancel user is : ' + senderId);
	                sendFBmessage.send(senderId, [{text: 'Bot cancel ask you question after 30 min you send answer for him !'}]);
	                delete allSenders[senderId];
	            } else{
	                console.log('cancel deleting user : ' + senderId);
	            }
	        } else {
	        	console.log('User finish work with bot id: ' + senderId);
	        }    
        }, 1800000
    );
}

function startBot(senderId) {
	allSenders[senderId] = true;
	greeting.botGreeting(senderId);
	allSenders[senderId] = new model.client({states: 1});
	model.gettingClientsDBData(allSenders[senderId]);
	checkUserActivityStatus(senderId, allSenders[senderId].states); 
}

// 7620c4cb-3260-4280-ac68-1c4718f664a6

