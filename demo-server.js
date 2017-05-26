const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();

const port = parseInt(process.env.PORT, 10) || 8000;

// get Node Server instance when calling app.listen
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});

const nileHandler = require('./server/nileServer')(server, 10);

// parse application/json 
app.use(bodyParser.json())

// Serve static files
// app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'client')));

// Routes
// const nileHandler = nileServer(server);
app.use('/', nileHandler);

