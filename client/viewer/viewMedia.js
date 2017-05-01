// io object exposed from injected socket.io.js

// import io from 'socket.io';
// import * as utils from './utils';

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
    // create answer to offer
    .then(() => connToChild.createAnswer())
    // set local description of callee
    .then((answer) => connToChild.setLocalDescription(answer))
    // send answer to caller
    .then(() => {
      const msg = {
        type: 'answer',
        sdp: connToChild.localDescription,
      };
      send(msg);
    })
    .catch(logError);

  // TODO: redirect new peer if exceed peer limit
});

// TODO: on disconnect, bridge server and next-linked node
// socket.on('disconnect', () => {});

// send message on RTC connection
function send(msg) {
  // TODO: send messages across signal server via sockets or DataChannel

}

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

  // when ICE candidates need to be sent to callee
  conn.onicecandidate = function (event) {
    if (event.candidate) {
      // send child peer ICE candidate
      send({
        type: 'candidate',
        candidate: event.candidate,
      });
    }
  }

  // TODO: make event handlers for non-socket connected clients

  return conn;
}

// call a parent client
function handleParentNegotiation() {
  // create offer to parent
  connToParent.createOffer()
    // set local description of caller
    .then(offer => connToParent.setLocalDescription(offer))
    // send offer along to peer
    .then(() => send({
      type: 'offer',
      sdp: connToParent.localDescription,
    }))
    .catch(logError);
}

// receive an ICE candidate from caller
function handleNewIceCandidate(msg) {
  const candidate = new RTCIceCandidate(msg.candidate);

  // add ICE candidate from caller (parent)
  connToParent.addIceCandidate(candidate)
    .catch(logError);
}

// close connections and free up resources
function closeConnToParent(conn) {
  connToParent.close();
  connToParent = null;
  // tell other peer to close connection as well
  send({
    type: 'close'
  });
}

function closeConnToChild(conn) {
  connToChild.close();
  connToChild = null;
  // tell other peer to close connection as well
  send({
    type: 'close'
  });
}