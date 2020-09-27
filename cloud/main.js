var PT = require('./payment.js');

Parse.Cloud.define('hello', function(req, res) {
  return 'Hi';
});

Parse.Cloud.define('connect_to_pt', async (req) => {
	let returnMessage = 'Ok';
	console.log(">> connect_to_pt at: " + PT.myDateTime());
	PT.startWS();
	return returnMessage;
});

Parse.Cloud.define('pt_command', async (req) => {
	let returnMessage = 'Ok';
	console.log(">> pt command");
	//if (Object.keys(req.params).length > 0) {
	//	if ('command' in req.params) {
	//		console.log('>>' + req.params.command);
	//	}
	//}
	PT.keepalive();
	return returnMessage;
})

Parse.Cloud.define('purchase', async (req) => {
	let returnMessage = 'Ok';
	console.log(">> purchase");
    if (Object.keys(req.params).length > 1) {
		if (('amount' in req.params) && ('receiptId' in req.params)) {
			console.log('>>' + req.params.amount + ", " + req.params.receiptId);
			PT.purchase(req.params.amount, req.params.receiptId);
		}
	}
	return returnMessage;
})

Parse.Cloud.define('check_last_purchase', async (req) => {
    let returnMessage = 'Ok';
    console.log(">> check_last_purchase");
    if (Object.keys(req.params).length > 1) {
        if (('amount' in req.params) && ('receiptId' in req.params)) {
            console.log('>>' + req.params.amount + ", " + req.params.receiptId);
            PT.checkLastPurchase(req.params.amount, req.params.receiptId);
        }
    }
    return returnMessage;
})

Parse.Cloud.define('get_transcation_status', async (req) => {
	return JSON.stringify(PT.getTransactionStatus());
})

Parse.Cloud.define('get_pt_status', async (req) => {
	console.log('>> get_pt_status');
	return JSON.stringify(PT.getPTStatus());
})

Parse.Cloud.define('get_receipt_text', async (req) => {
    console.log('>> get_receipt_text');
    return JSON.stringify(PT.getReceiptText());
})

Parse.Cloud.define('close_pt_connection', async (req) => {
	PT.close();
	return 'Ok';
})

Parse.Cloud.define('test', async (req) => {
    PT.test();
    return 'Ok';
})

