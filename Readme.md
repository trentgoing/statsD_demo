# Demo for statsD + Grafana

### Overview

1. What is statsD?

   StatsD is an open source network daemon that listens for and aggregates statistics.   It runs on Node.js. We can make use of statsD by sending messages that document behavior from inside our application to the running network daemon for collection.  We can collect different types of [metrics](https://github.com/statsd/statsd/blob/master/docs/metric_types.md) in statsD, primarily counts and timers

   See the full code repository and full documentation on GitHub: https://github.com/statsd/statsd.

2. What else might we need?

   StatsD itself does not present or visualize the data that has been collected.   In order to dig into our measurements, we need to integrate statsD with some other open source tools that will allow us to see how our application is behaving.  For this demo will will also make use of:

   a.) Graphite - statsD will flush data collected to the Graphite which can store data and render graphs of that data.

   b.) Grafana - Graphite has all we need to plot the data collected, however Grafana is easy to extend off of Graphite and has more powerful visualization features.  Our end goal will be plotting our results in Grafana.

3. Seems like a lot of overhead!

   This does seem like a lot to set up and configure!  Luckily we don't always need to start from scratch.  For this demo we will make use of a Docker image that has most of the set up configured for us!   We will use the `hopsoft/graphite-statsd` image available on DockerHub.   Much of the setup process is outlined on this image's overview: https://hub.docker.com/r/hopsoft/graphite-statsd.

   By using Docker, we will quickly have a container available to collect and view all of our metrics!

4. What do I do with my now running statsD + Grafana container?

   We now have a container listening for statistics and ready to plot them.  However, our application is not sending any statistics to it!   StatsD listens for messages on the UDP port 8125.  It also expects these messages to be formatted in a predictable format.  

   To simplify the process of generating these messages, let's make use of an existing npm package that generates these messages for us https://github.com/sivy/node-statsd.



### Demo Walkthrough

#### 1. Setting up the statsD+Grafana container

i. Install Docker on your machine

ii. Pull down the image that we'll use to set up our metrics dashboard.

`docker pull hopsoft/graphite-statsd`

iii. Run that image.  

`docker run -d --name graphite --restart=always -p 3001:80 -p3002:81 -p 2003-2004:2003-2004 -p 2023-2024:2023-2024 -p 8125:8125/udp -p 8126:8126 hopsoft/graphite-statsd `

This command is somewhat involved.  It has been modified slightly from the run command seen on the image's DockerHub page.  Specifically, we are mapping the ports for Graphite and Grafana to unused localhost ports, as this demo is being done in a local environment.   If we deploy this container, it might be a good option to follow that example and use port 80 for the Grafana web-portal.

iv. Follow the steps on the DockerHub walkthrough to secure your running Graphite and Grafana portals.

v. Login to Grafana at http://localhost:3001.  Use the username and password `admin` and `admin` for initial access.   

vi. The statsD daemon will already be flushing data into Graphite.  We can check that at http://localhost:3002.  However, we need to manually connect Grafana to Graphite at http://localhost:3001/datasources. Name your Graphite source, and enter the Url http://localhost:3002.  The type of access for this demo is `direct`.   You can test the connection and save.

#### 2. Create a web server that sends metrics to statsD (server_example1.js)

i. Lets start with a basic example of a web server, using the Express Hello World example.

ii. Using the node-statsd npm package, add a client connection to the web server.  

```const StatsD = require('node-statsd')const client = new StatsD({  "prefix": "trentgoing_"});
const StatsD = require('node-statsd');
const client = StatsD({
	"prefix":"HackReactor_"
})
```

iii. Use the client to send a metric to our running statsD+Grafana container.

```client.increment('root_request_recieved');```

iv. Run the server and send a few requests to the server.

#### 3. Seeing our metrics (Configuring a simple table in Grafana).

i. Open up the Grafana portal and use the `Home` dropdown to select `New`

ii. In the New dashboard, add a row, and select `Add Panel > Graph`

iii. This will bring up the `Metrics` selection screen. In the lower right corner, change the default `--Grafana--` to the data source you previously set up.

iv. Find the stat counter you previously have sent.  For this demo it should be `HackReactor_root_request_recieved`

v. In the top right corner of the portal, click on the time frame shown.  In the menu that opens, select the time frame to be the last 5 minutes. Also set the portal to refresh every 5s.

vi.  Send a few more requests to the server and note the addition of metrics on the dashboard.

#### 4. Moving beyond the counting metric (server_example2.js)

i. Modify the existing server code to also track a timing metric: 

```sdfadapp.get('/', (req, res) => {
var timing = Math.random() * 5;
  setTimeout(() => {
    client.increment('root_request_recieved');
    client.timing('response_time', timing);
    res.send('Your response took ' + timing + ' seconds');
  }, timing * 1000)
})
```

ii. In Grafana, add a new graph, and select the new timing variable, and select the mean time.

iii. Restart the server and send a few requests. 

iv. Note the updates tracked on the dashboard.