// Install this.socket.io-client
// io object exposed from injected this.socket.io.js

// Have to require WebTorrent and not import, or there is a fs error from node.js
import WebTorrent from './webtorrent.min.js';
import io from 'socket.io-client';
import ViewerConnection from './viewerConnection';

// use WebRTC Adapter shim
require('webrtc-adapter');

/**
 * Viewer class concerned with streaming video from torrents
 * and managing WebSocket connection to server
 */

class Viewer {
  constructor(
    ID_of_NodeToRenderVideo, // location on the DOM where the live feed will be rendered
    addedIceServers = [], // array of ICE servers to use in WebRTC signaling
  ) {

    this.total = {
      'downloaded': 0,
      'uploaded': 0
    }
    // initiate new torrent connection
    this.client = new WebTorrent()
    // grab DOM elements where the torrent video will be rendered to
    this.ID_of_NodeToRenderVideo = ID_of_NodeToRenderVideo;
    // store list of ICE servers
    this.addedIceServers = addedIceServers;

    this.socket = io.connect();
    // limit of child clients per client
    this.childLimit = 1;

    // indicates whether this node is the root connecting to the server
    this.isRoot = true;

    // progress trackers
    // this.$numPeers = document.querySelector('#numPeers')
    this.$downloaded = document.querySelector('#download')
    this.$uploaded = document.querySelector('#upoload')

    // create the video players on the document
    this.createVideos();

    // video tag ID from html page
    this.$play1 = document.getElementById('player1');
    this.$play2 = document.getElementById('player2');
    this.$play3 = document.getElementById('player3');
    /**
     * WebRTC Connections b/w clients
     * 
     * parent - client that's closer to server
     * child - farther away from server
     */
    this.connToParent = null;
    this.connToChild = null;

    this.torrentInfo = {
      'magnetURI1': 0,
      'magnetURI2': 0,
      'magnetURI3': 0,
      'isPlay1Playing': false,
      'isPlay1Playing': false,
      'firstIteration': 0
    }

    // displays torrent progress data
    // this.onProgress = this.onProgress.bind(this);

    this.setUpInitialConnection();

    // creates func to clear client connection when it disconnects
    this._createIceDisconnHandler = (connName) => () => {
      // have variable 
      // close client's RTC Peer Connection

      console.log('ICE disconnecting on:', connName);
      if (this[connName]) {
        this[connName].closeRTC();
        // clear connection
        this[connName] = null;

        // open socket if not already open and if from parent
        if (connName === 'connToParent') this.socket.disconnected && this.socket.open();
      }
    };

    // telling neighboring clients to reconnect
    const reconnectNeighbors = (event) => {
      // sending disconnecting message to each client
      for (let conn of ['connToParent', 'connToChild']) {
        if (this[conn]) {
          // if the connection exists, use opposite connection name
          // for example, if sending to parent on connToParent,
          // parent would be receiving message on connToChild so we'd use connToChild
          const oppConn = (conn === 'connToParent') ? 'connToChild' : 'connToParent';
          // send disconnection message telling peer on other end to disable the connection between this and them

          this[conn].sendMessage('disconnecting', {
            // will allow disconnected root to reassign root role to next client
            isRoot: this.isRoot,
            // tells neighboring clients which connection to disconnect
            disconnector: oppConn,
          });
        }
      };
    };
    // adding document unload listener : fires when this client's browser closes the page
    window.addEventListener('unload', reconnectNeighbors);
  }

