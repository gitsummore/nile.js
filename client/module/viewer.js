// Install this.socket.io-client
// io object exposed from injected this.socket.io.js

// import * as io from 'socket.io-client';
// import WebTorrent from 'webtorrent';

const io = require('socket.io-client');
const WebTorrent = require('./webtorrent.min.js');

// utils do not need to be imported
// import * as utils from './utils';

class Viewer {
  constructor(
    ID_of_NodeToRenderVideo // location on the DOM where the live feed will be rendered
    ) {
    // initiate new torrent connection
    this.client = new WebTorrent()
    // grab DOM elements where the torrent video will be rendered too
    this.ID_of_NodeToRenderVideo = ID_of_NodeToRenderVideo;
    this.$play1 = document.getElementById('player1');
    this.$play2 = document.getElementById('player2');
    this.$play3 = document.getElementById('player3');
    this.isPlay1Playing = false;
    this.isPlay2Playing = false;
    this.firstIteration = 0;
    this.socket = io.connect(); // const PEER_LIMIT = 1
    this.connToParent; // connection to parent - client node that's closer to server
    this.connToChild; // connection to child - client moving farther away from server
  }

  setUpInitialConnection() {
    // document.createElement('video');
    console.log('working')

    this.socket.on('magnetURI', (magnetURI) => {
      // console.log(magnetURI)
      // begin downloading the torrents and render them to page, alternate between three torrents
      if (this.isPlay1Playing && this.isPlay2Playing) {
        this.startDownloadingThird(magnetURI);
      } else if (this.isPlay1Playing) {
        this.startDownloadingSecond(magnetURI);
      } else {
        this.startDownloadingFirst(magnetURI);
      }
    });

    // if sockets are full, get torrent info from server thru WebRTC
    this.socket.on('full', (msg, disconnect) => {
      // addText(msg);
      if (disconnect) {
        console.log('Socket disconnecting');
        this.socket.disconnect();

        // create new WebRTC connection to connect to a parent
        this.connToParent = this.createPeerConn();
      }
    });

    // handle WebRTC workflow handlers
    this.socket.on('offer', this.receiveOffer);
    this.socket.on('answer', this.receiveAnswer);
    this.socket.on('candidate', this.handleNewIceCandidate);

    // TODO: redirect new peer to a child if exceeds peer limit
    // TODO: on disconnect, bridge server and next-linked node
    // this.socket.on('disconnect', () => {});
  }

  // send message on RTC connection
  sendBySocket(event, msg) {
    // TODO: make sure only sending message w/in proper node chain
    this.socket.emit(event, msg);
  }

  // Create WebRTC connection to a peer
  createPeerConn() {
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

    // when ready to negotiate and establish connection
    conn.onnegotiationneeded = this.handleParentNegotiation;
    // when ICE candidates need to be sent to callee
    conn.onicecandidate = this.iceCandidateHandler;

    // TODO: message handler for non-this.socket connected clients using DataChannel API

    return conn;
  }

  // begin connection to parent client
  handleParentNegotiation() {
    // create offer to parent
    this.connToParent.createOffer()
      // set local description of caller
      .then(offer => this.connToParent.setLocalDescription(offer))
      // send offer along to peer
      .then(() => {
        const offer = this.connToParent.localDescription;
        this.sendBySocket('offer', offer);
      })
      .catch(logError);
  }

  // this.socket offer handler
  // receive offer from new child peer
  receiveOffer(offer) {
    // create child connection
    this.connToChild = this.createPeerConn();

    // set remote end's info
    // return Promise that resolves after creating and setting answer as local description
    // sending answer will be handled by this.socket.io
    return this.connToChild.setRemoteDescription(offer)
      // create answer to offer
      .then(() => this.connToChild.createAnswer())
      // set local description of callee
      .then((answer) => this.connToChild.setLocalDescription(answer))
      // send answer to caller
      .then(() => {
        const answer = this.connToChild.localDescription;
        this.sendBySocket('answer', answer);
      })
      .catch(logError);
  }

  // this.socket answer handler
  // as a parent/caller, receive answer from child/callee
  receiveAnswer(answer) {
    // set info from remote end
    this.connToParent.setRemoteDescription(answer)
      .catch(logError);
  }

