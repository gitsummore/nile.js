const express = require('express');
const path = require('path');

const app = express();
const port = parseInt(process.env.PORT, 10) || 8000;

// Serve static files
app.use(express.static(path.join(__dirname, 'client')))

// Routes
app.post('/uploadfile', (req, res) => {
  console.log('working');
  console.log(req.files);
  res.sendStatus(200);
})

app.listen(port, () => {
  console.log('Listening on port 8000')
});