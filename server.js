//License: https://github.com/Chillee/AudioStream/blob/master/LICENSE.md

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/', express.static('static/public'));

function makeid(){
    var possible = "abcdefghijklmnopqrstuvwxyz";
    var text = "";
    for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

var sockets = {};
io.on('connection', function(socket) {
  var id;
  do {
    id = makeid();
  } while(sockets[id]);

  sockets[id] = socket;
  socket.emit('your-id', id);

  socket.on('disconnect', function() {
    sockets[socket] = undefined;
    delete sockets[socket];
  });

  socket.on('message', function(message) {
    if (sockets[message.to]) {
      sockets[message.to].emit('message', message);
    } else {
      socket.emit('disconnected', message.from);
    }
  });

  socket.on('logon', function(message) {
    if (sockets[message.to]) {
      sockets[message.to].emit('logon', message);
    } else {
      socket.emit('error', 'Does not exsist at server.');
    }
  });

  socket.on('logoff', function(message) {
    if (sockets[message.to]) {
      sockets[message.to].emit('logoff', message);
    } else {
      socket.emit('error', 'Does not exsist at server.');
    }
  });
});

app.get('/:room', function(req, res) {
  if (!sockets[req.params.room]) {
    res.writeHead(404, {'content-type': 'text/plain'});
    res.end('Room not found');
  } else {
    res.sendFile('static/private/listen.html', {root: __dirname});
  }
});

server.listen(8080, function(){
  console.log('listening on *:8080');
});
