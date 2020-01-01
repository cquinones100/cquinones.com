const express = require('express');
const app = express();
const PORT = 3001;

app.use(function(req, res, next) {
  res.cookie('session', 'hi');
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  next();
});

app.get('/', (req, res) => {
  res.send('Hello World! v2')
});

app.listen(PORT);