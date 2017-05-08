// store refs to connected clients' RTC connections
const clientRTCConns = {};

function socketController(server, socketLimit) {
  /**
   * server: Node Server
   * socketLimit: # of socket.io connections to keep
   */
  this.io = require('socket.io')(server);
  // will store socket connections to Viewers
  this.sockets = []; 

  this.io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // check # of clients
    // kick socket off client if full
    const checkClientNum = (err, clients) => {
      if (err) throw err;

      if (clients.length <= socketLimit) {
        // keep socket connection
        this.sockets.push(socket);
      } else {
        socket.emit('full');
      }
    }

    this.io.sockets.clients(checkClientNum);

    // variable to bind socketController context in socket handlers
    // so that 'this' in socket handlers can access socket
    const self = this;

    // callee receives offer from new client
    socket.on('offer', function (offer) {
      // get socket id to send offer to
      const calleeSocket = getCalleeSocket(self.sockets);
      const calleeId = calleeSocket.id;
      // get this socket's id
      const callerId = this.id;

      // emit to root of client chain
      // callee socket's id maintained throughout signaling
      console.log('Emitting offer to callee:', calleeId);
      socket.to(calleeId).emit('offer', this.id, offer);
    });

    // caller receives answer from callee
    socket.on('answer', function (callerId, answer) {
      // emit this (callee) socket's id and answer to root of client chain
      // callee socket's id maintained throughout signaling
      console.log('Emitting answer to caller:', callerId);
      socket.to(callerId).emit('answer', this.id, answer);
    });

    // send peers in a WebRTC connection new ICE candidates
    socket.on('candidate', (peerId, candidate) => {
      console.log('Emitting candidate to peer:', peerId);
      socket.to(peerId).emit('candidate', candidate);
    });

    socket.on('disconnect', function(socket) {
      console.log(this.id, 'disconnected');
      // TODO: properly remove socket from this.sockets, NEED proper disconnection
      self.sockets = self.sockets.filter(keptSocket => socket.id !== keptSocket.id);
      // console.log('Removed sockets:', self.sockets.map(socket => socket.id));
    });
  });
}

socketController.prototype.emitNewMagnet = function(magnetURI) {
  this.io.emit('magnetURI', magnetURI);
}

function getCalleeSocket(sockets) {
  return sockets[0];
}

module.exports = socketController;