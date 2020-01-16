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
			obj.set('totalSum', parseInt(req.params.total.totalSum, 10));
		}
		if ('paymentMethod1' in req.params.total) {
			console.log('>>' + req.params.total.paymentMethod1);
			const query = new Parse.Query('PaymentMethod');
			const results = await query.find();
			var i = 0;
			for (i; i < results.length; i++) {
				console.log('>> iterate payment methods...');
				var n = results[i].id.localeCompare(req.params.total.paymentMethod1);
				if (n == 0) {
					console.log('>> paymentMethod1 found');
					//obj.set('paymentMethod1', results[i]);
					obj.set('paymentMethod1Fi', results[i].methodFi);
					break;
				}
			}			
		}
		if ('paymentMethod2' in req.params.total) {
			console.log('>>' + req.params.total.paymentMethod1);
			const query = new Parse.Query('PaymentMethod');
			const results = await query.find();
			var i = 0;
			for (i; i < results.length; i++) {
				console.log('>> iterate payment methods...');
				var n = results[i].id.localeCompare(req.params.total.paymentMethod1);
				if (n == 0) {
					console.log('>> paymentMethod2 found');
					//obj.set('paymentMethod2', results[i]);
					obj.set('paymentMethod2Fi', results[i].methodFi);
					break;
				}
			}			
		}
		obj.save().then(function(obj) {
			console.log('>> Receipt saved');
			console.log('>> Object id: ' + obj.id);
			for (i = 0; i < req.params.productList.length; i++) {
				var itemobj = new Parse.Object('SoldItem');
				itemobj.set('receipt', obj);
				itemobj.set('productName', req.params.productList[i].productName);
				itemobj.set('price', req.params.productList[i].price);
				var itemName = req.params.productList[i].productName;
				var itemId = req.params.productList[i].objectId;
				console.log('--productInfo name 1 '  + req.params.productList[i].productName);
				console.log('--productInfo name 2 '  + itemName);
				console.log('--productInfo id 1 '  + req.params.productList[i].objectId);
				console.log('--productInfo id 2 '  + itemId);
				itemobj.save().then(function(itemobj) {
					console.log('--productInfo name 3 '  + itemName);
					console.log('--productInfo id 3 '  + itemId);
					var productInfo = Parse.Object.extend("ProductInfo");
					var query = new Parse.Query(productInfo);
					console.log('--productInfo obj id '  + itemId);
					query.get(itemId)
					.then((productInfo) => {
						console.log('-- product found');
						const amount = productInfo.get('amountInStock');
						productInfo.set('amountInStock', amount - 1);
						productInfo.save().then(function(productInfo) {
							console.log('amount updated');
						}, function(err) { console.log('--productInfo save error' + err); });
					}, function(err) { console.log('--productInfo not found for '  + itemId + " " + err); });
				}, function(err) { console.log('itemobj save error' + err); });
			}
		}, function(err) { console.log(err); });
	} else {
		console.log(">> Receipt json does not contain data");
	}
});
