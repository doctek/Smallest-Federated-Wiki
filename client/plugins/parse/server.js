// Generated by CoffeeScript 1.4.0
(function() {
  var WebSocketServer, startServer;

  WebSocketServer = require('ws').Server;

  startServer = function(params) {
    var k, socket, v;
    console.log('parse startServer', (function() {
      var _results;
      _results = [];
      for (k in params) {
        v = params[k];
        _results.push(k);
      }
      return _results;
    })());
    socket = new WebSocketServer({
      server: params.server,
      path: '/plugin/parse'
    });
    return socket.on('connection', function(ws) {
      return (function(count) {
        var tick;
        ws.on('message', function(message) {
          return console.log('parse client says:', message);
        });
        tick = function() {
          var message;
          message = "{\"action\": \"tick\", \"count\": " + (count++) + "}";
          console.log(message);
          return ws.send(message, function(err) {
            if (err) {
              return console.log('unable to send ws message:', err);
            } else if (count <= 100) {
              return setTimeout(tick, 1000);
            } else {
              return ws.close();
            }
          });
        };
        console.log('start ticking');
        return tick();
      })(10);
    });
  };

  module.exports = {
    startServer: startServer
  };

}).call(this);