var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var path = require('path');

// Data file location
var dataDir = path.join(__dirname, 'data');
var dataFile = path.join(dataDir, 'chats.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir);
  } catch (e) {
    console.error('Failed to create data directory', e);
  }
}

var port = process.env.PORT || 8080;

// Keep track of chats (load from file if available)
var chats;
try {
  var content = fs.readFileSync(dataFile, 'utf8');
  chats = JSON.parse(content);
} catch (e) {
  chats = [
    {
      username: 'system',
      message: 'Welcome to the chat app!'
    }
  ];
  try {
    fs.writeFileSync(dataFile, JSON.stringify(chats, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write initial chats file', err);
  }
}

// Handle socket connections
io.on('connection', function(socket) {
  console.log('connected!');

  // Sends out chats when connected
  socket.emit('chats', {
    data: chats
  });

  // Accepts new chats
  socket.on('submit', function(data) {
    var chat = data.data;
    chats.push(chat);

    // Persist chats to disk (best-effort async)
    fs.writeFile(dataFile, JSON.stringify(chats, null, 2), 'utf8', function(err) {
      if (err) console.error('Failed to save chats', err);
    });

    // Inform ALL sockets of the new chat
    io.sockets.emit('newChat', {
      data: chat
    });
  });
});

app.use(express.static(__dirname + '/public'));

app.get('/chats', function(req, res) {
  res.json({
    data: chats
  });
});

var serverInfo = server.listen(port, function() {
  var h = serverInfo.address().address;
  var p = serverInfo.address().port;
  console.log('Group chat server listening at http://%s:%s', h, p);
});
