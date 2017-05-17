# [nile.js][website]
A tool for scalable peer-to-peer video streaming using WebTorrent.

## Why WebTorrent?
By using the collective power of WebTorrent, video streams get progressively stronger as more peers contribute to a torrent. With torrents, it is also possible for users to access previous parts of a stream unlike traditional WebRTC video streaming.

## About
### Server
This is the plug-and-play middleware that receives the torrent link from the broadcasting client and sets up the proper Socket.io connections for the viewing clients.

### Broadcaster
This is the client component that records video from a device's camera, saving it to generated torrent files, and sending those torrents' magnet link out to the viewing clients.

### Viewer
This is the client which views what the Broadcaster is recording. It receives a torrent magnet link and renders the video from that torrent to an injected video tag using WebTorrent.

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
app.use('/', nileServer);
```

Note that this middleware will use a "magnet" route to accept POST requests with the magnet link from the Broadcaster.

### Client

#### Broadcaster
[Unpkg Source](https://unpkg.com/nile.js@1.0.0/client/dist/nile.Broadcaster.min.js)

__4 parameters__:
1. *recordInterval* - The Interval that the webcam recording should seed each segment of the video (ms)
2. *videoNodeIDForPlayback* - The id of the video node in the html where the broadcaster can see their own recording
3. *startStreamID* - The id of the button node that BEGINS the recording/live streaming
4. *stopStreamID* - The id of the button node that ENDS the recording/live streaming


The Broadcaster object is used to stream video to a torrent and send the torrent link to the server and then to the network of viewers.

Because torrents are immutable, we approximate streaming with torrents by setting a *recordInterval*, in milliseconds. This sets how long each clip will be before being sent via torrent. From our experience, we recommend an interval 6000-10000 (6-10 seconds).

Next, pass in the ID of the video tag you'd like to view your recording playback from as well as button IDs for the starting and stopping the stream.

__Example__:
```
const broadcaster = new Broadcaster(8000, 'video', 'button-play-gum', 'button-stop-gum');
```

#### Viewer
[Unpkg Source](https://unpkg.com/nile.js@1.0.0/client/dist/nile.Viewer.min.js)

__2 parameters__:
1. *ID_of_NodeToRenderVideo* - ID of DOM element to render live feed to
2. *addedIceServers* - Array of extra WebRTC ICE servers, based on [this interface laid out by W3C](https://w3c.github.io/webrtc-pc/#dom-rtciceserver)

The Viewer object receives torrent links from Socket.io or RTCDataChannel connections and progressively renders the videos from the torrents to the supplied ID, *ID_of_NodeToRenderVideo*.

__Example__:
```
const viewer = new Viewer('videos');
```

The Viewer maintains two WebRTC connections, one to a parent (client closest to server) and a child client (farther from server). These two connections create a chain of clients that propagate server-sent torrent information down to subsequent viewers down the chain.

In the event of a client disconnecting, the disconnecting Viewer will let its immediate child client know and tell it to reconnect to its parent. This maintains network integrity and ensures that the stream will still reach every client in that chain.

[website]: http://www.nilejs.com
