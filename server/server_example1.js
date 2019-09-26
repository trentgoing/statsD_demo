const express = require('express');
const app = express();
const port = 3003;

const StatsD = require('node-statsd')
const client = new StatsD({
  "prefix": "HackReactor_"
});

app.get('/', (req, res) => {
  client.increment('root_request_recieved');
  res.send('Hello World!');
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

