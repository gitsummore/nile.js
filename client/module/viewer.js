// Install this.socket.io-client
// io object exposed from injected this.socket.io.js

// import io from 'socket.io-client';

// set peer connection to Mozilla PeerConnection if in Firefox
RTCPeerConnection = RTCPeerConnection || mozRTCPeerConnection;

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
    this.socket = io.connect();
    this.childLimit = 1;

    /**
     * WebRTC Connections b/w clients
     * 
     * parent - client that's closer to server
     * child - farther away from server
     */ 
    this.connToParent;
    this.connToChild;
    // DataChannels for sending messages
    this.parentChannel, this.childChannel;
  }

  // send message on RTC connection
  sendBySocket(event, ...args) {
    this.socket.emit(event, ...args);
  }

  setUpInitialConnection() {
    // document.createElement('video');
    this.socket.on('connect', () => {
      console.log('working');
    });

    // start playing next in video tag trio
    this.socket.on('magnetURI', (magnetURI) => {
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
        console.log('Sockets full, creating WebRTC connection...');

        // create new WebRTC connection to connect to a parent
        // will disconnect once WebRTC connection established
        this.connToParent = this.createPeerConn();
        // create data channel to pass messges to parent
        this.parentChannel = this.connToParent.createDataChannel('magnet');
        // setup channel event listeners
        this.setupDataChannel(this.parentChannel);
        // begin negotiation process w/ an offer
        this.initOffer();
      }
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
        // TODO: developer-provided TURN servers go here
      ]
    });
    console.log('Starting WebRTC signaling...');

    /**
     * Useful diagrams for WebRTC signaling process:
     * 
     * 1. Initiating negotiation:
     * https://mdn.mozillademos.org/files/12363/WebRTC%20-%20Signaling%20Diagram.svg
     * -Caller creates offer
     * 
     * 2. Exchanging ICE candidates:
     * https://mdn.mozillademos.org/files/12365/WebRTC%20-%20ICE%20Candidate%20Exchange.svg
     * 
     */

    // Handle connection state changes
    conn.onconnectionstatechange = this.connectionStateHandler.bind(this);
    
    // when ICE candidates need to be sent to callee
    conn.onicecandidate = this.iceCandidateHandler.bind(this);
    
    // Handle requests to open data channel
    conn.ondatachannel = this.receiveDataChannel.bind(this);

    return conn;
  }

  // add event listeners for RTC DataChannel
  setupDataChannel(channel) {
    channel.onopen = channel.onclose = this.handleSendChannelStatusChange;
  }

  handleSendChannelStatusChange(event) {

  }

  // WebRTC connection state handler
  connectionStateHandler() {
    console.log('Connection state changed to', conn.connectionState);

    if (conn.connectionState === 'connected') {
      // disconnect socket.io connection
      this.socket.disconnect();
    }
  }

  // Caller: begin connection to parent client
  // RTC negotiationneeded handler
  initOffer() {
    console.log('Initiating offer...');
    // create offer to parent
    this.connToParent.createOffer()
      // set local description of caller
      .then(offer => this.connToParent.setLocalDescription(offer))
      // send offer along to peer
      .then(() => {
        const offer = this.connToParent.localDescription;
        this.sendBySocket('offer', offer);

        // TODO: post to server so non-socket clients can transmit session info w/o sockets?
      })
      .catch(this.logError);
  }

  // Callee: receive offer from new child peer
  // this.socket 'offer' handler
  receiveOffer(callerId, offer) {
    console.log('Receiving offer at socket', this.socket.id);
    // create child connection
    this.connToChild = this.createPeerConn();
    // create data channel to pass messges to child
    this.childChannel = this.connToChild.createDataChannel('magnet');
    // setup channel event listeners
    this.setupDataChannel(this.childChannel);

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
        console.log('Set local description');
        // console.log('Local:', this.connToChild.localDescription);
        // console.log('Remote:', this.connToChild.remoteDescription);
        const answer = this.connToChild.localDescription;
        this.sendBySocket('answer', callerId, answer);
      })
      .catch(this.logError);
  }

  // Callee: as a parent/caller, receive answer from child/callee
  // this.socket 'answer' handler
  receiveAnswer(answer) {
    console.log('Receiving answer from offer...');
    // set info from remote end
    return this.connToParent.setRemoteDescription(answer)
      .then(() => {
        console.log('Set remote description');
        // console.log('Local:', this.connToParent.localDescription);
        // console.log('Remote:', this.connToParent.remoteDescription);
      })
      .catch(this.logError);
  }

  // Caller: send ICE candidate to callee
  // RTC onicecandidate handler
  // TODO: make this function work when viewer is a caller AND a callee
  iceCandidateHandler(event) {
    console.log('Sending ICE candidates...');
    if (event.candidate) {
      // send child peer ICE candidate
      this.sendBySocket('candidate', /* peerId, */ event.candidate);
    }
  }

  // Callee: receive an ICE candidate from caller
  // this.socket ICE candidate handler
  handleNewIceCandidate(candidate) {
    console.log('Receiving ICE candidates...');
    const iceCandidate = new RTCIceCandidate(candidate);

    // add ICE candidate from caller (parent)
    this.connToParent.addIceCandidate(candidate)
      .catch(this.logError);
  }

  // RTC: receiver handles request to open data channel
  receiveDataChannel(event) {
    
  }

  // close connections and free up resources
  closeConnToParent(conn) {
    this.connToParent.close();
    this.connToParent = null;
    // tell other peer to close connection as well
    sendBySocket('close');
  }

  closeConnToChild(conn) {
    this.connToChild.close();
    this.connToChild = null;
    // tell other peer to close connection as well
    sendBySocket('close');
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

    this.isPlay1Playing = true;


    this.client.add(magnetURI, function (torrent) {

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

  logError(err) {
    throw err;
  }
}

// export default Viewer




