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

To use it, require nileServer from our package:
```
const nileServer = require('nile.js/nileServer');
```

Pass in the Node Server instance. In Express, you can get this instance by calling app.listen:
```
const server = app.listen(8000);
const sendMagnetURI = nileServer(server);
```

Now set up a POST endpoint at '/uploadfile' with the newly created middleware function:
```
app.post('/uploadfile', sendMagnetURI);
```
### Client

[website]: http://www.nilejs.com
