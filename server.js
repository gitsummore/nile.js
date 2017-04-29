const express = require('express');
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const createTorrent = require('create-torrent');

const WebTorrent = require('webtorrent');

let client = new WebTorrent(); 
let client2;

const socketController = require('./socketController');

const app = express();

const port = parseInt(process.env.PORT, 10) || 8000;

// get Node Server instance when calling app.listen
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});

// Pass server instance to use socket controller
socketController(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'client')));
// app.use(express.static(path.join(__dirname, 'torrents')));

// Routes
app.post('/uploadfile', (req, res) => {
  // parse files in request
  const form = new formidable.IncomingForm();

  // set dirs for generated files
  const uploadDir = form.uploadDir = 'uploads';
  const torrentDir = 'torrents';

  // create uploads and torrent dirs if doesn't exist
  makeDir(uploadDir);
  makeDir(torrentDir);

  // change data to webm
  form.on('fileBegin', (name, file) => {
    // save to webm file
    file.path += '.webm';
  });

  // put file into torrent
  form.on('file', function makeTorrent(name, file) {

    // place to save generated torrent files
    const torrentPath = path.resolve(__dirname, torrentDir);

    // client.destroy(function() {
    //   console.log('client destroyed')
    // })

    // client = new WebTorrent();

    // client.seed(file.path, (torrent) => {
    //   console.log('MagnetURI', torrent.magnetURI);
    // })

    createTorrent(file.path, (err, torrent) => {
      if (err) throw err;
      fs.writeFile(
        `${file.path}.torrent`,
        torrent,
        (err) => {
          if (err) throw err;
        }
      );
    });

  });

  // handle errors
  form.on('error', (error) => { throw error });

  // // parse form data
  // form.parse(req);

  res.sendStatus(200);
});

// make directory if it doesn't exist already
function makeDir(dir) {
  fs.mkdir(dir, (err) => {
    // skips pre-existing dir error
    if (err && err.code !== 'EEXIST') {
      throw err;
    }
  });
}