const express = require('express');
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const createTorrent = require('create-torrent');

const app = express();
const port = parseInt(process.env.PORT, 10) || 8000;

// Serve static files
app.use(express.static(path.join(__dirname, 'client')));

// Routes
app.post('/uploadfile', (req, res) => {
  // parse files in request
  const form = new formidable.IncomingForm();

  // set upload dir
  form.uploadDir = 'uploads';

  // create uploads dir if doesn't exist
  fs.mkdir('uploads', (err) => {
    // skips pre-existing dir error
    if (err && err.code !== 'EEXIST') {
      throw err;
    }
  });

  // change data to webm
  form.on('fileBegin', function editFileInfo (name, file) {
    // save to webm file
    file.path += '.webm';
  });

  // parse form data
  form.parse(req);
  
  res.sendStatus(200);
})

app.listen(port, () => {
  console.log('Listening on port 8000')
});