Parse.Cloud.define('send_email', async (req) => {
	let returnMessage = 'Ok';
	console.log(">>>> send_email");

	if (Object.keys(req.params).length > 0) {
		console.log(">> send_email: json contains data");
	
		const fs = require('fs');
		const readline = require('readline');
		const {google} = require('googleapis');

		// If modifying these scopes, delete token.json.
		const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

		// The file token.json stores the user's access and refresh tokens, and is
		// created automatically when the authorization flow completes for the first
		// time.
		const TOKEN_PATH = 'token.json';

		// Load client secrets from a local file.
		//fs.readFile('credentials.json', (err, content) => {
		//  if (err) return console.log('Error loading client secret file:', err);
			// Authorize a client with credentials, then call the Gmail API.
			//  authorize(JSON.parse(content), sendMessage);
		//});
		authorize(JSON.parse(process.env.GOOGLE_CREDENTIALS), sendMessage);

		/**
		 * Create an OAuth2 client with the given credentials, and then execute the
		 * given callback function.
		 * @param {Object} credentials The authorization client credentials.
		 * @param {function} callback The callback to call with the authorized client.
		 */
		function authorize(credentials, callback) {
			const {client_secret, client_id, redirect_uris} = credentials.installed;
			const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

			// Check if we have previously stored a token.
			//fs.readFile(TOKEN_PATH, (err, token) => {
			//  if (err) return getNewToken(oAuth2Client, callback);
			//  oAuth2Client.setCredentials(JSON.parse(token));
			//  callback(oAuth2Client);
			//});
			oAuth2Client.setCredentials(JSON.parse(process.env.GOOGLE_TOKEN));
			callback(oAuth2Client);
		}

	
		/**
		 * Get and store new token after prompting for user authorization, and then
		 * execute the given callback with the authorized OAuth2 client.
		 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
		 * @param {getEventsCallback} callback The callback for the authorized client.
		 */
		function getNewToken(oAuth2Client, callback) {
		  const authUrl = oAuth2Client.generateAuthUrl({
		    access_type: 'offline',
		    scope: SCOPES,
		  });
		  console.log('Authorize this app by visiting this url:', authUrl);
		  const rl = readline.createInterface({
		    input: process.stdin,
		    output: process.stdout,
		  });
		  rl.question('Enter the code from that page here: ', (code) => {
		    rl.close();
		    oAuth2Client.getToken(code, (err, token) => {
		      if (err) return console.error('Error retrieving access token', err);
		      oAuth2Client.setCredentials(token);
		      // Store the token to disk for later program executions
		      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
		        if (err) return console.error(err);
		        console.log('Token stored to', TOKEN_PATH);
		      });
		      callback(oAuth2Client);
		    });
		  });
		}
	
//		function makeBody(to, from, subject, message) {
//		    var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
//		        "MIME-Version: 1.0\n",
//		        "Content-Transfer-Encoding: 7bit\n",
//		        "to: ", to, "\n",
//		        "from: ", from, "\n",
//		        "subject: ", subject, "\n\n",
//		        message
//		    ].join('');
		
//		function makeBody(to, from, subject, message) {
//			var str = ["Content-Type: ", req.params.format,
//				"charset=\"UTF-8\"\n",
//			    "MIME-Version: 1.0\n",
//			    "Content-Transfer-Encoding: 7bit\n",
//			    "to: ", to, "\n",
//			    "from: ", from, "\n",
//			    "subject: ", subject, "\n\n",
//			    message,
//		    ].join('');
		    
		function makeBody(to, from, subject, message) {
			var contentType = "";
			if (req.params.format === "text/html") {
				console.log(">> text/html");
				contentType = "Content-Type: text/html; charset=\"UTF-8\"\n";
			} else {
				console.log(">> text/plain");
				contentType = "Content-Type: text/plain,charset=\"UTF-8\"\n";
			}
			var str = [contentType,
			    "MIME-Version: 1.0\n",
			    "Content-Transfer-Encoding: 7bit\n",
			    "to: ", to, "\n",
			    "from: ", from, "\n",
			    "subject: ", subject, "\n\n",
			    message,
		    ].join('');
	
		    var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
		        return encodedMail;
		}
	
		function makeBody2(to, from, subject, message) {
			if (req.params.format === "text/html") {
			    var str = ["Content-Type: text/html; charset=\"UTF-8\"\n",
			    	"MIME-Version: 1.0\n",
			    	"Content-Transfer-Encoding: 7bit\n",
			    	"to: ", to, "\n",
			    	"from: ", from, "\n",
			    	"subject: ", subject, "\n\n",
			    	message
		        ].join('');
	
			    var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
			    return encodedMail;
			} else {
			    var str = ['Content-Type: multipart/mixed; boundary="foo_bar_baz"\r\n',
			    	'MIME-Version: 1.0\r\n',
			    	'to: ', to, '\r\n',
			    	'from: ', from, '\r\n',
			    	'subject: ', subject, '\r\n\r\n',
			    	'--foo_bar_baz\r\n',
			    	'Content-Type: text/plain; charset="UTF-8"\r\n',
			    	'MIME-Version: 1.0\r\n',
			    	'Content-Transfer-Encoding: 7bit\r\n\r\n',
			    	'Liitteenä tietokanta json-tiedostona.\r\n\r\n',
			    	'--foo_bar_baz\r\n',
			    	'Content-Type: text/plain\r\n',
			    	'MIME-Version: 1.0\r\n',
			    	'Content-Transfer-Encoding: base64\r\n',
			    	'Content-Disposition: attachment; filename=', subject,'.json\r\n\r\n',
			    	message, '\r\n\r\n',
			    	'--foo_bar_baz\r\n',
		        ].join('');
	
			    var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
			    return encodedMail;
			}
		}
		
		
		function makeOrderMessage() {
			var str = "";
			console.log('>> product count: ' + req.params.products.length);
			for (i = 0; i < req.params.products.length; i++) {
				str += req.params.products[i].productName;
				str += '\t';
				str += req.params.products[i].amountInStock;
				str += '\n';
			}
			return str;
		}
		
		function makeReportMessage() {
			var currentDate = new Date();
			var str = "Tilitysraportti " + currentDate.toString();
			str += '\n';
			str += '\n';
			console.log('>> giftCard1: ' + req.params.giftCard1);
			console.log('>> giftCard2: ' + req.params.giftCard2);
			console.log('>> cash: ' + req.params.cash);
			console.log('>> card: ' + req.params.card);

			str += 'Maksukorttiostojen määrä: ';
			str += '\t';
			str += req.params.card.toString();
			str += '\n';
			str += 'Käteisostojen määrä: ';
			str += '\t';
			str += req.params.cash.toString();
			str += '\n';
			str += 'Lahden ry:n lahjakorttiostojen määrä: ';
			str += '\t';
			str += req.params.giftCard1.toString();
			str += '\n';
			str += '\n';
			str += 'Viesti on lähetetty julkaisumyynnin kassajärjestelmästä automaattisesti.'
			return str;
		}
		
		function makeMessage() {
			console.log('>> recipient: ' + req.params.recipient);
			console.log('>> messsage: ' + req.params.content);
			return req.params.content;
		}
		
		function sendMessage(auth) {
			const gmail = google.gmail({version: 'v1', auth});
		    var raw = makeBody2(req.params.recipient, 'lahti.ry.julkaisumyynti@gmail.com', req.params.subject, makeMessage());
		    gmail.users.messages.send({
		        auth: auth,
		        userId: 'me',
		        resource: {
		            raw: raw
		        }
		    }, function(err, response) {
		        //res.send(err || response)
		    	console.log(err || response)
		    });
		}
	} else {
		console.log(">> productinfo json does not contain data");
	}
	return returnMessage;
});

