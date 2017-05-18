import Message from './message';

// set peer connection to Mozilla PeerConnection if in Firefox
RTCPeerConnection = RTCPeerConnection || mozRTCPeerConnection;


/**
 * Wrapper class for RTC connection between parent and child viewers
 */
class ViewerConnection {
  constructor(
    socket,
    isRoot,
    messageHandlers = {},
    addedIceServers = [],
    iceDisconnHandler
  ) {
    // ref to Viewer's socket connection
    this.socket = socket;
    // indicates whether this node is the root connecting to the server
    this.isRoot = isRoot;
    // event handlers for DataChannel messages
    this.messageHandlers = messageHandlers;
    // function provided by Viewer class to run when ICE disconnects
    this.iceDisconnHandler = iceDisconnHandler;

    // reserved variables
    // RTC DataChannel
    this.channel;
    // Peer's socket ID
    this.peerId;

    // set up wrapped WebRTCConnection
    this.RTCconn = new RTCPeerConnection({
      iceServers: [
        // Default STUN servers
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        // user-provided TURN servers go here
        ...addedIceServers
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
    this.RTCconn.onconnectionstatechange = this._connectionStateHandler.bind(this);

    // Handle ICE connection state changes
    this.RTCconn.oniceconnectionstatechange = this._iceConnectionStateHandler.bind(this);

    // when ICE candidates need to be sent to callee
    this.RTCconn.onicecandidate = this._iceCandidateHandler.bind(this);

    // Handle requests to open data channel
    this.RTCconn.ondatachannel = this._receiveDataChannel.bind(this);

    // Signaling state changes - uncomment to get signaling state logs
    // this.RTCconn.onsignalingstatechange = this._signalingStateHandler.bind(this);
  }

  // create data channel
  initDataChannel() {
    // console.log('Initiating data channel...');
    this.channel = this.RTCconn.createDataChannel('magnet');
    this._setupDataChannel();
  }

  // send messages thru connection's RTC data channel
  sendMessage(type, msg) {
    if (this.channel && this.channel.readyState === 'open') {
      const messageJSON = JSON.stringify(new Message(type, msg));
      this.channel.send(messageJSON);
    }
  }

  // add event listeners to RTCDataChannel
  _setupDataChannel() {
    // handle open/close events
    this.channel.onopen = this.channel.onclose = this._handleChannelStatusChange.bind(this);

    // handle messages
    this.channel.onmessage = this._receiveMessage.bind(this);
  }

  // Caller: begin connection to parent client
  initOffer() {

    console.log('CALLER');
    // console.log('Initiating offer...');
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
        const answer = this.RTCconn.localDescription;
        this.sendBySocket('answer', callerId, answer);
      })
      .catch(this.logError);
  }

  respondToAnswer(answer) {
    this.RTCconn.setRemoteDescription(answer)
      .then(() => {
        console.log('Set remote description with answer');
      })
      .catch(this.logError);
  }

  addIceCandidate(candidate) {
    this.RTCconn.addIceCandidate(candidate)
      .catch(this.logError);
  }

  setIsRoot(isRoot) {
    this.isRoot = isRoot;
  }

  setPeerId(peerId) {
    // console.log('Setting peerId:', peerId);
    this.peerId = peerId;
  }

  // Caller: send ICE candidate to callee
  _iceCandidateHandler(event) {
    // console.log('Sending ICE candidates...');
    if (event.candidate) {
      // send child peer ICE candidate if has peerId
      this.peerId && this.sendBySocket('candidate', this.peerId, event.candidate);
    }
  }

  // WebRTC connection state handler
  _connectionStateHandler() {
    console.log('Connection state changed to', conn.connectionState);

    // if (conn.connectionState === 'connected') {

    // }
  }

  // receiver handles request to open data channel
  _receiveDataChannel(event) {
    console.log('Receiving data channel...');
    // store received channel
    this.channel = event.channel;
    this._setupDataChannel();
  }

  // DataChannel status handler
  _handleChannelStatusChange(event) {
    if (!this.channel) return;

    const state = this.channel.readyState;

    console.log('Channel status:', state);

    // tell next client to reconnect w/ this client's parent, depending on isRoot
    this.sendMessage(state);

    if (state === 'open') {
      // disconnect socket.io connection if not the root client
      if (!this.isRoot && this.socket.connected) {

        console.log('RTC connection succeeded! Disconnecting socket...');
        this.socket.disconnect();
      }
    }
    // tell neighboring clients to reconnect before this client disconnects
    else if (state === 'closing') {

    }
  }

  // Add an event handler for a certain type of DataChannel Message
  addMessageHandler(type, handler) {
    if (typeof handler !== 'function') throw new Error('Handler must be a function');
    this.messageHandlers[type] = handler;
  }

  // DataChannel message handler
  _receiveMessage(event) {
    const msg = JSON.parse(event.data);

    const { type, message } = msg;

    console.log(`Received message of type '${type}'`);
    const handler = this.messageHandlers[type];

    // call handler if exists
    handler && handler(message);
  }

  // asynchronously closes RTC Peer Connection
  closeRTC() {
    // close DataChannel
    this.channel.close();
    // close RTC Peer Connection
    this.RTCconn.close();
  }

  // ICE connection handler
  _iceConnectionStateHandler(event) {
    const connState = this.RTCconn.iceConnectionState;

    console.log('ICE Connection State:', connState);

    if (connState === 'disconnected') {
      this.iceDisconnHandler && this.iceDisconnHandler();
    }
  }

  // Signaling state handler
  _signalingStateHandler(event) {
    
    console.log('Signaling State:', this.RTCconn.signalingState);
  }

  // send message by socket.io
  sendBySocket(event, ...args) {
    this.socket.emit(event, ...args);
  }

  logError(err) {
    console.error(err);
  }
}

export default ViewerConnection;