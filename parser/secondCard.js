
module.exports = {
    secondCardData : function () {
        return secondCard();
    }

}


var secondCard = function (){
	
	var messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Thank You! Popular Solutions are:",
          "subtitle": "",
          //"image_url": "http://messengerdemo.parseapp.com/img/rift.png",
          "buttons": [{
            "type": "web_url",
            "url": "https://www.att.com/esupport/article.html#!/wireless/KM1008625",
            "title": "View your current bill online"
          }, {
            "type": "web_url",
            "title": "Unlocking phone or tablet",
            "url": "https://www.att.com/esupport/article.html#!/wireless/KM1008728",
            }, {
            "type": "web_url",
            "title": "Managing mobile purchases and subscriptions",
            "url": "https://www.att.com/esupport/article.html#!/wireless/KM1009396",
          }],
          }, {
          "title": "Thank You! Popular solutions are:",
          "subtitle": "",
          //"image_url": "http://cdn.bgr.com/2015/12/att-logo-globe.png",
          "buttons": [{
            "type": "web_url",
            "title": "Canceling wireless service or removing a line",
            "url": "https://www.att.com/esupport/article.html#!/wireless/KM1008472",
            }, {
            "type": "web_url",
            "title": "Refilling your GoPhone account balance",
            "url": "https://www.att.com/esupport/article.html#!/wireless/KM1008656",
            }, {
            "type": "postback",
            "title": "I am looking for something else",
            "payload": "Ok.Take a look at other options below:",
          }],
        }]
      }
    }
  }

  return messageData;
}

