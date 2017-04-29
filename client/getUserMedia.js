// import WebTorrent from 'webtorrent';
// import MediaStreamRecorder from 'mediastreamrecorder'

// interval to record video at (in ms)
const _recordInterval = 3000;

let videoStream = null;
let video = document.getElementById("video");

// allows you to see yourself while recording
let createSrc = (window.URL) ? window.URL.createObjectURL : function (stream) { return stream };

// creates a new instance of torrent so that user is able to seed the video/webm file
let client1 = new WebTorrent();
let client2 = new WebTorrent();
let magnetURI1;
let magnetURI2;
let _wasLastClient_1 = false;

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

      console.log('send')
      let file = new File([blob], 'test.webm', {
        type: 'video/webm'
      });

      // /* So that there is no delay in streaming between torrents, this section is going to 
      //  * make instances of webtorrent and then alternate the seeding between the two
      //  * once each seed is done, destroy the seed and initiate the next one
      // */
      if (_wasLastClient_1) {
        // if there is already a seed occuring, destroy it and re-seed
        if (magnetURI2) {
          client2.destroy(function() {
            console.log('client2 removed')
          });
        }

        client2 = new WebTorrent();

        // start seeding the new torrent
        client2.seed(file, function (torrent) {
          magnetURI2 = torrent.magnetURI;
          console.log('Client is seeding ' + torrent.magnetURI)
        });

         _wasLastClient_1 = false;
      } else {

        if (magnetURI1) {
          client1.destroy(function() {
            console.log('client1 removed')
          });
        }

        client1 = new WebTorrent();

        client1.seed(file, function (torrent) {
          magnetURI1 = torrent.magnetURI;
          console.log('Client is seeding ' + torrent.magnetURI)
        });

        _wasLastClient_1 = true;
      }

      sendFileToServer(file);
    };

    // retrieve the devices that are being used to record
    videoStream = stream.getTracks();

    // // play back the recording to the streamer
    video.src = createSrc(stream);
    video.play();
  }

  function onMediaError(e) {
    console.error('media error', e);
  }
})

// when the user pauses the video, stop the stream and send data to server
document.getElementById('button-stop-gum').addEventListener('click', function () {
  // Pause the video
  video.pause();

  // stops the the audio and video from recording
  videoStream.forEach((stream) => stream.stop());
});

function sendFileToServer(movieFile) {
  // send to server
  let formData = new FormData();
  formData.append('file', movieFile);

  let xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (this.status === 200) {
      console.log('upload success')
    } else {
      console.log('upload failed')
    }
  }
  xhr.open('POST', '/uploadfile', true);

  xhr.send(formData);
}
