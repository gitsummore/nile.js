// Install this.socket.io-client
// io object exposed from injected this.socket.io.js

// const io = require('socket.io-client');

// Have to require WebTorrent and not import, or there is a fs error from node.js
import WebTorrent from './webtorrent.min.js';
import Message from './message';
import io from 'socket.io-client';
import ViewerConnection from './viewerConnection';

/**
 * Viewer class concerned with streaming video from torrents
 * and managing WebSocket connection to server
 */

class Viewer {
  constructor(
    ID_of_NodeToRenderVideo, // location on the DOM where the live feed will be rendered
    turnServers, // array of TURN servers to use in WebRTC signaling
  ) {
    // initiate new torrent connection
    this.client = new WebTorrent()
    // grab DOM elements where the torrent video will be rendered to
    this.ID_of_NodeToRenderVideo = ID_of_NodeToRenderVideo;
    // store list of TURN servers
    this.turnServers = turnServers;

    // video tag ID from html page
    this.$play1 = document.getElementById('player1');
    this.$play2 = document.getElementById('player2');
    this.$play3 = document.getElementById('player3');

    this.socket = io.connect();

    // limit of child clients per client
    this.childLimit = 1;
    // indicates whether this node is the root connecting to the server
    this.isRoot = true;
    // handlers for both events in socket.io and messages using RTC DataChannel
    this.eventHandlers = {
      magnet: this._magnetURIHandler.bind(this),
      offer: this.receiveOffer.bind(this),
    };

    // progress trackers
    this.$numPeers = document.querySelector('#numPeers')
    this.$uploadSpeed = document.querySelector('#uploadSpeed')
    this.$downloadSpeed = document.querySelector('#downloadSpeed')

    /**
     * WebRTC Connections b/w clients
     * 
     * parent - client that's closer to server
     * child - farther away from server
     */
    this.connToParent, this.connToChild;

    this.torrentInfo = {
      'magnetURI1': 0,
      'magnetURI2': 0,
      'magnetURI3': 0,
      'isPlay1Playing': false,
      'isPlay1Playing': false,
      'firstIteration': 0
    }

  }

  setUpInitialConnection() {
    // document.createElement('video');
    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    // start playing next in video tag trio
    this.socket.on('magnetURI', this.eventHandlers.magnet);

    // if sockets are full, get torrent info from server thru WebRTC
    // use socket to signal w/ last client then disconnect
    this.socket.on('full', () => {
      // establish that it's a child of some parent client
      this.isRoot = false;

      // make it a child of server-connected client
      console.log('Sockets full, creating WebRTC connection...');

      // create new WebRTC connection to connect to a parent
      // will disconnect once WebRTC connection established
      this.connToParent = new ViewerConnection(
        this.socket,
        this.isRoot,
        this.eventHandlers,
        this.turnServers
      );

      console.log('Starting WebRTC signaling...');

      // initiate data channel
      this.connToParent.initDataChannel();
    });

    /**
     * WebRTC workflow handlers
     */

    // Callee: receives offer for a connection
    this.socket.on('offer', this.receiveOffer.bind(this));
    // Caller: receives answer after sending offer
    this.socket.on('answer', this.receiveAnswer.bind(this));
    // Both peers: add new ICE candidates as they come in
    this.socket.on('candidate', this.handleNewIceCandidate.bind(this));

    // this.socket.on('disconnect', () => {});
  }

  _magnetURIHandler(magnetURI) {
    console.log('Got magnet');
    // begin downloading the torrents and render them to page, alternate between three torrents
    if (this.torrentInfo['isPlay1Playing'] && this.torrentInfo['isPlay2Playing']) {
      this.startDownloading(magnetURI, this.$play3, this.$play1, 'firstIteration', true, true, 'magnetURI3', 'video#player3', '3');
    } else if (this.torrentInfo['isPlay1Playing']) {
      this.startDownloading(magnetURI, this.$play2, this.$play3, 'firstIteration', true, false, 'magnetURI2', 'video#player2', '2');
    } else {
      this.startDownloading(magnetURI, this.$play1, this.$play2, 'firstIteration', false, false, 'magnetURI1', 'video#player1', '1');
    }

    // broadcast magnet URI to next child
    const magnetMsg = new Message('magnet', magnetURI);
    this.connToChild && this.connToChild.sendMessage(JSON.stringify(magnetMsg));
  }

