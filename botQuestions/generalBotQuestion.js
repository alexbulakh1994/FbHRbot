var sendFBmessage = require('./../messanger/sendFBmessage');
var model = require('./../db/modelDB');

var ITSpeciality = 'What position are you looking for?';
////////////////---------regex for email and phone------------///////////////////////
var emailExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
  phoneExp = new RegExp(/^(\+38|38|8){0,1}[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/);

//-----------------------------------now not using----------------------------------------------------
function introducePerson(event, senderId){
  allSenders[senderId].states++;
  var FIO = event.message.text.split(' ');
  allSenders[senderId].name = FIO[0] !== undefined ? FIO[0] : '';
  allSenders[senderId].surname = FIO[1] !== undefined ? FIO[1] : '';
  sendFBmessage.send(senderId, sendFBmessage.buttonTemplate(model.answerVariants.locations, chooseLocation));
}
//---------------------------------------not using---------------------------------------------------


function personLocation(event, senderId) {
  if (('quick_reply' in event.message)) {
    allSenders[senderId].city = event.message.quick_reply.payload.split('_')[0];
  } else {
    allSenders[senderId].city = event.message.text;
  }
  allSenders[senderId].states++;
  sendFBmessage.sendQuickReplies(senderId, 'Select the preferable way to contact you.', -1, model.answerVariants.themselvesInformationType);
}

function chooseInformationTypeInputing(event, senderId) {
  if (event.message.quick_reply.payload === 'by phone_postback') {
    allSenders[senderId].states += 2;
    sendFBmessage.send(senderId, [{text: 'Please enter your mobile phone (0XXXXXXXXX or 0XX XXX XX XX).'}]);
    allSenders[senderId].typeInformationChoosing = 'phone number';
  } else if (event.message.quick_reply.payload === 'by email_postback') {
    allSenders[senderId].states++;
    allSenders[senderId].typeInformationChoosing = 'email';
    sendFBmessage.send(senderId, [{text: 'Please enter your email.'}]);
  } else {
    allSenders[senderId].states++;
    sendFBmessage.send(senderId, [{text: 'Please enter your email.'}]);
  }
}

function emailValidation(event, senderId) {
  if (emailExp.test(event.message.text)) {
    if (allSenders[senderId].typeInformationChoosing === 'email') {
      allSenders[senderId].states += 2;
      sendFBmessage.send(senderId, sendFBmessage.buttonTemplate(model.answerVariants.specialistType, ITSpeciality));
    } else {
      allSenders[senderId].states++;
      sendFBmessage.send(senderId, [{text: 'Please enter your mobile phone (0XXXXXXXXX or 0XX XXX XX XX).'}]);
    }  
      allSenders[senderId].email = event.message.text;
  } else {
    sendFBmessage.send(senderId, [{text: 'Please confirm the email address.'}]);
  }
}

function telephoneValidation(event, senderId) {
  if (phoneExp.test(event.message.text)) {  
    allSenders[senderId].states++;
    allSenders[senderId].phone = event.message.text;
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