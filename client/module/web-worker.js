const WebTorrent = require('./webtorrent.min.js');

onmessage = function(file) {	

	let broadcaster1 = new WebTorrent();

	broadcaster1.seed(file.data, function (torrent) {
		const magnet = torrent.magnetURI;
		self.postMessage(magnet);
	});
};
