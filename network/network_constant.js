function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

define("IS_PROXY_ENABLED",false);
define("PROXY_URL",'http://one.proxy.att.com:8080');
define("ON_SUCCESS",1);
define("ON_FAILURE",2);