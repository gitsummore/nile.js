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

  // set upload dir
  form.uploadDir = 'uploads';

  // parse form data
  form.parse(req);

  // custom data handler
  form.on('fileBegin', function editFileInfo (name, file) {
    // save to webm file
    file.path += '.webm';
  });
  
  res.sendStatus(200);
})

app.listen(port, () => {
  console.log('Listening on port 8000')
});