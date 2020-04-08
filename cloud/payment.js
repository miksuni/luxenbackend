const WebSocket = require('ws');
const JsonRPC = require('simple-jsonrpc-js');

const jrpc = new JsonRPC();

const TERMINALINFO = 1;
const STATUS = 2;
const PURCHASE = 3;
var command = 0;

exports.myDateTime = function () {
  return Date();
};

exports.startWS = function () {
  console.log('>> startWS');
  //const ws = new WebSocket('ws://fierce-shelf-80455.herokuapp.com');
  //console.log('wss://' + process.env.TP_USER + ':' + process.env.TP_PASS + '@api.sandbox.poplatek.com/api/v2/terminal/' + process.env.TERMINAL_ID + '/jsonpos');

  const username = process.env.TP_USER;
  const password = process.env.TP_PASS;
  const terminalid = process.env.TERMINAL_ID;

  const ws = new WebSocket(`wss://${username}:${password}@api.poplatek.com/api/v2/terminal/${terminalid}/jsonpos`, [ 'jsonrpc2.0' ]);

  ws.on('open', function open() {
    ws.send(JSON.stringify({
        "jsonrpc": "2.0",
        "method": "TerminalInfo",
        "id": "pos-1",
        "params": {
        }
    }));
  });

  ws.on('message', function incoming(data) {
  	  console.log('ws.on message:' + data);
      jrpc.messageHandler(data);
  });

  jrpc.toStream = function(message){
  	console.log('jrpc.toStream: ' + message);
    ws.send(message);
  }

  jrpc.on('_Keepalive', [], function(){
    return {};
  });

  jrpc.on('StatusEvent', ['timestamp', 
						'ready_for_transaction', 
						'psp_connection_available', 
						'transaction_status', 
						'chip_card_in',
						'update_status',
						'update_progress',
						'update_eta',
						'battery_charging',
						'plugged_in'],
						function(timestamp, 
						ready_for_transaction, 
						psp_connection_available, 
						transaction_status, 
						chip_card_in,
						update_status,
						update_progress,
						update_eta,
						battery_charging,
						plugged_in) {
	if (timestamp) {
		console.log('timestamp ' + timestamp);
	}
	if (ready_for_transaction) {
		console.log('ready_for_transaction ' + ready_for_transaction);
	}
	if (psp_connection_available) {
		console.log('psp_connection_available ' + psp_connection_available);
	}
})

jrpc.on('TerminalInfo', ['result'], function(result){
  console.log('TerminalInfo: ' + result);
});
};

exports.mul = function () {
  jrpc.call('mul', {y: 3, x: 2}).then(function (result) {
    console.log('>> mul result: ' + result);
  });
}

exports.keepalive = function () {
  jrpc.call('_Keepalive', {});
}
