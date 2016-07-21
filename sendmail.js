var mandrill = require('node-mandrill')('OxRmhvORVFXpL8Iru5zcmQ');

function sendMail(obj) {
	var text = JSON.stringify(obj).toString();   
    mandrill('/messages/send', {
        message: {
            to: [{"email":'alexbulakh707@gmail.com'}, {"email": 'igor.sizon@dataroot.co'}, {"email":'ivan.didur@dataroot.co'}, {"email":'max.frolov@dataroot.co'}],
            subject: 'HR bot notification',
            from_email: 'api@dataroot.co',
            text: text
        }
    }, function(err) {
        if (err){
            console.log(err);
        }
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
