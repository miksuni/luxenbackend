Parse.Cloud.define('hello', function(req, res) {
  return 'Hi';
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

		console.log('>> return message: ' + returnMessage);
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
		if ('Tuotenro' in req.params) {
			console.log('>>' + req.params.Tuotenro);
			obj.set('productCode', req.params.Tuotenro);
		}
		if ('Tuote' in req.params) {
			console.log('>>' + req.params.Tuote);
			obj.set('productName', req.params.Tuote);
		}
		if ('Kpl' in req.params) {
			console.log('>>' + req.params.Kpl);
			obj.set('amountInStock', parseInt(req.params.Kpl, 10));
		}
		if ('Hinta' in req.params) {
			console.log('>>' + req.params.Hinta);
			obj.set('price', parseInt(req.params.Hinta, 10));
		}
		if ('Tilattavissa' in req.params) {
			console.log('>>' + req.params.Tilattavissa);
			obj.set('availableFromPublisher', req.params.Tilattavissa.toLowerCase() == "true");
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
			console.log('>> result id ' + results[i].id);
			var n = results[i].id.localeCompare(req.params.objectId);
			if (n == 0) {
				console.log('>> product found: ' + JSON.stringify(results[i]));
				if ('amountInStock' in req.params) {
					results[i].set('amountInStock', parseInt(req.params.amountInStock,10));
				}
				if ('price' in req.params) {
					results[i].set('price', parseInt(req.params.price,10));
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