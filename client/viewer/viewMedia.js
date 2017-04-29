// io object exposed from injected socket.io.js
const socket = io.connect();

socket.on('infohash', (msg, disconnect) => {
  addText(msg);

  // msg is the torrentID
  // begin downloading the torrents and render them to page, alternate between two torrents
  if (isPlay1Playing) {
    startDownloadingSecond(msg);
  } else {
    startDownloadingFirst(msg);
  }

  if (disconnect) {
    console.log('Socket disconnecting');
    socket.disconnect();
  }
});