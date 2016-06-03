function filter(arr, payloadDel){
	var index = arr.indexOf(payloadDel);
	arr.splice(index, 1);
    return arr;             
}

function findAttachObject(messageArray){
	for(var i = 0; i < messageArray.length; i++){
		if(messageArray[i].hasOwnProperty('message')){
			if(messageArray[i].message.hasOwnProperty('attachments'))
				return messageArray[i].message.attachments[0];
		}
			
	}
	return null;
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
