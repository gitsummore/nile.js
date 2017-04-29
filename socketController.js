// limit of initial clients to have socket connections w/
const CLIENT_LIMIT = 1;

// store refs to connected clients' RTC connections
const clientRTCConns = {};

module.exports = function (server) {
  const io = require('socket.io')(server);

  io.on('connection', function (socket) {
    console.log('New connection');

    // check # of clients
    function clientHandler (err, clients) {
      if (err) throw err;

      let msg, disconnect;
      if (clients.length <= CLIENT_LIMIT) {
        msg = 'Have a socket!';
        disconnect = false;
      } else {
        msg = 'No socket for you!';
        disconnect = true;

        // TODO: if socket comes after CLIENT_LIMIT exceeded,
        // redirect to getting hash by WebRTC
      }

      socket.emit('infohash', msg, disconnect);
    }

    io.sockets.clients(clientHandler);

    socket.on('disconnect', function (socket) {
      console.log('Disconnected');
    });
  });
}