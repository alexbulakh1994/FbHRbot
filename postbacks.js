var specialistType = ['Developer', 'QA', 'PM', 'Analyst'];
var previousNextButton = ['Previous', 'Next'];
var specialization = ['Backend', 'FrontEnd', 'Android', 'IOS'];
var backEndPostbacks = ['C', 'C++', 'C#', 'Objective-C', 'PHP', 'Ruby', 'Scala', 'Erlang', 'Go', '1C'];
var frontEndPostbacks = ['Html CSS', 'JavaScript', 'Angular JS', 'ReatOS', 'BootStrap'];
var androidPostbacks = ['Java SE', 'Android SDK', 'SQL Lite', 'Groovy', 'MVP', 'RxJava', 'Dagger2'];
var IOS = ['IOS SDK', 'Objective-C IOS', 'Swift', 'SQL', 'OpenCV'];
var savePostback = ['Yes', 'No'];
var locations = ['Kiev', 'Lviv', 'Kharkiv'];
var testerSpecialization = ['Manual', 'Automate'];
var projectSpecialist = ['Junior', 'Middle', 'Senior'];
var analystTypeSpecialist = ['Market Analyst', 'System Analyst', 'Finance Analyst'];


var findSpecsBySkill =  function(skill){
	if(backEndPostbacks.indexOf(skill) !== -1){
		return backEndPostbacks;
	}else if (frontEndPostbacks.indexOf(skill) !== -1){
		return frontEndPostbacks;
	}else if (androidPostbacks.indexOf(skill) !== -1){
		return androidPostbacks;
	}else if(IOS.indexOf(skill) !== -1){
		return IOS;
	}else{
		return null;
	}
}

 module.exports findSpecs = findSpecsBySkill;
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