function filter(arr, payloadDel){
	var result = arr.filter(function (el) {
                      return el.payload !== payloadDel;
                 });
    return result;             
}

function findAttachObject(messageArray){
	for(var i = 0; i < messageArray.length; i++){
		if(messageArray[i].hasOwnProperty('message')){
			if(messageArray[i].message.hasOwnProperty('attachments'))
				return messageArray[i].message.attachments[0];
		}
			
	}
}

function findMessageState(messageArray){
	for(var i = 0; i < messageArray.length; i++){
		if(messageArray[i].hasOwnProperty('message')){
				return messageArray[i].message;
		}			
	}
}

module.exports.filter = filter;
module.exports.findAttachObject = findAttachObject;
module.exports.findMessageState = findMessageState;
