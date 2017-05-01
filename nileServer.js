const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser')
// const formidable = require('formidable');
// const createTorrent = require('create-torrent');
// const WebTorrent = require('webtorrent');
const socketController = require('./socketController');

/**
 * receives Node HTTP Server instance
 * used as such:
 *   app.post('uploadfile', nileServer(server));
 */
module.exports = function nileServer(server) {
  // Pass server instance to use socket controller
  const socket = new socketController(server);
  // returns Express middleware function to apply to a developer-provided POST endpoint
  return function emitMagnetUri(req, res, next) {
    socket.emitNewMagnet(req.body.magnetURI);
    res.sendStatus(200);
  }
}