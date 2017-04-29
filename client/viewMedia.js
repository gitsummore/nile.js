// io object exposed from injected socket.io.js

const socket = io.connect();

socket.on('infohash', (msg, disconnect) => {
  addText(msg);

  if (disconnect) {
    console.log('Socket disconnecting');
    socket.disconnect();
  }
});

function addText(msg) {
  const pNode = document.createElement('p');
  pNode.innerText = msg;
  document.body.appendChild(pNode);
}