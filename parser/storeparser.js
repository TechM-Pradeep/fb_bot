var  fs = require('fs');

var address, name , originlat , originlong, nearestlat, nearestlong, address1, address2, zip, fulladdress, distance, c, addressC, addressC2 , addressall, zipc, storeaddress, newline, phone,hours, phone1,hours1;
var fulladdressC=[];
var addressarray=[];
var phonearray=[];
var timearray=[];

module.exports = {
    parse1 : function (data) {
        return parsetitle(data);
    }

}


var parsetitle = function(data){
  var responseObject = JSON.parse(data);
      
    var str = JSON.stringify(responseObject.origin.city);
      console.log(str);
      var count= responseObject.count;
      
      console.log(count);
      
      if(count>0)
    {
        
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


  
var messageData = {
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
  

}

var errortext = "Sorry! I was not able to locate any store near " + str + "! Please check the zipcode you have entered or try a different zipcode!";
module.exports.errorcode=errortext;
return [count,messageData];

}