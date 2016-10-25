'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
var  fs = require('fs');
var https = require('https');
var constants = require('./constants.js');
var clearRequire = require('clear-require');
var secondCardMessage = require('./parser/secondCard.js');
var globalSearchParser = require('./parser/globalSearchParser.js');

 
var zipcode=constants.zipcity;
var zip;
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
  if (req.query['hub.verify_token'] === constants.webHook_Verify) {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

// to post data
app.post('/webhook/', function (req, res) {

  
//Display results based on names of manufacturers
var attachment;
 

var titlenames = require('./parser/dataparsing.js');
var urlGenerator = require('./url/url_generator.js');
var rest_util = require('./network/rest_util.js');
var NETWORK_CONSTANT = require('./network/network_constant.js');
const EventEmitter = require('events');
  var urlData = urlGenerator.getmanufacturersurl();
  

class NetworkEventListener extends EventEmitter {}
const networkListener = new NetworkEventListener();
networkListener.on(NETWORK_CONSTANT.ON_SUCCESS, function(response) {
var data3=  titlenames.parsenew(response);

posttitle(data3[0],data3[1]);

});

networkListener.on(NETWORK_CONSTANT.ON_FAILURE, function(response) {
  
});

rest_util.fetchResponse(urlData, networkListener);

function posttitle(ampval1,ampval2){     


  let messaging_events = req.body.entry[0].messaging
  
  //Connect to Api.ai
  var access_token = constants.APIAI_ACCESS_TOKEN;
  var apiai = require('apiai')
  var app = apiai(access_token)
  var options = {
    proxy: 'http://one.proxy.att.com:8080'
}
//va
  
  
  for (let i = 0; i < messaging_events.length; i++) {
    
    let event = req.body.entry[0].messaging[i]
    let sender = event.sender.id
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
   
      var regex = new RegExp(ampval1 + ".*", "gi");
      var regex1= new RegExp(ampval2 + ".*", "gi");
     
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
        zip=text;
        sendStoreLocator(sender , zip)
        continue
      }
    

   
    var search_text = text
    var request = app.textRequest(search_text, options);
    request.on('response', function(response) {   
    var paramToPost= search_text;
    
    if(response.result.fulfillment.speech){
    var fulfillment = response.result.fulfillment.speech;}
      if(response.result.parameters.directFeed){
      var directFeed = response.result.parameters.directFeed;
      }
      
    console.log("api.ai return " + JSON.stringify(response));
      
    if (response.result.parameters.globalSearch){
          console.log("global search console: " +response.result.parameters.globalSearch);
        paramToPost = response.result.parameters.globalSearch;
    }
      
    
      var groupTitle="";
      var groupUrl="";
      var groupFulfillment="";
      if(paramToPost == "group"){
       groupTitle = response.result.parameters.ATTgroup;

      var groupTitleValue = groupTitle.replace(/\s+/g, '');
     groupTitleValue = groupTitleValue.replace(/[^\w\s]/gi, '')

       groupUrl = response.result.parameters[groupTitleValue];
       groupFulfillment = response.result.fulfillment.speech;

    }    
      
           
    var callBackValue = postToGlobalSearch(paramToPost).then(function (response) {
      var obj = JSON.parse(response.body);
      
      if(directFeed){
        sendTextMessage(sender,fulfillment)
      }else if(paramToPost == "group"){
          console.log("FLAG before");
       sendATTGroupMessage(sender, groupTitle, groupUrl, groupFulfillment) 
       
      }else if((parseInt(obj.response.numFound)>0)&&(paramToPost!="group")){
        sendGlobalSearchMessage(sender,response)
      }else{
        sendTextMessage(sender,constants.default_Fullfillment)
      }
    })
    .catch(function (err) {
               console.log("global search return error " + err);
    });
      
    });
    request.on('error', function(error) {
    console.log(error);
  });

    request.end();
    
    //Echo response    
     // sendTextMessage(sender, text.substring(0, 200))
    }
        
    if (event.postback) {
      let text = JSON.stringify(event.postback)
      var postback_payload = event.postback.payload;
          if(postback_payload == 'ATT Services'){
            sendATTMessage(sender);
          }
 else if(postback_payload == 'Ok.Take a look at other options below:'){
              OptionButtonCard(sender);
          }
          else if(postback_payload == 'Further Assistance'){
            QuickReply(sender);
          }
    else{
            //sendTextMessage(sender, event.postback.payload, token)
            showMoreStores(sender, event.postback.payload, token);
          }
          continue
        }
  }
  res.sendStatus(200)
   }

})
  

// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.PAGE_ACCESS_TOKEN
const token = constants.FB_ACCESS_TOKEN;

function postToGlobalSearch(paramToPost){

  var rp = require('request-promise');
  var urlToGet =  paramToPost.replace(' ', '+');
  urlToGet = constants.globalSearchAPIStart + urlToGet + constants.globalSearchAPIEnd;
  
  console.log("urlToGet " + urlToGet)


var options = {
    method: 'GET',
    uri: urlToGet,
    resolveWithFullResponse: true    //  <---  <---  <---  <---
};
return rp(options);

}



