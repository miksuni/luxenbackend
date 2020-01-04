exports.myDateTime = function () {
  return Date();
};

exports.startWS = function () {
  console.log('>> startWS');
  const ws = new WebSocket('wss://fierce-shelf-80455.herokuapp.com');

  ws.on('message', function incoming(data) {
  	  console.log(data);
  });
};
