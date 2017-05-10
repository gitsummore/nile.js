# [nile.js][website]
A tool for scalable peer-to-peer video streaming using WebTorrent.

## Why WebTorrent?
By using the collective power of WebTorrent, video streams get progressively stronger as more peers contribute to a torrent. With torrent, it is also possible for users to access previous parts of a stream unlike traditional WebRTC video streaming.

## About
### Broadcaster
This is the client component that records video from a device's camera, saving it to progressive torrent files, and sending the torrent's magnet link out to the viewing clients.
### Server
This is the plug-and-play middleware that receives the torrent link from the broadcasting client and sets up the proper Socket.io connections for the viewing clients.
### Viewer
This is the client which views what the Broadcaster is recording. It receives a torrent magnet link and renders the video to injected video tags using WebTorrent.

## Usage
### Server
Nile.js utilizes Express middleware and socket.io to receive torrent information, broadcast it to as many clients it can comfortably handle who will then send it out to the rest of the clients.

To use it, require nileServer from our package and pass in the Node Server instance you're using. In Express, you can get this instance by calling app.listen:
```
const server = app.listen(8000);
const nileServer = require('nile.js/nileServer')(server);
```

Now add the nile.js middleware w/ app.use:
```
app.use(nileServer);
```
#### /magnet
Broadcaster posts stream's torrent magnet URIs to this endpoint
#### /signal
Receives WebRTC signaling information (e.g. offer, answer, ICE candidates) to send to connecting peer.
### Client
Two components: Viewer and Broadcaster
#### Viewer
2 params: HTML query selector and array of optional TURN servers for WebRTC signaling
#### Broadcaster
4 params:
recordInterval - the Interval that the webcam recording should seed each segment of the video
videoNodeIDForPlayback - The id of the video node in the html where the broadcaster can see their own recording
startStreamID - The id of the button node that BEGINS the recording/live streaming
stopStreamID - The id of the button node that ENDS the recording/live streamingÏ

[website]: http://www.nilejs.com
