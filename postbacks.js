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


 module.exports.frontEnd = frontEndPostbacks;   
 module.exports.backEnd = backEndPostbacks;
 module.exports.science = scienceReseachPostbacks;
 module.exports.specialization = specialization;
 module.exports.save = savePostback;
 module.exports.locations = locations;	 												     	 												     	 												  