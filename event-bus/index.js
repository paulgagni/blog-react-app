const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

//Create a new express application
const app = express();
//Associate bodyParser middleware with the app
app.use(bodyParser.json());

const events = [];

//Setup a post request handler
app.post("/events", (req, res) => {
  //Get the event that is coming in the request body
  const event = req.body;

  //Get all events and push into the array
  events.push(event);

  //Make post request for the posts service to running services of the event that is passed
  axios.post("http://localhost:4000/events", event).catch((err) => {
    console.log(err.message);
  });
  //Make post request for the comments service to running services of the event that is passed
  axios.post("http://localhost:4001/events", event).catch((err) => {
    console.log(err.message);
  });
  //Make post request for the query service to running services of the event that is passed
  axios.post("http://localhost:4002/events", event).catch((err) => {
    console.log(err.message);
  });
  //Make post request for the moderation service to running services of the event that is passed
  axios.post("http://localhost:4003/events", event).catch((err) => {
    console.log(err.message);
  });
  res.send({ status: "OK" });
});

app.get('/events', (req, res) => {
  res.send(events);
})

app.listen(4005, () => {
  console.log("Listening on 4005");
});