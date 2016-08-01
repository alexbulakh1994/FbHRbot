var express = require('express'),
	bodyParser = require('body-parser'),
	bugsnag = require("bugsnag");

var botStates = require('./BotStates'),
	model = require('./modelDB'),
	greeting = require('./greeting'),
	timer = require('./Timer'),
	additionalQuestion = require('./additionalBotQuestions');

var app = express();
//bugsnag.register("f4307bdedd5f50a789df6a72310efc4b");

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
timer.pingBot();

////////----main itration threw state in witch uset situated--------
allSenders = {};
app.post('/webhook', function (req, res) {

var messaging_events = req.body.entry[0].messaging;
console.log(messaging_events);
for (i = 0; i < messaging_events.length; i++) {
	try{	
		var event = req.body.entry[0].messaging[i],
			senderId = event.sender.id;
			
		if (event.message && event.message.text && !allSenders[senderId]) {
			startBot(senderId, allSenders[senderId]);
		} else if (event.message && event.message.text === '\/restart' ) {
			botStates.restartBot(senderId, allSenders[senderId]);
		} else if (event.message && event.message.text === '\/help') {
			botStates.helpCommand(senderId);
		} else if(event.message && event.message.text === '\/continue' && (allSenders[senderId].states < 5 || allSenders[senderId].states > 7)){
			botStates.continueButtonEventHandler(senderId);
		} else if (event.message && ('quick_reply' in event.message) && event.message.quick_reply.payload.substring(event.message.quick_reply.payload.indexOf('_')) === '_help_postback') {
			botStates.checkingHelpState(event, senderId, allSenders[senderId].states);
		} else if ( ((event.message && (('quick_reply' in event.message) || event.message.text)) || event.postback) && allSenders[senderId].states === 1) {
			botStates.askLocation(event, senderId, allSenders[senderId]);
		} else if ( ((event.message && (('quick_reply' in event.message) || event.message.text)) || event.postback) && allSenders[senderId].states === 2 ) {
			botStates.askTypeInfoClientConnecting(event, senderId);
		} else if (event.message && event.message.text && allSenders[senderId].states === 3) {
			botStates.askEmailInformation(event, senderId);
		} else if (event.message && event.message.text && allSenders[senderId].states === 4) { 
			botStates.askPhoneInformation(event, senderId);
		} else if (event.postback && allSenders[senderId].states === 5) {
			botStates.askChooseProffesion(event, senderId);
		} else if (event.postback && allSenders[senderId].states === 6 ) {
			botStates.chooseSkillOrSpecializationState(event, senderId);
		} else if (event.postback && allSenders[senderId].states === 7) {
			 botStates.askClientSkills(event, senderId);
		} else if (event.message && event.message.text === '\/prev' && allSenders[senderId].states === 7 ) {
			botStates.previousBotCommand(senderId);
		} else if (event.message && event.message.text === '\/finish' && allSenders[senderId].states === 7) {
			botStates.finishBotCommand(senderId);
		} else if ( ((event.message && (('quick_reply' in event.message) ||  event.message.text)) || event.postback) && allSenders[senderId].states === 8) { 
			botStates.askYesNoExperience(event, senderId);
		} else if (event.message && event.message.text && allSenders[senderId].states === 9) {
			botStates.askWorkExperience(event, senderId);
		} else if ( (event.message || event.postback) && allSenders[senderId].states === 10) {
			botStates.askYesNoCV(event, senderId, req.body.entry[0].messaging);
		} else if (event.message && event.message.text && allSenders[senderId].states === 11) {
			botStates.askAdditonalInfo(event, senderId);
		} else if ( ((event.message && (('quick_reply' in event.message) ||  event.message.text)) || event.postback) && allSenders[senderId].states === 12) {
			botStates.askSaveInfo(event, senderId);
		} else if (event.message && !(event.message.text)) { // прислал что от непонятное боту -> не прошло ни один state тогда снова шлем сообщение (повтор state)
			botStates.continueButtonEventHandler(senderId);
		}
	}catch(ex){
		console.log(ex);
		startBot(senderId);	
	}
}
	res.sendStatus(200);
});

// function which init clients data
function startBot(senderId) {	
	allSenders[senderId] = new model.client({states: 1});
	model.gettingClientsDBData(allSenders[senderId]);	
    greeting.requestBot(senderId);
    timer.startActivityTimer(senderId, allSenders[senderId].states);
}

// 7620c4cb-3260-4280-ac68-1c4718f664a6

