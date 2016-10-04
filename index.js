'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
var https = require('https');
var zipcode=/(^\d{5}$)|(^\d{5}-\d{4}$)/g;
var address, name , originlat , originlong, nearestlat, nearestlong, address1, address2, zip, fulladdress, distance, c, addressC, addressC2 , addressall, zipc, storeaddress, comment;
var fulladdressC=[];
var addressarray=[];
const app = express()

app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
  res.send('Hello world I am a secret bot!')
})

// for facebook verification
app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

// to post data
app.post('/webhook/', function (req, res) {
//Display results based on names of manufacturers
var attachment;
  var manufacturers = {
    host: 'www.att.com',
    path: '/global-search/gsLayer.jsp?core=GlobalSearch&handler=lucid&role=DEFAULT&q=*:*&facet=false&hl=false&fl=title,manufacturerEscaped&rows=100000&role=DEFAULT&fq=productType:Device&facet.limit=-1&hl=false',
    method: 'GET',
    headers: {'Accept': 'application/json'}
  };

  var req1 = https.request(manufacturers, function(res1) {
    res1.setEncoding('utf-8');

    var responseString1 = '';

    res1.on('data', function(data) {
      responseString1 += data;
      //console.log("Passed");
    });

    res1.on('end', function() {
      var responseObject1 = JSON.parse(responseString1);
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

      
      
      //console.log(ampreplace);
     


  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i++) {
    let event = req.body.entry[0].messaging[i]
    let sender = event.sender.id
    //Location Services : Mobile-Device only
    /*if (event.message && event.message.attachments && event.message.attachments.length > 0) {
                attachment = event.message.attachments[0];
                //console.log(attachment.payload.coordinates.lat);
                console.log("Attachment Passed");

                if (attachment.type === 'location') {
                  console.log("before func");
                sendStoreLocator(sender, attachment.payload.coordinates);
                console.log(attachment.payload.coordinates);
                console.log("after func");
                }
            }*/
    if (event.message && event.message.text) {
      let text = event.message.text
     
      var regex = new RegExp(ampreplace + ".*", "gi");
      var regex1= new RegExp(ampplain + ".*", "gi");
     //console.log(regex);
     //console.log(regex1);
      
      var match3=text.match(regex);
      var match4=text.match(regex1);
      var zipmatch=text.match(zipcode);
      
      
      
      
      
      if (text === 'ATT Services') {
        sendATTMessage(sender)
        continue
      }
      if (text == match3 || text == match4) {
        sendSecondCard(sender)
        continue
      }
      if (text == zipmatch) {
        var zip=text;
        sendStoreLocator(sender , zip)
        continue
      }
      sendTextMessage(sender, text.substring(0, 200))
    }
    if (event.postback) {
      let text = JSON.stringify(event.postback)
      var postback_payload = event.postback.payload;
          if(postback_payload == 'ATT Services'){
            sendATTMessage(sender);
          } else if(postback_payload == 'Ok.Take a look at other options below:' ){
              OptionButtonCard(sender);
          }
    else{
            sendTextMessage(sender, event.postback.payload, token)
          }
          continue
        }
  }
  res.sendStatus(200)
   });
  });

  req1.end();

})
     
   

     
   

// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.PAGE_ACCESS_TOKEN
const token = "EAACmDQA9zBEBAHX5fUJZCqpAwxSbGziXqBcEjTFDm6EfrEYJXZCxiZBNzL5M252qIV0SWZAmNH7in53glS0wyaDyb6dAzs5daShHN2DrGrdFHSDd4VpD1kkDfIxSbOlKRyfwWsKZB2tBfhAU946N0oZBCIF6IZAcYjAl8gUqEtV9FvaF4SFkwRR"



function sendTextMessage(sender, text) {
  let messageData = { text:text }
  
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}

