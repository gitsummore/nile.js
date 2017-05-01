// io object exposed from injected socket.io.js
const socket = io.connect();

socket.on('full', (msg, disconnect) => {
  addText(msg);

  if (disconnect) {
    console.log('Socket disconnecting');
    socket.disconnect();
  }
});

socket.on('magnetURI', (magnetURI) => {
  // begin downloading the torrents and render them to page, alternate between three torrents
  if (isPlay1Playing && isPlay2Playing) {
    startDownloadingThird(magnetURI);
  } else if (isPlay1Playing) {
    startDownloadingSecond(magnetURI);
  } else {
    startDownloadingFirst(magnetURI);
  }
})
