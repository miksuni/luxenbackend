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

  const username = process.env.PT_USER;
  const password = process.env.PT_PASS;
  const apiKey = process.env.PT_API_KEY;
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
  	// handle control commands first
  	var controlCmd = false;
  	var jsonObj = JSON.parse(data);
  	if (jsonObj.method) {
	  console.log('PT: named method');
      /*if (jsonObj.method === '_Keepalive') {
	  	console.log('Control cmd');
	  	controlCmd = true;
      }
      if (controlCmd) {
        jrpc.messageHandler(data);
        return;
      }*/
      jrpc.messageHandler(data);
      return;
    }

    // handle reponses to sent commands
    switch (command) {
	  case TERMINALINFO:
	  {
	    console.log('PT: Response to TerminalInfo');
        if (jsonObj.result.sales_location_name) {
		  console.log('PT: sales_location_name: ' + jsonObj.result.sales_location_name);
        }
        command = 0;
        break;
	  }
	  case STATUS:
	  {
	    console.log('PT: Response to Status');
        command = 0;
        break;
	  }
	  case PURCHASE:
	  {
	    console.log('PT: Response to Purchase');
        command = 0;
        break;
	  }
    }
  });

  jrpc.toStream = function(message){
  	console.log('PT: jrpc.toStream: ' + message);
    var jsonObj = JSON.parse(message);
    if (jsonObj.id) {
  	  jsonObj.id = jsonObj.id.toString();
	  message = JSON.stringify(jsonObj);
      console.log('PT: updated: ' + message);
    }
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
		console.log('PT: timestamp ' + timestamp);
	}
	if (ready_for_transaction) {
		console.log('PT: ready_for_transaction ' + ready_for_transaction);
	}
	if (psp_connection_available) {
		console.log('PT: psp_connection_available ' + psp_connection_available);
	}
	if (transaction_status) {
		console.log('PT: transaction_status ' + transaction_status);
	}
});

jrpc.on('PosMessage', ['message'], function(message) {
	if (message) {
		console.log('PT: message ' + message);
	}
})

jrpc.on('TerminalInfo', ['result'], function(result){
  console.log('PT: TerminalInfo: ' + result);
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

exports.purchase = function (amount, receiptId) {
  console.log('PT: Purchase: ' + amount + ', ' + receiptId);
  command = PURCHASE;

  jrpc.call('Purchase', {"api_key": process.env.PT_API_KEY,
                       "cashier_language": "fi",
					   "receipt_id": receiptId,
		               "amount": amount * 100,
                       "currency": "EUR",
                       "forced_authorization": true
  })
}
