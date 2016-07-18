var answerVariants = require('./modelDB').answerVariants;
var sendFBmessage = require('./sendFBmessage');
var model = require('./modelDB');

function chooseSkills(event, senderId, obj) {
	var skill = event.postback.payload.toString().split('_')[0]; 
	if (obj.clientSkills.length > 0) {
		if (obj.clientSkills[obj.clientSkills.length - 1].skills.indexOf(skill) !== -1) {
			sendFBmessage.send(senderId, [{text: "You’ve already chosen this skill \u263A"}]);
			return;
		}
	}

	var skillsSpecialization = findSpecs(skill);
	if(skillsSpecialization === null){
		console.log('find null in chooseSkills ');
		return;
	} else if (skillsSpecialization.length !== 0) {
		obj.currentSpecialization = skillsSpecialization;
	} else if (model.answerVariants.testerSpecialization.length === 0 || model.answerVariants.projectSpecialist.length === 0) {
		finishChoosingSkills(senderId, obj);      
	} else {
		lastWorkExperience(senderId);
	}
	obj.clientSkills[obj.clientSkills.length - 1].skills.push(skill);
	//obj.skills.push(skill);
}

function finishChoosingSkills(senderId, obj) {
	obj.states++;
	sendFBmessage.send(senderId, sendFBmessage.buttonTemplate(model.answerVariants.savePostback, 'Do you have experience?'));
}

function lastWorkExperience(senderId) {
	sendFBmessage.send(senderId, sendFBmessage.buttonTemplate(model.answerVariants.savePostback, 'If you dont choose all skills press YES to continue, else NO'));   
}


function findSpecs(skill) {
	if(answerVariants.backEndPostbacks.indexOf(skill) !== -1) {
		return filter(answerVariants.backEndPostbacks, skill);
	} else if (answerVariants.frontEndPostbacks.indexOf(skill) !== -1) {
		return filter(answerVariants.frontEndPostbacks,skill);;
	} else if (answerVariants.androidPostbacks.indexOf(skill) !== -1) {
		return filter(answerVariants.androidPostbacks,skill);;
	}else if (answerVariants.IOS.indexOf(skill) !== -1) {
		return filter(answerVariants.IOS,skill);
	}else if (answerVariants.testerSpecialization.indexOf(skill) !== -1) {
		return filter(answerVariants.testerSpecialization,skill);
	}else if (answerVariants.projectSpecialist.indexOf(skill) !== -1) {
		return filter(answerVariants.projectSpecialist,skill);;
	}else {
		return null;
	}
}

function filter(arr, payloadDel) {
	var index = arr.indexOf(payloadDel);
	arr.slice(index, 1);
    return arr;             
}

 module.exports.chooseSkills = chooseSkills;
 module.exports.finishChoosingSkills = finishChoosingSkills;
 
 										     	 												     	 												  