const request = require('supertest')('http://localhost:8000');
const mocha = require('mocha')
const chai = require('chai')
const should = chai.should();
const io = require('socket.io-client');

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



describe('Socket Testing Suite', function () {

  // Socket controller testing
  let options = {
    transports: ['websocket'],
    'force new connection': true
  };

  let socket;

  beforeEach(function (done) {
    // Setup
    socket = io.connect('/', {
      'reconnection delay': 0
      , 'reopen delay': 0
      , 'force new connection': true
    });
    socket.on('connect', function () {
      console.log('worked...');
      done();
    });
    socket.on('disconnect', function () {
      console.log('disconnected...');
    })
  });

  afterEach(function (done) {
    // Cleanup
    if (socket.connected) {
      console.log('disconnecting...');
      socket.disconnect();
    } else {
      // There will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
      console.log('no connection to break...');
    }
    done();
  });

  describe('Testing Socket Controller', () => {
    it('Callee should receive offer from new client', (done) => {

    });

    it('Caller should receive answer from new callee', (done) => {

    });

    it('Should send peers in a WebRTC connection new ICE candidates', (done) => {

    });

    it('Should properly remove socket from this.sockets', (done) => {

    });
  });
});

