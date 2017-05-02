
const viewer = new Viewer('body');
viewer.setUpInitialConnection();

// // io object exposed from injected socket.io.js

// // import io from 'socket.io';
// // import * as utils from './utils';

// // const PEER_LIMIT = 1
// const socket = io.connect();

// // connection to parent - client node that's closer to server
// let connToParent,
//   // connection to child - client moving farther away from server
//   connToChild;

// socket.on('magnetURI', (magnetURI) => {
//   // begin downloading the torrents and render them to page, alternate between three torrents
//   if (isPlay1Playing && isPlay2Playing) {
//     startDownloadingThird(magnetURI);
//   } else if (isPlay1Playing) {
//     startDownloadingSecond(magnetURI);
//   } else {
//     startDownloadingFirst(magnetURI);
//   }
// });

// // if sockets are full, get torrent info from server thru WebRTC
// socket.on('full', (msg, disconnect) => {
//   addText(msg);
//   if (disconnect) {
//     console.log('Socket disconnecting');
//     socket.disconnect();

//     // create new WebRTC connection to connect to a parent
//     connToParent = createPeerConn();
//   }
// });

// // handle WebRTC workflow handlers
// socket.on('offer', receiveOffer);
// socket.on('answer', receiveAnswer);
// socket.on('candidate', handleNewIceCandidate);

// // TODO: redirect new peer to a child if exceeds peer limit
// // TODO: on disconnect, bridge server and next-linked node
// // socket.on('disconnect', () => {});

// // send message on RTC connection
// function sendBySocket(event, msg) {
//   // TODO: make sure only sending message w/in proper node chain
//   socket.emit(event, msg);
// }

// // Create WebRTC connection to a peer
// function createPeerConn() {
//   const conn = new RTCPeerConnection({
//     iceServers: [
//       // STUN servers
//       { url: 'stun:stun.l.google.com:19302' },
//       { url: 'stun:stun1.l.google.com:19302' },
//       { url: 'stun:stun2.l.google.com:19302' },
//       { url: 'stun:stun3.l.google.com:19302' },
//       { url: 'stun:stun4.l.google.com:19302' },
//       // TODO: allow adding of TURN servers
//     ]
//   });
//   console.log('WebRTC connection started');

//   // when ready to negotiate and establish connection
//   conn.onnegotiationneeded = handleParentNegotiation;
//   // when ICE candidates need to be sent to callee
//   conn.onicecandidate = iceCandidateHandler;

//   // TODO: message handler for non-socket connected clients using DataChannel API

//   return conn;
// }

// // begin connection to parent client
// function handleParentNegotiation() {
//   // create offer to parent
//   connToParent.createOffer()
//     // set local description of caller
//     .then(offer => connToParent.setLocalDescription(offer))
//     // send offer along to peer
//     .then(() => {
//       const offer = connToParent.localDescription;
//       sendBySocket('offer', offer);
//     })
//     .catch(logError);
// }

// // socket offer handler
// // receive offer from new child peer
// function receiveOffer(offer) {
//   // create child connection
//   connToChild = createPeerConn(); 

//   // set remote end's info
//   // return Promise that resolves after creating and setting answer as local description
//   // sending answer will be handled by socket.io
//   return connToChild.setRemoteDescription(offer)
//     // create answer to offer
//     .then(() => connToChild.createAnswer())
//     // set local description of callee
//     .then((answer) => connToChild.setLocalDescription(answer))
//     // send answer to caller
//     .then(() => {
//       const answer = connToChild.localDescription;
//       sendBySocket('answer', answer);
//     })
//     .catch(logError);
// }

// // socket answer handler
// // as a parent/caller, receive answer from child/callee
// function receiveAnswer(answer) {
//   // set info from remote end
//   connToParent.setRemoteDescription(answer)
//     .catch(logError);
// }

// // RTC onicecandidate handler
// // send ICE candidate to callee
// function iceCandidateHandler(event) {
//   if (event.candidate) {
//     // send child peer ICE candidate
//     sendBySocket('candidate', event.candidate);
//   }
// }

// // socket ICE candidate handler
// // receive an ICE candidate from caller
// function handleNewIceCandidate(candidate) {
//   const iceCandidate = new RTCIceCandidate(candidate);

//   // add ICE candidate from caller (parent)
//   connToParent.addIceCandidate(candidate)
//     .catch(logError);
// }

// // TODO: implement close upon disconnect
// // close connections and free up resources
// function closeConnToParent(conn) {
//   connToParent.close();
//   connToParent = null;
//   // tell other peer to close connection as well
//   // sendBySocket('close')
// }

// function closeConnToChild(conn) {
//   connToChild.close();
//   connToChild = null;
//   // tell other peer to close connection as well
//   // sendBySocket('close');
// }