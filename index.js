const express = require('express');
const app = express();

// static directory
// requests that don't match any of the other endpoints will be served from here
app.use(express.static(__dirname + "/static"));

// get port from environment variable, or use 3000 as the default
const port = process.env.NODE_PORT || 4000;

app.listen(port, () => {
  console.log('listening on port 4000...');
});