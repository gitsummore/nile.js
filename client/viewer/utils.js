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
const $play3 = document.getElementById('player3');
let file1;
let file2;
let file3;
let isPlay1Playing = false;
let isPlay2Playing = false;
let firstIteration = 1;

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
    // if (firstIteration === 1) {
    //   window.setTimeout(() => {file1.renderTo('video#player1')}, 10000);
    //   firstIteration += 1;
    // } else {
    file1.renderTo('video#player1')
    // }
  })
}

// Function for downloading the second torrent
function startDownloadingSecond(magnetURI) {
  isPlay2Playing = true;

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

}

function startDownloadingThird(magnetURI) {
  isPlay1Playing = false;
  isPlay2Playing = false;

  client.add(magnetURI, function (torrent) {

    /* Look for the file that ends in .webm and render it, in the future we can
     * add additional file types for scaling. E.g other video formats or even VR!
     */
    file3 = torrent.files.find(function (file) {
      return file.name.endsWith('.webm')
    })

    // Stream the second file, but currently invisible and not playing
    file3.renderTo('video#player3', { autoplay: false })
  })

}

// listen to when video 1 ends, immediately play the other video
$play1.onended = function (e) {
  $play2.play();
  console.log('am i working?')
  $play2.removeAttribute('hidden');

  $play1.setAttribute('hidden', true);
};

// listen to when video 2 ends, immediately play the other video
$play2.onended = function (e) {
  $play3.play();

  $play3.removeAttribute('hidden');

  $play2.setAttribute('hidden', true);
};

// listen to when video 3 ends, immediately play the other video
$play2.onended = function (e) {
  $play1.play();

  $play1.removeAttribute('hidden');

  $play3.setAttribute('hidden', true);
}