// io object exposed from injected socket.io.js
// const PEER_LIMIT = 1
const socket = io.connect();

// connection to parent - client node that's closer to server
let connToParent,
  // connection to child - client moving farther away from server
  connToChild;

socket.on('magnetURI', (magnetURI) => {
  // begin downloading the torrents and render them to page, alternate between two torrents
  if (isPlay1Playing) {
    startDownloadingSecond(magnetURI);
  } else {
    startDownloadingFirst(magnetURI);
  }
});

// if sockets are full, get torrent info from server thru WebRTC
socket.on('full', (msg, disconnect) => {
  addText(msg);
  if (disconnect) {
    console.log('Socket disconnecting');
    socket.disconnect();

    // create new WebRTC connection to connect to a parent
    connToParent = createPeerConn();
  }
});

// receives new child peer to send torrent info to
socket.on('offer', (msg) => {
  // create child connection
  connToChild = createPeerConn();

  // create session description from offer
  const desc = new RTCSessionDescription(msg.sdp);

  // set remote end's info
  connToChild.setRemoteDescription(desc)
    .then(() => console.log('Remote description set'));
});

// TODO: on disconnect, bridge server and next-linked node
// socket.on('disconnect', () => {});

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

// send message on RTC connection
function send(msg) {
  // TODO: send messages across signal server via sockets or DataChannel

}

function handleParentNegotiation() {
  // create offer to parent
  connToParent.createOffer()
    // set local description of media data once offer resolves
    .then(offer => connToParent.setLocalDescription(offer))
    // send offer along to peer
    .then(() => send({
      type: 'offer',
      sdp: connToParent.localDescription,
    }))
    .catch(reason => console.log('Error:', reason));
}

function appendText(msg) {
  const pNode = document.createElement('p');
  pNode.innerText = msg;
  document.body.appendChild(pNode);
}
