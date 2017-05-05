// set peer connection to Mozilla PeerConnection if in Firefox
RTCPeerConnection = RTCPeerConnection || mozRTCPeerConnection;

// Wrapper class for RTC connection between parent and child viewers
class ViewerConnection extends RTCPeerConnection {
  constructor(socket) {
    this.socket = socket;
    // reserved variables
    // RTC DataChannel
    this.dataChannel;
    // Peer's socket ID
    this.peerId;
  }

  addPeerId(peerId) {
    this.peerId = peerId;
  }
}