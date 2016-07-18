var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport('smtps://alexbulakh707%40gmail.com:34212328031994@smtp.gmail.com');


function sendMail(obj, properties) {
	var text = printUserProperties(obj, properties);
	var mailOptions = {
		from: '"Fred Foo 👥" <foo@blurdybloop.com>', // sender address
    	to: 'alexbulakh707@gmail.com', // list of receivers
    	subject: 'HR bot', // Subject line
    	text: text, // plaintext body
    	html: '<b>' + text + '</b>' // html body
  	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        return console.log(error);
	    }
	    console.log('Message sent: ' + info.response);
	});
}

function printUserProperties(obj, props) {
	var rawText = '';
	for(var i = 0; i < props.length; i++) {
		if(props[i] in obj && obj[props[i]] !== undefined){
			rawText = rawText.concat(props[i] + " : ").concat(obj[props[i]] +'\n');
		} else {
			rawText = rawText.concat(props[i] + " : ");
		}        
	}
	return rawText;	 
}

module.exports.sendMail = sendMail;