function sendStoreLocator(sender ,zip) {
  
  var url1='/apis/maps/v2/locator/search/query.json?';
  var url2='&max=150&poi_types=pos&radius=10';
  
   var store = {

    host: 'www.att.com',
     path: url1 + 'q=' + zip + url2 ,
    method: 'GET',
    headers: {'Accept': 'application/json'}
  };

  var req = https.request(store, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
      console.log("Coordinates");
    });

    res.on('end', function() {
      var responseObject = JSON.parse(responseString);
    var str = JSON.stringify(responseObject.origin.city);
      console.log(str);
      var count= responseObject.count;
      
      console.log(count);
      
      /*if(count=0){
            console.log(count);
            sendTextMessage(sender, 'Sorry , no matches found!.');
        }*/
      
      if(count>0){
      name=responseObject.results[0].name;
      originlat=responseObject.origin.lat;
      originlong=responseObject.origin.lon;
      nearestlat=responseObject.results[0].lat;
      nearestlong=responseObject.results[0].lon;
      address1= responseObject.results[0].address1;
      
   if(responseObject.results[0].address2){
        address2=responseObject.results[0].address2;
        
        address=address1+ "," + address2;
        
      }
      else{
      address= address1;
     }
      
    zip= responseObject.results[0].city + "," + responseObject.results[0].region + "," + responseObject.results[0].postal;
      
    fulladdress= address + "," + zip;
    distance= responseObject.results[0].arcdist;

    for( c=1; c<=count-1; c++){
  addressC= responseObject.results[c].address1;
  if(responseObject.results[c].address2){
  addressC2=responseObject.results[c].address2;
  addressall=addressC + "," + addressC2;
  }
  else{
     addressall= addressC;
  }
  zipc= responseObject.results[c].city + "," + responseObject.results[c].region + "," + responseObject.results[c].postal;
  storeaddress= addressall + "," + zipc; 
  
  
  fulladdressC.push(storeaddress); 
  
  
  }}



  

  if(fulladdressC.length>=5){

    fulladdressC=fulladdressC.slice(0,5);
    console.log(fulladdressC);
}
    else if(fulladdressC.length>0 && fulladdressC.length<5){
      fulladdressC=fulladdressC.slice(0,fulladdressC.length);
      console.log(fulladdressC.length);
      console.log(fulladdressC);

  
  }


  
let messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Gotcha! You are looking for stores near" + " " + str,
          "subtitle": "Come Visit Us! We'd be happy to assist!",
          "image_url": "http://www.androidcentral.com/sites/androidcentral.com/files/styles/xlarge/public/article_images/2015/12/att-store-two-signs-hero.jpg?itok=dOdakNe0",
          "buttons": [{
            "type": "web_url",
            "url": 'http://bing.com/maps/default.aspx?rtop=0~~&rtp=pos.' + originlat + '_' + originlong + '~pos.' + nearestlat + '_' + nearestlong + '&mode=',
            "title": "Directions : Nearest Store",
          }, {
            "type": "postback",
            "title": "Other Stores",
            "payload": "Here is a list of other stores nearby: \n" + fulladdressC,
          }],
       }]
      }
    }
    
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
//}
//}
fulladdressC.length=0;

   });
  });
  req.end();

}



function sendATTMessage(sender) {
     var options = {
    host: 'www.att.com',
    path: '/global-search/gsLayer.jsp?q=*:*&core=GlobalSearch&handler=lucid&role=DEFAULT&start=0&rows=0&user=admin&indent=true&role=DEFAULT&facet=true&facet.field=navigationTree&facet.mincount=1&facet.limit=-1&wt=json',
    method: 'GET',
    headers: {'Accept': 'application/json'}
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
      //console.log("Passed");
    });

    res.on('end', function() {
      var responseObject = JSON.parse(responseString);
      var str = JSON.stringify(responseObject.facet_counts.facet_fields.navigationTree);
      var prod1=str.match(/Wireless/g)[0];
      var prod2=str.match(/TV/g)[0];
      var prod3=str.match(/Digital Life/g)[0];
      var prod4=str.match(/Internet/g)[0];
      
  let messageData = {

    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Welcome to the AT&T Support Messenger Bot.",
          "subtitle": "What can we help you with today?",
          "image_url": "http://cdn.bgr.com/2015/12/att-logo-globe.png",
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
          "image_url": "http://cdn.bgr.com/2015/12/att-logo-globe.png",
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

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    } 
}, function(error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
  });
  });
  req.end();
}
function OptionButtonCard(sender) {
 let messageData = {
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
            "payload": "Please enter your zipcode"
          }, {
            "type": "web_url",
            "title": "Other..",
            "url": "https://www.att.com/",
            
          }],
         }]
      }
    }
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}

function sendSecondCard(sender) {
 let messageData = {
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
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}

app.listen(app.get('port'), function() {
  console.log('running on port', app.get('port'))
})
