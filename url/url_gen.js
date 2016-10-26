var https=require('https');
var http=require('http');

var index= require('../index.js');


module.exports = {
   
   getlocation : function (){
    	return getlocation();
    }
}

var getlocation =function (){

	var zippass= index.zip1;
	var url1='/apis/maps/v2/locator/search/query.json?';
  var url2='&max=10&poi_types=pos&radius=10';

	var url = "https://www.att.com" + url1 + "q=" + zippass + url2 ;

var responseObject = {'url':url};
  return responseObject;	
}