function authorized(auth) {
    console.log("auth: " + auth);
    return (auth === process.env.CASHIER_AUTH)
}

Parse.Cloud.define('cashiers', async (req) => {

	let returnMessage = 'Ok';

     if (req.params.auth) {
        console.log("--> auth: " + req.params.auth);
        if (req.params.auth !== process.env.CASHIER_AUTH) {
           return '[{"error_code":401}]';
        }
     }

	const query = new Parse.Query('Cashier');
	query.limit(1000);
	const results = await query.find();

	returnMessage = JSON.stringify(results);

	//console.log('>> return message: ' + returnMessage);
	return returnMessage;
});

Parse.Cloud.define('productinfo', async (req) => {

	let returnMessage = 'Ok';

	if (Object.keys(req.params).length > 0) {
		console.log(">> productinfo json contains data");
	} else {
		console.log(">> productinfo json does not contain data, return current productinfo");

		const query = new Parse.Query('ProductInfo');
		query.limit(1000);
		const results = await query.find();

		returnMessage = JSON.stringify(results);

		//console.log('>> return message: ' + returnMessage);
		return returnMessage;
	}
});

Parse.Cloud.define('receipts', async (req) => {

	let returnMessage = 'Ok';
	
    if (Object.keys(req.params).length > 0) {
        console.log(">> receipts json contains data");
        
        if (req.params.since) {
            var since = new Date(req.params.since);
            console.log('since: ' + since);
            var foundItems = [];
            const query = new Parse.Query('Receipt');
            query.limit(1000);
            const results = await query.find();
            console.log('receipts');
            for (var i = 0; i < results.length; i++) {
                var receiptDate = results[i].get('date');
                console.log('receipt date: ' + receiptDate);
                
                if (receiptDate > since) {
                    foundItems.push(results[i]);
                }
            }
            returnMessage = JSON.stringify(foundItems);
        }
    }
	//console.log('>> return message: ' + returnMessage);
	return returnMessage;
});

Parse.Cloud.define('not_reported_receipts', async (req) => {

	let returnMessage = 'Ok';
	
	var foundItems = [];
	const query = new Parse.Query('Receipt');
	query.limit(1000);
	const results = await query.find();
    console.log('not_reported_receipts');
    for (var i = 0; i < results.length; i++) {
		if (!results[i].get('reported')) {
			foundItems.push(results[i]);
		}
	}
	returnMessage = JSON.stringify(foundItems);

	//console.log('>> return message: ' + returnMessage);
	return returnMessage;
});

Parse.Cloud.define('set_as_reported', async (req) => {

	let returnMessage = 'Ok';

	const query = new Parse.Query('Receipt');
	query.limit(1000);
	const results = await query.find();

	console.log('>> found ' + results.length + ' products');
	console.log('>> Object.values(req.params).length: ' + Object.values(req.params).length);
	
	for (var i = 0; i < Object.values(req.params).length; i++) {
		console.log('>> param: ' + JSON.stringify(Object.values(req.params)[i]));
		
		for (var j = 0; j < results.length; j++) {
			var n = results[j].id.localeCompare(Object.values(req.params)[i].objectId);
			if (n == 0) {
				console.log('>> product found: ' + JSON.stringify(results[j]));
				
				results[j].set('reported', true);
			
				results[j].save().then(function(productInfo) {
					console.log('>> set reported as true');
				}, function(err) { console.log('set error' + err); });

				break;
			}
		}
	}

});

