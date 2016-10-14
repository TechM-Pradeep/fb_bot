'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
var  fs = require('fs');
var https = require('https');
 var parser = require('./parser.js');
 var constants = require('./constants.js');

 var clearRequire = require('clear-require');
var zipcode=/(^\d{5}$)|(^\d{5}-\d{4}$)/g;
var address, name , originlat , originlong, nearestlat, nearestlong, address1, address2, zip, fulladdress, distance, c, addressC, addressC2 , addressall, zipc, storeaddress, newline, phone,hours, phone1,hours1;
var fulladdressC=[];
var addressarray=[];
var phonearray=[];
var timearray=[];
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

  /*var ipAddress;
  // The request may be forwarded from local web server.
  var forwardedIpsStr = req.header('x-forwarded-for'); 
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    var forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[0]; 
  
  console.log("THIS IS YOUR IP!!!!!!! :");
  console.log(ipAddress); }*/
  
//Display results based on names of manufacturers
var attachment;
 
var req1 = https.request(parser.manufacturers, function(res1) {
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

      
      
      //console.log(ampreplace);
     


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
   
      var regex = new RegExp(ampreplace + ".*", "gi");
      var regex1= new RegExp(ampplain + ".*", "gi");
     //console.log(regex);
     //console.log(regex1);
      
      var match3=text.match(regex);
      var match4=text.match(regex1);
      var zipmatch=text.match(zipcode);
      
           console.log("flag 1");

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
    
               console.log("flag 2");

   
    var search_text = text
    var request = app.textRequest(search_text, options);
    request.on('response', function(response) {   
		var paramToPost= search_text;
		
		if(response.result.fulfillment.speech){
		var fulfillment = response.result.fulfillment.speech;}
			if(response.result.parameters.directFeed){
			var directFeed = response.result.parameters.directFeed;
				console.log("directFeed2" + response.result.parameters.directFeed.toString())
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
			let groupTitleValue = groupTitle.replace(/\s+/g, '');
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
				sendTextMessage(sender,"I am sorry I don’t understand your questions. Please ask again or go to http://www.att.com to get your answers.")
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
 else if(postback_payload == 'Ok.Take a look at other options below:' ){
              OptionButtonCard(sender);
          }
          else if(postback_payload == 'Further Assistance'){
            QuickReply(sender);
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

  clearRequire('./getstorelocation.js');

module.exports.zip1=zip;
    
var getstorelocation = require('./getstorelocation.js');


var req = https.request(getstorelocation.store1, function(res) {

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
      
      if(!count>0){
       sendTextMessage(sender, "Sorry!I was not able to locate any store near " + str + "! Please check the zipcode you have entered or try a different zipcode!")
      }
      else{
        
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
      
    fulladdress= address + "," + zip + ".";
    distance= responseObject.results[0].arcdist;
    phone1= responseObject.results[0].phone;
  hours1=responseObject.results[0].hours;

    for( c=1; c<=count-1; c++){
  addressC= responseObject.results[c].address1;
  phone= responseObject.results[c].phone;
  hours=responseObject.results[c].hours;
  if(responseObject.results[c].address2){
  addressC2=responseObject.results[c].address2;
  addressall=addressC + "," + addressC2;
  }
  else{
     addressall= addressC;
  }
  zipc= responseObject.results[c].city + "," + responseObject.results[c].region + "," + responseObject.results[c].postal;
  storeaddress= addressall + "," + zipc + "."; 
  
  fulladdressC.push(storeaddress); 
  phonearray.push(phone);
  timearray.push(hours);
  
  
  }


if(fulladdressC.length>=5){

    fulladdressC=fulladdressC.slice(0,5);
    phonearray=phonearray.slice(0,5);
    timearray=timearray.slice(0,5);
    //console.log(phonearray);
    //console.log(timearray);
}
    else if(fulladdressC.length>0 && fulladdressC.length<5){
      fulladdressC=fulladdressC.slice(0,fulladdressC.length);
      phonearray=phonearray.slice(0,fulladdressC.length);
      timearray=timearray.slice(0,fulladdressC.length);
      //console.log(phonearray);
      //console.log(timearray);

  
  }

newline= fulladdressC.join("\n\n");


  
let messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Come Visit Us! We'd be happy to help!",
          "subtitle": "Store 1:" + fulladdress + "\n" + "ArcDistance:" + distance + " " + "miles",
      "image_url": "http://www.androidcentral.com/sites/androidcentral.com/files/styles/xlarge/public/article_images/2015/12/att-store-two-signs-hero.jpg?itok=dOdakNe0",
          "buttons": [{
            "type": "web_url",
            "url": 'http://bing.com/maps/default.aspx?rtop=0~~&rtp=pos.' + originlat + '_' + originlong + '~pos.' + nearestlat + '_' + nearestlong + '&mode=',
            "title": "Directions: Store 1",
          }, {
            "type": "postback",
            "title": "Other Stores",
            "payload": "Stores Near " + " " + str + ": \n\n" + newline,
            
          },{
            "type": "postback",
            "title": "Re-Enter Zip",
            "payload": "Please Enter Your ZipCode",
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

fulladdressC.length=0;

}
   });
  });
  req.end();

}

function QuickReply(sender) {

  let messageData = {
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



function sendATTMessage(sender) {


  var req = https.request(parser.options, function(res) {
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

function sendGlobalSearchMessage(sender, response) {
			
	var obj = JSON.parse(response.body);
	  for(var i = 0; i < 3;i++){
		  			  console.log("before change" + obj.response.docs[i].id);
		  		  	console.log("before change" + obj.response.docs[i].title);
		  		  	console.log("before change" + obj.response.docs[i].data_source_name);
 }
		
	

	  for(var i = 0; i < 3;i++){
	  	  if (obj.response.docs[i].data_source_name === "Esupport Feed"){
			  obj.response.docs[i].id = "http://www.att.com/esupport/article.html#!/wireless/" + obj.response.docs[i].id.toString();
			  console.log("after change " + obj.response.docs[i].id);
			  continue
		  }
		  if (obj.response.docs[i].data_source_name === "Device How To - StepByStep"){
			  obj.response.docs[i].id = "https://www.att.com" + obj.response.docs[i].id.toString();
			  console.log("after change " + obj.response.docs[i].id);
			  continue
		  }
		  if (obj.response.docs[i].data_source_name === "Catalog Feed"){
			  obj.response.docs[i].id = obj.response.docs[i].productURL.toString();
			  console.log("after change " + obj.response.docs[i].id);
			  continue
		  }
		  if (obj.response.docs[i].data_source_name === "Device How To - Interactive"){
			  obj.response.docs[i].id = "https://www.att.com" + obj.response.docs[i].id.toString();
			  console.log("after change" + obj.response.docs[i].id);
			  continue

		  }
		  
		 
		  var validUrl = require('valid-url');
		  if (validUrl.isUri(obj.response.docs[i].id)){
			  console.log('Looks like an URL');
		  } else {
			  obj.response.docs[i].id = "http://www.att.com" 
			}
		  
  }

	
  let messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Here are your search results",
          "subtitle": "",
          "image_url": "http://pro.boxoffice.com/wp-content/uploads/2016/07/ATT-Logo.png",
          "buttons": [{
            "type": "web_url",
            "url": obj.response.docs[0].id.toString(),
            "title":  obj.response.docs[0].title.toString().replace(/&amp;/g, '&'),
          }, {
            "type": "web_url",
            "title": obj.response.docs[1].title.toString(),
            "url":  obj.response.docs[1].title.toString().replace(/&amp;/g, '&'),
          }, {
             "type": "web_url",
            "title": obj.response.docs[2].title.toString(),
            "url":  obj.response.docs[2].title.toString().replace(/&amp;/g, '&'),
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
          "image_url": "http://pro.boxoffice.com/wp-content/uploads/2016/07/ATT-Logo.png",
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
