// test playing torrent
var client = new WebTorrent();
// torrent magnet (default: Sintel)
var torrentId = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent';

// torrent event
client.on('torrent', (torrent) => {
  console.log('Torrent ready');
});

client.on('error', (err) => {
  if (err) console.log(err);
});

client.add(torrentId, (torrent) => {
  console.log('why');
  // find webm file
  const file = torrent.files.find((file) => {
    file.appendTo('body');
    // return file.name.endsWith('.webm');
  });
  
  // display file in video2 tag
  // file.renderTo('video#video2');
  // file.appendTo('body');
});