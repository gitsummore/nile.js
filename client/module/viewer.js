// Install this.socket.io-client
// io object exposed from injected this.socket.io.js

// import io from 'socket.io-client';
// import ViewerConnection from './viewerConnection';
// import Message from './message';

/**
 * Viewer class concerned with streaming video from torrents
 * and managing WebSocket connection to server
 * 
 * TODO: separate WebSocket concerns from torrent streaming
 */
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
    // limit of child clients per client
    this.childLimit = 1;
    // indicates whether this node is the root connecting to the server
    this.isRoot = true;

    /**
     * WebRTC Connections b/w clients
     * 
     * parent - client that's closer to server
     * child - farther away from server
     */
    this.connToParent, this.connToChild;
  }

  setUpInitialConnection() {
    // document.createElement('video');
    this.socket.on('connect', () => {
      console.log('working');
    });

    // start playing next in video tag trio
    this.socket.on('magnetURI', this._magnetURIHandler.bind(this));

    // if sockets are full, get torrent info from server thru WebRTC
    this.socket.on('full', (msg, disconnect) => {
      // addText(msg);
      if (disconnect) {
        // establish that it's a child of some parent client
        this.isRoot = false;

        // make it a child of server-connected client
        console.log('Sockets full, creating WebRTC connection...');

        // create new WebRTC connection to connect to a parent
        // will disconnect once WebRTC connection established
        this.connToParent = new ViewerConnection(this.socket, this.isRoot);

        // add DataChannel magnet message handler
        this.connToParent.addMessageHandler('magnet', this._magnetURIHandler.bind(this));

        console.log('Starting WebRTC signaling...');

        // initiate data channel
        this.connToParent.initDataChannel();
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

  _magnetURIHandler(magnetURI) {
    console.log('Got magnet');
    // begin downloading the torrents and render them to page, alternate between three torrents
    if (this.isPlay1Playing && this.isPlay2Playing) {
      this.startDownloadingThird(magnetURI);
    } else if (this.isPlay1Playing) {
      this.startDownloadingSecond(magnetURI);
    } else {
      this.startDownloadingFirst(magnetURI);
    }

    // broadcast magnet URI to next child
    const magnetMsg = new Message('magnet', magnetURI);
    this.connToChild && this.connToChild.sendMessage(JSON.stringify(magnetMsg));
  }

  // Callee: receive offer from new child peer
  // this.socket 'offer' handler
  receiveOffer(callerId, offer) {
    console.log('Receiving offer at socket', this.socket.id);

    // create child connection
    this.connToChild = new ViewerConnection(this.socket, this.isRoot);

    // set peer id for child connection
    this.connToChild.setPeerId(callerId);

    // connection processes offer/sdp info
    this.connToChild.respondToOffer(callerId, offer);
  }

  // Callee: as a parent/caller, receive answer from child/callee
  // this.socket 'answer' handler
  receiveAnswer(calleeId, answer) {
    console.log('Receiving answer from offer...');

    // set peer id for parent connection
    this.connToParent.setPeerId(calleeId);

    // set info from remote end
    this.connToParent.respondToAnswer(answer);
  }

  // Callee: receive an ICE candidate from caller
  // this.socket ICE candidate handler
  handleNewIceCandidate(candidate) {
    console.log('Receiving ICE candidates...');
    const iceCandidate = new RTCIceCandidate(candidate);

    // add ICE candidate from caller (parent)
    this.connToParent && this.connToParent.addIceCandidate(iceCandidate);
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
}

// export default Viewer




