var ws = new WebSocket('ws://133.186.251.246:15674/ws');
var client = Stomp.over(ws);
var cCallback = null;

var mqttState = false;

let onConnect = function() {
	mqttState = true;
    cCallback(mqttState);
    //cCallback = null;
};

let onError =  function() {
	mqttState = false;
    cCallback(false);
    //cCallback = null;
};

let onDisConnect = function() {
	mqttState = false;
};

function connectMQTT(callback){
	try {
		cCallback = callback;
		client.connect('app_packagebrowser', 'brwpkgs1410!', onConnect, onError, '/');
	} catch (e) {
		mqttState = false;
	}
}

function disconnectMQTT(){
	client.disconnect(onDisConnect);
}

function mqttSubscription(destination, callback){
	try {
		if(!mqttState)connectMQTT();
		return client.subscribe(destination, callback);
	} catch (e) {
		mqttState = false;
	}
}

connectMQTT();





