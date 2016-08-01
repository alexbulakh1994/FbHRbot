var async = require('async');

var sendFBmessage = require('./sendFBmessage'),
	skillQuestions = require('./skillQuestions'),
	answerVariants = require('./modelDB').answerVariants,
	generalQuestion = require('./generalBotQuestion'),
	specQuestion = require('./specializationQuestion'),
	timer = require('./Timer'),
	find = require('./find'),
	additionalQuestion = require('./additionalBotQuestions');

var saveText = 'Thank you, I have no more questions. Can I send your answers to our HR-manager?';

// Additional bot command whichcuser could load -----------------------------------
function restartBot(senderId) {
	delete allSenders[senderId];
	sendFBmessage.send(senderId, [{text: 'You stopping chat with HR bot.'}]);
}

//prev command
function previousBotCommand(senderId) {
	if (answerVariants.testerSpecialization.indexOf(allSenders[senderId].currentSpecialization[0]) === -1 && 
					answerVariants.projectSpecialist.indexOf(allSenders[senderId].currentSpecialization[0]) === -1) {
		specQuestion.continueChooseWorkSkills(senderId);
	}
}

//finish command
function finishBotCommand(senderId) {
	timer.stopActivityTimer(senderId);
	skillQuestions.finishChoosingSkills(senderId);   
	timer.startActivityTimer(senderId, allSenders[senderId].states);
}

//help command execution
function helpCommand(senderId) {
	timer.stopActivityTimer(senderId);
	async.series([
		function(callback) {
			sendFBmessage.send(senderId, [{text: 'Command \/restart - restart the chat.'}]);
			if (allSenders[senderId].states !== 5 && allSenders[senderId].states !== 6 && allSenders[senderId].states !== 7) {
				sendFBmessage.send(senderId, [{text: 'Command \/continue - continue from current state.'}]);
			}
			if (allSenders[senderId].states === 7) {
				sendFBmessage.send(senderId, [{text: 'Command \/finish - finish choosing the profession skills.'}]);
				if (answerVariants.testerSpecialization.indexOf(allSenders[senderId].currentSpecialization[0]) === -1 && 
                    	answerVariants.projectSpecialist.indexOf(allSenders[senderId].currentSpecialization[0]) === -1) {
            		sendFBmessage.send(senderId, [{text: 'Command \/prev - return to the previous step for choose one more dev speciality.'}]);           
           		}
			}
			callback();
		},function(callback) {
		    setTimeout(callback, 1500);
		},function(callback) {
			sendFBmessage.sendQuickReplies(senderId, 'Choose one of this command to continue.', allSenders[senderId].states);	
		}
	]);	
	timer.startActivityTimer(senderId, allSenders[senderId].states);
}

// one from /help command
function checkingHelpState(event, senderId, states) {
	timer.stopActivityTimer(senderId);
    if (event.message.quick_reply.payload === 'restart_help_postback'){
        restartBot(senderId);
    } else if (event.message.quick_reply.payload === 'finish_help_postback') {
    	if (states === 7) {
    		skillQuestions.finishChoosingSkills(senderId);
    	} else {
    		sendFBmessage.send(senderId, [{text: 'Finish command work only when you choose developer skills'}]);
    	}
    } else if (event.message.quick_reply.payload === 'prev_help_postback') {
    	if (states === 7) {
    		previousBotCommand(senderId);
    	} else {
    		sendFBmessage.send(senderId, [{text: 'Prev command work only when you choose developer skills'}]);
    	}
    } else if (event.message.quick_reply.payload === 'continue_help_postback') {
    	continueButtonEventHandler(senderId, allSenders[senderId]);
    }
    timer.startActivityTimer(senderId, allSenders[senderId].states);
}

//continue command
function continueButtonEventHandler(senderId) {
	console.log('state in continue function is : ' + allSenders[senderId].states);
	switch(allSenders[senderId].states){
		case 1:
			sendFBmessage.sendQuickReplies(senderId, 'Where are do you live ?', -1, answerVariants.locations);
			break;
		case 2:
			sendFBmessage.sendQuickReplies(senderId, 'Select the preferable way to contact you.', -1, answerVariants.themselvesInformationType);
			break;
		case 3:
			sendFBmessage.send(senderId, [{text: 'Please enter your email.'}]);
			break;
		case 4:
			sendFBmessage.send(senderId, [{text: 'Please enter your mobile phone (0XXXXXXXXX or 0XX XXX XX XX).'}]);
			break;
		case 8:
			sendFBmessage.sendQuickReplies(senderId, 'Do you have experience?', -1, answerVariants.savePostback);
			break;
		case 9:
			sendFBmessage.send(senderId, [{text: 'What was your previous position ?'}]);
			break;
		case 10:
			sendFBmessage.sendQuickReplies(senderId, 'Do you have a CV in pdf or doc? To upload use \ud83d\udcce button.', -1, ['No']);
			break;
		case 11:
			sendFBmessage.send(senderId, [{text: 'Write about yourself (personal qualities, professional skills, experience, interests, and passions). You can write a review about the bot \u263A.'}]);
			break;
		case 12:
			sendFBmessage.sendQuickReplies(senderId, saveText, -1, answerVariants.savePostback);
			break;
		default:
			helpCommand(senderId, allSenders[senderId]);
			break;	
	}
}

//state #1 - choose location
function askLocation(event, senderId) {
	timer.stopActivityTimer(senderId);
	generalQuestion.personLocation(event, senderId);
	timer.startActivityTimer(senderId, allSenders[senderId].states);
}

