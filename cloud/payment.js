const WebSocket = require('ws');
const JsonRPC = require('simple-jsonrpc-js');

const jrpc = new JsonRPC();
var ws;

// PT commands (by PT specs)
const TERMINALINFO = 1;
const STATUS = 2;
const PURCHASE = 3;
const CHECK = 4;
var command = 0;

// PT statuses (by WebSocket specs)
const CONNECTING = 0;
const OPEN = 1;
const CLOSING = 2;
const CLOSED = 3;

// Payment status
const FAILED = -1;
const OK = 0;
const PROCESSING = 1;
const UNKNOWN = 2;

// watch dog, not used for the time being
// because PT backend would reponse to keepalive
// even though PT disconnected
//var watchDog = 0;
//var watchDogId = "";
var connectionClosedByPeer = false;

var lastSentId = "";

var transactionStatus = 0;
var transactionStatusMap = new Map();
transactionStatusMap.set("PROCESSING", 1);
transactionStatusMap.set("WAIT_CARD_IN", 2);
transactionStatusMap.set("WAIT_CARD_OUT", 3);
transactionStatusMap.set("WAIT_POS", 4);

var posMessage = "";
var paymentStatus = UNKNOWN;

var lastResult = { merchantReceipt: "", customerReceipt: ""};

exports.myDateTime = function () {
  return Date();
};

exports.startWS = function () {
  console.log('>> startWS');
  //const ws = new WebSocket('ws://fierce-shelf-80455.herokuapp.com');

  const username = process.env.PT_USER;
  const password = process.env.PT_PASS;
  const apiKey = process.env.PT_API_KEY;
  const terminalid = process.env.TERMINAL_ID;

  var doConnect = false;

  try {
	if (ws) {
		if (ws.readyState === CLOSED) {
			doConnect = true;
		}
	} else {
      doConnect = true;
	}
	if (doConnect) {
      ws = new WebSocket(`wss://${username}:${password}@api.poplatek.com/api/v2/terminal/${terminalid}/jsonpos`, [ 'jsonrpc2.0' ]);
      console.log('>> Ws connection created');
    }
  } catch(err) {
	console.log('>> catched error in createing ws: ' + err.message);
  }
  ws.on('open', function open() {
	console.log('ws.on open' );
    connectionClosedByPeer = false;
    ws.send(JSON.stringify({
        "jsonrpc": "2.0",
        "method": "TerminalInfo",
        "id": "pos-1",
        "params": {
        }
    }));
  });

  ws.on('message', function incoming(data) {
    console.log('ws.on message: ' + data);
  	// handle control commands first
  	var controlCmd = false;
  	var jsonObj = JSON.parse(data);
    //if (jsonObj.id === watchDogId) {
    //  console.log("response to keepalive")
    //  watchDog--;
    //}
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
      case CHECK:
	  {
	    console.log('PT: Response to Purchase');
        command = 0;
        if (jsonObj.result) {
          console.log('Card payment succesful')
          transactionStatus = 0;
          posMessage = "";
          paymentStatus = OK;
          lastResult.merchantReceipt = jsonObj.result.merchant_receipt.text;
          lastResult.customerReceipt = jsonObj.result.customer_receipt.text;
          
        } else {
          console.log('Card payment failed');
          transactionStatus = 0;
          posMessage = "";
          if (jsonObj.error.message) {
            posMessage = jsonObj.error.message;
          }
          paymentStatus = FAILED;
        }
        break;
	  }
    }
  });

  ws.on('error', function incoming(data) {
	console.log('ws.on error: ' + data);
  });

  jrpc.toStream = function(message){
  	console.log('PT: jrpc.toStream: ' + message);
    var duplicate = false;
    var jsonObj = JSON.parse(message);
    if (jsonObj.id) {
  	  jsonObj.id = jsonObj.id.toString();
      //if (jsonObj.method === "_Keepalive") {
      //  watchDogId = jsonObj.id;
      //}
      //
      if (jsonObj.id === lastSentId) {
        duplicate = true;
        console.log('PT: jrpc.toStream, duplicate id: ' + jsonObj.id);
      }
      lastSentId = jsonObj.id;
	  message = JSON.stringify(jsonObj);
      console.log('PT: updated: ' + message);
    }
    if (!duplicate) {
      ws.send(message);
    }
  }

  jrpc.on('_Keepalive', [], function(){
    console.log("incoming keepalive");
    return {};
  });

  jrpc.on('_CloseReason', ['error'], function(error){
    console.log('_CloseReason: ' + JSON.stringify(error));
    connectionClosedByPeer = true;
  });

  jrpc.on('StatusEvent', ['timestamp',
                        'pending_transaction_count',
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
						pending_transaction_count,
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
	if (pending_transaction_count) {
		console.log('PT: pending_transaction_count ' + pending_transaction_count);
	}
	if (ready_for_transaction) {
		console.log('PT: ready_for_transaction ' + ready_for_transaction);
	}
	if (psp_connection_available) {
		console.log('PT: psp_connection_available ' + psp_connection_available);
	}
	if (transaction_status) {
		console.log('PT: transaction_status ' + transaction_status);
		transactionStatus = transactionStatusMap.get(transaction_status);
	}
});

