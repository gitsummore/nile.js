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
describe('Socket Testing Suite', function () {

  let options = {
    transports: ['websocket'],
    'force new connection': true
  };

  let client1;
  let client2;

  beforeEach(function (done) {
    // before runnning tests, connect first client
    client1 = io.connect(url, options); 

  });

  describe('Testing Socket Controller', () => {

    xit('New client should send offer to parent client', (done) => {
      // connect second client to initiate offer
      // once connected, send offer to client1
      // disconnect client2
    });

    xit('Clients should exchange offer and answer', (done) => {
      // connect client2
      // client2 emits offer
      // client1 should receive offer
      // on receiving offer, client1 should emit answer
      // client2 should receive answer
    });

    xit('Should send and receive new ICE candidates', (done) => {

    });

    xit('Should properly remove socket from this.sockets', (done) => {

    });
  });

  afterEach(function (done) {
    client1.disconnect();
    client2.disconnect();
    done();
  });
});

