const request = require('supertest')('http://localhost:8000');
const mocha = require('mocha')
const chai = require('chai')
const should = chai.should();
const io = require('socket.io-client');
const coldBrew = require('cold-brew');
const { Key, By, until } = require('selenium-webdriver');
const ADDRESS = 'http://localhost:8000';


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
  this.timeout(5000);
  // Socket controller testing
  let options = {
    transports: ['websocket'],
    'force new connection': true
  };

  let socket;
  let client1;
  let client2;

  beforeEach(function (done) {
    // Setup
    client1 = coldBrew.createClient();
    client2 = coldBrew.createClient();

    socket = io.connect('http://localhost:8000', {
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
    });
  });

  describe('Testing Socket Controller', () => {

    it('New client should send offer to client previously connected client', (done) => {
      client1.get(ADDRESS);
      client2.get(ADDRESS);
      console.log(client2);
      client2.waitUntilSendSignaling([
        'offer'
      ]).then((sent) => {
        if (sent) {
          done();
        }
      }).catch((err) => {
        console.log('THIS IS THE ERROR', err);
        done();
      });
    });

    xit('Clients should exchange offer and answer', (done) => {

    });

    xit('Should send and receive new ICE candidates', (done) => {

    });

    xit('Should properly remove socket from this.sockets', (done) => {

    });
  });

  afterEach(function (done) {
    // Cleanup
    client1.quit();
    client2.quit.then(() => done());

    if (socket.connected) {
      console.log('disconnecting...');
      socket.disconnect();
    } else {
      // There will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
      console.log('no connection to break...');
    }
    done();
  });
});

