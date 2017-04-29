function addText(msg) {
  const pNode = document.createElement('p');
  pNode.innerText = msg;
  document.body.appendChild(pNode);
}

// torrentId will change whenever the viewer is notified of the new magnet via websockets or WebRTC
// this will also trigger event to check if isPlay1Playing true or false
// and then it will either run the first download or the second download, torrent ID must be different

// initiate new torrent connection
const client = new WebTorrent()

// grab DOM elements where the torrent video will be rendered too
const $play1 = document.getElementById('player2');
const $play2 = document.getElementById('player2');
let file1;
let file2;
let isPlay1Playing = false;

// Function for downloading the torrent
function startDownloadingFirst(magnetURI) {

  isPlay1Playing = true;

  client.add(magnetURI, function (torrent) {

    /* Look for the file that ends in .webm and render it, in the future we can
     * add additional file types for scaling. E.g other video formats or even VR!
     */
    file1 = torrent.files.find(function (file) {
      return file.name.endsWith('.webm')
    })
    // Stream the file in the browser
    file1.renderTo('video#player1')
  })

  // listen to when video one ends, immediately play the other video
  $play1.onended = function (e) {
    $play2.play();

    $play2.removeAttribute('hidden', false);

    $play1.setAttribute('hidden', true);
  };
}

// Function for downloading the second torrent
function startDownloadingSecond(magnetURI) {
  isPlay1Playing = false;

  client.add(magnetURI, function (torrent) {

    /* Look for the file that ends in .webm and render it, in the future we can
     * add additional file types for scaling. E.g other video formats or even VR!
     */
    file2 = torrent.files.find(function (file) {
      return file.name.endsWith('.webm')
    })

    // Stream the second file, but currently invisible and not playing
    file2.renderTo('video#player2', { autoplay: false })
  })

  // listen to when video one ends, immediately play the other video
  $play2.onended = function (e) {
    $play1.play();

    $play1.removeAttribute('hidden', false);

    $play2.setAttribute('hidden', true);
  };
}