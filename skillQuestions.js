var answerVariants = require('./modelDB').answerVariants;
var sendFBmessage = require('./sendFBmessage');
var botStates = require('./BotStates');

// function whitch analizy skill witch client choosed
function chooseSkills(event, senderId) {
	var skill = event.postback.payload.toString().split('_')[0]; 
	if (allSenders[senderId].clientSkills.length > 0) {
		if (allSenders[senderId].clientSkills[allSenders[senderId].clientSkills.length - 1].skills.indexOf(skill) !== -1) {
			sendFBmessage.send(senderId, [{text: "You’ve already chosen this skill \u263A"}]);
			return;
		}
	}

	var skillsSpecialization = findSpecs(skill);
	if (skillsSpecialization === null) {
		console.log('find null in chooseSkills');
		return;
	} else if (skillsSpecialization.length !== 0) {
		allSenders[senderId].currentSpecialization = skillsSpecialization;
	}  
	// adding skills to last developer speciality
	allSenders[senderId].clientSkills[allSenders[senderId].clientSkills.length - 1].skills.push(skill);
	
	// check if finish when client choose all skills in category
	if (checkAllSkillsChoosed(answerVariants.testerSpecialization, allSenders[senderId].clientSkills[allSenders[senderId].clientSkills.length - 1].skills) || 
			checkAllSkillsChoosed(answerVariants.projectSpecialist, allSenders[senderId].clientSkills[allSenders[senderId].clientSkills.length - 1].skills)) {
		finishChoosingSkills(senderId, allSenders[senderId]);      
	} else if(checkAllSkillsChoosed(answerVariants.backEndPostbacks, allSenders[senderId].clientSkills[allSenders[senderId].clientSkills.length - 1].skills) ||
			checkAllSkillsChoosed(answerVariants.frontEndPostbacks, allSenders[senderId].clientSkills[allSenders[senderId].clientSkills.length - 1].skills) ||
			checkAllSkillsChoosed(answerVariants.androidPostbacks, allSenders[senderId].clientSkills[allSenders[senderId].clientSkills.length - 1].skills) ||
			checkAllSkillsChoosed(answerVariants.IOS, allSenders[senderId].clientSkills[allSenders[senderId].clientSkills.length - 1].skills)) {
		// when of the dev categories is choosed all then ask client what to do - > 1. /restart; 2. /finish 3. /prev
		console.log('now all skills choosed in dev');
		botStates.helpCommand(senderId);
	} 

}

// function which work when user press /finish command or type /finish
function finishChoosingSkills(senderId) {
	if (allSenders[senderId].clientSkills[allSenders[senderId].clientSkills.length - 1].skills.length !== 0) {
		allSenders[senderId].states++;
		sendFBmessage.sendQuickReplies(senderId, 'Do you have experience?', -1, answerVariants.savePostback);
	} else {
		sendFBmessage.send(senderId, [{text: 'You must choose minimum one skill for you specialization.'}]);
	}
}

// find speciality by skill whitch user choosed
function findSpecs(skill) {
	if(answerVariants.backEndPostbacks.indexOf(skill) !== -1) {
		return answerVariants.backEndPostbacks;
	} else if (answerVariants.frontEndPostbacks.indexOf(skill) !== -1) {
		return answerVariants.frontEndPostbacks;
	} else if (answerVariants.androidPostbacks.indexOf(skill) !== -1) {
		return answerVariants.androidPostbacks;
	}else if (answerVariants.IOS.indexOf(skill) !== -1) {
		return answerVariants.IOS;
	}else if (answerVariants.testerSpecialization.indexOf(skill) !== -1) {
		return answerVariants.testerSpecialization;
	}else if (answerVariants.projectSpecialist.indexOf(skill) !== -1) {
		return answerVariants.projectSpecialist;
	}else {
		return null;
	}
}

// check when user choose all skills
function checkAllSkillsChoosed(arr, arr1) {
	if(arr.length !== arr1.length)
		return false;
	if(arr.sort().join(',') === arr1.sort().join(',')){
		return true;
	}else {
		return false;
	}	          
}

 module.exports.chooseSkills = chooseSkills;
 module.exports.finishChoosingSkills = finishChoosingSkills;
 
 										     	 												     	 												  