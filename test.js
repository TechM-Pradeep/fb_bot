/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * http://maps.google.com/maps?q=24.197611,120.780512
 * http://maps.google.com/maps?saddr=Current+Location&daddr=Kochi+Kerala+India
 * http://maps.google.com/?saddr=34.052222,-118.243611&daddr=37.322778,-122.031944
 */
var  fs = require('fs');

module.exports = {
    getStoresTemplate : function (data) {
        return getStoresTemplate(data);
    }

}

//data();
function data(){
    fs.readFile('./stores.json', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      var payload = getStoresTemplate(data);
      //console.log(JSON.stringify(payload));
    });
    
}
function getStoresTemplate(data) {
    var stores = getStores(data);
    if (stores.status == "STORE_FOUND") {
        
        var elements = [];
        var firstElement = {};
        var firstStore = stores.data.stores[0];
        firstElement.title = firstStore.name;
        firstElement.subtitle = firstStore.address;
        firstElement.image_url = "http://www.androidcentral.com/sites/androidcentral.com/files/styles/xlarge/public/article_images/2015/12/att-store-two-signs-hero.jpg?itok=dOdakNe0";
        
        var buttons = [];
        var buttonObject1 = {};
        var map_url = "http://maps.google.com/?saddr="+stores.data.current_geolocation+"&daddr="+firstStore.geolocaton;
        buttonObject1.type = "web_url";
        buttonObject1.url = map_url;
        buttonObject1.title = "Directions";
        
        var otherStorePayLoad = getPayloadStore(0);
        otherStorePayLoad = encodeURI(JSON.stringify(otherStorePayLoad));
        console.log("@@@ "+otherStorePayLoad.length);
        var buttonObject2 = {};
        buttonObject2.type = "postback";
        buttonObject2.title = "Other Stores";
        buttonObject2.payload = otherStorePayLoad;
        
        var buttonObject3 = {};
        buttonObject3.type = "postback";
        buttonObject3.title = "Re-Enter Zip";
        buttonObject3.payload = "Please Enter Your ZipCode";
        
        buttons.push(buttonObject1);
        buttons.push(buttonObject2);
        buttons.push(buttonObject3);
        
        firstElement.buttons = buttons;
        
        elements.push(firstElement);
        
        var payload = {"template_type": "generic", "elements":elements};
        var attachment = {"type": "template","payload":payload};
        var message = {"attachment":attachment};
        
        return message;
    } else if (stores.status == "NO_STORE_FOUND") {
        return stores.data;
    }
}

function getStores(data) {
    var city = ", the place mention by you";
    if (data != undefined) {
        try {
            data = JSON.parse(data);
            city = data.origin.city;
            var stores = [];
            var storesJson = data.results;
            if (storesJson.length > 0) {
                for (var i in storesJson) {
                    var storeJson = storesJson[i];
                    var store = {};
                    store.id = storeJson.id;
                    var storeName = storeJson.mystore_name;
                    if (storeName == undefined) {
                        storeName = storeJson.name;
                    }
                    store.name = storeName;
                    store.phone = storeJson.phone;
                    store.region = storeJson.region;
                    var address = storeJson.address1 + "" + (storeJson.address2 != undefined ? storeJson.address2 : "") + " " + store.region + " " + storeJson.city;
                    store.address = address;
                    store.postal = storeJson.postal;
                    store.geolocaton = storeJson.lat + "," + storeJson.lon;
                    store.url = storeJson.url;
                    stores.push(store);
                }
                var payload = {}
                payload.stores = stores;
                payload.page = 10;
                payload.total_length = stores.length;
                payload.current_geolocation = data.origin.lat+","+data.origin.lon;

                var msg = {};
                msg.status = "STORE_FOUND";
                msg.data = payload;
                return msg;
            }
        } catch (e) {
            console.log(e);
        }
    }

    return getNoStoreMessage(city);
}

function getNoStoreMessage(city){
    var errortext = "Sorry! I was not able to locate any store near " + city + "! Please check the zipcode you have entered or try a different zipcode!";
    var msg = {};
    msg.status = "NO_STORE_FOUND";
    msg.data = errortext;
    
    return msg;
}

function getPayloadStore(index){
    var payload = {};
    payload.type = "OTHER_STORES";
    stores.splice(0,1);
    payload.data = index;
    
    return payload;
}