module.exports = function (server) {
  const io = require('socket.io')(server);

  io.on('connection', function(socket) {
    console.log('Socket connection');

    // Emit new infohash
    socket.emit('infohash', 'HASH');
  });
}