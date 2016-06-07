var mongoose = require('mongoose');

var specialistType = []; // = ['Developer', 'QA', 'PM', 'Analyst'];
var previousNextButton = [];//['Previous', 'Next'];
var specialization = [];//['Backend', 'FrontEnd', 'Android', 'IOS'];
var backEndPostbacks = [];//['C', 'C++', 'C#', 'Objective-C', 'PHP', 'Ruby', 'Scala', 'Erlang', 'Go', '1C'];
var frontEndPostbacks = [];//['Html CSS', 'JavaScript', 'Angular JS', 'ReatOS', 'BootStrap'];
var androidPostbacks = [];//['Java SE', 'Android SDK', 'SQL Lite', 'Groovy', 'MVP', 'RxJava', 'Dagger2'];
var IOS = [];//['IOS SDK', 'Objective-C IOS', 'Swift', 'SQL', 'OpenCV'];
var savePostback = [];//['Yes', 'No'];
var locations = [];//['Kiev', 'Lviv', 'Kharkiv'];
var testerSpecialization = [];//['JUnit','Automation','Manual'];
var projectSpecialist = [];//['Upper English', 'Agile', 'Scrum', 'Effect time manager', 'Nice Presentation', 'MS Office'];

var Schema = new mongoose.Schema({
	name : String
});

function loadDatabaseInfo(obj){
	var loadingArray = ['specialistType', 'previousNextButton', 'specialization', 'backEndPostbacks','frontEndPostbacks',
										'androidPostbacks','IOS','savePostback','locations', 'testerSpecialization', 'projectSpecialist'];
	loadingArray.forEach(function(elem, i, arr){
		mongoose.model(elem, Schema, elem).find(function(err, result){
			    result.forEach(function(item, i, arr){
					eval(elem).push(item.toObject().name);
					obj[elem] = eval(elem);
				});		
			});
    });
}

function findSpecs(obj, skill){
	if(obj.backEndPostbacks.indexOf(skill) !== -1){
		obj.backEndPostbacks = filter(obj.backEndPostbacks, skill);
		return obj.backEndPostbacks
	}else if (obj.frontEndPostbacks.indexOf(skill) !== -1){
		obj.frontEndPostbacks = filter(obj.frontEndPostbacks,skill);
		return obj.frontEndPostbacks;
	}else if (obj.androidPostbacks.indexOf(skill) !== -1){
		obj.androidPostbacks = filter(obj.androidPostbacks,skill);
		return obj.androidPostbacks;
	}else if(IOS.indexOf(skill) !== -1){
		obj.IOS = filter(obj.IOS,skill);
		return obj.IOS;
	}else if(obj.testerSpecialization.indexOf(skill) !== -1){
		obj.testerSpecialization = filter(obj.testerSpecialization,skill);
		return obj.testerSpecialization;	
	}else if(obj.projectSpecialist.indexOf(skill) !== -1){
		obj.projectSpecialist = filter(obj.projectSpecialist,skill);
		return obj.projectSpecialist;
	}else{
		return null;
	}
}

function filter(arr, payloadDel){
	var index = arr.indexOf(payloadDel);
	arr.splice(index, 1);
    return arr;             
}

 module.exports.loadDatabaseInfo = loadDatabaseInfo;
 module.exports.findSpecs = findSpecs;
 module.exports.frontEnd = frontEndPostbacks;   
 module.exports.backEnd = backEndPostbacks;
 module.exports.Android = androidPostbacks;
 module.exports.IOS = IOS;
 module.exports.specialization = specialization;
 module.exports.save = savePostback;
 module.exports.locations = locations;
 module.exports.specialistType = specialistType;
 module.exports.previousNextButton = previousNextButton;	 
 module.exports.testerSpecialization = testerSpecialization;
 module.exports.projectSpecialization = projectSpecialist;												     	 												     	 												  