//state #2 - choose whitch information type user want sent us
function askTypeInfoClientConnecting(event, senderId) {
	timer.stopActivityTimer(senderId);
	if (event.message && ('quick_reply' in event.message)) {
		generalQuestion.chooseInformationTypeInputing(event, senderId, allSenders[senderId]);
	} else {
		continueButtonEventHandler(senderId, allSenders[senderId]);
	}
	timer.startActivityTimer(senderId, allSenders[senderId].states);
}

//state #3 - enail validation state
function askEmailInformation(event, senderId){
	timer.stopActivityTimer(senderId);
	generalQuestion.emailValidation(event, senderId, allSenders[senderId]);
	timer.startActivityTimer(senderId, allSenders[senderId].states);
}

//state #4 - telephone validation
function askPhoneInformation(event, senderId) {
	timer.stopActivityTimer(senderId);
	generalQuestion.telephoneValidation(event, senderId, allSenders[senderId]);
	timer.startActivityTimer(senderId, allSenders[senderId].states);
}

//state #5 - choose type of profession
function askChooseProffesion(event, senderId){
	timer.stopActivityTimer(senderId);
	specQuestion.professionChosing(event, senderId);
	timer.startActivityTimer(senderId, allSenders[senderId].states);
}

//state #6 - choose skill or speciality (if choose developer - speciality, another - skill)
function chooseSkillOrSpecializationState(event, senderId) {
	timer.stopActivityTimer(senderId);
	if (allSenders[senderId].currentSpecialization === undefined || (answerVariants.testerSpecialization.indexOf(allSenders[senderId].currentSpecialization[0]) === - 1 && 
				answerVariants.projectSpecialist.indexOf(allSenders[senderId].currentSpecialization[0]) === - 1)) { //if undefined tan currentSpecialization is Developer (default)
		specQuestion.specialization(event, senderId);
	} else {
		allSenders[senderId].states++;
		skillQuestions.chooseSkills(event, senderId);
	}
	timer.startActivityTimer(senderId, allSenders[senderId].states);
}

//state #7 - choose skill in developer , tester or PM block
function askClientSkills(event, senderId) {
	timer.stopActivityTimer(senderId);
	skillQuestions.chooseSkills(event, senderId);
	timer.startActivityTimer(senderId, allSenders[senderId].states);
}

//state #8 - choose variant if you have experience or not
function askYesNoExperience(event, senderId) {
	timer.stopActivityTimer(senderId);
	if (event.message && ('quick_reply' in event.message)) {
		additionalQuestion.yesNoChoosenState(event, senderId, 'Do you have a CV in pdf or doc? To upload use \ud83d\udcce button.', 2, 
																{text:"What was your previous position?"});
	} else {
		continueButtonEventHandler(senderId, allSenders[senderId]);
	}
	timer.startActivityTimer(senderId, allSenders[senderId].states);
}

//state #9 - tell about you work experience
function askWorkExperience(event, senderId) {
	timer.stopActivityTimer(senderId);
	additionalQuestion.personExperience(event, senderId, allSenders[senderId]);
	timer.startActivityTimer(senderId, allSenders[senderId].states);
}

//state #10 - tell if you have CV or not
function askYesNoCV(event, senderId, requestData) {
	timer.stopActivityTimer(senderId);
	if ((event.message && !('quick_reply' in event.message) && event.message.text) || event.postback) { // client type messege when need submit button or attach doc or pdf document
		continueButtonEventHandler(senderId, allSenders[senderId]);
	} else if (('quick_reply' in event.message) || event.message ) { // client submit on button No or send something which need check(type/format)
		var attachedObj = find.findAttachObject(requestData); // requestData === req.body.entry[0].messaging
		additionalQuestion.yesNoChoosenState(event, senderId, 'Do you want save information about you ?', 2, 
									{text:"Write about yourself (personal qualities, professional skills, experience, interests, and passions). You can write a review about the bot \u263A."}, attachedObj);
	} 
	timer.startActivityTimer(senderId, allSenders[senderId].states);
}

//state #11 - type addiotional information about you and bot
function askAdditonalInfo(event, senderId) {
	timer.stopActivityTimer(senderId);
	additionalQuestion.additionalInformation(event, senderId, allSenders[senderId]);
	timer.startActivityTimer(senderId, allSenders[senderId].states);
}

//state #12 - save or not information about yourself
function askSaveInfo(event, senderId) {
	timer.stopActivityTimer(senderId);
	if (event.message && ('quick_reply' in event.message)) {
		additionalQuestion.saveInformation(event, senderId, allSenders[senderId]);
		delete allSenders[senderId];    // delete information about client for loop working
	} else {
		continueButtonEventHandler(senderId, allSenders[senderId]);
	}
}

//help commands exporting
module.exports.restartBot = restartBot;
module.exports.previousBotCommand = previousBotCommand;
module.exports.chooseSkillOrSpecializationState = chooseSkillOrSpecializationState;
module.exports.checkingHelpState = checkingHelpState;
module.exports.helpCommand = helpCommand;
module.exports.finishBotCommand = finishBotCommand;
module.exports.continueButtonEventHandler = continueButtonEventHandler;

//main states exporting
module.exports.askLocation = askLocation;
module.exports.askTypeInfoClientConnecting = askTypeInfoClientConnecting;
module.exports.askEmailInformation = askEmailInformation;
module.exports.askPhoneInformation = askPhoneInformation;
module.exports.askChooseProffesion = askChooseProffesion;
module.exports.askClientSkills = askClientSkills;
module.exports.askYesNoExperience = askYesNoExperience;
module.exports.askWorkExperience = askWorkExperience;
module.exports.askYesNoCV = askYesNoCV;
module.exports.askAdditonalInfo = askAdditonalInfo;
module.exports.askSaveInfo = askSaveInfo;

