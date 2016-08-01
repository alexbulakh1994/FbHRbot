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
      if (err) {
        console.log(err);
      }
  });
}

module.exports.sendMail = sendMail;
