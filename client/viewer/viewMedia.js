// io object exposed from injected socket.io.js

const socket = io.connect();

let peerConn;

socket.on('infohash', (msg, disconnect) => {
  appendText(msg);

  // Start a WebRTC connection
  webRTCInit();

  if (disconnect) {
    console.log('Socket disconnecting');
    socket.disconnect();
  }
});

// TODO: on disconnect, bridge server and next-linked node
// socket.on('disconnect')

function webRTCInit() {
  // Create WebRTC connection
  peerConn = new RTCPeerConnection({
    iceServers: [
      { url: 'stun:stun.l.google.com:19302' },
      { url: 'stun:stun1.l.google.com:19302' },
      { url: 'stun:stun2.l.google.com:19302' },
      { url: 'stun:stun3.l.google.com:19302' },
      { url: 'stun:stun4.l.google.com:19302' },
    ]
  });
  console.log('WebRTC connection started');

  // send ICE candidates to other peer
  // fires when RTCIceCandidate has been added to target
  peerConn.onicecandidate = function (event) {
    if (event.candidate) {
      send({
        type: 'candidate',
        candidate: event.candidate,
      });
    }
  }

  peerConn.onopen = function () {
    console.log('Connected');
  }

  peerConn.onerror = err => console.log('Error: ', err);
}

// send message on RTC connection
function send(msg) {
  peerConn && peerConn.send(JSON.stringify(msg));
}

function appendText(msg) {
  const pNode = document.createElement('p');
  pNode.innerText = msg;
  document.body.appendChild(pNode);
}