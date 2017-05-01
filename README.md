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
Tune in next week for the exciting conclusion of "Usage"!

## NOTE:
Inside socket.io/engine.io, set "ws" version to ^1.1.4 if encounter "unmask of undefined" error server-side

[website]: http://www.nilejs.com
