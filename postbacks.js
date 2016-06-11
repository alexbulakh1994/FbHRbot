var mongoose = require('mongoose');

var specialistType = []; 
var previousNextButton = [];
var specialization = [];
var backEndPostbacks = [];
var frontEndPostbacks = [];
var androidPostbacks = [];
var IOS = [];
var savePostback = [];
var locations = [];
var testerSpecialization = [];
var projectSpecialist = [];
var themselvesInformationType = ['phone number', 'email', 'phone number + email'];

var loadingArray = ['specialistType', 'previousNextButton', 'specialization', 'backEndPostbacks','frontEndPostbacks',
										'androidPostbacks','IOS','savePostback','locations', 'testerSpecialization', 'projectSpecialist'];
var Schema = new mongoose.Schema({
	name : String
});

function loadDatabaseInfo(){
	loadingArray.forEach(function(elem, i, arr){
		mongoose.model(elem, Schema, elem).find(function(err, result){
			    result.forEach(function(item, i, arr){
					eval(elem).push(item.toObject().name);
				});		
			});
    });
}

function gettingClientsDBData(obj){
	loadingArray.forEach(function(elem, i, arr){
		obj[elem] = eval(elem);
	});									
}

function choosedDevSpecialization(obj, spec){
	if(spec === 'BackEnd'){
		return obj.backEndPostbacks;
	}else if(spec === 'FrontEnd'){
		return obj.frontEndPostbacks;
	}else if(spec === 'Android'){
		return obj.androidPostbacks;
	}else if(spec === 'IOS'){
		return obj.IOS;
	}
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

function printSkillList(skillList, titleText){
	var result = '';
	skillList.forEach(function(item, a, arr){
        result = result.concat(item).concat(' \n');
	});
	return titleText.concat(result);
}

function filter(arr, payloadDel){
	var index = arr.indexOf(payloadDel);
	arr.splice(index, 1);
    return arr;             
}

 module.exports.choosedDevSpecialization = choosedDevSpecialization;
 module.exports.printSkillList = printSkillList;
 module.exports.gettingClientsDBData = gettingClientsDBData;
 module.exports.themselvesInformationType = themselvesInformationType;
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