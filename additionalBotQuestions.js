var sendFBmessage = require('./sendFBmessage');
var model = require('./modelDB');

var dataTimeExp = new RegExp(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/);
var saveText = " Thank you, I have no more questions. Can I send your answers to our HR-manager?";

function yesNoChoosenState(event, senderId, informativeMessage, stepChangeState, botQuestion, obj) {
	if(event.postback.payload === 'Yes_postback') {
		obj.states++; 
		sendFBmessage.send(senderId, [botQuestion]);
	} else {
		if (obj.states === 11) {
			sendFBmessage.send(senderId, [{text: 'Write about yourself (personal qualities, professional skills, experience, interests, and passions). You can add a review about the chatbot \u263A'}]);
		} else {
			sendFBmessage.send(senderId, sendFBmessage.buttonTemplate(model.answerVariants.savePostback, informativeMessage)); //informativeMessage  
		}   
		obj.states += stepChangeState;
	}
}

function personExperience(event, senderId, obj) {
	obj.states++;
	obj.lastWorkPosition = event.message.text;
	//sendMessage(senderId,  [{text:'How long did you work as ' +  obj.lastWorkPosition +'? Enter the date in the following format - 2015/02/31 2016/12/22.'}]);
	sendFBmessage.send(senderId, sendFBmessage.buttonTemplate(model.answerVariants.savePostback, 'Do you have a CV in pdf or doc?')); 
}

function yearExperience(event, senderId, obj) {
	var dateTimes = event.message.text.split(/-| /),
		startWorking = new Date(dateTimes[0]),
		finishWorking = new Date(dateTimes[1]);
	
	if (dataTimeExp.test(dateTimes[0]) && dataTimeExp.test(dateTimes[1])) {
		if (finishWorking > new Date()) {
			sendFBmessage.send(senderId, [{text:"You finish working date is greater current date. Please check inputing date."}]);
			return;
		}
		obj.states++;
		obj.experience = Math.floor(Math.abs(finishWorking - startWorking)/86400000);
		sendFBmessage.send(senderId, sendFBmessage.buttonTemplate(model.answerVariants.savePostback, 'Do you have a CV in pdf or doc?')); 
	} else {
		sendFBmessage.send(senderId, [{text:"Please check the date format - YEAR/MM/DAY YEAR/MM/DAY."}]);
	} 
}

function attachedFile(senderId, attachedObj, obj) {
	if(attachedObj !== null && attachedObj.type === 'file') {
		obj.cv_url = attachedObj.payload.url;
		obj.states++;
		sendFBmessage.send(senderId, [{text: 'Write about yourself (personal qualities, professional skills, experience, interests, and passions). You can write a review about the bot \u263A.'}]);
	} else {
		sendFBmessage.send(senderId, [{text:"Ouch \u263A It doesn’t look like pdf or doc, we accept only CV in pdf or doc."}]);  
	}
}

function additionalInformation(event, senderId, obj) {
	obj.states++;
	obj.aboutMe = event.message.text;
	sendFBmessage.send(senderId, sendFBmessage.buttonTemplate(model.answerVariants.savePostback, saveText));    
}

function saveInformation(event, senderId, obj) {
	if(event.postback.payload === 'Yes_postback') {
		model.insertData(senderId, obj);
		sendFBmessage.send(senderId, [{text:'Thank you, ' + obj.name + ' \u263A \nOur HR-manager will contact you within 3 days.'}]);
	} else {
		sendFBmessage.send(senderId, [{text:'Information about you was not saved.'}]);
	}
}

module.exports.saveInformation = saveInformation;
module.exports.additionalInformation = additionalInformation;
module.exports.attachedFile = attachedFile;
module.exports.yearExperience = yearExperience;
module.exports.personExperience = personExperience;
module.exports.yesNoChoosenState = yesNoChoosenState;
