var sendFBmessage = require('./../messanger/sendFBmessage');
var model = require('./../db/modelDB');

var dataTimeExp = new RegExp(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/);
var saveText = "Thank you, I have no more questions. Can I send your answers to our HR-manager?";
var CV_text = 'Do you have a CV in pdf or doc? To upload use \ud83d\udcce button.';


// state for working with Yes/No variants 
// Do you have experience - (Yes/No) - state === #8 -> if NO -- go to state #10 else -> state #9
// Do you have CV - (Yes/No) - state === #10 -> if NO -- state #11 else -> choosing file -- state#11, write some message bot -- bot ask question
function yesNoChoosenState(event, senderId, informativeMessage, stepChangeState, botQuestion, attachedObj) {
  if (('quick_reply' in event.message) && event.message.quick_reply.payload === 'Yes_postback') {
    allSenders[senderId].states++; 
    sendFBmessage.send(senderId, [botQuestion]);
  } else {
    if (allSenders[senderId].states === 10 && ('quick_reply' in event.message) && event.message.quick_reply.payload === 'No_postback') {
      sendFBmessage.send(senderId, [{text: 'Write about yourself (personal qualities, professional skills, experience, interests, and passions). You can add a review about the chatbot \u263A'}]);
      allSenders[senderId].states++;
      return;
    } else if (allSenders[senderId].states === 10 && event.message) {
      attachedFile(senderId, attachedObj, allSenders[senderId]);
      return;
    } else {
      sendFBmessage.sendQuickReplies(senderId, informativeMessage, -1, ['No']);
    }   
    allSenders[senderId].states += stepChangeState;
  }
}

// get client work experience on state #9 -> go to state #10 -> choose or no CV 
function personExperience(event, senderId) {
  allSenders[senderId].states++;
  allSenders[senderId].lastWorkPosition = event.message.text;
  sendFBmessage.sendQuickReplies(senderId, CV_text, -1, ['No']);
}

// now dont using this function now---------------------------------------------------------------------
function yearExperience(event, senderId) {
  var dateTimes = event.message.text.split(/-| /),
    startWorking = new Date(dateTimes[0]),
    finishWorking = new Date(dateTimes[1]);
  
  if (dataTimeExp.test(dateTimes[0]) && dataTimeExp.test(dateTimes[1])) {
    if (finishWorking > new Date()) {
      sendFBmessage.send(senderId, [{text:"You finish working date is greater current date. Please check inputing date."}]);
      return;
    }
    allSenders[senderId].states++;
    allSenders[senderId].experience = Math.floor(Math.abs(finishWorking - startWorking)/86400000);
    sendFBmessage.send(senderId, sendFBmessage.buttonTemplate(model.answerVariants.savePostback, CV_text)); 
  } else {
    sendFBmessage.send(senderId, [{text:"Please check the date format - YEAR/MM/DAY YEAR/MM/DAY."}]);
  } 
}
//------------------------------------------------------------------------------------------------------------

// get CV document check if this a file on state #10
function attachedFile(senderId, attachedObj) {
  if(attachedObj !== null && attachedObj.type === 'file') {
    allSenders[senderId].cv_url = attachedObj.payload.url;
    allSenders[senderId].states++;
    sendFBmessage.send(senderId, [{text: 'Write about yourself (personal qualities, professional skills, experience, interests, and passions). You can write a review about the bot \u263A.'}]);
  } else {
    sendFBmessage.send(senderId, [{text:"Ouch \u263A It doesn’t look like pdf or doc, we accept only CV in pdf or doc."}]);  
  }
}

// get additional information about user on state #11
function additionalInformation(event, senderId) {
  allSenders[senderId].states++;
  allSenders[senderId].aboutMe = event.message.text;   
  sendFBmessage.sendQuickReplies(senderId, saveText, -1, model.answerVariants.savePostback);
}

// save or update data about user by their sender id
function saveInformation(event, senderId) {
  allSenders[senderId].states++;
  if(event.message.quick_reply.payload === 'Yes_postback') {
    model.insertData(senderId);
    sendFBmessage.send(senderId, [{text:'Thank you, ' + allSenders[senderId].name + ' \u263A \nOur HR-manager will contact you within 3 days.'}]);
    // send giffy when user save information about yourself in our database
    sendFBmessage.sendImage(senderId, 'http://media3.giphy.com//media//Mp4hQy51LjY6A//200.gif');
  } else {
    sendFBmessage.send(senderId, [{text:'Information about you was not saved.'}]);
    sendFBmessage.sendImage(senderId, 'http://media0.giphy.com//media//7ILa7CZLxE0Ew//200.gif');
  }
}

module.exports.saveInformation = saveInformation;
module.exports.additionalInformation = additionalInformation;
module.exports.attachedFile = attachedFile;
module.exports.yearExperience = yearExperience;
module.exports.personExperience = personExperience;
module.exports.yesNoChoosenState = yesNoChoosenState;
