var mongoose = require('mongoose');

var specialistType = []; // = ['Developer', 'QA', 'PM', 'Analyst'];
var previousNextButton = ['Previous', 'Next'];
var specialization = ['Backend', 'FrontEnd', 'Android', 'IOS'];
var backEndPostbacks = ['C', 'C++', 'C#', 'Objective-C', 'PHP', 'Ruby', 'Scala', 'Erlang', 'Go', '1C'];
var frontEndPostbacks = ['Html CSS', 'JavaScript', 'Angular JS', 'ReatOS', 'BootStrap'];
var androidPostbacks = ['Java SE', 'Android SDK', 'SQL Lite', 'Groovy', 'MVP', 'RxJava', 'Dagger2'];
var IOS = ['IOS SDK', 'Objective-C IOS', 'Swift', 'SQL', 'OpenCV'];
var savePostback = ['Yes', 'No'];
var locations = ['Kiev', 'Lviv', 'Kharkiv'];
var testerSpecialization = ['JUnit','SystemA','Manual'];
var projectSpecialist = ['Junior', 'Middle', 'Senior'];
var analystTypeSpecialist = ['Market Analyst', 'System Analyst', 'Finance Analyst'];

var Schema = new mongoose.Schema({
	name : String
});

function loadDatabaseInfo(loadingArray){
	loadingArray.forEach(function(elem, i, arr){
		mongoose.model(elem, Schema, elem).find(function(err, result){
			    result.forEach(function(item, i, arr){
					eval(elem).push(item.toObject().name);
				});		
			});
    });
}

function findSpecs(skill){
	if(backEndPostbacks.indexOf(skill) !== -1){
		backEndPostbacks = filter(backEndPostbacks, skill);
		return backEndPostbacks
	}else if (frontEndPostbacks.indexOf(skill) !== -1){
		frontEndPostbacks = filter(frontEndPostbacks,skill);
		return frontEndPostbacks;
	}else if (androidPostbacks.indexOf(skill) !== -1){
		androidPostbacks = filter(androidPostbacks,skill);
		return androidPostbacks;
	}else if(IOS.indexOf(skill) !== -1){
		IOS = filter(IOS,skill);
		return IOS;
	}else if(testerSpecialization.indexOf(skill) !== -1){
		testerSpecialization = filter(testerSpecialization,skill);
		return testerSpecialization;	
	}else if(projectSpecialist.indexOf(skill) !== -1){
		projectSpecialist = filter(projectSpecialist,skill);
		return projectSpecialist;
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