  setUpInitialConnection() {
    this.socket.on('connect', () => {

      console.log('Socket connected');
    });

    // start playing next in video tag trio
    this.socket.on('magnetURI', this._magnetURIHandler.bind(this));

    // if sockets are full, get torrent info from server thru WebRTC
    // use socket to signal w/ last client then disconnect
    this.socket.on('full', () => {
      // establish that it's a child of some parent client
      this.isRoot = false;

      // make it a child of server-connected client
      console.log('Sockets full, creating WebRTC connection...');

      // sending ICE disconnection handler
      // connToChild b/c this client will be a child for the parent it's connecting to
      const iceDisconnHandlerForParent = this._createIceDisconnHandler('connToParent');

      // Event handlers to pass to parent client's DataChannel connection
      const parentEventHandlers = {
        magnet: this._magnetURIHandler.bind(this),
        offer: this._receiveOffer.bind(this),
        disconnecting: this._reconnectWithNeighbor.bind(this),
      };

      // create new WebRTC connection to connect to a parent
      // will disconnect once WebRTC connection established
      this.connToParent = new ViewerConnection(
        this.socket,
        this.isRoot,
        parentEventHandlers,
        this.addedIceServers,
        iceDisconnHandlerForParent
      );

      console.log('Starting WebRTC signaling...');

      // initiate data channel
      this.connToParent.initDataChannel();
    });

    /**
     * WebRTC workflow handlers
     */

    // Callee: receives offer for a connection
    this.socket.on('offer', this._receiveOffer.bind(this));
    // Caller: receives answer after sending offer
    this.socket.on('answer', this._receiveAnswer.bind(this));
    // Both peers: add new ICE candidates as they come in
    this.socket.on('candidate', this._handleNewIceCandidate.bind(this));

    // this.socket.on('disconnect', () => {});
  }

  _magnetURIHandler(magnetURI) {
    console.log('Got magnet');
    // begin downloading the torrents and render them to page, alternate between three torrents
    if (this.torrentInfo['isPlay1Playing'] && this.torrentInfo['isPlay2Playing']) {
      this.startStreaming(magnetURI, this.$play3, this.$play1, 'firstIteration', true, true, 'magnetURI3', 'video#player3');
    } else if (this.torrentInfo['isPlay1Playing']) {
      this.startStreaming(magnetURI, this.$play2, this.$play3, 'firstIteration', true, false, 'magnetURI2', 'video#player2');
    } else {
      this.startStreaming(magnetURI, this.$play1, this.$play2, 'firstIteration', false, false, 'magnetURI1', 'video#player1');
    }

    // broadcast magnet URI to next child
    this.connToChild && this.connToChild.sendMessage('magnet', magnetURI);
  }

  // Callee: receive offer from new child peer
  // Hybrid WebSockets and DataChannel 'offer' handler
  _receiveOffer({ callerId, offer }) {
    // console.log('Receiving offer...');

    // tell new client to join at child instead, if exists
    if (this.connToChild) {
      // send message w/ offer to child client
      this.connToChild.sendMessage('offer', { callerId, offer });
    } else {
      // if socket disconnected, reopen it to signal w/ joining client
      if (this.socket.disconnected) {
        this.socket.open();
      }

      // sending ICE disconncetion handler
      // connToChild b/c this client will be a parent for the child it's connecting to
      const iceDisconnHandlerForChild = this._createIceDisconnHandler('connToChild');

      // event handlers to pass to child client's DataChannel connection
      const childEventHandlers = {
        disconnecting: this._reconnectWithNeighbor.bind(this),
      };

      // create child connection
      this.connToChild = new ViewerConnection(
        this.socket,
        this.isRoot,
        childEventHandlers,
        this.iceServers,
        iceDisconnHandlerForChild
      );

      // set peer id for child connection
      this.connToChild.setPeerId(callerId);

      // connection processes offer/sdp info
      this.connToChild.respondToOffer(callerId, offer);
    }
  }

  // Callee: as a parent/caller, receive answer from child/callee
  // this.socket 'answer' handler
  _receiveAnswer({ calleeId, answer }) {
    // set peer id for parent connection
    this.connToParent.setPeerId(calleeId);

    // set info from remote end
    this.connToParent.respondToAnswer(answer);
  }

