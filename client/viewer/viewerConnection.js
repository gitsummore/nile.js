// A connection between parent and child viewers
class ViewerConnection {
  constructor() {
    this.conn = new RTCPeerConnection({
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
    this.conn.onconnectionstatechange = this.connectionStateHandler.bind(this);

    // when ICE candidates need to be sent to callee
    this.conn.onicecandidate = this.iceCandidateHandler.bind(this);

    // Handle requests to open data channel
    this.conn.ondatachannel = this.receiveDataChannel.bind(this);
  }
}