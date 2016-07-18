var sendFBmessage = require('./sendFBmessage');
var model = require('./modelDB');

var ITSpeciality = 'What position are you looking for?',
    chooseLocation = "Where do you live? If you can\’t find the city in our list, please just type it in the message\’s field.";

////////////////---------regex for email and phone------------///////////////////////
var emailExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
	phoneExp = new RegExp(/^(\+38|38|8){0,1}[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/);


function introducePerson(event, senderId, obj){
	obj.states++;
	var FIO = event.message.text.split(' ');
	obj.name = FIO[0] !== undefined ? FIO[0] : 'anonymous';
	obj.surname = FIO[1] !== undefined ? FIO[1] : 'anonymous';
	sendFBmessage.send(senderId, sendFBmessage.buttonTemplate(model.answerVariants.locations, chooseLocation));
	console.log('I am in introducePerson method ');
}

function personLocation(event, senderId, obj){
	if(event.postback !== undefined ){
		obj.city = event.postback.payload.split('_')[0];
	}else{
		obj.city = event.message.text;
	}
	obj.states++;
	sendFBmessage.send(senderId, sendFBmessage.buttonTemplate(model.answerVariants.themselvesInformationType, 'Select the preferable way to contact you.'));
}

function chooseInformationTypeInputing(event, senderId, obj) {
	if (event.postback.payload === 'by phone_postback') {
		obj.states += 2;
		sendFBmessage.send(senderId, [{text: 'Please enter your mobile phone (0XXXXXXXXX or 0XX XXX XX XX).'}]);
		obj.typeInformationChoosing = 'phone number';
	} else if(event.postback.payload === 'by email_postback') {
		obj.states++;
		obj.typeInformationChoosing = 'email';
		sendFBmessage.send(senderId, [{text: 'Please enter your email.'}]);
	} else {
		obj.states++;
		sendFBmessage.send(senderId, [{text: 'Please enter your email.'}]);
	}
}

function emailValidation(event, senderId, obj) {
	if (emailExp.test(event.message.text)) {
		if (obj.typeInformationChoosing === 'email') {
			obj.states += 2;
			sendFBmessage.send(senderId, sendFBmessage.buttonTemplate(model.answerVariants.specialistType, ITSpeciality));
		} else {
			obj.states++;
			sendFBmessage.send(senderId, [{text: 'Please enter your mobile phone (0XXXXXXXXX or 0XX XXX XX XX).'}]);
		}  
			obj.email = event.message.text;
	} else {
		sendFBmessage.send(senderId, [{text: 'Please confirm the email address.'}]);
	}
}

function telephoneValidation(event, senderId, obj) {
	if(phoneExp.test(event.message.text)) {  
		obj.states++;
		obj.phone = event.message.text;
		sendFBmessage.send(senderId, sendFBmessage.buttonTemplate(model.answerVariants.specialistType, ITSpeciality));
	} else {
		sendFBmessage.send(senderId, [{text: 'Please enter mobile number in format XXX-XXX-XXXX or XXXXXXXXXX.'}]);
	}
}

module.exports.introducePerson = introducePerson;
module.exports.personLocation = personLocation;
module.exports.chooseInformationTypeInputing = chooseInformationTypeInputing;
module.exports.emailValidation = emailValidation;
module.exports.telephoneValidation = telephoneValidation;