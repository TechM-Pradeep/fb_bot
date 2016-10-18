var  fs = require('fs');
//var index= require('./index.js');
module.exports = {
    parse : function (data) {
        return parseResult(data);
    },

    parsenew : function (data) {
      return parsetitle(data);
    }

}


var parseResult = function (data){
    if(data == undefined){
    fs.readFile('./stub/search.json', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      console.log("FROM STUB!");
      return getProducts(data);
    });
   }else{
    
      return getProducts(data);
   }
}

var parsetitle = function (data){
  if(data == undefined){
    fs.readFile('./stub/search.json', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      console.log("FROM STUB!");
      return gettitle(data);
    });
   }else{
    
      return gettitle(data);
   }
}


function getProducts(data){
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

function gettitle(data){
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
      
//console.log(namearray);
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