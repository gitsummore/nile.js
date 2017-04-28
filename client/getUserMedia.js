// import WebTorrent from 'webtorrent';
// import MediaStreamRecorder from 'mediastreamrecorder'

// interval to record video at (in ms)
const _recordInterval = 5000;

let videoStream = null;
let video = document.getElementById("video");

// allows you to see yourself while recording
let createSrc = (window.URL) ? window.URL.createObjectURL : function (stream) { return stream };

// creates a new instance of torrent so that user is able to seed the video/webm file
let client = new WebTorrent();
let client1 = new WebTorrent();
let magnetURI1;
let magnetURI2;

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
    mediaRecorder.ondataavailable = function (blob) {;
      let file = new File([blob], 'test.webm', {
        type: 'video/webm'
      });

      client.seed(file, function (torrent) {
        magnetURI = torrent.magnetURI;
        console.log('Client is seeding ' + torrent.magnetURI)
      })

      sendFileToServer(file);
    };

    // retrieve the devices that are being used to record
    videoStream = stream.getTracks();

    // play back the recording to the streamer
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
  let xhr = new XMLHttpRequest();
  xhr.open('POST', '/uploadfile', true);

  xhr.onreadystatechange = function () {
    if (xhr.status === 200) {
      console.log('upload success')
    } else {
      console.log('upload failed')
    }
  }

  let formData = new FormData();
  formData.append('file', movieFile);

  xhr.send(formData);
}
