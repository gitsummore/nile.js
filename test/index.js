const request = require('supertest')('http://localhost:8000');
const mocha = require('mocha')
const chai = require('chai')
const should = chai.should();
const io = require('socket.io-client');
const url = 'http://localhost:8000/viewer/viewer.html';


//nileServer.js testing
describe('Server route testing', () => {
  describe('POST /magnet', () => {
    it('should return magnet uri as a string', done => {
      request
        .post('/magnet')
        .send({
          magnetURI: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
        })
        .expect(200, done);
    });
  });
});


// Tests for socket connections
describe('Tests for broadcaster and viewer', function () {

  describe('Clicking on broadcast should start broadcasting video', () => {

  });

  describe('Clicking on view should start playing broadcasted video', () => {

  });
});

