module.exports = {

    chooose_spec: {
        attachment: {
            type: "template",
            payload: {
                template_type: "button",
                text: "What do you want to do next?",
                buttons: [{
                    type: "postback",
                    title: "Back-End Developer",
                    payload: "backEnd_dev"
                },
                {
                    type: "postback",
                    title: "Science Reseacher",
                    payload: "science"
                },
                {
                    type: "postback",
                    title: "Front-End Developer",
                    payload: "frontEnd_dev"
                }]
            }
        }
  },

     messageDataBack : {
        attachment: {
            type: "template",
            payload: {
                template_type: "button",
                text: "Choose specialization",
                buttons: [{
                    type: "postback",
                    title: "Ruby",
                    payload: "ruby_dev"
                },
                {
                    type: "postback",
                    title: "python",
                    payload: "python_dev"
                },
                {
                    type: "postback",
                    title: "nodeJS",
                    payload: "node_dev"
                }]
            }
        }
  },

 messageFrontDataBack : {
        attachment: {
            type: "template",
            payload: {
                template_type: "button",
                text: "Choose specialization",
                buttons: [{
                    type: "postback",
                    title: "Html, css",
                    payload: "html_dev"
                },
                {
                    type: "postback",
                    title: "JavaScipt",
                    payload: "javaScript_dev"
                },
                {
                    type: "postback",
                    title: "AngularJS",
                    payload: "angular"
                }]
            }
        }
  },

 messageScienceResearch : {
        attachment: {
            type: "template",
            payload: {
                template_type: "button",
                text: "Choose specialization",
                buttons: [{
                    type: "postback",
                    title: "Python Network",
                    payload: "python_net"
                },
                {
                    type: "postback",
                    title: "Apache Spark",
                    payload: "apache"
                }]
            }
        }
  }

};