Parse.Cloud.define('sold_items', async (req) => {

	let returnMessage = 'Ok';
	
	var foundItems = [];
	const query = new Parse.Query('SoldItem');
	query.limit(1000);
	const results = await query.find();
    console.log('----> sold_items');
    for (var i = 0; i < results.length; i++) {
		const soldDate = results[i].get('createdAt');
		const currentDate = new Date(); + 
        console.log("current date: " + currentDate.toString());
		if (soldDate.getDate() == currentDate.getDate() &&
            soldDate.getMonth() == currentDate.getMonth() &&
            soldDate.getFullYear() == currentDate.getFullYear()) {
			foundItems.push(results[i]);
		}
	}
	returnMessage = JSON.stringify(foundItems);

	//console.log('>> return message: ' + returnMessage);
	return returnMessage;
});

Parse.Cloud.define('addproduct', async (req) => {

	let returnMessage = 'Ok';

	if (Object.keys(req.params).length > 0) {
		console.log(">> addproduct: json contains data");
        
        // save log data
        var logEntry = new Parse.Object('ProductDbLog');
        logEntry.set('eventType', "add");
        logEntry.set('eventData', JSON.stringify(req.params));
        logEntry.save().then(function(logEntry) {
            console.log('>> log saved');
        }, function(err) { console.log(err); });

		var obj = new Parse.Object('ProductInfo');

		if ('ISBN' in req.params) {
			console.log('>>' + req.params.ISBN);
			obj.set('ISBN', req.params.ISBN);
		}
		if ('productCode' in req.params) {
			console.log('>>' + req.params.productCode);
			obj.set('productCode', req.params.productCode);
		}
		if ('productName' in req.params) {
			console.log('>>' + req.params.productName);
			obj.set('productName', req.params.productName);
		}
		if ('amountInStock' in req.params) {
			console.log('>>' + req.params.amountInStock);
			obj.set('amountInStock', parseInt(req.params.amountInStock, 10));
		}
		if ('price' in req.params) {
			console.log('>>' + req.params.price);
			obj.set('price', parseFloat(req.params.price));
		}
		if ('availableFromPublisher' in req.params) {
			console.log('>>' + req.params.availableFromPublisher);
			obj.set('availableFromPublisher', req.params.availableFromPublisher);
		}
		obj.save().then(function(obj) {
			console.log('>> productInfo saved');
		}, function(err) { console.log(err); });
	} else {
		console.log(">> productinfo json does not contain data");
	}
});

Parse.Cloud.define('saveproduct', async (req) => {

	let returnMessage = 'Ok';

	if (Object.keys(req.params).length > 0) {
		console.log(">> productinfo json contains data, objectId: " + req.params.objectId);
        
        // save log data
        var logEntry = new Parse.Object('ProductDbLog');
        if ('inventoryCorrection' in req.params) {
        	if (!req.params.inventoryCorrection) {
        		logEntry.set('eventType', "update");
        	} else {
        		logEntry.set('eventType', "inventory_correction");        		
        	}
        }
        logEntry.set('eventData', JSON.stringify(req.params));
        logEntry.save().then(function(logEntry) {
            console.log('>> log saved');
        }, function(err) { console.log(err); });

		const query = new Parse.Query('ProductInfo');
		query.limit(1000);
		const results = await query.find();

		console.log('>> found ' + results.length + ' products');

		for (var i = 0; i < results.length; i++) {
			//console.log('>> result id ' + results[i].id);
			var n = results[i].id.localeCompare(req.params.objectId);
			if (n == 0) {
				console.log('>> product found: ' + JSON.stringify(results[i]));
				if ('amountInStock' in req.params) {
					results[i].set('amountInStock', parseInt(req.params.amountInStock,10));
				}
				if ('price' in req.params) {
					results[i].set('price', parseFloat(req.params.price));
				}
				if ('availableFromPublisher' in req.params) {
					results[i].set('availableFromPublisher', req.params.availableFromPublisher);
				}
				results[i].save().then(function(obj) {
					console.log('>> saved');
				},  function(err) {
					console.log('>> error in saving: ' + err);
					returnMessage = 'Failed';
				});
				break;
			}
		}

		//returnMessage = JSON.stringify(results);
		//console.log('>> return message: ' + returnMessage);
		return returnMessage;

	} else {
		console.log(">> productinfo json does not contain data, return current productinfo");
	}
	return returnMessage;
});

