//var ITSpecialist = ['Developer', 'QA', 'Project Manager', 'Analyst'];

var specialistType = [{type: "postback", title: "Developer", payload: "developer"}, 
    	 												  {type: "postback", title: "QA", payload: "tester"}, 
    	 												  {type: "postback", title: "FrontEnd Developer", payload: "projManager"},
    	 												  {type: "postback", title: "Analyst", payload: "analitic"}];

var previousNextButton = [{type: "postback", title: "Previous", payload: "prev"},
						  {type: "postback", title: "Next", payload: "next"}];  

var testerSpecialization = [{type: "postback", title: "Manual", payload: "manual"},
						    {type: "postback", title: "Automation Tester", payload: "automate"}]; 

var projectSpecialization = [{type: "postback", title: "Junior PM", payload: "junior"},
						    {type: "postback", title: "Middle PM", payload: "middle"},
						    {type: "postback", title: "Senior PM", payload: "senior"}]; 						     						    	 												  

var specialization = [{type: "postback", title: "Backend Developer", payload: "backEnd_dev"}, 
    	 												  {type: "postback", title: "Science Reseacher", payload: "science"}, 
    	 												  {type: "postback", title: "FrontEnd Developer", payload: "frontEnd_dev"}];

 var backEndPostbacks = [{type: "postback", title: "Ruby", payload: "ruby_dev"}, 
    	 												  {type: "postback", title: "Python", payload: "python_dev"}, 
    	 												  {type: "postback", title: "Node JS", payload: "node_dev"}];

 var scienceReseachPostbacks = [{type: "postback", title: "Python Network", payload: "python_net"}, 
    	 												  {type: "postback", title: "Apache Spark", payload: "apache"}];

var frontEndPostbacks = [{type: "postback", title: "HTML, CSS", payload: "html_dev"}, 
    	 												  {type: "postback", title: "JavaScript", payload: "javaScript_dev"}, 
    	 												  {type: "postback", title: "Angular JS", payload: "angular"}];

var savePostback =  [{type: "postback", title: "YES", payload: "yes_save"}, 
    	 												  {type: "postback", title: "NO", payload: "no_save"}];

var locations =  [{type: "postback", title: "Kiev", payload: "kiev_loc"}, 
    	 												  {type: "postback", title: "Kharkiv", payload: "kharkiv_loc"}, 
    	 												  {type: "postback", title: "Lviv", payload: "lviv_loc"}];

var buttonsConstructor = function(elements){
	buttons = [];
	elements.forEach(function(obj){
		buttons.push({type: 'postback', title: obj, payload: obj.toUpperCase() });
	});
}    	 												  


 module.exports.frontEnd = frontEndPostbacks;   
 module.exports.backEnd = backEndPostbacks;
 module.exports.science = scienceReseachPostbacks;
 module.exports.specialization = specialization;
 module.exports.save = savePostback;
 module.exports.locations = locations;
 module.exports.specialistType = specialistType;
 module.exports.previousNextButton = previousNextButton;	 
 module.exports.testerSpecialization = testerSpecialization;												     	 												     	 												  