<<<<<<< HEAD
const broadcaster = new Broadcaster(4000, 'video', 'button-play-gum', 'button-stop-gum');

broadcaster.startStream();

// // import WebTorrent from 'webtorrent';
// // import MediaStreamRecorder from 'mediastreamrecorder'

// // interval to record video at (in ms)
// const _recordInterval = 5000;

// let videoStream = null;
// let video = document.getElementById("video");

// // will hold
// let videoFile;

// // allows you to see yourself while recording
// let createSrc = (window.URL) ? window.URL.createObjectURL : function (stream) { return stream };

// // creates a new instance of torrent so that user is able to seed the video/webm file
// let broadcaster1 = new WebTorrent();
// let broadcaster2 = new WebTorrent();
// let broadcaster3 = new WebTorrent();
// let magnetURI1;
// let magnetURI2;
// let magnetURI3;
// let _wasLastBroadcaster_1 = false;
// let _wasLastBroadcaster_2 = false;

// // when pressing the play button, start recording
// document.getElementById('button-play-gum').addEventListener('click', function () {
//   var mediaConstraints = {
//     audio: true,
//     video: true
//   };

//   // begin using the webcam
//   navigator.getUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

//   function onMediaSuccess(stream) {
//     let mediaRecorder = new MediaStreamRecorder(stream);
//     // record a blob every _recordInterval amount of time
//     mediaRecorder.start(_recordInterval);
//     mediaRecorder.mimeType = 'video/webm';

//     // every _recordInterval, make a new torrent file and start seeding it
//     mediaRecorder.ondataavailable = function (blob) {

//       let file = new File([blob], 'test.webm', {
//         type: 'video/webm'
//       });

//       // /* So that there is no delay in streaming between torrents, this section is going to 
//       //  * make instances of webtorrent and then alternate the seeding between the two
//       //  * once each seed is done, destroy the seed and initiate the next one
//       // */
//       if (_wasLastBroadcaster_1 && _wasLastBroadcaster_2) {
//         if (magnetURI3) {
//           broadcaster3.destroy(function () {
//             console.log('broadcaster3 removed')
//           });
//         }

//         broadcaster3 = new WebTorrent();
=======
import WebTorrent from 'webtorrent';
import MediaStreamRecorder from 'mediastreamrecorder'

// interval to record video at (in ms)
const _recordInterval = 5000;

let videoStream = null;
let video = document.getElementById("video");

// will hold
let videoFile;

// allows you to see yourself while recording
let createSrc = (window.URL) ? window.URL.createObjectURL : function (stream) { return stream };

// creates a new instance of torrent so that user is able to seed the video/webm file
let broadcaster1 = new WebTorrent();
let broadcaster2 = new WebTorrent();
let broadcaster3 = new WebTorrent();
let magnetURI1;
let magnetURI2;
let magnetURI3;
let _wasLastBroadcaster_1 = false;
let _wasLastBroadcaster_2 = false;

// when pressing the play button, start recording
document.getElementById('button-play-gum').addEventListener('click', function () {
  var mediaConstraints = {
    audio: true,
    video: true
  };

  // begin using the webcam
  navigator.getUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

  function onMediaSuccess(stream) {
    let mediaRecorder = new MediaStreamRecorder(stream);
    // record a blob every _recordInterval amount of time
    mediaRecorder.start(_recordInterval);
    mediaRecorder.mimeType = 'video/webm';

    // every _recordInterval, make a new torrent file and start seeding it
    mediaRecorder.ondataavailable = function (blob) {

      let file = new File([blob], 'test.webm', {
        type: 'video/webm'
      });

      // /* So that there is no delay in streaming between torrents, this section is going to 
      //  * make instances of webtorrent and then alternate the seeding between the two
      //  * once each seed is done, destroy the seed and initiate the next one
      // */
      if (_wasLastBroadcaster_1 && _wasLastBroadcaster_2) {
        if (magnetURI3) {
          broadcaster3.destroy(function () {
            console.log('broadcaster3 removed')
          });
        }

        broadcaster3 = new WebTorrent();
>>>>>>> 5b764ab5fe7b70861db335d691d196195ef63674
        
//         // start seeding the new torrent
//         broadcaster3.seed(file, function (torrent) {
//           magnetURI3 = torrent.magnetURI;
//           console.log('broadcaster3 is seeding ' + torrent.magnetURI)
//           sendMagnetToServer(magnetURI3);
//         });

//         _wasLastBroadcaster_1 = _wasLastBroadcaster_2 = false;

//       } else if (_wasLastBroadcaster_1) {
//         // if there is already a seed occuring, destroy it and re-seed
//         if (magnetURI2) {
//           broadcaster2.destroy(function () {
//             console.log('broadcaster2 removed')
//           });
//         }

//         broadcaster2 = new WebTorrent();

//         // start seeding the new torrent
//         broadcaster2.seed(file, function (torrent) {
//           magnetURI2 = torrent.magnetURI;
//           console.log('broadcaster2 is seeding ' + torrent.magnetURI)
//           sendMagnetToServer(magnetURI2);
//         });

//         _wasLastBroadcaster_2 = true;

//       } else {

//         if (magnetURI1) {
//           broadcaster1.destroy(function () {
//             console.log('broadcaster1 removed')
//           });
//         }

//         broadcaster1 = new WebTorrent();

//         broadcaster1.seed(file, function (torrent) {
//           magnetURI1 = torrent.magnetURI;
//           console.log('broadcaster1 is seeding ' + torrent.magnetURI)
//           sendMagnetToServer(magnetURI1);
//         });

//         _wasLastBroadcaster_1 = true;
//       }
//     };

//     // retrieve the devices that are being used to record
//     videoStream = stream.getTracks();

//     // // play back the recording to the broadcaster
//     video.src = createSrc(stream);
//     video.play();
//   }

//   function onMediaError(e) {
//     console.error('media error', e);
//   }
// })

// // when the user pauses the video, stop the stream and send data to server
// document.getElementById('button-stop-gum').addEventListener('click', function () {
//   // Pause the video
//   video.pause();

//   // stops the the audio and video from recording
//   videoStream.forEach((stream) => stream.stop());
// });

// // sends magnet to server
// function sendMagnetToServer(magnetURI) {
//   // send to server
//   let xhr = new XMLHttpRequest();

//   xhr.open('POST', '/uploadfile', true);

//   xhr.onreadystatechange = function () {
//     if (this.status === 200) {
//       console.log('Magnet Emitted')
//     } else {
//       console.log('Emit Failed')
//     }
//   }
//   console.log('testing', magnetURI);

//   xhr.setRequestHeader("Content-type", "application/json");

//   xhr.send(JSON.stringify({ 'magnetURI': magnetURI }));
// }