Parse.Cloud.define('removeproduct', async (req) => {

	let returnMessage = 'Ok';

	if (Object.keys(req.params).length > 0) {
		console.log(">> removeproduct: productinfo json contains data, objectId: " + req.params.objectId);

		const query = new Parse.Query('ProductInfo');
		query.limit(1000);
		const results = await query.find();

		console.log('>> found ' + results.length + ' products');

		for (var i = 0; i < results.length; i++) {
			//console.log('>> result id ' + results[i].id);
			var n = results[i].id.localeCompare(req.params.objectId);
			if (n == 0) {
				console.log('>> product found: ' + JSON.stringify(results[i]));
				results[i].destroy().then(function(obj) {
					console.log('>> removed');
				},  function(err) {
					console.log('>> error in removing: ' + err);
					returnMessage = 'Failed';
				});
				break;
			}
		}

		//returnMessage = JSON.stringify(results);
		//console.log('>> return message: ' + returnMessage);
		return returnMessage;

	} else {
		console.log(">> productinfo json does not contain data, return current productinfo");
	}
	return returnMessage;
});

Parse.Cloud.define('save_purchase_data', async (req) => {

	let returnMessage = 'Ok';

    // save log data
    var logEntry = new Parse.Object('ProductDbLog');
    logEntry.set('eventType', "purhase");
    logEntry.set('eventData', JSON.stringify(req.params));
    logEntry.save().then(function(logEntry) {
        console.log('>> log saved');
    }, function(err) { console.log(err); });

	for (var i = 0; i < req.params.receiptData.items.length; i++) {
		if (req.params.receiptData.items[i].sum > 0) {
			console.log(">> payment method: " + req.params.receiptData.items[i].paymentMethod);
			
			var obj = new Parse.Object('Receipt');
			
			if ('receiptNr' in req.params.receiptData) {
				console.log('>>' + req.params.receiptData.receiptNr);
				obj.set('receiptNr', req.params.receiptData.receiptNr);
			}
			obj.set('date', new Date());
			if ('cashier' in req.params.receiptData) {
				console.log('>>' + req.params.receiptData.cashier);
				obj.set('cashier', req.params.receiptData.cashier);
			}
			if ('paymentMethod' in req.params.receiptData.items[i]) {
				console.log('>>' + req.params.receiptData.items[i].paymentMethod);
				obj.set('paymentMethod', req.params.receiptData.items[i].paymentMethod);
			}			
			if ('sum' in req.params.receiptData.items[i]) {
				console.log('>>' + req.params.receiptData.items[i].sum);
				obj.set('totalSum', req.params.receiptData.items[i].sum);
			}
			if ('giftCard1Type' in req.params.receiptData.items[i]) {
				console.log('>>' + req.params.receiptData.items[i].giftCard1Type);
				obj.set('giftCard1Type', req.params.receiptData.items[i].giftCard1Type);
			}
			if ('receiver' in req.params.receiptData.items[i]) {
				console.log('>>' + req.params.receiptData.items[i].receiver);
				obj.set('receiver', req.params.receiptData.items[i].receiver);
			}
			if ('originator' in req.params.receiptData.items[i]) {
				console.log('>>' + req.params.receiptData.items[i].originator);
				obj.set('originator', req.params.receiptData.items[i].originator);
			}
			if ('givenDate' in req.params.receiptData.items[i]) {
				console.log('>>' + req.params.receiptData.items[i].givenDate);
				obj.set('givenDate', req.params.receiptData.items[i].givenDate);
			}
			if ('valueBefore' in req.params.receiptData.items[i]) {
				console.log('>>' + req.params.receiptData.items[i].valueBefore);
				obj.set('valueBefore', req.params.receiptData.items[i].valueBefore);
			}
			if ('valueAfter' in req.params.receiptData.items[i]) {
				console.log('>>' + req.params.receiptData.items[i].valueAfter);
				obj.set('valueAfter', req.params.receiptData.items[i].valueAfter);
			}
			if ('handedTo' in req.params.receiptData.items[i]) {
				console.log('>>' + req.params.receiptData.items[i].handedTo);
				obj.set('handedTo', req.params.receiptData.items[i].handedTo);
			}
			if ('committee' in req.params.receiptData.items[i]) {
				console.log('>>' + req.params.receiptData.items[i].committee);
				obj.set('committee', req.params.receiptData.items[i].committee);
			}
			obj.set('reported', false);
			
			obj.save().then(function(obj) {
				console.log('>> Receipt saved');
				console.log('>> Object id: ' + obj.id);
			}, function(err) { console.log(err); });
		}
	}
	
	for (i = 0; i < req.params.productList.length; i++) {
		console.log('>> found item');
		var itemobj = new Parse.Object('SoldItem');
		itemobj.set('receipt', obj);
		itemobj.set('receiptNr', req.params.receiptData.receiptNr);
		itemobj.set('productName', req.params.productList[i].productName);
		itemobj.set('price', req.params.productList[i].price);
		//itemobj.set('productInfo', req.params.productList[i]);
		itemobj.set('productObjectId', req.params.productList[i].objectId);
		itemobj.set('quantity', req.params.productList[i].quantity);
		itemobj.save().then(function(itemobj) {
			var productInfo = Parse.Object.extend("ProductInfo");
			var query = new Parse.Query(productInfo);
			query.get(itemobj.get('productObjectId'))
			.then((productInfo) => {
				const amount = parseInt(productInfo.get('amountInStock'), 10);
				const quantity = parseInt(itemobj.get('quantity'), 10);
				console.log('>> amount: '+ amount);
				productInfo.set('amountInStock', amount - quantity);
				productInfo.save().then(function(productInfo) {
					console.log('>> amount decreased');
				}, function(err) { console.log('--productInfo save error' + err); });
			}, function(err) { console.log('--productInfo not found'); });
		}, function(err) { console.log('itemobj save error' + err); });
	}
	
	const statequery = new Parse.Query('CurrentState');
	console.log('step 1');
	stateobject = await statequery.first();
	console.log('step 2');
	stateobject.set('lastReceiptNr', req.params.receiptData.receiptNr);
	console.log('step 3');
	stateobject.save().then(function(stateobject) {
		console.log('>> current state updated');
	}, function(err) { console.log('--current state save error' + err); });
});


