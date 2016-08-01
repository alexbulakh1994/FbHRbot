var mongoose = require('mongoose');
var mailer = require('./sendmail');

// object whitch get data from db (skills, speciality, some pharces)
var answerVariants = {
	specialistType: null,
	specialization: null,
	backEndPostbacks : null,
	frontEndPostbacks: null,
	androidPostbacks: null,
	IOS: null,
	savePostback: null,
	locations: null,
	testerSpecialization: null,
	projectSpecialist: null,
	themselvesInformationType: ['by phone', 'by email', 'by phone + email']
}

// mongo database schema for collections of using phrasec
var Schema = new mongoose.Schema({
	name : String
});

// client model Schema of object
var clientModel = new mongoose.Schema ({
	senderId : String,
	surname : String,
	name: String,
	ITSpeciality: String,
	clientSkills: [{
		_id: false,
		devSpeciality: String,
		skills: [String]
		} 
	],
	email: String,
	phone: String,
	cv_url: String,
	city: String,
	lastWorkPosition: String,
	states: Number,
	gender: String,
	profile_pic: String,
	aboutMe: String,
	registrateData: String 
});

////////////-----connecting to DB
mongoose.connect('mongodb://hrbot:1qaz2wsx0@ds011715.mlab.com:11715/hr-bot');
var client = mongoose.model('clients', clientModel, 'clients');

// calling only once when server stared
// load all needed phrases to object answerVariants
function loadDatabaseInfo() {
	Object.keys(answerVariants).forEach(function(elem, i, arr) {
		if(elem.toString() !== 'themselvesInformationType'){	
			answerVariants[elem] = new Array();
			mongoose.model(elem, Schema, elem).find(function(err, result) {
				result.forEach(function(item, i, arr) {
					answerVariants[elem].push(item.toObject().name);
				});		
			});
		}
    });
}

// specialization - one of all client fields whitch changed in process of speeking with bot
// Example: change when user choose dev speciality, then speciality does not appeared in this user in current session
function gettingClientsDBData(obj) {
	obj['specialization'] = answerVariants.specialization.slice();
}

// function for updating/inserting client to database
// unique indentifier in whitch client is detected is sender id
function insertData(senderId) {
	//all property whitch saved in database for client
	allSenders[senderId].registrateData = new Date();
	//properies for saving in DB
	var dbProperties = ['surname', 'name', 'ITSpeciality','clientSkills', 'email', 'phone', 'cv_url', 'city', 'lastWorkPosition','states', 'profile_pic', 'gender', 'aboutMe', 'registrateData'];
	var dbObject = {};//new client()
	for (var i = 0; i < dbProperties.length; i++) {
		if (dbProperties[i] in allSenders[senderId]) {
			dbObject[dbProperties[i]] = allSenders[senderId][dbProperties[i]]; 
		} else {
			dbObject[dbProperties[i]] = null;
		}        
	}
	dbObject.senderId = senderId;  
	client.update({senderId: senderId}, dbObject, {upsert: true, setDefaultsOnInsert: true}, function(err, doc) {
		if(err) console.log(err);
	});
	// when user want save information about yourself to bot, 
	// then mail send on three mails
	mailer.sendMail(dbObject);
}

module.exports.loadDatabaseInfo = loadDatabaseInfo;
module.exports.gettingClientsDBData = gettingClientsDBData;
module.exports.client = client;
module.exports.answerVariants = answerVariants;
module.exports.insertData = insertData;