jrpc.on('PosMessage', ['message'], function(message) {
	if (message) {
		console.log('PT: message ' + message);
		posMessage = message;
	}
})

jrpc.on('TerminalInfo', ['result'], function(result){
  console.log('PT: TerminalInfo: ' + result);
});
};

exports.close = function () {
  console.log('close');
  
  var doDisonnect = false;

  try {
	if (ws) {
		if (ws.readyState === OPEN) {
			doDisonnect = true;
		}
	}
	if (doDisonnect) {
      ws.close(1000, 'closed by POS');
      console.log('>> Ws disconnected');
    }
  } catch(err) {
	console.log('>> catched error in disconnecting ws: ' + err.message);
  }
}

exports.keepalive = function () {
  if (connectionClosedByPeer) {
    console.log('keepalive: returning as connection closed by peer');
    return;
  }
  console.log('keepalive');
  jrpc.call('_Keepalive', {});
}

exports.purchase = function (amount, receiptId) {
  if (connectionClosedByPeer) {
    console.log('purchase: returning as connection closed by peer');
    return;
  }
  console.log('PT: Purchase: ' + amount + ', ' + receiptId);
  lastResult.merchantReceipt = "";
  lastResult.customerReceipt = "";
  command = PURCHASE;
  paymentStatus = PROCESSING;

  try {
    if (ws) {
        if (ws.readyState === OPEN) {
          jrpc.call('Purchase', {"api_key": process.env.PT_API_KEY,
                       "cashier_language": "fi",
                       "receipt_id": receiptId,
                       "amount": amount * 100,
                       "currency": "EUR",
                       "forced_authorization": true
        });
      }
    }
  } catch(err) {
    console.log('>> catched error in disconnecting ws: ' + err.message);
  }
}

exports.checkLastPurchase = function (amount, receiptId) {
  if (connectionClosedByPeer) {
    console.log('checkLastPurchase: returning as connection closed by peer');
    return;
  }
  console.log('PT: checkLastPurchase: ' + amount + ', ' + receiptId);
  command = CHECK;

  jrpc.call('Check', {"api_key": process.env.PT_API_KEY,
                       "receipt_id": receiptId,
                       "amount": amount * 100,
                       "currency": "EUR"
  });
}

exports.getTransactionStatus = function() {
	return {transactionStatus: transactionStatus};
}

exports.getPTStatus = function() {
	console.log('>> getPTStatus');
    try {
	   var wsStatus = -1;
	   if (ws) {
	       wsStatus = ws.readyState;
           console.log('>> readyState: ' + ws.readyState);
	   }
	   return {"wsstatus": wsStatus,
               "transactionStatus": transactionStatus,
               "paymentStatus": paymentStatus,
               "posMessage": posMessage,
               "connectionClosedByPeer": connectionClosedByPeer};
    } catch(err) {
       console.log('>> catched error in getting ws status: ' + err.message);
       return {"wsstatus": -1,
               "transactionStatus": transactionStatus,
               "paymentStatus": paymentStatus,
               "posMessage": posMessage,
               "connectionClosedByPeer": connectionClosedByPeer};
    }
}

exports.getReceiptText = function() {
    return lastResult;
}

exports.test = function () {
  console.log('Test');

  try {
    if (ws) {
        if (ws.readyState === OPEN) {
          jrpc.call('Test', {"api_key": process.env.PT_API_KEY,
                             "test_id": "large_file_download"
        });
      }
    }
  } catch(err) {
    console.log('>> catched error in doing test');
  }
}