  // Callee: receive an ICE candidate from caller
  // this.socket ICE candidate handler
  _handleNewIceCandidate(candidate) {
    // console.log('Receiving ICE candidates...');
    const iceCandidate = new RTCIceCandidate(candidate);

    // add ICE candidate from caller (parent)
    this.connToParent && this.connToParent.addIceCandidate(iceCandidate);
  }

  // DataChannel handler to pass root status from disconnecting parent to child
  _reconnectWithNeighbor({ isRoot, disconnector }) {

    console.log('Disconnecting:');
    console.log('isRoot:', isRoot);
    console.log('disconnector:', disconnector);

    // if receiving disconnection message from parent
    if (disconnector === 'connToParent') {
      // update root status
      this.isRoot = isRoot;
    }
  }

  // torrentId will change whenever the viewer is notified of the new magnet via websockets or WebRTC
  // this will also trigger event to check if this.isPlay1Playing true or false
  // and then it will either run the first download or the second download, torrent ID must be different

  // Function for downloading the torrent
  startStreaming(
    magnetURI,
    currPlayer,
    nextPlayer,
    firstIteration,
    isPlay1Playing,
    isPlay2Playing,
    prevMagnetURI,
    renderTo) {

    const $play1 = this.$play1;
    const $play2 = this.$play2;
    const $play3 = this.$play3;

    let total = this.total;

    this.torrentInfo[firstIteration] += 1;

    let first = this.torrentInfo[firstIteration]

    if (!isPlay1Playing) {
      console.log('play1 playing')
      this.torrentInfo['isPlay1Playing'] = true;
    } else if (!isPlay2Playing) {
      console.log('play2 playing')
      this.torrentInfo['isPlay2Playing'] = true;
    } else {
      console.log('play3 playing')
      this.torrentInfo['isPlay1Playing'] = false;
      this.torrentInfo['isPlay2Playing'] = false;
    }

    // removes torrent 
    if (this.torrentInfo[prevMagnetURI] !== 0) {

      // appends total uploaded to the value
      total['uploaded'] += this.client.get(this.torrentInfo[prevMagnetURI]).uploaded;

      this.client.remove(this.torrentInfo[prevMagnetURI], () => {
        console.log('Magnet Removed')
      })
    }


    this.torrentInfo[prevMagnetURI] = magnetURI;

    this.client.add(magnetURI, function (torrent) {
      /* Look for the file that ends in .webm and render it, in the future we can
       * add additional file types for scaling. E.g other video formats or even VR!
       */
      let file = torrent.files.find(function (file) {
        return file.name.endsWith('.webm')
      })

      // Stream the file in the browser
      if (first === 1) {
        window.setTimeout(() => file.renderTo(renderTo, { autoplay: true }), 7000);
      } else {
        file.renderTo(renderTo, { autoplay: false })
      }

      // listens for when torrents are done and appends total downloaded to menu
      torrent.on('done', function () {
        total['downloaded'] += torrent.downloaded;
      })

      // Trigger statistics refresh
      // setInterval(onProgress(torrent), 500);
    })

    // listen to when video ends, immediately play the other video
    currPlayer.onended = function () {
      currPlayer.pause();

      nextPlayer.play();

      nextPlayer.removeAttribute('hidden');

      currPlayer.setAttribute('hidden', true);
    };
  }

  // create the video elements that will be appended to the DOM
  createVideos() {
    let players = document.createElement('div');
    let play1 = document.createElement('video');
    let play2 = document.createElement('video');
    let play3 = document.createElement('video');
    play1.setAttribute('id', 'player1');
    play2.setAttribute('id', 'player2');
    play3.setAttribute('id', 'player3');
    play2.setAttribute('hidden', true);
    play3.setAttribute('hidden', true);
    players.appendChild(play1);
    players.appendChild(play2);
    players.appendChild(play3);
    document.getElementById(this.ID_of_NodeToRenderVideo).appendChild(players);
  }

    // return the totals upload/download
  returnTotals() {
    return this.total;
  }
}

// export default Viewer
module.exports = Viewer