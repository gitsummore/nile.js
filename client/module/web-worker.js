const WebTorrent = require('./webtorrent.min.js');

onmessage = function(file) {	
	// console.log('file', file.data);
	// console.log('working?')
	let broadcaster1 = new WebTorrent();
		// console.log('working?', broadcaster1)
	// convert file to torrent and begin to seed
	broadcaster1.seed(file.data, function (torrent) {
		// console.log(torrent.magnetURI);
		self.postMessage(torrent.magnetURI);
	});
};