function sendTextMessage(sender, text) {
  let messageData = { text:text }
  
  request({
    url: constants.FB_Message,
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

clearRequire('./parser/storeparser.js');

module.exports.zip1=zip;
    
var storenames = require('./parser/storeparser.js');
var urlGenerator = require('./url/url_gen.js');
var rest_util = require('./network/rest_util.js');
var NETWORK_CONSTANT = require('./network/network_constant.js');
const EventEmitter = require('events');
var urlData = urlGenerator.getlocation();
  

class NetworkEventListener extends EventEmitter {}
const networkListener = new NetworkEventListener();
networkListener.on(NETWORK_CONSTANT.ON_SUCCESS, function(response) {
  
var data2=  storenames.parse1(response);

if(!data2[0]>0){

sendTextMessage(sender, storenames.errorcode)
}

else{
var struct= data2[1];
postStore(sender,struct); 
}

});

networkListener.on(NETWORK_CONSTANT.ON_FAILURE, function(response) {
  console.log(response);
});

rest_util.fetchResponse(urlData, networkListener);

}

function postStore(sender, storevalue){
  request({
    url: constants.FB_Message,
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: storevalue,
    } 
}, function(error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}


var prodnames = require('./parser/dataparsing.js');

function sendATTMessage(sender) {

var urlGenerator = require('./url/url_generator.js');
var rest_util = require('./network/rest_util.js');
var NETWORK_CONSTANT = require('./network/network_constant.js');
const EventEmitter = require('events');
  var urlData = urlGenerator.getProductsUrl();
  

class NetworkEventListener extends EventEmitter {}
const networkListener = new NetworkEventListener();
networkListener.on(NETWORK_CONSTANT.ON_SUCCESS, function(response) {
  //console.log(response);
 var data1=  prodnames.parse(response);
postProduct(sender,data1);

});

networkListener.on(NETWORK_CONSTANT.ON_FAILURE, function(response) {
  console.log(response);
});

rest_util.fetchResponse(urlData, networkListener);

}

function postProduct(sender, products){
  

  request({
    url: constants.FB_Message,
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: products,
    } 
}, function(error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}


function OptionButtonCard(sender) {
 let messageData = prodnames.optionButtonCarddata();
  request({
    url: constants.FB_Message,
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


function sendGlobalSearchMessage(sender, response) {
		console.log("0");

	var data = JSON.parse(response.body);
	console.log("1");
	var messageData = globalSearchParser.golbalSearchParse(data);
	console.log("2");

  request({
    url: constants.FB_Message,
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



function sendATTGroupMessage(sender, groupTitle, groupUrl, groupFulfillment) {

  let title = groupTitle.toString();
  let URL = groupUrl.toString();
  let Fulfillment = groupFulfillment.toString();

    let messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": Fulfillment,
          "subtitle": "",
          "image_url": constants.ATTLogo,
          "buttons": [{
            "type": "web_url",
            "url": URL,
            "title": title,
          }],
        }]
      }
    }
  }
  request({
    url: constants.FB_Message,
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
 let messageData = secondCardMessage.secondCardData();
  request({
    url: constants.FB_Message,
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

function QuickReply(sender) {

  let messageData = prodnames.quickreplyCarddata();
     
  request({
    url: constants.FB_Message,
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

function showMoreStores(sender, payload, token){
        var messageData = {
"attachment":{
"type":"template",
        "payload":{
        "template_type":"generic",
        "elements":[
          {
            "title":"Welcome to Peter\'s Hats",
            "item_url":"https://petersfancybrownhats.com",
            "image_url":"https://petersfancybrownhats.com/company_image.png",
            "subtitle":"We\'ve got the right hat for everyone.",
            "buttons":[
              {
                "type":"web_url",
                "url":"https://petersfancybrownhats.com",
                "title":"View Website"
              },
              {
                "type":"postback",
                "title":"Start Chatting",
                "payload":"DEVELOPER_DEFINED_PAYLOAD"
              },
              {
                "type":"postback",
                "title":"Start Chatting",
                "payload":"DEVELOPER_DEFINED_PAYLOAD"
              } ,
              {
                "type":"postback",
                "title":"Start Chatting",
                "payload":"DEVELOPER_DEFINED_PAYLOAD"
              } ,
              {
                "type":"postback",
                "title":"Start Chatting",
                "payload":"DEVELOPER_DEFINED_PAYLOAD"
              } ,
              {
                "type":"postback",
                "title":"Start Chatting",
                "payload":"DEVELOPER_DEFINED_PAYLOAD"
              } ,
              {
                "type":"postback",
                "title":"Start Chatting",
                "payload":"DEVELOPER_DEFINED_PAYLOAD"
              } ,
              {
                "type":"postback",
                "title":"Start Chatting",
                "payload":"DEVELOPER_DEFINED_PAYLOAD"
              } ,
              {
                "type":"postback",
                "title":"Start Chatting",
                "payload":"DEVELOPER_DEFINED_PAYLOAD"
              }            
            ]
          }
        ]
      }
}
}

request({
url: constants.FB_Message,
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

