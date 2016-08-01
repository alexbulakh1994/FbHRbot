var sendFBmessage = require('./sendFBmessage'); 
var async = require('async');
var request = require('request');
var model = require('./modelDB');

//var token = "EAAXCaafsfqMBAFuSMrrX5e03VQkQ5mTShTa2KcZC3hZCfFOm8etD3fMixApzOyctswMqK4WN6Qh4x8TRc0GIYZBrj0ZA0lXCNDvwhSZCPJnsEmNGKpCmoCDgB6XHeDK3dBm4qtqXwMAPeQkiCUF2rDs3hz31z6Qc0mioGJwgISAZDZD";
var token = "EAAYWxfiazmIBAPjM1GkZADQ2Gk7cx8n4xBTbMVZB0ZAbFKOEO28bpSWLVqJTbdQP3leKRVl4ha5ZCzHu0kK8ZCI4B30RcZCbLZAng0c1bdvRomMlmyBUEZCXXGK1dUV66kZBYDfD3ChnSwK60WG4Rahzyg6Hm20AEdNA9OiZAM0X99awZDZD";
var chooseLocation = "Where do you live? If you can\’t find the city in our list, please just type it in the message\’s field.";


function botGreeting(senderId, body) {				
	async.series([
		function(callback){
			sendFBmessage.send(senderId, [{text: 'Hey, ' +body.first_name+ ' I\’m HR-bot of “DataRoot”. If you want to work in our company, answer a few questions, I\’ll collect all information and will send it to our HR-manager.'}]);
			callback();
		},function(callback) {
		    setTimeout(callback, 1000);
		},function(callback){
			sendFBmessage.send(senderId, [{text: 'Command \/restart - restart the chat.\nCommand \/help - remind all commands.'}]);
			callback();
		},function(callback) {
		    setTimeout(callback, 1000);
		},function(callback){
			sendFBmessage.sendQuickReplies(senderId, chooseLocation, -1, model.answerVariants.locations);
			callback();
		}
	]);
	allSenders[senderId].name = body.first_name;
	allSenders[senderId].surname = body.last_name;
	allSenders[senderId].gender = body.gender;
	allSenders[senderId].profile_pic = body.profile_pic;
}

// getting request 
function requestBot(senderId) {
	var url = 'https://graph.facebook.com/v2.7/' + senderId + '?access_token='+token;
	request({
    	url: url,
    	json: true
    }, function (error, response, body) {
    	if (!error && response.statusCode == 200) {
    		botGreeting(senderId, body);  	
    	}
  	});
}

module.exports.botGreeting = botGreeting;
module.exports.requestBot = requestBot;