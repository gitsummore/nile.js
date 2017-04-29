// torrentId will change whenever the viewer is notified of the new magnet via websockets or WebRTC
let torrentId = 'magnet:?xt=urn:btih:999f99f93eeaaedbf4ab9ac09ca2a9d39692779d&dn=test.webm&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com'

// initiate new torrent connection
const client = new WebTorrent()

// grab DOM elements where the torrent video will be rendered too
const $play1 = document.getElementById('player');
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
      return file.name.endsWith('.webm')
    })

    // Stream the file in the browser
    file1.renderTo('video#player')
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