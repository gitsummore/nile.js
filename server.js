const express = require('express');
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const createTorrent = require('create-torrent');

const app = express();
const port = parseInt(process.env.PORT, 10) || 8000;

// Serve static files
app.use(express.static(path.join(__dirname, 'client')))

// Routes
app.post('/uploadfile', (req, res) => {
  // parse files in request
  const form = new formidable.IncomingForm();

  // set file upload dir
  form.uploadDir = "uploads";

  // parse form data
  form.parse(req);

  // custom data handler
  form.onPart = function dataToTorrent (part) {
    createTorrent(part, function(err, torrent) {
      if (err) throw err;
      fs.writeFile(
        'test.torrent',
        torrent,
        (err) => {
          if (err) throw err;
        });
    })
  };
  
  res.sendStatus(200);
})

app.listen(port, () => {
  console.log('Listening on port 8000')
});