  // Callee: receive offer from new child peer
  // this.socket and DataChannel 'offer' handler
  receiveOffer({ callerId, offer }) {
    // console.log('Receiving offer...');

    // tell new client to join at child instead, if exists
    if (this.connToChild) {
      // offer message - tell last client in chain is adding new client
      const offerMsg = new Message('offer', { callerId, offer });
      // send to child client
      this.connToChild.sendMessage(JSON.stringify(offerMsg));
    } else {
      // if socket disconnected, reopen it to signal w/ joining client
      if (this.socket.disconnected) {
        this.socket.open();
      }

      // create child connection
      this.connToChild = new ViewerConnection(
        this.socket,
        this.isRoot,
        {},
        this.turnServers
      );

      // set peer id for child connection
      this.connToChild.setPeerId(callerId);

      // connection processes offer/sdp info
      this.connToChild.respondToOffer(callerId, offer);
    }
  }

  // Callee: as a parent/caller, receive answer from child/callee
  // this.socket 'answer' handler
  receiveAnswer({ calleeId, answer }) {
    // console.log('Receiving answer from offer...');

    // set peer id for parent connection
    this.connToParent.setPeerId(calleeId);

    // set info from remote end
    this.connToParent.respondToAnswer(answer);
  }

  // Callee: receive an ICE candidate from caller
  // this.socket ICE candidate handler
  handleNewIceCandidate(candidate) {
    // console.log('Receiving ICE candidates...');
    const iceCandidate = new RTCIceCandidate(candidate);

    // add ICE candidate from caller (parent)
    this.connToParent && this.connToParent.addIceCandidate(iceCandidate);
  }

  // torrentId will change whenever the viewer is notified of the new magnet via websockets or WebRTC
  // this will also trigger event to check if this.isPlay1Playing true or false
  // and then it will either run the first download or the second download, torrent ID must be different

  // Function for downloading the torrent
  startDownloading(
    magnetURI,
    currPlayer,
    nextPlayer,
    firstIteration,
    isPlay1Playing,
    isPlay2Playing,
    prevMagnetURI,
    renderTo,
    curr) {

    let $play1 = this.$play1;
    let $play2 = this.$play2;
    let $play3 = this.$play3;

    console.log('this video is playing', curr);
    // let onProgress = this.onProgress;
    this.torrentInfo[firstIteration] += 1;
    console.log(this.torrentInfo[firstIteration]);

    let first = this.torrentInfo[firstIteration]
    // console.log('first Iteration', firstIteration)
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
    if (this.torrentInfo[prevMagnetURI]) {
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
        window.setTimeout(() => { file.renderTo(renderTo) }, 6000);
      } else {
        file.renderTo(renderTo, { autoplay: false })
      }

      // Trigger statistics refresh
      // setInterval(onProgress.bind(this)(torrent), 500);
    })

    // listen to when video ends, immediately play the other video
    currPlayer.onended = function () {
      nextPlayer.play();

      nextPlayer.removeAttribute('hidden');

      currPlayer.setAttribute('hidden', true);
    };
  }


  // Download Statistics
  onProgress(torrent) {
    // let $numPeers = this.$numPeers.bind(this);
    // let $uploadSpeed = this.$uploadSpeed.bind(this);
    // let $downloadSpeed = this.$downloadSpeed.bind(this);

    let $numPeers = document.querySelector('#numPeers')
    let $uploadSpeed = document.querySelector('#uploadSpeed')
    let $downloadSpeed = document.querySelector('#downloadSpeed')
    // Peers
    $numPeers.innerHTML = torrent.numPeers + (torrent.numPeers === 1 ? ' peer' : ' peers');

    console.log('torrent', torrent);
    // Speed rates
    $downloadSpeed.innerHTML = torrent.downloadSpeed + '/s'
    $uploadSpeed.innerHTML = torrent.uploadSpeed + '/s'
  }

  // Human readable bytes util
  prettyBytes(num) {
    let exponent, unit, neg = num < 0, units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    if (neg) num = -num;
    if (num < 1) return (neg ? '-' : '') + num + ' B';
    exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);
    num = Number((num / Math.pow(1000, exponent)).toFixed(2));
    unit = units[exponent];
    return (neg ? '-' : '') + num + ' ' + unit;
  }
}

// export default Viewer
module.exports = Viewer