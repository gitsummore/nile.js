const express = require('express');
const path = require('path');
const formidable = require('formidable');

const app = express();
const port = parseInt(process.env.PORT, 10) || 8000;

// Serve static files
app.use(express.static(path.join(__dirname, 'client')))

// Routes
app.post('/uploadfile', (req, res) => {
  // parse files in request
  const form = new formidable.IncomingForm();

  form.parse(req, (err, fields, files) => {
    if (err) throw err;
    console.log('Getting files:');
    console.log(files.file.size);
    res.sendStatus(200);
  });
  
})

app.listen(port, () => {
  console.log('Listening on port 8000')
});