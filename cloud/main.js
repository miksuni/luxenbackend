var PT = require('./payment.js');

Parse.Cloud.define('hello', function(req, res) {
  return 'Hi';
});

Parse.Cloud.define('productinfo', async (req) => {

	let returnMessage = 'Ok';

	if (Object.keys(req.params).length > 0) {
		console.log(">> productinfo json contains data");
	} else {
		console.log(">> productinfo json does not contain data, return current productinfo");
		console.log(">> moduletest: " + PT.myDateTime());

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