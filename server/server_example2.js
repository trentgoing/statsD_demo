const express = require('express');
const app = express();
const port = 3003;

const StatsD = require('node-statsd')
const client = new StatsD({
  "prefix": "HackReactor_"
});

app.get('/', (req, res) => {
  var timing = Math.random() * 5;
  setTimeout(() => {
    client.increment('root_request_recieved');
    client.timing('response_time', timing);
    res.send('Your response took ' + timing + ' seconds');
  }, timing * 1000)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

