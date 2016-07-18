var mongoose = require('mongoose');
var mailer = require('./sendmail');

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


var Schema = new mongoose.Schema({
	name : String
});

var clientModel = new mongoose.Schema ({
	senderId : String,
	surname : String,
	name: String,
	ITSpeciality: String,
	devSpecialization: [String],
	skills: [String],
	email: String,
	phone: String,
	cv_url: String,
	city: String,
	lastWorkPosition: String,
	states: Number
});

////////////-----connecting to DB
mongoose.connect('mongodb://hrbot:1qaz2wsx0@ds011715.mlab.com:11715/hr-bot');
var client = mongoose.model('clients', clientModel, 'clients');

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

function gettingClientsDBData(obj) {
	obj['specialization'] = answerVariants.specialization.slice();
}

function insertData(senderId, obj) {
	var dbProperties = ['surname', 'name', 'ITSpeciality', 'devSpecialization', 'skills', 'email', 'phone', 'cv_url', 'city', 'lastWorkPosition','states'];
	var dbObject = {};//new client()
	for (var i = 0; i < dbProperties.length; i++) {
		if (dbProperties[i] in obj) {
			dbObject[dbProperties[i]] = obj[dbProperties[i]]; 
		} else {
			dbObject[dbProperties[i]] = null;
		}        
	}
	dbObject.senderId = senderId;    
	client.update({senderId: senderId}, dbObject, {upsert: true, setDefaultsOnInsert: true}, function(err, doc) {
		if(err) console.log(err);
	});
	mailer.sendMail(obj, dbProperties);
}

module.exports.loadDatabaseInfo = loadDatabaseInfo;
module.exports.gettingClientsDBData = gettingClientsDBData;
module.exports.client = client;
module.exports.answerVariants = answerVariants;
module.exports.insertData = insertData;


