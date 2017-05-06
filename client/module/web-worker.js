const WebTorrent = require('./webtorrent.min.js');

onmessage = (file) => {	
	console.log('working?')
	let broadcaster1 = new WebTorrent();
		console.log('working?', broadcaster1)
	// convert file to torrent and begin to seed
	broadcaster1.seed(file.data, function (torrent) {
		console.log('working??????')
		console.log('broadcaster3 is seeding ' + torrent.magnetURI)
		self.postMessage(torrent.magnetURI);
	});
}
