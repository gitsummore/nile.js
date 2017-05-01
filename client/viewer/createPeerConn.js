// Create WebRTC connection to a peer
function createPeerConn() {
  const conn = new RTCPeerConnection({
    iceServers: [
      // STUN servers
      { url: 'stun:stun.l.google.com:19302' },
      { url: 'stun:stun1.l.google.com:19302' },
      { url: 'stun:stun2.l.google.com:19302' },
      { url: 'stun:stun3.l.google.com:19302' },
      { url: 'stun:stun4.l.google.com:19302' },
      // TODO: allow adding of TURN servers
    ]
  });
  console.log('WebRTC connection started');

  // send ICE candidates to other peer
  // fires when RTCIceCandidate has been added to target
  conn.onicecandidate = function (event) {
    if (event.candidate) {
      send({
        type: 'candidate',
        candidate: event.candidate,
      });
    }
  }

  // TODO: make event handlers for non-socket connected clients

  return conn;
}