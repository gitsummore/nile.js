const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser')
// const formidable = require('formidable');
// const createTorrent = require('create-torrent');
// const WebTorrent = require('webtorrent');
const socketController = require('./socketController');

// takes in Node Server instance and returns Express Router
module.exports = function nileServer(server) {
  // Pass server instance to use socket controller
  const socket = new socketController(server);

  // create nile.js mini-app through express Router
  const nileServer = express.Router();

  // TODO: change '/uploadfile' to '/magneturi' here and in broadcaster files
  nileServer.post('/magnet', (req, res, next) => {
    socket.emitNewMagnet(req.body.magnetURI);
    res.sendStatus(200);
  });

  // server receives WebRTC SDP (info necessary to connecet) from new client
  nileServer.post('/signal', (req, res, next) => {
    
  });

  return nileServer;
}