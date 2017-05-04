// store refs to connected clients' RTC connections
const clientRTCConns = {};

function socketController(server, clientLimit) {
  /**
   * server: Node Server
   * clientLimit: # of socket.io connections to keep
   */
  this.io = require('socket.io')(server);
  // will store socket connections to Viewers
  this.sockets = []; 

  this.io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // check # of clients
    const checkClientNum = (err, clients) => {
      if (err) throw err;

      let msg, disconnect;
      if (clients.length <= clientLimit) {
        msg = 'Connected to the server'
        disconnect = false;
        // keep socket connection
        this.sockets.push(socket);
      } else {
        msg = 'Go connect using webRTC!';
        disconnect = true;
      }
      socket.emit('full', msg, disconnect);
    }

    this.io.sockets.clients(checkClientNum);

    // receives offer from new client
    socket.on('offer', (offer) => {
      // get socket id to send offer to
      const targetSocket = getTargetSocket(this.sockets);
      const targetId = targetSocket.id;

      // emit to root of client chain
      // target socket's id maintained throughout signaling
      console.log('Emitting offer to', targetId);
      socket.to(targetId).emit('offer', targetId, offer);
    });

    socket.on('answer', (targetId, answer) => {
      // emit to root of client chain
      // target socket's id maintained throughout signaling
      console.log('Emitting answer to', targetId);
      socket.to(targetId).emit('answer', targetId, answer);
    });

    // socket.on('candidate')

    socket.on('disconnect', (socket) => {
      console.log('Disconnected');
      // TODO: properly remove socket from this.sockets
      this.sockets = this.sockets.filter(keptSocket => socket.id !== keptSocket.id);
    });
  });
}

socketController.prototype.emitNewMagnet = function(magnetURI) {
  console.log('hello')
  this.io.emit('magnetURI', magnetURI);
}

function getTargetSocket(sockets) {
  return sockets[0];
}

module.exports = socketController;