Parse.Cloud.define('addchat', async (req) => {

	let returnMessage = 'Ok';

	if (Object.keys(req.params).length > 0) {
		console.log(">> addchat: json contains data");

		var obj = new Parse.Object('Chat');

		if ('from' in req.params) {
			console.log('>>' + req.params.from);
			obj.set('from', req.params.from);
		}
		if ('message' in req.params) {
			console.log('>>' + req.params.message);
			obj.set('message', req.params.message);
		}
		obj.save().then(function(obj) {
			console.log('>> chat saved');
		}, function(err) { console.log(err); });
	} else {
		console.log(">> chat json does not contain data");
	}
});

Parse.Cloud.define('chat', async (req) => {

	let returnMessage = 'Ok';

	const query = new Parse.Query('Chat');
	query.limit(1000);
	const results = await query.find();

	returnMessage = JSON.stringify(results);

	console.log('>> return message: ' + returnMessage);
	return returnMessage;
});

Parse.Cloud.define('current_state', async (req) => {

	let returnMessage = 'Ok';
	
	if (Object.keys(req.params).length > 0) {
		console.log(">> current_state: json contains data");
		
	} else {
		console.log(">> chat json does not contain data");
		
		const query = new Parse.Query('CurrentState');
		query.limit(1000);
		const results = await query.find();

		returnMessage = JSON.stringify(results);
	}

	console.log('>> return message: ' + returnMessage);
	return returnMessage;
});

Parse.Cloud.define('db_entries', async (req) => {

	let returnMessage = '';

	if (Object.keys(req.params).length > 0) {
	
		console.log(">> db_entries: json contains data");
		
		if ("dbentry" in req.params) {
			const query = new Parse.Query(req.params.dbentry);
			query.limit(1000);
			const results = await query.find();

			returnMessage = JSON.stringify(results);

			//console.log('>> return message: ' + returnMessage);
			return returnMessage;
		} else {
			console.log(">> db_entries json does not contain data")
		}
	} else {
		console.log(">> no dbentry in db_entries json");
	}
	return returnMessage;
});
