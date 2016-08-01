var request = require('request'),
  answerVariants = require('./../db/modelDB').answerVariants;

var MAX_BUTTON_NUMBERS = 3,
  //token = "EAAXCaafsfqMBAFuSMrrX5e03VQkQ5mTShTa2KcZC3hZCfFOm8etD3fMixApzOyctswMqK4WN6Qh4x8TRc0GIYZBrj0ZA0lXCNDvwhSZCPJnsEmNGKpCmoCDgB6XHeDK3dBm4qtqXwMAPeQkiCUF2rDs3hz31z6Qc0mioGJwgISAZDZD";
  token = "EAAYWxfiazmIBAPjM1GkZADQ2Gk7cx8n4xBTbMVZB0ZAbFKOEO28bpSWLVqJTbdQP3leKRVl4ha5ZCzHu0kK8ZCI4B30RcZCbLZAng0c1bdvRomMlmyBUEZCXXGK1dUV66kZBYDfD3ChnSwK60WG4Rahzyg6Hm20AEdNA9OiZAM0X99awZDZD";

// construct array of variants buttons which client could submit
var buttonsConstructor = function(elements) {
  var buttons = [];
  elements.forEach(function(obj) {
    buttons.push({type: 'postback', title: obj, payload: obj.concat('_postback')});
  });
  return buttons;
} 

// construct object for button sending using Facebook Send API
var btnPayloadObject = function(text, buttons) {
  return {
    attachment: {
      type: "template",
      payload: {
        template_type: "button",
        text: text, 
        buttons: buttons
      }
    }
  };
}

// construct array of buttons set (in set only 3 button, more Send APi forbidden)
var buttonTemplate = function(objArray, text) {
  var messagePostBack = [];
  for (var i = 0; i < objArray.length; i++) {
    if (objArray.length <= MAX_BUTTON_NUMBERS) {
      messagePostBack.push(btnPayloadObject(text, buttonsConstructor(objArray)));
      return messagePostBack;
    }
    if ((i+1) % MAX_BUTTON_NUMBERS === 0) {
      messagePostBack.push(btnPayloadObject(text, buttonsConstructor(objArray.slice(i - 2, i + 1))));  
    } else if (i === objArray.length - 1) {
      messagePostBack.push(btnPayloadObject(text, buttonsConstructor(objArray.slice(i - (objArray.length % MAX_BUTTON_NUMBERS) + 1))));
    }
  }         
  return messagePostBack;
}

function send(sender, messageData) {
  messageData.forEach(function(item, i, arr) {
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:token},
      method: 'POST',
      json: {
        recipient: {id:sender},
        message: item,
      }
    }, function(error, response, body) {
      if (error) {
        console.log('Error sending message: ', error);
      } else if (response.body.error) {
        console.log('Error: ', response.body.error);
      }           
    });
  });
}

/* function which return replies array of variants 
   with customized payload: for help command -> _help_postback, for client states -> _postback */  
function quick_repliesObj(senderId, text, state, textVariants) {
  var reply_indicator = '_postback',
    allUserCommand = ['restart', 'finish', 'prev'],
    reply_array = [],
    comandIndicator ="";
  // checking textVariants parameters if it undefined -> construct array of objects for help commands
  // else construct array of objects to client state variants
  if (textVariants !== undefined) { // work if not /help command calling
    allUserCommand = textVariants;
  } else {
    if (state !== 7) { // work only if /help command we get
      allUserCommand.splice(1);
      if (state !== 5 && state !== 6) { // continue does not adding in state 5,6 or 7 
        allUserCommand.push('continue'); 
      }
    }
    if (state === 7) { // /prev only appeared in developer sections in 7 state
      if (answerVariants.testerSpecialization.indexOf(allSenders[senderId].currentSpecialization[0]) !== -1 || 
            answerVariants.projectSpecialist.indexOf(allSenders[senderId].currentSpecialization[0]) !== -1) {
        allUserCommand = allUserCommand.filter(function(e){return e!=='prev'});            
      }
    }
      comandIndicator = "/";
      reply_indicator = "_help_postback"; 
  } 
  allUserCommand.forEach(function(elem, index, arr) {
    reply_array.push({
      content_type: "text",
      title: comandIndicator + elem,
      payload: elem+reply_indicator
    });
  });
  return reply_array;  
}

function sendQuickReplies(sender, text, state, textVariants) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message:{
        text:text,
        quick_replies: quick_repliesObj(sender, text, state, textVariants)
      }
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }           
  });
}

function sendImage(sender, URL) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message:{
        attachment: {
          type: "image",
          payload: {
            url: URL
          }
        }
      }
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }           
  });
}

module.exports.buttonTemplate = buttonTemplate;
module.exports.send = send;
module.exports.sendQuickReplies = sendQuickReplies;
module.exports.sendImage = sendImage;



