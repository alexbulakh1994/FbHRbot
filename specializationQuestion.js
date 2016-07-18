var async = require('async'),
	sendFBmessage = require('./sendFBmessage'), 
	model = require('./modelDB'),
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

function professionChosing(event, senderId, obj) {
	if (event.postback && event.postback.payload === 'Developer_postback') {
		obj.states++;
		sendFBmessage.send(senderId, [{text: devBranch}]);
		sendFBmessage.send(senderId, sendFBmessage.buttonTemplate(obj.specialization, 'Developer Specialization'));
	} else if (event.postback && event.postback.payload === 'QA_postback') {
		obj.states++;
		obj.currentSpecialization = model.answerVariants.testerSpecialization;
		skillChoosingSendMessages(senderId, model.answerVariants.testerSpecialization, 'skills');
	} else if (event.postback && event.postback.payload === 'Project Manager_postback') {
		obj.states++;
		obj.currentSpecialization = model.answerVariants.projectSpecialist;
		skillChoosingSendMessages(senderId, model.answerVariants.projectSpecialist, 'skills');
	}
	obj.ITSpeciality = event.postback.payload.split('_')[0];
}

function specialization(event, senderId, obj) {
	var spec =  event.postback.payload.split('_')[0];
		
	obj.specialization = find.filter(obj.specialization, spec);
	obj.currentSpecialization = choosedDevSpecialization(spec);
	skillChoosingSendMessages(senderId, obj.currentSpecialization, 'skills'); //postbacks.printSkillList(obj.currentSpecialization, specText)
	obj.clientSkills.push({devSpeciality: spec, skills: []});	
	//obj.devSpecialization.push(spec);
	obj.states++;
}

function choosedDevSpecialization(spec) {
	if(spec === 'BackEnd') {
		return model.answerVariants.backEndPostbacks;
	} else if (spec === 'FrontEnd') {
		return model.answerVariants.frontEndPostbacks;
	} else if (spec === 'Android') {
		return model.answerVariants.androidPostbacks;
	} else if (spec === 'IOS') {
		return model.answerVariants.IOS;
	}
}

function continueChooseWorkSkills(senderId, obj) {
	obj.states = 7;
	sendFBmessage.send(senderId, sendFBmessage.buttonTemplate(obj.specialization, specText));
	sendFBmessage.send(senderId, [{ text: pharaseFinishChooseSkill}]);
}

module.exports.specialization = specialization;
module.exports.professionChosing = professionChosing;
module.exports.continueChooseWorkSkills = continueChooseWorkSkills;
