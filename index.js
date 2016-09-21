'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
var https = require('https');
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

  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i++) {
    let event = req.body.entry[0].messaging[i]
    let sender = event.sender.id
    if (event.message && event.message.text) {
      let text = event.message.text
      var elements="Samsung|HTC|Apple|LG|Kyocera|Microsoft|AT&T";
      var arraytry="(" + elements + ")";
      var regex = new RegExp(arraytry + ".*", "gi");
      console.log(regex);
      //var matching=text.match(/\bSamsung.*\b|Apple.*\b|HTC.*\b|Kyocera.*\b|LG.*\b|AT&T.*\b/gi);
      //var match2=text.match(/(Samsung|Apple|HTC|LG|Kyocera|Microsoft).*/gi);
      var match3=text.match(regex);
      //console.log(matches);
      
      /*if (text === 'Generic') {
        sendGenericMessage(sender)
        continue
      }*/
      if (text === 'ATT Services') {
        sendATTMessage(sender)
        continue
      }
      if (text == match3) {
        sendSecondCard(sender)
        continue
      }
      sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
    }
    if (event.postback) {
      let text = JSON.stringify(event.postback)
      var postback_payload = event.postback.payload;
          if(postback_payload == 'ATT Services'){
            sendATTMessage(sender);
          }else{
            sendTextMessage(sender, event.postback.payload, token)
          }
          continue
        }
  }
  res.sendStatus(200)
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

/*function sendGenericMessage(sender) {
  let messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "First card",
          "subtitle": "Element #1 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
          "buttons": [{
            "type": "web_url",
            "url": "https://www.messenger.com",
            "title": "web url"
          }, {
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for first element in a generic bubble",
          }],
        }, {
          "title": "Second card",
          "subtitle": "Element #2 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for second element in a generic bubble",
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
*/

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
      console.log("Passed");
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
            "type": "web_url",
            "title": "I'm looking for something else",
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

// spin spin sugar
app.listen(app.get('port'), function() {
  console.log('running on port', app.get('port'))
})
