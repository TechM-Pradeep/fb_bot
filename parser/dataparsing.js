var  fs = require('fs');
//var index= require('./index.js');
module.exports = {
    parse : function (data) {
        return parseResult(data);
    },

    parsenew : function (data) {
      return parsetitle(data);
    },
    optionButtonCarddata : function () {
        return optionButtonCard();
    },

    quickreplyCarddata : function () {
        return quickreplycard();
    }

}

var parseResult= function(data){
      var responseObject = JSON.parse(data);
      var str = JSON.stringify(responseObject.facet_counts.facet_fields.navigationTree);
      var prod1=str.match(/Wireless/g)[0];
      var prod2=str.match(/TV/g)[0];
      var prod3=str.match(/Digital Life/g)[0];
      var prod4=str.match(/Internet/g)[0];

      var messageData = {

    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Welcome to the AT&T Support Messenger Bot.",
          "subtitle": "What can we help you with today?",
          "image_url": "http://pro.boxoffice.com/wp-content/uploads/2016/07/ATT-Logo.png",
          "buttons": [{
            "type": "postback",
            "title": prod1,
            "payload": "What device would you like help with?",
          }, {
            "type": "web_url",
            "title": prod2,
            "url": "https://www.att.com/tv/",
          }, {
            "type": "web_url",
            "title": prod3,
            "url": "https://my-digitallife.att.com/learn/home-security-and-automation",
          }],
        }, {
          "title": "Welcome to the AT&T Support Messenger Bot.",
          "subtitle": "What can we help you with today?",
          "image_url": "http://pro.boxoffice.com/wp-content/uploads/2016/07/ATT-Logo.png",
          "buttons": [{
            "type": "web_url",
            "title": prod4,
            "url": "https://www.att.com/internet/",
            }, {
            "type": "web_url",
            "title": "Bundles",
            "url": "https://www.att.com/bundles/",
          }],
        }]
      }
    }
  }
     

      return messageData;

      



}

var parsetitle= function(data){
  var responseObject1 = JSON.parse(data);
  var str1 = JSON.stringify(responseObject1.response.docs);
      var mf=responseObject1.response.docs;
      var titlearray=[];
      var namearray=[];
      for (var l in mf){
        var tmparray= mf[l];
        
        titlearray.push(tmparray.manufacturerEscaped[0]);
        namearray.push(tmparray.title);

      }
      

      var unique = titlearray.filter(function(elem, index, self) {
    return index == self.indexOf(elem);

})
      
      var stringify=JSON.stringify(unique);
      var brackets=stringify.split(/[\{\[]/).join('(').split(/[\}\]]/).join(')');
      var quotes=brackets.replace(/"/g, "");
      var pipe=quotes.replace(/,/g, "|");
      var ampreplace=pipe.replace(/&amp;/g, "&");
      var ampplain=pipe.replace(/&amp;/g, "");
console.log(ampplain);
      return [ampreplace,ampplain];
}


var optionButtonCard = function(){
  var messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Ok. Let's take a look at the other options below:",
          "subtitle": "",
          //"image_url": "https://www.kirkwoodsweeper.com/media/wysiwyg/john_uploads/kirkwood%20store%20locations.jpg",
          "buttons": [{
            "type": "postback",
            "title": "Store Locations",
            "payload": "Please Enter Your ZipCode"
          }, {
            "type": "postback",
            "title": "Other..",
            "payload": "Further Assistance",
            
          }],
         }]
      }
    }
  }
  return messageData;
}

var quickreplycard = function(){
  var messageData = {
    "attachment":{
      "type":"template",
         "payload":{
            "template_type":"button",
            "text":"Need further assistance?",
            "buttons":[
            {
                  "type":"web_url",
                  "title":"Connect with us!",
                  "url":"http://about.att.com/sites/social_media"
               },
               {
                  "type":"phone_number",
                  "title":"Call Representative",
                  "payload":"+18003310500"
               }
            ]
         }
    }
  }
  return messageData;
}