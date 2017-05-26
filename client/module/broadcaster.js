// import * as WebTorrent from 'webtorrent';
// import * as MediaStreamRecorder from 'msr';
import WebTorrent from './webtorrent.min.js';
import MediaStreamRecorder from 'msr';

class Broadcaster {
  constructor(
    recordInterval, // the Interval that the webcam recording should seed each segment of the video
    ID_of_NodeToRenderVideo, // The id where the video node is being appended to
    startStreamID, // The id of the button node that BEGINS the recording/live streaming
    stopStreamID // The id of the button node that ENDS the recording/live streaming
  ) {
    this.recordInterval = recordInterval; // interval to record video at (in ms)
    this.ID_of_NodeToRenderVideo = ID_of_NodeToRenderVideo;
    this.startStreamID = startStreamID;
    this.stopStreamID = stopStreamID;

    this.videoStream = null;

    this.createBroadcast();

    this.$video = document.getElementById('broadcaster');

    this.startSeeding = this.startSeeding.bind(this);

    this.startStream();
  }


  startStream() {
    const _recordInterval = this.recordInterval;
    const startSeeding = this.startSeeding;
    let videoStream = this.videoStream;
    let $video = this.$video;

    let torrentInfo = {
      'magnetURI1': 0,
      'magnetURI2': 0,
      'magnetURI3': 0,
      'was1': false,
      'was2': false
    }

    let broadcaster;
    // mute audio
    this.$video.defaultMuted = true;

    // allows you to see yourself while recording
    let createSrc = (window.URL) ? window.URL.createObjectURL : function (stream) { return stream };

    // // creates a new instance of torrent so that user is able to seed the video/webm file
    // let was1 = this.was1;
    // let was2 = this.was1;

    // when pressing the play button, start recording
    document.getElementById(`${this.startStreamID}`).addEventListener('click', function () {
      broadcaster = new WebTorrent();

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

          const file = new File([blob], 'nilejs.webm', {
            type: 'video/webm'
          });

          // /* So that there is no delay in streaming between torrents, this section is going to 
          //  * make instances of webtorrent and then alternate the seeding between the two
          //  * once each seed is done, destroy the seed and initiate the next one
          // */
          if (torrentInfo.was1 && torrentInfo.was2) {
            startSeeding(file, 'magnetURI3', '3', broadcaster, torrentInfo);
            torrentInfo.was1 = torrentInfo.was2 = false;
          } else if (torrentInfo.was1) {
            startSeeding(file, 'magnetURI2', '2', broadcaster, torrentInfo);
            torrentInfo.was2 = true;
          } else {
            startSeeding(file, 'magnetURI1', '1', broadcaster, torrentInfo);
            torrentInfo.was1 = true;
          }
        };

        // retrieve the devices that are being used to record
        videoStream = stream.getTracks();

        // play back the recording to the broadcaster
        $video.src = createSrc(stream);
        $video.play();
      }

      function onMediaError(e) {
        console.error('media error', e);
      }
    })

    // when the user pauses the video, stop the stream and send data to server
    document.getElementById(`${this.stopStreamID}`).addEventListener('click', function () {
      // resets all of the values to starting values
      torrentInfo = {
        'magnetURI1': 0,
        'magnetURI2': 0,
        'magnetURI3': 0,
        'was1': false,
        'was2': false
      }

      // Pause the video
      $video.pause();

      // stops the the audio and video from recording
      videoStream.forEach((stream) => stream.stop());

      // destroys the broadcasting client and starts back at the beginning
      broadcaster.destroy(function () {
        console.log('All torrents destroyed')
      })
    });
  }

  startSeeding(file, currMagnet, castNum, broadcaster, torrentInfo) {
    // remove the torrent if it is currently seeding
    if (torrentInfo[currMagnet]) {
      broadcaster.remove(torrentInfo[currMagnet], () => {
        console.log(`magnet ${castNum} removed`)
      });
    }

    // start seeding the new torrent
    broadcaster.seed(file, (torrent) => {
      torrentInfo[currMagnet] = torrent.magnetURI;
      console.log(`broadcaster ${castNum} is seeding `, torrent.magnetURI)
      this.sendMagnetToServer(torrent.magnetURI);
    });

    // check for if an error occurs, if it does, garbage collection and return error
    broadcaster.on('error', function (err) {
      console.log('webtorrents has encountered an error', err)
    })
  }

  // send magnet to server
  sendMagnetToServer(magnetURI) {
    // send to server
    let xhr = new XMLHttpRequest();

    xhr.open('POST', '/magnet', true);

    xhr.onreadystatechange = function () {
      if (this.status === 200) {
        console.log('Magnet Emitted')
      } else {
        console.log('Emit Failed')
      }
    }
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify({ 'magnetURI': magnetURI }));
  }

  createBroadcast() {
    let video = document.createElement('video');
    video.setAttribute('id', 'broadcaster');
    document.getElementById(this.ID_of_NodeToRenderVideo).appendChild(video);
  }
}

// export default Broadcaster
module.exports = Broadcaster