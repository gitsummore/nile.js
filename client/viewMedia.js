// io object exposed from injected socket.io.js

const socket = io.connect();

socket.on('infohash', console.log);