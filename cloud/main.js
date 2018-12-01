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
		const results = await query.find();
		var i = 0;

		/*for (i; i < results.length; i++) {
			console.log('>> exercise obj found');
			const name = results[i].get("name");
			const order = results[i].get("order");
			const exerciseId = results[i].get("exerciseId");
			const targetArea = results[i].get("targetArea");
			const pauseInSec = results[i].get("pauseInSec");
			const setCount = results[i].get("setCount");
			const repeatsInSet = results[i].get("repeatsInSet");
		}*/

		returnMessage = JSON.stringify(results);

		console.log('>> return message: ' + returnMessage);
		return returnMessage;
	}
});