  // RTC onicecandidate handler
  // send ICE candidate to callee
  iceCandidateHandler(event) {
    if (event.candidate) {
      // send child peer ICE candidate
      this.sendBySocket('candidate', event.candidate);
    }
  }
  // this.socket ICE candidate handler
  // receive an ICE candidate from caller
  handleNewIceCandidate(candidate) {
    const iceCandidate = new RTCIceCandidate(candidate);

    // add ICE candidate from caller (parent)
    this.connToParent.addIceCandidate(candidate)
      .catch(logError);
  }

  // TODO: implement close upon disconnect
  // close connections and free up resources
  closeConnToParent(conn) {
    this.connToParent.close();
    this.connToParent = null;
    // tell other peer to close connection as well
    send({
      type: 'close'
    });
  }

  closeConnToChild(conn) {
    this.connToChild.close();
    this.connToChild = null;
    // tell other peer to close connection as well
    send({
      type: 'close'
    });
  }

  // torrentId will change whenever the viewer is notified of the new magnet via websockets or WebRTC
  // this will also trigger event to check if this.isPlay1Playing true or false
  // and then it will either run the first download or the second download, torrent ID must be different

  // Function for downloading the torrent
  startDownloadingFirst(magnetURI) {
    this.firstIteration += 1;
    let firstIteration = this.firstIteration;
    let $play1 = this.$play1;
    let $play2 = this.$play2;

    console.log('first Iteration', firstIteration)
      console.log('magnetURI', magnetURI)
    // console.log('what am I', this.client);

    // this.isPlay1Playing = true;
    
    // https://webtorrent.io/torrents/sintel.torrent
    
    this.client.add(magnetURI, function (torrent) {
      console.log('working?')
      /* Look for the file that ends in .webm and render it, in the future we can
       * add additional file types for scaling. E.g other video formats or even VR!
       */
      let file1 = torrent.files.find(function (file) {
        return file.name.endsWith('.webm')
      })
      
      // Stream the file in the browser
      if (firstIteration === 1) {
        window.setTimeout(() => { file1.renderTo('video#player1') }, 4000);
        firstIteration += 1;
      } else {
        file1.renderTo('video#player1', { autoplay: false })
      }
    })

    this.client.on('error', function (err) {
      console.log('torrent wont start downloading')
    })

    // listen to when video 1 ends, immediately play the other video
    $play1.onended = function (e) {
      $play2.play();

      $play2.removeAttribute('hidden');

      $play1.setAttribute('hidden', true);
    };
  }

  // Function for downloading the second torrent
  startDownloadingSecond(magnetURI) {
    this.isPlay2Playing = true;
    let $play2 = this.$play2;
    let $play3 = this.$play3;


    this.client.add(magnetURI, function (torrent) {

      /* Look for the file that ends in .webm and render it, in the future we can
       * add additional file types for scaling. E.g other video formats or even VR!
       */
      let file2 = torrent.files.find(function (file) {
        return file.name.endsWith('.webm')
      })

      // Stream the second file, but currently invisible and not playing
      file2.renderTo('video#player2', { autoplay: false })
    })

    // listen to when video 2 ends, immediately play the other video
    $play2.onended = function (e) {
      $play3.play();

      $play3.removeAttribute('hidden');

      $play2.setAttribute('hidden', true);
    };
  }

  startDownloadingThird(magnetURI) {
    this.isPlay1Playing = this.isPlay2Playing = false;

    let $play1 = this.$play1;
    let $play3 = this.$play3;

    this.client.add(magnetURI, function (torrent) {

      /* Look for the file that ends in .webm and render it, in the future we can
       * add additional file types for scaling. E.g other video formats or even VR!
       */
      let file3 = torrent.files.find(function (file) {
        return file.name.endsWith('.webm')
      })

      // Stream the second file, but currently invisible and not playing
      file3.renderTo('video#player3', { autoplay: false })
    })

    // listen to when video 3 ends, immediately play the other video
    $play3.onended = function (e) {
      $play1.play();
      console.log('am i working?')
      $play1.removeAttribute('hidden');

      $play3.setAttribute('hidden', true);
    }
  }
}

module.exports = Viewer