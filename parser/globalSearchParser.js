
module.exports = {
    golbalSearchParse : function (data) {
        return parseResponse(data);
    }

}


var parseResponse = function (data){
	var obj = data;
	var resultNum = 3;
	
	if(Object.keys(obj.response.docs).length<3){
		console.log("docs length" + Object.keys(obj.response.docs).length.toString())
		resultNum = Object.keys(obj.response.docs).length;
	}
	
	  for(var i = 0; i < resultNum;i++){
		  			  console.log("before change " + obj.response.docs[i].id);
		  		  	console.log("before change " + obj.response.docs[i].title);
		  		  	console.log("before change " + obj.response.docs[i].data_source_name);
	  }
	
 for(var i = 0; i < resultNum;i++){
  
        if (obj.response.docs[i].data_source_name === "Esupport Feed"){
        obj.response.docs[i].id = "http://www.att.com/esupport/article.html#!/wireless/" + obj.response.docs[i].id.toString();
        console.log("Esupport Feed after change " + obj.response.docs[i].id);
        continue
      }
      if (obj.response.docs[i].data_source_name === "Device How To - StepByStep"){
        obj.response.docs[i].id = "https://www.att.com" + obj.response.docs[i].id.toString();
        console.log("Device How To - StepByStep after change " + obj.response.docs[i].id);
        continue
      }
      if (obj.response.docs[i].data_source_name === "Catalog Feed"){
        obj.response.docs[i].id = obj.response.docs[i].productURL.toString();
        console.log("Catalog Feed after change " + obj.response.docs[i].id);
        continue
      }
      if (obj.response.docs[i].data_source_name === "Device How To - Interactive"){
        obj.response.docs[i].id = "https://www.att.com" + obj.response.docs[i].id.toString();
        console.log("Device How To - Interactive after change" + obj.response.docs[i].id);
        continue

      }
      
      var validUrl = require('valid-url');
      if (validUrl.isUri(obj.response.docs[i].id)){
        console.log('Looks like an URL');
      } else {
        obj.response.docs[i].id = "http://www.att.com" 
      }
      
  }

	
	var jsonArr = [];

for (var i = 0; i < resultNum; i++) {
    jsonArr.push({
            "type": "web_url",
            "url": obj.response.docs[i].id.toString(),
            "title": obj.response.docs[i].title.toString().replace(/&amp;/g, '&'),
		
    });
}

	
  var messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Here are your search results",
          "subtitle": "",
          "image_url": "http://pro.boxoffice.com/wp-content/uploads/2016/07/ATT-Logo.png",
          "buttons": jsonArr,
        }]
      }
    }
  }
  
  return messageData;
}

