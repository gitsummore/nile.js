(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("Broadcaster", [], factory);
	else if(typeof exports === 'object')
		exports["Broadcaster"] = factory();
	else
		root["Broadcaster"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "dist";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 29);
/******/ })
/************************************************************************/
/******/ ({

/***/ 29:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import * as WebTorrent from 'webtorrent';
// import * as MediaStreamRecorder from 'msr';
// const WebTorrent = require('./webtorrent.min.js');
// const MediaStreamRecorder = require('msr');

var Broadcaster = function () {
  function Broadcaster(recordInterval, // the Interval that the webcam recording should seed each segment of the video
  videoNodeIDForPlayback, // The id of the video node in the html where the broadcaster can see their own recording
  startStreamID, // The id of the button node that BEGINS the recording/live streaming
  stopStreamID // The id of the button node that ENDS the recording/live streaming
  ) {
    _classCallCheck(this, Broadcaster);

    this.recordInterval = recordInterval;
    this.videoNodeIDForPlayback = videoNodeIDForPlayback;
    this.startStreamID = startStreamID;
    this.stopStreamID = stopStreamID;
  }

  _createClass(Broadcaster, [{
    key: 'startStream',
    value: function startStream() {
      // interval to record video at (in ms)
      var _recordInterval = this.recordInterval;
      var sendMagnetToServer = this.sendMagnetToServer;
      console.log(sendMagnetToServer);
      var videoStream = null;
      var video = document.getElementById('' + this.videoNodeIDForPlayback);

      // will hold
      var videoFile = void 0;

      // allows you to see yourself while recording
      var createSrc = window.URL ? window.URL.createObjectURL : function (stream) {
        return stream;
      };

      // creates a new instance of torrent so that user is able to seed the video/webm file
      var broadcaster1 = new WebTorrent();
      var broadcaster2 = new WebTorrent();
      var broadcaster3 = new WebTorrent();
      var magnetURI1 = void 0;
      var magnetURI2 = void 0;
      var magnetURI3 = void 0;
      var _wasLastBroadcaster_1 = false;
      var _wasLastBroadcaster_2 = false;
      var worker1 = undefined;
      var worker2 = undefined;
      var worker3 = undefined;

      // when pressing the play button, start recording
      document.getElementById('' + this.startStreamID).addEventListener('click', function () {
        var mediaConstraints = {
          audio: true,
          video: true
        };

        // begin using the webcam
        navigator.getUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

        function onMediaSuccess(stream) {
          var mediaRecorder = new MediaStreamRecorder(stream);
          // record a blob every _recordInterval amount of time
          mediaRecorder.start(_recordInterval);
          mediaRecorder.mimeType = 'video/webm';

          // every _recordInterval, make a new torrent file and start seeding it
          mediaRecorder.ondataavailable = function (blob) {

            var file = new File([blob], 'nilejs.webm', {
              type: 'video/webm'
            });

            // /* So that there is no delay in streaming between torrents, this section is going to 
            //  * make instances of webtorrent and then alternate the seeding between the two
            //  * once each seed is done, destroy the seed and initiate the next one
            // */
            if (_wasLastBroadcaster_1 && _wasLastBroadcaster_2) {
              // if (magnetURI3) {
              //   broadcaster3.destroy(function () {
              //     console.log('broadcaster3 removed')
              //   });
              // }
              // console.log('worker1 from 3', worker1)
              // worker1.terminate();
              // // check to see if browser supports web-workers
              if (worker1) {
                worker1.terminate();
                worker1 = undefined;
              }

              if (window.Worker) {
                // passes a script as input
                worker3 = new Worker('./../dist/nile.Webworker.js');

                worker3.postMessage(file);

                worker3.onmessage = function (magnetURI) {
                  console.log('b1 seeding', magnetURI.data);
                  sendMagnetToServer(magnetURI.data);
                };
              }
              // broadcaster3 = new WebTorrent();

              // // start seeding the new torrent
              // broadcaster3.seed(file, function (torrent) {
              //   magnetURI3 = torrent.magnetURI;
              //   console.log('broadcaster3 is seeding ' + torrent.magnetURI)
              //   sendMagnetToServer(magnetURI3);
              // });

              _wasLastBroadcaster_1 = _wasLastBroadcaster_2 = false;
            } else if (_wasLastBroadcaster_1) {
              // if there is already a seed occuring, destroy it and re-seed
              // if (magnetURI2) {
              //   broadcaster2.destroy(function () {
              //     console.log('broadcaster2 removed')
              //   });
              // }
              if (worker3) {
                worker3.terminate();
                worker3 = undefined;
              }
              // worker3.terminate();

              // if (window.Worker) {
              //   // passes a script as input
              //   worker2 = new Worker('./../dist/nile.Webworker.js')

              //   worker2.postMessage(file);

              //   worker2.onmessage = (magnetURI) => {
              //     console.log('b1 seeding', magnetURI.data)
              //     sendMagnetToServer(magnetURI.data);
              //   }
              // }

              // broadcaster2 = new WebTorrent();

              // // start seeding the new torrent
              // broadcaster2.seed(file, function (torrent) {
              //   magnetURI2 = torrent.magnetURI;
              //   console.log('broadcaster2 is seeding ' + torrent.magnetURI)
              //   sendMagnetToServer(magnetURI2);
              // });

              _wasLastBroadcaster_2 = true;
            } else {
              // if (worker2) {
              //   console.log('worker2 closed')
              //   worker2.terminate();
              // }
              // if (magnetURI1) {
              //   broadcaster1.destroy(function () {
              //     console.log('broadcaster1 removed')
              //   });
              // }
              // console.log(file);
              if (worker2) {
                worker2.terminate();
                worker2 = undefined;
              }

              // checks if browser supports Worker api
              if (window.Worker) {
                // passes a script as input
                worker1 = new Worker('./../dist/nile.Webworker.js');

                worker1.postMessage(file);

                worker1.onmessage = function (magnetURI) {
                  console.log('b1 seeding', magnetURI.data);
                  sendMagnetToServer(magnetURI.data);
                };
              }

              // console.log('worker 1 from 1', worker1)

              // broadcaster1 = new WebTorrent();
              // broadcaster1.seed(file, function (torrent) {
              //   magnetURI1 = torrent.magnetURI;
              //   console.log('broadcaster1 is seeding ', torrent.magnetURI)
              //   sendMagnetToServer(magnetURI1);
              // });

              _wasLastBroadcaster_1 = true;
            }
          };

          // retrieve the devices that are being used to record
          videoStream = stream.getTracks();

          // // play back the recording to the broadcaster
          video.src = createSrc(stream);
          video.play();
        }

        function onMediaError(e) {
          console.error('media error', e);
        }
      });

      // when the user pauses the video, stop the stream and send data to server
      document.getElementById('' + this.stopStreamID).addEventListener('click', function () {
        // Pause the video
        video.pause();

        // stops the the audio and video from recording
        videoStream.forEach(function (stream) {
          return stream.stop();
        });
      });
    }

    // send magnet to server

  }, {
    key: 'sendMagnetToServer',
    value: function sendMagnetToServer(magnetURI) {
      // send to server
      var xhr = new XMLHttpRequest();

      xhr.open('POST', '/uploadfile', true);

      xhr.onreadystatechange = function () {
        if (this.status === 200) {
          console.log('Magnet Emitted');
        } else {
          console.log('Emit Failed');
        }
      };

      xhr.setRequestHeader("Content-type", "application/json");
      xhr.send(JSON.stringify({ 'magnetURI': magnetURI }));
    }
  }]);

  return Broadcaster;
}();

// module.exports = Broadcaster

/***/ })

/******/ });
});