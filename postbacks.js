var specialization = [{type: "postback", title: "Backend Developer", payload: "backEnd_dev"}, 
    	 												  {type: "postback", title: "Science Reseacher", payload: "science"}, 
    	 												  {type: "postback", title: "FrontEnd Developer", payload: "frontEnd_dev"}];

 var backEndPostbacks = [{type: "postback", title: "Ruby", payload: "ruby_dev"}, 
    	 												  {type: "postback", title: "Python", payload: "python_dev"}, 
    	 												  {type: "postback", title: "Node JS", payload: "node_dev"},
    	 												  {type: "postback", title: "All skills was choosen", payload: "finish"}];

 var scienceReseachPostbacks = [{type: "postback", title: "Python Network", payload: "python_net"}, 
    	 												  {type: "postback", title: "Apache Spark", payload: "apache"},
    	 												  {type: "postback", title: "All skills was choosen", payload: "finish"}];

var frontEndPostbacks = [{type: "postback", title: "HTML, CSS", payload: "html_dev"}, 
    	 												  {type: "postback", title: "JavaScript", payload: "javaScript_dev"}, 
    	 												  {type: "postback", title: "Angular JS", payload: "angular"},
    	 												  {type: "postback", title: "All skills was choosen", payload: "finish"}];

 module.exports.frontEnd = frontEndPostbacks;   
 module.exports.backEnd = backEndPostbacks;
 module.exports.science = scienceReseachPostbacks;
 module.exports.specialization = specialization;	 												     	 												     	 												  