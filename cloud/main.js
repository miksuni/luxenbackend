var PT = require('./payment.js');

Parse.Cloud.define('hello', function(req, res) {
  return 'Hi';
});

Parse.Cloud.define('connect_to_pt', async (req) => {
	let returnMessage = 'Ok';
	console.log(">> connect_to_pt at: " + PT.myDateTime());;
	PT.startWS();
	return returnMessage;
});

Parse.Cloud.define('send_email', async (req) => {
	let returnMessage = 'Ok';
	console.log(">> send_email");

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
		  const oAuth2Client = new google.auth.OAuth2(
		      client_id, client_secret, redirect_uris[0]);

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

	function makeBody(to, from, subject, message) {
	    var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
	        "MIME-Version: 1.0\n",
	        "Content-Transfer-Encoding: 7bit\n",
	        "to: ", to, "\n",
	        "from: ", from, "\n",
	        "subject: ", subject, "\n\n",
	        message
	    ].join('');

	    var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
	        return encodedMail;
	}

	function sendMessage(auth) {
		const gmail = google.gmail({version: 'v1', auth});
	    var raw = makeBody('mikko.m.suni@gmail.com', 'lahti.ry.julkaisumyynti@gmail.com', 'Tuotesaldoilmoitus', 'Tilaa tuotteet:\n\nTuote 1\nTuote 2');
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
	
	return returnMessage;
});

Parse.Cloud.define('cashiers', async (req) => {

	let returnMessage = 'Ok';

	const query = new Parse.Query('Cashier');
	query.limit(1000);
	const results = await query.find();

	returnMessage = JSON.stringify(results);

	console.log('>> return message: ' + returnMessage);
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

Parse.Cloud.define('addproduct', async (req) => {

	let returnMessage = 'Ok';

	if (Object.keys(req.params).length > 0) {
		console.log(">> addproduct: json contains data");

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
			obj.set('availableFromPublisher', req.params.availableFromPublisher.toLowerCase() == "true");
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
					results[i].set('availableFromPublisher', req.params.availableFromPublisher.toLowerCase() == "true");
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

Parse.Cloud.define('saveReceipt', async (req) => {

	let returnMessage = 'Ok';

	if (Object.keys(req.params).length > 0) {
		console.log(">> saveReceipt: json contains data");

		var obj = new Parse.Object('Receipt');

		if ('receiptNr' in req.params.total) {
			console.log('>>' + req.params.total.receiptNr);
			obj.set('receiptNr', req.params.total.receiptNr);
		}
		obj.set('date', new Date());
		if ('cashier' in req.params.total) {
			console.log('>>' + req.params.total.cashier);
			obj.set('cashier', req.params.total.cashier);
		}
		if ('totalSum' in req.params.total) {
			console.log('>>' + req.params.total.totalSum);
			obj.set('totalSum', parseFloat(req.params.total.totalSum));
		}
		if ('paymentMethod1' in req.params.total) {
			console.log('>>' + req.params.total.paymentMethod1);
			if (req.params.total.paymentMethod1.length > 0) {
				obj.set('paymentMethod1Fi', req.params.total.paymentMethod1);
			}
//			const query = new Parse.Query('PaymentMethod');
//			const results = await query.find();
//			var i = 0;
//			for (i; i < results.length; i++) {
//				console.log('>> iterate payment methods...');
//				var n = results[i].id.localeCompare(req.params.total.paymentMethod1);
//				if (n == 0) {
//					console.log('>> paymentMethod1 found');
//					//obj.set('paymentMethod1', results[i]);
//					obj.set('paymentMethod1Fi', results[i].methodFi);
//					break;
//				}
//			}			
		}
		if ('paymentMethod2' in req.params.total) {
			console.log('>>' + req.params.total.paymentMethod2);
			if (req.params.total.paymentMethod2.length > 0) {
				obj.set('paymentMethod2Fi', req.params.total.paymentMethod2);
			}
//			const query = new Parse.Query('PaymentMethod');
//			const results = await query.find();
//			var i = 0;
//			for (i; i < results.length; i++) {
//				console.log('>> iterate payment methods...');
//				var n = results[i].id.localeCompare(req.params.total.paymentMethod2);
//				if (n == 0) {
//					console.log('>> paymentMethod2 found');
//					//obj.set('paymentMethod2', results[i]);
//					obj.set('paymentMethod2Fi', results[i].methodFi);
//					break;
//				}
//			}			
		}
		obj.save().then(function(obj) {
			console.log('>> Receipt saved');
			console.log('>> Object id: ' + obj.id);
			for (i = 0; i < req.params.productList.length; i++) {
				var itemobj = new Parse.Object('SoldItem');
				itemobj.set('receipt', obj);
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
		}, function(err) { console.log(err); });
	} else {
		console.log(">> Receipt json does not contain data");
	}
});
