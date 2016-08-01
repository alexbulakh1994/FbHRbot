var async = require('async'),
	sendFBmessage = require('./sendFBmessage'), 
	answerVariants = require('./modelDB').answerVariants,
	find = require('./find');

var specText = 'Select the skills that are relevant for you. Don\’t worry if you can\’t find necessary skill in the list. Mention it when chat bot asks you to write about yourself.\n',
	pharaseFinishChooseSkill = 'You can always finish choosing skills by typing the \/finish command.',
	devBranch = 'Select your specialization. If you have the skills in several specializations select the skills for the first one, type the command \/prev and select the next specialization.';

function skillChoosingSendMessages(senderId, obj, titleMessage) {
	async.series([
		function(callback){
	    	sendFBmessage.send(senderId, [{ text: specText}]);
	    	callback();
		},function(callback){
        	setTimeout(callback, 500); 
		},function(callback){
		    sendFBmessage.send(senderId, [{ text: pharaseFinishChooseSkill}]);
		    callback();
		},function(callback){
        	setTimeout(callback, 500); 
		},function(callback){
			sendFBmessage.send(senderId, sendFBmessage.buttonTemplate(obj, titleMessage));
			callback();
		},
	]);
}

function professionChosing(event, senderId) {
	if (event.postback && event.postback.payload === 'Developer_postback') {
		allSenders[senderId].states++;
		sendFBmessage.send(senderId, [{text: devBranch}]);
		sendFBmessage.send(senderId, sendFBmessage.buttonTemplate(allSenders[senderId].specialization, 'Developer Specialization'));
	} else if (event.postback && event.postback.payload === 'QA_postback') {
		allSenders[senderId].states++;
		allSenders[senderId].currentSpecialization = answerVariants.testerSpecialization;
		skillChoosingSendMessages(senderId, answerVariants.testerSpecialization, 'skills');
		allSenders[senderId].clientSkills.push({devSpeciality: '', skills: []}); // when user choose QA only once add skill object
	} else if (event.postback && event.postback.payload === 'Project Manager_postback') {
		allSenders[senderId].states++;
		allSenders[senderId].currentSpecialization = answerVariants.projectSpecialist;
		skillChoosingSendMessages(senderId, answerVariants.projectSpecialist, 'skills');
		allSenders[senderId].clientSkills.push({devSpeciality: '', skills: []}); // when user choose PM only once add skill object
	}
	allSenders[senderId].ITSpeciality = event.postback.payload.split('_')[0];
}

// only for developers
function specialization(event, senderId) {
	var spec =  event.postback.payload.split('_')[0];	
	allSenders[senderId].clientSkills.push({devSpeciality: '', skills: []});	//  important!!!

	allSenders[senderId].specialization = find.filter(allSenders[senderId].specialization, spec);
	allSenders[senderId].currentSpecialization = choosedDevSpecialization(spec);
	skillChoosingSendMessages(senderId, allSenders[senderId].currentSpecialization, 'skills'); //postbacks.printSkillList(allSenders[senderId].currentSpecialization, specText)
	allSenders[senderId].clientSkills[allSenders[senderId].clientSkills.length - 1].devSpeciality = spec;	
	allSenders[senderId].states++;
}

function choosedDevSpecialization(spec) {
	if(spec === 'BackEnd') {
		return answerVariants.backEndPostbacks;
	} else if (spec === 'FrontEnd') {
		return answerVariants.frontEndPostbacks;
	} else if (spec === 'Android') {
		return answerVariants.androidPostbacks;
	} else if (spec === 'IOS') {
		return answerVariants.IOS;
	}
}

function continueChooseWorkSkills(senderId) {
	if(allSenders[senderId].specialization.length !== 0){
		allSenders[senderId].states = 6;
		sendFBmessage.send(senderId, sendFBmessage.buttonTemplate(allSenders[senderId].specialization, specText));
		sendFBmessage.send(senderId, [{ text: pharaseFinishChooseSkill}]);
	} else { // state when user in dev speciality choose all specialization: front, back, ios, android
		allSenders[senderId].states = 8; // go to state #8 -- choose person experience
		sendFBmessage.sendQuickReplies(senderId, 'Do you have experience?', -1, answerVariants.savePostback);
	}
}

module.exports.specialization = specialization;
module.exports.professionChosing = professionChosing;
module.exports.continueChooseWorkSkills = continueChooseWorkSkills;
