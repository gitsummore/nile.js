// torrentId will change whenever the viewer is notified of the new magnet via websockets or WebRTC
// this will also trigger event to check if isPlay1Playing true or false
// and then it will either run the first download or the second download, torrent ID must be different
let torrentId = 'https://webtorrent.io/torrents/sintel.torrent'

// initiate new torrent connection
const client = new WebTorrent()

// grab DOM elements where the torrent video will be rendered too
const $play1 = document.getElementById('player2');
const $play2 = document.getElementById('player2');
let file1;
let file2;
let isPlay1Playing = false;

// begin downloading the torrents and render them to page, alternate between two torrents
if (isPlay1Playing) {
  startDownloadingSecond(torrentId);
} else {
  startDownloadingFirst(torrentId);
}

// Function for downloading the torrent
function startDownloadingFirst(magnetURI) {

  isPlay1Playing = true;

  client.add(torrentId, function (torrent) {

    /* Look for the file that ends in .webm and render it, in the future we can
     * add additional file types for scaling. E.g other video formats or even VR!
     */
    file1 = torrent.files.find(function (file) {
      return file.name.endsWith('.mp4')
    })
    console.log('playr')
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

  client.add(torrentId, function (torrent) {

    /* Look for the file that ends in .webm and render it, in the future we can
     * add additional file types for scaling. E.g other video formats or even VR!
     */
    file2 = torrent.files.find(function (file) {
      return file.name.endsWith('.mp4')
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