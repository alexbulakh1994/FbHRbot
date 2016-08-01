var sendFBmessage = require('./../messanger/sendFBmessage');
var botStates = require('./../BotStates'); 
var async = require('async');

function startActivityTimer(senderId, states) {
  allSenders[senderId].timer = setTimeout(
    function() {
      if (allSenders[senderId]) { 
        if (states === allSenders[senderId].states) {
          async.series([
            function(callback) {
              sendFBmessage.send(senderId, [{text: 'Are you still here ?'}]);
              callback();
            }, 
            function(callback) {
              setTimeout(callback, 1000);
            }, 
            function(callback){   
              botStates.continueButtonEventHandler(senderId, allSenders[senderId]);
              callback();
            }
          ]); 
          (function () {
            setTimeout(
              function() {
                if (states === allSenders[senderId].states) { 
                  sendFBmessage.send(senderId, [{text: 'If you will be ready to continue our conversation just send me a message.'}]);
                  delete allSenders[senderId];
                }
              }, 300000);
          })();          
        }
      }    
  }, 1500000);
}

function stopActivityTimer(senderId) {
  console.log('timer stop');
  clearTimeout(allSenders[senderId].timer);
}

function pingBot(){
  console.log('ping bot calling');
  // setInterval(function(){
  //  sendFBmessage.send(1049263685110782, [{text: 'I am alive !'}]); // my sender id for ping
  // }, 3600000);
}

module.exports.startActivityTimer = startActivityTimer;
module.exports.stopActivityTimer = stopActivityTimer;
module.exports.pingBot = pingBot;