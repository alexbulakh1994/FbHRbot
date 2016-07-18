var sendFBmessage = require('./sendFBmessage'); 
var async = require('async');

function botGreeting(senderId, obj){
	
	async.series([
		function(callback){
	    	sendFBmessage.send(senderId, [{text: 'Hey, I\’m HR-bot of “DataRoot”. If you want to work in our company, answer a few questions, I\’ll collect all information and will send it to our HR-manager.'}]);
	 		callback();
	 	},function(callback) {
      		setTimeout(callback, 1000);
   		},function(callback){
	    	sendFBmessage.send(senderId, [{text: 'To restart the chat - type the command \/restart.'}]);
	    	callback();
	 	},function(callback) {
      		setTimeout(callback, 1000);
   		},function(callback){
	    	sendFBmessage.send(senderId, [{text: 'Let\’s begin. What is your full name?'}]);
	    	callback();
	 	},
	]);

}

module.exports.botGreeting = botGreeting;
