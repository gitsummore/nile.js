// limit of initial clients to have socket connections w/
const CLIENT_LIMIT = 3;

module.exports = function (server) {
  const io = require('socket.io')(server);

  io.on('connection', function (socket) {
    console.log('New connection');

    // check # of clients
    function clientHandler (err, clients) {
      if (err) throw err;

      let msg;
      if (clients.length <= CLIENT_LIMIT) {
        msg = 'Have a socket!';
      } else {
        msg = 'No socket for you!';

        // TODO: if socket comes after CLIENT_LIMIT exceeded,
        // redirect to getting hash by WebRTC
      }

      socket.emit('infohash', msg);
    }

    io.sockets.clients(clientHandler);

    socket.on('disconnect', function (socket) {
      console.log('Disconnected');
    });
  });
}