// set peer connection to Mozilla PeerConnection if in Firefox
RTCPeerConnection = RTCPeerConnection || mozRTCPeerConnection;

/**
 * Wrapper class for RTC connection between parent and child viewers
 */
class ViewerConnection {
  constructor(socket) {
    this.socket = socket;
    // reserved variables
    // RTC DataChannel
    this.channel;
    // Peer's socket ID
    this.peerId;

    // set up wrapped WebRTCConnection
    this.RTCconn = new RTCPeerConnection({
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

    // Handle negotiation needed (i.e. when opening data channel)
    this.RTCconn.onnegotiationneeded = this.initOffer.bind(this);

    // Handle connection state changes
    this.RTCconn.onconnectionstatechange = this.connectionStateHandler.bind(this);
    
    // when ICE candidates need to be sent to callee
    this.RTCconn.onicecandidate = this.iceCandidateHandler.bind(this);
    
    // Handle requests to open data channel
    this.RTCconn.ondatachannel = this.receiveDataChannel.bind(this);
  }

  // add event listeners for RTC DataChannel
  initDataChannel() {
    console.log('Initiating data channel...');
    this.channel = this.RTCconn.createDataChannel('magnet');
    this.channel.onopen = this.channel.onclose = this.handleSendChannelStatusChange;
  }

  // Caller: begin connection to parent client
  initOffer() {
    console.log('CALLER');
    console.log('Initiating offer...');
    // create offer to parent
    this.RTCconn.createOffer()
      // set local description of caller
      .then(offer => this.RTCconn.setLocalDescription(offer))
      // send offer along to peer
      .then(() => {
        const offer = this.RTCconn.localDescription;
        this.sendBySocket('offer', offer);
      })
      .catch(this.logError);
  }

  // Callee: sets offer as remote description and sends answer
  respondToOffer(callerId, offer) {
    console.log('CALLEE');
    this.RTCconn.setRemoteDescription(offer)
      // create answer to offer
      .then(() => this.RTCconn.createAnswer())
      // set local description of callee
      .then((answer) => this.RTCconn.setLocalDescription(answer))
      // send answer to caller
      .then(() => {
        console.log('Set local description with offer');
        // console.log('Local:', this.RTCconn.localDescription);
        // console.log('Remote:', this.RTCconn.remoteDescription);
        const answer = this.RTCconn.localDescription;
        this.sendBySocket('answer', callerId, answer);
      })
      .catch(this.logError);
  }

  respondToAnswer(answer) {
    this.RTCconn.setRemoteDescription(answer)
      .then(() => {
        console.log('Set remote description with answer');
        // console.log('Local:', this.RTCconn.localDescription);
        // console.log('Remote:', this.RTCconn.remoteDescription);
      })
      .catch(this.logError);
  }

  addIceCandidate(candidate) {
    this.RTCconn.addIceCandidate(candidate)
      .catch(this.logError);
  }

  // WebRTC connection state handler
  connectionStateHandler() {
    console.log('Connection state changed to', conn.connectionState);

    if (conn.connectionState === 'connected') {
      // disconnect socket.io connection
      this.socket.disconnect();
    }
  }

  // Caller: send ICE candidate to callee
  iceCandidateHandler(event) {
    console.log('Sending ICE candidates...');
    if (event.candidate) {
      // send child peer ICE candidate
      this.sendBySocket('candidate', this.peerId, event.candidate);
    }
  }

  // receiver handles request to open data channel
  receiveDataChannel(event) {
    
  }

  handleSendChannelStatusChange(event) {

  }

  // close connections and free up resources
  closeConn() {
    this.RTCconn.close();
    this.RTCconn = null;
    // tell other peer to close connection as well
    sendBySocket('close', peerId);
  }

  // send message on RTC connection
  sendBySocket(event, ...args) {
    this.socket.emit(event, ...args);
  }

  addPeerId(peerId) {
    console.log('Setting peerId:', peerId);
    this.peerId = peerId;
  }

  logError(err) {
    throw err;
  }
}