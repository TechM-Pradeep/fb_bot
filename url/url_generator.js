var https=require('https');
var http=require('http');




module.exports = {
    getProductsUrl : function () {
        return getProductsUrl();
    },

    getmanufacturersurl : function (){
    	return getmanufacturersurl();
    }
}

var getProductsUrl = function (){
 var url = "https://www.att.com/global-search/gsLayer.jsp?q=*:*&core=GlobalSearch&handler=lucid&role=DEFAULT&start=0&rows=0&user=admin&indent=true&role=DEFAULT&facet=true&facet.field=navigationTree&facet.mincount=1&facet.limit=-1&wt=json";
 

 var responseObject = {'url':url};
  return responseObject;
}

var getmanufacturersurl =function (){
	var urltitle = "https://www.att.com/global-search/gsLayer.jsp?core=GlobalSearch&handler=lucid&role=DEFAULT&q=*:*&facet=false&hl=false&fl=title,manufacturerEscaped&rows=100000&role=DEFAULT&fq=productType:Device&facet.limit=-1&hl=false";

var responseObject1 = {'url':urltitle};
  return responseObject1;	
}

