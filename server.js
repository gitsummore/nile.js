const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
// const formidable = require('formidable');
// const createTorrent = require('create-torrent');
// const WebTorrent = require('webtorrent');
const socketController = require('./socketController');
const nileServer = require('./nileServer');

const app = express();

// parse application/json 
app.use(bodyParser.json())

const port = parseInt(process.env.PORT, 10) || 8000;

// get Node Server instance when calling app.listen
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});

// Serve static files
// app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'client')));

// Routes
<<<<<<< HEAD
app.post('/uploadfile', nileServer(server));
=======
const sendMagnetURI = nileServer(server);
app.post('/uploadfile', sendMagnetURI);
>>>>>>> af3448e30c985ffcc86c3d391397a96366a4752e
