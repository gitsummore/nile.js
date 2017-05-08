const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser')
// const formidable = require('formidable');
// const createTorrent = require('create-torrent');
// const WebTorrent = require('webtorrent');
const socketController = require('./socketController');

// max # of sockets to keep open
const socketLimit = 1;

// takes in Node Server instance and returns Express Router
module.exports = function nileServer(server) {
  // Pass server instance to use socket controller
  const socket = new socketController(server, socketLimit);

  // create nile.js mini-app through express Router
  const nileServer = express.Router();

  // endpoint for receiving magnet URI from Broadcaster
  nileServer.post('/magnet', (req, res, next) => {
    socket.emitNewMagnet(req.body.magnetURI);
    res.sendStatus(200);
  });
  return nileServer;
}