// io object exposed from injected socket.io.js
const socket = io.connect();

let peerConn = webRTCInit();

socket.on('full', (msg, disconnect) => {
  addText(msg);
  if (disconnect) {
    console.log('Socket disconnecting');
    socket.disconnect();
  }
});

socket.on('magnetURI', (magnetURI) => {
  // begin downloading the torrents and render them to page, alternate between two torrents
  if (isPlay1Playing) {
    startDownloadingSecond(magnetURI);
  } else {
    startDownloadingFirst(magnetURI);
  }
});

// TODO: on disconnect, bridge server and next-linked node
// socket.on('disconnect')

function webRTCInit() {
  // Create WebRTC connection
  const peerConn = new RTCPeerConnection({
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

  return peerConn;
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
