const WebSocket = require('ws');
const JsonRPC = require('simple-jsonrpc-js');

exports.myDateTime = function () {
  return Date();
};

exports.startWS = function () {
  console.log('>> startWS');
  const ws = new WebSocket('wss://fierce-shelf-80455.herokuapp.com');

  ////////////////////////////////////////////
  var jrpc = new JsonRPC();
  ws.jrpc = jrpc;

  

  ws.on('message', function incoming(data) {
  	  console.log(data);

  	  jrpc.call('mul', {y: 3, x: 2}).then(function (result) {
           console.log('>> mul result: ' + result);
      });
  });

  ws.jrpc.toStream = function(message){
    ws.send(message);
  }
  ///////////////////////////////////////////

};
