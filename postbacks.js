var specialization = [{title: "Backend Developer", payload: "backEnd_dev"}, 
    	 												  {title: "Science Reseacher", payload: "science"}, 
    	 												  {title: "FrontEnd Developer", payload: "frontEnd_dev"}];

 var backEndPostbacks = [{title: "Ruby", payload: "ruby_dev"}, 
    	 												  {title: "Python", payload: "python_dev"}, 
    	 												  {title: "Node JS", payload: "node_dev"},
    	 												  {title: "All skills was choosen", payload: "finish"}];

 var scienceReseachPostbacks = [{title: "Python Network", payload: "python_net"}, 
    	 												  {title: "Apache Spark", payload: "apache"},
    	 												  {title: "All skills was choosen", payload: "finish"}];

var frontEndPostbacks = [{title: "HTML, CSS", payload: "html_dev"}, 
    	 												  {title: "JavaScript", payload: "javaScript_dev"}, 
    	 												  {title: "Angular JS", payload: "angular"},
    	 												  {title: "All skills was choosen", payload: "finish"}];

 module.exports.frontEnd = frontEndPostbacks;   
 module.exports.backEnd = backEndPostbacks;
 module.exports.science = scienceReseachPostbacks;
 module.exports.specialization = specialization;	 												     	 												     	 												  