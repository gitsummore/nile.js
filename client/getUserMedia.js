// import WebTorrent from 'webtorrent';

let videoStream = null;
let mediaRecorder = null;
let chunks = [];
let video = document.getElementById("video");

// allows you to see yourself while recording
let createSrc = (window.URL) ? window.URL.createObjectURL : function (stream) { return stream };

// play button gum = GetUserMedia
document.getElementById('button-play-gum').addEventListener('click', function () {

  // Capture user's audio and video source
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  })
    .then(onGetMediaSuccess)
    .catch(onGetMediaFailure);

  // function runs if getting media is successful
  function onGetMediaSuccess(stream) {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    console.log('MediaRecorder state:', mediaRecorder.state);

    mediaRecorder.ondataavailable = function (chunk) {
      // add chunk to overall stream
      chunks.push(chunk.data);
    };

    mediaRecorder.onstop = function (event) {
      console.log('MediaRecorder state:', mediaRecorder.state);

      // create blob from the recorded files
      let blob = new Blob(chunks, {
        type: 'video/webm'
      });

      // convert the blob into a file
      let file = new File([blob], 'test.webm', {
        type: 'video/webm'
      });

      // makes a post request to the server
      sendFileToServer(file);
    };

    videoStream = stream.getTracks();
    console.log('videoStream', videoStream);
    // Stream the data
    video.src = createSrc(stream);
    video.play();
  }

  // on error
  function onGetMediaFailure(error) {
    console.log("Video capture error: ", error);
  };
})

// when the user pauses the video, stop the stream and send data to server
document.getElementById('button-stop-gum').addEventListener('click', function () {
  // Pause the video
  video.pause();

  // stops the the audio and video from recording
  videoStream.forEach((stream) => stream.stop());

  // stops the recording
  mediaRecorder.stop();

  // reset chunks
  chunks = [];
});

function sendFileToServer(movieFile) {
  // send to server
  let xhr = new XMLHttpRequest();
  xhr.open('POST', '/uploadfile', true);

  // // set proper header for request, not sure if we have to send this
  // xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

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
