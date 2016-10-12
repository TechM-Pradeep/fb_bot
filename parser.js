var  fs = require('fs');
var https=require('https');
var http=require('http');


    var options = {
    host: 'www.att.com',
    path: '/global-search/gsLayer.jsp?q=*:*&core=GlobalSearch&handler=lucid&role=DEFAULT&start=0&rows=0&user=admin&indent=true&role=DEFAULT&facet=true&facet.field=navigationTree&facet.mincount=1&facet.limit=-1&wt=json',
    method: 'GET',
    headers: {'Accept': 'application/json'}
  };

  module.exports.options=options;

 
  var manufacturers = {
    host: 'www.att.com',
    path: '/global-search/gsLayer.jsp?core=GlobalSearch&handler=lucid&role=DEFAULT&q=*:*&facet=false&hl=false&fl=title,manufacturerEscaped&rows=100000&role=DEFAULT&fq=productType:Device&facet.limit=-1&hl=false',
    method: 'GET',
    headers: {'Accept': 'application/json'}
  };
  
  module.exports.manufacturers=manufacturers;

