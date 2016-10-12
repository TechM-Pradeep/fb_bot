
var index = require('./index.js');
var  fs = require('fs');
var https=require('https');
var http=require('http');


var zippass= index.zip1;
 console.log(zippass);

 var url1='/apis/maps/v2/locator/search/query.json?';
  var url2='&max=150&poi_types=pos&radius=10';
  
   var store = {

    host: 'www.att.com',
     path: url1 + 'q=' + zippass + url2 ,
    method: 'GET',
    headers: {'Accept': 'application/json'}
  };

  module.exports.store1=store;

